@echo off
echo ==================================
echo TruthLens Backend Quick Start
echo ==================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Check for .env file
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit .env and add your GEMINI_API_KEY
    echo Get free key at: https://makersuite.google.com/app/apikey
    echo.
    pause
)

REM Test Gemini service
echo.
echo Testing Gemini analysis engine...
python test_gemini.py

echo.
echo ==================================
echo Setup Complete!
echo ==================================
echo.
echo To start the server:
echo   uvicorn main:app --reload
echo.
echo Then visit:
echo   API Docs: http://localhost:8000/docs
echo   Health Check: http://localhost:8000/health
echo.
pause
