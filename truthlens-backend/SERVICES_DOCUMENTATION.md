# TruthLens Services Documentation

## Overview

TruthLens integrates multiple external services and databases to provide comprehensive content analysis.

## 1. Fact-Check Service

### FactCheckService Class

**File:** `services/factcheck_service.py`

**Purpose:** Searches Google Fact Check Tools API for existing fact-checks of claims.

**API:** Google Fact Check Tools API (FREE, no key required for basic usage)
- Endpoint: `https://factchecktools.googleapis.com/v1alpha1/claims:search`
- Rate Limit: Reasonable usage (0.5s delay between requests)

### Methods

#### `search_claims(query: str, language: str = "en")`

Searches for fact-checks of a specific claim.

**Parameters:**
- `query`: Claim text to search
- `language`: Language code (default: "en")

**Returns:**
```python
[
    {
        "claim_text": "COVID-19 vaccines contain microchips",
        "claimant": "Social media posts",
        "claim_date": "2021-01-15",
        "fact_check_rating": "False",
        "fact_checker_name": "Snopes",
        "fact_checker_url": "https://...",
        "review_date": "2021-01-20",
        "title": "Do COVID-19 Vaccines Contain Microchips?"
    }
]
```

#### `check_multiple_claims(claims: List[str])`

Checks multiple claims with rate limiting.

**Parameters:**
- `claims`: List of claim texts (max 5)

**Returns:**
```python
{
    "fact_checks_found": 3,
    "results": [...],
    "verified_count": 0,
    "false_count": 2,
    "mixed_count": 1,
    "has_fact_checks": True
}
```

### Usage Example

```python
from services.factcheck_service import FactCheckService

service = FactCheckService()

# Single claim
results = await service.search_claims("Earth is flat")

# Multiple claims
claims = ["5G causes COVID", "Climate change is real"]
multi_results = await service.check_multiple_claims(claims)
```

### Error Handling

- Returns empty list if no fact-checks found
- Continues gracefully if API fails
- Automatic rate limiting (0.5s between requests)

---

## 2. News Service

### NewsService Class

**File:** `services/news_service.py`

**Purpose:** Cross-references content with news sources to verify if claims are being reported.

