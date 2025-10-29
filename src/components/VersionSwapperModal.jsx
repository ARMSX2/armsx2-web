import React, { useEffect, useRef } from 'react';
import { FaTimes, FaDownload, FaTags, FaCalendar } from 'react-icons/fa';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const VersionSwapperModal = ({ releases, isOpen, onClose }) => {
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
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300 w-full h-full"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="relative z-[1000] bg-[#1a1a1f] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700 transform transition-transform duration-300 scale-100 animate-fadeInUp glassish-modal"
      >
        <div className="p-6 glassish-modal">
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
          <div className="space-y-3">
            {releases.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No APK version found.</p>
            ) : (
              releases.map((release, index) => (
                <a
                  key={release.id}
                  href={release.url}
                  download
                  onClick={onClose}
                  className="p-4 bg-[#2a2a2f] rounded-lg hover:bg-[#323237] transition-all duration-200 group flex justify-between items-center glassish-modal"
                >
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {release.version}
                      {index === 0 && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-600/20 text-green-400 font-bold">Latest</span>}
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionSwapperModal;