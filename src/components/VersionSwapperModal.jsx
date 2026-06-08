/** @file VersionSwapperModal.jsx
 * @description: Card for the version swapper */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { FaTimes, FaDownload, FaTags, FaCalendar, FaAndroid, FaApple, FaLaptop, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ITEMS_PER_PAGE = 4;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const [maxButtons, setMaxButtons] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      setMaxButtons(window.innerWidth >= 768 ? 3 : 4);
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

  const arrowClass =
    "flex items-center justify-center w-9 h-9 rounded-lg bg-[#2a2a2f] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#323237] transition-colors";

  return (
    <div className="flex flex-wrap justify-center items-center gap-1.5 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={arrowClass}
      >
        <FaChevronLeft size={12} />
      </button>
      {startPage > 1 && <span className="w-4 text-center text-gray-500">…</span>}
      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
            currentPage === pageNumber
              ? "bg-purple-600 text-white"
              : "bg-[#2a2a2f] text-gray-300 hover:bg-[#323237]"
          }`}
        >
          {pageNumber}
        </button>
      ))}
      {endPage < totalPages && <span className="w-4 text-center text-gray-500">…</span>}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={arrowClass}
      >
        <FaChevronRight size={12} />
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

const ReleaseCard = ({ release, onClose, isLatest, isNightly, isRefresh }) => {
  if (!release || !release.url) return null;

  let label = null;
  let labelClass = "";

  if (isLatest && isRefresh) {
    label = "Latest-Refresh";
    labelClass = "bg-purple-600/20 text-purple-300";
  } else if (isLatest && isNightly) {
    label = "Latest-Nightly";
    labelClass = "bg-blue-600/20 text-blue-400";
  } else if (isLatest) {
    label = "Latest";
    labelClass = "bg-green-600/20 text-green-400";
  } else if (isRefresh) {
    label = "Refresh";
    labelClass = "bg-purple-600/20 text-purple-300";
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

const ReleaseColumn = ({ channel, isMobileActive, onClose }) => {
  const [page, setPage] = useState(1);
  const releases = channel.releases;
  const totalPages = Math.ceil(releases.length / ITEMS_PER_PAGE);

  const visibleReleases = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return releases.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [releases, page]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    } else if (page === 0 && totalPages > 0) {
      setPage(1);
    }
  }, [page, totalPages]);

  return (
    <div className={`${isMobileActive ? 'block' : 'hidden'} md:block`}>
      <h3 className={`text-xl font-bold ${channel.color} mb-4`}>{channel.label}</h3>
      <div className="space-y-3">
        {releases.length === 0 ? (
          <p className="text-gray-400">{channel.empty}</p>
        ) : (
          visibleReleases.map((release) => (
            <ReleaseCard
              key={release.id}
              release={release}
              onClose={onClose}
              isLatest={page === 1 && releases.indexOf(release) === 0}
              isNightly={channel.isNightly}
              isRefresh={channel.isRefresh}
            />
          ))
        )}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

const VersionSwapperModal = ({
  allStableReleases = [],
  allNightlyReleases = [],
  allRefreshReleases = [],
  allIosStableReleases = [],
  allIosNightlyReleases = [],
  allIosRefreshReleases = [],
  allMacReleases = [],
  isOpen,
  onClose,
}) => {
  const [activePlatform, setActivePlatform] = useState('android');
  const [activeChannel, setActiveChannel] = useState('stable');
  const modalRef = useRef(null);

  const platforms = useMemo(() => ({
    android: {
      label: 'Android',
      icon: <FaAndroid />,
      title: 'Select APK Version',
      channels: [
        { key: 'stable', label: 'Stable Releases', mobileLabel: 'Stable', color: 'text-green-400', toggleActive: 'bg-green-600/20 text-green-400', empty: 'No stable versions available.', releases: allStableReleases },
        { key: 'nightly', label: 'Nightly Builds', mobileLabel: 'Nightly', color: 'text-blue-400', toggleActive: 'bg-blue-600/20 text-blue-400', empty: 'No nightly builds available.', releases: allNightlyReleases, isNightly: true },
        { key: 'refresh', label: 'Refresh', mobileLabel: 'Refresh', color: 'text-purple-400', toggleActive: 'bg-purple-600/20 text-purple-300', empty: 'No public release yet.', releases: allRefreshReleases, isRefresh: true },
      ],
    },
    ios: {
      label: 'iOS',
      icon: <FaApple />,
      title: 'Select IPA Version',
      channels: [
        { key: 'stable', label: 'Stable Releases', mobileLabel: 'Stable', color: 'text-green-400', toggleActive: 'bg-green-600/20 text-green-400', empty: 'No iOS versions available.', releases: allIosStableReleases },
        { key: 'nightly', label: 'Nightly Builds', mobileLabel: 'Nightly', color: 'text-blue-400', toggleActive: 'bg-blue-600/20 text-blue-400', empty: 'No iOS nightlies available.', releases: allIosNightlyReleases, isNightly: true },
        { key: 'refresh', label: 'Refresh', mobileLabel: 'Refresh', color: 'text-purple-400', toggleActive: 'bg-purple-600/20 text-purple-300', empty: 'No public release yet.', releases: allIosRefreshReleases, isRefresh: true },
      ],
    },
    macos: {
      label: 'Mac OS',
      icon: <FaLaptop />,
      title: 'Select macOS Version',
      channels: [
        { key: 'releases', label: 'Releases', mobileLabel: 'Releases', color: 'text-green-400', toggleActive: 'bg-green-600/20 text-green-400', empty: 'No macOS versions available.', releases: allMacReleases },
      ],
    },
  }), [allStableReleases, allNightlyReleases, allRefreshReleases, allIosStableReleases, allIosNightlyReleases, allIosRefreshReleases, allMacReleases]);

  const platform = platforms[activePlatform];
  const channels = platform.channels;

  useEffect(() => {
    setActiveChannel(channels[0].key);
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
              {platform.title}
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
            {Object.entries(platforms).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setActivePlatform(key)}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${activePlatform === key ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400 hover:text-white'
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
          {channels.length > 1 && (
            <div className="md:hidden flex mb-6 p-1 bg-gray-800 rounded-lg">
              {channels.map((channel) => (
                <button
                  key={channel.key}
                  onClick={() => setActiveChannel(channel.key)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeChannel === channel.key ? channel.toggleActive : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {channel.mobileLabel}
                </button>
              ))}
            </div>
          )}
          <div className={`grid grid-cols-1 gap-6 ${activePlatform === 'macos' ? 'md:grid-cols-1' : 'md:grid-cols-3'}`}>
            {channels.map((channel) => (
              <ReleaseColumn
                key={`${activePlatform}:${channel.key}`}
                channel={channel}
                isMobileActive={activeChannel === channel.key}
                onClose={onClose}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionSwapperModal;
