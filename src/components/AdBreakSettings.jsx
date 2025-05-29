// components/AdBreakSettings.jsx - Show current ad break countdown instead of next break countdown
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\components\AdBreakSettings.jsx

import React, { useState } from 'react';

const AdBreakSettings = ({
  adBreakMinute,
  adBreakMinute2,
  adBreakDuration,
  isTimerRunning,
  onMinuteChange,
  onMinute2Change,
  onDurationChange,
  onStartTimer,
  onStopTimer,
  onManualAdBreak,
  isAdBreakActive,
  playlistUrl,
  playlistInfo,
  nextAdBreakIn, // Add this prop for countdown
  currentAdBreakTimeLeft // New prop for current ad break time left
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if playlist is valid
  const isPlaylistValid = playlistUrl && playlistInfo?.isValid;

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with always-visible status and controls */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-xl font-semibold text-white hover:text-gray-300 transition-colors"
            >
              <span>Reclamepauze Instellingen</span>
              <svg 
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>

            {/* Timer Status with Countdown - Always Visible */}
            <div className={`px-3 py-1.5 rounded-lg text-center text-sm ${
              isTimerRunning 
                ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
            }`}>
              <div className="flex items-center gap-2">
                <span>{isTimerRunning ? 'Timer Actief' : 'Timer Inactief'}</span>
                {isTimerRunning && (
                  <span className="font-mono text-xs bg-green-700/30 px-1.5 py-0.5 rounded">
                    {currentAdBreakTimeLeft !== null 
                      ? `${Math.floor(currentAdBreakTimeLeft / 60)}:${String(currentAdBreakTimeLeft % 60).padStart(2, '0')}`
                      : nextAdBreakIn
                    }
                  </span>
                )}
              </div>
            </div>

            {isTimerRunning && (
              <span className="text-xs text-gray-400">
                Pauzes: {String(adBreakMinute).padStart(2, '0')}:00 & {String(adBreakMinute2).padStart(2, '0')}:00
              </span>
            )}
          </div>

          {/* Control Buttons - Always Visible */}
          <div className="flex gap-2">
               <button
                onClick={onManualAdBreak}
                disabled={!isPlaylistValid}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  isAdBreakActive 
                    ? 'bg-orange-600 hover:bg-orange-500 text-white' 
                    : 'bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
                }`}
                title={!isPlaylistValid ? 'Voer eerst een geldige playlist in' : ''}
              >
                {isAdBreakActive ? 'Stop Test' : 'Test Pauze'}
              </button>
            {!isTimerRunning ? (
              <button
                onClick={onStartTimer}
                disabled={!isPlaylistValid}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
                title={!isPlaylistValid ? 'Voer eerst een geldige YouTube playlist URL in' : ''}
              >
                Activeren
              </button>
            ) : (
              <button
                onClick={onStopTimer}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Deactiveren
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Minute Input Section */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Reclamepauze op minuut:
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={adBreakMinute}
                  onChange={(e) => {
                    let value = parseInt(e.target.value);
                    if (isNaN(value)) value = 0;
                    if (value > 59) value = 59;
                    if (value < 0) value = 0;
                    onMinuteChange(value);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Eerste minuut"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={adBreakMinute2}
                  onChange={(e) => {
                    let value = parseInt(e.target.value);
                    if (isNaN(value)) value = 30;
                    if (value > 59) value = 59;
                    if (value < 0) value = 0;
                    onMinute2Change(value);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Tweede minuut"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Elk uur op deze momenten
              </p>
            </div>

            {/* Duration Input */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Duur pauze (minuten)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={adBreakDuration}
                onChange={(e) => {
                  let value = parseInt(e.target.value);
                  if (isNaN(value)) value = 1;
                  if (value > 30) value = 30;
                  if (value < 1) value = 1;
                  onDurationChange(value);
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                Duur van elke pauze
              </p>
            </div>

          
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBreakSettings;