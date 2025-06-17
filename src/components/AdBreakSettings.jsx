// components/AdBreakSettings.jsx - Show current ad break countdown instead of next break countdown
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\components\AdBreakSettings.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import TimeRangeSlider from './TimeRangeSlider';
import PlaylistProviderSelector from './PlaylistProviderSelector';
import VisualizerSettings from './VisualizerSettings';
import { setupTestDetection, cleanupTestDetection } from '../utils/musicDetection.js';
import { allRadioStations } from '../data/allRadioStations.js';
import { refreshNonstopStations, getRandomNonstopStation } from '../utils/nonstopUtils.js';
import { getFirebaseDemoMode } from '../utils/firebase.js';

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
  isManualTestInProgress,
  autoAdDetectionEnabled,
  onAutoAdDetectionChange,
  useCommunityTimings,
  onUseCommunityTimingsChange,
  // ✅ NEW: Additional props for playlist controls
  playlistProvider,
  onProviderChange,
  onPlaylistUrlChange,
  playlistShuffle, onShuffleChange, isValidatingPlaylist,
  isPlaylistInputHovered,  setIsPlaylistInputHovered,  // ✅ NEW: Visualizer props
  visualizerEnabled,
  onVisualizerToggle,
  visualizerType,
  onVisualizerTypeChange,
  visualizerBlur,
  onVisualizerBlurChange

}) => {
  // ✅ INSTANT STATE TRACKING: Prevent double-clicking between timer and manual modes
  const [isTimerStarting, setIsTimerStarting] = useState(false);
  
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
  // Overlay states
  const [showNonstopSettings, setShowNonstopSettings] = useState(false);
  const [showLofiSettings, setShowLofiSettings] = useState(false);
  const [showVisualizerSettings, setShowVisualizerSettings] = useState(false);

  // Nonstop radio custom settings
  const [customNonstopStations, setCustomNonstopStations] = useState(() => {
    try {
      const saved = localStorage.getItem('custom_nonstop_stations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Lofi custom URL setting
  const [customLofiUrl, setCustomLofiUrl] = useState(() => {
    try {
      const saved = localStorage.getItem('custom_lofi_url');
      return saved || '';
    } catch {
      return '';
    }
  });  // Search state for nonstop overlay
  const [nonstopSearchTerm, setNonstopSearchTerm] = useState('');
  // Error message for nonstop removal
  const [nonstopRemovalError, setNonstopRemovalError] = useState('');  // ✅ CLEANED: Removed old state variables to prevent conflicts
  // Old: isPlaylistModeActive, isManualModeActive, manualModeType
  // These have been replaced with the new system below

  // Note: useCommunityTimings is now coming from props instead of local state

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

  // Get all available radio stations for search
  const getAllRadioStations = () => {
    const allStations = [];
    Object.entries(allRadioStations).forEach(([category, stations]) => {
      if (category !== 'realnonstop') { // Exclude realnonstop from search since they're defaults
        Object.values(stations).forEach(station => {
          allStations.push({
            ...station,
            category
          });
        });
      }
    });
    return allStations;
  };
  // Get default nonstop stations from realnonstop category
  const getDefaultNonstopStations = () => {
    const removedDefaults = JSON.parse(localStorage.getItem('removed_default_stations') || '[]');
    return Object.values(allRadioStations.realnonstop || {})
      .filter(station => !removedDefaults.includes(station.name));
  };

  // Get combined list of all configured nonstop stations
  const getAllConfiguredNonstopStations = () => {
    const defaultStations = getDefaultNonstopStations();
    const customStations = [];

    // Find custom stations from the allRadioStations data
    customNonstopStations.forEach(stationName => {
      let foundStation = null;

      // Search through all categories to find the station
      Object.entries(allRadioStations).forEach(([category, stations]) => {
        if (category !== 'realnonstop') {
          Object.values(stations).forEach(station => {
            if (station.name === stationName) {
              foundStation = { ...station, isCustom: true };
            }
          });
        }
      });

      if (foundStation) {
        customStations.push(foundStation);
      }
    });

    // Mark default stations and combine
    const defaultWithFlag = defaultStations.map(station => ({ ...station, isDefault: true }));
    return [...defaultWithFlag, ...customStations];
  };

  // Filter stations based on search term
  const getFilteredStations = () => {
    if (!nonstopSearchTerm.trim()) return [];

    const allStations = getAllRadioStations();
    return allStations.filter(station =>
      station.name.toLowerCase().includes(nonstopSearchTerm.toLowerCase()) ||
      station.description?.toLowerCase().includes(nonstopSearchTerm.toLowerCase())
    ).slice(0, 20); // Limit to 20 results
  };

  // Add station to custom nonstop list
  const addNonstopStation = (stationName) => {
    if (!customNonstopStations.includes(stationName)) {
      setCustomNonstopStations([...customNonstopStations, stationName]);
    }
  };  // Remove station from nonstop list
  const removeNonstopStation = (stationName) => {
    const defaultStations = getDefaultNonstopStations();
    const totalStations = defaultStations.length + customNonstopStations.length;

    // Check if this is a default station
    const isDefaultStation = defaultStations.some(station => station.name === stationName);

    if (isDefaultStation) {
      // For default stations, only remove if we have more than 1 total active station
      if (totalStations <= 1) {
        setNonstopRemovalError('Er moet minstens 1 radio zijn ingesteld');
        setTimeout(() => setNonstopRemovalError(''), 3000);
        return;
      }

      // Actually remove the default station by adding it to a "removed defaults" list
      const removedDefaults = JSON.parse(localStorage.getItem('removed_default_stations') || '[]');
      if (!removedDefaults.includes(stationName)) {
        removedDefaults.push(stationName);
        localStorage.setItem('removed_default_stations', JSON.stringify(removedDefaults));
      }

      // ✅ ADD: Force component re-render by updating a state that's used in the list
      // We can trigger a re-render by updating customNonstopStations with the same value
      setCustomNonstopStations([...customNonstopStations]);

      console.log('✅ Removed default station:', stationName);

      if (window.addNotification) {
        window.addNotification(`🚫 Standaard station weggehaald: ${stationName}`, 'info', 3000);
      }
    } else {
      // For custom stations, only remove if we have more than 1 total active station  
      if (totalStations <= 1) {
        setNonstopRemovalError('Er moet minstens 1 radio zijn ingesteld');
        setTimeout(() => setNonstopRemovalError(''), 3000);
        return;
      }
      setCustomNonstopStations(customNonstopStations.filter(name => name !== stationName));

      if (window.addNotification) {
        window.addNotification(`🗑️ Custom station verwijderd: ${stationName}`, 'info', 3000);
      }
    }

    // Clear any existing error
    setNonstopRemovalError('');
  };

  // Validate YouTube URL
  const isValidYouTubeUrl = (url) => {
    if (!url) return true; // Empty is valid (uses default)
    const regex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    return regex.test(url);
  };

  // Test individual station
  const testStation = (station) => {
    if (audioPlayer && audioPlayer.playRadio) {
      audioPlayer.playRadio(station);
      if (window.addNotification) {
        window.addNotification(`🔄 Test: ${station.name}`, 'info', 3000);
      }
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
  // Save custom nonstop stations
  useEffect(() => {
    try {
      localStorage.setItem('custom_nonstop_stations', JSON.stringify(customNonstopStations));
      // Refresh the nonstop stations when settings change
      refreshNonstopStations();
    } catch (error) {
      console.warn('Failed to save custom nonstop stations:', error);
    }
  }, [customNonstopStations]);  // ✅ ISOLATED: Separate state for each manual mode to prevent race conditions
  const [playlistModeState, setPlaylistModeState] = useState({
    active: false,
    loading: false,
    startTime: null
  });
  const [nonstopModeState, setNonstopModeState] = useState({
    active: false,
    loading: false,
    startTime: null
  });
  const [lofiModeState, setLofiModeState] = useState({
    active: false,
    loading: false,
    startTime: null
  });

  // Track which mode is currently selected for display purposes
  const [selectedManualMode, setSelectedManualMode] = useState(null);

  // Helper to get current mode state
  const getModeState = (mode) => {
    switch (mode) {
      case 'playlist': return playlistModeState;
      case 'nonstop': return nonstopModeState;
      case 'lofi': return lofiModeState;
      default: return { active: false, loading: false, startTime: null };
    }
  };

  // Helper to set mode state
  const setModeState = (mode, newState) => {
    switch (mode) {
      case 'playlist': 
        setPlaylistModeState(prev => ({ ...prev, ...newState }));
        break;
      case 'nonstop': 
        setNonstopModeState(prev => ({ ...prev, ...newState }));
        break;
      case 'lofi': 
        setLofiModeState(prev => ({ ...prev, ...newState }));
        break;
    }
  };

  // Check if any mode is active
  const isAnyModeActive = () => {
    return playlistModeState.active || nonstopModeState.active || lofiModeState.active;
  };

  // Check if any mode is loading
  const isAnyModeLoading = () => {
    return playlistModeState.loading || nonstopModeState.loading || lofiModeState.loading;
  };
  // Get the currently active mode
  const getActiveMode = () => {
    if (playlistModeState.active) return 'playlist';
    if (nonstopModeState.active) return 'nonstop';
    if (lofiModeState.active) return 'lofi';
    return null;
  };  // ✅ GOLDEN RULE ENFORCEMENT: Stop all manual modes (exposed globally)
  const stopAllManualModes = async () => {
    console.log('🛑 GOLDEN RULE: Stopping ALL active manual modes');
    
    // ✅ CLEAR nonstop mode flag when stopping all modes
    window.isInNonstopMode = false;
    
    const activeModes = [];
    if (playlistModeState.active) activeModes.push('playlist');
    if (nonstopModeState.active) activeModes.push('nonstop');
    if (lofiModeState.active) activeModes.push('lofi');
    
    // ✅ CRITICAL: Also check if the ad break timer is running any of these modes
    if (isAdBreakActive && (adBreakMode === 'playlist' || adBreakMode === 'nonstop' || adBreakMode === 'lofi')) {
      console.log('🛑 GOLDEN RULE: Also stopping active ad break mode:', adBreakMode);
      if (onStopTimer) {
        onStopTimer(); // This will call forceExitAdBreakMode
      }
    }
    
    if (activeModes.length === 0) {
      console.log('🔧 No manual modes active to stop');
      return;
    }
    
    console.log('🛑 Stopping active manual modes:', activeModes);
    
    // Stop all active modes simultaneously
    const stopPromises = activeModes.map(mode => stopSpecificMode(mode));
    await Promise.all(stopPromises);
    
    console.log('✅ All manual modes stopped - enforcing ONE AUDIO STREAM rule');
  };  // ✅ EXPOSE GLOBALLY: Make the function available to other components
  useEffect(() => {
    // ✅ INITIALIZE: Ensure nonstop mode flag is properly initialized
    if (typeof window.isInNonstopMode === 'undefined') {
      window.isInNonstopMode = false;
    }
    
    window.stopAllManualModes = stopAllManualModes;
    return () => {
      delete window.stopAllManualModes;
    };
  }, [stopAllManualModes, isAdBreakActive, adBreakMode, onStopTimer]);  // ✅ ISOLATED: Manual mode toggle with complete mode isolation
  const handleManualModeToggle = async () => {
    const currentModeState = getModeState(adBreakMode);
    
    // Prevent rapid clicking during loading
    if (currentModeState.loading) {
      console.log(`🚫 ${adBreakMode} mode is loading, ignoring click`);
      return;
    }

    if (currentModeState.active) {
      // Stop current mode
      await stopSpecificMode(adBreakMode);
    } else {
      // ✅ INSTANT FIX: Set loading state IMMEDIATELY to prevent double-clicking
      setModeState(adBreakMode, { loading: true });
      
      // ✅ CRITICAL: If switching was active, deactivate it first!
      if (isTimerRunning) {
        console.log('🛑 Timer switching is active - stopping it first before starting manual mode');
        onStopTimer();
        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Start current mode (first stop any other active mode)
      const activeMode = getActiveMode();
      if (activeMode && activeMode !== adBreakMode) {
        console.log(`🔄 Stopping ${activeMode} to start ${adBreakMode}`);
        await stopSpecificMode(activeMode);
        // Brief pause to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      await startSpecificMode(adBreakMode);
    }
  };
  // ✅ ISOLATED: Start a specific mode with complete isolation
  const startSpecificMode = async (mode) => {
    const currentModeState = getModeState(mode);
    
    // Prevent starting if already loading or active
    if (currentModeState.loading || currentModeState.active) {
      console.log(`🚫 ${mode} mode already loading/active, ignoring start request`);
      return;
    }

    try {
      console.log(`🎵 Starting isolated ${mode} mode test`);
      
      // Set loading state immediately for this specific mode
      setModeState(mode, { loading: true });
      
      // ✅ CRITICAL: Stop any audio sources first
      if (audioPlayer?.forceStopAllAudio) {
        audioPlayer.forceStopAllAudio(`starting ${mode} mode`);
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Start the specific mode
      switch (mode) {
        case 'playlist':
          await startIsolatedPlaylistMode();
          break;
        case 'nonstop':
          await startIsolatedNonstopMode();
          break;
        case 'lofi':
          await startIsolatedLofiMode();
          break;
        default:
          throw new Error(`Unknown mode: ${mode}`);
      }

      // Set active state only after successful start
      setModeState(mode, { 
        active: true, 
        loading: false, 
        startTime: Date.now() 
      });
      setSelectedManualMode(mode);

      if (window.addNotification) {
        const modeText = getModeDisplayName(mode);
        window.addNotification(`🎵 ${modeText} Test Gestart (Geïsoleerd)`, 'success', 2000);
      }
    } catch (error) {
      console.error(`Failed to start ${mode} mode:`, error);
      
      // Reset state on error
      setModeState(mode, { active: false, loading: false, startTime: null });
      
      if (window.addNotification) {
        window.addNotification(`❌ Kan ${getModeDisplayName(mode)} test niet starten: ${error.message}`, 'error', 3000);
      }
    }
  };
  // ✅ ISOLATED: Stop a specific mode with complete isolation
  const stopSpecificMode = async (mode) => {
    const currentModeState = getModeState(mode);
    
    if (!currentModeState.active && !currentModeState.loading) {
      console.log(`🚫 ${mode} mode not active, nothing to stop`);
      return;
    }

    try {
      console.log(`🛑 Stopping isolated ${mode} mode test`);
      
      // ✅ CLEAR nonstop mode flag when stopping nonstop mode
      if (mode === 'nonstop') {
        window.isInNonstopMode = false;
      }
      
      // ✅ CRITICAL: Stop all audio sources completely
      if (audioPlayer?.forceStopAllAudio) {
        audioPlayer.forceStopAllAudio(`stopping ${mode} mode`);
      }

      // Special cleanup for lofi mode
      if (mode === 'lofi') {
        try {
          const { closeLofiYouTubeOverlay } = await import('../utils/lofiUtils.js');
          closeLofiYouTubeOverlay();
        } catch (error) {
          console.warn('Could not close lofi overlay:', error);
        }
      }

      // Reset state for this specific mode
      setModeState(mode, { active: false, loading: false, startTime: null });
      
      // Clear selected mode if this was the selected one
      if (selectedManualMode === mode) {
        setSelectedManualMode(null);
      }

      if (window.addNotification) {
        window.addNotification(`🛑 ${getModeDisplayName(mode)} Test Gestopt`, 'info', 2000);
      }
    } catch (error) {
      console.error(`Failed to stop ${mode} mode:`, error);
      // Force reset state even on error
      setModeState(mode, { active: false, loading: false, startTime: null });
      if (selectedManualMode === mode) {
        setSelectedManualMode(null);
      }
      // ✅ FORCE CLEAR nonstop mode flag even on error
      if (mode === 'nonstop') {
        window.isInNonstopMode = false;
      }
    }
  };// ✅ ISOLATED: Individual mode start functions
  const startIsolatedPlaylistMode = async () => {
    if (!playlistUrl || !playlistInfo?.isValid) {
      throw new Error('Geen geldige playlist URL ingesteld');
    }

    console.log('🎵 Starting isolated playlist test (no ad breaks, just playlist)');
    
    // Extract playlist ID and start playlist directly
    const playlistId = playlistProvider === 'spotify' ? playlistUrl : extractPlaylistId(playlistUrl);
    if (!playlistId) {
      throw new Error('Ongeldige playlist URL');
    }

    // ✅ IMPORTANT: Start playlist directly without ad break logic
    if (playlistProvider === 'spotify') {
      await audioPlayer.playPlaylist(playlistId, { 
        shuffle: playlistShuffle, 
        provider: 'spotify',
        isManualTest: true,
        isIsolatedTest: true
      });
    } else {
      await audioPlayer.playPlaylist(playlistId, { 
        shuffle: playlistShuffle, 
        provider: playlistProvider,
        isManualTest: true,
        isIsolatedTest: true
      });
    }
  };

  const startIsolatedNonstopMode = async () => {
    console.log('🎵 Starting isolated nonstop radio test (no ad breaks, just nonstop radio)');
    
    const { getRandomNonstopStation } = await import('../utils/nonstopUtils.js');
    const nonstopStation = getRandomNonstopStation();
    if (!nonstopStation) {
      throw new Error('Geen nonstop stations beschikbaar');
    }
      // ✅ IMPORTANT: Play radio directly without ad break logic - MARK as nonstop mode
    window.isInNonstopMode = true; // ✅ FLAG: Mark that we're in deliberate nonstop mode
    await audioPlayer.playRadio(nonstopStation, { 
      isManualTest: true,
      isIsolatedTest: true,
      isNonstopMode: true  // ✅ DIFFERENTIATE: This is nonstop mode, not just a nonstop station
    });
  };

  const startIsolatedLofiMode = async () => {
    console.log('🎵 Starting isolated lofi test (no ad breaks, just lofi)');
    
    const { getNextLofiStream, createLofiStation, extractYouTubeVideoId, openLofiYouTubeOverlay } = await import('../utils/lofiUtils.js');
    
    const lofiStream = getNextLofiStream();
    if (!lofiStream) {
      throw new Error('Geen lofi streams beschikbaar');
    }

    if (lofiStream.type === 'youtube_video') {
      const videoId = extractYouTubeVideoId(lofiStream.url);
      if (videoId) {
        // ✅ IMPORTANT: Open lofi overlay directly without ad break logic
        openLofiYouTubeOverlay(videoId, { 
          isManualTest: true,
          isIsolatedTest: true
        });
      } else {
        throw new Error('Invalid YouTube video ID');
      }
    } else {
      const lofiStation = createLofiStation(lofiStream);
      // ✅ IMPORTANT: Play radio directly without ad break logic
      await audioPlayer.playRadio(lofiStation, { 
        isManualTest: true,
        isIsolatedTest: true
      });
    }
  };

  // Helper function to get mode display name
  const getModeDisplayName = (mode) => {
    switch (mode) {
      case 'playlist': return 'Playlist';
      case 'nonstop': return 'Nonstop Radio';
      case 'lofi': return 'Lofi Girl';
      default: return 'Onbekend';
    }
  };

  // Helper function to extract playlist ID from URL
  const extractPlaylistId = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]list=([^&#]*)/);
    return match ? match[1] : null;
  };
  // ✅ ISOLATED: Get button text based on current isolated state
  const getManualModeButtonText = () => {
    const currentModeState = getModeState(adBreakMode);
    
    if (currentModeState.loading) {
      return `${getModeDisplayName(adBreakMode)} Opstarten...`;
    }
    
    if (currentModeState.active) {
      return `${getModeDisplayName(adBreakMode)} Stoppen`;
    }
    
   // return `Alleen ${getModeDisplayName(adBreakMode)} afspelen`;
     return `${getModeDisplayName(adBreakMode)} afspelen`;
  };

  // Get status display text and color
  const getStatusDisplay = () => {
    if (!isTestingDetection) {
      return { text: 'Niet actief', color: 'text-gray-400' };
    }

    // ✅ NEW: Handle warm-up phase
    if (detectionResult?.isWarmingUp || detectionResult?.showAsListening) {
      return {
        text: detectionResult.displayStatus || `Opstarten...`,
        color: 'text-yellow-400'
      };
    }

    switch (detectionStatus) {
      case 'initializing':
        return { text: '🔧 Initializing...', color: 'text-blue-400' };
      case 'warming_up':
        return {
          text: detectionResult?.displayStatus || `Opstarten...`,
          color: 'text-yellow-400'
        };
      case 'listening':
        return { text: '👂 Listening...', color: 'text-blue-400' };
      case 'processing':
        return { text: '⚙️ Processing...', color: 'text-yellow-400' };
      case 'music':
        return {
          text: `🎵 Muziek`,
          color: 'text-green-400'
        };
      case 'no-music':
        return {
          text: `📢 Geen Muziek`,
          color: 'text-orange-400'
        };
      case 'error':
        return { text: '❌ Error', color: 'text-red-400' };
      default:
        return { text: 'Unknown', color: 'text-gray-400' };
    }
  };
  // ✅ INSTANT FIX: Wrapper for onStartTimer to set instant disable state
  const handleStartTimer = async () => {
    if (isTimerStarting || isTimerRunning) {
      console.log('🚫 Timer already starting or running, ignoring click');
      return;
    }
    
    // Set instant state to disable manual mode buttons immediately
    setIsTimerStarting(true);
    
    try {
      await onStartTimer();
    } catch (error) {
      console.error('Error starting timer:', error);
    } finally {
      // Clear the loading state after a short delay (should be cleared by isTimerRunning becoming true)
      setTimeout(() => {
        setIsTimerStarting(false);
      }, 2000);
    }
  };

  // ✅ RESET TIMER STARTING STATE: When timer actually starts running
  useEffect(() => {
    if (isTimerRunning) {
      setIsTimerStarting(false);
    }
  }, [isTimerRunning]);

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-4">          {/* ✅ NEW: Playlist Mode Selector at Top */}
   <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
  <label className="block text-sm font-medium mb-3 text-gray-300">
    Switch Methode:
  </label>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    {/* Playlist Mode */}
    <div
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:opacity-80 ${adBreakMode === 'playlist'
        ? 'border-blue-500 bg-blue-600/20 text-blue-300'
        : 'border-gray-600 bg-gray-700 text-gray-300'
        }`}
      onClick={() => onAdBreakModeChange('playlist')}
    >
      <div className="flex items-center gap-3 mb-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
        </svg>
        <span className="font-semibold">Playlist</span>
      </div>
      <p className="text-xs text-gray-400">
        Wissel naar YouTube/Spotify afspeellijst tijdens reclame
      </p>
    </div>

    {/* Nonstop Mode */}
    <div
      className={`p-4 rounded-lg border-2 transition-all relative cursor-pointer hover:opacity-80 ${adBreakMode === 'nonstop'
        ? 'border-green-500 bg-green-600/20 text-green-300'
        : 'border-gray-600 bg-gray-700 text-gray-300'
        }`}
      onClick={() => onAdBreakModeChange('nonstop')}
    >
      <div className="flex items-center gap-3 mb-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-.83-.51-1.57-1.24-1.85L12 2 3.24 6.15zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
        </svg>
        <span className="font-semibold">Non-stop Radio</span>
      </div>
      <p className="text-xs text-gray-400">
        Wissel naar een radio zonder reclame
      </p>
      {/* Gear icon */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowNonstopSettings(true);
        }}
        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-600/50 transition-colors cursor-pointer"
        title="Non-stop radio instellingen"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            setShowNonstopSettings(true);
          }
        }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
        </svg>
      </div>
    </div>

    {/* Lofi Mode */}
    <div
      className={`p-4 rounded-lg border-2 transition-all relative cursor-pointer hover:opacity-80 ${adBreakMode === 'lofi'
        ? 'border-purple-500 bg-purple-600/20 text-purple-300'
        : 'border-gray-600 bg-gray-700 text-gray-300'
        }`}
      onClick={() => onAdBreakModeChange('lofi')}
    >
      <div className="flex items-center gap-3 mb-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
        <span className="font-semibold">Lofi Girl</span>
      </div>
      <p className="text-xs text-gray-400">
        Wissel naar Lofi Girl study streams
      </p>
      {/* Gear icon */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowLofiSettings(true);
        }}
        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-600/50 transition-colors cursor-pointer"
        title="Lofi Girl instellingen"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            setShowLofiSettings(true);
          }
        }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
        </svg>
      </div>
    </div>
  </div>

  {/* ✅ NEW: Add PlaylistProviderSelector here when playlist mode is selected */}
  {adBreakMode === 'playlist' && (
    <div className="mt-4 pt-4 border-t border-gray-600">
      <PlaylistProviderSelector
        selectedProvider={playlistProvider}
        onProviderChange={onProviderChange}
        playlistUrl={playlistUrl}
        onPlaylistUrlChange={onPlaylistUrlChange}
        playlistInfo={playlistInfo}
        onPlaylistInfoChange={(info) => {
          // Since we don't have direct access to setPlaylistInfo, 
          // we need to pass this through props or handle it differently
          console.log('Playlist info changed:', info);
        }}
        isValidating={isValidatingPlaylist}
        onValidatingChange={(validating) => {
          // Handle validation state change
          console.log('Validation state changed:', validating);
        }}
        error={audioPlayer?.error}
        onRetry={audioPlayer?.manualInitializeSpotifyPlayer}
      />
    </div>
  )}
</div>

{/* ✅ IMPORTANT: Keep the existing "Instellingen" block here - don't remove this! */}
<div className="bg-gray-800 rounded-lg border border-gray-700">
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center gap-4">
      <h3
        className="text-lg font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Inklapppen' : 'Uitklappen'}
      >
        Instellingen
      </h3>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-gray-400 hover:text-white transition-colors"
        title={isExpanded ? 'Inklapppen' : 'Uitklappen'}
      >
        <svg
          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    
    {/* Compact Status Display and Controls */}
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isTimerRunning
          ? isAdBreakActive
            ? 'bg-red-500 animate-pulse'
            : 'bg-green-500'
          : 'bg-gray-500'
          }`}>
        </div>
        <span className="text-sm text-gray-300">
          {isTimerRunning
            ? isAdBreakActive
              ? 'Reclame actief'
              : 'Timer actief'
            : 'Timer uit'
          }
        </span>
      </div>      <div className="flex items-center gap-2">        {!isTimerRunning ? (
          <div className="relative">
            <button
              onClick={handleStartTimer}
              disabled={!isModeValid() || (audioPlayer && audioPlayer.isTransitioning) || isAnyModeActive() || isAnyModeLoading() || isTimerStarting}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${
                (isAnyModeActive() || isAnyModeLoading() || isTimerStarting) 
                  ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                  : 'bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
              }`}
            >
              {isTimerStarting ? 'Starten...' : 'Activeer Switching'}
            </button>
            {(isAnyModeActive() || isAnyModeLoading() || isTimerStarting) && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                {isTimerStarting ? 'Timer wordt gestart...' : isAnyModeLoading() ? 'Manual mode start bezig...' : 'Manual mode is actief - stop eerst de manual mode'}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onStopTimer}            disabled={audioPlayer && audioPlayer.isTransitioning}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
          >
            Deactiveer Switching
          </button>
        )}
        
        <label>of</label>
        
        <div className="relative">
          <button
            onClick={handleManualModeToggle}
            disabled={!isModeValid() || isAnyModeLoading() || isTimerRunning || isTimerStarting}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${
              getModeState(adBreakMode).loading
                ? 'bg-yellow-600 text-white cursor-wait'
                : getModeState(adBreakMode).active
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : (isTimerRunning || isAnyModeLoading() || isTimerStarting)
                    ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
            }`}
          >
            {getManualModeButtonText()}
          </button>
          {(isTimerRunning || isAnyModeLoading() || isTimerStarting) && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              {isTimerStarting ? 'Timer wordt gestart...' : isTimerRunning ? 'Timer switching is actief - stop eerst de timer' : 'Andere manual mode start bezig...'}
            </div>
          )}
        </div>

      </div>
    </div>
  </div>         
              {/* Collapsible Content */}
            {isExpanded && (
              <div className="p-4 space-y-4">
                {/* Experimental settings */}
                <div className="border-b border-gray-600 pb-4">
                  <div className="flex gap-6 items-start">
                    {/* Left side: Experimental settings */}
                    <div className="flex pr-4 flex-col mt-5 gap-4 min-w-[250px]">
                      {/* ✅ NEW: Experimental section title */}
                      <div className="mb-0">
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
                        </div>                  </div>

                      {/* 2. Community vs Own Timings */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 flex-1">
                            <span className="text-sm text-gray-300">
                              {useCommunityTimings ? 'Community timings' : 'Community timings'}
                            </span>
                            <div className="relative">
                              <button
                                onMouseEnter={() => setShowAdDetectionTooltip(true)}
                                onMouseLeave={() => setShowAdDetectionTooltip(false)}
                                className="w-4 h-4 rounded-full bg-blue-600 text-gray-300 text-xs flex items-center justify-center hover:bg-blue-400 transition-colors"
                              >
                                i
                              </button>
                              {showAdDetectionTooltip && (
                                <div className="absolute left-6 top-0 z-50 w-72 p-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg text-xs text-gray-300">
                                  {useCommunityTimings
                                    ? 'Gebruik community-gerapporteerde reclametijden van andere gebruikers.'
                                    : 'Gebruik community-gerapporteerde reclametijden van andere gebruikers.'
                                  }
                                </div>
                              )}
                            </div>
                          </div>                      <button
                            onClick={() => onUseCommunityTimingsChange(!useCommunityTimings)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useCommunityTimings
                              ? 'bg-blue-600'
                              : 'bg-gray-600'
                              }`}
                          >                        <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useCommunityTimings ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>                    </div>
                      </div>                 {/*  3. Visualizer Toggle */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 flex-1">
                            <span className="text-sm text-gray-300">
                              Visualizer
                            </span>                     {/*   <button
                              onClick={() => setShowVisualizerSettings(true)}
                              className="w-4 h-4 rounded-full bg-gray-600 hover:bg-gray-500 text-gray-300 text-xs flex items-center justify-center transition-colors ml-1 visualizer-gear"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                              </svg>
                            </button>*/}
                          </div>
                          <button
                            onClick={() => onVisualizerToggle(!visualizerEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${visualizerEnabled
                              ? 'bg-green-600'
                              : 'bg-gray-600'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${visualizerEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
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
                          {Math.floor(currentDay.startHour).toString().padStart(2, '0')}:{Math.round((currentDay.startHour % 1) * 60).toString().padStart(2, '0')} - {Math.floor(currentDay.endHour).toString().padStart(2, '0')}:{Math.round((currentDay.endHour % 1) * 60).toString().padStart(2, '0')} op {dayNames[selectedDay]}
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
                </div>          </div>
            )}
          </div>

          {/* Nonstop Radio Settings Overlay */}
          {showNonstopSettings && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Non-stop Radio Instellingen</h3>
                <button
                  onClick={() => setShowNonstopSettings(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>            <div className="mb-4 p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    Tijdens een reclamepauze wordt automatisch gewisseld tussen deze radio stations in willekeurige volgorde.
                  </p>
                </div>

                {/* Error message */}
                {nonstopRemovalError && (
                  <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg">
                    <p className="text-red-300 text-sm">{nonstopRemovalError}</p>
                  </div>
                )}

                {/* All configured stations in one list */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-white mb-3">Geconfigureerde Non-stop Stations</h4>
                  <div className="space-y-2">                {getAllConfiguredNonstopStations().map((station) => (
                    <div key={station.name} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        {station.isDefault && (
                          <span className="text-green-400 text-xs bg-green-600/20 px-2 py-1 rounded">
                            Standaard
                          </span>
                        )}
                        <div>
                          <div className="text-white font-medium">{station.name}</div>
                          <div className="text-gray-400 text-sm">{station.description || 'Non-stop muziek'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => testStation(station)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                          title="Test dit station"
                        >
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            Test
                          </div>
                        </button>
                        <button
                          onClick={() => removeNonstopStation(station.name)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Verwijderen"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>

                {/* Search and add stations */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Station Toevoegen</h4>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Zoek radio stations..."
                      value={nonstopSearchTerm}
                      onChange={(e) => setNonstopSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  {nonstopSearchTerm.trim() && (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {getFilteredStations().map((station) => {
                        const isAlreadyConfigured = getAllConfiguredNonstopStations().some(s => s.name === station.name);
                        return (<div key={`${station.category}-${station.name}`} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div>
                            <div className="text-white font-medium">{station.name}</div>
                            <div className="text-gray-400 text-sm">{station.description || station.category}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => testStation(station)}
                              className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors"
                              title="Test dit station"
                            >
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                                Test
                              </div>
                            </button>
                            <button
                              onClick={() => {
                                addNonstopStation(station.name);
                                setNonstopSearchTerm('');
                              }}
                              disabled={isAlreadyConfigured}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded"
                            >
                              {isAlreadyConfigured ? 'Toegevoegd' : 'Toevoegen'}
                            </button>
                          </div>
                        </div>
                        );
                      })}
                      {getFilteredStations().length === 0 && (
                        <div className="text-gray-400 text-center py-4">Geen resultaten gevonden</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lofi Girl Settings Overlay */}
          {showLofiSettings && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 max-w-lg w-full mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Lofi Girl Instellingen</h3>
                  <button
                    onClick={() => setShowLofiSettings(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                  </button>
                </div>            <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Custom YouTube URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={customLofiUrl}
                      onChange={(e) => setCustomLofiUrl(e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${isValidYouTubeUrl(customLofiUrl)
                          ? 'border-gray-600 focus:border-purple-500'
                          : 'border-red-500 focus:border-red-400'
                        }`}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Voer een YouTube video of livestream URL in. Laat leeg voor standaard Lofi Girl streams.
                    </p>
                    {customLofiUrl && !isValidYouTubeUrl(customLofiUrl) && (
                      <p className="text-xs text-red-400 mt-1">
                        ⚠️ Ongeldige YouTube URL. Gebruik formaat: https://www.youtube.com/watch?v=...
                      </p>
                    )}
                  </div>              <div className="flex gap-3">

                    <button
                      onClick={() => setShowLofiSettings(false)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                    >
                      Opslaan
                    </button>
                  </div>              {customLofiUrl && (
                    <div className="p-3 bg-purple-600/20 border border-purple-600/30 rounded-lg">
                      <div className="text-purple-300 text-sm font-medium">Custom URL ingesteld:</div>
                      <div className="text-gray-300 text-xs break-all">{customLofiUrl}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>)}        </div>
      </div>      {/* Visualizer Settings Overlay */}
      <VisualizerSettings
        isOpen={showVisualizerSettings}
        onClose={() => setShowVisualizerSettings(false)}
        visualizerType={visualizerType}
        onVisualizerTypeChange={onVisualizerTypeChange}
        visualizerBlur={visualizerBlur}
        onVisualizerBlurChange={onVisualizerBlurChange}
      />
    </div>
  );
};

export default AdBreakSettings;