import React, { useEffect, useState } from 'react';
import RadioGrid from './components/RadioGrid';
import AudioPlayer from './components/AudioPlayer';
import AdBreakSettings from './components/AdBreakSettings';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationSystem from './components/NotificationSystem';
import UserGuide from './components/UserGuide';
import DeveloperDashboard from './components/DeveloperDashboard';
import PlaylistProviderSelector from './components/PlaylistProviderSelector';
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
  const [playlistProvider, setPlaylistProvider] = useState('youtube');

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
  }, [adBreakTimer.isAdBreakActive]);  // Keep global ad break state in sync
  useEffect(() => {
    window.isAdBreakActive = adBreakTimer.isAdBreakActive;
    window.queueStationSwitch = adBreakTimer.queueStationSwitch;
    window.isTimerRunning = adBreakTimer.isTimerRunning;
    window.playlistUrl = adBreakTimer.playlistUrl;
    window.playlistShuffle = adBreakTimer.playlistShuffle;
    window.shouldPlayPlaylistDuringAdBreak = adBreakTimer.shouldPlayPlaylistDuringAdBreak;
  }, [adBreakTimer.isAdBreakActive, adBreakTimer.queueStationSwitch, adBreakTimer.isTimerRunning, adBreakTimer.playlistUrl, adBreakTimer.playlistShuffle, adBreakTimer.shouldPlayPlaylistDuringAdBreak]);

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
            className="absolute top-5  right-10 w-5 h-5 cursor-pointer"
            onClick={(e) => {
              if (e.detail === 3) { // Triple click
                const password = prompt('Enter developer password:');
                if (password === '42069') {
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
           // title="Triple-click for developer access"
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
        <div className="flex-1 flex flex-col pb-32"> {/* Add bottom padding for fixed footer */}          {/* Playlist Provider Selection Section */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="max-w-6xl mx-auto">
              <PlaylistProviderSelector
                selectedProvider={playlistProvider}
                onProviderChange={setPlaylistProvider}
                playlistUrl={adBreakTimer.playlistUrl}
                onPlaylistUrlChange={adBreakTimer.setPlaylistUrl}
                playlistInfo={playlistInfo}
                onPlaylistInfoChange={setPlaylistInfo}
                isValidating={isValidatingPlaylist}
                onValidatingChange={setIsValidatingPlaylist}
              />
            </div>
          </div>

          {/* Ad Break Settings - Moved back here */}
          <div className="bg-gray-800 border-b border-gray-700">
            <ErrorBoundary>              <AdBreakSettings
                adBreakMinute={adBreakTimer.adBreakMinute}
                adBreakMinute2={adBreakTimer.adBreakMinute2}
                adBreakDuration={adBreakTimer.adBreakDuration}
                adBreakDuration2={adBreakTimer.adBreakDuration2}
                isTimerRunning={adBreakTimer.isTimerRunning}
                onMinuteChange={adBreakTimer.setAdBreakMinute}
                onMinute2Change={adBreakTimer.setAdBreakMinute2}
                onDurationChange={adBreakTimer.setAdBreakDuration}
                onDuration2Change={adBreakTimer.setAdBreakDuration2}
                onStartTimer={adBreakTimer.startTimer}
                onStopTimer={adBreakTimer.stopTimer}
                onManualAdBreak={adBreakTimer.manualAdBreak}
                isAdBreakActive={adBreakTimer.isAdBreakActive}
                isManualTestActive={adBreakTimer.isManualTestActive}
                playlistUrl={adBreakTimer.playlistUrl}
                playlistInfo={playlistInfo}
                playlistProvider={playlistProvider}
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
            }}            onNextTrack={() => {
              if (audioPlayer.currentPlaylistProvider === 'spotify' && audioPlayer.spotifyPlayerRef?.current) {
                try {
                  // Import nextSpotifyTrack for this operation
                  import('./utils/spotifyUtils').then(({ nextSpotifyTrack }) => {
                    nextSpotifyTrack();
                    if (window.addNotification) {
                      window.addNotification('Volgende nummer (Spotify)', 'info', 1500);
                    }
                  });
                } catch (error) {
                  console.error('Could not skip to next Spotify track:', error);
                }
              } else if (audioPlayer.currentPlaylistProvider === 'youtube' && audioPlayer.youtubePlayerRef?.current) {
                try {
                  audioPlayer.youtubePlayerRef.current.nextVideo();
                  if (window.addNotification) {
                    window.addNotification('Volgende nummer (YouTube)', 'info', 1500);
                  }
                } catch (error) {
                  console.error('Could not skip to next YouTube track:', error);
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
