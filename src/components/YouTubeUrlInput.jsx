// src/components/YouTubeUrlInput.jsx - YouTube URL input with dice/random button and playlist management

import { useState, useEffect, useRef } from 'react';
import {
  loadDicePlaylists,
  saveDicePlaylists,
  getRandomDicePlaylist,
  removeDicePlaylist,
  DEFAULT_YOUTUBE_PLAYLISTS
} from '../utils/youtubePlaylistDefaults.js';
import { extractPlaylistId } from '../utils/youtubeUtils.js';
import { extractYouTubeVideoId } from '../utils/lofiUtils.js';

const YouTubeUrlInput = ({ youtubeUrl, onYoutubeUrlChange }) => {
  const [showDiceDropdown, setShowDiceDropdown] = useState(false);
  const [dicePlaylists, setDicePlaylists] = useState(() => loadDicePlaylists());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDiceDropdown(false);
        setShowAddForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if URL is a valid YouTube URL
  const isValidUrl = (url) => {
    if (!url) return true; // empty is ok
    return extractYouTubeVideoId(url) || extractPlaylistId(url);
  };

  // Get a display name for the current URL
  const getUrlDisplayInfo = () => {
    if (!youtubeUrl) return null;
    // Check if it matches a known playlist in our dice list
    const match = dicePlaylists.find(p => p.url === youtubeUrl);
    if (match) return match.name;
    return null;
  };

  const handleRandomPlaylist = () => {
    const random = getRandomDicePlaylist();
    if (random) {
      onYoutubeUrlChange(random.url);
      if (window.addNotification) {
        window.addNotification(`Willekeurig: ${random.name}`, 'info', 2000);
      }
    }
  };

  const handleRemovePlaylist = (url) => {
    const updated = removeDicePlaylist(url);
    setDicePlaylists(updated);
  };

  const handleSaveCurrentUrl = () => {
    if (!youtubeUrl || !isValidUrl(youtubeUrl)) return;
    // Check if already exists
    if (dicePlaylists.some(p => p.url === youtubeUrl)) {
      if (window.addNotification) {
        window.addNotification('Deze URL staat al in de lijst', 'warning', 2000);
      }
      return;
    }
    const name = newPlaylistName.trim() || 'Aangepaste playlist';
    const updated = [...dicePlaylists, { url: youtubeUrl, name }];
    saveDicePlaylists(updated);
    setDicePlaylists(updated);
    setNewPlaylistName('');
    setShowAddForm(false);
    if (window.addNotification) {
      window.addNotification(`"${name}" opgeslagen in de lijst`, 'success', 2000);
    }
  };

  const handleResetDefaults = () => {
    const defaults = [...DEFAULT_YOUTUBE_PLAYLISTS];
    saveDicePlaylists(defaults);
    setDicePlaylists(defaults);
    if (window.addNotification) {
      window.addNotification('Lijst gereset naar standaard', 'info', 2000);
    }
  };

  const urlDisplayName = getUrlDisplayInfo();
  const valid = isValidUrl(youtubeUrl);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        YouTube URL:
      </label>
      <div className="flex space-x-2">
        {/* URL Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => onYoutubeUrlChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=... of playlist URL"
            className={`w-full px-3 py-2 pr-10 bg-gray-700 border ${
              !youtubeUrl ? 'border-gray-600' :
              valid ? 'border-green-500' : 'border-red-500'
            } rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm`}
          />

          {/* Clear button */}
          {youtubeUrl && (
            <button
              onClick={() => onYoutubeUrlChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              title="URL wissen"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Dice/Random Button with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDiceDropdown(!showDiceDropdown)}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
            title="Willekeurige YouTube playlist"
          >
            🎲
          </button>

          {/* Dice Dropdown */}
          {showDiceDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-30 w-80 max-h-96 overflow-y-auto">
              {/* Header */}
              <div className="px-3 py-2 border-b border-gray-600 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">YouTube Playlists</span>
                <div className="flex gap-1">
                  <button
                    onClick={handleRandomPlaylist}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs"
                    title="Willekeurig kiezen"
                  >
                    🎲 Random
                  </button>
                  <button
                    onClick={handleResetDefaults}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded text-xs"
                    title="Reset naar standaard"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Playlist items */}
              {dicePlaylists.map((playlist, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 flex items-center gap-2 hover:bg-gray-600 cursor-pointer border-b border-gray-600/50 last:border-b-0 ${
                    youtubeUrl === playlist.url ? 'bg-gray-600/50' : ''
                  }`}
                  onClick={() => {
                    onYoutubeUrlChange(playlist.url);
                    setShowDiceDropdown(false);
                  }}
                >
                  {/* YouTube icon */}
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a2.99 2.99 0 0 0-2.11-2.11C19.504 3.5 12 3.5 12 3.5s-7.504 0-9.388.576a2.99 2.99 0 0 0-2.11 2.11C0 8.07 0 12 0 12s0 3.93.502 5.814a2.99 2.99 0 0 0 2.11 2.11C4.496 20.5 12 20.5 12 20.5s7.504 0 9.388-.576a2.99 2.99 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{playlist.name}</div>
                    <div className="text-gray-400 text-xs truncate">{playlist.url}</div>
                  </div>
                  {/* Active indicator */}
                  {youtubeUrl === playlist.url && (
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                  {/* Remove button (only if more than 1) */}
                  {dicePlaylists.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePlaylist(playlist.url);
                      }}
                      className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Verwijderen"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              {/* Add current URL to list */}
              <div className="px-3 py-2 border-t border-gray-600">
                {!showAddForm ? (
                  <button
                    onClick={() => {
                      if (youtubeUrl && isValidUrl(youtubeUrl) && !dicePlaylists.some(p => p.url === youtubeUrl)) {
                        setShowAddForm(true);
                      } else if (!youtubeUrl) {
                        if (window.addNotification) window.addNotification('Voer eerst een URL in', 'warning', 2000);
                      } else if (dicePlaylists.some(p => p.url === youtubeUrl)) {
                        if (window.addNotification) window.addNotification('Deze URL staat al in de lijst', 'warning', 2000);
                      }
                    }}
                    className="w-full px-2 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded text-xs text-center"
                  >
                    + Huidige URL opslaan in lijst
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="Naam voor deze playlist..."
                      className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:border-blue-500 focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveCurrentUrl();
                        if (e.key === 'Escape') setShowAddForm(false);
                      }}
                    />
                    <button
                      onClick={handleSaveCurrentUrl}
                      className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs"
                    >
                      Opslaan
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Display matched playlist name */}
      {urlDisplayName && (
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <svg className="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a2.99 2.99 0 0 0-2.11-2.11C19.504 3.5 12 3.5 12 3.5s-7.504 0-9.388.576a2.99 2.99 0 0 0-2.11 2.11C0 8.07 0 12 0 12s0 3.93.502 5.814a2.99 2.99 0 0 0 2.11 2.11C4.496 20.5 12 20.5 12 20.5s7.504 0 9.388-.576a2.99 2.99 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          {urlDisplayName}
        </div>
      )}

      {/* Invalid URL warning */}
      {youtubeUrl && !valid && (
        <p className="text-xs text-red-400">
          Ongeldige YouTube URL. Gebruik een video of playlist link.
        </p>
      )}
    </div>
  );
};

export default YouTubeUrlInput;
