# URL Analysis Documentation

## Overview

TruthLens URL analysis provides comprehensive credibility assessment of web articles by combining content analysis, domain reputation checking, and cross-referencing.

---

## 1. Scraper Service

### ScraperService Class

**File:** `services/scraper_service.py`

**Purpose:** Extract article content from URLs using Newspaper3k with BeautifulSoup fallback.

### Methods

#### `scrape_article(url: str)`

Scrapes article content with automatic fallback.

**Process:**
1. Try Newspaper3k (primary method)
2. If fails, use BeautifulSoup fallback
3. Extract: title, body, authors, date, image, summary, keywords
4. Clean and format text
5. Calculate word count

**Returns:**
```python
{
    "success": True,
    "url": "https://example.com/article",
    "title": "Article Title",
    "body": "Full article text...",
    "authors": ["John Doe"],
    "publish_date": "2026-03-18",
    "image_url": "https://...",
    "summary": "Article summary",
    "keywords": ["keyword1", "keyword2"],
    "word_count": 1234,
    "domain": "example.com",
    "method": "newspaper3k"  # or "beautifulsoup_fallback"
}
```

**Error Handling:**
- Invalid URL → `{"success": False, "error": "Invalid URL format"}`
- Timeout (10s) → `{"success": False, "error": "Request timeout"}`
- HTTP Error → `{"success": False, "error": "HTTP error: 403"}`
- Empty content → Continues with domain analysis only

**Features:**
- ✅ 10-second timeout
- ✅ Proper User-Agent header
- ✅ Automatic fallback to BeautifulSoup
- ✅ Text cleaning (whitespace, HTML artifacts)
- ✅ Multiple extraction strategies

#### `extract_domain(url: str)`

Extracts clean domain from URL.

**Examples:**
- `https://www.bbc.com/news/123` → `bbc.com`
- `http://reuters.com/article` → `reuters.com`

---

## 2. Domain Service

### DomainService Class

**File:** `services/domain_service.py`

**Purpose:** Comprehensive domain credibility analysis using known databases and WHOIS.

### Methods

#### `check_domain_credibility(url: str)`

Complete domain credibility assessment.

**Process:**
1. Extract domain from URL
2. Check against CREDIBLE_DOMAINS database (100+ entries)
3. Check against UNRELIABLE_DOMAINS database (50+ entries)
4. Perform WHOIS lookup
5. Calculate domain age
6. Generate age flag
7. Adjust trust score
8. Generate warnings

**Returns:**
```python
{
    "success": True,
    "domain": "example.com",
    "is_known_credible": False,
    "is_known_unreliable": False,
    "trust_score": 45,
    "domain_age_days": 23,
    "domain_age_flag": "NEW_DOMAIN_WARNING",
    "political_bias": "UNKNOWN",
    "registrar": "GoDaddy",
    "registration_date": "2026-02-23",
    "expiration_date": "2027-02-23",
    "name_servers": ["ns1.example.com"],
    "warnings": [
        "🚨 Domain is only 23 days old (very new)",
        "ℹ️ Domain not found in credible or unreliable source databases"
    ],
    "domain_type": "unknown",
    "source_name": "example.com"
}
```

**Domain Age Flags:**
- `NEW_DOMAIN_WARNING`: < 30 days (RED FLAG)
- `YOUNG_DOMAIN`: 30-180 days (WARNING)
- `ESTABLISHED`: 180-730 days
- `MATURE_DOMAIN`: 730+ days
- `UNKNOWN`: WHOIS failed

**Trust Score Adjustment:**
- Known credible → Use database score (85-95)
- Known unreliable → Use database score (5-35)
- Unknown + < 30 days → Cap at 30
- Unknown + < 180 days → Cap at 45
- Unknown + 730+ days → +10 bonus

#### `quick_domain_check(domain: str)`

Fast domain check (database only, no WHOIS).

**Returns:**
```python
{
    "domain": "reuters.com",
    "is_credible": True,
    "is_unreliable": False,
    "trust_score": 95,
    "bias": "CENTER",
    "category": "credible",
    "name": "Reuters"
}
```

**Use Case:** Quick "Rate My Source" utility.

---

## 3. URL Analysis Endpoint

### POST /api/analyze/url

**File:** `routers/url_analysis.py`

**Purpose:** Complete URL analysis pipeline.

### Request

```json
{
  "url": "https://example.com/article"
}
```

### Process Flow

```
1. Scrape Article
   ↓
2. Check Domain Credibility
   ↓
3. Analyze Content with Gemini
   ↓
4. Fact-Check Claims
   ↓
5. Cross-Reference with News
   ↓
6. Calculate Trust Score
   ↓
7. Save to Database
   ↓
8. Return Response
```

### Response

```json
{
  "analysis_id": "uuid",
  "overall_trust_score": 45,
  "verdict": "SUSPICIOUS",
  "summary": "Analysis of example.com: 3 claims verified",
  
  "source_credibility": {
    "score": 30,
    "domain": "example.com",
    "domain_age": "23 days",
    "bias": "UNKNOWN",
    "details": "? example.com is not in known source databases | ⚠ Very new domain (23 days old) | Registrar: GoDaddy"
  },
  
  "claim_verification": {
    "claims": [...],
    "verified_count": 1,
    "false_count": 2,
    "unverifiable_count": 0
  },
  
  "language_analysis": {
    "sensationalism_score": 75,
    "clickbait_score": 60,
    "emotional_manipulation": "High",
    "political_bias": "UNKNOWN",
    "logical_fallacies": ["Appeal to Fear"],
    "tone": "BIASED"
  },
  
  "cross_reference": {
    "factcheck_results": [...],
    "related_articles": [...],
    "credible_sources_count": 0,
    "unreliable_sources_count": 2
  },
  
  "red_flags": [
    "🚨 Domain is only 23 days old (very new)",
    "ℹ️ Domain not found in credible or unreliable source databases",
    "2 false claim(s) detected",
    "Highly sensationalist language",
    "No credible news sources found reporting this"
  ]
}
```

