# Credence - AI-Powered Media Integrity Platform

**Credence** is a comprehensive fake news and media manipulation detection platform that uses AI and multiple verification APIs to analyze text, URLs, images, video, and audio content for authenticity and credibility.

---

## 🎯 Overview

Credence helps users verify the authenticity of digital content by:
- Detecting fake news and misinformation in text and articles
- Identifying AI-generated images (MidJourney, DALL-E, Stable Diffusion)
- Detecting deepfake videos and AI-generated video content
- Identifying AI-generated voices and audio manipulation
- Cross-referencing claims with fact-check databases
- Analyzing source credibility and domain reputation
- Providing detailed trust scores and comprehensive reports

---

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router 7
- **Styling**: Tailwind CSS + Custom CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Features**:
  - Text analysis with bias and fallacy detection
  - URL/article scraping and verification
  - Image upload with AI detection, EXIF analysis, ELA
  - Video analysis (temporarily hidden in UI)
  - Audio analysis (temporarily hidden in UI)
  - Real-time backend health monitoring
  - Recent analyses history from database
  - Detailed results page with comprehensive reports

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with aiosqlite (async)
- **AI Models**:
  - Google Gemini 1.5 Flash (text analysis, reasoning)
  - HuggingFace Inference API (image/video AI detection)
  - OpenAI Whisper (audio transcription)
- **External APIs**:
  - DuckDuckGo Search (web search for context)
  - Google Fact Check Tools API
  - NewsAPI (news verification)
  - Python-WHOI