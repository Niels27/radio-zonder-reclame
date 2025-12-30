// core/VolumeNormalizer.js - Volume normalization and safety system
// Prevents volume spikes and normalizes audio levels across all sources

export class VolumeNormalizer {
  constructor() {
    // Volume settings
    this.currentVolume = 0.5;        // User-set volume (0.0 - 1.0)
    this.maxSafeVolume = 0.9;        // Safety ceiling
    this.emergencyThreshold = 0.95;   // Trigger emergency reduction

    // Audio analysis
    this.audioContext = null;
    this.analyser = null;
    this.isMonitoring = false;
    this.monitoringInterval = null;

    // Volume normalization per source type
    this.sourceNormalizers = {
      radio: 1.0,      // Radio streams typically normalized
      spotify: 0.9,    // Spotify slightly lower (usually louder)
      youtube: 0.85    // YouTube can be very loud
    };

    // Emergency protection
    this.emergencyActive = false;
    this.emergencyCallback = null;
  }

  /**
   * Initialize audio context for monitoring
   */
  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;

      console.log('✅ VolumeNormalizer: Initialized');
      return true;
    } catch (error) {
      console.error('❌ VolumeNormalizer: Failed to initialize', error);
      return false;
    }
  }

  /**
   * Connect audio source for monitoring
   */
  connectSource(audioElement) {
    if (!this.audioContext || !audioElement) {
      console.warn('⚠️ VolumeNormalizer: Cannot connect source');
      return false;
    }

    try {
      // Create media element source
      const source = this.audioContext.createMediaElementSource(audioElement);

      // Connect: source -> analyser -> destination
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      console.log('✅ VolumeNormalizer: Source connected for monitoring');
      return true;
    } catch (error) {
      // Source might already be connected, ignore error
      console.warn('⚠️ VolumeNormalizer: Source connection warning', error.message);
      return false;
    }
  }

  /**
   * Start monitoring audio levels
   */
  startMonitoring(onEmergency) {
    if (this.isMonitoring) return;

    this.emergencyCallback = onEmergency;
    this.isMonitoring = true;

    // Monitor every 100ms
    this.monitoringInterval = setInterval(() => {
      this._checkAudioLevels();
    }, 100);

    console.log('🎚️ VolumeNormalizer: Monitoring started');
  }

  /**
   * Stop monitoring audio levels
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    console.log('🎚️ VolumeNormalizer: Monitoring stopped');
  }

  /**
   * Set user volume (0.0 - 1.0)
   */
  setVolume(volume) {
    const newVolume = Math.max(0, Math.min(1, volume));
    const oldPercentage = Math.round(this.currentVolume * 100);
    const newPercentage = Math.round(newVolume * 100);

    this.currentVolume = newVolume;

    // Only log if volume changed by at least 1%
    if (oldPercentage !== newPercentage) {
    //  console.log(`🔊 VolumeNormalizer: Volume set to ${newPercentage}%`);
    }
  }

  /**
   * Get normalized volume for a specific source type
   * @param {string} sourceType - 'radio' | 'spotify' | 'youtube'
   * @returns {number} Normalized volume (0.0 - 1.0)
   */
  getNormalizedVolume(sourceType) {
    const normalizer = this.sourceNormalizers[sourceType] || 1.0;
    const normalizedVolume = this.currentVolume * normalizer;

    // Apply safety ceiling
    const safeVolume = Math.min(normalizedVolume, this.maxSafeVolume);

    return safeVolume;
  }

  /**
   * Get volume for a specific source with emergency protection
   */
  getVolumeForSource(sourceType) {
    if (this.emergencyActive) {
      // During emergency, all volumes reduced to safe level
      return 0.3;
    }

    return this.getNormalizedVolume(sourceType);
  }

  /**
   * Manually adjust source normalizer
   */
  setSourceNormalizer(sourceType, multiplier) {
    this.sourceNormalizers[sourceType] = Math.max(0.1, Math.min(1.0, multiplier));
    console.log(`🎚️ VolumeNormalizer: ${sourceType} normalizer set to ${this.sourceNormalizers[sourceType]}`);
  }

  /**
   * Check audio levels for distortion/clipping
   */
  _checkAudioLevels() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);

    // Calculate peak level (0-255)
    let peak = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const value = Math.abs(dataArray[i] - 128);
      if (value > peak) peak = value;
    }

    // Convert to 0-1 range
    const peakLevel = peak / 128;

    // Check for dangerous levels
    if (peakLevel > this.emergencyThreshold && !this.emergencyActive) {
      console.error('🚨 VolumeNormalizer: EMERGENCY! Dangerous volume detected!');
      this._triggerEmergency();
    }

    // Recovery check
    if (this.emergencyActive && peakLevel < 0.7) {
      // Levels normalized, can recover
      setTimeout(() => {
        if (this.emergencyActive) {
          this._recoverFromEmergency();
        }
      }, 2000); // Wait 2 seconds before recovery
    }
  }

  /**
   * Trigger emergency volume reduction
   */
  _triggerEmergency() {
    this.emergencyActive = true;

    console.error('🚨 VolumeNormalizer: EMERGENCY MODE ACTIVATED - Reducing all volumes!');

    if (this.emergencyCallback) {
      this.emergencyCallback({
        type: 'emergency',
        reason: 'dangerous_volume',
        action: 'reduced_to_safe_level'
      });
    }
  }

  /**
   * Recover from emergency mode
   */
  _recoverFromEmergency() {
    this.emergencyActive = false;

    console.log('✅ VolumeNormalizer: Emergency resolved, returning to normal');

    if (this.emergencyCallback) {
      this.emergencyCallback({
        type: 'recovery',
        reason: 'volume_normalized',
        action: 'returning_to_normal'
      });
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      currentVolume: this.currentVolume,
      isMonitoring: this.isMonitoring,
      emergencyActive: this.emergencyActive,
      normalizers: this.sourceNormalizers
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopMonitoring();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.emergencyCallback = null;
  }
}

export default VolumeNormalizer;
