// components/AdBreakSettings.jsx - Ad-break configuration panel: the switch
// method (YouTube, Spotify, non-stop radio), its settings, a "Test" button per
// method, and the timer settings bar.

import React, { useEffect, useRef, useState } from "react";
import PlaylistProviderSelector from "./PlaylistProviderSelector";
import YouTubeUrlInput from "./YouTubeUrlInput";
import NonstopSettingsOverlay from "./NonstopSettingsOverlay";
import AdBreakExpandedSettings from "./AdBreakExpandedSettings";
import { isSpotifyAuthenticated } from "../utils/spotifyUtils";
import { extractPlaylistId, extractYouTubeVideoId } from "../utils/youtubeUtils.js";
import { isPrerollSkipEnabled, setPrerollSkipEnabled } from "../utils/preroll.js";
import eventBus, { notify, openYouTubePlayer, closeAllYouTubePlayers } from "../utils/eventBus";

const MODE_NAMES = { playlist: "Spotify", youtube: "YouTube" };
const IDLE = { active: false, loading: false };

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
  onEndAdBreak,
  isAdBreakActive,
  playlistUrl,
  playlistInfo,
  audioPlayer,
  adBreakMode,
  onAdBreakModeChange,
  onPlaylistUrlChange,
  onPlaylistInfoChange,
  playlistShuffle,
  youtubeUrl,
  onYoutubeUrlChange,
}) => {
  const [isTimerStarting, setIsTimerStarting] = useState(false);
  const [autoSkipPreroll, setAutoSkipPreroll] = useState(isPrerollSkipEnabled);
  const [showNonstopSettings, setShowNonstopSettings] = useState(false);
  // State of the manual "Test" run per method (non-stop radio has no test run).
  const [testState, setTestState] = useState({ playlist: IDLE, youtube: IDLE });

  const getModeState = (mode) => testState[mode] ?? IDLE;
  const setModeState = (mode, value) => setTestState((prev) => ({ ...prev, [mode]: value }));
  const isAnyModeActive = () => Object.values(testState).some((m) => m.active);
  const isAnyModeLoading = () => Object.values(testState).some((m) => m.loading);
  const getActiveMode = () => Object.keys(testState).find((mode) => testState[mode].active) ?? null;

  const isModeValid = () => (adBreakMode === "playlist" ? Boolean(playlistUrl && playlistInfo?.isValid) : true);
  const isRadioSelected = () => Boolean(audioPlayer?.currentStation);

  useEffect(() => {
    setPrerollSkipEnabled(autoSkipPreroll);
  }, [autoSkipPreroll]);

  const parseYouTubeUrl = (url) => ({
    videoId: extractYouTubeVideoId(url) || undefined,
    playlistId: extractPlaylistId(url) || undefined,
  });

  // While a YouTube test runs, a new URL reopens the player with it.
  useEffect(() => {
    if (!youtubeUrl || !testState.youtube.active) return;
    const { videoId, playlistId } = parseYouTubeUrl(youtubeUrl);
    if (!videoId && !playlistId) return;
    closeAllYouTubePlayers();
    const timer = setTimeout(() => {
      openYouTubePlayer({ videoId, playlistId, title: "YouTube", isAutomatic: false, autoCloseSeconds: null });
    }, 100);
    return () => clearTimeout(timer);
    // Only react to URL changes, not to the test starting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeUrl]);

  // The user closed the YouTube player themselves: end the test run, and if
  // it was playing an ad break, go back to the radio.
  const latest = useRef({});
  latest.current = { isAdBreakActive, adBreakMode, onEndAdBreak, onStopTimer };
  useEffect(() => {
    return eventBus.on("playlist:stopped", async (type) => {
      if (type !== "youtube") return;
      setModeState("youtube", IDLE);
      const { isAdBreakActive: active, adBreakMode: mode, onEndAdBreak: end, onStopTimer: stop } = latest.current;
      if (active && mode === "youtube") {
        await end?.();
        stop?.();
      }
    });
  }, []);

  const handleManualModeToggle = async () => {
    const mode = adBreakMode;
    const current = getModeState(mode);
    if (current.loading) return;
    if (current.active) {
      stopMode(mode);
      return;
    }

    setModeState(mode, { active: false, loading: true });
    if (isTimerRunning) {
      onStopTimer();
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    const other = getActiveMode();
    if (other && other !== mode) stopMode(other);
    await startMode(mode);
  };

  const startMode = async (mode) => {
    try {
      if (mode === "playlist") {
        if (!playlistUrl) throw new Error("Geen Spotify playlist ingesteld");
        await audioPlayer.playSpotify(playlistUrl, { shuffle: playlistShuffle });
      } else {
        if (!youtubeUrl) throw new Error("Geen YouTube URL ingesteld");
        const { videoId, playlistId } = parseYouTubeUrl(youtubeUrl);
        if (!videoId && !playlistId) throw new Error("Ongeldige YouTube URL");
        openYouTubePlayer({ videoId, playlistId, title: "YouTube", isAutomatic: false, autoCloseSeconds: null });
      }
      setModeState(mode, { active: true, loading: false });
      notify(`${MODE_NAMES[mode]} Test Gestart`, "success", 2000);
    } catch (error) {
      setModeState(mode, IDLE);
      notify(`Kan ${MODE_NAMES[mode]} test niet starten: ${error.message}`, "error", 3000);
    }
  };

  const stopMode = (mode) => {
    closeAllYouTubePlayers();
    if (mode === "playlist") audioPlayer?.stop?.();
    setModeState(mode, IDLE);
    notify(`${MODE_NAMES[mode]} Test Gestopt`, "info", 2000);
  };

  const handleStartTimer = async () => {
    if (isTimerStarting || isTimerRunning) return;
    // Disable the test buttons right away, before the timer state arrives.
    setIsTimerStarting(true);
    try {
      await onStartTimer();
    } finally {
      setTimeout(() => setIsTimerStarting(false), 2000);
    }
  };

  useEffect(() => {
    if (isTimerRunning) setIsTimerStarting(false);
  }, [isTimerRunning]);

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-4">
          {/* Switch method selector */}
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
    </div>
  );
};

export default AdBreakSettings;
