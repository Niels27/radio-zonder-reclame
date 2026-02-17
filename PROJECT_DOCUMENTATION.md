# Radio Zonder Reclame - Project Documentation

## What This Project Is

A Dutch radio player web application that solves one problem: listening to radio without ad interruptions. Users select a radio station, configure two ad break times per hour (e.g., minute 29 and minute 59), and the app automatically switches to an alternative audio source (Spotify playlist, nonstop radio station, or YouTube video/playlist) during those ad breaks. When the ad break duration ends, it switches back to the original radio station.

The app also includes quality-of-life features: music visualizer, pre-roll ad skipping for commercial stations, station favorites, working URL caching, and a developer dashboard for station management.

**Live URL**: https://niels27.github.io/radio-zonder-reclame/
**Repository**: https://github.com/Niels27/radio-zonder-reclame

---

## Tech Stack

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 3
- **State Management**: React Context + useReducer (no external state library)
- **Audio**: HTML5 Audio API, Spotify Web Playback SDK, YouTube iframe API
- **Icons**: Heroicons, Lucide React, React Icons
- **Backend**: None (fully client-side, Firebase for optional station reporting)
- **Deployment**: GitHub Pages (base path: `/radio-zonder-reclame/`)
- **Dev Server**: HTTPS on 127.0.0.1:4178 (required for Spotify SDK)

---

## Architecture Overview

```
main.jsx
  -> StateProvider (React Context wrapper)
    -> App.jsx (main orchestrator)
      -> useAudio() hook -> AudioManager (singleton) -> RadioSource / SpotifySource / YouTubeSource
      -> useAdBreak() hook -> AdBreakController
      -> useFavorites() hook
      -> UI Components (RadioGrid, AudioPlayer, AdBreakSettings, etc.)
```

### Data Flow

1. **State**: All application state lives in `StateManager.jsx` via React Context + useReducer. Components read state via `useAppState()` and dispatch actions via `useActions()`.

2. **Audio**: `useAudio` hook wraps the `AudioManager` singleton. AudioManager owns three source instances (radio, spotify, youtube) and ensures only one plays at a time. It handles transitions, crossfading, and volume normalization.

3. **Ad Breaks**: `useAdBreak` hook runs a 1-second interval timer. When the clock hits a configured minute, it calls `AdBreakController.start()` which saves the current station, switches to the selected alternative mode, starts a countdown, and auto-restores the original station when time is up.

4. **Persistence**: Settings are persisted to localStorage individually via useEffect watchers in StateManager and useAdBreak. Working radio URLs are cached in localStorage with 7-day expiry.

---

## File-by-File Reference

### Entry Points

| File | Purpose |
|------|---------|
| `index.html` | HTML shell. Preconnects to Spotify/YouTube/Google APIs. Loads `src/main.jsx`. |
| `src/main.jsx` | React entry point. Wraps App in StrictMode and StateProvider. |
| `src/App.jsx` | Main component. Initializes hooks, wires up all UI components, handles global effects (error toasts, visualizer scroll, Spotify ready state). |

### Core Layer (`src/core/`)

| File | Purpose |
|------|---------|
| `StateManager.jsx` | Central state management. Defines initial state shape, reducer, action types, StateProvider component, and `useAppState()`/`useActions()` hooks. Persists ~15 settings to localStorage. Key state: `currentStation`, `isPlaying`, `isLoading`, `volume`, `audioSource`, `isAdBreakActive`, `adBreakMode`, `adBreakMinute/2`, `adBreakDuration/2`, `connectionStatus`, `isBuffering`. |
| `AudioManager.js` | Singleton audio controller. Owns instances of RadioSource, SpotifySource, YouTubeSource. Key method: `play(sourceType, config)` - stops all sources, plays new one. Handles crossfading between different source types (but not same-type switches to avoid Web Audio API conflicts). Force-cancels transitions for radio-to-radio switches. |
| `AdBreakController.js` | Manages ad break lifecycle. `start(mode, duration, config)` saves current station, switches to alternative, starts countdown timer, schedules auto-end. `end()` restores saved station. `cancel()` stops without restoring. Three modes: 'playlist' (Spotify), 'nonstop' (random nonstop radio), 'youtube' (opens YouTube overlay). |
| `VolumeNormalizer.js` | Volume safety system. Applies per-source multipliers (radio: 1.0, spotify: 0.9, youtube: 0.85). Monitors audio levels via Web Audio API analyser node. Triggers emergency volume reduction if levels exceed 0.95 threshold. |
| `InterruptionHandler.js` | Tracks automated actions (ad breaks, scheduled plays). When user manually changes station during an automated action, marks the action as interrupted. Prevents automated systems from overriding user intent. |

