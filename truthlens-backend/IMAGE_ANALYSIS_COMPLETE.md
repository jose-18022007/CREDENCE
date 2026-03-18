# ✅ Image Analysis Pipeline - COMPLETE

## Overview

Comprehensive image analysis system with:
- ✅ OCR text extraction
- ✅ AI-generated image detection
- ✅ EXIF metadata analysis
- ✅ Error Level Analysis (ELA) for manipulation detection

---

## Components Implemented

### 1. OCR Service (`services/ocr_service.py`)

**Features**:
- Text extraction using Tesseract OCR
- Image pre-processing for better accuracy:
  - Grayscale conversion
  - Upscaling for small images
  - Sharpening
  - Contrast enhancement
- Confidence scoring
- Word count
- Text cleaning

**Usage**:
```python
from services.ocr_service import OCRService

ocr_service = OCRService()
result = ocr_service.extract_text_from_image("path/to/image.jpg")

# Returns:
{
    "text": "Extracted text content",
    "confidence": 87.5,
    "word_count": 42,
    "has_text": True,
    "language": "eng"
}
```

---

### 2. Image Service (`services/image_service.py`)

#### A. AI-Generated Detection

Uses HuggingFace API with `umm-maybe/AI-image-detector` model.

**Features**:
- Detects AI-generated images (MidJourney, DALL-E, Stable Diffusion)
- Automatic retry for model cold starts
- Fallback to EXIF heuristics if API unavailable
- Confidence scoring

**Returns**:
```json
{
    "ai_generated_probability": 92.5,
    "prediction": "AI_GENERATED",
    "confidence": 0.925,
    "model_used": "AI-image-detector"
}
```

#### B. EXIF Metadata Analysis

Extracts and analyzes image metadata.

**Detects**:
- Camera make/model
- DateTime information
- GPS coordinates
- Editing software used
- Suspicious indicators:
  - Metadata stripped
  - Edited with Photoshop/GIMP
  - DateTime mismatches

**Returns**:
```json
{
    "has_metadata": True,
    "metadata": {...},
    "camera_make": "Canon",
    "camera_model": "EOS 5D",
    "software": "Adobe Photoshop",
    "warnings": ["Image edited with Adobe Photoshop"],
    "suspicious_flags": ["EDITED_WITH_SOFTWARE"]
}
```

#### C. Error Level Analysis (ELA)

Detects image manipulation by analyzing compression artifacts.

**How it works**:
1. Re-save image at JPEG quality 90
2. Calculate pixel-by-pixel difference
3. Amplify differences (scale factor 15)
4. Manipulated regions show higher error levels

**Returns**:
```json
{
    "ela_image_path": "/outputs/ela_image.jpg",
    "manipulation_detected": True,
    "manipulation_confidence": 78.5,
    "mean_error_level": 32.4,
    "stddev_error_level": 45.2,
    "analysis_notes": "Significant error level differences detected..."
}
```

#### D. Comprehensive Analysis

Combines all methods and calculates media integrity score.

**Scoring**:
- Start at 100
- AI-generated (>70%): -50 points
- Metadata stripped: -15 points
- Edited with software: -10 points
- ELA manipulation detected: -40 points

**Returns**:
```json
{
    "type": "IMAGE",
    "ai_detection": {...},
    "exif_data": {...},
    "ela_analysis": {...},
    "media_integrity_score": 45,
    "overall_verdict": "SUSPICIOUS"
}
```

---

### 3. Image Analysis Router (`routers/image_analysis.py`)

**Endpoint**: `POST /api/analyze/image`

**Parameters**:
- `file`: Image file (PNG, JPG, JPEG, WEBP)
- `ai_detection`: Enable AI detection (default: True)
- `exif_analysis`: Enable EXIF analysis (default: True)
- `ela_analysis`: Enable ELA analysis (default: True)
- `ocr_extraction`: Enable OCR (default: True)

**Validation**:
- File type: PNG, JPG, JPEG, WEBP only
- File size: Max 10MB

