// hooks/useAudioPlayer.js - Better error handling
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\hooks\useAudioPlayer.js

import { useState, useRef, useEffect, useCallback } from 'react';
import { loadYouTubeAPI, createYouTubePlayer, createHiddenYouTubePlayer } from '../utils/youtubeUtils';
import { StreamProxy } from '../utils/streamProxy.js';
import { stationReportingService } from '../utils/stationReporting.js';
import { AdSkipUtils } from '../utils/adSkipUtils.js';
// Add Spotify imports
import { 
  initializeSpotifyPlayer, 
  isSpotifyAuthenticated,
  playSpotifyPlaylist, 
  pauseSpotify, 
  resumeSpotify, 
  nextSpotifyTrack, 
  setSpotifyVolume,
  ensureWebPlaybackDeviceActive 
} from '../utils/spotifyUtils';

// --- SPOTIFY PLAYER FULL EVENT LOGGER ---
function attachSpotifyPlayerDebugLogging(playerInstance) {
  const logEvent = (event, data) => {
    console.log(`[Spotify SDK] Event: ${event}`, data);
  };
  playerInstance.addListener('ready', d => logEvent('ready', d));
  playerInstance.addListener('not_ready', d => logEvent('not_ready', d));
  playerInstance.addListener('initialization_error', d => logEvent('initialization_error', d));
  playerInstance.addListener('authentication_error', d => logEvent('authentication_error', d));
  playerInstance.addListener('account_error', d => logEvent('account_error', d));
  playerInstance.addListener('playback_error', d => logEvent('playback_error', d));
  playerInstance.addListener('player_state_changed', d => logEvent('player_state_changed', d));
}

// --- BEGIN: ROBUST SPOTIFY PLAYER INITIALIZATION ---
const _setupSpotifyPlayerInstance = useCallback((playerInstance, resolveParent, rejectParent) => {
  if (!playerInstance) {
    rejectParent(new Error("Player instance is null in _setupSpotifyPlayerInstance"));
    return;
  }
  spotifyPlayerRef.current = playerInstance;
  attachSpotifyPlayerDebugLogging(playerInstance);
  let readyFired = false;
  // Helper: fallback to Web API device activation if needed
  const activateDeviceIfReady = async (device_id) => {
    try {
      // Try to activate via Web API (transfer playback)
      const token = localStorage.getItem('spotify_access_token');
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_ids: [device_id], play: false })
      });
      console.log('[Spotify] Playback transferred to device via Web API:', device_id);
      setSpotifyPlayerReady(true);
      setIsLoading(false);
      setLoadingProgress('');
      setIsSpotifyInitializing(false);
      resolveParent(playerInstance);
    } catch (err) {
      setSpotifyPlayerReady(false);
      setIsSpotifyInitializing(false);
      setError('Spotify device kon niet geactiveerd worden: ' + err.message);
      if (window.addNotification) window.addNotification('Spotify device kon niet geactiveerd worden. Zie console.', 'error', 8000);
      rejectParent(new Error('Failed to activate Spotify Web Playback device: ' + err.message));
    }
  };
  const onReady = ({ device_id }) => {
    if (readyFired) return;
    readyFired = true;
    console.log('[Spotify] Player ready event received. Device ID:', device_id);
    setLoadingProgress('Spotify apparaat activeren...');
    activateDeviceIfReady(device_id);
  };
  const onNotReady = ({ device_id }) => {
    if (readyFired) return;
    readyFired = true;
    console.warn('[Spotify] Player not_ready event. Device ID:', device_id);
    setSpotifyPlayerReady(false);
    setIsSpotifyInitializing(false);
    setError('Spotify apparaat is niet klaar. Probeer opnieuw.');
    if (window.addNotification) window.addNotification('Spotify apparaat is niet klaar. Probeer opnieuw.', 'error', 8000);
    rejectParent(new Error(`Spotify device ID ${device_id} is not ready.`));
  };
  const onInitializationError = ({ message }) => {
    if (readyFired) return;
    readyFired = true;
    console.error('[Spotify] initialization_error event:', message);
    setError('Spotify initialisatie fout: ' + message);
    setIsLoading(false);
    setLoadingProgress('');
    setSpotifyPlayerReady(false);
    spotifyPlayerRef.current = null;
    setIsSpotifyInitializing(false);
    if (window.addNotification) window.addNotification('Spotify initialisatie fout: ' + message, 'error', 8000);
    rejectParent(new Error('Spotify initialisatie fout: ' + message));
  };
  playerInstance.addListener('ready', onReady);
  playerInstance.addListener('not_ready', onNotReady);
  playerInstance.addListener('initialization_error', onInitializationError);
  // --- RACE CONDITION PATCH: fallback if ready event missed ---
  if (playerInstance._options && playerInstance._options.id) {
    // Try to get state, fallback to manual activation
    if (typeof playerInstance.getCurrentState === 'function') {
      playerInstance.getCurrentState().then(state => {
        if (state && state.device_id) {
          console.log('[Spotify] getCurrentState() found device, manually activating:', state.device_id);
          onReady({ device_id: state.device_id });
        } else {
          // Fallback: try to activate anyway
          console.log('[Spotify] getCurrentState() null, but device ID present, trying manual activation:', playerInstance._options.id);
          onReady({ device_id: playerInstance._options.id });
        }
      }).catch(() => {
        // Fallback: try to activate anyway
        onReady({ device_id: playerInstance._options.id });
      });
    } else {
      onReady({ device_id: playerInstance._options.id });
    }
  }
  console.log('🎵 [Spotify] Player instance event listeners attached (robust production version).');
}, [setError, setIsLoading, setLoadingProgress, setSpotifyPlayerReady, setIsSpotifyInitializing]);

// Production-specific error handling for Spotify CloudPlaybackClientError 404
const handleSpotifyProductionErrors = (error) => {
  const isProduction = window.location.hostname.includes('github.io');
  
  if (isProduction && error.message.includes('CloudPlaybackClientError')) {
    console.error('🚨 PRODUCTION SPOTIFY ERROR DETECTED:');
    console.error('This appears to be a CloudPlaybackClientError 404 in production.');
    console.error('Common causes:');
    console.error('1. Redirect URI not configured in Spotify Developer Dashboard');
    console.error('2. Web Playback SDK device not properly activated');
    console.error('3. Production domain not whitelisted');
    console.error('');
    console.error('🔧 IMMEDIATE FIXES TO TRY:');
    console.error('1. Add this redirect URI to Spotify Dashboard:', window.location.origin + '/radio-zonder-reclame/callback.html');
    console.error('2. Visit: https://developer.spotify.com/dashboard');
    console.error('3. Find app with Client ID: 67703322b3fe4c27aa42f10e3d067b84');
    console.error('4. Add the production redirect URI exactly as shown above');
    
    // Provide user-friendly error message
    if (window.addNotification) {
      window.addNotification(
        '🔧 Spotify configuratie probleem in productie - zie console voor instructies', 
        'error', 
        10000
      );
    }
  }
  
  return error;
};

