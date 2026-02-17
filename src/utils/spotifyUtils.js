// src/utils/spotifyUtils.js - Spotify Web API integration utilities

// Spotify API Configuration
const getRedirectUri = () => {
  // Ensure consistent redirect URI format
  const origin = window.location.origin;
  const path = '/radio-zonder-reclame/callback.html';
  const baseUri = `${origin}${path}`;
  
  console.log('🔧 Spotify Redirect URI Details:');
  console.log('  - Origin:', origin);
  console.log('  - Path:', path);
  console.log('  - Full URI:', baseUri);
  console.log('  - Protocol:', window.location.protocol);
  console.log('  - Hostname:', window.location.hostname);
  
  return baseUri;
};

const SPOTIFY_CONFIG = {
  clientId: '67703322b3fe4c27aa42f10e3d067b84',
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


// Global state - only create ONE player instance
let spotifyPlayer = null;
let spotifyDeviceId = null;
let spotifyAccessToken = null;
let spotifyTokenExpiry = null;
let isPlayerInitializing = false;
let playerInitPromise = null;
let lastDeviceCheck = 0;
let lastDeviceState = false;

/**
 * Initialize Spotify authentication - ENHANCED for F5 handling
 */
export const initializeSpotifyAuth = () => {
  // Check for existing token in localStorage
  const token = localStorage.getItem('spotify_access_token');
  const expiry = localStorage.getItem('spotify_token_expiry');
  
  if (token && expiry && Date.now() < parseInt(expiry)) {
    spotifyAccessToken = token;
    spotifyTokenExpiry = parseInt(expiry);
    console.log('🎵 Restored Spotify authentication from localStorage');
    return true;
  } else if (token && expiry) {
    // Token expired, clean up
    console.log('🎵 Spotify token expired, cleaning up');
    clearSpotifyAuth();
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
    redirect_uri: getRedirectUri(), // Use the function directly
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
          }        } else if (event.data.type === 'SPOTIFY_AUTH_ERROR') {
          clearInterval(pollTimer);
          window.removeEventListener('message', messageHandler);
          popup.close();
          
          // Enhanced error handling for redirect URI issues
          const error = event.data.error;
          const errorDescription = event.data.errorDescription || '';
          
          console.error('🔧 Spotify Auth Error Details:');
          console.error('  - Error:', error);
          console.error('  - Description:', errorDescription);
          console.error('  - Current redirect URI:', getRedirectUri());
          
          // Check for specific redirect URI error
          if (error === 'invalid_client' || errorDescription.toLowerCase().includes('redirect_uri') || errorDescription.toLowerCase().includes('redirect uri')) {
            console.error('🚨 REDIRECT URI ERROR DETECTED!');
            console.error('🔧 This is likely because the production redirect URI is not configured in the Spotify Developer Dashboard.');
            console.error('🔧 To fix this issue:');
            console.error('   1. Go to https://developer.spotify.com/dashboard');
            console.error('   2. Find your app with Client ID: 67703322b3fe4c27aa42f10e3d067b84');
            console.error('   3. Click "Edit Settings"');
            console.error('   4. Add this redirect URI:', getRedirectUri());
            console.error('🔧 For detailed instructions, visit: ' + window.location.origin + '/radio-zonder-reclame/spotify-fix.html');
            
            // Create a more informative error message
            const helpUrl = `${window.location.origin}/radio-zonder-reclame/spotify-fix.html`;
            const detailedError = new Error(`Spotify redirect URI not configured. Visit ${helpUrl} for detailed fix instructions.`);
            detailedError.code = 'INVALID_REDIRECT_URI';
            detailedError.helpUrl = helpUrl;
            detailedError.originalError = error;
            detailedError.originalDescription = errorDescription;
            reject(detailedError);
          } else {
            reject(new Error(errorDescription || error || 'Authentication failed'));
          }
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
        redirect_uri: getRedirectUri(), // ← FIX: Use the function instead of SPOTIFY_CONFIG.redirectUri
        client_id: SPOTIFY_CONFIG.clientId,
        code_verifier: codeVerifier
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Token exchange error details:', errorData);
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
    
    console.log('✅ Successfully exchanged code for access token');
    
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
export const resetInitializationState = () => {
  console.log('🔧 Forcing reset of Spotify initialization state...');
  isPlayerInitializing = false;
  initializationPromise = null;
  isSDKLoading = false;
  
  if (initializationTimeout) {
    clearTimeout(initializationTimeout);
    initializationTimeout = null;
  }
  
  console.log('🔧 Spotify initialization state reset complete');
};
/**
 * Initialize Spotify Web Playback SDK - FIXED to prevent duplicates
 */
let initializationPromise = null;
let initializationTimeout = null;

let isSDKLoading = false;

export const initializeSpotifyPlayer = () => {
  // Return existing promise if already initializing
  if (initializationPromise) {
    console.log('🎵 Spotify initialization already in progress - returning existing promise');
    return initializationPromise;
  }

  // Return existing player immediately if ready
  if (spotifyPlayer && spotifyDeviceId && !isPlayerInitializing) {
    console.log('🎵 Spotify player already ready - returning immediately');
    return Promise.resolve(spotifyPlayer);
  }

  console.log('🎵 Starting fast Spotify player initialization...');
  isPlayerInitializing = true;

  initializationPromise = new Promise((resolve, reject) => {
    const cleanup = () => {
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
        initializationTimeout = null;
      }
      isPlayerInitializing = false;
      initializationPromise = null;
      isSDKLoading = false; // ✅ Reset SDK loading flag
    };

    // ✅ CRITICAL FIX: Check if SDK is already loading
    if (!window.Spotify && !isSDKLoading) {
      console.log('🎵 Loading Spotify SDK...');
      isSDKLoading = true; // ✅ Set flag to prevent multiple loads
      
      // ✅ CRITICAL FIX: Define callback BEFORE loading the script
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('🎵 Spotify SDK ready - creating player immediately');
        isSDKLoading = false; // ✅ Reset flag
        createSpotifyPlayerFast(resolve, reject, cleanup);
      };
      
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      
      script.onload = () => {
        console.log('🎵 Spotify SDK loaded');
        
        // Fallback: if onSpotifyWebPlaybackSDKReady doesn't fire within 1 second
        setTimeout(() => {
          if (window.Spotify && !spotifyPlayer) {
            console.log('🎵 Fallback: Creating player after SDK load');
            createSpotifyPlayerFast(resolve, reject, cleanup);
          }
        }, 1000);
      };
      
      script.onerror = () => {
        isSDKLoading = false; // ✅ Reset flag on error
        cleanup();
        reject(new Error('Failed to load Spotify SDK'));
      };
      
      document.head.appendChild(script);
    } else if (window.Spotify) {
      console.log('🎵 Spotify SDK already loaded - creating player');
      createSpotifyPlayerFast(resolve, reject, cleanup);
    } else {
      // SDK is currently loading, wait for it
      console.log('🎵 Spotify SDK currently loading - waiting...');
      const checkInterval = setInterval(() => {
        if (window.Spotify) {
          clearInterval(checkInterval);
          createSpotifyPlayerFast(resolve, reject, cleanup);
        }
      }, 100);
      
      // Timeout the check after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.Spotify) {
          cleanup();
          reject(new Error('Spotify SDK failed to load'));
        }
      }, 10000);
    }

    // Set the main timeout
    initializationTimeout = setTimeout(() => {
      console.log('🎵 Spotify initialization timeout (30s)');
      console.warn('🎵 ⚠️ Spotify initialization taking longer than expected, but continuing to wait...');
      
      if (window.addNotification) {
        window.addNotification('Spotify laadt langzaam - even geduld...', 'warning', 5000);
      }
      
      setTimeout(() => {
        console.error('🎵 ❌ Final Spotify timeout (60s total)');
        cleanup();
        reject(new Error('Spotify initialization timed out after 60 seconds'));
      }, 30000);
      
    }, 30000);
  });

  return initializationPromise;
};

