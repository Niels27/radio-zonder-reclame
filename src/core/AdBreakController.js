// core/AdBreakController.js - Simplified ad break management
// Handles automatic switching to alternative audio during ad breaks

export class AdBreakController {
  constructor(audioManager, stateActions) {
    this.audioManager = audioManager;
    this.actions = stateActions;

    this.timer = null;
    this.countdownInterval = null;
    this.savedStation = null;
    this.isActive = false;
  }

  /**
   * Start an ad break
   * @param {string} mode - 'playlist' | 'nonstop' | 'lofi'
   * @param {number} duration - Duration in minutes
   * @param {object} config - Mode-specific configuration
   */
  async start(mode, duration, config = {}) {
    if (this.isActive) {
      console.warn('⚠️ AdBreakController: Ad break already active');
      return false;
    }

    console.log(`🎵 AdBreakController: Starting ${mode} ad break for ${duration} minutes`);

    try {
      // Save current station for restoration
      const currentState = this.audioManager.getState();
      this.savedStation = currentState.metadata.station;

      // Mark ad break as active
      this.isActive = true;
      this.actions.startAdBreak(mode);

      // Start countdown
      this._startCountdown(duration * 60); // Convert to seconds

      // Switch to appropriate mode
      let success = false;

      switch (mode) {
        case 'playlist':
          success = await this._startPlaylistMode(config);
          break;

        case 'nonstop':
          success = await this._startNonstopMode(config);
          break;

        case 'lofi':
          success = await this._startLofiMode(config);
          break;

        default:
          throw new Error(`Unknown ad break mode: ${mode}`);
      }

      if (!success) {
        throw new Error(`Failed to start ${mode} mode`);
      }

      // Schedule automatic end
      this.timer = setTimeout(() => {
        this.end();
      }, duration * 60 * 1000);

      console.log(`✅ AdBreakController: ${mode} ad break started`);
      return true;

    } catch (error) {
      console.error('❌ AdBreakController: Failed to start ad break', error);
      this._cleanup();
      throw error;
    }
  }

  /**
   * End the current ad break
   */
  async end() {
    if (!this.isActive) {
      console.warn('⚠️ AdBreakController: No active ad break to end');
      return;
    }

    console.log('🎵 AdBreakController: Ending ad break');

    try {
      // Clear timers
      this._cleanup();

      // Restore saved station if available
      if (this.savedStation) {
        console.log(`🔄 AdBreakController: Restoring ${this.savedStation.name}`);
        await this.audioManager.play('radio', {
          station: this.savedStation
        });
      }

      // Update state
      this.isActive = false;
      this.savedStation = null;
      this.actions.endAdBreak();

      console.log('✅ AdBreakController: Ad break ended');

    } catch (error) {
      console.error('❌ AdBreakController: Failed to end ad break cleanly', error);
      // Force cleanup anyway
      this._cleanup();
      this.isActive = false;
      this.savedStation = null;
      this.actions.endAdBreak();
    }
  }

  /**
   * Cancel the current ad break without restoring
   */
  cancel() {
    console.log('🚫 AdBreakController: Canceling ad break');
    this._cleanup();
    this.isActive = false;
    this.savedStation = null;
    this.actions.endAdBreak();
  }

  /**
   * Extend the current ad break by specified minutes
   */
  extend(minutes) {
    if (!this.isActive) {
      console.warn('⚠️ AdBreakController: No active ad break to extend');
      return;
    }

    console.log(`⏰ AdBreakController: Extending ad break by ${minutes} minutes`);

    // Clear existing timer
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Set new timer
    this.timer = setTimeout(() => {
      this.end();
    }, minutes * 60 * 1000);

    // Update countdown
    const currentTimeLeft = this._getCountdownTimeLeft();
    this._startCountdown(currentTimeLeft + (minutes * 60));
  }

  // Private methods

  /**
   * Start playlist mode (Spotify or YouTube)
   */
  async _startPlaylistMode(config) {
    const { playlistId, provider = 'spotify', shuffle = false } = config;

    if (!playlistId) {
      throw new Error('No playlist ID provided');
    }

    console.log(`🎵 AdBreakController: Starting ${provider} playlist ${playlistId}`);

    return await this.audioManager.play(provider, {
      playlist: playlistId,
      shuffle: shuffle
    });
  }

  /**
   * Start nonstop mode (switch to non-stop radio station)
   */
  async _startNonstopMode(config) {
    const { station } = config;

    if (!station) {
      throw new Error('No nonstop station provided');
    }

    console.log(`🎵 AdBreakController: Switching to nonstop station ${station.name}`);

    return await this.audioManager.play('radio', {
      station: station
    });
  }

  /**
   * Start lofi mode (YouTube lofi stream)
   */
  async _startLofiMode(config) {
    const { videoId } = config;

    if (!videoId) {
      throw new Error('No lofi video ID provided');
    }

    console.log(`🎵 AdBreakController: Starting lofi stream ${videoId}`);

    return await this.audioManager.play('youtube', {
      video: videoId
    });
  }

  /**
   * Start countdown timer
   */
  _startCountdown(seconds) {
    // Clear existing countdown
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // Set initial time
    this.actions.setAdBreakTimeLeft(seconds);

    // Update every second
    this.countdownInterval = setInterval(() => {
      const currentTime = this._getCountdownTimeLeft();

      if (currentTime <= 0) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.actions.setAdBreakTimeLeft(0);
      } else {
        this.actions.setAdBreakTimeLeft(currentTime - 1);
      }
    }, 1000);
  }

  /**
   * Get current countdown time left
   */
  _getCountdownTimeLeft() {
    // This would come from state in the real implementation
    // For now, return 0 as placeholder
    return 0;
  }

  /**
   * Cleanup timers and state
   */
  _cleanup() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    this.actions.setAdBreakTimeLeft(null);
  }

  /**
   * Check if ad break is currently active
   */
  isAdBreakActive() {
    return this.isActive;
  }

  /**
   * Get saved station
   */
  getSavedStation() {
    return this.savedStation;
  }
}

export default AdBreakController;
