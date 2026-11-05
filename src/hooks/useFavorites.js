// hooks/useFavorites.js - Favorite stations, persisted in localStorage as station ids.
// Older versions stored station names; those are translated to ids on first load.

import { useCallback, useEffect, useState } from 'react';
import { resolveStationRefs } from '../data/stations.js';

const STORAGE_KEY = 'radioFavorites';

function readStored() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function store(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable: favorites last for this session only.
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readStored);

  // Normalise whatever is stored (names from older versions, removed stations).
  useEffect(() => {
    const stored = readStored();
    resolveStationRefs(stored).then((ids) => {
      if (ids.length !== stored.length || ids.some((id, i) => id !== stored[i])) store(ids);
      setFavorites(ids);
    });
  }, []);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      store(next);
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
