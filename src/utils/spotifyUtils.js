// src/utils/spotifyUtils.js - Spotify Web API integration utilities

// --- Robustly wait for Spotify SDK to be available ---
export const waitForSpotifySDK = (timeoutMs = 30000, pollInterval = 100) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    let checkCount = 0;
    
    function check() {
      checkCount++;
      
      // Log progress every 50 checks (5 seconds at 100ms intervals)
      if (checkCount % 50 === 0) {
        console.log(`🎵 Waiting for Spotify SDK... (${Math.round((Date.now() - start) / 1000)}s)`);
        console.log('🎵 SDK state:', {
          'window.Spotify': !!window.Spotify,
          'window.Spotify.Player': !!(window.Spotify && window.Spotify.Player),
          'typeof Player': window.Spotify ? typeof window.Spotify.Player : 'undefined'
        });
      }
      
      if (window.Spotify && typeof window.Spotify.Player === 'function') {
        console.log(`🎵 Spotify SDK detected after ${Math.round((Date.now() - start) / 1000)}s (${checkCount} checks)`);
        resolve();
        return;
      }
      
      if (Date.now() - start > timeoutMs) {
        console.error(`🎵 Spotify SDK timeout after ${Math.round(timeoutMs / 1000)}s (${checkCount} checks)`);
        console.error('🎵 Final SDK state:', {
          'window.Spotify': !!window.Spotify,
          'window.Spotify.Player': !!(window.Spotify && window.Spotify.Player),
          'typeof Player': window.Spotify ? typeof window.Spotify.Player : 'undefined',
          'script tags': document.querySelectorAll('script[src*="spotify-player"]').length
        });
        reject(new Error('Spotify Web Playback SDK did not load in time.'));
        return;
      }
      
      setTimeout(check, pollInterval);
    }
    check();
  });
};

// --- Robustly load the Spotify Web Playback SDK and wait for it to be ready ---
let spotifySDKLoadingPromise = null;
let sdkReadyResolver = null;

// Define the global callback function that Spotify SDK expects
window.onSpotifyWebPlaybackSDKReady = () => {
  console.log('🎵 Spotify Web Playback SDK ready callback fired');
  
  // If we have a waiting resolver, resolve it immediately
  if (sdkReadyResolver) {
    console.log('🎵 Resolving SDK loading promise from callback');
    sdkReadyResolver();
    sdkReadyResolver = null;
  }
  
  // This callback is automatically called by the Spotify SDK when it's ready
};

