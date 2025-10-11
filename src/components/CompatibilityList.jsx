import React, { useState, useEffect } from "react";

const CompatibilityList = ({ isthetransitioninghappening, isEntering, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gamesData, setGamesData] = useState({ games: [] });

  useEffect(() => {
    const url = "https://raw.githubusercontent.com/ARMSX2/ARMSX2-compat/refs/heads/main/compatibility.json";
    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        const cleaned = text.replace(/,\s*([}\]])/g, "$1");
        const json = JSON.parse(cleaned);
        setGamesData(json);
      })
  }, []);

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

  return (
    <div
      className={`min-h-screen px-8 py-12 transition-all duration-500 relative ${
        isthetransitioninghappening
          ? "opacity-0 transform translate-x-12"
          : "opacity-100 transform translate-x-0"
      }`}
    >
      <img
        src="/icon.png"
        alt="ARMSX2 Logo"
        style={{ opacity: window.innerWidth <= 550 ? 0.64582 : 0.8,
          transform: window.innerWidth <= 550 ? "scale(0.8)" : "scale(1)",
          filter: "drop-shadow(0 4px 10px rgba(193, 176, 255, 0.4))"
         }}
        className="fixed top-8 left-8 w-12 h-12 z-50 cursor-pointer hover:opacity-80 transition-opacity duration-200"
        onClick={() => onNavigate && onNavigate("home")}
      />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl text-center font-bold text-white mt-5 mb-6">
          Compatibility List
        </h1>
        <div className="mb-10 max-w mx-auto">
          <input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 text-lg bg-[#2a2a2f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg transition-all duration-200 hover:bg-[#323237]"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {gamesData.games
            .filter((game) =>
              game.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((game, index) => (
              <div
                key={index}
                className="bg-[#1a1a1f] rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-[#1f1f24] flex flex-col h-full"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl text-white font-bold mb-3">
                      {game.title}
                    </h2>
                    <p className="text-gray-400 text-base mb-2">
                      Region: {game.region}
                    </p>
                    <p className="text-gray-400 text-base mb-2">
                      Title ID: {game["title-id"]}
                    </p>
                    <p className="text-gray-400 text-base">{game.notes}</p>
                  </div>
                  <div>
                    <span
                      className={`${getcorrespondingColor(
                        game.status
                      )} font-bold text-lg inline-block px-5 py-2 rounded-md`}
                    >
                      {game.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CompatibilityList;
