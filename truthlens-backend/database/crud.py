"""CRUD operations for database management."""
from typing import Optional, List, Dict, Any
from .db import save_analysis, get_analysis, get_all_analyses, get_stats

# Re-export functions for convenience
__all__ = [
    "save_analysis",
    "get_analysis",
    "get_all_analyses",
    "get_stats",
]
