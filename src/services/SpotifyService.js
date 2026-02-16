// services/SpotifyService.js - Spotify Web Playback SDK integration
// Handles Spotify playlist playback

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
   * Initialize Spotify Web Playback SDK
   */
  async initialize() {
    if (this.isReady) return true;

    try {
      console.log('🎵 SpotifyService: Initializing...');

      // Check if user is authenticated
      this.accessToken = localStorage.getItem('spotify_access_token');
      if (!this.accessToken) {
        console.warn('⚠️ SpotifyService: No access token found');
        return false;
      }

      // Load Spotify SDK if not already loaded
      if (!window.Spotify) {
        await this._loadSpotifySDK();
      }

      // Initialize player
      await this._initializePlayer();

      console.log('✅ SpotifyService: Initialized');
      return true;

    } catch (error) {
      console.error('❌ SpotifyService: Initialization failed', error);
      return false;
    }
  }

  /**
   * Load Spotify Web Playback SDK
   */
  async _loadSpotifySDK() {
    return new Promise((resolve, reject) => {
      if (window.Spotify) {
        resolve();
        return;
      }

      // Must set callback BEFORE loading the script - the SDK calls it during execution
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('✅ SpotifyService: SDK loaded');
        resolve();
      };

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      script.onerror = (error) => {
        console.error('❌ SpotifyService: Failed to load SDK', error);
        reject(error);
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Initialize Spotify player
   */
  async _initializePlayer() {
    return new Promise((resolve, reject) => {
      this.player = new window.Spotify.Player({
        name: 'Radio Zonder Reclame',
        getOAuthToken: callback => callback(this.accessToken),
        volume: this.volume
      });

      // Ready event
      this.player.addListener('ready', ({ device_id }) => {
        console.log('✅ SpotifyService: Player ready with Device ID', device_id);
        this.deviceId = device_id;
        this.isReady = true;
        resolve();
      });

      // Not Ready event
      this.player.addListener('not_ready', ({ device_id }) => {
        console.warn('⚠️ SpotifyService: Device ID has gone offline', device_id);
      });

      // Error events
      this.player.addListener('initialization_error', ({ message }) => {
        console.error('❌ SpotifyService: Initialization error', message);
        reject(new Error(message));
      });

      this.player.addListener('authentication_error', ({ message }) => {
        console.error('❌ SpotifyService: Authentication error', message);
        reject(new Error(message));
      });

      this.player.addListener('account_error', ({ message }) => {
        console.error('❌ SpotifyService: Account error', message);
        reject(new Error(message));
      });

      this.player.addListener('playback_error', ({ message }) => {
        console.error('❌ SpotifyService: Playback error', message);
      });

      // Connect to the player
      this.player.connect();
    });
  }

  /**
   * Play a Spotify playlist
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

    console.log(`🎵 SpotifyService: Playing playlist ${playlist}`);

    try {
      // Start playback on the device
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

      // Set shuffle if requested
      if (shuffle) {
        await this.setShuffle(true);
      }

      this.currentPlaylist = playlist;
      console.log('✅ SpotifyService: Playback started');
      return true;

    } catch (error) {
      console.error('❌ SpotifyService: Play failed', error);
      throw error;
    }
  }

  /**
   * Pause playback
   */
  async pause() {
    if (!this.player) return;

    try {
      await this.player.pause();
      console.log('⏸️ SpotifyService: Paused');
    } catch (error) {
      console.error('❌ SpotifyService: Pause failed', error);
    }
  }

  /**
   * Resume playback
   */
  async resume() {
    if (!this.player) return;

    try {
      await this.player.resume();
      console.log('▶️ SpotifyService: Resumed');
    } catch (error) {
      console.error('❌ SpotifyService: Resume failed', error);
      throw error;
    }
  }

  /**
   * Stop playback
   */
  async stop() {
    if (!this.player) return;

    try {
      await this.player.pause();
      this.currentPlaylist = null;
      console.log('🛑 SpotifyService: Stopped');
    } catch (error) {
      console.error('❌ SpotifyService: Stop failed', error);
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

  /**
   * Set shuffle mode
   */
  async setShuffle(enabled) {
    if (!this.isReady) return;

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${enabled}&device_id=${this.deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (response.ok) {
        console.log(`🔀 SpotifyService: Shuffle ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('❌ SpotifyService: Failed to set shuffle', error);
    }
  }

  /**
   * Skip to next track
   */
  async nextTrack() {
    if (!this.player) return;

    try {
      await this.player.nextTrack();
      console.log('⏭️ SpotifyService: Next track');
    } catch (error) {
      console.error('❌ SpotifyService: Failed to skip track', error);
    }
  }

  /**
   * Skip to previous track
   */
  async previousTrack() {
    if (!this.player) return;

    try {
      await this.player.previousTrack();
      console.log('⏮️ SpotifyService: Previous track');
    } catch (error) {
      console.error('❌ SpotifyService: Failed to go back', error);
    }
  }

  /**
   * Get current playback state
   */
  async getState() {
    if (!this.player) return null;

    try {
      const state = await this.player.getCurrentState();
      return state;
    } catch (error) {
      console.error('❌ SpotifyService: Failed to get state', error);
      return null;
    }
  }

  /**
   * Cleanup
   */
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

export default SpotifySource;
