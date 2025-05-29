import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('radioFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      }
    }
  }, []);

  const addToFavorites = (station) => {
    const newFavorites = [...favorites, station];
    setFavorites(newFavorites);
    localStorage.setItem('radioFavorites', JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (stationName) => {
    const newFavorites = favorites.filter(station => station.name !== stationName);
    setFavorites(newFavorites);
    localStorage.setItem('radioFavorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (stationName) => {
    return favorites.some(station => station.name === stationName);
  };

  const toggleFavorite = (station) => {
    if (isFavorite(station.name)) {
      removeFromFavorites(station.name);
    } else {
      addToFavorites(station);
    }
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite
  };
};
