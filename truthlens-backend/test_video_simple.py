"""Simple video analysis test."""
import sys
import os
from pathlib import Path
import cv2
import numpy as np

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    os.system('chcp 65001 > nul')
    sys.stdout.reconfigure(encoding='utf-8')

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from services.video_service import VideoService


def create_test_video():
    """Create a simple test video."""
    print("\n📹 Creating test video...")
    
    test_dir = Path("truthlens-backend/test_videos")
    test_dir.mkdir(parents=True, exist_ok=True)
    
    video_path = test_dir / "test_video.mp4"
    
    # Video properties
    width, height = 640, 480
    fps = 30
    duration = 3  # seconds
    
    # Create video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(video_path), fourcc, fps, (width, height))
    
    # Generate frames
    total_frames = fps * duration
    for i in range(total_frames):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        color_value = int((i / total_frames) * 255)
        frame[:, :] = [color_value, 100, 255 - color_value]
        
        text = f"Frame {i+1}/{total_frames}"
        cv2.putText(frame, text, (50, height//2), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        out.write(frame)
    
    out.release()
    
    print(f"✅ Test video created: {video_path}")
    print(f"   Duration: {duration}s, FPS: {fps}, Frames: {total_frames}")
    
    return str(video_path)


def main():
    """Run simple video tests."""
    print("\n" + "="*60)
    print("SIMPLE VIDEO ANALYSIS TEST")
    print("="*60)
    
    # Create test video
    video_path = create_test_video()
    
    # Initialize service
    service = VideoService()
    
    # Test 1: Metadata
    print("\n[1/2] Testing metadata extraction...")
    metadata = service.extract_video_metadata(video_path)
    
    if metadata.get('duration'):
        print(f"✅ Metadata: {metadata.get('duration')}s, {metadata.get('width')}x{metadata.get('height')}")
    else:
        print("❌ Metadata extraction failed")
        return
    
    # Test 2: Keyframes
    print("\n[2/2] Testing keyframe extraction...")
    output_dir = Path("truthlens-backend/outputs/keyframes")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    result = service.extract_keyframes(video_path, str(output_dir))
    frame_paths = result.get('frame_paths', [])
    
    if frame_paths:
        print(f"✅ Keyframes: {len(frame_paths)} frames extracted")
    else:
        print("❌ Keyframe extraction failed")
        return
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print("✅ FFmpeg: WORKING")
    print("✅ Metadata Extraction: WORKING")
    print("✅ Keyframe Extraction: WORKING")
    print("\n📝 Video analysis is ready!")
    print("="*60)


if __name__ == "__main__":
    main()
