# 🚀 Final Setup - Get Credence Running

## Quick Start (5 Minutes)

### Step 1: Install Missing Dependencies

```bash
cd truthlens-backend

# Install matplotlib and whisper (already done if you followed earlier)
pip install matplotlib openai-whisper

# Install OpenCV for video analysis
pip install opencv-python-headless==4.8.1.78
```

Or use the batch file:
```bash
cd truthlens-backend
install_video_deps.bat
```

### Step 2: Install FFmpeg (Required for Video Analysis)

**Windows (Chocolatey)**:
```bash
choco install ffmpeg
```

**Or download manually**: https://ffmpeg.org/download.html

**Verify**:
```bash
ffmpeg -version
ffprobe -version
```

### Step 3: Restart Backend

```bash
cd truthlens-backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Should see:
```
✓ Database initialized
✓ Upload and output directories created
INFO:     Application startup complete.
```

### Step 4: Start Frontend (if not running)

```bash
cd Frontend
npm run dev
```

### Step 5: Test Everything!

Go to http://localhost:5173

Test each analysis type:

1. **Text Analysis** ✅
   - Paste any text
   - Check trust score

2. **URL Analysis** ✅
   - Enter any news URL
   - Check domain credibility

3. **Image Analysis** ✅
   - Upload an image
   - Watch backend logs
   - Check AI detection results

4. **Audio Analysis** ✅
   - Upload audio file
   - First run downloads Whisper model (~140MB, 2-5 min)
   - Check transcription

5. **Video Analysis** ✅
   - Upload video (MP4, MOV, AVI, WEBM)
   - Check keyframe extraction
   - Check deepfake detection

## What to Watch For

### Backend Console Logs

**Image Analysis**:
```
🖼️ Starting comprehensive image analysis...
🔍 Calling HuggingFace AI detector API...
📡 HuggingFace API response: 200
✅ AI Detection Result: {'ai_generated_probability': 92.0, ...}
```

**Audio Analysis**:
```
Loading Whisper model (first time only)...
Transcribing audio...
Detecting AI voice...
Generating spectrogram...
```

**Video Analysis**:
```
📹 Extracting video metadata...
🎬 Extracting keyframes (max 15)...
🔍 Analyzing 15 frames for deepfakes...
🎵 Extracting audio track...
```

### Frontend Results

Check that all data is displayed:
- Trust score gauge
- Verdict badge
- Red flags
- Analysis details
- Media integrity results
- Cross-references

## Troubleshooting

### Issue: "No module named 'matplotlib'"

```bash
pip install matplotlib openai-whisper
```

### Issue: "No module named 'cv2'"

```bash
pip install opencv-python-headless==4.8.1.78
```

### Issue: "ffprobe not found"

Install FFmpeg:
```bash
choco install ffmpeg  # Windows
```

### Issue: Image analysis returns 60%

Check backend logs for:
- `⚠️ Using fallback` → HuggingFace API failed
- `📡 HuggingFace API response: 503` → Model cold start (wait 60s, try again)
- `❌ HuggingFace API authentication failed` → Check API key

See `DEBUG_IMAGE_ANALYSIS.md` for detailed debugging.

### Issue: Backend won't start

Check for:
- Missing dependencies: `pip install -r requirements.txt`
- Port already in use: Kill process on port 8000
- Python version: Requires Python 3.10+

## Verification Checklist

Before demo:

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] FFmpeg installed (`ffmpeg -version` works)
- [ ] All Python packages installed
- [ ] API keys configured in `.env`
- [ ] Text analysis works
- [ ] URL analysis works
- [ ] Image analysis works (not returning 60%)
- [ ] Audio analysis works
- [ ] Video analysis works
- [ ] Results display correctly in frontend
- [ ] No errors in backend console

## API Keys Required

Make sure these are set in `truthlens-backend/.env`:

```env
GEMINI_API_KEY="your_key_here"
GNEWS_API_KEY="your_key_here"
HUGGINGFACE_API_KEY="your_key_here"
```

Get keys from:
- Gemini: https://makersuite.google.com/app/apikey
- GNews: https://gnews.io/
- HuggingFace: https://huggingface.co/settings/tokens

## Performance Notes

**First Run Times**:
- Whisper model download: 2-5 minutes (one-time)
- HuggingFace model warm-up: 20-60 seconds (first call)

**Subsequent Runs**:
- Text: 2-5 seconds
- URL: 5-10 seconds
- Image: 3-8 seconds
- Audio: 10-30 seconds
- Video: 30-90 seconds

## Demo Tips

1. **Prepare test files** before demo:
   - Sample text with claims
   - News article URL
   - Test image (AI-generated vs real)
   - Short audio clip
   - Short video clip (< 1 minute)

2. **Show backend logs** during analysis:
   - Demonstrates real-time processing
   - Shows API calls and results
   - Proves it's not hardcoded

3. **Highlight key features**:
   - Real-time web search for current events
   - Multi-source fact-checking
   - Comprehensive media analysis
   - Trust score algorithm
   - Red flag detection

4. **Have backup plan**:
   - If HuggingFace API is slow, explain cold start
   - If quota exceeded, show fallback behavior
   - Have screenshots of successful analyses

## You're Ready! 🎉

All features implemented:
- ✅ 5 analysis types (text, URL, image, audio, video)
- ✅ AI-powered content analysis
- ✅ Multi-source verification
- ✅ Media integrity detection
- ✅ Trust score algorithm
- ✅ Modern UI
- ✅ Real-time processing

**Go build something amazing!** 🚀
