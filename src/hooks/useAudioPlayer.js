import { useState, useRef, useEffect, useCallback } from 'react';
import { loadYouTubeAPI, createYouTubePlayer } from '../utils/youtubeUtils';
import { StreamProxy } from '../utils/streamProxy.js';

export const useAudioPlayer = () => {
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSource, setCurrentSource] = useState('radio'); // 'radio' or 'playlist'
  
  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    audioRef.current.crossOrigin = 'anonymous';
    
    const audio = audioRef.current;
    
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null); // Clear any previous errors when successful
    };
    
    const handleError = () => {
      // Only set error if we're not currently trying alternatives
      // The playRadio function will handle errors appropriately
      console.log('Audio element error occurred');
    };
    
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (youtubePlayerRef.current && youtubePlayerRef.current.setVolume) {
      youtubePlayerRef.current.setVolume(volume * 100);
    }
  }, [volume]);
  const playRadio = useCallback(async (stationData) => {
    if (!audioRef.current || !stationData) return;
    
    // Immediately stop current radio and clear state
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    // Stop YouTube if playing
    if (youtubePlayerRef.current && youtubePlayerRef.current.pauseVideo) {
      youtubePlayerRef.current.pauseVideo();
    }
    
    // Clear current state immediately
    setCurrentStation(null);
    setIsPlaying(false);
    setError(null); // Clear errors at start
    setIsLoading(true);
    
    try {
      const audio = audioRef.current;
      
      // Use StreamProxy with progress feedback
      let streamUrl;
      try {
        streamUrl = await StreamProxy.findWorkingStream(stationData.url, (progress) => {
          // Show progress to user via notification system
          if (window.addNotification) {
            window.addNotification(progress, 'info', 1000);
          }
          console.log(`📡 ${progress}`);
        });
        console.log(`🎵 Using stream URL: ${streamUrl}`);
      } catch (proxyError) {
        console.error('StreamProxy failed completely, using original URL:', proxyError);
        streamUrl = stationData.url;
      }
      
      // Important: Set crossOrigin before setting src
      audio.crossOrigin = 'anonymous';
      audio.src = streamUrl;
      
      try {
        await audio.play();
        // Only set station as current if playback succeeds
        setCurrentStation(stationData);
        setIsPlaying(true);
        setCurrentSource('radio');
        
        // Store last played station
        localStorage.setItem('lastPlayedStation', JSON.stringify(stationData));
        
        // Show success notification
        if (window.addNotification) {
          window.addNotification(`🎵 Now playing ${stationData.name}`, 'success', 2000);
        }
      } catch (playError) {
        // If proxied URL fails, try without proxy
        if (streamUrl !== stationData.url) {
          console.log('🔄 Proxied URL failed, trying original...');
          if (window.addNotification) {
            window.addNotification('Trying original stream...', 'info', 1000);
          }
          audio.src = stationData.url;
          await audio.play();
          // Only set station as current if playback succeeds
          setCurrentStation(stationData);
          setIsPlaying(true);
          setCurrentSource('radio');
          localStorage.setItem('lastPlayedStation', JSON.stringify(stationData));
          
          if (window.addNotification) {
            window.addNotification(`🎵 Now playing ${stationData.name}`, 'success', 2000);
          }
        } else {
          throw playError;
        }
      }
      
    } catch (error) {
      // Enhanced error logging for radio station failures
      const errorDetails = {
        stationName: stationData.name,
        stationUrl: stationData.url,
        errorMessage: error.message,
        errorType: error.name,
        errorCode: error.code,
        networkState: audioRef.current?.networkState,
        readyState: audioRef.current?.readyState,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        connectionType: navigator.connection?.effectiveType || 'unknown',
        isOnline: navigator.onLine
      };
      
      console.error('🔴 RADIO PLAYBACK FAILED:', errorDetails);
      
      // Additional debugging info
      if (error.code) {
        const mediaErrorCodes = {
          1: 'MEDIA_ERR_ABORTED - Playback aborted by user',
          2: 'MEDIA_ERR_NETWORK - Network error during download',
          3: 'MEDIA_ERR_DECODE - Error during decoding',
          4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Audio format not supported'
        };
        console.error(`🔴 Media Error Code ${error.code}: ${mediaErrorCodes[error.code] || 'Unknown error'}`);
      }
      
      // Only set error message after complete failure
      setError(`Kan ${stationData.name} niet afspelen: Stream niet beschikbaar`);
      setCurrentStation(null); // Ensure no station shows as active
      setIsPlaying(false);
      
      // Show error notification
      if (window.addNotification) {
        window.addNotification(`❌ Could not play ${stationData.name}`, 'error', 3000);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);
  const playPlaylist = useCallback(async (playlistId, options = {}) => {
    if (!playlistId) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Pause radio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Load YouTube API if not already loaded
      await loadYouTubeAPI();
      
      // Create YouTube player if not exists
      if (!youtubePlayerRef.current) {
        // Create hidden div for YouTube player
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
          onStateChange: (event) => {
            // Handle player state changes
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          }
        });
        
        // Wait a moment for player to fully initialize
        setTimeout(() => {
          if (options.shuffle && youtubePlayerRef.current) {
            try {
              youtubePlayerRef.current.setShuffle(true);
              console.log('Shuffle enabled after delay');
            } catch (error) {
              console.warn('Could not set shuffle after delay:', error);
            }
          }
        }, 1000);
        
      } else {
        // Use existing player with new playlist
        youtubePlayerRef.current.loadPlaylist({
          listType: 'playlist',
          list: playlistId,
          shuffle: options.shuffle ? 1 : 0
        });
        
        // Set shuffle mode after loading playlist
        setTimeout(() => {
          if (options.shuffle && youtubePlayerRef.current) {
            try {
              youtubePlayerRef.current.setShuffle(true);
              console.log('Shuffle enabled on existing player');
            } catch (error) {
              console.warn('Could not set shuffle on existing player:', error);
            }
          }
          
          // Set loop mode based on repeat setting
          if (options.repeat === 'all' || options.repeat === 'one') {
            try {
              youtubePlayerRef.current.setLoop(true);
            } catch (error) {
              console.warn('Could not set loop:', error);
            }
          } else {
            try {
              youtubePlayerRef.current.setLoop(false);
            } catch (error) {
              console.warn('Could not unset loop:', error);
            }
          }
        }, 500);
      }
      
      setCurrentSource('playlist');
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Failed to load YouTube playlist:', error);
      setError('Failed to load YouTube playlist');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pauseAudio = useCallback(() => {
    if (currentSource === 'radio' && audioRef.current) {
      audioRef.current.pause();
    } else if (currentSource === 'playlist' && youtubePlayerRef.current) {
      youtubePlayerRef.current.pauseVideo();
    }
    setIsPlaying(false);
  }, [currentSource]);

  const resumeAudio = useCallback(() => {
    if (currentSource === 'radio' && audioRef.current) {      audioRef.current.play().catch(() => {
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

  // Add a function to toggle shuffle
  const toggleShuffle = useCallback((enabled) => {
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.setShuffle(enabled);
        console.log(`Shuffle ${enabled ? 'enabled' : 'disabled'}`);
        
        // Force reload the playlist with shuffle setting
        if (enabled) {
          // Get current playlist and reload with shuffle
          setTimeout(() => {
            if (youtubePlayerRef.current) {
              try {
                youtubePlayerRef.current.setShuffle(true);
              } catch (error) {
                console.warn('Could not set shuffle on toggle:', error);
              }
            }
          }, 100);
        }
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
    playRadio,
    playPlaylist,
    pauseAudio,
    resumeAudio,
    togglePlayPause,
    setVolume,
    setError,
    youtubePlayerRef,
    toggleShuffle // Add this
  };
};
