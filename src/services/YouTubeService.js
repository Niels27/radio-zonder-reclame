// services/YouTubeService.js - YouTube iframe API integration
// Handles YouTube playlist/video playback

export class YouTubeSource {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.volume = 50; // YouTube uses 0-100
    this.currentPlaylist = null;
    this.playerElement = null;
  }

  /**
   * Initialize YouTube iframe API
   */
  async initialize() {
    if (this.isReady) return true;

    try {
      console.log('🎵 YouTubeService: Initializing...');

      // Load YouTube iframe API if not already loaded
      if (!window.YT) {
        await this._loadYouTubeAPI();
      }

      // Create player container if it doesn't exist
      if (!this.playerElement) {
        this.playerElement = document.createElement('div');
        this.playerElement.id = 'youtube-player-container';
        this.playerElement.style.display = 'none'; // Hidden by default
        document.body.appendChild(this.playerElement);
      }

      console.log('✅ YouTubeService: Initialized');
      return true;

    } catch (error) {
      console.error('❌ YouTubeService: Initialization failed', error);
      return false;
    }
  }

  /**
   * Load YouTube iframe API
   */
  async _loadYouTubeAPI() {
    return new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';

      window.onYouTubeIframeAPIReady = () => {
        console.log('✅ YouTubeService: API loaded');
        resolve();
      };

      tag.onerror = (error) => {
        console.error('❌ YouTubeService: Failed to load API', error);
        reject(error);
      };

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    });
  }

  /**
   * Create YouTube player instance
   */
  async _createPlayer(playlistId, videoId) {
    return new Promise((resolve, reject) => {
      const playerVars = {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0
      };

      // Set either playlist or video
      if (playlistId) {
        playerVars.list = playlistId;
        playerVars.listType = 'playlist';
      } else if (videoId) {
        playerVars.videoId = videoId;
      }

      this.player = new window.YT.Player(this.playerElement.id, {
        height: '390',
        width: '640',
        playerVars: playerVars,
        events: {
          'onReady': (event) => {
            console.log('✅ YouTubeService: Player ready');
            event.target.setVolume(this.volume);
            this.isReady = true;
            resolve(event.target);
          },
          'onError': (event) => {
            console.error('❌ YouTubeService: Player error', event.data);
            reject(new Error(`YouTube error: ${event.data}`));
          },
          'onStateChange': this._handleStateChange.bind(this)
        }
      });
    });
  }

  /**
   * Play a YouTube playlist or video
   * @param {object} config - { playlist: playlistId, video: videoId, shuffle: boolean }
   */
  async play(config) {
    if (!window.YT) {
      await this.initialize();
    }

    const { playlist, video, shuffle = false } = config;
    if (!playlist && !video) {
      throw new Error('No playlist or video specified');
    }

    console.log(`🎵 YouTubeService: Playing ${playlist ? 'playlist' : 'video'}`);

    try {
      // Destroy existing player if any
      if (this.player) {
        this.player.destroy();
        this.player = null;
      }

      // Create new player
      await this._createPlayer(playlist, video);

      // Set shuffle if requested and it's a playlist
      if (shuffle && playlist) {
        this.player.setShuffle(true);
      }

      // Start playback
      this.player.playVideo();

      this.currentPlaylist = playlist || video;
      console.log('✅ YouTubeService: Playback started');
      return true;

    } catch (error) {
      console.error('❌ YouTubeService: Play failed', error);
      throw error;
    }
  }

  /**
   * Pause playback
   */
  async pause() {
    if (!this.player) return;

    try {
      this.player.pauseVideo();
      console.log('⏸️ YouTubeService: Paused');
    } catch (error) {
      console.error('❌ YouTubeService: Pause failed', error);
    }
  }

  /**
   * Resume playback
   */
  async resume() {
    if (!this.player) return;

    try {
      this.player.playVideo();
      console.log('▶️ YouTubeService: Resumed');
    } catch (error) {
      console.error('❌ YouTubeService: Resume failed', error);
      throw error;
    }
  }

  /**
   * Stop playback
   */
  async stop() {
    if (!this.player) return;

    try {
      this.player.stopVideo();
      this.currentPlaylist = null;
      console.log('🛑 YouTubeService: Stopped');
    } catch (error) {
      console.error('❌ YouTubeService: Stop failed', error);
    }
  }

  /**
   * Set volume (0.0 to 1.0, converted to YouTube's 0-100)
   */
  setVolume(volume) {
    this.volume = Math.round(Math.max(0, Math.min(1, volume)) * 100);
    if (this.player && this.player.setVolume) {
      this.player.setVolume(this.volume);
    }
  }

  /**
   * Set shuffle mode
   */
  setShuffle(enabled) {
    if (this.player && this.player.setShuffle) {
      this.player.setShuffle(enabled);
      console.log(`🔀 YouTubeService: Shuffle ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Skip to next video
   */
  async nextTrack() {
    if (!this.player) return;

    try {
      this.player.nextVideo();
      console.log('⏭️ YouTubeService: Next video');
    } catch (error) {
      console.error('❌ YouTubeService: Failed to skip', error);
    }
  }

  /**
   * Skip to previous video
   */
  async previousTrack() {
    if (!this.player) return;

    try {
      this.player.previousVideo();
      console.log('⏮️ YouTubeService: Previous video');
    } catch (error) {
      console.error('❌ YouTubeService: Failed to go back', error);
    }
  }

  /**
   * Get player element (for floating player integration)
   */
  getPlayerElement() {
    return this.playerElement;
  }

  /**
   * Get player instance (for direct control)
   */
  getPlayer() {
    return this.player;
  }

  /**
   * Handle YouTube player state changes
   */
  _handleStateChange(event) {
    const states = {
      '-1': 'unstarted',
      '0': 'ended',
      '1': 'playing',
      '2': 'paused',
      '3': 'buffering',
      '5': 'video cued'
    };

    const state = states[event.data] || 'unknown';
    console.log(`🎵 YouTubeService: State changed to ${state}`);

    // Handle video end - could trigger next video or loop
    if (event.data === 0) {
      console.log('🎵 YouTubeService: Video ended');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    if (this.playerElement && this.playerElement.parentNode) {
      this.playerElement.parentNode.removeChild(this.playerElement);
      this.playerElement = null;
    }
    this.isReady = false;
    this.currentPlaylist = null;
  }
}

export default YouTubeSource;
