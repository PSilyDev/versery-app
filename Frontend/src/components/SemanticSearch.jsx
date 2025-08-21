// src/components/SemanticSearch.jsx
import React, { useState } from 'react';
import apiClient from '../api';

function SemanticSearch({ setSearchResults, setIsLoading }) {
  const [query, setQuery] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim().length < 3) {
      alert('Please enter a search query of at least 3 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/search?query=${encodeURIComponent(query)}`);
      // Add the 'id' field to match our frontend logic
      const poemsWithId = response.data.map(p => ({ ...p, id: p._id }));
      setSearchResults(poemsWithId);
    } catch (error) {
      console.error("Failed to perform semantic search:", error);
      alert("Search failed. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', padding: '20px' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for poems by feeling or theme..."
        style={{ flexGrow: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
      />
      <button type="submit" style={{ padding: '10px 15px', borderRadius: '5px', border: 'none', background: '#0A9396', color: 'white', cursor: 'pointer' }}>
        Search
      </button>
    </form>
  );
}

export default SemanticSearch; 