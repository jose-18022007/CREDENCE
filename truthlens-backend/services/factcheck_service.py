"""Google Fact Check Tools API integration."""
import httpx
import asyncio
from typing import List, Dict, Any
from config import settings


class FactCheckService:
    """Service for fact-checking claims using Google Fact Check Tools API."""
    
    def __init__(self):
        """Initialize fact-check service."""
        self.base_url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
        self.delay_between_requests = 0.5  # seconds
    
    async def search_claims(self, query: str, language: str = "en") -> List[Dict[str, Any]]:
        """Search for fact-checks of a claim.
        
        Args:
            query: Claim text to search
            language: Language code (default: en)
            
        Returns:
            List of fact-check results
        """
        try:
            params = {
                "query": query,
                "languageCode": language
            }
            
            # Add API key if available (optional)
            if settings.GEMINI_API_KEY:
                params["key"] = settings.GEMINI_API_KEY
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.base_url,
                    params=params,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    claims = data.get("claims", [])
                    
                    results = []
                    for claim in claims[:5]:  # Limit to 5 results
                        claim_review = claim.get("claimReview", [{}])[0] if claim.get("claimReview") else {}
                        
                        results.append({
                            "claim_text": claim.get("text", ""),
                            "claimant": claim.get("claimant", "Unknown"),
                            "claim_date": claim.get("claimDate", ""),
                            "fact_check_rating": claim_review.get("textualRating", "Unrated"),
                            "fact_checker_name": claim_review.get("publisher", {}).get("name", "Unknown"),
                            "fact_checker_url": claim_review.get("url", ""),
                            "review_date": claim_review.get("reviewDate", ""),
                            "title": claim_review.get("title", "")
                        })
                    
                    return results if results else []
                
                return []
                
        except Exception as e:
            print(f"Fact check error: {e}")
            return []
    
    async def check_multiple_claims(self, claims: List[str]) -> Dict[str, Any]:
        """Check multiple claims with rate limiting.
        
        Args:
            claims: List of claim texts
            
        Returns:
            Aggregated fact-check results
        """
        all_results = []
        verified_count = 0
        false_count = 0
        mixed_count = 0
        
        for claim in claims[:5]:  # Limit to 5 claims
            results = await self.search_claims(claim)
            
            if results:
                all_results.extend(results)
                
                # Count ratings
                for result in results:
                    rating = result.get("fact_check_rating", "").lower()
                    if "true" in rating and "false" not in rating:
                        verified_count += 1
                    elif "false" in rating:
                        false_count += 1
                    else:
                        mixed_count += 1
            
            # Rate limiting
            if claim != claims[-1]:  # Don't delay after last claim
                await asyncio.sleep(self.delay_between_requests)
        
        return {
            "fact_checks_found": len(all_results),
            "results": all_results,
            "verified_count": verified_count,
            "false_count": false_count,
            "mixed_count": mixed_count,
            "has_fact_checks": len(all_results) > 0
        }


# Legacy function for backward compatibility
async def check_facts(query: str, language: str = "en") -> List[Dict[str, Any]]:
    """Legacy wrapper for FactCheckService.
    
    Args:
        query: Query string to fact-check
        language: Language code (default: en)
        
    Returns:
        List of fact-check results
    """
    service = FactCheckService()
    return await service.search_claims(query, language)


async def verify_claim(claim: str) -> Dict[str, Any]:
    """Verify a specific claim.
    
    Args:
        claim: Claim text to verify
        
    Returns:
        Verification result
    """
    service = FactCheckService()
    results = await service.search_claims(claim)
    
    if not results:
        return {
            "claim": claim,
            "verdict": "UNVERIFIABLE",
            "confidence": 0,
            "sources": []
        }
    
    # Analyze results to determine verdict
    return {
        "claim": claim,
        "verdict": "MIXED",
        "confidence": 50,
        "sources": results
    }
