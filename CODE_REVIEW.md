# Code Review - Flaws, Improvements, and Security Audit

Based on a full read of every actively used file in the codebase.

---

## Security Issues

### HIGH - XSS via innerHTML in Toast Notifications
`src/utils/toastNotifications.js:64` uses `innerHTML` to render toast messages. If any station name, error message, or user input flows into a toast call, it gets parsed as HTML. Station names come from the Radio-Browser API (external, untrusted data) and are passed to `window.addNotification()` in several places (App.jsx:47, useAdBreak.js:158).

**Fix**: Use `textContent` instead of `innerHTML`, or sanitize the message before insertion.

**Implemented**: Replaced innerHTML template with safe DOM construction using createElement + textContent. All toast content is now built with DOM APIs only.

### HIGH - Developer Dashboard Password Hardcoded in Source
`src/App.jsx:246` - The developer dashboard password is `"xd"`, visible to anyone who opens DevTools or reads the minified bundle. Anyone can access the developer dashboard, set station overrides, clear data, etc.

**Fix**: Remove the password check entirely and gate it behind a URL parameter or localStorage flag that only the developer would know to set. Or use a proper auth mechanism.

**Implemented**: Replaced password prompt with localStorage flag check (`dev_mode === 'true'`). Triple-click only opens dashboard if flag is set.

### MEDIUM - Spotify Client ID Exposed
`src/utils/spotifyUtils.js:21` hardcodes the Spotify client ID `67703322b3fe4c27aa42f10e3d067b84`. For public OAuth clients (SPAs) this is technically expected per the OAuth spec - Spotify's PKCE flow doesn't require a client secret. However, anyone can use this client ID to make API calls that count toward your Spotify app's rate limits. Not exploitable, but worth being aware of.

### MEDIUM - No Input Sanitization on Station Override URLs
The Developer Dashboard allows setting custom URLs for stations (`stationReporting.js:152`). These URLs are later loaded as `audio.src`. While audio elements are limited in what they can do with a URL, a `javascript:` URL or data URI could theoretically cause unexpected behavior in edge cases.

**Fix**: Validate that override URLs start with `http://` or `https://`.

**Implemented**: Added URL protocol validation at the top of `setStationOverride()`. Rejects and warns on non-http(s) URLs.

### MEDIUM - localStorage Has No Size Management
The app writes to ~20+ localStorage keys including cached URLs, station reports, favorites, overrides, and settings. There is no cleanup, quota checking, or error handling for `QuotaExceededError`. If localStorage fills up (typically 5-10MB limit), writes will silently fail.

