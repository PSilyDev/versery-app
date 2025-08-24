from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import poems, users, search, autocomplete, unified_search
from core.config import settings
import firebase_admin
from firebase_admin import credentials
import os, json

# Load Firebase credentials from environment variable
firebase_key = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")

if firebase_key:
    cred = credentials.Certificate(json.loads(firebase_key))
    firebase_admin.initialize_app(cred)
else:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set")

app = FastAPI(title="Poetry Postcards API")

# This list should contain the URL of your frontend
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://poetry-postcards.web.app",
    "https://poetry-postcards.firebaseapp.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# Include routers
app.include_router(poems.router, tags=["Poems"], prefix="/api")
app.include_router(users.router, tags=["Users"], prefix="/api")
app.include_router(search.router, tags=["Search"], prefix="/api")
app.include_router(autocomplete.router, tags=["Autocomplete"], prefix="/api") # <-- Add this line
app.include_router(unified_search.router, tags=["Unified Search"], prefix="/api")

@app.get("/")
def root():
    return {"message": "Hello from FastAPI on Render"}
    
@app.get("/api")
def read_root():
    return {"message": "Welcome to the Poetry Postcards API"}
