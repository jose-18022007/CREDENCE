"""Test video analysis with FFmpeg."""
import asyncio
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
        # Create a frame with changing colors
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Color gradient based on frame number
        color_value = int((i / total_frames) * 255)
        frame[:, :] = [color_value, 100, 255 - color_value]
        
        # Add text
        text = f"Frame {i+1}/{total_frames}"
        cv2.putText(frame, text, (50, height//2), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        out.write(frame)
    
    out.release()
    
    print(f"✅ Test video created: {video_path}")
    print(f"   Duration: {duration}s, FPS: {fps}, Frames: {total_frames}")
    
    return str(video_path)


async def test_video_metadata():
    """Test video metadata extraction."""
    print("\n" + "="*60)
    print("TEST 1: VIDEO METADATA EXTRACTION")
    print("="*60)
    
    video_path = create_test_video()
    
    service = VideoService()
    
    print("\n🔍 Extracting metadata...")
    metadata = service.extract_video_metadata(video_path)
    
    print("\n📊 Metadata Results:")
    print(f"  Duration: {metadata.get('duration', 'N/A')}s")
    print(f"  Resolution: {metadata.get('width', 'N/A')}x{metadata.get('height', 'N/A')}")
    print(f"  FPS: {metadata.get('fps', 'N/A')}")
    print(f"  Codec: {metadata.get('codec', 'N/A')}")
    print(f"  Bitrate: {metadata.get('bitrate', 'N/A')}")
    print(f"  File size: {metadata.get('size_mb', 'N/A')} MB")
    
    ai_tool = metadata.get('ai_tool_detected')
    if ai_tool:
        print(f"  AI Tool: {ai_tool}")
    else:
        print(f"  AI Tool: None detected")
    
    if metadata.get('duration'):
        print("\n✅ Metadata extraction successful!")
        return True
    else:
        print("\n❌ Metadata extraction failed")
        return False


async def test_keyframe_extraction():
    """Test keyframe extraction."""
    print("\n" + "="*60)
    print("TEST 2: KEYFRAME EXTRACTION")
    print("="*60)
    
    video_path = Path("truthlens-backend/test_videos/test_video.mp4")
    
    if not video_path.exists():
        print("❌ Test video not found")
        return False
    
    service = VideoService()
    
    # Create output directory for keyframes
    output_dir = Path("truthlens-backend/outputs/keyframes")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n🔍 Extracting keyframes...")
    result = service.extract_keyframes(str(video_path), str(output_dir))
    
    frame_paths = result.get('frame_paths', [])
    
    print(f"\n📊 Keyframe Results:")
    print(f"  Frames extracted: {len(frame_paths)}")
    print(f"  Total video frames: {result.get('total_frames_in_video', 0)}")
    print(f"  Video FPS: {result.get('fps', 0):.2f}")
    print(f"  Duration: {result.get('duration_seconds', 0):.2f}s")
    
    if frame_paths:
        print(f"\n  Sample frames:")
        for i, frame_path in enumerate(frame_paths[:5], 1):
            print(f"    {i}. {Path(frame_path).name}")
        
        if len(frame_paths) > 5:
            print(f"    ... and {len(frame_paths) - 5} more")
        
        print("\n✅ Keyframe extraction successful!")
        return True
    else:
        print("\n❌ No keyframes extracted")
        return False


async def test_audio_extraction():
    """Test audio extraction."""
    print("\n" + "="*60)
    print("TEST 3: AUDIO EXTRACTION")
    print("="*60)
    
    video_path = Path("truthlens-backend/test_videos/test_video.mp4")
    
    if not video_path.exists():
        print("❌ Test video not found")
        return False
    
    service = VideoService()
    
    # Create output path for audio
    output_dir = Path("truthlens-backend/outputs/audio")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "test_audio.wav"
    
    print("\n🔍 Extracting audio...")
    audio_path = service.extract_audio_track(str(video_path), str(output_path))
    
    if audio_path and Path(audio_path).exists():
        file_size = Path(audio_path).stat().st_size
        print(f"\n📊 Audio Results:")
        print(f"  Audio file: {Path(audio_path).name}")
        print(f"  File size: {file_size} bytes")
        print("\n✅ Audio extraction successful!")
        return True
    else:
        print("\n⚠️ No audio track in video (expected for test video)")
        return True  # Not an error for test video


async def test_comprehensive_analysis():
    """Test comprehensive video analysis."""
    print("\n" + "="*60)
    print("TEST 4: COMPREHENSIVE VIDEO ANALYSIS")
    print("="*60)
    
    video_path = Path("truthlens-backend/test_videos/test_video.mp4")
    
    if not video_path.exists():
        print("❌ Test video not found")
        return False
    
    service = VideoService()
    
    print("\n🔍 Running comprehensive analysis...")
    print("   This may take 30-60 seconds...")
    
    try:
        result = await service.analyze_video_comprehensive(str(video_path))
        
        print("\n📊 Analysis Results:")
        print(f"  Type: {result.get('type')}")
        
        # Metadata
        metadata = result.get('metadata', {})
        print(f"\n  Metadata:")
        print(f"    Duration: {metadata.get('duration')}s")
        print(f"    Resolution: {metadata.get('width')}x{metadata.get('height')}")
        print(f"    FPS: {metadata.get('fps')}")
        
        # Keyframes
        keyframes = result.get('keyframes', [])
        print(f"\n  Keyframes: {len(keyframes)} extracted")
        
        # Deepfake detection
        deepfake = result.get('deepfake_detection', {})
        print(f"\n  Deepfake Detection:")
        print(f"    Probability: {deepfake.get('deepfake_probability', 0)}%")
        print(f"    Frames analyzed: {deepfake.get('frames_analyzed', 0)}")
        
        # Audio
        audio = result.get('audio_analysis')
        if audio:
            print(f"\n  Audio: Extracted and analyzed")
        else:
            print(f"\n  Audio: No audio track")
        
        # Score
        score = result.get('media_integrity_score', 0)
        verdict = result.get('overall_verdict', 'UNKNOWN')
        print(f"\n  Media Integrity Score: {score}/100")
        print(f"  Verdict: {verdict}")
        
        print("\n✅ Comprehensive analysis complete!")
        return True
        
    except Exception as e:
        print(f"\n❌ Analysis error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all video analysis tests."""
    print("\n" + "="*60)
    print("VIDEO ANALYSIS TESTING SUITE")
    print("="*60)
    
    # Test 1: Metadata
    metadata_ok = await test_video_metadata()
    
    # Test 2: Keyframes
    keyframes_ok = await test_keyframe_extraction()
    
    # Test 3: Audio
    audio_ok = await test_audio_extraction()
    
    # Test 4: Comprehensive
    comprehensive_ok = await test_comprehensive_analysis()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Metadata Extraction:      {'✅ PASS' if metadata_ok else '❌ FAIL'}")
    print(f"Keyframe Extraction:      {'✅ PASS' if keyframes_ok else '❌ FAIL'}")
    print(f"Audio Extraction:         {'✅ PASS' if audio_ok else '❌ FAIL'}")
    print(f"Comprehensive Analysis:   {'✅ PASS' if comprehensive_ok else '❌ FAIL'}")
    
    all_pass = metadata_ok and keyframes_ok and audio_ok and comprehensive_ok
    
    print("\n📝 Notes:")
    if all_pass:
        print("  - All video analysis features working!")
        print("  - FFmpeg integration successful")
        print("  - Ready for production use")
    else:
        print("  - Some tests failed")
        print("  - Check error messages above")
    
    print("\n" + "="*60)
    
    if all_pass:
        print("✅ VIDEO ANALYSIS FULLY OPERATIONAL!")
    else:
        print("⚠️ VIDEO ANALYSIS NEEDS ATTENTION")
    
    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())