// Faster player creation with minimal logging
// CRITICAL FIX: Update the ready event handler in createSpotifyPlayerFast
// CRITICAL FIX: Update the ready event handler in createSpotifyPlayerFast
const createSpotifyPlayerFast = (resolve, reject, cleanup) => {
  if (!spotifyAccessToken) {
    cleanup();
    reject(new Error('No Spotify access token'));
    return;
  }

  if (spotifyPlayer) {
    console.log('🎵 Player already exists during fast init');
    cleanup();
    resolve(spotifyPlayer);
    return;
  }

  console.log('🎵 Creating Spotify player (fast mode)...');

  spotifyPlayer = new window.Spotify.Player({
    name: 'No Ads Radio Browser Player',
    getOAuthToken: cb => cb(spotifyAccessToken),
    volume: 0.5
  });

  // ✅ CRITICAL FIX: Track if we've already resolved/rejected
  let isResolved = false;

  // Minimal error handling - just log and continue
  spotifyPlayer.addListener('initialization_error', ({ message }) => {
    console.error('Spotify init error:', message);
    if (!isResolved) {
      isResolved = true;
      cleanup();
      reject(new Error(`Init failed: ${message}`));
    }
  });

  spotifyPlayer.addListener('authentication_error', ({ message }) => {
    console.error('Spotify auth error:', message);
    clearSpotifyAuth();
    if (!isResolved) {
      isResolved = true;
      cleanup();
      reject(new Error(`Auth failed: ${message}`));
    }
  });

  spotifyPlayer.addListener('account_error', ({ message }) => {
    console.error('Spotify account error:', message);
    if (!isResolved) {
      isResolved = true;
      cleanup();
      reject(new Error(`Account error: ${message}`));
    }
  });

  // Suppress CloudPlaybackClientError completely in fast mode
  spotifyPlayer.addListener('playback_error', ({ message }) => {
    if (message && message.includes('CloudPlaybackClientError')) {
      // Completely silent in fast mode
      return;
    }
    console.warn('Spotify playback error:', message);
  });

  // Minimal state change logging
  spotifyPlayer.addListener('player_state_changed', () => {
    // Silent in fast mode
  });

  // ✅ CRITICAL FIX: Ready event - resolve even if timeout already occurred
  spotifyPlayer.addListener('ready', ({ device_id }) => {
    console.log('🎵 Spotify ready:', device_id);
    spotifyDeviceId = device_id;
    window.spotifyDeviceId = device_id;
    
    // ✅ RESOLVE EVEN IF TIMEOUT OCCURRED - just ensure we don't double-resolve
    if (!isResolved) {
      isResolved = true;
      cleanup();
      resolve(spotifyPlayer);
    } else {
      // Timeout already occurred, but player is ready now
      console.log('🎵 ✅ Spotify player ready after timeout - updating global state');
      
      // Reset the initialization state so it can be used
      isPlayerInitializing = false;
      initializationPromise = null;
      
      // Trigger a global event to notify React that Spotify is ready
      window.dispatchEvent(new CustomEvent('spotifyPlayerReady', { 
        detail: { player: spotifyPlayer, deviceId: device_id } 
      }));
    }
  });

  spotifyPlayer.addListener('not_ready', ({ device_id }) => {
    console.warn('🎵 Spotify not ready:', device_id);
  });

  // Fast connection with minimal error handling
  spotifyPlayer.connect().then(connected => {
    if (!connected && !isResolved) {
      isResolved = true;
      cleanup();
      reject(new Error('Failed to connect to Spotify'));
    }
    // If connected, wait for ready event
  }).catch(error => {
    if (error.message && error.message.includes('CloudPlaybackClientError')) {
      // In fast mode, ignore CloudPlaybackClientError and wait for ready event
      console.log('🎵 Ignoring CloudPlaybackClientError in fast mode - waiting for ready event');
      return;
    }
    console.error('Spotify connection failed:', error);
    if (!isResolved) {
      isResolved = true;
      cleanup();
      reject(error);
    }
  });
};
// Also update createSpotifyPlayer to be more defensive:
const createSpotifyPlayer = (resolve, reject) => {
  if (!spotifyAccessToken) {
    isPlayerInitializing = false;
    reject(new Error('No Spotify access token'));
    return;
  }
  
  // FINAL CHECK: Prevent duplicate players even at this level
  if (spotifyPlayer) {
    console.log('🎵 Player created during initialization - returning existing');
    isPlayerInitializing = false;
    resolve(spotifyPlayer);
    return;
  }
  
  console.log('🎵 Creating single Spotify player instance...');
  
  spotifyPlayer = new window.Spotify.Player({
    name: 'No Ads Radio Browser Player',
    getOAuthToken: cb => cb(spotifyAccessToken),
    volume: 0.5
  });
  
  // Enhanced error handling with CloudPlaybackClientError suppression
  spotifyPlayer.addListener('initialization_error', ({ message }) => {
    console.error('Spotify initialization error:', message);
    isPlayerInitializing = false;
    reject(new Error(`Initialization failed: ${message}`));
  });
  
  spotifyPlayer.addListener('authentication_error', ({ message }) => {
    console.error('Spotify authentication error:', message);
    clearSpotifyAuth();
    isPlayerInitializing = false;
    reject(new Error(`Authentication failed: ${message}`));
  });
  
  spotifyPlayer.addListener('account_error', ({ message }) => {
    console.error('Spotify account error:', message);
    isPlayerInitializing = false;
    reject(new Error(`Account error: ${message}. Premium required.`));
  });
  
  // NEW: Enhanced playback error handling to catch CloudPlaybackClientError
  spotifyPlayer.addListener('playback_error', ({ message }) => {
    // Suppress common CloudPlaybackClientError 404s that are normal during initialization
    if (message && message.includes('CloudPlaybackClientError') && message.includes('404')) {
      console.warn('🎵 Suppressed CloudPlaybackClientError 404 (normal during initialization)');
      return; // Don't throw error, these are often temporary
    }
    
    console.error('Spotify playback error:', message);
    // Only show critical playback errors to user
    if (message && !message.includes('CloudPlayback')) {
      if (window.addNotification) {
        window.addNotification('Spotify afspeelfout: ' + message, 'error', 5000);
      }
    }
  });
  
  // Minimal state logging
  let lastState = null;
  spotifyPlayer.addListener('player_state_changed', (state) => {
    if (state && (!lastState || lastState.paused !== state.paused)) {
      console.log('🎵 Spotify state:', state.paused ? 'paused' : 'playing');
      lastState = state;
    }
  });
  
  // Ready event handler - SIMPLIFIED
  spotifyPlayer.addListener('ready', ({ device_id }) => {
    console.log('🎵 Spotify player ready with device:', device_id);
    spotifyDeviceId = device_id;
    window.spotifyDeviceId = device_id;
    isPlayerInitializing = false;
    resolve(spotifyPlayer);
  });
  
  spotifyPlayer.addListener('not_ready', ({ device_id }) => {
    console.warn('🎵 Spotify player not ready:', device_id);
  });
  
  // Enhanced connection with promise rejection handling
  spotifyPlayer.connect().then(connected => {
    if (!connected) {
      isPlayerInitializing = false;
      reject(new Error('Failed to connect Spotify player'));
    }
  }).catch(error => {
    // Catch CloudPlaybackClientError during connection
    if (error.message && error.message.includes('CloudPlaybackClientError')) {
      console.warn('🎵 CloudPlaybackClientError during connection - continuing anyway');
      // Don't reject, these errors often resolve themselves
      return;
    }
    
    console.error('Spotify connection failed:', error);
    isPlayerInitializing = false;
    reject(error);
  });
};

