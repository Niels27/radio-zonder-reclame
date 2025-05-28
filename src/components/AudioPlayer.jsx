import React from 'react';

const AudioPlayer = ({
  currentStation,
  isPlaying,
  volume,
  onTogglePlayPause,
  onVolumeChange,
  isAdBreakActive,
  nextAdBreakIn,
  currentSource,
  error
}) => {  const formatStationName = () => {
    if (isAdBreakActive) {
      return 'Reclamepauze - Afspeellijst Actief';
    }
    if (currentStation) {
      return currentStation.name;
    }
    return 'Geen zender geselecteerd';
  };

  const handleKeyPress = (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      onTogglePlayPause();
    }
  };

  // Add keyboard event listener
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onTogglePlayPause]);

  return (
    <div className="player-controls">
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlayPause}
          disabled={!currentStation && !isAdBreakActive}
          className="w-12 h-12 rounded-full bg-radio-accent hover:bg-radio-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          title="Druk op spatiebalk om af te spelen/pauzeren"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Station Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="font-medium truncate">{formatStationName()}</h3>
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              {!error && currentStation && !isAdBreakActive && (
                <p className="text-radio-secondary text-sm">
                  {currentStation.description}
                </p>
              )}
            </div>
              {/* Source Indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              {currentSource === 'radio' && (
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.89 2 2 2h16c1.11 0 2-.9 2-2V8c0-1.11-.89-2-2-2H8.3l8.26-3.34L15.88 1 3.24 6.15zM7 20c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-8h-2v-2h-2v2H4V8h16v4z"/>
                  </svg>
                  <span>Radio</span>
                </span>
              )}
              {currentSource === 'playlist' && (
                <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                  </svg>
                  <span>Afspeellijst</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">        {/* Ad Break Status */}
        {isAdBreakActive ? (
          <div className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
            </svg>
            <span>Reclamepauze Actief</span>
          </div>
        ) : (
          nextAdBreakIn && (
            <div className="hidden sm:flex items-center space-x-2 text-radio-secondary text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              <span>Volgende reclamepauze:</span>
              <span className="font-mono text-white bg-gray-700 px-2 py-1 rounded">{nextAdBreakIn}</span>
            </div>
          )
        )}

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-radio-secondary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
          />
          <span className="text-radio-secondary text-sm w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
