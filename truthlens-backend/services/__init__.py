"""Services for TruthLens API."""
from .gemini_service import GeminiService, analyze_with_gemini
from .factcheck_service import FactCheckService, check_facts
from .news_service import NewsService, cross_reference_news
from .scraper_service import scrape_url
from .domain_service import analyze_domain
from .scoring_service import ScoringService, calculate_trust_score

__all__ = [
    "GeminiService",
    "analyze_with_gemini",
    "FactCheckService",
    "check_facts",
    "NewsService",
    "cross_reference_news",
    "scrape_url",
    "analyze_domain",
    "ScoringService",
    "calculate_trust_score",
]
