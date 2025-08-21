// src/components/UnifiedSearch.jsx
import React, {useState, useEffect} from 'react';
import { useDebounce } from 'use-debounce';
import apiClient from '../api';

function UnifiedSearch({ setSearchResults, setIsLoading }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [debouncedQuery] = useDebounce(query, 300); // 300ms delay

  console.log('suggestions', suggestions);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length > 1) {
        try {
          const response = await apiClient.get(`/autocomplete?q=${encodeURIComponent(debouncedQuery)}`);
          setSuggestions(response.data);
        } catch (error) {
          console.error("Failed to fetch suggestions:", error);
          setSuggestions([]); // Clear suggestions on error
        }
      } else {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = async (searchTerm) => {
    if (searchTerm.trim().length < 2) {
      alert('Please enter a search query of at least 2 characters.');
      return;
    }
    setIsLoading(true);
    setSuggestions([]); // Hide suggestions
    setQuery(searchTerm); // Update input to show what was searched
    try {
      const response = await apiClient.get(`/search/unified?q=${encodeURIComponent(searchTerm)}`);
      console.log('response', response.data);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Failed to perform unified search:", error);
      alert("Search failed. Please try again.");
    }
    setIsLoading(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: 'auto' }}>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by author, title, or theme..."
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #555' }}
        />
      </form>
      {suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          width: '100%',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          listStyle: 'none',
          padding: '0',
          margin: '5px 0 0 0',
          zIndex: 1000,
        }}>
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSearch(suggestion.value)}
              style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', color: 'black' }}
            >
              <strong>{suggestion.value}</strong>
              <em style={{ marginLeft: '10px', color: '#888', fontSize: '0.8em' }}> ({suggestion.type})</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UnifiedSearch;
