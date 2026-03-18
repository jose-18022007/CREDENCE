"""Image analysis service for AI detection, EXIF, and ELA."""
from PIL import Image
from PIL.ExifTags import TAGS
import cv2
import numpy as np
from typing import Dict, Any, Optional
from pathlib import Path
from config import settings


async def analyze_image(image_path: str) -> Dict[str, Any]:
    """Comprehensive image analysis.
    
    Args:
        image_path: Path to image file
        
    Returns:
        Dictionary containing analysis results
    """
    results = {
        "ai_generated_probability": await detect_ai_generated(image_path),
        "exif_data": await extract_exif(image_path),
        "ela_result": await perform_ela(image_path),
        "manipulation_detected": False
    }
    
    # Determine if manipulation detected
    if results["ai_generated_probability"] > 0.7:
        results["manipulation_detected"] = True
    
    return results


async def detect_ai_generated(image_path: str) -> float:
    """Detect if image is AI-generated.
    
    Args:
        image_path: Path to image file
        
    Returns:
        Probability (0-1) that image is AI-generated
    """
    # Placeholder - would use actual AI detection model
    # Could integrate with Hugging Face models or custom trained models
    try:
        image = Image.open(image_path)
        
        # Simple heuristic: check for EXIF data
        # AI-generated images often lack camera EXIF data
        exif = image.getexif()
        
        if not exif or len(exif) < 5:
            return 0.6  # Higher probability if minimal EXIF
        
        return 0.2  # Lower probability if rich EXIF data
        
    except Exception:
        return 0.5  # Unknown


async def extract_exif(image_path: str) -> Dict[str, Any]:
    """Extract EXIF metadata from image.
    
    Args:
        image_path: Path to image file
        
    Returns:
        Dictionary containing EXIF data
    """
    try:
        image = Image.open(image_path)
        exif_data = image.getexif()
        
        if not exif_data:
            return {"has_exif": False, "data": {}}
        
        exif_dict = {}
        for tag_id, value in exif_data.items():
            tag = TAGS.get(tag_id, tag_id)
            exif_dict[tag] = str(value)
        
        return {
            "has_exif": True,
            "data": exif_dict,
            "camera": exif_dict.get("Make", "Unknown"),
            "software": exif_dict.get("Software", "Unknown"),
            "date_taken": exif_dict.get("DateTime", "Unknown")
        }
        
    except Exception as e:
        return {"has_exif": False, "error": str(e)}


async def perform_ela(image_path: str) -> Dict[str, Any]:
    """Perform Error Level Analysis on image.
    
    Args:
        image_path: Path to image file
        
    Returns:
        Dictionary containing ELA results
    """
    try:
        # Load image
        img = cv2.imread(image_path)
        
        if img is None:
            return {"success": False, "error": "Could not load image"}
        
        # Save with compression
        temp_path = settings.OUTPUT_DIR / f"temp_{Path(image_path).name}"
        cv2.imwrite(str(temp_path), img, [cv2.IMWRITE_JPEG_QUALITY, 90])
        
        # Load compressed image
        compressed = cv2.imread(str(temp_path))
        
        # Calculate difference
        diff = cv2.absdiff(img, compressed)
        
        # Enhance difference
        ela = cv2.convertScaleAbs(diff, alpha=10)
        
        # Save ELA result
        ela_output = settings.OUTPUT_DIR / f"ela_{Path(image_path).name}"
        cv2.imwrite(str(ela_output), ela)
        
        # Analyze ELA result
        mean_diff = np.mean(diff)
        max_diff = np.max(diff)
        
        manipulation_score = min((mean_diff / 10) * 100, 100)
        
        return {
            "success": True,
            "ela_image_path": str(ela_output),
            "mean_difference": float(mean_diff),
            "max_difference": float(max_diff),
            "manipulation_score": float(manipulation_score),
            "likely_manipulated": manipulation_score > 30
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}
