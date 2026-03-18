"""Unified trust score calculator."""
from typing import Dict, Any, List


class ScoringService:
    """Service for calculating trust scores and aggregating analysis results."""
    
    @staticmethod
    async def calculate_trust_score(
        analysis_data: Dict[str, Any],
        has_source: bool = False,
        has_media: bool = False
    ) -> int:
        """Calculate overall trust score from analysis components.
        
        Args:
            analysis_data: Dictionary containing all analysis results
            has_source: Whether source/domain analysis is available
            has_media: Whether media integrity analysis is available
            
        Returns:
            Trust score (0-100)
        """
        # Determine weights based on available data
        if not has_source and not has_media:
            # Text-only analysis
            weights = {
                "content": 0.45,
                "language": 0.30,
                "cross_reference": 0.25
            }
        else:
            # Full analysis with source/media
            weights = {
                "content": 0.30,
                "source": 0.25,
                "media": 0.25,
                "language": 0.10,
                "cross_reference": 0.10
            }
        
        score = 0.0
        
        # Content Credibility (from Gemini claim analysis)
        content_score = ScoringService._calculate_content_score(analysis_data)
        score += content_score * weights["content"]
        
        # Source Reliability (from domain check)
        if has_source and "source" in weights:
            source_score = ScoringService._calculate_source_score(analysis_data)
            score += source_score * weights["source"]
        
        # Media Integrity (from image/video/audio checks)
        if has_media and "media" in weights:
            media_score = ScoringService._calculate_media_score(analysis_data)
            score += media_score * weights["media"]
        
        # Language & Bias (from Gemini language analysis)
        language_score = ScoringService._calculate_language_score(analysis_data)
        score += language_score * weights["language"]
        
        # Cross-Reference (from fact-check + news APIs)
        cross_ref_score = ScoringService._calculate_cross_reference_score(analysis_data)
        score += cross_ref_score * weights["cross_reference"]
        
        # Ensure score is within bounds
        return max(0, min(100, int(score)))
    
    @staticmethod
    def _calculate_content_score(analysis_data: Dict[str, Any]) -> float:
        """Calculate content credibility score from claim verification.
        
        Args:
            analysis_data: Analysis data
            
        Returns:
            Content score (0-100)
        """
        gemini_result = analysis_data.get("gemini_result", {})
        
        # Use Gemini's overall trust score if available
        overall = gemini_result.get("OVERALL_ASSESSMENT", {})
        if "trust_score" in overall:
            return float(overall["trust_score"])
        
        # Fallback: calculate from claim verification
        claims = gemini_result.get("CLAIM_VERIFICATION", [])
        if not claims:
            return 50.0  # Neutral score if no claims
        
        # Count verdicts
        true_count = sum(1 for c in claims if c.get("verdict") == "TRUE")
        false_count = sum(1 for c in claims if c.get("verdict") == "FALSE")
        misleading_count = sum(1 for c in claims if c.get("verdict") == "MISLEADING")
        partial_count = sum(1 for c in claims if c.get("verdict") == "PARTIALLY_TRUE")
        
        total = len(claims)
        
        # Calculate weighted score
        score = (
            (true_count * 100) +
            (partial_count * 60) +
            (misleading_count * 30) +
            (false_count * 0)
        ) / total
        
        return score
    
    @staticmethod
    def _calculate_source_score(analysis_data: Dict[str, Any]) -> float:
        """Calculate source reliability score.
        
        Args:
            analysis_data: Analysis data
            
        Returns:
            Source score (0-100)
        """
        source_credibility = analysis_data.get("source_credibility", {})
        return float(source_credibility.get("score", 50))
    
    @staticmethod
    def _calculate_media_score(analysis_data: Dict[str, Any]) -> float:
        """Calculate media integrity score.
        
        Args:
            analysis_data: Analysis data
            
        Returns:
            Media score (0-100)
        """
        media = analysis_data.get("media_integrity", {})
        
        ai_prob = media.get("ai_generated_probability", 0)
        deepfake_prob = media.get("deepfake_probability", 0)
        
        # Higher AI/deepfake probability = lower score
        avg_prob = (ai_prob + deepfake_prob) / 2
        score = 100 - (avg_prob * 100)
        
        return max(0, min(100, score))
    
    @staticmethod
    def _calculate_language_score(analysis_data: Dict[str, Any]) -> float:
        """Calculate language and bias score.
        
        Args:
            analysis_data: Analysis data
            
        Returns:
            Language score (0-100)
        """
        gemini_result = analysis_data.get("gemini_result", {})
        lang = gemini_result.get("LANGUAGE_ANALYSIS", {})
        
        sensationalism = lang.get("sensationalism_score", 50)
        clickbait = lang.get("clickbait_score", 50)
        emotional_manipulation = lang.get("emotional_manipulation_score", 50)
        
        # Lower scores = better (less manipulation)
        avg_manipulation = (sensationalism + clickbait + emotional_manipulation) / 3
        score = 100 - avg_manipulation
        
        return max(0, min(100, score))
    
    @staticmethod
    def _calculate_cross_reference_score(analysis_data: Dict[str, Any]) -> float:
        """Calculate cross-reference score.
        
        Args:
            analysis_data: Analysis data
            
        Returns:
            Cross-reference score (0-100)
        """
        cross_ref = analysis_data.get("cross_reference", {})
        
        credible = cross_ref.get("credible_sources_count", 0)
        unreliable = cross_ref.get("unreliable_sources_count", 0)
        
        if credible + unreliable == 0:
            return 50.0  # Neutral if no cross-references
        
        score = (credible / (credible + unreliable)) * 100
        return score
    
    @staticmethod
    def get_verdict(score: int) -> str:
        """Map trust score to verdict label.
        
        Args:
            score: Trust score (0-100)
            
        Returns:
            Verdict string
        """
        if score >= 85:
            return "VERIFIED"
        elif score >= 65:
            return "MOSTLY CREDIBLE"
        elif score >= 45:
            return "SUSPICIOUS"
        elif score >= 25:
            return "LIKELY MISLEADING"
        else:
            return "FAKE/FABRICATED"
    
    @staticmethod
    def get_red_flags(analysis_data: Dict[str, Any]) -> List[str]:
        """Aggregate all red flags from analysis modules.
        
        Args:
            analysis_data: Complete analysis data
            
        Returns:
            List of red flag strings
        """
        red_flags = []
        
        # From Gemini analysis
        gemini_result = analysis_data.get("gemini_result", {})
        overall = gemini_result.get("OVERALL_ASSESSMENT", {})
        red_flags.extend(overall.get("red_flags", []))
        
        # From viral forward check
        viral_check = gemini_result.get("VIRAL_FORWARD_CHECK", {})
        if viral_check.get("is_viral_forward"):
            red_flags.append("Appears to be viral social media forward")
            red_flags.extend(viral_check.get("forward_patterns", []))
        
        # From claim verification
        claims = gemini_result.get("CLAIM_VERIFICATION", [])
        false_claims = [c for c in claims if c.get("verdict") == "FALSE"]
        if len(false_claims) > 0:
            red_flags.append(f"{len(false_claims)} false claim(s) detected")
        
        # From language analysis
        lang = gemini_result.get("LANGUAGE_ANALYSIS", {})
        if lang.get("sensationalism_score", 0) > 70:
            red_flags.append("Highly sensationalist language")
        if lang.get("clickbait_score", 0) > 70:
            red_flags.append("Clickbait-style content")
        if lang.get("emotional_manipulation_score", 0) > 70:
            red_flags.append("Strong emotional manipulation detected")
        
        # From logical fallacies
        fallacies = gemini_result.get("LOGICAL_FALLACIES", [])
        if len(fallacies) > 2:
            red_flags.append(f"{len(fallacies)} logical fallacies detected")
        
        # From source credibility
        source = analysis_data.get("source_credibility", {})
        if source.get("score", 100) < 30:
            red_flags.append("Unreliable source domain")
        
        # From media integrity
        media = analysis_data.get("media_integrity", {})
        if media.get("ai_generated_probability", 0) > 0.7:
            red_flags.append("Likely AI-generated content")
        if media.get("deepfake_probability", 0) > 0.7:
            red_flags.append("Possible deepfake detected")
        
        return list(set(red_flags))  # Remove duplicates


# Legacy function for backward compatibility
async def calculate_trust_score(analysis_data: Dict[str, Any]) -> int:
    """Legacy wrapper for ScoringService.
    
    Args:
        analysis_data: Analysis data
        
    Returns:
        Trust score (0-100)
    """
    service = ScoringService()
    return await service.calculate_trust_score(analysis_data)