**Fix**: Add a try/catch wrapper around all localStorage writes (some already have this, many don't). Consider purging old data periodically.

**Implemented**: Added `safePersist()` helper in StateManager.jsx that wraps all 13 localStorage writes with try/catch for QuotaExceededError handling.

### LOW - CORS Proxy Sends User Requests Through Third Parties
`RadioService.js:10` routes failed streams through `corsproxy.io` and `api.allorigins.win`. These third-party services can see which radio streams users are requesting and could inject content.

**Note**: This is a known trade-off for a client-side app without a backend. Documenting it is sufficient. Do nothing here.

---

## Architecture Flaws

### Two Separate Notification Systems
There are two independent notification systems:
1. `NotificationSystem.jsx` - React component, accessed via `window.addNotification()`
2. `toastNotifications.js` - DOM-based, accessed via `toast.success()` etc.

Both render in the bottom-right area and can overlap. Some code uses one, some uses the other. RadioService uses the DOM-based one. App.jsx and hooks use the React one.

**Fix**: Pick one and remove the other. The React-based one is cleaner for a React app. For non-React code (RadioService), dispatch a CustomEvent that the React system listens for.
**Note** I think this is fine for now.. do nothing


### Excessive Window Globals
The app relies on `window.*` for cross-component communication in at least 10 places:
- `window.audioManager`, `window.audioPlayer`, `window.openYouTubePlayer`, `window.closeAllYouTubePlayers`, `window.addNotification`, `window.showNotification`, `window.toast`, `window.AdSkipUtils`, `window._radioAudioElementChanged`, `window._radioCorsEnabled`

This creates invisible dependencies between components, makes the code harder to reason about, and can cause timing issues (what if code runs before the global is set?).

**fix** Use React Context, custom events, or a simple event bus for the few cases where non-React code needs to communicate with React components.
**Note** seems like a hard fix, but might be important, try it. if its best to do this first or as very last, ill leave it up to you..if you changes a LOT to do this, u can pause and ask me test, or you can test every file urself to see if functiaonlty remains the same..

**Implemented**: Created `eventBus.js` with pub/sub pattern and helper functions (`notify`, `openYouTubePlayer`, `closeAllYouTubePlayers`, `signalAudioElementChanged`). Replaced all 60+ `window.addNotification` calls with `notify()` across 9 files. Replaced YouTube player globals in AdBreakController. Replaced `window._radioAudioElementChanged`/`window._radioCorsEnabled` polling with event-driven approach in MusicVisualizerSingle. Removed `window.audioManager`, `window.isInNonstopMode`, `window.onPlaylistStopped`, `window.stopAllManualModes`. Replaced `window.spotifySearchTimeout` with useRef. Remaining window globals are SDK-required callbacks (YouTube/Spotify) and debug utilities (intentionally kept for console access).

### Singleton AudioManager Has Mixed Access Patterns
AudioManager is accessed three different ways:
1. `getAudioManager()` factory function (useAudio.js)
2. `window.audioManager` global (MusicVisualizerSingle, debugging)
3. Direct reference via `audioManagerRef.current` (useAudio.js)

**Fix**: Use `getAudioManager()` consistently everywhere. Remove the window global or make it debug-only.

### AdSkipUtils Is an Oversized Static Class
`adSkipUtils.js` is 812 lines with a massive hardcoded database of ad-free stream URLs for Dutch stations, URL scoring logic, pre-roll skip UI creation (DOM manipulation in a utility file), volume restoration, and stream readiness detection. It mixes concerns: data, UI, and audio manipulation.

**Fix**: Split into: (1) a data file with ad-free URL mappings, (2) a small pre-roll skip function, (3) move the skip button UI into a React component.

---

## Performance Issues

### TensorFlow.js Is a Massive Unused Dependency
`package.json` includes `@tensorflow/tfjs` (~2MB+ minified). It's only used in `musicDetection.js` which is an experimental feature imported by `AdBreakSettings.jsx`. This adds significant bundle size for a feature that isn't core functionality.

**Fix**: Remove `@tensorflow/tfjs` from dependencies. If music detection is needed in the future, lazy-load it with dynamic `import()`.

**Implemented**: Removed @tensorflow/tfjs (54 packages removed). Also deleted musicDetection.js and removed its unused import from AdBreakSettings.jsx.

### VolumeNormalizer Monitors Continuously at 100ms
`VolumeNormalizer.js:82` runs a `setInterval` every 100ms to check audio levels, even when nothing is playing. This creates unnecessary CPU work and Web Audio API overhead.

**Fix**: Only monitor when audio is actively playing. Stop monitoring on pause/stop. Could also reduce frequency to 250-500ms.

**Implemented**: Split startMonitoring into resumeMonitoring/pauseMonitoring. AudioManager now auto-resumes on play and pauses on idle/paused. Interval increased from 100ms to 250ms.

### 806 Stations Loaded Upfront
`allRadioStations.js` loads all 806 stations into memory at import time. The data file is large. Most users only interact with the ~22 popular stations.

**Fix**: make this a bit smarter and efficient somehow, maybe only on opening ALle stations? we already default to Populair like u said. but also when using search of course.

**Implemented**: RadioGrid now only computes the popular stations list (~22) on initial render. The full 806-station list is only built when the user switches to a non-popular tab or uses search.

### No Code Splitting or Lazy Loading
All components are eagerly imported in App.jsx, including DeveloperDashboard (which 99% of users never see), ResizableYouTubePlayer (only needed during YouTube ad breaks), and MusicVisualizerSingle.

**Fix**: Use `React.lazy()` for DeveloperDashboard, ResizableYouTubePlayer, and MusicVisualizerSingle.

**Implemented**: Converted DeveloperDashboard, ResizableYouTubePlayer, and MusicVisualizerSingle to React.lazy() with Suspense wrappers in App.jsx. These chunks only load when the components are actually needed.

---

## Code Quality Issues

### Legacy Files Still in Codebase
These files are unused but still present, adding confusion:
- `src/utils/audioOnlyPlayer.js` - incomplete stub
- `src/utils/popupYouTubePlayer.js` - replaced by ResizableYouTubePlayer
- `src/components/FloatingYouTubePlayer.jsx` - replaced by ResizableYouTubePlayer
- `src/App.css` - default Vite template, not imported
- `old-version/*.bak` files (6 files)

**Fix**: Delete all legacy files. I dont care about those.

**Implemented**: Deleted all legacy files: audioOnlyPlayer.js, popupYouTubePlayer.js, FloatingYouTubePlayer.jsx, App.css, musicDetection.js, and all 6 old-version/*.bak files.

### Inconsistent Error Handling
Some places swallow errors silently (`catch {}` in RadioService.js:95,415,436), some show Dutch toasts, some set state.error, some console.error only. There's no unified error handling strategy.

Examples:
- RadioService `stop()` swallows all errors
- SpotifyService `pause()` swallows errors
- useAudio `playRadio()` sets state.error
- App.jsx error useEffect shows Dutch toast AND clears error after 5 seconds

**Fix**: Define a clear error handling pattern: (1) operational errors go to toast notifications, (2) always log to console, (3) never swallow errors silently without at least a console.warn.
Imporve the error handeling and logging but make sure it does not spam too hard for no good reason..

**Implemented**: Replaced empty `catch {}` blocks in RadioService.js (stop, pause) with `console.warn` logging. All catch blocks now at minimum log to console without spamming user-facing notifications.

### Mixed Language in User-Facing Code
Most user-facing text is Dutch, but some English leaks through:
- Emergency volume notification in useAudio.js:67: "Volume automatically reduced for safety"
- Some error messages in AdBreakController fall back to English
- Console logs are English (fine, but inconsistent with the Dutch toasts)

**Fix**: Audit all `window.addNotification()` and `toast.*()` calls for English text.

**Implemented**: Translated English notifications to Dutch in useAudio.js (emergency volume, playback error) and spotifyUtils.js (slow loading, playback error). DeveloperDashboard strings left English (dev-only).

### Large Components
- `AdBreakSettings.jsx` - handles too many concerns (timing, mode selection, playlist config, YouTube config, visualizer settings, nonstop management)
**Fix** split this into 2 or 3 files at most, and/or move parts to other files where it belongs more. make sure functionaltiy remains intact!

**Implemented**: Extracted two new components: NonstopSettingsOverlay.jsx (nonstop station management modal) and AdBreakExpandedSettings.jsx (expandable settings panel with timing, toggles, day/time config). Removed dead music detection code (getStatusDisplay, detection state). AdBreakSettings.jsx now ~840→~830 lines focused on mode selection, manual mode control, and timer logic.

### Redundant localStorage Persistence
Ad break minute/duration settings are persisted in TWO places:
1. `StateManager.jsx:313-327` - useEffect watchers for adBreakMinute, adBreakMinute2, etc.
2. `useAdBreak.js:347-361` - separate useEffect watchers for the exact same keys

Both write to the same localStorage keys. This is harmless but wasteful and confusing.

**Fix**: Remove the persistence from `useAdBreak.js` since `StateManager.jsx` already handles it.

**Implemented**: Removed 4 redundant localStorage useEffects from useAdBreak.js (lines 346-361). StateManager handles all persistence.

---

## Missing Features / Gaps

### No Offline Handling
The app has no service worker or offline fallback. If the user loses internet, radio streams fail silently. There's no "you're offline" indicator.

### No Error Recovery for Spotify Token Expiry
If the Spotify access token expires during playback, the app will fail to play. There's token storage but no automatic refresh mechanism visible in `SpotifyService.js` (the refresh logic is in `spotifyUtils.js` but it's not wired into the playback service).

### No Rate Limiting on Station Reports
Users can spam the "Report Station" button repeatedly. Each click creates a new report entry in localStorage and optionally Firebase. No debounce or cooldown.

### Ad Break Timer Doesn't Survive Page Reload
If the user refreshes the page while the ad break timer is running, the timer state is lost. `isTimerRunning` is not persisted to localStorage.

---

