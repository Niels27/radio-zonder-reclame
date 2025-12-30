# Architecture Documentation

## System Overview

The application uses a layered architecture with strict separation of concerns:

```
┌─────────────────────────────────────────────┐
│           React Components (UI)             │
│  RadioGrid, AudioPlayer, AdBreakSettings    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Custom Hooks (React Bridge)         │
│        useAudio, useAdBreak, etc.           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Core Controllers (Logic)            │
│   AudioManager, AdBreakController, etc.     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Services (External APIs)           │
│  RadioService, SpotifyService, YouTube...   │
└─────────────────────────────────────────────┘
```

## Core Components

### 1. StateManager (React Context)

**Purpose:** Single source of truth for all application state

**Location:** `src/core/StateManager.jsx`

**Responsibilities:**
- Centralized state with React Context API
- Automatic localStorage persistence
- Action creators for state modifications
- Provides `useAppState()` and `useActions()` hooks

**State Shape:**
```javascript
{
  // Audio state
  isPlaying, isPaused, isLoading,
  currentStation, audioSource, volume,
  fadeAudioStreams,

  // Ad break state
  adBreakMode, timerRunning, timeLeft,
  adBreakActive,

  // Playlist state
  playlistProvider, currentPlaylistUrl,

  // UI state
  showVisualizer, visualizerType,
  autoCloseOverlays,

  // Settings
  adBreakDuration, adBreakSettings
}
```

### 2. AudioManager

**Purpose:** Unified controller for all audio sources

**Location:** `src/core/AudioManager.js`

**Key Features:**
- **Strict single-audio enforcement** - Only 1 source plays at once
- **Crossfade support** - Smooth transitions when enabled
- **Volume normalization** - Per-source multipliers
- **Emergency protection** - Automatic volume reduction on spikes

**API:**
```javascript
const audioManager = getAudioManager();

// Play audio
await audioManager.play('radio', { station });
await audioManager.play('spotify', { playlist });
await audioManager.play('youtube', { videoId });

// Control playback
await audioManager.pause();
await audioManager.resume();
await audioManager.stopCurrent();
await audioManager.stopAll(); // Force stop everything

// Volume
audioManager.setVolume(0.5);
audioManager.setFadeEnabled(true);

// State
audioManager.getState(); // 'idle' | 'loading' | 'playing' | 'paused'
```

**Audio Source Flow:**
```
User Action → AudioManager.play()
              ↓
         stopAll() - Force stop all sources
              ↓
         Fade check - Crossfade or instant?
              ↓
         Service.play() - Start new source
              ↓
         syncVolume() - Apply normalized volume
```

### 3. VolumeNormalizer

**Purpose:** Smart volume control with safety protection

**Location:** `src/core/VolumeNormalizer.js`

**Features:**
- Per-source normalization (Radio: 100%, Spotify: 90%, YouTube: 85%)
- Emergency volume reduction on dangerous spikes
- Real-time audio monitoring

**Volume Flow:**
```
User sets volume (0-100%) → VolumeNormalizer
                              ↓
                     Per-source multiplier applied
                              ↓
                     Safety ceiling check (max 95%)
                              ↓
                     Emergency protection active?
                              ↓
                     Final volume to audio element
```

### 4. InterruptionHandler

**Purpose:** Handle user manual actions during automation

**Location:** `src/core/InterruptionHandler.js`

**Concept:** User actions "finish" automated actions
- Ad break playing Spotify → User selects radio → Ad break ends, user choice persists
- Timer running → User manually plays station → Timer stops

**API:**
```javascript
const result = interruptionHandler.handleUserAction('station_select', { station });
if (result.wasInterrupted) {
  console.log('User interrupted:', result.action);
}
```

### 5. Service Layer

**Purpose:** Abstraction for external audio APIs

#### RadioService (`src/services/RadioService.js`)
- HTML5 Audio wrapper
- Retry logic with fallback URLs
- CORS handling

#### SpotifyService (`src/services/SpotifyService.js`)
- Spotify Web Playback SDK integration
- Device management
- OAuth token handling

#### YouTubeService (`src/services/YouTubeService.js`)
- YouTube iframe API wrapper
- Playlist/video playback
- Volume control sync

**Common Interface:**
```javascript
class AudioService {
  async initialize()
  async play(config)
  async pause()
  async resume()
  async stop()
  setVolume(volume)
  getState()
  destroy()
}
```

### 6. Custom Hooks

#### useAudio (`src/hooks/useAudio.js`)

**Purpose:** React bridge to AudioManager

