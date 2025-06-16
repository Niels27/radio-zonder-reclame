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
  const [shouldPlayPlaylistDuringAdBreak, setShouldPlayPlaylistDuringAdBreak] = useState(false); const [adBreakMode, setAdBreakMode] = useState(() => loadFromStorage(STORAGE_KEYS.AD_BREAK_MODE, 'playlist')); // 'playlist', 'nonstop', 'lofi'
  const [currentNonstopAttempt, setCurrentNonstopAttempt] = useState(0);  const [currentLofiAttempt, setCurrentLofiAttempt] = useState(0);
  const [isManualTestInProgress, setIsManualTestInProgress] = useState(false); // ← New state
  const [isPermanentModeActive, setIsPermanentModeActive] = useState(false); // ← Track permanent mode state// Automatic ad detection states - DISABLED: Music detection temporarily disabled
  const [autoAdDetectionEnabled, setAutoAdDetectionEnabled] = useState(() => {
    // ✅ QUICK FIX: Force music detection to always be disabled
    return false;
    
    // Original code kept for future use:
    // try {
    //   const saved = localStorage.getItem('auto_ad_detection');
    //   const value = saved ? JSON.parse(saved) : false;
    //   console.log('🤖 Loaded auto detection setting:', value);
    //   return value;
    // } catch {
    //   return false;
    // }
  });
  
  // Community timing states
  const [useCommunityTimings, setUseCommunityTimings] = useState(() => {
    try {
      const saved = localStorage.getItem('use_community_timings');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackStationName, setFeedbackStationName] = useState('');
  const [currentAdBreakUsedCommunityTiming, setCurrentAdBreakUsedCommunityTiming] = useState(false);
  
  const autoDetectorRef = useRef(null);
  const detectionTriggeredRef = useRef(false);

  const timerRef = useRef(null);
  const adBreakTimeoutRef = useRef(null);
  // Get next community timing for current station
  const getNextCommunityTiming = useCallback(async (stationName) => {
    if (!useCommunityTimings || !stationName) {
      return null;
    }

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();

      // Get community timing suggestions for current hour
      const suggestions = await CommunityTimings.getSuggestedAdBreakTiming(stationName, currentHour);
      
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
            (currentMinute === suggestions.halfHour.starts && currentSecond < 30)) {
          potentialTimings.push(halfHourTiming);
        }
      }
      
      // Add full-hour timing if available (around :00 of next hour)
      if (suggestions.fullHour && suggestions.fullHour.starts) {
        const fullHourTiming = new Date();
        fullHourTiming.setHours(currentHour + 1, suggestions.fullHour.starts, 0, 0);
        potentialTimings.push(fullHourTiming);
      }

      // Return the nearest future timing
      if (potentialTimings.length > 0) {
        potentialTimings.sort((a, b) => a - b);
        return potentialTimings[0];
      }

      return null;
    } catch (error) {
      console.error('Failed to get community timing:', error);
      return null;
    }
  }, [useCommunityTimings]);

  // Calculate next ad break time - now supports community timings
  // ✅ UPDATED: Calculate next ad break time with community timing support
  const getNextAdBreakTime = useCallback(async (stationName = null) => {
    // Try community timing first if enabled
    if (useCommunityTimings && stationName) {
      const communityTiming = await getNextCommunityTiming(stationName);
      if (communityTiming) {
        return communityTiming;
      }
    }

    // Fall back to manual timing
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    const adBreakMinutes = [adBreakMinute, adBreakMinute2].sort((a, b) => a - b);

    // Check each ad break minute in the current hour
    for (const minute of adBreakMinutes) {
      // ✅ FIX: Only consider future if we haven't reached the minute OR we're early in that minute
      if (currentMinute < minute || (currentMinute === minute && currentSecond < 30)) {
        const nextBreak = new Date();
        nextBreak.setHours(currentHour, minute, 0, 0);
        return nextBreak;
      }
    }

    // ✅ FIX: If both ad breaks have passed this hour, go to next hour
    const nextBreak = new Date();
    nextBreak.setHours(currentHour + 1, adBreakMinutes[0], 0, 0);
    return nextBreak;
  }, [adBreakMinute, adBreakMinute2, useCommunityTimings, getNextCommunityTiming]);

  const formatTimeRemaining = useCallback((targetTime) => {
    const now = new Date();
    const diff = targetTime - now;

    if (diff <= 0) return '0s';

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, []);

  // Extract playlist ID from URL - updated to handle both YouTube and Spotify
  const extractPlaylistId = (url) => {
    if (playlistProvider === 'spotify') {
      // For Spotify, the URL is actually the playlist ID
      return url;
    } else {
      // For YouTube, extract from URL
      const regex = /[?&]list=([^#\&\?]*)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    }
  };
  // Get description for current ad break mode
  const getAdBreakModeDescription = useCallback(() => {
    switch (adBreakMode) {
      case 'playlist': return 'muziek van afspeellijst';
      case 'nonstop': return 'non-stop radio';
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

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) throw new Error('Ongeldige playlist URL');

    await audioPlayer.playPlaylist(playlistId, {
      shuffle: playlistShuffle,
      repeat: 'all',
      provider: playlistProvider,
      duration: duration
    });

    console.log(`🎵 Playing ${playlistProvider} playlist for ${duration} minutes`);
    if (window.addNotification) {
      window.addNotification(`🎵 Afspeellijst gestart voor ${duration} minuten`, 'success', 3000);
    }
  }, [playlistUrl, playlistShuffle, playlistProvider, audioPlayer, extractPlaylistId]);

  // Nonstop radio ad break
  // Update the startNonstopAdBreak function:

  // Replace the startNonstopAdBreak function with this fixed version:

  // Replace the startNonstopAdBreak function with this properly fixed version:

  const startNonstopAdBreak = useCallback(async (duration, attempt = 0) => {
    const maxAttempts = 8;

    if (attempt >= maxAttempts) {
      throw new Error('Alle nonstop stations zijn uitgeproeeerd');
    }

    const station = getRandomNonstopStation();
    if (!station) {
      throw new Error('Geen nonstop stations beschikbaar');
    }

    try {
      console.log(`🎵 Attempting nonstop station: ${station.name} (attempt ${attempt + 1})`);

      if (window.addNotification && attempt === 0) {
        window.addNotification(`📻 Proberen: ${station.name}...`, 'info', 2000);
      }

      // ✅ CRITICAL FIX: Use await and let any errors bubble up
      await audioPlayer.playRadio(station);

      // ✅ CRITICAL FIX: Only reach here if playRadio succeeded
      console.log(`✅ SUCCESS: Playing nonstop radio: ${station.name} for ${duration} minutes`);
      if (window.addNotification) {
        window.addNotification(`📻 Nonstop radio: ${station.name}`, 'success', 3000);
      }

      setCurrentNonstopAttempt(0);
      return; // Success - exit function

    } catch (error) {
      // ✅ CRITICAL FIX: This catch block handles ALL playRadio failures
      console.warn(`❌ FAILED: Nonstop station ${station.name} failed:`, error);

      // Mark station as failed to avoid retrying it
      markStationAsFailed(station.name);

      if (window.addNotification) {
        window.addNotification(`❌ ${station.name} mislukt, proberen volgende...`, 'warning', 2000);
      }

      console.log(`🔄 Retrying with next nonstop station (attempt ${attempt + 1}/${maxAttempts})`);

      // ✅ CRITICAL FIX: Recursive retry with proper error propagation
      return await startNonstopAdBreak(duration, attempt + 1);
    }
  }, [audioPlayer]);

  // Lofi ad break
  // Replace the entire startLofiAdBreak function:

  // Replace the startLofiAdBreak function:

  // Replace the startLofiAdBreak function with this version:

  const startLofiAdBreak = useCallback(async (duration, attempt = 0) => {
    const maxAttempts = 6;

    if (attempt >= maxAttempts) {
      throw new Error('Alle lofi streams zijn uitgeproeeerd');
    }

    // ✅ CRITICAL FIX: Check if overlay is already working BEFORE trying anything
    if (attempt === 0 && isLofiOverlayOpen()) {
      console.log('🎵 Lofi overlay already open and working - not starting new stream');
      if (window.addNotification) {
        window.addNotification(`🎧 Lofi Girl: al actief`, 'success', 3000);
      }
      setCurrentLofiAttempt(0);
      return; // Success - overlay already working
    }

    const lofiStream = getNextLofiStream();
    const lofiStation = createLofiStation(lofiStream);

    try {
      console.log(`🎵 Attempting lofi stream: ${lofiStation.name} (attempt ${attempt + 1})`);

      if (lofiStream.type === 'youtube_video') {
        const videoId = extractYouTubeVideoId(lofiStream.url);
        if (!videoId) {
          throw new Error('Invalid YouTube video ID');
        }

        // ✅ Try to open overlay (always succeeds since we control it)
        try {
          await openLofiYouTubeOverlay(videoId, duration);

          console.log(`✅ SUCCESS: Playing lofi overlay: ${lofiStation.name} for ${duration} minutes`);
          if (window.addNotification) {
            window.addNotification(`🎧 Lofi Girl: ${lofiStation.name} (overlay actief)`, 'success', 3000);
          }

          setCurrentLofiAttempt(0);
          return; // Success - exit function

        } catch (overlayError) {
          console.warn(`❌ FAILED: Overlay failed for ${lofiStation.name}:`, overlayError);
          throw overlayError; // This should trigger retry
        }

      } else {
        // Play as radio stream with timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );

        const playPromise = audioPlayer.playRadio(lofiStation);
        await Promise.race([playPromise, timeoutPromise]);

        console.log(`✅ SUCCESS: Playing lofi stream: ${lofiStation.name} for ${duration} minutes`);
        if (window.addNotification) {
          window.addNotification(`🎧 Lofi Radio: ${lofiStation.name}`, 'success', 3000);
        }

        setCurrentLofiAttempt(0);
        return; // Success - exit function
      }

    } catch (error) {
      console.warn(`❌ FAILED: Lofi stream ${lofiStation.name} failed:`, error);

      // Only mark as failed and retry if it's a real failure
      markLofiStreamAsFailed(lofiStation.name);

      if (window.addNotification) {
        window.addNotification(`❌ ${lofiStation.name} mislukt, proberen volgende...`, 'warning', 2000);
      }

      // Recursive retry with proper error propagation
      return await startLofiAdBreak(duration, attempt + 1);
    }
  }, [audioPlayer]);

  // End an ad break
  const endAdBreak = useCallback(() => {
    console.log('🎵 Ending ad break...');
    setIsAdBreakActive(false);
    setCurrentAdBreakTimeLeft(null);
    setEnforcingAdBreak(false);
    setShouldPlayPlaylistDuringAdBreak(false);
    setCurrentAdBreakUsedCommunityTiming(false); // Reset community timing state
    window.isAdBreakActive = false;
    window.currentAdBreakTimeLeft = null;

    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }

    // ✅ Close Lofi overlay if open (we have full control)
    closeLofiYouTubeOverlay();

    // Stop YouTube popup specifically for ad break end
    if (audioPlayer.youtubePlayerRef?.current) {
      try {
        audioPlayer.youtubePlayerRef.current.closePopup('ad_break_ended');
      } catch (error) {
        console.warn('Could not close YouTube popup:', error);
      }
    }

    // Stop Spotify player
    if (audioPlayer.spotifyPlayerRef?.current) {
      try {
        import('../utils/spotifyUtils').then(({ pauseSpotify }) => {
          pauseSpotify();
          console.log('🎵 Spotify player paused on ad break end');
        }).catch(error => {
          console.warn('Could not pause Spotify player:', error);
        });
      } catch (error) {
        console.warn('Could not pause Spotify player:', error);
      }
    }

    // Resume audio with priority: queued > paused radio
    setTimeout(() => {
      if (queuedStation) {
        console.log('🎵 Switching to queued station:', queuedStation.name);
        audioPlayer.playRadio(queuedStation);
        setQueuedStation(null);

        if (window.addNotification) {
          window.addNotification(`📻 Gewisseld naar ${queuedStation.name}`, 'success', 2000);
        }
      } else if (audioPlayer.isRadioPausedForAdBreak && audioPlayer.pausedRadioStation) {
        console.log('🎵 Resuming paused radio:', audioPlayer.pausedRadioStation.name);
        audioPlayer.resumeRadioFromAdBreak();

        if (window.addNotification) {
          window.addNotification(`📻 Terug naar ${audioPlayer.pausedRadioStation.name}`, 'success', 2000);
        }
      } else {
        // Fallback to last saved station
        const lastStation = localStorage.getItem('lastPlayedStation');
        if (lastStation) {
          try {
            const stationData = JSON.parse(lastStation);
            console.log('🎵 Resuming last saved station:', stationData.name);
            audioPlayer.playRadio(stationData);

            if (window.addNotification) {
              window.addNotification(`📻 Terug naar ${stationData.name}`, 'success', 2000);
            }
          } catch (error) {
            console.error('Could not resume last station:', error);
          }
        }
      }
    }, 500);
  }, [audioPlayer, queuedStation, setQueuedStation]);

  // Start an ad break
  const startAdBreak = useCallback(async () => {
    if (isAdBreakActive || audioPlayer.isTransitioning) return;

    const isRadioPlaying = audioPlayer.isPlaying && audioPlayer.currentStation && audioPlayer.currentSource === 'radio';

    console.log(`🎵 Starting ad break with mode: ${adBreakMode}`);
    console.log('🎵 Radio currently playing:', isRadioPlaying);

    setIsAdBreakActive(true);
    setShouldPlayPlaylistDuringAdBreak(isRadioPlaying);
    window.isAdBreakActive = true;

    // Always determine duration for timer purposes
    const now = new Date();
    const currentMinute = now.getMinutes();
    const isFirstAdBreak = Math.abs(currentMinute - adBreakMinute) < Math.abs(currentMinute - adBreakMinute2);
    const duration = isFirstAdBreak ? adBreakDuration : adBreakDuration2;

    // Expose duration globally for YouTube popup
    window.currentAdBreakTimeLeft = duration * 60;

    // Set timeout regardless of whether we start playlist
    adBreakTimeoutRef.current = setTimeout(() => {
      endAdBreak();
    }, duration * 60 * 1000);

    if (isRadioPlaying) {
      // FIRST pause the radio, THEN start playlist
      console.log('🎵 Pausing radio for ad break');
      audioPlayer.pauseRadioForAdBreak();

      // Wait a bit for radio to pause, then start playlist
      setTimeout(async () => {
        try {
          if (adBreakMode === 'playlist') {
            await startPlaylistAdBreak(duration);
          } else if (adBreakMode === 'nonstop') {
            await startNonstopAdBreak(duration);
          } else if (adBreakMode === 'lofi') {
            await startLofiAdBreak(duration);
          }
        } catch (error) {
          console.error('Failed to start ad break:', error);
          handleAdBreakError();
        }
      }, 500);
    } else {
      console.log(`🎵 No radio playing - ad break active for timer only (${adBreakMode} mode)`);
      if (window.addNotification) {
        window.addNotification(
          `⏸️ Reclamepauze actief (${duration} min) - selecteer een radio om ${getAdBreakModeDescription()} te horen`,
          'info',
          4000
        );
      }
    }
  }, [
    isAdBreakActive,
    audioPlayer,
    adBreakMode,
    adBreakDuration,
    adBreakDuration2,
    adBreakMinute,
    adBreakMinute2,
    startPlaylistAdBreak,
    startNonstopAdBreak,
    startLofiAdBreak,
    getAdBreakModeDescription,
    handleAdBreakError,
    endAdBreak
  ]);
  // ...existing code...

  // ✅ FIXED: Detection handler with proper function calls
  const handleSmartAdDetection = useCallback((detectionResult) => {
    // ✅ NEW: Ignore detections during warm-up phase
    if (detectionResult.isWarmingUp) {
      console.log('🔥 Detection warming up, ignoring result');
      return;
    }
    
    if (!autoAdDetectionEnabled || !isTimerRunning) {
      return;
    }

    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // ✅ ALWAYS log detection attempts for debugging
    console.log('🤖 Detection attempt:', {
      time: `${currentMinute}:${String(currentSecond).padStart(2, '0')}`,
      isMusic: detectionResult.isMusic,
      confidence: `${Math.round(detectionResult.confidence * 100)}%`,
      silences: detectionResult.silenceInfo?.consecutiveSilences || 0,
      adBreakMinute,
      adBreakMinute2,
      isTimerRunning,
      autoAdDetectionEnabled
    });

    // ✅ FIX: Call function with required parameters
    const windows = getStartDetectionWindows(adBreakMinute, adBreakMinute2, adBreakDuration, adBreakDuration2);

    const getCurrentWindow = () => {
      return windows.find(window => {
        // Handle hour boundary crossings
        if (window.startMinute <= window.endMinute) {
          return currentMinute >= window.startMinute && currentMinute <= window.endMinute;
        } else {
          // Crosses hour boundary
          return currentMinute >= window.startMinute || currentMinute <= window.endMinute;
        }
      });
    };

    const currentWindow = getCurrentWindow();

    if (!currentWindow) {
      // ✅ ENHANCED: Always log when outside detection window for debugging
      console.log(`🤖 Outside detection window at ${currentMinute}:${String(currentSecond).padStart(2, '0')}`);
      console.log(`🤖 Detection windows: ${windows.map(w => `${w.startMinute}-${w.endMinute} (break ${w.breakNumber})`).join(', ')}`);

      // Stop detection when outside window
      if (autoDetectorRef.current && !isAdBreakActive) {
        console.log('🤖 Stopping detection - outside window');
        autoDetectorRef.current.stopDetection();
        autoDetectorRef.current = null;
        detectionTriggeredRef.current = false;
      }
      return;
    }

    // ✅ ENHANCED: Always log when in detection window
    console.log('🤖 IN DETECTION WINDOW:', {
      type: detectionResult.isMusic ? '🎵 Music' : '📢 NOT Music (Ads)',
      confidence: `${Math.round(detectionResult.confidence * 100)}%`,
      window: `${currentWindow.startMinute}-${currentWindow.endMinute} (±${DETECTION_WINDOW_MINUTES}min)`,
      breakNumber: currentWindow.breakNumber,
      targetTime: `${currentWindow.targetMinute}:00`,
      silences: detectionResult.silenceInfo?.consecutiveSilences || 0
    });

    // Handle start detection
    if (currentWindow.type === 'start_detection' && !isAdBreakActive) {
      // If we detect NOT MUSIC within the window, start immediately
      if (!detectionResult.isMusic && detectionResult.confidence > 0.6 && !detectionTriggeredRef.current) {
        console.log('🚨 SMART START DETECTED: Starting ad break early');
        detectionTriggeredRef.current = true;

        // Stop detection immediately when ad break starts
        if (autoDetectorRef.current) {
          console.log('🤖 Stopping detection - ad break started');
          autoDetectorRef.current.stopDetection();
          autoDetectorRef.current = null;
        }

        startAdBreak();

        if (window.addNotification) {
          window.addNotification(
            `🤖 Smart start: Reclame gedetecteerd in pauze ${currentWindow.breakNumber} venster (${currentWindow.duration}min)`,
            'success',
            4000
          );
        }
        return;
      }

      // Force start at scheduled time if we've reached it
      if (currentMinute === currentWindow.targetMinute && currentSecond <= 5 && !detectionTriggeredRef.current) {
        console.log('🤖 FALLBACK START: Starting at scheduled time');
        detectionTriggeredRef.current = true;

        // Stop detection when ad break starts
        if (autoDetectorRef.current) {
          console.log('🤖 Stopping detection - scheduled ad break started');
          autoDetectorRef.current.stopDetection();
          autoDetectorRef.current = null;
        }

        startAdBreak();

        if (window.addNotification) {
          window.addNotification(
            `⏰ Fallback start: Pauze ${currentWindow.breakNumber} op schema gestart (${currentWindow.duration}min)`,
            'info',
            4000
          );
        }
      }
    }

  }, [autoAdDetectionEnabled, isTimerRunning, isAdBreakActive, adBreakMinute, adBreakMinute2, adBreakDuration, adBreakDuration2, startAdBreak]);
  // ...existing code...  // Enhanced manual ad break with mode support
  // Update the entire manual ad break function with better error handling:
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

    try {      if (isManualTestActive) {
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
        }        // Close Lofi overlay
        closeLofiYouTubeOverlay();

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
      } else {        // Start manual test with proper sequencing
        console.log(`🎵 Starting manual ad break test with mode: ${adBreakMode}`);
        setIsManualTestActive(true);
        setShouldPlayPlaylistDuringAdBreak(true);        // ✅ NEW: Only set timeout for test mode, not permanent mode
        if (!isLongDuration) {
          // For short test mode, set a 5-minute timeout to auto-stop
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
          }, durationMinutes * 60 * 1000);        } else {
          // For permanent mode, clear any existing timeout but don't set a new one
          // This allows infinite playback
          if (adBreakTimeoutRef.current) {
            clearTimeout(adBreakTimeoutRef.current);
            adBreakTimeoutRef.current = null;
          }
          setIsPermanentModeActive(true); // ✅ Set permanent mode flag
          console.log('🎵 Permanent mode activated - no auto-stop timeout set');
        }const isRadioPlaying = audioPlayer.isPlaying && audioPlayer.currentStation && audioPlayer.currentSource === 'radio';

        if (isRadioPlaying) {
          if (isLongDuration) {
            // ✅ PERMANENT MODE: Completely stop radio (don't pause for ad break)
            console.log('🎵 Stopping radio completely for permanent mode (no resume)');
            audioPlayer.stopRadio(); // Complete stop, no resume logic
          } else {
            // ✅ TEST MODE: Pause radio for ad break (will resume after test)
            console.log('🎵 Pausing radio for manual test');
            audioPlayer.pauseRadioForAdBreak();
          }

          setTimeout(async () => {
            try {
              if (adBreakMode === 'playlist') {
                const playlistId = extractPlaylistId(playlistUrl);
                if (playlistId) {
                  await audioPlayer.playPlaylist(playlistId, {
                    shuffle: playlistShuffle,
                    repeat: 'all',
                    provider: playlistProvider
                  });
                }
              } else if (adBreakMode === 'nonstop') {
                // ✅ FIX: Use duration parameter instead of hardcoded 5
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
            }
          }, 500);
        } else {          // No radio playing, start immediately
          (async () => {
            try {
              if (adBreakMode === 'playlist') {
                const playlistId = extractPlaylistId(playlistUrl);
                if (playlistId) {
                  await audioPlayer.playPlaylist(playlistId, {
                    shuffle: playlistShuffle,
                    repeat: 'all',
                    provider: playlistProvider
                  });
                }
              } else if (adBreakMode === 'nonstop') {
                try {
                  await startNonstopAdBreak(durationMinutes);
                } catch (error) {
                  console.error('Nonstop test failed completely:', error);
                  if (window.addNotification) {
                    window.addNotification(`❌ Alle nonstop stations mislukt`, 'error', 5000);
                  }
                  setIsManualTestActive(false);
                  setShouldPlayPlaylistDuringAdBreak(false);
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
                }
              }
            } catch (error) {
              console.error('Manual test failed:', error);
              if (window.addNotification) {
                window.addNotification(`❌ Test mislukt: ${error.message}`, 'error', 3000);
              }
              setIsManualTestActive(false);
              setShouldPlayPlaylistDuringAdBreak(false);
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
  }, [audioPlayer, adBreakMode, playlistUrl, playlistShuffle, playlistProvider, isManualTestActive, setIsManualTestActive, setShouldPlayPlaylistDuringAdBreak, startNonstopAdBreak, startLofiAdBreak, getAdBreakModeDescription, extractPlaylistId]);
  // Check ad break time
  const checkAdBreakTime = useCallback(async () => {
    if (!isTimerRunning || isAdBreakActive) return;

    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();    let shouldStartAdBreak = false;
    let usedCommunityTiming = false;

    // Check community timings first if enabled
    if (useCommunityTimings && audioPlayer?.currentStation?.name) {
      try {
        const suggestions = await CommunityTimings.getSuggestedAdBreakTiming(
          audioPlayer.currentStation.name, 
          now.getHours()
        );
        
        if (suggestions) {
          // Check half-hour timings
          if (suggestions.halfHour && suggestions.halfHour.starts) {
            const timingMinute = suggestions.halfHour.starts;
            if (currentMinute === timingMinute && currentSecond >= 0 && currentSecond <= 5) {
              shouldStartAdBreak = true;
              usedCommunityTiming = true;
              console.log(`🌐 Community timing trigger (half-hour) at ${currentMinute}:${String(currentSecond).padStart(2, '0')} for ${audioPlayer.currentStation.name}`);
            }
          }
          
          // Check full-hour timings
          if (!shouldStartAdBreak && suggestions.fullHour && suggestions.fullHour.starts) {
            const timingMinute = suggestions.fullHour.starts;
            if (currentMinute === timingMinute && currentSecond >= 0 && currentSecond <= 5) {
              shouldStartAdBreak = true;
              usedCommunityTiming = true;
              console.log(`🌐 Community timing trigger (full-hour) at ${currentMinute}:${String(currentSecond).padStart(2, '0')} for ${audioPlayer.currentStation.name}`);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to check community timings:', error);
      }
    }

    // Fall back to user-defined timings if community timings didn't trigger
    if (!shouldStartAdBreak) {
      shouldStartAdBreak = (
        (currentMinute === adBreakMinute && currentSecond >= 0 && currentSecond <= 5) ||
        (currentMinute === adBreakMinute2 && currentSecond >= 0 && currentSecond <= 5)
      );
      
      if (shouldStartAdBreak) {
        console.log(`🎯 User timing trigger at ${currentMinute}:${String(currentSecond).padStart(2, '0')}`);
      }
    }    if (shouldStartAdBreak) {
      // Track if this ad break was triggered by community timing
      setCurrentAdBreakUsedCommunityTiming(usedCommunityTiming);
      
      // Show appropriate toast notification
      if (window.addNotification) {
        if (usedCommunityTiming) {
          window.addNotification(
            `🌐 Community timing gebruikt voor switching`, 
            'success', 
            3000
          );
        } else {
          window.addNotification(
            `⚙️ Geen community timing gevonden, Handmatige timing gebruikt voor switchen`, 
            'info', 
            3000
          );
        }
      }
      
      startAdBreak();
      
      // Show feedback popup after ad break starts (only for community timings)
      if (usedCommunityTiming) {
        setFeedbackStationName(audioPlayer.currentStation.name);
        setTimeout(() => setShowFeedbackPopup(true), 2000); // Show feedback after 2 seconds
      }
    }
  }, [isTimerRunning, isAdBreakActive, adBreakMinute, adBreakMinute2, useCommunityTimings, audioPlayer, startAdBreak]);

  // Main timer loop  // Timer effect - updated to support async community timings
  useEffect(() => {
    if (!isTimerRunning) return;

    const updateTimer = async () => {
      checkAdBreakTime();

      if (!isAdBreakActive) {
        const stationName = audioPlayer?.currentStation?.name;
        const nextBreakTime = await getNextAdBreakTime(stationName);
        const timeRemaining = formatTimeRemaining(nextBreakTime);
        setNextAdBreakIn(timeRemaining);
      }
    };

    // Initial update
    updateTimer();

    const interval = setInterval(updateTimer, 1000);
    timerRef.current = interval;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning, isAdBreakActive, checkAdBreakTime, getNextAdBreakTime, formatTimeRemaining, audioPlayer]);
  // ✅ NEW: Ad break countdown timer for current active ad break
  useEffect(() => {
    if (!isAdBreakActive) {
      setCurrentAdBreakTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      if (window.currentAdBreakTimeLeft && window.currentAdBreakTimeLeft > 0) {
        window.currentAdBreakTimeLeft--;
        setCurrentAdBreakTimeLeft(window.currentAdBreakTimeLeft);
      } else {
        setCurrentAdBreakTimeLeft(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAdBreakActive]);

  // ✅ NEW: Automatic ad detection setup  // ✅ NEW: Automatic ad detection setup - DISABLED
  useEffect(() => {
    // Update automatic detection enabled state from localStorage
    const savedSetting = loadFromStorage('auto_ad_detection', false);
    console.log('🤖 Auto detection setting from storage:', savedSetting, '(but forced to false)');
    // ✅ FORCE: Always set to false regardless of localStorage
    setAutoAdDetectionEnabled(false);
  }, []); // Run once on mount

  useEffect(() => {
    let detectionRestartTimeout;

    if (!audioPlayer?.audioRef?.current) {
      if (autoDetectorRef.current) {
        console.log('🤖 No audio element - stopping detection');
        autoDetectorRef.current.stopDetection();
        autoDetectorRef.current = null;
      }
      detectionTriggeredRef.current = false;
      return;
    }

    // ✅ ENHANCED: Check if we're currently in a detection window
    const getCurrentDetectionWindow = () => {
      const now = new Date();
      const currentMinute = now.getMinutes();

      const windows = getStartDetectionWindows(adBreakMinute, adBreakMinute2, adBreakDuration, adBreakDuration2);

      return windows.find(window => {
        if (window.startMinute <= window.endMinute) {
          return currentMinute >= window.startMinute && currentMinute <= window.endMinute;
        } else {
          return currentMinute >= window.startMinute || currentMinute <= window.endMinute;
        }
      });
    };

  //  console.log(`🤖 Detection effect running: enabled=${autoAdDetectionEnabled}, timer=${isTimerRunning}, adBreak=${isAdBreakActive}`);

    if (autoAdDetectionEnabled && isTimerRunning && !isAdBreakActive) {
      const currentWindow = getCurrentDetectionWindow();

      console.log(`🤖 Current detection window:`, currentWindow || 'NONE');

      if (currentWindow && !autoDetectorRef.current) {
        console.log(`🤖 Starting detection for window ${currentWindow.breakNumber} (±${DETECTION_WINDOW_MINUTES}min)`);
        console.log('🎯 Detection mode: START-ONLY (stops when ad break starts)');

        const setupDetection = async () => {
          try {
            const { setupAdDetection } = await import('../utils/musicDetection');

            const detector = await setupAdDetection(
              audioPlayer.audioRef.current,
              handleSmartAdDetection
            );

            autoDetectorRef.current = detector;
            console.log('🤖 ✅ Detection started successfully');

          } catch (error) {
            console.error('🤖 ❌ Failed to start detection:', error);
            autoDetectorRef.current = null;
          }
        };

        setupDetection();
      } else if (!currentWindow && autoDetectorRef.current) {
        console.log(`🤖 Outside detection window - stopping to reduce logging`);
        autoDetectorRef.current.stopDetection();
        autoDetectorRef.current = null;
        detectionTriggeredRef.current = false;
      } else if (!currentWindow && !autoDetectorRef.current) {
        console.log(`🤖 Outside detection window - no detection running (correct)`);
      }
    } else {
      // Stop detection when disabled, timer inactive, or ad break active
      if (autoDetectorRef.current) {
        const reason = !autoAdDetectionEnabled ? 'disabled' :
          !isTimerRunning ? 'timer inactive' :
            'ad break active';
        console.log(`🤖 Stopping detection (${reason})`);
        autoDetectorRef.current.stopDetection();
        autoDetectorRef.current = null;
      }
      detectionTriggeredRef.current = false;
    }

    // Cleanup function
    return () => {
      if (detectionRestartTimeout) {
        clearTimeout(detectionRestartTimeout);
      }

      if (autoDetectorRef.current) {
        console.log('🤖 Cleanup: Stopping detection');
        autoDetectorRef.current.stopDetection();
        autoDetectorRef.current = null;
      }
    };
  }, [
    autoAdDetectionEnabled,
    isTimerRunning,
    isAdBreakActive,
    adBreakMinute,
    adBreakMinute2,
    adBreakDuration,
    adBreakDuration2, // ✅ ADD: Missing dependencies
    !!audioPlayer?.audioRef?.current,
    handleSmartAdDetection // ✅ ADD: Missing dependency
  ]);

  // Move the startAdBreakWithRemainingTime function BEFORE the startTimer function:

  // Start ad break with specific remaining time - MOVED UP BEFORE startAdBreakWithRemainingTime
  const startAdBreakWithRemainingTime = useCallback((remainingMinutes) => {
    if (isAdBreakActive || audioPlayer.isTransitioning) return;

    const isRadioPlaying = audioPlayer.isPlaying && audioPlayer.currentStation && audioPlayer.currentSource === 'radio';

    console.log(`🎵 Starting ad break with ${remainingMinutes} minutes remaining (mode: ${adBreakMode})`);

    setIsAdBreakActive(true);
    setShouldPlayPlaylistDuringAdBreak(isRadioPlaying);
    window.isAdBreakActive = true;
    window.currentAdBreakTimeLeft = remainingMinutes * 60;

    // Set timeout for remaining time
    adBreakTimeoutRef.current = setTimeout(() => {
      endAdBreak();
    }, remainingMinutes * 60 * 1000);

    if (isRadioPlaying) {
      console.log('🎵 Pausing radio for ad break');
      audioPlayer.pauseRadioForAdBreak();

      setTimeout(async () => {
        try {
          if (adBreakMode === 'playlist') {
            await startPlaylistAdBreak(remainingMinutes);
          } else if (adBreakMode === 'nonstop') {
            await startNonstopAdBreak(remainingMinutes);
          } else if (adBreakMode === 'lofi') {
            await startLofiAdBreak(remainingMinutes);
          }
        } catch (error) {
          console.error('Failed to start ad break:', error);
          handleAdBreakError();
        }
      }, 500);
    } else {
      console.log(`🎵 No radio playing - ad break active for timer only (${adBreakMode} mode)`);
      if (window.addNotification) {
        window.addNotification(
          `⏸️ Reclamepauze actief (${remainingMinutes} min) - selecteer een radio om ${getAdBreakModeDescription()} te horen`,
          'info',
          4000
        );
      }
    }
  }, [
    isAdBreakActive,
    audioPlayer,
    adBreakMode,
    startPlaylistAdBreak,
    startNonstopAdBreak,
    startLofiAdBreak,
    getAdBreakModeDescription,
    handleAdBreakError,
    endAdBreak
  ]);

  // ✅ FIXED: Start timer with proper ad break window detection - NOW AFTER startAdBreakWithRemainingTime
  const startTimer = useCallback(() => {
    // Only check playlist URL for playlist mode
    if (adBreakMode === 'playlist' && !playlistUrl) {
      if (window.addNotification) {
        window.addNotification('❌ Voer eerst een geldige playlist URL in', 'error', 3000);
      }
      return;
    }

    console.log(`🎵 User manually started ad break timer (${adBreakMode} mode)`);
    setIsTimerRunning(true);

    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    console.log(`🕐 Timer started at ${currentMinute}:${String(currentSecond).padStart(2, '0')}`);
    console.log(`🎯 Ad break windows: ${adBreakMinute}:00-${adBreakMinute + adBreakDuration}:00 and ${adBreakMinute2}:00-${adBreakMinute2 + adBreakDuration2}:00`);

    // ✅ FIXED: Helper function to check if current time is within an ad break window
    const checkAdBreakWindow = (startMinute, duration) => {
      // Calculate remaining minutes in this ad break
      let remainingMinutes = 0;

      if (currentMinute >= startMinute && currentMinute < startMinute + duration) {
        // We're in the same hour ad break window
        remainingMinutes = (startMinute + duration) - currentMinute;
        if (currentSecond > 30) remainingMinutes -= 1; // Round down if we're past 30 seconds
        return { inWindow: true, remaining: Math.max(0, remainingMinutes) };
      }

      // ✅ NEW: Handle hour boundary cases (e.g., ad break at minute 59 for 7 minutes = 59-06 next hour)
      if (startMinute + duration > 60) {
        const endMinuteNextHour = (startMinute + duration) % 60;

        if (currentMinute >= startMinute) {
          // We're in the first part (same hour)
          remainingMinutes = (60 - currentMinute) + endMinuteNextHour;
          if (currentSecond > 30) remainingMinutes -= 1;
          return { inWindow: true, remaining: Math.max(0, remainingMinutes) };
        } else if (currentMinute < endMinuteNextHour) {
          // We're in the second part (next hour)
          remainingMinutes = endMinuteNextHour - currentMinute;
          if (currentSecond > 30) remainingMinutes -= 1;
          return { inWindow: true, remaining: Math.max(0, remainingMinutes) };
        }
      }

      return { inWindow: false, remaining: 0 };
    };

    // Check if we are already within an ad break window
    const firstWindow = checkAdBreakWindow(adBreakMinute, adBreakDuration);
    const secondWindow = checkAdBreakWindow(adBreakMinute2, adBreakDuration2);

    if (firstWindow.inWindow || secondWindow.inWindow) {
      const activeWindow = firstWindow.inWindow ? firstWindow : secondWindow;
      const whichBreak = firstWindow.inWindow ? 1 : 2;

      console.log(`⏸️ Binnen reclamepauze venster ${whichBreak}, ${activeWindow.remaining} minuten resterend`);

      if (activeWindow.remaining > 0) {
        startAdBreakWithRemainingTime(activeWindow.remaining);

        if (window.addNotification) {
          window.addNotification(
            `⏸️ Reclamepauze actief - ${activeWindow.remaining} min resterend`,
            'info',
            3000
          );
        }
      } else {
        console.log('✅ Ad break window bijna afgelopen, normale timer gestart');
      }
    } else {
      console.log('✅ Buiten reclamepauze vensters, timer actief');
    }

    if (window.addNotification) {
      window.addNotification(
        `🎵 Timer geactiveerd (${adBreakMode} mode) - pauzes elk uur op minuut ${adBreakMinute} (${adBreakDuration}min) en ${adBreakMinute2} (${adBreakDuration2}min)`,
        'success',
        4000
      );
    }
  }, [adBreakMode, playlistUrl, adBreakMinute, adBreakMinute2, adBreakDuration, adBreakDuration2, startAdBreakWithRemainingTime]);

  // Stop timer
  const stopTimer = useCallback(() => {
    console.log('🛑 User manually stopped ad break timer');
    setIsTimerRunning(false);

    // If currently in ad break, end it
    if (isAdBreakActive) {
      endAdBreak();
    }

    // Clear any pending timeouts
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (window.addNotification) {
      window.addNotification('⏹️ Timer gestopt', 'info', 2000);
    }
  }, [isAdBreakActive, endAdBreak]);

  // ✅ NEW: Function to cancel active ad break timer
  const cancelAdBreakTimer = useCallback(() => {
    console.log('🛑 User manually canceled ad break timer');

    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }

    // Keep the current state but remove the auto-end timer
    setCurrentAdBreakTimeLeft(null);
    window.currentAdBreakTimeLeft = null;

    console.log('✅ Ad break timer canceled - staying in current mode indefinitely');

    if (window.addNotification) {
      window.addNotification('⏰ Timer gestopt - blijft in huidige modus', 'success', 3000);
    }
  }, []);

  // Add caching effects for all settings:
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.AD_BREAK_MODE, adBreakMode);
  }, [adBreakMode]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.AD_BREAK_MINUTE, adBreakMinute);
  }, [adBreakMinute]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.AD_BREAK_MINUTE2, adBreakMinute2);
  }, [adBreakMinute2]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.AD_BREAK_DURATION, adBreakDuration);
  }, [adBreakDuration]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.AD_BREAK_DURATION2, adBreakDuration2);
  }, [adBreakDuration2]);

  // Save community timing setting
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
    setFeedbackStationName,    currentAdBreakUsedCommunityTiming, // Track if current ad break used community timing
    startAdBreak,
    endAdBreak,
    manualAdBreak,
    startTimer,
    stopTimer,
    startAdBreakWithRemainingTime,
    cancelAdBreakTimer, // ✅ ADD: Export the new function
    rotateToNextNonstopStation, // ✅ ADD: Export rotation function
    getAdBreakModeDescription
  };
};