**Process Flow**:
```
1. Upload & validate file
   ↓
2. OCR extraction (if enabled)
   ↓
3. If text found → Gemini analysis
   ↓
4. If text found → Fact-check claims
   ↓
5. If text found → Cross-reference news
   ↓
6. Image analysis (AI detection, EXIF, ELA)
   ↓
7. Calculate trust score
   ↓
8. Save to database
   ↓
9. Return comprehensive report
```

**Response Example**:
```json
{
    "analysis_id": "abc123",
    "overall_trust_score": 42,
    "verdict": "SUSPICIOUS",
    "summary": "Image analysis: SUSPICIOUS. Extracted 15 words from image. AI-generated probability: 85%",
    "media_integrity": {
        "ai_generated_probability": 0.85,
        "exif_data": {
            "has_metadata": False,
            "warnings": ["Metadata completely stripped"],
            "suspicious_flags": ["METADATA_STRIPPED"]
        },
        "ela_result": "/outputs/ela_abc123.jpg"
    },
    "red_flags": [
        "High probability of AI-generated content (85%)",
        "Image metadata completely stripped",
        "Possible image manipulation detected (ELA analysis)"
    ]
}
```

---

## Dependencies

Add to `requirements.txt`:
```
pytesseract
Pillow
opencv-python-headless
numpy
httpx
```

**System Requirements**:
- Tesseract OCR must be installed on system
  - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
  - Mac: `brew install tesseract`
  - Linux: `sudo apt-get install tesseract-ocr`

---

## API Keys Required

### HuggingFace API Key (for AI detection)

1. Go to: https://huggingface.co/settings/tokens
2. Create a new token (read access)
3. Add to `.env`:
   ```
   HUGGINGFACE_API_KEY="hf_xxxxxxxxxxxxx"
   ```

**Note**: Free tier has rate limits. Fallback to EXIF heuristics if unavailable.

---

## Testing

### Test OCR:
```bash
cd truthlens-backend
python -c "
from services.ocr_service import OCRService
ocr = OCRService()
result = ocr.extract_text_from_image('test_image.jpg')
print(result)
"
```

### Test Image Analysis:
```bash
curl -X POST http://localhost:8000/api/analyze/image \
  -F "file=@test_image.jpg" \
  -F "ai_detection=true" \
  -F "exif_analysis=true" \
  -F "ela_analysis=true" \
  -F "ocr_extraction=true"
```

---

## Red Flags Detected

The system automatically flags:

1. **AI-Generated Content**:
   - Probability > 70%: High risk
   - Probability > 50%: Moderate risk

2. **Metadata Issues**:
   - Completely stripped metadata
   - Edited with Photoshop/GIMP
   - DateTime mismatches

3. **Manipulation**:
   - ELA shows inconsistent compression
   - High error level variance

4. **Text Content** (if OCR finds text):
   - False claims from fact-checkers
   - Sensationalist language
   - Logical fallacies

---

## Output Files

Generated files are saved to `truthlens-backend/outputs/`:
- `ela_[analysis_id].jpg` - ELA visualization image
- Shows manipulated regions as bright areas

---

## Error Handling

The system gracefully handles:
- ✅ Corrupted images → Partial results
- ✅ Unsupported formats → Clear error message
- ✅ OCR failures → Continue with image analysis
- ✅ API timeouts → Fallback methods
- ✅ Missing EXIF → Flag as suspicious
- ✅ HuggingFace cold start → Automatic retry

---

## Performance

**Typical Analysis Time**:
- OCR: 1-3 seconds
- AI Detection: 2-5 seconds (first call: 20s for model loading)
- EXIF: <1 second
- ELA: 1-2 seconds
- **Total**: 5-10 seconds per image

---

## Status

✅ **COMPLETE** - Full image analysis pipeline implemented!

**Features**:
- ✅ OCR text extraction with pre-processing
- ✅ AI-generated image detection (HuggingFace)
- ✅ EXIF metadata analysis
- ✅ Error Level Analysis (ELA)
- ✅ Comprehensive scoring
- ✅ Integration with Gemini for text analysis
- ✅ Fact-checking extracted text
- ✅ News cross-referencing
- ✅ Database storage
- ✅ Error handling & fallbacks
