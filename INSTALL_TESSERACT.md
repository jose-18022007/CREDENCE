# Install Tesseract OCR (5 Minutes)

## What is Tesseract?

Tesseract is an OCR (Optical Character Recognition) engine that extracts text from images. It's used in Credence to:
- Extract text from uploaded images
- Analyze text content for claims
- Detect text-based misinformation in images

## Installation Steps

### Windows

**Step 1: Download Installer**

Go to: https://github.com/UB-Mannheim/tesseract/wiki

Or direct download:
https://digi.bib.uni-mannheim.de/tesseract/tesseract-ocr-w64-setup-5.3.3.20231005.exe

**Step 2: Run Installer**

1. Double-click the downloaded `.exe` file
2. Click "Next" through the installer
3. **Important**: Check the box "Add to PATH"
4. Install to default location: `C:\Program Files\Tesseract-OCR`
5. Click "Install"

**Step 3: Verify Installation**

Open a **new** terminal/PowerShell window:

```bash
tesseract --version
```

Expected output:
```
tesseract 5.3.3
```

**Step 4: Restart Backend**

```bash
cd truthlens-backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Linux

```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

### Mac

```bash
brew install tesseract
```

## Test OCR

After installation, test with an image:

```bash
cd truthlens-backend
python -c "import pytesseract; from PIL import Image; img = Image.new('RGB', (100, 30), color='white'); print(pytesseract.image_to_string(img))"
```

## Troubleshooting

### "tesseract is not recognized"

**Cause**: Not in PATH or terminal not restarted

**Fix**:
1. Close and reopen terminal
2. Or manually add to PATH:
   - Win + R → `sysdm.cpl`
   - Environment Variables
   - Edit Path
   - Add `C:\Program Files\Tesseract-OCR`

### "TesseractNotFoundError"

**Cause**: pytesseract can't find tesseract.exe

**Fix**: Update `ocr_service.py`:

```python
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

### Still not working?

Check installation path:
```bash
where tesseract  # Windows
which tesseract  # Linux/Mac
```

## What Works Without Tesseract?

Image analysis still works without OCR:
- ✅ AI Detection (when HuggingFace works)
- ✅ EXIF Metadata extraction
- ✅ ELA manipulation detection
- ✅ Image scoring
- ❌ Text extraction from images

**OCR is optional** - only needed if you want to analyze text within images.

## After Installation

Once Tesseract is installed, image analysis will:

1. Extract text from images
2. Analyze extracted text with Gemini
3. Fact-check claims found in text
4. Cross-reference with news sources
5. Include text analysis in trust score

## Example Use Cases

With OCR enabled:
- Analyze screenshots of social media posts
- Extract text from memes
- Verify claims in infographics
- Detect misinformation in text-heavy images

## Download Links

- **Windows**: https://github.com/UB-Mannheim/tesseract/wiki
- **Linux**: `sudo apt-get install tesseract-ocr`
- **Mac**: `brew install tesseract`

## Quick Install (Windows PowerShell as Admin)

```powershell
# Using Chocolatey
choco install tesseract

# Verify
tesseract --version
```

## Summary

- **Time**: 5 minutes
- **Size**: ~60MB
- **Benefit**: Text extraction from images
- **Required**: No (optional feature)
- **Recommended**: Yes (for complete analysis)
