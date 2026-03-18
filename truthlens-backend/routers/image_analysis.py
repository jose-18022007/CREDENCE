"""Image analysis endpoint."""
from fastapi import APIRouter, File, UploadFile, HTTPException
from models.schemas import AnalysisResponse
from services.image_service import analyze_image
from services.ocr_service import extract_text_from_image
from services.scoring_service import calculate_trust_score
from utils.helpers import generate_uuid, get_verdict_from_score
from database import save_analysis
from models.schemas import (
    SourceCredibility, ClaimVerification, LanguageAnalysis,
    MediaIntegrity, CrossReference
)
from config import settings
import aiofiles
from pathlib import Path

router = APIRouter()


@router.post("/image", response_model=AnalysisResponse)
async def analyze_image_file(file: UploadFile = File(...)):
    """Analyze uploaded image for AI generation and manipulation.
    
    Args:
        file: Uploaded image file
        
    Returns:
        Complete analysis response
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in settings.SUPPORTED_IMAGE_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported format. Supported: {settings.SUPPORTED_IMAGE_FORMATS}"
            )
        
        # Save uploaded file
        analysis_id = generate_uuid()
        file_path = settings.UPLOAD_DIR / f"{analysis_id}{file_ext}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Analyze image
        image_analysis = await analyze_image(str(file_path))
        
        # Extract text if present
        extracted_text = await extract_text_from_image(str(file_path))
        
        # Build response
        source_credibility = SourceCredibility(
            score=60,
            domain=None,
            domain_age=None,
            bias=None,
            details="Image file analysis"
        )

        
        claim_verification = ClaimVerification()
        
        language_analysis = LanguageAnalysis(
            sensationalism_score=0,
            clickbait_score=0,
            emotional_manipulation="N/A",
            political_bias="N/A",
            logical_fallacies=[],
            tone="Visual content"
        )
        
        media_integrity = MediaIntegrity(
            ai_generated_probability=image_analysis.get("ai_generated_probability"),
            exif_data=image_analysis.get("exif_data"),
            ela_result=image_analysis.get("ela_result", {}).get("ela_image_path"),
            reverse_search=None
        )
        
        cross_reference = CrossReference()
        
        # Calculate trust score
        analysis_data = {
            "media_integrity": {
                "ai_generated_probability": image_analysis.get("ai_generated_probability", 0),
                "deepfake_probability": 0
            }
        }
        
        trust_score = await calculate_trust_score(analysis_data)
        verdict = get_verdict_from_score(trust_score)
        
        response = AnalysisResponse(
            analysis_id=analysis_id,
            overall_trust_score=trust_score,
            verdict=verdict,
            summary=f"Image analysis: AI probability {image_analysis.get('ai_generated_probability', 0):.0%}",
            source_credibility=source_credibility,
            claim_verification=claim_verification,
            language_analysis=language_analysis,
            media_integrity=media_integrity,
            cross_reference=cross_reference,
            red_flags=["AI-generated content detected"] if image_analysis.get("ai_generated_probability", 0) > 0.7 else []
        )
        
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
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
