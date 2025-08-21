# backend/routers/search.py
import json
import numpy as np
import faiss
from fastapi import APIRouter, HTTPException, Query
from sentence_transformers import SentenceTransformer
from typing import List
from db.mongodb import poem_collection
from models.poem import PoemInDB
from bson import ObjectId

router = APIRouter()

# --- Load models and data at startup ---
# This is efficient as they are loaded only once when the app starts.
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    index = faiss.read_index("poem_index.faiss")
    with open("poem_id_map.json", "r") as f:
        poem_id_map = json.load(f)
    print("Search components loaded successfully.")
except Exception as e:
    print(f"Error loading search components: {e}")
    model, index, poem_id_map = None, None, None

@router.get("/search", response_model=List[PoemInDB])
async def search_poems(
    query: str = Query(..., min_length=3, max_length=100),
    top_k: int = 5
):
    if not all([model, index, poem_id_map]):
        raise HTTPException(status_code=503, detail="Search service is not available.")

    # 1. Generate an embedding for the user's query
    query_embedding = model.encode([query], convert_to_tensor=False)
    query_embedding = np.array(query_embedding, dtype='float32')

    # 2. Search the FAISS index for the top_k most similar vectors
    distances, indices = index.search(query_embedding, top_k)

    # 3. Get the internal FAISS indices of the results
    result_indices = indices[0]

    # 4. Map these FAISS indices back to our MongoDB ObjectIds
    matched_poem_ids = [ObjectId(poem_id_map[i]) for i in result_indices]

    # 5. Fetch the full poem documents from MongoDB
    # We use $in to get all matching documents in one query.
    # Note: The order from MongoDB is not guaranteed to match the relevance order.
    results_from_db = list(poem_collection.find({"_id": {"$in": matched_poem_ids}}))

    # 6. Sort the DB results based on the relevance order from FAISS
    # This is a crucial step to ensure the most relevant poems are first.
    sorted_results = sorted(
        results_from_db,
        key=lambda doc: matched_poem_ids.index(doc['_id'])
    )

    return sorted_results 