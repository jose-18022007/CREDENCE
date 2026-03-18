# Install Video Analysis Dependencies

## Required Software

### 1. FFmpeg (Required for Video Analysis)

FFmpeg is needed for video metadata extraction and audio extraction.

#### Windows Installation

**Option A: Using Chocolatey** (Recommended)
```bash
choco install ffmpeg
```

**Option B: Manual Installation**
1. Download from: https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add to PATH:
   - Open System Properties → Environment Variables
   - Edit PATH variable
   - Add `C:\ffmpeg\bin`
4. Restart terminal

**Verify Installation**:
```bash
ffmpeg -version
ffprobe -version
```

#### Linux Installation

```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

#### Mac Installation

```bash
brew install ffmpeg
```

### 2. Python Packages

Install OpenCV for video frame extraction:

```bash
cd truthlens-backend
pip install opencv-python-headless==4.8.1.78
```

## Verification

Test that everything is installed:

```bash
# Check FFmpeg
ffmpeg -version
ffprobe -version

# Check Python packages
python -c "import cv2; print('OpenCV:', cv2.__version__)"
```

Expected output:
```
ffmpeg version 6.x.x
ffprobe version 6.x.x
OpenCV: 4.8.1
```

## Restart Backend

After installing dependencies:

```bash
cd truthlens-backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Test Video Analysis

1. Go to http://localhost:5173/analyze
2. Click "Video Analysis" tab
3. Upload a short video (MP4, MOV, AVI, WEBM, max 100MB)
4. Click "Analyze Video"

Watch backend console for:
```
📹 Extracting video metadata...
✅ Metadata extracted: 2:34, 1920x1080, codec=h264
🎬 Extracting keyframes (max 15)...
✅ Extracted 15 keyframes
🔍 Analyzing 15 frames for deepfakes...
```

## Troubleshooting

### Error: "ffprobe not found"

FFmpeg is not installed or not in PATH.

**Fix**:
1. Install FFmpeg (see above)
2. Verify with `ffmpeg -version`
3. Restart terminal and backend

### Error: "No module named 'cv2'"

OpenCV not installed.

**Fix**:
```bash
pip install opencv-python-headless==4.8.1.78
```

### Error: "Failed to open video file"

Video file may be corrupted or unsupported format.

**Fix**:
- Try a different video file
- Ensure format is MP4, MOV, AVI, or WEBM
- Check file size is under 100MB

### Video Analysis Takes Long Time

First run downloads Whisper model (~140MB) for audio transcription.

**Expected times**:
- First run: 2-5 minutes (model download)
- Subsequent runs: 30-60 seconds per video

## Complete Dependency List

All dependencies for full Credence platform:

```bash
# Core
pip install fastapi uvicorn python-dotenv pydantic

# AI & Analysis
pip install google-generativeai

# Web & APIs
pip install requests httpx aiofiles aiosqlite

# Media Processing
pip install Pillow opencv-python-headless
pip install pytesseract  # For OCR
pip install openai-whisper matplotlib  # For audio
pip install librosa soundfile  # For audio spectrograms

# Web Scraping
pip install newspaper3k beautifulsoup4 python-whois

# Search
pip install duckduckgo-search==6.3.5

# Utilities
pip install numpy python-multipart
```

Or install all at once:
```bash
cd truthlens-backend
pip install -r requirements.txt
```

## System Requirements

- **Python**: 3.10 or higher
- **RAM**: 4GB minimum (8GB recommended for video analysis)
- **Disk Space**: 2GB for models and dependencies
- **FFmpeg**: Latest version
- **Internet**: Required for API calls (HuggingFace, Gemini, etc.)

## Ready to Test!

Once all dependencies are installed:

1. ✅ Backend running on http://localhost:8000
2. ✅ Frontend running on http://localhost:5173
3. ✅ FFmpeg installed and in PATH
4. ✅ All Python packages installed

Test all analysis types:
- Text Analysis
- URL Analysis
- Image Analysis
- Audio Analysis
- Video Analysis

All should work without errors!
