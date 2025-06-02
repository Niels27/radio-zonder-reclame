// src/utils/spotifyUtils.js - Spotify Web API integration utilities

// Spotify API Configuration
const SPOTIFY_CONFIG = {
  clientId: '67703322b3fe4c27aa42f10e3d067b84',
  redirectUri: `${window.location.origin}/radio-zonder-reclame/callback.html`,
  scopes: [
    'playlist-read-private',
    'playlist-read-collaborative', 
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-library-read',
    'user-read-playback-state',
    'user-modify-playback-state'
  ].join(' ')
};

// Global Spotify Web Playback SDK variables
let spotifyPlayer = null;
let spotifyDeviceId = null;
let spotifyAccessToken = null;
let spotifyTokenExpiry = null;

/**
 * Initialize Spotify authentication
 */
export const initializeSpotifyAuth = () => {
  // Check for existing token in localStorage
  const token = localStorage.getItem('spotify_access_token');
  const expiry = localStorage.getItem('spotify_token_expiry');
  
  if (token && expiry && Date.now() < parseInt(expiry)) {
    spotifyAccessToken = token;
    spotifyTokenExpiry = parseInt(expiry);
    return true;
  }
  
  return false;
};

/**
 * Generate code verifier and challenge for PKCE
 */
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Generate Spotify authorization URL with PKCE
 */
export const getSpotifyAuthUrl = async () => {
  const state = generateRandomString(16);
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store for later use
  localStorage.setItem('spotify_auth_state', state);
  localStorage.setItem('spotify_code_verifier', codeVerifier);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CONFIG.clientId,
    scope: SPOTIFY_CONFIG.scopes,
    redirect_uri: SPOTIFY_CONFIG.redirectUri,
    state: state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    show_dialog: 'true'
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

/**
 * Handle Spotify login popup
 */
export const loginToSpotify = () => {
  return new Promise(async (resolve, reject) => {
    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext && window.location.protocol !== 'https:') {
      reject(new Error('Spotify authentication requires HTTPS. Please use a secure connection.'));
      return;
    }

    try {
      const authUrl = await getSpotifyAuthUrl();
      console.log('🎵 Opening Spotify auth popup:', authUrl);
      
      const popup = window.open(
        authUrl,
        'spotifyLogin',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      // Poll for popup closure or message
      const pollTimer = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(pollTimer);
            reject(new Error('Login cancelled by user'));
          }
        } catch (error) {
          // Cross-origin error is expected, ignore
        }
      }, 1000);

      // Listen for messages from popup
      const messageHandler = async (event) => {
        // Allow messages from Spotify and our own domain
        if (event.origin !== window.location.origin && !event.origin.includes('spotify.com')) {
          console.warn('Ignoring message from unexpected origin:', event.origin);
          return;
        }
        
        if (event.data.type === 'SPOTIFY_AUTH_SUCCESS') {
          clearInterval(pollTimer);
          window.removeEventListener('message', messageHandler);
          popup.close();
          
          try {
            console.log('🎵 Auth success, exchanging code for token...');
            // Exchange code for token using PKCE
            const tokenData = await exchangeCodeForToken(event.data.code, event.data.state);
            resolve({ success: true, token: tokenData.accessToken });
          } catch (error) {
            console.error('❌ Token exchange failed:', error);
            reject(error);
          }
        } else if (event.data.type === 'SPOTIFY_AUTH_ERROR') {
          clearInterval(pollTimer);
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.error || 'Authentication failed'));
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollTimer);
        window.removeEventListener('message', messageHandler);
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error('Authentication timeout - please try again'));
      }, 300000);
    } catch (error) {
      console.error('❌ Spotify login error:', error);
      reject(error);
    }
  });
};

/**
 * Exchange authorization code for access token using PKCE
 */
