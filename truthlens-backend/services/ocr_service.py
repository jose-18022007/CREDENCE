"""OCR service using Tesseract."""
import pytesseract
from PIL import Image
from typing import Optional


async def extract_text_from_image(image_path: str) -> Optional[str]:
    """Extract text from image using OCR.
    
    Args:
        image_path: Path to image file
        
    Returns:
        Extracted text or None
    """
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text.strip() if text else None
        
    except Exception as e:
        print(f"OCR error: {e}")
        return None


async def detect_text_regions(image_path: str) -> dict:
    """Detect text regions in image.
    
    Args:
        image_path: Path to image file
        
    Returns:
        Dictionary containing text regions and confidence
    """
    try:
        image = Image.open(image_path)
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        
        return {
            "text_found": len(data['text']) > 0,
            "confidence": sum(data['conf']) / len(data['conf']) if data['conf'] else 0,
            "word_count": len([w for w in data['text'] if w.strip()])
        }
        
    except Exception as e:
        return {
            "text_found": False,
            "error": str(e)
        }