### Hooks (`src/hooks/`)

| File | Purpose |
|------|---------|
| `useAudio.js` | React wrapper for AudioManager. Provides `playRadio()`, `playSpotify()`, `playYouTube()`, `togglePlayPause()`, `nextTrack()`, `previousTrack()`, `setVolume()`, `setShuffle()`. Uses `playAttemptRef` counter for instant station cancellation - clicking a new station while loading immediately cancels the previous one. Sets up RadioSource callbacks for connection status and buffering state. |
| `useAdBreak.js` | Ad break timer logic. Runs 1-second interval to calculate time until next break. When countdown hits 0, calls `startAdBreak()`. Supports two break times per hour with independent durations. Exposes `startTimer()`, `stopTimer()`, `manualAdBreak()`, `cancelAdBreak()`, `skipToZero()`, `endAdBreak()`, `extendAdBreak()`. Persists minute/duration settings to localStorage. |
| `useFavorites.js` | Station favorites with localStorage persistence. `toggleFavorite(stationName)` adds/removes. Waits for initialization before saving to prevent overwriting stored data with empty array on mount. |

### Services (`src/services/`)

| File | Purpose |
|------|---------|
| `RadioService.js` | HTML5 Audio-based radio stream player. Key feature: multi-URL fallback with two-pass CORS strategy. Pass 1 tries all URLs with CORS enabled (needed for visualizer). Pass 2 tries without CORS (audio works but no visualizer). Uses CORS proxies (corsproxy.io, allorigins.win) for HTTP-only streams. Caches working URLs in localStorage (7-day expiry). Has cancel checker (200ms interval) that aborts URL attempts when user switches stations. Emits `onStatusUpdate` (Dutch status text like "Stream 3/7 proberen...") and `onBufferingChange` callbacks. Includes pre-roll ad skip via AdSkipUtils. |
| `SpotifyService.js` | Spotify Web Playback SDK integration. Loads SDK script, creates player instance, handles OAuth token. Provides `play(config)`, `pause()`, `resume()`, `nextTrack()`, `previousTrack()`, `setShuffle()`. Requires Spotify Premium account and valid access token in localStorage. |
| `YouTubeService.js` | YouTube iframe API integration. Creates hidden iframe player for YouTube videos/playlists. Used as audio source by AudioManager for YouTube ad break mode. Separate from the visible ResizableYouTubePlayer overlay component. |

### Components (`src/components/`)

| File | Purpose | Used By |
|------|---------|---------|
| `RadioGrid.jsx` | Main station grid. Shows popular stations at top, then all categories. Station cards with logos, names, descriptions. Supports favorites (star icon), search/filter, and click-to-play. | App.jsx |
| `AudioPlayer.jsx` | Fixed footer player bar. Shows current station, play/pause, volume slider, track controls (next/prev/shuffle for playlists), ad break status (countdown, mode indicator), cancel/skip/end ad break buttons. | App.jsx |
| `AdBreakSettings.jsx` | Collapsible settings panel. Contains: two time+duration sliders for ad breaks, mode selector (Spotify/Nonstop/YouTube), playlist URL input, YouTube URL input, visualizer settings, fade toggle. Start/stop timer button and manual test button. | App.jsx |
| `PlaylistProviderSelector.jsx` | Spotify playlist configuration within AdBreakSettings. Handles Spotify authentication flow, playlist URL validation, shuffle toggle. Polls `window.audioPlayer.spotifyPlayerReady` to show initialization status. | AdBreakSettings.jsx |
| `YouTubeUrlInput.jsx` | YouTube URL input field within AdBreakSettings for YouTube ad break mode. Includes dice button for random playlist from predefined list. | AdBreakSettings.jsx |
| `MusicVisualizerSingle.jsx` | Audio visualizer using Web Audio API + canvas. Supports multiple visualization types (bars, wave, etc.). Connects to radio audio element. Renders in header when visible, moves to footer on scroll. Requires CORS-enabled audio stream. | App.jsx |
| `NotificationSystem.jsx` | React-based notification container. Exposes `window.showNotification()`. Used via `window.addNotification()` bridge in App.jsx. | App.jsx |
| `ErrorBoundary.jsx` | React error boundary. Catches render errors and shows fallback UI instead of crashing the whole app. | App.jsx |
| `DeveloperDashboard.jsx` | Hidden dev panel (triple-click top-right corner, password: "xd"). Shows station reports, overrides, stream tester, Firebase status, debug tools. | App.jsx |
| `overlays/ResizableYouTubePlayer.jsx` | Draggable, resizable YouTube player overlay. Used during YouTube ad break mode and for manual YouTube players. Renders YouTube iframe with volume control and auto-close timer. Multiple instances can exist simultaneously. | App.jsx |
| `LoadingIndicator.jsx` | Small loading spinner component. | App.jsx |
| `ReportStationButton.jsx` | Button to report a broken station. Submits report to Firebase/localStorage via StationReportingService. | RadioGrid.jsx |
| `TimeRangeSlider.jsx` | Custom slider component for minute/duration selection in ad break settings. | AdBreakSettings.jsx |
| `PlaylistSuggestions.jsx` | Predefined playlist suggestions dropdown. | AdBreakSettings.jsx |
| `VisualizerSettings.jsx` | Visualizer type and blur controls. | AdBreakSettings.jsx |
| `FloatingYouTubePlayer.jsx` | **LEGACY** - Older YouTube player component, superseded by ResizableYouTubePlayer. May still be referenced but not actively used in App.jsx. |
| `UserGuide.jsx` | Help/guide overlay component. | AdBreakSettings.jsx |

