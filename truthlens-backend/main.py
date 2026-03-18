"""Credence API - FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import settings
from database import init_db
from routers import (
    text_analysis,
    url_analysis,
    image_analysis,
    video_analysis,
    audio_analysis,
    report,
    dashboard
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    settings.ensure_directories()
    await init_db()
    print("✓ Database initialized")
    print("✓ Upload and output directories created")
    yield
    # Shutdown
    print("Shutting down Credence API...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(text_analysis.router, prefix="/api/analyze", tags=["Analysis"])
app.include_router(url_analysis.router, prefix="/api/analyze", tags=["Analysis"])
app.include_router(image_analysis.router, prefix="/api/analyze", tags=["Analysis"])
app.include_router(video_analysis.router, prefix="/api/analyze", tags=["Analysis"])
app.include_router(audio_analysis.router, prefix="/api/analyze", tags=["Analysis"])
app.include_router(report.router, prefix="/api/report", tags=["Reports"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "status": "Credence API is running",
        "version": settings.APP_VERSION,
        "endpoints": {
            "text_analysis": "/api/analyze/text",
            "url_analysis": "/api/analyze/url",
            "image_analysis": "/api/analyze/image",
            "video_analysis": "/api/analyze/video",
            "audio_analysis": "/api/analyze/audio",
            "get_report": "/api/report/{id}",
            "dashboard_stats": "/api/dashboard/stats",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Credence API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
