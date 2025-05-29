// hooks/useAdBreakTimer.js - Add logic for immediate ad break with remaining time display
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
  
  const timerRef = useRef(null);
  const adBreakTimeoutRef = useRef(null);

  // Calculate next ad break time
  const getNextAdBreakTime = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Sort the ad break minutes to handle them in order
    const adBreakMinutes = [adBreakMinute, adBreakMinute2].sort((a, b) => a - b);
    
    // Find the next ad break time
    for (const minute of adBreakMinutes) {
      if (currentMinute < minute || (currentMinute === minute && currentSecond < 30)) {
        // Next ad break is in the current hour
        const nextBreak = new Date();
        nextBreak.setHours(currentHour, minute, 0, 0);
        return nextBreak;
      }
    }
    
    // All ad breaks for current hour have passed, get the first one of next hour
    const nextBreak = new Date();
    nextBreak.setHours(currentHour + 1, adBreakMinutes[0], 0, 0);
    return nextBreak;
  }, [adBreakMinute, adBreakMinute2]);

  // Format time remaining until next ad break
  const formatTimeRemaining = useCallback((targetTime) => {
    const now = new Date();
    const diff = targetTime - now;
    
    if (diff <= 0) return null;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, []);

  // Check if it's time for an ad break
  const checkAdBreakTime = useCallback(() => {
    if (!isTimerRunning || isAdBreakActive || !playlistUrl) return;
    
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Check if current time matches any of the ad break minutes (with 30-second window)
    const shouldStartAdBreak = (
      (currentMinute === adBreakMinute && currentSecond >= 0 && currentSecond <= 30) ||
      (currentMinute === adBreakMinute2 && currentSecond >= 0 && currentSecond <= 30)
    );
    
    if (shouldStartAdBreak) {
      console.log(`🎵 Ad break triggered at ${currentMinute}:${String(currentSecond).padStart(2, '0')}`);
      startAdBreak();
    }
  }, [isTimerRunning, isAdBreakActive, playlistUrl, adBreakMinute, adBreakMinute2]);

  // Start an ad break
  const startAdBreak = useCallback(async () => {
    if (isAdBreakActive || !playlistUrl) return;
    
    console.log('🎵 Starting ad break...');
    setIsAdBreakActive(true);
    
    try {
      // Extract playlist ID and play
      const playlistId = extractPlaylistId(playlistUrl);
      if (playlistId) {
        await audioPlayer.playPlaylist(playlistId, {
          shuffle: playlistShuffle,
          repeat: 'all'
        });
        
        console.log(`🎵 Playing YouTube playlist for ${adBreakDuration} minutes`);
        
        // Set timer to end ad break
        adBreakTimeoutRef.current = setTimeout(() => {
          endAdBreak();
        }, adBreakDuration * 60 * 1000);
        
        // Show notification
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
      
      if (window.addNotification) {
        window.addNotification('❌ Kon reclamepauze niet starten', 'error', 3000);
      }
    }
  }, [isAdBreakActive, playlistUrl, playlistShuffle, adBreakDuration, audioPlayer]);

  // Start ad break with remaining time
  const startAdBreakWithRemainingTime = useCallback(async (remainingMinutes) => {
    if (isAdBreakActive || !playlistUrl) return;
    
    console.log(`🎵 Starting ad break with ${remainingMinutes} minutes remaining`);
    setIsAdBreakActive(true);
    setCurrentAdBreakTimeLeft(remainingMinutes * 60); // Store in seconds
    
    try {
      const playlistId = extractPlaylistId(playlistUrl);
      if (playlistId) {
        await audioPlayer.playPlaylist(playlistId, {
          shuffle: playlistShuffle,
          repeat: 'all'
        });
        
        console.log(`🎵 Playing YouTube playlist for ${remainingMinutes} minutes`);
        
        // Set timer to end ad break with remaining time
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
      
      if (window.addNotification) {
        window.addNotification('❌ Kon reclamepauze niet starten', 'error', 3000);
      }
    }
  }, [isAdBreakActive, playlistUrl, playlistShuffle, audioPlayer]);

  // End an ad break
  const endAdBreak = useCallback(() => {
    console.log('🎵 Ending ad break...');
    setIsAdBreakActive(false);
    setCurrentAdBreakTimeLeft(null);
    
    // Clear the ad break timeout
    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }
    
    // Stop YouTube player
    if (audioPlayer.youtubePlayerRef?.current) {
      try {
        audioPlayer.youtubePlayerRef.current.pauseVideo();
        console.log('🎵 YouTube player paused');
      } catch (error) {
        console.warn('Could not pause YouTube player:', error);
      }
    }
    
    // Show notification
    if (window.addNotification) {
      window.addNotification('📻 Reclamepauze beëindigd - terug naar radio', 'success', 3000);
    }
  }, [audioPlayer]);

  // Extract playlist ID from URL
  const extractPlaylistId = (url) => {
    const regex = /[?&]list=([^#\&\?]*)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Main timer loop
  useEffect(() => {
    if (!isTimerRunning) return;
    
    const interval = setInterval(() => {
      checkAdBreakTime();
      
      // Update next ad break countdown
      if (!isAdBreakActive) {
        const nextBreakTime = getNextAdBreakTime();
        const timeRemaining = formatTimeRemaining(nextBreakTime);
        setNextAdBreakIn(timeRemaining);
      } else {
        setNextAdBreakIn(null);
      }
    }, 1000);
    
    timerRef.current = interval;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isAdBreakActive, checkAdBreakTime, getNextAdBreakTime, formatTimeRemaining]);

  // Start timer
  const startTimer = useCallback(() => {
    if (!playlistUrl) {
      if (window.addNotification) {
        window.addNotification('❌ Voer eerst een YouTube playlist URL in', 'error', 3000);
      }
      return;
    }
    
    setIsTimerRunning(true);
    
    // Check if we should trigger an ad break immediately with remaining time
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Check if current time is within any ad break window
    const isInFirstAdBreakWindow = currentMinute === adBreakMinute && currentSecond <= (adBreakDuration * 60);
    const isInSecondAdBreakWindow = currentMinute === adBreakMinute2 && currentSecond <= (adBreakDuration * 60);
    
    if (isInFirstAdBreakWindow || isInSecondAdBreakWindow) {
      const targetMinute = isInFirstAdBreakWindow ? adBreakMinute : adBreakMinute2;
      
      // Calculate remaining time more accurately
      let remainingMinutes;
      if (currentMinute === targetMinute) {
        // We're in the exact minute, calculate remaining time
        remainingMinutes = Math.max(1, adBreakDuration - Math.floor(currentSecond / 60));
      } else {
        // We're past the start minute but still in the window
        const minutesPassed = currentMinute - targetMinute;
        remainingMinutes = Math.max(1, adBreakDuration - minutesPassed);
      }
      
      console.log(`🎵 Timer started during ad break window - triggering immediate ad break with ${remainingMinutes} minutes remaining`);
      
      setTimeout(() => {
        startAdBreakWithRemainingTime(remainingMinutes);
      }, 1000);
      
      if (window.addNotification) {
        window.addNotification(
          `⏰ Timer gestart - onmiddellijke reclamepauze (${remainingMinutes}min resterend)`, 
          'info', 
          4000
        );
      }
    } else {
      if (window.addNotification) {
        window.addNotification(
          `⏰ Timer gestart - reclamepauzes op ${String(adBreakMinute).padStart(2, '0')}:00 en ${String(adBreakMinute2).padStart(2, '0')}:00`, 
          'success', 
          4000
        );
      }
    }
    
    console.log(`🎵 Ad break timer started - breaks at ${adBreakMinute}:00 and ${adBreakMinute2}:00 for ${adBreakDuration} minutes each`);
  }, [playlistUrl, adBreakMinute, adBreakMinute2, adBreakDuration]);

  // Stop timer
  const stopTimer = useCallback(() => {
    setIsTimerRunning(false);
    setNextAdBreakIn(null);
    
    // Clear any running timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // End any active ad break
    if (isAdBreakActive) {
      endAdBreak();
    }
    
    console.log('🎵 Ad break timer stopped');
    
    if (window.addNotification) {
      window.addNotification('⏰ Timer gestopt', 'info', 2000);
    }
  }, [isAdBreakActive, endAdBreak]);

  // Reset timer
  const resetTimer = useCallback(() => {
    stopTimer();
    setAdBreakMinute(0);
    setAdBreakMinute2(30);
    setAdBreakDuration(5);
    
    if (window.addNotification) {
      window.addNotification('🔄 Timer instellingen gereset', 'info', 2000);
    }
  }, [stopTimer]);

  // Manual ad break trigger
  const manualAdBreak = useCallback(() => {
    if (!playlistUrl) {
      if (window.addNotification) {
        window.addNotification('❌ Voer eerst een YouTube playlist URL in', 'error', 3000);
      }
      return;
    }
    
    if (isAdBreakActive) {
      // If ad break is active, end it (toggle functionality)
      console.log('🎵 Manual ad break stopped');
      endAdBreak();
      if (window.addNotification) {
        window.addNotification('⏸️ Test reclamepauze gestopt', 'info', 2000);
      }
      return;
    }
    
    console.log('🎵 Manual ad break triggered');
    startAdBreak();
  }, [playlistUrl, isAdBreakActive, startAdBreak, endAdBreak]);

  // Countdown effect for active ad break
  useEffect(() => {
    let countdownInterval;
    
    if (currentAdBreakTimeLeft !== null && currentAdBreakTimeLeft > 0) {
      countdownInterval = setInterval(() => {
        setCurrentAdBreakTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [currentAdBreakTimeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (adBreakTimeoutRef.current) {
        clearTimeout(adBreakTimeoutRef.current);
      }
    };
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
    setAdBreakMinute,
    setAdBreakMinute2,
    setAdBreakDuration,
    setPlaylistUrl,
    setPlaylistShuffle,
    startTimer,
    stopTimer,
    resetTimer,
    manualAdBreak
  };
};