# Testing Guide - Image & Audio Analysis

## Quick Start

### 1. Install Dependencies

```bash
cd truthlens-backend
pip install openai-whisper==20231117 matplotlib==3.8.2
```

Or use the installer:
```bash
cd truthlens-backend
install_media_deps.bat
```

### 2. Restart Backend

```bash
cd truthlens-backend
python main.py
```

Watch for:
```
✓ Database initialized
✓ Upload and output directories created
INFO:     Application startup complete.
```

### 3. Start Frontend

```bash
cd Frontend
npm run dev
```

## Testing Image Analysis

### Test 1: Upload Any Image

1. Go to http://localhost:5173/analyze
2. Click "Image Analysis" tab
3. Upload any image (JPG, PNG, WEBP)
4. Click "Analyze Image"

### What to Watch For

**Backend Console** should show:
```
[1/5] OCR extraction: enabled
[2/5] Analyzing extracted text (X words)...
[3/5] Performing image analysis...
🖼️ Starting comprehensive image analysis for: ...
🔍 Calling HuggingFace AI detector API...
📡 HuggingFace API response: 200
✅ HuggingFace API response: [{"label": "artificial", "score": 0.XX}, ...]
✅ AI Detection Result: {'ai_generated_probability': XX.X, ...}
📊 AI Detection: XX.X%
📊 EXIF: True/False, flags: [...]
📊 ELA: manipulation=True/False
✅ Media Integrity Score: XX/100
[4/5] Building response...
[5/5] Calculating trust score...
```

**Frontend** should display:
- Trust score gauge
- AI-Generated Detection progress bar (actual %, NOT 60%)
- EXIF Metadata section
- ELA Result image link
- Red flags if detected

### Test 2: Different Image Types

Try these to see different results:

**AI-Generated Image** (from MidJourney, DALL-E):
- Expected: 70-95% AI probability
- EXIF: Metadata stripped
- Score: 10-40

**Real Photo** (from phone/camera):
- Expected: 5-25% AI probability
- EXIF: Camera make/model present
- Score: 80-95

**Edited Photo** (Photoshop):
- Expected: 20-50% AI probability
- EXIF: Shows editing software
- ELA: May show manipulation
- Score: 30-60

### Test 3: Run Test Script

```bash
cd truthlens-backend
python test_image_analysis.py
```

This creates a test image and runs all analysis steps with detailed output.

## Testing Audio Analysis

### Test 1: Upload Audio File

1. Go to http://localhost:5173/analyze
2. Click "Audio Analysis" tab
3. Upload audio file (MP3, WAV, M4A, OGG, FLAC)
4. Click "Analyze Audio"

### What to Watch For

**Backend Console** (first run):
```
Loading Whisper model (first time only)...
[Downloading model... ~140MB]
[1/4] Performing audio analysis...
Transcribing audio...
Detecting AI voice...
Generating spectrogram...
[2/4] Analyzing transcript...
[3/4] Building response...
[4/4] Calculating trust score...
```

**Subsequent runs** (model cached):
```
[1/4] Performing audio analysis...
Transcribing audio...
[Using cached Whisper model]
```

**Frontend** should display:
- Trust score gauge
- AI Voice Detection progress bar
- Audio Transcription text (scrollable)
- Spectrogram image link
- Splice Detection results
- Claims extracted from transcript
- Fact-check results
- News cross-references

### Test 2: Different Audio Types

**Human Voice Recording**:
- Expected: 5-25% AI voice probability
- Transcription: Accurate text
- Splices: None or minimal
- Score: 70-90

**AI-Generated Voice** (ElevenLabs, etc.):
- Expected: 70-95% AI voice probability
- Transcription: May be perfect (too perfect)
- Splices: Possible at sentence boundaries
- Score: 10-40

**Edited Audio**:
- Expected: 30-60% AI voice probability
- Splices: Detected at edit points
- Score: 40-70

## Troubleshooting

### Issue: Still Getting 60% for Images

**Check backend logs for**:
```
⚠️ Using fallback AI detection (HuggingFace API unavailable)
```

**Possible causes**:

1. **Model Cold Start** (503 error)
   - Wait 60 seconds
   - Try again - model should warm up

2. **Invalid API Key** (401 error)
   - Check `.env`: `HUGGINGFACE_API_KEY="hf_..."`
   - Get new key: https://huggingface.co/settings/tokens

