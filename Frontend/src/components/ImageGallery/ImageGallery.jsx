import React, { useLayoutEffect, useRef, useCallback, useState, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { fetchArtisticImages } from '../../unsplash';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../AuthModal/AuthModal';
import { useInteractions } from '../../hooks/useInteractions';


// This is a placeholder for your actual API call


const GalleryStyles = () => (
  <style>{`
    
    ::-webkit-scrollbar {
      width: 2px;
    }
    /* Track */
    ::-webkit-scrollbar-track {
      background: #f1f1f1; 
    }
    /* Handle */
    ::-webkit-scrollbar-thumb {
      background: #888; 
    }
    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
      background: #555; 
    }
    .image-gallery-wrapper {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      display: flex; justify-content: center; align-items: center;
      overflow: hidden;
      z-index: 50;
    }
    .gallery-container {
      width: 100%; height: 100%;
      display: flex; justify-content: center; align-items: center;
      perspective: 2000px;
    }
    .gallery {
      position: relative;
      width: 600px; height: 600px;
      display: flex; justify-content: center; align-items: center;
      transform-origin: center;
    }
    .card {
      position: absolute;
      width: 80px; height: 110px;
      margin: 0 10px; border-radius: 4px;
      transform-origin: center;
      background: #000;
      pointer-events: auto;
    }
    .card img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      border-radius: 4px;
      pointer-events: none;
      z-index: 1;
    }
    .card-text {
      position: absolute;
      bottom: 0;
      background: rgba(255,255,255,0.85);
      font-size: 5px;
      padding: 4px;
      width: 100%;
      height: 70%;
      overflow-y: auto;
      font-family: sans-serif;
      line-height: 1.6;
      text-align: start;
      -webkit-overflow-scrolling: touch;
      pointer-events: auto;
      border-radius: 0 0 4px 4px;
      box-sizing: border-box;
      z-index: 2;
      touch-action: pan-y;
      overscroll-behavior: contain;
    }
    .card-text::-webkit-scrollbar {
      width: 2px;
      transition: width 0.4s ease-out;
    }
    .card-text:hover::-webkit-scrollbar {
      width: 2px;
    }
    .card-text::-webkit-scrollbar-track {
      background: transparent;
    }
    .card-text::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.3);
    }
    .card-text::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.5);
    }
    
    /* --- CORRECTED LIKE BUTTON STYLES --- */
    .like-button {
    display: flex; /* enables flexbox layout */
  justify-content: center; /* horizontally center icon */
  align-items: center; 
  position: absolute;
  top: 3px;
  right: 7%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 50%;
  // width: 10px;
  // height: 10px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  z-index: 3;
  transition: transform 0.2s ease;
  transform-origin: center;
  will-change: transform;
  shape-rendering: geometricPrecision;  /* <-- improves rendering of small SVGs */
  backface-visibility: hidden;          /* helps on some browsers */
  transform: translateZ(0);             /* force GPU rendering */
  filter: none;
  backdrop-filter: none;
}

.like-button:hover {
  transform: scale(1.1);
}

.like-button svg {
  width: 6px;
  height: 6px;
  display: block;
  margin: 2px;
  shape-rendering: geometricPrecision;
  backface-visibility: hidden;
  transform: translateZ(0);
  filter: none;
  opacity: 1;
  transition: none !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}


.like-button svg,
.like-button svg path {
  opacity: 1;
}




    
    /* Other styles remain the same */
    .title-container {
      position: fixed;
      top: 80%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 50%;
      height: auto;
      pointer-events: none;
    }
    .title-container p {
      position: absolute;
      width: 100%;
      text-align: center;
      font-size: 36px;
      color: #1f1f1f;
      font-family: "Voyage", sans-serif;
    }
    .word { display: inline-block; }
    .gallery-nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 100;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      font-weight: bold;
      color: #333;
      cursor: pointer;
      user-select: none;
      opacity: 0;
      pointer-events: auto;
    }
    .prev-button { left: 40px; }
    .next-button { right: 40px; }
    .author-display {
      position: fixed;
      bottom: 2vh;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 20px;
      color: #1f1f1f;
      font-style: italic;
      pointer-events: none;
      font-family: 'Georgia', serif;
      z-index: 100;
    }
  `}</style>
);

const ImageGallery = ({ data = [] }) => {
  const { currentUser } = useAuth();
  const {
    likes,
    addInteraction,
    removeInteraction,
  } = useInteractions();
  const galleryRef = useRef(null);
  const titleContainerRef = useRef(null);
  const activeIndexRef = useRef(0);
  const cardsRef = useRef([]);
  const isTransitioningRef = useRef(false);
  const authorRef = useRef(null);
  const [imageUrls, setImageUrls] = useState([]);
  // const [likedPoems, setLikedPoems] = useState(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const currentUserRef = useRef(currentUser);

  console.log('poem data - ', data);


// Keep ref in sync with latest user
useEffect(() => {
  currentUserRef.current = currentUser;
}, [currentUser]);


  // Use a ref to give the imperative onClick handler access to the state setter
  // const setLikedPoemsRef = useRef(setLikedPoems);
  // setLikedPoemsRef.current = setLikedPoems;

  useEffect(() => {
    fetchArtisticImages().then(urls => setImageUrls(urls));
  }, []);

  const fullCollection = useMemo(() => data.map((poem, i) => ({
    ...poem,
    img: imageUrls[i % imageUrls.length] || '',
  })), [data, imageUrls]);

  const galleryCollection = useMemo(() => fullCollection.length >= 20
    ? fullCollection.slice(0, 20)
    : Array.from({ length: 20 }, (_, i) => fullCollection[i % fullCollection.length]), [fullCollection]);

  const updateTitle = useCallback((text, delay = 1) => {
    const titleContainer = titleContainerRef.current;
    if (!titleContainer) return;
    const oldWords = titleContainer.querySelectorAll(".word");
    const animateInNewTitle = () => {
      titleContainer.innerHTML = '';
      const p = document.createElement("p");
      p.textContent = text;
      titleContainer.appendChild(p);
      const split = new SplitText(p, { type: "words", wordsClass: "word" });
      gsap.from(split.words, { y: "125%", duration: 0.75, delay: oldWords.length > 0 ? 0.2 : delay, stagger: 0.1, ease: "power4.out" });
    };
    if (oldWords.length > 0) {
      gsap.to(oldWords, { y: "-125%", duration: 0.5, ease: "power2.in", stagger: 0.03, onComplete: animateInNewTitle });
    } else { animateInNewTitle(); }
  }, []);

  const navigateToCard = useCallback((index) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    activeIndexRef.current = index;

    const gallery = galleryRef.current;
    const targetAngle = -((index % galleryCollection.length) / galleryCollection.length) * 360;

    gsap.to(gallery, {
      rotation: targetAngle,
      duration: 1.5,
      ease: "power3.inOut",
      onComplete: () => { isTransitioningRef.current = false; }
    });

    updateTitle(fullCollection[index]?.title || "");
    authorRef.current.innerHTML = `— ${fullCollection[index]?.author || "Unknown"}`;
  }, [galleryCollection.length, fullCollection, updateTitle]);

  const handleNextClick = useCallback(() => navigateToCard((activeIndexRef.current + 1) % fullCollection.length), [fullCollection.length, navigateToCard]);
  const handlePrevClick = useCallback(() => navigateToCard((activeIndexRef.current - 1 + fullCollection.length) % fullCollection.length), [fullCollection.length, navigateToCard]);

  useLayoutEffect(() => {
    if (!galleryCollection.length || !galleryCollection[0]?.img) return;

    gsap.registerPlugin(SplitText);
    const gallery = galleryRef.current;
    gallery.innerHTML = '';
    cardsRef.current = [];

    const startAnimation = () => {
      const intro = gsap.timeline();
      intro.to(gallery, { rotation: 360, duration: 2.5, ease: "power1.inOut" });
      intro.add(() => {
        isTransitioningRef.current = true;
        activeIndexRef.current = 0;
        gsap.to(gallery, {
          rotation: 0,
          scale: () => window.innerWidth < 768 ? 1.5 : 4,
          y: 1350,
          duration: 1.5,
          ease: "power3.inOut",
          onComplete: () => { isTransitioningRef.current = false; }
        });
        updateTitle(galleryCollection[0].title, 1);
        authorRef.current.innerHTML = `— ${galleryCollection[0].author || "Unknown"}`;
      }, "-=1");
      intro.to('.gallery-nav-button', { autoAlpha: 1, duration: 0.5, delay: 0.5 }, '-=1');
    };

    for (let i = 0; i < galleryCollection.length; i++) {
      const poem = galleryCollection[i];
      if (!poem) continue;

      const angle = (i / galleryCollection.length) * Math.PI * 2;
      const x = 350 * Math.cos(angle);
      const y = 350 * Math.sin(angle);

      const card = document.createElement("div");
      card.className = "card";
      
      const img = document.createElement("img");
      img.src = poem.img;

      const textContainer = document.createElement("div");
      textContainer.className = "card-text";
      const filteredLines = poem.lines?.filter(line => line.trim() !== poem.title.trim());
      textContainer.innerHTML = filteredLines?.join("<br>") || "";

      const likeButton = document.createElement("button");
      likeButton.className = "like-button";
      const heartSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      // --- CORRECTED SVG ATTRIBUTES ---
      heartSVG.setAttribute("width", "6");
      heartSVG.setAttribute("height", "6");
      heartSVG.setAttribute("viewBox", "0 0 25 25");
      heartSVG.setAttribute("stroke", "currentColor");
      // heartSVG.setAttribute("stroke-width", "2");
      // heartSVG.setAttribute("stroke-linecap", "round");
      // heartSVG.setAttribute("stroke-linejoin", "round");
      const heartPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      heartPath.setAttribute("d", "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z");
      
      // const isInitiallyLiked = likedPoems.has(poem._id);
      const isInitiallyLiked = likes.includes(poem._id);

      if (isInitiallyLiked) {
        heartSVG.setAttribute("fill", "red");
        heartSVG.setAttribute("stroke", "red");
      } else {
        heartSVG.setAttribute("fill", "none");
      }
      
      heartSVG.appendChild(heartPath);
      likeButton.appendChild(heartSVG);

      likeButton.onclick = (e) => {
        const userId = currentUserRef.current?.uid;
        e.stopPropagation();
      
        if (!currentUserRef.current) {
          setShowAuthModal(true);
          return;
        }
        const interactionPayload = {
          userId,                     // ✅ required
          poemId: poem._id,
          interactionType: "like"
        };
      
        if (likes.includes(poem._id)) {
          removeInteraction(interactionPayload);
          heartSVG.setAttribute("fill", "none");
          heartSVG.setAttribute("stroke", "currentColor");
        } else {
          addInteraction(interactionPayload);
          heartSVG.setAttribute("fill", "red");
          heartSVG.setAttribute("stroke", "red");
        }
      };
      
      
      
      card.appendChild(img);
      card.appendChild(textContainer);
      card.appendChild(likeButton);

      gsap.set(card, { x, y, rotation: (angle * 180) / Math.PI + 90, transformOrigin: "center center" });
      card.dataset.poemId = poem._id;
      gallery.appendChild(card);
      cardsRef.current.push(card);
    }

    Promise.all(galleryCollection.map(item => {
      if (!item?.img) return Promise.resolve();
      return new Promise(resolve => {
        const img = new Image();
        img.src = item.img;
        img.onload = resolve;
        img.onerror = resolve;
      });
    })).then(startAnimation);

    const handleKey = (e) => {
      if (isTransitioningRef.current) return;
      if (e.key === "ArrowRight") handleNextClick();
      if (e.key === "ArrowLeft") handlePrevClick();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [galleryCollection, handleNextClick, handlePrevClick, navigateToCard, updateTitle]);

  useEffect(() => {
    if (!likes || !galleryRef.current) return;
  
    const cards = galleryRef.current.querySelectorAll('.card');
  
    cards.forEach(card => {
      const poemId = card?.dataset?.poemId;
      const heartSVG = card.querySelector('svg');
  
      if (!poemId || !heartSVG) return;
  
      if (likes.includes(poemId)) {
        heartSVG.setAttribute('fill', 'red');
        heartSVG.setAttribute('stroke', 'red');
      } else {
        heartSVG.setAttribute('fill', 'none');
        heartSVG.setAttribute('stroke', 'currentColor');
      }
    });
  }, [likes]);
  

  return (
    <>
      <GalleryStyles />
      <div className="image-gallery-wrapper">
        <div className="gallery-nav-button prev-button" onClick={handlePrevClick}>‹</div>
        <div className="gallery-nav-button next-button" onClick={handleNextClick}>›</div>
        <div className="gallery-container">
          <div className="gallery" ref={galleryRef}></div>
        </div>
        <div className="title-container" ref={titleContainerRef}></div>
        <div className="author-display" ref={authorRef}></div>
        {showAuthModal && (
  <AuthModal onClose={() => setShowAuthModal(false)} />
)}

      </div>
    </>
  );
};

export default ImageGallery;
