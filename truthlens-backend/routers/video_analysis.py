"""Video analysis endpoint with keyframe extraction, deepfake detection, and audio extraction."""
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from models.schemas import AnalysisResponse
from services.video_service import VideoService
from services.gemini_service import GeminiService
from services.factcheck_service import FactCheckService
from services.news_service import NewsService
from services.scoring_service import ScoringService
from utils.helpers import generate_uuid
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
async def analyze_video_file(
    file: UploadFile = File(...),
    deepfake_detection: bool = Form(True),
    frame_analysis: bool = Form(True),
    audio_extraction: bool = Form(True),
    metadata_check: bool = Form(True)
):
    """Analyze uploaded video for deepfakes, AI generation, and manipulation.
    
    Args:
        file: Uploaded video file
        deepfake_detection: Enable deepfake detection on keyframes
        frame_analysis: Enable frame extraction and analysis
        audio_extraction: Enable audio track extraction and analysis
        metadata_check: Enable metadata analysis for AI tools
        
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
        if file_ext not in settings.SUPPORTED_VIDEO_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported format. Allowed: {', '.join(settings.SUPPORTED_VIDEO_FORMATS)}"
            )
        
        # Validate file size (max 100MB)
        content = await file.read()
        if len(content) > settings.MAX_VIDEO_SIZE:
            raise HTTPException(status_code=400, detail="File too large. Maximum size: 100MB")
        
        # Save uploaded file
        upload_dir = Path("truthlens-backend/uploads")
        upload_dir.mkdir(parents=True, exist_ok=True)
        file_path = upload_dir / f"{analysis_id}{file_ext}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Initialize services
        video_service = VideoService()
        gemini_service = GeminiService()
        factcheck_service = FactCheckService()
        news_service = NewsService()
        scoring_service = ScoringService()
        
        # Output directory for frames and audio
        output_dir = Path("truthlens-backend/outputs") / analysis_id
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Step 1: Comprehensive video analysis
        print(f"[1/4] Performing video analysis...")
        video_analysis = await video_service.analyze_video_comprehensive(
            str(file_path),
            str(output_dir)
        )
        
        # Step 2: Analyze audio transcript if available
        print(f"[2/4] Analyzing transcript...")
        gemini_result = {}
        factcheck_results = {}
        news_cross_ref = {}
        
        audio_analysis = video_analysis.get("audio_analysis")
        if audio_analysis:
            transcript_data = audio_analysis.get("transcription", {})
            if transcript_data.get("text"):
                transcript_text = transcript_data["text"]
                word_count = transcript_data.get("word_count", 0)
                
                if word_count > 10:
                    print(f"Analyzing transcript ({word_count} words)...")
                    
                    try:
                        # Analyze with Gemini
                        gemini_result = await gemini_service.analyze_text_content(transcript_text)
                        
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
                        print(f"Transcript analysis error: {e}")
        
        # Build response components
        print(f"[3/4] Building response...")
        
        # Source Credibility
        source_credibility = SourceCredibility(
            score=70,
            domain=None,
            domain_age=None,
            bias="NOT_APPLICABLE",
            details="Video file analysis - no source URL"
        )
        
        # Claim Verification (from transcript if available)
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
        
        # Language Analysis (from transcript if available)
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
                tone="Video content"
            )
        
        # Media Integrity
        metadata = video_analysis.get("metadata", {})
        deepfake_data = video_analysis.get("deepfake_analysis", {})
        audio_data = audio_analysis.get("ai_voice", {}) if audio_analysis else {}
        
        media_integrity = MediaIntegrity(
            deepfake_probability=deepfake_data.get("average_deepfake_probability", 0) / 100,
            ai_voice_probability=audio_data.get("ai_voice_probability", 0) / 100 if audio_data else None,
            video_metadata=metadata,
            deepfake_frames=deepfake_data
        )
        
        # Cross-Reference
        cross_reference = CrossReference(
            factcheck_results=factcheck_results.get("results", []),
            related_articles=news_cross_ref.get("all_articles", [])[:10],
            credible_sources_count=news_cross_ref.get("credible_sources_count", 0),
            unreliable_sources_count=news_cross_ref.get("total_sources_count", 0) - news_cross_ref.get("credible_sources_count", 0)
        )
        
        # Calculate trust score
        print(f"[4/4] Calculating trust score...")
        analysis_data = {
            "gemini_result": gemini_result,
            "factcheck_results": factcheck_results,
            "source_credibility": {"score": source_credibility.score},
            "media_integrity": {
                "ai_generated_probability": 0,
                "deepfake_probability": deepfake_data.get("average_deepfake_probability", 0) / 100
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
        
        # From video analysis
        if metadata.get("is_ai_tool_detected"):
            red_flags.append(f"AI video tool detected: {metadata.get('ai_tool_name')}")
        
        if deepfake_data.get("average_deepfake_probability", 0) > 70:
            red_flags.append(f"High deepfake probability ({deepfake_data['average_deepfake_probability']:.0f}%)")
        
        if deepfake_data.get("frames_flagged", 0) > 0:
            red_flags.append(f"{deepfake_data['frames_flagged']} frame(s) flagged as deepfake")
        
        # From audio analysis
        if audio_data.get("ai_voice_probability", 0) > 70:
            red_flags.append(f"AI-generated voice detected ({audio_data['ai_voice_probability']:.0f}%)")
        
        # From text analysis
        if gemini_result:
            overall = gemini_result.get("OVERALL_ASSESSMENT", {})
            red_flags.extend(overall.get("red_flags", []))
        
        # From fact-checks
        if factcheck_results.get("false_count", 0) > 0:
            red_flags.append(f"{factcheck_results['false_count']} claim(s) rated FALSE by fact-checkers")
        
        # Build summary
        summary_parts = []
        
        if metadata.get("is_ai_tool_detected"):
            summary_parts.append(f"AI tool detected: {metadata.get('ai_tool_name')}")
        
        if deepfake_data.get("average_deepfake_probability", 0) > 50:
            summary_parts.append(f"Deepfake probability: {deepfake_data['average_deepfake_probability']:.0f}%")
        
        if audio_analysis and audio_data.get("ai_voice_probability", 0) > 50:
            summary_parts.append(f"AI voice probability: {audio_data['ai_voice_probability']:.0f}%")
        
        summary = ". ".join(summary_parts) if summary_parts else "Video analysis complete"
        
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
        print(f"Video analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Video analysis failed: {str(e)[:100]}"
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
