const YOUTUBE_CLIENT_ID = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
const YOUTUBE_SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';
const YOUTUBE_REDIRECT_URI = window.location.origin + '/radio-zonder-reclame/youtube-callback.html';

// YouTube Authentication
export const authenticateYouTube = () => {
  const params = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    redirect_uri: YOUTUBE_REDIRECT_URI,
    response_type: 'code',
    scope: YOUTUBE_SCOPES,
    access_type: 'offline',
    prompt: 'consent'
  });
  
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

// Check if user is authenticated
export const isYouTubeAuthenticated = () => {
  return !!localStorage.getItem('youtube_access_token');
};

// Get YouTube Data API instance
export const getYouTubeAPI = () => {
  const accessToken = localStorage.getItem('youtube_access_token');
  if (!accessToken) throw new Error('Not authenticated with YouTube');
  
  return {
    async request(endpoint, params = {}) {
      const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
      Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      return response.json();
    }
  };
};

// Get playlist videos with direct URLs
export const getPlaylistVideos = async (playlistId) => {
  const api = getYouTubeAPI();
  
  try {
    // Get playlist items
    const playlistResponse = await api.request('playlistItems', {
      part: 'snippet',
      playlistId: playlistId,
      maxResults: 50
    });
    
    const videos = [];
    
    for (const item of playlistResponse.items) {
      const videoId = item.snippet.resourceId.videoId;
      
      // Get video details including stream URLs
      const videoResponse = await api.request('videos', {
        part: 'snippet,contentDetails',
        id: videoId
      });
      
      if (videoResponse.items.length > 0) {
        const video = videoResponse.items[0];
        videos.push({
          id: videoId,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.medium?.url,
          duration: video.contentDetails.duration,
          // We'll get actual stream URLs through a different method
          streamUrl: null
        });
      }
    }
    
    return videos;
  } catch (error) {
    console.error('Failed to fetch playlist videos:', error);
    throw error;
  }
};

// Logout
export const logoutYouTube = () => {
  localStorage.removeItem('youtube_access_token');
  localStorage.removeItem('youtube_refresh_token');
  console.log('🎵 YouTube logout complete');
};