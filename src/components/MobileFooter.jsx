/** @file MobileFooter.jsx
 * @description: Footer component for mobile devices.

 * This file contains:
 * - The footer for mobile */

import React from 'react';

const MobileFooter = ({ handleTransitionAndNavigate }) => {
  if (typeof window === 'undefined' || window.innerWidth >= 767) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] text-center py-4 text-white/70 text-sm bg-black/40 backdrop-blur-md border-t border-white/5 safe-area-bottom">
      <a
        href="https://github.com/tanosshi"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-white/90 transition-colors"
      >
        ©{new Date().getFullYear()} ARMSX2, site by tanos
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

export default MobileFooter;