export const exchangeCodeForToken = async (code, state) => {
  const storedState = localStorage.getItem('spotify_auth_state');
  const codeVerifier = localStorage.getItem('spotify_code_verifier');
  
  if (state !== storedState) {
    throw new Error('State mismatch error');
  }
  
  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_CONFIG.redirectUri,
        client_id: SPOTIFY_CONFIG.clientId,
        code_verifier: codeVerifier
      })
    });
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    spotifyAccessToken = data.access_token;
    spotifyTokenExpiry = Date.now() + (data.expires_in * 1000);
    
    // Store tokens
    localStorage.setItem('spotify_access_token', spotifyAccessToken);
    localStorage.setItem('spotify_token_expiry', spotifyTokenExpiry.toString());
    
    // Clean up PKCE data
    localStorage.removeItem('spotify_code_verifier');
    localStorage.removeItem('spotify_auth_state');
    
    return {
      accessToken: spotifyAccessToken,
      expiryTime: spotifyTokenExpiry
    };
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

/**
 * Get user's playlists from Spotify
 */
export const getUserPlaylists = async (searchQuery = '', limit = 50) => {
  if (!spotifyAccessToken) {
    throw new Error('No Spotify access token available');
  }
  
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/playlists?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${spotifyAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired
        clearSpotifyAuth();
        throw new Error('Spotify token expired');
      }
      throw new Error(`Failed to fetch playlists: ${response.status}`);
    }
    
    const data = await response.json();
    let playlists = data.items || [];
    
    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      playlists = playlists.filter(playlist => 
        playlist.name.toLowerCase().includes(query) ||
        playlist.description?.toLowerCase().includes(query)
      );
    }
    
    return playlists.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      trackCount: playlist.tracks.total,
      imageUrl: playlist.images?.[0]?.url,
      spotifyUrl: playlist.external_urls.spotify,
      owner: playlist.owner.display_name
    }));
    
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error);
    throw error;
  }
};

/**
 * Get playlist tracks
 */
export const getPlaylistTracks = async (playlistId) => {
  if (!spotifyAccessToken) {
    throw new Error('No Spotify access token available');
  }
  
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          'Authorization': `Bearer ${spotifyAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.items.map(item => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map(artist => artist.name),
      album: item.track.album.name,
      duration: item.track.duration_ms,
      previewUrl: item.track.preview_url,
      spotifyUri: item.track.uri
    }));
    
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    throw error;
  }
};

/**
 * Initialize Spotify Web Playback SDK
 */
export const initializeSpotifyPlayer = () => {
  return new Promise((resolve, reject) => {
    if (spotifyPlayer) {
      resolve(spotifyPlayer);
      return;
    }
    
    if (!window.Spotify) {
      // Load Spotify Web Playback SDK
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
      
      window.onSpotifyWebPlaybackSDKReady = () => {
        createSpotifyPlayer(resolve, reject);
      };
    } else {
      createSpotifyPlayer(resolve, reject);
    }
  });
};

/**
 * Create Spotify player instance
 */
const createSpotifyPlayer = (resolve, reject) => {
  if (!spotifyAccessToken) {
    reject(new Error('No Spotify access token'));
    return;
  }
  
  spotifyPlayer = new window.Spotify.Player({
    name: 'No Ads Radio Player',
    getOAuthToken: cb => cb(spotifyAccessToken),
    volume: 0.5
  });
  
  // Error handling
  spotifyPlayer.addListener('initialization_error', ({ message }) => {
    console.error('Spotify initialization error:', message);
    reject(new Error(message));
  });
  
  spotifyPlayer.addListener('authentication_error', ({ message }) => {
    console.error('Spotify authentication error:', message);
    clearSpotifyAuth();
    reject(new Error(message));
  });
  
  spotifyPlayer.addListener('account_error', ({ message }) => {
    console.error('Spotify account error:', message);
    reject(new Error(message));
  });
  
  // Ready
  spotifyPlayer.addListener('ready', ({ device_id }) => {
    console.log('Spotify player ready with device ID:', device_id);
    spotifyDeviceId = device_id;
    resolve(spotifyPlayer);
  });
  
  // Connect
  spotifyPlayer.connect();
};

/**
 * Play Spotify playlist
 */
export const playSpotifyPlaylist = async (playlistId, shuffle = false) => {
  if (!spotifyPlayer || !spotifyDeviceId) {
    throw new Error('Spotify player not ready');
  }
  
  try {
    // Start playback on our device
    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        context_uri: `spotify:playlist:${playlistId}`,
        offset: { position: 0 }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to start playback: ${response.status}`);
    }
    
    // Set shuffle if requested
    if (shuffle) {
      await setSpotifyShuffleMode(true);
    }
    
    return true;
  } catch (error) {
    console.error('Error playing Spotify playlist:', error);
    throw error;
  }
};