export const useAudioPlayer = (playlistProvider = 'youtube') => {
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [error, setError] = useState(null);
  const [currentSource, setCurrentSource] = useState(null);
  const [isIntentionalStop, setIsIntentionalStop] = useState(false);
  const [isRadioPausedForAdBreak, setIsRadioPausedForAdBreak] = useState(false);
  const [pausedRadioStation, setPausedRadioStation] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState(null);
  const [currentConnectionAttempt, setCurrentConnectionAttempt] = useState(null);
  const [currentPlaylistProvider, setCurrentPlaylistProvider] = useState('youtube');
  const [spotifyPlayerReady, setSpotifyPlayerReady] = useState(false);
  const [isSpotifyInitializing, setIsSpotifyInitializing] = useState(false);
  const spotifyPlayerInitTimeoutRef = useRef(null); // Ref for the timeout
  const spotifyInitPromiseRef = useRef(null); // Store current initialization promise

  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const spotifyPlayerRef = useRef(null);
  const timeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  // Refs to hold the latest state for use in event handlers of the initialization useEffect
  const currentStationRef = useRef(currentStation);
  const isIntentionalStopRef = useRef(isIntentionalStop);
  const isTransitioningRef = useRef(isTransitioning);
  const isPlayingRef = useRef(isPlaying); // To check current playing status in stalled event
  // Sync playlist provider parameter with internal state
  useEffect(() => {
    setCurrentPlaylistProvider(playlistProvider);
    // Also sync with global window state for consistency
    window.playlistProvider = playlistProvider;
  }, [playlistProvider]);

  useEffect(() => {
    currentStationRef.current = currentStation;
  }, [currentStation]);
  useEffect(() => {
    isIntentionalStopRef.current = isIntentionalStop;
  }, [isIntentionalStop]);
  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Initialize audio element - runs ONCE on mount
  useEffect(() => {
    console.log('🎧 Initializing Audio element...');
    audioRef.current = new Audio();
    audioRef.current.volume = volume; // Set initial volume from the current state
    audioRef.current.crossOrigin = 'anonymous';
    
    const audio = audioRef.current;
    
    const handleLoadStart = () => {
      // Use refs to access latest state
      if (!isIntentionalStopRef.current) {
        console.log('🎧 Audio: loadstart');
        setIsLoading(true);
      }
    };
    
    const handleCanPlay = () => {
      console.log('🎧 Audio: canplay');
      setIsLoading(false);
      setError(null); // Clear error if we reach canplay
    };
    
    const handleError = (event) => {
      const mediaError = event.target.error;
      console.error('🎧 Audio element error:', mediaError ? `Code: ${mediaError.code}, Message: ${mediaError.message}` : 'Unknown error', event);
      
      // Don't show errors if we're intentionally stopping, transitioning, or if src is empty
      if (!isIntentionalStopRef.current && !isTransitioningRef.current && audioRef.current?.src) {
        if (currentStationRef.current) {
          setError(`Verbinding met ${currentStationRef.current.name} verloren. Probeer een andere zender.`);
        }
        setIsPlaying(false);
        setIsLoading(false);
      } else {
        console.log('🎧 Audio error ignored due to intentionalStop, transitioning, or empty src.');
      }
    };
    
    const handleEnded = () => {
      console.log('🎧 Audio: ended');
      setIsPlaying(false);
    };

    const handleStalled = () => {
      console.warn('🎧 Audio: stalled. Stream may have issues or network interruption.');
      // Consider setting loading true if playing, not intentional stop, and not transitioning
      if (isPlayingRef.current && !isIntentionalStopRef.current && !isTransitioningRef.current) {
        // setIsLoading(true); // This might be too aggressive, could also show a subtle warning
      }
    };

    const handleWaiting = () => {
      console.log('🎧 Audio: waiting for data (buffering)...');
      if (!isIntentionalStopRef.current) {
        setIsLoading(true);
      }
    };

    const handlePlayingEvent = () => { // Renamed to avoid conflict with isPlaying state
      console.log('🎧 Audio: native "playing" event fired.');
      setIsLoading(false); // Ensure loading is false when playing event fires
      setIsPlaying(true); // ← FIX: Set playing to true when audio starts playing
      // If our state isn't isPlaying, but browser says it is, sync it.
      if (!isPlayingRef.current) {
        // setIsPlaying(true); // This could cause issues if play() promise hasn't resolved.
                               // Generally, setIsPlaying(true) in playRadio is the source of truth.
      }
    };

    const handleSuspend = () => {
      console.log('🎧 Audio: suspend event (media data loading has been suspended).');
    };
    
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlayingEvent);
    audio.addEventListener('suspend', handleSuspend);
    
    // Cleanup function: runs on component unmount
    return () => {
      console.log('🎧 Cleaning up Audio element...');
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlayingEvent);
      audio.removeEventListener('suspend', handleSuspend);
      audio.pause(); 
      audio.src = ''; // Release resources
    };
  }, []); // Empty dependency array ensures this runs only once on mount and cleans up on unmount

  // ✅ FIX: Add comprehensive cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🎧 Cleaning up useAudioPlayer hook...');
      
      // Stop all audio sources
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      // Stop and disconnect YouTube player
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.pauseVideo();
          youtubePlayerRef.current.stopVideo();
          youtubePlayerRef.current.destroy();
        } catch (error) {
          console.warn('Error cleaning up YouTube player:', error);
        }
      }
      
      // Stop and disconnect Spotify player
      if (spotifyPlayerRef.current) {
        try {
          console.log('🎵 Disconnecting Spotify player on unmount...');
          spotifyPlayerRef.current.disconnect();
          spotifyPlayerRef.current = null; // Clear the ref
          setSpotifyPlayerReady(false); // Reset ready state
        } catch (error) {
          console.warn('Error cleaning up Spotify player on unmount:', error);
        }
      }
      
      // Clear all timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      
      console.log('🎧 useAudioPlayer cleanup complete');
    };
  }, []); // Run only on unmount  // --- START: SPOTIFY PLAYER INITIALIZATION LOGIC ---
  // Place this entire block after your audio element and general cleanup useEffects,
  // and BEFORE functions like playRadio, playPlaylist, etc.

  // --- BEGIN: MINIMAL SPOTIFY PLAYER INITIALIZATION ---
  // Store device ID for use in Web API calls
  const spotifyDeviceIdRef = useRef(null);

  // Helper: Transfer playback and start playback using Web API
  const transferAndStartPlayback = useCallback(async (device_id) => {
    try {
      console.log('🎵 [Spotify] Transferring playback to device via Web API:', device_id);
      const token = localStorage.getItem('spotify_access_token');
      // Transfer playback
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_ids: [device_id], play: false })
      });
      console.log('🎵 [Spotify] Playback transferred to device.');
      // Optionally, start playback (if you want to auto-play)
      // await fetch('https://api.spotify.com/v1/me/player/play?device_id=' + device_id, {
      //   method: 'PUT',
      //   headers: { 'Authorization': `Bearer ${token}` },
      // });
      // console.log('🎵 [Spotify] Playback started on device.');
    } catch (err) {
      console.error('❌ [Spotify] Failed to transfer/start playback:', err);
    }
  }, []);

  // Helper to setup listeners on a Spotify player instance
  const _setupSpotifyPlayerInstance = useCallback((playerInstance, resolveParent, rejectParent) => {
    if (!playerInstance) {
      rejectParent(new Error("Player instance is null in _setupSpotifyPlayerInstance"));
      return;
    }
    spotifyPlayerRef.current = playerInstance;
    attachSpotifyPlayerDebugLogging(playerInstance);
    let readyFired = false;
    // Helper: fallback to Web API device activation if needed
    const activateDeviceIfReady = async (device_id) => {
      try {
        // Try to activate via Web API (transfer playback)
        const token = localStorage.getItem('spotify_access_token');
        await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ device_ids: [device_id], play: false })
        });
        console.log('[Spotify] Playback transferred to device via Web API:', device_id);
        setSpotifyPlayerReady(true);
        setIsLoading(false);
        setLoadingProgress('');
        setIsSpotifyInitializing(false);
        resolveParent(playerInstance);
      } catch (err) {
        setSpotifyPlayerReady(false);
        setIsSpotifyInitializing(false);
        setError('Spotify device kon niet geactiveerd worden: ' + err.message);
        if (window.addNotification) window.addNotification('Spotify device kon niet geactiveerd worden. Zie console.', 'error', 8000);
        rejectParent(new Error('Failed to activate Spotify Web Playback device: ' + err.message));
      }
    };
    const onReady = ({ device_id }) => {
      if (readyFired) return;
      readyFired = true;
      console.log('[Spotify] Player ready event received. Device ID:', device_id);
      setLoadingProgress('Spotify apparaat activeren...');
      activateDeviceIfReady(device_id);
    };
    const onNotReady = ({ device_id }) => {
      if (readyFired) return;
      readyFired = true;
      console.warn('[Spotify] Player not_ready event. Device ID:', device_id);
      setSpotifyPlayerReady(false);
      setIsSpotifyInitializing(false);
      setError('Spotify apparaat is niet klaar. Probeer opnieuw.');
      if (window.addNotification) window.addNotification('Spotify apparaat is niet klaar. Probeer opnieuw.', 'error', 8000);
      rejectParent(new Error(`Spotify device ID ${device_id} is not ready.`));
    };
    const onInitializationError = ({ message }) => {
      if (readyFired) return;
      readyFired = true;
      console.error('[Spotify] initialization_error event:', message);
      setError('Spotify initialisatie fout: ' + message);
      setIsLoading(false);
      setLoadingProgress('');
      setSpotifyPlayerReady(false);
      spotifyPlayerRef.current = null;
      setIsSpotifyInitializing(false);
      if (window.addNotification) window.addNotification('Spotify initialisatie fout: ' + message, 'error', 8000);
      rejectParent(new Error('Spotify initialisatie fout: ' + message));
    };
    playerInstance.addListener('ready', onReady);
    playerInstance.addListener('not_ready', onNotReady);
    playerInstance.addListener('initialization_error', onInitializationError);
    // --- RACE CONDITION PATCH: fallback if ready event missed ---
    if (playerInstance._options && playerInstance._options.id) {
      // Try to get state, fallback to manual activation
      if (typeof playerInstance.getCurrentState === 'function') {
        playerInstance.getCurrentState().then(state => {
          if (state && state.device_id) {
            console.log('[Spotify] getCurrentState() found device, manually activating:', state.device_id);
            onReady({ device_id: state.device_id });
          } else {
            // Fallback: try to activate anyway
            console.log('[Spotify] getCurrentState() null, but device ID present, trying manual activation:', playerInstance._options.id);
            onReady({ device_id: playerInstance._options.id });
          }
        }).catch(() => {
          // Fallback: try to activate anyway
          onReady({ device_id: playerInstance._options.id });
        });
      } else {
        onReady({ device_id: playerInstance._options.id });
      }
    }
    console.log('🎵 [Spotify] Player instance event listeners attached (robust production version).');
  }, [setError, setIsLoading, setLoadingProgress, setSpotifyPlayerReady, setIsSpotifyInitializing]);

  // Core Spotify Initialization Logic
  // MODIFIED: Returns a new Promise, includes timeout
  const performSpotifyInitialization = useCallback(async () => {
    if (!isSpotifyAuthenticated()) {
      console.log('🎵 Skipping Spotify initialization: not authenticated.');
      throw new Error('Not authenticated with Spotify');
    }

    // If already initializing, return the same promise
    if (isSpotifyInitializing) {
      if (spotifyInitPromiseRef.current) {
        console.log('🎵 performSpotifyInitialization: Already initializing, returning existing promise.');
        return spotifyInitPromiseRef.current;
      } else {
        throw new Error('Spotify initialization already in progress (performSpotifyInitialization).');
      }
    }

    if (spotifyPlayerRef.current && spotifyPlayerReady) {
      console.log('🎵 Spotify player already initialized and ready.');
      return spotifyPlayerRef.current;
    }

    if (spotifyPlayerRef.current && !spotifyPlayerReady) {
      console.warn('🎵 Existing Spotify player found but not ready. Attempting to disconnect and re-initialize.');
      try {
        spotifyPlayerRef.current.disconnect();
        console.log('🎵 Successfully disconnected stale Spotify player.');
      } catch (e) {
        console.warn('🎵 Error disconnecting stale Spotify player, proceeding with re-initialization:', e);
      }
      spotifyPlayerRef.current = null;
      setSpotifyPlayerReady(false);
    }

    console.log('🎵 Starting Spotify player initialization process (performSpotifyInitialization)...');
    setIsSpotifyInitializing(true); // Set flag early
    setIsLoading(true);
    setLoadingProgress('Spotify speler initialiseren...');
    setError(null);

    // Store the promise in the ref
    spotifyInitPromiseRef.current = new Promise(async (resolve, reject) => {
      // Clear any existing timeout
      if (spotifyPlayerInitTimeoutRef.current) {
        clearTimeout(spotifyPlayerInitTimeoutRef.current);
      }

      spotifyPlayerInitTimeoutRef.current = setTimeout(() => {
        console.warn('🎵 Spotify initialization timeout (20s) in performSpotifyInitialization. Player did not become ready.');
        if (isSpotifyInitializing) {
            setIsSpotifyInitializing(false);
            setIsLoading(false);
            setLoadingProgress('');
            setSpotifyPlayerReady(false);
            setError('Spotify initialisatie timeout.');
        }
        spotifyInitPromiseRef.current = null; // Clear on error
        reject(new Error('Spotify player initialization timed out.'));
      }, 20000);

      try {
        const player = await initializeSpotifyPlayer();
        _setupSpotifyPlayerInstance(player, (result) => {
          spotifyInitPromiseRef.current = null; // Clear on success
          resolve(result);
        }, (err) => {
          spotifyInitPromiseRef.current = null; // Clear on error
          reject(err);
        });
      } catch (error) {
        console.error('🎵 Failed to get player instance from spotifyUtils or other pre-setup error:', error);
        clearTimeout(spotifyPlayerInitTimeoutRef.current);
        handleSpotifyProductionErrors(error);
        setError(`Kon Spotify player niet initialiseren: ${error.message}`);
        setIsLoading(false);
        setLoadingProgress('');
        setSpotifyPlayerReady(false);
        if (spotifyPlayerRef.current) {
          try { spotifyPlayerRef.current.disconnect(); } catch (e) {/*ignore*/}
          spotifyPlayerRef.current = null;
        }
        setIsSpotifyInitializing(false);
        spotifyInitPromiseRef.current = null; // Clear on error
        reject(error);
      }
    });
    return spotifyInitPromiseRef.current;
  }, [
    isSpotifyInitializing,
    spotifyPlayerReady,
    _setupSpotifyPlayerInstance,
    setError,
    setIsLoading,
    setLoadingProgress,
    setSpotifyPlayerReady,
  ]);

  // Effect for initial, automatic Spotify player initialization attempt on mount
  // This REPLACES your existing Spotify initialization useEffect (around lines 239-349)
  useEffect(() => {
    const autoInitialize = async () => {
      if (isSpotifyAuthenticated() && !spotifyPlayerRef.current && !isSpotifyInitializing && !spotifyPlayerReady) {
        console.log("🎵 Attempting automatic Spotify player setup on mount...");
        try {
          await performSpotifyInitialization();
        } catch (err) {
          console.warn("🎵 Automatic Spotify player setup on mount failed:", err.message);
        }
      }
    };
    autoInitialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpotifyAuthenticated, performSpotifyInitialization]); // Added performSpotifyInitialization

  // Manual Spotify player initialization (e.g., after login)
  // This REPLACES your existing manualInitializeSpotifyPlayer (around lines 364-391)
  const manualInitializeSpotifyPlayer = useCallback(async () => {
    console.log('🎵 manualInitializeSpotifyPlayer called.');
    if (!isSpotifyAuthenticated()) {
      setError('Not authenticated with Spotify. Please log in.');
      if (window.addNotification) window.addNotification('🔒 Log eerst in bij Spotify', 'warning', 3000);
      throw new Error('Not authenticated with Spotify');
    }

    if (spotifyPlayerRef.current && spotifyPlayerReady) {
      console.log('🎵 Spotify player is already initialized and ready (manual call).');
      return spotifyPlayerRef.current;
    }
    // If already initializing, return the same promise
    if (isSpotifyInitializing) {
      if (spotifyInitPromiseRef.current) {
        console.log('🎵 manualInitializeSpotifyPlayer: Already initializing, returning existing promise.');
        return spotifyInitPromiseRef.current;
      } else {
        throw new Error('Spotify player initialization is already in progress.');
      }
    }

    try {
      return await performSpotifyInitialization();
    } catch (error) {
      console.error('🎵 Manual Spotify player initialization failed:', error.message);
      if (window.addNotification && !error.message.includes('already in progress') && !error.message.includes('timed out')) {
         window.addNotification(`❌ Spotify Player Fout: ${error.message}`, 'error', 5000);
      }
      throw error; 
    }
  }, [isSpotifyAuthenticated, spotifyPlayerReady, isSpotifyInitializing, performSpotifyInitialization, setError]);


  // --- END: SPOTIFY PLAYER INITIALIZATION LOGIC ---

  // NUCLEAR RESET - Completely stop everything and reset all states
  const abortConnection = useCallback(() => {
    console.log('🛑 NUCLEAR RESET - Stopping everything');
    
    // Cancel any ongoing connection attempts
    if (currentConnectionAttempt) {
      console.log('🚫 Canceling ongoing connection attempt');
      currentConnectionAttempt.cancel = true;
      setCurrentConnectionAttempt(null);
    }
    
    // Clear ALL timeouts first
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
    // Force stop audio completely
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load(); // Reset the audio element
    }
      // Force stop YouTube
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.pauseVideo();
        youtubePlayerRef.current.stopVideo();
      } catch (error) {
        console.warn('Could not stop YouTube player:', error);
      }
    }
    
    // Force stop Spotify
    if (spotifyPlayerRef.current) {
      try {
        pauseSpotify();
      } catch (error) {
        console.warn('Could not stop Spotify player:', error);
      }
    }
    
    // Reset ALL states to initial values
    setIsLoading(false);
    setLoadingProgress('');
    setIsTransitioning(false);
    setIsIntentionalStop(false);
    setConnectionTimeout(null);
    setError(null);
    setIsPlaying(false);
    setCurrentStation(null);
    setCurrentSource(null);
    setIsRadioPausedForAdBreak(false);
    setPausedRadioStation(null);
    
    // Clear global states
    window.isAdBreakActive = false;
    
    console.log('🛑 Nuclear reset complete - everything stopped');
  }, [currentConnectionAttempt]);

  // Define playRadio - FIXED volume handling
  const playRadio = useCallback(async (stationData) => {
    console.log('🎵 Playing radio:', stationData.name);
    
    // Cancel any previous connection attempts
    if (currentConnectionAttempt) {
      console.log('🚫 Canceling previous connection attempt for:', currentConnectionAttempt.stationName);
      currentConnectionAttempt.cancel = true;
    }
    
    // Create new connection attempt tracker
    const connectionAttempt = {
      stationName: stationData.name,
      cancel: false,
      startTime: Date.now()
    };
    setCurrentConnectionAttempt(connectionAttempt);
    
    // Apply station overrides before processing - MOVE THIS UP
    const effectiveStationData = stationReportingService.getEffectiveStationData(stationData);
    console.log('🔧 Using station data:', effectiveStationData._hasOverride ? 'with override' : 'original', effectiveStationData);
    try {
      if (window.isAdBreakActive && window.queueStationSwitch) {
        console.log('🎵 Ad break is active - ANY interaction should start playlist aggressively');
        console.log('🎵 Current state:', { 
          isPlaying, 
          currentStation: currentStation?.name, 
          currentSource, 
          isRadioPausedForAdBreak,
          playlistUrl: window.playlistUrl 
        });
        
        // ALWAYS queue the station selection
        window.queueStationSwitch(effectiveStationData);
          // AGGRESSIVE PLAYLIST STARTING: If ad break badge is showing, ALWAYS start playlist
        // regardless of previous radio state or shouldPlayPlaylistDuringAdBreak flag
        const playlistUrl = window.playlistUrl;
        if (playlistUrl) {
          try {
            const playlistId = extractPlaylistId(playlistUrl, playlistProvider);
            if (playlistId) {
              console.log('🎵 AGGRESSIVE: Starting playlist during active ad break - ID:', playlistId);
                await playPlaylist(playlistId, {
                shuffle: window.playlistShuffle || false,
                repeat: 'all',
                provider: playlistProvider
              });
              
              console.log('🎵 AGGRESSIVE: Playlist started successfully during ad break');
              
              if (window.addNotification) {
                window.addNotification(`🎵 Playlist gestart - ${effectiveStationData.name} in wachtrij`, 'info', 3000);
              }
            } else {
              console.error('🎵 Could not extract playlist ID from URL:', playlistUrl);
              if (window.addNotification) {
                window.addNotification(`❌ Ongeldig playlist URL formaat`, 'error', 3000);
              }
            }
          } catch (error) {
            console.error('🎵 Failed to start playlist during ad break:', error);
            if (window.addNotification) {
              window.addNotification(`❌ Kon playlist niet starten: ${error.message}`, 'error', 3000);
            }
          }
        } else {
          // No playlist URL configured
          console.warn('🎵 No playlist URL configured during ad break');
          if (window.addNotification) {
            window.addNotification(`📻 ${effectiveStationData.name} in wachtrij - geen playlist geconfigureerd`, 'warning', 3000);
          }
        }
        return;
      }
      
      if (isTransitioning) {
        console.log('🎵 Currently transitioning, ignoring radio play request');
        return;
      }
      
      setIsIntentionalStop(false); // ← FIX: Change from setIntentionalStop to setIsIntentionalStop
      setCurrentStation(effectiveStationData);
      setIsLoading(true);
      setLoadingProgress('Verbinden...');
      
      // Set connection timeout (30 seconds)
      const timeoutId = setTimeout(() => {
        if (connectionAttempt && !connectionAttempt.cancel) {
          console.log('⏰ Connection timeout reached for:', effectiveStationData.name);
          connectionAttempt.cancel = true;
          setLoadingProgress('Verbinding mislukt - timeout');
          setIsLoading(false);
          setCurrentStation(null);
          setCurrentConnectionAttempt(null);
        }
      }, 30000);
      
      connectionTimeoutRef.current = timeoutId;
      
      // Check if canceled before proceeding
      if (connectionAttempt.cancel) {
        console.log('🚫 Connection attempt canceled before stream search');
        clearTimeout(timeoutId);
        return;
      }
        const workingUrl = await StreamProxy.findWorkingStream(
        effectiveStationData.url,
        (progress) => {
          // Check if canceled during progress updates
          if (connectionAttempt.cancel) {
            console.log('🚫 Connection attempt canceled during stream search');
            throw new Error('Connection canceled by user');
          }
          console.log('🔍', effectiveStationData.name + ':', progress);
          setLoadingProgress(progress);
        },
        effectiveStationData.name,
        connectionAttempt, // Pass the cancellation token
        true // Enable ad-free prioritization
      );
      
      // Clear timeout since we found a working URL
      clearTimeout(timeoutId);
      connectionTimeoutRef.current = null;
      
      // Final check before setting audio source
      if (connectionAttempt.cancel) {
        console.log('🚫 Connection attempt canceled before setting audio source');
        return;
      }
        console.log('🎵 Setting audio source to:', workingUrl);
      audioRef.current.src = workingUrl;
      audioRef.current.volume = volume; // Set volume before playing
      
      // Play the audio
      await audioRef.current.play();
      setIsPlaying(true);
      
      setIsLoading(false);
      setLoadingProgress('');
      setCurrentConnectionAttempt(null);
      setCurrentSource('radio');
      
      // Check if we should offer pre-roll skip button
      if (AdSkipUtils.shouldOfferPrerollSkip(workingUrl, effectiveStationData.name)) {
        console.log('🚫 Offering pre-roll skip for:', effectiveStationData.name);
        AdSkipUtils.createPrerollSkipButton(audioRef.current, () => {
          console.log('⏭️ Pre-roll skipped for:', effectiveStationData.name);
          if (window.addNotification) {
            window.addNotification('⏭️ Pre-roll reclame overgeslagen', 'success', 2000);
          }
        });
      }
      
    } catch (error) {
      // Clear timeout on error
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      if (connectionAttempt.cancel) {
        console.log('🚫 Connection attempt was canceled');
        return;
      }
      
      console.log(`❌ Failed to play ${effectiveStationData.name}:`, error);
      
      // DON'T clear currentStation immediately - keep it for error reporting
      setIsLoading(false);
      setLoadingProgress('Verbinding mislukt');
      setCurrentConnectionAttempt(null);
      setError(`Kan ${effectiveStationData.name} niet afspelen: ${error.message}`);
      
      // Keep the station data so the report button can access it
      // Only clear it after a delay to allow user to report the issue
      setTimeout(() => {
        setCurrentStation(null);
      }, 10000); // Clear after 10 seconds
      
      // ❌ REMOVE AUTOMATIC REPORTING - Only report when user clicks the button
      // stationReportingService.reportFailedStation(effectiveStationData, {
      //   primaryError: error.message,
      //   timestamp: new Date().toISOString(),
      //   source: 'playRadio',
      //   connectionType: navigator.connection?.effectiveType || 'unknown',
      //   userAgent: navigator.userAgent
      // });
    }
  }, [currentConnectionAttempt, volume, isTransitioning]);

  // Corrected dependencies for playRadio
  // const playRadio = useCallback(async (stationData) => { ... }, 
  //   [setCurrentStation, setCurrentSource, setError, setIsLoading, setIsPlaying, setIsRadioPausedForAdBreak, setPausedRadioStation, setIsTransitioning, setIsIntentionalStop]
  // );
  // For simplicity, if no external props are used, and only internal state setters, an empty array or specific setters are fine.
  // Given its complexity and use of many state setters, it's okay as is, or list the setters.
  // The `isTransitioningRef.current` check at the start helps avoid issues with stale closures if playRadio itself is memoized.

  // Resume radio from ad break - FIXED volume
  const resumeRadioFromAdBreak = useCallback(() => {
    if (isTransitioning) {
      console.log('🎵 Already transitioning, skipping resume');
      return;
    }
    
    console.log('🎵 Resuming radio from ad break');
    setIsTransitioning(true);
    
    if (audioRef.current && isRadioPausedForAdBreak && pausedRadioStation) {
      console.log('🎵 Resuming paused radio:', pausedRadioStation.name);
      
      const resumePlayback = async () => {
        try {
          // Set current station back
          setCurrentStation(pausedRadioStation);
          setCurrentSource('radio');
          
          await audioRef.current.play();
          setIsPlaying(true);
          
          // Set volume AFTER play starts
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.volume = volume;
              console.log('🎵 Radio resumed with volume:', audioRef.current.volume);
            }
          }, 100);
          
        } catch (error) {
          console.log('🎵 Could not resume radio, stream may have expired. Restarting...');
          // Stream expired, restart it
          playRadio(pausedRadioStation);
        }
      };
      
      resumePlayback().finally(() => {
        setIsRadioPausedForAdBreak(false);
        setPausedRadioStation(null);
        setIsTransitioning(false);
      });
    } else {
      console.warn('🎵 No paused radio station to resume');
      setIsTransitioning(false);
    }
  }, [isRadioPausedForAdBreak, pausedRadioStation, volume, isTransitioning, playRadio]);
  // Update volume when it changes - ALSO apply to currently playing audio
  useEffect(() => {
  //  console.log('🔊 Updating volume to:', volume);
    
    // Update radio volume immediately if playing
    if (audioRef.current && currentSource === 'radio' && isPlaying) {
      audioRef.current.volume = volume;
      //console.log('🔊 Applied volume to playing radio:', audioRef.current.volume);
    }
    
    // Update YouTube volume
    if (youtubePlayerRef.current && youtubePlayerRef.current.setVolume) {
      const youtubeVolume = Math.round(volume * 100);
      try {
        youtubePlayerRef.current.setVolume(youtubeVolume);
        //console.log('🔊 Set YouTube volume to:', youtubeVolume);
      } catch (error) {
        console.warn('Could not set YouTube volume:', error);
      }
    }
    
    // Update Spotify volume
    if (currentPlaylistProvider === 'spotify' && spotifyPlayerRef.current && currentSource === 'playlist') {
      const spotifyVolume = Math.round(volume * 100);
      try {
        setSpotifyVolume(spotifyVolume);
      //  console.log('🔊 Set Spotify volume to:', spotifyVolume);
      } catch (error) {
        console.warn('Could not set Spotify volume:', error);
      }
    }
  }, [volume, currentSource, isPlaying, currentPlaylistProvider]);
  // FORCE STOP ALL AUDIO - Nuclear option
  const forceStopAllAudio = useCallback(() => {
    console.log('🛑 FORCE STOPPING ALL AUDIO');
    setIsIntentionalStop(true);
    
    // Stop radio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    // Stop YouTube
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.pauseVideo();
      } catch (error) {
        console.warn('Could not stop YouTube player:', error);
      }
    }
    
    // Stop Spotify
    if (spotifyPlayerRef.current) {
      try {
        pauseSpotify();
      } catch (error) {
        console.warn('Could not stop Spotify player:', error);
      }
    }
    
    setIsPlaying(false);
    
    setTimeout(() => setIsIntentionalStop(false), 1000);
  }, []);

  // Clean pause radio for ad break - SIMPLIFIED
  const pauseRadioForAdBreak = useCallback(() => {
    if (isTransitioning) {
      console.log('🎵 Already transitioning, skipping pause');
      return;
    }
    
    console.log('🎵 Cleanly pausing radio for ad break');
    setIsTransitioning(true);
    
    if (audioRef.current && currentSource === 'radio' && currentStation) {
      setIsRadioPausedForAdBreak(true);
      setPausedRadioStation(currentStation); // Remember what we're pausing
      setIsIntentionalStop(true);
      
      // DON'T FADE - Just pause directly to avoid volume issues
      audioRef.current.pause();
      console.log('🎵 Radio paused for ad break, station remembered:', currentStation.name);
      
      setTimeout(() => {
        setIsIntentionalStop(false);
        setIsTransitioning(false);
      }, 300);
    } else {
      setIsTransitioning(false);
    }
  }, [currentSource, currentStation, isTransitioning]);  const playPlaylist = useCallback(async (playlistId, options = {}) => {
    if (!playlistId) {
      console.error('🎵 playPlaylist called without playlistId');
      return;
    }
    
    if (isTransitioning) {
      console.log('🎵 Currently transitioning, ignoring playlist play request');
      return;
    }

    // Determine provider from options or use current setting
    const provider = options.provider || currentPlaylistProvider;
    
    console.log('🎵 Starting playlist - FORCING source switch');
    console.log('🎵 Playlist ID:', playlistId);
    console.log('🎵 Provider:', provider);
    console.log('🎵 Options:', options);
    
    setIsTransitioning(true);
    setIsLoading(true);
    setError(null);
    
    // FORCE source change immediately to prevent UI confusion
    setCurrentSource('playlist');
    setIsPlaying(false);
    
    try {
      // First pause radio cleanly if it's playing
      if (audioRef.current && !audioRef.current.paused) {
        pauseRadioForAdBreak();
        await new Promise(resolve => setTimeout(resolve, 400));
      }      if (provider === 'spotify') {
        console.log('🎵 Starting Spotify playlist');
        
        // Enhanced Spotify ready check
        if (!isSpotifyAuthenticated()) {
          throw new Error('Please login to Spotify first to play playlists.');
        }        // ✅ FIX: Wait for Spotify player to be ready if it's still initializing
        if (!spotifyPlayerReady || !spotifyPlayerRef.current) {
          console.log('🎵 Spotify player not ready, waiting for initialization...');
          setLoadingProgress('Spotify player gereed maken...');
          
          // Wait up to 15 seconds for player to be ready
          let retries = 0;
          const maxRetries = 75; // 75 * 200ms = 15 seconds
          
          while ((!spotifyPlayerReady || !spotifyPlayerRef.current) && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 200));
            retries++;
            
            if (retries % 10 === 0) { // Update progress every 2 seconds
              setLoadingProgress(`Spotify player gereed maken... (${Math.round(retries/5)}s)`);
              console.log(`🎵 Waiting for Spotify player... (${retries}/${maxRetries})`);
            }
          }
          
          if (!spotifyPlayerReady || !spotifyPlayerRef.current) {
            throw new Error('Spotify player is nog niet klaar. Probeer over een paar seconden opnieuw of herlaad de pagina.');
          }
          
          console.log('🎵 Spotify player is now ready!');
        }

        // ✅ NEW: Ensure Web Playback device is active before starting playlist
        setLoadingProgress('Browser apparaat activeren...');
        const deviceActive = await ensureWebPlaybackDeviceActive();
        
        if (!deviceActive) {
          console.warn('🎵 Could not activate Web Playback device, trying anyway...');
        }

        setLoadingProgress('Spotify playlist starten...');
        await playSpotifyPlaylist(playlistId, options.shuffle || false);
        
        // Set volume for Spotify
        await setSpotifyVolume(volume * 100);
        
        setCurrentPlaylistProvider('spotify');
        setIsPlaying(true); // ✅ FIX: Set playing state after successful Spotify start
        setIsLoading(false); // ✅ FIX: Clear loading state
        console.log('🎵 Spotify playlist started successfully on Web Playback device');
        }else {
          // YouTube implementation with enhanced hidden player
          await loadYouTubeAPI();
          console.log('🎵 YouTube API loaded successfully');
          
          if (!youtubePlayerRef.current) {
            console.log('🎵 Creating new enhanced hidden YouTube player for background audio with embedding bypass');
            
            // Use the enhanced hidden player function with improved bypass strategies
            youtubePlayerRef.current = await createHiddenYouTubePlayer('youtube-hidden-player', playlistId, {
            playerVars: {
              autoplay: 1,
              loop: options.repeat === 'all' || options.repeat === 'one' ? 1 : 0,
              shuffle: options.shuffle ? 1 : 0
            },
            onReady: (event) => {
              const targetVolume = Math.round(volume * 100);
              event.target.setVolume(targetVolume);
              console.log('🔊 Set hidden YouTube volume on ready:', targetVolume);
              setIsLoading(false);
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                const targetVolume = Math.round(volume * 100);
                event.target.setVolume(targetVolume);
                setIsPlaying(true);
                setIsLoading(false);
                console.log('🎵 Hidden YouTube playlist now playing at volume:', targetVolume);
              } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
              }
            },            onEmbeddingError: (errorCode) => {
              console.warn(`YouTube embedding restricted (${errorCode}) - implementing enhanced fallback strategies`);
              
              // Enhanced fallback for error 150 (embedding restrictions)
              if (errorCode === 150 || errorCode === 101) {
                console.log('Attempting enhanced stealth mode for embedding restriction bypass');
                
                // Strategy 1: Try to continue playing despite the error
                setTimeout(() => {
                  try {
                    if (youtubePlayerRef.current) {
                      youtubePlayerRef.current.playVideo();
                      console.log('Force-started playback after embedding error');
                    }
                  } catch (retryErr) {
                    console.warn('Could not force-start after embedding error:', retryErr);
                  }
                }, 2000);
                
                // Strategy 2: Multiple retry attempts with delays
                const retryDelays = [5000, 10000, 15000];
                retryDelays.forEach((delay, index) => {
                  setTimeout(() => {
                    try {
                      if (youtubePlayerRef.current && youtubePlayerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
                        youtubePlayerRef.current.playVideo();
                        console.log(`Retry attempt ${index + 1} for embedding bypass`);
                      }
                    } catch (retryErr) {
                      console.warn(`Retry ${index + 1} failed:`, retryErr);
                    }
                  }, delay);
                });
                  // Show user-friendly message but don't stop trying
                if (window.addNotification) {
                  window.addNotification('🎵 Playlist wordt gestart met verbeterde bypass-modus...', 'info', 5000);
                }
              }
            },
            onError: (event) => {
              console.error('Hidden YouTube player error:', event);
              // Only show error for truly fatal errors
              if (event.data > 150) {
                setError('Kon YouTube playlist niet laden - probeer een andere playlist');
                setIsLoading(false);
                setIsTransitioning(false);
              }
            }          });
        } else {
          // Use existing player but with enhanced error handling for embedding restrictions
          youtubePlayerRef.current.setVolume(0);
          youtubePlayerRef.current.loadPlaylist({
            listType: 'playlist',
            list: playlistId,
            shuffle: options.shuffle ? 1 : 0
          });
          
          setTimeout(() => {
            if (youtubePlayerRef.current && youtubePlayerRef.current.setVolume) {
              const targetVolume = Math.round(volume * 100);
              youtubePlayerRef.current.setVolume(targetVolume);
            }
            setIsLoading(false);
          }, 500);
        }
        
        setCurrentPlaylistProvider('youtube');
      }
      
      setIsPlaying(true);
        } catch (error) {
      console.error('Failed to load playlist:', error);
      
      // Handle production-specific Spotify errors
      handleSpotifyProductionErrors(error);
      
      const errorMessage = provider === 'spotify' 
        ? `Kon Spotify playlist niet laden: ${error.message}`
        : 'Kon YouTube playlist niet laden';
      setError(errorMessage);
      setIsPlaying(false);
      // Reset source if playlist fails
      setCurrentSource(null);
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
    }
  }, [volume, pauseRadioForAdBreak, isTransitioning]);

  const stopRadio = useCallback(async () => {
    console.log('🛑 Stopping radio...');
    
    // Cancel any ongoing connection attempts
    if (currentConnectionAttempt) {
      console.log('🚫 Canceling ongoing connection attempt');
      currentConnectionAttempt.cancel = true;
      setCurrentConnectionAttempt(null);
    }
    
    setIsIntentionalStop(true);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    setCurrentStation(null);
    setIsPlaying(false);
    setIsLoading(false);
    setLoadingProgress('');
    setConnectionTimeout(null);
    
    // Clear any pending timeouts
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, [currentConnectionAttempt]);
  const pauseAudio = useCallback(() => {
    if (currentSource === 'radio' && audioRef.current) {
      audioRef.current.pause();
    } else if (currentSource === 'playlist') {
      if (currentPlaylistProvider === 'spotify' && spotifyPlayerRef.current) {
        pauseSpotify();
      } else if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.pauseVideo();
      }
    }
    setIsPlaying(false);
  }, [currentSource, currentPlaylistProvider]);
  const resumeAudio = useCallback(() => {    // Check if ad break is active and force playlist if needed
    if (window.isAdBreakActive && window.playlistUrl) {
      console.log('🎵 Resume tijdens ad break - zorgen dat playlist afspeelt');
      
      const playlistId = extractPlaylistId(window.playlistUrl, playlistProvider);
      if (playlistId && (!youtubePlayerRef.current || currentSource !== 'playlist')) {
        // Playlist not loaded or not current source - start it
        try {
          playPlaylist(playlistId, {
            shuffle: window.playlistShuffle || false,
            repeat: 'all',
            provider: playlistProvider
          });
          
          if (window.addNotification) {
            window.addNotification('🎵 Playlist gestart tijdens reclamepauze', 'info', 2000);
          }
          return;
        } catch (error) {
          console.error('Failed to start playlist tijdens resume:', error);
        }
      }
    }
      // Normal resume logic
    if (currentSource === 'radio' && audioRef.current) {
      audioRef.current.play().catch(() => {
        setError('Failed to resume radio');
      });
    } else if (currentSource === 'playlist') {
      if (currentPlaylistProvider === 'spotify' && spotifyPlayerRef.current) {
        resumeSpotify();
      } else if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.playVideo();
      }
    }
    setIsPlaying(true);
  }, [currentSource, currentPlaylistProvider, playPlaylist]);
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {      // If ad break is active and no source is playing, force playlist
      if (window.isAdBreakActive && !currentSource && window.playlistUrl) {
        console.log('🎵 Play button during ad break with no source - forcing playlist');
        
        const playlistId = extractPlaylistId(window.playlistUrl, playlistProvider);
        if (playlistId) {
          try {
            playPlaylist(playlistId, {
              shuffle: window.playlistShuffle || false,
              repeat: 'all',
              provider: playlistProvider
            });
            
            if (window.addNotification) {
              window.addNotification('🎵 Playlist gestart tijdens reclamepauze', 'info', 2000);
            }
            return;
          } catch (error) {
            console.error('Failed to start playlist from play button:', error);
          }
        }
      }
      
      resumeAudio();
    }
  }, [isPlaying, pauseAudio, resumeAudio, currentSource, playPlaylist]);
  const toggleShuffle = useCallback((enabled) => {
    if (currentPlaylistProvider === 'spotify' && spotifyPlayerRef.current) {
      try {
        setSpotifyShuffleMode(enabled);
        console.log(`Spotify shuffle ${enabled ? 'enabled' : 'disabled'}`);
      } catch (error) {
        console.error('Error toggling Spotify shuffle:', error);
      }
    } else if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.setShuffle(enabled);
        console.log(`YouTube shuffle ${enabled ? 'enabled' : 'disabled'}`);
      } catch (error) {
        console.error('Error toggling YouTube shuffle:', error);
      }
    }
  }, [currentPlaylistProvider]);  

  // --- SPOTIFY PREMIUM CHECK & PLAYER TROUBLESHOOTING ---
  // Helper: Check if user is Spotify Premium
  const checkSpotifyPremium = useCallback(async () => {
    try {
      const resp = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}` }
      });
      if (!resp.ok) return false;
      const data = await resp.json();
      return data.product === 'premium';
    } catch (e) {
      return false;
    }
  }, []);

  // Add effect to warn if not Premium after login
  useEffect(() => {
    if (isSpotifyAuthenticated()) {
      checkSpotifyPremium().then(isPremium => {
        if (!isPremium) {
          setError('Spotify Web Playback werkt alleen met een Premium account.');
          if (window.addNotification) window.addNotification('Spotify Web Playback werkt alleen met een Premium account.', 'error', 10000);
        }
      });
    }
  }, [isSpotifyAuthenticated, checkSpotifyPremium]);

  // Add effect to show troubleshooting if stuck initializing
  useEffect(() => {
    if (isSpotifyInitializing) {
      const stuckTimeout = setTimeout(() => {
        if (!spotifyPlayerReady && isSpotifyInitializing) {
          setError('Spotify player wordt niet klaar. Controleer: 1) Premium account, 2) Browser blokkeert cookies/autoplay, 3) Geen andere actieve Spotify apparaten. Probeer opnieuw in te loggen of herlaad de pagina.');
          if (window.addNotification) window.addNotification('Spotify player wordt niet klaar. Zie console voor tips.', 'error', 12000);
        }
      }, 15000);
      return () => clearTimeout(stuckTimeout);
    }
  }, [isSpotifyInitializing, spotifyPlayerReady]);

  return {
    currentStation,
    isPlaying,
    volume,
    isLoading,
    loadingProgress,
    error,
    currentSource,
    isTransitioning,
    playRadio,
    playPlaylist,
    pauseAudio,
    resumeAudio,
    togglePlayPause,
    setVolume,
    setError,
    youtubePlayerRef,
    spotifyPlayerRef, 
    toggleShuffle,
    pauseRadioForAdBreak,
    resumeRadioFromAdBreak,
    isRadioPausedForAdBreak,
    pausedRadioStation,
    isIntentionalStop, 
    forceStopAllAudio,
    connectionTimeout, 
    abortConnection, 
    stopRadio, 
    currentPlaylistProvider,
    spotifyPlayerReady, 
    manualInitializeSpotifyPlayer, 
    isSpotifyInitializing, 
  };
};

