from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from firebase_admin import auth
from db.mongodb import interaction_collection
from models.user import Interaction
from typing import List

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # We don't use tokenUrl, but it's required

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        return {"uid": uid}
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

router = APIRouter()

@router.post("/interactions", status_code=status.HTTP_201_CREATED)
async def create_interaction(
    interaction: Interaction,
    current_user: dict = Depends(get_current_user)
):
    # Ensure the user making the request is the one in the interaction object
    if current_user["uid"] != interaction.userId:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Check if interaction already exists to prevent duplicates
    existing = interaction_collection.find_one(interaction.dict())
    if existing:
        return {"message": "Interaction already exists"}

    interaction_collection.insert_one(interaction.dict())
    return {"message": "Interaction created successfully"}

@router.get("/me/interactions", response_model=List[Interaction])
async def get_my_interactions(current_user: dict = Depends(get_current_user)):
    interactions = list(interaction_collection.find({"userId": current_user["uid"]}))
    return interactions
