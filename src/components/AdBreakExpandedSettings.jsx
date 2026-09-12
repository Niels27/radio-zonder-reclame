// components/AdBreakExpandedSettings.jsx - Compact settings panel
// Contains: pre-roll toggle + pause timing inputs + timer controls in a single row

const AdBreakExpandedSettings = ({
  // Toggle settings
  autoSkipPreroll,
  onAutoSkipPrerollChange,
  /* visualizerEnabled, onVisualizerToggle, */       // commented out - hidden from UI
  /* fadeAudioStreams, onFadeAudioStreamsChange, */    // commented out - hidden from UI
  // Timing settings
  adBreakMinute,
  adBreakMinute2,
  adBreakDuration,
  adBreakDuration2,
  onMinuteChange,
  onMinute2Change,
  onDurationChange,
  onDuration2Change,
  // Timer controls
  isTimerRunning,
  isAdBreakActive,
  onStartTimer,
  onStopTimer,
  timerDisabled,
  timerStarting,
}) => {
  // Shared styling for the 4 timing inputs. `[color-scheme:dark]` tells the
  // browser to paint the native number spin buttons with dark-appropriate
  // colors instead of its default stark white, which otherwise clashes with
  // the dark panel around it.
  const numberInputClass =
    "w-14 px-1.5 py-1 border rounded text-white focus:border-blue-500 focus:outline-none text-sm bg-gray-700 border-gray-600 text-center [color-scheme:dark]";

  return (
    <div className="px-4 py-3 border-t border-gray-700">
      <div className="flex items-center gap-8 flex-wrap">
        {/* Pre-roll skip toggle */}
        <div className="flex items-center gap-2">
          <span
            className="text-sm text-gray-300 cursor-help"
            title="Handmatig/automatisch klikken op 'Skip pre-roll reclame' knop. Kan bufferen als er geen pre-roll reclame is."
          >
            Skip pre-roll reclame
          </span>
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

        {/* Separator */}
        <div className="h-8 w-px bg-gray-600" />

        {/* Pause timing - compact inline */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">Pauze timing:</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">min</span>
            <input type="number" min="0" max="59" value={adBreakMinute}
              onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v)) v = 25; onMinuteChange(Math.max(0, Math.min(59, v))); }}
              className={numberInputClass}
            />
            <span className="text-xs text-gray-500">len</span>
            <input type="number" min="1" max="30" value={adBreakDuration}
              onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v)) v = 5; onDurationChange(Math.max(1, Math.min(30, v))); }}
              className={numberInputClass}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">min</span>
            <input type="number" min="0" max="59" value={adBreakMinute2}
              onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v)) v = 55; onMinute2Change(Math.max(0, Math.min(59, v))); }}
              className={numberInputClass}
            />
            <span className="text-xs text-gray-500">len</span>
            <input type="number" min="1" max="30" value={adBreakDuration2}
              onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v)) v = 7; onDuration2Change(Math.max(1, Math.min(30, v))); }}
              className={numberInputClass}
            />
          </div>
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-gray-600" />

        {/* Timer controls */}
        <div className="flex items-center gap-2">
          {!isTimerRunning ? (
            <button
              onClick={onStartTimer}
              disabled={timerDisabled || timerStarting}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${
                timerDisabled || timerStarting
                  ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
            >
              {timerStarting ? 'Starten...' : 'Activeer Switching'}
            </button>
          ) : (
            <button
              onClick={onStopTimer}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Deactiveer Switching
            </button>
          )}
          <div className="flex items-center gap-2">
            {!isTimerRunning ? (
              // Off - plain dot, no animation
              <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
            ) : isAdBreakActive ? (
              // Ad break ongoing - mini equalizer, bars bouncing out of sync
              <div className="flex items-end gap-0.5 h-3" aria-hidden="true">
                {[0, 0.15, 0.3].map((delay) => (
                  <span
                    key={delay}
                    className="w-0.5 h-full bg-ad-break rounded-full origin-bottom"
                    style={{ animation: `eq-bounce 0.7s ease-in-out ${delay}s infinite` }}
                  />
                ))}
              </div>
            ) : (
              // Armed and waiting - breathing glow ring
              <div
                className="w-2.5 h-2.5 rounded-full bg-green-500"
                style={{ animation: 'pulse-green 2s ease-in-out infinite' }}
              />
            )}
            <span className="text-xs text-gray-400">
              {isTimerRunning
                ? isAdBreakActive
                  ? 'Reclame actief'
                  : 'Timer actief'
                : 'Timer uit'}
            </span>
          </div>
        </div>

        {/* Visualizer toggle - commented out
        <div className="h-8 w-px bg-gray-600" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Visualizer</span>
          <button
            onClick={() => onVisualizerToggle(!visualizerEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${visualizerEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${visualizerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        */}

        {/* Fade audio streams toggle - commented out
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Fade audio</span>
          <button
            onClick={() => onFadeAudioStreamsChange(!fadeAudioStreams)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${fadeAudioStreams ? 'bg-purple-600' : 'bg-gray-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${fadeAudioStreams ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        */}
      </div>
    </div>
  );
};

export default AdBreakExpandedSettings;
