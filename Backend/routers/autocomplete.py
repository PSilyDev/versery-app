# backend/routers/autocomplete.py
from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from db.mongodb import poem_collection

router = APIRouter()

# We'll define our sentiment keywords here to use them for suggestions
SENTIMENT_KEYWORDS = ["happy", "positive", "uplifting", "joyful", "sad", "negative", "melancholy", "sorrowful"]
TAG_KEYWORDS = ["love", "nature", "loss", "hope", "sadness", "happiness", "reflection", "time", "death", "beauty", "resilience"]


@router.get("/autocomplete", response_model=List[Dict[str, Any]])
async def get_autocomplete_suggestions(
    q: str = Query(..., min_length=2, max_length=50),
    # NEW: Add an optional filter parameter
    filter_by: Optional[str] = Query(None, enum=["author", "title", "tag", "sentiment"])
):
    """
    Provides unique autocomplete suggestions.
    If a filter is provided, it searches only within that category.
    """
    
    # --- Logic for handling specific filters ---
    if filter_by == "author":
        pipeline = create_search_pipeline(q, "author")
    elif filter_by == "title":
        pipeline = create_search_pipeline(q, "title")
    elif filter_by == "tag":
        # For tags, we can do a simpler aggregation as there are fewer unique tags
        pipeline = create_tag_pipeline(q)
    elif filter_by == "sentiment":
        # For sentiments, we just filter our predefined list in Python
        suggestions = [{"type": "sentiment", "value": s} for s in SENTIMENT_KEYWORDS if q.lower() in s]
        return suggestions
    else:
        # --- Default: No filter, search everything ---
        pipeline = create_combined_pipeline(q)

    suggestions = list(poem_collection.aggregate(pipeline))
    return suggestions


# --- Helper functions to build the database queries ---

def create_search_pipeline(query: str, path: str):
    """Creates a pipeline for autocomplete on a specific field (author or title)."""
    return [
        {"$search": {"index": "poems_search_index", "autocomplete": {"query": query, "path": path, "tokenOrder": "any", "fuzzy": {"maxEdits": 1}}}},
        {"$group": {"_id": f"${path}"}},
        {"$limit": 5},
        {"$project": {"_id": 0, "type": path, "value": "$_id"}}
    ]

def create_tag_pipeline(query: str):
    """Creates a pipeline to search for unique tags."""
    return [
        {"$unwind": "$tags"},
        {"$match": {"tags": {"$regex": f"^{query}", "$options": "i"}}},
        {"$group": {"_id": "$tags"}},
        {"$limit": 5},
        {"$project": {"_id": 0, "type": "tag", "value": "$_id"}}
    ]

def create_combined_pipeline(query: str):
    """Creates the full pipeline that searches both authors and titles."""
    # This is the same logic as before, just refactored
    author_pipeline = create_search_pipeline(query, "author")
    title_pipeline = create_search_pipeline(query, "title")
    
    # We remove the final limit from the sub-pipelines to combine them first
    author_pipeline.pop(2)
    title_pipeline.pop(2)

    return [
        {"$search": author_pipeline[0]["$search"]},
        *author_pipeline[1:],
        {"$unionWith": {"coll": "poems", "pipeline": title_pipeline}},
        {"$limit": 10}
    ]
