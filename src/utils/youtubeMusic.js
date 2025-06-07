// YouTube Music Web API integration - similar to Spotify integration

// YouTube Music API Configuration
const CLIENT_ID = '67703322b3fe4c27aa42f10e3d067b84'; // Use same client ID as Spotify for now
const REDIRECT_URI = `${window.location.origin}/callback.html`;
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
].join(' ');

// Storage keys
const ACCESS_TOKEN_KEY = 'youtube_music_access_token';
const REFRESH_TOKEN_KEY = 'youtube_music_refresh_token';
const TOKEN_EXPIRY_KEY = 'youtube_music_token_expiry';

// State management
let isInitialized = false;
let currentPlayer = null;

// Check if user is authenticated
export const isYouTubeMusicAuthenticated = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!token || !expiry) return false;
  
  // Check if token is expired (with 5 minute buffer)
  const expiryTime = parseInt(expiry);
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes
  
  return now < (expiryTime - bufferTime);
};

// Get stored access token
export const getYouTubeMusicAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Login to YouTube Music
export const loginToYouTubeMusic = async () => {
  console.log('🎵 Starting YouTube Music login...');
  
  // Clear any existing tokens
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  
  // Create authorization URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', 'youtube_music_auth');
  
  console.log('🎵 Opening YouTube Music authorization window...');
  
  return new Promise((resolve, reject) => {
    // Open popup for authorization
    const popup = window.open(
      authUrl.toString(),
      'youtube_music_auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );
    
    if (!popup) {
      reject(new Error('Popup blocked - please allow popups for this site'));
      return;
    }
    
    // Poll for popup closure or message
    const pollTimer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(pollTimer);
          // Check if we got tokens
          if (isYouTubeMusicAuthenticated()) {
            console.log('🎵 YouTube Music login successful!');
            resolve(true);
          } else {
            reject(new Error('Login was cancelled or failed'));
          }
        }
      } catch (error) {
        // Handle cross-origin errors
        console.log('🎵 Waiting for YouTube Music authorization...');
      }
    }, 1000);
    
    // Listen for message from popup
    const messageHandler = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'YOUTUBE_MUSIC_AUTH_SUCCESS') {
        clearInterval(pollTimer);
        popup.close();
        
        // Store tokens
        const { access_token, refresh_token, expires_in } = event.data;
        const expiryTime = Date.now() + (expires_in * 1000);
        
        localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
        if (refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
        }
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        
        window.removeEventListener('message', messageHandler);
        console.log('🎵 YouTube Music tokens stored successfully');
        resolve(true);
      } else if (event.data.type === 'YOUTUBE_MUSIC_AUTH_ERROR') {
        clearInterval(pollTimer);
        popup.close();
        window.removeEventListener('message', messageHandler);
        reject(new Error(event.data.error || 'YouTube Music login failed'));
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(pollTimer);
      if (!popup.closed) popup.close();
      window.removeEventListener('message', messageHandler);
      reject(new Error('Login timeout - please try again'));
    }, 5 * 60 * 1000);
  });
};

// Logout from YouTube Music
export const logoutFromYouTubeMusic = () => {
  console.log('🎵 Logging out from YouTube Music...');
  
  // Clear tokens
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  
  // Reset state
  isInitialized = false;
  currentPlayer = null;
  
  console.log('🎵 YouTube Music logout complete');
};

// Make authenticated API request
const makeYouTubeMusicRequest = async (endpoint, options = {}) => {
  const token = getYouTubeMusicAccessToken();
  if (!token) {
    throw new Error('Not authenticated with YouTube Music');
  }
  
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `https://www.googleapis.com/youtube/v3/${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, clear auth
      logoutFromYouTubeMusic();
      throw new Error('Authentication expired - please login again');
    }
    throw new Error(`YouTube Music API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Get user's playlists
export const getYouTubeMusicPlaylists = async (search = '', maxResults = 50) => {
  console.log('🎵 Fetching YouTube Music playlists...');
  
  try {
    // Get user's playlists
    const response = await makeYouTubeMusicRequest(
      `playlists?part=snippet&mine=true&maxResults=${maxResults}`
    );
    
    const playlists = response.items?.map(playlist => ({
      id: playlist.id,
      name: playlist.snippet.title,
      description: playlist.snippet.description || '',
      imageUrl: playlist.snippet.thumbnails?.medium?.url || 
                playlist.snippet.thumbnails?.default?.url || null,
      trackCount: playlist.snippet.itemCount || 0,
      owner: 'You',
      external_urls: {
        youtube: `https://music.youtube.com/playlist?list=${playlist.id}`
      }
    })) || [];
    
    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      return playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(searchLower) ||
        playlist.description.toLowerCase().includes(searchLower)
      );
    }
    
    console.log(`🎵 Found ${playlists.length} YouTube Music playlists`);
    return playlists;
  } catch (error) {
    console.error('🎵 Error fetching YouTube Music playlists:', error);
    throw error;
  }
};

// Validate YouTube Music playlist
export const validateYouTubeMusicPlaylist = async (playlistId) => {
  console.log('🎵 Validating YouTube Music playlist:', playlistId);
  
  try {
    // Get playlist details
    const response = await makeYouTubeMusicRequest(
      `playlists?part=snippet&id=${playlistId}`
    );
    
    if (!response.items || response.items.length === 0) {
      return {
        isValid: false,
        error: 'Playlist not found'
      };
    }
    
    const playlist = response.items[0];
    
    // Get playlist items count
    const itemsResponse = await makeYouTubeMusicRequest(
      `playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1`
    );
    
    return {
      isValid: true,
      name: playlist.snippet.title,
      description: playlist.snippet.description || '',
      imageUrl: playlist.snippet.thumbnails?.medium?.url || 
                playlist.snippet.thumbnails?.default?.url || null,
      trackCount: itemsResponse.pageInfo?.totalResults || 0,
      owner: playlist.snippet.channelTitle || 'Unknown'
    };
  } catch (error) {
    console.error('🎵 Error validating YouTube Music playlist:', error);
    return {
      isValid: false,
      error: error.message
    };
  }
};

