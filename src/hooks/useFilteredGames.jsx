import { useState, useMemo, useEffect } from 'react';
const GAMES_PER_PAGE = 10;

/**
 * Custom hooks to manage filter, search, and pagination logic
 * for the list of games.
 * * @param {Array} games The complete array of unfiltered games.
 * @returns {Object} Contains the status of the filters, the functions to modify them
 * and the paginated game array for rendering.
 */
export const useFilteredGames = (games) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setFilterTo] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredGames = useMemo(() => {
    const allGames = games || [];

    const statusFiltered = statusFilter === "all"
      ? allGames
      : allGames.filter(game => game.status.toLowerCase() === statusFilter);
    if (!searchTerm.trim()) {
      return statusFiltered;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    return statusFiltered.filter(game => 
      game.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      game["title-id"].toLowerCase().includes(lowerCaseSearchTerm) ||
      game.region.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [games, statusFilter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredGames]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredGames.length / GAMES_PER_PAGE);
  }, [filteredGames]);

  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    const endIndex = startIndex + GAMES_PER_PAGE;
    return filteredGames.slice(startIndex, endIndex);
  }, [filteredGames, currentPage]);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  return {
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
  };
};
