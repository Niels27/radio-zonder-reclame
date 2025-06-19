import React, { useState, useEffect, useRef, useCallback } from 'react';

const FloatingYouTubePlayer = ({ 
  isVisible, 
  playlistId, 
  onClose, 
  volume = 50, 
  onVolumeChange,
  isShuffled = false,
  onShuffleChange 
}) => {  // UI States
  const [isMinimized, setIsMinimized] = useState(false); // Start with floating player (not minimized)
  const [isMaximized, setIsMaximized] = useState(false); // New state for large centered overlay
  const [isLoading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showFallbackOptions, setShowFallbackOptions] = useState(false);
  
  // Player States
  const [currentMethod, setCurrentMethod] = useState('full_player'); // Always start with full player
  const [currentMethodIndex, setCurrentMethodIndex] = useState(0);
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);
  const [videoCheckAttempts, setVideoCheckAttempts] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  
  // Volume
  const [localVolume, setLocalVolume] = useState(volume);
  
  // Refs
  const iframeRef = useRef(null);
  const videoCheckTimeoutRef = useRef(null);
  const loadTimeoutRef = useRef(null);  const skipToNextVideoRef = useRef(null);

  // YouTube fallback methods - manual selection only
  const fallbackMethods = [
    'full_player',      // Full YouTube player (default, no auto-cycling)
    'nocookie_embed',   // YouTube no-cookie embed
    'regular_embed',    // Regular YouTube embed
    'youtube_music',    // YouTube Music
    'direct_playlist',  // Direct playlist link
    'mobile_embed'      // Mobile YouTube
  ];

  // ✅ SKIP TO NEXT VIDEO: Skip unavailable videos in the playlist with multiple methods
  const skipToNextVideo = useCallback(() => {
    if (!iframeRef.current) return;
    
    console.log('🎵 ⏭️ Skipping to next video in playlist...');
    setVideoCheckAttempts(prev => prev + 1);
    
    // If too many attempts, show error
    if (videoCheckAttempts >= 10) {
      console.error('🎵 💥 Too many skip attempts, there might be an issue with the playlist');
      setShowError(true);
      setErrorMessage('Playlist lijkt problemen te hebben - controleer de playlist URL');
      return;
    }
    
    try {
      const iframe = iframeRef.current;
      const iframeWindow = iframe.contentWindow;
      
      if (iframeWindow) {
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
              try {
                const buttons = iframeWindow.document.querySelectorAll(selector);
                for (let button of buttons) {
                  if (button.offsetParent !== null) { // Check if visible
                    button.click();
                    console.log('🎵 ✅ Clicked next button:', selector);
                    return true;
                  }
                }
              } catch (e) {
                // CORS blocked, that's fine
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
              try {
                const keyEvent = new KeyboardEvent('keydown', {
                  key: shortcut.key,
                  code: shortcut.code,
                  bubbles: true,
                  cancelable: true
                });
                iframeWindow.document.dispatchEvent(keyEvent);
              } catch (e) {
                // CORS blocked, that's fine
              }
            }
            console.log('🎵 ✅ Sent keyboard shortcuts for next video');
            return true;
          },
          
          // Method 3: Force reload with next video parameter
          () => {
            const currentUrl = iframe.src;
            if (currentUrl.includes('list=')) {
              // Try to increment video index
              const urlWithIndex = currentUrl.includes('index=') 
                ? currentUrl.replace(/index=(\d+)/, (match, num) => `index=${parseInt(num) + 1}`)
                : currentUrl + '&index=2';
              
              iframe.src = urlWithIndex;
              console.log('🎵 ✅ Reloaded with next video index');
              setCurrentVideoIndex(prev => prev + 1);
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
          console.log('🎵 ✅ Successfully skipped to next video');
          // Reset video check for the new video
          setIsActuallyPlaying(false);
          
          // Start new availability check after skip (avoid circular dependency)
          setTimeout(() => {
            if (videoCheckTimeoutRef.current) {
              clearTimeout(videoCheckTimeoutRef.current);
            }
            // Set up quick detection (2 seconds) for the new video
            videoCheckTimeoutRef.current = setTimeout(() => {
              console.log('🎵 ⏰ New video availability check - may be unavailable, trying next video');
              // Recursive call to skip if this video also doesn't play
              if (iframeRef.current) {
                skipToNextVideo();
              }
            }, 2000);
          }, 1000);
        } else {
          console.warn('🎵 ⚠️ All skip methods failed');
        }
      }
    } catch (error) {
      console.error('🎵 💥 Error skipping video:', error);
    }
  }, [videoCheckAttempts, currentVideoIndex]);
  // ✅ VIDEO AVAILABILITY DETECTION: Skip unplayable videos quickly
  const checkVideoAvailability = useCallback(() => {
    if (!iframeRef.current) return;
    
    console.log('🎵 🔍 Checking video availability...');
    
    // Clear any existing timeout
    if (videoCheckTimeoutRef.current) {
      clearTimeout(videoCheckTimeoutRef.current);
    }
    
    // Set up quick detection (2 seconds)
    videoCheckTimeoutRef.current = setTimeout(() => {
      console.log('🎵 ⏰ Video availability check - may be unavailable, trying next video');
      if (iframeRef.current) {
        skipToNextVideo();
      }
    }, 2000); // Quick 2-second check
    
  }, []); // Remove skipToNextVideo dependency to avoid circular reference

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

  // Get first video ID from playlist to start playback properly
  const getFirstVideoFromPlaylist = useCallback(async (playlistId) => {
    // For now, we'll use a simple approach - start with index=1 and let YouTube handle it
    // This avoids API key requirements while still starting on the first video
    return 'FIRST_VIDEO'; // Placeholder that we'll replace in the URL
  }, []);
  // Get YouTube URL for different methods
  const getYouTubeUrl = (playlistId, method = 'full_player') => {
    const shuffleParam = isShuffled ? '&shuffle=1' : '';
    const origin = encodeURIComponent(window.location.origin);
    
    switch (method) {
      case 'full_player':
        // Use embed with playlist starting at first video for better autoplay
        return `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&index=1${shuffleParam}&controls=1&rel=0`;
        
      case 'youtube_music':
        return `https://music.youtube.com/playlist?list=${playlistId}&autoplay=1${shuffleParam}`;
        
      case 'nocookie_embed':
        return `https://www.youtube-nocookie.com/embed/videoseries?` +
          `list=${playlistId}&autoplay=1&index=1&loop=1&controls=1&rel=0&modestbranding=1` +
          `&iv_load_policy=3&fs=1&disablekb=0&origin=${origin}&enablejsapi=1${shuffleParam}`;
          
      case 'regular_embed':
        return `https://www.youtube.com/embed/videoseries?` +
          `list=${playlistId}&autoplay=1&index=1&loop=1&controls=1&rel=0&modestbranding=1${shuffleParam}`;
          
      case 'direct_playlist':
        return `https://www.youtube.com/playlist?list=${playlistId}&autoplay=1${shuffleParam}`;
        
      case 'mobile_embed':
        return `https://m.youtube.com/playlist?list=${playlistId}&autoplay=1${shuffleParam}`;
        
      default:
        return `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&index=1${shuffleParam}&controls=1&rel=0`;
    }};

  // Load player with current method
  const loadPlayer = useCallback(() => {
    if (!playlistId) return;
    
    setIsLoading(true);
    setShowError(false);
    setErrorMessage('');
    setVideoCheckAttempts(0);
    
    const url = getYouTubeUrl(playlistId, currentMethod);
    console.log(`🎵 Loading YouTube player with method: ${currentMethod}`, url);
    
    // Clear existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    // Update iframe src
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
    
  }, [playlistId, currentMethod, isShuffled]);

  // ✅ MANUAL METHOD SWITCHING: Only allow manual changes, no auto-cycling
  const switchToMethod = useCallback((methodIndex) => {
    const method = fallbackMethods[methodIndex];
    console.log(`🎵 🔄 Manually switching to method: ${method}`);
    
    setCurrentMethod(method);
    setCurrentMethodIndex(methodIndex);
    setShowFallbackOptions(false);
    setIsActuallyPlaying(false);
    setVideoCheckAttempts(0);
    setCurrentVideoIndex(0);
    
    // Save user preference
    localStorage.setItem('youtube_preferred_method', method);
    localStorage.setItem('youtube_preferred_method_index', methodIndex.toString());
    
    // Reload player with new method
    loadPlayer();
  }, [loadPlayer]);

  // ✅ GENTLE AUTO-START: Simple focus-based autostart
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
  }, []);  // ✅ IFRAME LOAD HANDLER: Handle successful iframe loading
  const handleIframeLoad = useCallback(() => {
    console.log('🎵 YouTube iframe loaded, method:', currentMethod);
    
    // Clear any existing timeout immediately when iframe loads successfully
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
      console.log('🎵 ✅ Cleared load timeout on successful iframe load');
    }
    
    // Set loading to false and assume success
    setIsLoading(false);
    setIsActuallyPlaying(true);
    setShowError(false);
    console.log('🎵 ✅ YouTube iframe loaded successfully - marked as playing');
    
    // Save successful method
    localStorage.setItem('youtube_preferred_method', currentMethod);
    localStorage.setItem('youtube_preferred_method_index', currentMethodIndex.toString());
    console.log('🎵 ✅ Auto-saved working method preference:', currentMethod);
    
    // Start video availability checking for auto-skip
    checkVideoAvailability();
    
  }, [currentMethod, currentMethodIndex, checkVideoAvailability]);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error('🎵 YouTube iframe error');
    setIsLoading(false);
    setShowError(true);
    setErrorMessage('Iframe loading failed - probeer andere methode');
  }, []);  // Save user preference and stop automatic cycling
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
    
    // Reload player with new method
    loadPlayer();
  }, [loadPlayer]);

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
      if (!isActuallyPlaying) {
        console.log('🎵 Loading player (not playing yet)');
        setIsActuallyPlaying(false);
      } else {
        console.log('🎵 Reloading player while playing - keeping playing state');
      }
      loadPlayer();
    }
  }, [isVisible, playlistId, loadPlayer]);

  // Volume sync detection - parent sending volume changes indicates we're active
  useEffect(() => {
    if (volume !== localVolume && isVisible) {
      console.log('🎵 ✅ Volume sync detected - marking as actually playing and clearing timeouts');
      setIsActuallyPlaying(true);
      setShowError(false);
      setIsLoading(false);
      
      // Clear any pending load timeout since we're working
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
        console.log('🎵 ✅ Cleared load timeout - audio is working');
      }
      
      // Save successful method
      if (currentMethod) {
        localStorage.setItem('youtube_preferred_method', currentMethod);
        localStorage.setItem('youtube_preferred_method_index', currentMethodIndex.toString());
        console.log('🎵 ✅ Saved working method preference:', currentMethod);
      }
    }
  }, [volume, localVolume, isVisible, currentMethod, currentMethodIndex]);

  // Handle volume changes from parent
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  // Handle volume change by user
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setLocalVolume(newVolume);
    onVolumeChange?.(newVolume);
    setIsActuallyPlaying(true); // User interaction means we're active
    setShowError(false);
    setIsLoading(false);
    
    // Clear any pending timeouts since user is interacting
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
      console.log('🎵 ✅ User volume interaction - cleared timeouts');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (videoCheckTimeoutRef.current) {
        clearTimeout(videoCheckTimeoutRef.current);
      }
    };
  }, []);  if (!isVisible) return null;

  // Maximized overlay (like lofi player)
  if (isMaximized) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 p-6 max-w-4xl max-h-screen overflow-hidden">
          {/* Header for maximized view */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between text-white mb-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                isLoading ? 'bg-yellow-400 animate-pulse' :
                showError ? 'bg-red-400' :
                'bg-green-400 animate-pulse'
              }`}></div>
              <span className="text-lg font-medium">🎵 YouTube Player - Maximized</span>
            </div>
            
            <div className="flex items-center gap-2">
        
                
              {/* Fallback Button */}
              <button
                onClick={() => setShowFallbackOptions(!showFallbackOptions)}
                className="px-3 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
                title="Probeer andere methode"
              >
                🔄
              </button>
              
              {/* Minimize Button */}
              <button
                onClick={() => setIsMaximized(false)}
                className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                title="Minimaliseer naar floating player"
              >
                🔽
              </button>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded transition-colors"
                title="Sluiten"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Fallback Options for maximized view */}
          {showFallbackOptions && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-300 mb-2">
                Huidige methode: <span className="font-medium text-blue-400">{getMethodDisplayName(currentMethod)}</span>
              </div>
              <div className="text-sm text-gray-400 mb-3">Probeer andere methode:</div>
              <div className="grid grid-cols-3 gap-2">
                {fallbackMethods.map((method, index) => (
                  <button
                    key={method}
                    onClick={() => saveUserPreference(index)}
                    className={`px-3 py-2 text-sm rounded transition-colors ${
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

          {/* Player Content - Large */}
          <div className="relative" style={{ width: '900px', height: '500px' }}>
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-gray-900 flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-lg font-medium mb-2">🎵 YouTube wordt geladen...</div>
                <div className="text-sm opacity-70 text-center px-4">
                  {getMethodDisplayName(currentMethod)}
                </div>
                <div className="text-sm opacity-50 mt-3">
                  Playlist: {playlistId}
                </div>
              </div>
            )}
            
            {/* Error Overlay */}
            {showError && (
              <div className="absolute inset-0 z-10 bg-gray-900 flex flex-col items-center justify-center text-white p-6">
                <div className="text-4xl mb-4">🚫</div>
                <div className="text-lg font-medium mb-3">YouTube Probleem</div>
                <div className="text-sm opacity-70 text-center mb-6">
                  {errorMessage}
                </div>
                <button
                  onClick={() => setShowFallbackOptions(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                >
                  🔄 Probeer andere methode
                </button>
              </div>
            )}
              
            {/* YouTube Iframe - Large */}
            <iframe
              ref={iframeRef}
              className="w-full h-full border-none bg-black rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="eager"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              onMouseEnter={() => {
                if (!isActuallyPlaying) {
                  console.log('🎵 ✅ User mouse interaction - assuming audio is playing');
                  setIsActuallyPlaying(true);
                  setShowError(false);
                }
              }}
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>
      </div>
    );
  }

  // Default floating player
  return (
    <div className={`fixed bottom-20 mb-7 left-5 z-50 transition-all duration-300 ${
      isMinimized 
        ? 'w-80 h-12' 
        : 'w-96 h-80'
    }`}>
      {/* Player Container */}
      <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-3 py-2 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-2 h-2 rounded-full ${
              isLoading ? 'bg-yellow-400 animate-pulse' :
              showError ? 'bg-red-400' :
              'bg-green-400 animate-pulse'
            }`}></div>
            <span className="text-sm font-medium">🎵 YouTube Player</span>
          </div>
          
          <div className="flex items-center gap-1">
        
              
            {/* Fallback Button */}
            <button
              onClick={() => setShowFallbackOptions(!showFallbackOptions)}
              className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
              title="Probeer andere methode"
            >
              🔄
            </button>
              {/* Maximize Button */}
            <button
              onClick={() => setIsMaximized(true)}
              className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded transition-colors"
              title="Maximaliseer naar groot scherm"
            >
              🔼
            </button>
            
            {/* Minimize/Expand */}
         
            
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

        {/* Fallback Options */}
        {showFallbackOptions && (
          <div className="bg-gray-800 border-t border-gray-700 p-2">
            <div className="text-xs text-gray-300 mb-1">
              Huidige methode: <span className="font-medium text-blue-400">{getMethodDisplayName(currentMethod)}</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">Probeer andere methode:</div>
            <div className="grid grid-cols-2 gap-1">
              {fallbackMethods.map((method, index) => (
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
                  onClick={() => setShowFallbackOptions(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  🔄 Probeer andere methode
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
    </div>  );
};

export default FloatingYouTubePlayer;
