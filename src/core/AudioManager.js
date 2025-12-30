// core/AudioManager.js - Unified audio playback controller
// Manages all audio sources: Radio, Spotify, YouTube

import { RadioSource } from '../services/RadioService';
import { SpotifySource } from '../services/SpotifyService';
import { YouTubeSource } from '../services/YouTubeService';
import { VolumeNormalizer } from './VolumeNormalizer';

/**
 * AudioManager - Central controller for all audio playback
 *
 * Responsibilities:
 * - Manage switching between audio sources (radio, spotify, youtube)
 * - Ensure only one source plays at a time
 * - Synchronize volume across all sources
 * - Handle transitions smoothly without conflicts
 */
class AudioManager {
  constructor() {
    // Current active source type
    this.currentSource = null; // 'radio' | 'spotify' | 'youtube' | null

    // Audio source instances
    this.sources = {
      radio: new RadioSource(),
      spotify: new SpotifySource(),
      youtube: new YouTubeSource()
    };

    // Volume normalization system
    this.volumeNormalizer = new VolumeNormalizer();

    // Playback state
    this.state = 'idle'; // 'idle' | 'loading' | 'playing' | 'paused' | 'transitioning'
    this.volume = 0.5;
    this.isTransitioning = false;

    // Fade settings
    this.fadeEnabled = false;
    this.fadeDuration = 500; // milliseconds

    // Current playback metadata
    this.currentMetadata = {
      station: null,      // For radio
      playlist: null,     // For spotify/youtube
      track: null         // Current track info
    };

    // Event callbacks
    this.callbacks = {
      onStateChange: null,
      onError: null,
      onMetadataChange: null,
      onEmergency: null
    };
  }

  /**
   * Initialize audio sources
   */
  async initialize() {
    console.log('🎵 AudioManager: Initializing all sources');

    try {
      // Initialize volume normalizer
      await this.volumeNormalizer.initialize();

      // Set up emergency callback
      this.volumeNormalizer.setEmergencyCallback = (event) => {
        console.error('🚨 AudioManager: Emergency volume event', event);
        if (this.callbacks.onEmergency) {
          this.callbacks.onEmergency(event);
        }
        // Immediately resync volumes to safe levels
        this.syncVolume();
      };

      // Initialize each source
      await this.sources.radio.initialize();
      await this.sources.spotify.initialize();
      await this.sources.youtube.initialize();

      // Start volume monitoring
      this.volumeNormalizer.startMonitoring();

      console.log('✅ AudioManager: All sources initialized');
      return true;
    } catch (error) {
      console.error('❌ AudioManager: Initialization failed', error);
      this._triggerError(error);
      return false;
    }
  }

