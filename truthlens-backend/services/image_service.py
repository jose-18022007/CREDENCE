"""Image analysis service for AI detection, EXIF, and ELA - FIXED VERSION."""
from PIL import Image, ImageChops, ImageStat
from PIL.ExifTags import TAGS
import numpy as np
from typing import Dict, Any, Optional
from pathlib import Path
import httpx
import asyncio
import os
import base64  # ✅ ADDED
from config import settings


class ImageService:
    """Service for comprehensive image analysis - HUGGINGFACE FIXED."""
    
    def __init__(self):
        """Initialize image service."""
        # ✅ UPDATED: Using new router endpoint (api-inference.huggingface.co is deprecated)
        self.huggingface_api_url = "https://router.huggingface.co/hf-inference/models/umm-maybe/AI-image-detector"
        self.max_retries = 3
        self.retry_delay = 20  # seconds for cold start
    
    async def detect_ai_generated(self, image_path: str) -> Dict[str, Any]:
        """Detect if image is AI-generated using HuggingFace API - ✅ FIXED."""
        if not settings.HUGGINGFACE_API_KEY:
            print("⚠️ HUGGINGFACE_API_KEY not set - using fallback")
            return self._get_fallback_ai_detection(image_path)
        
        try:
            # Read image as binary
            with open(image_path, "rb") as f:
                image_data = f.read()
            
            # ✅ FIXED: Base64 encode image
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            headers = {
                "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"
            }
            
            # ✅ FIXED: JSON payload with "inputs"
            payload = {
                "inputs": image_base64
            }
            
            print(f"🔍 Calling HuggingFace AI detector API...")
            
            # Retry logic for model loading
            for attempt in range(self.max_retries):
                try:
                    async with httpx.AsyncClient(timeout=60.0) as client:
                        # ✅ FIXED: json=payload instead of content=image_data
                        response = await client.post(
                            self.huggingface_api_url,
                            headers=headers,
                            json=payload  # ✅ CORRECT
                        )
                        
                        print(f"📡 HuggingFace API response: {response.status_code}")
                        
                        if response.status_code == 503:
                            if attempt < self.max_retries - 1:
                                print(f"⏳ Model loading, waiting {self.retry_delay}s... (attempt {attempt + 1}/{self.max_retries})")
                                await asyncio.sleep(self.retry_delay)
                                continue
                            else:
                                print("❌ Model failed to load after retries - using fallback")
                                return self._get_fallback_ai_detection(image_path)
                        
                        if response.status_code == 401:
                            print("❌ HuggingFace API authentication failed - check API key")
                            return self._get_fallback_ai_detection(image_path)
                        
                        if response.status_code == 200:
                            data = response.json()
                            print(f"✅ HuggingFace API response: {data}")
                            
                            # Parse response: [{"label": "artificial", "score": 0.92}]
                            ai_score = 0
                            for item in data:
                                if item.get("label", "").lower() in ["artificial", "ai", "fake"]:
                                    ai_score = item.get("score", 0)
                                    break
                            
                            ai_probability = ai_score * 100
                            prediction = "AI_GENERATED" if ai_probability > 50 else "REAL"
                            
                            result = {
                                "ai_generated_probability": round(ai_probability, 2),
                                "prediction": prediction,
                                "confidence": round(ai_score, 3),
                                "model_used": "umm-maybe/AI-image-detector"
                            }
                            print(f"✅ AI Detection Result: {result}")
                            return result
                        else:
                            print(f"❌ Unexpected status code: {response.status_code}")
                            print(f"Response: {response.text[:200]}")
                        
                except httpx.TimeoutException:
                    print(f"⏱️ Request timeout (attempt {attempt + 1}/{self.max_retries})")
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(5)
                        continue
            
            print("❌ All retries exhausted - using fallback")
            return self._get_fallback_ai_detection(image_path)
            
        except Exception as e:
            print(f"❌ AI detection error: {e}")
            return self._get_fallback_ai_detection(image_path)
    
    def _get_fallback_ai_detection(self, image_path: str) -> Dict[str, Any]:
        """Fallback AI detection using EXIF heuristics."""
        print("⚠️ Using fallback AI detection (HuggingFace API unavailable)")
        try:
            image = Image.open(image_path)
            exif = image.getexif()
            
            if not exif or len(exif) < 5:
                result = {
                    "ai_generated_probability": 60.0,
                    "prediction": "POSSIBLY_AI",
                    "confidence": 0.6,
                    "model_used": "heuristic_fallback",
                    "note": "HuggingFace API unavailable - using EXIF heuristics"
                }
                return result
            
            result = {
                "ai_generated_probability": 20.0,
                "prediction": "LIKELY_REAL",
                "confidence": 0.8,
                "model_used": "heuristic_fallback",
                "note": "HuggingFace API unavailable - using EXIF heuristics"
            }
            return result
        except Exception as e:
            return {
                "ai_generated_probability": 50.0,
                "prediction": "UNKNOWN",
                "confidence": 0.0,
                "model_used": "fallback",
                "note": f"Analysis failed: {str(e)}"
            }
    
    def extract_exif_metadata(self, image_path: str) -> Dict[str, Any]:
        """Extract EXIF metadata from image."""
        try:
            image = Image.open(image_path)
            exif_data = image.getexif()
            
            if not exif_data or len(exif_data) == 0:
                return {
                    "has_metadata": False,
                    "metadata": {},
                    "warnings": ["Metadata completely stripped"],
                    "suspicious_flags": ["METADATA_STRIPPED"]
                }
            
            metadata = {}
            for tag_id, value in exif_data.items():
                tag = TAGS.get(tag_id, tag_id)
                try:
                    metadata[tag] = str(value)
                except:
                    metadata[tag] = "Unable to decode"
            
            warnings = []
            suspicious_flags = []
            
            software = metadata.get("Software", "")
            if any(editor in software.lower() for editor in ["photoshop", "gimp", "paint.net", "pixlr"]):
                warnings.append(f"Image edited with {software}")
                suspicious_flags.append("EDITED_WITH_SOFTWARE")
            
            if "GPSInfo" in metadata or "GPSLatitude" in metadata:
                warnings.append("GPS location data present")
            
            datetime_original = metadata.get("DateTimeOriginal")
            datetime_modified = metadata.get("DateTime")
            if datetime_original and datetime_modified and datetime_original != datetime_modified:
                warnings.append("Creation and modification dates differ")
                suspicious_flags.append("DATETIME_MISMATCH")
            
            return {
                "has_metadata": True,
                "metadata": metadata,
                "camera_make": metadata.get("Make", "Unknown"),
                "camera_model": metadata.get("Model", "Unknown"),
                "software": software or "None",
                "datetime": metadata.get("DateTime", "Unknown"),
                "warnings": warnings,
                "suspicious_flags": suspicious_flags
            }
            
        except Exception as e:
            print(f"EXIF extraction error: {e}")
            return {
                "has_metadata": False,
                "metadata": {},
                "warnings": [f"Error extracting metadata: {str(e)}"],
                "suspicious_flags": []
            }
    
    def perform_ela_analysis(self, image_path: str, output_path: Optional[str] = None) -> Dict[str, Any]:
        """Perform Error Level Analysis to detect manipulation."""
        try:
            original = Image.open(image_path)
            
            if original.mode != 'RGB':
                original = original.convert('RGB')
            
            temp_path = str(Path(image_path).parent / f"temp_ela_{Path(image_path).name}")
            original.save(temp_path, 'JPEG', quality=90)
            resaved = Image.open(temp_path)
            ela_image = ImageChops.difference(original, resaved)
            
            extrema = ela_image.getextrema()
            max_diff = max([ex[1] for ex in extrema])
            
            if max_diff == 0:
                max_diff = 1
            
            scale = 255.0 / max_diff
            ela_image = ImageChops.multiply(ela_image, Image.new('RGB', ela_image.size, (int(scale), int(scale), int(scale))))
            
            if output_path is None:
                output_dir = Path("truthlens-backend/outputs")
                output_dir.mkdir(parents=True, exist_ok=True)
                output_path = str(output_dir / f"ela_{Path(image_path).name}")
            
            ela_image.save(output_path)
            
            stat = ImageStat.Stat(ela_image)
            mean_error = sum(stat.mean) / len(stat.mean)
            stddev_error = sum(stat.stddev) / len(stat.stddev)
            
            manipulation_detected = stddev_error > 20 or mean_error > 30
            manipulation_confidence = min((stddev_error / 50) * 100, 100)
            
            notes = (
                f"Significant error level differences detected (stddev: {stddev_error:.1f}). "
                "Possible manipulation in high-contrast regions." if manipulation_detected else
                "Error levels appear consistent across the image. No obvious manipulation detected."
            )
            
            try:
                os.remove(temp_path)
            except:
                pass
            
            return {
                "ela_image_path": output_path,
                "manipulation_detected": manipulation_detected,
                "manipulation_confidence": round(manipulation_confidence, 2),
                "mean_error_level": round(mean_error, 2),
                "stddev_error_level": round(stddev_error, 2),
                "analysis_notes": notes
            }
            
        except Exception as e:
            print(f"ELA analysis error: {e}")
            return {
                "ela_image_path": None,
                "manipulation_detected": False,
                "manipulation_confidence": 0,
                "analysis_notes": f"ELA analysis failed: {str(e)}"
            }
    
    async def analyze_image_comprehensive(self, image_path: str) -> Dict[str, Any]:
        """Comprehensive image analysis combining all methods."""
        print(f"🖼️ Starting comprehensive image analysis for: {image_path}")
        
        ai_detection = await self.detect_ai_generated(image_path)
        exif_data = self.extract_exif_metadata(image_path)
        ela_analysis = self.perform_ela_analysis(image_path)
        
        print(f"📊 AI Detection: {ai_detection.get('ai_generated_probability')}%")
        print(f"📊 EXIF: {exif_data.get('has_metadata')}, flags: {exif_data.get('suspicious_flags')}")
        print(f"📊 ELA: manipulation={ela_analysis.get('manipulation_detected')}")
        
        # Calculate media integrity score
        score = 100
        
        if ai_detection["ai_generated_probability"] > 70:
            score -= 50
        elif ai_detection["ai_generated_probability"] > 50:
            score -= 30
        
        if "METADATA_STRIPPED" in exif_data.get("suspicious_flags", []):
            score -= 15
        
        if "EDITED_WITH_SOFTWARE" in exif_data.get("suspicious_flags", []):
            score -= 10
        
        if ela_analysis.get("manipulation_detected"):
            score -= 40
        
        score = max(0, min(100, score))
        
        print(f"✅ Media Integrity Score: {score}/100")
        
        return {
            "type": "IMAGE",
            "ai_detection": ai_detection,
            "exif_data": exif_data,
            "ela_analysis": ela_analysis,
            "media_integrity_score": score,
            "overall_verdict": self._get_verdict(score)
        }
    
    def _get_verdict(self, score: int) -> str:
        """Get verdict based on score."""
        if score >= 80:
            return "AUTHENTIC"
        elif score >= 60:
            return "LIKELY_AUTHENTIC"
        elif score >= 40:
            return "SUSPICIOUS"
        else:
            return "LIKELY_MANIPULATED"


# Legacy functions
async def analyze_image(image_path: str) -> Dict[str, Any]:
    service = ImageService()
    return await service.analyze_image_comprehensive(image_path)


async def detect_ai_generated(image_path: str) -> float:
    service = ImageService()
    result = await service.detect_ai_generated(image_path)
    return result["ai_generated_probability"] / 100
