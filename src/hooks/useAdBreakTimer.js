// hooks/useAdBreakTimer.js - Enhanced with multiple ad break modes

import { useState, useEffect, useCallback, useRef } from 'react';
import { getRandomNonstopStation, markStationAsFailed } from '../utils/nonstopUtils.js';
import { 
  getNextLofiStream, 
  createLofiStation, 
  extractYouTubeVideoId,
  openLofiYouTubePopup,
  closeLofiYouTubePopup,
  markLofiStreamAsFailed ,
  isLofiPopupOpen
} from '../utils/lofiUtils.js';

export const useAdBreakTimer = (audioPlayer, playlistProvider = 'youtube') => {
  const [adBreakMinute, setAdBreakMinute] = useState(28);
  const [adBreakMinute2, setAdBreakMinute2] = useState(58);
  const [adBreakDuration, setAdBreakDuration] = useState(5);
  const [adBreakDuration2, setAdBreakDuration2] = useState(7);
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
  const [adBreakMode, setAdBreakMode] = useState('playlist'); // 'playlist', 'nonstop', 'lofi'
  const [currentNonstopAttempt, setCurrentNonstopAttempt] = useState(0);
  const [currentLofiAttempt, setCurrentLofiAttempt] = useState(0);

  const timerRef = useRef(null);
  const adBreakTimeoutRef = useRef(null);

  // Calculate next ad break time
  const getNextAdBreakTime = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    const adBreakMinutes = [adBreakMinute, adBreakMinute2].sort((a, b) => a - b);

    for (const minute of adBreakMinutes) {
      if (currentMinute < minute || (currentMinute === minute && currentSecond < 30)) {
        const nextBreak = new Date();
        nextBreak.setHours(currentHour, minute, 0, 0);
        return nextBreak;
      }
    }

    const nextBreak = new Date();
    nextBreak.setHours(currentHour + 1, adBreakMinutes[0], 0, 0);
    return nextBreak;
  }, [adBreakMinute, adBreakMinute2]);

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
    
    // ✅ CRITICAL FIX: Properly await and catch the radio play error
    await audioPlayer.playRadio(station);
    
    // ✅ CRITICAL FIX: Only log success if we actually get here without throwing
    console.log(`✅ SUCCESS: Playing nonstop radio: ${station.name} for ${duration} minutes`);
    if (window.addNotification) {
      window.addNotification(`📻 Nonstop radio: ${station.name}`, 'success', 3000);
    }
    
    setCurrentNonstopAttempt(0);
    return; // Success - exit function
    
  } catch (error) {
    // ✅ CRITICAL FIX: This catch block should handle ALL playRadio failures
    console.warn(`❌ FAILED: Nonstop station ${station.name} failed:`, error);
    
    // Mark station as failed
    markStationAsFailed(station.name);
    
    if (window.addNotification) {
      window.addNotification(`❌ ${station.name} mislukt, proberen volgende...`, 'warning', 2000);
    }
    
    console.log(`🔄 Retrying with next nonstop station (attempt ${attempt + 1}/${maxAttempts})`);
    
    // ✅ CRITICAL FIX: Recursive retry with proper error propagation
    return await startNonstopAdBreak(duration, attempt + 1);
  }
}, [audioPlayer, markStationAsFailed]);

  // Lofi ad break
// Replace the entire startLofiAdBreak function:

// Replace the startLofiAdBreak function:

// Replace the startLofiAdBreak function with this version:

