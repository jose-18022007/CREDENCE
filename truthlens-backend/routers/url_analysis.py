"""URL analysis endpoint."""
from fastapi import APIRouter, HTTPException
from models.schemas import URLAnalysisRequest, AnalysisResponse
from services.scraper_service import ScraperService
from services.domain_service import DomainService
from services.gemini_service import GeminiService
from services.factcheck_service import FactCheckService
from services.news_service import NewsService
from services.scoring_service import ScoringService
from utils.helpers import generate_uuid, truncate_text
from database import save_analysis
from models.schemas import (
    SourceCredibility, ClaimVerification, LanguageAnalysis,
    MediaIntegrity, CrossReference
)

router = APIRouter()


@router.post("/url", response_model=AnalysisResponse)
async def analyze_url(request: URLAnalysisRequest):
    """Analyze URL content for credibility.
    
    Args:
        request: URL analysis request
        
    Returns:
        Complete analysis response
    """
    try:
        analysis_id = generate_uuid()
        url_str = str(request.url)
        
        # Initialize services
        scraper_service = ScraperService()
        domain_service = DomainService()
        gemini_service = GeminiService()
        factcheck_service = FactCheckService()
        news_service = NewsService()
        scoring_service = ScoringService()
        
        # Step 1: Scrape article content
        scraped = await scraper_service.scrape_article(url_str)
        
        # Step 2: Check domain credibility (always do this, even if scraping fails)
        domain_check = await domain_service.check_domain_credibility(url_str)
        
        # Handle scraping failure
        if not scraped.get("success"):
            # Return partial analysis with domain check only
            source_credibility = SourceCredibility(
                score=domain_check.get("trust_score", 50),
                domain=domain_check.get("domain"),
                domain_age=f"{domain_check.get('domain_age_days', 0)} days" if domain_check.get('domain_age_days') else None,
                bias=domain_check.get("political_bias", "UNKNOWN"),
                details=f"Could not scrape content: {scraped.get('error', 'Unknown error')}. Domain analysis only."
            )
            
            response = AnalysisResponse(
                analysis_id=analysis_id,
                overall_trust_score=domain_check.get("trust_score", 50),
                verdict=scoring_service.get_verdict(domain_check.get("trust_score", 50)),
                summary=f"Unable to analyze content. {scraped.get('error', 'Scraping failed')}",
                source_credibility=source_credibility,
                claim_verification=ClaimVerification(),
                language_analysis=LanguageAnalysis(
                    sensationalism_score=0,
                    clickbait_score=0,
                    emotional_manipulation="N/A",
                    political_bias="N/A",
                    logical_fallacies=[],
                    tone="N/A"
                ),
                media_integrity=MediaIntegrity(),
                cross_reference=CrossReference(),
                red_flags=domain_check.get("warnings", [])
            )
            
            await save_analysis(
                analysis_id=analysis_id,
                analysis_type="url",
                input_preview=url_str,
                source=domain_check.get("domain", "unknown"),
                trust_score=domain_check.get("trust_score", 50),
                verdict=response.verdict,
                full_report=response.model_dump()
            )
            
            return response
        
        # Step 3: Analyze content with Gemini
        content = scraped.get("body", "")
        title = scraped.get("title", "")
        
        if not content or len(content) < 50:
            raise HTTPException(
                status_code=400,
                detail="Scraped content is too short or empty. URL may point to non-article content."
            )
        
        gemini_result = await gemini_service.analyze_text_content(
            content[:8000],  # Limit content length
            check_bias=True,
            check_fallacies=True
        )
        
        # Extract claims
        gemini_claims = gemini_result.get("CLAIM_VERIFICATION", [])
        claim_texts = [c.get("claim_text", "") for c in gemini_claims if c.get("claim_text")]
        
        # Step 4: Fact-check claims (with error handling)
        factcheck_results = {}
        try:
            if claim_texts:
                factcheck_results = await factcheck_service.check_multiple_claims(claim_texts[:3])
        except Exception as e:
            print(f"Fact-check error (continuing): {e}")
            factcheck_results = {"fact_checks_found": 0, "results": []}
        
        # Step 5: Cross-reference with news (with error handling)
        news_cross_ref = {}
        try:
            news_cross_ref = await news_service.cross_reference_claim(title or claim_texts[0] if claim_texts else content[:100])
        except Exception as e:
            print(f"News service error (continuing): {e}")
            news_cross_ref = {
                "credible_sources_count": 0,
                "total_sources_count": 0,
                "all_articles": []
            }
        
        # Build source credibility from domain check
        source_credibility = SourceCredibility(
            score=domain_check.get("trust_score", 50),
            domain=domain_check.get("domain"),
            domain_age=f"{domain_check.get('domain_age_days', 0)} days" if domain_check.get('domain_age_days') else "Unknown",
            bias=domain_check.get("political_bias", "UNKNOWN"),
            details=_build_source_details(domain_check, scraped)
        )
        
        # Build claim verification
        verified_count = sum(1 for c in gemini_claims if c.get("verdict") in ["TRUE", "PARTIALLY_TRUE"])
        false_count = sum(1 for c in gemini_claims if c.get("verdict") == "FALSE")
        unverifiable_count = sum(1 for c in gemini_claims if c.get("verdict") == "UNVERIFIED")
        
        # Add external fact-checks
        if factcheck_results.get("results"):
            for fc in factcheck_results["results"][:5]:
                if gemini_claims:
                    gemini_claims[0].setdefault("external_fact_checks", []).append(fc)
        
        claim_verification = ClaimVerification(
            claims=gemini_claims,
            verified_count=verified_count,
            false_count=false_count,
            unverifiable_count=unverifiable_count
        )
        
        # Build language analysis
        lang_analysis = gemini_result.get("LANGUAGE_ANALYSIS", {})
        language_analysis = LanguageAnalysis(
            sensationalism_score=lang_analysis.get("sensationalism_score", 50),
            clickbait_score=lang_analysis.get("clickbait_score", 50),
            emotional_manipulation=_map_emotional_score(lang_analysis.get("emotional_manipulation_score", 50)),
            political_bias=lang_analysis.get("political_bias", domain_check.get("political_bias", "UNKNOWN")),
            logical_fallacies=[f.get("fallacy_name", "Unknown") for f in gemini_result.get("LOGICAL_FALLACIES", [])],
            tone=lang_analysis.get("tone", "NEUTRAL")
        )
        
        # Media integrity (not applicable for URL text)
        media_integrity = MediaIntegrity()
        
        # Cross-reference
        cross_reference = CrossReference(
            factcheck_results=factcheck_results.get("results", []),
            related_articles=news_cross_ref.get("all_articles", [])[:10],
            credible_sources_count=news_cross_ref.get("credible_sources_count", 0),
            unreliable_sources_count=news_cross_ref.get("total_sources_count", 0) - news_cross_ref.get("credible_sources_count", 0)
        )
        
        # Step 6: Calculate comprehensive trust score
        analysis_data = {
            "gemini_result": gemini_result,
            "source_credibility": {"score": source_credibility.score},
            "cross_reference": {
                "credible_sources_count": cross_reference.credible_sources_count,
                "unreliable_sources_count": cross_reference.unreliable_sources_count
            }
        }
        
        trust_score = await scoring_service.calculate_trust_score(
            analysis_data,
            has_source=True,
            has_media=False
        )
        
        verdict = scoring_service.get_verdict(trust_score)
        red_flags = scoring_service.get_red_flags(analysis_data)
        
        # Add domain-specific red flags
        red_flags.extend(domain_check.get("warnings", []))
        
        # Add fact-check red flags
        if factcheck_results.get("false_count", 0) > 0:
            red_flags.append(f"{factcheck_results['false_count']} claim(s) rated FALSE by fact-checkers")
        
        # Build response
        overall_assessment = gemini_result.get("OVERALL_ASSESSMENT", {})
        response = AnalysisResponse(
            analysis_id=analysis_id,
            overall_trust_score=trust_score,
            verdict=verdict,
            summary=overall_assessment.get(
                "summary",
                f"Analysis of {domain_check.get('domain', 'article')}: {len(gemini_claims)} claims verified"
            ),
            source_credibility=source_credibility,
            claim_verification=claim_verification,
            language_analysis=language_analysis,
            media_integrity=media_integrity,
            cross_reference=cross_reference,
            red_flags=list(set(red_flags))  # Remove duplicates
        )
        
        # Step 7: Save to database
        await save_analysis(
            analysis_id=analysis_id,
            analysis_type="url",
            input_preview=truncate_text(title or url_str, 200),
            source=domain_check.get("domain", "unknown"),
            trust_score=trust_score,
            verdict=verdict,
            full_report=response.model_dump()
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"URL analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)[:100]}"
        )