/**
 * Control Spotify playback
 */
export const pauseSpotify = () => spotifyPlayer?.pause();
export const resumeSpotify = () => spotifyPlayer?.resume();
export const nextSpotifyTrack = () => spotifyPlayer?.nextTrack();
export const previousSpotifyTrack = () => spotifyPlayer?.previousTrack();

export const setSpotifyVolume = async (volume) => {
  if (spotifyPlayer) {
    await spotifyPlayer.setVolume(volume / 100);
  }
};

export const setSpotifyShuffleMode = async (shuffle) => {
  if (!spotifyAccessToken || !spotifyDeviceId) return;
  
  try {
    await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${shuffle}&device_id=${spotifyDeviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`
      }
    });
  } catch (error) {
    console.error('Error setting shuffle mode:', error);
  }
};

/**
 * Get current playback state
 */
export const getSpotifyPlaybackState = async () => {
  if (spotifyPlayer) {
    return await spotifyPlayer.getCurrentState();
  }
  return null;
};

/**
 * Clear Spotify authentication
 */
export const clearSpotifyAuth = () => {
  spotifyAccessToken = null;
  spotifyTokenExpiry = null;
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_token_expiry');
  localStorage.removeItem('spotify_auth_state');
  localStorage.removeItem('spotify_code_verifier');
  
  if (spotifyPlayer) {
    spotifyPlayer.disconnect();
    spotifyPlayer = null;
    spotifyDeviceId = null;
  }
};

/**
 * Check if user is authenticated
 */
export const isSpotifyAuthenticated = () => {
  return !!(spotifyAccessToken && spotifyTokenExpiry && Date.now() < spotifyTokenExpiry);
};

/**
 * Logout from Spotify
 */
export const logoutFromSpotify = () => {
  clearSpotifyAuth();
  
  // Optional: Revoke token on Spotify's end
  // This would require additional API call
  
  return true;
};

/**
 * Utility function to generate random string
 */
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

/**
 * Validate Spotify playlist URL or ID
 */
export const validateSpotifyPlaylist = async (playlistIdOrUrl) => {
  if (!spotifyAccessToken) {
    return { isValid: false, error: 'Not authenticated' };
  }
  
  let playlistId = playlistIdOrUrl;
  
  // Extract playlist ID from URL if needed
  if (playlistIdOrUrl.includes('spotify.com/playlist/')) {
    const match = playlistIdOrUrl.match(/playlist\/([a-zA-Z0-9]+)/);
    if (match) {
      playlistId = match[1];
    }
  }
  
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          'Authorization': `Bearer ${spotifyAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      return { isValid: false, error: `Invalid playlist: ${response.status}` };
    }
    
    const playlist = await response.json();
    
    return {
      isValid: true,
      id: playlist.id,
      name: playlist.name,
      trackCount: playlist.tracks.total,
      description: playlist.description,
      owner: playlist.owner.display_name,
      imageUrl: playlist.images?.[0]?.url
    };
    
  } catch (error) {
    console.error('Error validating Spotify playlist:', error);
    return { isValid: false, error: error.message };
  }
};

// Initialize on module load
initializeSpotifyAuth();
