"""Pydantic models for request/response validation."""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime


class TextAnalysisRequest(BaseModel):
    """Request model for text analysis."""
    text: str = Field(..., min_length=10, max_length=50000, description="Text content to analyze")
    check_bias: bool = Field(True, description="Check for political bias")
    deep_factcheck: bool = Field(True, description="Enable deep fact-checking mode")
    check_fallacies: bool = Field(True, description="Check for logical fallacies")


class URLAnalysisRequest(BaseModel):
    """Request model for URL analysis."""
    url: HttpUrl = Field(..., description="URL of the article or page to analyze")


class SourceCredibility(BaseModel):
    """Source credibility information."""
    score: int = Field(..., ge=0, le=100, description="Credibility score (0-100)")
    domain: Optional[str] = Field(None, description="Domain name")
    domain_age: Optional[str] = Field(None, description="Domain age")
    bias: Optional[str] = Field(None, description="Political bias rating")
    details: str = Field(..., description="Detailed credibility assessment")


class ClaimVerification(BaseModel):
    """Claim verification results."""
    claims: List[Dict[str, Any]] = Field(default_factory=list, description="List of verified claims")
    verified_count: int = Field(0, description="Number of verified claims")
    false_count: int = Field(0, description="Number of false claims")
    unverifiable_count: int = Field(0, description="Number of unverifiable claims")


class LanguageAnalysis(BaseModel):
    """Language and bias analysis."""
    sensationalism_score: int = Field(..., ge=0, le=100)
    clickbait_score: int = Field(..., ge=0, le=100)
    emotional_manipulation: str = Field(..., description="Level of emotional manipulation")
    political_bias: str = Field(..., description="Political bias spectrum")
    logical_fallacies: List[str] = Field(default_factory=list)
    tone: str = Field(..., description="Overall tone of the content")


class MediaIntegrity(BaseModel):
    """Media integrity analysis."""
    ai_generated_probability: Optional[float] = Field(None, ge=0, le=1, description="AI generation probability")
    exif_data: Optional[Dict[str, Any]] = Field(None, description="EXIF metadata")
    ela_result: Optional[str] = Field(None, description="Error Level Analysis result")
    reverse_search: Optional[Dict[str, Any]] = Field(None, description="Reverse image search results")
    deepfake_probability: Optional[float] = Field(None, ge=0, le=1, description="Deepfake probability")
    ai_voice_probability: Optional[float] = Field(None, ge=0, le=1, description="AI voice probability")
    spectrogram_url: Optional[str] = Field(None, description="URL to spectrogram image")


class CrossReference(BaseModel):
    """Cross-reference and fact-check results."""
    factcheck_results: List[Dict[str, Any]] = Field(default_factory=list)
    related_articles: List[Dict[str, Any]] = Field(default_factory=list)
    credible_sources_count: int = Field(0)
    unreliable_sources_count: int = Field(0)


class AnalysisResponse(BaseModel):
    """Complete analysis response."""
    analysis_id: str = Field(..., description="Unique analysis identifier")
    overall_trust_score: int = Field(..., ge=0, le=100, description="Overall trust score (0-100)")
    verdict: str = Field(..., description="Final verdict")
    summary: str = Field(..., description="Analysis summary")
    source_credibility: SourceCredibility
    claim_verification: ClaimVerification
    language_analysis: LanguageAnalysis
    media_integrity: MediaIntegrity
    cross_reference: CrossReference
    red_flags: List[str] = Field(default_factory=list, description="List of red flags detected")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    
    class Config:
        json_schema_extra = {
            "example": {
                "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
                "overall_trust_score": 72,
                "verdict": "MOSTLY CREDIBLE",
                "summary": "Content appears mostly credible with minor concerns.",
                "timestamp": "2026-03-18T10:30:00Z"
            }
        }


class DashboardStats(BaseModel):
    """Dashboard statistics."""
    total_analyses: int = Field(0, description="Total number of analyses")
    fake_detected: int = Field(0, description="Number of fake content detected")
    credible_detected: int = Field(0, description="Number of credible content detected")
    suspicious_detected: int = Field(0, description="Number of suspicious content detected")
    type_breakdown: Dict[str, int] = Field(default_factory=dict, description="Breakdown by content type")
    recent_analyses: List[Dict[str, Any]] = Field(default_factory=list, description="Recent analysis records")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_analyses": 150,
                "fake_detected": 45,
                "credible_detected": 80,
                "suspicious_detected": 25,
                "type_breakdown": {
                    "text": 60,
                    "url": 50,
                    "image": 25,
                    "video": 10,
                    "audio": 5
                }
            }
        }
