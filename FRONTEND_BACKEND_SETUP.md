# TruthLens Frontend-Backend Integration Guide

## Overview
Your frontend and backend are now fully connected! The frontend will automatically communicate with the backend API running on `http://localhost:8000`.

## Current Status
✅ Backend API running on port 8000
✅ Frontend configured with API service layer
✅ CORS enabled for cross-origin requests
✅ Vite proxy configured for development
✅ Real-time API health monitoring
✅ Error handling and user feedback

## Running Both Services

### 1. Start the Backend (Terminal 1)
```bash
cd truthlens-backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend is already running! You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
✓ Database initialized
✓ Upload and output directories created
INFO:     Application startup complete.
```

### 2. Start the Frontend (Terminal 2)
```bash
cd Frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## Features Implemented

### API Service Layer (`Frontend/src/services/api.ts`)
- `analyzeText()` - Analyze text content
- `analyzeURL()` - Analyze article URLs
- `analyzeImage()` - Analyze images for manipulation
- `analyzeVideo()` - Analyze videos for deepfakes
- `analyzeAudio()` - Analyze audio for AI voice
- `getAnalysisReport()` - Fetch analysis by ID
- `getDashboardStats()` - Get dashboard statistics
- `checkHealth()` - Check backend health

### Frontend Updates
- Real-time backend connection status indicator
- Automatic API health checks every 30 seconds
- Disabled analyze buttons when backend is offline
- Error messages with user-friendly feedback
- Loading states during analysis
- Results stored in sessionStorage for ResultsPage

### Backend Features
- CORS enabled for all origins
- File upload support (images, videos, audio)
- Comprehensive error handling
- Database persistence (SQLite)
- Multiple analysis endpoints

## Testing the Connection

### 1. Check Backend Health
Open your browser and visit:
- http://localhost:8000/health
- http://localhost:8000/docs (Interactive API documentation)

### 2. Test Text Analysis
1. Open http://localhost:5173/analyze
2. You should see "Backend Connected" indicator (green)
3. Paste some text in the Text tab
4. Click "Analyze Text"
5. Watch the processing animation
6. You'll be redirected to results page

### 3. Test URL Analysis
1. Go to URL tab
2. Paste a news article URL (e.g., https://www.bbc.com/news/...)
3. Click "Analyze URL"
4. Backend will scrape, analyze, and return results

## API Endpoints

### Analysis Endpoints
- `POST /api/analyze/text` - Text analysis
- `POST /api/analyze/url` - URL analysis
- `POST /api/analyze/image` - Image analysis (multipart/form-data)
- `POST /api/analyze/video` - Video analysis (multipart/form-data)
- `POST /api/analyze/audio` - Audio analysis (multipart/form-data)

### Utility Endpoints
- `GET /api/report/{analysis_id}` - Get analysis by ID
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /health` - Health check
- `GET /` - API info

## Troubleshooting

### Backend Not Connecting
1. Check if backend is running: `curl http://localhost:8000/health`
2. Check for port conflicts (port 8000 must be free)
3. Verify .env file has valid API keys
4. Check backend terminal for errors

### CORS Errors
- Backend already configured to allow all origins
- If issues persist, check browser console for specific errors

### Analysis Fails
1. **Gemini API Key Issue**: Get a new API key from https://aistudio.google.com/app/apikey
2. **File Upload Issues**: Check file size limits (10MB images, 100MB videos, 50MB audio)
3. **Network Errors**: Ensure both services are running

### Frontend Shows "Backend Offline"
1. Verify backend is running on port 8000
2. Check browser console for network errors
3. Try accessing http://localhost:8000/health directly
4. Restart both services

## Next Steps

### 1. Update Gemini API Key
Your current key is leaked. Get a new one:
1. Visit https://aistudio.google.com/app/apikey
2. Create new API key
3. Update `truthlens-backend/.env`:
   ```
   GEMINI_API_KEY="your_new_key_here"
   ```
4. Backend will auto-reload

### 2. Test All Features
- Text analysis with bias detection
- URL analysis with domain checking
- Image upload and analysis
- Video upload and analysis
- Audio upload and analysis

### 3. Check Results Page
The results are stored in `sessionStorage` and should display on `/results` page.

## File Structure

```
Frontend/
├── src/
│   ├── services/
│   │   └── api.ts              # API service layer
│   ├── hooks/
│   │   └── useApiHealth.ts     # Health check hook
│   └── app/
│       └── pages/
│           └── AnalyzePage.tsx # Updated with API calls
└── vite.config.ts              # Proxy configuration

truthlens-backend/
├── main.py                     # FastAPI app with CORS
├── config.py                   # Settings (CORS enabled)
├── routers/                    # API endpoints
├── services/                   # Business logic
└── database/                   # SQLite database
```

## Production Deployment Notes

For production deployment:
1. Update `Frontend/src/services/api.ts` to use production backend URL
2. Configure proper CORS origins in `truthlens-backend/config.py`
3. Use environment variables for API URLs
4. Enable HTTPS for both services
5. Add rate limiting and authentication

## Support

If you encounter any issues:
1. Check both terminal outputs for errors
2. Verify all dependencies are installed
3. Ensure ports 5173 and 8000 are available
4. Check browser console for frontend errors
5. Check backend logs for API errors

---

**Status**: ✅ Fully Connected and Ready to Use!
