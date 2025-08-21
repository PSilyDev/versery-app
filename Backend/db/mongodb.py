from pymongo import MongoClient
from core.config import settings

client = MongoClient(settings.MONGO_URI)
db = client.get_database("PoetryDB")  # The DB name is from the URI

# Collections
poem_collection = db.get_collection("poems")
user_collection = db.get_collection("users")
interaction_collection = db.get_collection("interactions")

