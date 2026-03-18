"""Database operations using SQLite with aiosqlite."""
import json
import aiosqlite
from typing import Optional, List, Dict, Any
from datetime import datetime


DATABASE_PATH = "credence.db"


async def init_db() -> None:
    """Initialize the database and create tables if they don't exist."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                input_preview TEXT NOT NULL,
                source TEXT,
                trust_score INTEGER NOT NULL,
                verdict TEXT NOT NULL,
                full_report TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        await db.commit()


async def save_analysis(
    analysis_id: str,
    analysis_type: str,
    input_preview: str,
    source: Optional[str],
    trust_score: int,
    verdict: str,
    full_report: Dict[str, Any]
) -> None:
    """Save an analysis to the database.
    
    Args:
        analysis_id: Unique identifier for the analysis
        analysis_type: Type of analysis (text, url, image, video, audio)
        input_preview: Preview of the input content
        source: Source URL or filename
        trust_score: Trust score (0-100)
        verdict: Analysis verdict
        full_report: Complete analysis report as dictionary
    """
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            """
            INSERT INTO analyses (id, type, input_preview, source, trust_score, verdict, full_report, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                analysis_id,
                analysis_type,
                input_preview,
                source,
                trust_score,
                verdict,
                json.dumps(full_report),
                datetime.utcnow().isoformat()
            )
        )
        await db.commit()


async def get_analysis(analysis_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve an analysis by ID.
    
    Args:
        analysis_id: Unique identifier for the analysis
        
    Returns:
        Analysis record as dictionary or None if not found
    """
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM analyses WHERE id = ?",
            (analysis_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if row:
                return {
                    "id": row["id"],
                    "type": row["type"],
                    "input_preview": row["input_preview"],
                    "source": row["source"],
                    "trust_score": row["trust_score"],
                    "verdict": row["verdict"],
                    "full_report": json.loads(row["full_report"]),
                    "created_at": row["created_at"]
                }
            return None


async def get_all_analyses(limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
    """Retrieve all analyses with pagination.
    
    Args:
        limit: Maximum number of records to return
        offset: Number of records to skip
        
    Returns:
        List of analysis records
    """
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM analyses ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset)
        ) as cursor:
            rows = await cursor.fetchall()
            return [
                {
                    "id": row["id"],
                    "type": row["type"],
                    "input_preview": row["input_preview"],
                    "source": row["source"],
                    "trust_score": row["trust_score"],
                    "verdict": row["verdict"],
                    "created_at": row["created_at"]
                }
                for row in rows
            ]


async def get_stats() -> Dict[str, Any]:
    """Get dashboard statistics.
    
    Returns:
        Dictionary containing statistics
    """
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        
        # Total analyses
        async with db.execute("SELECT COUNT(*) as count FROM analyses") as cursor:
            total = (await cursor.fetchone())["count"]
        
        # Verdict breakdown
        async with db.execute(
            "SELECT verdict, COUNT(*) as count FROM analyses GROUP BY verdict"
        ) as cursor:
            verdict_rows = await cursor.fetchall()
            
        fake_count = sum(row["count"] for row in verdict_rows if "FAKE" in row["verdict"] or "MISLEADING" in row["verdict"])
        credible_count = sum(row["count"] for row in verdict_rows if "CREDIBLE" in row["verdict"] or "VERIFIED" in row["verdict"])
        suspicious_count = sum(row["count"] for row in verdict_rows if "SUSPICIOUS" in row["verdict"])
        
        # Type breakdown
        async with db.execute(
            "SELECT type, COUNT(*) as count FROM analyses GROUP BY type"
        ) as cursor:
            type_rows = await cursor.fetchall()
            type_breakdown = {row["type"]: row["count"] for row in type_rows}
        
        # Recent analyses
        async with db.execute(
            "SELECT id, type, input_preview, source, trust_score, verdict, created_at FROM analyses ORDER BY created_at DESC LIMIT 10"
        ) as cursor:
            recent_rows = await cursor.fetchall()
            recent_analyses = [
                {
                    "id": row["id"],
                    "type": row["type"],
                    "input_preview": row["input_preview"],
                    "source": row["source"],
                    "trust_score": row["trust_score"],
                    "verdict": row["verdict"],
                    "created_at": row["created_at"]
                }
                for row in recent_rows
            ]
        
        return {
            "total_analyses": total,
            "fake_detected": fake_count,
            "credible_detected": credible_count,
            "suspicious_detected": suspicious_count,
            "type_breakdown": type_breakdown,
            "recent_analyses": recent_analyses
        }