// ✅ NEW: Configurable detection window settings
const DETECTION_WINDOW_MINUTES = 4; // Minutes before/after ad break times to listen for detection

// ✅ ADD: Missing function that's being called in handleSmartAdDetection
export const getStartDetectionWindows = (adBreakMinute, adBreakMinute2, adBreakDuration, adBreakDuration2) => {
  const windows = [];

  // Ad break 1 start detection window
  const startWindow1 = {
    type: 'start_detection',
    breakNumber: 1,
    startMinute: (adBreakMinute - DETECTION_WINDOW_MINUTES + 60) % 60,
    endMinute: (adBreakMinute + DETECTION_WINDOW_MINUTES) % 60,
    targetMinute: adBreakMinute,
    duration: adBreakDuration,
    windowSize: DETECTION_WINDOW_MINUTES * 2
  };

  // Ad break 2 start detection window
  const startWindow2 = {
    type: 'start_detection',
    breakNumber: 2,
    startMinute: (adBreakMinute2 - DETECTION_WINDOW_MINUTES + 60) % 60,
    endMinute: (adBreakMinute2 + DETECTION_WINDOW_MINUTES) % 60,
    targetMinute: adBreakMinute2,
    duration: adBreakDuration2,
    windowSize: DETECTION_WINDOW_MINUTES * 2
  };

  windows.push(startWindow1, startWindow2);
  return windows;
};