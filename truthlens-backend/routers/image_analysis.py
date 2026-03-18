"""Image analysis endpoint with OCR, AI detection, EXIF, and ELA."""
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from models.schemas import AnalysisResponse
from services.image_service import ImageService
from services.ocr_service import OCRService
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
from config import settings
import aiofiles
from pathlib import Path
import os

router = APIRouter()


@router.post("/image", response_model=AnalysisResponse)
async def analyze_image_file(
    file: UploadFile = File(...),
    ai_detection: bool = Form(True),
    exif_analysis: bool = Form(True),
    ela_analysis: bool = Form(True),
    ocr_extraction: bool = Form(True)
):
    """Analyze uploaded image for AI generation, manipulation, and text content.
    
    Args:
        file: Uploaded image file
        ai_detection: Enable AI-generated detection
        exif_analysis: Enable EXIF metadata analysis
        ela_analysis: Enable Error Level Analysis
        ocr_extraction: Enable OCR text extraction
        
    Returns:
        Complete analysis response
    """
    try:
        # Generate analysis ID
        analysis_id = generate_uuid()
        
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        file_ext = Path(file.filename).suffix.lower()
        allowed_formats = ['.png', '.jpg', '.jpeg', '.webp']
        if file_ext not in allowed_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported format. Allowed: {', '.join(allowed_formats)}"
            )
        
        # Validate file size (max 10MB)
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size: 10MB")
        
        # Save uploaded file
        upload_dir = Path("truthlens-backend/uploads")
        upload_dir.mkdir(parents=True, exist_ok=True)  # Create directory if it doesn't exist
        file_path = upload_dir / f"{analysis_id}{file_ext}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Initialize services
        image_service = ImageService()
        ocr_service = OCRService()
        gemini_service = GeminiService()
        factcheck_service = FactCheckService()
        news_service = NewsService()
        scoring_service = ScoringService()
        
        # Step 1: OCR extraction (if enabled)
        print(f"[1/5] OCR extraction: {'enabled' if ocr_extraction else 'disabled'}")
        ocr_result = {}
        gemini_result = {}
        factcheck_results = {}
        news_cross_ref = {}
        
        if ocr_extraction:
            ocr_result = ocr_service.extract_text_from_image(str(file_path))
            
            # If text found, analyze it
            if ocr_result.get("has_text") and ocr_result.get("word_count", 0) > 5:
                extracted_text = ocr_result["text"]
                print(f"[2/5] Analyzing extracted text ({ocr_result['word_count']} words)...")
                
                # Analyze with Gemini
                try:
                    gemini_result = await gemini_service.analyze_text_content(extracted_text)
                    
                    # Extract claims
                    claims = gemini_result.get("CLAIM_VERIFICATION", [])
                    claim_texts = [c.get("claim_text", "") for c in claims if c.get("claim_text")]
                    
                    # Fact-check claims
                    if claim_texts:
                        factcheck_results = await factcheck_service.check_multiple_claims(claim_texts[:3])
                    
                    # Cross-reference with news
                    if claim_texts:
                        news_cross_ref = await news_service.cross_reference_claim(claim_texts[0])
                except Exception as e:
                    print(f"Text analysis error: {e}")
        
        # Step 2: Image analysis
        print(f"[3/5] Performing image analysis...")
        image_analysis = await image_service.analyze_image_comprehensive(str(file_path))
        
        # Build response components
        print(f"[4/5] Building response...")
        
        # Source Credibility
        source_credibility = SourceCredibility(
            score=70,
            domain=None,
            domain_age=None,
            bias="NOT_APPLICABLE",
            details="Image file analysis - no source URL"
        )
        
        # Claim Verification (from OCR text if available)
        if gemini_result:
            gemini_claims = gemini_result.get("CLAIM_VERIFICATION", [])
            verified_count = sum(1 for c in gemini_claims if c.get("verdict") in ["TRUE", "PARTIALLY_TRUE"])
            false_count = sum(1 for c in gemini_claims if c.get("verdict") == "FALSE")
            unverifiable_count = sum(1 for c in gemini_claims if c.get("verdict") == "UNVERIFIED")
            
            claim_verification = ClaimVerification(
                claims=gemini_claims,
                verified_count=verified_count,
                false_count=false_count,
                unverifiable_count=unverifiable_count
            )
        else:
            claim_verification = ClaimVerification()
        
        # Language Analysis (from OCR text if available)
        if gemini_result:
            lang_analysis = gemini_result.get("LANGUAGE_ANALYSIS", {})
            language_analysis = LanguageAnalysis(
                sensationalism_score=lang_analysis.get("sensationalism_score", 0),
                clickbait_score=lang_analysis.get("clickbait_score", 0),
                emotional_manipulation=_map_emotional_score(lang_analysis.get("emotional_manipulation_score", 0)),
                political_bias=lang_analysis.get("political_bias", "NOT_APPLICABLE"),
                logical_fallacies=[f.get("fallacy_name", "") for f in gemini_result.get("LOGICAL_FALLACIES", [])],
                tone=lang_analysis.get("tone", "NEUTRAL")
            )
        else:
            language_analysis = LanguageAnalysis(
                sensationalism_score=0,
                clickbait_score=0,
                emotional_manipulation="N/A",
                political_bias="NOT_APPLICABLE",
                logical_fallacies=[],
                tone="Visual content"
            )
        
        # Media Integrity
        ai_detection_data = image_analysis.get("ai_detection", {})
        exif_data_result = image_analysis.get("exif_data", {})
        ela_result = image_analysis.get("ela_analysis", {})
        
        media_integrity = MediaIntegrity(
            ai_generated_probability=ai_detection_data.get("ai_generated_probability", 0) / 100,
            exif_data=exif_data_result,
            ela_result=ela_result.get("ela_image_path"),
            reverse_search=None,
            deepfake_probability=None,
            ai_voice_probability=None,
            spectrogram_url=None
        )
        
        # Cross-Reference
        cross_reference = CrossReference(
            factcheck_results=factcheck_results.get("results", []),
            related_articles=news_cross_ref.get("all_articles", [])[:10],
            credible_sources_count=news_cross_ref.get("credible_sources_count", 0),
            unreliable_sources_count=news_cross_ref.get("total_sources_count", 0) - news_cross_ref.get("credible_sources_count", 0)
        )
        
        # Calculate trust score
        print(f"[5/5] Calculating trust score...")
        analysis_data = {
            "gemini_result": gemini_result,
            "factcheck_results": factcheck_results,
            "source_credibility": {"score": source_credibility.score},
            "media_integrity": {
                "ai_generated_probability": ai_detection_data.get("ai_generated_probability", 0) / 100,
                "deepfake_probability": 0
            },
            "cross_reference": {
                "credible_sources_count": cross_reference.credible_sources_count,
                "unreliable_sources_count": cross_reference.unreliable_sources_count
            }
        }
        
        trust_score = await scoring_service.calculate_trust_score(
            analysis_data,
            has_source=False,
            has_media=True
        )
        
        verdict = scoring_service.get_verdict(trust_score)
        
        # Collect red flags
        red_flags = []
        
        # From image analysis
        if ai_detection_data.get("ai_generated_probability", 0) > 70:
            red_flags.append(f"High probability of AI-generated content ({ai_detection_data['ai_generated_probability']:.0f}%)")
        
        if "METADATA_STRIPPED" in exif_data_result.get("suspicious_flags", []):
            red_flags.append("Image metadata completely stripped")
        
        if "EDITED_WITH_SOFTWARE" in exif_data_result.get("suspicious_flags", []):
            red_flags.append(f"Image edited with {exif_data_result.get('software', 'unknown software')}")
        
        if ela_result.get("manipulation_detected"):
            red_flags.append("Possible image manipulation detected (ELA analysis)")
        
        # From text analysis
        if gemini_result:
            overall = gemini_result.get("OVERALL_ASSESSMENT", {})
            red_flags.extend(overall.get("red_flags", []))
        
        # From fact-checks
        if factcheck_results.get("false_count", 0) > 0:
            red_flags.append(f"{factcheck_results['false_count']} claim(s) rated FALSE by fact-checkers")
        
        # Build summary
        summary_parts = []
        summary_parts.append(f"Image analysis: {image_analysis.get('overall_verdict', 'ANALYZED')}")
        
        if ocr_result.get("has_text"):
            summary_parts.append(f"Extracted {ocr_result['word_count']} words from image")
        
        if ai_detection_data.get("ai_generated_probability", 0) > 50:
            summary_parts.append(f"AI-generated probability: {ai_detection_data['ai_generated_probability']:.0f}%")
        
        summary = ". ".join(summary_parts)
        
        # Build response
        response = AnalysisResponse(
            analysis_id=analysis_id,
            overall_trust_score=trust_score,
            verdict=verdict,
            summary=summary,
            source_credibility=source_credibility,
            claim_verification=claim_verification,
            language_analysis=language_analysis,
            media_integrity=media_integrity,
            cross_reference=cross_reference,
            red_flags=list(set(red_flags))
        )
        
        # Save to database
        await save_analysis(
            analysis_id=analysis_id,
            analysis_type="image",
            input_preview=file.filename,
            source="Uploaded image",
            trust_score=trust_score,
            verdict=verdict,
            full_report=response.model_dump()
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Image analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Image analysis failed: {str(e)[:100]}"
        )


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
