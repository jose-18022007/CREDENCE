"""Dashboard statistics endpoint."""
from fastapi import APIRouter
from models.schemas import DashboardStats
from database import get_stats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics.
    
    Returns:
        Dashboard statistics including counts and recent analyses
    """
    stats = await get_stats()
    
    return DashboardStats(
        total_analyses=stats.get("total_analyses", 0),
        fake_detected=stats.get("fake_detected", 0),
        credible_detected=stats.get("credible_detected", 0),
        suspicious_detected=stats.get("suspicious_detected", 0),
        type_breakdown=stats.get("type_breakdown", {}),
        recent_analyses=stats.get("recent_analyses", [])
    )
