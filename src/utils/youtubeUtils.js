// YouTube utility functions for playlist handling

import { getIsProduction, getIsYouTubeProductionMode } from './logger.js';

// Network request filtering for production to prevent ERR_BLOCKED_BY_CLIENT spam
const isNetworkRequestBlocked = (url) => {
  // Common blocked request patterns in production that cause ERR_BLOCKED_BY_CLIENT
  const blockedPatterns = [
    'doubleclick.net',
    'googleadservices.com',
    'googlesyndication.com',
    'google-analytics.com',
    'googletagmanager.com',
    'facebook.com/tr/',
    'connect.facebook.net',
    'ads.yahoo.com',
    'bing.com/ads/',
    'amazon-adsystem.com',
    '/pagead/',
    '/ads/',
    '/tracking/',
    '/analytics/',
    '/pixel',
    'scorecardresearch.com'
  ];

  return blockedPatterns.some(pattern => url.includes(pattern));
};

// Enhanced fetch wrapper that prevents blocked requests in production
const safeFetch = async (url, options = {}) => {
  // In production, skip requests that are likely to be blocked
  if (getIsProduction() && isNetworkRequestBlocked(url)) {
    throw new Error('Request blocked to prevent ERR_BLOCKED_BY_CLIENT');
  }

  return fetch(url, options);
};

// YouTube error tracking to prevent spam
const errorTracker = new Map();
const ERROR_SPAM_THRESHOLD = 3; // Max times to log same error
const ERROR_RESET_TIME = 30000; // Reset error count after 30 seconds

// Smart logging functions that respect production mode and prevent spam
const logInfo = (message, ...args) => {
  if (!getIsYouTubeProductionMode()) {
    console.log(`[YouTube] ${message}`, ...args);
  }
};

const logWarn = (message, ...args) => {
  const errorKey = `warn_${message}`;
  if (!shouldLogError(errorKey)) return;

  if (!getIsYouTubeProductionMode()) {
    console.warn(`[YouTube] ${message}`, ...args);
  }
};

const logError = (message, ...args) => {
  const errorKey = `error_${message}`;
  if (!shouldLogError(errorKey)) return;

  // In YouTube production mode, be even more restrictive with errors
  if (getIsYouTubeProductionMode()) {
    // Only log truly critical errors in YouTube production mode
    if (message.includes('fatal') || message.includes('network') || message.includes('API')) {
      console.error(`[YouTube] ${message}`, ...args);
    }
  } else {
    console.error(`[YouTube] ${message}`, ...args);
  }
};

const shouldLogError = (errorKey) => {
  const now = Date.now();
  const errorData = errorTracker.get(errorKey);

  if (!errorData) {
    errorTracker.set(errorKey, { count: 1, lastTime: now });
    return true;
  }

  // Reset counter if enough time has passed
  if (now - errorData.lastTime > ERROR_RESET_TIME) {
    errorTracker.set(errorKey, { count: 1, lastTime: now });
    return true;
  }

  // Check if we've exceeded the threshold
  if (errorData.count >= ERROR_SPAM_THRESHOLD) {
    return false;
  }

  // Increment count
  errorData.count++;
  errorData.lastTime = now;
  return true;
};

// CLEAN SLATE - Remove all the complex embedding workarounds
export const extractPlaylistId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /[?&]list=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/.*[?&]list=([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Simple validation - just check if we can extract ID
export const validatePlaylistUrl = async (url) => {
  const playlistId = extractPlaylistId(url);

  if (!playlistId) {
    return {
      isValid: false,
      playlistId: null,
      error: 'Invalid YouTube playlist URL format',
      thumbnail: null,
      title: null,
      videoCount: null
    };
  }

  // Try to find the playlist name from predefined playlists
  let playlistName = 'YouTube Playlist';
  try {
    const { youtubePlaylists } = await import('./predefinedPlaylists.js');
    const found = youtubePlaylists.find(p => p.url.includes(playlistId));
    if (found) {
      playlistName = found.name;
    }
  } catch (error) {
    console.log('Could not load predefined playlists:', error);
  }

  return {
    isValid: true,
    playlistId,
    error: null,
    thumbnail: null, // Can't get reliable thumbnail without YouTube Data API
    title: playlistName,
    videoCount: null
  };
};