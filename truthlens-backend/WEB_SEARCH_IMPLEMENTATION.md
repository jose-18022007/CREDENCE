# Web Search Integration - CRITICAL UPDATE

## Problem Solved

**CRITICAL FLAW FIXED**: The system previously had a major issue where Gemini would incorrectly flag legitimate current news as "FAKE" because its knowledge cutoff prevented it from knowing about recent events.

## Solution

Added a **Web Search Layer** that searches the internet for current information BEFORE sending content to Gemini. This gives Gemini real-time context about recent events, similar to how ChatGPT uses web search.

## How It Works

```
User Input → Web Search (DuckDuckGo) → Gemini Analysis (with context) → Final Result
```

### Flow:

1. **User submits text** (e.g., "Trump wins 2024 election")
2. **Web Search Service** searches DuckDuckGo for:
   - News articles about the claim
   - General web results
   - Existing fact-checks
3. **Compile Context** - All search results are formatted into a context string
4. **Gemini Analysis** - Gemini receives:
   - Original text
   - Real-time web search results
   - Instructions to prioritize search results over its training data
5. **Gemini makes informed decision** based on current information
6. **Response includes** web search evidence

## New Service: WebSearchService

**File**: `services/web_search_service.py`

### Methods:

1. **`search_web(query, max_results=10)`**
   - Searches general web using DuckDuckGo
   - Returns: title, URL, snippet, source domain

2. **`search_news(query, max_results=10)`**
   - Searches news articles specifically
   - Returns: title, URL, snippet, source, date

3. **`search_and_compile_context(claim_text)`** ⭐ MAIN METHOD
   - Generates 3 search queries from the claim
   - Runs news search, web search, and fact-check search
   - Removes duplicates
   - Compiles formatted context string for Gemini
   - Returns structured dict with all results

4. **`extract_search_queries(text)`**
   - Extracts key entities (names, places, numbers)
   - Generates optimized search queries

## Updated Gemini Prompt

Gemini now receives:

```
You are TruthLens, an expert fact-checking AI analyst.

IMPORTANT INSTRUCTIONS:
- You have been provided with REAL-TIME web search results retrieved just now.
- Use these search results as your PRIMARY source of truth for current events.
- If multiple credible news sources confirm the claim, it is likely TRUE.
- If search results CONTRADICT the claim, it is likely FALSE.
- If NO credible sources mention it, it may be UNVERIFIED.
- Consider source credibility (Reuters, AP, BBC = highly credible).

CONTENT TO ANALYZE:
{user's text}

REAL-TIME WEB SEARCH RESULTS:
{news articles, web results, fact-checks}

Now analyze...
```

## New Response Fields

### WebSearchEvidence (added to AnalysisResponse)

```json
{
  "web_search_evidence": {
    "search_performed": true,
    "total_results_found": 15,
    "news_results_count": 8,
    "search_timestamp": "2026-03-18 18:11:54 UTC",
    "coverage_level": "WIDELY_COVERED"
  }
}
```

### RECENCY_ASSESSMENT (added to Gemini response)

```json
{
  "RECENCY_ASSESSMENT": {
    "is_recent_event": true,
    "event_date_approximate": "November 2024",
    "coverage_level": "WIDELY_COVERED"
  }
}
```

## Updated Text Analysis Flow

**File**: `routers/text_analysis.py`

```python
# Step 1: Web Search (NEW!)
web_context = await web_search_service.search_and_compile_context(text)

# Step 2: Gemini Analysis (with web context)
gemini_result = await gemini_service.analyze_text_content(
    text,
    web_context=web_context  # ← NEW PARAMETER
)

# Step 3: Fact-check API
factcheck_results = await factcheck_service.check_multiple_claims(claims)

# Step 4: News API
news_cross_ref = await news_service.cross_reference_claim(query)

# Step 5: Calculate trust score (prioritizes fact-checks > web search > Gemini)
trust_score = await scoring_service.calculate_trust_score(analysis_data)
```

## Priority Order for Determining Fake/Real

1. **Fact-Check API** (40% weight) - Professional fact-checkers
2. **Web Search Results** (35% weight) - Current news coverage
3. **Gemini Analysis** (25% weight) - Language patterns, bias

## Dependencies

Added to `requirements.txt`:
```
duckduckgo-search==6.3.5
```

## Testing

**Test Script**: `test_web_search.py`

```bash
cd truthlens-backend
python test_web_search.py
```

Example output:
```
✓ Total results found: 8
✓ News articles: 8
✓ Web results: 0
✓ Fact-check results: 0

NEWS RESULTS:
1. [Associated Press News] Highlights: First Biden-Trump debate...
   Date: 2026-03-17T17:55:00+00:00
   URL: https://apnews.com/live/presidential-debate-2024-updates
```

## Benefits

✅ **Accurate for current events** - No longer flags real news as fake
✅ **Real-time information** - Searches the web for latest updates
✅ **Source credibility** - Considers credibility of search results
✅ **Transparent** - Shows users what sources were found
✅ **Fallback safe** - If web search fails, still uses Gemini + fact-checks

## Example Use Case

**Before (WRONG):**
- User: "Trump wins 2024 election"
- Gemini: "FAKE - I have no knowledge of this event"
- Result: ❌ Incorrectly flagged as fake

**After (CORRECT):**
- User: "Trump wins 2024 election"
- Web Search: Finds 8 news articles from AP, Reuters, etc.
- Gemini: "TRUE - Multiple credible sources confirm this"
- Result: ✅ Correctly verified as true

## Rate Limiting

DuckDuckGo has rate limits. The service handles this gracefully:
- Returns empty list if rate limited
- Analysis continues with other sources (fact-checks, news API)
- User still gets a result, just without web search evidence

## Future Improvements

- Add caching for repeated searches
- Support multiple search engines (fallback to Google, Bing)
- Extract more structured data from search results
- Add image/video search for media analysis
