/** @file CompatibilityList.jsx
 * @description: The entire page for the compatibility list

 * This file contains:
 * - Everything for the compatibility list page */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaPlus } from "react-icons/fa6";
import GameDetailModal from '../components/GameDetailModal';
import { useGameData } from '../hooks/useGameData'; 
import { useFilteredGames } from '../hooks/useFilteredGames'; 
import CompatibilitySubmitModal from "./CompatibilitySubmitModal";

const CompatibilityList = ({
  isthetransitioninghappening,
  isEntering,
}) => {
  const navigate = useNavigate();
  const { games, isLoading, error, reload } = useGameData();
  const mainContentRef = useRef(null);
  const { 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setFilterTo, 
    filteredGames, 
    paginatedGames,
    currentPage, 
    totalPages, 
    paginate,
    nextPage,
    prevPage,
  } = useFilteredGames(games);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSocs, setSelectedSocs] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const availableSocs = useMemo(() => {
    const socNames = new Set();
    (games || []).forEach((game) => {
      (game.tested_socs || []).forEach((soc) => {
        if (typeof soc === "string") {
          socNames.add(soc);
        } else if (soc && soc.soc_name) {
          socNames.add(soc.soc_name);
        }
      });
      (game.submissions || []).forEach((sub) => {
        (sub.tested_socs || []).forEach((soc) => {
          if (soc?.soc_name) socNames.add(soc.soc_name);
        });
      });
    });
    return Array.from(socNames).filter(Boolean).sort();
  }, [games]);
  const stats = useMemo(() => {
    const allGames = games || []; 
    const totalGames = allGames.length;
    const initialCounts = {
      perfect: 0,
      playable: 0,
      "in-game": 0,
      menu: 0,
      crash: 0,
      "not-tested": 0,
    };
    
    if (totalGames === 0) {
      return { total: 0, ...initialCounts };
    }
    
    const counts = allGames.reduce((acc, game) => {
      const status = game.status ? game.status.toLowerCase() : "not-tested";
      if (status === "perfect") acc.perfect += 1;
      else if (status === "playable") acc.playable += 1;
      else if (status === "in-game") acc["in-game"] += 1;
      else if (status === "menu") acc.menu += 1;
      else if (status === "crash") acc.crash += 1;
      else acc["not-tested"] += 1;
      return acc;
    }, initialCounts);

    const formatStat = (count) => {
      return {
        count: count,
        percent: ((count / totalGames) * 100).toFixed(1) + "%",
      };
    };
    return {
      total: totalGames,
      perfect: formatStat(counts.perfect),
      playable: formatStat(counts.playable),
      ingame: formatStat(counts["in-game"]),
      menu: formatStat(counts.menu),
      crash: formatStat(counts.crash),
      nottested: formatStat(counts["not-tested"]),
    };
  }, [games]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterOpen && !event.target.closest(".filter-dropdown")) {
        setIsFilterOpen(false);
      }
      if (selectedSocs && !event.target.closest(".soc-popup")) {
        setSelectedSocs(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen, selectedSocs]);
  
  const getFilterClasses = (status, type) => {
    const statusLower = status.toLowerCase();
    
    const colors = {
      background: {
        "all": "bg-[#2a2a2f] hover:bg-[#323237]",
        "perfect": "bg-green-400/10 hover:bg-green-400/15",
        "playable": "bg-yellow-400/10 hover:bg-yellow-400/15",
        "in-game": "bg-orange-400/10 hover:bg-orange-400/15",
        "menu": "bg-blue-400/10 hover:bg-blue-400/15",
        "crash": "bg-red-400/10 hover:bg-red-400/15",
      },

      tag: {
        "perfect": "bg-green-400/20 text-green-400",
        "playable": "bg-yellow-400/20 text-yellow-400",
        "in-game": "bg-orange-400/20 text-orange-400",
        "menu": "bg-blue-400/20 text-blue-400",
        "crash": "bg-red-500/25 text-red-400",
        "default": "bg-red-400/20 text-red-400",
      }
    };

    if (type === 'background') {
      return colors.background[statusLower] || colors.background["all"];
    }
    if (type === 'tag') {
      return colors.tag[statusLower] || colors.tag["default"];
    }
    return "";
  };

  const getFilterColors = (status, isBackground = false) => {
      return isBackground ? getFilterClasses(status, 'background') : getFilterClasses(status, 'tag');
  };

  const getcorrespondingColor = (status) => {
      return getFilterClasses(status, 'tag');
  };

  const getFlagIcon = (region) => {
    if (!region) {
      return "/flags/glb.svg";
    }
    const lowerRegion = region.toUpperCase();
    if (lowerRegion.includes("NTSC-U")) {
      return "/flags/us.svg";
    } else if (lowerRegion.includes("PAL-E")) {
      return "/flags/eu.svg";
    } else if (lowerRegion.includes("PAL-A")) {
      return "/flags/au.svg";
    } else if (lowerRegion.includes("NTSC-J")) {
      return "/flags/jp.svg";
    } else if (lowerRegion.includes("PAL")) {
      return "/flags/eu.svg";
    }
    return "/flags/glb.svg";
  };
  const handleLogoClick = () => {
    navigate('/');
  };

  const handleGameClick = (gameData) => {
    setSelectedGame(gameData);
    const scrollableElement = document.getElementById('root') || document.body;
    scrollableElement.scrollTo({
        top: 0,
        behavior: 'auto'
    });
    document.documentElement.scrollTop = 0; 
    setTimeout(() => {
        setIsModalOpen(true);
    }, 50); 
  };

  if (isLoading) {
    return (
        <div className={`min-h-screen flex items-center justify-center p-8 transition-opacity duration-300 ${isEntering ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-white text-xl">Loading compatibility list...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-8 transition-opacity duration-300 ${isEntering ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="text-red-500 text-2xl mb-4">Data Loading Error</h2>
            <p className="text-gray-300 text-center">{error}</p>
        </div>
    );
  }

  return (
    <div
      ref={mainContentRef}
      className={`min-h-screen px-8 py-12 transition-all duration-500 relative ${
        isthetransitioninghappening
          ? "opacity-0 transform translate-x-12"
          : "opacity-100 transform translate-x-0"
      }`}
    >
      <img
        src="/icon.png"
        alt="ARMSX2 Logo"
        style={{
          opacity: window.innerWidth <= 550 ? 0.64582 : 0.8,
          transform: window.innerWidth <= 550 ? "scale(0.8)" : "scale(1)",
          filter: "drop-shadow(0 4px 10px rgba(193, 176, 255, 0.4))",
        }}
        className="fixed max-[336px]:top-5 max-[336px]:left-5 top-8 left-8 w-12 h-12 z-50 cursor-pointer hover:opacity-80 transition-opacity duration-200"
        onClick={handleLogoClick}
      />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl max-[470px]:text-2xl text-center font-bold text-white mt-5 mb-6">
          Compatibility List
        </h1>
        <div className="mb-5 max-w mx-auto">
          <div className="flex flex-wrap gap-4 max-[330px]:gap-0 max-[330px]:relative items-center">
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 min-w-[200px] px-6 max-[330px]:pr-14 py-3 text-lg text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg transition-all duration-200 ${getFilterColors(
                statusFilter,
                true
              )}`}
            />
            <div className="relative filter-dropdown max-[330px]:absolute max-[330px]:right-2 max-[330px]:top-1/2 max-[330px]:-translate-y-1/2">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-4 py-4 max-[330px]:p-2 text-white rounded-lg transition-all duration-200 shadow-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-6 ${
                  window.innerWidth <= 330
                    ? "bg-transparent shadow-none hover:bg-[#2a2a2f]/50"
                    : getFilterColors(statusFilter, true)
                }`}
              >
                <FaFilter className="text-lg" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2f] rounded-lg shadow-xl border border-gray-700 z-50 max-[330px]:mt-4">
                  <div className="py-3 px-2">
                    <button
                      onClick={() => {
                        setFilterTo("all");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left rounded-lg px-4 py-2 text-white hover:bg-[#323237] transition-colors duration-200 ${
                        statusFilter === "all" ? "bg-blue-700/30" : ""
                      }`}
                    >
                      All Games
                    </button>
                    <button
                      onClick={() => {
                        setFilterTo("perfect");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full rounded-lg text-left px-4 py-2 text-green-400 hover:bg-[#323237] transition-colors duration-200 ${
                        statusFilter === "perfect" ? "bg-green-600/20" : ""
                      }`}
                    >
                      Perfect
                    </button>
                    <button
                      onClick={() => {
                        setFilterTo("playable");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left rounded-lg px-4 py-2 text-yellow-400 hover:bg-[#323237] transition-colors duration-200 ${
                        statusFilter === "playable" ? "bg-yellow-600/20" : ""
                      }`}
                    >
                      Playable
                    </button>
                    <button
                      onClick={() => {
                        setFilterTo("in-game");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left rounded-lg px-4 py-2 text-orange-400 hover:bg-[#323237] transition-colors duration-200 ${
                        statusFilter === "in-game" ? "bg-orange-600/20" : ""
                      }`}
                    >
                      In-Game
                    </button>
                    <button
                      onClick={() => {
                        setFilterTo("menu");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left rounded-lg px-4 py-2 text-blue-400 hover:bg-[#323237] transition-colors duration-200 ${
                        statusFilter === "menu" ? "bg-blue-600/20" : ""
                      }`}
                    >
                      Menu
                    </button>
                    <button
                      onClick={() => {
                        setFilterTo("crash");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left rounded-lg px-4 py-2 text-red-400 hover:bg-[#323237] transition-colors duration-200 ${
                        statusFilter === "crash" ? "bg-red-600/20" : ""
                      }`}
                    >
                      Crash
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsSubmitOpen(true)}
              className={`px-4 py-4 max-[330px]:p-2 text-white rounded-lg transition-all duration-200 shadow-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-6 ${
                window.innerWidth <= 330
                  ? "bg-transparent shadow-none hover:bg-[#2a2a2f]/50"
                  : getFilterColors(statusFilter, true)
              }`}
            >
              <FaPlus className="text-lg" />
              <span className="hidden sm:inline">Submit</span>
            </button>
          </div>
        </div>
        {stats.total > 0 && ( 
          <div className="mb-8 p-6 bg-[#1a1a1f] rounded-lg shadow-xl border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-3">
              Total Games Tested: {stats.total}
            </h3>
            <div className="flex flex-wrap gap-4 justify-between">
              {Object.entries(stats).map(([key, stat]) => {
                if (key === "total" || stat.count === 0) return null; 
                let label = "";
                let colorClass = "";
                switch (key) {
                  case "perfect":
                    label = "Perfect";
                    colorClass = "text-green-400 bg-green-400";
                    break;
                  case "playable":
                    label = "Playable";
                    colorClass = "text-yellow-400 bg-yellow-400";
                    break;
                  case "ingame":
                    label = "In-Game";
                    colorClass = "text-orange-400 bg-orange-400";
                    break;
                  case "menu":
                    label = "Menu";
                    colorClass = "text-blue-400 bg-blue-400";
                    break;
                  case "crash":
                    label = "Crash";
                    colorClass = "text-red-400 bg-red-400";
                    break;
                  case "nottested":
                    label = "Not Tested";
                    colorClass = "text-gray-400 bg-gray-400";
                    break;
                  default:
                    return null;
                }
                return (
                  <div
                    key={key}
                    className={`text-center flex-1 min-w-[120px] p-2 rounded-md relative`}
                  >
                    <div className="text-3xl font-extrabold">
                      {stat.percent}
                    </div>
                    <div className="text-sm text-gray-400">
                      {label} ({stat.count})
                    </div>
                    <div
                      className={`absolute -bottom-1 opacity-60 left-1/2 transform -translate-x-1/2 w-16 h-1 rounded-full ${
                        colorClass.split(" ")[1]
                      }`}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div>
          {games.length === 0 && !isLoading && !error ? (
            <div className="col-span-2 text-center py-12">
              <div className="text-xl text-gray-400">
                No games found in the compatibility list
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paginatedGames.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <div className="text-xl text-gray-400">
                      No games found matching the current filters.
                    </div>
                  </div>
                ) : (
                  paginatedGames.map((game, index) => {
                    const submissions = game.submissions || [];
                    const latestSubmission = submissions[submissions.length - 1];
                    const reporter = latestSubmission?.submittedBy || "community";
                    const submissionCount = game.submissionCount || submissions.length || 1;
                    const globalScore =
                      typeof game.globalScore === "number" ? game.globalScore.toFixed(2) : "—";

                    return (
                      <div
                        key={index}
                        onClick={() => handleGameClick(game)}
                        className="bg-[#1a1a1f] rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-[#1f1f24] flex flex-col h-full"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h2 className="text-2xl text-white font-bold mb-3">
                              {game.title}
                            </h2>
                            <p className="text-gray-400 text-base mb-2 flex items-center gap-2">
                              <span>Region: {game.region}</span>
                              <img
                                src={getFlagIcon(game.region)}
                                alt={`${game.region} flag`}
                                className="w-5 h-5 shadow-md forceSlightRound -mt-0.5"
                              />
                            </p>
                            <p className="text-gray-400 text-base mb-2">
                              Title ID: {game["title-id"]}
                            </p>
                            <p className="text-gray-400 text-base">
                              Latest note by @{reporter}: {game.notes || "No notes yet."}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`${getcorrespondingColor(
                                game.status
                              )} font-bold text-lg inline-block px-5 py-2 rounded-md`}
                            >
                              {game.status.replace(
                                /(^|-)(\w)/g,
                                (_, sep, char) => sep + char.toUpperCase()
                              )}
                            </span>
                            <div className="text-sm text-blue-300 mt-2">
                              Global score: {globalScore} / 5
                            </div>
                            <div className="text-xs text-gray-500">
                              {submissionCount} report{submissionCount !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center mt-10 col-span-full">
                  <button
                    onClick={prevPage} 
                    disabled={currentPage === 1}
                    className="px-4 py-2 mx-1 rounded-lg bg-[#2a2a2f] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#323237] transition-colors"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)} 
                      className={`px-4 py-2 mx-1 rounded-lg transition-colors ${
                        currentPage === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-[#2a2a2f] text-gray-300 hover:bg-[#323237]"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={nextPage} 
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 mx-1 rounded-lg bg-[#2a2a2f] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#323237] transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <GameDetailModal
        isOpen={isModalOpen}
        game={selectedGame}
        onClose={() => setIsModalOpen(false)}
      />
      <CompatibilitySubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmitted={reload}
        socOptions={availableSocs}
      />
    </div>
  );
};

export default CompatibilityList;
