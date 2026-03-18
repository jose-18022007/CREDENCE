"""URL analysis endpoint."""
from fastapi import APIRouter, HTTPException
from models.schemas import URLAnalysisRequest, AnalysisResponse
from services.scraper_service import scrape_url
from services.domain_service import analyze_domain
from services.gemini_service import analyze_with_gemini
from services.news_service import cross_reference_news
from services.scoring_service import calculate_trust_score
from utils.helpers import generate_uuid, get_verdict_from_score, truncate_text, extract_domain
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
        
        # Scrape URL content
        scraped = await scrape_url(url_str)
        
        if not scraped.get("success"):
            raise HTTPException(status_code=400, detail=scraped.get("error", "Failed to scrape URL"))
        
        # Analyze domain
        domain = extract_domain(url_str) or scraped.get("domain", "")
        domain_analysis = await analyze_domain(domain)
        
        # Analyze content with Gemini
        content = scraped.get("text", "")
        gemini_result = await analyze_with_gemini(content[:5000], analysis_type="url")
        
        # Cross-reference with news sources
        cross_ref = await cross_reference_news(scraped.get("title", "")[:100])
        
        # Build response
        source_credibility = SourceCredibility(
            score=domain_analysis.get("credibility_score", 50),
            domain=domain,
            domain_age=domain_analysis.get("domain_age"),
            bias=domain_analysis.get("bias", "Unknown"),
            details=domain_analysis.get("reputation", "Unknown reputation")
        )

        
        claim_verification = ClaimVerification(
            claims=[],
            verified_count=0,
            false_count=0,
            unverifiable_count=0
        )
        
        language_analysis = LanguageAnalysis(
            sensationalism_score=40,
            clickbait_score=35,
            emotional_manipulation="Moderate",
            political_bias=domain_analysis.get("bias", "Center"),
            logical_fallacies=[],
            tone="Informative"
        )
        
        media_integrity = MediaIntegrity()
        
        cross_reference = CrossReference(
            factcheck_results=[],
            related_articles=cross_ref.get("related_articles", []),
            credible_sources_count=cross_ref.get("credible_sources_count", 0),
            unreliable_sources_count=cross_ref.get("unreliable_sources_count", 0)
        )
        
        # Calculate trust score
        analysis_data = {
            "source_credibility": {"score": source_credibility.score},
            "language_analysis": {
                "sensationalism_score": language_analysis.sensationalism_score,
                "clickbait_score": language_analysis.clickbait_score
            },
            "cross_reference": {
                "credible_sources_count": cross_reference.credible_sources_count,
                "unreliable_sources_count": cross_reference.unreliable_sources_count
            }
        }
        
        trust_score = await calculate_trust_score(analysis_data)
        verdict = get_verdict_from_score(trust_score)
        
        response = AnalysisResponse(
            analysis_id=analysis_id,
            overall_trust_score=trust_score,
            verdict=verdict,
            summary=f"Analysis of {domain}: {gemini_result.get('summary', 'Completed')}",
            source_credibility=source_credibility,
            claim_verification=claim_verification,
            language_analysis=language_analysis,
            media_integrity=media_integrity,
            cross_reference=cross_reference,
            red_flags=[]
        )
        
        await save_analysis(
            analysis_id=analysis_id,
            analysis_type="url",
            input_preview=truncate_text(scraped.get("title", url_str), 200),
            source=domain,
            trust_score=trust_score,
            verdict=verdict,
            full_report=response.model_dump()
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
