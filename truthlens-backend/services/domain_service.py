"""Domain credibility and WHOIS analysis."""
import whois
from datetime import datetime
from typing import Dict, Any, Optional
from utils.known_domains import check_domain_reputation


async def analyze_domain(domain: str) -> Dict[str, Any]:
    """Analyze domain credibility and information.
    
    Args:
        domain: Domain name to analyze
        
    Returns:
        Dictionary containing domain analysis
    """
    # Check against known domains database
    credibility, bias, category = check_domain_reputation(domain)
    
    # Get WHOIS information
    whois_info = await get_whois_info(domain)
    
    # Calculate domain age
    domain_age = calculate_domain_age(whois_info.get("creation_date"))
    
    # Determine credibility score
    if credibility is not None:
        score = credibility
    else:
        # Calculate score based on domain age and other factors
        score = calculate_credibility_score(domain_age, whois_info)
    
    return {
        "domain": domain,
        "credibility_score": score,
        "bias": bias or "Unknown",
        "category": category,
        "domain_age": domain_age,
        "whois_info": whois_info,
        "ssl_valid": True,  # Placeholder - would check SSL certificate
        "reputation": get_reputation_label(score)
    }


async def get_whois_info(domain: str) -> Dict[str, Any]:
    """Get WHOIS information for domain.
    
    Args:
        domain: Domain name
        
    Returns:
        Dictionary containing WHOIS data
    """
    try:
        w = whois.whois(domain)
        
        return {
            "registrar": w.registrar if hasattr(w, 'registrar') else None,
            "creation_date": str(w.creation_date) if hasattr(w, 'creation_date') else None,
            "expiration_date": str(w.expiration_date) if hasattr(w, 'expiration_date') else None,
            "name_servers": w.name_servers if hasattr(w, 'name_servers') else [],
            "status": w.status if hasattr(w, 'status') else None,
        }
        
    except Exception as e:
        return {
            "error": f"WHOIS lookup failed: {str(e)}",
            "registrar": None,
            "creation_date": None
        }


def calculate_domain_age(creation_date: Optional[str]) -> Optional[str]:
    """Calculate domain age from creation date.
    
    Args:
        creation_date: Domain creation date string
        
    Returns:
        Human-readable domain age or None
    """
    if not creation_date:
        return None
    
    try:
        # Parse creation date (simplified)
        if isinstance(creation_date, str):
            # Would need proper date parsing here
            return "Unknown age"
        
        return "Unknown age"
        
    except Exception:
        return None


def calculate_credibility_score(domain_age: Optional[str], whois_info: Dict[str, Any]) -> int:
    """Calculate credibility score based on domain factors.
    
    Args:
        domain_age: Domain age string
        whois_info: WHOIS information
        
    Returns:
        Credibility score (0-100)
    """
    score = 50  # Base score
    
    # Adjust based on domain age
    if domain_age and "year" in domain_age.lower():
        score += 10
    
    # Adjust based on WHOIS completeness
    if whois_info.get("registrar"):
        score += 5
    
    if whois_info.get("creation_date"):
        score += 5
    
    return min(score, 100)


def get_reputation_label(score: int) -> str:
    """Get reputation label from score.
    
    Args:
        score: Credibility score
        
    Returns:
        Reputation label
    """
    if score >= 85:
        return "Highly Credible"
    elif score >= 70:
        return "Generally Credible"
    elif score >= 50:
        return "Mixed Reputation"
    elif score >= 30:
        return "Questionable"
    else:
        return "Unreliable"
