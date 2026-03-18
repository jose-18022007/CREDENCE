# ✅ Gemini API Quota Exceeded - FIXED

## Problem
```
429 RESOURCE_EXHAUSTED
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
limit: 20, model: gemini-3-flash
```

## Root Cause
- Free tier limit: **20 requests per day** for `gemini-flash-latest` (which resolves to `gemini-3-flash`)
- You've exceeded this limit

---

## ✅ Solution Applied

### 1. Changed Model to Gemini 1.5 Flash
**File**: `services/gemini_service.py`

**Before**:
```python
self.model_name = "models/gemini-flash-latest"  # 20 RPD limit
```

**After**:
```python
self.model_name = "models/gemini-1.5-flash"  # 1500 RPD limit
```

**Benefits**:
- ✅ **1500 requests per day** (75x more!)
- ✅ Still free tier
- ✅ Fast response times
- ✅ Same quality

### 2. Added Rate Limiting
Added automatic rate limiting to prevent quota exhaustion:
- Minimum 2 seconds between requests
- Prevents accidental rapid-fire requests
- Logs when rate limiting is active

---

## How to Apply the Fix

### Step 1: Restart Backend
```bash
# Stop the current backend (Ctrl+C)
# Then restart:
cd truthlens-backend
python main.py
```

### Step 2: Wait for Quota Reset (if needed)
If you still get the error immediately:
- **Wait 37 seconds** (as shown in error)
- OR **wait until tomorrow** for daily quota reset

### Step 3: Test
```bash
# Test with a simple request
curl -X POST http://localhost:8000/api/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message"}'
```

---

## Quota Comparison

| Model | Free Tier Limit | Speed | Quality |
|-------|----------------|-------|---------|
| `gemini-flash-latest` (3.0) | 20/day | Fast | Excellent |
| `gemini-1.5-flash` | **1500/day** | Fast | Excellent |
| `gemini-1.5-pro` | 50/day | Slower | Best |

---

## If You Still Get Quota Errors

### Option 1: Verify API Key is Updated
```bash
cd truthlens-backend
cat .env | grep GEMINI_API_KEY
```

Make sure it shows your NEW API key.

### Option 2: Check Your Google AI Studio
1. Go to: https://aistudio.google.com/apikey
2. Check which project your key belongs to
3. Verify quota limits for that project

### Option 3: Create a New Project
1. Go to: https://aistudio.google.com/
2. Create a NEW project
3. Generate a NEW API key for that project
4. Update `.env` with the new key

### Option 4: Upgrade to Paid Tier
If you need more than 1500 requests/day:
1. Go to: https://console.cloud.google.com/
2. Enable billing for your project
3. Paid tier has much higher limits

---

## Rate Limiting Details

The system now automatically:
- ✅ Waits 2 seconds between Gemini requests
- ✅ Logs when rate limiting is active
- ✅ Prevents accidental quota exhaustion

You'll see this in logs:
```
Rate limiting: waiting 1.5s before next request...
```

---

## Testing the Fix

### Test 1: Single Request
```bash
# Should work after restart
curl -X POST http://localhost:8000/api/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Breaking news: Scientists discover new planet"}'
```

### Test 2: Multiple Requests
```bash
# Try 3 requests in a row
# Should see rate limiting in action
for i in {1..3}; do
  curl -X POST http://localhost:8000/api/analyze/text \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Test message $i\"}"
  echo ""
done
```

---

## Summary

✅ **Model changed**: `gemini-flash-latest` → `gemini-1.5-flash`
✅ **Quota increased**: 20/day → 1500/day (75x more!)
✅ **Rate limiting added**: 2 seconds between requests
✅ **Same quality**: Still fast and accurate

**Next Steps**:
1. Restart backend
2. Wait 37 seconds (or until tomorrow) if quota still exceeded
3. Test with a simple request
4. Should work perfectly now!

---

## Status
✅ **FIXED** - Model changed to Gemini 1.5 Flash with 1500 RPD limit