3. **Network Timeout**
   - Check internet connection
   - Try again in a few minutes

4. **Model Down**
   - Check: https://huggingface.co/umm-maybe/AI-image-detector
   - Try alternative model

### Issue: Audio Analysis Fails

**Error: "No module named 'whisper'"**
```bash
pip install openai-whisper==20231117
```

**Error: "No module named 'matplotlib'"**
```bash
pip install matplotlib==3.8.2
```

**Error: "Model loading takes forever"**
- First run downloads ~140MB Whisper model
- Wait 2-5 minutes
- Model is cached for subsequent runs

**Error: "matplotlib backend error"**
- Already fixed - using 'Agg' backend
- No GUI required

### Issue: Frontend Not Showing Data

**Check**:
1. Browser console (F12) for errors
2. Network tab - check API response
3. Backend logs - verify data is being sent

**Common fixes**:
- Clear browser cache
- Restart frontend dev server
- Check CORS settings

## Expected API Responses

### Image Analysis Response

```json
{
  "analysis_id": "abc-123",
  "overall_trust_score": 35,
  "verdict": "SUSPICIOUS",
  "media_integrity": {
    "ai_generated_probability": 0.92,
    "exif_data": {
      "has_metadata": false,
      "warnings": ["Metadata completely stripped"],
      "suspicious_flags": ["METADATA_STRIPPED"]
    },
    "ela_result": "/outputs/ela_abc123.jpg"
  }
}
```

### Audio Analysis Response

```json
{
  "analysis_id": "def-456",
  "overall_trust_score": 45,
  "verdict": "SUSPICIOUS",
  "media_integrity": {
    "ai_voice_probability": 0.78,
    "transcription": "Full transcript here...",
    "spectrogram_url": "/outputs/spectrogram_def456.png",
    "splice_detection": {
      "splice_detected": true,
      "potential_splice_points": [12.3, 34.7],
      "confidence": 65.0,
      "notes": "Unnatural cuts detected"
    }
  }
}
```

## Performance Notes

### Image Analysis
- **Fast**: 2-5 seconds per image
- **First call**: May take 20-60s (HuggingFace model cold start)
- **Subsequent calls**: 2-5 seconds (model warm)

### Audio Analysis
- **First run**: 2-5 minutes (Whisper model download ~140MB)
- **Subsequent runs**: 10-30 seconds depending on audio length
- **Transcription**: ~1 second per minute of audio
- **Spectrogram**: 1-2 seconds

## Success Checklist

### Image Analysis
- [ ] Backend logs show `✅ HuggingFace API response: 200`
- [ ] AI probability varies per image (not always 60%)
- [ ] EXIF data extracted and displayed
- [ ] ELA image generated and viewable
- [ ] Trust score calculated correctly
- [ ] Frontend displays all data

### Audio Analysis
- [ ] Whisper model loads successfully
- [ ] Transcription text appears
- [ ] AI voice detection works
- [ ] Spectrogram image generated
- [ ] Splice detection runs
- [ ] Claims extracted from transcript
- [ ] Trust score calculated
- [ ] Frontend displays all data

## Debug Commands

### Check API Key
```bash
cat truthlens-backend/.env | grep HUGGINGFACE
```

### Test HuggingFace API
```bash
curl -X POST \
  https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector \
  -H "Authorization: Bearer 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" \
  --data-binary "@test_image.jpg"
```

### Run Image Test Script
```bash
cd truthlens-backend
python test_image_analysis.py
```

### Check Installed Packages
```bash
pip list | grep -E "whisper|matplotlib"
```

### View Backend Logs
```bash
cd truthlens-backend
python main.py
# Watch console output when uploading files
```

## What's Working

✅ Image Analysis with comprehensive logging
✅ Audio Analysis with full pipeline
✅ OCR text extraction
✅ AI detection (image + voice)
✅ EXIF metadata extraction
✅ ELA manipulation detection
✅ Whisper transcription
✅ Spectrogram generation
✅ Audio splice detection
✅ Transcript claim analysis
✅ Fact-checking integration
✅ News cross-referencing
✅ Trust score calculation
✅ Frontend display of all data
✅ Database persistence

## Next: Video Analysis

After testing image and audio, video analysis will combine:
- Frame extraction
- Deepfake detection (per frame)
- Audio extraction → audio analysis pipeline
- OCR on frames → text analysis
- Comprehensive scoring

Ready to implement when you are!
