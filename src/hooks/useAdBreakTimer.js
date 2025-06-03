// hooks/useAdBreakTimer.js - Fix timer auto-activation
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\hooks\useAdBreakTimer.js

import { useState, useEffect, useCallback, useRef } from 'react';

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
  const [currentAdBreakTimeLeft, setCurrentAdBreakTimeLeft] = useState(null);  const [enforcingAdBreak, setEnforcingAdBreak] = useState(false);
  const [queuedStation, setQueuedStation] = useState(null);
  const [isManualTestActive, setIsManualTestActive] = useState(false);
  const [shouldPlayPlaylistDuringAdBreak, setShouldPlayPlaylistDuringAdBreak] = useState(false);
  
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
  // End an ad break - DEFINE FIRST
  const endAdBreak = useCallback(() => {
    console.log('🎵 Ending ad break...');
    setIsAdBreakActive(false);
    setCurrentAdBreakTimeLeft(null);
    setEnforcingAdBreak(false);
    setShouldPlayPlaylistDuringAdBreak(false); // Reset playlist flag
    window.isAdBreakActive = false;
      if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }
    
    // Stop YouTube player
    if (audioPlayer.youtubePlayerRef?.current) {
      try {
        audioPlayer.youtubePlayerRef.current.pauseVideo();
      } catch (error) {
        console.warn('Could not pause YouTube player:', error);
      }
    }
    
    // Stop Spotify player
    if (audioPlayer.spotifyPlayerRef?.current) {
      try {
        // Import pauseSpotify function
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
  }, [audioPlayer, queuedStation]);  // Start an ad break - DEFINE SECOND
  const startAdBreak = useCallback(async () => {
    if (isAdBreakActive || !playlistUrl || audioPlayer.isTransitioning) return;
    
    // Check if radio is currently playing before starting ad break
    const isRadioPlaying = audioPlayer.isPlaying && audioPlayer.currentStation && audioPlayer.currentSource === 'radio';
    
    console.log('🎵 Starting ad break...');
    console.log('🎵 Radio currently playing:', isRadioPlaying);
    
    setIsAdBreakActive(true);
    setShouldPlayPlaylistDuringAdBreak(isRadioPlaying); // Track if playlist should play during this ad break
    window.isAdBreakActive = true;
    
    // Always determine duration for timer purposes
    const now = new Date();
    const currentMinute = now.getMinutes();
    const isFirstAdBreak = Math.abs(currentMinute - adBreakMinute) < Math.abs(currentMinute - adBreakMinute2);
    const duration = isFirstAdBreak ? adBreakDuration : adBreakDuration2;
    
    // Set timeout regardless of whether we start playlist
    adBreakTimeoutRef.current = setTimeout(() => {
      endAdBreak();
    }, duration * 60 * 1000);
      if (isRadioPlaying) {
      // Radio is playing - start the playlist
      try {
        const playlistId = extractPlaylistId(playlistUrl);
        if (playlistId) {
          await audioPlayer.playPlaylist(playlistId, {
            shuffle: playlistShuffle,
            repeat: 'all',
            provider: playlistProvider
          });
          
          console.log(`🎵 Playing YouTube playlist for ${duration} minutes`);
          
          if (window.addNotification) {
            window.addNotification(
              `🎵 Reclamepauze gestart - ${duration} minuten YouTube muziek`, 
              'info', 
              5000
            );
          }
        }
      } catch (error) {
        console.error('Failed to start ad break playlist:', error);
        setIsAdBreakActive(false);
        setShouldPlayPlaylistDuringAdBreak(false);
        window.isAdBreakActive = false;
        
        if (adBreakTimeoutRef.current) {
          clearTimeout(adBreakTimeoutRef.current);
          adBreakTimeoutRef.current = null;
        }
        
        if (window.addNotification) {
          window.addNotification('❌ Kon reclamepauze niet starten', 'error', 3000);
        }
      }
    } else {
      // No radio playing - just mark ad break as active for timer, but don't start playlist
      console.log('🎵 No radio playing - ad break active for timer only');
      
      if (window.addNotification) {
        window.addNotification(
          `⏸️ Reclamepauze actief (${duration} min) - selecteer een radio om muziek te horen`, 
          'info', 
          4000
        );
      }
    }
  }, [isAdBreakActive, playlistUrl, playlistShuffle, adBreakDuration, adBreakDuration2, adBreakMinute, adBreakMinute2, audioPlayer, endAdBreak]);  // Start ad break with remaining time - DEFINE THIRD
  const startAdBreakWithRemainingTime = useCallback(async (remainingMinutes) => {
    if (isAdBreakActive || !playlistUrl || audioPlayer.isTransitioning) return;
    
    // Check if radio is currently playing before starting ad break
    const isRadioPlaying = audioPlayer.isPlaying && audioPlayer.currentStation && audioPlayer.currentSource === 'radio';
    
    console.log(`🎵 Starting ad break with ${remainingMinutes} minutes remaining`);
    console.log('🎵 Radio currently playing:', isRadioPlaying);
    
    setIsAdBreakActive(true);
    setCurrentAdBreakTimeLeft(remainingMinutes * 60);
    setShouldPlayPlaylistDuringAdBreak(isRadioPlaying); // Track if playlist should play during this ad break
    window.isAdBreakActive = true;
    
    // Set timeout regardless of whether we start playlist
    adBreakTimeoutRef.current = setTimeout(() => {
      endAdBreak();
      setCurrentAdBreakTimeLeft(null);
    }, remainingMinutes * 60 * 1000);
    
    if (isRadioPlaying) {
      // Radio is playing - start the playlist
      try {
        const playlistId = extractPlaylistId(playlistUrl);        if (playlistId) {
          await audioPlayer.playPlaylist(playlistId, {
            shuffle: playlistShuffle,
            repeat: 'all',
            provider: playlistProvider
          });
          
          console.log(`🎵 Playing YouTube playlist for ${remainingMinutes} minutes`);
          
          if (window.addNotification) {
            window.addNotification(
              `🎵 Reclamepauze gestart - ${remainingMinutes} minuten resterend`, 
              'info', 
              5000
            );
          }
        }
      } catch (error) {
        console.error('Failed to start ad break playlist:', error);
        setIsAdBreakActive(false);
        setCurrentAdBreakTimeLeft(null);
        setShouldPlayPlaylistDuringAdBreak(false);
        window.isAdBreakActive = false;
        
        if (adBreakTimeoutRef.current) {
          clearTimeout(adBreakTimeoutRef.current);
          adBreakTimeoutRef.current = null;
        }
        
        if (window.addNotification) {
          window.addNotification('❌ Kon reclamepauze niet starten', 'error', 3000);
        }
      }
    } else {
      // No radio playing - just mark ad break as active for timer, but don't start playlist
      console.log('🎵 No radio playing - ad break active for timer only');
      
      if (window.addNotification) {
        window.addNotification(
          `⏸️ Reclamepauze actief (${remainingMinutes} min resterend) - selecteer een radio om muziek te horen`, 
          'info', 
          4000
        );
      }
    }
  }, [isAdBreakActive, playlistUrl, playlistShuffle, audioPlayer, endAdBreak]);

  // Check ad break time - NOW startAdBreak is defined
  const checkAdBreakTime = useCallback(() => {
    if (!isTimerRunning || isAdBreakActive || !playlistUrl) return;
    
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
  }, [isTimerRunning, isAdBreakActive, playlistUrl, adBreakMinute, adBreakMinute2, startAdBreak]);

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
    if (!playlistUrl) {
      if (window.addNotification) {
        window.addNotification('❌ Voer eerst een geldige YouTube playlist URL in', 'error', 3000);
      }
      return;
    }
    
    console.log('🎵 User manually started ad break timer');
    setIsTimerRunning(true);
    
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    console.log(`🕐 Timer started at ${currentMinute}:${String(currentSecond).padStart(2, '0')}`);
    console.log(`🎯 Ad break windows: ${adBreakMinute}:00-${adBreakMinute + adBreakDuration}:00 and ${adBreakMinute2}:00-${adBreakMinute2 + adBreakDuration2}:00`);
    
    // Helper function to check if current time is within an ad break window (handles hour boundary)
    const checkAdBreakWindow = (startMinute, duration) => {
      const endMinute = startMinute + duration;
      
      if (endMinute <= 60) {
        // Ad break doesn't cross hour boundary
        return currentMinute >= startMinute && currentMinute < endMinute;
      } else {
        // Ad break crosses hour boundary (e.g., 59 + 5 = 64, so goes to minute 4 of next hour)
        return currentMinute >= startMinute || currentMinute < (endMinute - 60);
      }
    };
    
    // Helper function to calculate remaining time (handles hour boundary)
    const calculateRemainingTime = (startMinute, duration) => {
      const endMinute = startMinute + duration;
      let elapsedMinutes, elapsedSeconds, totalElapsedSeconds, totalBreakSeconds, remainingSeconds;
      
      if (endMinute <= 60) {
        // Ad break doesn't cross hour boundary
        elapsedMinutes = currentMinute - startMinute;
        elapsedSeconds = currentSecond;
        totalElapsedSeconds = (elapsedMinutes * 60) + elapsedSeconds;
      } else {
        // Ad break crosses hour boundary
        if (currentMinute >= startMinute) {
          // We're in the same hour as the start
          elapsedMinutes = currentMinute - startMinute;
          elapsedSeconds = currentSecond;
          totalElapsedSeconds = (elapsedMinutes * 60) + elapsedSeconds;
        } else {
          // We're in the next hour
          elapsedMinutes = (60 - startMinute) + currentMinute;
          elapsedSeconds = currentSecond;
          totalElapsedSeconds = (elapsedMinutes * 60) + elapsedSeconds;
        }
      }
      
      totalBreakSeconds = duration * 60;
      remainingSeconds = totalBreakSeconds - totalElapsedSeconds;
      
      return {
        totalElapsedSeconds,
        remainingSeconds,
        elapsedMinutes: Math.floor(totalElapsedSeconds / 60),
        elapsedSecondsOnly: totalElapsedSeconds % 60
      };
    };
    
    // Check if we're currently in ANY ad break window
    const isInFirstAdBreakWindow = checkAdBreakWindow(adBreakMinute, adBreakDuration);
    const isInSecondAdBreakWindow = checkAdBreakWindow(adBreakMinute2, adBreakDuration2);
    
    if (isInFirstAdBreakWindow || isInSecondAdBreakWindow) {
      // Determine which ad break we're in
      const activeBreakMinute = isInFirstAdBreakWindow ? adBreakMinute : adBreakMinute2;
      const activeBreakDuration = isInFirstAdBreakWindow ? adBreakDuration : adBreakDuration2;
      
      const timeInfo = calculateRemainingTime(activeBreakMinute, activeBreakDuration);
      
      console.log(`🎯 In ad break window! Elapsed: ${timeInfo.elapsedMinutes}m${timeInfo.elapsedSecondsOnly}s, Remaining: ${Math.floor(timeInfo.remainingSeconds/60)}m${timeInfo.remainingSeconds%60}s`);
      
      if (timeInfo.remainingSeconds > 0) {
        const remainingMinutes = Math.ceil(timeInfo.remainingSeconds / 60);
        console.log(`🎵 Starting ad break with ${remainingMinutes} minutes remaining`);
        startAdBreakWithRemainingTime(remainingMinutes);
      } else {
        console.log('🎵 Ad break window ended, setting up next countdown');
        const nextBreakTime = getNextAdBreakTime();
        setNextAdBreakIn(formatTimeRemaining(nextBreakTime));
      }
    } else {
      console.log('🎵 Not in ad break window, setting up countdown');
      const nextBreakTime = getNextAdBreakTime();
      setNextAdBreakIn(formatTimeRemaining(nextBreakTime));
    }
    
    if (window.addNotification) {
      window.addNotification(`🎵 Timer geactiveerd - pauzes elk uur op minuut ${adBreakMinute} (${adBreakDuration}min) en ${adBreakMinute2} (${adBreakDuration2}min)`, 'success', 4000);
    }
  }, [playlistUrl, adBreakMinute, adBreakMinute2, adBreakDuration, adBreakDuration2, startAdBreakWithRemainingTime, getNextAdBreakTime, formatTimeRemaining]);

  // Stop timer - FIXED to properly handle deactivation during ad break
  const stopTimer = useCallback(() => {
    console.log('🎵 Completely stopping ad break system');
    
    setIsTimerRunning(false);
    setNextAdBreakIn(null);
    setEnforcingAdBreak(false);
    
    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }
    
    // If ad break is active (but not manual test), end it and resume properly
    if (isAdBreakActive && !isManualTestActive) {
      console.log('🎵 Ending ad break due to timer stop');
        // IMPORTANT: Don't call endAdBreak() here as it has its own logic
      // Instead manually handle the stop
      setIsAdBreakActive(false);
      setCurrentAdBreakTimeLeft(null);
      setShouldPlayPlaylistDuringAdBreak(false); // Reset playlist flag
      window.isAdBreakActive = false;
        // Stop YouTube player
      if (audioPlayer.youtubePlayerRef?.current) {
        try {
          audioPlayer.youtubePlayerRef.current.pauseVideo();
        } catch (error) {
          console.warn('Could not pause YouTube player:', error);
        }
      }
      
      // Stop Spotify player
      if (audioPlayer.spotifyPlayerRef?.current) {
        try {
          // Import pauseSpotify function
          import('../utils/spotifyUtils').then(({ pauseSpotify }) => {
            pauseSpotify();
            console.log('🎵 Spotify player paused on timer stop');
          }).catch(error => {
            console.warn('Could not pause Spotify player:', error);
          });
        } catch (error) {
          console.warn('Could not pause Spotify player:', error);
        }
      }
      
      // Resume radio with proper priority
      setTimeout(() => {
        if (queuedStation) {
          console.log('🎵 Resuming with queued station:', queuedStation.name);
          audioPlayer.playRadio(queuedStation);
          setQueuedStation(null);
          
          if (window.addNotification) {
            window.addNotification(`📻 Timer gestopt - gewisseld naar ${queuedStation.name}`, 'success', 3000);
          }
        } else if (audioPlayer.isRadioPausedForAdBreak && audioPlayer.pausedRadioStation) {
          console.log('🎵 Resuming paused radio from deactivation:', audioPlayer.pausedRadioStation.name);
          audioPlayer.resumeRadioFromAdBreak();
          
          if (window.addNotification) {
            window.addNotification(`📻 Timer gestopt - terug naar ${audioPlayer.pausedRadioStation.name}`, 'success', 3000);
          }
        } else {
          // Try last saved station
          const lastStation = localStorage.getItem('lastPlayedStation');
          if (lastStation) {
            try {
              const stationData = JSON.parse(lastStation);
              console.log('🎵 Resuming last radio station:', stationData.name);
              audioPlayer.playRadio(stationData);
              
              if (window.addNotification) {
                window.addNotification(`📻 Timer gestopt - terug naar ${stationData.name}`, 'success', 3000);
              }
            } catch (error) {
              console.error('Could not resume last station:', error);
              if (window.addNotification) {
                window.addNotification('📻 Timer gestopt - selecteer een radiozender', 'info', 3000);
              }
            }
          }
        }
      }, 500);
    }
    
    // Clear global state
    window.isAdBreakActive = false;
    
    if (!isAdBreakActive) {
      setQueuedStation(null);
    }
    
    console.log('🎵 Ad break system completely stopped');
  }, [isAdBreakActive, isManualTestActive, audioPlayer, queuedStation]);

  // Manual ad break trigger
  const manualAdBreak = useCallback(() => {
    if (!playlistUrl) {
      if (window.addNotification) {
        window.addNotification('❌ Voer eerst een geldige YouTube playlist URL in', 'error', 3000);
      }
      return;
    }
      if (isManualTestActive) {
      // Stop manual test
      console.log('🎵 Stopping manual ad break test');
      setIsManualTestActive(false);
      setShouldPlayPlaylistDuringAdBreak(false); // Reset playlist flag
        if (audioPlayer.youtubePlayerRef?.current) {
        try {
          audioPlayer.youtubePlayerRef.current.pauseVideo();
        } catch (error) {
          console.warn('Could not stop YouTube player:', error);
        }
      }
      
      // Stop Spotify player
      if (audioPlayer.spotifyPlayerRef?.current) {
        try {
          // Import pauseSpotify function
          import('../utils/spotifyUtils').then(({ pauseSpotify }) => {
            pauseSpotify();
            console.log('🎵 Spotify player paused on manual test stop');
          }).catch(error => {
            console.warn('Could not pause Spotify player:', error);
          });
        } catch (error) {
          console.warn('Could not pause Spotify player:', error);
        }
      }
      
      // Resume radio if paused
      if (audioPlayer.isRadioPausedForAdBreak && audioPlayer.pausedRadioStation) {
        audioPlayer.resumeRadioFromAdBreak();
      }
      
      if (window.addNotification) {
        window.addNotification('🛑 Test pauze gestopt', 'info', 2000);
      }    } else {
      // Start manual test
      console.log('🎵 Starting manual ad break test');
      setIsManualTestActive(true);
      setShouldPlayPlaylistDuringAdBreak(true); // Manual tests always play playlist
        const playlistId = extractPlaylistId(playlistUrl);
      if (playlistId) {
        audioPlayer.playPlaylist(playlistId, {
          shuffle: playlistShuffle,
          repeat: 'all',
          provider: playlistProvider
        });
        
        if (window.addNotification) {
          window.addNotification('🧪 Test pauze gestart - klik opnieuw om te stoppen', 'info', 3000);
        }
      }
    }
  }, [playlistUrl, playlistShuffle, audioPlayer, isManualTestActive]);

  // Countdown effect for active ad break
  useEffect(() => {
    if (currentAdBreakTimeLeft === null) return;
    
    const countdown = setInterval(() => {
      setCurrentAdBreakTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdown);
  }, [currentAdBreakTimeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (adBreakTimeoutRef.current) clearTimeout(adBreakTimeoutRef.current);
    };
  }, []);

  // Queue a station switch
  const queueStationSwitch = useCallback((station) => {
    setQueuedStation(station);
    if (window.addNotification) {
      window.addNotification(`📻 ${station.name} in wachtrij - wisselt na reclamepauze`, 'info', 3000);
    }
  }, []);

  // Cancel queued switch
  const cancelQueuedSwitch = useCallback(() => {
    setQueuedStation(null);
    if (window.addNotification) {
      window.addNotification('❌ Wachtrij gewist', 'info', 2000);
    }
  }, []);    return {
    adBreakMinute,
    adBreakMinute2,
    adBreakDuration,
    adBreakDuration2,
    isTimerRunning,
    isAdBreakActive,
    nextAdBreakIn,
    playlistUrl,
    playlistShuffle,
    currentAdBreakTimeLeft,
    queuedStation,
    isManualTestActive,
    shouldPlayPlaylistDuringAdBreak,
    setAdBreakMinute,
    setAdBreakMinute2,
    setAdBreakDuration,
    setAdBreakDuration2,
    setPlaylistUrl,
    setPlaylistShuffle,
    startTimer,
    stopTimer,
    manualAdBreak,
    queueStationSwitch,
    cancelQueuedSwitch
  };
};