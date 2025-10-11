import React, { useState } from "react";
import Front from "./components/front";
import CompatibilityList from "./components/CompatibilityList.jsx"; // ignore error bruh youll live

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // eslint-disable-next-line
  const [nextPage, setNextPage] = useState(null);

  const navigateToPage = (page) => {
    if (page === currentPage || isTransitioning) return;

    setIsTransitioning(true);
    setNextPage(page);

    setTimeout(() => {
      setCurrentPage(page);
      setNextPage(null);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "compatibility":
        return (
          <CompatibilityList
            isthetransitioninghappening={isTransitioning}
            isEntering={!isTransitioning && currentPage === "compatibility"}
            onNavigate={navigateToPage}
          />
        );
      case "home":
      default:
        return (
          <Front
            onNavigate={navigateToPage}
            isTransitioning={isTransitioning}
            isEntering={!isTransitioning && currentPage === "home"}
          />
        );
    }
  };

  return (
    <div className="relative overflow-hidden">
      {renderCurrentPage()}
      {isTransitioning && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 pointer-events-none transition-opacity duration-300" />
      )}
    </div>
  );
}

export default App;