### Data (`src/data/`)

| File | Purpose |
|------|---------|
| `allRadioStations.js` | 806 Dutch radio stations scraped from Radio-Browser API. Organized by categories (public, commercial, regional, realnonstop, etc.). Each station has: name, url, logo, description, category. Exports `allRadioStations` object, `getPopularStations()`, `isPopularStation()`, `getAllStations()`. |
| `fallbackStations.js` | Hand-curated station definitions with multiple fallback URLs. Overrides the single URL from allRadioStations with ordered URL lists for reliable playback. Exports `fallbackStations` object and `getStationDefinition(name)`. |
| `failedStations.js` | Static list of known broken station names used to filter them from the grid. |

### Utilities (`src/utils/`)

| File | Purpose | Actively Used |
|------|---------|---------------|
| `toastNotifications.js` | DOM-based toast notification system (not React). Singleton `ToastManager` creates/animates toast elements. Container positioned at `bottom: 175px`. Exported as `toast.success()`, `toast.error()`, etc. Also exposed as `window.toast`. | Yes - by RadioService, AdSkipUtils |
| `adSkipUtils.js` | Pre-roll ad detection and skipping for commercial radio stations. Maintains database of ad-free stream URLs for Dutch stations (StreamTheWorld SC streams, Triple-IT CDN, NPO direct). `shouldOfferPrerollSkip()` checks if station is commercial. `skipPrerollSilently()` mutes audio, waits briefly, skips 17 seconds, restores volume with cubic easing. `getAdFreeScore()` ranks URLs by ad-free likelihood. | Yes - by RadioService |
| `nonstopUtils.js` | Manages pool of nonstop (ad-free) radio stations for the "nonstop" ad break mode. Combines default stations from `allRadioStations.realnonstop` with user-added custom stations. Shuffles on init. Tracks failed stations to avoid retrying. | Yes - by useAdBreak |
| `lofiUtils.js` | YouTube video ID extraction and lofi stream definitions. `extractYouTubeVideoId(url)` is actively used. The lofi stream list is partially legacy (renamed to YouTube mode). | Yes - `extractYouTubeVideoId` used by useAdBreak |
| `youtubeUtils.js` | YouTube playlist URL parsing and validation. `extractPlaylistId(url)` extracts playlist ID from various YouTube URL formats. Includes production logging controls and ad-tracker URL filtering. | Yes - by useAdBreak, PlaylistProviderSelector |
| `spotifyUtils.js` | Spotify OAuth flow and Web API utilities. Handles authentication popup, token exchange, token refresh, playlist validation. Contains Spotify client ID. | Yes - by PlaylistProviderSelector |
| `predefinedPlaylists.js` | Small list of predefined YouTube and Spotify playlists for the "random playlist" dice button. | Yes - by YouTubeUrlInput, youtubeUtils |
| `firebase.js` | Firebase initialization and Firestore API wrapper. Currently in demo mode (placeholder API keys). `stationReportsAPI` provides `submitReport()`, `getStationReports()`, `getAllReports()`. Falls back to localStorage when Firebase not configured. | Yes - by stationReporting.js |
| `stationReporting.js` | Station failure reporting service. Tracks reported broken stations, developer URL overrides, dashboard statistics. Sends reports to Firebase (or localStorage in demo mode). Used by ReportStationButton and DeveloperDashboard. | Yes |
| `logger.js` | Production logging control. Disables console output on production domains (github.io). Provides `window.enableLogging()` for debugging in production. YouTube-specific spam prevention. | Yes - initialized in main.jsx |
| `logoFallback.js` | Fallback logo URLs when station logos fail to load. | Yes - by RadioGrid |
| `logoManager.js` | Logo URL resolution and caching. | Yes - by RadioGrid |
| `radioStreamTester.js` | Stream URL tester for DeveloperDashboard. Tests if a URL can play audio. | Yes - by DeveloperDashboard |
| `stationOverrides.js` | Applies developer URL overrides from localStorage to station data. | Yes - by allRadioStations |
| `musicDetection.js` | Experimental music vs speech detection using audio analysis. | Partially - may be referenced but not core |
| `audioOnlyPlayer.js` | Experimental audio-only YouTube player (extracts audio streams). | Legacy - not used in current flow |
| `popupYouTubePlayer.js` | Legacy popup window YouTube player. Replaced by ResizableYouTubePlayer component. | Legacy |
| `streamProxy.js` | CORS proxy URL construction helpers. | Partially - RadioService has its own proxy logic |
| `youtubePlaylistDefaults.js` | Default YouTube playlist configurations. | Partially |

### Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Vite build config. Base path `/radio-zonder-reclame/` for GitHub Pages. HTTPS dev server on 127.0.0.1:4178 (required for Spotify SDK). Terser minification, no source maps in production. |
| `package.json` | Dependencies: react 19, firebase, heroicons, lucide-react, react-icons, tensorflow.js (unused?). Dev: vite, tailwindcss, eslint. |
| `tailwind.config.js` | Tailwind configuration (standard). |
| `postcss.config.js` | PostCSS with Tailwind and autoprefixer. |

### CSS Files

| File | Purpose |
|------|---------|
| `src/index.css` | Tailwind directives + custom component classes (radio-card, station-name, station-description, scroll animations, banner animations, visualizer backdrop blur). Main stylesheet. |
| `src/App.css` | Default Vite template CSS. Mostly unused (only `#root` max-width). |

---

## Key Patterns and Conventions

### Instant Station Cancellation
When a user clicks a new station while another is loading, three mechanisms work together:
1. `useAudio.js` increments `playAttemptRef` - stale async completions are ignored
2. `RadioService._tryUrl()` runs a 200ms cancel checker interval that rejects with 'Cancelled' when `_playAttemptId` changes
3. `AudioManager.play()` force-stops the current source for same-type transitions instead of waiting

### Radio URL Resolution Order
RadioService builds a URL list for each station:
1. Check cached working URL (localStorage, 7-day expiry) - try first with 8s timeout
2. Curated URLs from `fallbackStations.js`
3. Station's own `urls[]` array from allRadioStations
4. Station's primary `url`
5. Legacy `fallbackUrl`
6. HTTPS upgrades of HTTP URLs
7. CORS proxy wrapped versions of HTTP URLs
8. If all CORS attempts fail, retry everything without CORS (loses visualizer)

### Ad Break Timer System
- Two configurable break times per hour (default: minute 29 and minute 59)
- Each has its own duration (default: 6 min and 9 min)
- Timer runs a 1-second interval checking current time against break minutes
- When time reaches a break minute, `startAdBreak()` fires
- `AdBreakController` saves current station, switches to alternative, starts countdown
- When countdown ends, automatically calls `end()` to restore the saved station

### Three Ad Break Modes
1. **Spotify (playlist)**: Plays a Spotify playlist via Web Playback SDK. Requires Spotify Premium + OAuth authentication.
2. **Nonstop Radio**: Switches to a random nonstop/ad-free radio station from the `realnonstop` category.
3. **YouTube**: Opens a ResizableYouTubePlayer overlay with the configured YouTube URL (default: Lofi Girl live stream).

### Volume System
- User sets volume 0.0-1.0 via slider
- VolumeNormalizer applies per-source multipliers (radio 1.0, spotify 0.9, youtube 0.85)
- Safety ceiling at 0.9
- Emergency reduction to 0.3 if peak audio levels exceed 0.95

### Toast Notifications
Two notification systems exist:
1. `NotificationSystem.jsx` - React component, accessed via `window.addNotification(message, type, duration)`
2. `toastNotifications.js` - DOM-based, accessed via `toast.success()` etc. Used by non-React code (RadioService, AdSkipUtils)

Both display in bottom-right. The DOM-based system container is at `bottom: 175px`.

