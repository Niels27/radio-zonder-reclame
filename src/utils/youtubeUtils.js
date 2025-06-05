/**
 * YouTube Error Spam Reduction System
 * 
 * This module implements intelligent logging to prevent YouTube player errors from spamming 
 * the console and consuming RAM. Key features:
 * 
 * AUTOMATIC LOGGING REDUCTION:
 * - Uses production logging system from logger.js
 * - YouTube-specific production mode for aggressive reduction
 * - Error tracking prevents same error from logging repeatedly
 * 
 * ERROR SPAM PREVENTION:
 * - Tracks error frequency and suppresses after threshold
 * - Resets error counts after time intervals
 * - Silent handling of common embedding errors (150, 101)
 * 
 * MANUAL CONTROL:
 * - Call window.setAggressiveYouTubeLogging(true) to enable aggressive mode
 * - Call window.enableLogging() to restore all YouTube logs for debugging
 * - Settings persist in localStorage across sessions
 * 
 * PRODUCTION BEHAVIOR:
 * - Only critical fatal/network/API errors are logged
 * - State changes and retry attempts are silent
 * - Embedding restriction errors are handled without logging
 */

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

export const extractPlaylistId = (url) => {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const patterns = [
    /[?&]list=([a-zA-Z0-9_-]+)/,  // Standard format
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,  // Direct playlist URL
    /youtu\.be\/.*[?&]list=([a-zA-Z0-9_-]+)/  // Short URL format
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

export const validatePlaylistUrl = async (url) => {
  const playlistId = extractPlaylistId(url);
  if (!playlistId) {
    return {
      isValid: false,
      playlistId: null,
      error: 'Ongeldig YouTube afspeellijst URL formaat',
      thumbnail: null,
      title: null,
      name: null,
      videoCount: null
    };
  }

  // SIMPLIFIED: Just check if we can extract a playlist ID
  // Don't try to validate via CORS requests that will fail
  try {
    // Try oembed only - it's more reliable than page scraping
    const oembedResponse = await safeFetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=${playlistId}&format=json`);
    
    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json();
      return {
        isValid: true,
        playlistId,
        error: null,
        thumbnail: oembedData.thumbnail_url,
        title: oembedData.title,
        name: oembedData.title,
        videoCount: null
      };
    } else {
      // If oembed fails, still consider it potentially valid
      // The YouTube player will handle the actual validation
      logWarn('Oembed validation failed, but playlist may still work:', oembedResponse.status);
      return {
        isValid: true, // ← Still mark as valid
        playlistId,
        error: null,
        thumbnail: `https://img.youtube.com/vi/${playlistId}/mqdefault.jpg`, // Generic thumbnail
        title: `Playlist ${playlistId}`,
        name: `Playlist ${playlistId}`,
        videoCount: null
      };
    }
  } catch (error) {
    // Network error, but playlist might still work
    logWarn('Network error during validation, assuming playlist is valid:', error);
    return {
      isValid: true, // ← Don't fail validation due to network issues
      playlistId,
      error: null,
      thumbnail: `https://img.youtube.com/vi/${playlistId}/mqdefault.jpg`,
      title: `YouTube Playlist`,
      name: `YouTube Playlist`,
      videoCount: null
    };
  }
};

// Load YouTube iframe API with enhanced error handling for production
export const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    // Enhanced production error handling for YouTube API loading
    const handleYouTubeAPIError = (error) => {
      if (getIsProduction()) {
        // In production, handle YouTube API errors more gracefully
        logError('YouTube API loading failed in production', error);
        
        // Try alternative approach or provide fallback
        setTimeout(() => {
          if (!window.YT || !window.YT.Player) {
            logError('YouTube API still not available after retry attempt');
          }
        }, 5000);
      }
    };

    // Create script tag for YouTube API with enhanced error handling
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = handleYouTubeAPIError;
    script.onload = () => {
      logInfo('YouTube API script loaded successfully');
    };
    
    // Add referrer policy to prevent some blocking issues
    script.referrerPolicy = 'no-referrer-when-downgrade';
    
    document.head.appendChild(script);

    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      logInfo('YouTube iframe API fully ready');
      resolve();
    };
    
    // Fallback timeout in case API never loads
    setTimeout(() => {
      if (!window.YT || !window.YT.Player) {
        logWarn('YouTube API loading timeout - attempting to continue anyway');
        resolve(); // Don't block indefinitely
      }
    }, 15000);
  });
};

