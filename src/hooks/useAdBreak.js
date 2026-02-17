// hooks/useAdBreak.js - Simplified ad break management hook
// Wrapper for AdBreakController with timer management

import { useEffect, useCallback, useRef } from 'react';
import { useAppState, useActions } from '../core/StateManager';
import { AdBreakController } from '../core/AdBreakController';
import { getRandomNonstopStation } from '../utils/nonstopUtils';
import { extractYouTubeVideoId } from '../utils/lofiUtils';
import { extractPlaylistId as extractYouTubePlaylistId } from '../utils/youtubeUtils';
import { notify } from '../utils/eventBus';

export function useAdBreak(audioManager, interruptionHandler) {
  const state = useAppState();
  const actions = useActions();

  const adBreakControllerRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Initialize AdBreakController
  useEffect(() => {
    if (!adBreakControllerRef.current && audioManager) {
      adBreakControllerRef.current = new AdBreakController(audioManager, actions);
      console.log('✅ useAdBreak: Controller initialized');
    }
  }, [audioManager, actions]);

  /**
   * Calculate time until next ad break (in seconds)
   */
  const calculateNextAdBreak = useCallback(() => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // Calculate time to both ad breaks
    const timeToBreak1 = (state.adBreakMinute - currentMinute + 60) % 60;
    const timeToBreak2 = (state.adBreakMinute2 - currentMinute + 60) % 60;

    // Get the nearest one
    let nextBreakMinutes = Math.min(timeToBreak1, timeToBreak2);

    // If we're at the exact minute
    if (nextBreakMinutes === 0) {
      if (currentSecond <= 30) {
        return 0; // Start now
      } else {
        // Missed this one, get next
        const allBreaks = [timeToBreak1, timeToBreak2].filter(t => t > 0);
        nextBreakMinutes = allBreaks.length > 0 ? Math.min(...allBreaks) : 60;
      }
    }

    // Convert to seconds
    const totalSeconds = (nextBreakMinutes * 60) - currentSecond;
    return Math.max(0, totalSeconds);
  }, [state.adBreakMinute, state.adBreakMinute2]);

  /**
   * Get duration based on which break is closer
   */
  const getDuration = useCallback(() => {
    const now = new Date();
    const currentMinute = now.getMinutes();

    const timeToBreak1 = Math.abs((state.adBreakMinute - currentMinute + 60) % 60);
    const timeToBreak2 = Math.abs((state.adBreakMinute2 - currentMinute + 60) % 60);

    return timeToBreak1 <= timeToBreak2 ? state.adBreakDuration : state.adBreakDuration2;
  }, [state.adBreakMinute, state.adBreakMinute2, state.adBreakDuration, state.adBreakDuration2]);

  /**
   * Get configuration for current ad break mode
   */
  const getAdBreakConfig = useCallback(async () => {
    switch (state.adBreakMode) {
      case 'playlist':
        if (!state.playlistUrl) {
          throw new Error('Geen afspeellijst ingesteld');
        }
        return {
          playlistId: state.playlistUrl,
          provider: state.playlistProvider,
          shuffle: state.playlistShuffle
        };

      case 'nonstop': {
        const nonstopStation = getRandomNonstopStation();
        if (!nonstopStation) {
          throw new Error('Geen nonstop stations beschikbaar');
        }
        return { station: nonstopStation };
      }

      case 'youtube': {
        const ytUrl = state.youtubeUrl;
        if (!ytUrl) {
          throw new Error('Geen YouTube URL ingesteld');
        }
        const videoId = extractYouTubeVideoId(ytUrl);
        const playlistId = extractYouTubePlaylistId(ytUrl);
        if (!videoId && !playlistId) {
          throw new Error('Ongeldige YouTube URL');
        }
        return { videoId, playlistId };
      }

      default:
        throw new Error(`Onbekende modus: ${state.adBreakMode}`);
    }
  }, [state.adBreakMode, state.playlistUrl, state.playlistProvider, state.playlistShuffle, state.youtubeUrl]);

  /**
   * Get label for current mode
   */
  const getModeLabel = useCallback(() => {
    switch (state.adBreakMode) {
      case 'playlist': return 'afspeellijst';
      case 'nonstop': return 'nonstop radio';
      case 'youtube': return 'YouTube';
      default: return 'onbekend';
    }
  }, [state.adBreakMode]);

  /**
   * Start an ad break
   */
  const startAdBreak = useCallback(async () => {
    if (!adBreakControllerRef.current) {
      console.error('❌ useAdBreak: Controller not initialized');
      return;
    }

    if (state.isAdBreakActive) {
      console.warn('⚠️ useAdBreak: Ad break already active');
      return;
    }

    try {
      // Register action with interruption handler
      if (interruptionHandler) {
        interruptionHandler.registerAction('ad_break', {
          mode: state.adBreakMode,
          duration: getDuration()
        });
      }

      console.log(`🎵 useAdBreak: Starting ${state.adBreakMode} ad break`);

      // Get duration (which break was closer?)
      const duration = getDuration();

      // Get configuration based on mode
      const config = await getAdBreakConfig();

      // Start the ad break
      await adBreakControllerRef.current.start(state.adBreakMode, duration, config);

      notify(`🎵 Reclamepauze gestart (${getModeLabel()})`, 'info', 3000);

    } catch (error) {
      console.error('❌ useAdBreak: Failed to start ad break', error);
      notify(`❌ Fout: ${error.message}`, 'error', 3000);
    }
  }, [state.isAdBreakActive, state.adBreakMode, interruptionHandler, getDuration, getAdBreakConfig, getModeLabel]);

  /**
   * Start the ad break timer
   */
  const startTimer = useCallback(() => {
    if (state.isTimerRunning) {
      console.warn('⚠️ useAdBreak: Timer already running');
      return;
    }

    if (!state.currentStation) {
      console.warn('⚠️ useAdBreak: No station selected');
      notify('Selecteer eerst een radiostation', 'warning', 3000);
      return;
    }

    console.log('⏰ useAdBreak: Starting timer');
    actions.startTimer();

    // Update countdown every second
    const updateCountdown = () => {
      const timeUntilNext = calculateNextAdBreak();
     // console.log(`⏱️ Timer update: ${timeUntilNext}s until next break`);
      actions.setNextAdBreakIn(timeUntilNext);

      // Trigger ad break if time reached
      if (timeUntilNext === 0) {
        console.log('🚨 TIMER HIT ZERO! Triggering ad break...');

        // Clear interval to prevent duplicate triggers
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        // Trigger ad break
        startAdBreak();
      }
    };

    updateCountdown();
    timerIntervalRef.current = setInterval(updateCountdown, 1000);

    notify('⏰ Automatisch wisselen geactiveerd', 'success', 2000);
  }, [state.isTimerRunning, state.currentStation, state.isAdBreakActive, calculateNextAdBreak, actions, startAdBreak]);

  /**
   * Stop the timer completely
   */
  const stopTimer = useCallback(() => {
    console.log('⏰ useAdBreak: Stopping timer');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    actions.stopTimer();
    actions.setNextAdBreakIn(null);
    actions.setAdBreakTimeLeft(null);

    // If ad break is active, end it
    if (state.isAdBreakActive && adBreakControllerRef.current) {
      adBreakControllerRef.current.cancel();
    }

    notify('⏰ Automatisch wisselen gedeactiveerd', 'success', 2000);
  }, [state.isAdBreakActive, actions]);

  /**
   * End the current ad break
   */
  const endAdBreak = useCallback(async () => {
    if (!adBreakControllerRef.current) return;

    try {
      await adBreakControllerRef.current.end();

      notify('🎵 Terug naar radio', 'success', 2000);
    } catch (error) {
      console.error('❌ useAdBreak: Failed to end ad break', error);
    }
  }, []);

  /**
   * Manual ad break test
   */
  const manualAdBreak = useCallback(async () => {
    console.log('🎵 useAdBreak: Manual test triggered');

    // Register as manual action
    if (interruptionHandler) {
      interruptionHandler.registerAction('manual_ad_break', {
        mode: state.adBreakMode
      });
    }

    await startAdBreak();
  }, [startAdBreak, state.adBreakMode, interruptionHandler]);

  /**
   * Extend current ad break
   */
  const extendAdBreak = useCallback((minutes) => {
    if (!adBreakControllerRef.current || !state.isAdBreakActive) {
      console.warn('⚠️ useAdBreak: No active ad break to extend');
      return;
    }

    adBreakControllerRef.current.extend(minutes);

    notify(`⏰ +${minutes} minuut toegevoegd`, 'info', 2000);
  }, [state.isAdBreakActive]);

  /**
   * Cancel current ad break
   */
  const cancelAdBreak = useCallback(() => {
    if (!adBreakControllerRef.current) return;

    adBreakControllerRef.current.cancel();

    notify('🚫 Reclamepauze geannuleerd', 'info', 2000);
  }, []);

  /**
   * Skip timer to zero (trigger ad break immediately)
   */
  const skipToZero = useCallback(() => {
    if (!state.isTimerRunning) {
      console.warn('⚠️ useAdBreak: Timer not running');
      return;
    }

    if (state.isAdBreakActive) {
      console.warn('⚠️ useAdBreak: Ad break already active');
      return;
    }

    console.log('⏭️ useAdBreak: Skipping to zero - triggering ad break now');

    // Set countdown to 0
    actions.setNextAdBreakIn(0);

    // Immediately trigger ad break
    startAdBreak();
  }, [state.isTimerRunning, state.isAdBreakActive, actions, startAdBreak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  /**
   * Get saved station (the radio station we'll return to after ad break)
   */
  const getSavedStation = useCallback(() => {
    if (!adBreakControllerRef.current) return null;
    return adBreakControllerRef.current.getSavedStation();
  }, []);

  return {
    // State
    isTimerRunning: state.isTimerRunning,
    isAdBreakActive: state.isAdBreakActive,
    adBreakMode: state.adBreakMode,
    adBreakTimeLeft: state.adBreakTimeLeft,
    nextAdBreakIn: state.nextAdBreakIn,
    adBreakMinute: state.adBreakMinute,
    adBreakMinute2: state.adBreakMinute2,
    adBreakDuration: state.adBreakDuration,
    adBreakDuration2: state.adBreakDuration2,
    savedStation: getSavedStation(), // ✅ NEW: Expose saved station

    // Actions
    startTimer,
    stopTimer,
    startAdBreak,
    endAdBreak,
    manualAdBreak,
    extendAdBreak,
    cancelAdBreak,
    skipToZero,

    // Setters
    setAdBreakMode: actions.setAdBreakMode,
    setAdBreakMinute: (minute) => actions.setAdBreakSettings({ adBreakMinute: minute }),
    setAdBreakMinute2: (minute) => actions.setAdBreakSettings({ adBreakMinute2: minute }),
    setAdBreakDuration: (duration) => actions.setAdBreakSettings({ adBreakDuration: duration }),
    setAdBreakDuration2: (duration) => actions.setAdBreakSettings({ adBreakDuration2: duration })
  };
}

export default useAdBreak;
