import React, { useEffect } from 'react';
import RadioGrid from './components/RadioGrid';
import AudioPlayer from './components/AudioPlayer';
import AdBreakSettings from './components/AdBreakSettings';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationSystem from './components/NotificationSystem';
import UserGuide from './components/UserGuide';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useAdBreakTimer } from './hooks/useAdBreakTimer';

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
                <input
                  type="url"
                  value={adBreakTimer.playlistUrl}
                  onChange={(e) => adBreakTimer.setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  className="flex-1 px-3 py-2 bg-radio-darker border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-radio-accent focus:outline-none"
                />
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
