# Update Gemini API Key - Step by Step

## Problem
Your current API key `AIzaSyDEcxW0khutmUG2WOF70y8AyebQRWZsUdw` has been reported as leaked and disabled by Google.

## Solution: Get a New API Key

### Step 1: Get New API Key
1. Open this link in your browser: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"** button
4. Copy the new API key (it will look like: `AIzaSy...`)

### Step 2: Update .env File
1. Open `truthlens-backend/.env` file
2. Find the line: `GEMINI_API_KEY="AIzaSyDEcxW0khutmUG2WOF70y8AyebQRWZsUdw"`
3. Replace with your NEW key: `GEMINI_API_KEY="your_new_key_here"`
4. Save the file

### Step 3: Restart Backend
The backend will automatically reload when you save the .env file.

If it doesn't restart automatically:
```bash
# Stop the current backend (Ctrl+C in the terminal)
# Then restart:
cd truthlens-backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 4: Test the New Key
Run this test script:
```bash
cd truthlens-backend
python test_gemini.py
```

You should see:
```
✓ Gemini API key is valid
✓ Analysis completed successfully
```

## Quick Test from Frontend
1. Open http://localhost:5173/analyze
2. Paste this text:
   ```
   Breaking news: Scientists discover cure for all diseases!
   ```
3. Click "Analyze Text"
4. You should see real analysis results (not "Analysis unavailable")

## What Changed
- Updated Gemini library from `google.generativeai` to `google.genai` (new official library)
- Better error handling for API key issues
- Clearer error messages

## Still Having Issues?

### Check 1: Is the key correct?
```bash
# In truthlens-backend directory
cat .env | grep GEMINI_API_KEY
```

Should show your NEW key, not the old one.

### Check 2: Is backend running?
```bash
curl http://localhost:8000/health
```

Should return: `{"status":"healthy","service":"TruthLens API"}`

### Check 3: Test API directly
```bash
cd truthlens-backend
python -c "from config import settings; print(f'Key: {settings.GEMINI_API_KEY[:20]}...')"
```

Should show first 20 characters of your NEW key.

## Common Mistakes

❌ **Using the old key** - Make sure you got a NEW key from Google AI Studio
❌ **Not saving .env file** - Save the file after editing
❌ **Backend not restarted** - Backend must reload to pick up new key
❌ **Quotes in .env** - Use: `GEMINI_API_KEY="your_key"` (with quotes)

## Need Help?

If you're still seeing "API key was reported as leaked":
1. Double-check you created a NEW key (not using the old one)
2. Make sure the .env file is saved
3. Restart the backend completely
4. Check backend terminal for any error messages

---

**Next Step**: Get your new API key from https://aistudio.google.com/app/apikey and update the .env file!
