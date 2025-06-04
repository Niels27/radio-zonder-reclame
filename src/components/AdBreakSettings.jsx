// components/AdBreakSettings.jsx - Show current ad break countdown instead of next break countdown
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\components\AdBreakSettings.jsx

import React, { useState, useEffect } from 'react';
import TimeRangeSlider from './TimeRangeSlider';

const defaultDaySettings = () => ({
  enabled: false,
  startHour: 7,
  endHour: 22
});

const dayLabels = ['M', 'D', 'W', 'D', 'V', 'Z', 'Z'];
const dayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

const getInitialDaySettings = () => {
  const saved = localStorage.getItem('adbreak_day_settings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 7) return parsed;
    } catch {}
  }
  return Array(7).fill(0).map(defaultDaySettings);
};

const AdBreakSettings = ({
  adBreakMinute,
  adBreakMinute2,
  adBreakDuration,
  adBreakDuration2,
  isTimerRunning,
  onMinuteChange,
  onMinute2Change,
  onDurationChange,
  onDuration2Change,
  onStartTimer,
  onStopTimer,
  onManualAdBreak,
  isAdBreakActive,
  playlistUrl,
  playlistInfo,
  nextAdBreakIn,
  currentAdBreakTimeLeft,
  isManualTestActive,
  audioPlayer
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [daySettings, setDaySettings] = useState(getInitialDaySettings());
  const [selectedDay, setSelectedDay] = useState(0); // 0=Monday

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('adbreak_day_settings', JSON.stringify(daySettings));
  }, [daySettings]);

  // Handlers for per-day settings
  const handleDayClick = (idx) => setSelectedDay(idx);
  const handleTimeRangeEnabled = (checked) => {
    setDaySettings(ds => ds.map((d, i) => i === selectedDay ? { ...d, enabled: checked } : d));
  };
  const handleTimeRangeChange = (start, end) => {
    setDaySettings(ds => ds.map((d, i) => i === selectedDay ? { ...d, startHour: start, endHour: end } : d));
  };

  // Check if playlist is valid
  const isPlaylistValid = playlistUrl && playlistInfo?.isValid;
  const currentDay = daySettings[selectedDay];

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
              <span>Instellingen</span>
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            {/* Timer Status with Countdown - Always Visible */}
            <div className={`px-3 py-1.5 rounded-lg text-center text-sm ${isTimerRunning
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
            </div>            {isTimerRunning && (
              <span className="text-xs text-gray-400">
                Pauzes: {String(adBreakMinute).padStart(2, '0')}:00 ({adBreakDuration}min) & {String(adBreakMinute2).padStart(2, '0')}:00 ({adBreakDuration2}min)
              </span>
            )}
          </div>

          {/* Control Buttons - Always Visible */}
          <div className="flex gap-2">
            <button
              onClick={onManualAdBreak}
              disabled={!isPlaylistValid || (audioPlayer && audioPlayer.isTransitioning)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${isManualTestActive
                  ? 'bg-orange-600 hover:bg-orange-500 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
                }`}
              title={!isPlaylistValid ? 'Voer eerst een geldige playlist in' : (audioPlayer && audioPlayer.isTransitioning) ? 'Even wachten...' : ''}
            >
              {isManualTestActive ? 'Stop Test' : 'Test Playlist'}
            </button>
            {!isTimerRunning ? (
              <button
                onClick={onStartTimer}
                disabled={!isPlaylistValid || (audioPlayer && audioPlayer.isTransitioning)}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
                title={!isPlaylistValid ? 'Voer eerst een geldige YouTube playlist URL in' : (audioPlayer && audioPlayer.isTransitioning) ? 'Even wachten...' : ''}
              >
                Activeren
              </button>
            ) : (
              <button
                onClick={onStopTimer}
                disabled={audioPlayer && audioPlayer.isTransitioning}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
                title={(audioPlayer && audioPlayer.isTransitioning) ? 'Even wachten...' : ''}
              >
                Deactiveren
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="flex flex-col md:flex-row gap-1 items-start">
            {/* Minute Input Section - now 2x2 grid and left-aligned */}
            <div className="flex flex-col w-full md:w-1/3 max-w-xs">
              {/* --- Column headers above grid --- */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <span className="text-xs mt-3 text-gray-400  font-semibold text-left">Pauzes op minuten:</span>
                <span className="text-xs mt-3  text-gray-400 font-semibold text-left">Lengte pauzes:</span>
              </div>
              {/* --- 2x2 grid with swapped fields --- */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {/* Top left: Minute 1 */}
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={adBreakMinute}
                  onChange={(e) => {
                    let value = parseInt(e.target.value);
                    if (isNaN(value)) value = 25;
                    if (value > 59) value = 59;
                    if (value < 0) value = 0;
                    onMinuteChange(value);
                  }}
                  className="w-full px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Minuut 1"
                />
                {/* Top right: Duration 2 (SWAPPED with bottom left) */}
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={adBreakDuration2}
                  onChange={(e) => {
                    let value = parseInt(e.target.value);
                    if (isNaN(value)) value = 7;
                    if (value > 30) value = 30;
                    if (value < 1) value = 1;
                    onDuration2Change(value);
                  }}
                  className="w-full px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Duur 2 (min)"
                />
                {/* Bottom left: Minute 2 (SWAPPED with top right) */}
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={adBreakMinute2}
                  onChange={(e) => {
                    let value = parseInt(e.target.value);
                    if (isNaN(value)) value = 55;
                    if (value > 59) value = 59;
                    if (value < 0) value = 0;
                    onMinute2Change(value);
                  }}
                  className="w-full px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Minuut 2"
                />
                {/* Bottom right: Duration 1 */}
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={adBreakDuration}
                  onChange={(e) => {
                    let value = parseInt(e.target.value);
                    if (isNaN(value)) value = 5;
                    if (value > 30) value = 30;
                    if (value < 1) value = 1;
                    onDurationChange(value);
                  }}
                  className="w-full px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Duur 1 (min)"
                />
              </div>
            </div>
            {/* --- Playtime slider and day grid --- */}
            <div className="flex-1 flex flex-col md:flex-row items-right justify-center w-full md:w-[60%] max-w-2xl gap-4">
              <div className="flex flex-col items-center w-full md:w-[60%]">
                {/* --- Time range enable toggle for selected day --- */}
                <div className="flex items-center gap-2 mb-6">
                  <input
                    type="checkbox"
                    id="enableTimeRange"
                    checked={!!currentDay.enabled}
                    onChange={e => handleTimeRangeEnabled(e.target.checked)}
                    className="accent-radio-accent w-4 h-4"
                  />
                  <label htmlFor="enableTimeRange" className="text-xs text-gray-400 cursor-pointer select-none">
                    Activeer tussen:
                  </label>
                </div>
                {/* --- TimeRangeSlider for selected day --- */}
                <TimeRangeSlider
                  startHour={currentDay.startHour}
                  endHour={currentDay.endHour}
                  onChange={handleTimeRangeChange}
                  step={0.5}
                  editable={true}
                  disabled={!currentDay.enabled}
                />
              </div>
              {/* --- Minimalistic day-of-week grid --- */}
              <div className="flex flex-col items-right mt-5 ml-7">
                <span className="text-xs text-gray-400 mb-2">Dagen:</span>
                <div className="grid grid-cols-3 gap-1">
                  {dayLabels.map((label, idx) => (
                    <button
                      key={label+idx}
                      onClick={() => handleDayClick(idx)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                        ${selectedDay === idx ? 'bg-radio-accent text-white' : 'bg-gray-700 text-gray-400 border border-gray-600'}`}
                      title={dayNames[idx]}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-400 mt-2 block">{dayNames[selectedDay]}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBreakSettings;