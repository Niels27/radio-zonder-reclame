import React, { useEffect, useState } from 'react';
import RadioGrid from './components/RadioGrid';
import AudioPlayer from './components/AudioPlayer';
import AdBreakSettings from './components/AdBreakSettings';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationSystem from './components/NotificationSystem';
import UserGuide from './components/UserGuide';
import DeveloperDashboard from './components/DeveloperDashboard';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useAdBreakTimer } from './hooks/useAdBreakTimer';
import { validatePlaylistUrl } from './utils/youtubeUtils';
import LoadingIndicator from './components/LoadingIndicator';

function App() {
  const audioPlayer = useAudioPlayer();
  const adBreakTimer = useAdBreakTimer(audioPlayer);
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [isValidatingPlaylist, setIsValidatingPlaylist] = useState(false);
  const [isPlaylistInputHovered, setIsPlaylistInputHovered] = useState(false);
  const [showDeveloperDashboard, setShowDeveloperDashboard] = useState(false);

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
  // Keep global ad break state in sync
  useEffect(() => {
    window.isAdBreakActive = adBreakTimer.isAdBreakActive;
    window.queueStationSwitch = adBreakTimer.queueStationSwitch;
    window.isTimerRunning = adBreakTimer.isTimerRunning; // Add this line
  }, [adBreakTimer.isAdBreakActive, adBreakTimer.queueStationSwitch, adBreakTimer.isTimerRunning]);

  const handleStationSelect = (station) => {
    // If ad break is active, the playRadio function will automatically queue it
    audioPlayer.playRadio(station);

    // Only show success notification if not queueing
    if (!adBreakTimer.isAdBreakActive && window.addNotification) {
      window.addNotification(`Nu aan het spelen: ${station.name}`, 'success', 2000);
    }

    // REMOVE THIS AUTO-START LOGIC - User must manually activate timer
    // if (!adBreakTimer.isTimerRunning && adBreakTimer.playlistUrl) {
    //   adBreakTimer.startTimer();
    //   if (window.addNotification) {
    //     window.addNotification('Reclamepauze timer gestart', 'info', 2000);
    //   }
    // }
  };

  // Validate playlist URL when it changes
  useEffect(() => {
    const validatePlaylist = async () => {
      if (!adBreakTimer.playlistUrl) {
        setPlaylistInfo(null);
        return;
      }

      setIsValidatingPlaylist(true);
      try {
        const info = await validatePlaylistUrl(adBreakTimer.playlistUrl);
        setPlaylistInfo(info);
      } catch (error) {
        setPlaylistInfo(null);
        console.error('Playlist validation failed:', error);
      } finally {
        setIsValidatingPlaylist(false);
      }
    };

    const timeoutId = setTimeout(validatePlaylist, 500); // Debounce validation
    return () => clearTimeout(timeoutId);
  }, [adBreakTimer.playlistUrl]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">        {/* Header Section */}        <div className="h-[140px] flex items-center justify-center bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 border-b border-gray-700 relative">
          {/* Hidden Developer Access - Triple click the top-right corner */}
          <div 
            className="absolute top-0 right-0 w-16 h-16 cursor-pointer"
            onClick={(e) => {
              if (e.detail === 1) { // Triple click
                const password = prompt('Enter developer password:');
                if (password === '') {
                  setShowDeveloperDashboard(true);
                  if (window.addNotification) {
                    window.addNotification('🛠️ Developer Dashboard geopend', 'success', 2000);
                  }
                } else if (password !== null) {
                  if (window.addNotification) {
                    window.addNotification('❌ Incorrect password', 'error', 2000);
                  }
                }
              }
            }}
            title="Triple-click for developer access"
          />
            <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Nederlandse Radio / Playlist Switcher
            </h1>
            <h2 className="text-2xl md:text-2xl font-semibold text-gray-300">
              Automatische reclamepauze wisseling
            </h2>
            <p className="text-gray-400 mt-2 text-lg">
            </p>
         
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col pb-32"> {/* Add bottom padding for fixed footer */}

          {/* YouTube Playlist URL Section */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
                  YouTube Playlist URL:
                </label>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div
                      className="flex-1 relative"
                      onMouseEnter={() => setIsPlaylistInputHovered(true)}
                      onMouseLeave={() => setIsPlaylistInputHovered(false)}
                    >
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/playlist?list=..."
                        value={adBreakTimer.playlistUrl}
                        onChange={(e) => adBreakTimer.setPlaylistUrl(e.target.value)}
                        className={`w-full px-3 py-2 pr-12 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${playlistInfo === null && adBreakTimer.playlistUrl ? 'border-red-500' :
                          playlistInfo?.isValid ? 'border-green-500' : 'border-gray-600'
                          }`}
                      />

                      {/* Validation indicator in the input */}
                      <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                        {isValidatingPlaylist ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b border-blue-500"></div>
                        ) : playlistInfo?.isValid ? (
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        ) : adBreakTimer.playlistUrl && !playlistInfo?.isValid ? (
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        ) : null}
                      </div>

                      {/* Paste Button */}
                      <button
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            if (text.includes('youtube.com/playlist') || text.includes('youtu.be/playlist')) {
                              adBreakTimer.setPlaylistUrl(text);
                              if (window.addNotification) {
                                window.addNotification('Playlist URL geplakt', 'success', 2000);
                              }
                            } else {
                              if (window.addNotification) {
                                window.addNotification('Geen geldige playlist URL in klembord', 'error', 3000);
                              }
                            }
                          } catch (error) {
                            if (window.addNotification) {
                              window.addNotification('Kon niet plakken uit klembord', 'error', 3000);
                            }
                          }
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                        title="Plakken"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v3h10V5h2v14z" />
                        </svg>
                      </button>

                      {/* Playlist Info Display - Only show on hover */}
                      {isPlaylistInputHovered && playlistInfo?.isValid && (
                        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
                          <div className="text-sm text-green-400 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                            </svg>
                            <span>{playlistInfo.title}</span>
                            {playlistInfo.videoCount && (
                              <span className="text-gray-400">• {playlistInfo.videoCount} nummers</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Validation Error Message - Only show on hover */}
                      {isPlaylistInputHovered && adBreakTimer.playlistUrl && !isValidatingPlaylist && playlistInfo && !playlistInfo.isValid && (
                        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-gray-700 border border-red-500 rounded-lg shadow-lg z-10">
                          <div className="text-sm text-red-400">
                            {playlistInfo.error}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          const { getRandomPlaylist } = await import('./utils/predefinedPlaylists');
                          const randomPlaylist = getRandomPlaylist();
                          adBreakTimer.setPlaylistUrl(randomPlaylist.url);
                          if (window.addNotification) {
                            window.addNotification(`Willekeurige afspeellijst geladen: ${randomPlaylist.name}`, 'success', 3000);
                          }
                        } catch (error) {
                          if (window.addNotification) {
                            window.addNotification('Kon geen willekeurige afspeellijst laden', 'error', 3000);
                          }
                        }
                      }}
                      className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
                      title="Willekeurige afspeellijst"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 28 28" style={{ transform: 'rotate(15deg)' }}>
                        <rect x="3" y="3" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                        <circle cx="18" cy="8" r="1.5" fill="currentColor" />
                        <circle cx="8" cy="18" r="1.5" fill="currentColor" />
                        <circle cx="14" cy="14" r="1.5" fill="currentColor" />
                        <circle cx="18" cy="18" r="1.5" fill="currentColor" />
                      </svg>
                    </button>
                  </div>



                  {/* Validation Error Message - Now under the input field */}
                  {adBreakTimer.playlistUrl && !isValidatingPlaylist && playlistInfo && !playlistInfo.isValid && (
                    <div className="text-sm text-red-400">
                      {playlistInfo.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ad Break Settings - Moved back here */}
          <div className="bg-gray-800 border-b border-gray-700">
            <ErrorBoundary>
              <AdBreakSettings
                adBreakMinute={adBreakTimer.adBreakMinute}
                adBreakMinute2={adBreakTimer.adBreakMinute2}
                adBreakDuration={adBreakTimer.adBreakDuration}
                isTimerRunning={adBreakTimer.isTimerRunning}
                onMinuteChange={adBreakTimer.setAdBreakMinute}
                onMinute2Change={adBreakTimer.setAdBreakMinute2}
                onDurationChange={adBreakTimer.setAdBreakDuration}
                onStartTimer={adBreakTimer.startTimer}
                onStopTimer={adBreakTimer.stopTimer}
                onManualAdBreak={adBreakTimer.manualAdBreak}
                isAdBreakActive={adBreakTimer.isAdBreakActive}
                isManualTestActive={adBreakTimer.isManualTestActive}
                playlistUrl={adBreakTimer.playlistUrl}
                playlistInfo={playlistInfo}
                nextAdBreakIn={adBreakTimer.nextAdBreakIn}
                currentAdBreakTimeLeft={adBreakTimer.currentAdBreakTimeLeft}
                audioPlayer={audioPlayer}
              />
            </ErrorBoundary>
          </div>

          {/* Radio Grid */}
          <RadioGrid
            onStationSelect={handleStationSelect}
            currentStation={audioPlayer.currentStation}
            isLoading={audioPlayer.isLoading}
            isPlaying={audioPlayer.isPlaying}
          />
        </div>

        {/* Fixed Footer with Controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50">
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
            playlistShuffle={adBreakTimer.playlistShuffle}
            onToggleShuffle={(enabled) => {
              adBreakTimer.setPlaylistShuffle(enabled);
              if (window.addNotification) {
                window.addNotification(`Shuffle ${enabled ? 'ingeschakeld' : 'uitgeschakeld'}`, 'info', 2000);
              }
            }}
            onNextTrack={() => {
              if (audioPlayer.youtubePlayerRef?.current) {
                try {
                  audioPlayer.youtubePlayerRef.current.nextVideo();
                  if (window.addNotification) {
                    window.addNotification('Volgende nummer', 'info', 1500);
                  }
                } catch (error) {
                  console.error('Could not skip to next track:', error);
                }
              }
            }}
            playlistInfo={playlistInfo}
            queuedStation={adBreakTimer.queuedStation}
            onCancelQueuedSwitch={adBreakTimer.cancelQueuedSwitch}
          />
        </div>

        {/* User Guide */}
        <UserGuide />

        {/* Notification System */}
        <NotificationSystem />

        {/* Loading Overlay - Prevent clicks during transitions */}
        {(audioPlayer.isTransitioning || audioPlayer.isLoading) && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-sm mx-4 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {audioPlayer.isTransitioning ? 'Audio wisselen...' : 'Verbinding maken...'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {audioPlayer.isTransitioning 
                      ? 'Even geduld, de overgang wordt voorbereid' 
                      : audioPlayer.currentStation 
                        ? `Verbinding maken met ${audioPlayer.currentStation.name}`
                        : 'Bezig met laden...'
                    }
                  </p>
                  
                  {audioPlayer.connectionTimeout && (
                    <p className="text-orange-400 text-sm mt-2">
                      {audioPlayer.connectionTimeout}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    console.log('🛑 User clicked abort button');
                    audioPlayer.abortConnection();
                    if (window.addNotification) {
                      window.addNotification('⏹️ Alles gestopt', 'info', 2000);
                    }
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-200 text-sm rounded-lg transition-colors border border-gray-500"
                >
                  Geef op
                </button>
              </div>
            </div>
          </div>        )}

        {/* Developer Dashboard */}
        {showDeveloperDashboard && (
          <DeveloperDashboard onClose={() => setShowDeveloperDashboard(false)} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
