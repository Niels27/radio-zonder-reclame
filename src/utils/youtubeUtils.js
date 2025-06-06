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
    } const playerOptions = {
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
      }, events: {
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
         onError: (errorEvent) => {
          // Handle specific error codes with smart logging to prevent spam
          switch (event.data) {
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
                  logInfo('Attempting bypass strategy 2: Reload and play'); if (window.debugYTPlayer && window.debugYTPlayer.getPlayerState() !== window.YT.PlayerState.PLAYING) {
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

// Add this helper function:
export const testPlaylistPlayability = async (playlistId) => {
  return new Promise((resolve) => {
    const testDiv = document.createElement('div');
    testDiv.id = 'test-player-' + Date.now();
    testDiv.style.cssText = 'position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px;';
    document.body.appendChild(testDiv);

    let playableFound = false;
    let testCount = 0;
    const maxTests = 5;

    const testPlayer = new window.YT.Player(testDiv.id, {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        listType: 'playlist',
        list: playlistId,
        index: 0
      },
      events: {
        onReady: (event) => {
          // Test a few videos in the playlist
          const testNext = () => {
            if (testCount >= maxTests || playableFound) {
              testPlayer.destroy();
              document.body.removeChild(testDiv);
              resolve(playableFound);
              return;
            }

            testCount++;
            setTimeout(() => {
              try {
                event.target.nextVideo();
                testNext();
              } catch (err) {
                resolve(false);
              }
            }, 2000);
          };

          testNext();
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            playableFound = true;
          }
        },
        onError: (event) => {
          if (event.data !== 150 && event.data !== 101) {
            playableFound = true; // Other errors might still allow some playback
          }
        }
      }
    });

    // Timeout after 15 seconds
    setTimeout(() => {
      if (testPlayer) {
        try {
          testPlayer.destroy();
          document.body.removeChild(testDiv);
        } catch (err) {}
        resolve(false);
      }
    }, 15000);
  });
};
// Create a new audio-only player that bypasses YouTube's embedding restrictions

// Several third-party services that can embed YouTube content
export const THIRD_PARTY_PLAYERS = {
  // Updated Invidious instances (more reliable)
  invidious: [
    'https://yewtu.be',
    'https://invidious.snopyta.org',
    'https://invidious.flokinet.to',
    'https://invidious.kavin.rocks',
    'https://inv.riverside.rocks'
  ],
  
  // Updated Piped instances
  piped: [
    'https://piped.video',
    'https://piped.kavin.rocks',
    'https://piped.tokhmi.xyz'
  ]
};
// Add this new function that tries a different approach:
export const createAlternativeYouTubePlayer = (elementId, playlistId, options = {}) => {
  return new Promise((resolve, reject) => {
    console.log('🎵 Trying ALTERNATIVE YouTube approach...');
    
    // Create iframe manually instead of using YouTube API
    const iframe = document.createElement('iframe');
    iframe.id = elementId;
    iframe.style.cssText = `
      position: fixed !important;
      bottom: -100px !important;
      right: 10px !important;
      width: 200px !important;
      height: 150px !important;
      border: none !important;
      opacity: 0.2 !important;
      z-index: 9999 !important;
    `;
    
    // Use nocookie domain and different parameters
    iframe.src = `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&autoplay=1&mute=0&controls=0&loop=1&playlist=${playlistId}&enablejsapi=0`;
    
    // Allow autoplay
    iframe.allow = 'autoplay; encrypted-media';
    
    document.body.appendChild(iframe);
    
    // Test if it loads
    iframe.onload = () => {
      console.log('🎵 Alternative iframe loaded');
      
      setTimeout(() => {
        console.log('🎵 ✅ Alternative YouTube approach SUCCESS (assuming audio works)');
        resolve({
          iframe,
          setVolume: () => {},
          pauseVideo: () => {
            iframe.src = iframe.src.replace('autoplay=1', 'autoplay=0');
          },
          playVideo: () => {
            iframe.src = iframe.src.replace('autoplay=0', 'autoplay=1');
          },
          destroy: () => {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
          }
        });
      }, 3000);
    };
    
    iframe.onerror = () => {
      console.log('🎵 Alternative iframe failed');
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      reject(new Error('Alternative YouTube approach failed'));
    };
  });
};
export const createThirdPartyPlayer = async (elementId, playlistId, options = {}) => {
  console.log('🎵 Trying third-party players...');
  
  // Try Invidious first
  for (const instance of THIRD_PARTY_PLAYERS.invidious) {
    try {
      console.log(`🎵 Trying Invidious instance: ${instance}`);
      const player = await createInvidiousPlayer(instance, elementId, playlistId, options);
      if (player) {
        console.log(`🎵 Invidious success: ${instance}`);
        return player;
      }
    } catch (error) {
      console.log(`🎵 Invidious instance ${instance} failed:`, error);
    }
  }
  
  // Try Piped as fallback
  for (const instance of THIRD_PARTY_PLAYERS.piped) {
    try {
      console.log(`🎵 Trying Piped instance: ${instance}`);
      const player = await createPipedPlayer(instance, elementId, playlistId, options);
      if (player) {
        console.log(`🎵 Piped success: ${instance}`);
        return player;
      }
    } catch (error) {
      console.log(`🎵 Piped instance ${instance} failed:`, error);
    }
  }
  
  throw new Error('All third-party players failed');
};
export const YouTubePlaylistEmbed = ({ playlistId, visible = false }) => {
  return (
    <iframe
      src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&loop=1`}
      style={{
        position: visible ? 'relative' : 'fixed',
        bottom: visible ? 'auto' : '-100px',
        right: visible ? 'auto' : '10px',
        width: visible ? '100%' : '50px',
        height: visible ? '400px' : '30px',
        border: 'none',
        opacity: visible ? 1 : 0.1
      }}
      allow="autoplay; encrypted-media"
    />
  );
};
// Replace the createInvidiousPlayer function with proper failure detection:
const createInvidiousPlayer = async (instance, elementId, playlistId, options) => {
  return new Promise((resolve, reject) => {
    try {
      // Clear any existing element
      const existingElement = document.getElementById(elementId);
      if (existingElement) {
        existingElement.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = elementId;
      iframe.style.cssText = `
        position: fixed !important;
        bottom: -100px !important;
        right: 10px !important;
        width: 50px !important;
        height: 30px !important;
        border: none !important;
        opacity: 0.1 !important;
        z-index: 9999 !important;
      `;
      
      // Invidious playlist URL with autoplay
      iframe.src = `${instance}/embed/videoseries?list=${playlistId}&autoplay=1&loop=1&controls=0`;
      
      let hasResolved = false;
      let frameBlockedDetected = false;
      
      // Add to DOM
      document.body.appendChild(iframe);
      
      // Monitor console errors for X-Frame-Options violations
      const originalConsoleError = console.error;
      const errorMonitor = (...args) => {
        const message = args.join(' ');
        if (message.includes('X-Frame-Options') || 
            message.includes('NS_ERROR_XFO_VIOLATION') ||
            message.includes('refused to display')) {
          console.log(`🎵 ❌ Invidious blocked by X-Frame-Options: ${instance}`);
          frameBlockedDetected = true;
          
          if (!hasResolved) {
            hasResolved = true;
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
            reject(new Error(`Invidious blocked by X-Frame-Options: ${instance}`));
          }
        }
        originalConsoleError.apply(console, args);
      };
      
      // Temporarily override console.error to catch frame violations
      console.error = errorMonitor;
      
      // Test if iframe loads
      iframe.onload = () => {
        console.log(`🎵 Invidious iframe loaded: ${instance}`);
        
        // Wait to see if it gets blocked or actually works
        setTimeout(() => {
          // Restore original console.error
          console.error = originalConsoleError;
          
          if (frameBlockedDetected) {
            // Already handled by error monitor
            return;
          }
          
          if (!hasResolved) {
            console.log(`🎵 ❌ Invidious probably doesn't work: ${instance}`);
            hasResolved = true;
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
            reject(new Error(`Invidious likely blocked or no audio: ${instance}`));
          }
        }, 3000);
      };
      
      iframe.onerror = () => {
        console.log(`🎵 ❌ Invidious iframe failed to load: ${instance}`);
        console.error = originalConsoleError; // Restore
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        if (!hasResolved) {
          hasResolved = true;
          reject(new Error(`Invidious instance failed: ${instance}`));
        }
      };
      
      // Timeout - assume it doesn't work if no clear success
      setTimeout(() => {
        console.error = originalConsoleError; // Restore
        if (!hasResolved) {
          console.log(`🎵 ❌ Invidious timeout (assuming failure): ${instance}`);
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
          hasResolved = true;
          reject(new Error(`Invidious timeout: ${instance}`));
        }
      }, 5000);
      
    } catch (error) {
      reject(error);
    }
  });
};