/**
 * Activate the Web Playback SDK device as the primary device - FIXED
 */
const activateWebPlaybackDevice = async () => {
  // FIX: Try to find device ID if it's missing
  if (!spotifyDeviceId) {
    console.log('🔧 Device ID missing, trying to find it...');
    await findOurDeviceId();
  }
  
  if (!spotifyDeviceId || !spotifyAccessToken) {
    throw new Error('Device ID or access token not available');
  }
  
  console.log('🎵 Activating Web Playback SDK device for browser audio:', spotifyDeviceId);
  
  try {
    // Force transfer playback to our browser device
    const transferResponse = await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device_ids: [spotifyDeviceId],
        play: false // Don't start playing yet
      })
    });
    
    if (transferResponse.ok) {
      console.log('🎵 Playback transferred to Web Playback SDK device (browser)');
      
      // Wait for transfer to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify the device is now active
      const stateResponse = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${spotifyAccessToken}`
        }
      });
      
      if (stateResponse.ok) {
        const playerState = await stateResponse.json();
        if (playerState.device && playerState.device.id === spotifyDeviceId) {
          console.log('✅ Web Playback SDK device is now the active device - browser audio ready');
          return true;
        } else {
          console.warn('⚠️ Device transfer may not have completed. Current device:', playerState.device?.name);
        }
      }
    } else if (transferResponse.status === 404) {
      console.warn('🎵 No available devices for transfer (404) - this is normal for new sessions');
    } else {
      console.warn('🎵 Device transfer failed:', transferResponse.status);
    }
  } catch (error) {
    console.warn('🎵 Error activating Web Playback device:', error);
  }
  
  return false;
};

/**
 * Play Spotify playlist
 */
/**
 * Play Spotify playlist - FIXED to play in browser, not desktop client
 */
export const playSpotifyPlaylist = async (playlistId, shuffle = false) => {
  if (!spotifyPlayer || !spotifyDeviceId) {
    throw new Error('Spotify player not ready');
  }
  
  try {
    console.log('🎵 Starting playlist playback in BROWSER (not desktop client)...');
    
    // First check if our Web Playback SDK player is still connected
    const currentState = await spotifyPlayer.getCurrentState();
    if (!currentState) {
      console.log('🎵 Web Playback SDK has no state, attempting to reconnect...');
      const connected = await spotifyPlayer.connect();
      if (!connected) {
        throw new Error('Could not reconnect Spotify player');
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for connection
    }
    
    // CRITICAL FIX: Force device activation to ensure BROWSER playback (not desktop)
    console.log('🎵 Forcing Web Playback SDK device to be active for BROWSER playback...');
    await activateWebPlaybackDevice();
    
    // Wait longer to ensure device transfer is complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify our browser device is actually active before starting playback
    const isActive = await isWebPlaybackDeviceActive();
    if (!isActive) {
      console.warn('🎵 Browser device not active, forcing activation again...');
      await activateWebPlaybackDevice();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('🎵 Starting playlist on Web Playback SDK device (browser audio)...');
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
      const errorData = await response.json().catch(() => ({}));
      console.error('Spotify API Error:', {
        status: response.status,
        error: errorData
      });
      
      if (response.status === 403) {
        if (errorData.error?.reason === 'PREMIUM_REQUIRED') {
          throw new Error('Spotify Premium vereist voor deze functie.');
        } else {
          // Enhanced retry strategy for 403 errors
          console.log('🎵 403 error - trying enhanced activation sequence...');
          
          try {
            // Step 1: Ensure we have the latest device state
            await spotifyPlayer.getCurrentState();
            
            // Step 2: Force device activation with play=true
            await fetch('https://api.spotify.com/v1/me/player', {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${spotifyAccessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                device_ids: [spotifyDeviceId],
                play: true // Force play to activate
              })
            });
            
            // Step 3: Wait and try playlist again
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const retryResponse = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`, {
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
            
            if (!retryResponse.ok) {
              throw new Error('Kon playlist niet starten na verbeterde activatie');
            }
            
            console.log('🎵 Successfully started playlist after enhanced activation');
          } catch (sdkError) {
            console.error('Enhanced activation also failed:', sdkError);
            throw new Error('Spotify Web Playback niet beschikbaar. Sluit je desktop Spotify app en probeer opnieuw.');
          }
        }
      } else if (response.status === 404) {
        throw new Error('Spotify apparaat niet gevonden. Herlaad de pagina en probeer opnieuw.');
      } else {
        throw new Error(`Spotify API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
    }
    
    // Set shuffle if requested
    if (shuffle) {
      await setSpotifyShuffleMode(true);
    }
    
    console.log('🎵 Spotify playlist started successfully in BROWSER via Web Playback SDK');
    
    // Verify playback is actually happening in browser
    setTimeout(async () => {
      const state = await spotifyPlayer.getCurrentState();
      if (state && !state.paused) {
        console.log('✅ Confirmed: Music is playing in browser, controls should work');
      } else {
        console.warn('⚠️ Music may still be playing on desktop client instead of browser');
      }
    }, 3000);
    
    return true;
  } catch (error) {
    console.error('Error playing Spotify playlist:', error);
    throw error;
  }
};

/**
 * Enhanced control functions with auth checks
 */
export const pauseSpotify = async () => {
  if (!isSpotifyAuthenticated()) {
    console.warn('Cannot pause Spotify - not authenticated');
    return;
  }
  
  if (spotifyPlayer) {
    try {
      await spotifyPlayer.pause();
      console.log('🎵 Spotify paused via Web Playback SDK (browser)');
      return;
    } catch (error) {
      // Suppress CloudPlaybackClientError 404s
      if (error.message && error.message.includes('CloudPlaybackClientError') && error.message.includes('404')) {
        console.warn('🎵 Suppressed CloudPlaybackClientError 404 during pause');
        return;
      }
      console.warn('Could not pause via Web Playback SDK:', error);
    }
  }
  
  // Fallback to Web API with device targeting
  try {
    const pauseUrl = spotifyDeviceId 
      ? `https://api.spotify.com/v1/me/player/pause?device_id=${spotifyDeviceId}`
      : 'https://api.spotify.com/v1/me/player/pause';
      
    await fetch(pauseUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`
      }
    });
    console.log('🎵 Spotify paused via Web API');
  } catch (apiError) {
    if (!apiError.message.includes('CloudPlaybackClientError')) {
      console.error('Both SDK and API pause failed:', apiError);
    }
  }
};

export const resumeSpotify = async () => {
  if (!isSpotifyAuthenticated()) {
    console.warn('Cannot resume Spotify - not authenticated');
    return;
  }
  
  if (spotifyPlayer) {
    try {
      await spotifyPlayer.resume();
      console.log('🎵 Spotify resumed via Web Playback SDK (browser)');
      return;
    } catch (error) {
      // Suppress CloudPlaybackClientError 404s
      if (error.message && error.message.includes('CloudPlaybackClientError') && error.message.includes('404')) {
        console.warn('🎵 Suppressed CloudPlaybackClientError 404 during resume');
        return;
      }
      console.warn('Could not resume via Web Playback SDK:', error);
    }
  }
  
  // Fallback to Web API
  try {
    const playUrl = spotifyDeviceId 
      ? `https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`
      : 'https://api.spotify.com/v1/me/player/play';
      
    await fetch(playUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`
      }
    });
    console.log('🎵 Spotify resumed via Web API');
  } catch (apiError) {
    if (!apiError.message.includes('CloudPlaybackClientError')) {
      console.error('Both SDK and API resume failed:', apiError);
    }
  }
};