export const loadSpotifyWebPlaybackSDK = () => {
  if (window.Spotify && typeof window.Spotify.Player === 'function') {
    console.log('🎵 Spotify SDK already available');
    return Promise.resolve();
  }
  
  if (spotifySDKLoadingPromise) {
    console.log('🎵 SDK loading already in progress');
    return spotifySDKLoadingPromise;
  }
  
  console.log('🎵 Starting Spotify SDK loading...');
  spotifySDKLoadingPromise = new Promise((resolve, reject) => {
    // Store resolver for callback
    sdkReadyResolver = resolve;
    
    // Check for duplicate script tags
    const existingScripts = Array.from(document.querySelectorAll('script[src="https://sdk.scdn.co/spotify-player.js"]'));
    if (existingScripts.length > 1) {
      console.warn('[Spotify SDK] Duplicate SDK script tags detected! This will break the SDK.');
      existingScripts.forEach((s, i) => console.warn(`[Spotify SDK] Script #${i+1}:`, s));
      sdkReadyResolver = null;
      reject(new Error('Duplicate Spotify SDK script tags detected. Remove all but one.'));
      return;
    }
    
    if (existingScripts.length === 1 && window.Spotify && typeof window.Spotify.Player === 'function') {
      sdkReadyResolver = null;
      resolve();
      return;
    }
    
    if (existingScripts.length === 1) {
      // Script exists, wait for SDK to be ready
      console.log('🎵 SDK script already loaded, waiting for initialization...');
      waitForSpotifySDK(30000, 100).then(() => {
        sdkReadyResolver = null;
        resolve();
      }).catch((error) => {
        sdkReadyResolver = null;
        reject(error);
      });
      return;
    }
    
    // Otherwise, inject the script
    console.log('🎵 Injecting Spotify SDK script...');
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    
    script.onload = () => {
      console.log('🎵 SDK script loaded, waiting for initialization...');
      waitForSpotifySDK(30000, 100).then(() => {
        sdkReadyResolver = null;
        resolve();
      }).catch((error) => {
        sdkReadyResolver = null;
        reject(error);
      });
    };
    
    script.onerror = (e) => {
      console.error('🎵 Failed to load Spotify SDK script');
      sdkReadyResolver = null;
      reject(new Error('Failed to load Spotify Web Playback SDK script.'));
    };
    
    document.body.appendChild(script);
  });
  
  return spotifySDKLoadingPromise;
};

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
  get redirectUri() { return getRedirectUri(); },
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
let isPlayerInitializing = false; // Prevent multiple initialization attempts
let playerInitPromise = null; // Store the initialization promise to reuse it

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
  if (isPlayerInitializing && playerInitPromise) {
    console.log('🎵 Spotify player initialization already in progress, waiting...');
    return playerInitPromise;
  }
  if (spotifyPlayer && spotifyDeviceId) {
    console.log('🎵 Spotify player already exists, checking connection...');
    return spotifyPlayer.getCurrentState().then((state) => {
      console.log('🎵 Existing player state check result:', state !== null ? 'connected' : 'needs reconnection');
      if (state !== null || state === null) {
        return spotifyPlayer;
      } else {
        console.log('🎵 Reconnecting existing player...');
        return spotifyPlayer.connect().then((success) => {
          if (success) {
            return spotifyPlayer;
          } else {
            throw new Error('Reconnection failed');
          }
        });
      }
    }).catch((error) => {
      console.log('🎵 Existing player unresponsive, creating new one...', error);
      if (spotifyPlayer) {
        try { spotifyPlayer.disconnect(); } catch (e) { console.warn('Error disconnecting old player:', e); }
      }
      spotifyPlayer = null;
      spotifyDeviceId = null;
      return initializeSpotifyPlayer();
    });
  }
  isPlayerInitializing = true;
  playerInitPromise = new Promise(async (resolve, reject) => {
    try {
      await loadSpotifyWebPlaybackSDK();
      createSpotifyPlayer(resolve, reject);
    } catch (err) {
      console.error('❌ Fout bij laden van Spotify SDK:', err);
      if (window.addNotification) {
        window.addNotification('❌ Spotify Web Playback SDK kon niet geladen worden. Controleer je netwerk, adblockers, of probeer opnieuw.', 'error', 12000);
      }
      reject(new Error('Spotify Web Playback SDK kon niet geladen worden. Controleer je netwerk, adblockers, of probeer opnieuw.'));
    }
  }).finally(() => {
    isPlayerInitializing = false;
    playerInitPromise = null;
  });
  return playerInitPromise;
};

/**
 * Create Spotify player instance
 */
