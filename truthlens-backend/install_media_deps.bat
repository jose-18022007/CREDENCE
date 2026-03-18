@echo off
echo Installing media analysis dependencies...
echo.

pip install openai-whisper==20231117
pip install matplotlib==3.8.2

echo.
echo ✓ Dependencies installed!
echo.
echo You can now restart the backend server.
pause
