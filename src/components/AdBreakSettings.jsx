// components/AdBreakSettings.jsx - Show current ad break countdown instead of next break countdown
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\components\AdBreakSettings.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import TimeRangeSlider from './TimeRangeSlider';
import { setupTestDetection, cleanupTestDetection } from '../utils/musicDetection.js';

const defaultDaySettings = () => ({
  enabled: false,
  startHour: 7,
  endHour: 22
});

const dayLabels = ['M', 'D', 'W', 'D', 'V', 'Z', 'Z'];
const dayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

const getInitialDaySettings = () => {
  try {
    const saved = localStorage.getItem('adbreak_day_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 7) {
        // Validate each day setting has required properties
        const validSettings = parsed.every(day =>
          typeof day === 'object' &&
          typeof day.enabled === 'boolean' &&
          typeof day.startHour === 'number' &&
          typeof day.endHour === 'number'
        );
        if (validSettings) return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load day settings:', error);
  }

  // Return default settings if loading failed
  return Array(7).fill(0).map(() => ({
    enabled: false,
    startHour: 7,
    endHour: 22
  }));
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
  audioPlayer,
  adBreakMode,
  onAdBreakModeChange,
  isManualTestInProgress
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [daySettings, setDaySettings] = useState(getInitialDaySettings());
  const [selectedDay, setSelectedDay] = useState(0); // 0=Monday
  const currentDay = daySettings[selectedDay] || defaultDaySettings();
  const [autoSkipPreroll, setAutoSkipPreroll] = useState(() => {
    try {
      const saved = localStorage.getItem('auto_skip_preroll');
      return saved ? JSON.parse(saved) : false; // Default to disabled (handmatig)
    } catch {
      return false;
    }
  });

  // Automatic ad detection states
  const [autoAdDetection, setAutoAdDetection] = useState(() => {
    try {
      const saved = localStorage.getItem('auto_ad_detection');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  }); const [isTestingDetection, setIsTestingDetection] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('idle'); // idle, listening, processing, error, music, no-music
  const [detectionResult, setDetectionResult] = useState(null);
  const detectorRef = useRef(null);

  // Tooltip visibility states
  const [showAdDetectionTooltip, setShowAdDetectionTooltip] = useState(false);
  const [showPrerollTooltip, setShowPrerollTooltip] = useState(false);

  useEffect(() => {
    // Remove the immediate save - we'll save on drag end instead
    // Commented out to prevent spam during dragging:
    // try {
    //   localStorage.setItem('adbreak_day_settings', JSON.stringify(daySettings));
    //   console.log('Day settings saved:', daySettings);
    // } catch (error) {
    //   console.warn('Failed to save day settings:', error);
    // }
  }, [daySettings]);

  // ✅ NEW: Add debounced save function
  const [saveTimeout, setSaveTimeout] = useState(null);

  const saveDaySettings = useCallback((settings) => {
    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout to save after 500ms of no changes
    const newTimeout = setTimeout(() => {
      try {
        localStorage.setItem('adbreak_day_settings', JSON.stringify(settings));
        // console.log('Day settings saved (debounced):', settings);
      } catch (error) {
        console.warn('Failed to save day settings:', error);
      }
    }, 500);

    setSaveTimeout(newTimeout);
  }, [saveTimeout]);

  // Handlers for per-day settings
  const handleDayClick = (idx) => setSelectedDay(idx);
  const handleTimeRangeEnabled = (checked) => {
    const newSettings = daySettings.map((d, i) => i === selectedDay ? { ...d, enabled: checked } : d);
    setDaySettings(newSettings);
    saveDaySettings(newSettings); // Save immediately for checkbox changes
  };
  const handleTimeRangeChange = (start, end) => {
    const newSettings = daySettings.map((d, i) => i === selectedDay ? { ...d, startHour: start, endHour: end } : d);
    setDaySettings(newSettings);
    saveDaySettings(newSettings); // This will be debounced for slider changes
  };

  // Check if current mode is valid
  const isModeValid = () => {
    if (adBreakMode === 'playlist') {
      return playlistUrl && playlistInfo?.isValid;
    }
    return true; // nonstop and lofi don't require configuration
  };

  const getModeDescription = () => {
    switch (adBreakMode) {
      case 'playlist': return 'Wissel naar afspeellijst';
      case 'nonstop': return 'Wissel naar non-stop radio';
      case 'lofi': return 'Wissel naar Lofi Girl';
      default: return 'Onbekende modus';
    }
  };

  // ✅ ADD THIS: Save to localStorage when autoSkipPreroll changes
  useEffect(() => {
    try {
      localStorage.setItem('auto_skip_preroll', JSON.stringify(autoSkipPreroll));

      // ✅ CRITICAL: Update the AdSkipUtils setting immediately
      if (window.AdSkipUtils) {
        window.AdSkipUtils.setAutoSkipSetting(autoSkipPreroll);
      }

      console.log('🔧 Auto skip setting saved and synced:', autoSkipPreroll ? 'Automatisch' : 'Handmatig');
    } catch (error) {
      console.warn('Failed to save auto skip setting:', error);
    }
  }, [autoSkipPreroll]);

  // ✅ NEW: Save auto ad detection setting
  useEffect(() => {
    try {
      localStorage.setItem('auto_ad_detection', JSON.stringify(autoAdDetection));
      console.log('🔧 Auto ad detection setting saved:', autoAdDetection ? 'Enabled' : 'Disabled');
    } catch (error) {
      console.warn('Failed to save auto ad detection setting:', error);
    }
  }, [autoAdDetection]);

// ...existing code...

// ✅ CRITICAL FIX: Enhanced test detection with PROPER volume preservation
const handleTestDetection = async () => {
  if (isTestingDetection) {
    // ✅ CRITICAL FIX: Clear test flag when stopping
    window.isMusicDetectionTestActive = false;
    
    // Stop test
    console.log('🛑 Stopping ad detection test...');
    
    // ✅ CRITICAL FIX: Store current volume BEFORE stopping detection
    const currentVolume = audioPlayer?.audioRef?.current?.volume || audioPlayer?.volume || 0.7;
    const currentVolumeSlider = audioPlayer?.volume || 0.7; // UI volume
    
    console.log(`🔊 Preserving volume before test cleanup: Audio=${Math.round(currentVolume * 100)}%, UI=${Math.round(currentVolumeSlider * 100)}%`);
    
    setIsTestingDetection(false);
    setDetectionStatus('idle');
    setDetectionResult(null);

    if (detectorRef.current) {
      detectorRef.current.stopDetection();
      detectorRef.current = null;
    }

    // ✅ CRITICAL FIX: FORCE volume restoration with multiple approaches
    setTimeout(() => {
      if (audioPlayer?.audioRef?.current) {
        const audio = audioPlayer.audioRef.current;
        
        // ✅ APPROACH 1: Restore audio element volume
        console.log(`🔊 Force restoring audio element volume to ${Math.round(currentVolumeSlider * 100)}%`);
        audio.volume = currentVolumeSlider;
        
        // ✅ APPROACH 2: Update the useAudioPlayer's volume state
        if (audioPlayer.setVolume) {
          console.log(`🔊 Force updating UI volume state to ${Math.round(currentVolumeSlider * 100)}%`);
          audioPlayer.setVolume(currentVolumeSlider);
        }
        
        // ✅ APPROACH 3: Ensure volume refs are synced
        if (audioPlayer.volumeRef) {
          audioPlayer.volumeRef.current = currentVolumeSlider;
        }
        
        // ✅ APPROACH 4: Double-check and force correction
        setTimeout(() => {
          const actualVolume = audio.volume;
          const uiVolume = audioPlayer.volume;
          
          console.log(`🔊 Volume verification: Audio=${Math.round(actualVolume * 100)}%, UI=${Math.round(uiVolume * 100)}%`);
          
          if (Math.abs(actualVolume - uiVolume) > 0.01) {
            console.warn(`🚨 Volume still desynced! Force correcting...`);
            audio.volume = uiVolume;
            
            if (window.addNotification) {
              window.addNotification(`🔊 Volume hersteld naar ${Math.round(uiVolume * 100)}%`, 'info', 2000);
            }
          }
        }, 300);

        // Check if audio should be playing but isn't
        if (audioPlayer.isPlaying && audio.paused && audioPlayer.currentStation) {
          console.log('🔊 Restoring audio playback after detection test');
          audio.play().catch(error => {
            console.warn('Failed to restore audio playback:', error);
          });
        }
      }
    }, 100); // Reduced delay for faster restoration

    return;
  } else {
    // ✅ CRITICAL FIX: Set test flag when starting
    window.isMusicDetectionTestActive = true;
  }

  // Start test
  if (!audioPlayer?.audioRef?.current) {
    console.error('No audio element available for testing');
    if (window.addNotification) {
      window.addNotification('Start eerst radio afspelen', 'error', 3000);
    }
    return;
  }

  // ✅ NEW: Store volume state BEFORE starting test
  const preTestVolume = audioPlayer.volume;
  console.log(`🔊 Storing pre-test volume: ${Math.round(preTestVolume * 100)}%`);

  console.log('🧪 Starting ad detection test...');
  setIsTestingDetection(true);
  setDetectionStatus('initializing');
  setDetectionResult(null);

  try {
    const { setupTestDetection } = await import('../utils/musicDetection');

    const detector = await setupTestDetection(
      audioPlayer.audioRef.current,
      (result) => {
        setDetectionResult(result);
        setDetectionStatus(result.isMusic ? 'music' : 'no-music');
      }
    );

    detectorRef.current = detector;
    setDetectionStatus('listening');

    if (window.addNotification) {
      window.addNotification('🧪 Muziek detectie test gestart', 'info', 2000);
    }

  } catch (error) {
    console.error('Failed to start detection test:', error);
    setIsTestingDetection(false);
    setDetectionStatus('error');

    // ✅ NEW: Restore volume on error too
    if (audioPlayer?.setVolume) {
      audioPlayer.setVolume(preTestVolume);
    }

    if (window.addNotification) {
      window.addNotification('Kon detectie test niet starten: ' + error.message, 'error', 4000);
    }
  }
};

  // ✅ ENHANCED: Cleanup detector on unmount with proper audio restoration
  useEffect(() => {
    return () => {
      window.isMusicDetectionTestActive = false;
      if (detectorRef.current) {
        console.log('🧹 Cleaning up detector on unmount...');
        detectorRef.current.stopDetection();
        detectorRef.current = null;
      }
    };
  }, []);

  // Get status display text and color
  const getStatusDisplay = () => {
    if (!isTestingDetection) {
      return { text: 'Niet actief', color: 'text-gray-400' };
    }

    switch (detectionStatus) {
      case 'listening':
        return { text: 'Luistert...', color: 'text-blue-400' };
      case 'processing':
        return { text: 'Verwerkt...', color: 'text-yellow-400' };
      case 'music':
        return {
          text: `Muziek `,
          color: 'text-green-400'
        };
      case 'no-music':
        return {
          text: `Geen muziek `,
          color: 'text-orange-400'
        };
      case 'error':
        return { text: 'Fout', color: 'text-red-400' };
      default:
        return { text: 'Onbekend', color: 'text-gray-400' };
    }
  };

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
            </div>

            {/* Mode Display */}
            <div className="px-3 py-1.5 rounded-lg text-center text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30">
              {getModeDescription()}
            </div>

            {isTimerRunning && (
              <span className="text-xs text-gray-400">
                Pauzes: {String(adBreakMinute).padStart(2, '0')}:00 ({adBreakDuration}min) & {String(adBreakMinute2).padStart(2, '0')}:00 ({adBreakDuration2}min)
              </span>
            )}
          </div>

          {/* Control Buttons - Always Visible */}
          <div className="flex gap-2">
            <button
              onClick={onManualAdBreak}
              disabled={
                !isModeValid() ||
                (audioPlayer && audioPlayer.isTransitioning) ||
                isManualTestInProgress || // ← Add this new state
                audioPlayer.isOperationInProgress // ← Add this if exposed
              }
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${isManualTestActive
                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                : 'bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
                }`}
              title={
                !isModeValid()
                  ? (adBreakMode === 'playlist' ? 'Voer eerst een geldige playlist in' : 'Modus niet beschikbaar')
                  : (audioPlayer && (audioPlayer.isTransitioning || audioPlayer.isOperationInProgress))
                    ? 'Bezig met audio operatie...'
                    : ''
              }
            >
              {isManualTestActive ? 'Stop Test' : 'Test pauze'}
            </button>
            {!isTimerRunning ? (
              <button
                onClick={onStartTimer}
                disabled={!isModeValid() || (audioPlayer && audioPlayer.isTransitioning)}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
                title={!isModeValid()
                  ? (adBreakMode === 'playlist' ? 'Voer eerst een geldige playlist URL in' : 'Modus niet beschikbaar')
                  : (audioPlayer && audioPlayer.isTransitioning) ? 'Even wachten...' : ''}
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
          <div className="space-y-4">
            {/* Ad Break Mode Selector */}
            <div className="border-b border-gray-600 pb-4">
              <label className="block text-sm font-medium mb-3 mt-2 text-gray-300">
                Reclamepauze Modus:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Playlist Mode */}
                <button
                  onClick={() => onAdBreakModeChange('playlist')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${adBreakMode === 'playlist'
                    ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                    </svg>
                    <span className="font-semibold">Afspeellijst</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Wissel naar YouTube/Spotify afspeellijst tijdens reclame
                  </p>
                </button>

                {/* Nonstop Mode */}
                <button
                  onClick={() => onAdBreakModeChange('nonstop')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${adBreakMode === 'nonstop'
                    ? 'border-green-500 bg-green-600/20 text-green-300'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-.83-.51-1.57-1.24-1.85L12 2 3.24 6.15zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
                    </svg>
                    <span className="font-semibold">Non-stop Radio</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Wissel naar radio zonder reclame (automatisch selectie)
                  </p>
                </button>

                {/* Lofi Mode */}
                <button
                  onClick={() => onAdBreakModeChange('lofi')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${adBreakMode === 'lofi'
                    ? 'border-purple-500 bg-purple-600/20 text-purple-300'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                    <span className="font-semibold">Lofi Girl</span>
                  </div>                  <p className="text-xs text-gray-400">
                    Wissel naar Lofi Girl study streams
                  </p>
                </button>
              </div>
            </div>            {/* Control Buttons and Manual Settings */}
            <div className="border-b border-gray-600 pb-4">
              <div className="flex gap-6 items-start">

                {/* Left side: Experimental settings */}
                <div className="flex pr-4 flex-col mt-0 gap-4 min-w-[250px]">
                  {/* ✅ NEW: Experimental section title */}
                  <div className="mb-0">
                    <span className="text-sm text-gray-300 " >Experimenteel:</span>
                  </div>

                  {/* 1. Automatic Pre-roll Skip */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 flex-1">
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
                          setAutoSkipPreroll(newValue);

                          // Update AdSkipUtils immediately
                          if (window.AdSkipUtils) {
                            window.AdSkipUtils.setAutoSkipSetting(newValue);
                          }

                          console.log('🔧 Auto skip toggled to:', newValue ? 'Automatisch' : 'Handmatig');
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoSkipPreroll
                            ? 'bg-purple-600'
                            : 'bg-gray-600'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoSkipPreroll ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* 2. Automatic Ad Detection */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-sm text-gray-300">Automatisch pauze detecteren</span>
                      <div className="relative">
                        <button
                          onMouseEnter={() => setShowAdDetectionTooltip(true)}
                          onMouseLeave={() => setShowAdDetectionTooltip(false)}
                          className="w-4 h-4 rounded-full bg-blue-600 text-gray-300 text-xs flex items-center justify-center hover:bg-blue-400 transition-colors"
                        >
                          i
                        </button>
                        {showAdDetectionTooltip && (
                          <div className="absolute left-6 top-0 z-50 w-64 p-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg text-xs text-gray-300">
                            Gebruikt AI om beter te detecteren wanneer muziek niet meer speelt, rondom de ingestelde tijdstippen.
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setAutoAdDetection(!autoAdDetection)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoAdDetection
                          ? 'bg-green-600'
                          : 'bg-gray-600'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoAdDetection ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>

                  {/* 3. Music Detection Test */}
                  <div className="ml-0 min-w-[280px]">
                    {/* Test button inline with label */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-gray-300">Muziek Detectie:</span>
                      <button
                        onClick={handleTestDetection}
                        disabled={!audioPlayer?.audioRef?.current || (audioPlayer && audioPlayer.isTransitioning)}
                        className={`px-4 py-1 rounded text-sm font-medium transition-colors ${isTestingDetection
                            ? 'bg-red-600 hover:bg-red-500 text-white'
                            : 'bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white'
                          }`}
                        title={
                          !audioPlayer?.audioRef?.current
                            ? 'Start eerst radio afspelen'
                            : (audioPlayer && audioPlayer.isTransitioning)
                              ? 'Even wachten...'
                              : ''
                        }
                      >
                        {isTestingDetection ? 'Stop' : 'Test'}
                      </button>
                    </div>

                    <div className="">
                      {isTestingDetection && (
                        <div className="p-1 bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-300">Status:</span>
                            <span className={`text-sm font-medium ${getStatusDisplay().color}`}>
                              {getStatusDisplay().text}{detectionResult && '|' + ' Zekerheid: ' + Math.round(detectionResult.confidence * 100) + '%'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: 2x2 grid for manual timing */}
                <div className={`${autoAdDetection ? 'opacity-100' : ''}`}>
                  <div className="mb-2">
                    <span className="text-sm text-gray-300">Pauze Timing:</span>
                  </div>

                  {/* Column headers */}
                  <div className="grid grid-cols-2 gap-1 mb-2 max-w-xs">
                    <span className="text-xs text-gray-400 font-semibold">Op minuten:</span>
                    <span className="text-xs text-gray-400 ml-1 font-semibold">Lengte:</span>
                  </div>
                  
                  {/* 2x2 grid */}
                  <div className="grid grid-cols-2 gap-2 max-w-xs">
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
                      className={`w-full px-2 py-2 border rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm bg-gray-700 border-gray-600`}
                      placeholder="Min 1"
                    />

                    {/* Top right: Duration 1 */}
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
                      className={`w-full px-2 py-2 border rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm bg-gray-700 border-gray-600`}
                      placeholder="Duur 1"
                    />

                    {/* Bottom left: Minute 2 */}
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
                      className={`w-full px-2 py-2 border rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm bg-gray-700 border-gray-600`}
                      placeholder="Min 2"
                    />

                    {/* Bottom right: Duration 2 */}
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
                      className={`w-full px-2 py-2 border rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm bg-gray-700 border-gray-600`}
                    />
                  </div>
                </div>

                {/* ✅ NEW: Right side - Time Range & Day Settings (moved here) */}
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
                      {currentDay.startHour.toFixed(2).replace('.', ':')}h - {currentDay.endHour.toFixed(2).replace('.', ':')}h op {dayNames[selectedDay]}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* ✅ UPDATED: Compact square grid for days */}
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
                      <div className="text-xs text-gray-400 text-center">
                        {dayNames[selectedDay]}
                      </div>
                    </div>

                    {/* ✅ UPDATED: Smaller time range slider (40% of original width) */}
                    <div className="flex-1 max-w-[450px]  ml-6">
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
        )}
      </div>
    </div>
  );
};

export default AdBreakSettings;