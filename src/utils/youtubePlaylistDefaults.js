// src/utils/youtubePlaylistDefaults.js - YouTube playlists for the dice/random button.
// Users can add/remove entries; the list is stored in localStorage.

const STORAGE_KEY = 'youtube_dice_playlists';

// Built-in defaults (always available as reset option)
const DEFAULT_YOUTUBE_PLAYLISTS = [
  {
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    name: 'Lofi Girl - Study Stream'
  },
  {
    url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
    name: 'Lofi Girl - Sleep Stream'
  },
  {
    url: 'https://youtube.com/playlist?list=PLNj0pBssoTE9MducJoC0aBoHFxrxHwqKq',
    name: 'Top 2000 2022'
  },
  {
    url: 'https://www.youtube.com/watch?v=5yx6BWlEVcY',
    name: 'ChilledCow Alternative'
  },
  {
    url: 'https://www.youtube.com/watch?v=kgx4WGK0oNU',
    name: 'Lofi Hip Hop Cafe'
  }
];

/**
 * Load the user's dice playlist list from localStorage.
 * Falls back to defaults if nothing saved.
 */
export function loadDicePlaylists() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // corrupt data - fall back to defaults
  }
  return [...DEFAULT_YOUTUBE_PLAYLISTS];
}

export function saveDicePlaylists(playlists) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Remove a playlist from the dice list (minimum 1 must remain)
 */
export function removeDicePlaylist(url) {
  const list = loadDicePlaylists();
  if (list.length <= 1) return list;
  const filtered = list.filter(p => p.url !== url);
  saveDicePlaylists(filtered);
  return filtered;
}

export function getRandomDicePlaylist() {
  const list = loadDicePlaylists();
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Reset dice playlists to defaults and return the new list
 */
export function resetDicePlaylists() {
  const defaults = [...DEFAULT_YOUTUBE_PLAYLISTS];
  saveDicePlaylists(defaults);
  return defaults;
}
