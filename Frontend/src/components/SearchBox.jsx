import { useRef, useState, useEffect, useCallback } from 'react';
import './SearchBox.css';

const suggestions = [
    'Shakespeare', 'Emily Dickinson', 'Robert Frost', 'Maya Angelou',
    'Walt Whitman', 'John Milton', 'Langston Hughes', 'Sylvia Plath',
    'E. E. Cummings', 'Pablo Neruda', 'Rumi', 'Edgar Allan Poe', 'William Blake'
];

function SearchBox({ setQuoteData, setCurrentView, currentView, likes, allPoems }) {
    const [selectedAuthor, setSelectedAuthor] = useState('');
    // NEW: State to control the animation's play/pause status
    const [isAnimationPaused, setIsAnimationPaused] = useState(false);

    const handleSearch = (authorName) => {
        if (!authorName || !authorName.trim()) {
            alert('Please select a valid author name.');
            return;
        }
        setSelectedAuthor(authorName);
    
        // This part remains the same
        if (currentView === 'likes') {
            const likedPoems = allPoems.filter(poem => likes.includes(poem.id));
            const filteredLikes = likedPoems.filter(poem => poem.author === authorName);
            setQuoteData(filteredLikes);
        } else {
            const filteredPoems = allPoems.filter(poem => poem.author === authorName);
            setQuoteData(filteredPoems);
            setIsAnimationPaused(true);
        }
    
        // --- ADD THIS LINE ---
        setCurrentView('search-results'); // This tells App.jsx to show the results view
    };

    const authorsToDisplay = currentView === 'likes'
        ? [...new Set(allPoems.filter(p => likes.includes(p.id)).map(p => p.author))]
        : suggestions;

    // To create a seamless loop, we render the list of authors twice.
    const duplicatedAuthors = [...authorsToDisplay, ...authorsToDisplay];

    return (
      <div className="search_box animated">
            {/* NEW: The 'paused' class is now dynamically added based on state */}
            <div className={`suggestion_container ${isAnimationPaused ? 'paused' : ''}`}>
                {duplicatedAuthors.map((item, idx) => (
                    <button
                        key={`${item}-${idx}`}
                        className={`suggestion_pill ${selectedAuthor === item ? 'selected' : ''}`}
                        onClick={() => handleSearch(item)}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SearchBox;
