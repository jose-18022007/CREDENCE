"""OCR service for extracting text from images."""
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import re
from typing import Dict, Any


class OCRService:
    """Service for extracting text from images using Tesseract OCR."""
    
    def __init__(self):
        """Initialize OCR service."""
        # Configure pytesseract path for Windows
        import platform
        if platform.system() == 'Windows':
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    
    def extract_text_from_image(self, image_path: str) -> Dict[str, Any]:
        """Extract text from image using OCR.
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with extracted text and metadata
        """
        try:
            # Check if Tesseract is installed
            try:
                pytesseract.get_tesseract_version()
            except pytesseract.TesseractNotFoundError:
                print("⚠️ Tesseract OCR not installed - skipping text extraction")
                return {
                    "text": "",
                    "confidence": 0,
                    "word_count": 0,
                    "has_text": False,
                    "error": "Tesseract not installed",
                    "note": "Install from: https://github.com/UB-Mannheim/tesseract/wiki"
                }
            
            # Open image
            image = Image.open(image_path)
            
            # Pre-process image for better OCR
            processed_image = self._preprocess_image(image)
            
            # Extract text with confidence data
            text_data = pytesseract.image_to_data(processed_image, output_type=pytesseract.Output.DICT)
            
            # Extract full text
            text = pytesseract.image_to_string(processed_image)
            
            # Clean text
            cleaned_text = self._clean_text(text)
            
            # Calculate average confidence
            confidences = [int(conf) for conf in text_data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            # Count words
            word_count = len([w for w in cleaned_text.split() if len(w) > 1])
            
            has_text = word_count > 0
            
            print(f"📝 OCR extracted {word_count} words (confidence: {avg_confidence:.1f}%)")
            
            return {
                "text": cleaned_text,
                "confidence": round(avg_confidence, 2),
                "word_count": word_count,
                "has_text": has_text,
                "language": "eng"  # Can be extended to detect language
            }
            
        except pytesseract.TesseractNotFoundError:
            print("⚠️ Tesseract OCR not installed - skipping text extraction")
            return {
                "text": "",
                "confidence": 0,
                "word_count": 0,
                "has_text": False,
                "error": "Tesseract not installed",
                "note": "Install from: https://github.com/UB-Mannheim/tesseract/wiki"
            }
        except Exception as e:
            print(f"❌ OCR extraction error: {e}")
            return {
                "text": "",
                "confidence": 0,
                "word_count": 0,
                "has_text": False,
                "error": str(e)
            }
    
    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """Pre-process image for better OCR results.
        
        Args:
            image: PIL Image object
            
        Returns:
            Processed PIL Image
        """
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to grayscale
        image = image.convert('L')
        
        # Upscale if too small
        width, height = image.size
        if width < 500:
            scale_factor = 2
            new_size = (width * scale_factor, height * scale_factor)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Apply slight sharpening
        image = image.filter(ImageFilter.SHARPEN)
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.5)
        
        return image
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text.
        
        Args:
            text: Raw OCR text
            
        Returns:
            Cleaned text
        """
        # Remove excess whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove weird characters (keep alphanumeric, punctuation, spaces)
        text = re.sub(r'[^\w\s\.,!?;:\-\'"()\[\]{}@#$%&*+=/<>]', '', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text


# Legacy function for backward compatibility
async def extract_text_from_image(image_path: str) -> Dict[str, Any]:
    """Extract text from image using OCR."""
    service = OCRService()
    return service.extract_text_from_image(image_path)
