// services/YouTubeService.js - YouTube playback source for AudioManager.
// Plays a playlist or video through the YouTube iframe API in a hidden container.

export class YouTubeSource {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.volume = 50; // YouTube uses 0-100
    this.currentPlaylist = null;
    this.playerElement = null;
  }

  /**
   * Load the iframe API and create the (hidden) player container.
   */
  async initialize() {
    if (this.isReady) return true;

    try {
      if (!window.YT) {
        await this._loadYouTubeAPI();
      }

      if (!this.playerElement) {
        this.playerElement = document.createElement('div');
        this.playerElement.id = 'youtube-player-container';
        this.playerElement.style.display = 'none';
        document.body.appendChild(this.playerElement);
      }

      return true;
    } catch (error) {
      console.error('YouTubeService: initialization failed', error);
      return false;
    }
  }

  async _loadYouTubeAPI() {
    return new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';

      window.onYouTubeIframeAPIReady = () => resolve();

      tag.onerror = (error) => {
        console.error('YouTubeService: failed to load API', error);
        reject(error);
      };

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    });
  }

  async _createPlayer(playlistId, videoId) {
    return new Promise((resolve, reject) => {
      const playerVars = {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0
      };

      if (playlistId) {
        playerVars.list = playlistId;
        playerVars.listType = 'playlist';
      } else if (videoId) {
        playerVars.videoId = videoId;
      }

      this.player = new window.YT.Player(this.playerElement.id, {
        height: '390',
        width: '640',
        playerVars,
        events: {
          onReady: (event) => {
            event.target.setVolume(this.volume);
            this.isReady = true;
            resolve(event.target);
          },
          onError: (event) => {
            console.error('YouTubeService: player error', event.data);
            reject(new Error(`YouTube error: ${event.data}`));
          }
        }
      });
    });
  }

  /**
   * Play a YouTube playlist or video. A fresh player is created for every call.
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

    try {
      if (this.player) {
        this.player.destroy();
        this.player = null;
      }

      await this._createPlayer(playlist, video);

      if (shuffle && playlist) {
        this.player.setShuffle(true);
      }

      this.player.playVideo();

      this.currentPlaylist = playlist || video;
      return true;
    } catch (error) {
      console.error('YouTubeService: play failed', error);
      throw error;
    }
  }

  async pause() {
    if (!this.player) return;

    try {
      this.player.pauseVideo();
    } catch (error) {
      console.error('YouTubeService: pause failed', error);
    }
  }

  async resume() {
    if (!this.player) return;

    try {
      this.player.playVideo();
    } catch (error) {
      console.error('YouTubeService: resume failed', error);
      throw error;
    }
  }

  async stop() {
    if (!this.player) return;

    try {
      this.player.stopVideo();
      this.currentPlaylist = null;
    } catch (error) {
      console.error('YouTubeService: stop failed', error);
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

  setShuffle(enabled) {
    if (this.player && this.player.setShuffle) {
      this.player.setShuffle(enabled);
    }
  }

  async nextTrack() {
    if (!this.player) return;

    try {
      this.player.nextVideo();
    } catch (error) {
      console.error('YouTubeService: failed to skip', error);
    }
  }

  async previousTrack() {
    if (!this.player) return;

    try {
      this.player.previousVideo();
    } catch (error) {
      console.error('YouTubeService: failed to go back', error);
    }
  }

  getPlayerElement() {
    return this.playerElement;
  }

  getPlayer() {
    return this.player;
  }

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
