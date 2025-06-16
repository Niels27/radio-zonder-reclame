// hooks/useAudioPlayer.js - Enhanced audio player with volume synchronization

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  initializeSpotifyPlayer,
  isSpotifyAuthenticated,
  pauseSpotify,
  resumeSpotify,
  setSpotifyVolume,
  setSpotifyShuffleMode,
  playSpotifyPlaylist,
  ensureWebPlaybackDeviceActive,
  isSpotifyPlayerInitializing
} from '../utils/spotifyUtils';
import { StreamProxy } from '../utils/streamProxy';
import { AdSkipUtils } from '../utils/adSkipUtils.js';
import { stationReportingService } from '../utils/stationReporting';
import { extractPlaylistId } from '../utils/youtubeUtils';
import { AudioOnlyPlayer } from '../utils/audioOnlyPlayer';
import { popupYouTubePlayer } from '../utils/popupYouTubePlayer';

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

export const useAudioPlayer = (playlistProvider = 'spotify') => {
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
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
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);

  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const spotifyPlayerRef = useRef(null);
  const timeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);

  // ✅ Volume synchronization refs
  const volumeRef = useRef(volume);
  const lastAppliedVolumeRef = useRef(volume);

  // Refs to hold the latest state for use in event handlers
  const currentStationRef = useRef(currentStation);
  const isIntentionalStopRef = useRef(isIntentionalStop);
  const isTransitioningRef = useRef(isTransitioning);
  const isPlayingRef = useRef(isPlaying);

  // ✅ Keep volume ref in sync with volume state
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Sync playlist provider parameter with internal state
  useEffect(() => {
    setCurrentPlaylistProvider(playlistProvider);
    window.playlistProvider = playlistProvider;
  }, [playlistProvider]);

  // Sync refs with state
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

  // ✅ NEW: Enhanced Spotify volume enforcement - MOVED UP to fix initialization order
  const enforceSpotifyVolumeSync = useCallback(async (targetVolume = volume) => {
    if (currentSource !== 'playlist' || currentPlaylistProvider !== 'spotify') {
      return; // Only sync when Spotify is active
    }

    if (!spotifyPlayerRef.current || !spotifyPlayerReady) {
      return; // Only sync when Spotify player is ready
    }

    try {
      const safeVolume = Math.max(0, Math.min(1, targetVolume));

      // Method 1: SDK volume control (preferred)
      try {
        await spotifyPlayerRef.current.setVolume(safeVolume);
        console.log(`🔊 Spotify volume synced via SDK: ${Math.round(safeVolume * 100)}%`);
      } catch (sdkError) {
        console.warn('SDK volume sync failed, trying Web API...');

        // Method 2: Web API fallback
        const { setSpotifyVolume } = await import('../utils/spotifyUtils');
        await setSpotifyVolume(Math.round(safeVolume * 100));
        console.log(`🔊 Spotify volume synced via Web API: ${Math.round(safeVolume * 100)}%`);
      }

    } catch (error) {
      console.warn('Failed to sync Spotify volume:', error);
    }
  }, [volume, currentSource, currentPlaylistProvider, spotifyPlayerReady]);

  // In useAudioPlayer.js, replace the volume synchronization logic:

  // ✅ CRITICAL FIX: Volume isolation between sources
  const sourceVolumeRef = useRef({
    radio: 0.5,     // Separate volume for radio
    spotify: 0.5,   // Separate volume for Spotify
    youtube: 0.5    // Separate volume for YouTube
  });

  // Update the enforceVolumeSync function to be simpler and not cache source volumes:

  const enforceVolumeSync = useCallback((targetVolume = volume, forceSync = false) => {
    const safeVolume = Math.max(0, Math.min(1, targetVolume));

    // Apply to radio audio - ONLY sync if radio is active or force sync
    if (audioRef.current && (currentSource === 'radio' || forceSync)) {
      const currentAudioVolume = audioRef.current.volume;
      if (Math.abs(currentAudioVolume - safeVolume) > 0.01) {
        //console.log(`🔊 Volume sync: Radio was ${Math.round(currentAudioVolume * 100)}%, setting to ${Math.round(safeVolume * 100)}%`);
        audioRef.current.volume = safeVolume;
      }
    }

    // Apply to YouTube - ONLY sync if YouTube is active
    if (youtubePlayerRef.current && youtubePlayerRef.current.setVolume && currentSource === 'playlist' && currentPlaylistProvider === 'youtube') {
      try {
        const youtubeVolume = youtubePlayerRef.current.getVolume();
        const targetYouTubeVolume = Math.round(safeVolume * 100);
        if (Math.abs(youtubeVolume - targetYouTubeVolume) > 1) {
          console.log(`🔊 Volume sync: YouTube was ${youtubeVolume}%, setting to ${targetYouTubeVolume}%`);
          youtubePlayerRef.current.setVolume(targetYouTubeVolume);
        }
      } catch (error) {
        console.warn('Failed to sync YouTube volume:', error);
      }
    }

    // Apply to Spotify - ONLY sync if Spotify is active
    if (currentSource === 'playlist' && currentPlaylistProvider === 'spotify') {
      enforceSpotifyVolumeSync(safeVolume);
    }

    lastAppliedVolumeRef.current = safeVolume;
  }, [volume, currentSource, currentPlaylistProvider, enforceSpotifyVolumeSync]);

  // ✅ CRITICAL FIX: Enhanced setVolume with source switching protection
  const setVolumeWithEnforcement = useCallback((newVolume) => {
    const safeVolume = Math.max(0, Math.min(1, newVolume));
   // console.log(`🔊 Setting volume to ${Math.round(safeVolume * 100)}% for source: ${currentSource}`);

    // Update React state
    setVolume(safeVolume);
    volumeRef.current = safeVolume;

    // ✅ CRITICAL: Store volume for current source
    if (currentSource) {
      sourceVolumeRef.current[currentSource] = safeVolume;
     // console.log(`🔊 Cached ${currentSource} volume: ${Math.round(safeVolume * 100)}%`);
    }

    // Only apply to currently active source
    enforceVolumeSync(safeVolume, false); // Don't force sync to inactive sources

  }, [enforceVolumeSync, currentSource]);

  // Initialize audio element - runs ONCE on mount
  useEffect(() => {
    console.log('🎧 Initializing Audio element...');
    audioRef.current = new Audio();

    // ✅ CRITICAL: Set initial volume immediately and track it
    audioRef.current.volume = volume;
    lastAppliedVolumeRef.current = volume;
    volumeRef.current = volume;

    audioRef.current.crossOrigin = 'anonymous';

    const audio = audioRef.current;

    // ✅ ADD: Volume change detector to catch unexpected changes
    const handleVolumeChange = () => {
      const actualVolume = audio.volume;
      const expectedVolume = volumeRef.current;

      if (Math.abs(actualVolume - expectedVolume) > 0.01) {
       // console.warn(`🚨 Volume desync detected! Audio: ${Math.round(actualVolume * 100)}%, Expected: ${Math.round(expectedVolume * 100)}%`);
       // console.warn('🔧 Forcing volume correction...');

        // Force correct the volume
        audio.volume = expectedVolume;
        lastAppliedVolumeRef.current = expectedVolume;
      }
    };

    const handleLoadStart = () => {
      if (!isIntentionalStopRef.current) {
        setLoadingProgress('Laden...');
      }
    };

    const handleError = (event) => {
      const mediaError = event.target.error;
      console.error('🎧 Audio element error:', mediaError ? `Code: ${mediaError.code}, Message: ${mediaError.message}` : 'Unknown error', event);

      if (!isIntentionalStopRef.current &&
        !isTransitioningRef.current &&
        !window.isAdBreakActive &&
        audioRef.current?.src) {

        const errorMessage = mediaError ?
          `Stream fout: ${mediaError.message || 'Onbekende fout'}` :
          'Stream niet beschikbaar';
        setError(errorMessage);
        setIsLoading(false);
        setIsPlaying(false);
      } else {
        console.log('🎧 Audio error ignored (intentional stop or transition)');
      }
    };

    const handleEnded = () => {
      console.log('🎧 Audio: ended');
      setIsPlaying(false);
    };

    const handleStalled = () => {
      console.warn('🎧 Audio: stalled. Stream may have issues or network interruption.');
      if (isPlayingRef.current && !isIntentionalStopRef.current && !isTransitioningRef.current) {
        setError('Stream onderbroken - controleer internetverbinding');
      }
    };

    const handleWaiting = () => {
      console.log('🎧 Audio: waiting for data (buffering)...');
      if (!isIntentionalStopRef.current) {
        setLoadingProgress('Bufferen...');
      }
    };

    const handlePlayingEvent = () => {
      console.log('🎧 Audio: native "playing" event fired.');

      // ✅ CRITICAL: Enforce volume when audio starts playing
      setTimeout(() => {
        enforceVolumeSync(volumeRef.current);
      }, 100);

      setIsLoading(false);
      setIsPlaying(true);
    };

    const handleLoadedData = () => {
      console.log('🎧 Audio: loadeddata event - enforcing volume');

      // ✅ CRITICAL: Enforce volume as soon as audio data is loaded
      setTimeout(() => {
        enforceVolumeSync(volumeRef.current);
      }, 50);
    };

    const handleCanPlay = () => {
      console.log('🎧 Audio: canplay event - final volume enforcement');

      // ✅ CRITICAL: Final volume enforcement when audio is ready to play
      setTimeout(() => {
        enforceVolumeSync(volumeRef.current);
      }, 100);
    };

    // ✅ ADD: Listen for volume changes to detect desyncs
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlayingEvent);

    // Cleanup function: runs on component unmount
    return () => {
      console.log('🎧 Cleaning up Audio element...');
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlayingEvent);
      audio.pause();
      audio.src = '';
    };
  }, []); // ✅ CRITICAL: Empty dependency array - this should only run once

  // ✅ CRITICAL FIX: Add periodic volume verification
  useEffect(() => {
    const volumeVerificationInterval = setInterval(() => {
      if (audioRef.current && currentSource === 'radio' && isPlaying) {
        const actualVolume = audioRef.current.volume;
        const expectedVolume = volumeRef.current;

        if (Math.abs(actualVolume - expectedVolume) > 0.01) {
          console.warn(`🚨 Volume drift detected! Correcting ${Math.round(actualVolume * 100)}% → ${Math.round(expectedVolume * 100)}%`);
          audioRef.current.volume = expectedVolume;
          lastAppliedVolumeRef.current = expectedVolume;
        }
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(volumeVerificationInterval);
  }, [currentSource, isPlaying]);

  // Add this to useAudioPlayer.js to prevent runaway volume increases:

  // Add this effect after the existing volume verification:
  useEffect(() => {
    const emergencyVolumeProtection = setInterval(() => {
      if (audioRef.current && currentSource === 'radio') {
        const actualVolume = audioRef.current.volume;
        const expectedVolume = volumeRef.current;

        // ✅ EMERGENCY: Detect runaway volume increases
        if (actualVolume > expectedVolume + 0.1) { // More than 10% higher than expected
          console.error(`🚨 EMERGENCY: Runaway volume detected! Audio=${Math.round(actualVolume * 100)}%, Expected=${Math.round(expectedVolume * 100)}%`);

          // Force immediate correction
          audioRef.current.volume = expectedVolume;

          // Emergency notification
          if (window.addNotification) {
            window.addNotification(`🚨 Volume-noodstop toegepast! ${Math.round(expectedVolume * 100)}%`, 'error', 5000);
          }

          // Log the issue
          console.error('🚨 This indicates a serious volume control bug - check music detection system!');
        }

        // ✅ EMERGENCY: Detect any volume above safe threshold
        if (actualVolume > 0.9) { // Above 90%
          console.error(`🚨 EMERGENCY: Dangerous volume level detected! ${Math.round(actualVolume * 100)}%`);

          // Cap at safe level
          const safeVolume = Math.min(0.8, expectedVolume);
          audioRef.current.volume = safeVolume;
          setVolume(safeVolume);
          volumeRef.current = safeVolume;

          if (window.addNotification) {
            window.addNotification(`🚨 Volume noodstop: ${Math.round(safeVolume * 100)}%`, 'error', 5000);
          }
        }
      }
    }, 500); // Check every 500ms for emergency situations

    return () => clearInterval(emergencyVolumeProtection);
  }, [currentSource]);

  // Manual Spotify player initialization
  const manualInitializeSpotifyPlayer = useCallback(async () => {
    console.log('🎵 Manual Spotify player initialization...');

    if (!isSpotifyAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }

    if ((spotifyPlayerRef.current && spotifyPlayerReady) || isSpotifyPlayerInitializing()) {
      console.log('🎵 Spotify player already ready or initializing - returning existing player');
      return spotifyPlayerRef.current;
    }

    try {
      console.log('🎵 Starting manual Spotify player creation...');

      const player = await initializeSpotifyPlayer();

      if (player) {
        console.log('🎵 ✅ Manual Spotify player created successfully - updating React state');

        spotifyPlayerRef.current = player;
        setSpotifyPlayerReady(true);
        console.log('🎵 ✅ Manual Spotify initialization complete - state updated');

        if (!spotifyPlayerReady) {
          player.addListener('player_state_changed', (state) => {
            if (!state) return;
            if (currentSource === 'playlist' && currentPlaylistProvider === 'spotify') {
              setIsPlaying(!state.paused);
            }
          });
        }

        setTimeout(() => {
          console.log('🎵 ✅ Forcing component re-render after manual initialization');
          setForceUpdateCounter(prev => prev + 1);

          window.dispatchEvent(new CustomEvent('spotifyPlayerReady', {
            detail: {
              ready: true,
              provider: currentPlaylistProvider,
              manual: true
            }
          }));

          setSpotifyPlayerReady(false);
          setTimeout(() => setSpotifyPlayerReady(true), 50);
        }, 100);

      } else {
        throw new Error('Player initialization returned null');
      }

      return player;
    } catch (error) {
      console.error('🎵 Manual Spotify initialization failed:', error);
      setError('Kon Spotify player niet initialiseren: ' + error.message);
      setSpotifyPlayerReady(false);
      throw error;
    }
  }, [currentSource, currentPlaylistProvider, spotifyPlayerReady]);

  // Initialize only the selected provider's player
  useEffect(() => {
    const initializeSelectedProvider = async () => {
      console.log('🎵 Provider changed to:', playlistProvider);

      if (playlistProvider === 'spotify') {
        // Clean up YouTube completely
        if (youtubePlayerRef.current) {
          try {
            youtubePlayerRef.current.destroy();
            youtubePlayerRef.current = null;
            console.log('🎵 Cleaned up YouTube player');
          } catch (error) {
            console.warn('Error cleaning up YouTube player:', error);
          }
        }

        if (isSpotifyAuthenticated() && !spotifyPlayerReady && !spotifyPlayerRef.current && !isSpotifyPlayerInitializing()) {
          console.log('🎵 Initializing Spotify player for selected provider');
          try {
            const player = await initializeSpotifyPlayer();

            if (player && window.spotifyDeviceId) {
              spotifyPlayerRef.current = player;

              if (!spotifyPlayerReady) {
                player.addListener('player_state_changed', (state) => {
                  if (!state) return;
                  if (currentSource === 'playlist' && currentPlaylistProvider === 'spotify') {
                    setIsPlaying(!state.paused);
                  }
                });

                setSpotifyPlayerReady(true);
                console.log('🎵 ✅ Spotify player ready state updated in React');
              }
            }
          } catch (error) {
            console.error('Failed to initialize Spotify player:', error);
            setError('Spotify player initialization failed: ' + error.message);
            setSpotifyPlayerReady(false);
          }
        } else if (isSpotifyAuthenticated() && spotifyPlayerReady) {
         // console.log('🎵 Spotify player already ready - no action needed');
        } else if (!isSpotifyAuthenticated()) {
          console.log('🎵 Spotify provider selected but not authenticated - waiting for login');
        } else if (isSpotifyPlayerInitializing()) {
          console.log('🎵 Spotify player already initializing - waiting...');

          setTimeout(() => {
            if (isSpotifyPlayerInitializing() && !spotifyPlayerReady) {
              console.warn('🔧 Spotify initialization seems stuck - attempting recovery...');

              if (window.spotifyUtils) {
                window.spotifyUtils.resetInitializationState?.();
              }

              manualInitializeSpotifyPlayer().catch(error => {
                console.error('Recovery attempt failed:', error);
              });
            }
          }, 10000);
        }
      } else if (playlistProvider === 'youtube') {
        // Clean up Spotify completely
        if (spotifyPlayerRef.current) {
          try {
            spotifyPlayerRef.current.disconnect();
            spotifyPlayerRef.current = null;
            setSpotifyPlayerReady(false);
            console.log('🎵 Cleaned up Spotify player');
          } catch (error) {
            console.warn('Error cleaning up Spotify player:', error);
          }
        }

        console.log('🎵 YouTube provider selected - player will be created on demand');
      }
    };

    initializeSelectedProvider();
  }, [playlistProvider, spotifyPlayerReady, manualInitializeSpotifyPlayer]);

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

  // ✅ CRITICAL FIX: Enhanced playRadio with immediate volume enforcement
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

    // Apply station overrides before processing
    const effectiveStationData = stationReportingService.getEffectiveStationData(stationData);
    console.log('🔧 Using station data:', effectiveStationData._hasOverride ? 'with override' : 'original', effectiveStationData);    try {
      // ✅ FIX: Handle nonstop rotation during ad break differently
      if (window.isAdBreakActive && window.queueStationSwitch && !window.isNonstopRotation) {
        console.log('🎵 Ad break active - queueing station switch');
        window.queueStationSwitch(effectiveStationData);
        if (window.addNotification) {
          window.addNotification(`Station ${effectiveStationData.name} wordt na reclamepauze afgespeeld`, 'info', 3000);
        }
        return;
      }

      if (window.isNonstopRotation) {
        console.log('🔄 Nonstop rotation during ad break - playing immediately without queueing');
      }

      if (isTransitioning) {
        console.log('🎵 Already transitioning - ignoring new station request');
        return;
      }

      setIsIntentionalStop(false);
      setCurrentStation(effectiveStationData);
      setIsLoading(true);
      setLoadingProgress('Verbinden...');

      // Set connection timeout (30 seconds)
      const timeoutId = setTimeout(() => {
        if (!connectionAttempt.cancel) {
          console.error('🚨 Connection timeout for:', effectiveStationData.name);
          setError(`Verbinding met ${effectiveStationData.name} mislukt (timeout)`);
          setIsLoading(false);
          setConnectionTimeout('Verbinding time-out');
        }
      }, 30000);

      connectionTimeoutRef.current = timeoutId;

      // Check if canceled before proceeding
      if (connectionAttempt.cancel) {
        console.log('🚫 Connection attempt was canceled');
        return;
      }

      const workingUrl = await StreamProxy.findWorkingStream(
        effectiveStationData.url,
        (progress) => {
          if (!connectionAttempt.cancel) {
            setLoadingProgress(progress);
          }
        },
        effectiveStationData.name,
        connectionAttempt,
        true
      );

      // Clear timeout since we found a working URL
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }

      // Check if canceled after getting working URL
      if (connectionAttempt.cancel) {
        console.log('🚫 Connection canceled after finding working URL');
        return;
      }

      // ✅ CRITICAL FIX: Clean audio element reset to prevent corruption
      if (audioRef.current) {
        console.log('🔄 Resetting audio element to prevent corruption');

        // Store the desired volume BEFORE any manipulation
        const targetVolume = volumeRef.current;
        console.log(`🔊 Target volume for radio: ${Math.round(targetVolume * 100)}%`);

        // ✅ STEP 1: Clean stop and reset audio element
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';

        // ✅ STEP 2: Force reload to reset internal state
        audioRef.current.load();

        // ✅ STEP 3: Wait for reset to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // ✅ STEP 4: Set volume BEFORE setting new source
        audioRef.current.volume = targetVolume;
        lastAppliedVolumeRef.current = targetVolume;

        console.log(`🔊 Audio element reset complete, volume set to ${Math.round(targetVolume * 100)}%`);
      }

      // Stop any existing audio before starting new stream
      if (currentSource === 'playlist') {
        // Stop YouTube
        if (youtubePlayerRef.current) {
          try {
            youtubePlayerRef.current.pauseVideo();
            youtubePlayerRef.current.stopVideo();
          } catch (error) {
            console.warn('Error stopping YouTube:', error);
          }
        }

        // Stop Spotify
        if (spotifyPlayerRef.current) {
          try {
            await spotifyPlayerRef.current.pause();
          } catch (error) {
            console.warn('Error stopping Spotify:', error);
          }
        }
      }

      // ✅ CRITICAL FIX: Use current UI volume, not cached source volume
      const radioVolume = volumeRef.current; // Use actual current volume
      console.log(`🔊 Using current UI volume for radio: ${Math.round(radioVolume * 100)}%`);

      // ✅ CRITICAL: Update source-specific cache AFTER setting volume
      sourceVolumeRef.current.radio = radioVolume;

      // Ensure audio element exists and prepare it
      if (!audioRef.current) {
        console.error('🚨 Audio element not available!');
        setError('Audio systeem niet beschikbaar');
        return;
      }

      // ✅ CRITICAL: Verify volume is correctly set
      if (Math.abs(audioRef.current.volume - radioVolume) > 0.01) {
        console.warn(`🔄 Volume correction needed: ${Math.round(audioRef.current.volume * 100)}% → ${Math.round(radioVolume * 100)}%`);
        audioRef.current.volume = radioVolume;
      }

      // Set new source
      console.log(`🔗 Setting new radio source: ${workingUrl}`);
      audioRef.current.src = workingUrl;

      setCurrentSource('radio');
      setError(null);

      // ✅ CRITICAL FIX: Enhanced volume monitoring during load and play
      const volumeMonitor = setInterval(() => {
        if (audioRef.current) {
          const currentVol = audioRef.current.volume;
          const expectedVol = radioVolume;

          if (Math.abs(currentVol - expectedVol) > 0.01) {
            console.warn(`🔊 Volume drift during load: ${Math.round(currentVol * 100)}% → ${Math.round(expectedVol * 100)}%`);
            audioRef.current.volume = expectedVol;
          }
        }
      }, 100); // Check every 100ms during critical period

      // Load and play
      try {
        await audioRef.current.load();

        // ✅ CRITICAL: Verify volume after load
        if (Math.abs(audioRef.current.volume - radioVolume) > 0.01) {
          console.warn(`🔊 Volume reset during load, correcting: ${Math.round(audioRef.current.volume * 100)}% → ${Math.round(radioVolume * 100)}%`);
          audioRef.current.volume = radioVolume;
        }

        await audioRef.current.play();

        // Clear volume monitor after successful play
        clearInterval(volumeMonitor);

        // ✅ CRITICAL: Final volume verification
        setTimeout(() => {
          if (audioRef.current && currentSource === 'radio') {
            const finalVolume = audioRef.current.volume;
            const uiVolume = volumeRef.current;

            console.log(`🔊 Final volume check: Audio=${Math.round(finalVolume * 100)}%, UI=${Math.round(uiVolume * 100)}%`);

            if (Math.abs(finalVolume - uiVolume) > 0.01) {
              console.warn(`🚨 Final volume mismatch detected, correcting...`);
              audioRef.current.volume = uiVolume;

              if (window.addNotification) {
                window.addNotification(`🔊 Volume gecorrigeerd naar ${Math.round(uiVolume * 100)}%`, 'info', 2000);
              }
            }
          }
        }, 1000);        console.log(`✅ Successfully playing: ${effectiveStationData.name} at ${Math.round(radioVolume * 100)}% volume`);

        setIsPlaying(true);
        setIsLoading(false);
        setLoadingProgress('');

        // ✅ ADD: Check for pre-roll ads and offer skip
        if (AdSkipUtils.shouldOfferPrerollSkip(workingUrl, effectiveStationData.name)) {
          console.log('🚫 Pre-roll ads detected, offering skip option...');
          
          // Check if auto-skip is enabled
          const autoSkipEnabled = AdSkipUtils.getAutoSkipSetting();
          
          if (autoSkipEnabled) {
            console.log('⚡ Auto-skip enabled, skipping pre-roll silently...');
            setTimeout(() => {
              AdSkipUtils.skipPrerollSilently(audioRef.current, 17);
            }, 2000); // Wait 2 seconds before auto-skip
          } else {
            console.log('👆 Manual skip mode, showing skip button...');
            setTimeout(() => {
              AdSkipUtils.createPrerollSkipButton(
                audioRef.current,
                () => {
                  console.log('👆 User manually skipped pre-roll');
                  if (window.addNotification) {
                    window.addNotification('⏩ Pre-roll overgeslagen', 'success', 2000);
                  }
                },
                false // Not auto-skip
              );
            }, 3000); // Wait 3 seconds to show button
          }
        }

        // Save last played station
        localStorage.setItem('lastPlayedStation', JSON.stringify(effectiveStationData));

        // Clear paused radio state since we're now playing
        if (isRadioPausedForAdBreak) {
          setIsRadioPausedForAdBreak(false);
          setPausedRadioStation(null);
          localStorage.removeItem('pausedRadioState');
        }

      } catch (playError) {
        clearInterval(volumeMonitor);
        console.error('🚨 Failed to play audio:', playError);
        setError(`Kon ${effectiveStationData.name} niet afspelen: ${playError.message}`);
        setIsLoading(false);
        setIsPlaying(false);
      }

    } catch (error) {
      console.error('🚨 playRadio failed:', error);
      setError(`Fout bij ${effectiveStationData.name}: ${error.message}`);
      setIsLoading(false);
      setIsPlaying(false);

      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    } finally {
      setCurrentConnectionAttempt(null);
    }
  }, [currentConnectionAttempt, isTransitioning, playlistProvider, currentSource, isRadioPausedForAdBreak]);

  // STOP RADIO - Clean stop for radio only
  const stopRadio = useCallback(() => {
    console.log('🛑 Stopping radio playbook');

    if (currentSource === 'radio' && audioRef.current) {
      setIsIntentionalStop(true);
      audioRef.current.pause();
      audioRef.current.src = '';
      setIsPlaying(false);
      setCurrentStation(null);
      setCurrentSource(null);

      // Clear any loading states
      setIsLoading(false);
      setLoadingProgress('');
      setError(null);

      setTimeout(() => setIsIntentionalStop(false), 500);

      console.log('🛑 Radio stopped cleanly');
    } else {
      console.log('🛑 Not playing radio - no action needed');
    }
  }, [currentSource]);

  // Enhanced pauseRadioForAdBreak with better state management
  const pauseRadioForAdBreak = useCallback(() => {
    if (isTransitioning) {
      console.log('🎵 Already transitioning, skipping pause');
      return;
    }

    console.log('🎵 Pausing radio for ad break with enhanced state tracking');
    setIsTransitioning(true);

    if (audioRef.current && currentSource === 'radio' && currentStation) {
      // ✅ CRITICAL FIX: Mark as intentional stop BEFORE pausing
      setIsIntentionalStop(true);

      // Save the complete state before pausing
      const radioState = {
        station: currentStation,
        volume: audioRef.current.volume,
        currentTime: audioRef.current.currentTime,
        src: audioRef.current.src,
        wasPlaying: !audioRef.current.paused
      };

      // Store in localStorage and component state
      localStorage.setItem('pausedRadioState', JSON.stringify(radioState));
      setIsRadioPausedForAdBreak(true);
      setPausedRadioStation(currentStation);

      // Clean pause
      audioRef.current.pause();
      audioRef.current.src = '';
      setIsPlaying(false);

      console.log('🎵 ✅ Radio cleanly paused for ad break:', radioState);

      // Reset intentional stop after a moment
      setTimeout(() => {
        setIsIntentionalStop(false);
        setIsTransitioning(false);
      }, 1000);
    } else {
      console.log('🎵 No radio to pause for ad break');
      setIsTransitioning(false);
    }
  }, [currentSource, currentStation, isTransitioning]);

  // ✅ ADD: Resume radio from ad break function
  const resumeRadioFromAdBreak = useCallback(() => {
    console.log('🎵 Resuming radio from ad break');

    if (isRadioPausedForAdBreak && pausedRadioStation) {
      console.log('🎵 Resuming paused radio station:', pausedRadioStation.name);
      playRadio(pausedRadioStation);
    } else {
      console.log('🎵 No paused radio to resume from ad break');
    }
  }, [isRadioPausedForAdBreak, pausedRadioStation, playRadio]);

  // ✅ ADD: Force stop all audio function
  const forceStopAllAudio = useCallback(() => {
    console.log('🛑 FORCE STOPPING ALL AUDIO');

    // Stop radio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    // Stop YouTube
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.pauseVideo();
        youtubePlayerRef.current.stopVideo();
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

  const playPlaylist = useCallback(async (playlistId, options = {}) => {
    const provider = options.provider || currentPlaylistProvider;
    console.log('🎵 Starting playlist:', playlistId, 'Provider:', provider);

    // ✅ FIX: ALWAYS stop any current audio first
    console.log('🎵 Enforcing single audio stream - stopping current audio');

    // Stop radio if playing (but don't clear paused radio state for ad breaks)
    if (currentSource === 'radio' && audioRef.current && !isRadioPausedForAdBreak) {
      audioRef.current.pause();
      audioRef.current.src = '';
      console.log('🎵 Stopped radio for playlist');
    }

    // Stop any existing playlist
    if (currentSource === 'playlist') {
      if (currentPlaylistProvider === 'spotify' && spotifyPlayerRef.current) {
        try {
          const { pauseSpotify } = await import('../utils/spotifyUtils');
          pauseSpotify();
        } catch (error) {
          console.warn('Could not pause existing Spotify player:', error);
        }
      }

      if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.pauseVideo();
          youtubePlayerRef.current.stopVideo();
        } catch (error) {
          console.warn('Could not stop existing YouTube player:', error);
        }
      }
    }

    setIsTransitioning(true);
    setIsLoading(true);
    setError(null);
    setCurrentSource('playlist');

    try {
      if (provider === 'spotify') {
        console.log('🎵 Starting Spotify playlist');

        if (!spotifyPlayerRef.current || !spotifyPlayerReady) {
          console.log('🎵 Spotify player not ready - initializing...');
          await manualInitializeSpotifyPlayer();
        }

        console.log('🎵 Waiting briefly for Spotify player...');
        await new Promise(resolve => setTimeout(resolve, 500));

        let attempts = 0;
        const maxAttempts = 10;

        while ((!spotifyPlayerRef.current || !window.audioPlayer?.spotifyPlayerReady) && attempts < maxAttempts) {
          console.log(`🎵 Waiting for Spotify player... attempt ${attempts + 1}/${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }

        if (!spotifyPlayerRef.current || !window.audioPlayer?.spotifyPlayerReady) {
          throw new Error('Spotify player is not available after initialization');
        }

        let actualPlaylistId = playlistId;
        if (typeof playlistId === 'string' && playlistId.includes('open.spotify.com')) {
          const match = playlistId.match(/playlist\/([a-zA-Z0-9]+)/);
          if (match) {
            actualPlaylistId = match[1];
          }
        }

        const { playSpotifyPlaylist } = await import('../utils/spotifyUtils');
        await playSpotifyPlaylist(actualPlaylistId, options.shuffle || false);

        console.log('🎵 Spotify playlist gestart');

        // ✅ CRITICAL FIX: Set isPlaying to true when Spotify starts playing
        setIsPlaying(true);

        if (window.addNotification) {
          window.addNotification('🎵 Spotify afspeellijst gestart', 'success', 3000);
        }

        setTimeout(async () => {
          enforceSpotifyVolumeSync(volume);
        }, 1000);
      } else {
        // ✅ CRITICAL: Use YouTube-specific volume
        const youtubeVolume = sourceVolumeRef.current.youtube || volumeRef.current;
        console.log(`🔊 Using YouTube volume: ${Math.round(youtubeVolume * 100)}%`);

        // ✅ CRITICAL: Update UI to match YouTube volume
        setVolume(youtubeVolume);
        volumeRef.current = youtubeVolume;

        // Enhanced YouTube popup with ad break integration
        console.log('🎵 Opening YouTube playlist in popup');

        setLoadingProgress('YouTube player openen...');

        const enhancedOptions = {
          ...options,
          autoCloseDuration: window.isAdBreakActive && window.currentAdBreakTimeLeft
            ? Math.ceil(window.currentAdBreakTimeLeft / 60)
            : options.duration
        };

        const success = await popupYouTubePlayer.playPlaylist(playlistId, enhancedOptions);

        if (success) {
          console.log('🎵 YouTube playlist popup geopend');

          // ✅ CRITICAL FIX: Set isPlaying to true when YouTube starts playing
          setIsPlaying(true);

          if (window.addNotification) {
            window.addNotification('🎵 YouTube afspeellijst popup geopend', 'success', 3000);
          }
        } else {
          throw new Error('Kon YouTube popup niet openen');
        }
      }

      setCurrentSource('playlist');
    } catch (error) {
      console.error('Failed to load playlist:', error);
      setError(`Kon playlist niet laden: ${error.message}`);
      // ✅ FIX: Reset isPlaying on error
      setIsPlaying(false);
      throw error;
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
    }
  }, [volume, pauseRadioForAdBreak, isTransitioning, currentPlaylistProvider, spotifyPlayerReady, currentSource, isRadioPausedForAdBreak, manualInitializeSpotifyPlayer, enforceSpotifyVolumeSync]);

  // ✅ FIX: Enhanced pauseAudio with better cleanup
  const pauseAudio = useCallback(() => {
    console.log('🎵 Pausing current audio source:', currentSource);

    if (currentSource === 'radio' && audioRef.current) {
      audioRef.current.pause();
    } else if (currentSource === 'playlist') {
      if (currentPlaylistProvider === 'spotify' && spotifyPlayerRef.current) {
        spotifyPlayerRef.current.pause().then(() => {
          console.log('🎵 Spotify paused via SDK');
        }).catch((error) => {
          console.warn('Could not pause Spotify via SDK:', error);
          pauseSpotify();
        });
      } else if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.closePopup('paused');
        youtubePlayerRef.current = null; // Clear reference
      }
    }

    setIsPlaying(false);
  }, [currentSource, currentPlaylistProvider]);

  // ✅ FIX: Add next track method
  const nextTrack = useCallback(() => {
    if (currentSource === 'playlist') {
      if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.nextVideo();
      } else if (currentPlaylistProvider === 'spotify' && spotifyPlayerRef.current) {
        spotifyPlayerRef.current.nextTrack().then(() => {
          console.log('🎵 Spotify next track');
        }).catch(error => {
          console.warn('Could not skip Spotify track:', error);
        });
      }
    }
  }, [currentSource, currentPlaylistProvider]);

  // ✅ FIX: Add resumeAudio function
  const resumeAudio = useCallback(() => {
    console.log('🎵 Resuming audio source:', currentSource);

    if (currentSource === 'radio' && audioRef.current) {
      audioRef.current.play();
    } else if (currentSource === 'playlist') {
      if (currentPlaylistProvider === 'spotify' && spotifyPlayerRef.current) {
        spotifyPlayerRef.current.resume().then(() => {
          console.log('🎵 Spotify resumed via SDK');
        }).catch((error) => {
          console.warn('Could not resume Spotify via SDK:', error);
          resumeSpotify();
        });
      } else if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.resume();
      }
    }

    setIsPlaying(true);
  }, [currentSource, currentPlaylistProvider]);

  // ✅ FIX: Add togglePlayPause function
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  }, [isPlaying, pauseAudio, resumeAudio]);

  // ✅ FIX: Add toggleShuffle function
  const toggleShuffle = useCallback((enabled) => {
    if (currentSource === 'playlist') {
      if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.setShuffle(enabled);
      } else if (currentPlaylistProvider === 'spotify' && spotifyPlayerRef.current) {
        setSpotifyShuffleMode(enabled);
      }
    }
  }, [currentSource, currentPlaylistProvider]);

  // Global state synchronization
  useEffect(() => {
    const updateGlobalState = () => {
      window.isAdBreakActive = window.isAdBreakActive || false;
      window.audioPlayerState = {
        isPlaying,
        currentSource,
        currentStation: currentStation?.name || null,
        isRadioPausedForAdBreak,
        pausedRadioStation: pausedRadioStation?.name || null,
        spotifyReady: spotifyPlayerReady,
        youtubeReady: !!youtubePlayerRef?.current,
        isTransitioning,
        lastUpdate: Date.now()
      };

      window.dispatchEvent(new CustomEvent('audioStateChanged', {
        detail: window.audioPlayerState
      }));
    };

    updateGlobalState();
  }, [isPlaying, currentSource, currentStation, isRadioPausedForAdBreak, pausedRadioStation, spotifyPlayerReady, isTransitioning]);

  // Health check system
  useEffect(() => {
    const healthCheck = setInterval(() => {
      const state = window.audioPlayerState;

      // Check for stuck states
      if (state?.isTransitioning && (Date.now() - state.lastUpdate) > 30000) {
        console.warn('🏥 Detected stuck transitioning state - resetting');
        setIsTransitioning(false);
      }

      // Check for silent periods during supposed playback
      if (isPlaying && currentSource === 'radio' && audioRef.current) {
        if (audioRef.current.paused && !isIntentionalStop && !isTransitioning) {
          console.warn('🏥 Detected silent radio - attempting restart');
          if (currentStation) {
            playRadio(currentStation);
          }
        }
      }

      // Check for playlist health
      if (isPlaying && currentSource === 'playlist') {
        if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
          if (youtubePlayerRef.current.popupWindow && youtubePlayerRef.current.popupWindow.closed) {
            console.warn('🏥 YouTube popup closed unexpectedly');
            setIsPlaying(false);
            setCurrentSource(null);
            youtubePlayerRef.current = null;
          }
        }
      }

    }, 10000); // Check every 10 seconds

    return () => clearInterval(healthCheck);
  }, [isPlaying, currentSource, currentStation, isIntentionalStop, isTransitioning, currentPlaylistProvider, playRadio]);

  // Listen for late Spotify ready events
  useEffect(() => {
    const handleLateSpotifyReady = (event) => {
      console.log('🎵 ✅ Late Spotify ready event received:', event.detail);

      if (playlistProvider === 'spotify' && !spotifyPlayerReady) {
        console.log('🎵 ✅ Updating React state for late Spotify ready');

        spotifyPlayerRef.current = event.detail.player;
        setSpotifyPlayerReady(true);

        setError(null);

        if (window.addNotification) {
          window.addNotification('🎵 ✅ Spotify player ready!', 'success', 3000);
        }
      }
    };

    window.addEventListener('spotifyPlayerReady', handleLateSpotifyReady);

    return () => {
      window.removeEventListener('spotifyPlayerReady', handleLateSpotifyReady);
    };
  }, [playlistProvider, spotifyPlayerReady]);

  // Force UI updates when Spotify becomes ready
  useEffect(() => {
    if (spotifyPlayerReady && playlistProvider === 'spotify') {
      console.log('🎵 ✅ Forcing UI update - Spotify is ready');

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('spotifyPlayerReady', {
          detail: { ready: true, provider: playlistProvider }
        }));

        setError(null);
      }, 100);
    }
  }, [spotifyPlayerReady, playlistProvider]);

  // Global audio enforcement
  const enforceAudioGlobally = useCallback(() => {
   // console.log('🔍 Enforcing global audio state...');

    // Check for orphaned audio elements
    const allAudioElements = document.querySelectorAll('audio');
    const allVideoElements = document.querySelectorAll('video');

    allAudioElements.forEach((audio, index) => {
      if (audio !== audioRef.current && !audio.paused) {
        console.warn(`🚨 Found orphaned playing audio element ${index}, stopping it`);
        audio.pause();
        audio.src = '';
      }
    });

    allVideoElements.forEach((video, index) => {
      if (!video.paused && !video.closest('.lofi-overlay')) {
        console.warn(`🚨 Found orphaned playing video element ${index}, stopping it`);
        video.pause();
      }
    });

    // Only check Spotify if it's actually playing AND shouldn't be
    if (window.Spotify && window.Spotify.Player && spotifyPlayerRef.current) {
      if (currentSource !== 'playlist' && currentSource !== null) {
        spotifyPlayerRef.current.getCurrentState().then(state => {
          if (state && !state.paused) {
            console.warn('🚨 Spotify player is playing but not supposed to be active');
            try {
              import('../utils/spotifyUtils').then(({ pauseSpotify }) => pauseSpotify());
            } catch (error) {
              console.warn('Could not pause orphaned Spotify:', error);
            }
          }
        }).catch(() => {
          // Ignore errors when checking state
        });
      }
    }
  }, [currentSource]);

  // Run enforcement periodically
  useEffect(() => {
    const interval = setInterval(enforceAudioGlobally, 5000);
    return () => clearInterval(interval);
  }, [enforceAudioGlobally]);

  // Add this emergency volume protection:

  // ✅ EMERGENCY: Volume spike protection
  const safeVolumeChange = useCallback((newVolume, source = currentSource) => {
    const currentAudioVolume = audioRef.current?.volume || 0;
    const volumeIncrease = newVolume - currentAudioVolume;

    // ✅ EMERGENCY: Prevent dangerous volume spikes
    if (volumeIncrease > 0.3) { // More than 30% increase
      console.warn(`🚨 DANGEROUS VOLUME SPIKE PREVENTED: ${Math.round(currentAudioVolume * 100)}% → ${Math.round(newVolume * 100)}%`);

      // Gradually increase volume instead
      const safeNewVolume = Math.min(newVolume, currentAudioVolume + 0.2);
      console.log(`🔊 Safe volume applied: ${Math.round(safeNewVolume * 100)}%`);

      if (window.addNotification) {
        window.addNotification(`🔊 Volume aangepast voor veiligheid: ${Math.round(safeNewVolume * 100)}%`, 'warning', 3000);
      }

      return safeNewVolume;
    }

    return newVolume;
  }, [currentSource]);

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
    setVolume: setVolumeWithEnforcement, // ✅ Use the enhanced version
    setError,
    audioRef,
    youtubePlayerRef,
    spotifyPlayerRef,
    toggleShuffle,
    nextTrack,    pauseRadioForAdBreak,
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
    forceUpdateCounter,
  };
};