const createPipedPlayer = async (instance, elementId, playlistId, options) => {
  return new Promise((resolve, reject) => {
    try {
      // Clear any existing element
      const existingElement = document.getElementById(elementId);
      if (existingElement) {
        existingElement.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = elementId;
      iframe.style.cssText = `
        position: fixed !important;
        bottom: -100px !important;
        right: 10px !important;
        width: 50px !important;
        height: 30px !important;
        border: none !important;
        opacity: 0.1 !important;
        z-index: 9999 !important;
      `;
      
      // Piped playlist URL
      iframe.src = `${instance}/embed/playlist/${playlistId}?autoplay=true&loop=true`;
      
      // Add to DOM
      document.body.appendChild(iframe);
      
      // Test if iframe loads successfully
      iframe.onload = () => {
        console.log(`🎵 Piped iframe loaded: ${instance}`);
        setTimeout(() => {
          resolve({
            iframe,
            setVolume: () => {},
            pauseVideo: () => {
              iframe.src = iframe.src.replace('autoplay=true', 'autoplay=false');
            },
            playVideo: () => {
              iframe.src = iframe.src.replace('autoplay=false', 'autoplay=true');
            },
            destroy: () => {
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
              }
            }
          });
        }, 2000);
      };
      
      iframe.onerror = () => {
        console.log(`🎵 Piped iframe failed to load: ${instance}`);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        reject(new Error(`Piped instance failed: ${instance}`));
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        reject(new Error(`Piped timeout: ${instance}`));
      }, 5000);
      
    } catch (error) {
      reject(error);
    }
  });
};
// Enhanced hidden player creation to bypass embedding restrictions
// Update the createHiddenYouTubePlayer function:
// Replace your createHiddenYouTubePlayer function with this enhanced version:
export const createHiddenYouTubePlayer = (elementId, playlistId, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!window.YT) {
      reject(new Error('YouTube API not loaded'));
      return;
    }

    // Create a small but VISIBLE container
    let playerDiv = document.getElementById(elementId);
    if (!playerDiv) {
      playerDiv = document.createElement('div');
      playerDiv.id = elementId;
      // Make it smaller and less obtrusive
      playerDiv.style.cssText = `
        position: fixed !important;
        bottom: -50px !important;
        right: 10px !important;
        width: 50px !important;
        height: 30px !important;
        z-index: 9999 !important;
        background: black !important;
        border: 1px solid #333 !important;
        opacity: 0.3 !important;
      `;
      document.body.appendChild(playerDiv);
    }

    console.log('🎵 Creating ENHANCED YouTube player with aggressive auto-skip...');

    let skipCount = 0;
    const MAX_SKIPS = 3; // Try up to 20 videos
    let isSkipping = false;

    const player = new window.YT.Player(elementId, {
      height: '30',
      width: '50',
      playerVars: {
        autoplay: 1,
        controls: 0,
        listType: 'playlist',
        list: playlistId,
        index: Math.floor(Math.random() * 10), // Start at random position
        loop: 1,
        shuffle: options.shuffle ? 1 : 0
      },
      events: {
        onReady: (event) => {
          console.log('🎵 ✅ Enhanced YouTube player ready!');
          
          // Start playing immediately
          setTimeout(() => {
            try {
              event.target.playVideo();
              console.log('🎵 ✅ Started playback via playVideo()');
            } catch (err) {
              console.warn('Could not start playback:', err);
            }
          }, 1000);

          resolve(event.target);
        },
        onStateChange: (event) => {
          console.log('🎵 YouTube state:', event.data, `(skip count: ${skipCount})`);
          
          // If we hit PLAYING state, we found a working video!
          if (event.data === window.YT.PlayerState.PLAYING) {
            console.log('🎵 🎉 SUCCESS! Found playable video after', skipCount, 'skips');
            skipCount = 0; // Reset skip count
            isSkipping = false;
            
            if (window.addNotification) {
              window.addNotification('🎵 Afspeelbare video gevonden!', 'success', 2000);
            }
          }
          
          if (options.onStateChange) {
            options.onStateChange(event);
          }
        },
       onError: (errorEvent) => {
  console.log('🎵 YouTube error:', errorEvent.data, `(skip count: ${skipCount})`);
  
  // AUTO-SKIP for embedding errors
  if (errorEvent.data === 150 || errorEvent.data === 101) {
    console.log('🎵 🚀 AUTO-SKIPPING restricted video...', skipCount + 1, 'of', MAX_SKIPS);
    
    if (skipCount >= MAX_SKIPS) {
      console.error('🎵 ❌ Exhausted all skip attempts. Trying fallback methods...');
      if (window.addNotification) {
        window.addNotification('❌ Probeer derde partij spelers...', 'warning', 3000);
      }
      
      // CRITICAL: Trigger fallback methods immediately
      if (options.onAllSkipsFailed) {
        console.log('🎵 🚨 Triggering onAllSkipsFailed callback');
        setTimeout(() => {
          options.onAllSkipsFailed();
        }, 1000);
      } else {
        console.error('🎵 ❌ No onAllSkipsFailed callback provided!');
      }
      return;
    }

    if (!isSkipping) {
      isSkipping = true;
      skipCount++;
      
      // SIMPLER skip approach - just try nextVideo multiple times
      const attemptSkip = () => {
        try {
          console.log(`🎵 Attempting skip ${skipCount}...`);
          errorEvent.target.nextVideo();  // ← Use errorEvent consistently
          
          // Set a timeout to check if we're still not playing after 3 seconds
          setTimeout(() => {
            const currentState = errorEvent.target.getPlayerState();  // ← Use errorEvent consistently
            console.log('🎵 State after skip attempt:', currentState);
            
            if (currentState !== window.YT.PlayerState.PLAYING) {
              console.log('🎵 Skip failed, incrementing count...');
              isSkipping = false;
              
              // Trigger another error to continue the skip chain
              if (skipCount < MAX_SKIPS) {
                setTimeout(() => {
                  // Manually trigger onError again to continue skipping
                  if (errorEvent.target.getPlayerState() !== window.YT.PlayerState.PLAYING) {  // ← Use errorEvent consistently
                    console.log('🎵 Manually triggering next skip...');
                    skipCount++;
                    if (skipCount >= MAX_SKIPS) {
                      console.log('🎵 🚨 MANUAL: Reached max skips, calling fallback');
                      if (options.onAllSkipsFailed) {
                        options.onAllSkipsFailed();
                      }
                    } else {
                      attemptSkip();
                    }
                  }
                }, 1000);
              }
            } else {
              console.log('🎵 🎉 Skip successful!');
              isSkipping = false;
              skipCount = 0; // Reset on success
            }
          }, 3000);
          
        } catch (skipErr) {
          console.warn('Skip attempt failed:', skipErr);
          isSkipping = false;
          
          // Force trigger fallback after failed skip
          if (skipCount >= MAX_SKIPS) {
            if (options.onAllSkipsFailed) {
              options.onAllSkipsFailed();
            }
          }
        }
      };
      
      attemptSkip();
    }
  }
  
  if (options.onError) {
    options.onError(errorEvent);  // ← Use errorEvent consistently
  }
}
      }
    });

    // Store for debugging
    window.debugSimpleYTPlayer = player;
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
