// src/utils/spotifyUtils.js - Spotify authentication (PKCE popup flow) and Web API helpers.
// Playback itself is handled by SpotifySource in services/SpotifyService.js, which reads
// the access token this module stores in localStorage.

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

// Must match a redirect URI registered in the Spotify Developer Dashboard exactly.
const getRedirectUri = () => `${window.location.origin}/radio-zonder-reclame/callback.html`;

let spotifyAccessToken = null;
let spotifyTokenExpiry = null;

/**
 * Restore a still-valid token from localStorage (e.g. after a page refresh).
 * Clears stored auth when the token has expired.
 */
const restoreSpotifyAuth = () => {
  const token = localStorage.getItem('spotify_access_token');
  const expiry = localStorage.getItem('spotify_token_expiry');

  if (token && expiry && Date.now() < parseInt(expiry)) {
    spotifyAccessToken = token;
    spotifyTokenExpiry = parseInt(expiry);
    return true;
  }
  if (token && expiry) {
    clearSpotifyAuth();
  }
  return false;
};

// --- PKCE helpers ---

const base64UrlEncode = (bytes) =>
  btoa(String.fromCharCode.apply(null, bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
};

const generateCodeChallenge = async (verifier) => {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
};

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

/**
 * Build the Spotify authorization URL and store the PKCE state/verifier for the token exchange.
 */
const getSpotifyAuthUrl = async () => {
  const state = generateRandomString(16);
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  localStorage.setItem('spotify_auth_state', state);
  localStorage.setItem('spotify_code_verifier', codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CONFIG.clientId,
    scope: SPOTIFY_CONFIG.scopes,
    redirect_uri: getRedirectUri(),
    state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    show_dialog: 'true'
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

/**
 * Exchange the authorization code for an access token (PKCE) and persist it.
 */
const exchangeCodeForToken = async (code, state) => {
  const storedState = localStorage.getItem('spotify_auth_state');
  const codeVerifier = localStorage.getItem('spotify_code_verifier');

  if (state !== storedState) {
    throw new Error('State mismatch error');
  }
  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      client_id: SPOTIFY_CONFIG.clientId,
      code_verifier: codeVerifier
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Spotify token exchange failed:', errorData);
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  const data = await response.json();
  spotifyAccessToken = data.access_token;
  spotifyTokenExpiry = Date.now() + (data.expires_in * 1000);

  localStorage.setItem('spotify_access_token', spotifyAccessToken);
  localStorage.setItem('spotify_token_expiry', spotifyTokenExpiry.toString());
  localStorage.removeItem('spotify_code_verifier');
  localStorage.removeItem('spotify_auth_state');

  return { accessToken: spotifyAccessToken, expiryTime: spotifyTokenExpiry };
};

/**
 * Log in via a popup. public/callback.html posts SPOTIFY_AUTH_SUCCESS / SPOTIFY_AUTH_ERROR
 * back to this window; the code is then exchanged for a token.
 */
export const loginToSpotify = async () => {
  // Spotify (and crypto.subtle) require a secure context (HTTPS or localhost)
  if (!window.isSecureContext && window.location.protocol !== 'https:') {
    throw new Error('Spotify authentication requires HTTPS. Please use a secure connection.');
  }

  const authUrl = await getSpotifyAuthUrl();

  return new Promise((resolve, reject) => {
    const popup = window.open(
      authUrl,
      'spotifyLogin',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'));
      return;
    }

    const pollTimer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(pollTimer);
          reject(new Error('Login cancelled by user'));
        }
      } catch {
        // Accessing a cross-origin popup can throw; ignore and keep polling
      }
    }, 1000);

    const messageHandler = async (event) => {
      if (event.origin !== window.location.origin && !event.origin.includes('spotify.com')) {
        console.warn('Ignoring message from unexpected origin:', event.origin);
        return;
      }

      if (event.data.type === 'SPOTIFY_AUTH_SUCCESS') {
        clearInterval(pollTimer);
        window.removeEventListener('message', messageHandler);
        popup.close();

        try {
          const tokenData = await exchangeCodeForToken(event.data.code, event.data.state);
          resolve({ success: true, token: tokenData.accessToken });
        } catch (error) {
          reject(error);
        }
      } else if (event.data.type === 'SPOTIFY_AUTH_ERROR') {
        clearInterval(pollTimer);
        window.removeEventListener('message', messageHandler);
        popup.close();

        const error = event.data.error;
        const errorDescription = event.data.errorDescription || '';
        console.error('Spotify auth error:', error, errorDescription, '- redirect URI:', getRedirectUri());

        const description = errorDescription.toLowerCase();
        const isRedirectUriError = error === 'invalid_client'
          || description.includes('redirect_uri')
          || description.includes('redirect uri');

        if (isRedirectUriError) {
          // Usually means this origin's redirect URI is not registered in the Spotify Developer Dashboard
          const helpUrl = `${window.location.origin}/radio-zonder-reclame/spotify-fix.html`;
          console.error(`Add this redirect URI to the Spotify app (client ID ${SPOTIFY_CONFIG.clientId}): ${getRedirectUri()}. See ${helpUrl}`);

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

    // Give up after 5 minutes
    setTimeout(() => {
      clearInterval(pollTimer);
      window.removeEventListener('message', messageHandler);
      if (!popup.closed) {
        popup.close();
      }
      reject(new Error('Authentication timeout - please try again'));
    }, 300000);
  });
};

/**
 * Get the user's playlists, optionally filtered by name/description.
 */
export const getUserPlaylists = async (searchQuery = '', limit = 50) => {
  if (!spotifyAccessToken) {
    throw new Error('No Spotify access token available');
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearSpotifyAuth();
        throw new Error('Spotify token expired');
      }
      throw new Error(`Failed to fetch playlists: ${response.status}`);
    }

    const data = await response.json();
    let playlists = data.items || [];

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
 * Remove the stored token and PKCE data.
 */
const clearSpotifyAuth = () => {
  spotifyAccessToken = null;
  spotifyTokenExpiry = null;
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_token_expiry');
  localStorage.removeItem('spotify_auth_state');
  localStorage.removeItem('spotify_code_verifier');
};

/**
 * True when a non-expired token is available (restores it from localStorage if needed).
 */
export const isSpotifyAuthenticated = () => {
  if (spotifyAccessToken && spotifyTokenExpiry && Date.now() < spotifyTokenExpiry) {
    return true;
  }
  return restoreSpotifyAuth();
};

export const logoutFromSpotify = () => {
  clearSpotifyAuth();
  return true;
};

/**
 * Validate a Spotify playlist URL or ID and return its metadata.
 */
export const validateSpotifyPlaylist = async (playlistIdOrUrl) => {
  if (!spotifyAccessToken) {
    return { isValid: false, error: 'Not authenticated' };
  }

  let playlistId = playlistIdOrUrl;
  if (playlistIdOrUrl.includes('spotify.com/playlist/')) {
    const match = playlistIdOrUrl.match(/playlist\/([a-zA-Z0-9]+)/);
    if (match) {
      playlistId = match[1];
    }
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        'Authorization': `Bearer ${spotifyAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

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

restoreSpotifyAuth();
