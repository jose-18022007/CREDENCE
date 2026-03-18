"""Report retrieval endpoint."""
from fastapi import APIRouter, HTTPException
from database import get_analysis

router = APIRouter()


@router.get("/{analysis_id}")
async def get_report(analysis_id: str):
    """Retrieve analysis report by ID.
    
    Args:
        analysis_id: Unique analysis identifier
        
    Returns:
        Complete analysis report
    """
    report = await get_analysis(analysis_id)
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report
