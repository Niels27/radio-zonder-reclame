import { useState, useRef, useEffect, useCallback } from 'react';
import { loadYouTubeAPI, createYouTubePlayer } from '../utils/youtubeUtils';

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
    const handleCanPlay = () => setIsLoading(false);    const handleError = () => {
      setError('Failed to load radio stream');
      setIsLoading(false);
      setIsPlaying(false);
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
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Stop YouTube if playing
      if (youtubePlayerRef.current && youtubePlayerRef.current.pauseVideo) {
        youtubePlayerRef.current.pauseVideo();
      }
      
      const audio = audioRef.current;
      audio.src = stationData.url;
      
      await audio.play();
      setCurrentStation(stationData);
      setIsPlaying(true);
      setCurrentSource('radio');
      
      // Store last played station
      localStorage.setItem('lastPlayedStation', JSON.stringify(stationData));    } catch {
      setError(`Failed to play ${stationData.name}`);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const playPlaylist = useCallback(async (playlistId) => {
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
          document.body.appendChild(youtubeDiv);
        }
        
        youtubePlayerRef.current = await createYouTubePlayer('youtube-player', playlistId, {
          playerVars: {
            autoplay: 1,
            loop: 1
          }
        });
      } else {
        // Use existing player with new playlist
        youtubePlayerRef.current.loadPlaylist({
          listType: 'playlist',
          list: playlistId
        });
      }
      
      setCurrentSource('playlist');
      setIsPlaying(true);    } catch {
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
    setError
  };
};
