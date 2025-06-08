// Non-stop radio management with enhanced error handling

import { allRadioStations } from '../data/allRadioStations.js';

let currentNonstopIndex = 0;
let nonstopStations = [];
let failedStations = new Set(); // Track failed stations to avoid retrying them

// Initialize nonstop stations array
const initializeNonstopStations = () => {
  if (nonstopStations.length === 0) {
    nonstopStations = Object.values(allRadioStations.realnonstop || {});
    // Shuffle the array for randomness
    for (let i = nonstopStations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nonstopStations[i], nonstopStations[j]] = [nonstopStations[j], nonstopStations[i]];
    }
  }
};

export const getRandomNonstopStation = () => {
  initializeNonstopStations();
  
  if (nonstopStations.length === 0) {
    console.warn('No nonstop stations available');
    return null;
  }
  
  // Find next working station that hasn't failed
  let attempts = 0;
  let station = null;
  
  while (attempts < nonstopStations.length) {
    station = nonstopStations[currentNonstopIndex];
    currentNonstopIndex = (currentNonstopIndex + 1) % nonstopStations.length;
    
    // Skip failed stations unless we've tried all others
    if (!failedStations.has(station.name) || attempts === nonstopStations.length - 1) {
      break;
    }
    
    attempts++;
  }
  
  return {
    ...station,
    type: 'nonstop',
    isNonstop: true
  };
};

export const markStationAsFailed = (stationName) => {
  console.log(`🚫 Marking nonstop station as failed: ${stationName}`);
  failedStations.add(stationName);
  
  // If too many stations failed, reset the failed list to try again
  if (failedStations.size >= nonstopStations.length * 0.8) {
    console.log('🔄 Too many failed stations, resetting failed list');
    failedStations.clear();
  }
};

export const resetNonstopIndex = () => {
  currentNonstopIndex = 0;
  failedStations.clear(); // Clear failed stations on reset
  
  // Re-shuffle when resetting
  for (let i = nonstopStations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nonstopStations[i], nonstopStations[j]] = [nonstopStations[j], nonstopStations[i]];
  }
};

export const getNonstopStationsCount = () => {
  initializeNonstopStations();
  return nonstopStations.length;
};

export const getFailedStationsCount = () => {
  return failedStations.size;
};