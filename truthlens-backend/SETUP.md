# TruthLens Backend - Quick Setup Guide

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

## Installation Steps

### 1. Navigate to backend directory
```bash
cd truthlens-backend
```

### 2. Create virtual environment
```bash
python -m venv venv
```

### 3. Activate virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
- GEMINI_API_KEY (Google Gemini)
- NEWSAPI_KEY (NewsAPI.org)
- GNEWS_API_KEY (GNews.io)
- HUGGINGFACE_API_KEY (Hugging Face)

### 6. Run the server
```bash
uvicorn main:app --reload
```

The API will be available at: `http://localhost:8000`

## Testing the API

### Interactive Documentation
Visit: `http://localhost:8000/docs`

### Test Endpoints

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Analyze Text:**
```bash
curl -X POST http://localhost:8000/api/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Breaking news: Scientists discover cure", "check_bias": true}'
```

## Project Structure

```
truthlens-backend/
├── main.py              # FastAPI entry point
├── config.py            # Configuration
├── models/              # Pydantic schemas
├── routers/             # API endpoints
├── services/            # Business logic
├── database/            # SQLite operations
├── utils/               # Helper functions
├── uploads/             # Uploaded files
└── outputs/             # Generated outputs
```

## Available Endpoints

- POST `/api/analyze/text` - Analyze text content
- POST `/api/analyze/url` - Analyze URL/article
- POST `/api/analyze/image` - Analyze image (multipart/form-data)
- POST `/api/analyze/video` - Analyze video (multipart/form-data)
- POST `/api/analyze/audio` - Analyze audio (multipart/form-data)
- GET `/api/report/{id}` - Get analysis report by ID
- GET `/api/dashboard/stats` - Get dashboard statistics

## Notes

- Database (SQLite) is created automatically on first run
- Upload and output directories are created automatically
- All file uploads are stored temporarily in `uploads/`
- Generated outputs (ELA images, spectrograms) go to `outputs/`
