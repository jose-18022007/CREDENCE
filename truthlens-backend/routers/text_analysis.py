"""Text analysis endpoint."""
from fastapi import APIRouter, HTTPException
from models.schemas import TextAnalysisRequest, AnalysisResponse
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


@router.post("/text", response_model=AnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    """Analyze text content for credibility and misinformation.
    
    Args:
        request: Text analysis request
        
    Returns:
        Complete analysis response
    """
    try:
        # Generate analysis ID
        analysis_id = generate_uuid()
        
        # Initialize services
        gemini_service = GeminiService()
        factcheck_service = FactCheckService()
        news_service = NewsService()
        scoring_service = ScoringService()
        
        # Step 1: Analyze with Gemini (comprehensive structured analysis)
        gemini_result = await gemini_service.analyze_text_content(
            request.text,
            check_bias=request.check_bias,
            check_fallacies=request.check_fallacies
        )
        
        # Extract claims from Gemini analysis
        gemini_claims = gemini_result.get("CLAIM_VERIFICATION", [])
        claim_texts = [c.get("claim_text", "") for c in gemini_claims if c.get("claim_text")]
        
        # Step 2: Fact-check claims (with error handling)
        factcheck_results = {}
        try:
            if claim_texts:
                factcheck_results = await factcheck_service.check_multiple_claims(claim_texts[:3])
        except Exception as e:
            print(f"Fact-check service error (continuing without it): {e}")
            factcheck_results = {"fact_checks_found": 0, "results": [], "has_fact_checks": False}
        
        # Step 3: Cross-reference with news (with error handling)
        news_cross_ref = {}
        try:
            # Use first claim or first 100 chars of text
            query = claim_texts[0] if claim_texts else request.text[:100]
            news_cross_ref = await news_service.cross_reference_claim(query)
        except Exception as e:
            print(f"News service error (continuing without it): {e}")
            news_cross_ref = {
                "credible_sources_count": 0,
                "total_sources_count": 0,
                "all_articles": [],
                "cross_reference_score": 50
            }
        
        # Build response components from Gemini analysis
        lang_analysis = gemini_result.get("LANGUAGE_ANALYSIS", {})
        overall_assessment = gemini_result.get("OVERALL_ASSESSMENT", {})
        
        # Source Credibility (text-only, no domain)
        source_credibility = SourceCredibility(
            score=70,  # Base score for text content
            domain=None,
            domain_age=None,
            bias=lang_analysis.get("political_bias", "NOT_APPLICABLE"),
            details="Text content analysis - no source URL provided"
        )
        
        # Claim Verification - merge Gemini + Fact-check results
        verified_count = sum(1 for c in gemini_claims if c.get("verdict") in ["TRUE", "PARTIALLY_TRUE"])
        false_count = sum(1 for c in gemini_claims if c.get("verdict") == "FALSE")
        misleading_count = sum(1 for c in gemini_claims if c.get("verdict") == "MISLEADING")
        unverifiable_count = sum(1 for c in gemini_claims if c.get("verdict") == "UNVERIFIED")
        
        # Add fact-check results to claims
        for claim in gemini_claims:
            claim["external_fact_checks"] = []
        
        if factcheck_results.get("has_fact_checks"):
            # Match fact-checks to claims (simplified)
            for fc in factcheck_results.get("results", [])[:5]:
                if gemini_claims:
                    gemini_claims[0].setdefault("external_fact_checks", []).append(fc)
        
        claim_verification = ClaimVerification(
            claims=gemini_claims,
            verified_count=verified_count,
            false_count=false_count,
            unverifiable_count=unverifiable_count
        )
        
        # Language Analysis from Gemini
        language_analysis = LanguageAnalysis(
            sensationalism_score=lang_analysis.get("sensationalism_score", 50),
            clickbait_score=lang_analysis.get("clickbait_score", 50),
            emotional_manipulation=_map_emotional_score(
                lang_analysis.get("emotional_manipulation_score", 50)
            ),
            political_bias=lang_analysis.get("political_bias", "NOT_APPLICABLE"),
            logical_fallacies=[
                f.get("fallacy_name", "Unknown") 
                for f in gemini_result.get("LOGICAL_FALLACIES", [])
            ],
            tone=lang_analysis.get("tone", "NEUTRAL")
        )
        
        # Media Integrity (not applicable for text)
        media_integrity = MediaIntegrity()
        
        # Cross-Reference with news results
        cross_reference = CrossReference(
            factcheck_results=factcheck_results.get("results", []),
            related_articles=news_cross_ref.get("all_articles", [])[:10],
            credible_sources_count=news_cross_ref.get("credible_sources_count", 0),
            unreliable_sources_count=news_cross_ref.get("total_sources_count", 0) - news_cross_ref.get("credible_sources_count", 0)
        )
        
        # Calculate comprehensive trust score
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
            has_source=False,
            has_media=False
        )
        
        verdict = scoring_service.get_verdict(trust_score)
        red_flags = scoring_service.get_red_flags(analysis_data)
        
        # Add fact-check red flags
        if factcheck_results.get("false_count", 0) > 0:
            red_flags.append(f"{factcheck_results['false_count']} claim(s) rated FALSE by fact-checkers")
        
        # Add news cross-ref red flags
        if news_cross_ref.get("credible_sources_count", 0) == 0 and news_cross_ref.get("total_sources_count", 0) > 0:
            red_flags.append("No credible news sources found reporting this")
        
        # Build response
        response = AnalysisResponse(
            analysis_id=analysis_id,
            overall_trust_score=trust_score,
            verdict=verdict,
            summary=overall_assessment.get(
                "summary",
                f"Analysis completed: {len(gemini_claims)} claims verified, {factcheck_results.get('fact_checks_found', 0)} external fact-checks found"
            ),
            source_credibility=source_credibility,
            claim_verification=claim_verification,
            language_analysis=language_analysis,
            media_integrity=media_integrity,
            cross_reference=cross_reference,
            red_flags=list(set(red_flags))  # Remove duplicates
        )
        
        # Save to database
        await save_analysis(
            analysis_id=analysis_id,
            analysis_type="text",
            input_preview=truncate_text(request.text, 200),
            source="Pasted text",
            trust_score=trust_score,
            verdict=verdict,
            full_report=response.model_dump()
        )
        
        return response
        
    except Exception as e:
        # Log error but don't expose internal details
        print(f"Analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed. Please try again. Error: {str(e)[:100]}"
        )


