"""Database module for TruthLens API."""
from .db import init_db, save_analysis, get_analysis, get_all_analyses, get_stats

__all__ = [
    "init_db",
    "save_analysis",
    "get_analysis",
    "get_all_analyses",
    "get_stats",
]
