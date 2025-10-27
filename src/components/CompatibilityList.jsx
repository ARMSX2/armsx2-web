import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { FaFilter } from "react-icons/fa6";
import GameDetailModal from '../components/GameDetailModal';

const CompatibilityList = ({
  isthetransitioninghappening,
  isEntering,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [gamesData, setGamesData] = useState({ games: [] });
  const [error, setError] = useState(null);
  const [statusFilter, setFilterTo] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSocs, setSelectedSocs] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const mainContentRef = useRef(null);
  const gamesPerPage = 10;
  const calculateStats = () => {
    const allGames = gamesData.games;
    const totalGames = allGames.length;
    const initialCounts = {
      perfect: 0,
      playable: 0,
      "in-game": 0,
      menu: 0,
      "not-tested": 0,
    };
    if (totalGames === 0) {
      return initialCounts;
    }
    const counts = allGames.reduce((acc, game) => {
      const status = game.status.toLowerCase();
      if (status === "perfect") acc.perfect += 1;
      else if (status === "playable") acc.playable += 1;
      else if (status === "in-game") acc["in-game"] += 1;
      else if (status === "menu") acc.menu += 1;
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
      nottested: formatStat(counts["not-tested"]),
    };
  };
  useEffect(() => {
    const url =
      "https://raw.githubusercontent.com/ARMSX2/ARMSX2-compat/refs/heads/main/compatibility.json";
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch compatibility list");
        }
        return res.text();
      })
      .then((text) => {
        const cleaned = text.replace(/,\s*([}\]])/g, "$1");
        const parsed = JSON.parse(cleaned);
        if (!parsed.games || !Array.isArray(parsed.games)) {
          throw new Error("Invalid compatibility data format");
        }
        setGamesData(parsed);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching compatibility list:", err);
        setError(err.message);
      });
  }, []);
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
  const getFilterColors = (status, isBackground = false) => {
    const colors = {
      /*  perfect: "green",
      playable: "yellow",
      "in-game": "orange",
      menu: "blue",
      "not-tested": "red",*/
      all: null,
    };
    const color = colors[status.toLowerCase()];
    if (!color) return isBackground ? "bg-[#2a2a2f] hover:bg-[#323237]" : "";
    return isBackground
      ? `bg-${color}-400/10 hover:bg-${color}-400/15`
      : `bg-${color}-400/20 text-${color}-400`;
  };

  const getcorrespondingColor = (status) => {
    switch (status.toLowerCase()) {
      case "perfect":
        return "bg-green-400/20 text-green-400";
      case "playable":
        return "bg-yellow-400/20 text-yellow-400";
      case "in-game":
        return "bg-orange-400/20 text-orange-400";
      case "menu":
        return "bg-blue-400/20 text-blue-400";
      default:
        return "bg-red-400/20 text-red-400";
    }
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
          <div className="flex flex-wrap gap-4 max-[330px]:gap-0 max-[330px]:relative">
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {gamesData.games.length > 0 && (
          <div className="mb-8 p-6 bg-[#1a1a1f] rounded-lg shadow-xl border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-3">
              Total Games Tested: {calculateStats().total}
            </h3>
            <div className="flex flex-wrap gap-4 justify-between">
              {Object.entries(calculateStats()).map(([key, stat]) => {
                if (key === "total" || stat.count === 0) return null;
                if (stat.count === 0) return null;
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
                  case "nottested":
                    label = "Not Tested";
                    colorClass = "text-red-400 bg-red-400";
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
          {error ? (
            <div className="col-span-2 text-center py-12">
              <div className="text-xl text-red-400 mb-4">
                Failed to load compatibility list
              </div>
              <div className="text-gray-400">{error}</div>
            </div>
          ) : gamesData.games.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <div className="text-xl text-gray-400">
                No games found in the compatibility list
              </div>
            </div>
          ) : (
            <div>
              {(() => {
                const filteredGames = gamesData.games
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .filter((game) => {
                    const lowerCaseSearchTerm = searchTerm.toLowerCase();
                    const gameTitle = game.title
                      ? game.title.toLowerCase()
                      : "";
                    const gameRegion = game.region
                      ? game.region.toLowerCase()
                      : "";
                    const gameTitleId = game["title-id"]
                      ? game["title-id"].toLowerCase()
                      : "";
                    const matchesSearch =
                      gameTitle.includes(lowerCaseSearchTerm) ||
                      gameRegion.includes(lowerCaseSearchTerm) ||
                      gameTitleId.includes(lowerCaseSearchTerm);
                    const matchesStatus =
                      statusFilter === "all" ||
                      game.status.toLowerCase() === statusFilter.toLowerCase();
                    return matchesSearch && matchesStatus;
                  });
                const totalPages = Math.ceil(
                  filteredGames.length / gamesPerPage
                );
                const indexOfLastGame = currentPage * gamesPerPage;
                const indexOfFirstGame = indexOfLastGame - gamesPerPage;
                const currentGames = filteredGames.slice(
                  indexOfFirstGame,
                  indexOfLastGame
                );
                if (currentPage > totalPages && totalPages > 0) {
                  setCurrentPage(1);
                }
                return (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {currentGames.length === 0 ? (
                        <div className="col-span-2 text-center py-12">
                          <div className="text-xl text-gray-400">
                            No games found on this page
                          </div>
                        </div>
                      ) : (
                        currentGames.map((game, index) => (
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
                                  {/* {game.tested_socs &&
                                    game.tested_socs.length > 0 && (
                                      <>
                                        {" · "}
                                        <span
                                          onClick={() => {
                                            e.stopPropagation();
                                            if (game.tested_socs.length > 1) {
                                              setSelectedSocs(
                                                selectedSocs ===
                                                  game.tested_socs
                                                  ? null
                                                  : game.tested_socs
                                              );
                                            }
                                          }}
                                          className={`${
                                            game.tested_socs.length > 1
                                              ? "cursor-pointer underline decoration-dotted relative"
                                              : ""
                                          }`}
                                        >
                                          {game.tested_socs[0]
                                            ?.charAt(0)
                                            .toUpperCase() +
                                            game.tested_socs[0]?.slice(1)}
                                          {selectedSocs === game.tested_socs &&
                                            game.tested_socs.length > 1 && (
                                              <div className="absolute z-50 left-0 top-full mt-2 p-3 bg-[#2a2a2f] rounded-lg shadow-xl border border-gray-700">
                                                <div className="text-sm whitespace-nowrap">
                                                  <strong className="text-gray-300">
                                                    Tested on:
                                                  </strong>
                                                  <br />
                                                  {game.tested_socs.map(
                                                    (soc, index) => (
                                                      <span key={soc}>
                                                        {soc}
                                                        {index <
                                                          game.tested_socs
                                                            .length -
                                                            1 && <br />}
                                                      </span>
                                                    )
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                        </span>
                                      </>
                                    )} */}
                                </p>
                                <p className="text-gray-400 text-base">
                                  {game.notes}
                                </p>
                              </div>
                              <div>
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
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-10 col-span-full">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 mx-1 rounded-lg bg-[#2a2a2f] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#323237] transition-colors"
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
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
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 mx-1 rounded-lg bg-[#2a2a2f] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#323237] transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
      <GameDetailModal
        isOpen={isModalOpen}
        game={selectedGame}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default CompatibilityList;
