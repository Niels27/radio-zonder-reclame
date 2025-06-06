// hooks/useAudioPlayer.js - Better error handling
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\hooks\useAudioPlayer.js

// Add these imports at the top with your other imports:
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
import { AdSkipUtils } from '../utils/adSkipUtils';
import { stationReportingService } from '../utils/stationReporting';
import {


  extractPlaylistId,
  // ← Fixed import
} from '../utils/youtubeUtils';
import { AudioOnlyPlayer } from '../utils/audioOnlyPlayer';
import { popupYouTubePlayer } from '../utils/popupYouTubePlayer';

// --- BEGIN: ROBUST SPOTIFY PLAYER INITIALIZATION ---
// (Removed duplicate _setupSpotifyPlayerInstance definition. The correct definition is further down in the file.)

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
  // Simple Spotify player initialization - FIXED to prevent infinite loops
  // Add check at the start of Spotify initialization

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

        // CRITICAL FIX: Don't reset Spotify if it's already working
        if (isSpotifyAuthenticated()) {
          // Check if we already have a working Spotify player
          if (spotifyPlayerReady && spotifyPlayerRef.current) {
            console.log('🎵 Spotify player already ready and working - skipping reinitialization');
            return; // ← CRITICAL: Don't reinitialize if already working
          }

          // Only initialize if we don't have a player OR it's not ready
          if (!spotifyPlayerRef.current || !spotifyPlayerReady) {
            console.log('🎵 Initializing Spotify player for selected provider');
            try {
              const player = await initializeSpotifyPlayer();
              spotifyPlayerRef.current = player;

              player.addListener('player_state_changed', (state) => {
                if (!state) return;
                if (currentSource === 'playlist' && currentPlaylistProvider === 'spotify') {
                  setIsPlaying(!state.paused);
                }
              });

              setSpotifyPlayerReady(true);
              console.log('🎵 Spotify player ready for use');
            } catch (error) {
              console.error('Failed to initialize Spotify player:', error);
              setError('Spotify player initialization failed');
              setSpotifyPlayerReady(false);
            }
          }
        } else {
          console.log('🎵 Spotify provider selected but not authenticated - waiting for login');
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

        // YouTube player is created on-demand in playPlaylist
        console.log('🎵 YouTube provider selected - player will be created on demand');
      }
    };

    initializeSelectedProvider();
  }, [playlistProvider]);
  // Only run when provider changes
  // Simple manual initialization
  // Update the manual Spotify initialization to give better feedback:
  const manualInitializeSpotifyPlayer = useCallback(async () => {
    console.log('🎵 Manual Spotify player initialization...');

    if (!isSpotifyAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }

    // CRITICAL FIX: Don't reinitialize if already working
    if (spotifyPlayerRef.current && spotifyPlayerReady) {
      console.log('🎵 Spotify player already ready - returning existing player');
      return spotifyPlayerRef.current;
    }

    try {
      console.log('🎵 Starting manual Spotify player creation...');

      // Check AudioContext state first
      if (window.__spotifyAudioContext && window.__spotifyAudioContext.state === 'suspended') {
        console.log('⚠️ AudioContext still suspended - waiting for user interaction');
        setLoadingProgress('Klik ergens om Spotify te activeren...');

        // Wait for AudioContext to resume (with timeout)
        let attempts = 0;
        while (window.__spotifyAudioContext.state === 'suspended' && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }

        if (window.__spotifyAudioContext.state === 'suspended') {
          throw new Error('AudioContext kon niet worden geactiveerd. Klik ergens en probeer opnieuw.');
        }
      }

      setLoadingProgress('Spotify Web Player laden...');
      const player = await initializeSpotifyPlayer();

      // Only update ref and state if we don't already have them
      if (!spotifyPlayerRef.current) {
        spotifyPlayerRef.current = player;
      }

      // Set up the state change listener only once
      if (!spotifyPlayerReady) {
        player.addListener('player_state_changed', (state) => {
          if (!state) return;

          // Only update React state if we're the current source
          if (currentSource === 'playlist' && currentPlaylistProvider === 'spotify') {
            setIsPlaying(!state.paused);
          }
        });

        setSpotifyPlayerReady(true);
        setLoadingProgress(''); // Clear loading message
        console.log('🎵 Manual Spotify initialization complete');
      }

      return player;
    } catch (error) {
      console.error('🎵 Manual Spotify initialization failed:', error);
      setError('Kon Spotify player niet initialiseren: ' + error.message);
      setSpotifyPlayerReady(false);
      setLoadingProgress(''); // Clear loading message
      throw error;
    }
  }, [currentSource, currentPlaylistProvider]);// ← REMOVE: spotifyPlayerReady from dependencies

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
    // Update YouTube volume - WORKING approach
    if (youtubePlayerRef.current && youtubePlayerRef.current.setVolume && currentSource === 'playlist' && currentPlaylistProvider === 'youtube') {
      const youtubeVolume = Math.round(volume * 100);
      try {
        youtubePlayerRef.current.setVolume(youtubeVolume);
        console.log('🔊 Set YouTube volume to:', youtubeVolume);
      } catch (error) {
        console.warn('Could not set YouTube volume:', error);
      }
    }

    // Update radio volume immediately if playing
    if (audioRef.current && currentSource === 'radio' && isPlaying) {
      audioRef.current.volume = volume;
    }

    // Update Spotify volume
    if (currentPlaylistProvider === 'spotify' && spotifyPlayerRef.current && currentSource === 'playlist') {
      const spotifyVolume = Math.round(volume * 100);
      try {
        setSpotifyVolume(spotifyVolume);
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
  }, [currentSource, currentStation, isTransitioning]); const playPlaylist = useCallback(async (playlistId, options = {}) => {
    const provider = options.provider || currentPlaylistProvider;
    console.log('🎵 Starting playlist:', playlistId, 'Provider:', provider);

    setIsTransitioning(true);
    setIsLoading(true);
    setError(null);
    setCurrentSource('playlist');

    try {
      if (provider === 'spotify') {
        console.log('🎵 Starting Spotify playlist');

        if (!isSpotifyAuthenticated()) {
          throw new Error('Please login to Spotify first');
        }

        // SIMPLE ready check - max 5 seconds, no endless waiting
        if (!spotifyPlayerReady || !spotifyPlayerRef.current) {
          console.log('🎵 Waiting briefly for Spotify player...');
          setLoadingProgress('Spotify player laden...');

          let attempts = 0;
          while ((!spotifyPlayerReady || !spotifyPlayerRef.current) && attempts < 25) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
          }

          if (!spotifyPlayerReady || !spotifyPlayerRef.current) {
            throw new Error('Spotify player niet beschikbaar. Herlaad de pagina.');
          }
        }

        // Ensure device is active
        setLoadingProgress('Apparaat activeren...');
        await ensureWebPlaybackDeviceActive();

        setLoadingProgress('Playlist starten...');
        await playSpotifyPlaylist(playlistId, options.shuffle || false);

        await setSpotifyVolume(volume * 100);

        setCurrentPlaylistProvider('spotify');
        setIsPlaying(true);
        setIsLoading(false);
        console.log('🎵 Spotify playlist started successfully');

      } else {
        // NEW: YouTube popup approach
        console.log('🎵 Opening YouTube playlist in popup');

        setLoadingProgress('Opening YouTube player...');

        const success = await popupYouTubePlayer.playPlaylist(playlistId, options);

        if (success) {
          youtubePlayerRef.current = popupYouTubePlayer;
          setCurrentPlaylistProvider('youtube');
          setIsPlaying(true);

          // Set callback for when popup closes
          popupYouTubePlayer.onClose(() => {
            console.log('🎵 YouTube popup closed');
            setIsPlaying(false);
            setCurrentSource(null);
          });

          console.log('🎵 ✅ YouTube popup opened successfully');
        } else {
          throw new Error('Could not open YouTube popup');
        }
      }

    } catch (error) {
      console.error('Failed to load playlist:', error);

      if (error.message.includes('Popup blocked')) {
        setError('❌ Popup geblokkeerd. Sta popups toe voor deze site om YouTube playlists af te spelen.');
      } else {
        const errorMessage = provider === 'spotify'
          ? `Kon Spotify playlist niet laden: ${error.message}`
          : `Kon YouTube playlist niet laden: ${error.message}`;
        setError(errorMessage);
      }

      setIsPlaying(false);
      setCurrentSource(null);
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
    }
  }, [volume, pauseRadioForAdBreak, isTransitioning, currentPlaylistProvider, spotifyPlayerReady]);

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
        // Use the SDK method directly instead of the utility function
        spotifyPlayerRef.current.pause().then(() => {
          console.log('🎵 Spotify paused via SDK');
        }).catch((error) => {
          console.warn('Could not pause Spotify via SDK:', error);
          // Fallback to utility function
          pauseSpotify();
        });
      } else if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.closePopup(); // Close popup = pause
      }
    }
    setIsPlaying(false);
  }, [currentSource, currentPlaylistProvider]);

  const resumeAudio = useCallback(() => {
    if (currentSource === 'radio' && audioRef.current) {
      audioRef.current.play();
    } else if (currentSource === 'playlist') {
      if (currentPlaylistProvider === 'spotify' && spotifyPlayerRef.current) {
        // Use the SDK method directly instead of the utility function
        spotifyPlayerRef.current.resume().then(() => {
          console.log('🎵 Spotify resumed via SDK');
        }).catch((error) => {
          console.warn('Could not resume Spotify via SDK:', error);
          // Fallback to utility function
          resumeSpotify();
        });
      } else if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.resume(); // Reopen popup = resume
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
    // Only initialize Spotify if it's the selected provider AND authenticated AND not already ready
    if (playlistProvider === 'spotify' &&
      isSpotifyAuthenticated() &&
      !spotifyPlayerReady &&
      !spotifyPlayerRef.current &&
      !isSpotifyPlayerInitializing()) { // ← NOW THIS FUNCTION IS IMPORTED
      console.log('🎵 Spotify provider selected and authenticated - initializing player');
      manualInitializeSpotifyPlayer().catch(error => {
        console.error('Spotify initialization failed:', error);
      });
    }
  }, [playlistProvider, manualInitializeSpotifyPlayer]);

  // --- BEGIN: IMPROVED SPOTIFY AUDIOCONTEXT HANDLING ---
  useEffect(() => {
    let audioContext;
    let userInteracted = false;
    let handler;

    // Create AudioContext
    try {
      audioContext = window.AudioContext ? new window.AudioContext() : (window.webkitAudioContext ? new window.webkitAudioContext() : null);
    } catch (e) {
      audioContext = null;
    }

    window.__spotifyAudioContext = audioContext;

    // Check initial state
    if (audioContext) {
      console.log('[Spotify] Initial AudioContext state:', audioContext.state);

      // If suspended, show user that interaction is needed
      if (audioContext.state === 'suspended' && playlistProvider === 'spotify') {
        console.log('🔧 AudioContext suspended - user interaction required for Spotify');

        // Update loading message to be more specific
        if (isSpotifyAuthenticated() && !spotifyPlayerReady) {
          setLoadingProgress('Klik ergens om Spotify te activeren...');
        }
      }
    }

    handler = async () => {
      if (userInteracted) return;
      userInteracted = true;

      console.log('👆 User interaction detected');

      if (audioContext && audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
          console.log('✅ AudioContext resumed after user interaction');

          // Clear the loading message once AudioContext is active
          if (playlistProvider === 'spotify') {
            setLoadingProgress('Spotify player laden...');
          }
        } catch (e) {
          console.warn('[Spotify] Could not resume AudioContext:', e);
        }
      }

      // Try to connect the Spotify player if not already connected
      if (spotifyPlayerRef.current && typeof spotifyPlayerRef.current.connect === 'function') {
        try {
          await spotifyPlayerRef.current.connect();
          console.log('✅ Spotify player connected after user interaction');
        } catch (e) {
          console.warn('[Spotify] Could not connect Spotify player after user interaction:', e);
        }
      }

      // If Spotify is selected and authenticated but not ready, try manual init
      if (playlistProvider === 'spotify' && isSpotifyAuthenticated() && !spotifyPlayerReady) {
        console.log('🔄 Triggering Spotify initialization after user interaction');
        try {
          await manualInitializeSpotifyPlayer();
        } catch (error) {
          console.error('Failed to initialize Spotify after user interaction:', error);
        }
      }
    };

    // Listen for multiple types of user interaction
    const events = ['click', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handler, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handler);
      });
    };
  }, [playlistProvider, manualInitializeSpotifyPlayer]); // Add dependencies
  // --- END: IMPROVED SPOTIFY AUDIOCONTEXT HANDLING ---

  // --- BEGIN: EXPOSE AUDIOCONTEXT STATE FOR DIAGNOSTICS ---
  useEffect(() => {
    if (window.__spotifyAudioContext) {
      window.spotifyAudioContextState = window.__spotifyAudioContext.state;
      console.log('[Spotify] AudioContext state:', window.__spotifyAudioContext.state);
    }
  }, [spotifyPlayerReady]);
  // --- END: EXPOSE AUDIOCONTEXT STATE ---

  // --- BEGIN: PATCH REACT STATE UPDATE RACE CONDITIONS ---
  // Always update a ref with the latest spotifyPlayerReady value
  const spotifyPlayerReadyRef = useRef(spotifyPlayerReady);
  useEffect(() => {
    spotifyPlayerReadyRef.current = spotifyPlayerReady;
  }, [spotifyPlayerReady]);
  // After any ready/state_changed event, force a re-render
  // (already handled in setSpotifyPlayerReadyDebug)
  // --- END: PATCH REACT STATE UPDATE RACE CONDITIONS ---

  // Add this effect to watch for authentication changes
  useEffect(() => {
    // Only initialize Spotify if it's the selected provider AND authenticated AND not already ready
    if (playlistProvider === 'spotify' &&
      isSpotifyAuthenticated() &&
      !spotifyPlayerReady &&
      !spotifyPlayerRef.current &&
      !isSpotifyPlayerInitializing()) { // ← FIXED: Use the imported function
      console.log('🎵 Spotify provider selected and authenticated - initializing player');
      manualInitializeSpotifyPlayer().catch(error => {
        console.error('Spotify initialization failed:', error);
      });
    }
  }, [playlistProvider, manualInitializeSpotifyPlayer]);

  // Add this effect to useAudioPlayer to prevent stuck loading states:
  useEffect(() => {
    // Safety timeout to prevent stuck loading states
    if (isLoading || isTransitioning) {
      const safetyTimeout = setTimeout(() => {
        console.warn('🛡️ Safety timeout triggered - clearing stuck loading states');
        setIsLoading(false);
        setIsTransitioning(false);

        if (window.addNotification) {
          window.addNotification('⚠️ Timeout - probeer opnieuw als er geen audio is', 'warning', 4000);
        }
      }, 15000); // 15 second safety timeout

      return () => clearTimeout(safetyTimeout);
    }
  }, [isLoading, isTransitioning]);

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
  };
};

