"""NewsAPI and GNews integration for cross-referencing."""
import httpx
import asyncio
from typing import List, Dict, Any
from config import settings
from utils.known_domains import get_domain_trust


class NewsService:
    """Service for cross-referencing content with news sources."""
    
    def __init__(self):
        """Initialize news service."""
        self.newsapi_url = "https://newsapi.org/v2/everything"
        self.gnews_url = "https://gnews.io/api/v4/search"
    
    async def search_newsapi(
        self,
        query: str,
        days_back: int = 7,
        page_size: int = 10
    ) -> List[Dict[str, Any]]:
        """Search NewsAPI for related articles.
        
        Args:
            query: Search query
            days_back: Days to search back
            page_size: Number of results
            
        Returns:
            List of articles with credibility info
        """
        if not settings.NEWSAPI_KEY:
            return []
        
        try:
            params = {
                "q": query,
                "apiKey": settings.NEWSAPI_KEY,
                "pageSize": page_size,
                "language": "en",
                "sortBy": "relevancy"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.newsapi_url,
                    params=params,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    articles = data.get("articles", [])
                    
                    results = []
                    for article in articles:
                        domain = self._extract_domain(article.get("url", ""))
                        trust_info = get_domain_trust(domain)
                        
                        results.append({
                            "title": article.get("title", ""),
                            "source_name": article.get("source", {}).get("name", ""),
                            "author": article.get("author", "Unknown"),
                            "url": article.get("url", ""),
                            "published_at": article.get("publishedAt", ""),
                            "description": article.get("description", ""),
                            "domain": domain,
                            "is_credible": trust_info["category"] == "credible",
                            "trust_score": trust_info["trust_score"]
                        })
                    
                    return results
            
            return []
            
        except Exception as e:
            print(f"NewsAPI error: {e}")
            return []
    
    async def search_gnews(
        self,
        query: str,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Search GNews for related articles.
        
        Args:
            query: Search query
            max_results: Maximum results
            
        Returns:
            List of articles with credibility info
        """
        if not settings.GNEWS_API_KEY:
            return []
        
        try:
            params = {
                "q": query,
                "token": settings.GNEWS_API_KEY,
                "max": max_results,
                "lang": "en"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.gnews_url,
                    params=params,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    articles = data.get("articles", [])
                    
                    results = []
                    for article in articles:
                        domain = self._extract_domain(article.get("url", ""))
                        trust_info = get_domain_trust(domain)
                        
                        results.append({
                            "title": article.get("title", ""),
                            "source_name": article.get("source", {}).get("name", ""),
                            "author": "Unknown",
                            "url": article.get("url", ""),
                            "published_at": article.get("publishedAt", ""),
                            "description": article.get("description", ""),
                            "domain": domain,
                            "is_credible": trust_info["category"] == "credible",
                            "trust_score": trust_info["trust_score"]
                        })
                    
                    return results
            
            return []
            
        except Exception as e:
            print(f"GNews error: {e}")
            return []
    
    async def cross_reference_claim(self, claim_text: str) -> Dict[str, Any]:
        """Cross-reference a claim across news sources.
        
        Args:
            claim_text: Claim to cross-reference
            
        Returns:
            Cross-reference analysis
        """
        # Search both APIs concurrently
        newsapi_task = self.search_newsapi(claim_text)
        gnews_task = self.search_gnews(claim_text)
        
        newsapi_results, gnews_results = await asyncio.gather(
            newsapi_task,
            gnews_task,
            return_exceptions=True
        )
        
        # Handle exceptions
        if isinstance(newsapi_results, Exception):
            newsapi_results = []
        if isinstance(gnews_results, Exception):
            gnews_results = []
        
        # Combine results
        all_articles = newsapi_results + gnews_results
        
        # Count credible vs total
        credible_sources = [a for a in all_articles if a.get("is_credible", False)]
        total_sources = len(all_articles)
        credible_count = len(credible_sources)
        
        # Calculate coverage ratio
        coverage_ratio = credible_count / total_sources if total_sources > 0 else 0
        
        # Calculate cross-reference score
        if total_sources == 0:
            cross_reference_score = 50  # Neutral if no sources
        elif credible_count == 0:
            cross_reference_score = 20  # Very low if no credible sources
        elif credible_count >= 3:
            cross_reference_score = 85  # High if 3+ credible sources
        else:
            cross_reference_score = 50 + (credible_count * 15)
        
        # Check for contradictions (placeholder - would need content analysis)
        contradicted_by_credible = False
        
        return {
            "credible_sources_count": credible_count,
            "total_sources_count": total_sources,
            "credible_sources_list": credible_sources[:5],  # Top 5
            "coverage_ratio": coverage_ratio,
            "cross_reference_score": cross_reference_score,
            "contradicted_by_credible": contradicted_by_credible,
            "all_articles": all_articles[:10]  # Top 10
        }
    
    async def check_headline(self, headline: str) -> Dict[str, Any]:
        """Check if headline is widely reported.
        
        Args:
            headline: Headline to check
            
        Returns:
            Headline verification results
        """
        results = await self.cross_reference_claim(headline)
        
        is_widely_reported = results["total_sources_count"] >= 3
        
        return {
            "is_widely_reported": is_widely_reported,
            "source_count": results["total_sources_count"],
            "sources_list": results["all_articles"][:5],
            "credible_source_count": results["credible_sources_count"]
        }
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL."""
        from urllib.parse import urlparse
        try:
            parsed = urlparse(url)
            return parsed.netloc.replace("www.", "")
        except:
            return ""


# Legacy function for backward compatibility
async def cross_reference_news(query: str, max_results: int = 5) -> Dict[str, Any]:
    """Legacy wrapper for NewsService.
    
    Args:
        query: Search query
        max_results: Maximum number of results
        
    Returns:
        Dictionary containing related articles and credibility assessment
    """
    service = NewsService()
    result = await service.cross_reference_claim(query)
    
    return {
        "related_articles": result["all_articles"][:max_results],
        "credible_sources_count": result["credible_sources_count"],
        "unreliable_sources_count": result["total_sources_count"] - result["credible_sources_count"],
        "total_found": result["total_sources_count"]
    }


async def search_newsapi(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Search NewsAPI for related articles."""
    service = NewsService()
    return await service.search_newsapi(query, page_size=max_results)


async def search_gnews(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Search GNews for related articles."""
    service = NewsService()
    return await service.search_gnews(query, max_results=max_results)


def extract_domain(url: str) -> str:
    """Extract domain from URL."""
    from urllib.parse import urlparse
    try:
        parsed = urlparse(url)
        return parsed.netloc.replace("www.", "")
    except:
        return ""
