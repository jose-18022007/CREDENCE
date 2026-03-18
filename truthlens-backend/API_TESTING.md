# TruthLens API Testing Guide

## Quick Start

### 1. Setup Environment

```bash
cd truthlens-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure API Keys

Edit `.env` file:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
NEWSAPI_KEY=your_newsapi_key
GNEWS_API_KEY=your_gnews_key
```

Get free Gemini API key: https://makersuite.google.com/app/apikey

### 3. Start Server

```bash
uvicorn main:app --reload
```

Server runs at: `http://localhost:8000`

## Testing the Gemini Analysis Engine

### Test 1: Run Test Script

```bash
python test_gemini.py
```

This will analyze a sample fake news text and show:
- Claim verification results
- Language analysis scores
- Logical fallacies detected
- Viral forward patterns
- Trust score calculation
- Red flags

### Test 2: API Endpoint Test

**Using curl:**

```bash
curl -X POST http://localhost:8000/api/analyze/text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "BREAKING: Scientists discover miracle cure that doctors dont want you to know! Share before deleted!",
    "check_bias": true,
    "deep_factcheck": true,
    "check_fallacies": true
  }'
```

**Using Python requests:**

```python
import requests

response = requests.post(
    "http://localhost:8000/api/analyze/text",
    json={
        "text": "Government secretly adding microchips to vaccines!",
        "check_bias": True,
        "deep_factcheck": True,
        "check_fallacies": True
    }
)

print(response.json())
```

### Test 3: Interactive API Docs

Visit: `http://localhost:8000/docs`

1. Click on `POST /api/analyze/text`
2. Click "Try it out"
3. Enter sample text
4. Click "Execute"
5. View detailed response

## Sample Test Cases

### Test Case 1: Fake News (Expected: Low Score)

```json
{
  "text": "URGENT! Government confirmed: 5G towers cause COVID-19! Scientists are being silenced! Share this before they delete it! Forward to 10 people immediately!",
  "check_bias": true,
  "check_fallacies": true
}
```

Expected Results:
- Trust Score: 0-30
- Verdict: FAKE/FABRICATED
- Red Flags: Multiple
- Viral Forward: Detected

### Test Case 2: Credible News (Expected: High Score)

```json
{
  "text": "According to a peer-reviewed study published in Nature, researchers at MIT have developed a new method for carbon capture. The study, which involved 50 participants over 2 years, showed promising results.",
  "check_bias": true,
  "check_fallacies": true
}
```

Expected Results:
- Trust Score: 70-90
- Verdict: MOSTLY CREDIBLE or VERIFIED
- Red Flags: Few or none
- Viral Forward: Not detected

### Test Case 3: Biased Content (Expected: Medium Score)

```json
{
  "text": "The radical left-wing government is destroying our country with their socialist agenda! Every patriot must stand up against this tyranny!",
  "check_bias": true,
  "check_fallacies": true
}
```

Expected Results:
- Trust Score: 30-50
- Verdict: SUSPICIOUS
- Political Bias: FAR_RIGHT or RIGHT
- High sensationalism score

## Response Structure

```json
{
  "analysis_id": "uuid",
  "overall_trust_score": 45,
  "verdict": "SUSPICIOUS",
  "summary": "Analysis summary...",
  "source_credibility": {
    "score": 70,
    "bias": "CENTER",
    "details": "..."
  },
  "claim_verification": {
    "claims": [
      {
        "claim_text": "...",
        "verdict": "FALSE",
        "confidence": 85,
        "reasoning": "...",
        "evidence": "..."
      }
    ],
    "verified_count": 0,
    "false_count": 2,
    "unverifiable_count": 1
  },
  "language_analysis": {
    "sensationalism_score": 85,
    "clickbait_score": 70,
    "emotional_manipulation": "High",
    "political_bias": "FAR_RIGHT",
    "logical_fallacies": ["Appeal to Fear", "False Urgency"],
    "tone": "INFLAMMATORY"
  },
  "media_integrity": {},
  "cross_reference": {
    "factcheck_results": [],
    "related_articles": [],
    "credible_sources_count": 0,
    "unreliable_sources_count": 0
  },
  "red_flags": [
    "Highly sensationalist language",
    "2 false claim(s) detected",
    "Appears to be viral social media forward"
  ],
  "timestamp": "2026-03-18T..."
}
```

## Troubleshooting

### Error: "Gemini API key not configured"

Solution: Add your Gemini API key to `.env` file

### Error: "Empty response from Gemini"

Solution: Check your API key is valid and has quota remaining

### Error: "Failed to parse Gemini response"

Solution: This is handled automatically with fallback. Check logs for details.

### Rate Limiting

The service includes automatic retry with exponential backoff (3 retries max).

## Performance Notes

- Gemini 2.0 Flash: ~2-5 seconds per analysis
- Includes automatic JSON parsing and error handling
- Fallback responses if Gemini fails
- Comprehensive scoring from multiple factors

## Next Steps

1. Test with real-world content
2. Integrate with frontend
3. Add more test cases
4. Monitor API usage and costs
5. Fine-tune scoring weights
