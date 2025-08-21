import React, { useEffect, useRef, useState } from "react";
import { FaBookmark, FaHeart } from 'react-icons/fa';
import "./Card.css";

// --- UPDATED: Component now receives `likes` and `bookmarks` as props ---
function Card({ quoteData, position = 'center', onClick, onNext, onPrev, onLike, onBookmark, likes, bookmarks }) {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const poemRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // --- REMOVED: All internal useState and useEffect for liked/bookmarked and localStorage ---

  // --- NEW: Determine liked/bookmarked status from props ---
  // The `likes` and `bookmarks` arrays now come from App.jsx and contain only poem IDs.
  const isPoemLiked = likes.includes(quoteData?.id);
  const isPoemBookmarked = bookmarks.includes(quoteData?.id);

  // --- UPDATED: Handlers now just call the parent functions ---
  const handleLikeClick = (e) => {
    e.stopPropagation(); // Prevent card's onClick from firing
    onLike(quoteData);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation(); // Prevent card's onClick from firing
    onBookmark(quoteData);
  };

  // --- EXISTING UI LOGIC (No changes needed) ---
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) onNext();
    else if (diff < -50) onPrev();
  };

  useEffect(() => {
    const el = poemRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
      const handleScroll = () => {
        setHasScrolled(el.scrollTop + el.clientHeight >= el.scrollHeight - 5);
      };
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [quoteData]);

  const scrollDown = () => {
    poemRef.current?.scrollBy({ top: 200, behavior: 'smooth' });
  };

  return (
    <div className={`card ${position}`} onClick={onClick} role="button" tabIndex="0">
      <div className="poem-card" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="content">
          <div className="heading">
            <h2>{quoteData?.title}</h2>
          </div>
          <div className="poem-content" ref={poemRef}>
            <pre className="lines">{quoteData?.lines?.join("\n")}</pre>
          </div>
        </div>

        {isOverflowing && !hasScrolled && (
          <div className="scroll-hint" onClick={scrollDown}>
            <span className="chevron">&#x25BC;</span>
          </div>
        )}

        {/* --- NEW: Add this block to display tags --- */}
        <div className="card-tags">
          {quoteData?.tags?.map((tag) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>
        {/* ----------------------------------------- */}

        <div className="card-actions">
          <button className="action-btn" aria-label="Bookmark">
            <FaBookmark
              onClick={handleBookmarkClick}
              color={isPoemBookmarked ? "#FFD700" : "white"}
              size={16}
              style={{ cursor: "pointer", marginRight: "10px" }}
            />
          </button>
          <button className="action-btn" aria-label="Like">
            <FaHeart
              onClick={handleLikeClick}
              color={isPoemLiked ? "red" : "white"}
              size={16}
              style={{ cursor: "pointer" }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Card;
