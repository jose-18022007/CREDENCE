# TruthLens Backend API

AI-Powered Fake News Detection & Media Integrity Platform

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your API keys
```

4. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Interactive API docs: `http://localhost:8000/docs`

## Endpoints

- `POST /api/analyze/text` - Analyze text content
- `POST /api/analyze/url` - Analyze URL/article
- `POST /api/analyze/image` - Analyze image file
- `POST /api/analyze/video` - Analyze video file
- `POST /api/analyze/audio` - Analyze audio file
- `GET /api/report/{id}` - Get analysis report
- `GET /api/dashboard/stats` - Get dashboard statistics

## Project Structure

```
truthlens-backend/
├── main.py                 # FastAPI app entry
├── config.py               # Configuration
├── models/                 # Pydantic schemas
├── routers/                # API endpoints
├── services/               # Business logic
├── database/               # Database operations
├── utils/                  # Helper functions
├── uploads/                # Uploaded files
└── outputs/                # Generated outputs
```
