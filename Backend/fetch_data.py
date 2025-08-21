import requests
import json
import time

# List of authors to fetch from PoetryDB
# You can add or remove authors from this list
AUTHORS = [
    'Shakespeare', 'Emily Dickinson', 'Robert Frost', 'Maya Angelou',
    'Walt Whitman', 'John Milton', 'Langston Hughes', 'Sylvia Plath',
    'E. E. Cummings', 'Pablo Neruda', 'Rumi', 'Edgar Allan Poe', 'William Blake'
]

# The base URL for the PoetryDB API
API_BASE_URL = "https://poetrydb.org/author"

def fetch_poems_for_author(author):
    """Fetches all poems for a given author from PoetryDB."""
    print(f"Fetching poems for {author}...")
    try:
        response = requests.get(f"{API_BASE_URL}/{author}")
        # Raise an exception if the request was unsuccessful
        response.raise_for_status()
        poems = response.json()
        print(f"  Found {len(poems)} poems for {author}.")
        return poems
    except requests.exceptions.HTTPError as http_err:
        # If an author is not found (404), PoetryDB might return an error
        print(f"  Could not fetch poems for {author}. Status code: {response.status_code}, Message: {response.text}")
        return []
    except Exception as err:
        print(f"  An error occurred: {err}")
        return []

def main():
    """Main function to fetch all poems and save them to a file."""
    all_poems_to_save = []
    
    for author in AUTHORS:
        # The API expects spaces to be encoded as %20
        formatted_author = author.replace(" ", "%20")
        author_poems = fetch_poems_for_author(formatted_author)
        
        # Format the data to match our required schema
        for poem in author_poems:
            # Some poems from the API might be missing lines, so we add a check
            if 'title' in poem and 'author' in poem and 'lines' in poem:
                formatted_poem = {
                    "title": poem['title'],
                    "author": poem['author'],
                    "lines": poem['lines']
                }
                all_poems_to_save.append(formatted_poem)
        
        # Be respectful to the API server by waiting a moment between requests
        time.sleep(1) 

    print(f"\nTotal poems fetched and formatted: {len(all_poems_to_save)}")

    # Save the aggregated list to poems.json, overwriting the old file
    try:
        with open("poems.json", "w") as f:
            json.dump(all_poems_to_save, f, indent=2)
        print("Successfully saved all poems to poems.json")
    except Exception as e:
        print(f"Failed to write to poems.json: {e}")

if __name__ == "__main__":
    main()