const createSpotifyPlayer = (resolve, reject) => {
  if (!spotifyAccessToken) {
    reject(new Error('No Spotify access token'));
    return;
  }
  
  // ✅ FIX: Prevent multiple concurrent player creation
  if (spotifyPlayer) {
    console.log('🎵 Player creation already in progress or complete, using existing player');
    resolve(spotifyPlayer);
    return;
  }
  
  console.log('🎵 Creating new Spotify Web Playback SDK player...');
  spotifyPlayer = new window.Spotify.Player({
    name: 'No Ads Radio Browser Player', // Make it clear this is the browser player
    getOAuthToken: cb => cb(spotifyAccessToken),
    volume: 0.5
  });
    // Add timeout for player creation
  const creationTimeout = setTimeout(() => {
    console.error('🎵 Spotify player creation timeout');
    spotifyPlayer = null;
    spotifyDeviceId = null;
    reject(new Error('Player creation timeout'));
  }, 30000); // 30 second timeout to match initialization timeout
  
  // Error handling
  spotifyPlayer.addListener('initialization_error', ({ message }) => {
    console.error('🎵 Spotify initialization error:', message);
    clearTimeout(creationTimeout);
    spotifyPlayer = null;
    spotifyDeviceId = null;
    reject(new Error(message));
  });
  
  spotifyPlayer.addListener('authentication_error', ({ message }) => {
    console.error('🎵 Spotify authentication error:', message);
    clearTimeout(creationTimeout);
    spotifyPlayer = null;
    spotifyDeviceId = null;
    clearSpotifyAuth();
    reject(new Error(message));
  });
  
  spotifyPlayer.addListener('account_error', ({ message }) => {
    console.error('🎵 Spotify account error:', message);
    clearTimeout(creationTimeout);
    spotifyPlayer = null;
    spotifyDeviceId = null;
    reject(new Error(message));
  });
    // Add more detailed state logging
  spotifyPlayer.addListener('player_state_changed', (state) => {
    console.log('🎵 Web Playback SDK state changed:', state ? 'playing' : 'paused');
    if (state && state.track_window && state.track_window.current_track) {
      console.log('🎵 Current track:', state.track_window.current_track.name, 'by', state.track_window.current_track.artists[0].name);
    }
  });
  
  // Track if ready event fired
  let readyEventFired = false;
    // Ready
  spotifyPlayer.addListener('ready', ({ device_id }) => {
    console.log('🎵 Spotify Web Playback SDK ready with device ID:', device_id);
    readyEventFired = true;
    clearTimeout(creationTimeout);
    spotifyDeviceId = device_id;
    
    // Store device ID globally for access IMMEDIATELY
    window.spotifyDeviceId = device_id;
    window.spotifyPlayerInstance = spotifyPlayer;
    
    // Immediately activate this device as the primary playback device
    activateWebPlaybackDevice().then(() => {
      console.log('🎵 Browser device activated successfully');
      resolve(spotifyPlayer);
    }).catch((error) => {
      console.warn('🎵 Could not activate browser device, but player is ready:', error);
      resolve(spotifyPlayer); // Still resolve since player is ready
    });
  });
  
  spotifyPlayer.addListener('not_ready', ({ device_id }) => {
    console.warn('🎵 Spotify Web Playback SDK not ready with device ID:', device_id);
    spotifyDeviceId = null;
  });
    // Connect with error handling
  spotifyPlayer.connect().then(success => {
    if (success) {
      console.log('🎵 Spotify Web Playback SDK connected successfully');
        // Fallback: Check if player is actually ready after connection
      setTimeout(async () => {
        if (!readyEventFired && spotifyPlayer) {
          console.log('🎵 Ready event not fired yet, checking player state manually...');
          try {
            const state = await spotifyPlayer.getCurrentState();
            console.log('🎵 Manual state check result:', state);
            
            // If we can get state, the player is likely working
            if (state !== undefined) {
              console.log('🎵 Player appears to be working despite no ready event, checking device...');
              
              // Try to get device ID from Web API
              const devicesResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
                headers: {
                  'Authorization': `Bearer ${spotifyAccessToken}`
                }
              });
              
              if (devicesResponse.ok) {
                const devices = await devicesResponse.json();
                const webPlaybackDevice = devices.devices.find(device => 
                  device.name.includes('No Ads Radio Browser Player') || 
                  device.type === 'Computer'
                );
                
                if (webPlaybackDevice) {
                  console.log('🎵 Found web playback device:', webPlaybackDevice);
                  spotifyDeviceId = webPlaybackDevice.id;
                  window.spotifyDeviceId = webPlaybackDevice.id;
                  clearTimeout(creationTimeout);
                  
                  try {
                    await activateWebPlaybackDevice();
                    console.log('🎵 Fallback device activation successful');
                  } catch (error) {
                    console.warn('🎵 Fallback device activation failed, but player is working:', error);
                  }
                  
                  resolve(spotifyPlayer);
                  return;
                }
              }
            }
          } catch (error) {
            console.log('🎵 Manual state check failed:', error);
          }
        }
      }, 3000); // Reduced from 5s to 3s for faster fallback
      
      // More aggressive fallback - check every 2 seconds
      let fallbackCheckCount = 0;
      const fallbackInterval = setInterval(async () => {
        fallbackCheckCount++;
        
        if (readyEventFired) {
          clearInterval(fallbackInterval);
          return;
        }
        
        if (fallbackCheckCount > 10) { // Stop after 20 seconds
          clearInterval(fallbackInterval);
          return;
        }
        
        console.log(`🎵 Fallback check ${fallbackCheckCount} - checking if player is actually working...`);
        
        try {
          // Check if player can get current state
          const state = await spotifyPlayer.getCurrentState();
          
          // Also check if we can see any devices via Web API
          const devicesResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
            headers: {
              'Authorization': `Bearer ${spotifyAccessToken}`
            }
          });
          
          if (devicesResponse.ok) {
            const devices = await devicesResponse.json();
            console.log('🎵 Available devices:', devices.devices);
            
            // Look for our Web Playback device
            const webPlaybackDevice = devices.devices.find(device => 
              device.name.includes('No Ads Radio Browser Player') || 
              (device.type === 'Computer' && device.is_active)
            );
            
            if (webPlaybackDevice) {
              console.log('🎵 Aggressive fallback found working device:', webPlaybackDevice);
              readyEventFired = true; // Prevent further checks
              clearInterval(fallbackInterval);
              clearTimeout(creationTimeout);
              
              spotifyDeviceId = webPlaybackDevice.id;
              window.spotifyDeviceId = webPlaybackDevice.id;
              
              // Activate device and resolve
              try {
                await activateWebPlaybackDevice();
                console.log('🎵 Aggressive fallback device activation successful');
              } catch (error) {
                console.warn('🎵 Aggressive fallback device activation failed, but player exists:', error);
              }
              
              resolve(spotifyPlayer);
              return;
            }
          }
        } catch (error) {
          console.log(`🎵 Fallback check ${fallbackCheckCount} failed:`, error);
        }
      }, 2000);
      
    } else {
      console.error('🎵 Failed to connect Spotify Web Playback SDK');
      clearTimeout(creationTimeout);
      spotifyPlayer = null;
      spotifyDeviceId = null;
      reject(new Error('Failed to connect to Spotify Web Playback SDK'));
    }
  }).catch(error => {
    console.error('🎵 Error connecting Spotify Web Playback SDK:', error);
    clearTimeout(creationTimeout);
    spotifyPlayer = null;
    spotifyDeviceId = null;
    reject(error);
  });
};

