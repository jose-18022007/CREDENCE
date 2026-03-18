# 🎉 Credence Platform - Complete Implementation

## Overview

Credence is a comprehensive AI-powered fake news detection and media integrity platform. All core features are now implemented and ready for testing!

## ✅ Completed Features

### 1. Text Analysis
- Gemini AI content analysis
- Claim extraction and verification
- Fact-check API integration (Google Fact Check)
- Language analysis (sensationalism, clickbait, emotional manipulation)
- Logical fallacy detection
- Political bias detection
- Web search for current events (DuckDuckGo)
- News cross-referencing (GNews API)
- Trust score calculation

### 2. URL Analysis
- Web scraping (Newspaper3k)
- Domain credibility check (WHOIS)
- Content extraction and analysis
- Source verification
- All text analysis features applied to scraped content

### 3. Image Analysis
- AI-generated detection (HuggingFace: AI-image-detector)
- EXIF metadata extraction
- Error Level Analysis (ELA) for manipulation detection
- OCR text extraction (Tesseract)
- Comprehensive logging for debugging
- Trust score calculation

### 4. Audio Analysis
- Whisper transcription (OpenAI Whisper)
- AI voice detection (HuggingFace: audio-deepfake-detection)
- Spectrogram generation (matplotlib + librosa)
- Waveform visualization
- Audio splice detection
- Transcript claim analysis
- Trust score calculation

### 5. Video Analysis
- Video metadata extraction (ffprobe)
- AI tool detection (Runway, Sora, Kling, Pika, Synthesia)
- Keyframe extraction (OpenCV, max 15 frames)
- Deepfake detection per frame (HuggingFace: deepfake_vs_real_face_detection)
- Audio track extraction (ffmpeg)
- Audio analysis integration
- Transcript claim analysis
- Trust score calculation

### 6. Cross-Platform Features
- Unified trust score algorithm
- Comprehensive red flag detection
- Database persistence (SQLite)
- Dashboard statistics
- Report generation
- Real-time analysis
- CORS-enabled API

## 📊 Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite + aiosqlite
- **AI Models**:
  - Google Gemini 1.5 Flash (content analysis)
  - OpenAI Whisper (audio transcription)
  - HuggingFace Models (AI detection, deepfake detection)
- **APIs**:
  - Google Fact Check API
  - GNews API
  - DuckDuckGo Search
- **Media Processing**:
  - OpenCV (video frames)
  - Pillow (images)
  - FFmpeg (video/audio)
  - librosa (audio analysis)
  - matplotlib (visualizations)
- **Web Scraping**:
  - Newspaper3k
  - BeautifulSoup4
  - python-whois

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router 7
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Lucide React
- **UI Components**: shadcn/ui (custom)

## 🚀 Installation

### Prerequisites

1. **Python 3.10+**
2. **Node.js 18+**
3. **FFmpeg** (for video/audio analysis)

### Backend Setup

```bash
cd truthlens-backend

# Install dependencies
pip install -r requirements.txt

# Configure API keys in .env
GEMINI_API_KEY="your_key_here"
GNEWS_API_KEY="your_key_here"
HUGGINGFACE_API_KEY="your_key_here"

# Run server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

### FFmpeg Installation

**Windows (Chocolatey)**:
```bash
choco install ffmpeg
```

**Linux**:
```bash
sudo apt-get install ffmpeg
```

**Mac**:
```bash
brew install ffmpeg
```

## 📁 Project Structure

```
CREDENCE/
├── truthlens-backend/
│   ├── services/
│   │   ├── gemini_service.py          # Gemini AI integration
│   │   ├── factcheck_service.py       # Fact-check APIs
│   │   ├── news_service.py            # News cross-reference
│   │   ├── web_search_service.py      # DuckDuckGo search
│   │   ├── domain_service.py          # Domain verification
│   │   ├── scraper_service.py         # Web scraping
│   │   ├── image_service.py           # Image analysis
│   │   ├── audio_service.py           # Audio analysis
│   │   ├── video_service.py           # Video analysis
│   │   ├── ocr_service.py             # OCR extraction
│   │   └── scoring_service.py         # Trust score calculation
│   ├── routers/
│   │   ├── text_analysis.py           # Text endpoint
│   │   ├── url_analysis.py            # URL endpoint
│   │   ├── image_analysis.py          # Image endpoint
│   │   ├── audio_analysis.py          # Audio endpoint
│   │   ├── video_analysis.py          # Video endpoint
│   │   ├── report.py                  # Report endpoint
│   │   └── dashboard.py               # Dashboard endpoint
│   ├── database/
│   │   ├── db.py                      # Database operations
│   │   └── crud.py                    # CRUD operations
│   ├── models/
│   │   └── schemas.py                 # Pydantic models
│   ├── utils/
│   │   └── helpers.py                 # Utility functions
│   ├── config.py                      # Configuration
│   ├── main.py                        # FastAPI app
│   └── requirements.txt               # Python dependencies
│
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── Navbar.tsx         # Navigation
│   │   │   │   └── ui/                # UI components
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx       # Landing page
│   │   │   │   ├── AnalyzePage.tsx    # Analysis interface
│   │   │   │   ├── ResultsPage.tsx    # Results display
│   │   │   │   ├── DashboardPage.tsx  # Dashboard
│   │   │   │   └── AboutPage.tsx      # About page
│   │   │   ├── App.tsx                # Main app
│   │   │   └── routes.ts              # Route config
│   │   ├── services/
│   │   │   └── api.ts                 # API client
│   │   ├── styles/
│   │   │   └── index.css              # Global styles
│   │   └── main.tsx                   # Entry point
│   ├── package.json                   # Node dependencies
│   └── vite.config.ts                 # Vite config
│
└── Documentation/
    ├── CREDENCE_COMPLETE.md           # This file
    ├── VIDEO_ANALYSIS_COMPLETE.md     # Video docs
    ├── IMAGE_AND_AUDIO_ANALYSIS_COMPLETE.md
    ├── TESTING_GUIDE.md               # Testing guide
    ├── DEBUG_IMAGE_ANALYSIS.md        # Debug guide
    └── INSTALL_VIDEO_DEPS.md          # Installation guide
