// src/components/PlaylistProviderSelector.jsx - Dropdown for YouTube/Spotify selection with Spotify integration

import React, { useState, useEffect, useRef } from 'react';
import { 
  loginToSpotify, 
  getUserPlaylists, 
  isSpotifyAuthenticated, 
  logoutFromSpotify,
  validateSpotifyPlaylist 
} from '../utils/spotifyUtils';
import { 
  getRandomYouTubePlaylist, 
  getRandomSpotifyPlaylist 
} from '../utils/predefinedPlaylists';
import { validatePlaylistUrl } from '../utils/youtubeUtils';

const PlaylistProviderSelector = ({
  selectedProvider,
  onProviderChange,
  playlistUrl,
  onPlaylistUrlChange,
  playlistInfo,
  onPlaylistInfoChange,
  isValidating,
  onValidatingChange,
  error, // <-- new prop
  onRetry // <-- new prop
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState('');
  const [isSpotifyLoginInProgress, setIsSpotifyLoginInProgress] = useState(false);
  const [spotifyError, setSpotifyError] = useState(null);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [spotifyMode, setSpotifyMode] = useState('eigen'); // 'eigen' or 'openbare'
  // Add local state to force re-render when Spotify player state changes
  const [spotifyPlayerReady, setSpotifyPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New loading state
  
  const dropdownRef = useRef(null);
  const playlistDropdownRef = useRef(null);

  // Poll for Spotify player ready state to ensure UI updates
  useEffect(() => {
    let interval;
    if (selectedProvider === 'spotify' && isSpotifyAuthenticated()) {
      interval = setInterval(() => {
        const currentReady = window.audioPlayer?.spotifyPlayerReady || false;
        if (currentReady !== spotifyPlayerReady) {
          console.log('🔄 Spotify player ready state changed:', currentReady);
          setSpotifyPlayerReady(currentReady);
        }
      }, 500); // Check every 500ms
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [selectedProvider, spotifyPlayerReady]);

  // FIXED: Force UI update when Spotify becomes ready
  useEffect(() => {
    // Force re-render when Spotify player becomes ready
    if (selectedProvider === 'spotify' && window.audioPlayer?.spotifyPlayerReady) {
      console.log('🔄 Spotify player ready state changed:', window.audioPlayer.spotifyPlayerReady);
      
      // Force component to re-render by updating a dummy state
      setIsLoading(false);
      
      // If we were stuck loading, clear it
      if (isValidating) {
        setIsValidating(false);
      }
    }
  }, [selectedProvider, window.audioPlayer?.spotifyPlayerReady]);

  // Add this effect to watch for global Spotify ready state
  useEffect(() => {
    const checkSpotifyReady = () => {
      if (selectedProvider === 'spotify' && window.audioPlayer?.spotifyPlayerReady && isValidating) {
        console.log('🎵 Spotify ready detected - updating UI');
        setIsValidating(false);
        setIsLoading(false);
      }
    };
    
    const interval = setInterval(checkSpotifyReady, 1000);
    return () => clearInterval(interval);
  }, [selectedProvider, isValidating]);

  const providers = [
    {
      id: 'youtube',
      name: 'YouTube',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a2.99 2.99 0 0 0-2.11-2.11C19.504 3.5 12 3.5 12 3.5s-7.504 0-9.388.576a2.99 2.99 0 0 0-2.11 2.11C0 8.07 0 12 0 12s0 3.93.502 5.814a2.99 2.99 0 0 0 2.11 2.11C4.496 20.5 12 20.5 12 20.5s7.504 0 9.388-.576a2.99 2.99 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      )
    }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (playlistDropdownRef.current && !playlistDropdownRef.current.contains(event.target)) {
        setShowPlaylistDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle provider change
  const handleProviderChange = (providerId) => {
    onProviderChange(providerId);
    setIsDropdownOpen(false);
    setSpotifyError(null);
    
    // Clear current playlist when switching providers
    onPlaylistUrlChange('');
    onPlaylistInfoChange(null);
    
    // If switching to Spotify and not authenticated, trigger login
    if (providerId === 'spotify' && !isSpotifyAuthenticated()) {
      handleSpotifyLogin();
    } else if (providerId === 'spotify' && isSpotifyAuthenticated()) {
      // Load playlists if already authenticated
      loadSpotifyPlaylists();
    }
  };
  // Handle Spotify login
  const handleSpotifyLogin = async () => {
    setIsSpotifyLoginInProgress(true);
    setSpotifyError(null);

    try {
      await loginToSpotify();
      console.log('✅ Spotify login successful');
        // ✅ FIX: Initialize Spotify player immediately after login
      if (window.audioPlayer && window.audioPlayer.manualInitializeSpotifyPlayer) {
        try {
          console.log('🎵 Initializing Spotify player after successful login...');
          await window.audioPlayer.manualInitializeSpotifyPlayer();
        } catch (playerError) {
          console.warn('Spotify player initialization failed, but login was successful:', playerError);
        }
      }
      
      await loadSpotifyPlaylists();
      
      if (window.addNotification) {
        window.addNotification('🎵 Spotify verbonden! Kies een afspeellijst.', 'success', 3000);
      }
    } catch (error) {
      console.error('❌ Spotify login failed:', error);
      setSpotifyError(error.message);
      
      // Fallback to YouTube if login fails
      onProviderChange('youtube');
      
      if (window.addNotification) {
        window.addNotification('❌ Spotify login mislukt - teruggevallen naar YouTube', 'error', 4000);
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
    
    // Show dropdown when typing
    if (query.length > 0) {
      setShowPlaylistDropdown(true);
    }
    
    // Debounce search
    clearTimeout(window.spotifySearchTimeout);
    window.spotifySearchTimeout = setTimeout(() => {
      if (selectedProvider === 'spotify') {
        loadSpotifyPlaylists(query);
      }
    }, 300);
  };

  // Handle playlist selection
  const handlePlaylistSelect = async (playlist) => {
    if (selectedProvider === 'spotify') {
      // For Spotify, use the playlist ID
      onPlaylistUrlChange(playlist.id);
      setPlaylistSearchQuery(playlist.name);
      setShowPlaylistDropdown(false);
      
      // Validate the selected playlist
      onValidatingChange(true);
      try {
        const validation = await validateSpotifyPlaylist(playlist.id);
        onPlaylistInfoChange(validation);
      } catch (error) {
        console.error('Error validating Spotify playlist:', error);
        onPlaylistInfoChange({ isValid: false, error: error.message });
      } finally {
        onValidatingChange(false);
      }
    }
  };  // Handle random playlist selection
  const handleRandomPlaylist = async () => {
    if (selectedProvider === 'youtube') {
      const randomPlaylist = getRandomYouTubePlaylist();
      onPlaylistUrlChange(randomPlaylist.url);
      
      // Validate the YouTube playlist
      onValidatingChange(true);
      try {
        const validation = await validatePlaylistUrl(randomPlaylist.url);
        onPlaylistInfoChange(validation);
      } catch (error) {
        console.error('Error validating random YouTube playlist:', error);
        onPlaylistInfoChange({ isValid: false, error: error.message });
      } finally {
        onValidatingChange(false);
      }
      
      if (window.addNotification) {
        window.addNotification(`🎲 Willekeurige playlist: ${randomPlaylist.name}`, 'info', 3000);
      }
    } else if (selectedProvider === 'spotify') {
      // Check if user is authenticated first
      if (!isSpotifyAuthenticated()) {
        console.log('🔒 User not authenticated - triggering Spotify login');
        if (window.addNotification) {
          window.addNotification('🔒 Je bent nog niet ingelogd bij Spotify. Probeer eerst in te loggen.', 'warning', 4000);
        }
        // Trigger login
        handleSpotifyLogin();
        return;
      }
      
      const randomPlaylist = getRandomSpotifyPlaylist();
      onPlaylistUrlChange(randomPlaylist.url);
      setPlaylistSearchQuery(randomPlaylist.name);
      
      // For Spotify, we could validate the playlist here too, but the URL structure is different
      // The validation would need to be implemented differently for Spotify
      onPlaylistInfoChange({ 
        isValid: true, 
        name: randomPlaylist.name,
        trackCount: 'Unknown'
      });
      
      if (window.addNotification) {
        window.addNotification(`🎲 Willekeurige playlist: ${randomPlaylist.name}`, 'info', 3000);
      }
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
      window.addNotification('🔓 Spotify uitgelogd', 'info', 2000);
    }
  };

  // Filter playlists based on search
  const filteredPlaylists = spotifyPlaylists.filter(playlist =>
    playlist.name.toLowerCase().includes(playlistSearchQuery.toLowerCase())
  );

  const selectedProviderInfo = providers.find(p => p.id === selectedProvider);  // Get validation status for styling
  const getValidationStyle = () => {
    if (selectedProvider === 'youtube' && playlistUrl) {
      if (isValidating) {
        return 'border-blue-500';
      } else if (playlistInfo?.isValid) {
        return 'border-green-500';
      } else if (playlistInfo && !playlistInfo.isValid) {
        return 'border-red-500';
      }
    }
    return 'border-gray-600';
  };

  const getValidationIcon = () => {
    if (selectedProvider === 'youtube' && playlistUrl) {
      if (isValidating) {
        return (
          <svg className="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        );
      } else if (playlistInfo?.isValid) {
        return (
          <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        );
      } else if (playlistInfo && !playlistInfo.isValid) {
        return (
          <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        );
      }
    }
    return null;
  };
  return (
    <div className="space-y-3">
      {/* --- BEGIN: SPOTIFY INIT ERROR/RETRY UI --- */}
      {selectedProvider === 'spotify' && error && (
        <div className="mb-2 p-3 bg-red-900/80 border border-red-600 rounded-lg text-red-200 flex flex-col items-start">
          <div className="mb-2">
            <strong>Spotify fout:</strong> {error}
          </div>
          <button
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-semibold text-sm"
            onClick={() => onRetry && onRetry()}
          >
            Probeer opnieuw
          </button>
        </div>
      )}
      {/* --- END: SPOTIFY INIT ERROR/RETRY UI --- */}

      {/* Combined Provider and URL Input in one line */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Afspeellijst:
        </label>
        <div className="flex space-x-2">
          {/* Provider Dropdown - Compact width */}
          <div className="relative w-40" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                {selectedProviderInfo?.icon}
                <span className="text-sm">{selectedProviderInfo?.name}</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderChange(provider.id)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-600 flex items-center space-x-2 ${
                      selectedProvider === provider.id ? 'bg-gray-600 text-blue-400' : 'text-white'
                    } ${provider.id === 'youtube' ? 'rounded-t-lg' : 'rounded-b-lg'}`}
                  >
                    {provider.icon}
                    <span>{provider.name}</span>
                    {selectedProvider === provider.id && (
                      <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* URL Input for YouTube */}
          {selectedProvider === 'youtube' && (
            <>
              <div className="relative flex-1 group">
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => onPlaylistUrlChange(e.target.value)}
                  placeholder="https://youtube.com/playlist?list=..."
                  className={`w-full px-3 py-2 pr-10 bg-gray-700 border ${getValidationStyle()} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                />
                {/* Validation icon inside input */}
                {getValidationIcon() && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getValidationIcon()}
                  </div>
                )}
                
                {/* Tooltip for playlist info */}
                {playlistInfo?.isValid && playlistInfo.name && (
                  <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg min-w-64 max-w-80">
                      <div className="flex items-center space-x-3">
                        {playlistInfo.thumbnail && (
                          <img 
                            src={playlistInfo.thumbnail} 
                            alt={playlistInfo.name}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm truncate">
                            {playlistInfo.name}
                          </div>
                          {playlistInfo.videoCount && (
                            <div className="text-gray-400 text-xs">
                              {playlistInfo.videoCount} video's
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleRandomPlaylist}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center justify-center"
                title="Willekeurige afspeellijst"
              >
          🎲              </button>
            </>
          )}          {/* Spotify Input Section - Inline with provider selector */}
          {selectedProvider === 'spotify' && isSpotifyAuthenticated() && (
            <div className="flex-1">              {/* Spotify player status indicator */}
              {selectedProvider === 'spotify' && isSpotifyAuthenticated() && !spotifyPlayerReady && (
                <div className="mb-2 px-3 py-2 bg-yellow-900 border border-yellow-600 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-200">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span className="text-sm">Spotify player wordt geïnitialiseerd...</span>
                    {/* --- BEGIN: FORCE START SPOTIFY BUTTON --- */}
                    {window.audioPlayer?.showForceSpotifyButton && (
                      <button
                        onClick={() => window.audioPlayer?.forceStartSpotify && window.audioPlayer.forceStartSpotify()}
                        className="ml-4 px-3 py-1 bg-yellow-700 hover:bg-yellow-600 text-yellow-100 rounded transition-colors text-xs border border-yellow-400 shadow"
                      >
                        Klik hier als Spotify niet start
                      </button>
                    )}
                    {/* --- END: FORCE START SPOTIFY BUTTON --- */}
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
                    onFocus={() => setShowPlaylistDropdown(true)}                    placeholder="Typ om je afspeellijsten te zoeken..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    disabled={!spotifyPlayerReady}
                  />
                  
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
                                {playlist.trackCount} nummers • {playlist.owner}
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-gray-400">
                          {playlistSearchQuery ? 'Geen afspeellijsten gevonden' : 'Typ om te zoeken in je afspeellijsten'}
                        </div>
                      )}
                    </div>
                  )}
                </div>              ) : (
                /* Openbare mode - URL input */
                <input
                  type="text"
                  value={playlistUrl}                  onChange={(e) => onPlaylistUrlChange(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:bg-gray-800 disabled:cursor-not-allowed"
                  disabled={!spotifyPlayerReady}
                />
              )}
            </div>
          )}

          {/* Mode Selector for Spotify - Moved to separate row */}
          {selectedProvider === 'spotify' && isSpotifyAuthenticated() && (
            <select
              value={spotifyMode}
              onChange={(e) => setSpotifyMode(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="eigen">Eigen playlists</option>
              <option value="openbare">Openbare URL's</option>
            </select>
          )}          {/* Random Playlist Button for Spotify Openbare mode */}
          {selectedProvider === 'spotify' && isSpotifyAuthenticated() && spotifyMode === 'openbare' && (
            <button              onClick={handleRandomPlaylist}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
              title="Willekeurige afspeellijst"
              disabled={!spotifyPlayerReady}
            >
              🎲
            </button>
          )}

          {/* Spotify Login Button */}
          {selectedProvider === 'spotify' && !isSpotifyAuthenticated() && (
            <button
              onClick={handleSpotifyLogin}
              disabled={isSpotifyLoginInProgress}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              {isSpotifyLoginInProgress ? 'Inloggen...' : 'Inloggen bij Spotify'}
            </button>
          )}

          {/* Spotify Logout Button */}
          {selectedProvider === 'spotify' && isSpotifyAuthenticated() && (
            <button
              onClick={handleSpotifyLogout}
              className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              title="Uitloggen"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H4v16h10v-2h2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h10z"/>
              </svg>
            </button>
          )}        </div>
      </div>

      {/* Error Display - Only for Spotify */}
      {spotifyError && (
        <div className="text-sm text-red-400 bg-red-600/10 border border-red-500/30 rounded-lg p-2">
          {spotifyError}
        </div>
      )}
    </div>
  );
};

export default PlaylistProviderSelector;