/**
 * Activate the Web Playback SDK device as the primary device
 */
const activateWebPlaybackDevice = async () => {
  if (!spotifyDeviceId || !spotifyAccessToken) {
    throw new Error('Device ID or access token not available');
  }
  
  console.log('🎵 Activating Web Playback SDK device:', spotifyDeviceId);
  
  try {
    // First, transfer playback to our device to make it active
    const transferResponse = await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device_ids: [spotifyDeviceId],
        play: false // Don't start playing immediately
      })
    });
    
    if (transferResponse.ok) {
      console.log('🎵 Playback transferred to Web Playback SDK device');
      
      // Wait a moment for the transfer to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the device is now active
      const stateResponse = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${spotifyAccessToken}`
        }
      });
      
      if (stateResponse.ok) {
        const playerState = await stateResponse.json();
        if (playerState.device && playerState.device.id === spotifyDeviceId) {
          console.log('🎵 Web Playback SDK device is now the active device');
          return true;
        } else {
          console.warn('🎵 Device transfer may not have completed. Current device:', playerState.device?.name);
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
export const playSpotifyPlaylist = async (playlistId, shuffle = false) => {
  if (!spotifyPlayer || !spotifyDeviceId) {
    throw new Error('Spotify player not ready');
  }
  
  try {
    // ✅ FIX: Ensure Web Playback SDK is the active device and ready
    console.log('🎵 Ensuring Web Playback SDK is active and ready...');
    
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
    
    // Force device activation to ensure browser playback
    console.log('🎵 Activating Web Playback SDK device...');
    await activateWebPlaybackDevice();
    
    // Additional wait to ensure device transfer is complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Now try to start playback using the Web API targeting our specific device
    console.log('🎵 Starting playlist playback on Web Playback SDK device...');
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
        // ✅ FIX: Better 403 error handling for Premium users
        if (errorData.error?.reason === 'PREMIUM_REQUIRED') {
          throw new Error('Spotify Premium vereist voor deze functie.');
        } else if (errorData.error?.message?.includes('Player command failed: Restriction violated')) {
          throw new Error('Deze playlist kan niet worden afgespeeld. Mogelijk vanwege licentierestricties of regionale beperkingen.');
        } else {
          // Try starting any track first to "wake up" the player
          console.log('🎵 403 error, trying to start any track first to activate player...');
          
          try {
            // Start playback without specific context first
            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${spotifyAccessToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            // Wait a moment then try the playlist again
            await new Promise(resolve => setTimeout(resolve, 1000));
            
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
              throw new Error('Kon playlist niet starten na player activatie');
            }
            
            console.log('🎵 Successfully started playlist after player activation');
          } catch (sdkError) {
            console.error('Player activation also failed:', sdkError);
            throw new Error('Spotify playback niet beschikbaar. Zorg ervoor dat je Spotify Premium hebt en probeer de pagina te herladen.');
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
    
    console.log('🎵 Spotify playlist started successfully on Web Playback SDK');
    return true;
  } catch (error) {
    console.error('Error playing Spotify playlist:', error);
    throw error;
  }
};

/**
 * Control Spotify playback with null safety
 */
export const pauseSpotify = async () => {
  if (spotifyPlayer) {
    try {
      await spotifyPlayer.pause();
      console.log('🎵 Spotify paused via Web Playback SDK');
    } catch (error) {
      console.warn('Could not pause via Web Playback SDK:', error);
      // Fallback to Web API
      try {
        await fetch('https://api.spotify.com/v1/me/player/pause', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${spotifyAccessToken}`
          }
        });
        console.log('🎵 Spotify paused via Web API fallback');
      } catch (apiError) {
        console.error('Both SDK and API pause failed:', apiError);
      }
    }
  }
};