  /**
   * Play audio from a specific source
   * @param {string} sourceType - 'radio' | 'spotify' | 'youtube'
   * @param {object} config - Configuration for the source
   */
  async play(sourceType, config = {}) {
    console.log(`🎵 AudioManager: Play request - ${sourceType}`, config);

    // STRICT RULE: Wait for any ongoing transition to complete
    if (this.isTransitioning) {
      console.warn('⚠️ AudioManager: Already transitioning, waiting...');
      // Wait up to 2 seconds for transition to complete
      let waitCount = 0;
      while (this.isTransitioning && waitCount < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }
      if (this.isTransitioning) {
        console.error('❌ AudioManager: Previous transition stuck, forcing stop');
        await this.stopAll();
        this.isTransitioning = false;
      }
    }

    try {
      this.isTransitioning = true;
      this._setState('transitioning');

      // CROSSFADE: Only if fade enabled, we have a current source, AND switching to DIFFERENT source type
      // IMPORTANT: Don't crossfade radio→radio because it breaks Web Audio API connection (visualizer)
      const shouldCrossfade = this.fadeEnabled && this.currentSource && this.currentSource !== sourceType;

      if (shouldCrossfade) {
        console.log(`🔀 AudioManager: Crossfading ${this.currentSource} → ${sourceType}`);
        await this._crossfade(sourceType, config);
      } else {
        // NO FADE: Immediate stop (same source type or no fade)
        if (this.currentSource === sourceType) {
          console.log(`⚡ AudioManager: Same source type (${sourceType}), skipping crossfade to prevent Web Audio API conflict`);
        }
        console.log('🛑 AudioManager: FORCING STOP OF ALL AUDIO SOURCES');
        await this.stopAll();

        // Update current source
        this.currentSource = sourceType;

        // Play the new source
        this._setState('loading');
        const success = await this.sources[sourceType].play(config);

        if (success) {
          this._setState('playing');
          this.syncVolume();
          this._updateMetadata(sourceType, config);
          console.log(`✅ AudioManager: Now playing ${sourceType}`);
          return true;
        } else {
          throw new Error(`Failed to start ${sourceType}`);
        }
      }

      return true;

    } catch (error) {
      console.error('❌ AudioManager: Play failed', error);
      this._setState('idle');
      this.currentSource = null;
      this._triggerError(error);
      return false;
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Pause current playback
   */
  async pause() {
    if (!this.currentSource) {
      console.warn('⚠️ AudioManager: No active source to pause');
      return;
    }

    try {
      await this.sources[this.currentSource].pause();
      this._setState('paused');
      console.log('⏸️ AudioManager: Paused');
    } catch (error) {
      console.error('❌ AudioManager: Pause failed', error);
      this._triggerError(error);
    }
  }

  /**
   * Resume paused playback
   */
  async resume() {
    if (!this.currentSource) {
      console.warn('⚠️ AudioManager: No source to resume');
      return;
    }

    try {
      await this.sources[this.currentSource].resume();
      this._setState('playing');
      console.log('▶️ AudioManager: Resumed');
    } catch (error) {
      console.error('❌ AudioManager: Resume failed', error);
      this._triggerError(error);
    }
  }

  /**
   * Stop current playback
   */
  async stopCurrent() {
    if (!this.currentSource) {
      return; // Nothing to stop
    }

    console.log(`🛑 AudioManager: Stopping ${this.currentSource}`);

    try {
      await this.sources[this.currentSource].stop();
      this.currentSource = null;
      this._setState('idle');
      this.currentMetadata = { station: null, playlist: null, track: null };
    } catch (error) {
      console.error('❌ AudioManager: Stop failed', error);
      // Force clear anyway
      this.currentSource = null;
      this._setState('idle');
    }
  }

  /**
   * NUCLEAR OPTION: Stop ALL audio sources (radio, spotify, youtube)
   * This ensures absolutely no audio overlap
   */
  async stopAll() {
    console.log('🚨 AudioManager: STOPPING ALL AUDIO SOURCES');

    // Stop all sources in parallel for speed
    const stopPromises = Object.entries(this.sources).map(async ([sourceType, source]) => {
      try {
        await source.stop();
        console.log(`✅ AudioManager: ${sourceType} stopped`);
      } catch (error) {
        console.warn(`⚠️ AudioManager: Failed to stop ${sourceType}`, error);
        // Continue anyway - we want to stop everything
      }
    });

    await Promise.all(stopPromises);

    this.currentSource = null;
    this._setState('idle');
    this.currentMetadata = { station: null, playlist: null, track: null };

    console.log('✅ AudioManager: All audio sources stopped');
  }

  /**
   * Set volume for all sources (0.0 to 1.0)
   */
  setVolume(volume) {
    const newVolume = Math.max(0, Math.min(1, volume));
    const oldPercentage = Math.round(this.volume * 100);
    const newPercentage = Math.round(newVolume * 100);

    this.volume = newVolume;

    // Update volume normalizer
    this.volumeNormalizer.setVolume(this.volume);

    this.syncVolume();

    // Only log if volume changed by at least 1%
    if (oldPercentage !== newPercentage) {
     // console.log(`🔊 AudioManager: Volume set to ${newPercentage}%`);
    }
  }

  /**
   * Sync volume across all sources with normalization
   */
  syncVolume() {
    Object.entries(this.sources).forEach(([sourceType, source]) => {
      try {
        // Get normalized volume for this specific source type
        const normalizedVolume = this.volumeNormalizer.getVolumeForSource(sourceType);
        source.setVolume(normalizedVolume);
      } catch (error) {
        console.warn(`⚠️ AudioManager: Failed to sync volume for ${sourceType}`, error);
      }
    });
  }

  /**
   * Get current playback state
   */
  getState() {
    return {
      state: this.state,
      currentSource: this.currentSource,
      volume: this.volume,
      isPlaying: this.state === 'playing',
      isPaused: this.state === 'paused',
      isLoading: this.state === 'loading' || this.isTransitioning,
      metadata: this.currentMetadata
    };
  }

  /**
   * Get specific source instance (for advanced control)
   */
  getSource(sourceType) {
    return this.sources[sourceType];
  }

  /**
   * Register event callbacks
   */
  on(event, callback) {
    if (this.callbacks[event] !== undefined) {
      this.callbacks[event] = callback;
    }
  }

  /**
   * Enable/disable crossfade
   */
  setFadeEnabled(enabled) {
    this.fadeEnabled = enabled;
    console.log(`🎵 AudioManager: Crossfade ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get the current audio element for visualizer
   */
  getAudioElement() {
    if (this.currentSource === 'radio' && this.sources.radio.audio) {
      return this.sources.radio.audio;
    }
    return null;
  }

  // Private methods

  /**
   * Crossfade from current source to new source
   */
  async _crossfade(newSourceType, newConfig) {
    console.log(`🔀 AudioManager: Crossfading to ${newSourceType}`);

    const oldSource = this.currentSource;
    const fadeDuration = this.fadeDuration;
    const steps = 20; // Number of fade steps
    const stepDuration = fadeDuration / steps;
    const targetVolume = this.volume;

    try {
      // Start new source at 0 volume
      this.currentSource = newSourceType;
      const newSourceInstance = this.sources[newSourceType];

      // Start playing new source
      await newSourceInstance.play(newConfig);

      // Set new source to 0 volume
      newSourceInstance.setVolume(0);

      console.log(`🔀 Starting crossfade: ${oldSource} → ${newSourceType}`);

      // Fade out old, fade in new
      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const oldVolume = targetVolume * (1 - progress);
        const newVolume = targetVolume * progress;

        // Set volumes
        if (oldSource && this.sources[oldSource]) {
          const oldNormalized = this.volumeNormalizer.getNormalizedVolume(oldSource) * (1 - progress);
          this.sources[oldSource].setVolume(oldNormalized);
        }

        const newNormalized = this.volumeNormalizer.getNormalizedVolume(newSourceType) * progress;
        newSourceInstance.setVolume(newNormalized);

        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }

      // Stop old source
      if (oldSource && this.sources[oldSource]) {
        await this.sources[oldSource].stop();
      }

      console.log(`✅ AudioManager: Crossfade complete`);

      this._setState('playing');
      this._updateMetadata(newSourceType, newConfig);

    } catch (error) {
      console.error('❌ AudioManager: Crossfade failed', error);
      // Fallback: immediate switch
      await this.stopAll();
      throw error;
    }
  }

  _setState(newState) {
    this.state = newState;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(newState);
    }
  }

  _triggerError(error) {
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
  }

  _updateMetadata(sourceType, config) {
    switch (sourceType) {
      case 'radio':
        this.currentMetadata.station = config.station;
        break;
      case 'spotify':
      case 'youtube':
        this.currentMetadata.playlist = config.playlist || config.playlistId;
        break;
    }

    if (this.callbacks.onMetadataChange) {
      this.callbacks.onMetadataChange(this.currentMetadata);
    }
  }

  /**
   * Check if Spotify player is ready
   */
  isSpotifyReady() {
    return this.sources.spotify?.isReady || false;
  }

  /**
   * Get Spotify source (for direct access if needed)
   */
  getSpotifySource() {
    return this.sources.spotify;
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    console.log('🧹 AudioManager: Cleanup');
    this.stopCurrent();
    Object.values(this.sources).forEach(source => {
      if (source.destroy) {
        source.destroy();
      }
    });
  }
}

// Singleton instance (or use dependency injection)
let audioManagerInstance = null;

export const getAudioManager = () => {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
};

export default AudioManager;
