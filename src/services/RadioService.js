// services/RadioService.js - Live radio playback through one HTML5 <audio> element.
//
// Every station has an ordered list of streams ({ url, cors }), verified by
// `npm run stations:check`. play() tries them in order, starting with the
// stream that last worked for that station, until one starts playing.
//
// CORS: the visualizer needs the element in crossOrigin mode, but a
// crossOrigin request to a server without CORS headers fails outright. So the
// element only uses crossOrigin for streams flagged `cors`; if such a stream
// errors (its CORS header may have been dropped) it is retried once without
// crossOrigin.
//
// Recovery: when a playing stream errors, ends or stalls, the service
// reconnects on its own (falling back to the next stream) a few times before
// reporting failure through onPlaybackFailed.

import { hasPreroll, isPrerollSkipEnabled, skipPreroll } from '../utils/preroll.js';
import toast from '../utils/toastNotifications.js';
import { signalAudioElementChanged } from '../utils/eventBus';

const CONNECT_TIMEOUT_MS = 8000;
const STALL_TIMEOUT_MS = 15000;
const MAX_RECONNECTS = 3;
const RECONNECT_WINDOW_MS = 60000;

const CACHE_KEY = 'radio_stream_cache_v2';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

class Cancelled extends Error {}

const streamCache = {
  read() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {};
    } catch {
      return {};
    }
  },
  get(stationId) {
    const entry = this.read()[stationId];
    return entry && Date.now() - entry.ts < CACHE_MAX_AGE_MS ? entry : null;
  },
  set(stationId, url) {
    if (!stationId) return;
    try {
      const cache = this.read();
      cache[stationId] = { url, ts: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      // Storage full or unavailable: caching is an optimisation only.
    }
  },
};

export class RadioSource {
  constructor() {
    this.audio = null;
    this.station = null;
    this.volume = 0.5;
    this.corsEnabled = true;
    this._attempt = 0;
    this._connecting = false;
    this._reconnects = [];
    this._stallTimer = null;
    this._prerollUntil = 0; // until then, 'waiting' is the pre-roll skip, not a stall
    this._fadingIn = false;

    // Callbacks set by the owner (useAudio / AudioManager)
    this.onStatusUpdate = null; // (text | null) => void
    this.onBufferingChange = null; // (isBuffering) => void
    this.onPlaybackFailed = null; // (Error) => void - stream lost and recovery failed

    this._onPlaying = () => this._handlePlaying();
    this._onWaiting = () => this._handleWaiting();
    this._onFailure = () => this._handleFailure();
  }

  async initialize() {
    if (!this.audio) this._createAudioElement(true);
    try {
      // Storage keys of older versions that nothing reads any more.
      localStorage.removeItem('radio_working_urls');
      localStorage.removeItem('lastPlayedStation');
    } catch {
      // Storage unavailable.
    }
    return true;
  }

  /** Start playing a station. Resolves true on success, false when superseded. */
  async play({ station }) {
    const streams = station?.streams ?? (station?.url ? [{ url: station.url }] : []);
    if (streams.length === 0) throw new Error('Geen stream bekend voor deze zender');

    const attempt = ++this._attempt;
    this.station = station;
    this._connecting = true;
    this._clearStallTimer();
    this._resetElement();

    try {
      const candidates = this._orderCandidates(station, streams);
      for (let i = 0; i < candidates.length; i++) {
        if (candidates.length > 1) this._emitStatus(`Stream ${i + 1}/${candidates.length} proberen...`);
        try {
          await this._tryStream(candidates[i], attempt);
          streamCache.set(station.id, candidates[i].url);
          return true;
        } catch (error) {
          if (error instanceof Cancelled) return false;
          // A CORS failure is an error, never a timeout: retry without crossOrigin.
          if (candidates[i].cors && !error.timedOut) {
            try {
              await this._tryStream({ ...candidates[i], cors: false }, attempt);
              streamCache.set(station.id, candidates[i].url);
              return true;
            } catch (retryError) {
              if (retryError instanceof Cancelled) return false;
            }
          }
        }
      }
      throw new Error('Deze zender is nu niet bereikbaar');
    } finally {
      if (attempt === this._attempt) {
        this._connecting = false;
        this._emitStatus(null);
      }
    }
  }

  async pause() {
    this._clearStallTimer();
    this.audio?.pause();
  }

  async resume() {
    if (!this.audio || !this.station) return;
    try {
      await this.audio.play();
    } catch {
      // The server dropped the connection while paused: reconnect at the live edge.
      await this.play({ station: this.station });
    }
  }

