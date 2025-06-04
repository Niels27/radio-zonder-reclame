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
import { validateSpotifyPlaylist } from './utils/spotifyUtils';
import LoadingIndicator from './components/LoadingIndicator';
import TimeRangeSlider from './components/TimeRangeSlider';

function App() {
  const [playlistProvider, setPlaylistProvider] = useState('youtube');
  const audioPlayer = useAudioPlayer(playlistProvider);
  const adBreakTimer = useAdBreakTimer(audioPlayer, playlistProvider);
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [isValidatingPlaylist, setIsValidatingPlaylist] = useState(false);
  const [isPlaylistInputHovered, setIsPlaylistInputHovered] = useState(false);
  const [showDeveloperDashboard, setShowDeveloperDashboard] = useState(false);
  const [activeStartHour, setActiveStartHour] = useState(7);
  const [activeEndHour, setActiveEndHour] = useState(22);
  // --- Remove state for time range enabled and selected days ---

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
    
    // ✅ FIX: Expose audioPlayer for Spotify initialization and ensure spotifyPlayerReady is updated
    window.audioPlayer = {
      ...audioPlayer,
      initializeSpotifyPlayer: audioPlayer.manualInitializeSpotifyPlayer
    };

    // Debug logging for state synchronization
    console.log('🔄 Updating window.audioPlayer with spotifyPlayerReady:', audioPlayer.spotifyPlayerReady);
  }, [
    adBreakTimer.isAdBreakActive, 
    adBreakTimer.queueStationSwitch, 
    adBreakTimer.isTimerRunning, 
    adBreakTimer.playlistUrl, 
    adBreakTimer.playlistShuffle, 
    adBreakTimer.shouldPlayPlaylistDuringAdBreak, 
    audioPlayer,
    audioPlayer.spotifyPlayerReady // ✅ FIX: Add specific dependency for spotifyPlayerReady
  ]);

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
        let info;
        
        // Determine if this is a Spotify or YouTube playlist
        if (playlistProvider === 'spotify') {
          // For Spotify, the playlistUrl is actually the playlist ID
          info = await validateSpotifyPlaylist(adBreakTimer.playlistUrl);
          // Convert Spotify format to match the expected format
          if (info.isValid) {
            info = {
              ...info,
              title: info.name,
              thumbnail: info.imageUrl,
              videoCount: info.trackCount
            };
          }
        } else {
          // YouTube playlist validation
          info = await validatePlaylistUrl(adBreakTimer.playlistUrl);
        }
        
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
  }, [adBreakTimer.playlistUrl, playlistProvider]);

  // Auto play/pause based on time window and selected days
  useEffect(() => {
    const checkActiveTime = () => {
      const now = new Date();
      const dayIdx = (now.getDay() + 6) % 7; // 0=Monday, 6=Sunday
      const hour = now.getHours();
      // Get per-day settings from localStorage
      let daySettings = [];
      try {
        const saved = localStorage.getItem('adbreak_day_settings');
        if (saved) daySettings = JSON.parse(saved);
      } catch {}
      if (!Array.isArray(daySettings) || daySettings.length !== 7) return;
      const today = daySettings[dayIdx];
      if (!today || !today.enabled) return; // Do nothing if not enabled for today
      // Only play if within range
      if (today.startHour < today.endHour) {
        if (hour >= today.startHour && hour < today.endHour) {
          if (!audioPlayer.isPlaying && audioPlayer.currentStation) {
            audioPlayer.resumeAudio();
          }
        } else {
          if (audioPlayer.isPlaying) {
            audioPlayer.pauseAudio();
          }
        }
      } else { // overnight (e.g. 22-7)
        if (hour >= today.startHour || hour < today.endHour) {
          if (!audioPlayer.isPlaying && audioPlayer.currentStation) {
            audioPlayer.resumeAudio();
          }
        } else {
          if (audioPlayer.isPlaying) {
            audioPlayer.pauseAudio();
          }
        }
      }
    };
    const interval = setInterval(checkActiveTime, 30000); // check every 30s
    checkActiveTime();
    return () => clearInterval(interval);
  }, [audioPlayer.isPlaying, audioPlayer.currentStation]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
        {/* Enhanced Header Section with Wave Animation */}
        <div className="h-[140px] flex items-center justify-center border-b border-gray-700 relative banner-container">
          {/* Animated Background */}
          <div className="banner-background"></div>
          
          {/* Wave Animation Overlays - handled by CSS pseudo-elements */}
          
          {/* Shimmer Effect */}
          <div className="banner-shimmer"></div>
          
          {/* Hidden Developer Access - Triple click the top-right corner */}
          <div 
            className="absolute top-5 right-10 w-5 h-5 cursor-pointer z-10"
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
          />
          
          {/* Banner Content */}
          <div className="text-center banner-text">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 banner-title bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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
                // --- Pass error and retry function ---
                error={audioPlayer.error}
                onRetry={audioPlayer.manualInitializeSpotifyPlayer}
              />
            </div>
          </div>

          {/* Ad Break Settings - Moved back here */}
          <div className="bg-gray-800 border-b border-gray-700">
            <ErrorBoundary>
              <AdBreakSettings
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
        {(audioPlayer.isTransitioning || audioPlayer.isLoading) && !audioPlayer.error && (
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
          </div>
        )}

        {/* Developer Dashboard */}
        {showDeveloperDashboard && (
          <DeveloperDashboard onClose={() => setShowDeveloperDashboard(false)} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
