import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

// Collection of poetry lines
const collection = [
  { line: "Two roads diverged in a yellow wood," },
  { line: "And sorry I could not travel both" },
  { line: "And be one traveler, long I stood" },
  { line: "And looked down one as far as I could" },
  { line: "To where it bent in the undergrowth;" },
  { line: "Then took the other, as just as fair," },
  { line: "And having perhaps the better claim," },
  { line: "Because it was grassy and wanted wear;" },
  { line: "Though as for that the passing there" },
  { line: "Had worn them really about the same," },
  { line: "And both that morning equally lay" },
  { line: "In leaves no step had trodden black." },
  { line: "Oh, I kept the first for another day!" },
  { line: "Yet knowing how way leads on to way," },
  { line: "I doubted if I should ever come back." },
  { line: "I shall be telling this with a sigh" },
  { line: "Somewhere ages and ages hence:" },
  { line: "Two roads diverged in a wood, and I—" },
  { line: "I took the one less traveled by," },
  { line: "And that has made all the difference." },
];

const PoetryStyles = () => (
  <style>{`
    /* Renamed main container for clarity */
    .poetry-app-container * {
      margin: 0; padding: 0; box-sizing: border-box;
    }
    .poetry-app-container {
      background-color: #e3e3db;
      font-family: "Georgia", serif; /* A more classic font for poetry */
    }
    .poetry-app-container a,
    .poetry-app-container p {
      text-decoration: none;
      color: #1f1f1f;
      font-size: 15px;
      font-weight: 600;
    }
    nav, footer {
      position: absolute;
      left: 0; width: 100vw;
      padding: 2em;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 2;
    }
    nav { top: 0; }
    footer { bottom: 0; }
    .container {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      max-width: 100%;
    }
    .gallery-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      perspective: 2000px;
    }
    .gallery {
      position: relative;
      width: 600px;
      height: 600px;
      display: flex;
      justify-content: center;
      align-items: center;
      transform-origin: center;
    }
    .card {
      position: absolute;
      width: 150px; /* Wider for text */
      height: 150px; /* Taller for text */
      border-radius: 4px;
      transform-origin: center;
      cursor: pointer;
      /* Style for text cards */
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #d1d1c7;
      border: 1px solid #c5c5b9;
    }
    .card p {
        padding: 10px;
        text-align: center;
        font-size: 14px;
        line-height: 1.4;
        font-style: italic;
        font-weight: normal;
    }
    .title-container {
      position: fixed;
      bottom: 25%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: auto; /* Auto height for longer lines */
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
    }
    .title-container p {
      position: absolute;
      width: 100%;
      text-align: center;
      font-size: 36px;
      line-height: 1.2;
    }
    .word {
      display: inline-block;
    }
  `}</style>
);

