/** @file Carousel.jsx
 * @description: Card for the version swapper

 * This file contains:
 * - Everything for the carousel component used in the main hero section


  */

import React, { useEffect, useRef, useState } from "react";
import images from "../data/images.json";

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => setCurrentIndex((i) => (i + 1) % images.length);
  const prevSlide = () =>
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % images.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const hasMovedRef = useRef(false);
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
    hasMovedRef.current = false;
  };
  const handleTouchMove = (e) => {
    hasMovedRef.current = true;
  };
  const handleTouchEnd = (e) => {
    if (!hasMovedRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartXRef.current;
    const dy = t.clientY - touchStartYRef.current;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <div
      className={`relative w-full mt-6 md:mt-0 md:absolute md:-right-4 md:top-1/2 md:-translate-y-1/2 md:w-[36rem] z-30 carousel-container ${{
        window:
          window.innerWidth < 500
            ? "absolute left-0 right-0 w-screen"
            : "max-w-full",
      }}`}
    >
      <div
        className={`relative mx-auto overflow-hidden hardcodedForceBlack carousel w-full ${window.innerWidth < 500
          ? "h-48 rounded-none"
          : "h-[20rem] md:h-[20rem] rounded-2xl"
          }`}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center left",
          height: window.innerWidth < 500 ? undefined : "19rem",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map(({ src, title }, i) => {
          const n = images.length;
          const pos = (i - currentIndex + n) % n;
          let style = "";

          if (window.innerWidth < 500) {
            if (pos === 0) style = "z-20 scale-100 opacity-100 translate-x-0";
            else style = "z-0 scale-100 opacity-0 translate-x-0";
          } else {
            if (pos === 0) {
              style = "z-20 scale-100 opacity-100 translate-x-0";
            } else if (pos === 1) {
              style = "z-10 scale-90 opacity-85 translate-x-16";
            } else if (pos === n - 1) {
              style = "z-10 scale-90 opacity-85 -translate-x-16";
            } else {
              style = "z-0 scale-90 opacity-0 translate-x-32";
            }
          }

          return (
            <div
              key={src}
              className={`hardcodedForceBlack 
                ${pos === 0 ? "ring-glow" : ""} 
                ${pos === 1 || pos === n - 1 ? "ring-glow" : ""} 
                transition-all duration-500 ease-out absolute inset-0 m-auto h-full w-full 
                ${style}
              `}
            >
              <img
                src={src}
                alt={title}
                className="h-full w-full object-contain"
              />
            </div>
          );
        })}

        <button
          aria-label="Previous slide"
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/80 text-white px-2 py-1 text-xs z-30"
        >
          ‹
        </button>
        <button
          aria-label="Next slide"
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/80 text-white px-2 py-1 text-xs z-30"
        >
          ›
        </button>

        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${i === currentIndex ? "bg-white" : "bg-white/40"
                }`}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 text-center">
        <p id="descrip" className="text-xs text-white/60">
          {images[currentIndex].description}
        </p>
        <h3 className="text-sm by font-semibold text-white/90">
          {images[currentIndex].title}
          {"  "}
          <span className="text-xs text-white/60">
            — by {images[currentIndex].credits}
          </span>
        </h3>
      </div>
    </div>
  );
};

export default Carousel;