export const nextSpotifyTrack = async () => {
  if (spotifyPlayer) {
    try {
      // First try SDK method (works when playing in browser)
      await spotifyPlayer.nextTrack();
      console.log('🎵 Spotify next track via Web Playback SDK (browser)');
      return;
    } catch (error) {
      console.warn('Could not skip to next track via Web Playback SDK:', error);
    }
  }
  
  // Fallback to Web API with device targeting
  try {
    const nextUrl = spotifyDeviceId 
      ? `https://api.spotify.com/v1/me/player/next?device_id=${spotifyDeviceId}`
      : 'https://api.spotify.com/v1/me/player/next';
      
    await fetch(nextUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`
      }
    });
    console.log('🎵 Spotify next track via Web API');
  } catch (apiError) {
    console.error('Both SDK and API next track failed:', apiError);
  }
};

export const setSpotifyVolume = async (volume) => {
  if (spotifyPlayer && typeof volume === 'number' && volume >= 0 && volume <= 100) {
    try {
      // First try SDK method (works when playing in browser)
      await spotifyPlayer.setVolume(volume / 100);
      console.log('🔊 Spotify volume set via Web Playback SDK (browser):', volume);
      return;
    } catch (error) {
      console.warn('Could not set volume via Web Playback SDK:', error);
    }
  }
  
  // Fallback to Web API with device targeting
  try {
    const volumeUrl = spotifyDeviceId 
      ? `https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}&device_id=${spotifyDeviceId}`
      : `https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`;
      
    await fetch(volumeUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`
      }
    });
    console.log('🔊 Spotify volume set via Web API:', volume);
  } catch (apiError) {
    console.error('Both SDK and API volume control failed:', apiError);
  }
};

