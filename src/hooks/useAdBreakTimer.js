// hooks/useAdBreakTimer.js - Enhanced with multiple ad break modes

import { useState, useEffect, useCallback, useRef } from 'react';
import { getRandomNonstopStation, markStationAsFailed } from '../utils/nonstopUtils.js';
import {
  getNextLofiStream,
  createLofiStation,
  extractYouTubeVideoId,
  openLofiYouTubeOverlay,  // ← Updated import
  closeLofiYouTubeOverlay,
  markLofiStreamAsFailed,
  isLofiOverlayOpen,       // ← Updated import
  syncLofiVolume          // ← NEW: Volume sync import
} from '../utils/lofiUtils.js';
import { setupAdDetection } from '../utils/musicDetection.js';
import CommunityTimings from '../utils/communityTimings.jsx';

// Add caching functionality to the useAdBreakTimer hook:

const STORAGE_KEYS = {
  AD_BREAK_MODE: 'adbreak_mode',
  AD_BREAK_MINUTE: 'adbreak_minute',
  AD_BREAK_MINUTE2: 'adbreak_minute2',
  AD_BREAK_DURATION: 'adbreak_duration',
  AD_BREAK_DURATION2: 'adbreak_duration2',
  DAY_SETTINGS: 'adbreak_day_settings',
  SELECTED_CATEGORY: 'radio_selected_category'
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.warn(`Failed to load ${key} from storage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to storage:`, error);
  }
};