### Edge Cases

#### 1. Scraping Fails (Paywall, 403, Timeout)

Returns partial analysis with domain check only:

```json
{
  "overall_trust_score": 50,
  "verdict": "SUSPICIOUS",
  "summary": "Unable to analyze content. Request timeout (10s limit exceeded)",
  "source_credibility": {
    "score": 50,
    "domain": "example.com",
    "details": "Could not scrape content: Request timeout. Domain analysis only."
  },
  "red_flags": ["Domain warnings..."]
}
```

#### 2. Non-Article Content (PDF, Video)

Returns 400 error:

```json
{
  "detail": "Scraped content is too short or empty. URL may point to non-article content."
}
```

#### 3. Invalid URL

Returns 400 error:

```json
{
  "detail": "Invalid URL format"
}
```

---

## 4. Integration with Other Services

### Gemini Analysis

- Analyzes scraped article body (max 8000 chars)
- Extracts claims
- Detects bias, sensationalism, fallacies

### Fact-Check Service

- Checks extracted claims
- Matches with existing fact-checks
- Adds external verification

### News Service

- Cross-references article title/headline
- Checks if story is widely reported
- Counts credible vs unreliable sources

### Scoring Service

- Weights: 30% content + 25% source + 20% language + 25% cross-ref
- Includes domain credibility in source score
- Aggregates all red flags

---

## 5. Testing

### Test Script

**File:** `test_url_analysis.py`

```bash
python test_url_analysis.py
```

**Tests:**
1. Domain extraction
2. Quick domain check
3. Full domain credibility check
4. Article scraping

### Manual API Test

```bash
curl -X POST http://localhost:8000/api/analyze/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.bbc.com/news"}'
```

---

## 6. Configuration

### Timeouts

- Scraping timeout: 10 seconds
- WHOIS timeout: Default (varies by library)

### User-Agent

```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
```

### Fallback Strategy

1. Try Newspaper3k
2. If fails, try BeautifulSoup with:
   - `<article>` tag
   - `<main>` tag
   - All `<p>` tags
3. Extract meta tags (og:title, og:description, og:image)
4. Clean text (remove whitespace, HTML artifacts)

---

## 7. Performance

### Response Times

- Scraping: 1-5 seconds (depends on site)
- WHOIS lookup: 1-3 seconds
- Gemini analysis: 2-5 seconds
- Fact-check: 1-2 seconds
- News cross-ref: 2-4 seconds
- **Total: 7-19 seconds**

### Optimization

- Services run concurrently where possible
- WHOIS failures don't block analysis
- Scraping failures still return domain analysis

---

## 8. Known Limitations

### Scraping Limitations

- ❌ Paywalled content (WSJ, NYT premium)
- ❌ JavaScript-heavy sites (some SPAs)
- ❌ Sites blocking scrapers (403/429)
- ❌ Cloudflare-protected sites
- ✅ Most news sites work fine

### WHOIS Limitations

- Some domains block WHOIS
- Privacy protection hides data
- New TLDs may have limited data
- Rate limiting on bulk lookups

### Workarounds

- Scraping fails → Domain analysis only
- WHOIS fails → Use database + neutral score
- Both fail → Return partial results

---

## 9. Example Use Cases

### Use Case 1: Verify News Article

```python
# User shares: "https://www.reuters.com/world/article-123"
# System:
# 1. Scrapes article ✓
# 2. Checks domain: reuters.com → Trust: 95 ✓
# 3. Analyzes content ✓
# 4. Result: VERIFIED (score: 88)
```

### Use Case 2: Suspicious New Site

```python
# User shares: "https://breaking-news-today.com/shocking-truth"
# System:
# 1. Scrapes article ✓
# 2. Checks domain: breaking-news-today.com
#    - Not in database
#    - Domain age: 15 days → RED FLAG
#    - Trust score capped at 30
# 3. Analyzes content: High sensationalism
# 4. Result: LIKELY MISLEADING (score: 22)
```

### Use Case 3: Paywall Site

```python
# User shares: "https://www.wsj.com/premium-article"
# System:
# 1. Scraping fails (paywall) ✗
# 2. Checks domain: wsj.com → Trust: 87 ✓
# 3. Returns partial analysis with domain info
# 4. Result: Domain credible, content unavailable
```

---

## 10. Best Practices

### For Users

1. Share full article URLs (not shortened links)
2. Avoid paywalled content
3. Check domain warnings carefully
4. Consider multiple sources

### For Developers

1. Always handle scraping failures
2. Never fail completely if one service is down
3. Provide clear error messages
4. Log failures for debugging
5. Cache domain checks for performance

---

## Summary

URL Analysis provides:

✅ Article scraping with fallback
✅ Domain credibility checking
✅ WHOIS analysis with age detection
✅ 100+ known domain database
✅ Content analysis with Gemini
✅ Fact-checking integration
✅ News cross-referencing
✅ Comprehensive scoring
✅ Graceful error handling
✅ Partial results when scraping fails

**Ready for production use!**