export const resumeSpotify = async () => {
  if (spotifyPlayer) {
    try {
      await spotifyPlayer.resume();
      console.log('🎵 Spotify resumed via Web Playback SDK');
    } catch (error) {
      console.warn('Could not resume via Web Playback SDK:', error);
      // Fallback to Web API
      try {
        await fetch('https://api.spotify.com/v1/me/player/play', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${spotifyAccessToken}`
          }
        });
        console.log('🎵 Spotify resumed via Web API fallback');
      } catch (apiError) {
        console.error('Both SDK and API resume failed:', apiError);
      }
    }
  }
};

export const nextSpotifyTrack = async () => {
  if (spotifyPlayer) {
    try {
      await spotifyPlayer.nextTrack();
      console.log('🎵 Spotify next track via Web Playback SDK');
    } catch (error) {
      console.warn('Could not skip to next track via Web Playback SDK:', error);
      // Fallback to Web API
      try {
        await fetch('https://api.spotify.com/v1/me/player/next', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${spotifyAccessToken}`
          }
        });
        console.log('🎵 Spotify next track via Web API fallback');
      } catch (apiError) {
        console.error('Both SDK and API next track failed:', apiError);
      }
    }
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

export const setSpotifyVolume = async (volume) => {
  if (spotifyPlayer && typeof volume === 'number' && volume >= 0 && volume <= 100) {
    try {
      await spotifyPlayer.setVolume(volume / 100);
      console.log('🔊 Spotify volume set via Web Playback SDK:', volume);
    } catch (error) {
      console.warn('Could not set volume via Web Playback SDK:', error);
      // Fallback to Web API
      try {
        await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${spotifyAccessToken}`
          }
        });
        console.log('🔊 Spotify volume set via Web API fallback:', volume);
      } catch (apiError) {
        console.error('Both SDK and API volume control failed:', apiError);
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
  
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`
      }
    });
    
    if (response.ok) {
      const playerState = await response.json();
      const isActive = playerState.device && playerState.device.id === spotifyDeviceId;
      console.log('🎵 Web Playback device active check:', {
        currentDevice: playerState.device?.name,
        currentDeviceId: playerState.device?.id,
        ourDeviceId: spotifyDeviceId,
        isActive
      });
      return isActive;
    } else if (response.status === 204) {
      console.log('🎵 No active device found (204)');
      return false;
    }
  } catch (error) {
    console.warn('Error checking device status:', error);
  }
  
  return false;
};

