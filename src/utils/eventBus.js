// utils/eventBus.js - Simple event bus for cross-component communication
// Replaces window.* globals with a lightweight pub/sub system

const listeners = {};

const eventBus = {
  on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    return () => eventBus.off(event, callback);
  },

  off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  },

  emit(event, ...args) {
    if (!listeners[event]) return;
    listeners[event].forEach(cb => {
      try {
        cb(...args);
      } catch (error) {
        console.warn(`eventBus: Error in "${event}" listener:`, error);
      }
    });
  }
};

// --- Notification helper ---
// Replaces window.addNotification() calls throughout the codebase
export const notify = (message, type = 'info', duration = 3000) => {
  eventBus.emit('notification', { message, type, duration });
};

// --- YouTube player helpers ---
export const openYouTubePlayer = (config) => {
  eventBus.emit('youtube:open', config);
};

export const closeAllYouTubePlayers = () => {
  eventBus.emit('youtube:close');
};

export const updateYouTubePlayers = (config) => {
  eventBus.emit('youtube:update', config);
};

// --- Audio element signal helpers ---
export const signalAudioElementChanged = (corsEnabled) => {
  eventBus.emit('audio:elementChanged', { corsEnabled });
};

// --- Playlist stopped helper ---
export const signalPlaylistStopped = (type) => {
  eventBus.emit('playlist:stopped', type);
};

// --- Manual modes helper ---
let _stopAllManualModes = null;
export const registerStopAllManualModes = (fn) => { _stopAllManualModes = fn; };
export const stopAllManualModes = () => { if (_stopAllManualModes) _stopAllManualModes(); };

export default eventBus;
