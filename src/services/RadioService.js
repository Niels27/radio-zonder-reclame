// services/RadioService.js - Radio stream playback service
// Handles HTML5 Audio element for live radio streams

export class RadioSource {
  constructor() {
    this.audio = null;
    this.currentStation = null;
    this.volume = 0.5;
    this.isInitialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  /**
   * Initialize the radio audio element
   */
  async initialize() {
    if (this.isInitialized) return true;

    try {
      this.audio = new Audio();
      this.audio.crossOrigin = 'anonymous';
      this.audio.preload = 'none';

      // Set up event listeners
      this.audio.addEventListener('error', this._handleError.bind(this));
      this.audio.addEventListener('loadeddata', this._handleLoaded.bind(this));
      this.audio.addEventListener('playing', this._handlePlaying.bind(this));
      this.audio.addEventListener('waiting', this._handleWaiting.bind(this));

      this.isInitialized = true;
      console.log('✅ RadioService: Initialized');
      return true;
    } catch (error) {
      console.error('❌ RadioService: Initialization failed', error);
      return false;
    }
  }

  /**
   * Play a radio station
   * @param {object} config - { station: { name, url, favicon } }
   */
  async play(config) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { station } = config;
    if (!station || !station.url) {
      throw new Error('Invalid station configuration');
    }

    console.log(`🎵 RadioService: Playing ${station.name}`);

    try {
      // Stop current stream
      if (this.audio.src) {
        this.audio.pause();
        this.audio.src = '';
      }

      // Reset retry count
      this.retryCount = 0;

      // Set new station
      this.currentStation = station;

      // Try to load and play
      return await this._tryPlayStation(station);

    } catch (error) {
      console.error('❌ RadioService: Play failed', error);
      throw error;
    }
  }

  /**
   * Try to play station with fallback support
   */
  async _tryPlayStation(station) {
    try {
      // Set audio source
      this.audio.src = station.url;
      this.audio.volume = this.volume;

      // Attempt to play
      const playPromise = this.audio.play();

      if (playPromise !== undefined) {
        await playPromise;
        console.log(`✅ RadioService: Successfully started ${station.name}`);
        return true;
      }

      return false;

    } catch (error) {
      console.error(`❌ RadioService: Failed to play ${station.name}`, error);

      // Try fallback URL if available
      if (station.fallbackUrl && this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 RadioService: Trying fallback URL (attempt ${this.retryCount})`);

        const fallbackStation = { ...station, url: station.fallbackUrl };
        return await this._tryPlayStation(fallbackStation);
      }

      throw error;
    }
  }

  /**
   * Pause playback
   */
  async pause() {
    if (!this.audio) return;

    try {
      this.audio.pause();
      console.log('⏸️ RadioService: Paused');
    } catch (error) {
      console.error('❌ RadioService: Pause failed', error);
    }
  }

  /**
   * Resume playback
   */
  async resume() {
    if (!this.audio) return;

    try {
      await this.audio.play();
      console.log('▶️ RadioService: Resumed');
    } catch (error) {
      console.error('❌ RadioService: Resume failed', error);
      throw error;
    }
  }

  /**
   * Stop playback
   */
  async stop() {
    if (!this.audio) return;

    try {
      this.audio.pause();
      this.audio.src = '';
      this.currentStation = null;
      console.log('🛑 RadioService: Stopped');
    } catch (error) {
      console.error('❌ RadioService: Stop failed', error);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  /**
   * Get audio element (for visualizer integration)
   */
  getAudioElement() {
    return this.audio;
  }

  /**
   * Get current station
   */
  getCurrentStation() {
    return this.currentStation;
  }

  // Event handlers

  _handleError(event) {
    console.error('❌ RadioService: Audio error', event);

    // Attempt retry with fallback if available
    if (this.currentStation && this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 RadioService: Retrying (attempt ${this.retryCount})`);
      this._tryPlayStation(this.currentStation);
    }
  }

  _handleLoaded() {
    console.log('📡 RadioService: Stream loaded');
  }

  _handlePlaying() {
    console.log('▶️ RadioService: Stream playing');
  }

  _handleWaiting() {
    console.log('⏳ RadioService: Buffering...');
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.currentStation = null;
    this.isInitialized = false;
  }
}

export default RadioSource;
