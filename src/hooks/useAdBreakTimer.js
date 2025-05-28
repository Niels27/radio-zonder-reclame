import { useState, useEffect, useRef, useCallback } from 'react';

export const useAdBreakTimer = (audioPlayer) => {
  const [adBreakMinute, setAdBreakMinute] = useState(30); // minute of hour when ads start
  const [adBreakDuration, setAdBreakDuration] = useState(5); // minutes
  const [timeToNextAdBreak, setTimeToNextAdBreak] = useState(0); // seconds
  const [isAdBreakActive, setIsAdBreakActive] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [playlistThumbnail, setPlaylistThumbnail] = useState(null);
  const [playlistTitle, setPlaylistTitle] = useState('');
  
  const intervalRef = useRef(null);
  const adBreakTimeoutRef = useRef(null);
  const lastStationRef = useRef(null);

  // Calculate time to next ad break based on hourly schedule
  const calculateTimeToNextAdBreak = useCallback(() => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    let minutesToWait = adBreakMinute - currentMinute;
    
    // If we've passed the ad break time this hour, wait for next hour
    if (minutesToWait <= 0) {
      minutesToWait += 60; // Next hour
    }
    
    // Convert to seconds and subtract current seconds
    return (minutesToWait * 60) - currentSecond;
  }, [adBreakMinute]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('adBreakSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAdBreakMinute(settings.minute || 30);
        setAdBreakDuration(settings.duration || 5);
        setPlaylistUrl(settings.playlistUrl || '');
        setPlaylistThumbnail(settings.playlistThumbnail || null);
        setPlaylistTitle(settings.playlistTitle || '');
      } catch (error) {
        console.error('Failed to load ad break settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    const settings = {
      minute: adBreakMinute,
      duration: adBreakDuration,
      playlistUrl,
      playlistThumbnail,
      playlistTitle
    };
    localStorage.setItem('adBreakSettings', JSON.stringify(settings));
  }, [adBreakMinute, adBreakDuration, playlistUrl, playlistThumbnail, playlistTitle]);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings();
  }, [saveSettings]);

  // Start countdown timer
  const startTimer = useCallback(() => {
    if (intervalRef.current) return; // Already running
    
    setTimeToNextAdBreak(calculateTimeToNextAdBreak());
    setIsTimerRunning(true);

    intervalRef.current = setInterval(() => {
      setTimeToNextAdBreak(prev => {
        if (prev <= 1) {
          // Time for ad break - recalculate for next hour
          return calculateTimeToNextAdBreak();
        }
        return prev - 1;
      });
    }, 1000);
  }, [calculateTimeToNextAdBreak]);

  // Stop countdown timer
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }
    setIsTimerRunning(false);
    setTimeToNextAdBreak(0);
  }, []);
  // Handle ad break trigger
  const triggerAdBreak = useCallback(async () => {
    if (!playlistUrl || !audioPlayer) return;
    
    try {
      // Extract playlist ID from URL
      const { validatePlaylistUrl } = await import('../utils/youtubeUtils');
      const validation = await validatePlaylistUrl(playlistUrl);
      
      if (!validation.isValid) {
        console.error('Ongeldige afspeellijst URL');
        return;
      }
      
      // Save current station if playing radio
      if (audioPlayer.currentSource === 'radio' && audioPlayer.currentStation) {
        lastStationRef.current = audioPlayer.currentStation;
      }
      
      // Start playlist
      setIsAdBreakActive(true);
      await audioPlayer.playPlaylist(validation.playlistId);
      
      // Set timeout to return to radio after ad break
      adBreakTimeoutRef.current = setTimeout(() => {
        endAdBreak();
      }, adBreakDuration * 60 * 1000); // Convert minutes to milliseconds
      
    } catch (error) {
      console.error('Failed to start ad break:', error);
      setIsAdBreakActive(false);
    }
  }, [playlistUrl, audioPlayer, adBreakDuration]);

  // End ad break and return to radio
  const endAdBreak = useCallback(() => {
    setIsAdBreakActive(false);
    
    if (adBreakTimeoutRef.current) {
      clearTimeout(adBreakTimeoutRef.current);
      adBreakTimeoutRef.current = null;
    }
    
    // Return to last played station
    if (lastStationRef.current && audioPlayer) {
      audioPlayer.playRadio(lastStationRef.current);
    }
  }, [audioPlayer]);

  // Watch for ad break trigger
  useEffect(() => {
    if (timeToNextAdBreak === 1 && isTimerRunning && !isAdBreakActive) {
      triggerAdBreak();
    }
  }, [timeToNextAdBreak, isTimerRunning, isAdBreakActive, triggerAdBreak]);

  // Format time for display
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Manual ad break trigger (for testing)
  const manualAdBreak = useCallback(() => {
    if (!isAdBreakActive) {
      triggerAdBreak();
    } else {
      endAdBreak();
    }
  }, [isAdBreakActive, triggerAdBreak, endAdBreak]);

  // Reset timer with new interval
  const resetTimer = useCallback(() => {
    if (isTimerRunning) {
      stopTimer();
      setTimeout(startTimer, 100); // Small delay to ensure cleanup
    }
  }, [isTimerRunning, stopTimer, startTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);
  return {
    adBreakMinute,
    adBreakDuration,
    timeToNextAdBreak,
    isAdBreakActive,
    playlistUrl,
    playlistThumbnail,
    playlistTitle,
    isTimerRunning,
    setAdBreakMinute,
    setAdBreakDuration,
    setPlaylistUrl: async (url) => {
      setPlaylistUrl(url);
      if (url) {
        try {
          const { validatePlaylistUrl } = await import('../utils/youtubeUtils');
          const validation = await validatePlaylistUrl(url);
          if (validation.isValid) {
            setPlaylistThumbnail(validation.thumbnail);
            setPlaylistTitle(validation.title);
          } else {
            setPlaylistThumbnail(null);
            setPlaylistTitle('');
          }
        } catch (error) {
          console.error('Playlist validatie mislukt:', error);
          setPlaylistThumbnail(null);
          setPlaylistTitle('');
        }
      } else {
        setPlaylistThumbnail(null);
        setPlaylistTitle('');
      }
    },
    startTimer,
    stopTimer,
    resetTimer,
    manualAdBreak,
    formatTime,
    nextAdBreakIn: formatTime(timeToNextAdBreak)
  };
};