def _build_source_details(domain_check: dict, scraped: dict) -> str:
    """Build source credibility details string."""
    details = []
    
    if domain_check.get("is_known_credible"):
        details.append(f"✓ {domain_check.get('source_name', 'Source')} is a known credible source")
    elif domain_check.get("is_known_unreliable"):
        details.append(f"✗ {domain_check.get('source_name', 'Source')} is a known unreliable source")
    else:
        details.append(f"? {domain_check.get('domain', 'Domain')} is not in known source databases")
    
    if domain_check.get("domain_age_days"):
        age_days = domain_check["domain_age_days"]
        if age_days < 30:
            details.append(f"⚠ Very new domain ({age_days} days old)")
        elif age_days < 180:
            details.append(f"⚠ Relatively new domain ({age_days} days old)")
        else:
            details.append(f"✓ Established domain ({age_days} days old)")
    
    if domain_check.get("registrar"):
        details.append(f"Registrar: {domain_check['registrar']}")
    
    if scraped.get("method") == "beautifulsoup_fallback":
        details.append("⚠ Content extracted using fallback method")
    
    return " | ".join(details)


def _map_emotional_score(score: int) -> str:
    """Map emotional manipulation score to label."""
    if score >= 75:
        return "Very High"
    elif score >= 60:
        return "High"
    elif score >= 40:
        return "Moderate"
    elif score >= 20:
        return "Low"
    else:
        return "Very Low"