// Extract playlist ID from URL - updated to handle both YouTube and Spotify
const extractPlaylistId = (url, provider) => {
  if (provider === 'spotify') {
    // For Spotify, the URL is actually the playlist ID
    return url;
  } else {
    // For YouTube, extract from URL
    const regex = /[?&]list=([^#\&\?]*)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
};

export const useAdBreakTimer = (audioPlayer, playlistProvider = 'youtube', autoCloseOverlays = true) => {
  const [adBreakMinute, setAdBreakMinute] = useState(() => loadFromStorage(STORAGE_KEYS.AD_BREAK_MINUTE, 29));
  const [adBreakMinute2, setAdBreakMinute2] = useState(() => loadFromStorage(STORAGE_KEYS.AD_BREAK_MINUTE2, 59));
  const [adBreakDuration, setAdBreakDuration] = useState(() => loadFromStorage(STORAGE_KEYS.AD_BREAK_DURATION, 6));
  const [adBreakDuration2, setAdBreakDuration2] = useState(() => loadFromStorage(STORAGE_KEYS.AD_BREAK_DURATION2, 9));
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAdBreakActive, setIsAdBreakActive] = useState(false);
  const [nextAdBreakIn, setNextAdBreakIn] = useState(null);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistShuffle, setPlaylistShuffle] = useState(false);
  const [currentAdBreakTimeLeft, setCurrentAdBreakTimeLeft] = useState(null);
  const [enforcingAdBreak, setEnforcingAdBreak] = useState(false);
  const [queuedStation, setQueuedStation] = useState(null);
  const [isManualTestActive, setIsManualTestActive] = useState(false);
  const [shouldPlayPlaylistDuringAdBreak, setShouldPlayPlaylistDuringAdBreak] = useState(false);
  const [adBreakMode, setAdBreakMode] = useState(() => loadFromStorage(STORAGE_KEYS.AD_BREAK_MODE, 'playlist')); // 'playlist', 'nonstop', 'lofi'
  const [currentNonstopAttempt, setCurrentNonstopAttempt] = useState(0);
  const [currentLofiAttempt, setCurrentLofiAttempt] = useState(0);  const [isManualTestInProgress, setIsManualTestInProgress] = useState(false);
  const [isPermanentModeActive, setIsPermanentModeActive] = useState(false);  const [isNonstopModeManuallyActive, setIsNonstopModeManuallyActive] = useState(false); // Simple state for nonstop cycling button  // ✅ NEW: State for persistent manual timer control
  const [manualTimerOverride, setManualTimerOverride] = useState(null);
  const [isManualTimerActive, setIsManualTimerActive] = useState(false);
  const skipNextTimerUpdateRef = useRef(false);

  // Automatic ad detection states - DISABLED: Music detection temporarily disabled
  const [autoAdDetectionEnabled, setAutoAdDetectionEnabled] = useState(() => {
    // ✅ QUICK FIX: Force music detection to always be disabled
    return false;  });
  // Refs for interval management
  const timerIntervalRef = useRef(null);
  const adBreakTimeoutRef = useRef(null);
  const adDetectionIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null); // ✅ NEW: Ref for countdown interval  // ✅ FIX: Timer cache ref to prevent reset on dependency changes  
  const timerCacheRef = useRef({
    cachedNextAdBreakTime: null,
    lastCommunityTimingCheck: 0
  });  // ✅ FIX: Add refs to prevent feedback popup loops and ensure single trigger per ad break
  const feedbackPopupShownRef = useRef(false);
  const currentAdBreakIdRef = useRef(null);
  const feedbackAutoCloseTimeoutRef = useRef(null);
  
  // ✅ NEW: Enhanced ad break session management
  const [currentAdBreakSession, setCurrentAdBreakSession] = useState(null);
  const adBreakSessionRef = useRef(null);
  const createAdBreakSession = useCallback((source, timing, duration, stationName) => {
    const session = {
      id: `${stationName}_${Date.now()}`,
      source: source, // 'community' or 'manual'
      timing: timing,
      duration: duration,
      stationName: stationName,
      createdAt: Date.now(),
      feedbackShown: false
    };
    
    console.log('📋 Creating ad break session:', session);
    setCurrentAdBreakSession(session);
    adBreakSessionRef.current = session;
    
    // Persist to storage
    try {
      sessionStorage.setItem('currentAdBreakSession', JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to store ad break session:', error);
    }
  }, []);

  // ✅ NEW: Load ad break session from storage on initialization
  const loadAdBreakSessionFromStorage = useCallback(() => {
    try {
      const stored = sessionStorage.getItem('currentAdBreakSession');
      if (stored) {
        const session = JSON.parse(stored);
        console.log('📋 Restored ad break session from storage:', session);
        setCurrentAdBreakSession(session);
        adBreakSessionRef.current = session;
        
        // ✅ CRITICAL: Restore community timing state if it was community-based
        if (session.source === 'community') {
          setCurrentAdBreakUsedCommunityTiming(true);
          setNextCommunityTiming(session.timing);
          setFeedbackStationName(session.stationName);
          console.log('🔔 Restored community timing state from session');
        }
        
        return session;
      }
    } catch (error) {
      console.warn('Failed to load ad break session:', error);
    }
    return null;
  }, []);

  // ✅ NEW: Clear ad break session
  const clearAdBreakSession = useCallback(() => {
    console.log('📋 Clearing ad break session');
    setCurrentAdBreakSession(null);
    adBreakSessionRef.current = null;
    try {
      sessionStorage.removeItem('currentAdBreakSession');
    } catch (error) {
      console.warn('Failed to clear ad break session:', error);
    }
  }, []);

  // ✅ NEW: Update ad break session
  const updateAdBreakSession = useCallback((updates) => {
    const currentSession = currentAdBreakSession || adBreakSessionRef.current;
    if (currentSession) {
      const updatedSession = { ...currentSession, ...updates };
      console.log('📋 Updating ad break session:', updates);
      setCurrentAdBreakSession(updatedSession);
      adBreakSessionRef.current = updatedSession;
      
      try {
        sessionStorage.setItem('currentAdBreakSession', JSON.stringify(updatedSession));
      } catch (error) {
        console.warn('Failed to update ad break session:', error);
      }
    }
  }, []);
  // Community timing states
  const [useCommunityTimings, setUseCommunityTimings] = useState(() => {
    try {
      const saved = localStorage.getItem('use_community_timings');
      return saved ? JSON.parse(saved) : true; // Default to true
    } catch (error) {
      console.warn('Failed to load community timing setting:', error);
      return true;
    }
  });

  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackStationName, setFeedbackStationName] = useState('');
  const [currentAdBreakUsedCommunityTiming, setCurrentAdBreakUsedCommunityTiming] = useState(false);
  const [nextCommunityTiming, setNextCommunityTiming] = useState(null);
  const [originalRadioStation, setOriginalRadioStation] = useState(null);

  // Debug timing state
  const [debugTimingState, setDebugTimingState] = useState(null);  // ✅ FIX: Helper function to show feedback popup safely (only once per ad break)
  const showFeedbackPopupSafely = useCallback((stationName) => {
    // ✅ CRITICAL FIX: Use station name + ad break session for stable ID instead of timestamp
    const currentSession = currentAdBreakSession || adBreakSessionRef.current;
    const adBreakId = currentSession ? 
      `${stationName}_${currentSession.id}` : 
      `${stationName}_${Math.floor(Date.now() / 60000)}`; // Round to minute to prevent duplicate IDs
    
    // ✅ CRITICAL: Check if feedback was already given for this session
    if (currentSession && currentSession.feedbackShown) {
      console.log('🚫 Feedback already given for this ad break session, permanently skipping:', adBreakId);
      return;
    }
    
    // Prevent multiple triggers for the same ad break
    if (feedbackPopupShownRef.current || currentAdBreakIdRef.current === adBreakId) {
      console.log('🚫 Feedback popup already shown for this ad break, skipping:', adBreakId);
      return;
    }
    
    // ✅ EXTRA CHECK: If feedback popup is already visible, don't show it again
    if (showFeedbackPopup) {
      console.log('🚫 Feedback popup already visible, skipping');
      return;
    }
    
    console.log('✅ Showing feedback popup for ad break:', adBreakId);
    
    // Set the tracking flags
    feedbackPopupShownRef.current = true;
    currentAdBreakIdRef.current = adBreakId;
    
    // Clear any existing timeout
    if (feedbackAutoCloseTimeoutRef.current) {
      clearTimeout(feedbackAutoCloseTimeoutRef.current);
      feedbackAutoCloseTimeoutRef.current = null;
    }
    
    // Set the state to show popup
    setFeedbackStationName(stationName);
    setShowFeedbackPopup(true);
    
    // Auto-close after 10 seconds (will be overridden by component's own timeout)
    feedbackAutoCloseTimeoutRef.current = setTimeout(() => {
      console.log('🕒 Auto-closing feedback popup after timeout');
      setShowFeedbackPopup(false);
      feedbackPopupShownRef.current = false;
      currentAdBreakIdRef.current = null;
      feedbackAutoCloseTimeoutRef.current = null;    }, 10000);
  }, [currentAdBreakSession]); // ✅ FIX: Remove showFeedbackPopup from dependencies to prevent loops// ✅ FIX: Helper function to close feedback popup safely
  const closeFeedbackPopupSafely = useCallback(() => {
    console.log('✅ Closing feedback popup safely');
    
    // ✅ CRITICAL: Mark feedback as shown in session to prevent re-showing
    updateAdBreakSession({ feedbackShown: true });
    
    // Clear timeout
    if (feedbackAutoCloseTimeoutRef.current) {
      clearTimeout(feedbackAutoCloseTimeoutRef.current);
      feedbackAutoCloseTimeoutRef.current = null;
    }
    
    // Reset all tracking flags
    setShowFeedbackPopup(false);
    feedbackPopupShownRef.current = false;
    currentAdBreakIdRef.current = null;
  }, [updateAdBreakSession]);

  // ✅ NEW: Enhanced function to check current ad break context
  const getCurrentAdBreakContext = useCallback(() => {
    // First check if we have an active session
    if (currentAdBreakSession || adBreakSessionRef.current) {
      const session = currentAdBreakSession || adBreakSessionRef.current;
      console.log('📋 Using active ad break session:', session);
      return {
        source: session.source,
        isCommunity: session.source === 'community',
        timing: session.timing,
        duration: session.duration,
        stationName: session.stationName,
        feedbackShown: session.feedbackShown
      };
    }

    // Fallback: try to restore from storage
    const restored = loadAdBreakSessionFromStorage();
    if (restored) {
      return {
        source: restored.source,
        isCommunity: restored.source === 'community',
        timing: restored.timing,
        duration: restored.duration,
        stationName: restored.stationName,
        feedbackShown: restored.feedbackShown
      };
    }

    return null;
  }, [currentAdBreakSession, loadAdBreakSessionFromStorage]);// ✅ FIXED: Get next community timing with better caching to prevent freezing
  const getNextCommunityTiming = useCallback(async () => {
    if (!useCommunityTimings || !audioPlayer.currentStation?.name) {
      return null;
    }

    try {
      const currentTime = new Date();
      
      // ✅ MAJOR FIX: Cache for 5 minutes and only check once per minute to prevent freezing
      const cacheKey = `next_timing_${audioPlayer.currentStation.name}_${currentTime.getHours()}_${Math.floor(currentTime.getMinutes() / 5)}`;      // Check if we recently calculated this (cache for 5 minutes)
      const cachedResult = sessionStorage.getItem(cacheKey);
      if (cachedResult) {
        const parsed = JSON.parse(cachedResult);
        if ((Date.now() - parsed.timestamp) < 300000) { // 5 minutes cache (was 2 minutes)
          // ✅ FIX: Only log cache hits once per station per session to reduce spam
          const logKey = `cache_logged_${audioPlayer.currentStation.name}`;
          if (!sessionStorage.getItem(logKey)) {
            console.log('📋 Using cached community timing for', audioPlayer.currentStation.name);
            sessionStorage.setItem(logKey, 'true');
          }
          return parsed.result;
        }
      }

      // ✅ MAJOR FIX: Rate limit community timing checks to max once per minute
      const lastCheckKey = `last_community_check_${audioPlayer.currentStation.name}`;
      const lastCheck = sessionStorage.getItem(lastCheckKey);      if (lastCheck && (Date.now() - parseInt(lastCheck)) < 60000) {
        // Return cached result or null if rate limited
        if (cachedResult) {
          const parsed = JSON.parse(cachedResult);
          return parsed.result;
        }
        return null;
      }
      
      // Record this check time
      sessionStorage.setItem(lastCheckKey, Date.now().toString());
      console.log('🔥 Fetching fresh community timing for', audioPlayer.currentStation.name, '(expensive operation)');

      const suggestions = await CommunityTimings.getSuggestedAdBreakTiming(audioPlayer.currentStation.name, currentTime.getHours());
      
      if (suggestions) {
        console.log('🔔 Community timing suggestions loaded for', audioPlayer.currentStation.name);
      }
      
      let result = null;
      
      if (suggestions) {
        // Check for half-hour timing (around :30)
        const halfHour = suggestions.halfHour;
        if (halfHour && halfHour.starts !== null && halfHour.ends !== null) {
          const duration = Math.abs(halfHour.ends - halfHour.starts);
          result = {
            startMinute: halfHour.starts,
            endMinute: halfHour.ends,
            duration: duration,
            stationName: audioPlayer.currentStation.name,
            source: 'community',
            type: 'halfHour'
          };
        }
        
        // Check for full-hour timing (around :00)
        if (!result) {
          const fullHour = suggestions.fullHour;
          if (fullHour && fullHour.starts !== null && fullHour.ends !== null) {
            const duration = Math.abs(fullHour.ends - fullHour.starts);
            result = {
              startMinute: fullHour.starts,
              endMinute: fullHour.ends,
              duration: duration,
              stationName: audioPlayer.currentStation.name,
              source: 'community',
              type: 'fullHour'
            };
          }
        }
      }
      
      // Cache the result for longer
      sessionStorage.setItem(cacheKey, JSON.stringify({
        result: result,
        timestamp: Date.now()
      }));
      
      return result;
    } catch (error) {
      console.warn('Failed to get community timing:', error);
      return null;
    }
  }, [useCommunityTimings, audioPlayer.currentStation?.name]);  // ✅ ULTRA-ROBUST: Get next ad break time with bulletproof community timing support
  const getNextAdBreakTime = useCallback(async () => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // ✅ CRITICAL: Check for active ad break session first
    const activeContext = getCurrentAdBreakContext();
    if (activeContext && activeContext.isCommunity && activeContext.timing) {
      console.log('🔄 Using active community ad break session for timer display');
      
      // ✅ CRITICAL FIX: If we're in an ad break, don't calculate next timing - show current ad break countdown instead
      if (isAdBreakActive && currentAdBreakTimeLeft !== null) {
        console.log('🔔 Currently in community ad break - showing remaining time:', currentAdBreakTimeLeft, 'seconds');
        return currentAdBreakTimeLeft;
      }
      
      // ✅ FIX: Only calculate next timing if not currently in ad break
      const targetMinute = activeContext.timing.startMinute || activeContext.timing.minute;
      let minutesUntil = (targetMinute - currentMinute + 60) % 60;
      
      if (minutesUntil === 0) {
        if (currentSecond <= 30) {
          return 0; // Start immediately
        } else {
          minutesUntil = 60; // Wait for next occurrence
        }
      }
      
      // ✅ ULTRA-ROBUST: Store community timing for UI consistency
      setNextCommunityTiming(activeContext.timing);
      setCurrentAdBreakUsedCommunityTiming(true);
      
      console.log(`🔔 Next community ad break (from session): ${minutesUntil} minutes`);
      return minutesUntil * 60 - currentSecond; // Return in seconds for consistency
    }

    // ✅ CRITICAL FIX: Always try community timing first and be consistent
    const communityTiming = await getNextCommunityTiming();
    if (communityTiming) {
      // ✅ ULTRA-ROBUST: Store community timing immediately for UI consistency
      setNextCommunityTiming(communityTiming);
      
      const targetMinute = communityTiming.startMinute;
      let minutesUntil = (targetMinute - currentMinute + 60) % 60;
      
      // ✅ SUPER-ROBUST: Handle edge cases for exact timing
      if (minutesUntil === 0) {
        if (currentSecond <= 30) {
          console.log('🔔 Community ad break time reached!');
          return 0; // Start immediately
        } else {
          // We missed this occurrence, wait for next one
          // For community timings, this could be the next occurrence of the same pattern
          minutesUntil = 60; // Wait for next hour if it's a full-hour pattern
        }
      }

      const totalSecondsUntil = (minutesUntil * 60) - currentSecond;
      
      // ✅ ROBUST LOGGING: Only log occasionally to prevent spam
      if (totalSecondsUntil > 1800 || totalSecondsUntil % 30 === 0 || totalSecondsUntil < 10) {
        const logKey = `community_timing_${targetMinute}_${Math.floor(totalSecondsUntil/10)*10}`;
        const lastLogged = sessionStorage.getItem(logKey);
        if (!lastLogged || (Date.now() - parseInt(lastLogged)) > 30000) {
          console.log('🔔 Community timing countdown:', Math.floor(totalSecondsUntil/60), 'min', totalSecondsUntil%60, 'sec (target minute:', targetMinute, ')');
          sessionStorage.setItem(logKey, Date.now().toString());
        }
      }
      
      return Math.max(0, totalSecondsUntil);
    }

    // ✅ CRITICAL FIX: Clear community timing state when none available
    setNextCommunityTiming(null);

    // ✅ FALLBACK: Calculate exact seconds until next manual ad break
    const timeToAdBreak1Minutes = (adBreakMinute - currentMinute + 60) % 60;
    const timeToAdBreak2Minutes = (adBreakMinute2 - currentMinute + 60) % 60;
    
    let nextAdBreakMinutes = Math.min(timeToAdBreak1Minutes, timeToAdBreak2Minutes);
    
    // ✅ HANDLE IMMEDIATE TRIGGER: Check if we should start now
    if (nextAdBreakMinutes === 0) {
      if (currentSecond <= 30) {
        console.log('🔔 Manual ad break time reached!');
        return 0;
      } else {
        // We missed this minute, go to next one
        const allBreaks = [timeToAdBreak1Minutes, timeToAdBreak2Minutes].filter(t => t > 0);
        nextAdBreakMinutes = allBreaks.length > 0 ? Math.min(...allBreaks) : 60;
      }
    }
    
    // ✅ PRECISE CALCULATION: Convert to total seconds remaining
    const totalSecondsRemaining = (nextAdBreakMinutes * 60) - currentSecond;
    
    return Math.max(0, totalSecondsRemaining);
  }, [getNextCommunityTiming, adBreakMinute, adBreakMinute2, getCurrentAdBreakContext]);

  // ✅ ENHANCED: Ad break mode descriptions
  const getAdBreakModeDescription = useCallback(() => {
    switch (adBreakMode) {
      case 'playlist': return 'afspeellijst';
      case 'nonstop': return 'nonstop radio';
      case 'lofi': return 'lofi muziek';
      default: return 'alternatieve audio';
    }
  }, [adBreakMode]);  // ✅ FIXED: Function to rotate to next nonstop station (manual mode OR ad break mode)
  const rotateToNextNonstopStation = useCallback(async () => {
    if (adBreakMode !== 'nonstop') {
      console.warn('❌ Cannot rotate: not in nonstop mode');
      return;
    }

    if (!isNonstopModeManuallyActive && !isAdBreakActive) {
      console.warn('❌ Cannot rotate: neither manual nonstop mode nor ad break is active');
      return;
    }

    try {
      console.log('🔄 Rotating to next nonstop station...');
      
      // Get the next station from nonstopUtils
      const { getRandomNonstopStation } = await import('../utils/nonstopUtils.js');
      const nextStation = getRandomNonstopStation();
      if (!nextStation) {
        throw new Error('No nonstop stations available');
      }      // Actually play the station using the audioPlayer
      await audioPlayer.playRadio(nextStation, { 
        isIsolatedTest: isNonstopModeManuallyActive, // Only true for manual mode
        isNonstopMode: true,
        isNonstopRotation: true  // ✅ Flag to prevent stopping manual modes
      });
      
      if (window.addNotification) {
        window.addNotification(`🔄 Gewisseld naar: ${nextStation.name}`, 'info', 3000);
      }
      
      console.log('🎵 Successfully switched to nonstop station:', nextStation.name);
    } catch (error) {
      console.error('Failed to rotate nonstop station:', error);
      if (window.addNotification) {
        window.addNotification(`❌ Kan niet wisselen: ${error.message}`, 'error', 3000);
      }
    }
  }, [adBreakMode, audioPlayer, isNonstopModeManuallyActive, isAdBreakActive]);

  // Handle ad break errors
  const handleAdBreakError = useCallback(() => {
    if (audioPlayer.isRadioPausedForAdBreak) {
      audioPlayer.resumeRadioFromAdBreak();
    }    setIsAdBreakActive(false);
    setShouldPlayPlaylistDuringAdBreak(false);
    window.isAdBreakActive = false;
    window.currentAdBreakTimeLeft = null;

    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (window.addNotification) {
      window.addNotification('❌ Kon reclamepauze niet starten', 'error', 3000);
    }
  }, [audioPlayer]);

  // Playlist ad break (existing logic)
  const startPlaylistAdBreak = useCallback(async (duration) => {
    if (!playlistUrl) throw new Error('Geen playlist URL ingesteld');

    const playlistId = extractPlaylistId(playlistUrl, playlistProvider);
    if (!playlistId) throw new Error('Ongeldige playlist URL');

    // Pause radio first
    audioPlayer.pauseRadioForAdBreak();

    // Set states
    setIsAdBreakActive(true);
    window.isAdBreakActive = true;

    // Try to start playlist
    try {
      if (playlistProvider === 'spotify') {
        await audioPlayer.playSpotifyPlaylist(playlistId, { shuffle: playlistShuffle });
      } else {
        await audioPlayer.playPlaylist(playlistId, { shuffle: playlistShuffle });
      }

      console.log(`🎵 Ad break started with ${playlistProvider} playlist for ${duration} minutes`);
      setShouldPlayPlaylistDuringAdBreak(true);

      // Schedule end of ad break
      const endTime = Date.now() + (duration * 60 * 1000);
      adBreakTimeoutRef.current = setTimeout(() => {
        endAdBreak();
      }, duration * 60 * 1000);

      console.log(`🎵 Ad break scheduled to end at ${new Date(endTime).toLocaleTimeString()}`);

    } catch (error) {
      console.error('Failed to start playlist ad break:', error);
      throw error;
    }
  }, [playlistUrl, playlistShuffle, playlistProvider, audioPlayer]);

  // Nonstop ad break
  const startNonstopAdBreak = useCallback(async (duration) => {
    console.log('🎵 Starting nonstop ad break for', duration, 'minutes');

    // ✅ NEW: Store the original radio station for restoration
    if (audioPlayer.currentStation) {
      setOriginalRadioStation(audioPlayer.currentStation);
      console.log('🎵 Stored original radio station:', audioPlayer.currentStation.name);
    }    // Set states
    setIsAdBreakActive(true);
    window.isAdBreakActive = true;
    setShouldPlayPlaylistDuringAdBreak(false);
    setCurrentNonstopAttempt(0);
    
    // ✅ NEW: Set cycling button state for automatic ad break
    setIsNonstopModeManuallyActive(true);

    // Get first nonstop station
    const nonstopStation = getRandomNonstopStation();
    if (!nonstopStation) {
      throw new Error('Geen nonstop stations beschikbaar');
    }

    // Mark this as a nonstop rotation so it doesn't get queued
    window.isNonstopRotation = true;

    try {
      // Switch to nonstop station
      await audioPlayer.playRadio(nonstopStation);
      console.log('🎵 Switched to nonstop station:', nonstopStation.name);

      // Schedule end of ad break
      const endTime = Date.now() + (duration * 60 * 1000);
      adBreakTimeoutRef.current = setTimeout(() => {
        endAdBreak();
      }, duration * 60 * 1000);

      console.log(`🔄 Nonstop ad break scheduled to end at ${new Date(endTime).toLocaleTimeString()}`);

    } catch (error) {
      console.error('Failed to start nonstop ad break:', error);
      throw error;
    } finally {
      // Clear the rotation flag
      window.isNonstopRotation = false;
    }
  }, [audioPlayer]);  // Lofi ad break
  const startLofiAdBreak = useCallback(async (duration) => {
    console.log('🎵 Starting lofi ad break for', duration, 'minutes');

    // Pause radio first
    audioPlayer.pauseRadioForAdBreak();

    // Set states
    setIsAdBreakActive(true);
    window.isAdBreakActive = true;
    setShouldPlayPlaylistDuringAdBreak(false);
    setCurrentLofiAttempt(0);

    // Get lofi stream
    const lofiStream = getNextLofiStream();
    if (!lofiStream) {
      throw new Error('Geen lofi streams beschikbaar');
    }    try {
      // ✅ NEW: Sync lofi volume with current audio player volume
      if (audioPlayer?.volume !== undefined) {
        syncLofiVolume(audioPlayer.volume);
      }
      
      // ✅ FIX: Check for YouTube video type correctly and prioritize YouTube overlay
      if (lofiStream.type === 'youtube_video' || lofiStream.url.includes('youtube.com') || lofiStream.url.includes('youtu.be')) {
        const videoId = extractYouTubeVideoId(lofiStream.url);
        if (videoId) {
          console.log('🎵 Opening lofi YouTube overlay for video ID:', videoId, '(will start minimized)');
          
          // ✅ FIX: Give the overlay time to properly initialize before starting countdown
          await openLofiYouTubeOverlay(videoId);
          console.log('🎵 Lofi YouTube overlay opened successfully:', lofiStream.name);
          
          // ✅ FIX: Small delay to ensure overlay is fully rendered
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.warn('Failed to extract YouTube video ID, trying as direct stream');
          // Fallback to direct stream approach
          const lofiStation = createLofiStation(lofiStream);
          await audioPlayer.playRadio(lofiStation);
          console.log('🎵 Started lofi stream as direct stream:', lofiStream.name);
        }
      } else {
        // For direct streams, use regular audio player
        const lofiStation = createLofiStation(lofiStream);
        await audioPlayer.playRadio(lofiStation);
        console.log('🎵 Started lofi stream:', lofiStream.name);
      }

      // Schedule end of ad break
      const endTime = Date.now() + (duration * 60 * 1000);
      adBreakTimeoutRef.current = setTimeout(() => {
        endAdBreak();
      }, duration * 60 * 1000);

      console.log(`🎵 Lofi ad break scheduled to end at ${new Date(endTime).toLocaleTimeString()}`);

    } catch (error) {
      console.error('Failed to start lofi ad break:', error);
      
      // ✅ FIX: If lofi fails, try to fallback to a working stream or clean up gracefully
      try {
        // Mark this stream as failed and try another
        markLofiStreamAsFailed(lofiStream.url);
        
        // Try with a different stream        const fallbackStream = getNextLofiStream();
        if (fallbackStream && fallbackStream.url !== lofiStream.url) {
          console.log('🎵 Trying fallback lofi stream:', fallbackStream.name);
          
          // ✅ NEW: Sync lofi volume with current audio player volume for fallback
          if (audioPlayer?.volume !== undefined) {
            syncLofiVolume(audioPlayer.volume);
          }
          
          if (fallbackStream.type === 'youtube_video' || fallbackStream.url.includes('youtube.com')) {
            const videoId = extractYouTubeVideoId(fallbackStream.url);
            if (videoId) {
              await openLofiYouTubeOverlay(videoId);
              console.log('🎵 Fallback lofi overlay opened successfully');
            } else {
              throw new Error('Fallback YouTube stream also invalid');
            }
          } else {
            const fallbackStation = createLofiStation(fallbackStream);
            await audioPlayer.playRadio(fallbackStation);
          }
          
          console.log('🎵 Successfully started fallback lofi stream');
          
          // Schedule end of ad break with fallback
          const endTime = Date.now() + (duration * 60 * 1000);
          adBreakTimeoutRef.current = setTimeout(() => {
            endAdBreak();
          }, duration * 60 * 1000);
          
        } else {
          throw new Error('No working lofi streams available');
        }
      } catch (fallbackError) {
        console.error('Fallback lofi stream also failed:', fallbackError);
        // Clean up and throw original error
        setIsAdBreakActive(false);
        window.isAdBreakActive = false;
        audioPlayer.resumeRadioFromAdBreak();
        throw error;
      }
    }
  }, [audioPlayer]);  // ✅ ENHANCED: Main ad break start function with community timing support
  const startAdBreak = useCallback(async (useManualDuration = false, manualDuration = null) => {
    // ✅ FIX: Prevent multiple ad breaks from starting simultaneously
    if (isAdBreakActive) {
     // console.warn('🚨 Ad break already active, ignoring duplicate start request');
      return;
    }
    
    try {
      console.log('🎵 Starting ad break with mode:', adBreakMode);      

      // ✅ ULTRA-ROBUST: Determine duration with bulletproof community timing detection
      let duration;
      let usedCommunityTiming = false;
      let sessionTiming = null;
      
      if (useManualDuration && manualDuration) {
        duration = manualDuration;
        console.log('🎵 Using manual duration:', duration, 'minutes');
        usedCommunityTiming = false;
      } else {
        // ✅ CRITICAL: Check for active session first, then community timing, then manual fallback
        const activeContext = getCurrentAdBreakContext();
        
        if (activeContext && activeContext.isCommunity) {
          // Use duration from active community session
          duration = activeContext.duration;
          usedCommunityTiming = true;
          sessionTiming = activeContext.timing;
          console.log('🔔 Using active community session duration:', duration, 'minutes');
        } else if (nextCommunityTiming && nextCommunityTiming.duration) {
          duration = nextCommunityTiming.duration;
          usedCommunityTiming = true;
          console.log('🔔 Using ACTIVE community timing duration:', duration, 'minutes from', nextCommunityTiming.stationName);
        } else {
          // ✅ FALLBACK: Try to get fresh community timing if none is active
          const communityTiming = await getNextCommunityTiming();
          if (communityTiming && communityTiming.duration) {
            duration = communityTiming.duration;
            usedCommunityTiming = true;
            console.log('🔔 Using FRESH community timing duration:', duration, 'minutes');
          } else {
            // ✅ MANUAL FALLBACK: Use configured duration based on which timing was closer
            const now = new Date();
            const currentMinute = now.getMinutes();
            const timeToAdBreak1 = (adBreakMinute - currentMinute + 60) % 60;
            const timeToAdBreak2 = (adBreakMinute2 - currentMinute + 60) % 60;
            
            if (timeToAdBreak1 <= timeToAdBreak2) {
              duration = adBreakDuration;
            } else {
              duration = adBreakDuration2;
            }
            usedCommunityTiming = false;
            console.log('🎵 Using manual duration (no community timing):', duration, 'minutes');          }
        }
        
        // ✅ NEW: Create ad break session for tracking
        const sessionSource = usedCommunityTiming ? 'community' : 'manual';
        createAdBreakSession(sessionSource, sessionTiming || nextCommunityTiming, duration, audioPlayer.currentStation?.name);
        
        // ✅ ROBUST: Set community timing flags consistently
        setCurrentAdBreakUsedCommunityTiming(usedCommunityTiming);
        if (usedCommunityTiming) {
          showFeedbackPopupSafely(audioPlayer.currentStation?.name || '');
        }
      }// Clear any existing countdown interval first
      if (countdownIntervalRef.current) {
        console.log('🚨 Clearing existing countdown interval');
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      // Set countdown timer
      setCurrentAdBreakTimeLeft(duration * 60);
      window.currentAdBreakTimeLeft = duration * 60;

      // Start countdown
      console.log('🕒 Starting countdown timer for', duration * 60, 'seconds');
      countdownIntervalRef.current = setInterval(() => {
        setCurrentAdBreakTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            return 0;
          }
          const newTime = prev - 1;
          window.currentAdBreakTimeLeft = newTime;
          return newTime;
        });
      }, 1000);

      // Start the appropriate ad break type
      switch (adBreakMode) {
        case 'playlist':
          await startPlaylistAdBreak(duration);
          break;
        case 'nonstop':
          await startNonstopAdBreak(duration);
          break;
        case 'lofi':
          await startLofiAdBreak(duration);
          break;
        default:
          throw new Error(`Unknown ad break mode: ${adBreakMode}`);
      }

      if (window.addNotification) {
        window.addNotification(`🎵 Reclamepauze gestart (${getAdBreakModeDescription()}) - ${duration} min`, 'info', 4000);
      }

    } catch (error) {
      console.error('Failed to start ad break:', error);
      handleAdBreakError();
      
      if (window.addNotification) {
        window.addNotification(`❌ Reclamepauze mislukt: ${error.message}`, 'error', 5000);
      }
    }
  }, [adBreakMode, adBreakMinute, adBreakMinute2, adBreakDuration, adBreakDuration2, startPlaylistAdBreak, startNonstopAdBreak, startLofiAdBreak, getAdBreakModeDescription, handleAdBreakError, getNextCommunityTiming, audioPlayer, showFeedbackPopupSafely, getCurrentAdBreakContext, createAdBreakSession, currentAdBreakSession, showFeedbackPopup]);

  // ✅ NEW: Start ad break with community timing duration
  const startAdBreakWithCommunityDuration = useCallback(async (communityTiming) => {
    try {
      console.log('🔔 Starting ad break with community timing:', communityTiming);
      
      // Set flag for feedback popup
      setCurrentAdBreakUsedCommunityTiming(true);
      setFeedbackStationName(communityTiming.stationName);
      
      // ✅ NEW: Store the original radio station for nonstop mode restoration
      if (adBreakMode === 'nonstop' && audioPlayer.currentStation) {
        setOriginalRadioStation(audioPlayer.currentStation);
        console.log('🎵 Stored original radio station for nonstop mode:', audioPlayer.currentStation.name);
      }
        // Show feedback popup for community timing
      showFeedbackPopupSafely(communityTiming.stationName);
      
      // Use the community timing duration
      await startAdBreak(true, communityTiming.duration);
      
    } catch (error) {
      console.error('Failed to start ad break with community timing:', error);
      handleAdBreakError();
    }
  }, [startAdBreak, handleAdBreakError, adBreakMode, audioPlayer, showFeedbackPopupSafely]);  // ✅ ENHANCED: End ad break with proper restoration
  const endAdBreak = useCallback(() => {
    console.log('🎵 Ending ad break...');

    // ✅ FIX: Reset feedback popup state when ad break ends
    closeFeedbackPopupSafely();

    // ✅ CRITICAL: Clear ad break session when ending
    clearAdBreakSession();
    
    // ✅ CRITICAL: Reset community timing state
    setCurrentAdBreakUsedCommunityTiming(false);
    setNextCommunityTiming(null);
    setFeedbackStationName('');

    // Clear timeout and countdown interval
    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }// Close overlays if auto-close is enabled
    if (autoCloseOverlays) {
      // Close lofi overlay if open
      if (isLofiOverlayOpen()) {
        console.log('🔧 Auto-closing lofi overlay (auto-close enabled)');
        closeLofiYouTubeOverlay();
      }
        // Close floating YouTube player if open
      if (audioPlayer.showFloatingYouTube && audioPlayer.safeCloseFloatingYouTube) {
        audioPlayer.safeCloseFloatingYouTube('ad break ended');
      }
    } else {
      console.log('🔧 Auto-close disabled - leaving overlays open');
    }

    // Handle different restoration scenarios
    if (adBreakMode === 'nonstop' && originalRadioStation) {
      // ✅ NEW: For nonstop mode, always return to the original radio station
      console.log('🔄 Nonstop ad break ended - restoring original station:', originalRadioStation.name);
      
      // Mark as restoration to prevent queueing
      window.isNonstopRotation = true;
      
      audioPlayer.playRadio(originalRadioStation).then(() => {
        console.log('🔄 Successfully restored original radio station');
        setOriginalRadioStation(null); // Clear the stored station
        window.isNonstopRotation = false;
      }).catch(error => {
        console.error('Failed to restore original radio station:', error);
        window.isNonstopRotation = false;
        // Fallback to regular resume
        audioPlayer.resumeRadioFromAdBreak();
      });
    } else if (audioPlayer.isRadioPausedForAdBreak) {
      // For playlist and lofi modes, resume paused radio
      console.log('🎵 Resuming paused radio from ad break');
      audioPlayer.resumeRadioFromAdBreak();
    } else {
      console.log('🎵 No radio to resume from ad break');
    }    // Reset states
    setIsAdBreakActive(false);
    setShouldPlayPlaylistDuringAdBreak(false);
    setCurrentAdBreakTimeLeft(null);
    setCurrentAdBreakUsedCommunityTiming(false);
    setFeedbackStationName('');
    
    // ✅ NEW: Clear cycling button state when ad break ends
    setIsNonstopModeManuallyActive(false);
    
    // Clear global states
    window.isAdBreakActive = false;
    window.currentAdBreakTimeLeft = null;

    if (window.addNotification) {
      window.addNotification('🎵 Reclamepauze beëindigd', 'success', 2000);
    }
  }, [audioPlayer, adBreakMode, originalRadioStation, autoCloseOverlays, closeFeedbackPopupSafely, clearAdBreakSession]);

  // Manual ad break for testing
  const manualAdBreak = useCallback(() => {
    console.log('🎵 Manual ad break triggered');
    setIsManualTestActive(true);
    setIsManualTestInProgress(true);
    
    setTimeout(() => {
      setIsManualTestActive(false);
      setIsManualTestInProgress(false);
    }, 5000);
    
    startAdBreak();
  }, [startAdBreak]);  // Enhanced timer functionality
  const startTimer = useCallback(() => {
    // ✅ FIX: Prevent multiple timers from starting
    if (isTimerRunning) {
      console.warn('🚨 Timer already running, ignoring duplicate start request');
      return;
    }
    
    // ✅ NEW: Prevent timer start without radio station
    if (!audioPlayer.currentStation) {
      console.warn('🚨 Cannot start timer: No radio station selected');
      if (window.addNotification) {
        window.addNotification('⚠️ Selecteer eerst een radiostation voordat je switching activeert', 'warning', 4000);
      }
      return;
    }
    
    console.log('⏰ Starting ad break timer for station:', audioPlayer.currentStation.name);
    
    // ✅ CRITICAL FIX: Restore ad break session state if we're reactivating during an ad break
    const restoredSession = loadAdBreakSessionFromStorage();
    if (restoredSession && isAdBreakActive) {
      console.log('🔄 Restoring ad break session state on timer reactivation');
      
      if (restoredSession.source === 'community') {
        // ✅ RESTORE COMMUNITY TIMING STATE
        setCurrentAdBreakUsedCommunityTiming(true);
        setNextCommunityTiming(restoredSession.timing);
        setFeedbackStationName(restoredSession.stationName);
        
        console.log('🟡 Restored community timing state - timer will be GOLD again!');
      } else {
        // ✅ RESTORE MANUAL STATE
        setCurrentAdBreakUsedCommunityTiming(false);
        setNextCommunityTiming(null);
        setFeedbackStationName('');
        
        console.log('🔵 Restored manual timing state - timer will be BLUE/GRAY');
      }
    }
    
    setIsTimerRunning(true);
    
    const checkTime = async () => {
      const timeUntilNext = await getNextAdBreakTime();
      setNextAdBreakIn(timeUntilNext);

      if (timeUntilNext <= 0) {
        console.log('🎵 Ad break time reached!');
        await startAdBreak();
      }
    };

    checkTime();
    
    // ✅ FIX: Clear any existing timer interval first
    if (timerIntervalRef.current) {
      console.log('🚨 Clearing existing timer interval');
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    timerIntervalRef.current = setInterval(checkTime, 60000);
  }, [getNextAdBreakTime, startAdBreak, isTimerRunning, loadAdBreakSessionFromStorage, isAdBreakActive, audioPlayer.currentStation]);// ✅ ENHANCED: Stop timer with complete cleanup - USE THIS FOR "Deactiveer switching"
  const stopTimer = useCallback(() => {
    console.log('⏰ Stopping ad break timer with COMPLETE cleanup');
    
    // Stop the regular timer
    setIsTimerRunning(false);
    setNextAdBreakIn(null);
    
    // ✅ NEW: Clear manual timer states
    setManualTimerOverride(null);
    setIsManualTimerActive(false);
    skipNextTimerUpdateRef.current = false;
    
    // ✅ FIX: Reset timer cache to prevent stale data
    timerCacheRef.current = {
      cachedNextAdBreakTime: null,
      lastCommunityTimingCheck: 0
    };
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // ✅ CRITICAL: Also clear any active ad break and timers
    if (isAdBreakActive) {
      console.log('⏰ Also ending active ad break during deactivation');
      // DON'T call endAdBreak() as that tries to restore - just clean up
      setIsAdBreakActive(false);
      setShouldPlayPlaylistDuringAdBreak(false);
      setCurrentAdBreakUsedCommunityTiming(false);
      setFeedbackStationName('');
      setIsNonstopModeManuallyActive(false);
      
      // Clear global states
      window.isAdBreakActive = false;
      window.currentAdBreakTimeLeft = null;
    }
    
    // Clear any countdown timers
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }
    
    // Close overlays if auto-close is enabled and we were in an ad break
    if (isAdBreakActive && autoCloseOverlays) {
      console.log('🔧 Manual stop - closing overlays (auto-close enabled)');
      
      // Close lofi overlay if open
      if (isLofiOverlayOpen()) {
        closeLofiYouTubeOverlay();
      }
        // Close floating YouTube player if open
      if (audioPlayer.showFloatingYouTube && audioPlayer.safeCloseFloatingYouTube) {
        audioPlayer.safeCloseFloatingYouTube('manual timer stop');
      }
    } else if (isAdBreakActive && !autoCloseOverlays) {
      console.log('🔧 Manual stop - auto-close disabled, leaving overlays open');
    }
    
    setCurrentAdBreakTimeLeft(null);
    window.currentAdBreakTimeLeft = null;
    
    if (window.addNotification) {
      window.addNotification('⏰ Switching volledig gedeactiveerd', 'success', 2000);
    }
  }, [isAdBreakActive, autoCloseOverlays]);
  // ✅ ENHANCED: Check ad break time with community timing integration
  const checkAdBreakTime = useCallback(async () => {
    const now = new Date();
    const currentMinute = now.getMinutes();

    // Check for community timing first (simplified to prevent excessive calls)
    if (useCommunityTimings && audioPlayer.currentStation?.name) {
      try {
        // Use the same function as getNextCommunityTiming for consistency
        const communityTiming = await getNextCommunityTiming();
        
        if (communityTiming) {
          // Check if we're at or near the start minute
          const minutesDiff = Math.abs(currentMinute - communityTiming.startMinute);
          const wrappedDiff = Math.abs((currentMinute + 60) % 60 - communityTiming.startMinute);
          const nearStart = Math.min(minutesDiff, wrappedDiff) <= 1; // Within 1 minute
          
          if (nearStart) {
            console.log('🔔 Community timing triggered:', communityTiming);
            
            // ✅ NEW: Store original radio station before ad break
            if (adBreakMode === 'nonstop' && audioPlayer.currentStation) {
              setOriginalRadioStation(audioPlayer.currentStation);
            }
            
            const timingWithDuration = {
              ...communityTiming,
              duration: communityTiming.duration || adBreakDuration,
              stationName: audioPlayer.currentStation.name
            };
            
            await startAdBreakWithCommunityDuration(timingWithDuration);
            return;
          }
        }
      } catch (error) {
        console.warn('Error checking community timing:', error);
      }
    }

    // Fallback to manual timing check
    const isAdBreakTime1 = currentMinute === adBreakMinute;
    const isAdBreakTime2 = currentMinute === adBreakMinute2;

    if (isAdBreakTime1 || isAdBreakTime2) {
     // console.log('🎵 Manual ad break time reached');
      
      // ✅ NEW: Store original radio station before ad break
      if (adBreakMode === 'nonstop' && audioPlayer.currentStation) {
        setOriginalRadioStation(audioPlayer.currentStation);
      }
      
      await startAdBreak();
    }
  }, [useCommunityTimings, audioPlayer.currentStation, adBreakMinute, adBreakMinute2, adBreakDuration, startAdBreakWithCommunityDuration, startAdBreak, adBreakMode]);

  // ✅ NEW: Function to start ad break with remaining time
  const startAdBreakWithRemainingTime = useCallback(async (remainingMinutes) => {
    console.log('🎵 Starting ad break with remaining time:', remainingMinutes, 'minutes');
    await startAdBreak(true, remainingMinutes);
  }, [startAdBreak]);

  // ✅ NEW: Function to cancel ad break timer
  const cancelAdBreakTimer = useCallback(() => {
    console.log('🚫 Canceling ad break timer');
    
    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }
    
    setCurrentAdBreakTimeLeft(null);
    window.currentAdBreakTimeLeft = null;
    
    if (window.addNotification) {
      window.addNotification('🚫 Reclamepauze timer geannuleerd', 'info', 2000);
    }
  }, []);

  // Queue station switch functionality
  const queueStationSwitch = useCallback((station) => {
    console.log('📋 Queueing station switch:', station.name);
    setQueuedStation(station);
    
    if (window.addNotification) {
      window.addNotification(`📋 Station ${station.name} in wachtrij voor na reclamepauze`, 'info', 3000);
    }
  }, []);  // Effect for timer management - ✅ FIX: Check more frequently for ad break triggers
  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(checkAdBreakTime, 60000); // ✅ FIX: Reduced to every 60 seconds to prevent spam
      checkAdBreakTime(); // Check immediately
      
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, checkAdBreakTime]);// Effect for next ad break calculation - ✅ ULTRA-ROBUST: Bulletproof timer with consistent timing source
  useEffect(() => {
    if (isTimerRunning) {
      const COMMUNITY_TIMING_CHECK_INTERVAL = 60000; // Check community timing every 60 seconds

      const updateNextAdBreak = async () => {
        // ✅ MANUAL OVERRIDE: Use manual override if active
        if (isManualTimerActive && manualTimerOverride !== null) {
          setNextAdBreakIn(manualTimerOverride);
          
          if (manualTimerOverride <= 0) {
            console.log('🎵 Manual timer reached 0 - starting ad break');
            setIsManualTimerActive(false);
            setManualTimerOverride(null);
            await startAdBreak();
          }
          return;
        }
        
        // ✅ SKIP LOGIC: Skip update if manual change was made
        if (skipNextTimerUpdateRef.current) {
          skipNextTimerUpdateRef.current = false;
          console.log('⏰ Skipping one timer update due to manual change');
          return;
        }
        
        const now = Date.now();
        const cache = timerCacheRef.current;
        
        // ✅ CRITICAL FIX: Always refresh timing calculation to prevent confusion
        // Don't use stale calculations - recalculate every 10 seconds for accuracy
        if (now - cache.lastCommunityTimingCheck > 10000 || cache.cachedNextAdBreakTime === null) {
          // ✅ ROBUST: Get fresh timing calculation - this handles both community and manual
          cache.cachedNextAdBreakTime = await getNextAdBreakTime();
          cache.lastCommunityTimingCheck = now;
        } else {
          // ✅ LIGHTWEIGHT RECALC: For frequent updates, just recalculate seconds remaining
          // without making expensive community timing calls
          
          // ✅ CRITICAL: Use the SAME logic pattern as getNextAdBreakTime but faster
          const currentMinute = new Date().getMinutes();
          const currentSecond = new Date().getSeconds();
          
          // ✅ KEY FIX: Check if we still have a valid community timing
          if (nextCommunityTiming) {
            // Use community timing calculation (same as getNextAdBreakTime)
            const targetMinute = nextCommunityTiming.startMinute;
            let minutesUntil = (targetMinute - currentMinute + 60) % 60;
            
            if (minutesUntil === 0 && currentSecond <= 30) {
              cache.cachedNextAdBreakTime = 0;
            } else if (minutesUntil === 0) {
              // Missed this occurrence, set to next one
              cache.cachedNextAdBreakTime = (60 * 60) - currentSecond; // Next hour
            } else {
              const totalSecondsUntil = (minutesUntil * 60) - currentSecond;
              cache.cachedNextAdBreakTime = Math.max(0, totalSecondsUntil);
            }
          } else {
            // Use manual timing calculation (same as getNextAdBreakTime)
            const timeToAdBreak1Minutes = (adBreakMinute - currentMinute + 60) % 60;
            const timeToAdBreak2Minutes = (adBreakMinute2 - currentMinute + 60) % 60;
            
            let nextAdBreakMinutes = Math.min(timeToAdBreak1Minutes, timeToAdBreak2Minutes);
            
            if (nextAdBreakMinutes === 0) {
              if (currentSecond <= 30) {
                cache.cachedNextAdBreakTime = 0;
              } else {
                const allBreaks = [timeToAdBreak1Minutes, timeToAdBreak2Minutes].filter(t => t > 0);
                nextAdBreakMinutes = allBreaks.length > 0 ? Math.min(...allBreaks) : 60;
                cache.cachedNextAdBreakTime = (nextAdBreakMinutes * 60) - currentSecond;
              }
            } else {
              cache.cachedNextAdBreakTime = (nextAdBreakMinutes * 60) - currentSecond;
            }
            
            cache.cachedNextAdBreakTime = Math.max(0, cache.cachedNextAdBreakTime);
          }
        }
        
        setNextAdBreakIn(cache.cachedNextAdBreakTime);
        
        // ✅ TRIGGER CHECK: Start ad break if time reached
        if (cache.cachedNextAdBreakTime <= 0) {
          console.log('🎵 Ad break time reached!');
          await startAdBreak();
        }
      };
      
      updateNextAdBreak();
      const interval = setInterval(updateNextAdBreak, 1000); // Update every second for smooth countdown
      
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, isManualTimerActive, manualTimerOverride, getNextAdBreakTime, startAdBreak, adBreakMinute, adBreakMinute2, nextCommunityTiming]);

  // ✅ NEW: Separate effect to handle manual timer countdown
  useEffect(() => {
    if (isManualTimerActive && manualTimerOverride !== null && manualTimerOverride > 0) {
      const interval = setInterval(() => {
        setManualTimerOverride(prev => {
          const newValue = Math.max(0, prev - 1);
          return newValue;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isManualTimerActive, manualTimerOverride]);  // ✅ NEW: Restore ad break session on component mount
  useEffect(() => {
    const restoredSession = loadAdBreakSessionFromStorage();
    if (restoredSession) {
      console.log('🔄 Component mounted - checking for active ad break session');
      
      // If we're in an ad break and have a session, restore the state
      if (isAdBreakActive && restoredSession.source === 'community') {
        console.log('🟡 Auto-restoring community timing state on mount');
        setCurrentAdBreakUsedCommunityTiming(true);
        setNextCommunityTiming(restoredSession.timing);
        setFeedbackStationName(restoredSession.stationName);
      }
    }
  }, [loadAdBreakSessionFromStorage]); // Run only once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (adBreakTimeoutRef.current) {
        clearTimeout(adBreakTimeoutRef.current);
      }
      if (adDetectionIntervalRef.current) {
        clearInterval(adDetectionIntervalRef.current);
      }
    };
  }, []);

  // Save community timing preference
  useEffect(() => {
    try {
      localStorage.setItem('use_community_timings', JSON.stringify(useCommunityTimings));
      console.log('🔧 Community timing setting saved:', useCommunityTimings ? 'Community' : 'Eigen');
    } catch (error) {
      console.warn('Failed to save community timing setting:', error);
    }
  }, [useCommunityTimings]);  // ✅ NEW: Manual timer control functions
  const jumpToSwitchNow = useCallback(() => {
    if (isAdBreakActive && currentAdBreakTimeLeft !== null) {
      // For ad break countdown - jump to 0 to trigger immediate switch back
      console.log('⏰ Jumping ad break countdown to 0 - switching now');
      setCurrentAdBreakTimeLeft(0);
      window.currentAdBreakTimeLeft = 0;
      
      // Clear the countdown interval and trigger immediate end
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      
      // Trigger immediate end of ad break - this will restore the radio
      setTimeout(() => endAdBreak(), 100);
      
      if (window.addNotification) {
        window.addNotification('⏰ Direct terug naar radio', 'info', 2000);
      }
    } else if (isTimerRunning && nextAdBreakIn !== null) {
      // For normal countdown - jump to 0 to trigger immediate ad break
      console.log('⏰ Jumping timer countdown to 0 - starting ad break now');
      
      // ✅ FIX: Use persistent manual timer system for immediate switching
      setManualTimerOverride(0);
      setIsManualTimerActive(true);
      
      if (window.addNotification) {
        window.addNotification('⏰ Direct naar reclamepauze', 'info', 2000);
      }
    }
  }, [isAdBreakActive, currentAdBreakTimeLeft, isTimerRunning, nextAdBreakIn, endAdBreak]);const skipCurrentSwitch = useCallback(() => {
    if (isAdBreakActive && currentAdBreakTimeLeft !== null) {
      // For ad break countdown - cancel the current ad break permanently
      console.log('⏰ Canceling current ad break - no switch back');
      
      // Clear the countdown and timeout
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (adBreakTimeoutRef.current) {
        clearTimeout(adBreakTimeoutRef.current);
        adBreakTimeoutRef.current = null;
      }
      
      setCurrentAdBreakTimeLeft(null);
      window.currentAdBreakTimeLeft = null;
      
      if (window.addNotification) {
        window.addNotification('⏰ Switch terug geannuleerd', 'info', 2000);
      }
    } else if (isTimerRunning && nextAdBreakIn !== null) {
      // For normal countdown - skip to next ad break time
      console.log('⏰ Skipping current ad break moment - jumping to next');
      
      // ✅ FIX: Calculate next break properly using persistent manual timer
      const now = new Date();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();
      const timeToAdBreak1 = (adBreakMinute - currentMinute + 60) % 60;
      const timeToAdBreak2 = (adBreakMinute2 - currentMinute + 60) % 60;
      
      // Find the next ad break after current
      let nextBreakMinutes;
      if (timeToAdBreak1 === 0) {
        // Currently at first ad break, skip to second
        nextBreakMinutes = timeToAdBreak2 === 0 ? 60 : timeToAdBreak2;
      } else if (timeToAdBreak2 === 0) {
        // Currently at second ad break, skip to first
        nextBreakMinutes = timeToAdBreak1 === 0 ? 60 : timeToAdBreak1;
      } else {
        // Not at ad break time, skip the closest one
        const closestBreak = Math.min(timeToAdBreak1, timeToAdBreak2);
        const otherBreak = closestBreak === timeToAdBreak1 ? timeToAdBreak2 : timeToAdBreak1;
        nextBreakMinutes = otherBreak;
      }
      
      // Convert to seconds and set with persistent manual override
      const nextBreakSeconds = Math.max(60, (nextBreakMinutes * 60) - currentSecond);
      
      // ✅ FIX: Use persistent manual timer override system
      setManualTimerOverride(nextBreakSeconds);
      setIsManualTimerActive(true);
      
      if (window.addNotification) {
        window.addNotification('⏰ Huidige pauze overgeslagen', 'info', 2000);
      }
    }
  }, [isAdBreakActive, currentAdBreakTimeLeft, isTimerRunning, nextAdBreakIn, adBreakMinute, adBreakMinute2]);  const addOneMinute = useCallback(() => {
    if (isAdBreakActive && currentAdBreakTimeLeft !== null) {
      // For ad break countdown - add 60 seconds
      console.log('⏰ Adding 1 minute to ad break countdown');
      const newTime = currentAdBreakTimeLeft + 60;
      setCurrentAdBreakTimeLeft(newTime);
      window.currentAdBreakTimeLeft = newTime;
      
      // Extend the timeout
      if (adBreakTimeoutRef.current) {
        clearTimeout(adBreakTimeoutRef.current);
        adBreakTimeoutRef.current = setTimeout(() => {
          endAdBreak();
        }, newTime * 1000);
      }
      
      if (window.addNotification) {
        window.addNotification('⏰ +1 minuut toegevoegd', 'info', 2000);
      }
    } else if (isTimerRunning && nextAdBreakIn !== null) {
      // For normal countdown - add 60 seconds using persistent manual timer
      console.log('⏰ Adding 1 minute to timer countdown');
      
      // ✅ FIX: Use persistent manual timer override system
      const currentTime = manualTimerOverride !== null ? manualTimerOverride : nextAdBreakIn;
      const newTime = currentTime + 60;
      
      setManualTimerOverride(newTime);
      setIsManualTimerActive(true);
      
      if (window.addNotification) {
        window.addNotification('⏰ +1 minuut toegevoegd', 'info', 2000);
      }
    }
  }, [isAdBreakActive, currentAdBreakTimeLeft, isTimerRunning, nextAdBreakIn, manualTimerOverride, endAdBreak]);
  return {
    adBreakMinute,
    setAdBreakMinute,
    adBreakMinute2,
    setAdBreakMinute2,
    adBreakDuration,
    setAdBreakDuration,
    adBreakDuration2,
    setAdBreakDuration2,
    isTimerRunning,
    isAdBreakActive,
    nextAdBreakIn,
    playlistUrl,
    setPlaylistUrl,
    playlistShuffle,
    setPlaylistShuffle,
    currentAdBreakTimeLeft,
    enforcingAdBreak,
    setEnforcingAdBreak,
    queuedStation,
    setQueuedStation,
    isManualTestActive,
    setIsManualTestActive,
    shouldPlayPlaylistDuringAdBreak,
    setShouldPlayPlaylistDuringAdBreak,
    adBreakMode,
    setAdBreakMode,
    currentNonstopAttempt,
    currentLofiAttempt,
    isManualTestInProgress,
    autoAdDetectionEnabled,
    // ✅ DISABLED: Music detection setter function - always keeps it disabled
    setAutoAdDetectionEnabled: () => {
      console.log('🚫 Music detection is temporarily disabled - ignoring enable request');
      // Do nothing - always keep it false
    },    // Community timing states and methods
    useCommunityTimings,
    setUseCommunityTimings,
    showFeedbackPopup,
    setShowFeedbackPopup: closeFeedbackPopupSafely, // ✅ FIX: Use safe close function
    feedbackStationName,
    setFeedbackStationName,
    currentAdBreakUsedCommunityTiming, // Track if current ad break used community timing
    nextCommunityTiming, // Full community timing metadata for UI
    originalRadioStation, // For proper restoration in nonstop mode
    startAdBreak,
    endAdBreak,
    manualAdBreak,
    startTimer,
    stopTimer, // ✅ FIX: Now uses comprehensive cleanup
    startAdBreakWithRemainingTime,
    startAdBreakWithCommunityDuration, // Export the new function
    cancelAdBreakTimer, // ✅ ADD: Export the new function
    rotateToNextNonstopStation, // ✅ ADD: Export rotation function
    getAdBreakModeDescription,
    queueStationSwitch,
    // ✅ NEW: Manual timer control functions
    jumpToSwitchNow,
    skipCurrentSwitch,
    addOneMinute,
    // ✅ NEW: Simple nonstop mode state for cycling button
    isNonstopModeManuallyActive,
    setIsNonstopModeManuallyActive
  };
};
