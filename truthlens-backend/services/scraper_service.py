"""URL scraping service using Newspaper3k."""
from typing import Dict, Any, Optional
from newspaper import Article
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import re


class ScraperService:
    """Service for scraping article content from URLs."""
    
    def __init__(self):
        """Initialize scraper service."""
        self.timeout = 10
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    async def scrape_article(self, url: str) -> Dict[str, Any]:
        """Scrape article content from URL.
        
        Args:
            url: URL to scrape
            
        Returns:
            Dictionary containing article data
        """
        # Validate URL
        if not self._is_valid_url(url):
            return {
                "success": False,
                "error": "Invalid URL format",
                "url": url
            }
        
        # Try Newspaper3k first
        try:
            article = Article(url)
            article.download()
            article.parse()
            
            # Try to extract keywords and summary
            try:
                article.nlp()
            except:
                pass
            
            return {
                "success": True,
                "url": url,
                "title": article.title or "No title",
                "body": article.text or "",
                "authors": article.authors or [],
                "publish_date": str(article.publish_date) if article.publish_date else None,
                "image_url": article.top_image or None,
                "summary": article.summary if hasattr(article, 'summary') else "",
                "keywords": article.keywords if hasattr(article, 'keywords') else [],
                "word_count": len(article.text.split()) if article.text else 0,
                "domain": self.extract_domain(url),
                "method": "newspaper3k"
            }
            
        except Exception as e:
            print(f"Newspaper3k failed: {e}, trying BeautifulSoup fallback...")
            return await self._fallback_scrape(url, str(e))
    
    async def _fallback_scrape(self, url: str, original_error: str) -> Dict[str, Any]:
        """Fallback scraping using BeautifulSoup.
        
        Args:
            url: URL to scrape
            original_error: Error from Newspaper3k
            
        Returns:
            Dictionary containing scraped data or error
        """
        try:
            response = requests.get(
                url,
                headers=self.headers,
                timeout=self.timeout,
                allow_redirects=True
            )
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract title
            title = self._extract_title(soup)
            
            # Extract body text
            body = self._extract_body(soup)
            
            # Extract meta description
            summary = self._extract_meta_description(soup)
            
            # Extract image
            image_url = self._extract_image(soup)
            
            # Clean text
            body = self._clean_text(body)
            
            return {
                "success": True,
                "url": url,
                "title": title,
                "body": body,
                "authors": [],
                "publish_date": None,
                "image_url": image_url,
                "summary": summary,
                "keywords": [],
                "word_count": len(body.split()) if body else 0,
                "domain": self.extract_domain(url),
                "method": "beautifulsoup_fallback",
                "original_error": original_error
            }
            
        except requests.Timeout:
            return {
                "success": False,
                "error": "Request timeout (10s limit exceeded)",
                "url": url
            }
        except requests.HTTPError as e:
            return {
                "success": False,
                "error": f"HTTP error: {e.response.status_code}",
                "url": url
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Scraping failed: {str(e)}",
                "url": url,
                "original_error": original_error
            }
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract title from HTML."""
        # Try og:title
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            return og_title['content']
        
        # Try <title> tag
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text().strip()
        
        # Try h1
        h1 = soup.find('h1')
        if h1:
            return h1.get_text().strip()
        
        return "No title"
    
    def _extract_body(self, soup: BeautifulSoup) -> str:
        """Extract body text from HTML."""
        # Try <article> tag
        article = soup.find('article')
        if article:
            return article.get_text(separator=' ', strip=True)
        
        # Try <main> tag
        main = soup.find('main')
        if main:
            return main.get_text(separator=' ', strip=True)
        
        # Try all <p> tags
        paragraphs = soup.find_all('p')
        if paragraphs:
            text = ' '.join([p.get_text(strip=True) for p in paragraphs])
            return text
        
        return ""
    
    def _extract_meta_description(self, soup: BeautifulSoup) -> str:
        """Extract meta description."""
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc['content']
        
        og_desc = soup.find('meta', property='og:description')
        if og_desc and og_desc.get('content'):
            return og_desc['content']
        
        return ""
    
    def _extract_image(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract main image URL."""
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            return og_image['content']
        
        return None
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text."""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove common HTML artifacts
        text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
        
        return text.strip()
    
    def _is_valid_url(self, url: str) -> bool:
        """Validate URL format."""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False
    
    def extract_domain(self, url: str) -> str:
        """Extract clean domain from URL.
        
        Args:
            url: Full URL
            
        Returns:
            Clean domain name
        """
        try:
            parsed = urlparse(url)
            domain = parsed.netloc
            # Remove www. prefix
            if domain.startswith('www.'):
                domain = domain[4:]
            return domain
        except:
            return ""


# Legacy function for backward compatibility
async def scrape_url(url: str) -> Dict[str, Any]:
    """Legacy wrapper for ScraperService.
    
    Args:
        url: URL to scrape
        
    Returns:
        Dictionary containing scraped content
    """
    service = ScraperService()
    return await service.scrape_article(url)


def extract_domain_from_url(url: str) -> str:
    """Extract domain from URL."""
    service = ScraperService()
    return service.extract_domain(url)