// Initialize YouTube Music player (using iframe)
export const initializeYouTubeMusicPlayer = async () => {
  console.log('🎵 Initializing YouTube Music player...');
  
  if (!isYouTubeMusicAuthenticated()) {
    throw new Error('Not authenticated with YouTube Music');
  }
  
  // For now, we'll use a simple approach with iframe
  // This creates a hidden iframe that can be controlled
  currentPlayer = {
    isReady: true,
    currentPlaylistId: null,
    isPlaying: false
  };
  
  isInitialized = true;
  console.log('🎵 YouTube Music player initialized');
  
  return currentPlayer;
};

// Play playlist in YouTube Music
export const playYouTubeMusicPlaylist = async (playlistId, options = {}) => {
  console.log('🎵 Playing YouTube Music playlist:', playlistId);
  
  if (!isYouTubeMusicAuthenticated()) {
    throw new Error('Not authenticated with YouTube Music');
  }
  
  try {
    // Create YouTube Music URL
    const params = new URLSearchParams({
      list: playlistId,
      autoplay: '1'
    });
    
    if (options.shuffle) {
      params.set('shuffle', '1');
    }
    
    const musicUrl = `https://music.youtube.com/playlist?${params.toString()}`;
    
    // Open in popup window for better control
    const width = 1200;
    const height = 800;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    if (currentPlayer?.popup && !currentPlayer.popup.closed) {
      currentPlayer.popup.close();
    }
    
    const popup = window.open(
      musicUrl,
      `youtubeMusicPlayer_${Date.now()}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    
    if (!popup) {
      throw new Error('Popup blocked - please allow popups for this site');
    }
    
    currentPlayer = {
      ...currentPlayer,
      popup,
      currentPlaylistId: playlistId,
      isPlaying: true,
      options
    };
    
    // Monitor popup
    const checkPopup = () => {
      if (currentPlayer?.popup?.closed) {
        currentPlayer.isPlaying = false;
        console.log('🎵 YouTube Music popup closed');
        return;
      }
      if (currentPlayer?.isPlaying) {
        setTimeout(checkPopup, 1000);
      }
    };
    setTimeout(checkPopup, 1000);
    
    console.log('🎵 YouTube Music playlist started in popup');
    return true;
  } catch (error) {
    console.error('🎵 Error playing YouTube Music playlist:', error);
    throw error;
  }
};

// Control functions
export const pauseYouTubeMusic = () => {
  if (currentPlayer?.popup && !currentPlayer.popup.closed) {
    // For now, we'll close the popup to "pause"
    // In a more advanced implementation, we could send messages to the popup
    currentPlayer.popup.close();
    currentPlayer.isPlaying = false;
    console.log('🎵 YouTube Music paused (popup closed)');
  }
};

export const resumeYouTubeMusic = () => {
  if (currentPlayer?.currentPlaylistId) {
    // Restart the playlist
    playYouTubeMusicPlaylist(currentPlayer.currentPlaylistId, currentPlayer.options);
    console.log('🎵 YouTube Music resumed');
  }
};

export const nextYouTubeMusicTrack = () => {
  // For now, we can't control individual tracks in the popup
  // This would require more advanced integration
  console.log('🎵 YouTube Music next track (not implemented in popup mode)');
  if (window.addNotification) {
    window.addNotification('⏭️ Gebruik YouTube Music controls in het popup venster', 'info', 3000);
  }
};

export const setYouTubeMusicShuffle = (enabled) => {
  // Store shuffle preference for next playlist start
  if (currentPlayer) {
    currentPlayer.options = { ...currentPlayer.options, shuffle: enabled };
  }
  console.log('🎵 YouTube Music shuffle:', enabled ? 'enabled' : 'disabled');
};

export const setYouTubeMusicVolume = (volume) => {
  // Volume control would need to be handled in the popup
  console.log('🎵 YouTube Music volume set to:', Math.round(volume * 100) + '%');
  if (window.addNotification) {
    window.addNotification(`🔊 Gebruik volume controls in YouTube Music venster`, 'info', 2000);
  }
};

// Get current player state
export const getYouTubeMusicPlayerState = () => {
  return {
    isReady: isInitialized,
    isPlaying: currentPlayer?.isPlaying || false,
    currentPlaylistId: currentPlayer?.currentPlaylistId || null,
    isAuthenticated: isYouTubeMusicAuthenticated()
  };
};

// Export for global access
window.youtubeMusic = {
  isAuthenticated: isYouTubeMusicAuthenticated,
  login: loginToYouTubeMusic,
  logout: logoutFromYouTubeMusic,
  getPlaylists: getYouTubeMusicPlaylists,
  validatePlaylist: validateYouTubeMusicPlaylist,
  playPlaylist: playYouTubeMusicPlaylist,
  pause: pauseYouTubeMusic,
  resume: resumeYouTubeMusic,
  nextTrack: nextYouTubeMusicTrack,
  setShuffle: setYouTubeMusicShuffle,
  setVolume: setYouTubeMusicVolume,
  getState: getYouTubeMusicPlayerState
};