  async stop() {
    this._attempt++;
    this._connecting = false;
    this.station = null;
    this._clearStallTimer();
    this._resetElement();
    this._emitStatus(null);
    this._emitBuffering(false);
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio && !this._fadingIn) this.audio.volume = this.volume;
  }

  getAudioElement() {
    return this.audio;
  }

  getCurrentStation() {
    return this.station;
  }

  destroy() {
    this.stop();
    this._detachListeners();
    this.audio = null;
  }

  // --- internals ---

  /** Last working stream first, then the station's own order. */
  _orderCandidates(station, streams) {
    const cached = streamCache.get(station.id);
    const known = cached && streams.find((s) => s.url === cached.url);
    return known ? [known, ...streams.filter((s) => s !== known)] : streams;
  }

  _tryStream(stream, attempt) {
    const cors = Boolean(stream.cors);
    if (!this.audio || cors !== this.corsEnabled) this._createAudioElement(cors);
    const audio = this.audio;
    const skipAds = isPrerollSkipEnabled() && hasPreroll(this.station);

    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        clearInterval(cancelCheck);
        audio.removeEventListener('error', onError);
        if (!error) return resolve();
        if (!(error instanceof Cancelled)) this._resetElement();
        reject(error);
      };
      const onError = () => finish(new Error('Stream error'));
      const timer = setTimeout(() => {
        const error = new Error('Timeout');
        error.timedOut = true;
        finish(error);
      }, CONNECT_TIMEOUT_MS);
      const cancelCheck = setInterval(() => {
        if (attempt !== this._attempt) finish(new Cancelled());
      }, 200);

      audio.addEventListener('error', onError);
      audio.volume = skipAds ? 0 : this.volume;
      audio.src = stream.url;
      audio.play().then(async () => {
        if (settled) return;
        if (skipAds) {
          this._prerollUntil = Date.now() + 25000;
          this._fadingIn = true;
          await skipPreroll(audio, this.volume);
          this._fadingIn = false;
          toast.success('Pre-roll reclame overgeslagen', 2500);
        }
        finish();
      }, (error) => finish(error));
    });
  }

  _createAudioElement(withCors) {
    this._detachListeners();
    this._resetElement();
    const audio = new Audio();
    if (withCors) audio.crossOrigin = 'anonymous';
    audio.preload = 'none';
    audio.addEventListener('playing', this._onPlaying);
    audio.addEventListener('waiting', this._onWaiting);
    audio.addEventListener('error', this._onFailure);
    audio.addEventListener('ended', this._onFailure);
    this.audio = audio;
    this.corsEnabled = withCors;
    signalAudioElementChanged(withCors);
  }

  _detachListeners() {
    if (!this.audio) return;
    this.audio.removeEventListener('playing', this._onPlaying);
    this.audio.removeEventListener('waiting', this._onWaiting);
    this.audio.removeEventListener('error', this._onFailure);
    this.audio.removeEventListener('ended', this._onFailure);
  }

  _resetElement() {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
  }

  _handlePlaying() {
    this._clearStallTimer();
    this._emitBuffering(false);
  }

  _handleWaiting() {
    // During a pre-roll skip the element waits on purpose.
    if (this._connecting || Date.now() < this._prerollUntil) return;
    this._emitBuffering(true);
    this._clearStallTimer();
    this._stallTimer = setTimeout(() => this._handleFailure(), STALL_TIMEOUT_MS);
  }

  /** A stream that was playing failed: reconnect, or give up after a few tries. */
  async _handleFailure() {
    if (this._connecting || !this.station || !this.audio?.getAttribute('src')) return;
    this._clearStallTimer();

    const now = Date.now();
    this._reconnects = this._reconnects.filter((t) => now - t < RECONNECT_WINDOW_MS);
    if (this._reconnects.length >= MAX_RECONNECTS) {
      const station = this.station;
      await this.stop();
      this.onPlaybackFailed?.(new Error(`Verbinding met ${station.name} verbroken`));
      return;
    }
    this._reconnects.push(now);
    this._emitStatus('Verbinding herstellen...');
    try {
      await this.play({ station: this.station });
    } catch (error) {
      await this.stop();
      this.onPlaybackFailed?.(error);
    }
  }

  _clearStallTimer() {
    clearTimeout(this._stallTimer);
    this._stallTimer = null;
  }

  _emitStatus(text) {
    this.onStatusUpdate?.(text);
  }

  _emitBuffering(isBuffering) {
    this.onBufferingChange?.(isBuffering);
  }
}