**Simplified from 2000 lines → 300 lines**

**API:**
```javascript
const audio = useAudio();

await audio.playRadio(station);
await audio.playSpotify(playlistUrl);
await audio.playYouTube(videoId);
await audio.pause();
await audio.resume();
await audio.stop();
audio.setVolume(0.5);
audio.togglePlayPause();
```

#### useAdBreak (`src/hooks/useAdBreak.js`)

**Purpose:** Ad break timer and mode management

**Simplified from 1700 lines → 350 lines**

**API:**
```javascript
const adBreak = useAdBreak();

adBreak.startTimer();
adBreak.stopTimer();
adBreak.testMode(mode); // 'playlist' | 'nonstop' | 'lofi'
```

## Data Flow Example

### Playing a Radio Station

```
1. User clicks station card
   ↓
2. RadioCard → onClick → audio.playRadio(station)
   ↓
3. useAudio.playRadio()
   • Check for interruption
   • Update state (loading, station, source='radio')
   • Call AudioManager.play('radio', { station })
   ↓
4. AudioManager.play()
   • stopAll() - Force stop all sources
   • Check fade setting
   • Call RadioService.play({ station })
   ↓
5. RadioService.play()
   • Create/reuse HTML5 Audio element
   • Set src to station.url
   • Apply volume from VolumeNormalizer
   • Call audio.play()
   ↓
6. Audio element starts playing
   • Event listeners update state
   • StateManager persists to localStorage
   • UI updates via React Context
```

### Ad Break Trigger

```
1. Timer reaches 0
   ↓
2. useAdBreak detects timer end
   ↓
3. Check mode: playlist | nonstop | lofi
   ↓
4. Mode = 'playlist':
   • audio.playSpotify(playlistUrl)
   • AudioManager stops radio
   • SpotifyService starts playlist
   ↓
5. Ad break active state set
   ↓
6. After playlist duration or user action:
   • adBreak.endAdBreak()
   • Resume last radio station (if not interrupted)
```

### User Interruption During Ad Break

```
1. Ad break active, Spotify playing
   ↓
2. User clicks different radio station
   ↓
3. InterruptionHandler detects user action
   • Marks ad break as "interrupted"
   • User choice becomes new intent
   ↓
4. AudioManager.play('radio', new station)
   • stopAll() - Stops Spotify
   • Starts new radio station
   ↓
5. Ad break ends
   • Check: was interrupted?
   • Yes → Do nothing (user choice persists)
   • No → Resume previous station
```

## Key Design Decisions

### Why AudioManager?
**Problem:** 3 audio systems fighting for control, state desyncs
**Solution:** Single controller with strict enforcement

### Why StateManager (Context)?
**Problem:** State scattered in 40+ places
**Solution:** Centralized state with automatic persistence

### Why Service Layer?
**Problem:** Audio API code mixed with UI logic
**Solution:** Clean separation, testable services

### Why VolumeNormalizer?
**Problem:** Volume spikes when switching sources
**Solution:** Per-source multipliers with safety limits

### Why InterruptionHandler?
**Problem:** Automated actions override user intent
**Solution:** User actions always "finish" automated actions

## Architecture Benefits

### Before Restructuring (v3.2)
- ❌ ~10,000 lines of code
- ❌ State scattered in 40+ places
- ❌ 3 competing audio systems
- ❌ Volume desyncs common
- ❌ Audio overlap bugs
- ❌ Difficult to debug

### After Restructuring (v3.3)
- ✅ ~5,000 lines of code (50% reduction)
- ✅ Single source of truth (StateManager)
- ✅ Unified audio control (AudioManager)
- ✅ No volume desyncs
- ✅ No audio overlap possible
- ✅ Clear, maintainable architecture

## Testing Strategy

### Unit Tests (Recommended)
- `AudioManager` - Test source switching, volume normalization
- `VolumeNormalizer` - Test per-source multipliers, emergency protection
- `InterruptionHandler` - Test user action handling
- `Services` - Test play/pause/stop, error handling

### Integration Tests (Recommended)
- Full user flows: play radio → ad break → resume
- Volume syncing across sources
- State persistence (localStorage)

### Manual Testing Checklist
- [ ] Play radio station
- [ ] Switch between stations (no overlap)
- [ ] Adjust volume (no spikes)
- [ ] Start ad break timer
- [ ] Test all 3 ad break modes
- [ ] Interrupt ad break manually
- [ ] Test crossfade (when enabled)
- [ ] Verify settings persist on reload
