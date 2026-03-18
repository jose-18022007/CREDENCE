"""Video analysis endpoint."""
from fastapi import APIRouter, File, UploadFile, HTTPException
from models.schemas import AnalysisResponse
from services.video_service import analyze_video
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


@router.post("/video", response_model=AnalysisResponse)
async def analyze_video_file(file: UploadFile = File(...)):
    """Analyze uploaded video for deepfakes.
    
    Args:
        file: Uploaded video file
        
    Returns:
        Complete analysis response
    """
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in settings.SUPPORTED_VIDEO_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported format. Supported: {settings.SUPPORTED_VIDEO_FORMATS}"
            )
        
        analysis_id = generate_uuid()
        file_path = settings.UPLOAD_DIR / f"{analysis_id}{file_ext}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        video_analysis = await analyze_video(str(file_path))
        
        source_credibility = SourceCredibility(
            score=55,
            domain=None,
            domain_age=None,
            bias=None,
            details="Video file analysis"
        )
        
        media_integrity = MediaIntegrity(
            deepfake_probability=video_analysis.get("deepfake_probability")
        )
        
        analysis_data = {
            "media_integrity": {
                "ai_generated_probability": 0,
                "deepfake_probability": video_analysis.get("deepfake_probability", 0)
            }
        }
        
        trust_score = await calculate_trust_score(analysis_data)
        verdict = get_verdict_from_score(trust_score)
        
        response = AnalysisResponse(
            analysis_id=analysis_id,
            overall_trust_score=trust_score,
            verdict=verdict,
            summary=f"Video analysis: Deepfake probability {video_analysis.get('deepfake_probability', 0):.0%}",
            source_credibility=source_credibility,
            claim_verification=ClaimVerification(),
            language_analysis=LanguageAnalysis(
                sensationalism_score=0, clickbait_score=0,
                emotional_manipulation="N/A", political_bias="N/A",
                logical_fallacies=[], tone="Visual content"
            ),
            media_integrity=media_integrity,
            cross_reference=CrossReference(),
            red_flags=["Deepfake detected"] if video_analysis.get("deepfake_probability", 0) > 0.7 else []
        )
        
        await save_analysis(
            analysis_id=analysis_id,
            analysis_type="video",
            input_preview=file.filename,
            source="Uploaded video",
            trust_score=trust_score,
            verdict=verdict,
            full_report=response.model_dump()
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
