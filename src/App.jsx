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
  const [playlistProvider, setPlaylistProvider] = useState('spotify');
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
    
    // Better audioPlayer exposure with provider separation
    window.audioPlayer = {
      ...audioPlayer,
      initializeSpotifyPlayer: audioPlayer.manualInitializeSpotifyPlayer,
      // Add provider-specific ready states
      isSpotifyReady: audioPlayer.spotifyPlayerReady,
      isYouTubeReady: !!audioPlayer.youtubePlayerRef?.current,
      currentProvider: playlistProvider
    };

    // Force UI updates when Spotify becomes ready
    if (audioPlayer.spotifyPlayerReady) {
      // Trigger any UI components that might be waiting
      window.dispatchEvent(new CustomEvent('spotifyReady', { 
        detail: { ready: true, provider: playlistProvider } 
      }));
    }

  //  console.log('🔄 Global state updated - Spotify ready:', audioPlayer.spotifyPlayerReady, 'Provider:', playlistProvider);
  }, [
    adBreakTimer.isAdBreakActive, 
    adBreakTimer.queueStationSwitch, 
    adBreakTimer.isTimerRunning, 
    adBreakTimer.playlistUrl, 
    adBreakTimer.playlistShuffle, 
    adBreakTimer.shouldPlayPlaylistDuringAdBreak, 
    audioPlayer,
    audioPlayer.spotifyPlayerReady,
    playlistProvider // Add provider to dependencies
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

  // Add this after your other useEffects
  useEffect(() => {
    // Global error handler to suppress CloudPlaybackClientError spam
    const originalError = window.console.error;
    window.console.error = (...args) => {
      const message = args.join(' ');
      
      // Suppress CloudPlaybackClientError 404s from Spotify SDK
      if (message.includes('CloudPlaybackClientError') && message.includes('404')) {
        console.warn('🎵 Suppressed CloudPlaybackClientError 404 (normal Spotify operation)');
        return;
      }
      
      // Allow all other errors through
      originalError.apply(console, args);
    };
    
    // Cleanup on unmount
    return () => {
      window.console.error = originalError;
    };
  }, []);

  // Add transition timeout enforcement
  useEffect(() => {
    let transitionTimeoutId;
    
    if (audioPlayer.isTransitioning) {
      // Force reset transition state after 30 seconds
      transitionTimeoutId = setTimeout(() => {
        console.warn('🚨 Forcing reset of stuck transition state');
        audioPlayer.setIsTransitioning(false);
        audioPlayer.setIsLoading(false);
        
        if (window.addNotification) {
          window.addNotification('⚠️ Reset na vastgelopen overgang', 'warning', 3000);
        }
      }, 30000);
    }
    
    return () => {
      if (transitionTimeoutId) {
        clearTimeout(transitionTimeoutId);
      }
    };
  }, [audioPlayer.isTransitioning]);

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
                if (password === 'xd') {
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
        <div className="flex-1 flex flex-col pb-32"> {/* Add bottom padding for fixed footer */}          {/* Playlist Provider Selection Section - Only show for playlist mode */}
          {adBreakTimer.adBreakMode === 'playlist' && (
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
                  error={audioPlayer.error}
                  onRetry={audioPlayer.manualInitializeSpotifyPlayer}
                />
              </div>
            </div>
          )}

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
                adBreakMode={adBreakTimer.adBreakMode}
                onAdBreakModeChange={adBreakTimer.setAdBreakMode}
                isManualTestInProgress={adBreakTimer.isManualTestInProgress}  // ← Add this missing prop
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

        /* Notification System */
          <NotificationSystem />

          {/* Loading Status - Non-intrusive bottom-right indicator */}
          {(audioPlayer.isTransitioning || audioPlayer.isLoading) && !audioPlayer.error && (
            <div className="fixed bottom-20 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg z-40 max-w-xs">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {audioPlayer.isTransitioning ? 'Audio wisselen...' : 'Verbinding maken...'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {audioPlayer.isTransitioning 
                ? 'Overgang wordt voorbereid' 
                : audioPlayer.currentStation 
                  ? audioPlayer.currentStation.name
                  : 'Bezig met laden...'
              }
            </p>
            {audioPlayer.connectionTimeout && (
              <p className="text-xs text-orange-400 mt-1">
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
            className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-gray-200 text-xs rounded transition-colors border border-gray-500 flex-shrink-0"
            title="Stop laden"
                >
            ✕
                </button>
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
