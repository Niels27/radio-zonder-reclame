// hooks/useFavorites.js - Fix favorites persistence

import { useState, useEffect } from 'react';

const FAVORITES_STORAGE_KEY = 'radioFavorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        console.log('Raw stored favorites:', stored); // Debug log
        
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Parsed favorites:', parsed); // Debug log
          
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
            console.log('Loaded favorites successfully:', parsed);
          } else {
            console.warn('Stored favorites is not an array, resetting to empty array');
            setFavorites([]);
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([]));
          }
        } else {
          console.log('No stored favorites found, starting with empty array');
          setFavorites([]);
        }
      } catch (error) {
        console.error('Failed to load favorites from localStorage:', error);
        setFavorites([]);
        // Clear corrupted data
        localStorage.removeItem(FAVORITES_STORAGE_KEY);
      } finally {
        setIsInitialized(true); // Mark as initialized regardless of success/failure
      }
    };

    loadFavorites();
  }, []);

  // Save favorites to localStorage whenever favorites change (but only after initialization)
  useEffect(() => {
    if (!isInitialized) {
      console.log('Skipping save - not yet initialized');
      return;
    }

    const saveFavorites = () => {
      try {
        const favoritesJson = JSON.stringify(favorites);
        localStorage.setItem(FAVORITES_STORAGE_KEY, favoritesJson);
        console.log('Saved favorites to localStorage:', favorites); // Debug log
      } catch (error) {
        console.error('Failed to save favorites to localStorage:', error);
      }
    };

    saveFavorites();
  }, [favorites, isInitialized]);

  const isFavorite = (stationName) => {
    if (!stationName) return false;
    const result = favorites.includes(stationName);
    //console.log(`Is "${stationName}" favorite?`, result, 'Current favorites:', favorites); // Debug log
    return result;
  };

  const toggleFavorite = (stationName) => {
    if (!stationName) {
      console.warn('Cannot toggle favorite: station name is empty');
      return;
    }

    console.log('Toggling favorite for:', stationName, 'Current favorites:', favorites); // Debug log
    
    setFavorites(prev => {
      const isCurrentlyFavorite = prev.includes(stationName);
      let newFavorites;
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        newFavorites = prev.filter(name => name !== stationName);
        console.log('Removed from favorites:', stationName);
      } else {
        // Add to favorites
        newFavorites = [...prev, stationName];
        console.log('Added to favorites:', stationName);
      }
      
      console.log('New favorites array:', newFavorites);
      return newFavorites;
    });
  };

  const clearFavorites = () => {
    console.log('Clearing all favorites');
    setFavorites([]);
    // Don't remove from localStorage here, let the effect handle it
  };

  // Debug function to check localStorage directly
  const debugFavorites = () => {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    console.log('Debug - Raw localStorage:', stored);
    console.log('Debug - Current state:', favorites);
    console.log('Debug - State length:', favorites.length);
    console.log('Debug - Is initialized:', isInitialized);
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    debugFavorites, // For debugging purposes
    isInitialized // Expose for debugging
  };
};