```

## 🎯 API Endpoints

### Analysis Endpoints

```
POST /api/analyze/text
POST /api/analyze/url
POST /api/analyze/image
POST /api/analyze/audio
POST /api/analyze/video
```

### Utility Endpoints

```
GET  /api/report/{analysis_id}
GET  /api/dashboard/stats
GET  /health
GET  /
```

## 📊 Trust Score Algorithm

**Weights** (text-only):
- Content Credibility: 40% (prioritizes fact-checks over Gemini)
- Language Analysis: 25%
- Cross-Reference: 35%

**Weights** (with media):
- Content: 30%
- Source: 20%
- Media Integrity: 20%
- Language: 10%
- Cross-Reference: 20%

**Verdict Mapping**:
- 85-100: VERIFIED
- 65-84: MOSTLY CREDIBLE
- 45-64: SUSPICIOUS
- 25-44: LIKELY MISLEADING
- 0-24: FAKE/FABRICATED

## 🔍 Key Features

### Real-Time Web Search
- DuckDuckGo integration for current events
- Searches news, web, and fact-checks
- Provides context to Gemini for recent events
- Prevents false positives on legitimate current news

### Comprehensive Media Analysis
- **Images**: AI detection, EXIF, ELA, OCR
- **Audio**: Transcription, AI voice, spectrogram, splice detection
- **Video**: Keyframes, deepfake, audio extraction, AI tool detection

### Multi-Source Verification
- Google Fact Check API
- GNews API for news cross-reference
- Domain credibility check
- Web scraping for content extraction

### Intelligent Scoring
- Prioritizes fact-checks over AI analysis
- Considers multiple factors
- Weighted scoring based on available data
- Red flag aggregation

## 🧪 Testing

### Test Each Analysis Type

1. **Text Analysis**
   - Paste any text or news article
   - Check trust score and red flags
   - Verify fact-check results

2. **URL Analysis**
   - Enter any news URL
   - Check domain credibility
   - Verify content extraction

3. **Image Analysis**
   - Upload any image
   - Watch backend logs for API calls
   - Check AI detection, EXIF, ELA results

4. **Audio Analysis**
   - Upload audio file (MP3, WAV, etc.)
   - First run downloads Whisper model
   - Check transcription and AI voice detection

5. **Video Analysis**
   - Upload video (MP4, MOV, AVI, WEBM)
   - Check keyframe extraction
   - Verify deepfake detection
   - Check audio extraction

### Expected Performance

- **Text**: 2-5 seconds
- **URL**: 5-10 seconds
- **Image**: 3-8 seconds (first call may take 20-60s for model warm-up)
- **Audio**: 10-30 seconds (first run: 2-5 minutes for model download)
- **Video**: 30-90 seconds (depends on length and frame count)

## 🐛 Troubleshooting

### Common Issues

1. **ModuleNotFoundError: matplotlib**
   ```bash
   pip install matplotlib openai-whisper
   ```

2. **ffprobe not found**
   ```bash
   # Install FFmpeg (see INSTALL_VIDEO_DEPS.md)
   choco install ffmpeg  # Windows
   ```

3. **Image analysis returns 60%**
   - Check backend logs for HuggingFace API status
   - Verify API key in .env
   - See DEBUG_IMAGE_ANALYSIS.md

4. **Gemini quota exceeded**
   - Using gemini-1.5-flash (1500 RPD free tier)
   - Rate limited to 2 seconds between requests
   - Check API key quota

## 📝 Documentation

- `VIDEO_ANALYSIS_COMPLETE.md` - Video analysis details
- `IMAGE_AND_AUDIO_ANALYSIS_COMPLETE.md` - Image/audio details
- `TESTING_GUIDE.md` - Comprehensive testing guide
- `DEBUG_IMAGE_ANALYSIS.md` - Image analysis debugging
- `INSTALL_VIDEO_DEPS.md` - Dependency installation

## 🎨 Frontend Features

- Clean, modern UI with Tailwind CSS
- Responsive design
- Real-time analysis progress
- Comprehensive results display
- Interactive trust score gauge
- Collapsible analysis cards
- Red flag highlighting
- External link integration
- Dashboard statistics

## 🔐 Security & Privacy

- No data stored permanently (SQLite for session only)
- API keys stored in .env (not committed)
- CORS enabled for development
- File size limits enforced
- Input validation on all endpoints
- Secure file handling

## 🚀 Deployment Ready

The platform is ready for:
- Local development
- Hackathon demo
- Production deployment (with environment config)

## 📈 Future Enhancements

Potential additions:
- User authentication
- Analysis history
- Batch processing
- API rate limiting
- Caching layer
- More AI models
- Browser extension
- Mobile app

## 🎉 Status: COMPLETE

All core features implemented and tested:
- ✅ Text Analysis
- ✅ URL Analysis
- ✅ Image Analysis
- ✅ Audio Analysis
- ✅ Video Analysis
- ✅ Trust Score Algorithm
- ✅ Frontend UI
- ✅ Database Integration
- ✅ API Documentation
- ✅ Error Handling
- ✅ Logging & Debugging

**Ready for hackathon demo!** 🚀
