# Video Analysis Implementation Complete

## Summary

Implemented comprehensive video analysis pipeline with keyframe extraction, deepfake detection, audio extraction, and metadata analysis for AI tool detection.

## Features Implemented

### 1. Video Service (`services/video_service.py`)

**VideoService class with 5 main methods**:

1. **extract_video_metadata()**
   - Uses ffprobe to extract video metadata
   - Detects: duration, resolution, codec, bitrate, creation tool
   - AI tool detection for: Runway, Sora, Kling, Pika, Synthesia, Gen-2, Gen-3
   - Flags videos created with AI video generation tools

2. **extract_keyframes()**
   - Uses OpenCV (cv2) to extract representative frames
   - Extracts max 15 evenly-spaced keyframes
   - Resizes frames to 640px width for faster processing
   - Returns frame paths, FPS, duration

3. **detect_deepfake_frames()**
   - Analyzes each keyframe with HuggingFace API
   - Model: `dima806/deepfake_vs_real_face_detection`
   - Returns per-frame results with timestamps
   - Calculates average and max deepfake probability
   - Flags frames with >60% deepfake probability
   - 1-second delay between API calls to avoid rate limiting

4. **extract_audio_track()**
   - Uses ffmpeg to extract audio as WAV
   - Handles videos with no audio gracefully
   - Returns audio path for further analysis

5. **analyze_video_comprehensive()**
   - Orchestrates full pipeline:
     - Metadata extraction + AI tool detection
     - Keyframe extraction (15 frames max)
     - Deepfake detection on all frames
     - Audio extraction
     - Audio analysis (transcription + AI voice detection)
   - Calculates video integrity score (0-100)
   - Returns comprehensive results

### 2. Video Analysis Router (`routers/video_analysis.py`)

**POST /api/analyze/video endpoint**:

- Accepts video uploads (MP4, MOV, AVI, WEBM, max 100MB)
- Toggle options for each analysis type
- Integrates with:
  - Video service for frame/audio/metadata analysis
  - Audio service for voice analysis
  - Gemini for transcript claim analysis
  - Fact-check service for claim verification
  - News service for cross-referencing
- Calculates trust score
- Saves to database
- Returns complete AnalysisResponse

### 3. Frontend Display (`ResultsPage.tsx`)

**Enhanced Media Integrity card**:

- Deepfake Detection with progress bar
- Video-specific details:
  - Frames analyzed count
  - Frames flagged count
  - Max deepfake probability
- Video Metadata display:
  - Duration, resolution, codec
  - Creation tool
  - AI tool detection warning (red alert)
- Audio analysis results (if extracted)
- Transcript display (if available)

## Scoring Algorithm

**Video Integrity Score (0-100)**:

Starting score: 100

Deductions:
- AI tool detected in metadata: -60 points
- High deepfake probability (>70%): -50 points
- Moderate deepfake probability (>50%): -30 points
- AI voice detected (>70%): -30 points
- AI voice moderate (>50%): -15 points

Final score: max(0, min(100, score))

## Dependencies Added

```
opencv-python-headless==4.8.1.78
```

## Requirements

### FFmpeg Installation

Video analysis requires FFmpeg to be installed:

**Windows**:
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

**Linux**:
```bash
sudo apt-get install ffmpeg
```

**Mac**:
```bash
brew install ffmpeg
```

### Python Packages

```bash
pip install opencv-python-headless==4.8.1.78
```

## API Endpoint

```
POST /api/analyze/video
Content-Type: multipart/form-data

Parameters:
- file: Video file (MP4, MOV, AVI, WEBM, max 100MB)
- deepfake_detection: bool = True
- frame_analysis: bool = True
- audio_extraction: bool = True
- metadata_check: bool = True
```

## Response Structure

```json
{
  "analysis_id": "abc-123",
  "overall_trust_score": 25,
  "verdict": "LIKELY_MANIPULATED",
  "summary": "AI tool detected: RUNWAY. Deepfake probability: 87%",
  "media_integrity": {
    "deepfake_probability": 0.87,
    "ai_voice_probability": 0.45,
    "video_metadata": {
      "duration": 154.5,
      "duration_formatted": "2:34",
      "resolution": "1920x1080",
      "codec": "h264",
      "creation_tool": "RunwayML",
      "is_ai_tool_detected": true,
      "ai_tool_name": "RUNWAY"
    },
    "deepfake_frames": {
      "frames_analyzed": 15,
      "frames_flagged": 11,
      "average_deepfake_probability": 87.3,
      "max_deepfake_probability": 96.1,
      "per_frame_results": [...]
    },
    "transcription": "Full transcript...",
    "splice_detection": {...}
  },
  "red_flags": [
    "AI video tool detected: RUNWAY",
    "High deepfake probability (87%)",
    "11 frame(s) flagged as deepfake"
  ]
}
```

