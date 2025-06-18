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
}) => {  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMethod, setCurrentMethod] = useState('full_player');
  const [currentMethodIndex, setCurrentMethodIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState(false);  const [errorMessage, setErrorMessage] = useState('');
  const [showFallbackOptions, setShowFallbackOptions] = useState(false);
  const [localVolume, setLocalVolume] = useState(volume);  const [retryCount, setRetryCount] = useState(0);  const [maxRetries] = useState(1); // MUCH fewer retries to prevent cycling
  const [videoCheckAttempts, setVideoCheckAttempts] = useState(0);
  const [maxVideoChecks] = useState(1); // Only 1 check
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false); // Track if we're hearing audio
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
    }  };  // Try next fallback method - but be much smarter about it
  const tryNextMethod = useCallback(() => {
    // ✅ ULTRA CONSERVATIVE: Don't switch if we've had ANY indication of success
    if (retryCount >= maxRetries) {
      console.log('🎵 ⛔ Max retries reached, stopping automatic method switching');
      setShowError(true);
      setErrorMessage('Huidige methode wordt gebruikt - stop alle automatische wisseling');
      return;
    }
    
    // ✅ CRITICAL: If we're actually playing OR if we're loading, don't switch
    if (isActuallyPlaying || isLoading) {
      console.log('🎵 ⛔ Audio is playing or still loading - NOT switching methods');
      return;
    }
    
    // ✅ ULTRA CONSERVATIVE: Only switch if we're really sure it's not working
    console.log('🎵 ⚠️ ULTRA CONSERVATIVE method switch - only if absolutely necessary');
    
    const nextIndex = (currentMethodIndex + 1) % fallbackMethods.length;
    console.log(`🎵 🔄 Switching to method: ${fallbackMethods[nextIndex]} (attempt ${retryCount + 1}/${maxRetries})`);
    
    setCurrentMethodIndex(nextIndex);
    setCurrentMethod(fallbackMethods[nextIndex]);
    setShowFallbackOptions(false);
    setRetryCount(prev => prev + 1);
  }, [currentMethodIndex, retryCount, maxRetries, isActuallyPlaying, isLoading]);

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
    }      // ✅ ULTRA CONSERVATIVE: Much longer timeout to prevent premature switching
    const isFullPlayer = currentMethod === 'full_player' || currentMethod === 'youtube_music';
    const isDirectPlaylist = currentMethod === 'direct_playlist';
    const isEmbedPlayer = currentMethod === 'nocookie_embed' || currentMethod === 'regular_embed';
    
    let loadTimeout;
    if (isEmbedPlayer) {
      loadTimeout = 60000; // 60 seconds for embeds - they need lots of time to load
    } else if (isFullPlayer || isDirectPlaylist) {
      loadTimeout = 90000; // 90 seconds for full players - much more conservative
    } else {
      loadTimeout = 75000; // 75 seconds default - much more conservative
    }
      loadTimeoutRef.current = setTimeout(() => {
      // ✅ CRITICAL: Don't timeout if we're actually playing or have ever played
      if (isActuallyPlaying) {
        console.log(`🎵 ✅ Loading timeout avoided - audio is playing (method: ${currentMethod})`);
        setIsLoading(false);
        return;
      }
      
      console.warn(`🎵 ⏰ Loading timeout after ${loadTimeout}ms - trying next method`);
      setIsLoading(false);
      
      // Only try next method if we haven't heard any audio yet
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        tryNextMethod();
      } else {
        console.warn('🎵 Maximum retries reached, staying with current method');
        setShowError(true);
        setErrorMessage('Alle methoden uitgeprobeerd - huidige methode wordt gebruikt');
      }
    }, loadTimeout);
    
    // Update iframe src
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
    
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
        }        if (skipped) {
          console.log('🎵 ✅ Successfully skipped to next video - no further action needed');
          // Do nothing else - don't restart availability checking or switch methods
        } else {
          console.warn('🎵 All skip methods failed, but staying with current method to avoid cycling');
          // Don't switch methods - just log the failure and continue
        }
      }
    } catch (error) {
      console.warn('🎵 Could not skip to next video:', error);
      tryNextMethod();
    }
  }, [tryNextMethod]);  // ✅ SIMPLIFIED: Much less aggressive autostart
  const attemptAutostart = useCallback(() => {
    if (!iframeRef.current) return;
    
    console.log('🎵 Attempting gentle autostart...');
    
    try {
      const iframe = iframeRef.current;
      
      // Just try to focus the iframe - that's it, no aggressive clicking or reloading
      if (iframe.focus) {
        iframe.focus();
        console.log('🎵 ✅ Focused iframe for autoplay');
      }
      
      console.log('🎵 ✅ Gentle autostart complete - letting YouTube handle the rest');
      
    } catch (error) {
      console.warn('🎵 Could not perform gentle autostart:', error);
    }
  }, []);  // ✅ DISABLED: No aggressive availability checking to prevent cycling
  const checkVideoAvailability = useCallback(() => {
    console.log('🎵 Video availability checking DISABLED to prevent cycling');
    // Do nothing - let the method work naturally
    return;
  }, []);  // ✅ ULTRA SIMPLIFIED: Much less aggressive iframe load handling
  const handleIframeLoad = useCallback(() => {
    console.log('🎵 YouTube iframe loaded, method:', currentMethod);
    
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    // ✅ ULTRA CONSERVATIVE: Just let YouTube do its thing naturally
    console.log('🎵 🎯 ULTRA CONSERVATIVE strategy - letting YouTube work naturally');
    
    // Set loading to false after iframe loads - no aggressive intervention
    setTimeout(() => {
      setIsLoading(false);
      console.log('🎵 ✅ YouTube player ready - no further intervention');
      
      // ✅ OPTIMISTIC: Assume it's working after successful load
      // This prevents unnecessary method switching when YouTube is actually working
      setTimeout(() => {
        if (!isActuallyPlaying) {
          console.log('🎵 🎯 Optimistically assuming player is working after successful load');
          setIsActuallyPlaying(true);
        }
      }, 10000); // Give it 10 seconds to start playing, then assume it's working
      
    }, 5000); // Even longer delay to allow YouTube to fully initialize
    
    // DO NOT start any availability checking or autostart - let it work naturally
    
  }, [currentMethod, isActuallyPlaying]);

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
  // Save user preference and stop automatic cycling
  const saveUserPreference = useCallback((methodIndex) => {
    console.log('🎵 User manually selected method:', fallbackMethods[methodIndex]);
    
    // Reset retry count to stop automatic cycling
    setRetryCount(0);
    setVideoCheckAttempts(0);
    
    setCurrentMethodIndex(methodIndex);
    setCurrentMethod(fallbackMethods[methodIndex]);
    setShowFallbackOptions(false);
    
    // Save user preference
    localStorage.setItem('youtube_preferred_method', fallbackMethods[methodIndex]);
    localStorage.setItem('youtube_preferred_method_index', methodIndex.toString());
    
    console.log('🎵 Saved YouTube method preference and stopped auto-cycling:', fallbackMethods[methodIndex]);
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
  }, []);  // Load player when method or shuffle changes
  useEffect(() => {
    if (isVisible && playlistId) {
      // ✅ CONSERVATIVE: Don't reset playing state if we're just switching methods
      // Only reset when we're explicitly loading (not during method switching)
      if (!isActuallyPlaying) {
        console.log('🎵 Loading player (not playing yet)');
        setIsActuallyPlaying(false);
      } else {
        console.log('🎵 Reloading player while playing - keeping playing state');
      }
      loadPlayer();
    }
  }, [isVisible, playlistId, loadPlayer]);
    // Detect if we're actually playing by monitoring volume changes from parent
  // If parent is sending volume changes to us, it probably means we're the active player
  useEffect(() => {
    if (volume !== localVolume && isVisible) {
      console.log('🎵 ✅ Volume sync detected - marking as actually playing and clearing timeouts');
      setIsActuallyPlaying(true);
      setShowError(false); // Clear any errors since we're playing
      setIsLoading(false); // Stop loading since we're clearly working
      
      // Clear any pending load timeout since we're working
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
        console.log('🎵 ✅ Cleared load timeout - audio is working');
      }
    }
  }, [volume, localVolume, isVisible]);
    // Also set as playing when user interacts with our volume control
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setLocalVolume(newVolume);
    onVolumeChange?.(newVolume);
    setIsActuallyPlaying(true); // User interaction means we're active
    setShowError(false);
    setIsLoading(false); // User can hear audio, so it's working
    
    // Clear any pending timeouts since user is interacting
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
      console.log('🎵 ✅ User volume interaction - cleared timeouts');
    }
  };
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
              onMouseEnter={() => {
                // User is interacting with player - likely hearing audio
                if (!isActuallyPlaying) {
                  console.log('🎵 ✅ User mouse interaction - assuming audio is playing');
                  setIsActuallyPlaying(true);
                  setShowError(false);
                }
              }}
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingYouTubePlayer;
