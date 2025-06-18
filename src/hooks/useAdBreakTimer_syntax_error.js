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
  isLofiOverlayOpen        // ← Updated import
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

export const useAdBreakTimer = (audioPlayer, playlistProvider = 'youtube') => {
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
  // Queue system state removed - queueing disabled for reliability
  const [isManualTestActive, setIsManualTestActive] = useState(false);
  const [shouldPlayPlaylistDuringAdBreak, setShouldPlayPlaylistDuringAdBreak] = useState(false);
  const [adBreakMode, setAdBreakMode] = useState(() => loadFromStorage(STORAGE_KEYS.AD_BREAK_MODE, 'playlist')); // 'playlist', 'nonstop', 'lofi'
  const [currentNonstopAttempt, setCurrentNonstopAttempt] = useState(0);
  const [currentLofiAttempt, setCurrentLofiAttempt] = useState(0);
  const [isManualTestInProgress, setIsManualTestInProgress] = useState(false);
  const [isPermanentModeActive, setIsPermanentModeActive] = useState(false);

  // Automatic ad detection states - DISABLED: Music detection temporarily disabled
  const [autoAdDetectionEnabled, setAutoAdDetectionEnabled] = useState(() => {
    // ✅ QUICK FIX: Force music detection to always be disabled
    return false;
  });
  // Refs for interval management
  const timerIntervalRef = useRef(null);
  const adBreakTimeoutRef = useRef(null);
  const adDetectionIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null); // ✅ FIX: Add ref for countdown interval

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
  const [debugTimingState, setDebugTimingState] = useState(null);
  // ✅ FIXED: Get next community timing with correct function name
  const getNextCommunityTiming = useCallback(async () => {
    if (!useCommunityTimings || !audioPlayer.currentStation?.name) {
      return null;
    }

    try {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      
      // Use the correct function name
      const suggestions = await CommunityTimings.getSuggestedAdBreakTiming(audioPlayer.currentStation.name, currentHour);
      
      if (!suggestions) {
        return null;
      }

      // Check both half-hour and full-hour suggestions
      const potentialTimings = [];
      
      // Add half-hour timing if available (around :30)
      if (suggestions.halfHour && suggestions.halfHour.starts) {
        const halfHourTiming = new Date();
        halfHourTiming.setHours(currentHour, suggestions.halfHour.starts, 0, 0);
        
        // Only add if it's in the future (or very recent - within 30 seconds)
        if (currentMinute < suggestions.halfHour.starts || 
            (currentMinute === suggestions.halfHour.starts && currentTime.getSeconds() < 30)) {
          potentialTimings.push({
            start: halfHourTiming,
            end: suggestions.halfHour.ends ? 
              new Date(halfHourTiming.getTime() + (suggestions.halfHour.ends - suggestions.halfHour.starts) * 60 * 1000) :
              new Date(halfHourTiming.getTime() + adBreakDuration * 60 * 1000),
            duration: suggestions.halfHour.ends ? 
              Math.abs(suggestions.halfHour.ends - suggestions.halfHour.starts) : 
              adBreakDuration,
            type: 'halfHour',
            stationName: audioPlayer.currentStation.name,
            source: 'community'
          });
        }
      }
      
      // Add full-hour timing if available (around :00 of next hour)
      if (suggestions.fullHour && suggestions.fullHour.starts) {
        const fullHourTiming = new Date();
        fullHourTiming.setHours(currentHour + 1, suggestions.fullHour.starts, 0, 0);
        
        potentialTimings.push({
          start: fullHourTiming,
          end: suggestions.fullHour.ends ? 
            new Date(fullHourTiming.getTime() + (suggestions.fullHour.ends - suggestions.fullHour.starts) * 60 * 1000) :
            new Date(fullHourTiming.getTime() + adBreakDuration2 * 60 * 1000),
          duration: suggestions.fullHour.ends ? 
            Math.abs(suggestions.fullHour.ends - suggestions.fullHour.starts) : 
            adBreakDuration2,
          type: 'fullHour',
          stationName: audioPlayer.currentStation.name,
          source: 'community'
        });
      }

      // Return the nearest future timing with all metadata
      if (potentialTimings.length > 0) {
        potentialTimings.sort((a, b) => a.start - b.start);
        return potentialTimings[0];
      }

      return null;
    } catch (error) {
      console.warn('Failed to get community timing:', error);
      return null;
    }
  }, [useCommunityTimings, audioPlayer.currentStation?.name, adBreakDuration, adBreakDuration2]);

  // ✅ ENHANCED: Get next ad break time with community timing support
  const getNextAdBreakTime = useCallback(async () => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

    // Check for community timing first
    const communityTiming = await getNextCommunityTiming();
    if (communityTiming) {
      const minutesUntil = Math.round((communityTiming.start - now) / 1000 / 60);
      console.log('🔔 Next ad break (community):', minutesUntil, 'minutes');
      setNextCommunityTiming(communityTiming); // Store for UI
      return minutesUntil;
    }

    // Clear community timing if none found
    setNextCommunityTiming(null);

    // Fallback to manual timing
    const timeToAdBreak1 = (adBreakMinute - currentMinute + 60) % 60;
    const timeToAdBreak2 = (adBreakMinute2 - currentMinute + 60) % 60;
    const nextAdBreak = Math.min(timeToAdBreak1, timeToAdBreak2);
    
    return nextAdBreak === 0 ? 60 : nextAdBreak;
  }, [getNextCommunityTiming, adBreakMinute, adBreakMinute2]);

  // ✅ ENHANCED: Ad break mode descriptions
  const getAdBreakModeDescription = useCallback(() => {
    switch (adBreakMode) {
      case 'playlist': return 'afspeellijst';
      case 'nonstop': return 'nonstop radio';
      case 'lofi': return 'lofi muziek';      default: return 'alternatieve audio';
    }
  }, [adBreakMode]);

  // ✅ IMPROVED: Function to rotate to next nonstop station during ad break with error handling
  const rotateToNextNonstopStation = useCallback(async () => {
    if ((!isAdBreakActive && !isManualTestActive) || adBreakMode !== 'nonstop') {
      console.warn('❌ Cannot rotate: not in nonstop mode (ad break or manual test required)');
      return;
    }

    try {
      console.log('🔄 Manually rotating to next nonstop station...');
      
      // Try up to 3 stations to find a working one
      for (let attempt = 0; attempt < 3; attempt++) {
        const nextStation = getRandomNonstopStation();
        if (!nextStation) {
          throw new Error('Geen nonstop stations beschikbaar');
        }

        try {
          console.log(`🔄 Trying rotation to station ${attempt + 1}/3:`, nextStation.name);
          
          // Mark as rotation to avoid queue system
          window.isNonstopRotation = true;
          
          // Add timeout to prevent hanging
          const playPromise = audioPlayer.playRadio(nextStation);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Station timeout')), 8000)
          );
          
          await Promise.race([playPromise, timeoutPromise]);
          
          console.log('✅ Successfully rotated to:', nextStation.name);
          if (window.addNotification) {
            window.addNotification(`🔄 Gewisseld naar: ${nextStation.name}`, 'info', 2000);
          }
          return; // Success - exit
          
        } catch (stationError) {
          console.warn(`❌ Rotation attempt ${attempt + 1} failed:`, nextStation.name, stationError.message);
          
          // Mark station as failed
          if (window.markStationAsFailed) {
            window.markStationAsFailed(nextStation.name);
          }
          
          // If this is the last attempt, throw the error
          if (attempt === 2) {
            throw new Error('Alle nonstop stations falen - kan niet wisselen');
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to rotate nonstop station:', error);
      if (window.addNotification) {
        window.addNotification(`❌ Kan niet wisselen naar andere station`, 'error', 3000);
      }
    } finally {
      // Always clear rotation flag
      window.isNonstopRotation = false;
    }
  }, [isAdBreakActive, isManualTestActive, adBreakMode, audioPlayer]);

  // Handle ad break errors
  const handleAdBreakError = useCallback(() => {
    if (audioPlayer.isRadioPausedForAdBreak) {
      audioPlayer.resumeRadioFromAdBreak();
    }

    setIsAdBreakActive(false);
    setShouldPlayPlaylistDuringAdBreak(false);
    window.isAdBreakActive = false;
    window.currentAdBreakTimeLeft = null;

    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
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
    
    // ✅ CRITICAL FIX: Save radio state BEFORE pausing and ensure it's preserved
    const currentRadioState = audioPlayer.currentStation;
    console.log('🎵 Starting playlist ad break - current radio state:', currentRadioState);
    
    // Store radio state in multiple places for redundancy
    if (currentRadioState) {
      setOriginalRadioStation(currentRadioState);
      localStorage.setItem('adBreakRadioState', JSON.stringify({
        station: currentRadioState,
        timestamp: Date.now(),
        mode: 'playlist'
      }));
      console.log('🎵 Radio state saved for ad break recovery:', currentRadioState.name);
    }
    
    // Pause radio first
    audioPlayer.pauseRadioForAdBreak();
    
    // Set states
    setIsAdBreakActive(true);
    window.isAdBreakActive = true;
    
    // Try to start playlist
    try {
      if (playlistProvider === 'spotify') {
        // ✅ FIX: Enhanced debugging and validation for Spotify playlist
        console.log('🎵 Attempting to start Spotify playlist...');
        console.log('🎵 audioPlayer object:', audioPlayer);
        console.log('🎵 audioPlayer.playSpotifyPlaylist:', typeof audioPlayer.playSpotifyPlaylist);
        console.log('🎵 audioPlayer.spotifyPlayerReady:', audioPlayer.spotifyPlayerReady);
        console.log('🎵 audioPlayer.spotifyPlayerRef:', audioPlayer.spotifyPlayerRef?.current);
        
        if (!audioPlayer.playSpotifyPlaylist) {
          console.error('🚨 playSpotifyPlaylist function not available');
          console.error('🚨 Available audioPlayer functions:', Object.keys(audioPlayer).filter(key => typeof audioPlayer[key] === 'function'));
          throw new Error('playSpotifyPlaylist function not available - audioPlayer may not be initialized properly');
        }
        
        // ✅ FIX: Check if user is still authenticated with Spotify
        if (window.isSpotifyAuthenticated && !window.isSpotifyAuthenticated()) {
          throw new Error('Spotify authentication expired or invalid - please log in to Spotify again');
        }
        
        if (!audioPlayer.spotifyPlayerReady) {
          console.warn('⚠️ Spotify player not ready, attempting to initialize...');
          if (audioPlayer.manualInitializeSpotifyPlayer) {
            try {
              await audioPlayer.manualInitializeSpotifyPlayer();
              console.log('✅ Spotify player initialized successfully');
            } catch (initError) {
              console.error('❌ Failed to initialize Spotify player:', initError);
              throw new Error(`Failed to initialize Spotify player: ${initError.message}`);
            }
          } else {
            throw new Error('Spotify player not ready and no initialization method available');
          }
        }
        
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

    // ✅ FIX: Enhanced nonstop station fallback logic with better error prevention
    const tryNonstopStation = async (attempt = 0) => {
      const maxAttempts = 3; // Reduced from 5 to 3 to prevent long delays
      
      if (attempt >= maxAttempts) {
        console.error('❌ All nonstop stations failed after', maxAttempts, 'attempts');
        throw new Error(`Geen werkende nonstop stations beschikbaar na ${maxAttempts} pogingen`);
      }

      // Get next nonstop station (with failed station avoidance)
      const nonstopStation = getRandomNonstopStation();
      if (!nonstopStation) {
        throw new Error('Geen nonstop stations beschikbaar');
      }

      try {
        console.log(`🎵 Trying nonstop station ${attempt + 1}/${maxAttempts}:`, nonstopStation.name);
        
        // Mark this as a nonstop rotation so it doesn't get queued
        window.isNonstopRotation = true;

        // Add timeout to prevent hanging
        const playPromise = audioPlayer.playRadio(nonstopStation);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Station timeout after 10 seconds')), 10000)
        );
        
        await Promise.race([playPromise, timeoutPromise]);
        console.log('✅ Successfully switched to nonstop station:', nonstopStation.name);
        return nonstopStation;
        
      } catch (stationError) {
        console.warn(`❌ Nonstop station failed (attempt ${attempt + 1}):`, nonstopStation.name, stationError.message);
          // Mark station as failed for this session to avoid retry loops
        markStationAsFailed(nonstopStation.name);
        
        // Add delay between attempts to prevent rapid-fire requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try next station
        return tryNonstopStation(attempt + 1);
      }
    };    try {
      const successfulStation = await tryNonstopStation();

      // ✅ Only schedule end for non-permanent mode
      if (duration <= 60) {
        // Schedule end of ad break for test/temporary mode
        const endTime = Date.now() + (duration * 60 * 1000);
        adBreakTimeoutRef.current = setTimeout(() => {
          endAdBreak();
        }, duration * 60 * 1000);
        console.log(`🔄 Nonstop ad break scheduled to end at ${new Date(endTime).toLocaleTimeString()}`);
      } else {
        // Permanent mode - no auto-end timeout
        console.log(`🔄 Nonstop permanent mode started - no auto-end timeout set`);
        adBreakTimeoutRef.current = null; // Ensure no timeout is set
      }

    } catch (error) {
      console.error('❌ Failed to start nonstop ad break:', error);
      
      // ✅ FIX: Better error handling - graceful fallback without spam
      if (window.addNotification) {
        window.addNotification(`❌ Nonstop modus mislukt - schakel terug naar radio`, 'error', 4000);
      }
      
      // Try to restore original radio station
      if (originalRadioStation) {
        try {
          console.log('🔄 Fallback: Restoring original radio station');
          window.isNonstopRotation = false; // Clear rotation flag
          await audioPlayer.playRadio(originalRadioStation);
        } catch (restoreError) {
          console.error('❌ Failed to restore original station:', restoreError);
          // Don't show another notification - we already showed one above
        }
      }
      
      // End the ad break gracefully - don't throw error to prevent UI crashes
      console.log('🛑 Ending ad break due to nonstop failure');
      setIsAdBreakActive(false);
      window.isAdBreakActive = false;
      setShouldPlayPlaylistDuringAdBreak(false);
      setCurrentAdBreakTimeLeft(null);
      window.currentAdBreakTimeLeft = null;
      
      // Don't re-throw error to prevent crashes/loops
      return; // Exit gracefully instead of throwing
    } finally {
      // Always clear the rotation flag
      window.isNonstopRotation = false;
    }
  }, [audioPlayer, originalRadioStation]);

  // Lofi ad break
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
    }

    try {
      // Create station-like object for lofi
      const lofiStation = createLofiStation(lofiStream);

      // If it's a YouTube video, open in overlay
      if (lofiStream.type === 'youtube') {
        const videoId = extractYouTubeVideoId(lofiStream.url);
        if (videoId) {
          openLofiYouTubeOverlay(videoId);
          console.log('🎵 Opened lofi YouTube overlay:', lofiStream.name);
        } else {
          throw new Error('Invalid YouTube video ID');
        }
      } else {
        // For direct streams, use regular audio player
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
      throw error;
    }
  }, [audioPlayer]);

  // ✅ ENHANCED: Main ad break start function with community timing support
  const startAdBreak = useCallback(async (useManualDuration = false, manualDuration = null) => {
    // ✅ CRITICAL: Prevent infinite ad break loops
    if (isAdBreakActive) {
      console.warn('🚫 Ad break is already active - preventing infinite loop');
      return;
    }
    
    try {
      console.log('🎵 Starting ad break with mode:', adBreakMode);

      // Determine duration
      let duration;
      if (useManualDuration && manualDuration) {
        duration = manualDuration;
        console.log('🎵 Using manual duration:', duration, 'minutes');
      } else {
        // Check for community timing
        const communityTiming = await getNextCommunityTiming();
        if (communityTiming) {
          duration = communityTiming.duration;
          console.log('🔔 Using community timing duration:', duration, 'minutes');
          
          // Set flag for feedback popup
          setCurrentAdBreakUsedCommunityTiming(true);
          setFeedbackStationName(audioPlayer.currentStation?.name || '');
          
          // Show feedback popup for 10 seconds
          setShowFeedbackPopup(true);
          setTimeout(() => {
            setShowFeedbackPopup(false);
          }, 10000);
        } else {
          // Use configured duration
          const now = new Date();
          const currentMinute = now.getMinutes();
          const timeToAdBreak1 = (adBreakMinute - currentMinute + 60) % 60;
          const timeToAdBreak2 = (adBreakMinute2 - currentMinute + 60) % 60;
          
          if (timeToAdBreak1 <= timeToAdBreak2) {
            duration = adBreakDuration;
          } else {
            duration = adBreakDuration2;
          }
          console.log('🎵 Using configured duration:', duration, 'minutes');
          setCurrentAdBreakUsedCommunityTiming(false);        }
      }

      // Set countdown timer
      setCurrentAdBreakTimeLeft(duration * 60);
      window.currentAdBreakTimeLeft = duration * 60;

      // ✅ FIX: Clear any existing countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      // Start countdown
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
  }, [isAdBreakActive, adBreakMode, adBreakMinute, adBreakMinute2, adBreakDuration, adBreakDuration2, startPlaylistAdBreak, startNonstopAdBreak, startLofiAdBreak, getAdBreakModeDescription, handleAdBreakError, getNextCommunityTiming, audioPlayer]);

  // ✅ NEW: Start ad break with community timing duration
  const startAdBreakWithCommunityDuration = useCallback(async (communityTiming) => {
    try {
      console.log('🔔 Starting ad break with community timing:', communityTiming);
        // Set flag for feedback popup
      setCurrentAdBreakUsedCommunityTiming(true);
      setFeedbackStationName(communityTiming.stationName);
      
      // Set states
      setIsAdBreakActive(true);
      window.isAdBreakActive = true;
      window.currentAdBreakMode = adBreakMode; // ✅ FIX: Store current ad break mode globally
      
      // ✅ NEW: Store the original radio station for nonstop mode restoration
      if (adBreakMode === 'nonstop' && audioPlayer.currentStation) {
      setOriginalRadioStation(audioPlayer.currentStation);
      console.log('🎵 Stored original radio station for nonstop mode:', audioPlayer.currentStation.name);
    }
      
      // Show feedback popup for 10 seconds
      setShowFeedbackPopup(true);
      setTimeout(() => {
        setShowFeedbackPopup(false);
      }, 10000);
      
      // Use the community timing duration
      await startAdBreak(true, communityTiming.duration);
      
    } catch (error) {
      console.error('Failed to start ad break with community timing:', error);
      handleAdBreakError();
    }
  }, [startAdBreak, handleAdBreakError, adBreakMode, audioPlayer]);

  // ✅ ENHANCED: End ad break with proper restoration
  const endAdBreak = useCallback(() => {
    console.log('🎵 Ending ad break...');

    // Clear timeout
    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }
    
    // ✅ FIX: Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Close lofi overlay if open
    if (isLofiOverlayOpen()) {
      closeLofiYouTubeOverlay();
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
      });    } else {      // ✅ FIX: Enhanced radio resume logic for playlist mode with multiple fallbacks
      console.log('🎵 Ad break ending - attempting to resume radio...');
      console.log('🎵 audioPlayer.isRadioPausedForAdBreak:', audioPlayer.isRadioPausedForAdBreak);
      console.log('🎵 audioPlayer.pausedRadioStation:', audioPlayer.pausedRadioStation);
      console.log('🎵 adBreakMode:', adBreakMode);
      console.log('🎵 originalRadioStation:', originalRadioStation);
      
      // Define the resume function with multiple fallback mechanisms
      const attemptRadioResume = () => {
        // Priority 1: Use built-in radio pause state
        if (audioPlayer.isRadioPausedForAdBreak || audioPlayer.pausedRadioStation) {
          console.log('🎵 Resuming paused radio from ad break (priority 1)');
          audioPlayer.resumeRadioFromAdBreak();
          return;
        }
        
        // Priority 2: Use stored original radio station (for playlist ad breaks)
        if (originalRadioStation) {
          console.log('🎵 Resuming from stored original radio station (priority 2):', originalRadioStation.name);
          audioPlayer.playRadio(originalRadioStation);
          setOriginalRadioStation(null); // Clear after use
          return;
        }
        
        // Priority 3: Check localStorage for ad break radio state
        try {
          const adBreakState = localStorage.getItem('adBreakRadioState');
          if (adBreakState) {
            const radioState = JSON.parse(adBreakState);
            console.log('🎵 Found ad break radio state in localStorage (priority 3):', radioState.station.name);
            audioPlayer.playRadio(radioState.station);
            localStorage.removeItem('adBreakRadioState');
            return;
          }
        } catch (error) {
          console.error('Error reading ad break radio state from localStorage:', error);
        }
        
        // Priority 4: Check localStorage for general paused radio state
        try {
          const savedState = localStorage.getItem('pausedRadioState');
          if (savedState) {
            const radioState = JSON.parse(savedState);
            console.log('🎵 Found saved radio state in localStorage (priority 4):', radioState.station.name);
            audioPlayer.playRadio(radioState.station);
            localStorage.removeItem('pausedRadioState');
            return;
          }
        } catch (error) {
          console.error('Error checking localStorage for radio state:', error);
        }
        
        // Priority 5: Check if there's any current station reference
        if (audioPlayer.currentStation) {
          console.log('🎵 Attempting to restart current station (priority 5):', audioPlayer.currentStation.name);
          audioPlayer.playRadio(audioPlayer.currentStation);
          return;
        }
        
        // No radio to resume
        console.log('🎵 No radio to resume from ad break - all fallback mechanisms exhausted');
        if (window.addNotification) {
          window.addNotification('⚠️ Geen radio gevonden om te hervatten', 'warning', 3000);
        }
      };
        // First, stop any playing playlist to free up audio resources
      if (audioPlayer.currentSource === 'playlist') {
        console.log('🛑 Stopping playlist before resuming radio');
        audioPlayer.forceStopAllAudio('ad break ending');
        
        // Wait a moment for cleanup, then attempt resume
        setTimeout(() => {
          console.log('🔄 Attempting radio resume after playlist cleanup...');
          attemptRadioResume();
        }, 300);
      } else {
        console.log('🔄 No playlist to stop, attempting direct radio resume...');
        attemptRadioResume();
      }
    }

    // Reset states with enhanced logging
    console.log('🎵 Resetting ad break states...');
    setIsAdBreakActive(false);
    setShouldPlayPlaylistDuringAdBreak(false);
    setCurrentAdBreakTimeLeft(null);
    setCurrentAdBreakUsedCommunityTiming(false);
    setFeedbackStationName('');
    
    // Clear global states
    window.isAdBreakActive = false;
    window.currentAdBreakTimeLeft = null;
    window.currentAdBreakMode = null; // ✅ FIX: Clear the ad break mode
    
    // Clean up localStorage ad break states
    try {
      localStorage.removeItem('adBreakRadioState');
    } catch (error) {
      console.warn('Error cleaning up ad break localStorage:', error);
    }

    if (window.addNotification) {
      window.addNotification('🎵 Reclamepauze beëindigd', 'success', 2000);
    }
    
    console.log('🎵 Ad break ended - final state check:');
    console.log('🎵 Final audioPlayer.isRadioPausedForAdBreak:', audioPlayer.isRadioPausedForAdBreak);
    console.log('🎵 Final audioPlayer.pausedRadioStation:', audioPlayer.pausedRadioStation);
    console.log('🎵 Final audioPlayer.currentStation:', audioPlayer.currentStation);
    console.log('🎵 Final audioPlayer.currentSource:', audioPlayer.currentSource);
  }, [audioPlayer, adBreakMode, originalRadioStation]);

  // Manual ad break for testing
  const manualAdBreak = useCallback((durationMinutes = 5) => {
    // ✅ CRITICAL: Prevent rapid test button clicking
    if (isManualTestInProgress) {
      console.log('🚫 Manual test operation already in progress');
      return;
    }

    if (adBreakMode === 'playlist' && !playlistUrl) {
      if (window.addNotification) {
        window.addNotification('❌ Voer eerst een geldige playlist URL in', 'error', 3000);
      }
      return;
    }

    setIsManualTestInProgress(true);
    
    const isLongDuration = durationMinutes > 60; // More than 1 hour is considered "permanent"
    console.log(`🎵 Manual ad break called with duration: ${durationMinutes} minutes (${isLongDuration ? 'permanent mode' : 'test mode'})`);

    try {
      if (isManualTestActive) {
        // Stop manual test
        console.log('🎵 Stopping manual ad break test');
        setIsManualTestActive(false);
        setShouldPlayPlaylistDuringAdBreak(false);

        // ✅ Store permanent mode state before clearing timeout
        const wasPermanentMode = isPermanentModeActive;
        setIsPermanentModeActive(false);

        // ✅ Clear any timeout for permanent mode
        if (adBreakTimeoutRef.current) {
          clearTimeout(adBreakTimeoutRef.current);
          adBreakTimeoutRef.current = null;
          console.log('⏰ Cleared permanent mode timeout');
        }

        // ✅ NUCLEAR CLEANUP: Stop ALL audio sources
        if (audioPlayer.currentSource === 'playlist') {
          if (audioPlayer.currentPlaylistProvider === 'spotify' && audioPlayer.spotifyPlayerRef?.current) {
            import('../utils/spotifyUtils').then(({ pauseSpotify }) => pauseSpotify());
          }
          if (audioPlayer.currentPlaylistProvider === 'youtube' && audioPlayer.youtubePlayerRef?.current) {
            audioPlayer.youtubePlayerRef.current.pauseVideo();
            audioPlayer.youtubePlayerRef.current.stopVideo();
          }
        }

        if (audioPlayer.currentSource === 'radio' && audioPlayer.audioRef?.current) {
          audioPlayer.audioRef.current.pause();
        }

        // Close Lofi overlay
        closeLofiYouTubeOverlay();

        // ✅ IMPORTANT: Clear nonstop mode global state
        window.isInNonstopMode = false;
        window.isAdBreakActive = false;
        window.currentAdBreakMode = null;

        if (!wasPermanentMode && audioPlayer.isRadioPausedForAdBreak && audioPlayer.pausedRadioStation) {
          // TEST MODE: Resume radio if it was paused for ad break
          setTimeout(() => {
            audioPlayer.resumeRadioFromAdBreak();
          }, 300);
        } else if (wasPermanentMode) {
          console.log('🎵 Permanent mode stopped - radio will not resume (was completely stopped)');
        }

        if (window.addNotification) {
          window.addNotification('🛑 Test pauze gestopt', 'info', 2000);
        }
      } else {
        // Start manual test with proper sequencing
        console.log(`🎵 Starting manual ad break test with mode: ${adBreakMode}`);
        setIsManualTestActive(true);
        setShouldPlayPlaylistDuringAdBreak(true);

        // ✅ CRITICAL: Set ad break active state for UI elements
        setIsAdBreakActive(true);
        window.isAdBreakActive = true;
        window.currentAdBreakMode = adBreakMode;

        // ✅ NEW: Only set timeout for test mode, not permanent mode
        if (!isLongDuration) {
          // For short test mode, set a timeout to auto-stop
          console.log(`🕐 Setting ${durationMinutes} minute timeout for test mode`);
          
          // Clear any existing timeout first
          if (adBreakTimeoutRef.current) {
            clearTimeout(adBreakTimeoutRef.current);
          }
          
          // Set new timeout for test duration
          adBreakTimeoutRef.current = setTimeout(() => {
            console.log('🕐 Test mode timeout reached - ending test');
            setIsManualTestActive(false);
            setShouldPlayPlaylistDuringAdBreak(false);
            setIsAdBreakActive(false);
            window.isAdBreakActive = false;
            window.currentAdBreakMode = null;
            window.isInNonstopMode = false;
            
            // Stop current playlist/audio
            if (audioPlayer.currentSource === 'playlist') {
              if (audioPlayer.currentPlaylistProvider === 'spotify' && audioPlayer.spotifyPlayerRef?.current) {
                import('../utils/spotifyUtils').then(({ pauseSpotify }) => pauseSpotify());
              }
              if (audioPlayer.currentPlaylistProvider === 'youtube' && audioPlayer.youtubePlayerRef?.current) {
                audioPlayer.youtubePlayerRef.current.pauseVideo();
                audioPlayer.youtubePlayerRef.current.stopVideo();
              }
            }
            
            if (window.addNotification) {
              window.addNotification(`⏰ Test beëindigd na ${durationMinutes} minuten`, 'info', 3000);
            }
          }, durationMinutes * 60 * 1000);
        } else {
          // For permanent mode, clear any existing timeout but don't set a new one
          // This allows infinite playback
          if (adBreakTimeoutRef.current) {
            clearTimeout(adBreakTimeoutRef.current);
            adBreakTimeoutRef.current = null;
          }
          setIsPermanentModeActive(true); // ✅ Set permanent mode flag
          console.log('🎵 Permanent mode activated - no auto-stop timeout set');
        }

        const isRadioPlaying = audioPlayer.isPlaying && audioPlayer.currentStation && audioPlayer.currentSource === 'radio';

        if (isRadioPlaying) {
          if (isLongDuration) {
            // ✅ PERMANENT MODE: Completely stop radio (don't pause for ad break)
            console.log('🎵 Stopping radio completely for permanent mode (no resume)');
            audioPlayer.stopRadio(); // Complete stop, no resume logic
          } else {
            // ✅ TEST MODE: Pause radio for ad break (will resume after test)
            console.log('🎵 Pausing radio for manual test');
            audioPlayer.pauseRadioForAdBreak();
          }          setTimeout(async () => {
            try {
              if (adBreakMode === 'playlist') {
                const playlistId = extractPlaylistId(playlistUrl, playlistProvider);
                if (playlistId) {
                  await audioPlayer.playPlaylist(playlistId, {
                    shuffle: playlistShuffle,
                    repeat: 'all',
                    provider: playlistProvider
                  });
                }
              } else if (adBreakMode === 'nonstop') {
                // ✅ CRITICAL: Set nonstop mode flag for UI elements
                window.isInNonstopMode = true;
                try {
                  await startNonstopAdBreak(durationMinutes);
                } catch (error) {
                  console.error('Nonstop test failed completely:', error);
                  if (window.addNotification) {
                    window.addNotification(`❌ Alle nonstop stations mislukt: ${error.message}`, 'error', 5000);
                  }
                  // Reset manual test state on complete failure
                  setIsManualTestActive(false);
                  setShouldPlayPlaylistDuringAdBreak(false);
                  setIsAdBreakActive(false);
                  window.isAdBreakActive = false;
                  window.currentAdBreakMode = null;
                  window.isInNonstopMode = false;
                }
              } else if (adBreakMode === 'lofi') {
                try {
                  await startLofiAdBreak(durationMinutes);
                } catch (error) {
                  console.error('Lofi test failed completely:', error);
                  if (window.addNotification) {
                    window.addNotification(`❌ Alle lofi streams mislukt: ${error.message}`, 'error', 5000);
                  }
                  // Reset manual test state on complete failure
                  setIsManualTestActive(false);
                  setShouldPlayPlaylistDuringAdBreak(false);
                  setIsAdBreakActive(false);
                  window.isAdBreakActive = false;
                  window.currentAdBreakMode = null;
                }
              }
            } catch (error){
              console.error('Manual test failed:', error);
              if (window.addNotification) {
                window.addNotification(`❌ Test mislukt: ${error.message}`, 'error', 3000);
              }
              // Reset states on error
              setIsManualTestActive(false);
              setShouldPlayPlaylistDuringAdBreak(false);
              setIsAdBreakActive(false);
              window.isAdBreakActive = false;
              window.currentAdBreakMode = null;
              window.isInNonstopMode = false;
            }
          }, 500);
        } else {
          // No radio playing, start immediately
          (async () => {            try {
              if (adBreakMode === 'playlist') {
                const playlistId = extractPlaylistId(playlistUrl, playlistProvider);
                if (playlistId) {
                  await audioPlayer.playPlaylist(playlistId, {
                    shuffle: playlistShuffle,
                    repeat: 'all',
                    provider: playlistProvider
                  });
                }
              } else if (adBreakMode === 'nonstop') {
                // ✅ CRITICAL: Set nonstop mode flag for UI elements
                window.isInNonstopMode = true;
                try {
                  await startNonstopAdBreak(durationMinutes);
                } catch (error) {
                  console.error('Nonstop test failed completely:', error);
                  if (window.addNotification) {
                    window.addNotification(`❌ Alle nonstop stations mislukt`, 'error', 5000);
                  }
                  setIsManualTestActive(false);
                  setShouldPlayPlaylistDuringAdBreak(false);
                  setIsAdBreakActive(false);
                  window.isAdBreakActive = false;
                  window.currentAdBreakMode = null;
                  window.isInNonstopMode = false;
                }
              } else if (adBreakMode === 'lofi') {
                try {
                  await startLofiAdBreak(durationMinutes);
                } catch (error) {
                  console.error('Lofi test failed completely:', error);
                  if (window.addNotification) {
                    window.addNotification(`❌ Alle lofi streams mislukt`, 'error', 5000);
                  }
                  setIsManualTestActive(false);
                  setShouldPlayPlaylistDuringAdBreak(false);
                  setIsAdBreakActive(false);
                  window.isAdBreakActive = false;
                  window.currentAdBreakMode = null;
                }
              }
            } catch (error) {
              console.error('Manual test failed:', error);
              if (window.addNotification) {
                window.addNotification(`❌ Test mislukt: ${error.message}`, 'error', 3000);
              }
              setIsManualTestActive(false);
              setShouldPlayPlaylistDuringAdBreak(false);
              setIsAdBreakActive(false);
              window.isAdBreakActive = false;
              window.currentAdBreakMode = null;
              window.isInNonstopMode = false;
            }
          })();
        }        if (window.addNotification) {
          const durationText = isLongDuration ? 'permanent' : `${durationMinutes} min`;
          window.addNotification(`🧪 ${isLongDuration ? 'Permanente' : 'Test'} pauze gestart (${getAdBreakModeDescription()}) ${isLongDuration ? '' : `- klik opnieuw om te stoppen`}`, 'info', 3000);
        }
      }
    } catch (error) {
      console.error('Manual ad break operation failed:', error);
    } finally {
      // ✅ Always reset the lock after a delay
      setTimeout(() => {
        setIsManualTestInProgress(false);
      }, 1000);
    }
  }, [
    audioPlayer, 
    adBreakMode, 
    playlistUrl, 
    playlistShuffle, 
    playlistProvider, 
    isManualTestActive, 
    setIsManualTestActive, 
    setShouldPlayPlaylistDuringAdBreak, 
    startNonstopAdBreak, 
    startLofiAdBreak, 
    getAdBreakModeDescription, 
    isPermanentModeActive
  ]);

  // Enhanced timer functionality
  const startTimer = useCallback(() => {
    console.log('⏰ Starting ad break timer');
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
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    timerIntervalRef.current = setInterval(checkTime, 60000);  }, [getNextAdBreakTime, startAdBreak]);

  // ✅ ENHANCED: Stop timer and exit any active ad break mode
  const stopTimer = useCallback(() => {
    console.log('⏰ Stopping ad break timer and exiting any active modes');
    setIsTimerRunning(false);
    setNextAdBreakIn(null);
    setNextCommunityTiming(null);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // ✅ CRITICAL: If we're currently in nonstop mode or any ad break, end it properly
    if (isAdBreakActive) {
      console.log('🛑 Force ending active ad break due to timer stop');
      endAdBreak();
    }

    if (window.addNotification) {
      window.addNotification('⏰ Reclamepauze timer gestopt', 'info', 2000);
    }  }, [isAdBreakActive, endAdBreak]);

  // ✅ ENHANCED: Check ad break time with community timing integration
  const checkAdBreakTime = useCallback(async () => {
    // ✅ CRITICAL: Prevent infinite loop by checking if ad break is already active
    if (isAdBreakActive) {
      //console.log('🚫 Ad break already active, skipping auto-trigger');
      return;
    }
    
    const now = new Date();
    const currentMinute = now.getMinutes();

    // Check for community timing first
    if (useCommunityTimings && audioPlayer.currentStation?.name) {
      try {
        // Use the correct function name from the cleaned version above
        const communityTiming = await getNextCommunityTiming();
        
        if (communityTiming && communityTiming.start) {
          const minutesUntilStart = Math.round((communityTiming.start - now) / 1000 / 60);
          
          // If community timing is within 1 minute, use it
          if (minutesUntilStart <= 1 && minutesUntilStart >= 0) {
            console.log('🔔 Community timing triggered:', communityTiming);
            
            // ✅ NEW: Store original radio station before ad break
            if (adBreakMode === 'nonstop' && audioPlayer.currentStation) {
              setOriginalRadioStation(audioPlayer.currentStation);
            }
            
            await startAdBreakWithCommunityDuration(communityTiming);
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
      console.log('🎵 Manual ad break time reached');
      
      // ✅ NEW: Store original radio station before ad break
      if (adBreakMode === 'nonstop' && audioPlayer.currentStation) {
        setOriginalRadioStation(audioPlayer.currentStation);      }
      
      await startAdBreak();
    }
  }, [isAdBreakActive, useCommunityTimings, audioPlayer.currentStation, adBreakMinute, adBreakMinute2, adBreakDuration, startAdBreakWithCommunityDuration, startAdBreak, adBreakMode]);

  // ✅ NEW: Function to start ad break with remaining time
  const startAdBreakWithRemainingTime = useCallback(async (remainingMinutes) => {
    console.log('🎵 Starting ad break with remaining time:', remainingMinutes, 'minutes');
    await startAdBreak(true, remainingMinutes);  }, [startAdBreak]);

  // ✅ NEW: Function to cancel ad break timer
  const cancelAdBreakTimer = useCallback(() => {
    console.log('🚫 Canceling ad break timer');
    
    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }
    
    // ✅ FIX: Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    setCurrentAdBreakTimeLeft(null);
    window.currentAdBreakTimeLeft = null;
    
    if (window.addNotification) {
      window.addNotification('🚫 Reclamepauze timer geannuleerd', 'info', 2000);
    }  }, []);

  // Queue functions disabled - system removed for reliability
  const queueStationSwitch = useCallback(() => {
    console.log('� Queue system disabled - playing immediately');
  }, []);

  const cancelQueuedSwitch = useCallback(() => {
    console.log('🚫 Queue system disabled - no action needed');
  }, []);

  // ✅ NEW: Force exit from any active ad break or nonstop mode
  const forceExitAdBreakMode = useCallback(() => {
    console.log('🛑 FORCE EXIT: Exiting any active ad break or nonstop mode');

    // Stop timer if running
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // ✅ FIX: Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Clear any pending ad break timeout
    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }

    // Close lofi overlay if open
    if (isLofiOverlayOpen()) {
      closeLofiYouTubeOverlay();
    }

    // Force stop all audio to prevent conflicts
    if (audioPlayer.forceStopAllAudio) {
      audioPlayer.forceStopAllAudio('force exit nonstop mode');
    }

    // Clear nonstop rotation flags
    window.isNonstopRotation = false;

    // Reset ALL states to normal
    setIsTimerRunning(false);
    setIsAdBreakActive(false);
    setShouldPlayPlaylistDuringAdBreak(false);
    setCurrentAdBreakTimeLeft(null);
    setCurrentAdBreakUsedCommunityTiming(false);
    setFeedbackStationName('');
    setNextAdBreakIn(null);
    setNextCommunityTiming(null);
    setOriginalRadioStation(null);
    setIsManualTestActive(false);
    setIsManualTestInProgress(false);
    
    // Clear global states
    window.isAdBreakActive = false;
    window.currentAdBreakTimeLeft = null;
    window.isTimerRunning = false;

    // Small delay then try to resume normal radio if there was a paused station
    setTimeout(() => {
      if (audioPlayer.isRadioPausedForAdBreak) {
        console.log('🎵 Attempting to resume paused radio after force exit');
        try {
          audioPlayer.resumeRadioFromAdBreak();
        } catch (error) {
          console.warn('Could not resume paused radio:', error);
        }
      }
    }, 500);

    if (window.addNotification) {
      window.addNotification('🛑 Geforceerd uitgeschakeld - alle modi gestopt', 'warning', 3000);
    }
  }, [audioPlayer]);

  // Effect for timer management
  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(checkAdBreakTime, 60000);
      checkAdBreakTime(); // Check immediately
      
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, checkAdBreakTime]);

  // Effect for next ad break calculation
  useEffect(() => {
    if (isTimerRunning) {
      const updateNextAdBreak = async () => {
        const timeUntilNext = await getNextAdBreakTime();
        setNextAdBreakIn(timeUntilNext);
      };
      
      updateNextAdBreak();
      const interval = setInterval(updateNextAdBreak, 60000);
      
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, getNextAdBreakTime]);
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
      // ✅ FIX: Clear countdown interval on unmount
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
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
  }, [useCommunityTimings]);
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
    nextCommunityTiming,
    playlistUrl,
    setPlaylistUrl,
    playlistShuffle,
    setPlaylistShuffle,
    shouldPlayPlaylistDuringAdBreak,
    setShouldPlayPlaylistDuringAdBreak,
    currentAdBreakTimeLeft,
    enforcingAdBreak,
    setEnforcingAdBreak,
    isManualTestActive,
    setIsManualTestActive,
    adBreakMode,
    setAdBreakMode,
    currentNonstopAttempt,
    currentLofiAttempt,
    isManualTestInProgress,
    autoAdDetectionEnabled,
    setAutoAdDetectionEnabled: () => {
      console.log('🚫 Music detection is disabled - ignoring enable request');
    },
    useCommunityTimings,
    setUseCommunityTimings,
    showFeedbackPopup,
    setShowFeedbackPopup,
    feedbackStationName,
    setFeedbackStationName,
    currentAdBreakUsedCommunityTiming,
    originalRadioStation,
    startAdBreak,
    endAdBreak,
    manualAdBreak,
    startTimer,
    stopTimer,
    startAdBreakWithRemainingTime,
    startAdBreakWithCommunityDuration,
    cancelAdBreakTimer,
    rotateToNextNonstopStation,
    getAdBreakModeDescription,
    queueStationSwitch,
    cancelQueuedSwitch,
    forceExitAdBreakMode
  };
};