/**
 * Force activation of Web Playback SDK device
 */
export const ensureWebPlaybackDeviceActive = async () => {
  const isActive = await isWebPlaybackDeviceActive();
  
  if (!isActive) {
    console.log('🎵 Web Playback device not active, forcing activation...');
    await activateWebPlaybackDevice();
    
    // Wait and verify
    await new Promise(resolve => setTimeout(resolve, 1000));
    const nowActive = await isWebPlaybackDeviceActive();
    
    if (nowActive) {
      console.log('🎵 Successfully activated Web Playback device');
    } else {
      console.warn('🎵 Failed to activate Web Playback device');
    }
    
    return nowActive;
  }
  
  console.log('🎵 Web Playback device already active');
  return true;
};

/**
 * Clear Spotify authentication
 */
export const clearSpotifyAuth = () => {
  console.log('🔐 Clearing Spotify authentication...');
  
  spotifyAccessToken = null;
  spotifyTokenExpiry = null;
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_token_expiry');
  localStorage.removeItem('spotify_auth_state');
  localStorage.removeItem('spotify_code_verifier');
  
  // ✅ FIX: Properly cleanup player with race condition protection
  if (spotifyPlayer) {
    try {
      console.log('🎵 Disconnecting Spotify player...');
      spotifyPlayer.disconnect();
    } catch (error) {
      console.warn('Error disconnecting Spotify player:', error);
    }
    spotifyPlayer = null;
    spotifyDeviceId = null;
  }
  
  // ✅ FIX: Reset initialization state to prevent stuck loading
  isPlayerInitializing = false;
  playerInitPromise = null;
  
  console.log('🔐 Spotify authentication cleared');
};

/**
 * Check if user is authenticated
 */
export const isSpotifyAuthenticated = () => {
  // First check module-level variables
  if (spotifyAccessToken && spotifyTokenExpiry && Date.now() < spotifyTokenExpiry) {
    return true;
  }
  
  // Fallback to localStorage check in case module variables aren't initialized
  const token = localStorage.getItem('spotify_access_token');
  const expiry = localStorage.getItem('spotify_token_expiry');
  
  if (token && expiry) {
    const expiryTime = parseInt(expiry);
    const isValid = Date.now() < expiryTime;
    
    // If valid, update module variables
    if (isValid) {
      spotifyAccessToken = token;
      spotifyTokenExpiry = expiryTime;
      return true;
    } else {
      // Token expired, clear everything
      clearSpotifyAuth();
      return false;
    }
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
