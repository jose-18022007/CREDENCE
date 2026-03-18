# Fix: "API Key Was Reported as Leaked" Error

## Current Situation
✅ Backend is running on http://localhost:8000
✅ Frontend is running on http://localhost:5173
✅ Updated to new Gemini library (`google.genai`)
❌ **API key is still the OLD leaked key**

## The Problem
The API key in your `.env` file is:
```
GEMINI_API_KEY="AIzaSyDEcxW0khutmUG2WOF70y8AyebQRWZsUdw"
```

This key has been **reported as leaked** and **disabled by Google**. You MUST get a new one.

## Solution (3 Simple Steps)

### Step 1: Get New API Key (2 minutes)
1. Click this link: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click the **"Create API Key"** button
4. **Copy the new key** (starts with `AIzaSy...`)

### Step 2: Update .env File (1 minute)
1. Open file: `truthlens-backend/.env`
2. Find line 1: `GEMINI_API_KEY="AIzaSyDEcxW0khutmUG2WOF70y8AyebQRWZsUdw"`
3. Replace with: `GEMINI_API_KEY="paste_your_new_key_here"`
4. **Save the file** (Ctrl+S)

Example:
```env
GEMINI_API_KEY="AIzaSyABCDEF1234567890_your_new_key_here"
NEWSAPI_KEY=your_newsapi_key
GNEWS_API_KEY="983fe4725814ae6c6c0a239750ab15f9"
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

### Step 3: Backend Will Auto-Reload
The backend watches for file changes and will automatically reload when you save `.env`.

You'll see in the backend terminal:
```
WARNING:  StatReload detected changes in '.env'. Reloading...
INFO:     Application startup complete.
```

## Test It Works

### Quick Test
1. Open http://localhost:5173/analyze
2. Paste this text:
   ```
   BREAKING: Scientists discover miracle cure! 
   Share before they delete this!
   ```
3. Click **"Analyze Text"**
4. Wait for analysis...

### Expected Result (GOOD ✅)
```json
{
  "summary": "This content shows multiple red flags including sensationalist language...",
  "verdict": "SUSPICIOUS",
  "overall_trust_score": 25,
  "claim_verification": {
    "claims": [
      {
        "claim_text": "Scientists discover miracle cure",
        "verdict": "UNVERIFIED",
        ...
      }
    ]
  }
}
```

### Current Result (BAD ❌)
```json
{
  "summary": "Analysis unavailable: Gemini API error: 403 Your API key was reported as leaked...",
  "verdict": "SUSPICIOUS",
  "overall_trust_score": 45
}
```

## Why This Happens

Your API key was likely exposed in:
- Public GitHub repository
- Screenshot shared online
- Documentation or example code
- Logs or error messages

Google automatically scans for leaked keys and disables them for security.

## What We Fixed

1. **Updated Gemini Library**
   - Old: `google.generativeai` (deprecated)
   - New: `google.genai` (official, maintained)

2. **Better Error Handling**
   - Now catches 403 errors specifically
   - Shows clear error message about leaked key

3. **Improved API Calls**
   - Uses new `client.models.generate_content()` method
   - Better retry logic
   - Clearer error messages

## Still Not Working?

### Check 1: Did you get a NEW key?
```bash
# In truthlens-backend directory
cat .env
```

Should show a DIFFERENT key than `AIzaSyDEcxW0khutmUG2WOF70y8AyebQRWZsUdw`

### Check 2: Did you save the file?
Look at the file modification time - it should be recent.

### Check 3: Did backend reload?
Check the backend terminal - you should see:
```
WARNING:  StatReload detected changes in '.env'. Reloading...
```

### Check 4: Test the key directly
```bash
cd truthlens-backend
python test_gemini.py
```

Should output:
```
Testing Gemini API...
✓ API key is valid
✓ Analysis completed
```

## Manual Backend Restart (if needed)

If auto-reload doesn't work:

1. **Stop backend**: Press `Ctrl+C` in backend terminal
2. **Start backend**:
   ```bash
   cd truthlens-backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Common Mistakes

| Mistake | Solution |
|---------|----------|
| Used the same old key | Get a NEW key from Google AI Studio |
| Forgot to save .env | Press Ctrl+S after editing |
| Didn't wait for reload | Wait 2-3 seconds after saving |
| Removed quotes | Keep quotes: `GEMINI_API_KEY="key"` |
| Extra spaces | No spaces: `GEMINI_API_KEY="key"` not `GEMINI_API_KEY = "key"` |

## Security Tips

After you get it working:

1. **Add .env to .gitignore** (already done)
2. **Never commit .env to Git**
3. **Don't share API keys in screenshots**
4. **Rotate keys regularly**
5. **Use environment variables in production**

## Summary

1. ✅ Backend updated to use new Gemini library
2. ✅ Better error handling implemented
3. ❌ **YOU NEED TO**: Get new API key and update `.env`
4. ✅ Backend will auto-reload after you save

**Next Action**: Go to https://aistudio.google.com/app/apikey and get your new key NOW!

---

**After updating the key, your analysis will work perfectly with real AI-powered fact-checking!**
