# Install FFmpeg Manually (Windows)

## Current Status

✅ **OpenCV**: Already installed (version 4.13.0)
❌ **FFmpeg**: Not installed - needs manual installation

## Why Manual Installation?

Chocolatey requires administrator privileges which we don't have in the current session.

## Manual Installation Steps (5 minutes)

### Step 1: Download FFmpeg

1. Go to: https://www.gyan.dev/ffmpeg/builds/
2. Download: **ffmpeg-release-essentials.zip** (latest version)
   - Or direct link: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
3. Extract the ZIP file to a location like: `C:\ffmpeg`

### Step 2: Add to PATH

1. Open **System Properties**:
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Press Enter

2. Click **Environment Variables** button

3. Under **User variables** (or System variables if you have admin):
   - Find and select **Path**
   - Click **Edit**

4. Click **New** and add:
   ```
   C:\ffmpeg\bin
   ```
   (Adjust path if you extracted to a different location)

5. Click **OK** on all windows

### Step 3: Verify Installation

1. **Close and reopen** your terminal/PowerShell

2. Test FFmpeg:
   ```bash
   ffmpeg -version
   ffprobe -version
   ```

Expected output:
```
ffmpeg version 6.x.x
ffprobe version 6.x.x
```

## Alternative: Portable Installation

If you don't want to modify PATH:

1. Extract FFmpeg to: `truthlens-backend\ffmpeg\`
2. The video service will need to use full path:
   - `truthlens-backend\ffmpeg\bin\ffmpeg.exe`
   - `truthlens-backend\ffmpeg\bin\ffprobe.exe`

## After Installation

Once FFmpeg is installed:

1. **Restart your terminal**
2. **Restart the backend server**:
   ```bash
   cd truthlens-backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Test video analysis**:
   - Go to http://localhost:5173/analyze
   - Click "Video Analysis" tab
   - Upload a video file
   - Watch backend console for:
     ```
     📹 Extracting video metadata...
     ✅ Metadata extracted
     🎬 Extracting keyframes...
     ```

## What Works Without FFmpeg?

Even without FFmpeg, these still work:
- ✅ Text Analysis
- ✅ URL Analysis
- ✅ Image Analysis
- ✅ Audio Analysis (Whisper transcription only, no audio extraction from video)

Only video analysis requires FFmpeg.

## Quick Test

After installing FFmpeg, test it:

```bash
# Test metadata extraction
ffprobe -v quiet -print_format json -show_format test_video.mp4

# Test audio extraction
ffmpeg -i test_video.mp4 -vn -acodec pcm_s16le output.wav
```

## Troubleshooting

### "ffmpeg is not recognized"

- FFmpeg not in PATH
- Restart terminal after adding to PATH
- Check PATH: `echo $env:Path` (PowerShell)

### "Access denied" when adding to PATH

- Use User variables instead of System variables
- Or run PowerShell as Administrator

### Still not working?

Use portable installation:
1. Put ffmpeg in project folder
2. Update video_service.py to use full path
3. Or just skip video analysis for now

## Summary

**Current Status**:
- ✅ Python 3.14 installed
- ✅ All Python packages installed (matplotlib, whisper, opencv)
- ✅ Backend dependencies complete
- ❌ FFmpeg needs manual installation (5 minutes)

**After FFmpeg installation**:
- ✅ All 5 analysis types will work
- ✅ Video metadata extraction
- ✅ Video keyframe extraction
- ✅ Audio extraction from video
- ✅ Complete video analysis pipeline

**Download Link**: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
