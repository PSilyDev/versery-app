# backend/models/poem.py
from pydantic import BaseModel, Field, BeforeValidator
# from typing import List, Annotated, Optional
from typing import List, Optional
from typing_extensions import Annotated

from bson import ObjectId

# This custom type tells Pydantic how to convert a MongoDB ObjectId to a string
PyObjectId = Annotated[str, BeforeValidator(str)]

# Define models for the new nested data
class Sentiment(BaseModel):
    label: str
    score: float

class Poem(BaseModel):
    title: str
    author: str
    lines: List[str]

class PoemInDB(Poem):
    id: PyObjectId = Field(..., alias="_id")
    # Add the new fields. They are optional because the processing script might
    # run after some poems are already in the DB.
    sentiment: Optional[Sentiment] = None
    tags: Optional[List[str]] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
