import Card from "./components/Card";
import SearchBox from "./components/SearchBox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import './Search.css';
import React, { useState } from "react";

function Search({ quoteData, setQuoteData }) {

    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNextQuote = () => {
        console.log("handleNextQuote clicked");
        setCurrentIndex((prevIndex) => (prevIndex + 1) % quoteData.length);
    }

    const handlePrevQuote = () => {
    console.log("handlePrevQuote clicked");
    setCurrentIndex((prevIndex) => (prevIndex - 1 + quoteData.length) % quoteData.length);
    }

    console.log("inside Search component, quoteData - ", quoteData);

    return(
        <div className="base">
            <div className="content">
                <div className="search_centered">
                    <SearchBox setQuoteData={setQuoteData} />
                </div>
                {quoteData && <Card quoteData={quoteData[currentIndex]} onNext={handleNextQuote} onPrev={handlePrevQuote} />}
            </div>
            <div className="made_with_love">
                Made with love <FontAwesomeIcon icon={faHeart} size="s" style={{ color: "#ff0000", marginLeft: "5px", marginRight: "5px" }}/> by <em>Prakhar</em> and <em>Neelabh.</em>
            </div>
        </div>
    )
}

export default Search;