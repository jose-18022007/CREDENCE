"""Video analysis service with AI generation detection, deepfake face detection,
frame consistency analysis, and audio extraction."""

import cv2
import subprocess
import json
import asyncio
import httpx
import base64
import os
import platform
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
from config import settings


class VideoService:
    """Service for comprehensive video analysis.
    
    Uses TWO detection models:
    1. umm-maybe/AI-image-detector → Detects if ANY frame is AI-generated
       (works on landscapes, objects, text, everything — not just faces)
    2. dima806/deepfake_vs_real_image_detection → Detects face-specific deepfakes
       (only runs on frames that contain faces)
    
    Plus local frame consistency analysis (no API needed).
    """

    def __init__(self):
        """Initialize video service with both detection models."""

        # ✅ MODEL 1: General AI-generated image detection (ALL frames)
        # Detects: Sora, Runway, Midjourney, DALL-E, Stable Diffusion, etc.
        self.ai_detection_api_url = (
            "https://router.huggingface.co/hf-inference/models/"
            "umm-maybe/AI-image-detector"
        )

        # ✅ MODEL 2: Face-specific deepfake detection (FACE frames only)
        # Detects: face swaps, face reenactment, deepfake faces
        # Model: dima806/deepfake_vs_real_image_detection
        # Response format: [{"label": "Fake", "score": 0.92}, {"label": "Real", "score": 0.08}]
        self.deepfake_api_url = (
            "https://router.huggingface.co/hf-inference/models/"
            "dima806/deepfake_vs_real_image_detection"
        )

        self.max_retries = 3
        self.retry_delay = 20

        # Known AI video generation tools (checked against metadata)
        self.ai_video_tools = [
            "runway", "sora", "kling", "pika", "synthesia",
            "gen-2", "gen-3", "heygen", "d-id", "luma",
            "stable video", "modelscope", "animatediff"
        ]

        # Face detection cascade for deepfake pre-filtering
        try:
            cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            if self.face_cascade.empty():
                print("⚠️ Face cascade failed to load")
                self.face_cascade = None
        except Exception:
            print("⚠️ Face cascade not available")
            self.face_cascade = None

        self._configure_ffmpeg()

    def _configure_ffmpeg(self):
        """Add FFmpeg to PATH on Windows if found in common locations."""
        if platform.system() != "Windows":
            return

        ffmpeg_paths = [
            r"C:\ffmpeg\bin\ffmpeg.exe",
            r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
            r"C:\ProgramData\chocolatey\bin\ffmpeg.exe",
        ]
        for path in ffmpeg_paths:
            if os.path.exists(path):
                ffmpeg_dir = str(Path(path).parent)
                if ffmpeg_dir not in os.environ.get("PATH", ""):
                    os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ["PATH"]
                print(f"✅ FFmpeg configured: {path}")
                return

    # ═══════════════════════════════════════════════════════════════
    #  STEP 1: VIDEO METADATA (ffprobe)
    # ═══════════════════════════════════════════════════════════════

    def extract_video_metadata(self, video_path: str) -> Dict[str, Any]:
        """Extract video metadata using ffprobe."""
        try:
            print("📹 Extracting video metadata...")

            cmd = [
                "ffprobe", "-v", "quiet",
                "-print_format", "json",
                "-show_format", "-show_streams",
                video_path
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            if result.returncode != 0:
                raise Exception(f"ffprobe failed: {result.stderr[:200]}")

            data = json.loads(result.stdout)
            format_info = data.get("format", {})
            duration = float(format_info.get("duration", 0))
            bitrate = int(format_info.get("bit_rate", 0))

            video_stream = None
            audio_stream = None
            for stream in data.get("streams", []):
                if stream.get("codec_type") == "video" and not video_stream:
                    video_stream = stream
                if stream.get("codec_type") == "audio" and not audio_stream:
                    audio_stream = stream

            if not video_stream:
                raise Exception("No video stream found")

            width = video_stream.get("width", 0)
            height = video_stream.get("height", 0)
            codec = video_stream.get("codec_name", "unknown")
            frame_rate_str = video_stream.get("r_frame_rate", "30/1")

            try:
                if "/" in str(frame_rate_str):
                    num, den = frame_rate_str.split("/")
                    fps = float(num) / float(den)
                else:
                    fps = float(frame_rate_str)
            except (ValueError, ZeroDivisionError):
                fps = 30.0

            tags = format_info.get("tags", {})
            all_metadata_text = " ".join([
                tags.get("encoder", ""),
                tags.get("handler_name", ""),
                tags.get("comment", ""),
                tags.get("creation_tool", ""),
                tags.get("description", ""),
                tags.get("title", ""),
            ]).lower()

            ai_tool_detected = False
            ai_tool_name = None
            for tool in self.ai_video_tools:
                if tool in all_metadata_text:
                    ai_tool_detected = True
                    ai_tool_name = tool.upper()
                    break

            metadata = {
                "duration": duration,
                "duration_formatted": f"{int(duration // 60)}:{int(duration % 60):02d}",
                "resolution": f"{width}x{height}",
                "width": width,
                "height": height,
                "codec": codec,
                "fps": round(fps, 2),
                "bitrate": bitrate,
                "has_audio": audio_stream is not None,
                "creation_tool": tags.get("encoder", "Unknown"),
                "is_ai_tool_detected": ai_tool_detected,
                "ai_tool_name": ai_tool_name,
                "metadata_tags": tags,
            }

            print(f"✅ Metadata: {metadata['duration_formatted']}, "
                  f"{metadata['resolution']}, {codec}, {fps:.1f}fps")
            if ai_tool_detected:
                print(f"⚠️ AI video tool detected in metadata: {ai_tool_name}")

            return metadata

        except FileNotFoundError:
            print("❌ ffprobe not found — install FFmpeg")
            return self._empty_metadata("ffprobe not installed")
        except Exception as e:
            print(f"❌ Metadata extraction error: {e}")
            return self._empty_metadata(str(e))

    def _empty_metadata(self, error: str) -> Dict[str, Any]:
        return {
            "duration": 0, "duration_formatted": "0:00",
            "resolution": "unknown", "width": 0, "height": 0,
            "codec": "unknown", "fps": 30.0, "bitrate": 0,
            "has_audio": False, "creation_tool": "Unknown",
            "is_ai_tool_detected": False, "ai_tool_name": None,
            "metadata_tags": {}, "error": error,
        }

    # ═══════════════════════════════════════════════════════════════
    #  STEP 2: KEYFRAME EXTRACTION (Scene Change Detection)
    # ═══════════════════════════════════════════════════════════════

    def extract_keyframes(
        self, video_path: str, output_dir: str, max_frames: int = 15
    ) -> Dict[str, Any]:
        """Extract keyframes using scene change detection."""
        try:
            print(f"🎬 Extracting keyframes (max {max_frames})...")
            Path(output_dir).mkdir(parents=True, exist_ok=True)

            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise Exception("Failed to open video file")

            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
            duration = total_frames / fps

            print(f"📊 Video: {total_frames} frames, {fps:.1f} FPS, {duration:.1f}s")

            if total_frames == 0:
                raise Exception("Video has 0 frames")

            # Scene change detection with sampling
            sample_interval = max(1, total_frames // 500)
            prev_gray = None
            scene_scores: List[Tuple[int, float]] = []

            frame_idx = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_idx % sample_interval == 0:
                    small = cv2.resize(frame, (160, 120))
                    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)

                    if prev_gray is not None:
                        diff = cv2.absdiff(prev_gray, gray).mean()
                        scene_scores.append((frame_idx, diff))

                    prev_gray = gray

                frame_idx += 1

            scene_scores.sort(key=lambda x: x[1], reverse=True)
            selected_positions = sorted(
                [s[0] for s in scene_scores[: max_frames - 2]]
            )

            if 0 not in selected_positions:
                selected_positions.insert(0, 0)
            last = max(0, total_frames - 1)
            if last not in selected_positions:
                selected_positions.append(last)

            selected_positions = selected_positions[:max_frames]

            # Seek directly to each frame
            frame_paths = []
            frame_positions = []

            for i, target_pos in enumerate(selected_positions):
                cap.set(cv2.CAP_PROP_POS_FRAMES, target_pos)
                ret, frame = cap.read()
                if not ret:
                    continue

                h, w = frame.shape[:2]
                if w > 640:
                    scale = 640 / w
                    frame = cv2.resize(frame, (640, int(h * scale)))

                frame_filename = f"frame_{i + 1:03d}.jpg"
                frame_path = str(Path(output_dir) / frame_filename)
                cv2.imwrite(frame_path, frame)

                frame_paths.append(frame_path)
                frame_positions.append(target_pos)

            cap.release()

            print(f"✅ Extracted {len(frame_paths)} keyframes via scene detection")

            return {
                "frame_paths": frame_paths,
                "frame_positions": frame_positions,
                "total_frames_in_video": total_frames,
                "frames_extracted": len(frame_paths),
                "fps": fps,
                "duration_seconds": duration,
            }

        except Exception as e:
            print(f"❌ Keyframe extraction error: {e}")
            return {
                "frame_paths": [], "frame_positions": [],
                "total_frames_in_video": 0, "frames_extracted": 0,
                "fps": 30.0, "duration_seconds": 0, "error": str(e),
            }

    # ═══════════════════════════════════════════════════════════════
    #  STEP 3: AI GENERATION DETECTION (ALL frames — not just faces)
    #  "Is this video AI-generated?" — works on ANY content
    # ═══════════════════════════════════════════════════════════════

    async def detect_ai_generated_frames(
        self,
        frame_paths: List[str],
        frame_positions: List[int],
        fps: float = 30.0,
    ) -> Dict[str, Any]:
        """Detect if video frames are AI-generated.
        
        Uses umm-maybe/AI-image-detector which works on ALL image types:
        landscapes, objects, faces, text, animals — everything.
        
        This answers: "Was this video created by AI?" (Sora, Runway, etc.)
        NOT just "Are the faces fake?"
        """
        if not settings.HUGGINGFACE_API_KEY:
            print("⚠️ HUGGINGFACE_API_KEY not set — skipping AI detection")
            return self._fallback_detection(
                len(frame_paths), "API key not configured", "ai_generation"
            )

        if not frame_paths:
            return self._fallback_detection(0, "No frames to analyze", "ai_generation")

        print(f"🤖 Checking ALL {len(frame_paths)} frames for AI generation...")
        print(f"   Model: umm-maybe/AI-image-detector")

        headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
        per_frame_results = []
        ai_probabilities = []
        flagged_frames = []

        for idx, (frame_path, frame_pos) in enumerate(zip(frame_paths, frame_positions)):
            print(f"  Checking frame {idx + 1}/{len(frame_paths)}...")

            try:
                result = await self._call_detection_api(
                    frame_path, frame_pos, fps, headers,
                    api_url=self.ai_detection_api_url,
                    detection_type="ai_generation"
                )
                if result:
                    per_frame_results.append(result)
                    ai_probabilities.append(result["ai_probability"])

                    if result["ai_probability"] > 60:
                        flagged_frames.append(frame_path)

                    print(f"    ✅ {result['ai_probability']:.1f}% AI-generated "
                          f"at {result['timestamp_formatted']}")

            except Exception as e:
                print(f"    ❌ Frame analysis failed: {e}")
                continue

            if idx < len(frame_paths) - 1:
                await asyncio.sleep(1.5)

        if not ai_probabilities:
            return self._fallback_detection(
                len(frame_paths), "All API calls failed", "ai_generation"
            )

        avg_prob = sum(ai_probabilities) / len(ai_probabilities)
        max_prob = max(ai_probabilities)

        print(f"✅ AI generation detection complete: avg={avg_prob:.1f}%, max={max_prob:.1f}%")

        return {
            "detection_type": "ai_generation",
            "model_used": "umm-maybe/AI-image-detector",
            "description": "Detects if video content is AI-generated (works on all content types)",
            "frames_analyzed": len(per_frame_results),
            "frames_flagged_ai": len(flagged_frames),
            "flagged_frame_paths": flagged_frames,
            "per_frame_results": per_frame_results,
            "average_ai_probability": round(avg_prob, 2),
            "max_ai_probability": round(max_prob, 2),
            "verdict": "AI_GENERATED" if avg_prob > 60 else
                       "POSSIBLY_AI" if avg_prob > 40 else "LIKELY_REAL",
        }

    # ═══════════════════════════════════════════════════════════════
    #  STEP 4: DEEPFAKE FACE DETECTION (face frames ONLY)
    #  "Are the faces in this video fake/swapped?"
    # ═══════════════════════════════════════════════════════════════

    def _has_faces(self, frame_path: str) -> bool:
        """Check if a frame contains human faces."""
        if self.face_cascade is None:
            return True

        img = cv2.imread(frame_path)
        if img is None:
            return False

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.3, minNeighbors=5, minSize=(30, 30)
        )
        return len(faces) > 0

    async def detect_deepfake_faces(
        self,
        frame_paths: List[str],
        frame_positions: List[int],
        fps: float = 30.0,
    ) -> Dict[str, Any]:
        """Detect deepfake faces in video frames.
        
        Uses dima806/deepfake_vs_real_image_detection which is specifically
        trained on face deepfakes (face swaps, reenactment).
        
        Only runs on frames that actually contain faces.
        This answers: "Are the faces in this video real or swapped?"
        """
        if not settings.HUGGINGFACE_API_KEY:
            print("⚠️ HUGGINGFACE_API_KEY not set — skipping deepfake detection")
            return self._fallback_detection(
                len(frame_paths), "API key not configured", "deepfake_face"
            )

        if not frame_paths:
            return self._fallback_detection(0, "No frames", "deepfake_face")

        # Filter frames that contain faces
        print(f"👤 Checking {len(frame_paths)} frames for faces...")
        face_frames: List[Tuple[str, int]] = []
        no_face_count = 0

        for path, pos in zip(frame_paths, frame_positions):
            if self._has_faces(path):
                face_frames.append((path, pos))
            else:
                no_face_count += 1

        print(f"👤 Faces found in {len(face_frames)}/{len(frame_paths)} frames")

        if not face_frames:
            print("ℹ️ No faces detected — face deepfake analysis not applicable")
            return {
                "detection_type": "deepfake_face",
                "model_used": "dima806/deepfake_vs_real_image_detection",
                "description": "No faces found in video — face deepfake check skipped",
                "frames_analyzed": 0,
                "frames_with_faces": 0,
                "frames_flagged_deepfake": 0,
                "flagged_frame_paths": [],
                "per_frame_results": [],
                "average_deepfake_probability": 0,
                "max_deepfake_probability": 0,
                "verdict": "NO_FACES_FOUND",
                "not_applicable": True,
            }

        print(f"🔍 Analyzing {len(face_frames)} face frames for deepfakes...")
        print(f"   Model: dima806/deepfake_vs_real_image_detection")

        headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
        per_frame_results = []
        deepfake_probabilities = []
        flagged_frames = []

        for idx, (frame_path, frame_pos) in enumerate(face_frames):
            print(f"  Analyzing face frame {idx + 1}/{len(face_frames)}...")

            try:
                result = await self._call_detection_api(
                    frame_path, frame_pos, fps, headers,
                    api_url=self.deepfake_api_url,
                    detection_type="deepfake_face"
                )
                if result:
                    per_frame_results.append(result)
                    prob = result["deepfake_probability"]
                    deepfake_probabilities.append(prob)

                    if prob > 60:
                        flagged_frames.append(frame_path)

                    print(f"    ✅ {prob:.1f}% deepfake at {result['timestamp_formatted']}")

            except Exception as e:
                print(f"    ❌ Frame analysis failed: {e}")
                continue

            if idx < len(face_frames) - 1:
                await asyncio.sleep(1.5)

        if not deepfake_probabilities:
            return self._fallback_detection(
                len(frame_paths), "All API calls failed", "deepfake_face"
            )

        avg_prob = sum(deepfake_probabilities) / len(deepfake_probabilities)
        max_prob = max(deepfake_probabilities)

        print(f"✅ Deepfake face detection complete: avg={avg_prob:.1f}%, max={max_prob:.1f}%")

        return {
            "detection_type": "deepfake_face",
            "model_used": "dima806/deepfake_vs_real_image_detection",
            "description": "Detects face swaps and deepfake faces",
            "frames_analyzed": len(per_frame_results),
            "frames_with_faces": len(face_frames),
            "frames_without_faces": no_face_count,
            "frames_flagged_deepfake": len(flagged_frames),
            "flagged_frame_paths": flagged_frames,
            "per_frame_results": per_frame_results,
            "average_deepfake_probability": round(avg_prob, 2),
            "max_deepfake_probability": round(max_prob, 2),
            "verdict": "DEEPFAKE" if avg_prob > 60 else
                       "SUSPICIOUS" if avg_prob > 40 else "REAL_FACES",
        }

    # ═══════════════════════════════════════════════════════════════
    #  SHARED API CALLER (used by both detection models)
    # ═══════════════════════════════════════════════════════════════

    async def _call_detection_api(
        self,
        frame_path: str,
        frame_pos: int,
        fps: float,
        headers: dict,
        api_url: str,
        detection_type: str,
    ) -> Optional[Dict[str, Any]]:
        """Send a frame to a HuggingFace image classification model.
        
        Works with both:
        - umm-maybe/AI-image-detector → labels: "artificial" / "human"
        - dima806/deepfake_vs_real → labels: "Fake" / "Real"
        """

        with open(frame_path, "rb") as f:
            image_data = f.read()

        image_base64 = base64.b64encode(image_data).decode("utf-8")
        payload = {"inputs": image_base64}

        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        api_url,
                        headers=headers,
                        json=payload,
                    )

                    if response.status_code == 503:
                        if attempt < self.max_retries - 1:
                            retry_data = response.json() if response.text else {}
                            wait_time = retry_data.get("estimated_time", self.retry_delay)
                            print(f"    ⏳ Model loading, waiting {min(wait_time, 60):.0f}s...")
                            await asyncio.sleep(min(wait_time, 60))
                            continue
                        raise Exception("Model failed to load after retries")

                    if response.status_code == 429:
                        if attempt < self.max_retries - 1:
                            print(f"    ⏳ Rate limited, waiting 30s...")
                            await asyncio.sleep(30)
                            continue
                        raise Exception("Rate limited by HuggingFace")

                    if response.status_code != 200:
                        raise Exception(
                            f"API returned {response.status_code}: "
                            f"{response.text[:150]}"
                        )

                    data = response.json()

                    # Handle nested response: [[{...}]] → [{...}]
                    if isinstance(data, list) and len(data) > 0 and isinstance(data[0], list):
                        data = data[0]

                    # Parse scores based on detection type
                    # Handle both flat and nested response formats
                    fake_score = 0.0
                    real_score = 0.0

                    for item in data:
                        label = item.get("label", "").lower().strip()
                        score = item.get("score", 0)

                        # AI generation labels (umm-maybe model)
                        if label in ("artificial", "ai", "generated", "ai-generated"):
                            fake_score = score
                        # Deepfake labels (dima806 model returns "Fake"/"Real")
                        # Also handle "deepfake", "LABEL_0", etc. for compatibility
                        elif label in ("fake", "deepfake") or "fake" in label:
                            fake_score = score
                        # Real labels (both models)
                        elif label in ("human", "real", "authentic", "genuine") or "real" in label:
                            real_score = score

                    # If only real found, derive fake
                    if fake_score == 0 and real_score > 0:
                        fake_score = 1.0 - real_score

                    fake_pct = fake_score * 100
                    real_pct = real_score * 100

                    # Calculate timestamp
                    timestamp_sec = frame_pos / fps if fps > 0 else 0
                    minutes = int(timestamp_sec // 60)
                    seconds = int(timestamp_sec % 60)

                    # Build result based on detection type
                    result = {
                        "frame_path": frame_path,
                        "frame_position": frame_pos,
                        "timestamp_seconds": round(timestamp_sec, 2),
                        "timestamp_formatted": f"{minutes}:{seconds:02d}",
                        "raw_scores": {"fake": round(fake_score, 4), "real": round(real_score, 4)},
                    }

                    if detection_type == "ai_generation":
                        result["ai_probability"] = round(fake_pct, 2)
                        result["real_probability"] = round(real_pct, 2)
                        result["prediction"] = "AI_GENERATED" if fake_pct > 60 else "REAL"
                    else:
                        result["deepfake_probability"] = round(fake_pct, 2)
                        result["real_probability"] = round(real_pct, 2)
                        result["prediction"] = "DEEPFAKE" if fake_pct > 60 else "REAL"

                    return result

            except httpx.TimeoutException:
                if attempt < self.max_retries - 1:
                    print(f"    ⏳ Timeout, retrying...")
                    await asyncio.sleep(5)
                    continue
                raise

        return None

    def _fallback_detection(
        self, frame_count: int, reason: str, detection_type: str
    ) -> Dict[str, Any]:
        """Fallback when detection API is unavailable."""
        print(f"⚠️ {detection_type} detection unavailable: {reason}")

        if detection_type == "ai_generation":
            return {
                "detection_type": "ai_generation",
                "model_used": "umm-maybe/AI-image-detector",
                "frames_analyzed": 0,
                "frames_flagged_ai": 0,
                "per_frame_results": [],
                "average_ai_probability": 0,
                "max_ai_probability": 0,
                "verdict": "UNKNOWN",
                "detection_unavailable": True,
                "note": f"AI generation detection unavailable — {reason}",
            }
        else:
            return {
                "detection_type": "deepfake_face",
                "model_used": "dima806/deepfake_vs_real_image_detection",
                "frames_analyzed": 0,
                "frames_with_faces": 0,
                "frames_flagged_deepfake": 0,
                "per_frame_results": [],
                "average_deepfake_probability": 0,
                "max_deepfake_probability": 0,
                "verdict": "UNKNOWN",
                "detection_unavailable": True,
                "note": f"Deepfake detection unavailable — {reason}",
            }

    # ═══════════════════════════════════════════════════════════════
    #  STEP 5: FRAME CONSISTENCY ANALYSIS (Local — no API needed)
    #  Detects AI artifacts that individual frame analysis misses
    # ═══════════════════════════════════════════════════════════════

    def analyze_frame_consistency(self, frame_paths: List[str]) -> Dict[str, Any]:
        """Analyze consistency across frames to detect AI generation artifacts.
        
        Real camera footage has:
        - Consistent sensor noise patterns across frames
        - Uniform edge sharpness
        - Natural lighting gradients
        
        AI-generated video has:
        - Inconsistent noise (each frame generated independently)
        - Varying sharpness levels
        - Unnatural smoothness in some areas
        
        This is FREE (no API) and catches things the models might miss.
        """
        if len(frame_paths) < 3:
            return {
                "analysis_type": "frame_consistency",
                "frames_analyzed": len(frame_paths),
                "consistency_score": 70,
                "note": "Too few frames for consistency analysis",
            }

        try:
            print(f"🔬 Analyzing frame consistency across {len(frame_paths)} frames...")

            noise_levels = []
            sharpness_levels = []
            brightness_levels = []

            for frame_path in frame_paths:
                img = cv2.imread(frame_path)
                if img is None:
                    continue

                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

                # 1. Noise level (standard deviation of Laplacian)
                # Real cameras have consistent noise; AI varies per frame
                laplacian = cv2.Laplacian(gray, cv2.CV_64F)
                noise = laplacian.std()
                noise_levels.append(noise)

                # 2. Sharpness (variance of Laplacian)
                # AI frames have inconsistent focus/sharpness
                sharpness = laplacian.var()
                sharpness_levels.append(sharpness)

                # 3. Brightness (mean pixel value)
                brightness = gray.mean()
                brightness_levels.append(brightness)

            if len(noise_levels) < 3:
                return {
                    "analysis_type": "frame_consistency",
                    "frames_analyzed": len(noise_levels),
                    "consistency_score": 70,
                    "note": "Could not read enough frames",
                }

            # Calculate variation coefficients
            # Lower variation = more consistent = more likely real camera
            noise_std = np.std(noise_levels)
            noise_mean = np.mean(noise_levels)
            noise_cv = (noise_std / noise_mean * 100) if noise_mean > 0 else 0

            sharpness_std = np.std(sharpness_levels)
            sharpness_mean = np.mean(sharpness_levels)
            sharpness_cv = (sharpness_std / sharpness_mean * 100) if sharpness_mean > 0 else 0

            # Score: high consistency (low variation) = high score = likely real
            # Real video: noise_cv typically < 15%, sharpness_cv < 20%
            # AI video: noise_cv often > 25%, sharpness_cv > 30%

            consistency_score = 100

            if noise_cv > 40:
                consistency_score -= 40  # Very inconsistent noise = likely AI
            elif noise_cv > 25:
                consistency_score -= 25
            elif noise_cv > 15:
                consistency_score -= 10

            if sharpness_cv > 50:
                consistency_score -= 30  # Very inconsistent sharpness
            elif sharpness_cv > 30:
                consistency_score -= 20
            elif sharpness_cv > 20:
                consistency_score -= 10

            # Unnaturally LOW noise suggests AI smoothing
            if noise_mean < 5:
                consistency_score -= 15

            consistency_score = max(0, min(100, consistency_score))

            anomalies = []
            if noise_cv > 25:
                anomalies.append(f"Inconsistent noise patterns across frames (CV={noise_cv:.1f}%)")
            if sharpness_cv > 30:
                anomalies.append(f"Inconsistent sharpness across frames (CV={sharpness_cv:.1f}%)")
            if noise_mean < 5:
                anomalies.append(f"Unnaturally low noise level ({noise_mean:.1f}) — possible AI smoothing")

            print(f"✅ Frame consistency: score={consistency_score}, "
                  f"noise_cv={noise_cv:.1f}%, sharpness_cv={sharpness_cv:.1f}%")
            if anomalies:
                for a in anomalies:
                    print(f"    ⚠️ {a}")

            return {
                "analysis_type": "frame_consistency",
                "frames_analyzed": len(noise_levels),
                "consistency_score": consistency_score,
                "noise_variation_pct": round(noise_cv, 2),
                "sharpness_variation_pct": round(sharpness_cv, 2),
                "average_noise_level": round(float(noise_mean), 2),
                "average_sharpness": round(float(sharpness_mean), 2),
                "anomalies": anomalies,
                "anomaly_count": len(anomalies),
            }

        except Exception as e:
            print(f"❌ Frame consistency analysis error: {e}")
            return {
                "analysis_type": "frame_consistency",
                "frames_analyzed": 0,
                "consistency_score": 70,
                "anomalies": [],
                "error": str(e),
            }

    # ═══════════════════════════════════════════════════════════════
    #  STEP 6: AUDIO EXTRACTION (FFmpeg)
    # ═══════════════════════════════════════════════════════════════

    def extract_audio_track(self, video_path: str, output_path: str) -> Dict[str, Any]:
        """Extract audio track from video using FFmpeg."""
        try:
            print("🎵 Extracting audio track...")
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)

            cmd = [
                "ffmpeg",
                "-i", video_path,
                "-vn",
                "-acodec", "pcm_s16le",
                "-ar", "22050",
                "-ac", "1",
                "-y",
                output_path,
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

            if result.returncode != 0:
                stderr = result.stderr.lower()
                if "does not contain any stream" in stderr or "no audio" in stderr:
                    print("ℹ️ Video has no audio track")
                    return {"audio_path": None, "success": False,
                            "reason": "No audio track in video"}
                raise Exception(f"ffmpeg error: {result.stderr[:200]}")

            if not Path(output_path).exists() or Path(output_path).stat().st_size < 1000:
                return {"audio_path": None, "success": False,
                        "reason": "Extracted audio file is empty"}

            print(f"✅ Audio extracted: {output_path}")
            return {"audio_path": output_path, "success": True}

        except FileNotFoundError:
            print("❌ ffmpeg not found — install FFmpeg")
            return {"audio_path": None, "success": False, "error": "ffmpeg not installed"}
        except subprocess.TimeoutExpired:
            print("❌ Audio extraction timed out")
            return {"audio_path": None, "success": False, "error": "Extraction timed out"}
        except Exception as e:
            print(f"❌ Audio extraction error: {e}")
            return {"audio_path": None, "success": False, "error": str(e)}

    # ═══════════════════════════════════════════════════════════════
    #  STEP 7: COMPREHENSIVE ANALYSIS (Orchestrator)
    # ═══════════════════════════════════════════════════════════════

    async def analyze_video_comprehensive(
        self, video_path: str, output_dir: str
    ) -> Dict[str, Any]:
        """Run ALL video analysis steps and combine results.
        
        Pipeline:
        1. Metadata extraction (ffprobe)
        2. Keyframe extraction (scene change detection)
        3. AI generation detection (ALL frames → umm-maybe model)
        4. Deepfake face detection (face frames → dima806 model)
        5. Frame consistency analysis (local, no API)
        6. Audio extraction + analysis
        7. Scoring (weighted combination)
        """

        print("🎥 Starting comprehensive video analysis...")
        print("=" * 60)
        Path(output_dir).mkdir(parents=True, exist_ok=True)

        # Step 1 — Metadata
        metadata = self.extract_video_metadata(video_path)

        # Step 2 — Keyframes
        keyframes = self.extract_keyframes(video_path, output_dir, max_frames=15)
        frame_paths = keyframes.get("frame_paths", [])
        frame_positions = keyframes.get("frame_positions", [])
        fps = keyframes.get("fps", 30.0)

        # Step 3 — AI Generation Detection (ALL frames)
        print("\n" + "=" * 60)
        print("PHASE 1: AI Generation Detection (all frames)")
        print("=" * 60)
        ai_generation = await self.detect_ai_generated_frames(
            frame_paths, frame_positions, fps
        )

        # Step 4 — Deepfake Face Detection (face frames only)
        print("\n" + "=" * 60)
        print("PHASE 2: Deepfake Face Detection (face frames only)")
        print("=" * 60)
        deepfake_faces = await self.detect_deepfake_faces(
            frame_paths, frame_positions, fps
        )

        # Step 5 — Frame Consistency Analysis (local, free)
        print("\n" + "=" * 60)
        print("PHASE 3: Frame Consistency Analysis (local)")
        print("=" * 60)
        frame_consistency = self.analyze_frame_consistency(frame_paths)

        # Step 6 — Audio extraction + analysis
        print("\n" + "=" * 60)
        print("PHASE 4: Audio Analysis")
        print("=" * 60)
        audio_path = str(Path(output_dir) / "extracted_audio.wav")
        audio_extraction = self.extract_audio_track(video_path, audio_path)

        audio_analysis = None
        transcript = None
        if audio_extraction.get("success"):
            try:
                from services.audio_service import AudioService
                audio_service = AudioService()
                audio_analysis = await audio_service.analyze_audio_comprehensive(
                    audio_extraction["audio_path"], output_dir
                )
                transcript = audio_analysis.get("transcript", {}).get("text", "")
            except Exception as e:
                print(f"⚠️ Audio analysis failed: {e}")

        # Step 7 — Calculate integrity score
        print("\n" + "=" * 60)
        print("PHASE 5: Scoring")
        print("=" * 60)
        score = self._calculate_integrity_score(
            metadata, ai_generation, deepfake_faces,
            frame_consistency, audio_analysis
        )

        print(f"\n{'=' * 60}")
        print(f"🏁 FINAL Video Integrity Score: {score}/100")
        print(f"🏁 Verdict: {self._get_verdict(score)}")
        print(f"{'=' * 60}")

        return {
            "type": "VIDEO",
            "metadata": metadata,
            "keyframes": {
                "frames_extracted": keyframes.get("frames_extracted", 0),
                "frame_paths": frame_paths,
                "extraction_method": "scene_change_detection",
            },
            "ai_generation_detection": ai_generation,
            "deepfake_face_detection": deepfake_faces,
            "frame_consistency": frame_consistency,
            "audio_extraction": audio_extraction,
            "audio_analysis": audio_analysis,
            "transcript": transcript,
            "video_integrity_score": score,
            "overall_verdict": self._get_verdict(score),
        }

    # ═══════════════════════════════════════════════════════════════
    #  STEP 8: SCORING — Weighted Components
    # ═══════════════════════════════════════════════════════════════

    def _calculate_integrity_score(
        self,
        metadata: Dict[str, Any],
        ai_generation: Dict[str, Any],
        deepfake_faces: Dict[str, Any],
        frame_consistency: Dict[str, Any],
        audio_analysis: Optional[Dict[str, Any]],
    ) -> int:
        """Calculate video integrity score with critical signal override."""

        components = {}

        # ── Get raw probabilities ──
        avg_ai_prob = ai_generation.get("average_ai_probability", 0)
        ai_unavailable = ai_generation.get("detection_unavailable", False)

        avg_deepfake_prob = deepfake_faces.get("average_deepfake_probability", 0)
        deepfake_unavailable = deepfake_faces.get("detection_unavailable", False)
        deepfake_not_applicable = deepfake_faces.get("not_applicable", False)

        ai_tool_in_metadata = metadata.get("is_ai_tool_detected", False)
        consistency_score = frame_consistency.get("consistency_score", 70)

        ai_voice_prob = 0
        if audio_analysis:
            ai_voice_prob = (
                audio_analysis.get("ai_voice", {})
                .get("ai_voice_probability", 0)
            )

        # ═══════════════════════════════════════════════════════════
        #  COMPONENT SCORING (each 0-100, higher = more authentic)
        # ═══════════════════════════════════════════════════════════

        # Component 1: AI Generation Detection (30%)
        if ai_unavailable:
            components["ai_generation"] = 70
        else:
            components["ai_generation"] = max(0, 100 - avg_ai_prob)

        # Component 2: Metadata Integrity (20%)
        if ai_tool_in_metadata:
            components["metadata"] = 10
        elif metadata.get("error"):
            components["metadata"] = 60
        else:
            components["metadata"] = 95

        # Component 3: Deepfake Face Detection (20%)
        if deepfake_unavailable:
            components["deepfake"] = 70
        elif deepfake_not_applicable:
            components["deepfake"] = 70
        elif not ai_unavailable and avg_ai_prob > 50:
            components["deepfake"] = 50  # Neutralized — AI detected
        else:
            components["deepfake"] = max(0, 100 - avg_deepfake_prob)

        # Component 4: Frame Consistency (15%)
        components["consistency"] = consistency_score

        # Component 5: Audio Integrity (15%)
        if audio_analysis is None:
            components["audio"] = 70
        else:
            components["audio"] = max(0, 100 - ai_voice_prob)

        # ═══════════════════════════════════════════════════════════
        #  BASE WEIGHTED SCORE
        # ═══════════════════════════════════════════════════════════

        base_score = (
            components["ai_generation"] * 0.30
            + components["metadata"] * 0.20
            + components["deepfake"] * 0.20
            + components["consistency"] * 0.15
            + components["audio"] * 0.15
        )

        final = round(base_score)

        # ═══════════════════════════════════════════════════════════
        #  CRITICAL SIGNAL OVERRIDES
        #  FIX: Track ALL overrides applied, not just the last one
        # ═══════════════════════════════════════════════════════════

        overrides_applied = []  # ✅ FIX: List instead of single variable

        # AI generation override caps
        if not ai_unavailable:
            if avg_ai_prob >= 80:
                cap = 20
                if final > cap:
                    overrides_applied.append(
                        f"AI generation avg={avg_ai_prob:.1f}% (≥80%) → capped at {cap}"
                    )
                    final = cap
            elif avg_ai_prob >= 60:
                cap = 35
                if final > cap:
                    overrides_applied.append(
                        f"AI generation avg={avg_ai_prob:.1f}% (≥60%) → capped at {cap}"
                    )
                    final = cap
            elif avg_ai_prob >= 45:
                cap = 55
                if final > cap:
                    overrides_applied.append(
                        f"AI generation avg={avg_ai_prob:.1f}% (≥45%) → capped at {cap}"
                    )
                    final = cap

        # Metadata AI tool + AI detection = very strong
        if ai_tool_in_metadata and not ai_unavailable and avg_ai_prob > 30:
            cap = 15
            if final > cap:
                overrides_applied.append(
                    f"AI tool in metadata + AI={avg_ai_prob:.1f}% → capped at {cap}"
                )
                final = cap

        # High deepfake probability
        if not deepfake_unavailable and not deepfake_not_applicable:
            if avg_deepfake_prob >= 70:
                cap = 25
                if final > cap:
                    overrides_applied.append(
                        f"Deepfake face avg={avg_deepfake_prob:.1f}% (≥70%) → capped at {cap}"
                    )
                    final = cap

        # Poor consistency + moderate AI = combined signal
        if consistency_score < 40 and not ai_unavailable and avg_ai_prob > 40:
            cap = 30
            if final > cap:
                overrides_applied.append(
                    f"Poor consistency ({consistency_score}) + AI={avg_ai_prob:.1f}% → capped at {cap}"
                )
                final = cap

        final = max(0, min(100, final))

        # ═══════════════════════════════════════════════════════════
        #  PRINT DETAILED BREAKDOWN
        # ═══════════════════════════════════════════════════════════

        print(f"📊 Score breakdown:")
        print(f"   AI Generation (30%):  {components['ai_generation']:.1f} → contributes {components['ai_generation'] * 0.30:.1f}")
        print(f"   Metadata (20%):       {components['metadata']:.1f} → contributes {components['metadata'] * 0.20:.1f}")
        print(f"   Deepfake Face (20%):  {components['deepfake']:.1f} → contributes {components['deepfake'] * 0.20:.1f}")
        print(f"   Consistency (15%):    {components['consistency']:.1f} → contributes {components['consistency'] * 0.15:.1f}")
        print(f"   Audio (15%):          {components['audio']:.1f} → contributes {components['audio'] * 0.15:.1f}")
        print(f"   ─────────────────────────────")
        print(f"   Base Score:           {round(base_score)}")

        if overrides_applied:
            print(f"   ⚠️ OVERRIDES APPLIED ({len(overrides_applied)}):")
            for override in overrides_applied:
                print(f"      → {override}")
            print(f"   Final Score:          {final}")
        else:
            print(f"   Final Score:          {final} (no overrides)")

        return final


    def _get_verdict(self, score: int) -> str:
        """Map integrity score to verdict.
        
        ✅ FIX: Matches main scoring_service.py verdict ranges:
        0-20:   FAKE
        21-40:  LIKELY_MISLEADING
        41-60:  SUSPICIOUS
        61-80:  MOSTLY_CREDIBLE
        81-100: VERIFIED
        """
        if score <= 20:
            return "FAKE"
        elif score <= 40:
            return "LIKELY_MISLEADING"
        elif score <= 60:
            return "SUSPICIOUS"
        elif score <= 80:
            return "MOSTLY_CREDIBLE"
        else:
            return "VERIFIED"


# ═══════════════════════════════════════════════════════════════
#  Legacy wrapper
# ═══════════════════════════════════════════════════════════════

async def analyze_video(video_path: str) -> Dict[str, Any]:
    """Comprehensive video analysis (legacy entry point)."""
    service = VideoService()
    output_dir = str(Path("outputs") / Path(video_path).stem)
    return await service.analyze_video_comprehensive(video_path, output_dir)