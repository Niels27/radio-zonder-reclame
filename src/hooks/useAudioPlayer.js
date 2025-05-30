// hooks/useAudioPlayer.js - Better error handling
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\hooks\useAudioPlayer.js

import { useState, useRef, useEffect, useCallback } from 'react';
import { loadYouTubeAPI, createYouTubePlayer } from '../utils/youtubeUtils';
import { StreamProxy } from '../utils/streamProxy.js';

export const useAudioPlayer = () => {
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7); // Initial volume
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSource, setCurrentSource] = useState(null); // 'radio' or 'playlist' or null
  const [isIntentionalStop, setIsIntentionalStop] = useState(false);
  const [isRadioPausedForAdBreak, setIsRadioPausedForAdBreak] = useState(false);
  const [pausedRadioStation, setPausedRadioStation] = useState(null); // Remember what we paused
  const [isTransitioning, setIsTransitioning] = useState(false); // Prevent overlapping transitions
  const [connectionTimeout, setConnectionTimeout] = useState(null);

  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const timeoutRef = useRef(null);

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

  // NUCLEAR RESET - Completely stop everything and reset all states
  const abortConnection = useCallback(() => {
    console.log('🛑 NUCLEAR RESET - Stopping everything');
    
    // Clear ALL timeouts first
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
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
    
    // Reset ALL states to initial values
    setIsLoading(false);
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
  }, []);

  // Define playRadio - FIXED volume handling
  const playRadio = useCallback(async (stationData) => {
    if (!audioRef.current || !stationData) return;
    
    // Only queue if ad break is active AND timer is running
    if (window.isAdBreakActive && window.queueStationSwitch && window.isTimerRunning) {
      console.log('🎵 Ad break active - queueing station switch');
      window.queueStationSwitch(stationData);
      return;
    }
    
    if (isTransitioning) {
      console.log('🎵 Currently transitioning, ignoring radio play request');
      return;
    }
    
    console.log('🎵 Playing radio:', stationData.name);
    setIsTransitioning(true);
    setIsIntentionalStop(true);
    setConnectionTimeout(null);
    
    // Clear any existing timeout first
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Set 12-second timeout with proper cleanup
    const timeoutId = setTimeout(() => {
      console.log('⏰ Connection timeout reached for:', stationData.name);
      
      // Only trigger timeout if we're still trying to connect to THIS station
      if (audioRef.current && timeoutRef.current === timeoutId) {
        audioRef.current.pause();
        audioRef.current.src = '';
        
        setIsLoading(false);
        setIsTransitioning(false);
        setIsIntentionalStop(false);
        setConnectionTimeout('Verbinding duurde te lang');
        setError(`Verbinding met ${stationData.name} duurde te lang. Probeer opnieuw.`);
        timeoutRef.current = null;
      }
    }, 12000);
    
    timeoutRef.current = timeoutId;
    
    // Stop YouTube player if it exists
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.pauseVideo();
      } catch (error) {
        console.warn('Could not stop YouTube player:', error);
      }
    }
    
    // Wait a moment for any ongoing operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Reset states
    setIsRadioPausedForAdBreak(false);
    setPausedRadioStation(null);
    setIsLoading(true); // We are now intentionally loading
    setError(null);
    setCurrentStation(stationData);
    setCurrentSource('radio');
    
    try {
      const workingUrl = await StreamProxy.findWorkingStream(
        stationData.url,
        (progress) => console.log(`🔍 ${stationData.name}: ${progress}`)
      );
      
      // Check if timeout happened during stream finding
      if (timeoutRef.current !== timeoutId) {
        console.log('🛑 Timeout occurred during stream search, aborting');
        return;
      }
      
      console.log('🎵 Setting audio source to:', workingUrl);
      audioRef.current.src = workingUrl;
      
      // Add a small delay before playing - helps some browsers/streams
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check timeout again before playing
      if (timeoutRef.current !== timeoutId) {
        console.log('🛑 Timeout occurred before play, aborting');
        return;
      }
      
      console.log('🎵 Attempting to play...');
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        await playPromise;
        console.log('🎵 Play promise resolved. Setting isPlaying to true.');
        
        // Clear timeout on success - but only if it's still the same timeout
        if (timeoutRef.current === timeoutId) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        setIsPlaying(true);
        
        localStorage.setItem('lastPlayedStation', JSON.stringify({
          name: stationData.name,
          url: workingUrl
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to play ${stationData.name}:`, error);
        // Clear timeout on error - but only if it's still the same timeout
      if (timeoutRef.current === timeoutId) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      setError(`Kan ${stationData.name} niet afspelen. Probeer een andere zender.`);
      // Don't clear current station immediately - keep it for error reporting
      // setCurrentStation(null);
      // setCurrentSource(null);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
      setIsIntentionalStop(false);
      setConnectionTimeout(null);
    }
  }, [isTransitioning]);

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
    console.log('🔊 Updating volume to:', volume);
    
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
        console.log('🔊 Set YouTube volume to:', youtubeVolume);
      } catch (error) {
        console.warn('Could not set YouTube volume:', error);
      }
    }
  }, [volume, currentSource, isPlaying]);

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
  }, [currentSource, currentStation, isTransitioning]);

  const playPlaylist = useCallback(async (playlistId, options = {}) => {
    if (!playlistId) return;
    
    if (isTransitioning) {
      console.log('🎵 Currently transitioning, ignoring playlist play request');
      return;
    }
    
    console.log('🎵 Starting playlist - FORCING source switch');
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
      }
      
      await loadYouTubeAPI();
      
      if (!youtubePlayerRef.current) {
        let youtubeDiv = document.getElementById('youtube-player');
        if (!youtubeDiv) {
          youtubeDiv = document.createElement('div');
          youtubeDiv.id = 'youtube-player';
          youtubeDiv.style.display = 'none';
          youtubeDiv.style.position = 'absolute';
          youtubeDiv.style.top = '-9999px';
          youtubeDiv.style.left = '-9999px';
          document.body.appendChild(youtubeDiv);
        }
        
        youtubePlayerRef.current = await createYouTubePlayer('youtube-player', playlistId, {
          playerVars: {
            autoplay: 1,
            loop: options.repeat === 'all' || options.repeat === 'one' ? 1 : 0,
            shuffle: options.shuffle ? 1 : 0
          },
          onReady: (event) => {
            const targetVolume = Math.round(volume * 100);
            event.target.setVolume(targetVolume);
            console.log('🔊 Set YouTube volume on ready:', targetVolume);
            setIsLoading(false);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              const targetVolume = Math.round(volume * 100);
              event.target.setVolume(targetVolume);
              setIsPlaying(true);
              setIsLoading(false);
              console.log('🎵 YouTube playlist now playing at volume:', targetVolume);
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
          onError: (event) => {
            console.error('YouTube player error:', event);
            setError('Kon YouTube playlist niet laden');
            setIsLoading(false);
            setIsTransitioning(false);
          }
        });
      } else {
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
      
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Failed to load YouTube playlist:', error);
      setError('Failed to load YouTube playlist');
      setIsPlaying(false);
      // Reset source if playlist fails
      setCurrentSource(null);
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
    }
  }, [volume, pauseRadioForAdBreak, isTransitioning]);

  const pauseAudio = useCallback(() => {
    if (currentSource === 'radio' && audioRef.current) {
      audioRef.current.pause();
    } else if (currentSource === 'playlist' && youtubePlayerRef.current) {
      youtubePlayerRef.current.pauseVideo();
    }
    setIsPlaying(false);
  }, [currentSource]);

  const resumeAudio = useCallback(() => {
    if (currentSource === 'radio' && audioRef.current) {
      audioRef.current.play().catch(() => {
        setError('Failed to resume radio');
      });
    } else if (currentSource === 'playlist' && youtubePlayerRef.current) {
      youtubePlayerRef.current.playVideo();
    }
    setIsPlaying(true);
  }, [currentSource]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  }, [isPlaying, pauseAudio, resumeAudio]);

  const toggleShuffle = useCallback((enabled) => {
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.setShuffle(enabled);
        console.log(`Shuffle ${enabled ? 'enabled' : 'disabled'}`);
      } catch (error) {
        console.error('Error toggling shuffle:', error);
      }
    }
  }, []);

  return {
    currentStation,
    isPlaying,
    volume,
    isLoading,
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
    toggleShuffle,
    pauseRadioForAdBreak,
    resumeRadioFromAdBreak,
    isRadioPausedForAdBreak,
    pausedRadioStation,
    forceStopAllAudio,
    connectionTimeout,
    abortConnection
  };
};