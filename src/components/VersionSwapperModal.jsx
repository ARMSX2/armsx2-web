/** @file VersionSwapperModal.jsx
 * @description: Card for the version swapper
 *
 * This file contains:
 * - Everything for the version swapper modal */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { FaTimes, FaDownload, FaTags, FaCalendar, FaAndroid, FaApple } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const [maxButtons, setMaxButtons] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { 
        setMaxButtons(3);
      } else {
        setMaxButtons(2);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center mt-6 col-span-full"> 
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 mx-1 rounded-lg bg-[#2a2a2f] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#323237] transition-colors"
      >
        Previous
      </button>
      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)} 
          className={`px-4 py-2 mx-1 rounded-lg transition-colors ${
            currentPage === pageNumber
              ? "bg-blue-600 text-white"
              : "bg-[#2a2a2f] text-gray-300 hover:bg-[#323237]"
          }`}
        >
          {pageNumber}
        </button>
      ))}
      {endPage < totalPages && (
        <span className="px-4 py-2 mx-1 text-gray-400">...</span>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        className="px-4 py-2 mx-1 rounded-lg bg-[#2a2a2f] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#323237] transition-colors"
      >
        Next
      </button>
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ReleaseCard = ({ release, onClose, isLatest, isNightly }) => {
  if (!release || !release.url) return null;


  let label = null;
  let labelClass = "";

  if (isLatest && isNightly) {
    label = "Latest-Nightly";
    labelClass = "bg-blue-600/20 text-blue-400";
  } else if (isLatest) {
    label = "Latest";
    labelClass = "bg-green-600/20 text-green-400";
  } else if (isNightly) {
    label = "Nightly";
    labelClass = "bg-blue-600/20 text-blue-400";
  }

  return (
    <a
      href={release.url}
      download
      onClick={onClose}
      className="p-4 bg-[#2a2a2f] rounded-lg hover:bg-[#323237] transition-all duration-200 group flex justify-between items-center"
    >
      <div>
        <div className="text-lg font-semibold text-white">
          {release.version}
          {label && (
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-bold ${labelClass}`}>
              {label}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
          <FaCalendar size={12} className="text-purple-400/80" />
          Released on {formatDate(release.date)}
        </div>
      </div>
      <FaDownload
        className="text-xl text-purple-400 group-hover:text-white transition-colors"
      />
    </a>
  );
};

const VersionSwapperModal = ({
  allStableReleases,
  allNightlyReleases,
  allIosStableReleases = [],
  allIosNightlyReleases = [],
  isOpen,
  onClose,
}) => {
  const ITEMS_PER_PAGE = 4;
  const [activePlatform, setActivePlatform] = useState('android');
  const [activeView, setActiveView] = useState('stable');
  const [stablePage, setStablePage] = useState(1);
  const [nightlyPage, setNightlyPage] = useState(1);
  const modalRef = useRef(null);

  const activeStableSource = activePlatform === 'ios' ? allIosStableReleases : allStableReleases;
  const activeNightlySource = activePlatform === 'ios' ? allIosNightlyReleases : allNightlyReleases;

  const totalStablePages = Math.ceil(activeStableSource.length / ITEMS_PER_PAGE);
  const stableReleases = useMemo(() => {
    const startIndex = (stablePage - 1) * ITEMS_PER_PAGE;
    return activeStableSource.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activeStableSource, stablePage, ITEMS_PER_PAGE]);

  const totalNightlyPages = Math.ceil(activeNightlySource.length / ITEMS_PER_PAGE);
  const nightlyReleases = useMemo(() => {
    const startIndex = (nightlyPage - 1) * ITEMS_PER_PAGE;
    return activeNightlySource.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activeNightlySource, nightlyPage, ITEMS_PER_PAGE]);

  useEffect(() => {
    setStablePage(1);
    setNightlyPage(1);
  }, [activePlatform]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (stablePage > totalStablePages && totalStablePages > 0) {
      setStablePage(totalStablePages);
    } else if (stablePage === 0 && totalStablePages > 0) {
      setStablePage(1);
    }
  }, [stablePage, totalStablePages]);

  useEffect(() => {
    if (nightlyPage > totalNightlyPages && totalNightlyPages > 0) {
      setNightlyPage(totalNightlyPages);
    } else if (nightlyPage === 0 && totalNightlyPages > 0) {
      setNightlyPage(1);
    }
  }, [nightlyPage, totalNightlyPages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md transition-opacity duration-300 w-full h-full"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="relative z-[1000] absbg rounded-xl md:rounded-xl w-full md:max-w-4xl max-h-[100vh] md:max-h-[90vh] overflow-y-auto border border-purple-500/30 transform transition-transform duration-300 scale-100 animate-fadeInUp shadow-lg shadow-purple-500/10 mx-4 md:mx-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-700/50 pb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaTags className="text-purple-400" />
              {activePlatform === 'ios' ? 'Select IPA Version' : 'Select APK Version'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
              aria-label="Close Modal"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <div className="flex mb-6 p-1 bg-gray-800 rounded-lg">
            <button
              onClick={() => setActivePlatform('android')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${activePlatform === 'android' ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400 hover:text-white'
                }`}
            >
              <FaAndroid />
              Android
            </button>
            <button
              onClick={() => setActivePlatform('ios')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${activePlatform === 'ios' ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400 hover:text-white'
                }`}
            >
              <FaApple />
              iOS
            </button>
          </div>
          <div className="md:hidden flex mb-6 p-1 bg-gray-800 rounded-lg">
            <button
              onClick={() => setActiveView('stable')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeView === 'stable' ? 'bg-green-600/20 text-green-400' : 'text-gray-400 hover:text-white'
                }`}
            >
              Stable Releases
            </button>
            <button
              onClick={() => setActiveView('nightly')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeView === 'nightly' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
            >
              Nightly Builds
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${activeView === 'stable' ? 'block' : 'hidden'} md:block`}>
              <h3 className="text-xl font-bold text-green-400 mb-4">Stable Releases</h3>
              <div className="space-y-3">
                {stableReleases.length === 0 ? (
                  <p className="text-gray-400">
                    {activePlatform === 'ios'
                      ? 'No iOS versions available.'
                      : 'No stable versions available.'}
                  </p>
                ) : (
                  stableReleases.map((release) => (
                    <ReleaseCard
                      key={release.id}
                      release={release}
                      onClose={onClose}
                      isLatest={activeStableSource.indexOf(release) === 0 && stablePage === 1}
                    />
                  ))
                )}
              </div>
              <Pagination
                currentPage={stablePage}
                totalPages={totalStablePages}
                onPageChange={setStablePage}
              />
            </div>
            <div className={`${activeView === 'nightly' ? 'block' : 'hidden'} md:block`}>
              <h3 className="text-xl font-bold text-blue-400 mb-4">Nightly Builds</h3>
              <div className="space-y-3">
                {nightlyReleases.length === 0 ? (
                  <p className="text-gray-400">
                    {activePlatform === 'ios'
                      ? 'No iOS nightlies available.'
                      : 'No nightly builds available.'}
                  </p>
                ) : (
                  nightlyReleases.map((release) => (
                    <ReleaseCard
                      key={release.id}
                      release={release}
                      onClose={onClose}
                      isLatest={activeNightlySource.indexOf(release) === 0 && nightlyPage === 1}
                      isNightly={true}
                    />
                  ))
                )}
              </div>
              <Pagination
                currentPage={nightlyPage}
                totalPages={totalNightlyPages}
                onPageChange={setNightlyPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionSwapperModal;