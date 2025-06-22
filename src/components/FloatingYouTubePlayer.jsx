import React, { useState, useEffect, useRef, useCallback } from 'react';

const FloatingYouTubePlayer = ({ 
  isVisible, 
  playlistId, 
  onClose, 
  volume = 50, 
  onVolumeChange,
  isShuffled = false,
  onShuffleChange 
}) => {  // UI States - Three display modes
  const [displayMode, setDisplayMode] = useState('medium'); // 'minimized', 'medium', 'maximized'
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
  const [retryCount, setRetryCount] = useState(0);  // Volume state
  const [localVolume, setLocalVolume] = useState(volume);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
    // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 20, y: 80 }); // Initial fallback position
    // Refs
  const iframeRef = useRef(null);
  const videoCheckTimeoutRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const skipToNextVideoRef = useRef(null);
  const dragRef = useRef(null);

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
  // ✅ NEW: Toggle display mode (cycles through: minimized -> medium -> maximized)
  const toggleDisplayMode = useCallback(() => {
    setDisplayMode(prev => {
      switch (prev) {
        case 'minimized': 
          // Reset to medium mode default position (left side, above footer)
          setPosition({ x: 20, y: window.innerHeight - 400 });
          return 'medium';
        case 'medium': 
          // Reset to maximized mode default position (centered)
          setPosition({ x: (window.innerWidth - 900) / 2, y: (window.innerHeight - 600) / 2 });
          return 'maximized';
        case 'maximized': 
          // Reset to minimized mode default position (left side, in footer)
          setPosition({ x: 20, y: window.innerHeight - 65 });
          return 'minimized';
        default: 
          setPosition({ x: 20, y: window.innerHeight - 400 });
          return 'medium';
      }
    });
  }, []);// ✅ NEW: Get display mode icon - Shows what it WILL become when clicked
  const getDisplayModeIcon = () => {
    switch (displayMode) {
      case 'minimized': return '□';  // Will become medium - small square
      case 'medium': return '■';     // Will become maximized - big square
      case 'maximized': return '_';  // Will become minimized - line
      default: return '□';
    }
  };

  // ✅ NEW: Get display mode title
  const getDisplayModeTitle = () => {
    switch (displayMode) {
      case 'minimized': return 'Naar medium weergave';
      case 'medium': return 'Naar volledig scherm';
      case 'maximized': return 'Naar minimale weergave';
      default: return 'Wissel weergave';
    }
  };
  // Volume control
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Try to control iframe if possible
    if (iframeRef.current) {
      try {
        const iframe = iframeRef.current;
        if (isPlaying) {
          iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        } else {
          iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }
      } catch (error) {
        console.warn('🎵 Could not control iframe playback:', error);
      }
    }
  };

  // ✅ NEW: Iframe event handlers
  const handleIframeLoad = useCallback(() => {
    console.log('🎵 ✅ YouTube iframe loaded successfully');
    setIsLoading(false);
    setShowError(false);
    setRetryCount(0);
    
    // Start video availability check after load
    setTimeout(() => {
      checkVideoAvailability();
    }, 1000);
  }, [checkVideoAvailability]);

  const handleIframeError = useCallback(() => {
    console.error('🎵 💥 YouTube iframe failed to load');
    setIsLoading(false);
    setShowError(true);
    setErrorMessage('YouTube speler kon niet worden geladen');
  }, []);

  // Load user preference on mount
  useEffect(() => {
    const savedMethod = localStorage.getItem('youtube_preferred_method');
    if (savedMethod) {
      const savedIndex = localStorage.getItem('youtube_preferred_method_index');
      if (savedIndex) {
        const index = parseInt(savedIndex);
        if (index >= 0 && index < fallbackMethods.length) {
          setCurrentMethod(savedMethod);
          setCurrentMethodIndex(index);
        }
      }
    }
    
    // Set proper default position based on viewport
    setPosition({ x: 20, y: window.innerHeight - 400 });
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
    }  };

  // Dragging functionality
  const handleMouseDown = (e) => {
    // Only start dragging if clicking on container areas, not buttons or controls
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.closest('button') || e.target.closest('input')) {
      return;
    }
    
    setIsDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Allow completely free movement across the entire screen
    setPosition({
      x: newX,
      y: newY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, dragOffset]);

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

  // Common button style
  const buttonStyle = "w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition-all duration-200 cursor-pointer";  // MINIMIZED MODE - Footer bar (can be dragged anywhere)
  if (displayMode === 'minimized') {
    return (
      <div 
        ref={dragRef}
        className="fixed z-[100] w-100 h-12 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden" 
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Hidden iframe for audio continuity */}
        <iframe
          ref={iframeRef}
          className="absolute -top-96 -left-96 w-96 h-96"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="eager"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
        
        <div className="h-full px-3 flex items-center justify-between text-white">
          {/* Left side - Title and status */}
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-2 h-2 rounded-full ${
              isLoading ? 'bg-yellow-400 animate-pulse' :
              showError ? 'bg-red-400' :
              'bg-green-400 animate-pulse'
            }`}></div>
            <span className="text-xs font-medium truncate">🎵 YouTube</span>
          </div>
          
          {/* Middle - Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={togglePlayPause}
              className={`${buttonStyle} ${isPlaying ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
              title={isPlaying ? 'Pauzeren' : 'Afspelen'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            
            <button 
              onClick={toggleMute}
              className={`${buttonStyle} ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              title={isMuted ? 'Geluid aan' : 'Dempen'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            
            <div className="w-12 mx-1">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : localVolume}
                onChange={(e) => {
                  const newVolume = parseInt(e.target.value);
                  setLocalVolume(newVolume);
                  onVolumeChange?.(newVolume);
                  setIsMuted(false);
                }}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                title={`Volume: ${localVolume}%`}
              />
            </div>
          </div>
            {/* Right side - Mode toggle button */}
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleDisplayMode}
              className={`${buttonStyle} bg-blue-600 hover:bg-blue-700`}
              title={getDisplayModeTitle()}
            >
              {getDisplayModeIcon()}
            </button>
            <button
              onClick={() => setShowFallbackOptions(!showFallbackOptions)}
              className={`${buttonStyle} bg-yellow-600 hover:bg-yellow-700`}
              title="Instellingen"
            >
              ⚙️
            </button>
            <button 
              onClick={onClose}
              className={`${buttonStyle} bg-red-600 hover:bg-red-700`}
              title="Sluiten"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Settings dropdown for minimized mode */}
        {showFallbackOptions && (
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
            <div className="text-xs text-gray-300 mb-2">
              Methode: <span className="font-medium text-blue-400">{getMethodDisplayName(currentMethod)}</span>
            </div>
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
      </div>
    );
  }

  // MAXIMIZED MODE - Full screen overlay
  if (displayMode === 'maximized') {
    return (
      <div className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 p-6 max-w-6xl max-h-screen overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between text-white mb-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                isLoading ? 'bg-yellow-400 animate-pulse' :
                showError ? 'bg-red-400' :
                'bg-green-400 animate-pulse'
              }`}></div>
              <span className="text-lg font-medium">🎵 YouTube Player</span>
            </div>
              <div className="flex items-center gap-2">
              <button 
                onClick={toggleDisplayMode}
                className={`${buttonStyle} bg-blue-600 hover:bg-blue-700`}
                title={getDisplayModeTitle()}
              >
                {getDisplayModeIcon()}
              </button>
              <button
                onClick={() => setShowFallbackOptions(!showFallbackOptions)}
                className={`${buttonStyle} bg-yellow-600 hover:bg-yellow-700`}
                title="Instellingen"
              >
                ⚙️
              </button>
              <button 
                onClick={onClose}
                className={`${buttonStyle} bg-red-600 hover:bg-red-700`}
                title="Sluiten"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showFallbackOptions && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-300 mb-2">
                Huidige methode: <span className="font-medium text-blue-400">{getMethodDisplayName(currentMethod)}</span>
              </div>
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

          {/* Player content */}
          <div className="relative" style={{ width: '900px', height: '500px' }}>
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-gray-900 flex flex-col items-center justify-center text-white rounded-lg">
                <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-lg font-medium mb-2">🎵 YouTube wordt geladen...</div>
                <div className="text-sm opacity-70">{getMethodDisplayName(currentMethod)}</div>
              </div>
            )}
            
            {showError && (
              <div className="absolute inset-0 z-10 bg-gray-900 flex flex-col items-center justify-center text-white p-6 rounded-lg">
                <div className="text-4xl mb-4">🚫</div>
                <div className="text-lg font-medium mb-3">YouTube Probleem</div>
                <div className="text-sm opacity-70 text-center mb-6">{errorMessage}</div>
                <button
                  onClick={() => setShowFallbackOptions(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                >
                  🔄 Probeer andere methode
                </button>
              </div>
            )}
              
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
  }  // MEDIUM MODE - Default floating player (can be dragged anywhere)
  return (
    <div 
      ref={dragRef}
      className="fixed z-[100] w-96 h-80 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
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
          <button 
            onClick={toggleDisplayMode}
            className={`${buttonStyle} bg-blue-600 hover:bg-blue-700`}
            title={getDisplayModeTitle()}
          >
            {getDisplayModeIcon()}
          </button>
          <button
            onClick={() => setShowFallbackOptions(!showFallbackOptions)}
            className={`${buttonStyle} bg-yellow-600 hover:bg-yellow-700`}
            title="Instellingen"
          >
            ⚙️
          </button>
          <button 
            onClick={onClose}
            className={`${buttonStyle} bg-red-600 hover:bg-red-700`}
            title="Sluiten"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showFallbackOptions && (
        <div className="bg-gray-800 border-t border-gray-700 p-2">
          <div className="text-xs text-gray-300 mb-1">
            Methode: <span className="font-medium text-blue-400">{getMethodDisplayName(currentMethod)}</span>
          </div>
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

      {/* Player content */}
      <div className="relative" style={{ height: showFallbackOptions ? '220px' : '280px' }}>
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-gray-900 flex flex-col items-center justify-center text-white">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <div className="text-sm font-medium mb-1">🎵 YouTube wordt geladen...</div>
            <div className="text-xs opacity-70">{getMethodDisplayName(currentMethod)}</div>
          </div>
        )}
        
        {showError && (
          <div className="absolute inset-0 z-10 bg-gray-900 flex flex-col items-center justify-center text-white p-4">
            <div className="text-2xl mb-2">🚫</div>
            <div className="text-sm font-medium mb-2">YouTube Probleem</div>
            <div className="text-xs opacity-70 text-center mb-4">{errorMessage}</div>
            <button
              onClick={() => setShowFallbackOptions(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              🔄 Probeer andere methode
            </button>
          </div>
        )}
          
        <iframe
          ref={iframeRef}
          className="w-full h-full border-none bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="eager"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          onMouseEnter={() => {
            if (!isActuallyPlaying) {
              setIsActuallyPlaying(true);
              setShowError(false);
            }
          }}
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"        />
      </div>
    </div>
  );
};

export default FloatingYouTubePlayer;
