import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGooglePlay } from "@fortawesome/free-brands-svg-icons";
import {
  FaDownload,
  FaDiscord,
  FaFile,
  FaRocket,
  FaChevronRight,
  FaLock,
} from "react-icons/fa6";
import { useDownloadData } from "../hooks/useDownloadData";
import Carousel from "./Carousel";
import images from "../data/images.json";
const handleDiscordClick = () => {
  window.open("https://discord.gg/S7VxwfS8w9", "_blank");
};
const handleDocumentationClick = () => {
  window.open("https://docs.armsx2.net", "_blank");
};
const handleSourceClick = () => {
  window.open("https://github.com/ARMSX2", "_blank");
};

const MainHeroSection = ({ handleTransitionAndNavigate, isEntering }) => {
  const { downloadURL, playURL, version, isLoading } = useDownloadData();
  const isDownloadLocked = downloadURL === null || isLoading;
  const [primaryButtonScale, setPrimaryButtonScale] = useState(1);
  const [secondaryButtonScale, setSecondaryButtonScale] = useState(1);
  const [primaryButtonPosition, setPrimaryButtonPosition] = useState({ x: 0, y: 0 });
  const [secondaryButtonPosition, setSecondaryButtonPosition] = useState({ x: 0, y: 0 });

  const handleButtonMouseDown = (e, setScale) => {
    setScale(0.92);
    setTimeout(() => {
      setScale(1.01);
      setTimeout(() => {
        setScale(1);
      }, 120);
    }, 90);
  };

  const handleButtonMouseUp = (e, setScale) => {
    setScale(1.01);
    setTimeout(() => {
      setScale(1);
    }, 100);
  };

  const handleMouseMove = (e, setPosition) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.1, y: y * 0.1 });
  };

  return (
    <div
      className={`relative mx-auto flex flex-col md:flex-row md:min-h-screen max-w-7xl items-start md:items-center px-6 py-10 md:py-16 w-full mobile-container overflow-x-hidden transition-all duration-700 delay-100 snap-start ${
        isEntering
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform translate-y-4"
      }`}
      id="main"
    >
      <div className="w-full max-w-2xl left-content snap-start">
            <div className="hidden md:flex mt-1 items-center gap-3">
              <span className="inline-block rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 ring-glow">
                ARMSX2 is currently {""}
                {version === "unreleased" ? "unreleased" : "on v" + version}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-5 md:mt-5">
              <h1 className="title text-4xl md:text-5xl font-semibold leading-tight text-white text-glow">
                ARMSX2
              </h1>
              <span className="inline-block rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 ring-glow md:hidden">
                {window.innerWidth < 380
                  ? version === "unreleased"
                    ? "unreleased"
                    : "currently on v" + version
                  : version === "unreleased"
                  ? "is currently unreleased"
                  : "latest release on v" + version}
              </span>
            </div>
            <p className="mt-4 text-base md:text-lg text-white/80">
              ARMSX2 is a new open source emulator for the PS2, it is based on
              the PCSX2 emulator and aims to be the next step in PS2 emulation
              on Android, as well as cross platform support for iOS and other
              ARM Platforms.
            </p>
            <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="flex flex-row gap-3">
                <a
                  onMouseMove={(e) =>
                    handleMouseMove(e, setPrimaryButtonPosition)
                  }
                  onMouseLeave={() => setPrimaryButtonPosition({ x: 0, y: 0 })}
                  onMouseDown={(e) =>
                    handleButtonMouseDown(e, setPrimaryButtonScale)
                  }
                  onMouseUp={(e) =>
                    handleButtonMouseUp(e, setPrimaryButtonScale)
                  }
                  onClick={(e) => {
                    if (isDownloadLocked) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className={`ring-glow glint rounded-xl px-11 py-3 text-sm font-medium bg-[#8d76cc] hover:bg-[#7c69b7] text-white duration-300 ease-out shadow-[0_0_16px_rgba(141,118,204,0.25)] hover:shadow-[0_0_28px_rgba(141,118,204,0.4)] transition-shadow w-[80%] md:w-auto text-center ${
                    isDownloadLocked ? "disabledAPK" : ""
                  }`}
                  style={{
                    transform: `translate(${primaryButtonPosition.x}px, ${primaryButtonPosition.y}px) scale(${primaryButtonScale})`,
                    transition:
                      "transform 260ms cubic-bezier(0.22, 1.61, 0.36, 1)",
                    animation: "subtleSway 12s ease-in-out infinite",
                    cursor: isDownloadLocked ? "not-allowed" : "pointer",
                  }}
                  href={isDownloadLocked ? "#" : downloadURL}
                  {...(!isDownloadLocked && { download: true })}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isDownloadLocked ? (
                      <FaLock
                        className="text-xs text-[#fff]"
                        aria-hidden="true"
                      />
                    ) : (
                      <FaDownload
                        className="text-xs text-[#fff]"
                        aria-hidden="true"
                      />
                    )}
                    {isDownloadLocked
                      ? "Download Unavailable"
                      : "Download APK"}
                  </div>
                </a>
                <a
                  href={isDownloadLocked ? "#" : playURL}
                  onClick={(e) => {
                    if (isDownloadLocked) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className={`ring-glow glint rounded-xl px-4 py-3 text-sm font-medium text-white bg-[#4a5a97] hover:bg-[#425189] transition-all duration-300 ease-out shadow-[0_0_14px_rgba(74,90,151,0.25)] hover:shadow-[0_0_24px_rgba(74,90,151,0.4)] hover:scale-105 w-[20%] md:w-auto text-center flex items-center justify-center ${
                    isDownloadLocked ? "disabledAPK" : ""
                  }`}
                  style={{
                    transition: "all 260ms cubic-bezier(0.22, 1.61, 0.36, 1)",
                    animation: "subtleSway 12s ease-in-out infinite",
                    cursor: isDownloadLocked ? "not-allowed" : "pointer",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faGooglePlay}
                    style={{
                      fontSize: "17px",
                      color: "#f2eaeaff",
                    }}
                  />
                </a>
              </div>
              <div className="w-1 h-1 bg-white/20 rounded-full mx-2 hidden md:block" />
              <button
                onMouseMove={(e) =>
                  handleMouseMove(e, setSecondaryButtonPosition)
                }
                onMouseLeave={() => setSecondaryButtonPosition({ x: 0, y: 0 })}
                onMouseDown={(e) =>
                  handleButtonMouseDown(e, setSecondaryButtonScale)
                }
                onClick={handleSourceClick}
                onMouseUp={(e) =>
                  handleButtonMouseUp(e, setSecondaryButtonScale)
                }
                style={{
                  transform: `translate(${secondaryButtonPosition.x}px, ${secondaryButtonPosition.y}px) scale(${secondaryButtonScale})`,
                  transition:
                    "transform 260ms cubic-bezier(0.22, 1.61, 0.36, 1)",
                  animation: "subtleSway 14s ease-in-out infinite",
                }}
                className="ring-glow glint rounded-xl px-8 py-3 text-sm font-medium text-white bg-[#3e4d84] hover:bg-[#384476] duration-300 ease-out shadow-[0_0_14px_rgba(62,77,132,0.25)] hover:shadow-[0_0_24px_rgba(62,77,132,0.4)] transition-shadow w-full md:w-auto text-center"
              >
                Source Code
              </button>
            </div>
            <Carousel />
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 opacity-90">
              <div
                className="glassish h-24 rounded-xl flex items-center justify-between gap-3 px-4 group cursor-pointer transform-gpu duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] ring-glow shadow-[0_0_10px_rgba(141,118,204,0.18)] hover:shadow-[0_0_20px_rgba(141,118,204,0.3)] transition-shadow"
                role="button"
                onClick={handleDiscordClick}
                tabIndex={0}
              >
                <div className="flex items-center gap-3">
                  <FaDiscord
                    className="text-2xl text-[#8d76cc]"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-sm font-semibold">Discord</div>
                    <div className="text-xs text-white/70">
                      Join our community
                    </div>
                  </div>
                </div>
                <FaChevronRight
                  className="text-white/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/80"
                  aria-hidden="true"
                />
              </div>
              <div
                className="glassish h-24 rounded-xl flex items-center justify-between gap-3 px-4 group cursor-pointer transform-gpu transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] ring-glow shadow-[0_0_10px_rgba(141,118,204,0.18)] hover:shadow-[0_0_20px_rgba(141,118,204,0.3)] hover:bg-gradient-to-r hover:from-[#8d76cc]/10 hover:to-[#3e4d84]/10"
                role="button"
                tabIndex={0}
                onClick={() => handleTransitionAndNavigate("/compatibility")}
              >
                <div className="flex items-center gap-3">
                  <FaRocket
                    className="text-2xl text-[#8d76cc]"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-sm font-semibold">
                      Compatibility List
                    </div>
                    <div className="text-xs text-white/70">Can we run it?</div>
                  </div>
                </div>
                <FaChevronRight
                  className="text-white/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/80"
                  aria-hidden="true"
                />
              </div>
              <div
                className="glassish h-24 rounded-xl flex items-center justify-between gap-3 px-4 group cursor-pointer transform-gpu duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] ring-glow shadow-[0_0_10px_rgba(141,118,204,0.18)] hover:shadow-[0_0_20px_rgba(141,118,204,0.3)] transition-shadow"
                role="button"
                onClick={handleDocumentationClick}
                tabIndex={0}
              >
                <div className="flex items-center gap-3">
                  <FaFile
                    className="text-2xl text-[#8d76cc]"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-sm font-semibold">Documentation</div>
                    <div className="text-xs text-white/70">
                      Get started quickly
                    </div>
                  </div>
                </div>
                <FaChevronRight
                  className="text-white/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/80"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
    </div>
  );
};

export default MainHeroSection;