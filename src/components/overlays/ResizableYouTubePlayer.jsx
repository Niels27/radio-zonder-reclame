// components/overlays/ResizableYouTubePlayer.jsx - Resizable YouTube mini-player
// Shows "Sluit in: XX:XX" timer for automatic closures, stays open for manual opens

import React, { useState, useEffect, useRef } from 'react';

const ResizableYouTubePlayer = ({
  isVisible,
  playlistId,
  videoId,
  onClose,
  volume = 50,
  onVolumeChange,
  isAutomatic = false, // Was this opened automatically?
  autoCloseSeconds = null, // Auto-close timer (null = manual, number = automatic)
  title = 'YouTube Player'
}) => {
  // Position and size
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 320 });
  const [size, setSize] = useState({ width: 400, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Auto-close timer
  const [timeRemaining, setTimeRemaining] = useState(autoCloseSeconds);
  const [timerCancelled, setTimerCancelled] = useState(false);

  // YouTube fallback methods
  const [showSettings, setShowSettings] = useState(false);
  const [currentMethod, setCurrentMethod] = useState(() => {
    // Default to full_player (index 0) = Standaard
    return parseInt(localStorage.getItem('youtube_embed_method') || '0');
  });

  const playerRef = useRef(null);
  const containerRef = useRef(null);

  // YouTube player instance
  const [player, setPlayer] = useState(null);

  // YouTube fallback methods - 6 different embed approaches
  const fallbackMethods = [
    'full_player',      // Full YouTube player (default)
    'nocookie_embed',   // YouTube no-cookie embed
    'regular_embed',    // Regular YouTube embed
    'youtube_music',    // YouTube Music
    'direct_playlist',  // Direct playlist link
    'mobile_embed'      // Mobile YouTube
  ];

  const getMethodDisplayName = (method) => {
    const names = {
      'full_player': 'Standaard',
      'nocookie_embed': 'Privacy',
      'regular_embed': 'Basis',
      'youtube_music': 'Music',
      'direct_playlist': 'Direct',
      'mobile_embed': 'Mobiel'
    };
    return names[method] || method;
  };

  // Load YouTube iframe API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Get embed URL based on selected method
  const getEmbedUrl = () => {
    const method = fallbackMethods[currentMethod];
    const id = videoId || playlistId;

    switch (method) {
      case 'nocookie_embed':
        return playlistId
          ? `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&autoplay=1&controls=1&modestbranding=1&rel=0`
          : `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;

      case 'regular_embed':
        return playlistId
          ? `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&controls=1&modestbranding=1&rel=0`
          : `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;

      case 'youtube_music':
        return playlistId
          ? `https://music.youtube.com/embed/playlist?list=${playlistId}&autoplay=1`
          : `https://music.youtube.com/embed/${videoId}?autoplay=1`;

      case 'direct_playlist':
        return playlistId
          ? `https://www.youtube.com/embed?listType=playlist&list=${playlistId}&autoplay=1&controls=1`
          : `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`;

      case 'mobile_embed':
        return playlistId
          ? `https://m.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&controls=1`
          : `https://m.youtube.com/embed/${videoId}?autoplay=1&controls=1`;

      case 'full_player':
      default:
        return playlistId
          ? `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&controls=1&modestbranding=1&rel=0&enablejsapi=1`
          : `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&enablejsapi=1`;
    }
  };

  // Initialize YouTube player when visible or method changes
  useEffect(() => {
    if (!isVisible) return;

    // Clean up existing player/iframe first
    if (player) {
      console.log('🔄 Destroying existing player for reload');
      player.destroy();
      setPlayer(null);
    }

    if (playerRef.current) {
      // Clear any existing content
      playerRef.current.innerHTML = '';
    }

    const method = fallbackMethods[currentMethod];
    console.log(`✅ Loading player with method: ${method}`);

    // For full_player method, use YouTube IFrame API
    if (method === 'full_player' && window.YT) {
      const playerConfig = {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume);
          }
        }
      };

      if (playlistId) {
        playerConfig.playerVars.list = playlistId;
        playerConfig.playerVars.listType = 'playlist';
      } else if (videoId) {
        playerConfig.videoId = videoId;
      } else {
        console.error('❌ ResizableYouTubePlayer: Neither videoId nor playlistId provided');
        return;
      }

      const newPlayer = new window.YT.Player(playerRef.current, playerConfig);
      setPlayer(newPlayer);
    } else {
      // For all other methods, use direct iframe embed
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
      iframe.allow = 'autoplay; encrypted-media';
      iframe.src = getEmbedUrl();

      if (playerRef.current) {
        playerRef.current.appendChild(iframe);
      }

      console.log(`✅ Created iframe with URL: ${iframe.src}`);
    }

    return () => {
      if (player) {
        player.destroy();
        setPlayer(null);
      }
    };
  }, [isVisible, currentMethod, playlistId, videoId, volume]);

  // Update volume when changed
  useEffect(() => {
    if (player && player.setVolume) {
      player.setVolume(volume);
    }
  }, [volume, player]);

  // Auto-close countdown timer
  useEffect(() => {
    if (!isVisible || !isAutomatic || timerCancelled || timeRemaining === null) {
      return;
    }

    if (timeRemaining <= 0) {
      console.log('⏰ ResizableYouTubePlayer: Auto-close timer reached 0, closing');
      onClose();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, isAutomatic, timerCancelled, timeRemaining, onClose]);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle')) return; // Don't drag when resizing

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    } else if (isResizing) {
      const newWidth = Math.max(300, e.clientX - position.x);
      const newHeight = Math.max(200, e.clientY - position.y);
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset]);

  // Handle resize
  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  // Cancel auto-close timer
  const handleCancelTimer = () => {
    setTimerCancelled(true);
    console.log('🚫 ResizableYouTubePlayer: Auto-close timer cancelled by user');
  };

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Header bar */}
      <div
        className="bg-gray-700 px-3 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-white font-medium text-sm truncate">{title}</span>

          {/* Auto-close timer (only shown if automatic and not cancelled) */}
          {isAutomatic && !timerCancelled && timeRemaining !== null && timeRemaining > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/20 px-2 py-1 rounded border border-orange-500/50">
              <span className="text-orange-300 text-xs font-mono">
                Sluit in: {formatTime(timeRemaining)}
              </span>
              <button
                onClick={handleCancelTimer}
                className="text-orange-300 hover:text-white text-xs font-bold px-1"
                title="Annuleer automatisch sluiten"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Settings and Close buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-white transition-colors px-2"
            title="Instellingen"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-lg font-bold px-2"
            title="Sluiten"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Settings dropdown */}
      {showSettings && (
        <div className="absolute top-12 right-3 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl z-10">
          <div className="text-xs text-gray-300 mb-2">
            Methode: <span className="font-medium text-blue-400">{getMethodDisplayName(fallbackMethods[currentMethod])}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {fallbackMethods.map((method, index) => (
              <button
                key={method}
                onClick={() => {
                  console.log(`⚙️ Switching to method: ${method}`);
                  setCurrentMethod(index);
                  localStorage.setItem('youtube_embed_method', index.toString());
                  setShowSettings(false);
                  // Player will auto-reload via useEffect watching currentMethod
                }}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  index === currentMethod
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {getMethodDisplayName(method)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* YouTube player */}
      <div className="w-full h-[calc(100%-40px)] bg-black">
        <div ref={playerRef} className="w-full h-full"></div>
      </div>

      {/* Resize handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        onMouseDown={handleResizeStart}
        style={{
          background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.3) 50%)'
        }}
      />

      {/* Volume control (optional) */}
      <div className="absolute bottom-2 left-2 bg-gray-900/80 px-2 py-1 rounded flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange?.(parseInt(e.target.value))}
          className="w-20 h-1"
        />
        <span className="text-white text-xs w-8">{volume}%</span>
      </div>
    </div>
  );
};

export default ResizableYouTubePlayer;
