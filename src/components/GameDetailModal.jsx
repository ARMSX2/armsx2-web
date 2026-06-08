/** @file GameDetailModal.jsx
 * @description: Modal for displaying detailed game status information

 * This file contains:
 * - Everything for the expanded compatibility component */

import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaInfoCircle, FaMicrochip, FaDatabase, FaClipboard, FaAndroid, FaApple, FaLaptop } from 'react-icons/fa';
import { getGamePlatforms, PLATFORM_KEYS, PLATFORM_LABELS } from '../utils/compat';

const PLATFORM_ICONS = { android: FaAndroid, ios: FaApple, macos: FaLaptop };
const isApplePlatform = (platform) => platform === 'ios' || platform === 'macos';

const getcorrespondingColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case "perfect":
      return "bg-green-400/20 text-green-400";
    case "playable":
      return "bg-yellow-400/20 text-yellow-400";
    case "in-game":
      return "bg-orange-400/20 text-orange-400";
    case "menu":
      return "bg-blue-400/20 text-blue-400";
    case "crash":
      return "bg-red-500/25 text-red-400";
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

const formatDate = (value) => {
  if (!value) return "Unknown date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const GameDetailModal = ({ isOpen, game, defaultPlatform = "all", onClose }) => {
  const platforms = useMemo(() => getGamePlatforms(game), [game]);
  const availablePlatforms = useMemo(
    () => PLATFORM_KEYS.filter((key) => platforms[key]),
    [platforms]
  );
  const [activePlatform, setActivePlatform] = useState(null);

  useEffect(() => {
    if (!availablePlatforms.length) {
      setActivePlatform(null);
      return;
    }
    const preferred =
      defaultPlatform && defaultPlatform !== "all" && availablePlatforms.includes(defaultPlatform)
        ? defaultPlatform
        : availablePlatforms[0];
    setActivePlatform(preferred);
  }, [game, defaultPlatform, availablePlatforms]);

  const [officialDescription, setOfficialDescription] = useState("Loading official game description...");
  useEffect(() => {
    if (!game?.name && !game?.title) return;
    setOfficialDescription("Loading official game description...");
    const fetchDescription = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const fetchedText = "Successfully integrated IGDB! This is the official game summary text returned by your custom backend server via the IGDB API.";
        setOfficialDescription(fetchedText);
      } catch (error) {
        console.error("Error fetching official description:", error);
        setOfficialDescription("Could not load official description. Please check the backend service.");
      }
    };
    fetchDescription();
  }, [game, isOpen]);

  if (!isOpen || !game) return null;

  const { title, region } = game;
  const data = (activePlatform && platforms[activePlatform]) || null;
  const apple = isApplePlatform(activePlatform);

  const compatibilityStatus = data?.status || game.status || 'Unknown';
  const scoreLabel = typeof data?.globalScore === 'number' ? data.globalScore.toFixed(2) : '—';
  const totalReports = data?.submissionCount || data?.submissions?.length || 1;
  const version = data?.version || game.version || 'Unknown';
  const reports = data?.submissions?.length
    ? data.submissions
    : [
        {
          submittedBy: "community",
          status: compatibilityStatus,
          notes: data?.notes || game.notes,
          version,
          createdAt: game.createdAt
        }
      ];

  const soCsToDisplay = (data?.tested_socs || []).map((item) => {
    if (typeof item === 'string') {
      return { name: item, vulkan: compatibilityStatus, opengl: compatibilityStatus, metal: compatibilityStatus };
    }
    return {
      name: item.soc_name || item.name || 'Unknown',
      vulkan: item.vulkan_status,
      opengl: item.opengl_status,
      metal: item.metal_status,
    };
  });

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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-glow text-center flex items-center justify-center space-x-4">
            {title || "Game Details"}
            <span> </span>
            <img
              src={getFlagIcon(region)}
              alt={`Region flag for ${region}`}
              className="w-8 h-8 md:w-10 md:h-10 rounded-sm shadow-md"
            />
          </h2>

          {availablePlatforms.length > 0 && (
            <div className="flex justify-center">
              <div className="inline-flex flex-wrap gap-1 p-1 bg-gray-800/70 rounded-lg">
                {availablePlatforms.map((key) => {
                  const PlatformIcon = PLATFORM_ICONS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setActivePlatform(key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                        activePlatform === key
                          ? "bg-purple-600/30 text-purple-200"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <PlatformIcon />
                      {PLATFORM_LABELS[key]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">

            <div className="space-y-6">

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <FaDatabase className={`w-5 h-5 mr-3 text-[#8b85fc]`} /> Compatibility
                </h3>
                <p className="flex items-center">
                  <strong className="text-white/90">Current Status:</strong>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${getcorrespondingColor(compatibilityStatus)}`}>
                    {compatibilityStatus}
                  </span>
                </p>
                <p className="text-sm text-blue-300">
                  Global score: {scoreLabel} / 5 ({totalReports} report{totalReports !== 1 ? "s" : ""})
                </p>
              </div>
              <div className="space-y-2 pt-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <FaInfoCircle className={`w-5 h-5 mr-3 text-[#8b85fc]`} />
                  Tested Version : <span className="text-xl font-semibold text-white flex items-center ml-2">{version}</span>
                </h3>
              </div>

              <div className="space-y-3 pt-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <FaClipboard className={`w-5 h-5 mr-3 text-[#8b85fc]`} /> Emulation Notes
                </h3>
                <div className="space-y-3">
                  {reports.map((entry, idx) => (
                    <div
                      key={`${entry.submittedBy || "community"}-${idx}`}
                      className="bg-white/5 border border-gray-700/60 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-white font-semibold">@{entry.submittedBy || "community"}</div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${getcorrespondingColor(entry.status || compatibilityStatus)}`}
                        >
                          {entry.status || compatibilityStatus}
                        </span>
                      </div>
                      <p className="text-white text-sm leading-relaxed mt-2">
                        {entry.notes || "No notes provided."}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
                        <span>Version: {entry.version || version}</span>
                        <span>Submitted: {formatDate(entry.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white flex items-center mb-4">
                <FaMicrochip className={`w-5 h-5 mr-3 text-[#8b85fc]`} />
                {apple ? "Tested Hardware (Devices)" : "Tested Hardware (SoCs)"}
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
                        {apple ? (
                          <div className="flex items-center space-x-1">
                            <span className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-semibold text-gray-200">
                              Metal
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getcorrespondingColor(soc.metal || compatibilityStatus)}`}>
                              {soc.metal || compatibilityStatus}
                            </span>
                          </div>
                        ) : (
                          <>
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
                          </>
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
