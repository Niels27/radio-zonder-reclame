import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReportStationButton from './ReportStationButton';
import CommunityTimings from '../utils/communityTimings';

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
  playlistInfo,
  queuedStation,
  onCancelQueuedSwitch,
  adBreakMode,           // ✅ NEW: Add ad break mode prop
  onRotateNonstopStation // ✅ NEW: Add rotation callback prop
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isVolumeChanging, setIsVolumeChanging] = useState(false);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false); const [isDragging, setIsDragging] = useState(false);
  const volumeTimeoutRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const dragStateRef = useRef(false); // ✅ FIX: Add ref to track drag state

  // Community timing report states
  const [showReportBubble, setShowReportBubble] = useState(false);
  const [reportCooldown, setReportCooldown] = useState(null);
  const [lastReportType, setLastReportType] = useState(null);
  const bubbleTimeoutRef = useRef(null);

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

      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
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
    if (!timeLeft) return '';
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };
  // ✅ NEW: Handle reporting ad break timing with type and cooldown
  const handleReportAdBreak = async (type = 'start') => {
    if (!currentStation?.name) return;

    // Check if user can report
    const canReport = CommunityTimings.canUserReport(currentStation.name, type);
    if (!canReport.canReport) {
      if (window.addNotification) {
        window.addNotification(canReport.reason, 'warning', 4000);
      }
      return;
    }

    try {
      await CommunityTimings.reportAdBreak(currentStation.name, type);

      // Hide bubble and show thank you message
      setShowReportBubble(false);
      setReportCooldown('Bedankt voor je bijdrage!');
      setLastReportType(type);

      // Clear thank you message after 3 seconds
      setTimeout(() => {
        setReportCooldown(null);
        setLastReportType(null);
      }, 3000);

    } catch (error) {
      console.error('Failed to report ad break:', error);
      if (window.addNotification) {
        window.addNotification('Kon melding niet versturen', 'error', 3000);
      }
    }
  };

  // Handle mouse enter/leave for report bubble
  const handleReportMouseEnter = () => {
    if (reportCooldown) return; // Don't show bubble during cooldown/thank you

    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }

    setShowReportBubble(true);
  };

  const handleReportMouseLeave = () => {
    bubbleTimeoutRef.current = setTimeout(() => {
      setShowReportBubble(false);
    }, 150); // Small delay to allow moving to bubble
  };

  const handleBubbleMouseEnter = () => {
    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }
  };

  const handleBubbleMouseLeave = () => {
    setShowReportBubble(false);
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">

          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlayPause}
            disabled={!currentStation && !isAdBreakActive && currentSource !== 'playlist'}
            className="w-12 h-12 rounded-full bg-radio-accent hover:bg-radio-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
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
                    {currentSource === 'radio' && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-.83-.51-1.57-1.24-1.85L12 2 3.24 6.15zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
                        </svg>
                        <span>Radio</span>
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
                    )}                    {/* Community Timing Report Button - Single button with hover bubble */}
                    {currentSource === 'radio' && currentStation && (
                      <div className="relative">
                        <button
                          onMouseEnter={handleReportMouseEnter}
                          onMouseLeave={handleReportMouseLeave}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors flex items-center gap-1"
                          title="Rapporteer reclametiming"
                        >
                          <span>❗</span>
                          <span>{reportCooldown || 'Meld reclame'}</span>
                        </button>

                        {/* Hover Bubble with Begin/Einde options */}
                        {showReportBubble && !reportCooldown && (
                          <div
                            className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-2 z-50 whitespace-nowrap"
                            onMouseEnter={handleBubbleMouseEnter}
                            onMouseLeave={handleBubbleMouseLeave}
                          >
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleReportAdBreak('start')}
                                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors"
                              >
                                Begin
                              </button>
                              <button
                                onClick={() => handleReportAdBreak('end')}
                                className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors"
                              >
                                Einde
                              </button>
                            </div>
                            {/* Arrow pointing down */}
                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Queued Station Display */}
                  {queuedStation && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span>Volgende: {queuedStation.name}</span>
                      </span>
                      <button
                        onClick={onCancelQueuedSwitch}
                        className="text-orange-400 hover:text-orange-300 text-xs"
                        title="Annuleer geplande wisseling"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-6">

            {/* Playlist Controls */}
            {currentSource === 'playlist' && isPlaylistValid && (
              <div className="flex items-center space-x-2">
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

            {/* Ad Break Status - ENHANCED with timer and cancel button */}
            {isAdBreakActive ? (
              <div className="flex items-center space-x-3">
                {/* Timer Display with Cancel Button */}
                {currentAdBreakTimeLeft !== null ? (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    <span>Switch terug naar radio over:</span>
                    <span className="font-mono bg-purple-700 px-2 py-0.5 rounded">
                      {formatAdBreakTimer(currentAdBreakTimeLeft)}
                    </span>                    <button
                      onClick={onCancelAdBreakTimer}
                      className="ml-2 w-5 h-5 rounded-full bg-purple-700 hover:bg-purple-800 text-white flex items-center justify-center text-xs transition-colors"
                      title="Niet eindigen"
                    >
                      ✕
                    </button>


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
              </div>
            ) : (
              nextAdBreakIn && (
                <div className="hidden sm:flex items-center space-x-2 text-radio-secondary text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  <span>Volgende reclamepauze:</span>
                  <span className="font-mono text-white bg-gray-700 px-2 py-1 rounded">{nextAdBreakIn}</span>
                </div>
              )
            )}
            {/* Rotation Button for Nonstop Mode */}
            {adBreakMode === 'nonstop' && onRotateNonstopStation && isAdBreakActive && (
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
        {error && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-red-300 text-sm">
            <div className="flex items-center justify-between">
              <span>{error}</span>
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