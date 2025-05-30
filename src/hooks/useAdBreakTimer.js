// hooks/useAdBreakTimer.js - Fix timer auto-activation
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\hooks\useAdBreakTimer.js

import { useState, useEffect, useCallback, useRef } from 'react';

export const useAdBreakTimer = (audioPlayer) => {
  const [adBreakMinute, setAdBreakMinute] = useState(0);
  const [adBreakMinute2, setAdBreakMinute2] = useState(30);
  const [adBreakDuration, setAdBreakDuration] = useState(5);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAdBreakActive, setIsAdBreakActive] = useState(false);
  const [nextAdBreakIn, setNextAdBreakIn] = useState(null);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistShuffle, setPlaylistShuffle] = useState(false);
  const [currentAdBreakTimeLeft, setCurrentAdBreakTimeLeft] = useState(null);
  const [enforcingAdBreak, setEnforcingAdBreak] = useState(false);
  const [queuedStation, setQueuedStation] = useState(null);
  const [isManualTestActive, setIsManualTestActive] = useState(false);
  
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

  // Extract playlist ID from URL
  const extractPlaylistId = (url) => {
    const regex = /[?&]list=([^#\&\?]*)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // End an ad break - DEFINE FIRST
  const endAdBreak = useCallback(() => {
    console.log('🎵 Ending ad break...');
    setIsAdBreakActive(false);
    setCurrentAdBreakTimeLeft(null);
    setEnforcingAdBreak(false);
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
  }, [audioPlayer, queuedStation]);

  // Start an ad break - DEFINE SECOND
  const startAdBreak = useCallback(async () => {
    if (isAdBreakActive || !playlistUrl || audioPlayer.isTransitioning) return;
    
    console.log('🎵 Starting ad break...');
    setIsAdBreakActive(true);
    window.isAdBreakActive = true;
    
    try {
      const playlistId = extractPlaylistId(playlistUrl);
      if (playlistId) {
        await audioPlayer.playPlaylist(playlistId, {
          shuffle: playlistShuffle,
          repeat: 'all'
        });
        
        console.log(`🎵 Playing YouTube playlist for ${adBreakDuration} minutes`);
        
        adBreakTimeoutRef.current = setTimeout(() => {
          endAdBreak();
        }, adBreakDuration * 60 * 1000);
        
        if (window.addNotification) {
          window.addNotification(
            `🎵 Reclamepauze gestart - ${adBreakDuration} minuten YouTube muziek`, 
            'info', 
            5000
          );
        }
      }
    } catch (error) {
      console.error('Failed to start ad break:', error);
      setIsAdBreakActive(false);
      window.isAdBreakActive = false;
      
      if (window.addNotification) {
        window.addNotification('❌ Kon reclamepauze niet starten', 'error', 3000);
      }
    }
  }, [isAdBreakActive, playlistUrl, playlistShuffle, adBreakDuration, audioPlayer, endAdBreak]);

  // Start ad break with remaining time - DEFINE THIRD
  const startAdBreakWithRemainingTime = useCallback(async (remainingMinutes) => {
    if (isAdBreakActive || !playlistUrl || audioPlayer.isTransitioning) return;
    
    console.log(`🎵 Starting ad break with ${remainingMinutes} minutes remaining`);
    setIsAdBreakActive(true);
    setCurrentAdBreakTimeLeft(remainingMinutes * 60);
    window.isAdBreakActive = true;
    
    try {
      const playlistId = extractPlaylistId(playlistUrl);
      if (playlistId) {
        await audioPlayer.playPlaylist(playlistId, {
          shuffle: playlistShuffle,
          repeat: 'all'
        });
        
        console.log(`🎵 Playing YouTube playlist for ${remainingMinutes} minutes`);
        
        adBreakTimeoutRef.current = setTimeout(() => {
          endAdBreak();
          setCurrentAdBreakTimeLeft(null);
        }, remainingMinutes * 60 * 1000);
        
        if (window.addNotification) {
          window.addNotification(
            `🎵 Reclamepauze gestart - ${remainingMinutes} minuten resterend`, 
            'info', 
            5000
          );
        }
      }
    } catch (error) {
      console.error('Failed to start ad break:', error);
      setIsAdBreakActive(false);
      setCurrentAdBreakTimeLeft(null);
      window.isAdBreakActive = false;
      
      if (window.addNotification) {
        window.addNotification('❌ Kon reclamepauze niet starten', 'error', 3000);
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
    console.log(`🎯 Ad break windows: ${adBreakMinute}:00-${adBreakMinute + adBreakDuration}:00 and ${adBreakMinute2}:00-${adBreakMinute2 + adBreakDuration}:00`);
    
    // Check if we're currently in ANY ad break window
    const isInFirstAdBreakWindow = (
      currentMinute >= adBreakMinute && 
      currentMinute < adBreakMinute + adBreakDuration
    );
    
    const isInSecondAdBreakWindow = (
      currentMinute >= adBreakMinute2 && 
      currentMinute < adBreakMinute2 + adBreakDuration
    );
    
    if (isInFirstAdBreakWindow || isInSecondAdBreakWindow) {
      // Calculate remaining time properly
      let activeBreakMinute = isInFirstAdBreakWindow ? adBreakMinute : adBreakMinute2;
      let elapsedMinutes = currentMinute - activeBreakMinute;
      let elapsedSeconds = currentSecond;
      let totalElapsedSeconds = (elapsedMinutes * 60) + elapsedSeconds;
      let totalBreakSeconds = adBreakDuration * 60;
      let remainingSeconds = totalBreakSeconds - totalElapsedSeconds;
      
      console.log(`🎯 In ad break window! Elapsed: ${Math.floor(totalElapsedSeconds/60)}m${totalElapsedSeconds%60}s, Remaining: ${Math.floor(remainingSeconds/60)}m${remainingSeconds%60}s`);
      
      if (remainingSeconds > 0) {
        let remainingMinutes = Math.ceil(remainingSeconds / 60);
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
      window.addNotification(`🎵 Timer geactiveerd - pauzes elk uur op minuut ${adBreakMinute} en ${adBreakMinute2}`, 'success', 4000);
    }
  }, [playlistUrl, adBreakMinute, adBreakMinute2, adBreakDuration, startAdBreakWithRemainingTime, getNextAdBreakTime, formatTimeRemaining]);

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
      window.isAdBreakActive = false;
      
      // Stop YouTube player
      if (audioPlayer.youtubePlayerRef?.current) {
        try {
          audioPlayer.youtubePlayerRef.current.pauseVideo();
        } catch (error) {
          console.warn('Could not pause YouTube player:', error);
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
      
      if (audioPlayer.youtubePlayerRef?.current) {
        try {
          audioPlayer.youtubePlayerRef.current.pauseVideo();
        } catch (error) {
          console.warn('Could not stop YouTube player:', error);
        }
      }
      
      // Resume radio if paused
      if (audioPlayer.isRadioPausedForAdBreak && audioPlayer.pausedRadioStation) {
        audioPlayer.resumeRadioFromAdBreak();
      }
      
      if (window.addNotification) {
        window.addNotification('🛑 Test pauze gestopt', 'info', 2000);
      }
    } else {
      // Start manual test
      console.log('🎵 Starting manual ad break test');
      setIsManualTestActive(true);
      
      const playlistId = extractPlaylistId(playlistUrl);
      if (playlistId) {
        audioPlayer.playPlaylist(playlistId, {
          shuffle: playlistShuffle,
          repeat: 'all'
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
  }, []);

  return {
    adBreakMinute,
    adBreakMinute2,
    adBreakDuration,
    isTimerRunning,
    isAdBreakActive,
    nextAdBreakIn,
    playlistUrl,
    playlistShuffle,
    currentAdBreakTimeLeft,
    queuedStation,
    isManualTestActive,
    setAdBreakMinute,
    setAdBreakMinute2,
    setAdBreakDuration,
    setPlaylistUrl,
    setPlaylistShuffle,
    startTimer,
    stopTimer,
    manualAdBreak,
    queueStationSwitch,
    cancelQueuedSwitch
  };
};