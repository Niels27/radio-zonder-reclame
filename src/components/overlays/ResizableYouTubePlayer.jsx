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

  const playerRef = useRef(null);
  const containerRef = useRef(null);

  // YouTube player instance
  const [player, setPlayer] = useState(null);

  // Load YouTube iframe API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube player when visible
  useEffect(() => {
    if (isVisible && window.YT && playerRef.current && !player) {
      const newPlayer = new window.YT.Player(playerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          ...(playlistId ? { list: playlistId, listType: 'playlist' } : {})
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume);
          }
        }
      });
      setPlayer(newPlayer);
    }

    return () => {
      if (player) {
        player.destroy();
        setPlayer(null);
      }
    };
  }, [isVisible]);

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

        {/* Close button */}
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-white transition-colors text-lg font-bold px-2"
          title="Sluiten"
        >
          ✕
        </button>
      </div>

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
        <span className="text-white text-xs">🔊</span>
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
