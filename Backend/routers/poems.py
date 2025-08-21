from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List
from db.mongodb import poem_collection
from models.poem import Poem, PoemInDB
from bson import ObjectId
from pymongo.errors import PyMongoError

router = APIRouter()

@router.get("/poems", response_model=List[PoemInDB])
async def get_all_poems():
    try:
        # This logic can be simplified now. Pydantic will handle the conversion.
        return list(poem_collection.find())
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.post("/poems/by-ids", response_model=List[PoemInDB])
async def get_poems_by_ids(ids: List[str] = Body(...)):
    object_ids = [ObjectId(id) for id in ids]
    poems = list(poem_collection.find({"_id": {"$in": object_ids}}))
    for poem in poems:
        poem["_id"] = str(poem["_id"])  # for JSON serializability
    return poems

