"""Full OCR test with image analysis."""
import asyncio
import sys
from pathlib import Path
import os

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    os.system('chcp 65001 > nul')
    sys.stdout.reconfigure(encoding='utf-8')

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from services.image_service import ImageService
from services.ocr_service import OCRService
from services.gemini_service import GeminiService
from PIL import Image, ImageDraw, ImageFont


async def test_full_ocr_pipeline():
    """Test full OCR pipeline with text analysis."""
    print("\n" + "="*60)
    print("FULL OCR + IMAGE ANALYSIS TEST")
    print("="*60)
    
    # Create test image with realistic text
    test_dir = Path("truthlens-backend/test_images")
    test_dir.mkdir(parents=True, exist_ok=True)
    
    # Create a more realistic image with news-like text
    img = Image.new('RGB', (800, 400), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw border
    draw.rectangle([10, 10, 790, 390], outline='black', width=2)
    
    # Add text content
    text_lines = [
        "BREAKING NEWS",
        "",
        "Scientists discover new planet",
        "in nearby solar system.",
        "",
        "The planet is believed to be",
        "habitable and similar to Earth.",
    ]
    
    y_position = 50
    for line in text_lines:
        if line == "BREAKING NEWS":
            # Title in larger text
            draw.text((50, y_position), line, fill='red')
            y_position += 60
        elif line:
            draw.text((50, y_position), line, fill='black')
            y_position += 40
        else:
            y_position += 20
    
    test_image_path = test_dir / "test_news_image.jpg"
    img.save(test_image_path, 'JPEG', quality=95)
    
    print(f"📁 Created test image: {test_image_path}")
    
    # Step 1: OCR Extraction
    print("\n[1/4] Extracting text with OCR...")
    ocr_service = OCRService()
    ocr_result = ocr_service.extract_text_from_image(str(test_image_path))
    
    print(f"✅ OCR Complete:")
    print(f"  Words extracted: {ocr_result.get('word_count')}")
    print(f"  Confidence: {ocr_result.get('confidence')}%")
    print(f"  Has text: {ocr_result.get('has_text')}")
    print(f"\n  Extracted text:")
    print(f"  '{ocr_result.get('text')}'")
    
    # Step 2: Image Analysis
    print("\n[2/4] Analyzing image...")
    image_service = ImageService()
    image_analysis = await image_service.analyze_image_comprehensive(str(test_image_path))
    
    print(f"✅ Image Analysis Complete:")
    print(f"  AI Detection: {image_analysis['ai_detection']['ai_generated_probability']}%")
    print(f"  Media Integrity Score: {image_analysis['media_integrity_score']}/100")
    print(f"  Verdict: {image_analysis['overall_verdict']}")
    
    # Step 3: Text Analysis (if text found)
    if ocr_result.get('has_text') and ocr_result.get('word_count', 0) > 5:
        print("\n[3/4] Analyzing extracted text with Gemini...")
        gemini_service = GeminiService()
        
        try:
            text_analysis = await gemini_service.analyze_text_content(ocr_result['text'])
            
            print(f"✅ Text Analysis Complete:")
            
            # Overall assessment
            overall = text_analysis.get('OVERALL_ASSESSMENT', {})
            print(f"\n  Overall Assessment:")
            print(f"    Verdict: {overall.get('verdict', 'N/A')}")
            print(f"    Confidence: {overall.get('confidence_score', 0)}%")
            print(f"    Summary: {overall.get('summary', 'N/A')[:100]}...")
            
            # Claims
            claims = text_analysis.get('CLAIM_VERIFICATION', [])
            if claims:
                print(f"\n  Claims Found: {len(claims)}")
                for i, claim in enumerate(claims[:3], 1):
                    print(f"    {i}. {claim.get('claim_text', 'N/A')[:60]}...")
                    print(f"       Verdict: {claim.get('verdict', 'N/A')}")
            
            # Language analysis
            lang = text_analysis.get('LANGUAGE_ANALYSIS', {})
            print(f"\n  Language Analysis:")
            print(f"    Sensationalism: {lang.get('sensationalism_score', 0)}/100")
            print(f"    Clickbait: {lang.get('clickbait_score', 0)}/100")
            print(f"    Tone: {lang.get('tone', 'N/A')}")
            
        except Exception as e:
            print(f"⚠️ Text analysis error: {e}")
    else:
        print("\n[3/4] Skipping text analysis (insufficient text)")
    
    # Step 4: Combined Results
    print("\n[4/4] Combined Analysis Results:")
    print("="*60)
    
    combined_score = image_analysis['media_integrity_score']
    
    if ocr_result.get('has_text'):
        print(f"✅ Image with Text Detected")
        print(f"  - Text extracted: {ocr_result['word_count']} words")
        print(f"  - OCR confidence: {ocr_result['confidence']}%")
        print(f"  - Image integrity: {image_analysis['media_integrity_score']}/100")
        print(f"  - AI detection: {image_analysis['ai_detection']['ai_generated_probability']}%")
    else:
        print(f"✅ Image Analysis Only")
        print(f"  - No text detected")
        print(f"  - Image integrity: {image_analysis['media_integrity_score']}/100")
    
    print(f"\n📊 Final Score: {combined_score}/100")
    print(f"🎯 Verdict: {image_analysis['overall_verdict']}")
    
    print("\n" + "="*60)
    print("✅ FULL OCR PIPELINE TEST COMPLETE!")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(test_full_ocr_pipeline())
