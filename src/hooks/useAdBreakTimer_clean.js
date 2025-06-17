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
  const [queuedStation, setQueuedStation] = useState(null);
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

  // ✅ NEW: Get next community timing with better logic
  const getNextCommunityTiming = useCallback(async () => {
    if (!useCommunityTimings || !audioPlayer.currentStation?.name) {
      return null;
    }

    try {
      const currentTime = new Date();
      const timing = await CommunityTimings.getNextAdBreakTime(audioPlayer.currentStation.name, currentTime);
      
      // Only return if it's a real community timing (has start and end times)
      if (timing && timing.start && timing.end) {
        const duration = Math.round((timing.end - timing.start) / 1000 / 60); // Convert to minutes
        return {
          start: timing.start,
          end: timing.end,
          duration: duration,
          stationName: audioPlayer.currentStation.name,
          source: 'community'
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to get community timing:', error);
      return null;
    }
  }, [useCommunityTimings, audioPlayer.currentStation?.name]);

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
      case 'lofi': return 'lofi muziek';
      default: return 'alternatieve audio';
    }
  }, [adBreakMode]);

  // ✅ NEW: Function to rotate to next nonstop station during ad break
  const rotateToNextNonstopStation = useCallback(async () => {
    if (!isAdBreakActive || adBreakMode !== 'nonstop') {
      console.warn('Cannot rotate: not in nonstop ad break mode');
      return;
    }

    try {
      console.log('🔄 Manually rotating to next nonstop station...');
      
      // Get the next station
      const nextStation = getRandomNonstopStation();
      if (!nextStation) {
        throw new Error('No nonstop stations available');
      }

      // Switch to the new station
      await audioPlayer.playRadio(nextStation);
      
      if (window.addNotification) {
        window.addNotification(`🔄 Gewisseld naar: ${nextStation.name}`, 'info', 3000);
      }
    } catch (error) {
      console.error('Failed to rotate nonstop station:', error);
      if (window.addNotification) {
        window.addNotification(`❌ Kan niet wisselen: ${error.message}`, 'error', 3000);
      }
    }
  }, [isAdBreakActive, adBreakMode, audioPlayer]);

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
    }

    // Set states
    setIsAdBreakActive(true);
    window.isAdBreakActive = true;
    setShouldPlayPlaylistDuringAdBreak(false);
    setCurrentNonstopAttempt(0);

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
  }, [audioPlayer]);

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
          setCurrentAdBreakUsedCommunityTiming(false);
        }
      }

      // Set countdown timer
      setCurrentAdBreakTimeLeft(duration * 60);
      window.currentAdBreakTimeLeft = duration * 60;

      // Start countdown
      const countdownInterval = setInterval(() => {
        setCurrentAdBreakTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
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
  }, [adBreakMode, adBreakMinute, adBreakMinute2, adBreakDuration, adBreakDuration2, startPlaylistAdBreak, startNonstopAdBreak, startLofiAdBreak, getAdBreakModeDescription, handleAdBreakError, getNextCommunityTiming, audioPlayer]);

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
      });
    } else if (audioPlayer.isRadioPausedForAdBreak) {
      // For playlist and lofi modes, resume paused radio
      console.log('🎵 Resuming paused radio from ad break');
      audioPlayer.resumeRadioFromAdBreak();
    } else {
      console.log('🎵 No radio to resume from ad break');
    }

    // Reset states
    setIsAdBreakActive(false);
    setShouldPlayPlaylistDuringAdBreak(false);
    setCurrentAdBreakTimeLeft(null);
    setCurrentAdBreakUsedCommunityTiming(false);
    setFeedbackStationName('');
    
    // Clear global states
    window.isAdBreakActive = false;
    window.currentAdBreakTimeLeft = null;

    if (window.addNotification) {
      window.addNotification('🎵 Reclamepauze beëindigd', 'success', 2000);
    }
  }, [audioPlayer, adBreakMode, originalRadioStation]);

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
  }, [startAdBreak]);

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
    
    timerIntervalRef.current = setInterval(checkTime, 60000);
  }, [getNextAdBreakTime, startAdBreak]);

  const stopTimer = useCallback(() => {
    console.log('⏰ Stopping ad break timer');
    setIsTimerRunning(false);
    setNextAdBreakIn(null);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // ✅ ENHANCED: Check ad break time with community timing integration
  const checkAdBreakTime = useCallback(async () => {
    const now = new Date();
    const currentMinute = now.getMinutes();

    // Check for community timing first
    if (useCommunityTimings && audioPlayer.currentStation?.name) {
      try {
        const communityTiming = await CommunityTimings.getNextAdBreakTime(audioPlayer.currentStation.name, now);
        
        if (communityTiming && communityTiming.start) {
          const minutesUntilStart = Math.round((communityTiming.start - now) / 1000 / 60);
          
          // If community timing is within 1 minute, use it
          if (minutesUntilStart <= 1 && minutesUntilStart >= 0) {
            console.log('🔔 Community timing triggered:', communityTiming);
            
            // ✅ NEW: Store original radio station before ad break
            if (adBreakMode === 'nonstop' && audioPlayer.currentStation) {
              setOriginalRadioStation(audioPlayer.currentStation);
            }
            
            // Calculate duration if end time is available
            const duration = communityTiming.end ? 
              Math.round((communityTiming.end - communityTiming.start) / 1000 / 60) : 
              adBreakDuration;
            
            const timingWithDuration = {
              ...communityTiming,
              duration: duration,
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
      console.log('🎵 Manual ad break time reached');
      
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
  }, []);

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
    },
    // Community timing states and methods
    useCommunityTimings,
    setUseCommunityTimings,
    showFeedbackPopup,
    setShowFeedbackPopup,
    feedbackStationName,
    setFeedbackStationName,
    currentAdBreakUsedCommunityTiming, // Track if current ad break used community timing
    nextCommunityTiming, // Full community timing metadata for UI
    originalRadioStation, // For proper restoration in nonstop mode
    startAdBreak,
    endAdBreak,
    manualAdBreak,
    startTimer,
    stopTimer,
    startAdBreakWithRemainingTime,
    startAdBreakWithCommunityDuration, // Export the new function
    cancelAdBreakTimer, // ✅ ADD: Export the new function
    rotateToNextNonstopStation, // ✅ ADD: Export rotation function
    getAdBreakModeDescription,
    queueStationSwitch
  };
};
