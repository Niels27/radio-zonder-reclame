// src/components/PlaylistProviderSelector.jsx - Spotify-only playlist selector

import { useState, useEffect, useRef } from 'react';
import {
  loginToSpotify,
  getUserPlaylists,
  isSpotifyAuthenticated,
  logoutFromSpotify,
  validateSpotifyPlaylist
} from '../utils/spotifyUtils';

const PlaylistProviderSelector = ({
  playlistUrl,
  onPlaylistUrlChange,
  onPlaylistInfoChange,
  onValidatingChange,
  error,
  onRetry
}) => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState('');
  const [isSpotifyLoginInProgress, setIsSpotifyLoginInProgress] = useState(false);
  const [spotifyError, setSpotifyError] = useState(null);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [spotifyMode, setSpotifyMode] = useState('eigen'); // 'eigen' or 'openbare'
  const [spotifyPlayerReady, setSpotifyPlayerReady] = useState(false);

  const playlistDropdownRef = useRef(null);

  // Poll for Spotify player ready state
  useEffect(() => {
    let interval;
    if (isSpotifyAuthenticated()) {
      interval = setInterval(() => {
        const currentReady = window.audioPlayer?.spotifyPlayerReady || false;
        if (currentReady !== spotifyPlayerReady) {
          setSpotifyPlayerReady(currentReady);
        }
      }, 500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [spotifyPlayerReady]);

  // Force UI update when Spotify becomes ready
  useEffect(() => {
    if (window.audioPlayer?.spotifyPlayerReady && !spotifyPlayerReady) {
      setSpotifyPlayerReady(true);
    }
  }, [spotifyPlayerReady]);

  // Listen for manual Spotify ready events
  useEffect(() => {
    const handleManualSpotifyReady = (event) => {
      if (event.detail.manual && event.detail.ready) {
        setSpotifyPlayerReady(prev => !prev);
        setTimeout(() => setSpotifyPlayerReady(event.detail.ready), 50);
      }
    };
    window.addEventListener('spotifyPlayerReady', handleManualSpotifyReady);
    return () => window.removeEventListener('spotifyPlayerReady', handleManualSpotifyReady);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (playlistDropdownRef.current && !playlistDropdownRef.current.contains(event.target)) {
        setShowPlaylistDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Spotify login
  const handleSpotifyLogin = async () => {
    setIsSpotifyLoginInProgress(true);
    setSpotifyError(null);

    try {
      await loginToSpotify();

      if (window.audioPlayer && window.audioPlayer.manualInitializeSpotifyPlayer) {
        try {
          await window.audioPlayer.manualInitializeSpotifyPlayer();
        } catch (playerError) {
          console.warn('Spotify player initialization failed, but login was successful:', playerError);
        }
      }

      await loadSpotifyPlaylists();

      if (window.addNotification) {
        window.addNotification('Spotify verbonden! Kies een afspeellijst.', 'success', 3000);
      }
    } catch (error) {
      console.error('Spotify login failed:', error);
      setSpotifyError(error.message);

      if (window.addNotification) {
        window.addNotification('Spotify login mislukt', 'error', 4000);
      }
    } finally {
      setIsSpotifyLoginInProgress(false);
    }
  };

  // Load Spotify playlists
  const loadSpotifyPlaylists = async (search = '') => {
    if (!isSpotifyAuthenticated()) return;

    setLoadingPlaylists(true);
    try {
      const playlists = await getUserPlaylists(search, 50);
      setSpotifyPlaylists(playlists);
    } catch (error) {
      console.error('Error loading Spotify playlists:', error);
      setSpotifyError(error.message);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  // Handle playlist search
  const handlePlaylistSearch = (query) => {
    setPlaylistSearchQuery(query);

    clearTimeout(window.spotifySearchTimeout);
    window.spotifySearchTimeout = setTimeout(() => {
      loadSpotifyPlaylists(query);
    }, 300);
  };

  // Handle input focus
  const handlePlaylistInputFocus = () => {
    setShowPlaylistDropdown(true);
    if (spotifyPlaylists.length === 0 || !playlistSearchQuery) {
      loadSpotifyPlaylists('');
    }
  };

  // Handle playlist selection
  const handlePlaylistSelect = async (playlist) => {
    onPlaylistUrlChange(playlist.id);
    setPlaylistSearchQuery(playlist.name);
    setShowPlaylistDropdown(false);

    if (onValidatingChange) onValidatingChange(true);
    try {
      const validation = await validateSpotifyPlaylist(playlist.id);
      onPlaylistInfoChange(validation);
    } catch (error) {
      console.error('Error validating Spotify playlist:', error);
      onPlaylistInfoChange({ isValid: false, error: error.message });
    } finally {
      if (onValidatingChange) onValidatingChange(false);
    }
  };

  // Handle Spotify logout
  const handleSpotifyLogout = () => {
    logoutFromSpotify();
    setSpotifyPlaylists([]);
    setPlaylistSearchQuery('');
    onPlaylistUrlChange('');
    onPlaylistInfoChange(null);

    if (window.addNotification) {
      window.addNotification('Spotify uitgelogd', 'info', 2000);
    }
  };

  // Filter playlists based on search
  const filteredPlaylists = spotifyPlaylists.filter(playlist =>
    playlist.name.toLowerCase().includes(playlistSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Spotify init error/retry */}
      {error && (
        <button
          className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-semibold text-sm"
          onClick={() => onRetry && onRetry()}
        >
          Probeer opnieuw
        </button>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Spotify Afspeellijst:
        </label>
        <div className="flex space-x-2">

          {/* Spotify authenticated content */}
          {isSpotifyAuthenticated() && (
            <div className="flex-1">
              {/* Spotify player status indicator */}
              {!spotifyPlayerReady && (
                <div className="mb-2 px-3 py-2 bg-yellow-900 border border-yellow-600 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-200">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span className="text-sm">Spotify player wordt geinitialiseerd...</span>
                    {window.audioPlayer?.showForceSpotifyButton && (
                      <button
                        onClick={() => window.audioPlayer?.forceStartSpotify && window.audioPlayer.forceStartSpotify()}
                        className="ml-4 px-3 py-1 bg-yellow-700 hover:bg-yellow-600 text-yellow-100 rounded transition-colors text-xs border border-yellow-400 shadow"
                      >
                        Klik hier als Spotify niet start
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Input based on mode */}
              {spotifyMode === 'eigen' ? (
                <div className="relative" ref={playlistDropdownRef}>
                  <input
                    type="text"
                    value={playlistSearchQuery}
                    onChange={(e) => handlePlaylistSearch(e.target.value)}
                    onFocus={handlePlaylistInputFocus}
                    placeholder="Typ om je afspeellijsten te zoeken..."
                    className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    disabled={!spotifyPlayerReady}
                  />

                  {playlistSearchQuery && (
                    <button
                      onClick={() => {
                        setPlaylistSearchQuery('');
                        onPlaylistUrlChange('');
                        onPlaylistInfoChange(null);
                        setShowPlaylistDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      title="Zoekopdracht wissen"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  )}

                  {/* Playlist Dropdown */}
                  {showPlaylistDropdown && spotifyPlayerReady && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                      {loadingPlaylists ? (
                        <div className="px-3 py-4 text-center text-gray-400">
                          <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          <div className="mt-2">Afspeellijsten laden...</div>
                        </div>
                      ) : filteredPlaylists.length > 0 ? (
                        filteredPlaylists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => handlePlaylistSelect(playlist)}
                            className="w-full px-3 py-3 text-left hover:bg-gray-600 flex items-center space-x-3 border-b border-gray-600 last:border-b-0"
                          >
                            {playlist.imageUrl ? (
                              <img
                                src={playlist.imageUrl}
                                alt={playlist.name}
                                className="w-10 h-10 rounded object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium truncate">{playlist.name}</div>
                              <div className="text-xs text-gray-400">
                                {playlist.trackCount} nummers {playlist.owner && `\u2022 ${playlist.owner}`}
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-gray-400">
                          {playlistSearchQuery ? 'Geen afspeellijsten gevonden' : 'Geen afspeellijsten beschikbaar'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Openbare mode - URL input */
                <div className="relative">
                  <input
                    type="text"
                    value={playlistUrl}
                    onChange={(e) => onPlaylistUrlChange(e.target.value)}
                    placeholder="https://open.spotify.com/playlist/..."
                    className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:bg-gray-800 disabled:cursor-not-allowed"
                    disabled={!spotifyPlayerReady}
                  />

                  {playlistUrl && (
                    <button
                      onClick={() => {
                        onPlaylistUrlChange('');
                        onPlaylistInfoChange(null);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      title="URL wissen"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mode Selector for Spotify */}
          {isSpotifyAuthenticated() && (
            <select
              value={spotifyMode}
              onChange={(e) => setSpotifyMode(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="eigen">Eigen playlists</option>
              <option value="openbare">Openbare URL's</option>
            </select>
          )}

          {/* Spotify Login Button */}
          {!isSpotifyAuthenticated() && (
            <button
              onClick={handleSpotifyLogin}
              disabled={isSpotifyLoginInProgress}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              {isSpotifyLoginInProgress ? 'Inloggen...' : 'Inloggen bij Spotify'}
            </button>
          )}

          {/* Spotify Logout Button */}
          {isSpotifyAuthenticated() && (
            <button
              onClick={handleSpotifyLogout}
              className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              title="Uitloggen"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H4v16h10v-2h2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h10z"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {spotifyError && (
        <div className="text-sm text-red-400 bg-red-600/10 border border-red-500/30 rounded-lg p-2">
          {spotifyError}
        </div>
      )}
    </div>
  );
};

export default PlaylistProviderSelector;
