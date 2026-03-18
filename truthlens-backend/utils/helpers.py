"""Common utility functions."""
import uuid
from typing import Optional


def generate_uuid() -> str:
    """Generate a unique identifier.
    
    Returns:
        UUID string
    """
    return str(uuid.uuid4())


def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text to a maximum length.
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        
    Returns:
        Truncated text with ellipsis if needed
    """
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def get_verdict_from_score(score: int) -> str:
    """Get verdict label from trust score.
    
    Args:
        score: Trust score (0-100)
        
    Returns:
        Verdict string
    """
    if score >= 85:
        return "VERIFIED"
    elif score >= 65:
        return "MOSTLY CREDIBLE"
    elif score >= 45:
        return "SUSPICIOUS"
    elif score >= 25:
        return "LIKELY MISLEADING"
    else:
        return "FAKE/FABRICATED"


def extract_domain(url: str) -> Optional[str]:
    """Extract domain from URL.
    
    Args:
        url: Full URL
        
    Returns:
        Domain name or None
    """
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return parsed.netloc
    except Exception:
        return None
