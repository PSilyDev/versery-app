import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';
// --- Step 1: Import the ImageGallery component ---
import ImageGallery from './components/ImageGallery/ImageGallery';
import SearchNew from './components/SearchNew/SearchNew';
import AuthModal from './components/AuthModal/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import apiClient from './api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
// import './App.css';

// It's best practice to keep styles in a separate CSS file,
// but for this example, we'll keep them here for clarity.
const AppStyles = () => (
<style>{`
  /* All of your original styles.css content goes here */
  /* No changes are needed to your existing CSS */
  @import url('https://fonts.cdnfonts.com/css/neue-montreal');
  @import url('https://fonts.cdnfonts.com/css/voyage');

  html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #ccd5ae;
}

.base {
  width: 100%;
  height: 100dvh;
  display: flex; 
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ccd5ae;
  overflow: hidden;
}

.content {
  text-align: center;
}

.master {
  display: flex;
  width: 1280px;
  height: 35vw;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
  .versery-app * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .versery-app {
    width: 100%;
    min-height: 100dvh;
    background: #e9e1c5;
    color: #000;
    overflow: hidden;
    position: relative;
  }

  .nav-container {
    width: 100%;
    position: relative;
    z-index: 100;
  }

  .nav {
    width: 95%;
    margin: 0 auto;
    padding: 2em 0;
    display: flex;
    align-items: center; /* Vertically align nav items */
  }

  .nav-item {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
   .nav-logo {
     font-family: "Space Grotesk", sans-serif;
      font-size: 24px;
      font-weight: 600;
      cursor: pointer;
  }

  .nav-item:first-child {
    margin-right: auto;
    justify-content: flex-start;
  }

  .nav-item:last-child {
    margin-left: auto;
    justify-content: flex-end;
  }

  .nav-item a {
    text-decoration: none;
    color: #000;
    font-family: "Space Grotesk", sans-serif;
    font-size: 60px;
  }

  .nav-cta a {
    text-transform: uppercase;
    font-size: 14px;
  }

  .nav-links a {
    padding: 0 2em;
    font-size: 18px;
  }
   .main-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: calc(100vh - 120px); /* Adjust based on nav height */
  }
   .hero-container {
      position: relative;
      z-index: 10;
      width: 100%;
  }
   .hero {
      width: 100%; /* Make hero wider */
      max-width: 700px; /* But not too wide */
      margin: 0 auto;
      text-align: center;
      padding: 3em 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
  }
   .hero h1 {
     max-width: 500px;
      font-family: "Voyage", sans-serif;
      font-weight: 500;
      font-size: clamp(2.5rem, 5vw, 4rem); /* Responsive font size */
  }
   .hero p {
      margin: 1rem 0 0 0;
      font-family: "Neue Montreal", sans-serif;
      font-size: 16px;
  }

  .search-container-center {
      height: 100%;
      width: 100%;
      margin-top: 2rem;
  }
  
  .search-container-center.fixed-top {
  height: 10%;
  background: red;
  position: fixed;
  top: -15px;
  width: 60%;
  left: 20%;
  z-index: 1000;
  background: none;
  padding: 16px 24px;
  // box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  animation: fadeInTopSearch 8s ease forwards;
  // animation-delay: 0.5s;
}

@keyframes fadeInTopSearch {
  0%   {opacity: 0;}
  25%  {opacity: 0;}
  50%  {opacity: 0.4;}
  75%  {opacity: 0.9;}
  100% {opacity: 1;}
    
}

  .bg-gradient {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    width: 500px;
    height: 500px;
  }

  .blob {
    display: flex;
    justify-content: center;
    align-items: center;
    animation: animate-blob 4s ease-in-out infinite;
  }

  @keyframes animate-blob {
    0% {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    }
    50% {
      border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    }
    100% {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    }
  }

  .blob-1 {
    position: absolute;
    top: 20%;
    left: 5%;
    width: 400px;
    height: 400px;
    background: url(http://googleusercontent.com/file_content/5) no-repeat 50% 50%;
    background-size: cover;
  }

  .blob-2 {
    position: absolute;
    top: 50%;
    right: 10%;
    width: 160px;
    height: 160px;
    background: url(http://googleusercontent.com/file_content/3) no-repeat 50% 50%;
    background-size: cover;
    animation-delay: 1s;
  }
  .marquee-placeholder {
    position: fixed;
    bottom: 1rem;
    width: 100%;
    text-align: center;
  }
  .hamburger-menu {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    width: 24px;
    height: 18px;
  }

  .hamburger-menu .bar {
    height: 3px;
    background-color: #000;
    border-radius: 1px;
  }

  .dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.dropdown-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dropdown-menu {
  position: absolute;
  padding: 1rem !important;
  top: 110%;
  right: 0;
  /* width: 40%; */
  /* max-width: 150px; */
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  min-width: 150px;
  z-index: 1000;
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px; /* Softer corners */
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.5s ease;
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* padding: 1rem; */
    /* align-items: center; */
    /* margin: 5px; */
    /* gap: 10px; */
}

/* Instead of hover, use the .open class */
.dropdown-menu.open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  /* gap: 50px; */
}


/* Show dropdown on hover or with a toggle class (JS-based) */
/* .dropdown:hover .dropdown-menu {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
} */

.dropdown-item {
  /* gap: 10px; */
  /* margin: 2rem 1rem; */
  /* margin-top: 1rem !important; */
  padding: 0.6rem !important;
  font-family: "Saans TRIAL", sans-serif;
  font-size: 1rem;
  color: #333;
  cursor: pointer;
  transition: background 0.2s ease;
  border-radius: 10%;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.6);
  /* padding: 1rem; */
}

.made_with_love {
    position: relative;
    bottom: auto;
    width: 100%;
    text-align: center;
    padding-bottom: 10px;
    font-size: 14px;
  }

`}</style>
);

