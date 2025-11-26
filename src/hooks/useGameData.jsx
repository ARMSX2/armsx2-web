/** @file useGameData.jsx
 * @description: Custom hook to load game data from a remote JSON file. Manages loading status and errors.

 * @returns {{games: Array, isLoading: boolean, error: string | null}}*/

import { useState, useEffect } from 'react';
export const useGameData = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    const apiBase =
      (import.meta.env && import.meta.env.DEV
        ? import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"
        : import.meta.env.VITE_API_BASE_URL || "https://api.armsx2.net");
    const url = `${apiBase}/api/compatibility`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch compatibility list: ${res.statusText}`);
      }
      const parsed = await res.json();
      if (!parsed.games || !Array.isArray(parsed.games)) {
        throw new Error("The recovered data is not in the expected array format.");
      }
      setGames(parsed.games);
      setError(null);
    } catch (err) {
      console.error("Error fetching compatibility list:", err);
      setError(`Unable to load compatibility list. Details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { games, isLoading, error, reload: fetchData };
};
