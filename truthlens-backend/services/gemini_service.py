"""Google Gemini API integration for content analysis."""
from google import genai
from google.genai import types
from typing import Dict, Any, Optional
import json
import re
import asyncio
from config import settings

# Configure Gemini client
client = None
if settings.GEMINI_API_KEY:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    """Service for analyzing content using Google Gemini API."""
    
    def __init__(self):
        """Initialize Gemini service."""
        self.model_name = "models/gemini-flash-latest"  # Latest flash model with better quota
        self.max_retries = 3
        self.base_delay = 1.0
        
    async def analyze_text_content(
        self,
        text: str,
        check_bias: bool = True,
        check_fallacies: bool = True
    ) -> Dict[str, Any]:
        """Analyze text content using Gemini with structured prompt.
        
        Args:
            text: Text content to analyze
            check_bias: Whether to check for political bias
            check_fallacies: Whether to check for logical fallacies
            
        Returns:
            Dictionary containing structured analysis results
        """
        if not settings.GEMINI_API_KEY or not client:
            return self._get_fallback_response("Gemini API key not configured")
        
        prompt = self._build_analysis_prompt(text, check_bias, check_fallacies)
        
        # Retry logic with exponential backoff
        for attempt in range(self.max_retries):
            try:
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                
                if not response or not response.text:
                    raise ValueError("Empty response from Gemini")
                
                # Parse JSON response
                parsed_result = self._parse_gemini_response(response.text)
                
                if parsed_result:
                    return parsed_result
                
                # If parsing failed, try next attempt
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.base_delay * (2 ** attempt))
                    continue
                
                return self._get_fallback_response("Failed to parse Gemini response")
                
            except Exception as e:
                error_msg = str(e)
                print(f"Gemini API error (attempt {attempt + 1}/{self.max_retries}): {error_msg}")
                
                # Check for specific API key errors
                if "403" in error_msg or "API key" in error_msg or "leaked" in error_msg.lower():
                    return self._get_fallback_response(f"Gemini API error: {error_msg}")
                
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.base_delay * (2 ** attempt))
                else:
                    return self._get_fallback_response(f"Gemini API error: {error_msg}")
        
        return self._get_fallback_response("Max retries exceeded")
    
    def _build_analysis_prompt(
        self,
        text: str,
        check_bias: bool,
        check_fallacies: bool
    ) -> str:
        """Build structured analysis prompt for Gemini.
        
        Args:
            text: Text to analyze
            check_bias: Include bias analysis
            check_fallacies: Include fallacy detection
            
        Returns:
            Formatted prompt string
        """
        # Truncate text if too long
        max_length = 8000
        truncated_text = text[:max_length] + ("..." if len(text) > max_length else "")
        
        prompt = f"""You are TruthLens, an expert fact-checking and media integrity AI analyst. Analyze the following content for misinformation, bias, and manipulation.

CONTENT TO ANALYZE:
{truncated_text}

Perform the following analysis and return a JSON response:

1. CLAIM_EXTRACTION: Extract every factual claim made in this content. List each claim separately.

2. CLAIM_VERIFICATION: For each extracted claim, assess:
   - claim_text: the exact claim
   - verdict: one of "TRUE", "FALSE", "MISLEADING", "UNVERIFIED", "PARTIALLY_TRUE"
   - confidence: 0-100
   - reasoning: brief explanation of why you rated it this way
   - evidence: what evidence supports or contradicts this claim

3. LANGUAGE_ANALYSIS:
   - sensationalism_score: 0-100 (how sensationalist is the language)
   - clickbait_score: 0-100
   - emotional_manipulation_score: 0-100
   - emotional_triggers: list of emotional manipulation techniques found (e.g., "fear-mongering", "outrage bait", "false urgency", "appeal to emotion")
   - tone: one of "NEUTRAL", "BALANCED", "SLIGHTLY_BIASED", "BIASED", "INFLAMMATORY", "PROPAGANDA"
   - political_bias: one of "FAR_LEFT", "LEFT", "CENTER_LEFT", "CENTER", "CENTER_RIGHT", "RIGHT", "FAR_RIGHT", "NOT_APPLICABLE"
   - political_bias_confidence: 0-100

4. LOGICAL_FALLACIES: List any logical fallacies detected:
   - fallacy_name: name of the fallacy
   - explanation: how it's used in this content
   - quote: the specific text that contains the fallacy

5. OVERALL_ASSESSMENT:
   - trust_score: 0-100 (overall credibility score)
   - verdict: one of "VERIFIED", "MOSTLY_CREDIBLE", "SUSPICIOUS", "LIKELY_MISLEADING", "FAKE_FABRICATED"
   - summary: 2-3 sentence summary explaining your assessment
   - red_flags: list of specific red flags found
   - key_concerns: list of main concerns about this content

6. VIRAL_FORWARD_CHECK:
   - is_viral_forward: boolean (does this look like a WhatsApp/social media forward)
   - forward_patterns: list of patterns detected (e.g., "forward to 10 people", "share before deleted", "government confirmed")

Return ONLY valid JSON. No markdown, no explanation outside JSON."""
        
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Optional[Dict[str, Any]]:
        """Parse Gemini response, handling markdown-wrapped JSON.
        
        Args:
            response_text: Raw response from Gemini
            
        Returns:
            Parsed dictionary or None if parsing fails
        """
        try:
            # Remove markdown code blocks if present
            cleaned = response_text.strip()
            
            # Check for ```json ... ``` wrapper
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', cleaned, re.DOTALL)
            if json_match:
                cleaned = json_match.group(1)
            
            # Remove any leading/trailing non-JSON content
            cleaned = re.sub(r'^[^{]*', '', cleaned)
            cleaned = re.sub(r'[^}]*$', '', cleaned)
            
            # Parse JSON
            result = json.loads(cleaned)
            
            # Validate structure
            if self._validate_response_structure(result):
                return result
            
            print("Invalid response structure from Gemini")
            return None
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            # Try to extract partial JSON
            return self._extract_partial_json(response_text)
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            return None
    
    def _validate_response_structure(self, result: Dict[str, Any]) -> bool:
        """Validate that response has required structure.
        
        Args:
            result: Parsed JSON response
            
        Returns:
            True if valid structure
        """
        required_keys = [
            "CLAIM_VERIFICATION",
            "LANGUAGE_ANALYSIS",
            "OVERALL_ASSESSMENT"
        ]
        
        return all(key in result for key in required_keys)
    
    def _extract_partial_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Attempt to extract partial JSON from malformed response.
        
        Args:
            text: Response text
            
        Returns:
            Partial dictionary or None
        """
        try:
            # Try to find JSON-like structure
            start = text.find('{')
            end = text.rfind('}')
            
            if start != -1 and end != -1:
                json_str = text[start:end+1]
                return json.loads(json_str)
            
            return None
            
        except Exception:
            return None
    
    def _get_fallback_response(self, error_message: str) -> Dict[str, Any]:
        """Generate fallback response when Gemini fails.
        
        Args:
            error_message: Error description
            
        Returns:
            Fallback analysis dictionary
        """
        return {
            "CLAIM_VERIFICATION": [],
            "LANGUAGE_ANALYSIS": {
                "sensationalism_score": 50,
                "clickbait_score": 50,
                "emotional_manipulation_score": 50,
                "emotional_triggers": [],
                "tone": "NEUTRAL",
                "political_bias": "NOT_APPLICABLE",
                "political_bias_confidence": 0
            },
            "LOGICAL_FALLACIES": [],
            "OVERALL_ASSESSMENT": {
                "trust_score": 50,
                "verdict": "SUSPICIOUS",
                "summary": f"Analysis unavailable: {error_message}",
                "red_flags": ["AI analysis failed"],
                "key_concerns": ["Unable to verify content automatically"]
            },
            "VIRAL_FORWARD_CHECK": {
                "is_viral_forward": False,
                "forward_patterns": []
            },
            "error": error_message
        }


# Legacy function for backward compatibility
async def analyze_with_gemini(
    content: str,
    analysis_type: str = "text",
    check_bias: bool = True,
    check_fallacies: bool = True
) -> Dict[str, Any]:
    """Legacy wrapper for GeminiService.
    
    Args:
        content: Content to analyze
        analysis_type: Type of analysis
        check_bias: Check for bias
        check_fallacies: Check for fallacies
        
    Returns:
        Analysis results
    """
    service = GeminiService()
    return await service.analyze_text_content(content, check_bias, check_fallacies)


async def analyze_image_with_gemini(image_path: str) -> Dict[str, Any]:
    """Analyze image using Gemini Vision.
    
    Args:
        image_path: Path to image file
        
    Returns:
        Dictionary containing image analysis results
    """
    if not settings.GEMINI_API_KEY or not client:
        return {"error": "Gemini API key not configured"}
    
    try:
        # Placeholder for Gemini Vision implementation
        return {
            "description": "Image analysis placeholder",
            "ai_generated_probability": 0.3,
            "manipulation_detected": False
        }
    except Exception as e:
        return {"error": str(e)}
