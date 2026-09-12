// services/RadioService.js - Radio stream playback service
// Handles HTML5 Audio element for live radio streams

import { AdSkipUtils } from '../utils/adSkipUtils.js';
import { getStationDefinition } from '../data/fallbackStations.js';
import toast from '../utils/toastNotifications.js';
import { signalAudioElementChanged } from '../utils/eventBus';

// CORS proxies to try when direct URLs fail
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

// localStorage key for cached working URLs
const URL_CACHE_KEY = 'radio_working_urls';

/**
 * Load the working URL cache from localStorage
 */
function loadUrlCache() {
  try {
    const raw = localStorage.getItem(URL_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save a working URL + CORS mode for a station
 */
function cacheWorkingUrl(stationName, url, corsMode) {
  try {
    const cache = loadUrlCache();
    cache[stationName] = { url, cors: corsMode, ts: Date.now() };
    localStorage.setItem(URL_CACHE_KEY, JSON.stringify(cache));
    console.log(`💾 Cached working URL for "${stationName}": ${url.substring(0, 60)}... (CORS: ${corsMode})`);
  } catch {
    // localStorage full or unavailable - ignore
  }
}

/**
 * Get the cached working URL for a station (if any, and not too old)
 */
function getCachedUrl(stationName) {
  try {
    const cache = loadUrlCache();
    const entry = cache[stationName];
    if (!entry) return null;
    // Cache entries expire after 7 days
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - entry.ts > maxAge) return null;
    return entry;
  } catch {
    return null;
  }
}

/**
 * Clear the cached URL for a station (when it stops working)
 */
function clearCachedUrl(stationName) {
  try {
    const cache = loadUrlCache();
    delete cache[stationName];
    localStorage.setItem(URL_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

export class RadioSource {
  constructor() {
    this.audio = null;
    this.currentStation = null;
    this.volume = 0.5;
    this.isInitialized = false;
    this.prerollSkipTimeout = null;
    this.hasSkippedPreroll = false;
    this._playAttemptId = 0;
    this.corsEnabled = true;
    this.onStatusUpdate = null;   // callback: (statusText) => void
    this.onBufferingChange = null; // callback: (isBuffering) => void
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      this._createAudioElement(true);
      this.isInitialized = true;
      console.log('✅ RadioService: Initialized');
      return true;
    } catch {
      console.error('❌ RadioService: Initialization failed');
      return false;
    }
  }

  _createAudioElement(withCors) {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener('loadeddata', this._boundHandleLoaded);
      this.audio.removeEventListener('playing', this._boundHandlePlaying);
      this.audio.removeEventListener('waiting', this._boundHandleWaiting);
      this.audio.src = '';
    }

    this.audio = new Audio();
    if (withCors) {
      this.audio.crossOrigin = 'anonymous';
    }
    this.audio.preload = 'none';
    this.corsEnabled = withCors;

    this._boundHandleLoaded = this._handleLoaded.bind(this);
    this._boundHandlePlaying = this._handlePlaying.bind(this);
    this._boundHandleWaiting = this._handleWaiting.bind(this);

    this.audio.addEventListener('loadeddata', this._boundHandleLoaded);
    this.audio.addEventListener('playing', this._boundHandlePlaying);
    this.audio.addEventListener('waiting', this._boundHandleWaiting);

    console.log(`🔧 RadioService: Created audio element (CORS: ${withCors})`);
  }

  _buildUrlList(station) {
    const urls = [];
    const seen = new Set();

    const addUrl = (url) => {
      if (url && !seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    };

    // 1. Check fallbackStations.js for curated URLs
    const fallbackDef = getStationDefinition(station.name);
    if (fallbackDef && fallbackDef.urls) {
      fallbackDef.urls.forEach(addUrl);
    }

    // 2. Station's own urls array
    if (station.urls && Array.isArray(station.urls)) {
      station.urls.forEach(addUrl);
    }

    // 3. Station's primary url
    addUrl(station.url);

    // 4. Legacy fallbackUrl
    if (station.fallbackUrl) {
      addUrl(station.fallbackUrl);
    }

    // 5. For HTTP URLs, try HTTPS upgrade
    const httpUrls = urls.filter(u => u.startsWith('http://'));
    httpUrls.forEach(httpUrl => {
      addUrl(httpUrl.replace('http://', 'https://'));
    });

    return urls;
  }

  _buildProxyUrls(urls) {
    const proxyUrls = [];
    const httpUrls = urls.filter(u => u.startsWith('http://') && !u.includes('corsproxy') && !u.includes('allorigins'));
    httpUrls.forEach(httpUrl => {
      for (const proxy of CORS_PROXIES) {
        proxyUrls.push(proxy + encodeURIComponent(httpUrl));
      }
    });
    return proxyUrls;
  }

  /**
   * Play a radio station - tries cached URL first, then fallback list
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

      this.hasSkippedPreroll = false;
      this.currentStation = station;
      this._playAttemptId++;
      const attemptId = this._playAttemptId;

      // === FAST PATH: Try cached working URL first ===
      const cached = getCachedUrl(station.name);
      if (cached) {
        console.log(`⚡ RadioService: Trying cached URL for ${station.name}`);
        this._emitStatus('Opgeslagen stream proberen...');
        const needsCorsSwitch = cached.cors !== this.corsEnabled;
        if (needsCorsSwitch) {
          this._createAudioElement(cached.cors);
          this._signalVisualizerReconnect();
        }
        try {
          const success = await this._tryUrl(cached.url, station, 8000);
          if (success) {
            console.log(`⚡ RadioService: Cached URL worked for ${station.name}`);
            // Refresh the cache timestamp so it stays valid
            cacheWorkingUrl(station.name, cached.url, cached.cors);
            this._emitStatus(null);
            return true;
          }
        } catch (err) {
          // A newer play() call already took over this.audio - bail out quietly
          // like the URL loops below do, instead of throwing. Throwing here used
          // to propagate out to the outer catch and fire a spurious "kan niet
          // starten" error toast even though the newer attempt was loading fine.
          if (err.message === 'Cancelled') return false;
          console.log(`⚡ RadioService: Cached URL failed, trying full list...`);
          clearCachedUrl(station.name);
        }
      }

      // Build URL lists
      const urlList = this._buildUrlList(station);
      const proxyUrls = this._buildProxyUrls(urlList);
      console.log(`📋 RadioService: ${urlList.length} URLs + ${proxyUrls.length} proxy URLs for ${station.name}`);

      // === PASS 1: Try with CORS enabled (audio + visualizer) ===
      if (!this.corsEnabled) {
        this._createAudioElement(true);
        this._signalVisualizerReconnect();
      }

      const totalUrls = urlList.length + proxyUrls.length;
      let tryCount = 0;

      for (let i = 0; i < urlList.length; i++) {
        if (this._playAttemptId !== attemptId) return false;
        tryCount++;
        const url = urlList[i];
        this._emitStatus(`Stream ${tryCount}/${totalUrls} proberen...`);
        console.log(`🔗 [CORS] Trying URL ${i + 1}/${urlList.length}: ${url.substring(0, 80)}...`);
        try {
          const success = await this._tryUrl(url, station, 8000);
          if (success) {
            cacheWorkingUrl(station.name, url, true);
            console.log(`✅ RadioService: Playing ${station.name} with CORS (URL ${i + 1})`);
            this._emitStatus(null);
            return true;
          }
        } catch (err) {
          if (err.message === 'Cancelled') return false;
        }
      }

      // Try proxy URLs with CORS
      for (let i = 0; i < proxyUrls.length; i++) {
        if (this._playAttemptId !== attemptId) return false;
        tryCount++;
        const url = proxyUrls[i];
        this._emitStatus(`Proxy ${tryCount}/${totalUrls} proberen...`);
        console.log(`🔗 [CORS+Proxy] Trying: ${url.substring(0, 80)}...`);
        try {
          const success = await this._tryUrl(url, station, 8000);
          if (success) {
            cacheWorkingUrl(station.name, url, true);
            console.log(`✅ RadioService: Playing ${station.name} via CORS proxy`);
            this._emitStatus(null);
            return true;
          }
        } catch (err) {
          if (err.message === 'Cancelled') return false;
        }
      }

      // === PASS 2: Try WITHOUT CORS (audio works, no visualizer) ===
      console.log(`🔄 RadioService: CORS failed, trying without CORS...`);
      this._emitStatus('Zonder visualizer proberen...');
      this._createAudioElement(false);
      this._signalVisualizerReconnect();

      for (let i = 0; i < urlList.length; i++) {
        if (this._playAttemptId !== attemptId) return false;
        this._emitStatus(`Alternatief ${i + 1}/${urlList.length} proberen...`);
        const url = urlList[i];
        console.log(`🔗 [No-CORS] Trying URL ${i + 1}/${urlList.length}: ${url.substring(0, 80)}...`);
        try {
          const success = await this._tryUrl(url, station, 8000);
          if (success) {
            cacheWorkingUrl(station.name, url, false);
            console.log(`✅ RadioService: Playing ${station.name} without CORS (no visualizer)`);
            this._emitStatus(null);
            if (toast) {
              toast.info('Afspelen zonder visualizer (stream ondersteunt geen CORS)', 3000);
            }
            return true;
          }
        } catch (err) {
          if (err.message === 'Cancelled') return false;
        }
      }

      this._emitStatus(null);
      throw new Error('Alle streams geprobeerd - geen werkende gevonden');

    } catch (error) {
      console.error('❌ RadioService: Play failed', error);

      const userMessage = error.message.includes('Alle streams') || error.message.includes('timeout')
        ? error.message
        : 'Verbindingsfout - kan radio niet laden';

      if (toast) {
        toast.error(userMessage, 4000);
      }

      const userError = new Error(userMessage);
      userError.originalError = error;
      throw userError;
    }
  }

  _emitStatus(text) {
    if (this.onStatusUpdate) {
      this.onStatusUpdate(text);
    }
  }

  _emitBuffering(isBuffering) {
    if (this.onBufferingChange) {
      this.onBufferingChange(isBuffering);
    }
  }

  _signalVisualizerReconnect() {
    signalAudioElementChanged(this.corsEnabled);
  }

  _tryUrl(url, station, timeoutMs) {
    const attemptId = this._playAttemptId;
    return new Promise((resolve, reject) => {
      let settled = false;
      const settle = (fn, val) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        clearInterval(cancelChecker);
        this.audio.removeEventListener('error', onError);
        fn(val);
      };

      const timer = setTimeout(() => {
        settle(reject, new Error(`Timeout na ${timeoutMs / 1000}s`));
      }, timeoutMs);

      // Check every 200ms if this attempt was cancelled
      const cancelChecker = setInterval(() => {
        if (this._playAttemptId !== attemptId) {
          settle(reject, new Error('Cancelled'));
        }
      }, 200);

      const onError = () => {
        settle(reject, new Error('Stream error'));
      };

      this.audio.addEventListener('error', onError, { once: true });

      const isAutoSkipEnabled = AdSkipUtils.getAutoSkipSetting();
      const shouldSkipPreroll = isAutoSkipEnabled &&
        !this.hasSkippedPreroll &&
        AdSkipUtils.shouldOfferPrerollSkip(url, station.name);

      if (shouldSkipPreroll) {
        this.audio.volume = 0;
        this.audio.dataset.targetVolume = this.volume;
      } else {
        this.audio.volume = this.volume;
      }

      this.audio.src = url;
      const playPromise = this.audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => settle(resolve, true))
          .catch(err => settle(reject, err));
      } else {
        setTimeout(() => {
          if (!this.audio.paused) {
            settle(resolve, true);
          } else {
            settle(reject, new Error('Playback did not start'));
          }
        }, 2000);
      }
    });
  }

  async pause() {
    if (!this.audio) return;
    try {
      this.audio.pause();
    } catch (error) {
      console.warn('RadioService: pause() error:', error.message);
    }
  }

  async resume() {
    if (!this.audio) return;
    await this.audio.play();
  }

  async stop() {
    if (!this.audio) return;
    try {
      if (this.prerollSkipTimeout) {
        clearTimeout(this.prerollSkipTimeout);
        this.prerollSkipTimeout = null;
      }
      this._playAttemptId++;
      this.audio.pause();
      this.audio.src = '';
      this.currentStation = null;
      this._emitStatus(null);
      this._emitBuffering(false);
    } catch (error) {
      console.warn('RadioService: stop() cleanup error:', error.message);
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  getAudioElement() {
    return this.audio;
  }

  getCurrentStation() {
    return this.currentStation;
  }

  _handleLoaded() {
    console.log('📡 RadioService: Stream loaded');
  }

  _handlePlaying() {
    console.log('▶️ RadioService: Stream playing');
    this._emitBuffering(false);
    this._handlePrerollSkip();
  }

  async _handlePrerollSkip() {
    if (this.hasSkippedPreroll) return;

    if (this.prerollSkipTimeout) {
      clearTimeout(this.prerollSkipTimeout);
      this.prerollSkipTimeout = null;
    }

    const isAutoSkipEnabled = AdSkipUtils.getAutoSkipSetting();
    if (!isAutoSkipEnabled) return;

    if (!this.currentStation || !AdSkipUtils.shouldOfferPrerollSkip(this.currentStation.url, this.currentStation.name)) {
      return;
    }

    this.hasSkippedPreroll = true;

    this.prerollSkipTimeout = setTimeout(async () => {
      try {
        const skipDuration = 17;
        await AdSkipUtils.skipPrerollSilently(this.audio, skipDuration);
        toast.success(`Pre-roll reclame overgeslagen`, 2500);
      } catch (error) {
        console.error('❌ Auto pre-roll skip failed:', error);
        this.hasSkippedPreroll = false;
      }
    }, 200);
  }

  _handleWaiting() {
    console.log('⏳ RadioService: Buffering...');
    this._emitBuffering(true);
  }

  destroy() {
    if (this.prerollSkipTimeout) {
      clearTimeout(this.prerollSkipTimeout);
      this.prerollSkipTimeout = null;
    }
    this._playAttemptId++;
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.currentStation = null;
    this.isInitialized = false;
  }
}

// Export cache functions for use by stream tester / dev dashboard
export { cacheWorkingUrl, getCachedUrl, clearCachedUrl, loadUrlCache };

export default RadioSource;
