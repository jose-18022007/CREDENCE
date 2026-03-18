"""Data models for TruthLens API."""
from .schemas import (
    TextAnalysisRequest,
    URLAnalysisRequest,
    AnalysisResponse,
    DashboardStats,
)

__all__ = [
    "TextAnalysisRequest",
    "URLAnalysisRequest",
    "AnalysisResponse",
    "DashboardStats",
]
