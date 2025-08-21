import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  IconMagnifyingGlass,
  IconRightArrow,
  SearchInput
} from './searchStyle';
import { faSearch, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Search = ({ setShowSearchInput }) => {
  const targetRef = useRef(null);
  const containerRef = useRef(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const showInput = isHovered || isFocused;

  // Sync with parent
  useEffect(() => {
    setShowSearchInput(showInput);
  }, [showInput, setShowSearchInput]);

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsHovered(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showInput) {
      targetRef.current.value = "";
    }
  }, [showInput]);

  return (
    <Container
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      hover={showInput}
    >
      <SearchInput
        ref={targetRef}
        showSearchInput={showInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {showInput ? (
        <IconRightArrow icon={faArrowRight} />
      ) : (
        <IconMagnifyingGlass icon={faSearch} />
      )}
    </Container>
  );
};

export default Search;
