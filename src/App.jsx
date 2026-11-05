// App.jsx - Page layout and wiring between the audio/ad-break hooks and the UI.

import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import RadioGrid from './components/RadioGrid';
import AudioPlayer from './components/AudioPlayer';
import AdBreakSettings from './components/AdBreakSettings';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationSystem from './components/NotificationSystem';
import eventBus, { notify, signalPlaylistStopped } from './utils/eventBus';

// Lazy-loaded components (not needed on initial render)
const ResizableYouTubePlayer = lazy(() => import('./components/overlays/ResizableYouTubePlayer'));
const MusicVisualizerSingle = lazy(() => import('./components/MusicVisualizerSingle'));

import { useAppState, useActions } from './core/StateManager';
import { useAudio } from './hooks/useAudio';
import { useAdBreak } from './hooks/useAdBreak';

function App() {
  const state = useAppState();
  const actions = useActions();

  // Core hooks
  const audio = useAudio();
  const adBreak = useAdBreak(audio.audioManager);

  // Local UI state
  const [visualizerPosition, setVisualizerPosition] = useState('header');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // YouTube players state (can have multiple)
  const [youtubePlayers, setYoutubePlayers] = useState([]);

  /**
   * Handle station selection from grid
   */
  const handleStationSelect = (station) => {
    audio.playRadio(station);

    notify(`Nu aan het spelen: ${station.name}`, 'success', 2000);
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
  }, [state.volume]);

  /**
   * Close a YouTube player
   */
  const closeYouTubePlayer = useCallback((playerId) => {
    setYoutubePlayers(prev => prev.filter(p => p.id !== playerId));
    signalPlaylistStopped('youtube');
  }, []);

  /**
   * Close all YouTube players
   */
  const closeAllYouTubePlayers = useCallback(() => {
    setYoutubePlayers([]);
  }, []);

  /**
   * Handle YouTube volume change
   */
  const handleYouTubeVolumeChange = (playerId, volume) => {
    setYoutubePlayers(prev => prev.map(p =>
      p.id === playerId ? { ...p, volume } : p
    ));
  };

  // Show error as toast notification (Dutch) and clear after 5 seconds
  useEffect(() => {
    if (state.error) {
      // Filter technical browser errors
      const technicalErrors = [
        'Failed to load because no supported source was found',
        'MEDIA_ELEMENT_ERROR', 'MEDIA_ERR_',
        'NotSupportedError', 'AbortError', 'NotAllowedError'
      ];
      const isTechnical = technicalErrors.some(t => state.error.includes(t));

      if (!isTechnical) {
        const stationName = state.currentStation?.name;
        const dutchMessage = state.error.includes('Failed to start')
          ? `Radio kon niet worden gestart${stationName ? ': ' + stationName : ''}`
          : state.error;
        notify(dutchMessage, 'error', 4000);
      }

      const timer = setTimeout(() => {
        actions.setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  // Only a new error should show a toast; currentStation is read for the message.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.error]);

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


  // Event bus subscriptions for YouTube player
  useEffect(() => {
    const unsubOpen = eventBus.on('youtube:open', openYouTubePlayer);
    const unsubClose = eventBus.on('youtube:close', closeAllYouTubePlayers);
    return () => { unsubOpen(); unsubClose(); };
  }, [openYouTubePlayer, closeAllYouTubePlayers]);

  // PlaylistProviderSelector reads Spotify readiness through this global.
  useEffect(() => {
    if (!window.audioPlayer) {
      window.audioPlayer = {};
    }
    Object.defineProperty(window.audioPlayer, 'spotifyPlayerReady', {
      get: () => audio.isSpotifyReady(),
      set: () => {},
      configurable: true
    });

    window.audioPlayer.manualInitializeSpotifyPlayer = async () => {
      if (audio.audioManager) {
        const spotifySource = audio.audioManager.getSpotifySource();
        if (spotifySource) {
          try {
            await spotifySource.initialize();
            window.dispatchEvent(new CustomEvent('spotifyPlayerReady', {
              detail: { ready: true, manual: true }
            }));
            return true;
          } catch (error) {
            console.error('Manual Spotify initialization failed:', error);
            throw error;
          }
        }
      }
      return false;
    };
  }, [audio]);

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
            <Suspense fallback={null}>
              <MusicVisualizerSingle
                isPlaying={state.isPlaying}
                isEnabled={state.showVisualizer}
                visualizerType={state.visualizerType}
                position="header"
                currentSource={state.audioSource}
              />
            </Suspense>
          )}

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
                onEndAdBreak={adBreak.endAdBreak}
                isAdBreakActive={adBreak.isAdBreakActive}
                adBreakMode={adBreak.adBreakMode}
                onAdBreakModeChange={adBreak.setAdBreakMode}
                playlistUrl={state.playlistUrl}
                onPlaylistUrlChange={actions.setPlaylistUrl}
                playlistInfo={state.playlistInfo}
                onPlaylistInfoChange={actions.setPlaylistInfo}
                playlistShuffle={state.playlistShuffle}
                youtubeUrl={state.youtubeUrl}
                onYoutubeUrlChange={actions.setYoutubeUrl}
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
          />
        </div>

        {/* Fixed Footer with Controls */}
        <div className="sticky bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 relative">

          {/* Music Visualizer in Footer */}
          {state.showVisualizer && state.visualizerType !== 'none' && visualizerPosition === 'footer' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <Suspense fallback={null}>
                <MusicVisualizerSingle
                  isPlaying={state.isPlaying}
                  isEnabled={state.showVisualizer}
                  visualizerType={state.visualizerType}
                  position="footer"
                  currentSource={state.audioSource}
                />
              </Suspense>
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
              isTimerRunning={adBreak.isTimerRunning}
              nextAdBreakIn={adBreak.nextAdBreakIn}
              currentAdBreakTimeLeft={adBreak.adBreakTimeLeft}
              adBreakMode={adBreak.adBreakMode}
              savedStation={adBreak.savedStation}

              currentSource={state.audioSource}
              playlistInfo={state.playlistInfo}

              playlistShuffle={state.playlistShuffle}
              onToggleShuffle={audio.setShuffle}
              onNextTrack={audio.nextTrack}
              onPreviousTrack={audio.previousTrack}

              onCancelAdBreak={adBreak.cancelAdBreak}
              onJumpToSwitchNow={adBreak.skipToZero}
              onEndAdBreak={adBreak.endAdBreak}
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
                {state.connectionStatus && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {state.connectionStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Buffering Indicator */}
        {state.isBuffering && state.isPlaying && !state.isLoading && (
          <div className="fixed bottom-20 right-4 bg-gray-800/90 border border-yellow-600/50 rounded-lg px-3 py-2 shadow-lg z-40">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent flex-shrink-0"></div>
              <span className="text-sm text-yellow-300">Bufferen..</span>
            </div>
          </div>
        )}

        {/* YouTube Players (can have multiple) */}
        {youtubePlayers.length > 0 && (
          <Suspense fallback={null}>
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
          </Suspense>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
