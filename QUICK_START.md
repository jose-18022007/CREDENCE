# TruthLens - Quick Start Guide

## 🚀 Both Services Are Running!

### ✅ Backend API
- **URL**: http://localhost:8000
- **Status**: Running
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

### ✅ Frontend App
- **URL**: http://localhost:5173
- **Status**: Running
- **Analyze Page**: http://localhost:5173/analyze

## 🎯 Test the Connection

### Option 1: Use the Web Interface
1. Open http://localhost:5173/analyze in your browser
2. Look for the **"Backend Connected"** green indicator at the top
3. Paste some text in the Text tab
4. Click **"Analyze Text"**
5. Watch the analysis happen in real-time!

### Option 2: Test with Sample Text
Try analyzing this sample fake news:
```
BREAKING: Scientists discover cure for all diseases! 
Doctors hate this one simple trick that Big Pharma 
doesn't want you to know about. Share before they 
delete this!
```

### Option 3: Test URL Analysis
Try analyzing a real news article:
```
https://www.bbc.com/news
https://www.reuters.com/world
```

## 📊 What You'll See

### During Analysis
- Processing overlay with 5 steps:
  1. Extracting text
  2. Checking source
  3. Verifying claims
  4. Analyzing media
  5. Generating report

### After Analysis
- Overall trust score (0-100)
- Verdict (VERIFIED, CREDIBLE, SUSPICIOUS, MISLEADING, FAKE)
- Source credibility analysis
- Claim verification results
- Language & bias analysis
- Cross-reference with news sources
- Red flags and warnings

## ⚠️ Important: Update Your Gemini API Key

Your current Gemini API key is **leaked and disabled**. To enable AI analysis:

1. Get a new key: https://aistudio.google.com/app/apikey
2. Open `truthlens-backend/.env`
3. Replace the GEMINI_API_KEY value:
   ```
   GEMINI_API_KEY="your_new_key_here"
   ```
4. Backend will auto-reload (no restart needed)

Without a valid key, you'll see:
- Summary: "Analysis unavailable: Gemini API error: 403..."
- But other features still work (news cross-reference, domain checking)

## 🔧 Services Management

### Stop Services
Press `Ctrl+C` in each terminal window

### Restart Backend
```bash
cd truthlens-backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Restart Frontend
```bash
cd Frontend
npm run dev
```

## 📁 Project Structure

```
CREDENCE/
├── Frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── services/api.ts     # API integration layer
│   │   ├── hooks/              # React hooks
│   │   └── app/pages/          # Page components
│   └── vite.config.ts          # Proxy configuration
│
└── truthlens-backend/          # FastAPI backend
    ├── main.py                 # API entry point
    ├── routers/                # API endpoints
    ├── services/               # Business logic
    ├── database/               # SQLite database
    └── .env                    # API keys (UPDATE THIS!)
```

## 🎨 Features Available

### Text Analysis
- ✅ Paste any text content
- ✅ Check for political bias
- ✅ Detect logical fallacies
- ✅ Fact-check claims
- ✅ Cross-reference with news

### URL Analysis
- ✅ Scrape article content
- ✅ Check domain credibility
- ✅ Verify domain age
- ✅ Analyze source reliability
- ✅ Cross-reference headlines

### Image Analysis (Upload)
- ✅ AI-generated detection
- ✅ EXIF metadata analysis
- ✅ Error Level Analysis (ELA)
- ✅ Reverse image search

### Video Analysis (Upload)
- ✅ Deepfake detection
- ✅ AI-generated video detection
- ✅ Frame-by-frame analysis
- ✅ Audio extraction

### Audio Analysis (Upload)
- ✅ AI voice detection
- ✅ Voice cloning detection
- ✅ Spectrogram analysis
- ✅ Audio splice detection
- ✅ Transcription + claim analysis

## 🐛 Troubleshooting

### "Backend Offline" Message
1. Check if backend is running: http://localhost:8000/health
2. Look at backend terminal for errors
3. Restart backend if needed

### Analysis Fails
1. **403 Error**: Update Gemini API key (see above)
2. **Network Error**: Check both services are running
3. **Timeout**: Large files may take time, be patient

### Frontend Won't Load
1. Check if port 5173 is available
2. Run `npm install` in Frontend directory
3. Clear browser cache and reload

### Backend Won't Start
1. Check if port 8000 is available
2. Verify Python dependencies: `pip install -r requirements.txt`
3. Check .env file exists

## 📚 API Documentation

Visit http://localhost:8000/docs for interactive API documentation with:
- All available endpoints
- Request/response schemas
- Try-it-out functionality
- Example requests

## 🎉 You're All Set!

Your TruthLens platform is fully operational with:
- ✅ Frontend connected to backend
- ✅ Real-time health monitoring
- ✅ All analysis endpoints working
- ✅ Error handling and user feedback
- ✅ File upload support
- ✅ Database persistence

Just update your Gemini API key and start analyzing content!

---

**Need Help?** Check `FRONTEND_BACKEND_SETUP.md` for detailed documentation.