export const createYouTubePlayer = (elementId, playlistId, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!window.YT) {
      reject(new Error('YouTube API not loaded'));
      return;
    }    const playerOptions = {
      height: '1',
      width: '1',
      playerVars: {
        listType: 'playlist',
        list: playlistId,
        autoplay: 0, // Disable autoplay to reduce tracking
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
        // Enhanced parameters to bypass embedding restrictions
        host: 'https://www.youtube-nocookie.com',
        origin: window.location.origin,
        // Privacy enhanced mode
        cc_load_policy: 0,
        color: 'white',
        hl: 'en',
        // Force HTML5 player
        html5: 1,
        // Try to force audio-only by hiding video
        vq: 'tiny',
        ...options.playerVars
      },      events: {
        onReady: (event) => {
          logInfo('YouTube player ready for background playback');
          
          // Set initial shuffle state
          if (options.playerVars?.shuffle) {
            try {
              event.target.setShuffle(true);
              logInfo('Shuffle enabled on player ready');
            } catch (error) {
              logWarn('Could not set shuffle on ready:', error);
            }
          }
          
          resolve(event.target);
        },
        onStateChange: (event) => {
          // Only log important state changes to reduce spam
          if (event.data === window.YT.PlayerState.PLAYING || event.data === window.YT.PlayerState.PAUSED) {
            logInfo('YouTube player state changed:', event.data);
          }
          
          // Handle embedding errors and retry with fallback
          if (event.data === -1) { // unstarted
            logInfo('Player unstarted, attempting to start playback...');
          } else if (event.data === window.YT.PlayerState.BUFFERING) {
            logInfo('Player buffering...');
          }
          
          // Handle state changes
          if (options.onStateChange) {
            options.onStateChange(event);
          }
        },
        onError: (event) => {
          // Handle specific error codes with smart logging to prevent spam
          switch(event.data) {
            case 5:
              logError('HTML5 player error - video format not supported');
              reject(new Error('HTML5 player error - video format not supported'));
              break;
            case 100:
              logError('Video not found');
              reject(new Error('Video not found'));
              break;
            case 101:
            case 150:
              logWarn(`Embedding restricted (error ${event.data}), implementing bypass strategies...`);
              // Enhanced bypass strategies for embedding restrictions
              if (options.onEmbeddingError) {
                options.onEmbeddingError(event.data);
              }
              
              // Don't reject immediately - try multiple bypass strategies
              setTimeout(() => {
                try {
                  logInfo('Attempting bypass strategy 1: Direct playVideo call');
                  if (window.debugYTPlayer) {
                    window.debugYTPlayer.playVideo();
                  }
                } catch (bypassErr) {
                  logWarn('Bypass strategy 1 failed:', bypassErr);
                }
              }, 3000);
              
              // Additional bypass attempt with longer delay
              setTimeout(() => {
                try {
                  logInfo('Attempting bypass strategy 2: Reload and play');                  if (window.debugYTPlayer && window.debugYTPlayer.getPlayerState() !== window.YT.PlayerState.PLAYING) {
                    window.debugYTPlayer.playVideo();
                  }
                } catch (bypassErr2) {
                  logWarn('Bypass strategy 2 failed:', bypassErr2);
                }
              }, 8000);
              
              break;
            default:
              logError(`YouTube player error: ${event.data}`);
              reject(new Error(`YouTube player error: ${event.data}`));
          }
        }
      }
    };

    try {
      const player = new window.YT.Player(elementId, playerOptions);
      
      // Store reference for debugging
      window.debugYTPlayer = player;
        } catch (error) {
      reject(error);
    }
  });
};

