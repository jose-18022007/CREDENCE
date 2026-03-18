"""Test script for Gemini analysis engine."""
import asyncio
from services.gemini_service import GeminiService
from services.scoring_service import ScoringService


async def test_gemini_analysis():
    """Test the Gemini analysis engine with sample text."""
    
    # Sample fake news text
    sample_text = """
    BREAKING: Government Secretly Adding Microchips to Vaccines!
    
    According to anonymous sources, the government has been secretly adding 
    tracking microchips to all COVID-19 vaccines. These chips can monitor 
    your location 24/7 and even read your thoughts!
    
    Scientists have confirmed that 5G towers activate these chips. Share this 
    before it gets deleted! The mainstream media won't tell you this truth!
    
    Forward to everyone you know immediately! They're trying to silence us!
    """
    
    print("=" * 80)
    print("TESTING TRUTHLENS GEMINI ANALYSIS ENGINE")
    print("=" * 80)
    print("\nSample Text:")
    print("-" * 80)
    print(sample_text)
    print("-" * 80)
    
    # Initialize services
    gemini_service = GeminiService()
    scoring_service = ScoringService()
    
    print("\n🔍 Analyzing with Gemini AI...")
    
    # Analyze text
    result = await gemini_service.analyze_text_content(
        text=sample_text,
        check_bias=True,
        check_fallacies=True
    )
    
    print("\n✅ Analysis Complete!")
    print("=" * 80)
    
    # Display results
    if "error" in result:
        print(f"\n❌ Error: {result['error']}")
        return
    
    # Overall Assessment
    overall = result.get("OVERALL_ASSESSMENT", {})
    print("\n📊 OVERALL ASSESSMENT:")
    print(f"   Trust Score: {overall.get('trust_score', 'N/A')}/100")
    print(f"   Verdict: {overall.get('verdict', 'N/A')}")
    print(f"   Summary: {overall.get('summary', 'N/A')}")
    
    # Red Flags
    red_flags = overall.get("red_flags", [])
    if red_flags:
        print(f"\n🚩 RED FLAGS ({len(red_flags)}):")
        for flag in red_flags:
            print(f"   • {flag}")
    
    # Claims
    claims = result.get("CLAIM_VERIFICATION", [])
    if claims:
        print(f"\n📝 CLAIMS VERIFIED ({len(claims)}):")
        for i, claim in enumerate(claims, 1):
            print(f"\n   Claim {i}: {claim.get('claim_text', 'N/A')[:80]}...")
            print(f"   Verdict: {claim.get('verdict', 'N/A')}")
            print(f"   Confidence: {claim.get('confidence', 'N/A')}%")
            print(f"   Reasoning: {claim.get('reasoning', 'N/A')[:100]}...")
    
    # Language Analysis
    lang = result.get("LANGUAGE_ANALYSIS", {})
    print("\n🗣️ LANGUAGE ANALYSIS:")
    print(f"   Sensationalism: {lang.get('sensationalism_score', 'N/A')}/100")
    print(f"   Clickbait: {lang.get('clickbait_score', 'N/A')}/100")
    print(f"   Emotional Manipulation: {lang.get('emotional_manipulation_score', 'N/A')}/100")
    print(f"   Tone: {lang.get('tone', 'N/A')}")
    print(f"   Political Bias: {lang.get('political_bias', 'N/A')}")
    
    triggers = lang.get("emotional_triggers", [])
    if triggers:
        print(f"   Emotional Triggers: {', '.join(triggers)}")
    
    # Logical Fallacies
    fallacies = result.get("LOGICAL_FALLACIES", [])
    if fallacies:
        print(f"\n⚠️ LOGICAL FALLACIES ({len(fallacies)}):")
        for fallacy in fallacies:
            print(f"   • {fallacy.get('fallacy_name', 'N/A')}")
            print(f"     {fallacy.get('explanation', 'N/A')[:100]}...")
    
    # Viral Forward Check
    viral = result.get("VIRAL_FORWARD_CHECK", {})
    if viral.get("is_viral_forward"):
        print(f"\n📱 VIRAL FORWARD DETECTED:")
        patterns = viral.get("forward_patterns", [])
        for pattern in patterns:
            print(f"   • {pattern}")
    
    # Calculate comprehensive trust score
    print("\n" + "=" * 80)
    print("CALCULATING COMPREHENSIVE TRUST SCORE")
    print("=" * 80)
    
    analysis_data = {
        "gemini_result": result,
        "source_credibility": {"score": 50},
        "cross_reference": {
            "credible_sources_count": 0,
            "unreliable_sources_count": 0
        }
    }
    
    trust_score = await scoring_service.calculate_trust_score(
        analysis_data,
        has_source=False,
        has_media=False
    )
    
    verdict = scoring_service.get_verdict(trust_score)
    all_red_flags = scoring_service.get_red_flags(analysis_data)
    
    print(f"\n🎯 FINAL TRUST SCORE: {trust_score}/100")
    print(f"📋 FINAL VERDICT: {verdict}")
    
    if all_red_flags:
        print(f"\n🚨 ALL RED FLAGS ({len(all_red_flags)}):")
        for flag in all_red_flags:
            print(f"   • {flag}")
    
    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_gemini_analysis())