function App() {
  const comp = useRef(null);
  const { currentUser, logout } = useAuth();
  
  // --- Step 2: Add state to manage the view ---
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);


  console.log("searched result - ", searchResults);
  console.log('hasSearched - ', hasSearched);
  console.log('user - ', currentUser);

  useEffect(() => {
    if(searchResults){
      setHasSearched(true);
    }
  }, [searchResults]);


  const handleShowLikedPoems = async () => {
    try {
      // Get liked poem IDs
      const likedRes = await apiClient.get('/me/interactions');
      const likedPoemIds = likedRes.data.map((entry) => entry.poemId);
  
      if (!likedPoemIds.length) {
        setSearchResults([]); // No liked poems
        return;
      }
  
      // Fetch poems by IDs
      const poemsRes = await apiClient.post('/poems/by-ids', likedPoemIds);
      setSearchResults(poemsRes.data);
    } catch (error) {
      console.error("Error fetching liked poems", error);
    }
  };
  

  // This function will be passed to SearchNew to trigger the view change
  const handleSearchInitiate = () => {
    // Animate the hero content and blobs out of view
    gsap.to(['.hero-container', '.bg-gradient', '.blob', '.marquee-placeholder'], {
        duration: 0.8,
        opacity: 0,
        y: -50,
        ease: 'power3.in',
        stagger: 0.1,
        onComplete: () => {
            // Once the animation is done, update the state to show the gallery
            setHasSearched(true);
        }
    });
  };

  // The initial page load animations remain unchanged
  useLayoutEffect(() => {
    // Only run the intro animation if a search has NOT been performed
    if (hasSearched) return;

    let ctx = gsap.context(() => {
      gsap.from(".nav-container", {
        duration: 1.5,
        opacity: 0,
        y: -60,
        ease: "power3.out",
        delay: 0.5,
      });

      gsap.from(".hero > *", {
        duration: 1,
        opacity: 0,
        y: 60,
        ease: "power3.out",
        delay: 1,
        stagger: { amount: 0.3 },
      });

      gsap.from([".blob", ".bg-gradient"], {
        duration: 2,
        scale: 0,
        ease: "power3.inOut",
        delay: 1.5,
        stagger: { amount: 0.5 },
      });

    }, comp);
    return () => ctx.revert();
  }, [hasSearched]); // This effect depends on the search state

  return (
    <>
      <AuthProvider>
      <AppStyles />
      <div className="versery-app" ref={comp}>
        <div className="nav-container">
          <div className="nav">
            <div className="nav-logo nav-item" onClick={() => {
              setHasSearched(false);
              setSearchResults(null);
            }}>Versery</div>
            <div className="nav-cta nav-item" style={{ cursor: 'pointer' }}>
  {currentUser ? (
    <>
      <div className="dropdown">
  <button 
    className="dropdown-toggle"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    ☰ {/* or a hamburger icon */}
  </button>

  <div className={`dropdown-menu ${menuOpen ? 'open' : ''}`}>
    {/* <div className="dropdown-item">My Profile</div> */}
    <div className="dropdown-item" onClick={handleShowLikedPoems}>Likes</div>
    <div className="dropdown-item" onClick={() => {
  logout();
  setMenuOpen(false);
}}>Logout</div>
  </div>
</div>

    </>
  ) : (
    <div onClick={() => setShowAuthModal(true)} className="nav-cta nav-item">
      Login / Sign Up
    </div>
  )}
</div>

          </div>
        </div>

        {/* ✅ Mount the modal when needed */}
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      
        {/* --- Step 3: Conditional Rendering --- */}
        {hasSearched ? (
          // If a search has happened, show the gallery
          <>
          <div className={`search-container-center ${hasSearched ? 'fixed-top' : ''}`}>
                            <SearchNew 
                              setSearchResults={(results) => {
                                console.log("🎯 Final search results received in parent:", results);
                                setSearchResults(results); // ✅ Actually stores the result
                              }} 
                            />
                        </div>
          <ImageGallery data={searchResults} />
          </>
        ) : (
          // Otherwise, show the default hero and decorative elements
          <>
            <div className="bg-gradient">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" id="blobSvg" style={{ filter: 'blur(20px)', opacity: 1 }}>
                <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style={{ stopColor: 'rgb(248, 121, 21)' }}></stop><stop offset="100%" style={{ stopColor: 'rgb(255, 201, 69)' }}></stop></linearGradient></defs>
                <path id="blob" fill="url(#gradient)" style={{ opacity: 1 }}><animate attributeName="d" dur="4s" repeatCount="indefinite" values="M421.63508,307.39005Q364.7801,364.7801,307.39005,427.43403Q250,490.08796,191.6822,428.36178Q133.3644,366.6356,70.9089,308.3178Q8.4534,250,54.21728,174.99058Q99.98115,99.98115,174.99058,81.49686Q250,63.01257,330.66021,75.84607Q411.32042,88.67958,444.90524,169.33979Q478.49006,250,421.63508,307.39005Z;M395.5,320Q390,390,320,400Q250,410,172,408Q94,406,59,328Q24,250,70.5,183.5Q117,117,183.5,108Q250,99,335,89.5Q420,80,410.5,165Q401,250,395.5,320Z;M408.24461,332.63257Q415.26513,415.26513,332.63257,434.71568Q250,454.16622,179.33614,422.74697Q108.67228,391.32772,65.87585,320.66386Q23.07942,250,63.27221,176.73251Q103.46501,103.46501,176.73251,63.02288Q250,22.58075,311.86507,74.4253Q373.73015,126.26985,387.47712,188.13493Q401.22409,250,408.24461,332.63257Z;M418.08664,320.33435Q390.6687,390.6687,320.33435,427.91946Q250,465.17023,188.27506,419.31005Q126.55013,373.44987,106.38448,311.72494Q86.21883,250,84.09726,165.98785Q81.9757,81.9757,165.98785,53.98938Q250,26.00305,311.1687,76.83282Q372.3374,127.6626,408.92099,188.8313Q445.50458,250,418.08664,320.33435Z;M421.63508,307.39005Q364.7801,364.7801,307.39005,427.43403Q250,490.08796,191.6822,428.36178Q133.3644,366.6356,70.9089,308.3178Q8.4534,250,54.21728,174.99058Q99.98115,99.98115,174.99058,81.49686Q250,63.01257,330.66021,75.84607Q411.32042,88.67958,444.90524,169.33979Q478.49006,250,421.63508,307.39005Z"></animate></path>
              </svg>
            </div>
            <div className="blob-1 blob"></div>
            <div className="blob-2 blob"></div>

            <div className="main-content">
                <div className="hero-container">
                    <div className="hero">
                        <h1>Discover Poetry Through Emotion & Meaning</h1>
                        <p>
                            Versery uses Artificial Intelligence to help you find poems that truly resonate.
                            Search by abstract themes, feelings, or authors to uncover literary treasures.
                        </p>
                        <div className={`search-container-center ${hasSearched ? 'fixed-top' : ''}`}>
                            {/* Pass the callback function to SearchNew */}
                            <SearchNew 
                              setSearchResults={(results) => {
                                console.log("🎯 Final search results received in parent:", results);
                                setSearchResults(results); // ✅ Actually stores the result
                              }} 
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="made_with_love">
              Made with love <FontAwesomeIcon icon={faHeart} size="sm" style={{ color: "#ff0000", marginLeft: "5px", marginRight: "5px" }}/> by <em>Prakhar</em>, <em>Ritika</em> and <em>Neelabh.</em>
            </div>
          
          </>
        )}
      </div>
      </AuthProvider>
    </>
  );
}

export default App;