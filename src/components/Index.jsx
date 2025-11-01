import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreditsSection from "./Credits";
import Updates from "./Updates";
import LogoAndNavigation from "./LogoAndNavigation";
import { useDownloadData } from "../hooks/useDownloadData";
import AboutAndFAQ from "./AboutAndFAQ";
import DesktopFooter from "./DesktopFooter";
import MainHeroSection from "./MainHeroSection";
import VersionSwapperModal from "./VersionSwapperModal";
import MobileFooter from "./MobileFooter";

const Index = ({ onNavigate, isthetransitioninghappening, isEntering }) => {
  const navigate = useNavigate();
  const [isVersionSwapperOpen, setIsVersionSwapperOpen] = useState(false);
  const { latestDownloadURL, playURL, latestVersion, isLoading, allReleases } =
    useDownloadData();
  const isDownloadLocked = latestDownloadURL === null || isLoading;
  const handleTransitionAndNavigate = (routePath) => {
    onNavigate(routePath);
    setTimeout(() => {
      navigate(routePath);
    }, 500);
  };

  const [activeSection, setActiveSection] = useState("main");

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      threshold: 0.5,
    });

    const sections = document.querySelectorAll(
      "#main, #updates, #about, #credits"
    );
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  return (
    <>
      <LogoAndNavigation
        activeSection={activeSection}
        innerWidth={window.innerWidth}
        isModalOpen={isVersionSwapperOpen}
      />
      <div
        className={`relative overflow-x-hidden transition-all duration-500 ease-out main-scroll-container ${
          isthetransitioninghappening
            ? "opacity-0 transform translate-x-12 scale-95 blur-sm"
            : isEntering
            ? "opacity-100 transform translate-x-0 scale-100 blur-0"
            : "opacity-100 transform translate-x-0 scale-100 blur-0"
        } md:overflow-y-auto md:scroll-smooth md:snap-y md:snap-mandatory md:touch-pan-y h-screen }`}
      >
        <div className="pointer-events-none fixed -left-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-[#8d76cc]/40 to-[#3e4d84]/30 bloom" />
        <div className="pointer-events-none fixed left-40 top-64 h-[34rem] w-[34rem] rounded-full bg-gradient-to-tr from-[#3e4d84]/25 to-[#8d76cc]/25 bloom-strong" />
        <MainHeroSection
          handleTransitionAndNavigate={handleTransitionAndNavigate}
          isEntering={isEntering}
          setIsVersionSwapperOpen={setIsVersionSwapperOpen}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b" />
        <div className="relative w-full space-y-6 snap-start">
          <Updates />
        </div>
        <div className="relative w-full snap-start">
          <AboutAndFAQ
            handleTransitionAndNavigate={handleTransitionAndNavigate}
          />
        </div>
        <div className="relative w-full snap-start">
          <CreditsSection
            handleTransitionAndNavigate={handleTransitionAndNavigate}
          />
        </div>
      </div>
      <DesktopFooter
        handleTransitionAndNavigate={handleTransitionAndNavigate}
      />
      <MobileFooter handleTransitionAndNavigate={handleTransitionAndNavigate} />
      {isVersionSwapperOpen && allReleases && (
        <VersionSwapperModal
          releases={allReleases}
          isOpen={isVersionSwapperOpen}
          onClose={() => setIsVersionSwapperOpen(false)}
        />
      )}
    </>
  );
};

export default Index;
