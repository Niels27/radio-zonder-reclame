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
import { AdSkipUtils } from '../utils/adSkipUtils.js';
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

export const useAudioPlayer = (playlistProvider = 'spotify') => {
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
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0); // Add a force update state to useAudioPlayer
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
  // Update volume when it changes - ALSO apply to currently playing audio
  useEffect(() => {
    // Apply volume to active audio source
    if (volume !== undefined) {
      if (currentSource === 'radio' && audioRef.current) {
        audioRef.current.volume = volume;
      } else if (currentSource === 'playlist') {
        if (currentPlaylistProvider === 'spotify' && spotifyPlayerRef.current) {
          import('../utils/spotifyUtils').then(({ setSpotifyVolume }) => {
            setSpotifyVolume(Math.round(volume * 100));
          });
        } else if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
          youtubePlayerRef.current.setVolume(Math.round(volume * 100));
        }
      }
    }
  }, [volume, currentSource, isPlaying, currentPlaylistProvider]);

  // ✅ NEW: Add this useEffect to sync volume when audio loads:
  useEffect(() => {
    // Sync volume whenever audio element changes or loads
    if (audioRef.current) {
      audioRef.current.volume = volume;
      //console.log(`🔊 Synced audio volume to ${Math.round(volume * 100)}%`);
    }
  }, [volume]); // Dependencies: volume changes
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

      // ✅ CRITICAL FIX: Don't show errors during ad breaks or intentional stops
      if (!isIntentionalStopRef.current &&
        !isTransitioningRef.current &&
        !window.isAdBreakActive && // ← ADD THIS
        audioRef.current?.src) {

        // Only show error if we have a current station and it's radio
        if (currentStationRef.current && currentSourceRef.current === 'radio') {
          setError(`Verbinding met ${currentStationRef.current.name} verloren. Probeer een andere zender.`);
        } else {
          setError('Audio playback failed. Please try again.');
        }
      } else {
        console.log('🎧 Audio error suppressed (intentional stop/transition/ad break)');
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



  // ALSO REMOVE this duplicate effect that's causing the race condition:
  /*
  useEffect(() => {
    // Only initialize Spotify if it's the selected provider AND authenticated AND not already ready
    if (playlistProvider === 'spotify' &&
      isSpotifyAuthenticated() &&
      !spotifyPlayerReady &&
      !spotifyPlayerRef.current &&
      !isSpotifyPlayerInitializing()) {
      console.log('🎵 Spotify provider selected and authenticated - initializing player');
      manualInitializeSpotifyPlayer().catch(error => {
        console.error('Spotify initialization failed:', error);
      });
    }
  }, [playlistProvider, manualInitializeSpotifyPlayer]);
  */

  // SIMPLIFY the manual initialization to prevent duplicate calls:
  // SIMPLIFY the manual initialization to prevent duplicate calls:
  // CRITICAL FIX: Update the manual initialization to force component re-render
  const manualInitializeSpotifyPlayer = useCallback(async () => {
    console.log('🎵 Manual Spotify player initialization...');

    if (!isSpotifyAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }

    // CRITICAL FIX: Don't reinitialize if already working OR already initializing
    if ((spotifyPlayerRef.current && spotifyPlayerReady) || isSpotifyPlayerInitializing()) {
      console.log('🎵 Spotify player already ready or initializing - returning existing player');
      return spotifyPlayerRef.current;
    }

    try {
      console.log('🎵 Starting manual Spotify player creation...');

      const player = await initializeSpotifyPlayer();

      // ✅ CRITICAL FIX: ALWAYS update React state when we get a working player
      if (player) {
        console.log('🎵 ✅ Manual Spotify player created successfully - updating React state');

        // Set the player reference
        spotifyPlayerRef.current = player;

        // ✅ ALWAYS set ready state immediately when manual init completes
        setSpotifyPlayerReady(true);
        console.log('🎵 ✅ Manual Spotify initialization complete - state updated');

        // Add state change listener if not already added
        if (!spotifyPlayerReady) {
          player.addListener('player_state_changed', (state) => {
            if (!state) return;
            if (currentSource === 'playlist' && currentPlaylistProvider === 'spotify') {
              setIsPlaying(!state.paused);
            }
          });
        }

        // ✅ CRITICAL FIX: Force global update and component re-render
        setTimeout(() => {
          console.log('🎵 ✅ Forcing component re-render after manual initialization');
          setForceUpdateCounter(prev => prev + 1);

          // Update global state
          window.dispatchEvent(new CustomEvent('spotifyPlayerReady', {
            detail: {
              ready: true,
              provider: currentPlaylistProvider,
              manual: true
            }
          }));

          // Force a state change to trigger all component re-renders
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
  }, [currentSource, currentPlaylistProvider, spotifyPlayerReady]); // Keep spotifyPlayerReady in dependencies
  // Initialize only the selected provider's player
  // Add automatic recovery mechanism in the useEffect
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

        // CRITICAL FIX: Only initialize if authenticated AND not already ready/initializing
        if (isSpotifyAuthenticated() && !spotifyPlayerReady && !spotifyPlayerRef.current && !isSpotifyPlayerInitializing()) {
          console.log('🎵 Initializing Spotify player for selected provider');
          try {
            const player = await initializeSpotifyPlayer();

            // ✅ CRITICAL FIX: Ensure we update the React state when player becomes ready
            if (player && spotifyDeviceId) {
              spotifyPlayerRef.current = player;

              // Add state change listener if not already added
              if (!spotifyPlayerReady) {
                player.addListener('player_state_changed', (state) => {
                  if (!state) return;
                  if (currentSource === 'playlist' && currentPlaylistProvider === 'spotify') {
                    setIsPlaying(!state.paused);
                  }
                });

                // ✅ CRITICAL FIX: Set ready state immediately when we have a working player
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
          console.log('🎵 Spotify player already ready - no action needed');
        } else if (!isSpotifyAuthenticated()) {
          console.log('🎵 Spotify provider selected but not authenticated - waiting for login');
        } else if (isSpotifyPlayerInitializing()) {
          console.log('🎵 Spotify player already initializing - waiting...');

          // ✅ ADD RECOVERY: If stuck initializing for too long, reset and retry
          setTimeout(() => {
            if (isSpotifyPlayerInitializing() && !spotifyPlayerReady) {
              console.warn('🔧 Spotify initialization seems stuck - attempting recovery...');

              // Force reset initialization state
              if (window.spotifyUtils) {
                window.spotifyUtils.resetInitializationState?.();
              }

              // ✅ NOW we can use the function because it's declared above
              manualInitializeSpotifyPlayer().catch(error => {
                console.error('Recovery attempt failed:', error);
              });
            }
          }, 10000); // Wait 10 seconds before recovery attempt
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

      setIsIntentionalStop(false);
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
        console.log('🚫 Connection was canceled, not setting audio source');
        return;
      }

      console.log('🎵 Setting audio source to:', workingUrl);
      audioRef.current.src = workingUrl;
      audioRef.current.volume = volume;

      // Find the handleCanPlay function around line 713 and update it:

      // Update the handleCanPlay function around line 713:

      // ✅ ENHANCED: Set up event handlers with improved auto-skip timing
      const handleCanPlay = async () => {
        console.log('🎵 Audio can play - checking pre-roll skip options');

        // ✅ FIX: Use volumeRef.current instead of volume
        if (audioRef.current) {
          audioRef.current.volume = volumeRef.current;
          console.log(`🔊 Volume set to ${Math.round(volumeRef.current * 100)}% on canplay`);
        }

        const isAutoSkipEnabled = AdSkipUtils.getAutoSkipSetting();
        const shouldOfferSkip = AdSkipUtils.shouldOfferPrerollSkip(workingUrl, effectiveStationData.name);

        if (shouldOfferSkip) {
          console.log('🎵 Commercial station detected - handling pre-roll skip');

          if (isAutoSkipEnabled) {
            console.log('🤖 Auto pre-roll skip enabled - starting intelligent skip');

            // Show the button briefly (will auto-click)
            const skipButton = AdSkipUtils.createPrerollSkipButton(
              audioRef.current,
              () => {
                console.log('🤖 Auto pre-roll skip triggered');
                if (window.addNotification) {
                  window.addNotification('🔇 Pre-roll reclame automatisch overgeslagen', 'success', 2000);
                }
              },
              true // isAutoSkip = true
            );

            // ✅ IMPROVED: Wait for audio to actually start playing before attempting skip
            const performIntelligentSkip = async () => {
              try {
                // Wait for audio to start playing naturally
                let attempts = 0;
                const maxAttempts = 15; // 3 seconds max wait

                while (attempts < maxAttempts) {
                  if (audioRef.current.currentTime > 0.1 && !audioRef.current.paused) {
                    console.log(`🎵 Audio started playing at ${audioRef.current.currentTime.toFixed(3)}s - initiating skip`);
                    break;
                  }
                  await new Promise(resolve => setTimeout(resolve, 200));
                  attempts++;
                }

                if (attempts >= maxAttempts) {
                  console.log('⚠️ Audio didn\'t start playing naturally - skipping anyway');
                }

                // Now perform the intelligent skip
                await AdSkipUtils.skipPrerollSilently(audioRef.current, 15);

              } catch (error) {
                console.error('❌ Intelligent skip failed:', error);
                // Ensure audio is audible if skip fails
                if (audioRef.current && audioRef.current.volume === 0) {
                  audioRef.current.volume = 0.7;
                }
              }
            };

            // Start the intelligent skip process
            performIntelligentSkip();

          } else {
            console.log('👆 Manual pre-roll skip - showing button for user interaction');

            // Manual mode - show button for full duration
            AdSkipUtils.createPrerollSkipButton(
              audioRef.current,
              () => {
                console.log('👆 Manual pre-roll skip triggered');
                if (window.addNotification) {
                  window.addNotification('⏭️ Pre-roll reclame overgeslagen', 'success', 2000);
                }
              },
              false // isAutoSkip = false
            );
          }
        }

        setIsLoading(false);
      };

      const handlePlay = () => {
        // ✅ FIX: Ensure volume is correct when play event fires
        if (audioRef.current) {
          audioRef.current.volume = volumeRef.current;
          console.log(`🔊 Volume ensured at ${Math.round(volumeRef.current * 100)}% on play`);
        }
        setIsPlaying(true);
        console.log('🎵 Audio play event fired');
      };

      // Set up event listeners
      audioRef.current.addEventListener('canplay', handleCanPlay, { once: true });
      audioRef.current.addEventListener('play', handlePlay, { once: true });

      // ✅ CRITICAL: Enhanced audio play with pre-roll consideration
      try {
        await audioRef.current.play();
        console.log('🎵 Audio.play() succeeded');

        // ✅ ENHANCED: For auto-skip stations, wait for skip to complete before declaring ready
        const isAutoSkipEnabled = AdSkipUtils.getAutoSkipSetting();
        const shouldOfferSkip = AdSkipUtils.shouldOfferPrerollSkip(workingUrl, effectiveStationData.name);

        if (shouldOfferSkip && isAutoSkipEnabled) {
          console.log('🤖 Waiting for auto pre-roll skip to complete...');
          // Wait longer for auto-skip to complete
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              if (audioRef.current && !audioRef.current.paused) {
                resolve();
              } else {
                reject(new Error('Audio stopped during auto pre-roll skip'));
              }
            }, 3000); // 3 seconds for auto-skip completion

            // Clear timeout if canceled
            if (connectionAttempt.cancel) {
              clearTimeout(timeout);
              reject(new Error('Connection canceled'));
            }
          });
        } else {
          // Normal validation wait
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              if (audioRef.current && !audioRef.current.paused) {
                resolve();
              } else {
                reject(new Error('Audio stream validation failed'));
              }
            }, 1500);

            if (connectionAttempt.cancel) {
              clearTimeout(timeout);
              reject(new Error('Connection canceled'));
            }
          });
        }

        setIsPlaying(true);
        setIsLoading(false);
        setLoadingProgress('');
        setCurrentConnectionAttempt(null);
        setCurrentSource('radio');

      } catch (playError) {
        console.error('🎵 Audio.play() or validation failed:', playError);
        throw new Error(`Failed to start playback: ${playError.message}`);
      }

    } catch (error) {
      // Clear timeout on error
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }

      if (connectionAttempt.cancel) {
        console.log('🚫 Connection was canceled during error handling');
        return;
      }

      console.log(`❌ Failed to play ${effectiveStationData.name}:`, error);

      // ✅ CRITICAL FIX: Make sure we throw the error so it propagates
      setIsLoading(false);
      setLoadingProgress('Verbinding mislukt');
      setCurrentConnectionAttempt(null);
      setError(`Kan ${effectiveStationData.name} niet afspelen: ${error.message}`);

      // Keep the station data so the report button can access it
      setTimeout(() => {
        if (!audioPlayer.isPlaying) {
          setCurrentStation(null);
        }
      }, 10000);

      // ✅ CRITICAL FIX: Re-throw the error so nonstop mode can catch it
      throw error;
    }
  }, [currentConnectionAttempt, volume, isTransitioning, playlistProvider]);

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

    console.log('🎵 Resuming radio from ad break with state restoration');
    setIsTransitioning(true);

    // Try to restore from saved state first
    const savedState = localStorage.getItem('pausedRadioState');
    if (savedState) {
      try {
        const radioState = JSON.parse(savedState);
        console.log('🎵 Restoring radio from saved state:', radioState);

        setCurrentStation(radioState.station);
        setCurrentSource('radio');

        if (audioRef.current && radioState.src) {
          audioRef.current.src = radioState.src;
          audioRef.current.volume = radioState.volume || volume;

          audioRef.current.play().then(() => {
            setIsPlaying(true);
            console.log('🎵 Radio resumed successfully from saved state');
          }).catch(error => {
            console.log('🎵 Saved stream expired, restarting station:', error);
            playRadio(radioState.station);
          });
        }

        // Clear saved state after use
        localStorage.removeItem('pausedRadioState');

      } catch (error) {
        console.error('🎵 Error restoring radio state:', error);
      }
    } else if (audioRef.current && isRadioPausedForAdBreak && pausedRadioStation) {
      // Fallback to previous method
      console.log('🎵 Using fallback resume method for:', pausedRadioStation.name);

      setCurrentStation(pausedRadioStation);
      setCurrentSource('radio');

      audioRef.current.play().then(() => {
        setIsPlaying(true);
        console.log('🎵 Radio resumed with fallback method');
      }).catch(error => {
        console.log('🎵 Stream expired, restarting:', error);
        playRadio(pausedRadioStation);
      });
    } else {
      console.warn('🎵 No paused radio station to resume');
    }

    // Always clean up ad break state
    setTimeout(() => {
      setIsRadioPausedForAdBreak(false);
      setPausedRadioStation(null);
      setIsTransitioning(false);
    }, 1000);

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
  // STOP RADIO - Clean stop for radio only
  const stopRadio = useCallback(() => {
    console.log('🛑 Stopping radio playback');

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

  useEffect(() => {
    // Enhanced global state synchronization
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

      // Trigger custom events for components that need to react
      window.dispatchEvent(new CustomEvent('audioStateChanged', {
        detail: window.audioPlayerState
      }));
    };

    updateGlobalState();
  }, [isPlaying, currentSource, currentStation, isRadioPausedForAdBreak, pausedRadioStation, spotifyPlayerReady, isTransitioning]);



  // Clean pause radio for ad break - SIMPLIFIED

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
          await spotifyPlayerRef.current.pause();
          console.log('🎵 Stopped existing Spotify playlist');
        } catch (error) {
          console.warn('Could not stop Spotify:', error);
        }
      }

      if (currentPlaylistProvider === 'youtube' && youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.closePopup('replaced');
          console.log('🎵 Stopped existing YouTube playlist');
        } catch (error) {
          console.warn('Could not stop YouTube:', error);
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

        // ✅ FIX: Better Spotify player availability check
        if (!spotifyPlayerRef.current || !spotifyPlayerReady) {
          console.log('🎵 Spotify player not ready - attempting manual initialization...');
          try {
            await manualInitializeSpotifyPlayer();
            // Wait a bit more for player to be fully ready
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (initError) {
            console.error('Failed to initialize Spotify player:', initError);
            throw new Error('Kon Spotify player niet initialiseren. Probeer opnieuw.');
          }
        }

        console.log('🎵 Waiting briefly for Spotify player...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // ✅ FIX: More robust player availability check
        let attempts = 0;
        const maxAttempts = 10;

        while ((!spotifyPlayerRef.current || !window.audioPlayer?.spotifyPlayerReady) && attempts < maxAttempts) {
          console.log(`🎵 Waiting for Spotify player... attempt ${attempts + 1}/${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }

        // ✅ FIX: Final check with better error message
        if (!spotifyPlayerRef.current || !window.audioPlayer?.spotifyPlayerReady) {
          console.error('🎵 Spotify player still not available after waiting');
          throw new Error('Spotify player is nog niet klaar. Wacht even en probeer opnieuw.');
        }

        // ✅ FIX: Extract playlist ID from public URL if needed
        let actualPlaylistId = playlistId;
        if (typeof playlistId === 'string' && playlistId.includes('open.spotify.com')) {
          const match = playlistId.match(/playlist\/([a-zA-Z0-9]+)/);
          if (match) {
            actualPlaylistId = match[1];
            console.log('🎵 Extracted playlist ID from URL:', actualPlaylistId);
          } else {
            throw new Error('Kon playlist ID niet extraheren uit URL');
          }
        }

        // ✅ FIX: Use the Spotify utils function for playing
        const { playSpotifyPlaylist } = await import('../utils/spotifyUtils');
        await playSpotifyPlaylist(actualPlaylistId, options.shuffle || false);

        console.log('🎵 Spotify playlist gestart');

        if (window.addNotification) {
          window.addNotification('🎵 Spotify playlist gestart', 'success', 2000);
        }
      } else {
        // Enhanced YouTube popup with ad break integration
        console.log('🎵 Opening YouTube playlist in popup');

        setLoadingProgress('YouTube player openen...');

        // Pass ad break duration for auto-close
        const enhancedOptions = {
          ...options,
          // If we're in an ad break, pass the remaining time for auto-close
          autoCloseDuration: window.isAdBreakActive && window.currentAdBreakTimeLeft
            ? Math.ceil(window.currentAdBreakTimeLeft / 60)
            : options.duration
        };

        const success = await popupYouTubePlayer.playPlaylist(playlistId, enhancedOptions);

        if (success) {
          youtubePlayerRef.current = popupYouTubePlayer;
          setCurrentPlaylistProvider('youtube');
          setIsPlaying(true);

          // ✅ FIX: Sync initial volume and shuffle state
          youtubePlayerRef.current.setVolume(volume * 100);
          youtubePlayerRef.current.setShuffle(options.shuffle || false);

          // Enhanced callback for ad break integration
          popupYouTubePlayer.onClose((reason) => {
            console.log('🎵 YouTube popup closed, reason:', reason);
            setIsPlaying(false);
            setCurrentSource(null);

            if (reason === 'ad_break_ended') {
              console.log('🎵 YouTube popup auto-closed - ad break ended');
            } else if (reason === 'user_close') {
              console.log('🎵 User manually closed YouTube popup');
              if (window.addNotification) {
                window.addNotification('🎵 YouTube muziek gestopt', 'info', 2000);
              }
            }
          });

          console.log('🎵 ✅ YouTube popup opened successfully');
        } else {
          throw new Error('Could not open YouTube popup');
        }
      }

      setCurrentSource('playlist');
    } catch (error) {
      console.error('Failed to load playlist:', error);
      setError(`Kon playlist niet laden: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
    }
  }, [volume, pauseRadioForAdBreak, isTransitioning, currentPlaylistProvider, spotifyPlayerReady, currentSource, isRadioPausedForAdBreak, manualInitializeSpotifyPlayer]);

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
    setCurrentSource(null); // ✅ FIX: Clear source when pausing
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

  // ✅ CRITICAL FIX: ADD THE MISSING RETURN STATEMENT
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

  // Add this useEffect to listen for late Spotify ready events
  useEffect(() => {
    const handleLateSpotifyReady = (event) => {
      console.log('🎵 ✅ Late Spotify ready event received:', event.detail);

      if (playlistProvider === 'spotify' && !spotifyPlayerReady) {
        console.log('🎵 ✅ Updating React state for late Spotify ready');

        spotifyPlayerRef.current = event.detail.player;
        setSpotifyPlayerReady(true);

        // Clear any error
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

  // Add this useEffect to force UI updates when Spotify becomes ready
  useEffect(() => {
    if (spotifyPlayerReady && playlistProvider === 'spotify') {
      console.log('🎵 ✅ Forcing UI update - Spotify is ready');

      // Force re-render by updating a dummy state
      setTimeout(() => {
        // Trigger global state update
        window.dispatchEvent(new CustomEvent('spotifyPlayerReady', {
          detail: { ready: true, provider: playlistProvider }
        }));

        // Clear any error
        setError(null);
      }, 100);
    }
  }, [spotifyPlayerReady, playlistProvider]);

  // Add this enforcement function
  // Replace the enforceAudioGlobally function:
  const enforceAudioGlobally = useCallback(() => {
    console.log('🔍 Enforcing global audio state...');

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
      if (!video.paused && !video.closest('.lofi-overlay')) { // Don't stop lofi overlay videos
        console.warn(`🚨 Found orphaned playing video element ${index}, stopping it`);
        video.pause();
      }
    });

    // ✅ CRITICAL FIX: Only check Spotify if it's actually playing AND shouldn't be
    if (window.Spotify && window.Spotify.Player && spotifyPlayerRef.current) {
      // Only pause if Spotify is actually playing AND we're not supposed to have playlist active
      if (currentSource !== 'playlist' && currentSource !== null) {
        // Check if Spotify is actually playing before pausing
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
  }, [currentSource]); // ✅ Remove spotifyPlayerRef from dependencies to prevent unnecessary re-creation

  // Run enforcement periodically
  useEffect(() => {
    const interval = setInterval(enforceAudioGlobally, 5000); // Every 5 seconds
    return () => clearInterval(interval);
  }, [enforceAudioGlobally]);

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
    nextTrack,
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
    forceUpdateCounter, // ✅ Add this
  };
}; // ✅ CLOSE THE useAudioPlayer FUNCTION



