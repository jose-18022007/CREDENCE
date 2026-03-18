"""Services for Credence API."""
from .gemini_service import GeminiService, analyze_with_gemini
from .factcheck_service import FactCheckService, check_facts
from .news_service import NewsService, cross_reference_news
from .scraper_service import ScraperService, scrape_url
from .domain_service import DomainService, analyze_domain
from .scoring_service import ScoringService, calculate_trust_score

__all__ = [
    "GeminiService",
    "analyze_with_gemini",
    "FactCheckService",
    "check_facts",
    "NewsService",
    "cross_reference_news",
    "ScraperService",
    "scrape_url",
    "DomainService",
    "analyze_domain",
    "ScoringService",
    "calculate_trust_score",
]