### State Persistence (localStorage keys)
| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `volume` | float | 0.5 | Audio volume |
| `adbreak_mode` | string | 'playlist' | Ad break mode |
| `adbreak_minute` | int | 29 | First break minute |
| `adbreak_minute2` | int | 59 | Second break minute |
| `adbreak_duration` | int | 6 | First break duration (minutes) |
| `adbreak_duration2` | int | 9 | Second break duration (minutes) |
| `youtube_url` | string | Lofi Girl URL | YouTube mode URL |
| `playlist_provider` | string | 'spotify' | Playlist provider |
| `visualizer_enabled` | bool | true | Show visualizer |
| `visualizer_type` | string | 'bars' | Visualizer style |
| `visualizer_blur` | float | 2 | Visualizer blur amount |
| `fade_audio_streams` | bool | false | Enable crossfade between sources |
| `use_community_timings` | bool | true | Use community-reported ad timings |
| `radio_working_urls` | JSON | {} | Cached working URLs per station (7-day expiry) |
| `radioFavorites` | JSON | [] | Array of favorited station names |
| `lastPlayedStation` | JSON | null | Last played station object |
| `spotify_access_token` | string | null | Spotify OAuth token |
| `auto_skip_preroll` | bool | false | Auto-skip pre-roll ads |
| `custom_nonstop_stations` | JSON | [] | User-added nonstop stations |
| `radio_station_reports` | JSON | {} | Station failure reports |
| `radio_station_overrides` | JSON | {} | Developer station URL overrides |

### Global Window Properties
The app exposes several functions/objects on `window` for cross-component communication:
- `window.audioManager` - AudioManager singleton instance
- `window.audioPlayer.spotifyPlayerReady` - getter that returns live Spotify ready state
- `window.audioPlayer.manualInitializeSpotifyPlayer()` - manual Spotify init
- `window.openYouTubePlayer(config)` - opens a YouTube overlay
- `window.closeAllYouTubePlayers()` - closes all YouTube overlays
- `window.addNotification(message, type, duration)` - show notification
- `window.toast` - DOM-based toast notification API
- `window.AdSkipUtils` - ad skip utilities
- `window.enableLogging()` / `window.disableLogging()` - production log control

---

## Legacy / Unused Files

These files exist but are not part of the current active flow:

- `src/utils/audioOnlyPlayer.js` - Experimental YouTube audio-only extraction, never integrated
- `src/utils/popupYouTubePlayer.js` - Old popup-window YouTube player, replaced by ResizableYouTubePlayer
- `src/components/FloatingYouTubePlayer.jsx` - Older YouTube overlay, replaced by ResizableYouTubePlayer
- `src/App.css` - Default Vite template CSS, mostly unused
- `@tensorflow/tfjs` in package.json - Dependency exists but usage is minimal/experimental (musicDetection.js)

---

## Development Notes

### Running Locally
```bash
npm install
npm run dev
# Opens https://127.0.0.1:4178/radio-zonder-reclame/
```
HTTPS is required because Spotify Web Playback SDK only works on secure origins. Local SSL certs (`127.0.0.1-key.pem`, `127.0.0.1.pem`) must exist in project root.

### Building for Production
```bash
npm run build
# Output in dist/ directory
# Deploy dist/ to GitHub Pages at /radio-zonder-reclame/ path
```

### Spotify Setup
1. Create app at https://developer.spotify.com/dashboard
2. Set redirect URI to `https://127.0.0.1:4178/radio-zonder-reclame/callback.html` (dev) or `https://niels27.github.io/radio-zonder-reclame/callback.html` (prod)
3. Client ID is hardcoded in `src/utils/spotifyUtils.js`
4. Requires Spotify Premium account for Web Playback SDK

### Firebase Setup
Currently in demo mode (placeholder API keys in `src/utils/firebase.js`). Station reports save to localStorage only. To enable real Firebase:
1. Replace placeholder config in `firebase.js`
2. Set up Firestore with `station_reports` collection
3. The app auto-detects real config and switches from demo mode

### Adding/Fixing Radio Stations
1. Station data comes from `src/data/allRadioStations.js` (806 stations, scraped from Radio-Browser API)
2. To override URLs for a specific station, add/edit entry in `src/data/fallbackStations.js`
3. Working URLs are cached in localStorage - clear `radio_working_urls` to force re-discovery
4. Developer can also set runtime overrides via the Developer Dashboard (triple-click top-right, password: "xd")

### UI Language
All user-facing text is in Dutch. Error messages, notifications, labels, and status text are all Dutch. Code comments and console logs are in English.
