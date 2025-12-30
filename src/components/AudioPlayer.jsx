import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReportStationButton from './ReportStationButton';

// components/AudioPlayer.jsx - Enhanced smooth volume control
const AudioPlayer = ({
  currentStation,
  isPlaying,
  volume,
  onTogglePlayPause,
  onVolumeChange,
  isAdBreakActive,
  nextAdBreakIn,
  currentAdBreakTimeLeft, // ✅ ADD: This prop
  onCancelAdBreakTimer,   // ✅ ADD: This prop
  currentSource,
  error,
  playlistShuffle,
  onToggleShuffle,
  onNextTrack,
  onPreviousTrack,  // ✅ NEW: Add previous track control
  playlistInfo,  // queuedStation and onCancelQueuedSwitch removed - queue system disabled
  adBreakMode,           // ✅ NEW: Add ad break mode prop
  savedStation,          // ✅ NEW: Station we'll return to after ad break
  onRotateNonstopStation, // ✅ NEW: Add rotation callback prop
  useCommunityTimings,    // ✅ NEW: Add community timings flag prop
  currentAdBreakUsedCommunityTiming = false, // ✅ NEW: Track if current ad break used community timing
  nextCommunityTiming,    // ✅ NEW: Add community timing metadata prop
  isRadioPausedForAdBreak, // ✅ NEW: Add paused radio state prop
  pausedRadioStation,      // ✅ NEW: Add paused radio station prop
  isManualTestActive,       // ✅ NEW: Add manual test state prop
  isNonstopModeManuallyActive, // ✅ NEW: Simple state for nonstop cycling button
  // ✅ NEW: Manual timer control functions
  onJumpToSwitchNow,
  onSkipCurrentSwitch,
  onAddOneMinute,
  onEndAdBreak  // ✅ NEW: Function to end ad break early
}) => {
  // ✅ FIX: Add safety check for pausedRadioStation prop
  const safePausedRadioStation = pausedRadioStation || null;
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isVolumeChanging, setIsVolumeChanging] = useState(false);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false); const [isDragging, setIsDragging] = useState(false);
  const volumeTimeoutRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const dragStateRef = useRef(false); // ✅ FIX: Add ref to track drag state

  // Filter technical errors and show user-friendly messages
  const getUserFriendlyError = (errorMessage) => {
    if (!errorMessage) return null;

    // Hide these technical browser errors completely
    const hiddenErrors = [
      'Failed to load because no supported source was found',
      'MEDIA_ELEMENT_ERROR',
      'MEDIA_ERR_',
      'NotSupportedError',
      'AbortError',
      'NotAllowedError'
    ];

    // Check if error contains technical jargon we want to hide
    const shouldHide = hiddenErrors.some(tech => errorMessage.includes(tech));
    if (shouldHide) {
      return null; // Don't show error at all - our toast notifications already handled it
    }

    return errorMessage;
  };

  const formatStationName = () => {
    if (currentSource === 'playlist' && playlistInfo) {
      return playlistInfo.title || 'YouTube Playlist';
    }
    if (!currentStation) return 'Geen zender geselecteerd';
    return currentStation.name;
  };

  const getCurrentLogo = () => {
    if (currentSource === 'playlist' && playlistInfo?.thumbnail) {
      return playlistInfo.thumbnail;
    }
    if (currentStation?.logo) {
      return currentStation.logo;
    }
    return null;
  };

  const handleVolumeIconClick = () => {
    if (isMuted || volume === 0) {
      // Unmute - restore previous volume
      const restoreVolume = previousVolume > 0 ? previousVolume : 0.5;
      onVolumeChange(restoreVolume);
      setIsMuted(false);
    } else {
      // Mute - save current volume and set to 0
      setPreviousVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  // ✅ ENHANCED: Smooth volume change with 1% steps
  const handleVolumeSliderChange = useCallback((newVolume) => {
    // Round to 1% increments for super smooth control
    const roundedVolume = Math.round(newVolume * 100) / 100;

    onVolumeChange(roundedVolume);

    // Apply volume immediately to audio element for real-time feedback
    if (window.audioPlayer?.audioRef?.current) {
      window.audioPlayer.audioRef.current.volume = roundedVolume;
    }

    if (roundedVolume > 0 && isMuted) {
      setIsMuted(false);
    }
    if (roundedVolume === 0 && !isMuted) {
      setIsMuted(true);
    }

    // Trigger volume change animation
    setIsVolumeChanging(true);
    setShowVolumeTooltip(true);

    // Clear existing timeout
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }

    // Reset animation and hide tooltip after delay
    volumeTimeoutRef.current = setTimeout(() => {
      setIsVolumeChanging(false);
      if (!isDragging) {
        setShowVolumeTooltip(false);
      }
    }, 1000);
  }, [onVolumeChange, isMuted, isDragging]);

  // ✅ FIX: Enhanced mouse wheel handling with proper event prevention
  const handleVolumeWheel = useCallback((e) => {
    // Prevent page scrolling
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY > 0 ? -0.05 : 0.05; // 5% increments for smooth control
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    handleVolumeSliderChange(newVolume);
  }, [volume, handleVolumeSliderChange]);

  // ✅ NEW: Calculate volume from mouse position - FIXED
  const updateVolumeFromMouse = useCallback((clientX) => {
    if (!volumeSliderRef.current || !dragStateRef.current) return;

    const slider = volumeSliderRef.current;
    const rect = slider.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;

    // Calculate new volume (0-1) with bounds checking
    let newVolume = Math.max(0, Math.min(1, x / width));

    // Round to 1% for smooth steps
    newVolume = Math.round(newVolume * 100) / 100;

    handleVolumeSliderChange(newVolume);
  }, [handleVolumeSliderChange]);

  // ✅ FIX: Create stable event handlers using useCallback
  const handleGlobalMouseMove = useCallback((e) => {
    if (dragStateRef.current) {
      e.preventDefault();
      e.stopPropagation();
      updateVolumeFromMouse(e.clientX);
    }
  }, [updateVolumeFromMouse]);

  const handleGlobalMouseUp = useCallback((e) => {
    if (dragStateRef.current) {
      e.preventDefault();
      e.stopPropagation();

      // ✅ FIX: Clean up drag state immediately
      dragStateRef.current = false;
      setIsDragging(false);

      // ✅ FIX: Remove listeners immediately
      document.removeEventListener('mousemove', handleGlobalMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleGlobalMouseUp, { capture: true });

      // Hide tooltip after delay
      setTimeout(() => {
        setShowVolumeTooltip(false);
      }, 500);
    }
  }, [handleGlobalMouseMove]);

  // ✅ FIX: Simplified mouse down handler
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    // ✅ FIX: Set drag state immediately
    dragStateRef.current = true;
    setIsDragging(true);
    setShowVolumeTooltip(true);

    // Handle initial click
    updateVolumeFromMouse(e.clientX);

    // ✅ FIX: Add listeners with capture to ensure they work
    document.addEventListener('mousemove', handleGlobalMouseMove, { capture: true, passive: false });
    document.addEventListener('mouseup', handleGlobalMouseUp, { capture: true, passive: false });
  }, [updateVolumeFromMouse, handleGlobalMouseMove, handleGlobalMouseUp]);

  // ✅ FIX: Touch handlers with same pattern
  const handleGlobalTouchMove = useCallback((e) => {
    if (dragStateRef.current && e.touches[0]) {
      e.preventDefault();
      e.stopPropagation();
      updateVolumeFromMouse(e.touches[0].clientX);
    }
  }, [updateVolumeFromMouse]);

  const handleGlobalTouchEnd = useCallback((e) => {
    if (dragStateRef.current) {
      e.preventDefault();
      e.stopPropagation();

      dragStateRef.current = false;
      setIsDragging(false);

      document.removeEventListener('touchmove', handleGlobalTouchMove, { capture: true });
      document.removeEventListener('touchend', handleGlobalTouchEnd, { capture: true });

      setTimeout(() => {
        setShowVolumeTooltip(false);
      }, 500);
    }
  }, [handleGlobalTouchMove]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    dragStateRef.current = true;
    setIsDragging(true);
    setShowVolumeTooltip(true);

    const touch = e.touches[0];
    updateVolumeFromMouse(touch.clientX);

    document.addEventListener('touchmove', handleGlobalTouchMove, { capture: true, passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd, { capture: true, passive: false });
  }, [updateVolumeFromMouse, handleGlobalTouchMove, handleGlobalTouchEnd]);

  // Get volume level class for styling
  const getVolumeLevel = () => {
    if (volume >= 0.7) return 'volume-high';
    if (volume >= 0.3) return 'volume-medium';
    return 'volume-low';
  };

  // Format volume percentage for display
  const getVolumePercent = () => Math.round(volume * 100);

  // Update muted state when volume changes externally
  useEffect(() => {
    if (volume === 0 && !isMuted) {
      setIsMuted(true);
    } else if (volume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [volume, isMuted]);

  const handleKeyPress = (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      onTogglePlayPause(); // ✅ This line was causing the error
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onTogglePlayPause]); // ✅ ADD: onTogglePlayPause to dependencies

  // ✅ CLEANUP: Remove event listeners on unmount
  useEffect(() => {
    return () => {
      // ✅ FIX: Force cleanup all event listeners
      dragStateRef.current = false;

      document.removeEventListener('mousemove', handleGlobalMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleGlobalMouseUp, { capture: true });
      document.removeEventListener('touchmove', handleGlobalTouchMove, { capture: true });
      document.removeEventListener('touchend', handleGlobalTouchEnd, { capture: true });

      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []); // ✅ FIX: Empty dependency array for cleanup only

  // ✅ FIX: Emergency cleanup if drag state gets stuck
  useEffect(() => {
    const cleanup = () => {
      if (dragStateRef.current) {
        console.warn('🔧 Force cleaning stuck drag state');
        dragStateRef.current = false;
        setIsDragging(false);

        document.removeEventListener('mousemove', handleGlobalMouseMove, { capture: true });
        document.removeEventListener('mouseup', handleGlobalMouseUp, { capture: true });
        document.removeEventListener('touchmove', handleGlobalTouchMove, { capture: true });
        document.removeEventListener('touchend', handleGlobalTouchEnd, { capture: true });
      }
    };

    // Listen for visibility change to cleanup if user switches tabs while dragging
    document.addEventListener('visibilitychange', cleanup);
    window.addEventListener('blur', cleanup);

    return () => {
      document.removeEventListener('visibilitychange', cleanup);
      window.removeEventListener('blur', cleanup);
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp, handleGlobalTouchMove, handleGlobalTouchEnd]);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" opacity="0.3" />
          <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    } else if (volume < 0.5) {
      return (
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      );
    }
  };

  // Add validation check
  const isPlaylistValid = playlistInfo?.isValid;

  // ✅ NEW: Format ad break timer display
  const formatAdBreakTimer = (timeLeft) => {
    if (timeLeft === null || timeLeft === undefined) return '0:00';
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-transparent p-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">

          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlayPause}
            className="w-12 h-12 rounded-full bg-radio-accent hover:bg-radio-accent-hover flex items-center justify-center transition-colors"
            title="Druk op spatiebalk om af te spelen/pauzeren"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Station/Playlist Info */}
          <div className="flex-1 min-w-0 mx-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 flex items-center space-x-3">

                {/* Logo/Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-600 flex items-center justify-center flex-shrink-0">
                  {getCurrentLogo() ? (
                    <img
                      src={getCurrentLogo()}
                      alt={currentSource === 'playlist' ? 'Playlist thumbnail' : 'Station logo'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs font-bold">
                      {currentSource === 'playlist' ? '♪' : '📻'}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold truncate text-white">
                    {formatStationName()}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {/* Normal radio mode (not during ad break) */}
                    {currentSource === 'radio' && !isAdBreakActive && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-.83-.51-1.57-1.24-1.85L12 2 3.24 6.15zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
                        </svg>
                        <span>Radio</span>
                      </span>
                    )}

                    {/* ✅ NEW: Nonstop radio indicator during ad break */}
                    {currentSource === 'radio' && isAdBreakActive && adBreakMode === 'nonstop' && (
                      <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-.83-.51-1.57-1.24-1.85L12 2 3.24 6.15zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
                        </svg>
                        <span>Nonstop Radio</span>
                      </span>
                    )}

                    {currentSource === 'playlist' && (
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                        </svg>
                        <span>Afspeellijst</span>                        {playlistInfo?.videoCount && (
                          <span className="text-gray-300">({playlistInfo.videoCount})</span>
                        )}
                      </span>
                    )}                    {/* ✅ NEW: "Returning to" indicator during nonstop ad break */}
                    {isAdBreakActive && adBreakMode === 'nonstop' && savedStation && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span>Switch terug naar: {savedStation.name}</span>
                      </span>
                    )}

                    {/* ✅ NEW: Radio "On Hold" indicator during ad break */}
                    {isAdBreakActive && isRadioPausedForAdBreak && safePausedRadioStation && (
                      <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full flex items-center space-x-1 animate-pulse">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                        <span>Radio wacht: {safePausedRadioStation?.name || 'Onbekend'}</span>
                      </span>
                    )}
                  </div>                  {/* Queue system disabled for reliability */}
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-6">

            {/* Playlist Controls - Show for Spotify */}
            {currentSource === 'spotify' && (
              <div className="flex items-center space-x-2">
                {/* Shuffle Button */}
                <button
                  onClick={() => onToggleShuffle(!playlistShuffle)}
                  className={`p-2 rounded transition-colors ${playlistShuffle
                    ? 'bg-radio-accent text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                    }`}
                  title={playlistShuffle ? 'Shuffle uitschakelen' : 'Shuffle inschakelen'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                  </svg>
                </button>

                {/* Previous Track Button */}
                <button
                  onClick={onPreviousTrack}
                  className="p-2 rounded bg-gray-600 hover:bg-gray-500 text-gray-300 transition-colors"
                  title="Vorig nummer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                  </svg>
                </button>

                {/* Next Track Button */}
                <button
                  onClick={onNextTrack}
                  className="p-2 rounded bg-gray-600 hover:bg-gray-500 text-gray-300 transition-colors"
                  title="Volgende nummer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                  </svg>
                </button>
              </div>
            )}            {/* Ad Break Status - ENHANCED with timer and cancel button */}
            {isAdBreakActive ? (
              <div className="flex items-center space-x-3">                {/* Timer Display with Cancel Button */}
                {currentAdBreakTimeLeft !== null ? (
                  <div className={`hidden sm:flex flex-col items-center space-y-2 text-sm ${
                    currentAdBreakUsedCommunityTiming ? 'text-yellow-400' : 'text-radio-secondary'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>                      <span>
                        {currentAdBreakUsedCommunityTiming ? 'Community switch naar radio over:' : `Switch terug naar radio over:`}
                      </span>
                      <span className={`font-mono text-white px-2 py-1 rounded ${
                        currentAdBreakUsedCommunityTiming ? 'bg-yellow-600' : 'bg-gray-700'
                      }`}>
                        {formatAdBreakTimer(currentAdBreakTimeLeft)}
                      </span>
                    </div>
                    
                    {/* ✅ NEW: "Nu terug" button to end ad break immediately */}
                    {onEndAdBreak && (
                      <button
                        onClick={onEndAdBreak}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                        title="Direct terug naar radio"
                      >
                        Nu terug
                      </button>
                    )}
                  </div>

                ) : (
                  // Fallback display if timer is not available
                  <div className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                    </svg>
                    <span>Reclamepauze Actief</span>
                  </div>
                )}
              </div>            ) : (              nextAdBreakIn && (                <div className={`hidden sm:flex flex-col items-center space-y-2 text-sm ${
                  nextCommunityTiming ? 'text-yellow-400' : 'text-radio-secondary'
                }`}>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>                    <span>
                      {nextCommunityTiming ? 'Community pauze wisseling in:' : `Switch naar ${adBreakMode === 'playlist' ? 'Playlist' : adBreakMode === 'nonstop' ? 'Non-Stop Radio' : 'Lofi Girl'} over:`}
                    </span><span className={`font-mono text-white px-2 py-1 rounded ${
                      nextCommunityTiming ? 'bg-yellow-600' : 'bg-gray-700'
                    }`}>
                      {typeof nextAdBreakIn === 'number' ? formatAdBreakTimer(nextAdBreakIn) : nextAdBreakIn}
                    </span>
                  </div>
                  
                  {/* ✅ NEW: Timer Control Buttons for normal countdown */}
                  {onJumpToSwitchNow && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={onJumpToSwitchNow}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                        title="Direct naar reclamepauze"
                      >
                        Switch nu
                      </button>
                      {onSkipCurrentSwitch && (
                        <button
                          onClick={onSkipCurrentSwitch}
                          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                          title="Deze pauze overslaan"
                        >
                          Skip switch
                        </button>
                      )}
                      {onAddOneMinute && (
                        <button
                          onClick={onAddOneMinute}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                          title="1 minuut langer wachten"
                        >
                          +1 min
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            )}            {/* Rotation Button for Nonstop Mode - Show during any nonstop mode */}
            {adBreakMode === 'nonstop' && onRotateNonstopStation && 
             (isNonstopModeManuallyActive || isAdBreakActive) && (
              <button
                onClick={onRotateNonstopStation}
                className="ml-2 w-12 h-8 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center text-l transition-colors"
                title="Wissel naar volgende non-stop radio"
              >
                ⟳
              </button>
            )}
            {/* ✅ ENHANCED: Super Smooth Volume Control with Real-time Dragging - FIXED */}
            <div className={`volume-container ${isVolumeChanging ? 'volume-changing' : ''}`}>
              <button
                onClick={handleVolumeIconClick}
                className="hover:text-white transition-colors"
                title={isMuted ? 'Geluid aanzetten' : 'Geluid uitzetten'}
              >
                {getVolumeIcon()}
              </button>

              <div className="relative">
                {/* ✅ ENHANCED: Custom volume slider with FIXED real-time dragging */}
                <div
                  ref={volumeSliderRef}
                  className={`volume-slider ${getVolumeLevel()} ${isVolumeChanging ? 'volume-changing' : ''} ${isDragging ? 'dragging' : ''}`}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onWheel={handleVolumeWheel}
                  onMouseEnter={() => !isDragging && setShowVolumeTooltip(true)}
                  onMouseLeave={() => !isDragging && !isVolumeChanging && setShowVolumeTooltip(false)}
                >
                  {/* Volume track background */}
                  <div className="volume-track" />

                  {/* Volume fill */}
                  <div
                    className="volume-fill"
                    style={{ width: `${getVolumePercent()}%` }}
                  />

                  {/* Volume thumb/handle */}
                  <div
                    className="volume-thumb"
                    style={{ left: `${getVolumePercent()}%` }}
                  />
                </div>

                {/* ✅ ENHANCED: Volume Tooltip with smooth transitions */}
                <div className={`volume-tooltip ${showVolumeTooltip || isDragging ? 'opacity-100' : 'opacity-0'}`}>
                  {getVolumePercent()}%
                  {isDragging && <div className="tooltip-drag-indicator">↕</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && getUserFriendlyError(error) && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-red-300 text-sm">
            <div className="flex items-center justify-between">
              <span>{getUserFriendlyError(error)}</span>
              {currentStation && currentSource === 'radio' && (
                <ReportStationButton
                  currentStation={currentStation}
                  error={error}
                  onReported={(result) => {
                    console.log('Station reported from AudioPlayer:', result);
                    if (window.addNotification) {
                      window.addNotification(`Radio ${currentStation.name} gemeld als niet werkend`, 'success', 3000);
                    }
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;