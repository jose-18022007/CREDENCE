"""URL scraping service using Newspaper3k."""
from typing import Dict, Any, Optional
from newspaper import Article
import requests
from bs4 import BeautifulSoup


async def scrape_url(url: str) -> Dict[str, Any]:
    """Scrape content from URL.
    
    Args:
        url: URL to scrape
        
    Returns:
        Dictionary containing scraped content
    """
    try:
        article = Article(url)
        article.download()
        article.parse()
        
        return {
            "success": True,
            "title": article.title or "No title",
            "text": article.text or "",
            "authors": article.authors or [],
            "publish_date": str(article.publish_date) if article.publish_date else None,
            "top_image": article.top_image or None,
            "domain": extract_domain_from_url(url),
            "word_count": len(article.text.split()) if article.text else 0
        }
        
    except Exception as e:
        # Fallback to basic scraping
        return await fallback_scrape(url, str(e))


async def fallback_scrape(url: str, error: str) -> Dict[str, Any]:
    """Fallback scraping method using BeautifulSoup.
    
    Args:
        url: URL to scrape
        error: Original error message
        
    Returns:
        Dictionary containing scraped content or error
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title = soup.find('title')
        title_text = title.get_text() if title else "No title"
        
        # Extract text from paragraphs
        paragraphs = soup.find_all('p')
        text = ' '.join([p.get_text() for p in paragraphs])
        
        return {
            "success": True,
            "title": title_text,
            "text": text[:10000],  # Limit text length
            "authors": [],
            "publish_date": None,
            "top_image": None,
            "domain": extract_domain_from_url(url),
            "word_count": len(text.split()),
            "fallback_used": True
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to scrape URL: {str(e)}",
            "original_error": error
        }


def extract_domain_from_url(url: str) -> str:
    """Extract domain from URL."""
    from urllib.parse import urlparse
    try:
        parsed = urlparse(url)
        return parsed.netloc.replace("www.", "")
    except:
        return ""
