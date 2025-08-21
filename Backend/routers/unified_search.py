# backend/routers/unified_search.py
from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from db.mongodb import poem_collection
from models.poem import PoemInDB
from bson import ObjectId

# Import the components from our semantic search router
from .search import model, index, poem_id_map
import numpy as np

router = APIRouter()

# Predefined lists for intent detection
TAG_KEYWORDS = ["love", "nature", "loss", "hope", "sadness", "happiness", "reflection", "time", "death", "beauty", "resilience"]
SENTIMENT_KEYWORDS = {
    "happy": "POSITIVE",
    "positive": "POSITIVE",
    "uplifting": "POSITIVE",
    "joyful": "POSITIVE",
    "sad": "NEGATIVE",
    "negative": "NEGATIVE",
    "melancholy": "NEGATIVE",
    "sorrowful": "NEGATIVE",
}

@router.get("/search/unified", response_model=List[PoemInDB])
async def unified_search(
    q: str = Query(..., min_length=2, max_length=100),
    top_k: int = 10
):
    """
    Performs a unified search across keyword, semantic, and tag/sentiment filters.
    """
    query_lower = q.lower()
    
    # --- 1. Intent Detection ---
    if query_lower in SENTIMENT_KEYWORDS:
        # --- Intent: Search by Sentiment ---
        sentiment_label = SENTIMENT_KEYWORDS[query_lower]
        results = list(poem_collection.find({"sentiment.label": sentiment_label}).limit(top_k))
        return results

    elif query_lower in TAG_KEYWORDS:
        # --- Intent: Search by Tag ---
        results = list(poem_collection.find({"tags": query_lower}).limit(top_k))
        return results
    
    else:
        # --- Intent: Default to Hybrid Keyword + Semantic Search ---
        
        # --- Execute Keyword Search ---
        keyword_pipeline = [
            {
                "$search": {
                    "index": "poems_search_index",
                    "text": {
                        "query": q,
                        "path": ["title", "author"],
                        "fuzzy": { "maxEdits": 1 }
                    }
                }
            },
            { "$limit": top_k }
        ]
        keyword_results = list(poem_collection.aggregate(keyword_pipeline))
        
        # --- Execute Semantic Search ---
        if not all([model, index, poem_id_map]):
            raise HTTPException(status_code=503, detail="Search service is not available.")

        query_embedding = model.encode([q])
        query_embedding = np.array(query_embedding, dtype='float32')
        distances, indices = index.search(query_embedding, top_k)
        result_indices = indices[0]
        
        semantic_ids_str = [poem_id_map[i] for i in result_indices]
        
        # --- Combine and Rank Results with Clear Priority ---
        final_results = []
        # Use a set for fast lookups to avoid duplicates
        seen_ids = set()

        # 1. Add all keyword results first
        for poem in keyword_results:
            poem_id_str = str(poem["_id"])
            if poem_id_str not in seen_ids:
                final_results.append(poem)
                seen_ids.add(poem_id_str)

        # 2. Fill remaining spots with semantic results
        if len(final_results) < top_k:
            # Fetch the full documents for the semantic IDs
            semantic_ids_obj = [ObjectId(id_str) for id_str in semantic_ids_str]
            semantic_results_docs = list(poem_collection.find({"_id": {"$in": semantic_ids_obj}}))
            
            # Create a map for easy lookup to preserve FAISS order
            semantic_docs_map = {str(doc["_id"]): doc for doc in semantic_results_docs}

            for poem_id_str in semantic_ids_str:
                if len(final_results) >= top_k:
                    break
                if poem_id_str not in seen_ids:
                    if poem_id_str in semantic_docs_map:
                        final_results.append(semantic_docs_map[poem_id_str])
                        seen_ids.add(poem_id_str)

        return final_results
