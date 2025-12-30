// App.jsx - Main application component (REWRITTEN with new architecture)
// Orchestrates the application using new StateManager and hooks

import React, { useEffect, useState, useCallback } from 'react';
import RadioGrid from './components/RadioGrid';
import AudioPlayer from './components/AudioPlayer';
import AdBreakSettings from './components/AdBreakSettings';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationSystem from './components/NotificationSystem';
import ResizableYouTubePlayer from './components/overlays/ResizableYouTubePlayer';
import DeveloperDashboard from './components/DeveloperDashboard';
import MusicVisualizerSingle from './components/MusicVisualizerSingle';
import LoadingIndicator from './components/LoadingIndicator';

import { useAppState, useActions } from './core/StateManager';
import { useAudio } from './hooks/useAudio';
import { useAdBreak } from './hooks/useAdBreak';
import { useFavorites } from './hooks/useFavorites';

function App() {
  const state = useAppState();
  const actions = useActions();

  // Core hooks
  const audio = useAudio();
  const adBreak = useAdBreak(audio.audioManager, audio.getInterruptionHandler());
  const favorites = useFavorites();

  // Local UI state
  const [visualizerPosition, setVisualizerPosition] = useState('header');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // YouTube players state (can have multiple)
  const [youtubePlayers, setYoutubePlayers] = useState([]);

  /**
   * Handle station selection from grid
   */
  const handleStationSelect = (station) => {
    console.log('📻 App: Station selected', station.name);

    // User manually selected station - this interrupts any automated action
    audio.playRadio(station);

    // Show notification
    if (window.addNotification) {
      window.addNotification(`Nu aan het spelen: ${station.name}`, 'success', 2000);
    }
  };

  /**
   * Open a YouTube player (automatic or manual)
   */
  const openYouTubePlayer = useCallback((config) => {
    const { playlistId, videoId, title, isAutomatic = false, autoCloseSeconds = null } = config;

    const newPlayer = {
      id: Date.now(),
      playlistId,
      videoId,
      title: title || 'YouTube Player',
      isAutomatic,
      autoCloseSeconds,
      volume: Math.round(state.volume * 100)
    };

    setYoutubePlayers(prev => [...prev, newPlayer]);
    console.log('▶️ App: Opened YouTube player', newPlayer);
  }, [state.volume]);

  /**
   * Close a YouTube player
   */
  const closeYouTubePlayer = useCallback((playerId) => {
    setYoutubePlayers(prev => prev.filter(p => p.id !== playerId));
    console.log('✕ App: Closed YouTube player', playerId);
  }, []);

  /**
   * Close all YouTube players
   */
  const closeAllYouTubePlayers = useCallback(() => {
    setYoutubePlayers([]);
    console.log('✕ App: Closed all YouTube players');
  }, []);

  /**
   * Handle YouTube volume change
   */
  const handleYouTubeVolumeChange = (playerId, volume) => {
    setYoutubePlayers(prev => prev.map(p =>
      p.id === playerId ? { ...p, volume } : p
    ));
  };

  // Auto-play last station on mount
  useEffect(() => {
    try {
      const lastStation = localStorage.getItem('lastPlayedStation');
      if (lastStation) {
        const station = JSON.parse(lastStation);
        console.log('📻 App: Found last played station', station.name);
        // Don't auto-play, just show in UI
      }
    } catch (error) {
      console.error('Failed to load last station', error);
    }
  }, []);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        actions.setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error, actions]);

  // Scroll detection for visualizer placement
  useEffect(() => {
    const handleScroll = () => {
      const headerElement = document.querySelector('.banner-container');
      if (!headerElement) return;

      const headerRect = headerElement.getBoundingClientRect();
      const scrollThreshold = headerRect.height * 0.8;
      const isCurrentlyVisible = headerRect.bottom > scrollThreshold;

      if (isCurrentlyVisible !== isHeaderVisible) {
        setIsHeaderVisible(isCurrentlyVisible);
        if (state.showVisualizer) {
          setVisualizerPosition(isCurrentlyVisible ? 'header' : 'footer');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHeaderVisible, state.showVisualizer]);

  // Update CSS variable for visualizer blur
  useEffect(() => {
    document.documentElement.style.setProperty('--visualizer-blur', `${state.visualizerBlur}px`);
  }, [state.visualizerBlur]);

  // Expose global functions for backward compatibility
  useEffect(() => {
    window.openYouTubePlayer = openYouTubePlayer;
    window.closeAllYouTubePlayers = closeAllYouTubePlayers;
    window.addNotification = (message, type, duration) => {
      if (window.showNotification) {
        window.showNotification(message, type, duration);
      }
    };
  }, [openYouTubePlayer, closeAllYouTubePlayers]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">

        {/* Enhanced Header Section with Wave Animation */}
        <div className="h-[140px] flex items-center justify-center border-b border-gray-700 relative banner-container">
          {/* Animated Background */}
          <div className="banner-background"></div>

          {/* Shimmer Effect */}
          <div className="banner-shimmer"></div>

          {/* Music Visualizer in Header */}
          {state.showVisualizer && state.visualizerType !== 'none' && visualizerPosition === 'header' && (
            <MusicVisualizerSingle
              isPlaying={state.isPlaying}
              isEnabled={state.showVisualizer}
              visualizerType={state.visualizerType}
              position="header"
              currentSource={state.audioSource}
            />
          )}

          {/* Hidden Developer Access - Triple click */}
          <div
            className="absolute top-5 right-10 w-5 h-5 cursor-pointer z-10"
            onClick={(e) => {
              if (e.detail === 3) {
                const password = prompt('Enter developer password:');
                if (password === 'xd') {
                  actions.toggleDeveloperDashboard(true);
                  if (window.addNotification) {
                    window.addNotification('🛠️ Developer Dashboard geopend', 'success', 2000);
                  }
                }
              }
            }}
          />

          {/* Banner Content */}
          <div className="text-center banner-text">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 banner-title bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Nederlandse Radio / Playlist Switcher
            </h1>
            <h2 className="text-2xl md:text-2xl font-semibold text-gray-300">
              Automatische reclamepauze wisseling
            </h2>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col pb-32">

          {/* Ad Break Settings */}
          <div className="bg-gray-800 border-b border-gray-700">
            <ErrorBoundary>
              <AdBreakSettings
                // Ad break timer settings
                adBreakMinute={adBreak.adBreakMinute}
                adBreakMinute2={adBreak.adBreakMinute2}
                adBreakDuration={adBreak.adBreakDuration}
                adBreakDuration2={adBreak.adBreakDuration2}
                isTimerRunning={adBreak.isTimerRunning}
                onMinuteChange={adBreak.setAdBreakMinute}
                onMinute2Change={adBreak.setAdBreakMinute2}
                onDurationChange={adBreak.setAdBreakDuration}
                onDuration2Change={adBreak.setAdBreakDuration2}
                onStartTimer={adBreak.startTimer}
                onStopTimer={adBreak.stopTimer}
                onManualAdBreak={adBreak.manualAdBreak}

                // Ad break state
                isAdBreakActive={adBreak.isAdBreakActive}
                nextAdBreakIn={adBreak.nextAdBreakIn}
                currentAdBreakTimeLeft={adBreak.adBreakTimeLeft}
                adBreakMode={adBreak.adBreakMode}
                onAdBreakModeChange={adBreak.setAdBreakMode}

                // Playlist settings
                playlistProvider={state.playlistProvider}
                onProviderChange={actions.setPlaylistProvider}
                playlistUrl={state.playlistUrl}
                onPlaylistUrlChange={actions.setPlaylistUrl}
                playlistInfo={state.playlistInfo}
                onPlaylistInfoChange={actions.setPlaylistInfo}
                playlistShuffle={state.playlistShuffle}
                onShuffleChange={actions.setPlaylistShuffle}

                // Visualizer settings
                visualizerEnabled={state.showVisualizer}
                onVisualizerToggle={actions.toggleVisualizer}
                visualizerType={state.visualizerType}
                onVisualizerTypeChange={actions.setVisualizerType}
                visualizerBlur={state.visualizerBlur}
                onVisualizerBlurChange={actions.setVisualizerBlur}

                // Other settings
                fadeAudioStreams={state.fadeAudioStreams}
                onFadeAudioStreamsChange={actions.setFadeAudioStreams}

                // Audio player reference
                audioPlayer={audio}
              />
            </ErrorBoundary>
          </div>

          {/* Radio Grid */}
          <RadioGrid
            onStationSelect={handleStationSelect}
            currentStation={state.currentStation}
            isLoading={state.isLoading}
            isPlaying={state.isPlaying}
            favorites={favorites.favorites}
            onToggleFavorite={favorites.toggleFavorite}
          />
        </div>

        {/* Fixed Footer with Controls */}
        <div className="sticky bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 relative">

          {/* Music Visualizer in Footer */}
          {state.showVisualizer && state.visualizerType !== 'none' && visualizerPosition === 'footer' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <MusicVisualizerSingle
                isPlaying={state.isPlaying}
                isEnabled={state.showVisualizer}
                visualizerType={state.visualizerType}
                position="footer"
                currentSource={state.audioSource}
              />
            </div>
          )}

          {/* Audio Player */}
          <div className="relative z-10">
            <AudioPlayer
              currentStation={state.currentStation}
              isPlaying={state.isPlaying}
              volume={state.volume}
              onTogglePlayPause={audio.togglePlayPause}
              onVolumeChange={audio.setVolume}

              isAdBreakActive={adBreak.isAdBreakActive}
              nextAdBreakIn={adBreak.nextAdBreakIn}
              currentAdBreakTimeLeft={adBreak.adBreakTimeLeft}
              adBreakMode={adBreak.adBreakMode}

              currentSource={state.audioSource}
              error={state.error}

              playlistShuffle={state.playlistShuffle}
              onToggleShuffle={audio.setShuffle}
              onNextTrack={audio.nextTrack}

              onCancelAdBreak={adBreak.cancelAdBreak}
              onJumpToSwitchNow={adBreak.skipToZero}
            />
          </div>
        </div>

        {/* Notification System */}
        <NotificationSystem />

        {/* Loading Status */}
        {(state.isTransitioning || state.isLoading) && !state.error && (
          <div className="fixed bottom-20 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg z-40 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {state.isTransitioning ? 'Audio wisselen...' : 'Verbinding maken...'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {state.currentStation?.name || 'Bezig met laden...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Developer Dashboard */}
        {state.showDeveloperDashboard && (
          <DeveloperDashboard onClose={() => actions.toggleDeveloperDashboard(false)} />
        )}

        {/* YouTube Players (can have multiple) */}
        {youtubePlayers.map(player => (
          <ResizableYouTubePlayer
            key={player.id}
            isVisible={true}
            playlistId={player.playlistId}
            videoId={player.videoId}
            title={player.title}
            volume={player.volume}
            onVolumeChange={(vol) => handleYouTubeVolumeChange(player.id, vol)}
            onClose={() => closeYouTubePlayer(player.id)}
            isAutomatic={player.isAutomatic}
            autoCloseSeconds={player.autoCloseSeconds}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
}

export default App;
