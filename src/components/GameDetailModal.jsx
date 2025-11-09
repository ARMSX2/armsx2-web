/** @file GameDetailModal.jsx
 * @description: Modal for displaying detailed game status information

 * This file contains:
 * - Everything for the expanded compatibility component */

import React, { useState, useEffect } from 'react';
import { FaTimes, FaQuestionCircle, FaInfoCircle, FaMicrochip, FaDatabase, FaClipboard } from 'react-icons/fa';

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
  }
  if (lowerRegion.includes("PAL")) {
    return "/flags/eu.svg";
  }
  return "/flags/glb.svg";
};

const GameDetailModal = ({ isOpen, game, onClose }) => {
  if (!isOpen || !game) return null;
  const { title, status, notes, tested_socs, region, name, version } = game;
  // --- LOGIC FOR FETCHING DESCRIPTION OFFICIAL ---
  const [officialDescription, setOfficialDescription] = useState("Loading official game description...");
  useEffect(() => {
    if (!name) return;
    const API_ENDPOINT = `https://armsx2.net/api/description?name=${encodeURIComponent(name || title)}`;
    setOfficialDescription("Loading official game description...");
    const fetchDescription = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const fetchedText = "Successfully integrated IGDB! This is the official game summary text returned by your custom backend server via the IGDB API.";
        setOfficialDescription(fetchedText);
      } catch (error) {
        console.error("Error fetching official description:", error);
        setOfficialDescription("Could not load official description. Please check the backend service.");
      }
    };
    fetchDescription();

  }, [name, isOpen, title]);
  // -------------------------------------------------------------------------------------------------------------

  // --- DATA MAPPING e CONSTANTS ---
  const serial = game["title-id"] || 'missing_serial';
  const gameName = game.title || 'Game Details';
  const compatibilityStatus = game.status || 'Unknown';
  const emulationNotes = game.notes || "No specific emulation notes available for this title.";
  const soCsToDisplay = (tested_socs || []).map(item => {
    const isNewFormatObject = typeof item === 'object' && item !== null && 'soc_name' in item;
    if (isNewFormatObject) {
      return {
        name: item.soc_name,
        result: item.vulkan_status || item.opengl_status || status || 'Unknown',
        vulkan: item.vulkan_status,
        opengl: item.opengl_status,
      };
    } else {
      const socName = typeof item === 'string' ? item : 'Unknown SoC';
      return {
        name: socName,
        result: status || 'Unknown',
        vulkan: status,
        opengl: status,
      };
    }
  });

  const GLASSISH_BG = 'bg-[#0d0e14]';
  const color = getcorrespondingColor(compatibilityStatus);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 transition-opacity duration-300"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-4xl h-auto max-h-[90vh] flex flex-col overflow-y-auto rounded-xl bg-gray-900/95 backdrop-blur-md shadow-2xl border border-gray-700/50 glassish transform scale-100`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8 relative space-y-6 text-white/80">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            <FaTimes className="w-6 h-6" />
          </button>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-glow text-center flex items-center justify-center space-x-4">
            {title || "Game Details"}
            <span> </span>
            <img
              src={getFlagIcon(region)}
              alt={`Region flag for ${region}`}
              className="w-8 h-8 md:w-10 md:h-10 rounded-sm shadow-md"
            />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">

            <div className="space-y-6">

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <FaDatabase className={`w-5 h-5 mr-3 text-[#8b85fc]`} /> Compatibility
                </h3>
                <p className="flex items-center">
                  <strong className="text-white/90">Current Status:</strong>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${getcorrespondingColor(status)}`}>
                    {status}
                  </span>
                </p>
              </div>
              <div className="space-y-2 pt-4">
                {/* <h3 className="text-xl font-semibold text-white flex items-center">
                                    <FaInfoCircle className={`w-5 h-5 mr-3 text-[#8b85fc]`} /> Official Description 
                                </h3>
                                <p className="text-white text-sm leading-relaxed">
                                    {officialDescription} 
                                </p> */}
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <FaInfoCircle className={`w-5 h-5 mr-3 text-[#8b85fc]`} />
                  Tested Version : <spam className="text-xl font-semibold text-white flex items-center ml-2">{version}</spam>
                </h3>
              </div>

              <div className="space-y-2 pt-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <FaClipboard className={`w-5 h-5 mr-3 text-[#8b85fc]`} /> Emulation Notes
                </h3>
                <p className="text-white text-sm leading-relaxed">
                  {notes}
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white flex items-center mb-4">
                <FaMicrochip className={`w-5 h-5 mr-3 text-[#8b85fc]`} /> Tested Hardware (SoCs)
              </h3>
              <ul className="space-y-4">
                {soCsToDisplay.map((soc, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-gray-700/50 shadow-md"
                  >
                    <div className="flex items-start sm:items-center">
                      <span className="text-white font-medium mr-4">{soc.name}</span>
                      <div className="flex flex-col space-y-1 sm:flex-row sm:space-x-4 sm:space-y-0">
                        {soc.vulkan && (
                          <div className="flex items-center space-x-1">
                            <img
                              src="/api-logos/Vulkan.svg"
                              alt={`Vulkan Status: ${soc.vulkan}`}
                              className="h-4 w-auto"
                              title={`Vulkan: ${soc.vulkan}`}
                            />
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getcorrespondingColor(soc.vulkan)}`}>
                              {soc.vulkan}
                            </span>
                          </div>
                        )}
                        {soc.opengl && (
                          <div className="flex items-center space-x-1">
                            <img
                              src="/api-logos/OpenGL.svg"
                              alt={`OpenGL Status: ${soc.opengl}`}
                              className="h-4 w-auto"
                              title={`OpenGL: ${soc.opengl}`}
                            />
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getcorrespondingColor(soc.opengl)}`}>
                              {soc.opengl}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {soCsToDisplay.length > 0 && (
                <p className="text-xs text-white/60 pt-4">
                  *Results may vary based on emulator version and settings.
                </p>
              )}
            </div>
          </div>

          <button
            className={`w-full glint flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-[#6a5acd] hover:bg-[#7a6ce5] transition-colors duration-300 mt-8`}
            onClick={onClose}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameDetailModal;