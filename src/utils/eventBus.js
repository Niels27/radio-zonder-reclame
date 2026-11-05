// utils/eventBus.js - Minimal pub/sub for cross-component communication
// (notifications, YouTube player control, audio element changes).

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

// --- Audio element signal helpers ---
export const signalAudioElementChanged = (corsEnabled) => {
  eventBus.emit('audio:elementChanged', { corsEnabled });
};

// --- Playlist stopped helper ---
// Emitted when the user closes a YouTube player themselves (type: 'youtube').
export const signalPlaylistStopped = (type) => {
  eventBus.emit('playlist:stopped', type);
};

export default eventBus;