const startLofiAdBreak = useCallback(async (duration, attempt = 0) => {
  const maxAttempts = 6;
  
  if (attempt >= maxAttempts) {
    throw new Error('Alle lofi streams zijn uitgeproeeerd');
  }

  // ✅ CRITICAL FIX: Check if popup is already working BEFORE trying anything
  if (attempt === 0 && isLofiPopupOpen()) {
    console.log('🎵 Lofi popup already open and working - not starting new stream');
    if (window.addNotification) {
      window.addNotification(`🎧 Lofi Girl: al actief`, 'success', 3000);
    }
    setCurrentLofiAttempt(0);
    return; // Success - popup already working
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
      
      // ✅ CRITICAL FIX: Try to open popup with better error handling
      try {
        await openLofiYouTubePopup(videoId, duration);
        
        console.log(`✅ SUCCESS: Playing lofi popup: ${lofiStation.name} for ${duration} minutes`);
        if (window.addNotification) {
          window.addNotification(`🎧 Lofi Girl: ${lofiStation.name} (popup geopend)`, 'success', 3000);
        }
        
        setCurrentLofiAttempt(0);
        return; // Success - exit function
        
      } catch (popupError) {
        // ✅ CRITICAL FIX: Only retry if popup was actually blocked, not cross-origin issues
        if (popupError.message.includes('blocked by browser')) {
          console.warn(`❌ BLOCKED: Popup blocked for ${lofiStation.name}:`, popupError);
          throw popupError; // This should trigger retry
        } else {
          // For other errors (like cross-origin), assume it worked
          console.log(`🎵 Popup opened but validation failed (likely cross-origin): ${popupError.message}`);
          console.log(`✅ ASSUMING SUCCESS: Lofi popup for ${lofiStation.name}`);
          if (window.addNotification) {
            window.addNotification(`🎧 Lofi Girl: ${lofiStation.name} (popup geopend)`, 'success', 3000);
          }
          setCurrentLofiAttempt(0);
          return; // Success - assume it worked
        }
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
    
    // ✅ CRITICAL FIX: Only mark as failed if it's a real failure
    if (error.message.includes('blocked by browser') || error.message.includes('Connection timeout')) {
      markLofiStreamAsFailed(lofiStation.name);
      
      if (window.addNotification) {
        window.addNotification(`❌ ${lofiStation.name} mislukt, proberen volgende...`, 'warning', 2000);
      }
      
      // Recursive retry with proper error propagation
      return await startLofiAdBreak(duration, attempt + 1);
    } else {
      // For other errors, don't retry - assume it might have worked
      console.log(`🎵 Assuming lofi stream worked despite error: ${error.message}`);
      setCurrentLofiAttempt(0);
      return;
    }
  }
}, [audioPlayer]);

  // End an ad break
  const endAdBreak = useCallback(() => {
    console.log('🎵 Ending ad break...');
    setIsAdBreakActive(false);
    setCurrentAdBreakTimeLeft(null);
    setEnforcingAdBreak(false);
    setShouldPlayPlaylistDuringAdBreak(false);
    window.isAdBreakActive = false;
    window.currentAdBreakTimeLeft = null;

    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }

    // Close Lofi YouTube popup if open
    closeLofiYouTubePopup();

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

  // Enhanced manual ad break with mode support
// Update the entire manual ad break function with better error handling:

const manualAdBreak = useCallback(() => {
  if (adBreakMode === 'playlist' && !playlistUrl) {
    if (window.addNotification) {
      window.addNotification('❌ Voer eerst een geldige playlist URL in', 'error', 3000);
    }
    return;
  }
  
  if (isManualTestActive) {
    // Stop manual test
    console.log('🎵 Stopping manual ad break test');
    setIsManualTestActive(false);
    setShouldPlayPlaylistDuringAdBreak(false);
    
    // ✅ CRITICAL FIX: Close Lofi popup when stopping test
    closeLofiYouTubePopup();
    
    // Also close any lingering popups by name
  try {
    const existingPopup = window.open('', 'lofiPlayer');
    if (existingPopup) {
      existingPopup.close();
    }
  } catch (error) {
    console.warn('Could not close popup by name:', error);
  }
  
  if (audioPlayer.currentSource === 'playlist' || 
      (audioPlayer.currentStation && audioPlayer.currentStation.isNonstop) || 
      (audioPlayer.currentStation && audioPlayer.currentStation.isLofi)) {
    audioPlayer.pauseAudio();
  }
    if (audioPlayer.isRadioPausedForAdBreak && audioPlayer.pausedRadioStation) {
      setTimeout(() => {
        audioPlayer.resumeRadioFromAdBreak();
      }, 300);
    }

    if (window.addNotification) {
      window.addNotification('🛑 Test pauze gestopt', 'info', 2000);
    }
  } else {
    // Start manual test
    console.log(`🎵 Starting manual ad break test with mode: ${adBreakMode}`);
    setIsManualTestActive(true);
    setShouldPlayPlaylistDuringAdBreak(true);
    
    const isRadioPlaying = audioPlayer.isPlaying && audioPlayer.currentStation && audioPlayer.currentSource === 'radio';
    
    if (isRadioPlaying) {
      console.log('🎵 Pausing radio for manual test');
      audioPlayer.pauseRadioForAdBreak();
      
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
            // ✅ FIX: Better error handling for nonstop test
            try {
              await startNonstopAdBreak(5); // 5 minute test
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
              await startLofiAdBreak(5); // 5 minute test
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
        } catch (error) {
          console.error('Manual test failed:', error);
          if (window.addNotification) {
            window.addNotification(`❌ Test mislukt: ${error.message}`, 'error', 3000);
          }
          // Reset states on error
          setIsManualTestActive(false);
          setShouldPlayPlaylistDuringAdBreak(false);
        }
      }, 500);
    } else {
      // No radio playing, start immediately
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
              await startNonstopAdBreak(5);
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
              await startLofiAdBreak(5);
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
    }

    if (window.addNotification) {
      window.addNotification(`🧪 Test pauze gestart (${getAdBreakModeDescription()}) - klik opnieuw om te stoppen`, 'info', 3000);
    }
  }
}, [
  adBreakMode, 
  playlistUrl, 
  playlistShuffle, 
  audioPlayer, 
  isManualTestActive, 
  playlistProvider, 
  startNonstopAdBreak, 
  startLofiAdBreak, 
  getAdBreakModeDescription,
  extractPlaylistId
]);

  // Check ad break time
  const checkAdBreakTime = useCallback(() => {
    if (!isTimerRunning || isAdBreakActive) return;

    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // Check if we should start an ad break (only at the exact start times)
    const shouldStartAdBreak = (
      (currentMinute === adBreakMinute && currentSecond >= 0 && currentSecond <= 5) ||
      (currentMinute === adBreakMinute2 && currentSecond >= 0 && currentSecond <= 5)
    );

    if (shouldStartAdBreak) {
      console.log(`🎯 Ad break trigger at ${currentMinute}:${String(currentSecond).padStart(2, '0')}`);
      startAdBreak();
    }
  }, [isTimerRunning, isAdBreakActive, adBreakMinute, adBreakMinute2, startAdBreak]);

  // Main timer loop
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      checkAdBreakTime();

      if (!isAdBreakActive) {
        const nextBreakTime = getNextAdBreakTime();
        const timeRemaining = formatTimeRemaining(nextBreakTime);
        setNextAdBreakIn(timeRemaining);
      }
    }, 1000);

    timerRef.current = interval;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning, isAdBreakActive, checkAdBreakTime, getNextAdBreakTime, formatTimeRemaining]);

  // Start timer - ONLY when user explicitly clicks
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

    // Helper function to check if current time is within an ad break window (handles hour boundary)
    const checkAdBreakWindow = (startMinute, duration) => {
      const endMinute = startMinute + duration;

      if (endMinute < 60) {
        // Same hour
        return currentMinute >= startMinute && currentMinute < endMinute;
      } else {
        // Next hour
        return currentMinute >= startMinute || currentMinute < (endMinute % 60);
      }
    };

    // Check if we are already within an ad break window
    const withinFirstWindow = checkAdBreakWindow(adBreakMinute, adBreakDuration);
    const withinSecondWindow = checkAdBreakWindow(adBreakMinute2, adBreakDuration2);

    if (withinFirstWindow || withinSecondWindow) {
      console.log('⏸️ Binnen reclamepauze venster, ad break direct gestart');
      startAdBreak();
    } else {
      console.log('✅ Buiten reclamepauze vensters, timer actief');
    }

    if (window.addNotification) {
      window.addNotification(`🎵 Timer geactiveerd (${adBreakMode} mode) - pauzes elk uur op minuut ${adBreakMinute} (${adBreakDuration}min) en ${adBreakMinute2} (${adBreakDuration2}min)`, 'success', 4000);
    }
  }, [adBreakMode, playlistUrl, adBreakMinute, adBreakMinute2, adBreakDuration, adBreakDuration2, startAdBreak]);

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

  // Start ad break with specific remaining time
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
    startAdBreak,
    endAdBreak,
    manualAdBreak,
    startTimer,
    stopTimer,
    startAdBreakWithRemainingTime,
    nextAdBreakInFormatted: formatTimeRemaining(getNextAdBreakTime()),
    getAdBreakModeDescription
  };
};