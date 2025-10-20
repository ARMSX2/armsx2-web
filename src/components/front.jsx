import React, { useEffect, useRef, useState } from "react";

import images from "../data/images.json";
import blog from "../data/blog.json";
import Carousel from "./Carousel";
import Updates from "./Updates";
import faq from "../data/faq.json";

import {
  FaDownload,
  FaDiscord,
  FaFile,
  FaRocket,
  FaChevronRight,
  FaTriangleExclamation,
  FaLock,
} from "react-icons/fa6";

const Front = ({ onNavigate, isthetransitioninghappening, isEntering }) => {
  const [downloadURL, setApkUrl] = useState(null);
  const [version, setVersion] = useState(null) || "0";

  useEffect(() => {
    setVersion("0.0.0");
    fetch("https://api.github.com/repos/ARMSX2/ARMSX2/releases/latest")
      .then((res) => {
        if (!res.ok) throw new Error("No information about releases");
        return res.json();
      })
      .then((data) => {
        setVersion(data.tag_name.replace("v", ""));

        const found = data.assets.find((asset) =>
          asset.name.toLowerCase().endsWith(".apk")
        );

        if (found) setApkUrl(found.browser_download_url);
        else setApkUrl("LOCK");
      })
      .catch((err) => {
        setVersion("unreleased");
        setApkUrl("LOCK");
        console.error(err);
      });
  }, []);

  const [primaryButtonScale, setPrimaryButtonScale] = useState(1);
  const [secondaryButtonScale, setSecondaryButtonScale] = useState(1);
  const [activeSection, setActiveSection] = useState("main");
  const [expandedUpdate, setExpandedUpdate] = useState(null);

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

  const [primaryButtonPosition, setPrimaryButtonPosition] = React.useState({
    x: 0,
    y: 0,
  });
  const [secondaryButtonPosition, setSecondaryButtonPosition] = React.useState({
    x: 0,
    y: 0,
  });

  const handleMouseMove = (e, setPosition) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.1, y: y * 0.1 });
  };

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

    const sections = document.querySelectorAll("#main, #updates, #about");
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  // i wouldve done something extra with this but im keeping it ;like this for now ig
  const handleDiscordClick = () => {
    window.open("https://discord.gg/S7VxwfS8w9", "_blank");
  };
  const handleDocumentationClick = () => {
    window.open("https://docs.armsx2.net", "_blank");
  };
  const handleSourceClick = () => {
    window.open("https://github.com/ARMSX2", "_blank");
  };

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
          className="fixed top-10 opacity-40 left-10 w-12 h-12 z-50"
          style={{
            filter: "drop-shadow(0 4px 10px rgba(193, 176, 255, 0.4))",
            animation: "sway 8s ease-in-out infinite",
            opacity:
              window.innerWidth <= 770
                ? 0
                : activeSection === "updates"
                ? 0.2
                : 1,
            transition: "1s cubic-bezier(.17,.67,.86,.43)",
          }}
        />
      </a>

      <nav className="fixed opacity-70 right-8 top-1/2 transform -translate-y-1/2 z-50 hidden md:block">
        <ul className="space-y-4">
          {["main", "updates", "about"].map((section) => (
            <li key={section}>
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

      <div
        className={`relative overflow-x-hidden transition-all duration-500 ease-out ${
          isthetransitioninghappening
            ? "opacity-0 transform translate-x-12 scale-95 blur-sm"
            : isEntering
            ? "opacity-100 transform translate-x-0 scale-100 blur-0"
            : "opacity-100 transform translate-x-0 scale-100 blur-0"
        } md:overflow-y-auto md:scroll-smooth md:snap-y md:snap-mandatory md:touch-pan-y h-screen }`}
      >
        <div className="pointer-events-none fixed -left-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-[#8d76cc]/40 to-[#3e4d84]/30 bloom" />
        <div className="pointer-events-none fixed left-40 top-64 h-[34rem] w-[34rem] rounded-full bg-gradient-to-tr from-[#3e4d84]/25 to-[#8d76cc]/25 bloom-strong" />

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
                ARMSX2 is currently{" "}
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
              on Android, as well as cross platform support for iOS and other ARM Platforms.
            </p>
            <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <a
                onMouseMove={(e) =>
                  handleMouseMove(e, setPrimaryButtonPosition)
                }
                onMouseLeave={() => setPrimaryButtonPosition({ x: 0, y: 0 })}
                onMouseDown={(e) =>
                  handleButtonMouseDown(e, setPrimaryButtonScale)
                }
                onMouseUp={(e) => handleButtonMouseUp(e, setPrimaryButtonScale)}
                onClick={(e) => {
                  if (downloadURL === "LOCK") {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                className={`ring-glow glint rounded-xl px-11 py-3 text-sm font-medium bg-[#8d76cc] hover:bg-[#7c69b7] text-white transition-colors duration-300 ease-out shadow-[0_0_16px_rgba(141,118,204,0.25)] hover:shadow-[0_0_28px_rgba(141,118,204,0.4)] transition-shadow w-full md:w-auto text-center ${
                  downloadURL === "LOCK" ? "disabledAPK" : ""
                }`}
                style={{
                  transform: `translate(${primaryButtonPosition.x}px, ${primaryButtonPosition.y}px) scale(${primaryButtonScale})`,
                  transition:
                    "transform 260ms cubic-bezier(0.22, 1.61, 0.36, 1)",
                  animation: "subtleSway 12s ease-in-out infinite",
                  cursor: downloadURL === "LOCK" ? "not-allowed" : "pointer",
                }}
                href={downloadURL === "LOCK" ? "#" : downloadURL}
                {...(downloadURL !== "LOCK" && { download: true })}
              >
                <div className="flex items-center justify-center gap-2">
                  {downloadURL === "LOCK" ? (
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
                  {downloadURL === "LOCK"
                    ? "Download Unavailable"
                    : "Download APK"}
                </div>
              </a>
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
                className="ring-glow glint rounded-xl px-8 py-3 text-sm font-medium text-white bg-[#3e4d84] hover:bg-[#384476] transition-colors duration-300 ease-out shadow-[0_0_14px_rgba(62,77,132,0.25)] hover:shadow-[0_0_24px_rgba(62,77,132,0.4)] transition-shadow w-full md:w-auto text-center"
              >
                Source Code
              </button>
            </div>

            <Carousel />

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 opacity-90">
              <div
                className="glassish h-24 rounded-xl flex items-center justify-between gap-3 px-4 group cursor-pointer transform-gpu transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] ring-glow shadow-[0_0_10px_rgba(141,118,204,0.18)] hover:shadow-[0_0_20px_rgba(141,118,204,0.3)] transition-shadow"
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
                onClick={() => onNavigate("compatibility")}
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
                className="glassish h-24 rounded-xl flex items-center justify-between gap-3 px-4 group cursor-pointer transform-gpu transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] ring-glow shadow-[0_0_10px_rgba(141,118,204,0.18)] hover:shadow-[0_0_20px_rgba(141,118,204,0.3)] transition-shadow"
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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b" />
        <div className="relative w-full space-y-6">
          <Updates />
        </div>

        <div className="relative w-full snap-start">
          <div
            className="relative mx-auto max-w-7xl px-6 py-24 md:py-0 md:flex md:items-center min-h-screen snap-start flex flex-col justify-center"
            id="about"
          >
            <div className="w-full flex flex-col md:flex-row md:gap-8 md:max-w-6xl">
              <div className="w-full md:w-1/2 space-y-8">
                <h2 className="text-2xl font-semibold text-white">
                  About ARMSX2
                </h2>
                <div className="space-y-6 text-white/80">
                  <p>
                    ARMSX2 began after years of there being no open source PS2
                    emulator for ARM systems, and so developer MoonPower with
                    the support of jpolo1224 decided to try their hand at
                    porting a new PS2 emulator for Android, forking from the
                    repository PCSX2_ARM64 by developer Pontos.
                  </p>
                  <p>
                    Moon has and will continue doing his best to fill in the
                    gaps and make this into a complete emulator, with the goal
                    to have version parity with PCSX2. This project is not
                    officially associated with PCSX2, and we are not associated
                    with any other forks made from the original repository.{" "}
                  </p>
                  <p>
                    This is our own attempt at continuing PS2 emulation on
                    Android, iOS, and other ARM Platforms. The emulator currently operates as
                    x86 to arm64, not native arm64, so the performance will not
                    be as good as AetherSX2 currently, however things are
                    subject to change as development goes on.
                  </p>
                </div>
              </div>

              <div
                className="w-full md:w-1/2 space-y-8 mt-8 md:mt-0"
                style={{
                  marginLeft: window.innerWidth >= 768 ? "15px" : "0",
                }}
              >
                <h2 className="text-2xl font-semibold text-white">FAQ</h2>
                <div className="space-y-4">
                  {faq.map((item, index) => (
                    <details
                      key={index}
                      className="group rounded-lg bg-white/5 backdrop-blur-sm ring-1 ring-white/10 p-4 transition-all duration-300"
                    >
                      <summary className="flex cursor-pointer items-center justify-between text-white font-medium group-hover:text-[#8d76cc] transition-colors">
                        {item.question}
                        <svg
                          className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <p className="mt-4 leading-relaxed text-white/70">
                        {item.answer}
                      </p>
                    </details>
                  ))}

                  {window.innerWidth < 767 && (
                    <div className="text-center py-4 text-white/70 text-sm bg-transparent">
                      <a
                        href="https://github.com/tanosshi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white/90 transition-colors"
                      >
                        ©{new Date().getFullYear()} ARMSX2 All rights reserved, site by tanos
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {window.innerWidth >= 767 && (
        <a
          href="https://github.com/tanosshi"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 text-white/70 cursor-pointer select-none"
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
            e.target.style.textShadow = "0 0 10px rgba(255, 255, 255, 0.7)";
          }}
          onMouseLeave={(e) => {
            e.target.style.textShadow = "0 0 0px rgba(255, 255, 255, 0)";
          }}
        >
          ©{new Date().getFullYear()} ARMSX2 All rights reserved, site by tanos
        </a>
      )}
    </>
  );
};

export default Front;
