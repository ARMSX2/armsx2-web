/** @file DesktopFooter.jsx
 * @description: Site bottom footer

 * This file contains:
 * - Footer component for desktop viewports */

import React from 'react';

const DesktopFooter = ({ activeSection, handleTransitionAndNavigate }) => {
  if (typeof window === 'undefined' || window.innerWidth < 767) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 text-white/70 text-sm cursor-pointer select-none"
      style={{
        zIndex: 9999,
        transition: "text-shadow 0.3s ease",
        padding: "0.8rem",
        paddingRight: "2rem",
        opacity:
          activeSection === "updates"
            ? 0.2
            : activeSection !== "about" && window.innerWidth <= 500
            ? 0.4
            : 0.7,
        textShadow: "0 5px 10px rgba(255, 255, 255, 0.39)",
        animation: "sway 20s ease-in-out infinite",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.textShadow =
          "0 0 10px rgba(255, 255, 255, 0.7)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.textShadow =
          "0 5px 10px rgba(255, 255, 255, 0.39)";
      }}
    >
      <span>
        ©{new Date().getFullYear()} ARMSX2 All rights reserved, site by
      </span>
      <span> </span>
      <a
        href="https://github.com/tanosshi"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-white/90 transition-colors"
      >
        tanos
      </a>
      <span className="mx-2">•</span>
      <button
        onClick={() => handleTransitionAndNavigate("/contact")}
        className="hover:text-white/90 transition-colors cursor-pointer focus:outline-none"
        aria-label="Contact Us"
      >
        Contact Us
      </button>
    </div>
  );
};

export default DesktopFooter;