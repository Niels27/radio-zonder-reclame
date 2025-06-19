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
  const countdownIntervalRef = useRef(null); // ✅ NEW: Ref for countdown interval

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
  }, [useCommunityTimings, audioPlayer.currentStation?.name]);  // ✅ ENHANCED: Get next ad break time with community timing support
  const getNextAdBreakTime = useCallback(async () => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // Check for community timing first
    const communityTiming = await getNextCommunityTiming();
    if (communityTiming) {
      const secondsUntil = Math.round((communityTiming.start - now) / 1000);
      console.log('🔔 Next ad break (community):', secondsUntil, 'seconds');
      setNextCommunityTiming(communityTiming); // Store for UI
      return Math.max(0, secondsUntil); // ✅ FIX: Return seconds, not minutes
    }

    // Clear community timing if none found
    setNextCommunityTiming(null);

    // ✅ FIX: Calculate exact seconds until next ad break
    const timeToAdBreak1Minutes = (adBreakMinute - currentMinute + 60) % 60;
    const timeToAdBreak2Minutes = (adBreakMinute2 - currentMinute + 60) % 60;
    
    let nextAdBreakMinutes = Math.min(timeToAdBreak1Minutes, timeToAdBreak2Minutes);
    
    // ✅ FIX: Calculate exact seconds remaining
    if (nextAdBreakMinutes === 0) {
      // We're in the ad break minute, check if we should start now
      if (currentSecond <= 30) {
        console.log('🔔 Ad break time reached!');
        return 0;
      } else {
        // Go to the next ad break
        const allBreaks = [timeToAdBreak1Minutes, timeToAdBreak2Minutes].filter(t => t > 0);
        nextAdBreakMinutes = allBreaks.length > 0 ? Math.min(...allBreaks) : 60;
      }
    }
    
    // Convert to total seconds remaining (minutes * 60 - current seconds in this minute)
    const totalSecondsRemaining = (nextAdBreakMinutes * 60) - currentSecond;
    
 
    
    return Math.max(0, totalSecondsRemaining);
  }, [getNextCommunityTiming, adBreakMinute, adBreakMinute2]);

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
  }, [audioPlayer]);
  // ✅ ENHANCED: Main ad break start function with community timing support
  const startAdBreak = useCallback(async (useManualDuration = false, manualDuration = null) => {
    // ✅ FIX: Prevent multiple ad breaks from starting simultaneously
    if (isAdBreakActive) {
     // console.warn('🚨 Ad break already active, ignoring duplicate start request');
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
          setCurrentAdBreakUsedCommunityTiming(false);
        }
      }      // Clear any existing countdown interval first
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
    console.log('🎵 Ending ad break...');    // Clear timeout and countdown interval
    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }    // Close overlays if auto-close is enabled
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
  }, [audioPlayer, adBreakMode, originalRadioStation, autoCloseOverlays]);

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
    // ✅ FIX: Prevent multiple timers from starting
    if (isTimerRunning) {
      console.warn('🚨 Timer already running, ignoring duplicate start request');
      return;
    }
    
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
    
    // ✅ FIX: Clear any existing timer interval first
    if (timerIntervalRef.current) {
      console.log('🚨 Clearing existing timer interval');
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    timerIntervalRef.current = setInterval(checkTime, 60000);
  }, [getNextAdBreakTime, startAdBreak, isTimerRunning]);  // ✅ ENHANCED: Stop timer with complete cleanup - USE THIS FOR "Deactiveer switching"
  const stopTimer = useCallback(() => {
    console.log('⏰ Stopping ad break timer with COMPLETE cleanup');
    
    // Stop the regular timer
    setIsTimerRunning(false);
    setNextAdBreakIn(null);
    
    // ✅ NEW: Clear manual timer states
    setManualTimerOverride(null);
    setIsManualTimerActive(false);
    skipNextTimerUpdateRef.current = false;
    
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
  }, []);
  // Effect for timer management - ✅ FIX: Check more frequently for ad break triggers
  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(checkAdBreakTime, 30000); // ✅ FIX: Check every 30 seconds instead of 60
      checkAdBreakTime(); // Check immediately
      
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, checkAdBreakTime]);  // Effect for next ad break calculation - ✅ FIX: Update every second for real-time countdown
  useEffect(() => {
    if (isTimerRunning) {
      const updateNextAdBreak = async () => {
        // ✅ FIX: Use manual override if active, but don't decrement it here
        if (isManualTimerActive && manualTimerOverride !== null) {
          // Just display the manual override value, don't modify it
          setNextAdBreakIn(manualTimerOverride);
          
          // Check if we should start ad break
          if (manualTimerOverride <= 0) {
            console.log('🎵 Manual timer reached 0 - starting ad break');
            setIsManualTimerActive(false);
            setManualTimerOverride(null);
            await startAdBreak();
          }
          return;
        }
        
        // Skip update if manual change was made
        if (skipNextTimerUpdateRef.current) {
          skipNextTimerUpdateRef.current = false;
          console.log('⏰ Skipping one timer update due to manual change');
          return;
        }
        
        const timeUntilNext = await getNextAdBreakTime();
        setNextAdBreakIn(timeUntilNext);
        
        // Check if we should start ad break
        if (timeUntilNext <= 0) {
          console.log('🎵 Ad break time reached!');
          await startAdBreak();
        }
      };
      
      updateNextAdBreak();
      const interval = setInterval(updateNextAdBreak, 1000); // ✅ FIX: Update every second for smooth countdown
      
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, getNextAdBreakTime, isManualTimerActive, manualTimerOverride, startAdBreak]);

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
  }, [isManualTimerActive, manualTimerOverride]);

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
