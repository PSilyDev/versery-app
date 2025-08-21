import React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
// Import required modules
import { EffectCoverflow, Navigation, Keyboard, Mousewheel } from 'swiper/modules';

// Import your custom Carousel CSS and the Card component
import './Carousel.css';
import Card from '../Card'; // Assuming Card.jsx is in the parent components folder

// The Carousel now accepts props to make it reusable and interactive
const Carousel = ({ poems, onLike, onBookmark, likes, bookmarks }) => {

    // Guard clause to prevent rendering an empty carousel, which can cause errors.
    if (!poems || poems.length === 0) {
        return null; // Render nothing if there are no poems
    }

    return (
        <div className="swiper-carousel-container">
            <Swiper
                modules={[EffectCoverflow, Navigation, Keyboard, Mousewheel]}
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                loop={true} // Re-enabled loop
                slidesPerView={'auto'} // Let Swiper determine the number of slides based on their width
                coverflowEffect={{
                    rotate: 0,
                    stretch: 0,
                    depth: 100,
                    modifier: 2.5,
                    slideShadows: false,
                }}
                navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                }}
                keyboard={{ enabled: true }}
                mousewheel={true}
            >
                {poems.map((poem, index) => (
                    <SwiperSlide key={`${poem.id}-${index}`}>
                        <Card
                            quoteData={poem}
                            onLike={onLike}
                            onBookmark={onBookmark}
                            likes={likes}
                            bookmarks={bookmarks}
                            isCarouselCard={true} 
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Navigation Buttons remain outside the conditional render */}
            <div className="swiper-button-prev">
                <i className="bx bx-left-arrow-alt"></i>
            </div>
            <div className="swiper-button-next">
                <i className="bx bx-right-arrow-alt"></i>
            </div>
        </div>
    );
}

export default Carousel;