## Performance Optimizations

1. **Limited Frame Extraction**: Max 15 keyframes (not all frames)
2. **Frame Resizing**: Resize to 640px width before API calls
3. **Rate Limiting**: 1-second delay between HuggingFace API calls
4. **Timeout Protection**: 60-second timeout for ffmpeg operations
5. **Graceful Degradation**: Continues if audio extraction fails

## AI Tool Detection

Detects these AI video generation tools in metadata:
- Runway (Gen-2, Gen-3)
- OpenAI Sora
- Kling AI
- Pika Labs
- Synthesia

Detection checks:
- Encoder field
- Handler name
- Comment field
- Creation tool field

## Testing

### Test Video Analysis

1. **Upload a video** in the frontend (Analyze → Video tab)

2. **Watch backend console** for:
   ```
   📹 Extracting video metadata...
   ✅ Metadata extracted: 2:34, 1920x1080, codec=h264
   🎬 Extracting keyframes (max 15)...
   ✅ Extracted 15 keyframes
   🔍 Analyzing 15 frames for deepfakes...
   ✅ Deepfake analysis complete: avg=45.2%, max=78.3%
   🎵 Extracting audio track...
   ✅ Audio extracted
   ```

3. **Check results** in frontend:
   - Deepfake probability with frame details
   - Video metadata with AI tool warning
   - Audio transcription (if available)
   - Trust score

### Test Different Video Types

**Real Video** (phone/camera):
- Expected: 5-25% deepfake probability
- Metadata: Camera info present
- Score: 70-90

**AI-Generated Video** (Runway, Sora):
- Expected: AI tool detected in metadata
- Deepfake: May be high or low (depends on quality)
- Score: 10-40

**Deepfake Video**:
- Expected: 70-95% deepfake probability
- Multiple frames flagged
- Score: 10-30

## Error Handling

### FFmpeg Not Installed

If ffmpeg/ffprobe not found:
```
❌ ffprobe not found - install FFmpeg
❌ ffmpeg not found - install FFmpeg
```

Returns partial results with error message.

### No Audio Track

If video has no audio:
```
ℹ️ Video has no audio track
```

Continues with video-only analysis.

### HuggingFace API Failure

If deepfake detection API fails:
```
⚠️ Using fallback deepfake detection
```

Returns 50% probability with note.

## Files Modified/Created

1. ✅ `services/video_service.py` - Complete implementation
2. ✅ `routers/video_analysis.py` - Complete rewrite
3. ✅ `models/schemas.py` - Added video fields to MediaIntegrity
4. ✅ `requirements.txt` - Added opencv-python-headless
5. ✅ `Frontend/src/services/api.ts` - Added video types
6. ✅ `Frontend/src/app/pages/ResultsPage.tsx` - Added video display
7. ✅ `VIDEO_ANALYSIS_COMPLETE.md` - This document

## Status

- ✅ Video metadata extraction
- ✅ Keyframe extraction (OpenCV)
- ✅ Deepfake detection (HuggingFace)
- ✅ Audio extraction (ffmpeg)
- ✅ Audio analysis integration
- ✅ AI tool detection
- ✅ Trust score calculation
- ✅ Frontend display
- ✅ Database persistence
- ⏳ FFmpeg installation (user must install)
- ⏳ Testing with real videos

## Next Steps

1. **Install FFmpeg**:
   ```bash
   # Windows (Chocolatey)
   choco install ffmpeg
   
   # Or download from https://ffmpeg.org/download.html
   ```

2. **Install OpenCV**:
   ```bash
   cd truthlens-backend
   pip install opencv-python-headless==4.8.1.78
   ```

3. **Restart backend** server

4. **Test video upload**:
   - Upload a short video (< 100MB)
   - Watch console logs
   - Check results in frontend

## Complete Media Analysis Pipeline

Now all media types are supported:

- ✅ **Text Analysis**: Gemini + fact-checks + web search
- ✅ **URL Analysis**: Scraping + domain check + content analysis
- ✅ **Image Analysis**: AI detection + EXIF + ELA + OCR
- ✅ **Audio Analysis**: Whisper + AI voice + spectrogram + splice detection
- ✅ **Video Analysis**: Keyframes + deepfake + audio + metadata

All integrated with:
- Gemini AI for content analysis
- Fact-check APIs for verification
- News APIs for cross-referencing
- HuggingFace models for media integrity
- Comprehensive scoring algorithm

The Credence platform is now feature-complete for hackathon demo!
