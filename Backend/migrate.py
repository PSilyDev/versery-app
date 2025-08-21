import json
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client.get_default_database()
poem_collection = db.get_collection("poems")

# Load poems from your JSON file
# Use the correct path for poems.json
with open('poems.json', 'r') as f:
    poems_data = json.load(f)

# Clear existing poems to avoid duplicates on re-run
poem_collection.delete_many({})

# Insert new poems
if poems_data:
    poem_collection.insert_many(poems_data)
    print(f"Successfully migrated {len(poems_data)} poems to MongoDB.")
else:
    print("No poems found in JSON file.")

client.close() 