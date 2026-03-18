"""Test FFmpeg installation and configuration."""
import sys
import os
from pathlib import Path
import subprocess

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    os.system('chcp 65001 > nul')
    sys.stdout.reconfigure(encoding='utf-8')

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))


def test_ffmpeg_direct():
    """Test FFmpeg with direct path."""
    print("\n" + "="*60)
    print("TESTING FFMPEG - DIRECT PATH")
    print("="*60)
    
    # Check common locations
    ffmpeg_paths = [
        r'C:\ffmpeg\bin\ffmpeg.exe',
        r'C:\Program Files\ffmpeg\bin\ffmpeg.exe',
    ]
    
    ffmpeg_found = None
    for path in ffmpeg_paths:
        if os.path.exists(path):
            print(f"✅ Found FFmpeg at: {path}")
            ffmpeg_found = path
            break
    
    if not ffmpeg_found:
        print("❌ FFmpeg not found in common locations")
        print("\n📝 Expected locations:")
        for path in ffmpeg_paths:
            print(f"   - {path}")
        return False
    
    # Test FFmpeg version
    try:
        result = subprocess.run(
            [ffmpeg_found, "-version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✅ FFmpeg version: {version_line}")
            return True
        else:
            print(f"❌ FFmpeg error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error running FFmpeg: {e}")
        return False


def test_ffmpeg_path():
    """Test FFmpeg from PATH."""
    print("\n" + "="*60)
    print("TESTING FFMPEG - FROM PATH")
    print("="*60)
    
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✅ FFmpeg accessible from PATH: {version_line}")
            return True
        else:
            print(f"❌ FFmpeg error: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("❌ FFmpeg not found in PATH")
        print("\n📝 Note: This is expected if Kiro terminal hasn't reloaded PATH")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_video_service():
    """Test VideoService with FFmpeg."""
    print("\n" + "="*60)
    print("TESTING VIDEO SERVICE")
    print("="*60)
    
    try:
        from services.video_service import VideoService
        
        print("✅ VideoService imported successfully")
        
        # Initialize service (this will configure FFmpeg path)
        service = VideoService()
        print("✅ VideoService initialized")
        
        # Check if FFmpeg is now in PATH
        try:
            result = subprocess.run(
                ["ffmpeg", "-version"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                print("✅ FFmpeg accessible after VideoService init")
                return True
            else:
                print("⚠️ FFmpeg still not accessible")
                return False
                
        except FileNotFoundError:
            print("⚠️ FFmpeg not in PATH after init")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_ffprobe():
    """Test ffprobe (required for video metadata)."""
    print("\n" + "="*60)
    print("TESTING FFPROBE")
    print("="*60)
    
    # Check direct path
    ffprobe_paths = [
        r'C:\ffmpeg\bin\ffprobe.exe',
        r'C:\Program Files\ffmpeg\bin\ffprobe.exe',
    ]
    
    ffprobe_found = None
    for path in ffprobe_paths:
        if os.path.exists(path):
            print(f"✅ Found ffprobe at: {path}")
            ffprobe_found = path
            break
    
    if not ffprobe_found:
        print("❌ ffprobe not found")
        return False
    
    # Test ffprobe version
    try:
        result = subprocess.run(
            [ffprobe_found, "-version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✅ ffprobe version: {version_line}")
            return True
        else:
            print(f"❌ ffprobe error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    """Run all FFmpeg tests."""
    print("\n" + "="*60)
    print("FFMPEG TESTING SUITE")
    print("="*60)
    
    # Test 1: Direct path
    direct_working = test_ffmpeg_direct()
    
    # Test 2: PATH
    path_working = test_ffmpeg_path()
    
    # Test 3: ffprobe
    ffprobe_working = test_ffprobe()
    
    # Test 4: Video service
    service_working = test_video_service()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"FFmpeg (direct path): {'✅ WORKING' if direct_working else '❌ NOT FOUND'}")
    print(f"FFmpeg (from PATH):   {'✅ WORKING' if path_working else '❌ NOT IN PATH'}")
    print(f"ffprobe:              {'✅ WORKING' if ffprobe_working else '❌ NOT FOUND'}")
    print(f"VideoService:         {'✅ WORKING' if service_working else '❌ ERROR'}")
    
    print("\n📝 Notes:")
    if direct_working and not path_working:
        print("  - FFmpeg is installed but not in Kiro's PATH")
        print("  - VideoService will configure it automatically")
        print("  - Video analysis will work!")
    elif direct_working and path_working:
        print("  - FFmpeg is fully configured and accessible")
        print("  - Video analysis ready!")
    elif not direct_working:
        print("  - FFmpeg not found in expected locations")
        print("  - Please install FFmpeg to C:\\ffmpeg\\bin")
    
    if service_working:
        print("\n✅ Video analysis is ready to use!")
    else:
        print("\n⚠️ Video analysis may have issues")
    
    print("\n" + "="*60)


if __name__ == "__main__":
    main()
