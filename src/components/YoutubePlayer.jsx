import React, { useState, useEffect, useRef } from 'react';
import { 
  authenticateYouTube, 
  isYouTubeAuthenticated, 
  getPlaylistVideos,
  logoutYouTube 
} from '../utils/youtubeAuthUtils';

export const YouTubeAuthPlayer = ({ playlistId, onReady, onError }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    setIsAuthenticated(isYouTubeAuthenticated());
    
    // Listen for authentication success
    const handleMessage = (event) => {
      if (event.data.type === 'YOUTUBE_AUTH_SUCCESS') {
        setIsAuthenticated(true);
        console.log('🎵 YouTube authentication successful');
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (isAuthenticated && playlistId) {
      loadPlaylist();
    }
  }, [isAuthenticated, playlistId]);

  const loadPlaylist = async () => {
    setIsLoading(true);
    try {
      console.log('🎵 Loading YouTube playlist via API:', playlistId);
      const playlistVideos = await getPlaylistVideos(playlistId);
      setVideos(playlistVideos);
      
      if (playlistVideos.length > 0) {
        setCurrentVideoIndex(0);
        if (onReady) onReady();
      }
    } catch (error) {
      console.error('Failed to load playlist:', error);
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    console.log('🎵 Starting YouTube OAuth flow...');
    authenticateYouTube();
  };

  const handleLogout = () => {
    logoutYouTube();
    setIsAuthenticated(false);
    setVideos([]);
  };

  const playVideo = (index = currentVideoIndex) => {
    if (videos[index]) {
      console.log('🎵 Playing video:', videos[index].title);
      // Here we would implement actual audio playback
      // For now, this is a placeholder
    }
  };

  const nextVideo = () => {
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
    playVideo(nextIndex);
  };

  const previousVideo = () => {
    const prevIndex = currentVideoIndex === 0 ? videos.length - 1 : currentVideoIndex - 1;
    setCurrentVideoIndex(prevIndex);
    playVideo(prevIndex);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">YouTube Authentication Required</h3>
        <p className="text-gray-300 mb-4">
          To play YouTube playlists, you need to authenticate with your Google account.
        </p>
        <button
          onClick={handleLogin}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          🔗 Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">YouTube Player</h3>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white text-sm"
        >
          Logout
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading playlist...</p>
        </div>
      ) : videos.length > 0 ? (
        <div>
          <p className="text-gray-300 mb-2">
            {videos.length} videos loaded
          </p>
          <div className="flex gap-2">
            <button onClick={previousVideo} className="bg-gray-600 px-3 py-1 rounded">⏮️</button>
            <button onClick={() => playVideo()} className="bg-blue-600 px-4 py-1 rounded">▶️</button>
            <button onClick={nextVideo} className="bg-gray-600 px-3 py-1 rounded">⏭️</button>
          </div>
          {videos[currentVideoIndex] && (
            <div className="mt-3 p-2 bg-gray-700 rounded">
              <p className="text-sm font-medium">{videos[currentVideoIndex].title}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400">No videos found in playlist</p>
      )}
      
      {/* Hidden audio element for actual playback */}
      <audio ref={audioRef} crossOrigin="anonymous" />
    </div>
  );
};