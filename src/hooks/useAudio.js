// hooks/useAudio.js - Simplified audio playback hook
// Wrapper for AudioManager with React integration

import { useEffect, useCallback, useRef } from 'react';
import { useAppState, useActions } from '../core/StateManager';
import { getAudioManager } from '../core/AudioManager';
import { InterruptionHandler } from '../core/InterruptionHandler';
import { notify } from '../utils/eventBus';

export function useAudio() {
  const state = useAppState();
  const actions = useActions();

  const audioManagerRef = useRef(null);
  const interruptionHandlerRef = useRef(null);
  const playAttemptRef = useRef(0);

  // Initialize AudioManager on mount
  useEffect(() => {
    if (!audioManagerRef.current) {
      audioManagerRef.current = getAudioManager();
      interruptionHandlerRef.current = new InterruptionHandler();

      // Sync settings from state BEFORE initializing
      if (state.volume !== undefined) {
        audioManagerRef.current.setVolume(state.volume);
      }
      if (state.fadeAudioStreams !== undefined) {
        audioManagerRef.current.setFadeEnabled(state.fadeAudioStreams);
      }

      // Initialize
      audioManagerRef.current.initialize().then(success => {
        if (!success) {
          console.error('❌ useAudio: AudioManager initialization failed');
        }
      });

      // Set up callbacks
      audioManagerRef.current.on('onStateChange', (newState) => {
        // Keep audioSource in sync with AudioManager's actual active source.
        // AudioManager.currentSource is the single source of truth for "what's
        // playing" - some callers (e.g. AdBreakController) switch sources
        // directly on AudioManager without going through playRadio/playSpotify/
        // playYouTube below, which would otherwise leave state.audioSource stale
        // and the player UI stuck showing the previous source (e.g. radio info
        // lingering after switching to a Spotify ad break).
        actions.setAudioSource(audioManagerRef.current.currentSource);

        if (newState === 'playing') {
          actions.setPlaying(true);
          actions.setPaused(false);
          actions.setLoading(false);
        } else if (newState === 'paused') {
          actions.setPlaying(false);
          actions.setPaused(true);
          actions.setLoading(false);
        } else if (newState === 'loading' || newState === 'transitioning') {
          actions.setLoading(true);
        } else {
          actions.setPlaying(false);
          actions.setPaused(false);
          actions.setLoading(false);
        }
      });

      audioManagerRef.current.on('onError', (error) => {
        actions.setError(error.message || 'Audio afspeelfout');
      });

      // Keep currentStation in sync with whatever radio station AudioManager
      // actually has loaded, the same way audioSource is synced above. Without
      // this, a station switch triggered outside playRadio() (e.g. the nonstop
      // rotation during an ad break, which calls AudioManager.play() directly)
      // never updates state.currentStation, so the player bar keeps showing the
      // name/logo of whichever station was playing before the switch.
      audioManagerRef.current.on('onMetadataChange', (metadata) => {
        if (metadata.station) {
          actions.setStation(metadata.station);
        }
      });

      audioManagerRef.current.on('onEmergency', (event) => {
        notify('Volume automatisch verlaagd voor veiligheid', 'warning', 3000);
      });

      // Set up RadioService callbacks for connection status and buffering
      const radioSource = audioManagerRef.current.getSource('radio');
      if (radioSource) {
        radioSource.onStatusUpdate = (status) => {
          actions.setConnectionStatus(status);
        };
        radioSource.onBufferingChange = (isBuffering) => {
          actions.setBuffering(isBuffering);
        };
      }
    }

    return () => {
      // Cleanup
      if (audioManagerRef.current) {
        audioManagerRef.current.destroy();
      }
    };
  }, []);

  // Sync volume changes from state to AudioManager
  useEffect(() => {
    if (audioManagerRef.current && state.volume !== undefined) {
      audioManagerRef.current.setVolume(state.volume);
    }
  }, [state.volume]);

  // Sync fade setting changes from state to AudioManager
  useEffect(() => {
    if (audioManagerRef.current && state.fadeAudioStreams !== undefined) {
      audioManagerRef.current.setFadeEnabled(state.fadeAudioStreams);
    }
  }, [state.fadeAudioStreams]);

  /**
   * Play a radio station
   */
  const playRadio = useCallback(async (station) => {
    if (!audioManagerRef.current) return false;

    // Increment attempt ID - any previous play call will see its ID is stale
    playAttemptRef.current++;
    const myAttemptId = playAttemptRef.current;

    try {
      // Check for interruption
      const interruption = interruptionHandlerRef.current.handleUserAction('station_select', { station });
      if (interruption.wasInterrupted) {
        console.log('🔔 useAudio: User interrupted automated action');
      }

      // Immediately update UI to show new station
      actions.setLoading(true);
      actions.setStation(station);
      actions.setAudioSource('radio');
      actions.setConnectionStatus(null);
      actions.setBuffering(false);

      const success = await audioManagerRef.current.play('radio', { station });

      // Only update state if this is still the current attempt
      if (playAttemptRef.current !== myAttemptId) {
        console.log('🔄 useAudio: Stale play attempt, ignoring result');
        return false;
      }

      if (success) {
        try {
          localStorage.setItem('lastPlayedStation', JSON.stringify(station));
        } catch (error) {
          console.warn('Failed to save last played station', error);
        }
      }

      actions.setLoading(false);
      actions.setConnectionStatus(null);
      return success;

    } catch (error) {
      // Only update error state if still current attempt
      if (playAttemptRef.current !== myAttemptId) return false;

      console.error('❌ useAudio: Failed to play radio', error);
      actions.setLoading(false);
      actions.setConnectionStatus(null);
      actions.setError(error.message);
      return false;
    }
  }, [actions]);

  /**
   * Play a Spotify playlist
   */
  const playSpotify = useCallback(async (playlistId, options = {}) => {
    if (!audioManagerRef.current) return false;

    try {
      // Check for interruption
      interruptionHandlerRef.current.handleUserAction('mode_switch', { mode: 'spotify' });

      actions.setLoading(true);
      actions.setAudioSource('spotify');

      const success = await audioManagerRef.current.play('spotify', {
        playlist: playlistId,
        shuffle: options.shuffle || state.playlistShuffle
      });

      actions.setLoading(false);
      return success;

    } catch (error) {
      console.error('❌ useAudio: Failed to play Spotify', error);
      actions.setLoading(false);
      actions.setError(error.message);
      return false;
    }
  }, [actions, state.playlistShuffle]);

  /**
   * Play a YouTube playlist or video
   */
  const playYouTube = useCallback(async (config) => {
    if (!audioManagerRef.current) return false;

    try {
      // Check for interruption
      interruptionHandlerRef.current.handleUserAction('mode_switch', { mode: 'youtube' });

      actions.setLoading(true);
      actions.setAudioSource('youtube');

      const success = await audioManagerRef.current.play('youtube', config);

      actions.setLoading(false);
      return success;

    } catch (error) {
      console.error('❌ useAudio: Failed to play YouTube', error);
      actions.setLoading(false);
      actions.setError(error.message);
      return false;
    }
  }, [actions]);

  /**
   * Pause current playback
   */
  const pause = useCallback(async () => {
    if (!audioManagerRef.current) return;

    try {
      // Check for interruption
      interruptionHandlerRef.current.handleUserAction('pause');

      await audioManagerRef.current.pause();
    } catch (error) {
      console.error('❌ useAudio: Failed to pause', error);
      actions.setError(error.message);
    }
  }, [actions]);

  /**
   * Resume playback
   */
  const resume = useCallback(async () => {
    if (!audioManagerRef.current) return;

    try {
      // Check for interruption
      interruptionHandlerRef.current.handleUserAction('play');

      await audioManagerRef.current.resume();
    } catch (error) {
      console.error('❌ useAudio: Failed to resume', error);
      actions.setError(error.message);
    }
  }, [actions]);

  /**
   * Stop all playback
   */
  const stop = useCallback(async () => {
    if (!audioManagerRef.current) return;

    try {
      await audioManagerRef.current.stopCurrent();
      actions.setStation(null);
      actions.setAudioSource(null);
    } catch (error) {
      console.error('❌ useAudio: Failed to stop', error);
    }
  }, [actions]);

  /**
   * Set volume (0.0 to 1.0)
   */
  const setVolume = useCallback((volume) => {
    if (!audioManagerRef.current) return;

    try {
      audioManagerRef.current.setVolume(volume);
      actions.setVolume(volume);
    } catch (error) {
      console.error('❌ useAudio: Failed to set volume', error);
    }
  }, [actions]);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(async () => {
    if (state.isPlaying) {
      await pause();
    } else {
      await resume();
    }
  }, [state.isPlaying, pause, resume]);

  /**
   * Next track (for playlists)
   */
  const nextTrack = useCallback(async () => {
    if (!audioManagerRef.current || !state.audioSource) return;

    try {
      const source = audioManagerRef.current.getSource(state.audioSource);
      if (source && source.nextTrack) {
        await source.nextTrack();
      }
    } catch (error) {
      console.error('❌ useAudio: Failed to skip track', error);
    }
  }, [state.audioSource]);

  /**
   * Previous track (for playlists)
   */
  const previousTrack = useCallback(async () => {
    if (!audioManagerRef.current || !state.audioSource) return;

    try {
      const source = audioManagerRef.current.getSource(state.audioSource);
      if (source && source.previousTrack) {
        await source.previousTrack();
      }
    } catch (error) {
      console.error('❌ useAudio: Failed to go back', error);
    }
  }, [state.audioSource]);

  /**
   * Set shuffle for playlists
   */
  const setShuffle = useCallback(async (enabled) => {
    if (!audioManagerRef.current || !state.audioSource) return;

    try {
      const source = audioManagerRef.current.getSource(state.audioSource);
      if (source && source.setShuffle) {
        source.setShuffle(enabled);
        actions.setPlaylistShuffle(enabled);
      }
    } catch (error) {
      console.error('❌ useAudio: Failed to set shuffle', error);
    }
  }, [state.audioSource, actions]);

  /**
   * Media Session API integration - lets the OS media controls (hardware/
   * Bluetooth media keys, Windows "now playing" widget, etc.) show what's
   * actually playing and control it correctly, whichever source is active.
   * Without this, the OS falls back to auto-detecting a plain <audio>
   * element, which only sees the radio stream - Spotify's Web Playback SDK
   * plays through a hidden cross-origin iframe the OS can't discover, so its
   * controls silently keep targeting the (paused) radio element instead.
   */
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const title = state.audioSource === 'spotify'
      ? (state.playlistInfo?.title || 'Spotify Playlist')
      : (state.currentStation?.name || 'No Ads Radio');
    const artwork = state.audioSource === 'spotify'
      ? state.playlistInfo?.thumbnail
      : state.currentStation?.logo;

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: state.audioSource === 'spotify' ? 'Spotify' : 'Radio',
      album: 'No Ads Radio',
      artwork: artwork ? [{ src: artwork, sizes: '512x512', type: 'image/png' }] : []
    });
  }, [state.audioSource, state.currentStation, state.playlistInfo]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = state.isPlaying
      ? 'playing'
      : (state.isPaused ? 'paused' : 'none');
  }, [state.isPlaying, state.isPaused]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    // Every handler routes through the same pause/resume/nextTrack/etc.
    // helpers the in-app buttons use, so OS controls always match the
    // currently active source (AudioManager.currentSource) instead of
    // assuming radio.
    navigator.mediaSession.setActionHandler('play', () => resume());
    navigator.mediaSession.setActionHandler('pause', () => pause());
    navigator.mediaSession.setActionHandler('stop', () => stop());
    navigator.mediaSession.setActionHandler('previoustrack',
      state.audioSource === 'spotify' ? () => previousTrack() : null);
    navigator.mediaSession.setActionHandler('nexttrack',
      state.audioSource === 'spotify' ? () => nextTrack() : null);

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('stop', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    };
  }, [pause, resume, stop, nextTrack, previousTrack, state.audioSource]);

  /**
   * Get audio element (for visualizer)
   */
  const getAudioElement = useCallback(() => {
    if (!audioManagerRef.current) return null;

    const source = audioManagerRef.current.getSource('radio');
    return source ? source.getAudioElement() : null;
  }, []);

  /**
   * Get interruption handler (for external use)
   */
  const getInterruptionHandler = useCallback(() => {
    return interruptionHandlerRef.current;
  }, []);

  return {
    // State
    currentStation: state.currentStation,
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    isLoading: state.isLoading,
    isTransitioning: state.isTransitioning,
    volume: state.volume,
    audioSource: state.audioSource,
    error: state.error,

    // Actions
    playRadio,
    playSpotify,
    playYouTube,
    pause,
    resume,
    stop,
    setVolume,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setShuffle,

    // Utilities
    getAudioElement,
    getInterruptionHandler,
    audioManager: audioManagerRef.current,

    // ✅ NEW: Spotify ready check
    isSpotifyReady: () => audioManagerRef.current?.isSpotifyReady() || false
  };
}

export default useAudio;
