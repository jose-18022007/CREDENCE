@echo off
echo Installing video analysis dependencies...
echo.

echo [1/2] Installing OpenCV...
pip install opencv-python-headless==4.8.1.78

echo.
echo [2/2] Checking FFmpeg installation...
ffmpeg -version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ FFmpeg is already installed
) else (
    echo.
    echo ⚠️ FFmpeg is NOT installed!
    echo.
    echo Please install FFmpeg:
    echo   Option 1: choco install ffmpeg
    echo   Option 2: Download from https://ffmpeg.org/download.html
    echo.
)

echo.
echo ✓ Python dependencies installed!
echo.
echo Next steps:
echo 1. Install FFmpeg if not already installed
echo 2. Restart the backend server
echo 3. Test video upload
echo.
pause
