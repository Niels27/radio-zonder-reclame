// core/AudioManager.js - Single controller for all audio sources (radio, Spotify, YouTube).
//
// Guarantees that only one source plays at a time, keeps the volume in sync
// across sources, and optionally crossfades when switching between source
// types. Every play() call supersedes the previous one: a slower, cancelled
// attempt recognises it is stale and stays silent instead of reporting errors.

import { RadioSource } from '../services/RadioService';
import { SpotifySource } from '../services/SpotifyService';
import { YouTubeSource } from '../services/YouTubeService';

// Per-source loudness correction (Spotify/YouTube are mastered louder than
// radio) and an overall ceiling to avoid clipping at 100%.
const SOURCE_GAIN = { radio: 1.0, spotify: 0.9, youtube: 0.85 };
const MAX_VOLUME = 0.9;
const FADE_MS = 500;
const FADE_STEPS = 20;

class AudioManager {
  constructor() {
    this.sources = {
      radio: new RadioSource(),
      spotify: new SpotifySource(),
      youtube: new YouTubeSource(),
    };
    this.currentSource = null; // 'radio' | 'spotify' | 'youtube' | null
    this.state = 'idle'; // 'idle' | 'loading' | 'playing' | 'paused' | 'transitioning'
    this.volume = 0.5;
    this.fadeEnabled = false;
    this.isTransitioning = false;
    this._playAttemptId = 0;
    this.currentMetadata = { station: null, playlist: null };
    this.callbacks = { onStateChange: null, onError: null, onMetadataChange: null };

    // A radio stream that drops and cannot be recovered ends playback.
    this.sources.radio.onPlaybackFailed = (error) => {
      if (this.currentSource !== 'radio') return;
      this.currentSource = null;
      this._setState('idle');
      this._triggerError(error);
    };
  }

  /** Initialize all sources once; later calls return the same promise. */
  initialize() {
    this._initPromise ??= Promise.all(Object.values(this.sources).map((source) => source.initialize()))
      .then(() => true)
      .catch((error) => {
        console.error('AudioManager: initialization failed', error);
        this._triggerError(error);
        return false;
      });
    return this._initPromise;
  }

  /**
   * Play a source. Resolves true when playback started, false when it failed
   * or was superseded by a newer play() call.
   * @param {'radio'|'spotify'|'youtube'} sourceType
   * @param {object} config - source-specific ({ station } for radio)
   */
  async play(sourceType, config = {}) {
    const attemptId = ++this._playAttemptId;
    const isStale = () => this._playAttemptId !== attemptId;

    try {
      this.isTransitioning = true;
      this._setState('transitioning');

      // Crossfade only between different source types: radio-to-radio would
      // tear down the element the visualizer is attached to.
      if (this.fadeEnabled && this.currentSource && this.currentSource !== sourceType) {
        await this._crossfade(sourceType, config);
        return !isStale();
      }

      await this.stopAll();
      if (isStale()) return false;

      this.currentSource = sourceType;
      this._setState('loading');
      const success = await this.sources[sourceType].play(config);
      if (isStale()) return false;
      if (!success) throw new Error(`Failed to start ${sourceType}`);

      this._setState('playing');
      this.syncVolume();
      this._updateMetadata(sourceType, config);
      return true;
    } catch (error) {
      if (isStale()) return false;
      console.error(`AudioManager: ${sourceType} failed`, error);
      this.currentSource = null;
      this._setState('idle');
      this._triggerError(error);
      return false;
    } finally {
      if (!isStale()) this.isTransitioning = false;
    }
  }

  async pause() {
    if (!this.currentSource) return;
    try {
      await this.sources[this.currentSource].pause();
      this._setState('paused');
    } catch (error) {
      this._triggerError(error);
    }
  }

  async resume() {
    if (!this.currentSource) return;
    try {
      await this.sources[this.currentSource].resume();
      this._setState('playing');
    } catch (error) {
      this._triggerError(error);
    }
  }

  async stopCurrent() {
    if (!this.currentSource) return;
    try {
      await this.sources[this.currentSource].stop();
    } finally {
      this._resetPlayback();
    }
  }

  /** Stop every source, so nothing can ever play on top of something else. */
  async stopAll() {
    await Promise.all(
      Object.values(this.sources).map((source) =>
        source.stop().catch((error) => console.warn('AudioManager: stop failed', error)),
      ),
    );
    this._resetPlayback();
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.syncVolume();
  }

  syncVolume() {
    for (const [type, source] of Object.entries(this.sources)) {
      source.setVolume(this._volumeFor(type));
    }
  }

  getState() {
    return {
      state: this.state,
      currentSource: this.currentSource,
      volume: this.volume,
      isPlaying: this.state === 'playing',
      isPaused: this.state === 'paused',
      isLoading: this.state === 'loading' || this.isTransitioning,
      metadata: this.currentMetadata,
    };
  }

  getSource(sourceType) {
    return this.sources[sourceType];
  }

  getSpotifySource() {
    return this.sources.spotify;
  }

  /** The radio <audio> element while radio is the active source (for the visualizer). */
  getAudioElement() {
    return this.currentSource === 'radio' ? this.sources.radio.getAudioElement() : null;
  }

  isSpotifyReady() {
    return Boolean(this.sources.spotify.isReady);
  }

  on(event, callback) {
    if (event in this.callbacks) this.callbacks[event] = callback;
  }

  setFadeEnabled(enabled) {
    this.fadeEnabled = enabled;
  }

  destroy() {
    this.stopCurrent();
    Object.values(this.sources).forEach((source) => source.destroy?.());
  }

  // --- internals ---

  _volumeFor(sourceType) {
    return Math.min(this.volume * (SOURCE_GAIN[sourceType] ?? 1), MAX_VOLUME);
  }

  async _crossfade(newType, config) {
    const oldType = this.currentSource;
    const next = this.sources[newType];
    this.currentSource = newType;
    try {
      await next.play(config);
      for (let i = 0; i <= FADE_STEPS; i++) {
        const progress = i / FADE_STEPS;
        this.sources[oldType]?.setVolume(this._volumeFor(oldType) * (1 - progress));
        next.setVolume(this._volumeFor(newType) * progress);
        await new Promise((resolve) => setTimeout(resolve, FADE_MS / FADE_STEPS));
      }
      await this.sources[oldType]?.stop();
      this._setState('playing');
      this._updateMetadata(newType, config);
    } catch (error) {
      await this.stopAll();
      throw error;
    }
  }

  _resetPlayback() {
    this.currentSource = null;
    this.currentMetadata = { station: null, playlist: null };
    this._setState('idle');
  }

  _setState(state) {
    this.state = state;
    this.callbacks.onStateChange?.(state);
  }

  _triggerError(error) {
    this.callbacks.onError?.(error);
  }

  _updateMetadata(sourceType, config) {
    if (sourceType === 'radio') this.currentMetadata.station = config.station;
    else this.currentMetadata.playlist = config.playlist || config.playlistId;
    this.callbacks.onMetadataChange?.(this.currentMetadata);
  }
}

let instance = null;

export const getAudioManager = () => {
  instance ??= new AudioManager();
  return instance;
};
