import React, { useEffect, useState } from 'react';
import ReportStationButton from './ReportStationButton';

// components/AudioPlayer.jsx - Show playlist thumbnail and info
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\components\AudioPlayer.jsx
const AudioPlayer = ({
  currentStation,
  isPlaying,
  volume,
  onTogglePlayPause,
  onVolumeChange,
  isAdBreakActive,
  nextAdBreakIn,
  currentSource,
  error,
  playlistShuffle,
  onToggleShuffle,
  onNextTrack,
  playlistInfo,
  queuedStation,
  onCancelQueuedSwitch
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

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
      const restoreVolume = previousVolume > 0 ? previousVolume : 0.7;
      onVolumeChange(restoreVolume);
      setIsMuted(false);
    } else {
      // Mute - save current volume and set to 0
      setPreviousVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  const handleVolumeSliderChange = (newVolume) => {
    onVolumeChange(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
    if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
  };

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
      onTogglePlayPause();
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onTogglePlayPause]);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" opacity="0.3"/>
          {/* Strike through line */}
          <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    } else if (volume < 0.5) {
      return (
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      );
    }
  };

  // Add validation check
  const isPlaylistValid = playlistInfo?.isValid;

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">

          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlayPause}
            disabled={!currentStation && !isAdBreakActive}
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
                        <span>Afspeellijst</span>
                        {playlistInfo?.videoCount && (
                          <span className="text-gray-300">({playlistInfo.videoCount})</span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Queued Station Display */}
                  {queuedStation && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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

            {/* Playlist Controls (only show when playlist is active AND valid) */}
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

            {/* Ad Break Status */}
            {isAdBreakActive ? (
              <div className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                </svg>
                <span>Reclamepauze Actief</span>
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

            {/* Volume Control */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleVolumeIconClick}
                className="hover:text-white transition-colors"
                title={isMuted ? 'Geluid aanzetten' : 'Geluid uitzetten'}
              >
                {getVolumeIcon()}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeSliderChange(parseFloat(e.target.value))}
                className="volume-slider w-24"
              />
            </div>
          </div>
        </div>        {/* Error Message */}
        {error && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-red-300 text-sm">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              {/* Show report button for any radio connection errors */}
              {currentStation && currentSource === 'radio' && (
                <ReportStationButton 
                  station={currentStation}
                  errorDetails={{
                    message: error,
                    timestamp: new Date().toISOString(),
                    source: 'audio_player',
                    userAgent: navigator.userAgent
                  }}
                  onReported={(result) => {
                    console.log('Station reported from AudioPlayer:', result);
                    // Could show a toast notification here
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