def _map_emotional_score(score: int) -> str:
    """Map emotional manipulation score to label.
    
    Args:
        score: Score 0-100
        
    Returns:
        Label string
    """
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

        
        media_integrity = MediaIntegrity()
        
        cross_reference = CrossReference(
            factcheck_results=fact_check_results,
            related_articles=[],
            credible_sources_count=0,
            unreliable_sources_count=0
        )
        
        # Calculate trust score
        analysis_data = {
            "source_credibility": {"score": source_credibility.score},
            "claim_verification": {
                "verified_count": claim_verification.verified_count,
                "false_count": claim_verification.false_count,
                "unverifiable_count": claim_verification.unverifiable_count
            },
            "language_analysis": {
                "sensationalism_score": language_analysis.sensationalism_score,
                "clickbait_score": language_analysis.clickbait_score
            }
        }
        
        trust_score = await calculate_trust_score(analysis_data)
        verdict = get_verdict_from_score(trust_score)
        
        # Build response
        response = AnalysisResponse(
            analysis_id=analysis_id,
            overall_trust_score=trust_score,
            verdict=verdict,
            summary=gemini_result.get("summary", "Analysis completed"),
            source_credibility=source_credibility,
            claim_verification=claim_verification,
            language_analysis=language_analysis,
            media_integrity=media_integrity,
            cross_reference=cross_reference,
            red_flags=gemini_result.get("red_flags", [])
        )
        
        # Save to database
        await save_analysis(
            analysis_id=analysis_id,
            analysis_type="text",
            input_preview=truncate_text(request.text, 200),
            source="Pasted text",
            trust_score=trust_score,
            verdict=verdict,
            full_report=response.model_dump()
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
