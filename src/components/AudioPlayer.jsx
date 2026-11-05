// components/AudioPlayer.jsx - The fixed player bar: play/pause, now playing,
// playlist controls, ad-break countdown and the volume slider.
import React, { useEffect, useState, useRef, useCallback } from 'react';
const AudioPlayer = ({
  currentStation,
  isPlaying,
  volume,
  onTogglePlayPause,
  onVolumeChange,
  isAdBreakActive,
  isTimerRunning,
  nextAdBreakIn,
  currentAdBreakTimeLeft,
  currentSource,
  playlistShuffle,
  onToggleShuffle,
  onNextTrack,
  onPreviousTrack,
  playlistInfo,
  adBreakMode,
  savedStation, // station the player returns to after the ad break
  onJumpToSwitchNow,
  onEndAdBreak,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isVolumeChanging, setIsVolumeChanging] = useState(false);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const volumeTimeoutRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const dragStateRef = useRef(false); // Add ref to track drag state

  const isPlaylistSource = currentSource === 'spotify' || currentSource === 'youtube';

  const formatStationName = () => {
    if (isPlaylistSource) {
      return playlistInfo?.title || (currentSource === 'spotify' ? 'Spotify Playlist' : 'YouTube Playlist');
    }
    if (!currentStation) return 'Geen zender geselecteerd';
    return currentStation.name;
  };

  const getCurrentLogo = () => {
    if (isPlaylistSource && playlistInfo?.thumbnail) {
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

  // Smooth volume change with 1% steps
  const handleVolumeSliderChange = useCallback((newVolume) => {
    // Round to 1% increments for super smooth control
    const roundedVolume = Math.round(newVolume * 100) / 100;

    onVolumeChange(roundedVolume);

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

  // Enhanced mouse wheel handling with proper event prevention
  const handleVolumeWheel = useCallback((e) => {
    // Prevent page scrolling
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY > 0 ? -0.05 : 0.05; // 5% increments for smooth control
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    handleVolumeSliderChange(newVolume);
  }, [volume, handleVolumeSliderChange]);

  // Calculate volume from mouse position - FIXED
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

  // Create stable event handlers using useCallback
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

      // Clean up drag state immediately
      dragStateRef.current = false;
      setIsDragging(false);

      // Remove listeners immediately
      document.removeEventListener('mousemove', handleGlobalMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleGlobalMouseUp, { capture: true });

      // Hide tooltip after delay
      setTimeout(() => {
        setShowVolumeTooltip(false);
      }, 500);
    }
  }, [handleGlobalMouseMove]);

  // Simplified mouse down handler
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    // Set drag state immediately
    dragStateRef.current = true;
    setIsDragging(true);
    setShowVolumeTooltip(true);

    // Handle initial click
    updateVolumeFromMouse(e.clientX);

    // Add listeners with capture to ensure they work
    document.addEventListener('mousemove', handleGlobalMouseMove, { capture: true, passive: false });
    document.addEventListener('mouseup', handleGlobalMouseUp, { capture: true, passive: false });
  }, [updateVolumeFromMouse, handleGlobalMouseMove, handleGlobalMouseUp]);

  // Touch handlers with same pattern
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

  // Space toggles play/pause, except while typing in a field.
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        onTogglePlayPause();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onTogglePlayPause]);

  // Remove event listeners on unmount
  useEffect(() => {
    return () => {
      // Force cleanup all event listeners
      dragStateRef.current = false;

      document.removeEventListener('mousemove', handleGlobalMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleGlobalMouseUp, { capture: true });
      document.removeEventListener('touchmove', handleGlobalTouchMove, { capture: true });
      document.removeEventListener('touchend', handleGlobalTouchEnd, { capture: true });

      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount-only cleanup
  }, []);

  // Emergency cleanup if drag state gets stuck
  useEffect(() => {
    const cleanup = () => {
      if (dragStateRef.current) {
        console.warn('AudioPlayer: clearing stuck volume drag state');
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

  // Format ad break timer display
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
                      alt={isPlaylistSource ? 'Playlist thumbnail' : 'Station logo'}
                      className="w-full h-full object-cover"
                    />
                  ) : isPlaylistSource ? (
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-.83-.51-1.57-1.24-1.85L12 2 3.24 6.15zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
                    </svg>
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

                    {isPlaylistSource && (
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                        </svg>
                        <span>{currentSource === 'spotify' ? 'Spotify' : 'Afspeellijst'}</span>                        {playlistInfo?.videoCount && (
                          <span className="text-gray-300">({playlistInfo.videoCount})</span>
                        )}
                      </span>
                    )}

                  </div>
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
            )}

            {/* Ad Break Countdown - informational timer display, hidden on narrow screens for space */}
            {isAdBreakActive ? (
              currentAdBreakTimeLeft !== null && (
                <div className="hidden sm:flex items-center space-x-2 text-sm text-radio-secondary">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  <span>
                    {'Switch naar '}
                    <span className="font-bold">{savedStation?.name || 'radio'}</span>
                    {' over:'}
                  </span>
                  <span className="font-mono text-white px-2 py-1 rounded bg-gray-700">
                    {formatAdBreakTimer(currentAdBreakTimeLeft)}
                  </span>
                </div>
              )
            ) : (
              // Explicit null check, not `nextAdBreakIn &&` - nextAdBreakIn is 0
              // right when the countdown hits zero, and 0 is falsy but not a
              // "nothing to render" value, so `&&` used to print a stray "0".
              nextAdBreakIn != null && (
                <div className="hidden sm:flex items-center space-x-2 text-sm text-radio-secondary">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  <span>
                    {`Switch naar ${adBreakMode === 'playlist' ? 'Playlist' : adBreakMode === 'nonstop' ? 'Non-Stop Radio' : 'YouTube Playlist'} over:`}
                  </span>
                  <span className="font-mono text-white px-2 py-1 rounded bg-gray-700">
                    {typeof nextAdBreakIn === 'number' ? formatAdBreakTimer(nextAdBreakIn) : nextAdBreakIn}
                  </span>
                </div>
              )
            )}

            {/* Manual switch control - always visible in one line whenever auto ad break
                switching is on (or an ad break is already running), so you can jump back and
                forth immediately without waiting for the countdown. The label always reads
                "Switch nu" - it toggles between jumping into the ad break and ending it early
                depending on current state, only the tooltip/title reflects which. */}
            {(isTimerRunning || isAdBreakActive) && (onJumpToSwitchNow || onEndAdBreak) && (
              <button
                onClick={isAdBreakActive ? onEndAdBreak : onJumpToSwitchNow}
                disabled={isAdBreakActive ? !onEndAdBreak : !onJumpToSwitchNow}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap"
                title={isAdBreakActive ? 'Direct terug naar radio' : 'Direct naar reclamepauze'}
              >
                Switch nu
              </button>
            )}

            {/* Super Smooth Volume Control with Real-time Dragging - FIXED */}
            <div className={`volume-container ${isVolumeChanging ? 'volume-changing' : ''}`}>
              <button
                onClick={handleVolumeIconClick}
                className="hover:text-white transition-colors"
                title={isMuted ? 'Geluid aanzetten' : 'Geluid uitzetten'}
              >
                {getVolumeIcon()}
              </button>

              <div className="relative">
                {/* Custom volume slider with FIXED real-time dragging */}
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

                {/* Volume Tooltip with smooth transitions */}
                <div className={`volume-tooltip ${showVolumeTooltip || isDragging ? 'opacity-100' : 'opacity-0'}`}>
                  {getVolumePercent()}%
                  {isDragging && <div className="tooltip-drag-indicator">↕</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error handled via toast notification in App.jsx */}
      </div>
    </div>
  );
};

export default AudioPlayer;