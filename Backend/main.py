from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import poems, users, search, autocomplete, unified_search
from core.config import settings
import firebase_admin
from firebase_admin import credentials

# Initialize Firebase Admin SDK
cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_KEY_PATH)
firebase_admin.initialize_app(cred)

app = FastAPI(title="Poetry Postcards API")

# This list should contain the URL of your frontend
origins = [
    "http://localhost",
    "http://localhost:3000", # The default for create-react-app
    "http://localhost:5173", # The default for Vite
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

@app.get("/api")
def read_root():
    return {"message": "Welcome to the Poetry Postcards API"}
