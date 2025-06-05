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
  playSpotifyPlaylist, 
  pauseSpotify, 
  resumeSpotify, 
  nextSpotifyTrack, 
  setSpotifyVolume, 
  setSpotifyShuffleMode,
  isSpotifyAuthenticated,
  getSpotifyPlaybackState
} from '../utils/spotifyUtils';

export const useAudioPlayer = () => {
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7); // Initial volume
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(''); // ← ADD THIS MISSING STATE
  const [error, setError] = useState(null);
  const [currentSource, setCurrentSource] = useState(null); // 'radio' or 'playlist' or null
  const [isIntentionalStop, setIsIntentionalStop] = useState(false);
  const [isRadioPausedForAdBreak, setIsRadioPausedForAdBreak] = useState(false);
  const [pausedRadioStation, setPausedRadioStation] = useState(null); // Remember what we paused
  const [isTransitioning, setIsTransitioning] = useState(false); // Prevent overlapping transitions
  const [connectionTimeout, setConnectionTimeout] = useState(null);
  const [currentConnectionAttempt, setCurrentConnectionAttempt] = useState(null);
  // Add Spotify-specific state
  const [currentPlaylistProvider, setCurrentPlaylistProvider] = useState('youtube'); // 'youtube' or 'spotify'
  const [spotifyPlayerReady, setSpotifyPlayerReady] = useState(false);

  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const spotifyPlayerRef = useRef(null); // Add Spotify player ref
  const timeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);

  // Refs to hold the latest state for use in event handlers of the initialization useEffect
  const currentStationRef = useRef(currentStation);
  const isIntentionalStopRef = useRef(isIntentionalStop);
  const isTransitioningRef = useRef(isTransitioning);
  const isPlayingRef = useRef(isPlaying); // To check current playing status in stalled event

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

  // Initialize Spotify player when authenticated
  useEffect(() => {
    const initSpotify = async () => {
      if (isSpotifyAuthenticated() && !spotifyPlayerReady) {
        try {
          console.log('🎵 Initializing Spotify player...');
          setIsLoading(true);
          setLoadingProgress('Spotify verbinding maken...');
          
          const player = await initializeSpotifyPlayer();
          spotifyPlayerRef.current = player;
          setSpotifyPlayerReady(true);
          
          console.log('🎵 Spotify player ready');
          setIsLoading(false);
          setLoadingProgress('');
        } catch (error) {
          console.error('Failed to initialize Spotify player:', error);
          setError('Kon Spotify player niet initialiseren: ' + error.message);
          setIsLoading(false);
          setLoadingProgress('');
        }
      }
    };

    initSpotify();
  }, [spotifyPlayerReady]);

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
            const playlistId = playlistUrl.match(/[?&]list=([^#\&\?]*)/)?.[1];
            if (playlistId) {
              console.log('🎵 AGGRESSIVE: Starting playlist during active ad break - ID:', playlistId);
              
              await playPlaylist(playlistId, {
                shuffle: window.playlistShuffle || false,
                repeat: 'all'
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
        
        if (!spotifyPlayerReady || !spotifyPlayerRef.current) {
          throw new Error('Spotify player not ready. Please login to Spotify first.');
        }

        setLoadingProgress('Spotify playlist starten...');
        await playSpotifyPlaylist(playlistId, options.shuffle || false);
        
        // Set volume for Spotify
        await setSpotifyVolume(volume * 100);
        
        setCurrentPlaylistProvider('spotify');
        console.log('🎵 Spotify playlist started successfully');
        } else {
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
  const resumeAudio = useCallback(() => {
    // Check if ad break is active and force playlist if needed
    if (window.isAdBreakActive && window.playlistUrl) {
      console.log('🎵 Resume during ad break - ensuring playlist is playing');
      
      const playlistId = window.playlistUrl.match(/[?&]list=([^#\&\?]*)/)?.[1];
      if (playlistId && (!youtubePlayerRef.current || currentSource !== 'playlist')) {
        // Playlist not loaded or not current source - start it
        try {
          playPlaylist(playlistId, {
            shuffle: window.playlistShuffle || false,
            repeat: 'all'
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
    } else {
      // If ad break is active and no source is playing, force playlist
      if (window.isAdBreakActive && !currentSource && window.playlistUrl) {
        console.log('🎵 Play button during ad break with no source - forcing playlist');
        
        const playlistId = window.playlistUrl.match(/[?&]list=([^#\&\?]*)/)?.[1];
        if (playlistId) {
          try {
            playPlaylist(playlistId, {
              shuffle: window.playlistShuffle || false,
              repeat: 'all'
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
  return {
    currentStation,
    isPlaying,
    volume,
    isLoading,
    loadingProgress, // ← ADD THIS TO THE RETURN
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
    forceStopAllAudio,
    connectionTimeout,
    abortConnection,
    stopRadio,
    currentPlaylistProvider,
    spotifyPlayerReady
  };
};