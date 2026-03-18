"""Web search service using DuckDuckGo for real-time information retrieval."""
import re
from datetime import datetime
from typing import List, Dict, Any
from duckduckgo_search import DDGS


class WebSearchService:
    """Service for searching the web to get current information about claims."""
    
    def __init__(self):
        """Initialize web search service."""
        self.timeout = 10
        self.max_retries = 2
    
    async def search_web(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Search the web using DuckDuckGo.
        
        Args:
            query: Search query
            max_results: Maximum number of results
            
        Returns:
            List of search results
        """
        try:
            with DDGS() as ddgs:
                results = []
                for result in ddgs.text(query, max_results=max_results):
                    results.append({
                        "title": result.get("title", ""),
                        "url": result.get("href", ""),
                        "snippet": result.get("body", ""),
                        "source": self._extract_domain(result.get("href", ""))
                    })
                return results
        except Exception as e:
            print(f"Web search error for query '{query}': {e}")
            return []
    
    async def search_news(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Search news articles using DuckDuckGo News.
        
        Args:
            query: Search query
            max_results: Maximum number of results
            
        Returns:
            List of news results
        """
        try:
            with DDGS() as ddgs:
                results = []
                for result in ddgs.news(query, max_results=max_results):
                    results.append({
                        "title": result.get("title", ""),
                        "url": result.get("url", ""),
                        "snippet": result.get("body", ""),
                        "source": result.get("source", ""),
                        "date": result.get("date", "")
                    })
                return results
        except Exception as e:
            print(f"News search error for query '{query}': {e}")
            return []
    
    async def search_and_compile_context(self, claim_text: str) -> Dict[str, Any]:
        """Search web and compile comprehensive context for Gemini.
        
        Args:
            claim_text: The claim to search for
            
        Returns:
            Compiled context with search results
        """
        # Step 1: Clean claim text
        cleaned_claim = self._clean_text(claim_text)
        
        # Step 2: Generate search queries
        search_queries = self.extract_search_queries(cleaned_claim)
        
        # Step 3-5: Run searches
        news_results = []
        web_results = []
        factcheck_results = []
        
        # Query 1: News search with claim text
        if len(search_queries) > 0:
            news_results = await self.search_news(search_queries[0], max_results=8)
        
        # Query 2: General web search
        if len(search_queries) > 1:
            web_results = await self.search_web(search_queries[1], max_results=8)
        
        # Query 3: Fact-check search
        if len(search_queries) > 2:
            factcheck_results = await self.search_web(search_queries[2], max_results=5)
        
        # Step 6: Remove duplicates by URL
        all_urls = set()
        unique_news = []
        unique_web = []
        unique_factcheck = []
        
        for result in news_results:
            if result["url"] not in all_urls:
                all_urls.add(result["url"])
                unique_news.append(result)
        
        for result in web_results:
            if result["url"] not in all_urls:
                all_urls.add(result["url"])
                unique_web.append(result)
        
        for result in factcheck_results:
            if result["url"] not in all_urls:
                all_urls.add(result["url"])
                unique_factcheck.append(result)
        
        # Step 7: Compile context string
        current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        context_parts = [f"WEB SEARCH RESULTS (Retrieved on {current_datetime}):\n"]
        
        # News articles
        if unique_news:
            context_parts.append("\nNEWS ARTICLES:")
            for i, result in enumerate(unique_news, 1):
                context_parts.append(
                    f"\n{i}. [{result['source']}] {result['title']} ({result.get('date', 'Date unknown')})"
                    f"\n   Summary: {result['snippet'][:200]}..."
                    f"\n   URL: {result['url']}"
                )
        
        # General web results
        if unique_web:
            context_parts.append("\n\nGENERAL WEB RESULTS:")
            for i, result in enumerate(unique_web, 1):
                context_parts.append(
                    f"\n{i}. [{result['source']}] {result['title']}"
                    f"\n   Summary: {result['snippet'][:200]}..."
                    f"\n   URL: {result['url']}"
                )
        
        # Fact-check results
        if unique_factcheck:
            context_parts.append("\n\nFACT-CHECK SEARCH RESULTS:")
            for i, result in enumerate(unique_factcheck, 1):
                context_parts.append(
                    f"\n{i}. [{result['source']}] {result['title']}"
                    f"\n   Summary: {result['snippet'][:200]}..."
                    f"\n   URL: {result['url']}"
                )
        
        context_string = "\n".join(context_parts)
        
        # Step 8: Compile structured dict
        return {
            "total_results_found": len(unique_news) + len(unique_web) + len(unique_factcheck),
            "news_results": unique_news,
            "web_results": unique_web,
            "factcheck_results": unique_factcheck,
            "search_queries_used": search_queries,
            "search_timestamp": current_datetime,
            "context_string": context_string
        }
    
    def extract_search_queries(self, text: str) -> List[str]:
        """Extract search queries from claim text.
        
        Args:
            text: Claim text
            
        Returns:
            List of search query strings
        """
        # Clean text
        cleaned = self._clean_text(text)
        
        # Query 1: First 150 chars of claim
        query1 = cleaned[:150].strip()
        
        # Query 2: Extract key entities + "news"
        entities = self._extract_entities(cleaned)
        query2 = f"{' '.join(entities[:5])} news" if entities else f"{cleaned[:100]} news"
        
        # Query 3: Key entities + "fact check"
        query3 = f"{' '.join(entities[:5])} fact check" if entities else f"{cleaned[:100]} fact check"
        
        return [query1, query2, query3]
    
    def _clean_text(self, text: str) -> str:
        """Clean text for search queries."""
        # Remove special characters but keep spaces and basic punctuation
        cleaned = re.sub(r'[^\w\s\-\.]', ' ', text)
        # Remove extra whitespace
        cleaned = ' '.join(cleaned.split())
        return cleaned
    
    def _extract_entities(self, text: str) -> List[str]:
        """Extract potential entities (capitalized words, numbers, etc)."""
        # Stop words to exclude
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
        }
        
        words = text.split()
        entities = []
        
        for word in words:
            # Remove punctuation
            clean_word = re.sub(r'[^\w]', '', word)
            
            # Check if capitalized (potential name/place)
            if clean_word and clean_word[0].isupper() and clean_word.lower() not in stop_words:
                entities.append(clean_word)
            # Check if number (potential date/statistic)
            elif clean_word.isdigit():
                entities.append(clean_word)
        
        return entities[:10]  # Limit to 10 entities
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL."""
        from urllib.parse import urlparse
        try:
            parsed = urlparse(url)
            return parsed.netloc.replace("www.", "")
        except:
            return "unknown"


# Legacy function for backward compatibility
async def search_web(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """Search the web using DuckDuckGo."""
    service = WebSearchService()
    return await service.search_web(query, max_results)


async def search_news(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """Search news using DuckDuckGo News."""
    service = WebSearchService()
    return await service.search_news(query, max_results)
