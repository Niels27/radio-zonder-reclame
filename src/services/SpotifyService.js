// services/SpotifyService.js - Spotify playback source for AudioManager.
// Wraps the Spotify Web Playback SDK (browser device) plus the Web API calls it needs.
// Authentication is handled by utils/spotifyUtils.js, which stores the token in localStorage.

export class SpotifySource {
  constructor() {
    this.player = null;
    this.deviceId = null;
    this.isReady = false;
    this.volume = 0.5;
    this.currentPlaylist = null;
    this.accessToken = null;
  }

  /**
   * Load the SDK and connect the browser player. Returns false when not logged in or on failure.
   */
  async initialize() {
    if (this.isReady) return true;

    try {
      this.accessToken = localStorage.getItem('spotify_access_token');
      if (!this.accessToken) {
        return false;
      }

      if (!window.Spotify) {
        await this._loadSpotifySDK();
      }

      await this._initializePlayer();
      return true;
    } catch (error) {
      console.error('SpotifyService: initialization failed', error);
      return false;
    }
  }

  async _loadSpotifySDK() {
    return new Promise((resolve, reject) => {
      if (window.Spotify) {
        resolve();
        return;
      }

      // Must set callback BEFORE loading the script - the SDK calls it during execution
      window.onSpotifyWebPlaybackSDKReady = () => resolve();

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      script.onerror = (error) => {
        console.error('SpotifyService: failed to load SDK', error);
        reject(error);
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Create the SDK player; resolves once Spotify reports the browser device as ready.
   */
  async _initializePlayer() {
    return new Promise((resolve, reject) => {
      this.player = new window.Spotify.Player({
        name: 'Radio Zonder Reclame',
        getOAuthToken: callback => callback(this.accessToken),
        volume: this.volume
      });

      this.player.addListener('ready', ({ device_id }) => {
        this.deviceId = device_id;
        this.isReady = true;
        resolve();
      });

      this.player.addListener('not_ready', ({ device_id }) => {
        console.warn('SpotifyService: device went offline', device_id);
      });

      this.player.addListener('initialization_error', ({ message }) => {
        console.error('SpotifyService: initialization error', message);
        reject(new Error(message));
      });

      this.player.addListener('authentication_error', ({ message }) => {
        console.error('SpotifyService: authentication error', message);
        reject(new Error(message));
      });

      this.player.addListener('account_error', ({ message }) => {
        console.error('SpotifyService: account error', message);
        reject(new Error(message));
      });

      this.player.addListener('playback_error', ({ message }) => {
        console.error('SpotifyService: playback error', message);
      });

      this.player.connect();
    });
  }

  /**
   * Play a Spotify playlist on the browser device.
   * @param {object} config - { playlist: playlistId, shuffle: boolean }
   */
  async play(config) {
    if (!this.isReady) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Spotify not initialized - please authenticate');
      }
    }

    const { playlist, shuffle = false } = config;
    if (!playlist) {
      throw new Error('No playlist specified');
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          context_uri: `spotify:playlist:${playlist}`,
          position_ms: 0
        })
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      if (shuffle) {
        await this.setShuffle(true);
      }

      this.currentPlaylist = playlist;
      return true;
    } catch (error) {
      console.error('SpotifyService: play failed', error);
      throw error;
    }
  }

  async pause() {
    if (!this.player) return;

    try {
      await this.player.pause();
    } catch (error) {
      console.error('SpotifyService: pause failed', error);
    }
  }

  async resume() {
    if (!this.player) return;

    try {
      await this.player.resume();
    } catch (error) {
      console.error('SpotifyService: resume failed', error);
      throw error;
    }
  }

  async stop() {
    if (!this.player) return;

    try {
      await this.player.pause();
      this.currentPlaylist = null;
    } catch (error) {
      console.error('SpotifyService: stop failed', error);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.player) {
      this.player.setVolume(this.volume);
    }
  }

  async setShuffle(enabled) {
    if (!this.isReady) return;

    try {
      await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${enabled}&device_id=${this.deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
    } catch (error) {
      console.error('SpotifyService: failed to set shuffle', error);
    }
  }

  async nextTrack() {
    if (!this.player) return;

    try {
      await this.player.nextTrack();
    } catch (error) {
      console.error('SpotifyService: failed to skip track', error);
    }
  }

  async previousTrack() {
    if (!this.player) return;

    try {
      await this.player.previousTrack();
    } catch (error) {
      console.error('SpotifyService: failed to go back', error);
    }
  }

  /**
   * Current SDK playback state, or null when unavailable.
   */
  async getState() {
    if (!this.player) return null;

    try {
      return await this.player.getCurrentState();
    } catch (error) {
      console.error('SpotifyService: failed to get state', error);
      return null;
    }
  }

  destroy() {
    if (this.player) {
      this.player.disconnect();
      this.player = null;
    }
    this.isReady = false;
    this.deviceId = null;
    this.currentPlaylist = null;
  }
}
