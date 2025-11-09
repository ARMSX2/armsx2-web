/** @file useGameData.jsx
 * @description: Custom hook to load game data from a remote JSON file. Manages loading status and errors.

 * @returns {{games: Array, isLoading: boolean, error: string | null}}*/

import { useState, useEffect } from 'react';
export const useGameData = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = "https://raw.githubusercontent.com/ARMSX2/ARMSX2-compat/refs/heads/main/compatibility.json";
    const fetchData = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch compatibility list: ${res.statusText}`);
        }
        const text = await res.text();
        const cleaned = text.replace(/,\s*([}\]])/g, "$1");
        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch (e) {
            throw new Error("Invalid compatibility data format: JSON parsing failed.");
        }
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
    fetchData();
  }, []);
  return { games, isLoading, error };
};