import React, { useEffect, useRef } from 'react';
import { FaTimes, FaDownload, FaTags, FaCalendar } from 'react-icons/fa';

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

const VersionSwapperModal = ({ allStableReleases, allNightlyReleases, isOpen, onClose }) => {
  const [activeView, setActiveView] = React.useState('stable');
  const modalRef = useRef(null);

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
              Select APK Version
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
              aria-label="Close Modal"
            >
              <FaTimes size={20} />
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
              <h3 className="text-xl font-bold text-green-400 mb-4 **hidden md:block**">Stable Releases</h3>
              <div className="space-y-3">
                {allStableReleases.length === 0 ? (
                  <p className="text-gray-400">No stable versions available.</p>
                ) : (
                  allStableReleases.map((release, index) => (
                    <ReleaseCard
                      key={release.id}
                      release={release}
                      onClose={onClose}
                      isLatest={index === 0}
                    />
                  ))
                )}
              </div>
            </div>
            <div className={`${activeView === 'nightly' ? 'block' : 'hidden'} md:block`}>
              <h3 className="text-xl font-bold text-blue-400 mb-4 **hidden md:block**">Nightly Builds</h3>
              <div className="space-y-3">
                {allNightlyReleases.length === 0 ? (
                  <p className="text-gray-400">No nightly builds available.</p>
                ) : (
                  allNightlyReleases.map((release, index) => (
                    <ReleaseCard
                      key={release.id}
                      release={release}
                      onClose={onClose}
                      isLatest={index === 0}
                      isNightly={true}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionSwapperModal;