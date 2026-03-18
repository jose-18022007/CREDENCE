"""Domain credibility and WHOIS analysis."""
import whois
from datetime import datetime
from typing import Dict, Any, Optional, List
from utils.known_domains import get_domain_trust, CREDIBLE_DOMAINS, UNRELIABLE_DOMAINS
from urllib.parse import urlparse


class DomainService:
    """Service for analyzing domain credibility."""
    
    def __init__(self):
        """Initialize domain service."""
        pass
    
    async def check_domain_credibility(self, url: str) -> Dict[str, Any]:
        """Check domain credibility with comprehensive analysis.
        
        Args:
            url: Full URL to analyze
            
        Returns:
            Complete domain credibility report
        """
        # Extract domain
        domain = self._extract_domain(url)
        
        if not domain:
            return {
                "success": False,
                "error": "Could not extract domain from URL"
            }
        
        # Step 1: Check known domains database
        trust_info = get_domain_trust(domain)
        
        is_known_credible = trust_info["category"] == "credible"
        is_known_unreliable = trust_info["category"] == "unreliable"
        base_trust_score = trust_info["trust_score"]
        
        # Step 2: WHOIS lookup
        whois_data = await self._get_whois_data(domain)
        
        # Step 3: Calculate domain age
        domain_age_days = whois_data.get("domain_age_days")
        domain_age_flag = self._get_age_flag(domain_age_days)
        
        # Step 4: Adjust trust score based on domain age
        trust_score = self._calculate_trust_score(
            base_trust_score,
            domain_age_days,
            is_known_credible,
            is_known_unreliable
        )
        
        # Step 5: Generate warnings
        warnings = self._generate_warnings(
            domain,
            domain_age_days,
            is_known_credible,
            is_known_unreliable,
            whois_data
        )
        
        # Step 6: Build report
        return {
            "success": True,
            "domain": domain,
            "is_known_credible": is_known_credible,
            "is_known_unreliable": is_known_unreliable,
            "trust_score": trust_score,
            "domain_age_days": domain_age_days,
            "domain_age_flag": domain_age_flag,
            "political_bias": trust_info.get("bias", "UNKNOWN"),
            "registrar": whois_data.get("registrar"),
            "registration_date": whois_data.get("registration_date"),
            "expiration_date": whois_data.get("expiration_date"),
            "name_servers": whois_data.get("name_servers", []),
            "warnings": warnings,
            "domain_type": trust_info.get("type", "unknown"),
            "source_name": trust_info.get("name", domain)
        }
    
    async def quick_domain_check(self, domain: str) -> Dict[str, Any]:
        """Quick domain check (known lists only).
        
        Args:
            domain: Domain name
            
        Returns:
            Quick credibility assessment
        """
        # Clean domain
        domain = domain.lower().replace("www.", "")
        
        trust_info = get_domain_trust(domain)
        
        return {
            "domain": domain,
            "is_credible": trust_info["category"] == "credible",
            "is_unreliable": trust_info["category"] == "unreliable",
            "trust_score": trust_info["trust_score"],
            "bias": trust_info.get("bias", "UNKNOWN"),
            "category": trust_info["category"],
            "name": trust_info.get("name", domain)
        }
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL."""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc
            if domain.startswith('www.'):
                domain = domain[4:]
            return domain.lower()
        except:
            return ""
    
    async def _get_whois_data(self, domain: str) -> Dict[str, Any]:
        """Get WHOIS data for domain.
        
        Args:
            domain: Domain name
            
        Returns:
            WHOIS data dictionary
        """
        try:
            w = whois.whois(domain)
            
            # Extract creation date
            creation_date = None
            if hasattr(w, 'creation_date'):
                if isinstance(w.creation_date, list):
                    creation_date = w.creation_date[0]
                else:
                    creation_date = w.creation_date
            
            # Calculate domain age
            domain_age_days = None
            if creation_date:
                try:
                    if isinstance(creation_date, str):
                        creation_date = datetime.fromisoformat(creation_date.replace('Z', '+00:00'))
                    domain_age_days = (datetime.now() - creation_date).days
                except:
                    pass
            
            # Extract expiration date
            expiration_date = None
            if hasattr(w, 'expiration_date'):
                if isinstance(w.expiration_date, list):
                    expiration_date = w.expiration_date[0]
                else:
                    expiration_date = w.expiration_date
            
            return {
                "registrar": w.registrar if hasattr(w, 'registrar') else None,
                "registration_date": str(creation_date) if creation_date else None,
                "expiration_date": str(expiration_date) if expiration_date else None,
                "domain_age_days": domain_age_days,
                "name_servers": w.name_servers if hasattr(w, 'name_servers') else [],
                "status": w.status if hasattr(w, 'status') else None,
                "whois_success": True
            }
            
        except Exception as e:
            print(f"WHOIS lookup failed for {domain}: {e}")
            return {
                "registrar": None,
                "registration_date": None,
                "expiration_date": None,
                "domain_age_days": None,
                "name_servers": [],
                "whois_success": False,
                "whois_error": str(e)
            }
    
    def _get_age_flag(self, domain_age_days: Optional[int]) -> str:
        """Get domain age flag.
        
        Args:
            domain_age_days: Age in days
            
        Returns:
            Age flag string
        """
        if domain_age_days is None:
            return "UNKNOWN"
        
        if domain_age_days < 30:
            return "NEW_DOMAIN_WARNING"
        elif domain_age_days < 180:
            return "YOUNG_DOMAIN"
        elif domain_age_days < 730:
            return "ESTABLISHED"
        else:
            return "MATURE_DOMAIN"
    
    def _calculate_trust_score(
        self,
        base_score: int,
        domain_age_days: Optional[int],
        is_known_credible: bool,
        is_known_unreliable: bool
    ) -> int:
        """Calculate adjusted trust score.
        
        Args:
            base_score: Base trust score from database
            domain_age_days: Domain age in days
            is_known_credible: Is in credible database
            is_known_unreliable: Is in unreliable database
            
        Returns:
            Adjusted trust score (0-100)
        """
        score = base_score
        
        # If known credible/unreliable, trust the database more
        if is_known_credible or is_known_unreliable:
            return score
        
        # For unknown domains, adjust based on age
        if domain_age_days is not None:
            if domain_age_days < 30:
                score = min(score, 30)  # Cap at 30 for very new domains
            elif domain_age_days < 180:
                score = min(score, 45)  # Cap at 45 for young domains
            elif domain_age_days >= 730:
                score = min(score + 10, 100)  # Slight boost for mature domains
        
        return max(0, min(100, score))
    
    def _generate_warnings(
        self,
        domain: str,
        domain_age_days: Optional[int],
        is_known_credible: bool,
        is_known_unreliable: bool,
        whois_data: Dict[str, Any]
    ) -> List[str]:
        """Generate warning messages.
        
        Args:
            domain: Domain name
            domain_age_days: Domain age
            is_known_credible: Is known credible
            is_known_unreliable: Is known unreliable
            whois_data: WHOIS data
            
        Returns:
            List of warning strings
        """
        warnings = []
        
        # Known unreliable warning
        if is_known_unreliable:
            if domain in UNRELIABLE_DOMAINS:
                reason = UNRELIABLE_DOMAINS[domain].get("reason", "Known unreliable source")
                warnings.append(f"⚠️ {reason}")
        
        # Domain age warnings
        if domain_age_days is not None:
            if domain_age_days < 30:
                warnings.append(f"🚨 Domain is only {domain_age_days} days old (very new)")
            elif domain_age_days < 180:
                warnings.append(f"⚠️ Domain is {domain_age_days} days old (relatively new)")
        
        # Unknown domain warning
        if not is_known_credible and not is_known_unreliable:
            warnings.append("ℹ️ Domain not found in credible or unreliable source databases")
        
        # WHOIS failure warning
        if not whois_data.get("whois_success"):
            warnings.append("⚠️ Could not retrieve WHOIS information")
        
        # No registrar info
        if not whois_data.get("registrar"):
            warnings.append("⚠️ No registrar information available")
        
        return warnings


# Legacy function for backward compatibility
async def analyze_domain(domain: str) -> Dict[str, Any]:
    """Legacy wrapper for DomainService.
    
    Args:
        domain: Domain name to analyze
        
    Returns:
        Dictionary containing domain analysis
    """
    service = DomainService()
    
    # If it looks like a URL, extract domain
    if "://" in domain:
        domain = service._extract_domain(domain)
    
    return await service.check_domain_credibility(f"https://{domain}")
