"""Audio analysis endpoint with transcription, AI voice detection, and spectrogram."""
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from models.schemas import AnalysisResponse
from services.audio_service import AudioService
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

router = APIRouter()


@router.post("/audio", response_model=AnalysisResponse)
async def analyze_audio_file(
    file: UploadFile = File(...),
    ai_voice_detection: bool = Form(True),
    spectrogram_analysis: bool = Form(True),
    splice_detection: bool = Form(True),
    transcription: bool = Form(True),
    claim_analysis: bool = Form(True)
):
    """Analyze uploaded audio for AI voice, transcription, and manipulation.
    
    Args:
        file: Uploaded audio file
        ai_voice_detection: Enable AI voice detection
        spectrogram_analysis: Enable spectrogram generation
        splice_detection: Enable audio splice detection
        transcription: Enable Whisper transcription
        claim_analysis: Analyze transcript for claims
        
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
        if file_ext not in settings.SUPPORTED_AUDIO_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported format. Allowed: {', '.join(settings.SUPPORTED_AUDIO_FORMATS)}"
            )
        
        # Validate file size (max 50MB)
        content = await file.read()
        if len(content) > settings.MAX_AUDIO_SIZE:
            raise HTTPException(status_code=400, detail="File too large. Maximum size: 50MB")
        
        # Save uploaded file
        upload_dir = Path("truthlens-backend/uploads")
        upload_dir.mkdir(parents=True, exist_ok=True)
        file_path = upload_dir / f"{analysis_id}{file_ext}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Initialize services
        audio_service = AudioService()
        gemini_service = GeminiService()
        factcheck_service = FactCheckService()
        news_service = NewsService()
        scoring_service = ScoringService()
        
        # Output directory for spectrograms
        output_dir = Path("truthlens-backend/outputs")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Step 1: Comprehensive audio analysis
        print(f"[1/4] Performing audio analysis...")
        audio_analysis = await audio_service.analyze_audio_comprehensive(
            str(file_path),
            str(output_dir)
        )
        
        # Step 2: Analyze transcript if available
        print(f"[2/4] Analyzing transcript...")
        gemini_result = {}
        factcheck_results = {}
        news_cross_ref = {}
        
        transcript_data = audio_analysis.get("transcription", {})
        if transcript_data.get("text") and claim_analysis:
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
            details="Audio file analysis - no source URL"
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
                tone="Audio content"
            )
        
        # Media Integrity
        ai_voice_data = audio_analysis.get("ai_voice", {})
        spectrogram_data = audio_analysis.get("spectrogram", {})
        waveform_data = audio_analysis.get("waveform", {})
        splice_data = audio_analysis.get("splice_detection", {})
        
        media_integrity = MediaIntegrity(
            ai_voice_probability=ai_voice_data.get("ai_voice_probability", 0) / 100,
            spectrogram_url=spectrogram_data.get("spectrogram_image_path"),
            transcription=transcript_data.get("text"),
            splice_detection=splice_data
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
                "ai_generated_probability": ai_voice_data.get("ai_voice_probability", 0) / 100,
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
        
        # From audio analysis
        if ai_voice_data.get("ai_voice_probability", 0) > 70:
            red_flags.append(f"High probability of AI-generated voice ({ai_voice_data['ai_voice_probability']:.0f}%)")
        
        if splice_data.get("splice_detected"):
            red_flags.append(f"Audio splicing detected at {len(splice_data.get('potential_splice_points', []))} points")
        
        # From text analysis
        if gemini_result:
            overall = gemini_result.get("OVERALL_ASSESSMENT", {})
            red_flags.extend(overall.get("red_flags", []))
        
        # From fact-checks
        if factcheck_results.get("false_count", 0) > 0:
            red_flags.append(f"{factcheck_results['false_count']} claim(s) rated FALSE by fact-checkers")
        
        # Build summary
        summary_parts = []
        
        if transcript_data.get("text"):
            summary_parts.append(f"Transcribed {transcript_data.get('word_count', 0)} words")
        
        if ai_voice_data.get("ai_voice_probability", 0) > 50:
            summary_parts.append(f"AI voice probability: {ai_voice_data['ai_voice_probability']:.0f}%")
        
        if splice_data.get("splice_detected"):
            summary_parts.append("Audio splicing detected")
        
        summary = ". ".join(summary_parts) if summary_parts else "Audio analysis complete"
        
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
            analysis_type="audio",
            input_preview=file.filename,
            source="Uploaded audio",
            trust_score=trust_score,
            verdict=verdict,
            full_report=response.model_dump()
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Audio analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Audio analysis failed: {str(e)[:100]}"
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
