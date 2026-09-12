// components/AdBreakSettings.jsx - Show current ad break countdown instead of next break countdown

import React, { useState, useEffect } from "react";
import PlaylistProviderSelector from "./PlaylistProviderSelector";
import YouTubeUrlInput from "./YouTubeUrlInput";
// import VisualizerSettings from "./VisualizerSettings";  // commented out from UI
import NonstopSettingsOverlay from "./NonstopSettingsOverlay";
import AdBreakExpandedSettings from "./AdBreakExpandedSettings";
import { isSpotifyAuthenticated } from "../utils/spotifyUtils";
import eventBus, {
  notify,
  openYouTubePlayer,
  closeAllYouTubePlayers,
  registerStopAllManualModes,
} from "../utils/eventBus";

const AdBreakSettings = ({
  adBreakMinute,
  adBreakMinute2,
  adBreakDuration,
  adBreakDuration2,
  isTimerRunning,
  onMinuteChange,
  onMinute2Change,
  onDurationChange,
  onDuration2Change,
  onStartTimer,
  onStopTimer,
  onManualAdBreak,
  isAdBreakActive,
  playlistUrl,
  playlistInfo,
  nextAdBreakIn,
  currentAdBreakTimeLeft,
  isManualTestActive,
  audioPlayer,
  adBreakMode,
  onAdBreakModeChange,
  isManualTestInProgress,
  autoAdDetectionEnabled,
  onAutoAdDetectionChange,
  // ✅ NEW: Additional props for playlist controls
  playlistProvider,
  onProviderChange,
  onPlaylistUrlChange,
  onPlaylistInfoChange,
  playlistShuffle,
  onShuffleChange,
  isValidatingPlaylist,
  isPlaylistInputHovered,
  setIsPlaylistInputHovered,
  // Visualizer & fade props - commented out from UI but still passed from parent
  // visualizerEnabled, onVisualizerToggle, visualizerType, onVisualizerTypeChange, visualizerBlur, onVisualizerBlurChange,
  // fadeAudioStreams, onFadeAudioStreamsChange,
  // YouTube mode props
  youtubeUrl,
  onYoutubeUrlChange,
  // Simple nonstop cycling button state
  setIsNonstopModeManuallyActive,
}) => {
  // ✅ INSTANT STATE TRACKING: Prevent double-clicking between timer and manual modes
  const [isTimerStarting, setIsTimerStarting] = useState(false);

  const [autoSkipPreroll, setAutoSkipPreroll] = useState(() => {
    try {
      const saved = localStorage.getItem("auto_skip_preroll");
      return saved ? JSON.parse(saved) : false; // Default to disabled (handmatig)
    } catch {
      return false;
    }
  });

  // Overlay states
  const [showNonstopSettings, setShowNonstopSettings] = useState(false);

  // Note: useCommunityTimings is now coming from props instead of local state

  // Check if current mode is valid
  const isModeValid = () => {
    if (adBreakMode === "playlist") {
      return playlistUrl && playlistInfo?.isValid;
    }
    return true; // nonstop and lofi don't require configuration
  };

  // ✅ NEW: Check if radio station is selected for timer
  const isRadioSelected = () => {
    return audioPlayer && audioPlayer.currentStation;
  };
  // Save to localStorage when autoSkipPreroll changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "auto_skip_preroll",
        JSON.stringify(autoSkipPreroll),
      );

      // ✅ CRITICAL: Update the AdSkipUtils setting immediately
      if (window.AdSkipUtils) {
        window.AdSkipUtils.setAutoSkipSetting(autoSkipPreroll);
      }

      console.log(
        "🔧 Auto skip setting saved and synced:",
        autoSkipPreroll ? "Automatisch" : "Handmatig",
      );
    } catch (error) {
      console.warn("Failed to save auto skip setting:", error);
    }
  }, [autoSkipPreroll]);

  // Update open YouTube player when URL changes - close and reopen with new URL
  useEffect(() => {
    if (!youtubeUrl || !getModeState("youtube").active) return;
    import("../utils/lofiUtils.js").then(({ extractYouTubeVideoId }) => {
      import("../utils/youtubeUtils.js").then(({ extractPlaylistId }) => {
        const videoId = extractYouTubeVideoId(youtubeUrl);
        const playlistId = extractPlaylistId(youtubeUrl);
        if (videoId || playlistId) {
          closeAllYouTubePlayers();
          setTimeout(() => {
            openYouTubePlayer({
              videoId: videoId || undefined,
              playlistId: playlistId || undefined,
              title: "YouTube",
              isAutomatic: false,
              autoCloseSeconds: null,
            });
          }, 100);
        }
      });
    });
  }, [youtubeUrl]);

  // ✅ ISOLATED: Separate state for each manual mode to prevent race conditions
  const [playlistModeState, setPlaylistModeState] = useState({
    active: false,
    loading: false,
    startTime: null,
  });
  const [nonstopModeState, setNonstopModeState] = useState({
    active: false,
    loading: false,
    startTime: null,
  });
  const [youtubeModeState, setYoutubeModeState] = useState({
    active: false,
    loading: false,
    startTime: null,
  });

  // Track which mode is currently selected for display purposes
  const [selectedManualMode, setSelectedManualMode] = useState(null);
  // Helper to get current mode state
  const getModeState = (mode) => {
    switch (mode) {
      case "playlist":
        return playlistModeState;
      case "nonstop":
        return nonstopModeState;
      case "youtube":
        return youtubeModeState;
      default:
        return { active: false, loading: false, startTime: null };
    }
  };

  // Helper to set mode state
  const setModeState = (mode, newState) => {
    switch (mode) {
      case "playlist":
        setPlaylistModeState(newState);
        break;
      case "nonstop":
        setNonstopModeState(newState);
        break;
      case "youtube":
        setYoutubeModeState(newState);
        break;
      default:
        console.warn(`Unknown mode: ${mode}`);
    }
  };

  // ✅ NEW: Listen for external playlist stops (when overlays are closed directly)
  useEffect(() => {
    const handlePlaylistStopped = (type) => {
      console.log(`🎵 External playlist stop detected: ${type}`);

      // ✅ NEW: Handle ad break scenarios when overlays are manually closed
      if (isAdBreakActive && adBreakMode === "youtube" && type === "youtube") {
        console.log(
          "🎵 Lofi overlay manually closed during ad break - resuming radio",
        );
        // Resume the radio since the lofi overlay was closed during an ad break
        if (audioPlayer?.resumeRadioFromAdBreak) {
          audioPlayer.resumeRadioFromAdBreak();
        }
        // Stop the timer since the ad break content was manually stopped
        if (onStopTimer) {
          onStopTimer();
        }
      }

      // Reset manual mode states
      switch (type) {
        case "spotify":
          setPlaylistModeState({
            active: false,
            loading: false,
            startTime: null,
          });
          break;
        case "youtube":
          setYoutubeModeState({
            active: false,
            loading: false,
            startTime: null,
          });
          break;
        case "nonstop":
          setNonstopModeState({
            active: false,
            loading: false,
            startTime: null,
          });
          break;
      }
    };

    // Listen for playlist stops via event bus
    const unsub = eventBus.on("playlist:stopped", handlePlaylistStopped);

    // Cleanup
    return () => unsub();
  }, []);

  // Check if any mode is active
  const isAnyModeActive = () => {
    return (
      playlistModeState.active ||
      nonstopModeState.active ||
      youtubeModeState.active
    );
  };

  // Check if any mode is loading
  const isAnyModeLoading = () => {
    return (
      playlistModeState.loading ||
      nonstopModeState.loading ||
      youtubeModeState.loading
    );
  };
  // Get the currently active mode
  const getActiveMode = () => {
    if (playlistModeState.active) return "playlist";
    if (nonstopModeState.active) return "nonstop";
    if (youtubeModeState.active) return "youtube";
    return null;
  }; // ✅ GOLDEN RULE ENFORCEMENT: Stop all manual modes (exposed globally)
  const stopAllManualModes = async () => {
    console.log("🛑 GOLDEN RULE: Stopping ALL active manual modes");

    // ✅ CLEAR nonstop mode flag when stopping all modes
    // nonstop mode tracked via nonstopModeState.active

    const activeModes = [];
    if (playlistModeState.active) activeModes.push("playlist");
    if (nonstopModeState.active) activeModes.push("nonstop");
    if (youtubeModeState.active) activeModes.push("youtube");

    // ✅ CRITICAL: Also check if the ad break timer is running any of these modes
    if (
      isAdBreakActive &&
      (adBreakMode === "playlist" ||
        adBreakMode === "nonstop" ||
        adBreakMode === "youtube")
    ) {
      console.log(
        "🛑 GOLDEN RULE: Also stopping active ad break mode:",
        adBreakMode,
      );
      if (onStopTimer) {
        onStopTimer(); // This will call forceExitAdBreakMode
      }
    }

    if (activeModes.length === 0) {
      console.log("🔧 No manual modes active to stop");
      return;
    }

    console.log("🛑 Stopping active manual modes:", activeModes);
    // Stop all active modes simultaneously
    const stopPromises = activeModes.map((mode) => stopSpecificMode(mode));
    await Promise.all(stopPromises); // Force stop all audio sources
    if (audioPlayer && audioPlayer.forceStopAllAudio) {
      audioPlayer.forceStopAllAudio("manual modes stopped", false);
    }

    console.log(
      "✅ All manual modes stopped - enforcing ONE AUDIO STREAM rule",
    );
  }; // Register stopAllManualModes via event bus
  useEffect(() => {
    registerStopAllManualModes(stopAllManualModes);
    return () => registerStopAllManualModes(null);
  }, [stopAllManualModes, isAdBreakActive, adBreakMode, onStopTimer]); // ✅ ISOLATED: Manual mode toggle with complete mode isolation
  const handleManualModeToggle = async () => {
    const currentModeState = getModeState(adBreakMode);

    // Prevent rapid clicking during loading
    if (currentModeState.loading) {
      console.log(`🚫 ${adBreakMode} mode is loading, ignoring click`);
      return;
    }

    if (currentModeState.active) {
      // Stop current mode
      await stopSpecificMode(adBreakMode);
    } else {
      // ✅ INSTANT FIX: Set loading state IMMEDIATELY to prevent double-clicking
      setModeState(adBreakMode, { loading: true });

      // ✅ CRITICAL: If switching was active, deactivate it first!
      if (isTimerRunning) {
        console.log(
          "🛑 Timer switching is active - stopping it first before starting manual mode",
        );
        onStopTimer();
        // Small delay to ensure cleanup
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Start current mode (first stop any other active mode)
      const activeMode = getActiveMode();
      if (activeMode && activeMode !== adBreakMode) {
        console.log(`🔄 Stopping ${activeMode} to start ${adBreakMode}`);
        await stopSpecificMode(activeMode);
        // Brief pause to ensure cleanup
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      await startSpecificMode(adBreakMode);
    }
  };
  // ✅ ISOLATED: Start a specific mode with complete isolation
  const startSpecificMode = async (mode) => {
    const currentModeState = getModeState(mode);

    // Prevent starting if already loading or active
    if (currentModeState.loading || currentModeState.active) {
      console.log(
        `🚫 ${mode} mode already loading/active, ignoring start request`,
      );
      return;
    }

    try {
      console.log(`🎵 Starting isolated ${mode} mode test`);

      // Set loading state immediately for this specific mode
      setModeState(mode, { loading: true });
      // Stop any audio sources first
      if (audioPlayer?.forceStopAllAudio) {
        audioPlayer.forceStopAllAudio(`starting ${mode} mode`, false);
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      // Start the specific mode
      switch (mode) {
        case "playlist":
          await startIsolatedPlaylistMode();
          break;
        case "nonstop":
          await startIsolatedNonstopMode();
          break;
        case "youtube":
          await startIsolatedYouTubeMode();
          break;
        default:
          throw new Error(`Unknown mode: ${mode}`);
      }

      // Set active state only after successful start
      setModeState(mode, {
        active: true,
        loading: false,
        startTime: Date.now(),
      });
      setSelectedManualMode(mode);

      notify(`${getModeDisplayName(mode)} Test Gestart`, "success", 2000);
    } catch (error) {
      console.error(`Failed to start ${mode} mode:`, error);

      // Reset state on error
      setModeState(mode, { active: false, loading: false, startTime: null });

      notify(
        `Kan ${getModeDisplayName(mode)} test niet starten: ${error.message}`,
        "error",
        3000,
      );
    }
  }; // ✅ ISOLATED: Stop a specific mode with complete isolation
  const stopSpecificMode = async (mode) => {
    const currentModeState = getModeState(mode);

    if (!currentModeState.active && !currentModeState.loading) {
      console.log(`🚫 ${mode} mode not active, nothing to stop`);
      return;
    }

    try {
      console.log(`🛑 Stopping isolated ${mode} mode test`);
      // ✅ CLEAR nonstop mode flag when stopping nonstop mode
      if (mode === "nonstop") {
        // nonstop mode tracked via nonstopModeState.active
        // ✅ NEW: Clear simple state for cycling button
        if (setIsNonstopModeManuallyActive) {
          setIsNonstopModeManuallyActive(false);
        }
      } // Stop all audio sources completely
      if (audioPlayer?.forceStopAllAudio) {
        audioPlayer.forceStopAllAudio(`stopping ${mode} mode`, false);
      }

      // Close YouTube players when stopping lofi or playlist mode
      if (mode === "youtube" || mode === "playlist") {
        console.log(`✕ Closing YouTube player for ${mode} mode`);
        closeAllYouTubePlayers();
      }

      // Reset state for this specific mode
      setModeState(mode, { active: false, loading: false, startTime: null });

      // Clear selected mode if this was the selected one
      if (selectedManualMode === mode) {
        setSelectedManualMode(null);
      }

      notify(`${getModeDisplayName(mode)} Test Gestopt`, "info", 2000);
    } catch (error) {
      console.error(`Failed to stop ${mode} mode:`, error);
      // Force reset state even on error
      setModeState(mode, { active: false, loading: false, startTime: null });
      if (selectedManualMode === mode) {
        setSelectedManualMode(null);
      }
      // ✅ FORCE CLEAR nonstop mode flag even on error
      if (mode === "nonstop") {
        // nonstop mode tracked via nonstopModeState.active
      }
    }
  }; // ✅ ISOLATED: Individual mode start functions
  const startIsolatedPlaylistMode = async () => {
    if (!playlistUrl) {
      throw new Error("Geen Spotify playlist ingesteld");
    }

    console.log("🎵 Starting isolated Spotify playlist test");

    if (audioPlayer?.playSpotify) {
      await audioPlayer.playSpotify(playlistUrl, {
        shuffle: playlistShuffle,
      });
    } else {
      throw new Error("Spotify afspelen niet beschikbaar");
    }
  };
  const startIsolatedNonstopMode = async () => {
    console.log(
      "🎵 Starting isolated nonstop radio test (no ad breaks, just nonstop radio)",
    );

    const {
      getRandomNonstopStation,
      markStationAsFailed,
      getNonstopStationsCount,
    } = await import("../utils/nonstopUtils.js");

    const maxRetries = Math.min(getNonstopStationsCount(), 6);
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const nonstopStation = getRandomNonstopStation();
      if (!nonstopStation) {
        throw new Error("Geen nonstop stations beschikbaar");
      }

      console.log(
        `🎵 Nonstop attempt ${attempt + 1}/${maxRetries}: ${nonstopStation.name}`,
      );

      try {
        // nonstop mode tracked via nonstopModeState.active
        if (setIsNonstopModeManuallyActive) {
          setIsNonstopModeManuallyActive(true);
        }

        await audioPlayer.playRadio(nonstopStation, {
          isManualTest: true,
          isIsolatedTest: true,
          isNonstopMode: true,
        });
        return; // Success - exit the retry loop
      } catch (error) {
        console.warn(
          `⚠️ Nonstop station "${nonstopStation.name}" failed:`,
          error.message,
        );
        markStationAsFailed(nonstopStation.name);
        // Continue to next station
      }
    }

    // All retries exhausted
    // nonstop mode tracked via nonstopModeState.active
    if (setIsNonstopModeManuallyActive) {
      setIsNonstopModeManuallyActive(false);
    }
    throw new Error(
      `Geen werkende nonstop stations gevonden na ${maxRetries} pogingen`,
    );
  };
  const startIsolatedYouTubeMode = async () => {
    console.log("🎵 Starting isolated YouTube mode");

    const url = youtubeUrl;
    if (!url) {
      throw new Error("Geen YouTube URL ingesteld");
    }

    const { extractYouTubeVideoId } = await import("../utils/lofiUtils.js");
    const { extractPlaylistId } = await import("../utils/youtubeUtils.js");

    const videoId = extractYouTubeVideoId(url);
    const playlistId = extractPlaylistId(url);

    if (!videoId && !playlistId) {
      throw new Error("Ongeldige YouTube URL");
    }

    // Open the resizable YouTube player overlay
    openYouTubePlayer({
      videoId: videoId || undefined,
      playlistId: playlistId || undefined,
      title: "YouTube",
      isAutomatic: false,
      autoCloseSeconds: null,
    });
  };

  // Helper function to get mode display name
  const getModeDisplayName = (mode) => {
    switch (mode) {
      case "playlist":
        return "Spotify";
      case "nonstop":
        return "Nonstop Radio";
      case "youtube":
        return "YouTube";
      default:
        return "Onbekend";
    }
  };

  // ✅ INSTANT FIX: Wrapper for onStartTimer to set instant disable state
  const handleStartTimer = async () => {
    if (isTimerStarting || isTimerRunning) {
      console.log("🚫 Timer already starting or running, ignoring click");
      return;
    }

    // Set instant state to disable manual mode buttons immediately
    setIsTimerStarting(true);

    try {
      await onStartTimer();
    } catch (error) {
      console.error("Error starting timer:", error);
    } finally {
      // Clear the loading state after a short delay (should be cleared by isTimerRunning becoming true)
      setTimeout(() => {
        setIsTimerStarting(false);
      }, 2000);
    }
  };

  // ✅ RESET TIMER STARTING STATE: When timer actually starts running
  useEffect(() => {
    if (isTimerRunning) {
      setIsTimerStarting(false);
    }
  }, [isTimerRunning]);

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-4">
          {" "}
          {/* ✅ NEW: Playlist Mode Selector at Top */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <label className="block text-sm font-medium mb-3 text-gray-300">
              Switch Methode:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* YouTube Playlist Mode */}
              <div
                className={`p-4 rounded-lg border-2 transition-all relative cursor-pointer hover:opacity-80 ${
                  adBreakMode === "youtube"
                    ? "border-red-500 bg-red-600/20 text-red-300"
                    : "border-gray-600 bg-gray-700 text-gray-300"
                }`}
                onClick={() => onAdBreakModeChange("youtube")}
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.498 6.186a2.99 2.99 0 0 0-2.11-2.11C19.504 3.5 12 3.5 12 3.5s-7.504 0-9.388.576a2.99 2.99 0 0 0-2.11 2.11C0 8.07 0 12 0 12s0 3.93.502 5.814a2.99 2.99 0 0 0 2.11 2.11C4.496 20.5 12 20.5 12 20.5s7.504 0 9.388-.576a2.99 2.99 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span className="font-semibold">YouTube</span>
                </div>
                <p className="text-xs text-gray-400">
                  Wissel naar YouTube video/playlist tijdens reclame
                </p>
              </div>
              {/* Spotify Mode */}
              <div
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:opacity-80 ${
                  adBreakMode === "playlist"
                    ? "border-green-500 bg-green-600/20 text-green-300"
                    : "border-gray-600 bg-gray-700 text-gray-300"
                }`}
                onClick={() => onAdBreakModeChange("playlist")}
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  <span className="font-semibold">Spotify</span>
                </div>
                <p className="text-xs text-gray-400">
                  Wissel naar Spotify afspeellijst tijdens reclame
                </p>
              </div>

              {/* Nonstop Mode */}
              <div
                className={`p-4 rounded-lg border-2 transition-all relative cursor-pointer hover:opacity-80 ${
                  adBreakMode === "nonstop"
                    ? "border-blue-500 bg-blue-600/20 text-blue-300"
                    : "border-gray-600 bg-gray-700 text-gray-300"
                }`}
                onClick={() => onAdBreakModeChange("nonstop")}
              >
                <div className="flex items-center gap-3 mb-2">
                  {/* Repeat/loop icon - fits "non-stop, continuous playback" better than the generic radio tuner icon used elsewhere */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                  </svg>
                  <span className="font-semibold">Non-stop Radio</span>
                </div>
                <p className="text-xs text-gray-400">
                  Wissel naar een radio zonder reclame
                </p>
              </div>
            </div>

            {/* Spotify playlist selector when playlist/spotify mode is selected */}
            {adBreakMode === "playlist" && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <PlaylistProviderSelector
                      playlistUrl={playlistUrl}
                      onPlaylistUrlChange={onPlaylistUrlChange}
                      onPlaylistInfoChange={(info) => {
                        if (onPlaylistInfoChange) {
                          onPlaylistInfoChange(info);
                        }
                      }}
                      onValidatingChange={() => {}}
                      error={audioPlayer?.error}
                      onRetry={audioPlayer?.manualInitializeSpotifyPlayer}
                    />
                  </div>
                  {isSpotifyAuthenticated() && (
                    <button
                      onClick={handleManualModeToggle}
                      disabled={!isModeValid() || isAnyModeLoading() || isTimerRunning || isTimerStarting}
                      className={`mt-7 px-3 py-[9px] rounded-lg font-medium transition-colors text-sm whitespace-nowrap flex-shrink-0 ${
                        getModeState("playlist").loading
                          ? "bg-yellow-600 text-white cursor-wait"
                          : getModeState("playlist").active
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : isTimerRunning || isAnyModeLoading() || isTimerStarting
                              ? "bg-gray-500 cursor-not-allowed text-gray-300"
                              : "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
                      }`}
                    >
                      {getModeState("playlist").loading ? "Opstarten..." : getModeState("playlist").active ? "Stop Test" : "Test"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* YouTube URL input + dice button when youtube mode is selected */}
                  {adBreakMode === "youtube" && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <YouTubeUrlInput
                          youtubeUrl={youtubeUrl}
                          onYoutubeUrlChange={onYoutubeUrlChange}
                        />
                      </div>
                      <button
                        onClick={handleManualModeToggle}
                        disabled={!isModeValid() || isAnyModeLoading() || isTimerRunning || isTimerStarting}
                        className={`mt-7 px-3 py-[10px] rounded-lg font-medium transition-colors text-sm whitespace-nowrap flex-shrink-0 ${
                          getModeState("youtube").loading
                            ? "bg-yellow-600 text-white cursor-wait"
                            : getModeState("youtube").active
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : isTimerRunning || isAnyModeLoading() || isTimerStarting
                                ? "bg-gray-500 cursor-not-allowed text-gray-300"
                                : "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
                        }`}
                      >
                        {getModeState("youtube").loading ? "Opstarten..." : getModeState("youtube").active ? "Stop Test" : "Test"}
                      </button>
                    </div>
                    </div>
                  )}

                  {/* Nonstop mode - Radios configureren button */}
                  {adBreakMode === "nonstop" && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                    <label className="block text-sm font-medium mb-3 text-gray-300">
                      Non stop Radios configureren:
                    </label>
                    <button
                      onClick={() => setShowNonstopSettings(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      Instellingen
                    </button>
                    </div>
                  )}
                  </div>
                  {/* Settings bar */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <AdBreakExpandedSettings
              autoSkipPreroll={autoSkipPreroll}
              onAutoSkipPrerollChange={setAutoSkipPreroll}
              adBreakMinute={adBreakMinute}
              adBreakMinute2={adBreakMinute2}
              adBreakDuration={adBreakDuration}
              adBreakDuration2={adBreakDuration2}
              onMinuteChange={onMinuteChange}
              onMinute2Change={onMinute2Change}
              onDurationChange={onDurationChange}
              onDuration2Change={onDuration2Change}
              isTimerRunning={isTimerRunning}
              isAdBreakActive={isAdBreakActive}
              onStartTimer={handleStartTimer}
              onStopTimer={onStopTimer}
              timerDisabled={
                !isModeValid() ||
                !isRadioSelected() ||
                (audioPlayer && audioPlayer.isTransitioning) ||
                isAnyModeActive() ||
                isAnyModeLoading()
              }
              timerStarting={isTimerStarting}
            />
          </div>
          {/* Nonstop Radio Settings Overlay */}
          <NonstopSettingsOverlay
            isOpen={showNonstopSettings}
            onClose={() => setShowNonstopSettings(false)}
            audioPlayer={audioPlayer}
          />
        </div>
      </div>
      {/* Visualizer Settings Overlay - commented out
      <VisualizerSettings
        isOpen={showVisualizerSettings}
        onClose={() => setShowVisualizerSettings(false)}
        visualizerType={visualizerType}
        onVisualizerTypeChange={onVisualizerTypeChange}
        visualizerBlur={visualizerBlur}
        onVisualizerBlurChange={onVisualizerBlurChange}
      />
      */}
    </div>
  );
};

export default AdBreakSettings;
