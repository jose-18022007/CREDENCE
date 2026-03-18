"""Test script for image analysis - HuggingFace API and Tesseract OCR."""
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
from config import settings


async def test_huggingface_api():
    """Test HuggingFace API connection."""
    print("\n" + "="*60)
    print("TESTING HUGGINGFACE API")
    print("="*60)
    
    if not settings.HUGGINGFACE_API_KEY:
        print("❌ HUGGINGFACE_API_KEY not set in .env file")
        return False
    
    print(f"✅ API Key found: {settings.HUGGINGFACE_API_KEY[:10]}...")
    
    # Create a simple test image
    from PIL import Image
    import numpy as np
    
    test_dir = Path("truthlens-backend/test_images")
    test_dir.mkdir(parents=True, exist_ok=True)
    
    # Create a simple test image (100x100 red square)
    img_array = np.zeros((100, 100, 3), dtype=np.uint8)
    img_array[:, :] = [255, 0, 0]  # Red
    img = Image.fromarray(img_array)
    test_image_path = test_dir / "test_image.png"
    img.save(test_image_path)
    
    print(f"📁 Created test image: {test_image_path}")
    
    # Test AI detection
    service = ImageService()
    print("\n🔍 Testing AI detection...")
    result = await service.detect_ai_generated(str(test_image_path))
    
    print("\n📊 Result:")
    for key, value in result.items():
        print(f"  {key}: {value}")
    
    if "note" in result and "unavailable" in result.get("note", "").lower():
        print("\n❌ HuggingFace API is not working properly")
        return False
    
    print("\n✅ HuggingFace API is working!")
    return True


def test_tesseract():
    """Test Tesseract OCR installation."""
    print("\n" + "="*60)
    print("TESTING TESSERACT OCR")
    print("="*60)
    
    try:
        import pytesseract
        
        # Configure path for Windows
        import platform
        if platform.system() == 'Windows':
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        
        # Try to get version
        try:
            version = pytesseract.get_tesseract_version()
            print(f"✅ Tesseract is installed: version {version}")
            
            # Create a test image with text
            from PIL import Image, ImageDraw, ImageFont
            
            test_dir = Path("truthlens-backend/test_images")
            test_dir.mkdir(parents=True, exist_ok=True)
            
            # Create image with text
            img = Image.new('RGB', (400, 100), color='white')
            draw = ImageDraw.Draw(img)
            draw.text((10, 30), "This is a test image", fill='black')
            test_image_path = test_dir / "test_ocr.png"
            img.save(test_image_path)
            
            print(f"📁 Created test OCR image: {test_image_path}")
            
            # Test OCR
            service = OCRService()
            result = service.extract_text_from_image(str(test_image_path))
            
            print("\n📊 OCR Result:")
            for key, value in result.items():
                if key != "text":
                    print(f"  {key}: {value}")
            
            if result.get("has_text"):
                print(f"  Extracted text: '{result['text']}'")
                print("\n✅ Tesseract OCR is working!")
                return True
            else:
                print("\n⚠️ Tesseract is installed but couldn't extract text")
                return False
                
        except pytesseract.TesseractNotFoundError:
            print("❌ Tesseract is NOT installed")
            print("\n📝 Installation instructions:")
            print("   1. Download from: https://github.com/UB-Mannheim/tesseract/wiki")
            print("   2. Install to: C:\\Program Files\\Tesseract-OCR")
            print("   3. Add to PATH or configure in ocr_service.py")
            return False
            
    except ImportError:
        print("❌ pytesseract package not installed")
        print("   Run: pip install pytesseract")
        return False


async def test_comprehensive_analysis():
    """Test comprehensive image analysis."""
    print("\n" + "="*60)
    print("TESTING COMPREHENSIVE IMAGE ANALYSIS")
    print("="*60)
    
    from PIL import Image, ImageDraw
    
    test_dir = Path("truthlens-backend/test_images")
    test_dir.mkdir(parents=True, exist_ok=True)
    
    # Create a more realistic test image with text
    img = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(img)
    draw.rectangle([50, 50, 750, 550], outline='black', width=3)
    draw.text((100, 100), "BREAKING NEWS", fill='red')
    draw.text((100, 200), "This is a test article with some claims.", fill='black')
    
    test_image_path = test_dir / "test_comprehensive.jpg"
    img.save(test_image_path, 'JPEG', quality=95)
    
    print(f"📁 Created test image: {test_image_path}")
    
    # Run comprehensive analysis
    service = ImageService()
    print("\n🔍 Running comprehensive analysis...")
    result = await service.analyze_image_comprehensive(str(test_image_path))
    
    print("\n📊 Analysis Result:")
    print(f"  Type: {result.get('type')}")
    print(f"  Media Integrity Score: {result.get('media_integrity_score')}/100")
    print(f"  Overall Verdict: {result.get('overall_verdict')}")
    
    print("\n  AI Detection:")
    ai_det = result.get('ai_detection', {})
    print(f"    Probability: {ai_det.get('ai_generated_probability')}%")
    print(f"    Prediction: {ai_det.get('prediction')}")
    print(f"    Model: {ai_det.get('model_used')}")
    
    print("\n  EXIF Data:")
    exif = result.get('exif_data', {})
    print(f"    Has Metadata: {exif.get('has_metadata')}")
    print(f"    Suspicious Flags: {exif.get('suspicious_flags')}")
    
    print("\n  ELA Analysis:")
    ela = result.get('ela_analysis', {})
    print(f"    Manipulation Detected: {ela.get('manipulation_detected')}")
    print(f"    Confidence: {ela.get('manipulation_confidence')}%")
    
    print("\n✅ Comprehensive analysis completed!")


async def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("IMAGE ANALYSIS TESTING SUITE")
    print("="*60)
    
    # Test 1: HuggingFace API
    hf_working = await test_huggingface_api()
    
    # Test 2: Tesseract OCR
    tesseract_working = test_tesseract()
    
    # Test 3: Comprehensive analysis
    await test_comprehensive_analysis()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"HuggingFace API: {'✅ WORKING' if hf_working else '❌ NOT WORKING'}")
    print(f"Tesseract OCR: {'✅ WORKING' if tesseract_working else '❌ NOT INSTALLED'}")
    print("\n📝 Notes:")
    if not hf_working:
        print("  - HuggingFace API issues detected. Check API key and network.")
    if not tesseract_working:
        print("  - Tesseract not installed. OCR will be skipped in image analysis.")
        print("  - Install from: https://github.com/UB-Mannheim/tesseract/wiki")
    
    if hf_working and tesseract_working:
        print("  - All systems operational! 🎉")
    elif hf_working:
        print("  - Image analysis will work but without OCR text extraction.")
    else:
        print("  - Image analysis will use fallback detection methods.")


if __name__ == "__main__":
    asyncio.run(main())
