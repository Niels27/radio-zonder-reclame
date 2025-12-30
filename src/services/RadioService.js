// services/RadioService.js - Radio stream playback service
// Handles HTML5 Audio element for live radio streams

import { AdSkipUtils } from '../utils/adSkipUtils.js';
import toast from '../utils/toastNotifications.js';

export class RadioSource {
  constructor() {
    this.audio = null;
    this.currentStation = null;
    this.volume = 0.5;
    this.isInitialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.prerollSkipTimeout = null;
    this.hasSkippedPreroll = false; // Track if we've already skipped for this station
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

      // Reset retry count and pre-roll skip flag
      this.retryCount = 0;
      this.hasSkippedPreroll = false; // Reset for new station

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

      // Check if we should start muted for pre-roll skip
      const isAutoSkipEnabled = AdSkipUtils.getAutoSkipSetting();
      const shouldSkipPreroll = isAutoSkipEnabled &&
                                !this.hasSkippedPreroll &&
                                AdSkipUtils.shouldOfferPrerollSkip(station.url, station.name);

      if (shouldSkipPreroll) {
        // Start muted - we'll restore volume after skip
        this.audio.volume = 0;
        // Store target volume for later restoration
        this.audio.dataset.targetVolume = this.volume;
        console.log('🔇 Starting muted for pre-roll skip');
      } else {
        // Normal volume
        this.audio.volume = this.volume;
      }

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
      // Clear pre-roll skip timeout
      if (this.prerollSkipTimeout) {
        clearTimeout(this.prerollSkipTimeout);
        this.prerollSkipTimeout = null;
      }

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

    // Check if we should auto-skip pre-roll
    this._handlePrerollSkip();
  }

  /**
   * Handle automatic pre-roll skip if enabled
   */
  async _handlePrerollSkip() {
    // Only skip once per station load
    if (this.hasSkippedPreroll) {
      console.log('⏭️ Pre-roll already skipped for this station - ignoring');
      return;
    }

    // Clear any existing timeout
    if (this.prerollSkipTimeout) {
      clearTimeout(this.prerollSkipTimeout);
      this.prerollSkipTimeout = null;
    }

    // Check if auto-skip is enabled
    const isAutoSkipEnabled = AdSkipUtils.getAutoSkipSetting();

    if (!isAutoSkipEnabled) {
      console.log('⏭️ Auto pre-roll skip is disabled');
      return;
    }

    // Check if this station should have pre-roll skip
    if (!this.currentStation || !AdSkipUtils.shouldOfferPrerollSkip(this.currentStation.url, this.currentStation.name)) {
      console.log('⏭️ Pre-roll skip not needed for this station');
      return;
    }

    console.log('⏭️ Auto pre-roll skip is ENABLED - preparing to skip...');

    // Mark that we're about to skip (prevent duplicate skips)
    this.hasSkippedPreroll = true;

    // Minimal wait - just enough for stream to start buffering
    this.prerollSkipTimeout = setTimeout(async () => {
      try {
        console.log('⏭️ Executing automatic pre-roll skip...');

        // Smart skip duration based on stream readiness
        // Start with smaller skip (10s) for live streams to reduce buffering
        const skipDuration = 15;

        // Skip forward
        await AdSkipUtils.skipPrerollSilently(this.audio, skipDuration);

        // Show toast notification
        toast.success(`Pre-roll reclame overgeslagen`, 2500);

      } catch (error) {
        console.error('❌ Auto pre-roll skip failed:', error);
        // Reset flag on error so user can try again
        this.hasSkippedPreroll = false;
      }
    }, 200); // Reduced from 500ms to 200ms for faster skip
  }

  _handleWaiting() {
    console.log('⏳ RadioService: Buffering...');
  }

  /**
   * Cleanup
   */
  destroy() {
    // Clear pre-roll skip timeout
    if (this.prerollSkipTimeout) {
      clearTimeout(this.prerollSkipTimeout);
      this.prerollSkipTimeout = null;
    }

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