export const previousSpotifyTrack = async () => {
  if (spotifyPlayer) {
    try {
      await spotifyPlayer.previousTrack();
      console.log('🎵 Spotify previous track via Web Playback SDK');
    } catch (error) {
      console.warn('Could not skip to previous track via Web Playback SDK:', error);
      // Fallback to Web API
      try {
        await fetch('https://api.spotify.com/v1/me/player/previous', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${spotifyAccessToken}`
          }
        });
        console.log('🎵 Spotify previous track via Web API fallback');
      } catch (apiError) {
        console.error('Both SDK and API previous track failed:', apiError);
      }
    }
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
 * Get current playback state with device information
 */
export const getSpotifyPlaybackState = async () => {
  if (spotifyPlayer) {
    try {
      const state = await spotifyPlayer.getCurrentState();
      console.log('🎵 Web Playback SDK state:', state);
      return state;
    } catch (error) {
      console.warn('Could not get state from Web Playback SDK:', error);
      return null;
    }
  }
  return null;
};

/**
 * Check if our Web Playback SDK device is the active device
 */
export const isWebPlaybackDeviceActive = async () => {
  if (!spotifyAccessToken) return false;
  
  // Cache for 2 seconds to reduce API spam
  const now = Date.now();
  if (now - lastDeviceCheck < 2000) {
    return lastDeviceState;
  }
  
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: { 'Authorization': `Bearer ${spotifyAccessToken}` }
    });
    
    if (response.ok) {
      const playerState = await response.json();
      
      if (!spotifyDeviceId && playerState.device?.name === 'No Ads Radio Browser Player') {
        spotifyDeviceId = playerState.device.id;
        window.spotifyDeviceId = spotifyDeviceId;
      }
      
      const isActive = playerState.device?.id === spotifyDeviceId;
      lastDeviceCheck = now;
      lastDeviceState = isActive;
      
      // Only log when state changes
      if (isActive !== lastDeviceState) {
        console.log('🎵 Device active:', isActive);
      }
      
      return isActive;
    }
  } catch (error) {
    console.warn('Device check failed:', error);
  }
  
  return false;
};

/**
 * Activate device - REDUCED spam
 */
export const ensureWebPlaybackDeviceActive = async () => {
  if (!spotifyDeviceId) {
    await findOurDeviceId();
    if (!spotifyDeviceId) {
      console.error('No Spotify device found');
      return false;
    }
  }
  
  const isActive = await isWebPlaybackDeviceActive();
  if (isActive) {
    return true;
  }
  
  console.log('🎵 Activating Spotify device...');
  await activateWebPlaybackDevice();
  
  // Single verification
  await new Promise(resolve => setTimeout(resolve, 1000));
  return await isWebPlaybackDeviceActive();
};
/**
 * Clear Spotify authentication - ENHANCED
 */

export const clearSpotifyAuth = () => {
  console.log('🔐 Clearing Spotify authentication...');
  
  // Clear tokens first to prevent any further operations
  spotifyAccessToken = null;
  spotifyTokenExpiry = null;
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_token_expiry');
  localStorage.removeItem('spotify_auth_state');
  localStorage.removeItem('spotify_code_verifier');
  
  // SAFE disconnect and cleanup player
  if (spotifyPlayer) {
    try {
      console.log('🎵 Disconnecting Spotify player...');
      
      // Check if methods exist before calling them
      if (typeof spotifyPlayer.removeAllListeners === 'function') {
        spotifyPlayer.removeAllListeners();
      }
      
      if (typeof spotifyPlayer.disconnect === 'function') {
        spotifyPlayer.disconnect();
      }
      
      // Pause if playing
      if (typeof spotifyPlayer.pause === 'function') {
        try {
          spotifyPlayer.pause();
        } catch (pauseError) {
          console.warn('Could not pause Spotify player during logout:', pauseError);
        }
      }
      
    } catch (error) {
      console.warn('Error disconnecting Spotify player:', error);
    } finally {
      // Always clear the reference
      spotifyPlayer = null;
      spotifyDeviceId = null;
      window.spotifyDeviceId = null;
    }
  }
  
  // Reset initialization state
  isPlayerInitializing = false;
  playerInitPromise = null;
  
  // Clear cache
  lastDeviceCheck = 0;
  lastDeviceState = false;
  
  console.log('🔐 Spotify authentication cleared completely');
};


/**
 * Enhanced authentication check with auto-restore
 */
export const isSpotifyAuthenticated = () => {
  // First check module-level variables
  if (spotifyAccessToken && spotifyTokenExpiry && Date.now() < spotifyTokenExpiry) {
    return true;
  }
  
  // Try to restore from localStorage (handles F5 refresh)
  const restored = initializeSpotifyAuth();
  if (restored) {
    console.log('🎵 Authentication restored after page refresh');
    return true;
  }
  
  return false;
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

/**
 * Find our device ID if it's missing - NEW FUNCTION
 */
const findOurDeviceId = async () => {
  if (!spotifyAccessToken) return null;
  
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`
      }
    });
    
    if (response.ok) {
      const devices = await response.json();
      const ourDevice = devices.devices.find(d => d.name === 'No Ads Radio Browser Player');
      
      if (ourDevice) {
        console.log('🔧 Found our device via device list:', ourDevice.id);
        spotifyDeviceId = ourDevice.id;
        window.spotifyDeviceId = spotifyDeviceId;
        return ourDevice.id;
      }
    }
  } catch (error) {
    console.warn('Error finding device ID:', error);
  }
  
  return null;
};

// Initialize on module load
initializeSpotifyAuth();

// ✅ FIX: Add device activation function
export const activateSpotifyDevice = async () => {
  if (!spotifyDeviceId || !spotifyAccessToken) {
    console.warn('Cannot activate device: missing device ID or token');
    return false;
  }
  
  try {
    console.log('🎵 Activating Spotify device...');
    
    // Transfer playback to our device
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device_ids: [spotifyDeviceId],
        play: false
      })
    });
    
    if (response.ok || response.status === 404) {
      console.log('✅ Spotify device activated successfully');
      return true;
    } else {
      console.warn('Failed to activate device:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error activating Spotify device:', error);
    return false;
  }
};

// Add this export to prevent duplicate initialization
export const isSpotifyPlayerInitializing = () => {
  return isPlayerInitializing;
};
window.spotifyUtils = {
  resetInitializationState,
  isPlayerInitializing: () => isPlayerInitializing,
  getCurrentPlayer: () => spotifyPlayer,
  getCurrentDeviceId: () => spotifyDeviceId
};