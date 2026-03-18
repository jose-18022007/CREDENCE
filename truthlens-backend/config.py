"""Configuration management for TruthLens API."""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    """Application settings and configuration."""
    
    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    NEWSAPI_KEY: str = os.getenv("NEWSAPI_KEY", "")
    GNEWS_API_KEY: str = os.getenv("GNEWS_API_KEY", "")
    HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "")
    
    # Application Settings
    APP_NAME: str = "TruthLens API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "AI-Powered Fake News Detection & Media Integrity Platform"
    
    # File Upload Settings
    UPLOAD_DIR: Path = Path("uploads")
    OUTPUT_DIR: Path = Path("outputs")
    MAX_TEXT_LENGTH: int = 50000
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10MB
    MAX_VIDEO_SIZE: int = 100 * 1024 * 1024  # 100MB
    MAX_AUDIO_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    # Supported Formats
    SUPPORTED_IMAGE_FORMATS: list[str] = [".png", ".jpg", ".jpeg", ".webp"]
    SUPPORTED_VIDEO_FORMATS: list[str] = [".mp4", ".mov", ".avi", ".webm"]
    SUPPORTED_AUDIO_FORMATS: list[str] = [".mp3", ".wav", ".m4a", ".ogg", ".flac"]
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./truthlens.db"
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]  # Allow all origins for hackathon
    
    def ensure_directories(self) -> None:
        """Create necessary directories if they don't exist."""
        self.UPLOAD_DIR.mkdir(exist_ok=True)
        self.OUTPUT_DIR.mkdir(exist_ok=True)

settings = Settings()
