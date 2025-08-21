import React from "react";
import './DropdownPanel.css';

export default function DropdownPanel({ onShowLikes, onShowBookmarks, onShowSearch, onClose, onLogout }) {
  return (
    <div className="dropdown-panel">
      <div className="action-container">
      <button className="action-pill" onClick={onShowLikes}>❤️ Likes</button>
      <button className="action-pill" onClick={onShowBookmarks}>🔖 Bookmarks</button>
      <button className="action-pill close-button" onClick={onClose}>❌ Close</button>
      <button onClick={onShowSearch}>Semantic Search</button>
      <button onClick={onLogout}>Logout</button>
      <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