**APIs:**
- NewsAPI (https://newsapi.org) - Requires API key
- GNews (https://gnews.io) - Requires API key

### Methods

#### `search_newsapi(query: str, days_back: int = 7, page_size: int = 10)`

Searches NewsAPI for related articles.

**Returns:**
```python
[
    {
        "title": "Article title",
        "source_name": "Reuters",
        "author": "John Doe",
        "url": "https://...",
        "published_at": "2026-03-18T10:00:00Z",
        "description": "Article description",
        "domain": "reuters.com",
        "is_credible": True,
        "trust_score": 95
    }
]
```

#### `search_gnews(query: str, max_results: int = 10)`

Searches GNews for related articles (similar return format).

#### `cross_reference_claim(claim_text: str)`

Cross-references a claim across both news APIs.

**Returns:**
```python
{
    "credible_sources_count": 5,
    "total_sources_count": 8,
    "credible_sources_list": [...],
    "coverage_ratio": 0.625,
    "cross_reference_score": 85,
    "contradicted_by_credible": False,
    "all_articles": [...]
}
```

**Scoring Logic:**
- 0 credible sources → score 20 (very low)
- 1-2 credible sources → score 50-65
- 3+ credible sources → score 85 (high)
- No sources at all → score 50 (neutral)

#### `check_headline(headline: str)`

Checks if a headline is widely reported.

**Returns:**
```python
{
    "is_widely_reported": True,
    "source_count": 12,
    "sources_list": [...],
    "credible_source_count": 8
}
```

### Usage Example

```python
from services.news_service import NewsService

service = NewsService()

# Search news
articles = await service.search_newsapi("climate change")

# Cross-reference claim
result = await service.cross_reference_claim("New study shows...")

# Check headline
headline_check = await service.check_headline("Breaking: Major discovery")
```

### Error Handling

- Returns empty list if API key missing
- Continues gracefully if API fails
- Categorizes sources using domain trust database

---

## 3. Domain Trust Database

### Known Domains

**File:** `utils/known_domains.py`

**Purpose:** Database of 100+ credible and 50+ unreliable domains with trust scores.

### Databases

#### CREDIBLE_DOMAINS (100+ entries)

Categories:
- Wire Services (Reuters, AP, AFP)
- International News (BBC, Guardian, Economist)
- US Major News (NYT, WaPo, WSJ)
- Indian News (The Hindu, Hindustan Times, NDTV)
- Tech News (TechCrunch, Ars Technica)
- Science (Nature, Science)
- Government/Official (WHO, CDC, UN)
- Fact-Checkers (Snopes, PolitiFact)
- Business (Bloomberg, Forbes)

**Structure:**
```python
{
    "reuters.com": {
        "name": "Reuters",
        "trust_score": 95,
        "bias": "CENTER",
        "type": "wire_service"
    }
}
```

#### UNRELIABLE_DOMAINS (50+ entries)

Categories:
- Known Fake News (InfoWars, Natural News)
- Satire Sites (The Onion, Babylon Bee)
- Hyperpartisan (Breitbart, Occupy Democrats)
- Clickbait/Low Quality

**Structure:**
```python
{
    "infowars.com": {
        "name": "InfoWars",
        "trust_score": 10,
        "reason": "Conspiracy theories, misinformation"
    }
}
```

### Functions

#### `get_domain_trust(domain: str)`

Returns complete trust information for a domain.

**Returns:**
```python
{
    "domain": "reuters.com",
    "name": "Reuters",
    "trust_score": 95,
    "bias": "CENTER",
    "type": "wire_service",
    "category": "credible"
}
```

For unknown domains:
```python
{
    "domain": "unknown-site.com",
    "name": "unknown-site.com",
    "trust_score": 50,
    "bias": "UNKNOWN",
    "category": "unknown"
}
```

#### `check_domain_reputation(domain: str)`

Legacy function returning tuple: `(trust_score, bias, category)`

### Usage Example

```python
from utils.known_domains import get_domain_trust

info = get_domain_trust("reuters.com")
print(f"Trust Score: {info['trust_score']}")
print(f"Category: {info['category']}")
```

---

## 4. Integration in Text Analysis

### Complete Flow

**File:** `routers/text_analysis.py`

1. **Gemini Analysis** → Extract claims
2. **Fact-Check Service** → Search existing fact-checks for claims
3. **News Service** → Cross-reference claims with news sources
4. **Scoring Service** → Calculate weighted trust score
5. **Database** → Save complete report

### Error Handling Strategy

```python
# Fact-check service (optional)
try:
    factcheck_results = await factcheck_service.check_multiple_claims(claims)
except Exception as e:
    print(f"Fact-check service error (continuing without it): {e}")
    factcheck_results = {"fact_checks_found": 0, "results": []}

# News service (optional)
try:
    news_cross_ref = await news_service.cross_reference_claim(query)
except Exception as e:
    print(f"News service error (continuing without it): {e}")
    news_cross_ref = {"credible_sources_count": 0, "total_sources_count": 0}
```

**Key Principle:** Analysis NEVER fails completely due to one external API being down.

### Response Enhancement

External services enhance the response:

```python
{
    "claim_verification": {
        "claims": [
            {
                "claim_text": "...",
                "verdict": "FALSE",
                "external_fact_checks": [  # Added from FactCheckService
                    {
                        "fact_checker_name": "Snopes",
                        "fact_check_rating": "False",
                        "fact_checker_url": "..."
                    }
                ]
            }
        ]
    },
    "cross_reference": {
        "factcheck_results": [...],  # From FactCheckService
        "related_articles": [...],   # From NewsService
        "credible_sources_count": 5,
        "unreliable_sources_count": 2
    },
    "red_flags": [
        "2 claim(s) rated FALSE by fact-checkers",  # Added
        "No credible news sources found reporting this"  # Added
    ]
}
```

---

## 5. Testing

### Test Script

**File:** `test_services.py`

Run comprehensive tests:

```bash
python test_services.py
```

Tests:
1. Domain trust database lookup
2. Fact-check service (single & multiple claims)
3. News service (NewsAPI, GNews, cross-reference)

### Expected Behavior

- Domain trust: Always works (no API needed)
- Fact-check: Works without API key (may have limited results)
- News: Requires API keys (gracefully fails without them)

---

## 6. Configuration

### Environment Variables

```env
# Optional - Fact Check API works without key
GEMINI_API_KEY=your_key_here

# Required for news cross-reference
NEWSAPI_KEY=your_newsapi_key
GNEWS_API_KEY=your_gnews_key
```

### Get API Keys

- **NewsAPI:** https://newsapi.org/register (Free: 100 requests/day)
- **GNews:** https://gnews.io/register (Free: 100 requests/day)
- **Gemini:** https://makersuite.google.com/app/apikey (Free)

---

## 7. Performance

### Response Times

- Fact-Check API: ~1-2 seconds per claim
- NewsAPI: ~1-2 seconds
- GNews: ~1-2 seconds
- Domain Lookup: <1ms (local database)

### Rate Limits

- Fact-Check: 0.5s delay between requests (built-in)
- NewsAPI: 100 requests/day (free tier)
- GNews: 100 requests/day (free tier)

### Optimization

Services run concurrently where possible:

```python
newsapi_task = service.search_newsapi(query)
gnews_task = service.search_gnews(query)

newsapi_results, gnews_results = await asyncio.gather(
    newsapi_task,
    gnews_task,
    return_exceptions=True
)
```

---

## 8. Extending the System

### Adding New Domains

Edit `utils/known_domains.py`:

```python
CREDIBLE_DOMAINS["newsite.com"] = {
    "name": "New Site",
    "trust_score": 85,
    "bias": "CENTER",
    "type": "newspaper"
}
```

### Adding New Fact-Check Sources

The Fact Check Tools API aggregates multiple sources automatically:
- Snopes
- PolitiFact
- FactCheck.org
- Full Fact
- AFP Fact Check
- And many more

### Adding New News APIs

Implement in `NewsService` class following the same pattern as NewsAPI/GNews.

---

## Summary

TruthLens integrates:
- ✅ Google Fact Check Tools (FREE)
- ✅ NewsAPI (100 requests/day free)
- ✅ GNews (100 requests/day free)
- ✅ 100+ credible domain database
- ✅ 50+ unreliable domain database
- ✅ Graceful error handling
- ✅ Concurrent API calls
- ✅ Comprehensive testing

All services are optional - analysis continues even if external APIs fail.
