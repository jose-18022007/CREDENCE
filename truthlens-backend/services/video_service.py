"""Video analysis service with scene-based keyframe extraction, 
face-filtered deepfake detection, and audio extraction."""

import cv2
import subprocess
import json
import asyncio
import httpx
import base64
import os
import platform
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
from config import settings


class VideoService:
    """Service for comprehensive video analysis."""

    def __init__(self):
        """Initialize video service with models and config."""

        # Deepfake detection model (HuggingFace Inference API)
        # ✅ UPDATED: Using dima806 model for better compatibility
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

        # ✅ FIX #3: Face detection cascade for deepfake pre-filtering
        # Only frames WITH faces get sent to deepfake model
        try:
            cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            if self.face_cascade.empty():
                print("⚠️ Face cascade failed to load — face filter disabled")
                self.face_cascade = None
        except Exception:
            print("⚠️ Face cascade not available — face filter disabled")
            self.face_cascade = None

        # Configure FFmpeg path for Windows
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

            # Find video stream
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
            
            # Parse frame rate (can be "30/1" or "29.97")
            try:
                if "/" in str(frame_rate_str):
                    num, den = frame_rate_str.split("/")
                    fps = float(num) / float(den)
                else:
                    fps = float(frame_rate_str)
            except (ValueError, ZeroDivisionError):
                fps = 30.0

            # Gather all metadata tags for AI tool detection
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
        """Return empty metadata dict on failure."""
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
        """Extract keyframes using scene change detection.

        Instead of fixed intervals (which grab redundant identical frames),
        this detects scene transitions — edits, cuts, splices — and extracts
        frames at those points. Much better for manipulation detection.
        """
        try:
            print(f"🎬 Extracting keyframes with scene change detection (max {max_frames})...")
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

            # ✅ FIX #2 & #6: Scene change detection with sampling
            # For speed, sample every Nth frame (aim for ~500 samples)
            sample_interval = max(1, total_frames // 500)
            prev_gray = None
            scene_scores: List[Tuple[int, float]] = []  # (frame_index, diff_score)

            frame_idx = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_idx % sample_interval == 0:
                    # Downscale for fast comparison
                    small = cv2.resize(frame, (160, 120))
                    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)

                    if prev_gray is not None:
                        diff = cv2.absdiff(prev_gray, gray).mean()
                        scene_scores.append((frame_idx, diff))

                    prev_gray = gray

                frame_idx += 1

            # Select frames with HIGHEST scene change (biggest visual transitions)
            scene_scores.sort(key=lambda x: x[1], reverse=True)
            selected_positions = sorted(
                [s[0] for s in scene_scores[: max_frames - 2]]
            )

            # Always include first and last frame for full coverage
            if 0 not in selected_positions:
                selected_positions.insert(0, 0)
            last = max(0, total_frames - 1)
            if last not in selected_positions:
                selected_positions.append(last)

            # Cap at max_frames
            selected_positions = selected_positions[:max_frames]

            print(f"📊 Selected {len(selected_positions)} scene-change positions")

            # ✅ FIX #6: Seek directly to each frame instead of reading all
            frame_paths = []
            frame_positions = []

            for i, target_pos in enumerate(selected_positions):
                cap.set(cv2.CAP_PROP_POS_FRAMES, target_pos)
                ret, frame = cap.read()
                if not ret:
                    continue

                # Resize to max 640px width for faster deepfake processing
                h, w = frame.shape[:2]
                if w > 640:
                    scale = 640 / w
                    frame = cv2.resize(frame, (640, int(h * scale)))

                frame_filename = f"frame_{i + 1:03d}.jpg"
                frame_path = str(Path(output_dir) / frame_filename)
                cv2.imwrite(frame_path, frame)

                frame_paths.append(frame_path)
                frame_positions.append(target_pos)  # ✅ FIX #1: actual position

            cap.release()

            print(f"✅ Extracted {len(frame_paths)} keyframes via scene detection")

            return {
                "frame_paths": frame_paths,
                "frame_positions": frame_positions,  # actual positions in video
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
    #  STEP 3: FACE DETECTION PRE-FILTER
    # ═══════════════════════════════════════════════════════════════

    def _has_faces(self, frame_path: str) -> bool:
        """Check if a frame contains human faces.

        Deepfake models are trained on faces — sending frames without
        faces produces garbage scores. This pre-filter saves API calls
        and prevents meaningless results from polluting the average.
        """
        if self.face_cascade is None:
            return True  # If cascade unavailable, assume face present

        img = cv2.imread(frame_path)
        if img is None:
            return False

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.3,
            minNeighbors=5,
            minSize=(30, 30),
        )
        return len(faces) > 0

    # ═══════════════════════════════════════════════════════════════
    #  STEP 4: DEEPFAKE DETECTION (HuggingFace API — faces only)
    # ═══════════════════════════════════════════════════════════════

    async def detect_deepfake_frames(
        self,
        frame_paths: List[str],
        frame_positions: List[int],
        fps: float = 30.0,
    ) -> Dict[str, Any]:
        """Detect deepfakes in extracted frames.

        Only frames containing faces are sent to the model.
        Timestamps are calculated from actual frame positions.
        """
        if not settings.HUGGINGFACE_API_KEY:
            print("⚠️ HUGGINGFACE_API_KEY not set — skipping deepfake detection")
            return self._fallback_deepfake(len(frame_paths), "API key not configured")

        if not frame_paths:
            return self._fallback_deepfake(0, "No frames to analyze")

        # ✅ FIX #3: Filter frames that actually contain faces
        print(f"🔍 Checking {len(frame_paths)} frames for faces...")
        face_frames: List[Tuple[str, int]] = []
        no_face_frames: List[str] = []

        for path, pos in zip(frame_paths, frame_positions):
            if self._has_faces(path):
                face_frames.append((path, pos))
            else:
                no_face_frames.append(path)

        print(f"👤 Faces found in {len(face_frames)}/{len(frame_paths)} frames")

        if not face_frames:
            print("ℹ️ No faces detected in any keyframe — skipping deepfake analysis")
            return {
                "frames_analyzed": 0,
                "frames_with_faces": 0,
                "frames_without_faces": len(frame_paths),
                "frames_flagged": 0,
                "flagged_frame_paths": [],
                "per_frame_results": [],
                "average_deepfake_probability": 0,
                "max_deepfake_probability": 0,
                "note": "No faces detected — deepfake analysis not applicable",
            }

        print(f"🔍 Analyzing {len(face_frames)} face-containing frames for deepfakes...")

        headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
        per_frame_results = []
        flagged_frames = []
        deepfake_probabilities = []

        for idx, (frame_path, frame_pos) in enumerate(face_frames):
            print(f"  Analyzing face frame {idx + 1}/{len(face_frames)}...")

            try:
                result = await self._analyze_single_frame(
                    frame_path, frame_pos, fps, headers
                )
                if result:
                    per_frame_results.append(result)
                    deepfake_probabilities.append(result["deepfake_probability"])
                    if result["deepfake_probability"] > 60:
                        flagged_frames.append(frame_path)
                    print(f"    ✅ {result['deepfake_probability']:.1f}% deepfake "
                          f"at {result['timestamp_formatted']}")

            except Exception as e:
                print(f"    ❌ Frame analysis failed: {e}")
                continue

            # Rate limit protection between requests
            if idx < len(face_frames) - 1:
                await asyncio.sleep(1.5)

        if not deepfake_probabilities:
            return self._fallback_deepfake(len(frame_paths), "All API calls failed")

        avg_prob = sum(deepfake_probabilities) / len(deepfake_probabilities)
        max_prob = max(deepfake_probabilities)

        print(f"✅ Deepfake analysis complete: avg={avg_prob:.1f}%, max={max_prob:.1f}%")

        return {
            "frames_analyzed": len(per_frame_results),
            "frames_with_faces": len(face_frames),
            "frames_without_faces": len(no_face_frames),
            "frames_flagged": len(flagged_frames),
            "flagged_frame_paths": flagged_frames,
            "per_frame_results": per_frame_results,
            "average_deepfake_probability": round(avg_prob, 2),
            "max_deepfake_probability": round(max_prob, 2),
        }

    async def _analyze_single_frame(
        self, frame_path: str, frame_pos: int, fps: float, headers: dict
    ) -> Optional[Dict[str, Any]]:
        """Send a single frame to HuggingFace deepfake detection."""

        with open(frame_path, "rb") as f:
            image_data = f.read()

        image_base64 = base64.b64encode(image_data).decode("utf-8")
        payload = {"inputs": image_base64}

        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        self.deepfake_api_url,
                        headers=headers,
                        json=payload,
                    )

                    if response.status_code == 503:
                        if attempt < self.max_retries - 1:
                            print(f"    ⏳ Model loading, waiting {self.retry_delay}s...")
                            await asyncio.sleep(self.retry_delay)
                            continue
                        raise Exception("Model failed to load after retries")

                    if response.status_code != 200:
                        raise Exception(
                            f"API returned {response.status_code}: "
                            f"{response.text[:100]}"
                        )

                    data = response.json()

                    # ✅ UPDATED: Parse response - handles both "Fake"/"Real" and "fake"/"deepfake"
                    # Response format: [{"label": "Fake", "score": 0.92}, {"label": "Real", "score": 0.08}]
                    # or nested: [[{"label": "Fake", "score": 0.92}]]
                    
                    # Handle nested response format
                    if isinstance(data, list) and len(data) > 0 and isinstance(data[0], list):
                        data = data[0]
                    
                    deepfake_score = 0.0
                    for item in data:
                        label = item.get("label", "").lower()
                        # Check for "fake", "deepfake", or "label_1" (some models use LABEL_0/LABEL_1)
                        if "fake" in label or "deepfake" in label or label == "label_1":
                            deepfake_score = item.get("score", 0)
                            break

                    deepfake_pct = deepfake_score * 100

                    # ✅ FIX #1: Correct timestamp from actual frame position
                    timestamp_sec = frame_pos / fps if fps > 0 else 0
                    minutes = int(timestamp_sec // 60)
                    seconds = int(timestamp_sec % 60)

                    return {
                        "frame_path": frame_path,
                        "frame_position": frame_pos,
                        "timestamp_seconds": round(timestamp_sec, 2),
                        "timestamp_formatted": f"{minutes}:{seconds:02d}",
                        "deepfake_probability": round(deepfake_pct, 2),
                        "prediction": "DEEPFAKE" if deepfake_pct > 60 else "REAL",
                    }

            except httpx.TimeoutException:
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(5)
                    continue
                raise

        return None

    def _fallback_deepfake(self, frame_count: int, reason: str) -> Dict[str, Any]:
        """Fallback when deepfake detection is unavailable.

        ✅ FIX #5: Returns 0 probability with clear 'unavailable' flag
        instead of misleading 50%.
        """
        print(f"⚠️ Deepfake detection unavailable: {reason}")
        return {
            "frames_analyzed": 0,
            "frames_with_faces": 0,
            "frames_without_faces": frame_count,
            "frames_flagged": 0,
            "flagged_frame_paths": [],
            "per_frame_results": [],
            "average_deepfake_probability": 0,
            "max_deepfake_probability": 0,
            "detection_unavailable": True,  # ← clear flag for scoring
            "note": f"Deepfake detection unavailable — {reason}",
        }

    # ═══════════════════════════════════════════════════════════════
    #  STEP 5: AUDIO EXTRACTION (FFmpeg)
    # ═══════════════════════════════════════════════════════════════

    def extract_audio_track(self, video_path: str, output_path: str) -> Dict[str, Any]:
        """Extract audio track from video using FFmpeg."""
        try:
            print("🎵 Extracting audio track...")
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)

            cmd = [
                "ffmpeg",
                "-i", video_path,
                "-vn",                  # No video
                "-acodec", "pcm_s16le", # PCM audio
                "-ar", "22050",         # Sample rate
                "-ac", "1",             # Mono
                "-y",                   # Overwrite
                output_path,
            ]

            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=120
            )

            if result.returncode != 0:
                stderr = result.stderr.lower()
                if "does not contain any stream" in stderr or "no audio" in stderr:
                    print("ℹ️ Video has no audio track")
                    return {"audio_path": None, "success": False,
                            "reason": "No audio track in video"}
                raise Exception(f"ffmpeg error: {result.stderr[:200]}")

            # Verify output file exists and has content
            if not Path(output_path).exists() or Path(output_path).stat().st_size < 1000:
                return {"audio_path": None, "success": False,
                        "reason": "Extracted audio file is empty or too small"}

            print(f"✅ Audio extracted: {output_path}")
            return {"audio_path": output_path, "success": True}

        except FileNotFoundError:
            print("❌ ffmpeg not found — install FFmpeg")
            return {"audio_path": None, "success": False,
                    "error": "ffmpeg not installed"}
        except subprocess.TimeoutExpired:
            print("❌ Audio extraction timed out")
            return {"audio_path": None, "success": False,
                    "error": "Extraction timed out (video too long?)"}
        except Exception as e:
            print(f"❌ Audio extraction error: {e}")
            return {"audio_path": None, "success": False, "error": str(e)}

    # ═══════════════════════════════════════════════════════════════
    #  STEP 6: COMPREHENSIVE ANALYSIS (orchestrator)
    # ═══════════════════════════════════════════════════════════════

    async def analyze_video_comprehensive(
        self, video_path: str, output_dir: str
    ) -> Dict[str, Any]:
        """Run all video analysis steps and combine results."""

        print(f"🎥 Starting comprehensive video analysis...")
        Path(output_dir).mkdir(parents=True, exist_ok=True)

        # Step 1 — Metadata
        metadata = self.extract_video_metadata(video_path)

        # Step 2 — Keyframes (scene change detection)
        keyframes = self.extract_keyframes(video_path, output_dir, max_frames=15)

        # Step 3 — Deepfake detection (face-filtered)
        deepfake_analysis = await self.detect_deepfake_frames(
            keyframes.get("frame_paths", []),
            keyframes.get("frame_positions", []),
            keyframes.get("fps", 30.0),
        )

        # Step 4 — Audio extraction
        audio_path = str(Path(output_dir) / "extracted_audio.wav")
        audio_extraction = self.extract_audio_track(video_path, audio_path)

        # Step 5 — Audio analysis (if extracted)
        audio_analysis = None
        transcript = None
        if audio_extraction.get("success"):
            try:
                from services.audio_service import AudioService
                audio_service = AudioService()
                audio_analysis = await audio_service.analyze_audio_comprehensive(
                    audio_extraction["audio_path"], output_dir
                )
                # Extract transcript for text pipeline
                transcript = audio_analysis.get("transcript", {}).get("text", "")
            except Exception as e:
                print(f"⚠️ Audio analysis failed: {e}")

        # Step 6 — Calculate integrity score
        score = self._calculate_integrity_score(
            metadata, deepfake_analysis, audio_analysis
        )

        print(f"✅ Video Integrity Score: {score}/100")

        return {
            "type": "VIDEO",
            "metadata": metadata,
            "keyframes": {
                "frames_extracted": keyframes.get("frames_extracted", 0),
                "frame_paths": keyframes.get("frame_paths", []),
                "extraction_method": "scene_change_detection",
            },
            "deepfake_analysis": deepfake_analysis,
            "audio_extraction": audio_extraction,
            "audio_analysis": audio_analysis,
            "transcript": transcript,
            "video_integrity_score": score,
            "overall_verdict": self._get_verdict(score),
        }

    # ═══════════════════════════════════════════════════════════════
    #  SCORING — Weighted Components (not additive deductions)
    # ═══════════════════════════════════════════════════════════════

    def _calculate_integrity_score(
        self,
        metadata: Dict[str, Any],
        deepfake: Dict[str, Any],
        audio_analysis: Optional[Dict[str, Any]],
    ) -> int:
        """Calculate video integrity score using weighted components.

        ✅ FIX #4: Each component scores 0-100 independently,
        then combined with weights. No stacking into negatives.

        Weights:
          - Deepfake detection:  40%
          - Metadata integrity:  25%
          - Audio integrity:     20%
          - Technical quality:   15%
        """

        components = {}

        # ── Component 1: Metadata Integrity (25%) ──
        if metadata.get("is_ai_tool_detected"):
            components["metadata"] = 10   # AI tool found → very suspicious
        elif metadata.get("error"):
            components["metadata"] = 60   # Couldn't read metadata → neutral
        else:
            components["metadata"] = 95   # Clean metadata

        # ── Component 2: Deepfake Detection (40%) ──
        if deepfake.get("detection_unavailable"):
            # API was unavailable — don't penalize or reward
            components["deepfake"] = 70
        elif deepfake.get("frames_with_faces", 0) == 0:
            # No faces found — can't assess deepfake, give neutral score
            components["deepfake"] = 70
        else:
            avg = deepfake.get("average_deepfake_probability", 0)
            components["deepfake"] = max(0, 100 - avg)

        # ── Component 3: Audio Integrity (20%) ──
        if audio_analysis is None:
            # No audio track or analysis failed
            components["audio"] = 70  # Neutral
        else:
            ai_voice_prob = (
                audio_analysis.get("ai_voice", {})
                .get("ai_voice_probability", 0)
            )
            components["audio"] = max(0, 100 - ai_voice_prob)

        # ── Component 4: Technical Consistency (15%) ──
        # Basic checks: resolution, codec, duration sanity
        tech_score = 80  # Default
        width = metadata.get("width", 0)
        height = metadata.get("height", 0)
        if width > 0 and height > 0:
            # Very unusual aspect ratios can indicate manipulation
            aspect = width / height
            if aspect < 0.3 or aspect > 4.0:
                tech_score -= 20
        # Very short videos (< 3s) are often clips taken out of context
        duration = metadata.get("duration", 0)
        if 0 < duration < 3:
            tech_score -= 15

        components["technical"] = max(0, min(100, tech_score))

        # ── Weighted combination ──
        score = (
            components["deepfake"] * 0.40
            + components["metadata"] * 0.25
            + components["audio"] * 0.20
            + components["technical"] * 0.15
        )

        final = max(0, min(100, round(score)))

        print(f"📊 Score breakdown: deepfake={components['deepfake']}, "
              f"metadata={components['metadata']}, audio={components['audio']}, "
              f"technical={components['technical']} → final={final}")

        return final

    def _get_verdict(self, score: int) -> str:
        """Map integrity score to verdict."""
        if score >= 80:
            return "AUTHENTIC"
        elif score >= 60:
            return "LIKELY_AUTHENTIC"
        elif score >= 40:
            return "SUSPICIOUS"
        else:
            return "LIKELY_MANIPULATED"


# ═══════════════════════════════════════════════════════════════
#  Legacy wrapper for backward compatibility
# ═══════════════════════════════════════════════════════════════

async def analyze_video(video_path: str) -> Dict[str, Any]:
    """Comprehensive video analysis (legacy entry point)."""
    service = VideoService()
    output_dir = str(Path("outputs") / Path(video_path).stem)
    return await service.analyze_video_comprehensive(video_path, output_dir)