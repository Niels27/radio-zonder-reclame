import React, { useState, useEffect, useRef, useCallback } from 'react';
import { popupYouTubePlayer } from '../utils/popupYouTubePlayer';

const FloatingYouTubePlayer = ({ 
  isVisible, 
  playlistId, 
  onClose, 
  volume = 50, 
  onVolumeChange,
  isShuffled = false,
  onShuffleChange 
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMethod, setCurrentMethod] = useState('full_player');
  const [currentMethodIndex, setCurrentMethodIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState(false);  const [errorMessage, setErrorMessage] = useState('');
  const [showFallbackOptions, setShowFallbackOptions] = useState(false);
  const [localVolume, setLocalVolume] = useState(volume);  const [retryCount, setRetryCount] = useState(0);  const [maxRetries] = useState(5); // Increased for more persistence
  const [videoCheckAttempts, setVideoCheckAttempts] = useState(0);
  const [maxVideoChecks] = useState(8); // Increased for more thorough checking
  const iframeRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const playerRef = useRef(null);
  const skipToNextVideoRef = useRef(null);

  // YouTube fallback methods (same as popup player)
  const fallbackMethods = [
    'full_player',      // Full YouTube player
    'nocookie_embed',   // YouTube no-cookie embed
    'regular_embed',    // Regular YouTube embed
    'direct_playlist',  // Direct playlist link
    'mobile_embed',     // Mobile YouTube
    'youtube_music'     // YouTube Music
  ];

  // Method display names
  const getMethodDisplayName = (method) => {
    switch (method) {
      case 'full_player': return 'Volledige YouTube Player';
      case 'youtube_music': return 'YouTube Music';
      case 'nocookie_embed': return 'YouTube Embed (No Cookie)';
      case 'regular_embed': return 'YouTube Embed';
      case 'direct_playlist': return 'Directe Playlist';
      case 'mobile_embed': return 'Mobiele YouTube';
      default: return method;
    }
  };

  // Get YouTube URL for different methods (same logic as popup)
  const getYouTubeUrl = (playlistId, method = 'full_player') => {
    const shuffleParam = isShuffled ? '&shuffle=1' : '';
    const origin = encodeURIComponent(window.location.origin);
    const referrer = encodeURIComponent(window.location.href);
    
    switch (method) {
      case 'full_player':
        return `https://www.youtube.com/playlist?list=${playlistId}&autoplay=1${shuffleParam}`;
        
      case 'youtube_music':
        return `https://music.youtube.com/playlist?list=${playlistId}&autoplay=1${shuffleParam}`;
        
      case 'nocookie_embed':
        return `https://www.youtube-nocookie.com/embed/videoseries?` +
          `list=${playlistId}` +
          `&autoplay=1` +
          `&loop=1` +
          `&controls=1` +
          `&rel=0` +
          `&modestbranding=1` +
          `&iv_load_policy=3` +
          `&fs=1` +
          `&disablekb=0` +
          `&origin=${origin}` +
          `&enablejsapi=1` +
          `&widget_referrer=${referrer}` +
          shuffleParam;
          
      case 'regular_embed':
        return `https://www.youtube.com/embed/videoseries?` +
          `list=${playlistId}` +
          `&autoplay=1` +
          `&loop=1` +
          `&controls=1` +
          `&rel=0` +
          `&modestbranding=1` +
          shuffleParam;
          
      case 'direct_playlist':
        return `https://www.youtube.com/playlist?list=${playlistId}&autoplay=1${shuffleParam}`;
        
      case 'mobile_embed':
        return `https://m.youtube.com/playlist?list=${playlistId}&autoplay=1${shuffleParam}`;
        
      default:
        return this.getYouTubeUrl(playlistId, 'full_player');
    }  };

  // Try next fallback method (defined first to avoid circular dependency)
  const tryNextMethod = useCallback(() => {
    const nextIndex = (currentMethodIndex + 1) % fallbackMethods.length;
    setCurrentMethodIndex(nextIndex);
    setCurrentMethod(fallbackMethods[nextIndex]);
    setShowFallbackOptions(false);
  }, [currentMethodIndex]);

  // Load player with current method and aggressive timeout handling
  const loadPlayer = useCallback(() => {
    if (!playlistId) return;
    
    setIsLoading(true);
    setShowError(false);
    setErrorMessage('');
    setVideoCheckAttempts(0); // Reset video check attempts
    
    const url = getYouTubeUrl(playlistId, currentMethod);
    console.log(`🎵 Loading YouTube player with method: ${currentMethod}`, url);
    
    // Clear existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    // ✅ AGGRESSIVE: Much faster timeout based on method type
    const isFullPlayer = currentMethod === 'full_player' || currentMethod === 'youtube_music';
    const isDirectPlaylist = currentMethod === 'direct_playlist';
    const isEmbedPlayer = currentMethod === 'nocookie_embed' || currentMethod === 'regular_embed';
    
    let loadTimeout;
    if (isEmbedPlayer) {
      loadTimeout = 4000; // Very short for embeds (they often fail)
    } else if (isFullPlayer || isDirectPlaylist) {
      loadTimeout = 6000; // Medium for full players
    } else {
      loadTimeout = 5000; // Default
    }
    
    loadTimeoutRef.current = setTimeout(() => {
      console.warn(`🎵 ⏰ Loading timeout after ${loadTimeout}ms - automatically trying next method`);
      setIsLoading(false);
      
      // Instead of showing error, immediately try next method
      tryNextMethod();
    }, loadTimeout);
    
    // Update iframe src
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
    
    // ✅ BACKUP TIMEOUT: Ultimate fallback if iframe never loads
    setTimeout(() => {
      if (isLoading && iframeRef.current && iframeRef.current.src === url) {
        console.warn('🎵 🆘 Ultimate loading timeout - forcing next method');
        tryNextMethod();
      }
    }, loadTimeout + 3000);
    
  }, [playlistId, currentMethod, isShuffled, isLoading, tryNextMethod]);

  // ✅ ENHANCED: Skip to next video in playlist with multiple methods
  const skipToNextVideo = useCallback(() => {
    if (!iframeRef.current) return;
    
    console.log('🎵 Attempting to skip to next video...');
    
    try {
      const iframe = iframeRef.current;
      const iframeWindow = iframe.contentWindow;
      
      if (iframeWindow && iframeWindow.document) {
        // Enhanced next video methods
        const skipMethods = [
          // Method 1: YouTube next button variations
          () => {
            const nextSelectors = [
              '.ytp-next-button',
              'button[aria-label*="Next"]',
              'button[aria-label*="next"]', 
              'button[title*="Next"]',
              'button[title*="next"]',
              '.next-button',
              '.ytp-button[aria-label*="Next"]',
              'a[aria-label*="Next"]'
            ];
            
            for (let selector of nextSelectors) {
              const buttons = iframeWindow.document.querySelectorAll(selector);
              for (let button of buttons) {
                if (button.offsetParent !== null) { // Check if visible
                  button.click();
                  console.log('🎵 ✅ Clicked next button:', selector);
                  return true;
                }
              }
            }
            return false;
          },
          
          // Method 2: Keyboard shortcuts for next video
          () => {
            const shortcuts = [
              { key: 'N', code: 'KeyN' },     // YouTube next shortcut
              { key: 'n', code: 'KeyN' },     // Lowercase variant
              { key: 'ArrowRight', code: 'ArrowRight' }, // Right arrow
              { key: 'L', code: 'KeyL' }      // Skip forward
            ];
            
            for (let shortcut of shortcuts) {
              const keyEvent = new KeyboardEvent('keydown', {
                key: shortcut.key,
                code: shortcut.code,
                bubbles: true,
                cancelable: true
              });
              iframeWindow.document.dispatchEvent(keyEvent);
            }
            console.log('🎵 ✅ Sent keyboard shortcuts for next video');
            return true;
          },
          
          // Method 3: Click on playlist next item
          () => {
            const playlistSelectors = [
              '.playlist-items .ytd-playlist-video-renderer:not(.watched)',
              '.playlist-video-list-item:not(.watched)',
              '.watch-sidebar-playlist .video-list-item',
              '.ytd-playlist-panel-video-renderer'
            ];
            
            for (let selector of playlistSelectors) {
              const items = iframeWindow.document.querySelectorAll(selector);
              if (items.length > 1) {
                items[1].click(); // Click second item (next one)
                console.log('🎵 ✅ Clicked next playlist item');
                return true;
              }
            }
            return false;
          },
          
          // Method 4: Force reload with next video parameter
          () => {
            const currentUrl = iframe.src;
            if (currentUrl.includes('list=')) {
              // Try to increment video index
              const urlWithIndex = currentUrl.includes('index=') 
                ? currentUrl.replace(/index=(\d+)/, (match, num) => `index=${parseInt(num) + 1}`)
                : currentUrl + '&index=2';
              
              iframe.src = urlWithIndex;
              console.log('🎵 ✅ Reloaded with next video index');
              return true;
            }
            return false;
          }
        ];
        
        // Try each skip method
        let skipped = false;
        for (let i = 0; i < skipMethods.length && !skipped; i++) {
          try {
            skipped = skipMethods[i]();
            if (skipped) {
              console.log(`🎵 Skip method ${i + 1} successful`);
              break;
            }
          } catch (error) {
            console.warn(`🎵 Skip method ${i + 1} failed:`, error);
          }
        }
          if (skipped) {
          // Reset video check attempts
          setVideoCheckAttempts(0);
          
          // Schedule new availability check after skip
          setTimeout(() => {
            if (iframeRef.current && skipToNextVideoRef.current) {
              console.log('🎵 Re-checking video availability after skip...');
              // Restart the availability checking cycle using ref
              if (typeof skipToNextVideoRef.current === 'function') {
                // Use a simple timeout-based check instead of complex availability check
                setTimeout(() => {
                  if (iframeRef.current) {
                    console.log('🎵 Post-skip timeout check - may try next method if needed');
                    tryNextMethod();
                  }
                }, 8000); // Give the new video 8 seconds to load
              }
            }
          }, 3000);
        } else {
          console.warn('🎵 All skip methods failed, trying different YouTube method');
          tryNextMethod();
        }
      }
    } catch (error) {
      console.warn('🎵 Could not skip to next video:', error);
      tryNextMethod();
    }
  }, [tryNextMethod]);
  // ✅ CORS-SAFE: Simplified autostart that doesn't try to access iframe content
  const attemptAutostart = useCallback(() => {
    if (!iframeRef.current) return;
    
    console.log('🎵 Attempting CORS-safe autostart...');
    
    // Since we can't access iframe content due to CORS, we can only:
    // 1. Ensure autoplay is in the URL (already done)
    // 2. Try to focus the iframe to trigger user interaction
    // 3. Hope the YouTube autoplay works
    
    try {
      const iframe = iframeRef.current;
      
      // Method 1: Focus the iframe (this might help with autoplay policies)
      if (iframe.focus) {
        iframe.focus();
        console.log('🎵 ✅ Focused iframe for autoplay');
      }
      
      // Method 2: Click on the iframe area (simulate user interaction)
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      iframe.dispatchEvent(clickEvent);
      console.log('🎵 ✅ Simulated click on iframe');
      
      // Method 3: Try to reload iframe with fresh autoplay (last resort)
      if (retryCount < maxRetries) {
        setTimeout(() => {
          if (iframe && iframe.src) {
            const currentUrl = iframe.src;
            if (!currentUrl.includes('&retry=')) {
              iframe.src = currentUrl + '&retry=' + (retryCount + 1);
              setRetryCount(prev => prev + 1);
              console.log('🎵 ✅ Reloaded iframe with retry parameter');
            }
          }
        }, 2000);
      }
      
    } catch (error) {
      console.warn('🎵 Could not perform CORS-safe autostart:', error);
    }  }, [retryCount, maxRetries]);

  // ✅ TIMEOUT-BASED: Auto-skip system that doesn't rely on iframe content access
  const checkVideoAvailability = useCallback(() => {
    if (!iframeRef.current) return;
    
    console.log('🎵 Starting timeout-based availability checking...');
    
    // ✅ CORS-SAFE: Timeout-based fallback system
    const isEmbedMethod = currentMethod === 'nocookie_embed' || currentMethod === 'regular_embed';
    const isFullPlayer = currentMethod === 'full_player' || currentMethod === 'youtube_music';
    const isDirectPlaylist = currentMethod === 'direct_playlist';
    
    // Different timeout strategies for different methods
    let timeoutIntervals = [];
    
    if (isEmbedMethod) {
      // Embed methods: Very fast timeout (likely to fail)
      timeoutIntervals = [3000, 6000, 9000]; // 3, 6, 9 seconds
      console.log('🎵 ⚡ FAST TIMEOUT strategy for embed method:', currentMethod);
    } else if (isFullPlayer || isDirectPlaylist) {
      // Full players: Longer timeout (more likely to work)
      timeoutIntervals = [8000, 15000, 25000]; // 8, 15, 25 seconds
      console.log('🎵 ⏳ PATIENT TIMEOUT strategy for full player method:', currentMethod);
    } else {
      // Other methods: Medium timeout
      timeoutIntervals = [5000, 10000, 15000]; // 5, 10, 15 seconds
      console.log('🎵 ⏱️ MEDIUM TIMEOUT strategy for method:', currentMethod);
    }
    
    // Set up timeout checks
    timeoutIntervals.forEach((timeout, index) => {
      setTimeout(() => {
        if (!iframeRef.current) return;
        
        console.warn(`🎵 ⏰ Timeout check ${index + 1}/${timeoutIntervals.length} - No response after ${timeout}ms`);
        
        // Try to detect if video is actually playing by checking iframe load state
        const iframe = iframeRef.current;
        let shouldSkip = false;
        
        try {
          // Basic checks we CAN do without CORS issues
          if (!iframe.src || iframe.src === 'about:blank') {
            console.warn('🎵 💥 Iframe has no source, skipping...');
            shouldSkip = true;
          }
          
          // Check if iframe failed to load (this doesn't require content access)
          if (iframe.contentDocument === null && iframe.contentWindow === null) {
            console.warn('🎵 💥 Iframe failed to load content, skipping...');
            shouldSkip = true;
          }
          
        } catch (error) {
          // Even basic checks failed - definitely skip
          console.warn('🎵 💥 Cannot access iframe at all, skipping...', error);
          shouldSkip = true;
        }
        
        // For embed methods, be more aggressive
        if (isEmbedMethod && index >= 1) {
          console.warn('🎵 💥 Embed method timeout - assuming video unavailable, skipping...');
          shouldSkip = true;
        }
        
        // For last timeout, always skip regardless of method
        if (index === timeoutIntervals.length - 1) {
          console.warn('🎵 💥 Final timeout reached - forcing skip to next method...');
          shouldSkip = true;
        }
        
        if (shouldSkip) {
          setVideoCheckAttempts(prev => prev + 1);
          
          if (videoCheckAttempts >= 2 || index >= 1) {
            console.warn('🎵 🔄 Too many failed attempts, trying next YouTube method...');
            tryNextMethod();
          } else {
            console.warn('🎵 ⏭️ Attempting to skip to next video...');
            if (skipToNextVideoRef.current) {
              skipToNextVideoRef.current();
            }
          }
        }
      }, timeout);
    });
    
    // ✅ BACKUP: Ultimate fallback - if nothing works after all timeouts
    setTimeout(() => {
      if (iframeRef.current) {
        console.warn('🎵 🆘 ULTIMATE FALLBACK: Forcing next method after all timeouts failed');
        tryNextMethod();
      }
    }, Math.max(...timeoutIntervals) + 5000);
    
  }, [currentMethod, videoCheckAttempts, tryNextMethod]);
  // Enhanced iframe load handler with aggressive timeout-based fallback
  const handleIframeLoad = useCallback(() => {
    console.log('🎵 YouTube iframe loaded, method:', currentMethod);
    
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    // ✅ AGGRESSIVE TIMEOUT: Set up method-specific loading timeouts
    const isFullPlayer = currentMethod === 'full_player' || currentMethod === 'youtube_music';
    const isDirectPlaylist = currentMethod === 'direct_playlist';
    const isEmbedPlayer = currentMethod === 'nocookie_embed' || currentMethod === 'regular_embed';
    
    if (isFullPlayer || isDirectPlaylist) {
      // ✅ FULL PLAYER: Aggressive autostart + reasonable timeout
      console.log('🎵 🚀 FULL PLAYER strategy - aggressive autostart + 20s timeout');
      
      // Try autostart multiple times quickly
      const autostartIntervals = [200, 800, 2000, 4000, 7000, 10000];
      autostartIntervals.forEach((interval, index) => {
        setTimeout(() => {
          console.log(`🎵 🚀 Autostart attempt ${index + 1}/${autostartIntervals.length}`);
          attemptAutostart();
        }, interval);
      });
      
      // Timeout: If full player doesn't work after 20 seconds, try next method
      setTimeout(() => {
        if (iframeRef.current && iframeRef.current.src.includes(currentMethod)) {
          console.warn('🎵 ⏰ Full player timeout (20s) - trying next method...');
          tryNextMethod();
        }
      }, 20000);
      
    } else if (isEmbedPlayer) {
      // ✅ EMBED PLAYER: Very fast timeout (embeds often fail)
      console.log('🎵 ⚡ EMBED strategy - ultra fast timeout (8s max)');
      
      // Quick autostart attempt
      setTimeout(() => {
        attemptAutostart();
      }, 500);
      
      // Very fast timeout for embeds
      setTimeout(() => {
        if (iframeRef.current && iframeRef.current.src.includes('embed')) {
          console.warn('🎵 ⚡ Embed timeout (8s) - trying next method...');
          tryNextMethod();
        }
      }, 8000);
      
    } else {
      // Other methods - medium timeout
      setTimeout(() => {
        attemptAutostart();
      }, 1000);
      
      setTimeout(() => {
        if (iframeRef.current) {
          console.warn('🎵 ⏱️ Medium timeout (12s) - trying next method...');
          tryNextMethod();
        }
      }, 12000);
    }
    
    // Start the timeout-based availability checking
    setTimeout(() => {
      checkVideoAvailability();
    }, 2000);
    
    // Set loading state based on method complexity
    setTimeout(() => {
      setIsLoading(false);
    }, isFullPlayer ? 2000 : 1000);
    
  }, [currentMethod, attemptAutostart, checkVideoAvailability, tryNextMethod]);

  // Assign function to ref to avoid circular dependencies
  useEffect(() => {
    skipToNextVideoRef.current = skipToNextVideo;
  }, [skipToNextVideo]);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error('🎵 YouTube iframe error');
    setIsLoading(false);
    setShowError(true);    setErrorMessage('Iframe loading failed - probeer andere methode');
  }, []);

  // Save user preference
  const saveUserPreference = useCallback((methodIndex) => {
    setCurrentMethodIndex(methodIndex);
    setCurrentMethod(fallbackMethods[methodIndex]);
    setShowFallbackOptions(false);
    
    // Save user preference
    localStorage.setItem('youtube_preferred_method', fallbackMethods[methodIndex]);
    localStorage.setItem('youtube_preferred_method_index', methodIndex.toString());
    
    console.log('🎵 Saved YouTube method preference:', fallbackMethods[methodIndex]);
  }, []);

  // Get status message based on current state
  const getStatusMessage = () => {
    if (isLoading) return 'Laden...';
    if (showError) return 'Fout - Probeer andere methode';
    return 'Aan het spelen';
  };

  // Load user preference on mount
  useEffect(() => {
    const savedMethod = localStorage.getItem('youtube_preferred_method');
    if (savedMethod) {
      const methodIndex = fallbackMethods.indexOf(savedMethod);
      if (methodIndex !== -1) {
        setCurrentMethodIndex(methodIndex);
        setCurrentMethod(savedMethod);
      }
    }
  }, []);
  // Load player when method or shuffle changes
  useEffect(() => {
    if (isVisible && playlistId) {
      loadPlayer();
    }
  }, [isVisible, playlistId, loadPlayer]);
  // Handle volume changes from parent
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-3 mb-3 left-5 z-50 transition-all duration-300 ${
      isMinimized 
        ? 'w-100 h-30' 
        : 'w-100 h-100'
    }`}>
      {/* Player Container */}
      <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-3 py-2 flex items-center justify-between text-white">          <div className="flex items-center gap-2 flex-1">
            <div className={`w-2 h-2 rounded-full ${
              isLoading ? 'bg-yellow-400 animate-pulse' :
              showError ? 'bg-red-400' :
              'bg-green-400 animate-pulse'
            }`}></div>
            <span className="text-sm font-medium">🎵 YouTube Player</span>
         
          </div>
          
          <div className="flex items-center gap-1">
            {/* Volume Control */}
            <div className="flex items-center gap-1 px-2">
              <span className="text-xs">🔊</span>              <input
                type="range"
                min="0"
                max="100"
                value={localVolume}
                onChange={(e) => {
                  const newVolume = parseInt(e.target.value);
                  setLocalVolume(newVolume);
                  onVolumeChange?.(newVolume);
                }}
                className="w-16 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${localVolume}%, #374151 ${localVolume}%, #374151 100%)`
                }}
              />
            </div>
              {/* Fallback Button */}
            <button
              onClick={() => setShowFallbackOptions(!showFallbackOptions)}
              className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
              title="Probeer andere methode"
            >
              🔄
            </button>
            
        
            
            {/* Minimize/Maximize */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              title={isMinimized ? "Vergroot" : "Minimaliseer"}
            >
              {isMinimized ? '🔼' : '🔽'}
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors"
              title="Sluiten"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Fallback Options */}        {showFallbackOptions && (
          <div className="bg-gray-800 border-t border-gray-700 p-2">
            <div className="text-xs text-gray-300 mb-1">
              Huidige methode: <span className="font-medium text-blue-400">{getMethodDisplayName(currentMethod)}</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">Probeer andere methode:</div>
            <div className="grid grid-cols-2 gap-1">{fallbackMethods.map((method, index) => (
                <button
                  key={method}
                  onClick={() => saveUserPreference(index)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    index === currentMethodIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  disabled={index === currentMethodIndex}
                >
                  {getMethodDisplayName(method)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Player Content */}
        {!isMinimized && (
          <div className="relative" style={{ height: '280px' }}>
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-gray-900 flex flex-col items-center justify-center text-white">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <div className="text-sm font-medium mb-1">🎵 YouTube wordt geladen...</div>
                <div className="text-xs opacity-70 text-center px-4">
                  {getMethodDisplayName(currentMethod)}
                </div>
                <div className="text-xs opacity-50 mt-2">
                  Playlist: {playlistId}
                </div>
              </div>
            )}
            
            {/* Error Overlay */}
            {showError && (
              <div className="absolute inset-0 z-10 bg-gray-900 flex flex-col items-center justify-center text-white p-4">
                <div className="text-2xl mb-2">🚫</div>
                <div className="text-sm font-medium mb-2">YouTube Probleem</div>
                <div className="text-xs opacity-70 text-center mb-4">
                  {errorMessage}
                </div>
                <button
                  onClick={tryNextMethod}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  🔄 Probeer volgende methode
                </button>
              </div>
            )}
            
            {/* YouTube Iframe */}
            <iframe
              ref={iframeRef}
              className="w-full h-full border-none bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="eager"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingYouTubePlayer;
