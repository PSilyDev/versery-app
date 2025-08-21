# process_poems.py
import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from transformers import pipeline
from db.mongodb import poem_collection
from bson.objectid import ObjectId
import torch

# --- 1. Load All Models at the Start ---
print("Loading all models...")
# Determine device to use (GPU if available, otherwise CPU)
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Using device: {device.upper()}")

# Model for embeddings (as before)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2', device=device)

# Model for sentiment analysis
sentiment_classifier = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    device=device
)

# Model for auto-tagging (zero-shot classification)
tag_classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device=device
)
print("All models loaded.")

# --- 2. Define Candidate Tags ---
candidate_tags = ["love", "nature", "loss", "hope", "sadness", "happiness", "reflection", "time", "death", "beauty", "resilience"]

# --- 3. Fetch Poems from MongoDB ---
print("Fetching poems from MongoDB...")
poems = list(poem_collection.find({}))
if not poems:
    print("No poems found in the database. Please run migrate.py first.")
    exit()
print(f"Found {len(poems)} poems.")

poem_texts = ["\n".join(poem['lines']) for poem in poems]
poem_ids = [str(poem['_id']) for poem in poems]

# --- 4. Generate Embeddings (as before) ---
print("Generating embeddings...")
embeddings = embedding_model.encode(poem_texts, show_progress_bar=True)
d = embeddings.shape[1]
index = faiss.IndexFlatL2(d)
index.add(np.array(embeddings, dtype='float32'))
faiss.write_index(index, "poem_index.faiss")
with open("poem_id_map.json", "w") as f:
    json.dump(poem_ids, f)
print("Embeddings and FAISS index generated and saved.")

# --- 5. Process Each Poem for Sentiment and Tags ---
print("Analyzing poems for sentiment and tags...")
for i, poem in enumerate(poems):
    poem_text = poem_texts[i]
    poem_id = poem['_id']

    # A. Get Sentiment
    # We truncate the text to 512 tokens, which is a common limit for these models
    sentiment_result = sentiment_classifier(poem_text[:512])[0] 

    # B. Get Tags
    tag_result = tag_classifier(poem_text[:512], candidate_labels=candidate_tags)
    # Filter for tags with a score above a certain threshold (e.g., 0.6) to get the most relevant ones
    top_tags = [tag for tag, score in zip(tag_result['labels'], tag_result['scores']) if score > 0.4]

    # C. Update the document in MongoDB with the new data
    poem_collection.update_one(
        {"_id": ObjectId(poem_id)},
        {
            "$set": {
                "sentiment": {
                    "label": sentiment_result['label'],
                    "score": sentiment_result['score']
                },
                "tags": top_tags
            }
        }
    )
    print(f"Processed poem {i+1}/{len(poems)}: {poem['title']}")

print("\nContent enrichment complete! All poems have been updated in MongoDB.")