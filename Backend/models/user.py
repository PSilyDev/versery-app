from pydantic import BaseModel, Field
from typing import Literal

class User(BaseModel):
    id: str = Field(..., alias="_id")  # This will be the Firebase UID
    email: str

class Interaction(BaseModel):
    userId: str
    poemId: str
    interactionType: Literal["like", "bookmark"]

