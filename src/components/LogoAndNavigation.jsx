import React from 'react';

/**
 * Renders the fixed logo link and the side/top navigation dots.
 * @param {object} props
 * @param {string} props.activeSection - The currently visible section ('main', 'updates', 'about').
 * @param {number} props.innerWidth - The current window width, used for responsive styling.
 */
const LogoAndNavigation = ({ activeSection, innerWidth, isModalOpen }) => {
  const isMobile = innerWidth <= 770;
  const isTablet = innerWidth > 770 && innerWidth < 1130;

  return (
    <>
      <a href={`#main`}>
        <img
          src="/icon.png"
          alt="logo"
          onMouseEnter={(e) => {
            e.target.style.opacity =
              activeSection === "updates" ? "0.4" : "0.6";
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity =
              activeSection === "updates" ? "0.2" : "0.4";
          }}
          className="fixed top-10 opacity-40 left-10 w-12 h-12 z-20"
          style={{
            filter: "drop-shadow(0 4px 10px rgba(193, 176, 255, 0.4))",
            animation: "sway 8s ease-in-out infinite",
            opacity: isModalOpen 
              ? 0 
              : isMobile
              ? 0
              : activeSection === "updates"
              ? 0.2
              : activeSection === "about" && isTablet
              ? 0
              : 0.4,
            transition: "1s cubic-bezier(.17,.67,.86,.43)",
          }}
        />
      </a>

      <nav className={`fixed z-20 hidden md:block top-6 left-0 w-full md:px-4 lg:w-auto lg:right-8 lg:top-1/2 lg:left-auto lg:transform lg:-translate-y-1/2 opacity-70 ${isModalOpen ? 'opacity-0' : ''}`}>
        <ul className="flex justify-center space-x-4 lg:flex-col lg:space-x-0 lg:space-y-4">
          {["main", "updates", "about", "credits"].map((section) => (
            <li key={section} className="inline-flex">
              <a
                href={`#${section}`}
                className={`w-3 h-3 block rounded-full transition-all duration-300 ${
                  activeSection === section
                    ? "bg-white/80 scale-105 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    : "bg-white/30 hover:bg-white/80"
                }`}
                aria-label={`Scroll to ${section} section`}
                aria-current={activeSection === section ? "true" : "false"}
              />
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default LogoAndNavigation;