const PoetryGallery = () => {
  const galleryRef = useRef(null);
  const galleryContainerRef = useRef(null);
  const titleContainerRef = useRef(null);
  const activeIndexRef = useRef(0);

  useLayoutEffect(() => {
    gsap.registerPlugin(SplitText);

    const gallery = galleryRef.current;
    const galleryContainer = galleryContainerRef.current;
    const titleContainer = titleContainerRef.current;

    const config = {
      imageCount: collection.length,
      radius: 350,
      lerpFactor: 0.15,
    };

    const parallax = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };
    const cards = [];
    
    for (let i = 0; i < config.imageCount; i++) {
      const angle = (i / config.imageCount) * Math.PI * 2;
      const x = config.radius * Math.cos(angle);
      const y = config.radius * Math.sin(angle);
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.index = i;
      // Use the line for the dataset title
      card.dataset.title = collection[i].line;

      // CHANGE: Create a <p> element instead of an <img>
      const p = document.createElement("p");
      p.textContent = collection[i].line;
      card.appendChild(p);

      gsap.set(card, {
        x, y,
        rotation: (angle * 180) / Math.PI + 90,
        transformOrigin: "center center",
      });

      gallery.appendChild(card);
      cards.push(card);
    }

    let currentTitle = null;
    let isPreviewActive = false;
    let isTransitioning = false;

    const updateTitle = (text, delay = 1) => {
      if (currentTitle) {
         gsap.to(currentTitle.querySelectorAll(".word"), {
            y: "-125%",
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => currentTitle?.remove()
        });
      }
      const p = document.createElement("p");
      p.textContent = text;
      titleContainer.innerHTML = '';
      titleContainer.appendChild(p);
      currentTitle = p;
      const split = new SplitText(p, { type: "words", wordsClass: "word" });
      gsap.from(split.words, {
        y: "125%",
        duration: 0.75,
        delay,
        stagger: 0.1,
        ease: "power4.out"
      });
    };
    
    const togglePreview = (index) => {
      if (isTransitioning && !isPreviewActive) return;
      
      isPreviewActive = true;
      isTransitioning = true;
      activeIndexRef.current = index;

      const targetAngle = -((index / config.imageCount) * 360);

      gsap.to(gallery, {
        rotation: targetAngle,
        scale: () => window.innerWidth < 768 ? 1.5 : 2.0, // Adjusted scale for text cards
        y: 350, // Pushes gallery down to keep it in view
        duration: 1.5,
        ease: "power3.inOut",
        onComplete: () => { isTransitioning = false; }
      });

      updateTitle(cards[index].dataset.title);
    };

    const resetGallery = () => {
      if (isTransitioning || !isPreviewActive) return;
      isTransitioning = true;
      isPreviewActive = false;

      if (currentTitle) {
        gsap.to(currentTitle.querySelectorAll(".word"), {
          y: "-125%",
          duration: 0.75,
          ease: "power4.in",
          onComplete: () => currentTitle?.remove(),
        });
      }

      gsap.to(gallery, {
        scale: 1,
        y: 0, 
        ease: "power3.inOut",
        duration: 1.5,
        onComplete: () => { isTransitioning = false; }
      });
    };

    const keyHandler = (e) => {
      if (!isPreviewActive || isTransitioning) return;
      const current = activeIndexRef.current;

      if (e.key === "Escape") return resetGallery();
      if (e.key === "ArrowRight") {
        const next = (current + 1) % config.imageCount;
        togglePreview(next);
      }
      if (e.key === "ArrowLeft") {
        const prev = (current - 1 + config.imageCount) % config.imageCount;
        togglePreview(prev);
      }
    };
    
    const mouseMoveHandler = (e) => {
        if (isPreviewActive || isTransitioning) return;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        parallax.targetY = (e.clientX - centerX) / centerX * 15;
        parallax.targetX = -(e.clientY - centerY) / centerY * 15;
    };
    
    const backgroundClickHandler = (e) => {
        if(e.target.closest('.card')) return;
        resetGallery();
    }

    document.addEventListener("click", backgroundClickHandler);
    document.addEventListener("keydown", keyHandler);
    document.addEventListener("mousemove", mouseMoveHandler);

    const animate = () => {
      if (!isPreviewActive) {
        parallax.currentX += (parallax.targetX - parallax.currentX) * config.lerpFactor;
        parallax.currentY += (parallax.targetY - parallax.currentY) * config.lerpFactor;
        gsap.set(galleryContainer, {
          rotateX: parallax.currentX,
          rotateY: parallax.currentY,
        });
      }
      requestAnimationFrame(animate);
    };

    animate();

    const intro = gsap.timeline();
    intro.to(gallery, { rotation: 360, duration: 2.5, ease: "power1.inOut" });
    intro.add(() => togglePreview(0), "-=1");

    return () => {
      document.removeEventListener("click", backgroundClickHandler);
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("mousemove", mouseMoveHandler);
      gallery.innerHTML = '';
      gsap.killTweensOf(gallery);
    };
  }, []);

  return (
    <>
      <PoetryStyles />
      <div className="poetry-app-container"> {/* Renamed */}
        <nav>
          <a href="#">Poetry Project</a>
          <p>By You</p>
        </nav>

        <div className="container">
          <div className="gallery-container" ref={galleryContainerRef}>
            <div className="gallery" ref={galleryRef}></div>
          </div>
          <div className="title-container" ref={titleContainerRef}></div>
        </div>

        <footer>
          <p>Experiment 521</p>
          <p>Robert Frost</p>
        </footer>
      </div>
    </>
  );
};

export default PoetryGallery;