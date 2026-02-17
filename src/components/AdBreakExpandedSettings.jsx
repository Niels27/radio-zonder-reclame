// components/AdBreakExpandedSettings.jsx - Expandable settings panel
// Contains: toggle switches, timing inputs, day/time range settings
// Extracted from AdBreakSettings.jsx

import React, { useState, useCallback } from 'react';
import TimeRangeSlider from './TimeRangeSlider';

const dayLabels = ['M', 'D', 'W', 'D', 'V', 'Z', 'Z'];
const dayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

const AdBreakExpandedSettings = ({
  // Toggle settings
  autoSkipPreroll,
  onAutoSkipPrerollChange,
  visualizerEnabled,
  onVisualizerToggle,
  fadeAudioStreams,
  onFadeAudioStreamsChange,
  // Timing settings
  adBreakMinute,
  adBreakMinute2,
  adBreakDuration,
  adBreakDuration2,
  onMinuteChange,
  onMinute2Change,
  onDurationChange,
  onDuration2Change,
  // Day settings
  daySettings,
  onDaySettingsChange,
  selectedDay,
  onSelectedDayChange,
  autoAdDetection
}) => {
  // Tooltip visibility states
  const [showPrerollTooltip, setShowPrerollTooltip] = useState(false);
  const [showVisualizerTooltip, setShowVisualizerTooltip] = useState(false);
  const [showFadeTooltip, setShowFadeTooltip] = useState(false);

  const currentDay = daySettings[selectedDay] || { enabled: false, startHour: 7, endHour: 22 };

  // Debounced save for day settings
  const [saveTimeout, setSaveTimeout] = useState(null);
  const saveDaySettings = useCallback((settings) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    const newTimeout = setTimeout(() => {
      try {
        localStorage.setItem('adbreak_day_settings', JSON.stringify(settings));
      } catch (error) {
        console.warn('Failed to save day settings:', error);
      }
    }, 500);
    setSaveTimeout(newTimeout);
  }, [saveTimeout]);

  const handleDayClick = (idx) => onSelectedDayChange(idx);

  const handleTimeRangeEnabled = (checked) => {
    const newSettings = daySettings.map((d, i) => i === selectedDay ? { ...d, enabled: checked } : d);
    onDaySettingsChange(newSettings);
    saveDaySettings(newSettings);
  };

  const handleTimeRangeChange = (start, end) => {
    const newSettings = daySettings.map((d, i) => i === selectedDay ? { ...d, startHour: start, endHour: end } : d);
    onDaySettingsChange(newSettings);
    saveDaySettings(newSettings);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="border-b border-gray-600 pb-4">
        <div className="flex gap-6 items-start">
          {/* Left side: Toggle settings */}
          <div className="flex pr-4 flex-col -mt-4 gap-4 min-w-[250px]">
            <div className="mb-0"></div>

            {/* Automatic Pre-roll Skip */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap- flex-1">
                  <span className="text-sm text-gray-300">Automatisch pre-roll overslaan</span>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowPrerollTooltip(true)}
                      onMouseLeave={() => setShowPrerollTooltip(false)}
                      className="w-4 h-4 rounded-full bg-blue-600 text-gray-300 text-xs flex items-center justify-center hover:bg-blue-400 transition-colors"
                    >
                      i
                    </button>
                    {showPrerollTooltip && (
                      <div className="absolute left-6 top-0 z-50 w-72 p-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg text-xs text-gray-300">
                        Handmatig/automatisch klikken op 'Skip pre-roll reclame' knop. Kan bufferen als er geen pre-roll reclame is.
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newValue = !autoSkipPreroll;
                    onAutoSkipPrerollChange(newValue);
                    if (window.AdSkipUtils) {
                      window.AdSkipUtils.setAutoSkipSetting(newValue);
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoSkipPreroll ? 'bg-purple-600' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoSkipPreroll ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Visualizer Toggle */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-sm text-gray-300">Visualizer</span>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowVisualizerTooltip(true)}
                      onMouseLeave={() => setShowVisualizerTooltip(false)}
                      className="w-4 h-4 rounded-full bg-blue-600 text-gray-300 text-xs flex items-center justify-center hover:bg-blue-400 transition-colors"
                    >
                      i
                    </button>
                    {showVisualizerTooltip && (
                      <div className="absolute left-6 top-0 z-50 w-72 p-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg text-xs text-gray-300">
                        Toon muziek visualizer in header/footer voor radio audio. Gebruikt alternatieve visualizer voor playlist audio.
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onVisualizerToggle(!visualizerEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${visualizerEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${visualizerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Fade audio streams Toggle */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-sm text-gray-300">Fade audio streams</span>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowFadeTooltip(true)}
                      onMouseLeave={() => setShowFadeTooltip(false)}
                      className="w-4 h-4 rounded-full bg-blue-600 text-gray-300 text-xs flex items-center justify-center hover:bg-blue-400 transition-colors"
                    >
                      i
                    </button>
                    {showFadeTooltip && (
                      <div className="absolute left-6 top-0 z-50 w-72 p-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg text-xs text-gray-300">
                        Schakel vloeiende overgangen in tussen audio streams door meerdere streams tegelijk af te spelen en ze in/uit te faden. Zorgt voor naadloze overgangen zonder stilte.
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onFadeAudioStreamsChange(!fadeAudioStreams)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${fadeAudioStreams ? 'bg-purple-600' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${fadeAudioStreams ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Middle: 2x2 grid for manual timing */}
          <div className={`${autoAdDetection ? 'opacity-100' : ''}`}>
            <div className="mb-2">
              <span className="text-sm text-gray-300">Pauze Timing:</span>
            </div>
            <div className="grid grid-cols-2 gap-1 mb-2 max-w-xs">
              <span className="text-xs text-gray-400 font-semibold">Op minuten:</span>
              <span className="text-xs text-gray-400 ml-1 font-semibold">Lengte:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-xs">
              <input type="number" min="0" max="59" value={adBreakMinute}
                onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v)) v = 25; onMinuteChange(Math.max(0, Math.min(59, v))); }}
                className="w-full px-2 py-2 border rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm bg-gray-700 border-gray-600"
                placeholder="Min 1" />
              <input type="number" min="1" max="30" value={adBreakDuration}
                onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v)) v = 5; onDurationChange(Math.max(1, Math.min(30, v))); }}
                className="w-full px-2 py-2 border rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm bg-gray-700 border-gray-600"
                placeholder="Duur 1" />
              <input type="number" min="0" max="59" value={adBreakMinute2}
                onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v)) v = 55; onMinute2Change(Math.max(0, Math.min(59, v))); }}
                className="w-full px-2 py-2 border rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm bg-gray-700 border-gray-600"
                placeholder="Min 2" />
              <input type="number" min="1" max="30" value={adBreakDuration2}
                onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v)) v = 7; onDuration2Change(Math.max(1, Math.min(30, v))); }}
                className="w-full px-2 py-2 border rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm bg-gray-700 border-gray-600" />
            </div>
          </div>

          {/* Right side: Time Range & Day Settings */}
          <div className="flex-1 ml-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="timeRangeEnabled"
                checked={currentDay.enabled}
                onChange={(e) => handleTimeRangeEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="timeRangeEnabled" className="text-sm font-medium text-gray-300">
                Activeer tussen:
              </label>
              <span className="text-xs text-gray-400">
                {Math.floor(currentDay.startHour).toString().padStart(2, '0')}:{Math.round((currentDay.startHour % 1) * 60).toString().padStart(2, '0')} - {Math.floor(currentDay.endHour).toString().padStart(2, '0')}:{Math.round((currentDay.endHour % 1) * 60).toString().padStart(2, '0')} op {dayNames[selectedDay]}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="grid grid-cols-3 gap-1 mb-2 w-24">
                  {dayLabels.map((label, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDayClick(idx)}
                      className={`w-7 h-7 rounded text-xs font-medium transition-colors ${selectedDay === idx
                        ? 'bg-blue-600 text-white'
                        : daySettings[idx].enabled
                          ? 'bg-green-600 hover:bg-green-500 text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      }`}
                      title={`${dayNames[idx]} - ${daySettings[idx].enabled ? 'Actief' : 'Inactief'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-400 text-center">{dayNames[selectedDay]}</div>
              </div>

              <div className="flex-1 max-w-[450px] ml-6">
                <TimeRangeSlider
                  startHour={currentDay.startHour}
                  endHour={currentDay.endHour}
                  onChange={handleTimeRangeChange}
                  disabled={!currentDay.enabled}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBreakExpandedSettings;
