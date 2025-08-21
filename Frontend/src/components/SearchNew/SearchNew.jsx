import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import './SearchNew.css';
import { useDebounce } from 'use-debounce';
import apiClient from '../../api';

const ALL_FILTERS = ["author", "title", "tag", "sentiment"];

const FILTER_ICONS = {
    author: "ph ph-user",
    title: "ph ph-notepad",
    tag: "ph ph-tag",
    sentiment: "ph ph-smiley"
};

function SearchNew({ setSearchResults, setIsLoading, onSearchInitiate }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isContentVisible, setIsContentVisible] = useState(false);
    const [lastSearches, setLastSearches] = useState([]);
    const [debouncedQuery] = useDebounce(query, 300);

    const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState(ALL_FILTERS);
    
    
    const searchContainerRef = useRef(null);

    useEffect(() => {
        const savedSearches = JSON.parse(localStorage.getItem('lastSearches')) || [];
        setLastSearches(savedSearches);
    }, []);

    // --- REMOVED: The old handleClickOutside effect ---

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedQuery.length > 1) {
                let url = `/autocomplete?q=${encodeURIComponent(debouncedQuery)}`;
                
                if (activeFilters.length === 1) {
                    url += `&filter_by=${activeFilters[0]}`;
                }

                try {
                    const response = await apiClient.get(url);
                    setSuggestions(response.data);
                } catch (error) {
                    console.error("Failed to fetch suggestions:", error);
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
            }
        };
        fetchSuggestions();
    }, [debouncedQuery, activeFilters]);

    const handleSearch = async (searchTerm) => {
        if (searchTerm.trim().length < 2) return;

        if (onSearchInitiate) {
            onSearchInitiate();
        }
        
        const updatedSearches = [searchTerm, ...lastSearches.filter(s => s !== searchTerm)].slice(0, 3);
        setLastSearches(updatedSearches);
        localStorage.setItem('lastSearches', JSON.stringify(updatedSearches));

        // setIsLoading(true);
        setSuggestions([]);
        setIsContentVisible(false);
        setQuery(searchTerm);
        try {
            const response = await apiClient.get(`/search/unified?q=${encodeURIComponent(searchTerm)}`);
            console.log('searched result : ', response.data);
            setSearchResults(response.data);
        } catch (error) {
            console.error("Failed to perform unified search:", error);
            alert("Search failed. Please try again.");
        }
        // setIsLoading(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleFilterToggle = (e) => {
        e.preventDefault();
        const newVisibility = !isFilterPanelVisible;
        setIsFilterPanelVisible(newVisibility);
        if (newVisibility) {
            setIsContentVisible(true);
            setActiveFilters(ALL_FILTERS);
        }
    };
    
    const handleInputChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        setIsContentVisible(true);
        if (newQuery.length > 0) {
            setIsFilterPanelVisible(true);
        } else {
            setIsFilterPanelVisible(false);
        }
    };

    const removeFilter = (e, filterToRemove) => {
        e.stopPropagation();
        setActiveFilters(prevFilters => prevFilters.filter(f => f !== filterToRemove));
    };

    const clearSearch = () => {
        setQuery('');
        setSuggestions([]);
        setIsFilterPanelVisible(false);
    };
    
    // --- NEW: Robust onBlur handler ---
    const handleBlur = (e) => {
        // e.relatedTarget is the element that is receiving focus
        // If the relatedTarget is null or is NOT inside the search container, then close the dropdown
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsContentVisible(false);
            setIsFilterPanelVisible(false);
        }
    };

    const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
        const { type } = suggestion;
        if (!activeFilters.includes(type)) {
            return acc;
        }
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(suggestion);
        return acc;
    }, {});

    return (
        // --- MODIFIED: Add onBlur to the main container ---
        <div className="search" ref={searchContainerRef} onBlur={handleBlur}>
            <div className="search-modal">
                <form onSubmit={handleFormSubmit} className="search-bar">
                    <div className="search-icon">
                        <FontAwesomeIcon icon={faSearch} />
                    </div>
                    <div className="input">
                        <input
                            type="text"
                            id="search-input"
                            value={query}
                            onChange={handleInputChange}
                            onFocus={() => setIsContentVisible(true)}
                            placeholder="Search for poems, authors, sentiments"
                            autoComplete="off"
                        />
                        {query.length > 0 && (
                            <span className="clear-icon" onClick={clearSearch}>x</span>
                        )}
                    </div>
                    <div className="action-icons">
                        <div className="filter-icon">
                            <i className="ph ph-sliders-horizontal"></i>
                        </div>
                        <div className="cmd-icon" onMouseDown={handleFilterToggle} style={{cursor: 'pointer'}}>
                            <span style={{ fontSize: '20px' }}>⌘</span>
                        </div>
                    </div>
                </form>

                {isContentVisible && (
                    <div className="dropdown dropdown-visible">
                        {isFilterPanelVisible && (
                            <div className="tags-container">
                                <span>I'm looking for...</span>
                                <div className="tags">
                                    {activeFilters.map((filter) => (
                                        <div className="tag" key={filter}>
                                            {/* <i className={FILTER_ICONS[filter]}></i> */}
                                            <p>{filter}</p>
                                            <span className="remove-filter-icon" onMouseDown={(e) => removeFilter(e, filter)}>x</span>
                                        </div>  
                                    ))}
                                </div>
                            </div>
                        )}

                        {query.length === 0 && lastSearches.length > 0 && (
                             <div className="search-items-container">
                                <p>Last searches &nbsp;&nbsp; <span>{lastSearches.length}</span></p>
                                <ul id="search-items">
                                    {lastSearches.map((term, index) => (
                                        <li key={index} onMouseDown={() => handleSearch(term)}>
                                            <a href="#">{term}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {query.length > 1 && Object.keys(groupedSuggestions).length > 0 && (
                            Object.entries(groupedSuggestions).map(([type, items]) => (
                                <div className="search-items-container" key={type}>
                                    <p style={{textTransform: 'capitalize'}}>{type}s</p>
                                    <ul id="search-items">
                                        {items.map((suggestion, index) => (
                                            <li key={index} onMouseDown={() => handleSearch(suggestion.value)}>
                                                {type === 'author' && <img src={`https://placehold.co/40x40/000000/FFF?text=${suggestion.value.charAt(0)}`} alt={suggestion.value} className="author-avatar" />}
                                                <a href="#">{suggestion.value}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchNew;
