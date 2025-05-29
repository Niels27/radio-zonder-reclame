import React, { useEffect } from 'react';
import RadioGrid from './components/RadioGrid';
import AudioPlayer from './components/AudioPlayer';
import AdBreakSettings from './components/AdBreakSettings';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationSystem from './components/NotificationSystem';
import UserGuide from './components/UserGuide';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useAdBreakTimer } from './hooks/useAdBreakTimer';
import { TbDice } from 'react-icons/tb';
function App() {
  const audioPlayer = useAudioPlayer();
  const adBreakTimer = useAdBreakTimer(audioPlayer);

  // Load last played station on mount
  useEffect(() => {
    const lastStation = localStorage.getItem('lastPlayedStation');
    if (lastStation) {
      try {
        const stationData = JSON.parse(lastStation);
        // Don't auto-play, just set as current station for UI
        // User needs to click play manually
        if (window.showNotification) {
          //window.showNotification(`Laatst afgespeeld: ${stationData.name}`, 'info', 3000);
        }
      } catch (error) {
        console.error('Failed to load last played station:', error);
      }
    }
  }, []);

  // Clear error after 5 seconds and show notification
  useEffect(() => {
    if (audioPlayer.error) {
      if (window.showNotification) {
        window.showNotification(audioPlayer.error, 'error', 5000);
      }
      const timer = setTimeout(() => {
        audioPlayer.setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [audioPlayer.error, audioPlayer.setError]);

  // Show notifications for ad break events
  useEffect(() => {
    if (adBreakTimer.isAdBreakActive && window.showNotification) {
      window.showNotification('Reclamepauze gestart - schakel naar afspeellijst', 'info', 3000);
    }
  }, [adBreakTimer.isAdBreakActive]);

  const handleStationSelect = (station) => {
    audioPlayer.playRadio(station);

    if (window.showNotification) {
      window.showNotification(`Nu aan het spelen: ${station.name}`, 'success', 2000);
    }

    // Start ad break timer if it's not running and we have a playlist
    if (!adBreakTimer.isTimerRunning && adBreakTimer.playlistUrl) {
      adBreakTimer.startTimer();
      if (window.showNotification) {
        window.showNotification('Reclamepauze timer gestart', 'info', 2000);
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-radio-darker text-white flex flex-col">
        <NotificationSystem />


        {/* YouTube Playlist URL Bar - Always Visible */}
        <div className="bg-radio-dark border-b border-gray-700 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
                YouTube Afspeellijst:
              </label>
              <div className="flex-1 flex items-center space-x-3">
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="url"
                    value={adBreakTimer.playlistUrl}
                    onChange={(e) => adBreakTimer.setPlaylistUrl(e.target.value)}
                    placeholder="https://www.youtube.com/playlist?list=..."
                    className="flex-1 px-3 py-2 bg-radio-darker border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-radio-accent focus:outline-none"
                  />
                  {/* Paste Button */}
                  <button
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) {
                          adBreakTimer.setPlaylistUrl(text);
                          if (window.showNotification) {
                            window.showNotification('URL geplakt!', 'success', 2000);
                          }
                        }
                      } catch (error) {
                        if (window.showNotification) {
                          window.showNotification('Kon niet plakken vanuit klembord', 'error', 3000);
                        }
                      }
                    }}
                    className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                    title="Plak URL vanuit klembord"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z" />
                    </svg>
                  </button>
                  {/* Randomize Button */}
                  <button
                    onClick={async () => {
                      try {
                        const { getRandomPlaylist } = await import('./utils/predefinedPlaylists');
                        const randomPlaylist = getRandomPlaylist();
                        adBreakTimer.setPlaylistUrl(randomPlaylist.url);
                        if (window.showNotification) {
                          window.showNotification(`Willekeurige afspeellijst geladen: ${randomPlaylist.name}`, 'success', 3000);
                        }
                      } catch (error) {
                        if (window.showNotification) {
                          window.showNotification('Kon geen willekeurige afspeellijst laden', 'error', 3000);
                        }
                      }
                    }}
                    className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
                    title="Willekeurige afspeellijst"
                  >
                    <svg
                      className="w-4 h-4" // Back to original size
                      fill="currentColor"
                      viewBox="0 0 28 28" // Keep the bigger viewBox for detail
                      style={{ transform: 'rotate(15deg)' }} // Keep the tilt
                    >
                      {/* Tilted dice with dots */}
                      <rect
                        x="4.5"
                        y="4.5"
                        width="19"
                        height="19"
                        rx="2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      {/* Dots */}
                      <circle cx="9" cy="9" r="2.4" fill="currentColor" />
                      <circle cx="19" cy="9" r="2.4" fill="currentColor" />
                      <circle cx="9" cy="19" r="2.4" fill="currentColor" />
                      <circle cx="14" cy="14" r="2.4" fill="currentColor" />
                      <circle cx="19" cy="19" r="2.4" fill="currentColor" />
                    </svg>
                  </button>
                </div>
                {/* Playlist Controls */}
                {adBreakTimer.playlistUrl && (
                  <div className="flex items-center space-x-2">
                    {/* Shuffle Button */}
                    <button
                      onClick={() => adBreakTimer.setPlaylistShuffle(!adBreakTimer.playlistShuffle)}
                      className={`p-2 rounded transition-colors ${adBreakTimer.playlistShuffle
                          ? 'bg-radio-accent text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                        }`}
                      title={adBreakTimer.playlistShuffle ? 'Shuffle uitschakelen' : 'Shuffle inschakelen'}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                      </svg>
                    </button>

                  </div>
                )}
                {adBreakTimer.playlistThumbnail && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={adBreakTimer.playlistThumbnail}
                      alt="Playlist thumbnail"
                      className="w-8 h-8 rounded object-cover"
                    />
                    <span className="text-xs text-green-400">✓</span>
                  </div>
                )}
              </div>
            </div>
            {adBreakTimer.playlistTitle && (
              <div className="mt-2 text-xs text-gray-400">
                {adBreakTimer.playlistTitle}
              </div>
            )}
          </div>
        </div>

        {/* Ad Break Settings */}
        <AdBreakSettings
          adBreakMinute={adBreakTimer.adBreakMinute}
          adBreakDuration={adBreakTimer.adBreakDuration}
          isTimerRunning={adBreakTimer.isTimerRunning}
          isAdBreakActive={adBreakTimer.isAdBreakActive}
          onMinuteChange={adBreakTimer.setAdBreakMinute}
          onDurationChange={adBreakTimer.setAdBreakDuration}
          onStartTimer={adBreakTimer.startTimer}
          onStopTimer={adBreakTimer.stopTimer}
          onResetTimer={adBreakTimer.resetTimer}
          onManualAdBreak={adBreakTimer.manualAdBreak}
        />

        {/* Main Content */}
        <RadioGrid
          onStationSelect={handleStationSelect}
          currentStation={audioPlayer.currentStation}
          isLoading={audioPlayer.isLoading}
        />

        {/* Audio Player */}
        <AudioPlayer
          currentStation={audioPlayer.currentStation}
          isPlaying={audioPlayer.isPlaying}
          volume={audioPlayer.volume}
          onTogglePlayPause={audioPlayer.togglePlayPause}
          onVolumeChange={audioPlayer.setVolume}
          isAdBreakActive={adBreakTimer.isAdBreakActive}
          nextAdBreakIn={adBreakTimer.nextAdBreakIn}
          currentSource={audioPlayer.currentSource}
          error={audioPlayer.error}
        />

        {/* Notification for Ad Break Mode */}
        {adBreakTimer.isAdBreakActive && (
          <div className="fixed top-4 right-4 bg-ad-break text-white px-4 py-2 rounded-lg shadow-lg z-50">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-medium">Reclamepauze Actief</span>
            </div>
          </div>
        )}

        {/* Timer Running Notification */}
        {adBreakTimer.isTimerRunning && !adBreakTimer.isAdBreakActive && (
          <div className="fixed top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-medium">Reclamepauze Timer Actief</span>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