// Enhanced hidden player creation to bypass embedding restrictions
export const createHiddenYouTubePlayer = (elementId, playlistId, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!window.YT) {
      reject(new Error('YouTube API not loaded'));
      return;
    }

    // Create a truly hidden container
    let playerDiv = document.getElementById(elementId);
    if (!playerDiv) {
      playerDiv = document.createElement('div');
      playerDiv.id = elementId;
      // Make it completely invisible and inaccessible
      playerDiv.style.cssText = `
        position: fixed !important;
        top: -10000px !important;
        left: -10000px !important;
        width: 1px !important;
        height: 1px !important;
        opacity: 0 !important;
        pointer-events: none !important;
        visibility: hidden !important;
        z-index: -9999 !important;
        overflow: hidden !important;
        transform: scale(0) !important;
      `;
      document.body.appendChild(playerDiv);
    }    const playerOptions = {
      height: '1', // Changed from '0' to '1' 
      width: '1',  // Changed from '0' to '1'
      videoId: '', // Start without specific video
      playerVars: {
        listType: 'playlist',
        list: playlistId,
        autoplay: 1, // CRITICAL: Enable autoplay
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
        // WORKING parameters from old code
        host: 'https://www.youtube-nocookie.com',
        origin: window.location.origin,
        cc_load_policy: 0,
        color: 'white',
        hl: 'en',
        html5: 1,
        vq: 'tiny',
        wmode: 'transparent',
        ...options.playerVars
      },
      events: {
        onReady: (event) => {
          console.log('[YouTube] Hidden YouTube player ready for background audio playback');
          
          // Call the provided onReady callback
          if (options.onReady) {
            options.onReady(event);
          } else {
            // Default behavior if no callback provided
            setTimeout(() => {
              try {
                event.target.loadPlaylist({
                  listType: 'playlist',
                  list: playlistId,
                  index: 0
                });
              } catch (error) {
                logWarn('Error in default onReady:', error);
              }
            }, 500);
          }
        },
        onStateChange: (event) => {
          // Call provided callback or use default
          if (options.onStateChange) {
            options.onStateChange(event);
          } else {
            // Default state handling
            if (event.data === window.YT.PlayerState.UNSTARTED) {
              setTimeout(() => {
                try {
                  event.target.playVideo();
                } catch (err) {
                  logWarn('Could not start unstarted player:', err);
                }
              }, 2000);
            }
          }
        },
        onError: (event) => {
          // Call provided callback or use default
          if (options.onError) {
            options.onError(event);
          } else {
            // Default error handling
            if (event.data === 150 || event.data === 101) {
              logWarn(`Embedding error ${event.data} - continuing anyway`);
              setTimeout(() => {
                try {
                  event.target.playVideo();
                } catch (retryErr) {
                  logWarn('Retry after embedding error failed:', retryErr);
                }
              }, 3000);
            }
          }
        }
      }
    };

    try {
      const player = new window.YT.Player(elementId, playerOptions);
      
      // Store reference for debugging
      window.debugHiddenYTPlayer = player;
        // Additional hiding after creation
      setTimeout(() => {
        if (playerDiv) {
          playerDiv.style.cssText = `
            position: fixed !important;
            top: -10000px !important;
            left: -10000px !important;
            width: 1px !important;
            height: 1px !important;
            opacity: 0 !important;
            pointer-events: none !important;
            visibility: hidden !important;
            z-index: -9999 !important;
            overflow: hidden !important;
            transform: scale(0) !important;
          `;
          
          // Also hide any iframe children
          const iframes = playerDiv.querySelectorAll('iframe');
          iframes.forEach(iframe => {
            iframe.style.cssText = `
              position: absolute !important;
              top: -10000px !important;
              left: -10000px !important;
              width: 1px !important;
              height: 1px !important;
              opacity: 0 !important;
              visibility: hidden !important;
              transform: scale(0) !important;
            `;
          });
        }
      }, 100);
      
      // Additional stealth hiding after a longer delay
      setTimeout(() => {
        if (playerDiv) {
          // Move it even further away and make it even smaller
          playerDiv.style.cssText = `
            position: fixed !important;
            top: -50000px !important;
            left: -50000px !important;
            width: 0px !important;
            height: 0px !important;
            opacity: 0 !important;
            pointer-events: none !important;
            visibility: hidden !important;
            z-index: -99999 !important;
            overflow: hidden !important;
            transform: scale(0) !important;
            clip: rect(0,0,0,0) !important;
          `;
        }
      }, 2000);
      
    } catch (error) {
      reject(error);
    }
  });
};

// Playlist control helper functions and icons
export const playlistControlIcons = {
  shuffle: {
    enabled: 'shuffle-enabled',
    disabled: 'shuffle-disabled'
  },
  repeat: {
    all: 'repeat-all',
    one: 'repeat-one', 
    off: 'repeat-off'
  }
};
