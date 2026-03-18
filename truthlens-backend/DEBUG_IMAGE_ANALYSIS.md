# Debug Guide: Image Analysis 60% Issue

## Problem
Image analysis returns hardcoded 60% instead of actual AI detection results.

## Root Cause
The HuggingFace API is failing (timeout, authentication, or model loading), causing the system to fall back to EXIF-based heuristics which return 60% for images without EXIF data.

## How to Debug

### Step 1: Watch Backend Console Logs

When you upload an image, you should see:

**✅ SUCCESS PATH** (API working):
```
🖼️ Starting comprehensive image analysis for: ...
🔍 Calling HuggingFace AI detector API...
📡 HuggingFace API response: 200
✅ HuggingFace API response: [{"label": "artificial", "score": 0.92}, ...]
✅ AI Detection Result: {'ai_generated_probability': 92.0, ...}
📊 AI Detection: 92.0%
📊 EXIF: False, flags: ['METADATA_STRIPPED']
📊 ELA: manipulation=True
✅ Media Integrity Score: 35/100
```

**❌ FALLBACK PATH** (API failed):
```
🖼️ Starting comprehensive image analysis for: ...
🔍 Calling HuggingFace AI detector API...
📡 HuggingFace API response: 503
⏳ Model loading, waiting 20s... (attempt 1/3)
❌ Model failed to load after retries - using fallback
⚠️ Using fallback AI detection (HuggingFace API unavailable)
📊 Fallback result (no EXIF): {'ai_generated_probability': 60.0, ...}
```

### Step 2: Identify the Issue

Look for these specific messages:

1. **`⚠️ HUGGINGFACE_API_KEY not set`**
   - Fix: Check `.env` file has `HUGGINGFACE_API_KEY="hf_..."`

2. **`❌ HuggingFace API authentication failed - check API key`**
   - Fix: API key is invalid or expired
   - Get new key from: https://huggingface.co/settings/tokens

3. **`⏳ Model loading, waiting 20s...`** (repeats 3 times)
   - Issue: HuggingFace model is cold starting
   - Wait 60 seconds and try again
   - Model should warm up after first successful call

4. **`⏱️ Request timeout`**
   - Issue: Network slow or HuggingFace servers overloaded
   - Try again in a few minutes
   - Timeout increased to 60s (should be enough)

5. **`❌ Unexpected status code: XXX`**
   - Check the response text in logs
   - May indicate API quota exceeded or service down

### Step 3: Run Test Script

```bash
cd truthlens-backend
python test_image_analysis.py
```

This creates a simple test image and runs all analysis steps with detailed logging.

### Step 4: Verify API Key

Test your HuggingFace API key manually:

```bash
curl -X POST \
  https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector \
  -H "Authorization: Bearer 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" \
  --data-binary "@test_image.jpg"
```

Expected response:
```json
[
  {"label": "artificial", "score": 0.92},
  {"label": "human", "score": 0.08}
]
```

## Common Issues

### Issue 1: Always Getting 60%

**Symptoms**: Every image returns 60% AI probability

**Cause**: HuggingFace API is failing, fallback is being used

**Solution**:
1. Check backend logs for the exact error
2. Verify API key is valid
3. Wait for model to warm up (first call takes 20-60s)
4. Check HuggingFace service status

### Issue 2: Model Loading Forever

**Symptoms**: Logs show "Model loading, waiting 20s..." repeatedly

**Cause**: HuggingFace free tier model cold start

**Solution**:
1. Wait for all 3 retries (60 seconds total)
2. Try again - model should be warm
3. If persists, model may be down - check HuggingFace status

### Issue 3: Authentication Failed

**Symptoms**: `❌ HuggingFace API authentication failed`

**Cause**: Invalid or expired API key

**Solution**:
1. Go to https://huggingface.co/settings/tokens
2. Create new token with "Read" permission
3. Update `.env` file: `HUGGINGFACE_API_KEY="hf_..."`
4. Restart backend

### Issue 4: Network Timeout

**Symptoms**: `⏱️ Request timeout`

**Cause**: Slow network or HuggingFace servers overloaded

**Solution**:
1. Check internet connection
2. Try again in a few minutes
3. Timeout is 60s - should be sufficient for most cases

## Expected Behavior

### Real Photo (with EXIF)
- AI probability: 5-25%
- EXIF: Camera make/model present
- ELA: Low manipulation confidence
- Score: 80-95

### AI-Generated Image
- AI probability: 70-95%
- EXIF: Metadata stripped
- ELA: May show manipulation
- Score: 10-40

### Edited Photo
- AI probability: 20-50%
- EXIF: Shows editing software
- ELA: High manipulation confidence
- Score: 30-60

## Fallback Behavior

When HuggingFace API fails, the system uses EXIF-based heuristics:

- **No EXIF data** (< 5 tags): 60% AI probability (POSSIBLY_AI)
- **Has EXIF data** (≥ 5 tags): 20% AI probability (LIKELY_REAL)

This is why you're seeing 60% - the fallback is being triggered.

## Success Criteria

✅ Backend logs show "✅ HuggingFace API response: 200"
✅ Backend logs show actual API data (not fallback)
✅ AI probability varies based on actual image (not always 60%)
✅ Frontend displays the actual probability
✅ ELA image is generated and accessible
✅ EXIF data is extracted and displayed

## Contact

If issues persist after following this guide:
1. Share the backend console logs (full output)
2. Share the test image you're using
3. Verify HuggingFace API key is valid
