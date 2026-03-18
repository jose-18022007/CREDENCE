#!/bin/bash

echo "=================================="
echo "TruthLens Backend Quick Start"
echo "=================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your GEMINI_API_KEY"
    echo "   Get free key at: https://makersuite.google.com/app/apikey"
    echo ""
    read -p "Press Enter after adding your API key to .env..."
fi

# Test Gemini service
echo ""
echo "🧪 Testing Gemini analysis engine..."
python test_gemini.py

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "To start the server:"
echo "  uvicorn main:app --reload"
echo ""
echo "Then visit:"
echo "  API Docs: http://localhost:8000/docs"
echo "  Health Check: http://localhost:8000/health"
echo ""
