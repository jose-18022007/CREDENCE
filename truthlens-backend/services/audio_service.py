"""Audio analysis service with Whisper, AI detection, and spectrogram."""
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend
import matplotlib.pyplot as plt

import whisper
import librosa
import librosa.display
import numpy as np
import httpx
import asyncio
from typing import Dict, Any, List, Optional
from pathlib import Path
from config import settings


class AudioService:
    """Service for comprehensive audio analysis."""
    
    # Class-level model cache
    _whisper_model = None
    
    def __init__(self):
        """Initialize audio service."""
        self.huggingface_api_url = "https://router.huggingface.co/models/Hammad712/audio-deepfake-detection"
        self.max_retries = 3
        self.retry_delay = 20
    
    @classmethod
    def _get_whisper_model(cls):
        """Get cached Whisper model."""
        if cls._whisper_model is None:
            print("Loading Whisper model (first time only)...")
            cls._whisper_model = whisper.load_model("base")
        return cls._whisper_model
    
    def transcribe_audio(self, audio_path: str) -> Dict[str, Any]:
        """Transcribe audio using OpenAI Whisper.
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Dictionary with transcription results
        """
        try:
            model = self._get_whisper_model()
            
            # Transcribe
            result = model.transcribe(audio_path)
            
            transcript = result.get("text", "")
            language = result.get("language", "unknown")
            segments = result.get("segments", [])
            
            # Calculate duration and word count
            duration = segments[-1]["end"] if segments else 0
            word_count = len(transcript.split())
            
            return {
                "transcript": transcript.strip(),
                "language": language,
                "segments": [
                    {
                        "start": seg["start"],
                        "end": seg["end"],
                        "text": seg["text"].strip()
                    }
                    for seg in segments
                ],
                "duration_seconds": round(duration, 2),
                "word_count": word_count,
                "has_transcript": len(transcript.strip()) > 0
            }
            
        except Exception as e:
            print(f"Transcription error: {e}")
            return {
                "transcript": "",
                "language": "unknown",
                "segments": [],
                "duration_seconds": 0,
                "word_count": 0,
                "has_transcript": False,
                "error": str(e)
            }
    
    async def detect_ai_voice(self, audio_path: str) -> Dict[str, Any]:
        """Detect if audio is AI-generated voice.
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Dictionary with AI voice detection results
        """
        if not settings.HUGGINGFACE_API_KEY:
            return self._get_fallback_ai_voice_detection(audio_path)
        
        try:
            # Read audio as binary
            with open(audio_path, "rb") as f:
                audio_data = f.read()
            
            headers = {
                "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"
            }
            
            # Retry logic for model loading
            for attempt in range(self.max_retries):
                try:
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        response = await client.post(
                            self.huggingface_api_url,
                            headers=headers,
                            content=audio_data
                        )
                        
                        if response.status_code == 503:
                            if attempt < self.max_retries - 1:
                                print(f"Model loading, waiting {self.retry_delay}s...")
                                await asyncio.sleep(self.retry_delay)
                                continue
                            else:
                                return self._get_fallback_ai_voice_detection(audio_path)
                        
                        if response.status_code == 200:
                            data = response.json()
                            
                            # Parse response
                            ai_score = 0
                            for item in data:
                                label = item.get("label", "").lower()
                                if "fake" in label or "ai" in label or "synthetic" in label:
                                    ai_score = item.get("score", 0)
                                    break
                            
                            ai_probability = ai_score * 100
                            prediction = "AI_GENERATED" if ai_probability > 50 else "REAL_HUMAN"
                            
                            return {
                                "ai_voice_probability": round(ai_probability, 2),
                                "prediction": prediction,
                                "confidence": round(ai_score, 3),
                                "model_used": "audio-deepfake-detection"
                            }
                        
                except httpx.TimeoutException:
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(5)
                        continue
                    return self._get_fallback_ai_voice_detection(audio_path)
            
            return self._get_fallback_ai_voice_detection(audio_path)
            
        except Exception as e:
            print(f"AI voice detection error: {e}")
            return self._get_fallback_ai_voice_detection(audio_path)
    
    def _get_fallback_ai_voice_detection(self, audio_path: str) -> Dict[str, Any]:
        """Fallback AI voice detection using audio features."""
        try:
            # Load audio
            y, sr = librosa.load(audio_path, sr=22050)
            
            # Analyze spectral features
            spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
            
            # AI voices often have very consistent spectral features
            centroid_std = np.std(spectral_centroid)
            rolloff_std = np.std(spectral_rolloff)
            
            # Low variance = possibly AI
            if centroid_std < 500 and rolloff_std < 1000:
                return {
                    "ai_voice_probability": 65.0,
                    "prediction": "POSSIBLY_AI",
                    "confidence": 0.65,
                    "model_used": "spectral_heuristic"
                }
            
            return {
                "ai_voice_probability": 30.0,
                "prediction": "LIKELY_REAL",
                "confidence": 0.7,
                "model_used": "spectral_heuristic"
            }
            
        except Exception as e:
            print(f"Fallback detection error: {e}")
            return {
                "ai_voice_probability": 50.0,
                "prediction": "UNKNOWN",
                "confidence": 0.0,
                "model_used": "fallback"
            }
    
    def generate_spectrogram(self, audio_path: str, output_path: Optional[str] = None) -> Dict[str, Any]:
        """Generate mel spectrogram visualization.
        
        Args:
            audio_path: Path to audio file
            output_path: Optional output path for spectrogram image
            
        Returns:
            Dictionary with spectrogram info
        """
        try:
            # Load audio
            y, sr = librosa.load(audio_path, sr=22050)
            
            # Generate mel spectrogram
            S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
            S_dB = librosa.power_to_db(S, ref=np.max)
            
            # Create figure
            plt.figure(figsize=(10, 4))
            librosa.display.specshow(S_dB, sr=sr, x_axis='time', y_axis='mel', cmap='viridis')
            plt.colorbar(format='%+2.0f dB')
            plt.title('Mel Spectrogram Analysis')
            plt.xlabel('Time (s)')
            plt.ylabel('Frequency (Hz)')
            plt.tight_layout()
            
            # Save
            if output_path is None:
                output_dir = Path("truthlens-backend/outputs")
                output_dir.mkdir(parents=True, exist_ok=True)
                output_path = str(output_dir / f"spectrogram_{Path(audio_path).stem}.png")
            
            plt.savefig(output_path, dpi=100, bbox_inches='tight')
            plt.close()
            
            duration = librosa.get_duration(y=y, sr=sr)
            
            return {
                "spectrogram_image_path": output_path,
                "duration": round(duration, 2),
                "sample_rate": sr
            }
            
        except Exception as e:
            print(f"Spectrogram generation error: {e}")
            return {
                "spectrogram_image_path": None,
                "duration": 0,
                "sample_rate": 0,
                "error": str(e)
            }
    
    def generate_waveform(self, audio_path: str, output_path: Optional[str] = None) -> Dict[str, Any]:
        """Generate waveform visualization.
        
        Args:
            audio_path: Path to audio file
            output_path: Optional output path
            
        Returns:
            Dictionary with waveform info
        """
        try:
            # Load audio
            y, sr = librosa.load(audio_path, sr=22050)
            
            # Create figure
            plt.figure(figsize=(10, 3))
            librosa.display.waveshow(y, sr=sr, color='#0D9488')
            plt.title('Audio Waveform')
            plt.xlabel('Time (s)')
            plt.ylabel('Amplitude')
            plt.tight_layout()
            
            # Save
            if output_path is None:
                output_dir = Path("truthlens-backend/outputs")
                output_dir.mkdir(parents=True, exist_ok=True)
                output_path = str(output_dir / f"waveform_{Path(audio_path).stem}.png")
            
            plt.savefig(output_path, dpi=100, bbox_inches='tight')
            plt.close()
            
            return {
                "waveform_image_path": output_path
            }
            
        except Exception as e:
            print(f"Waveform generation error: {e}")
            return {
                "waveform_image_path": None,
                "error": str(e)
            }
    
    def detect_audio_splices(self, audio_path: str) -> Dict[str, Any]:
        """Detect audio splices and edits.
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Dictionary with splice detection results
        """
        try:
            # Load audio
            y, sr = librosa.load(audio_path, sr=22050)
            
            # Calculate RMS energy
            rms = librosa.feature.rms(y=y)[0]
            
            # Calculate zero-crossing rate
            zcr = librosa.feature.zero_crossing_rate(y)[0]
            
            # Find sudden changes in energy
            rms_diff = np.abs(np.diff(rms))
            energy_threshold = np.mean(rms_diff) + 2 * np.std(rms_diff)
            energy_spikes = np.where(rms_diff > energy_threshold)[0]
            
            # Find sudden changes in zero-crossing rate
            zcr_diff = np.abs(np.diff(zcr))
            zcr_threshold = np.mean(zcr_diff) + 2 * np.std(zcr_diff)
            zcr_spikes = np.where(zcr_diff > zcr_threshold)[0]
            
            # Combine potential splice points
            hop_length = 512
            potential_splices = []
            
            for spike in energy_spikes[:10]:  # Limit to 10
                time_sec = librosa.frames_to_time(spike, sr=sr, hop_length=hop_length)
                potential_splices.append(round(time_sec, 2))
            
            splice_detected = len(potential_splices) > 2
            confidence = min(len(potential_splices) * 15, 100)
            
            notes = f"Detected {len(potential_splices)} potential splice points" if splice_detected else "No obvious splices detected"
            
            return {
                "splice_detected": splice_detected,
                "potential_splice_points": potential_splices[:5],  # Top 5
                "confidence": round(confidence, 2),
                "notes": notes
            }
            
        except Exception as e:
            print(f"Splice detection error: {e}")
            return {
                "splice_detected": False,
                "potential_splice_points": [],
                "confidence": 0,
                "notes": f"Splice detection failed: {str(e)}"
            }
    
    async def analyze_audio_comprehensive(self, audio_path: str, output_dir: Optional[str] = None) -> Dict[str, Any]:
        """Comprehensive audio analysis combining all methods.
        
        Args:
            audio_path: Path to audio file
            output_dir: Optional output directory for generated files
            
        Returns:
            Combined analysis results
        """
        if output_dir is None:
            output_dir = "truthlens-backend/outputs"
        
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Run all analyses
        print("Transcribing audio...")
        transcription = self.transcribe_audio(audio_path)
        
        print("Detecting AI voice...")
        ai_voice = await self.detect_ai_voice(audio_path)
        
        print("Generating spectrogram...")
        spectrogram = self.generate_spectrogram(audio_path)
        
        print("Generating waveform...")
        waveform = self.generate_waveform(audio_path)
        
        print("Detecting splices...")
        splice_detection = self.detect_audio_splices(audio_path)
        
        # Calculate audio integrity score (0-100)
        score = 100
        
        # AI voice probability high → low score
        if ai_voice["ai_voice_probability"] > 70:
            score -= 50
        elif ai_voice["ai_voice_probability"] > 50:
            score -= 30
        
        # Splices detected → lower score
        if splice_detection["splice_detected"]:
            score -= 25
        
        score = max(0, min(100, score))
        
        return {
            "type": "AUDIO",
            "transcription": transcription,
            "ai_voice": ai_voice,
            "spectrogram": {
                "image_url": spectrogram.get("spectrogram_image_path"),
                "notes": "Mel spectrogram shows frequency distribution over time"
            },
            "waveform": {
                "image_url": waveform.get("waveform_image_path")
            },
            "splice_detection": splice_detection,
            "audio_integrity_score": score,
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


# Legacy functions for backward compatibility
async def transcribe_audio(audio_path: str) -> Dict[str, Any]:
    """Transcribe audio using Whisper."""
    service = AudioService()
    return service.transcribe_audio(audio_path)


async def detect_ai_voice(audio_path: str) -> float:
    """Detect AI-generated voice."""
    service = AudioService()
    result = await service.detect_ai_voice(audio_path)
    return result["ai_voice_probability"] / 100


async def analyze_audio(audio_path: str) -> Dict[str, Any]:
    """Comprehensive audio analysis."""
    service = AudioService()
    return await service.analyze_audio_comprehensive(audio_path)
