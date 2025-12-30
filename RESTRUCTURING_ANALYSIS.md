# Radio Zonder Reclame - Codebase Restructuring Analysis

## Executive Summary

Your Dutch radio player application is feature-rich and functional but suffers from architectural complexity that causes synchronization bugs, state management issues, and difficult maintainability. The core issue is managing 3 distinct audio playback systems (Radio, Spotify, YouTube) that need to seamlessly switch between each other.

## Current Problems Identified

### 1. **Three Competing Audio Systems**
- **Radio**: HTML5 Audio element for live streams
- **Spotify**: Web Playback SDK with device management
- **YouTube**: iframe API with multiple display modes (floating, embedded, popup)

Each system has its own:
- Volume controls that can desync
- Play/pause states that conflict
- Loading/transition states that overlap
- Error handling that doesn't communicate

### 2. **State Management Chaos**
```javascript
// State is scattered everywhere:
- App.jsx: 20+ useState hooks
- useAudioPlayer: ~30+ internal states
- useAdBreakTimer: ~25+ internal states
- window.* global variables (bad practice)
- localStorage/sessionStorage mix
```

### 3. **Complex Ad Break Switching**
The app has 3 ad break modes (playlist, nonstop, lofi) with:
- Community timing system (Firebase)
- Manual timer system
- Overlapping timeouts/intervals
- Difficult-to-track state transitions

### 4. **File Organization Issues**
- **Empty files**: 7 legacy files serving no purpose
- **Duplicate logic**: YouTube handling in 4+ places
- **Massive files**: useAudioPlayer.js is 29,000+ tokens
- **Unclear boundaries**: Components mixing business logic with UI

### 5. **Mode Switching Bugs**
```
User Journey Example:
1. Playing Radio A
2. Ad break triggers → Spotify playlist starts
3. User manually selects Radio B (during ad break)
4. Ad break ends → tries to resume Radio A (conflict!)
5. Volume desyncs, multiple audio sources play, chaos ensues
```

## Proposed Architecture

### Core Design Principles

1. **Single Source of Truth** - One state manager for entire app
2. **Audio Source Abstraction** - Unified interface for all audio types
3. **Explicit State Machines** - Clear states and transitions
4. **Separation of Concerns** - UI, Logic, and Data layers

### New Folder Structure

```
src/
├── core/                          # Core business logic
│   ├── AudioManager.js           # NEW: Unified audio controller
│   ├── StateManager.js           # NEW: Centralized state (Context/Zustand)
│   └── AdBreakController.js      # NEW: Simplified ad break logic
│
├── services/                      # External integrations
│   ├── RadioService.js           # Radio stream handling
│   ├── SpotifyService.js         # Spotify SDK wrapper
│   ├── YouTubeService.js         # YouTube iframe wrapper
│   ├── FirebaseService.js        # Community timings
│   └── StorageService.js         # localStorage/sessionStorage
│
├── components/                    # UI only (no business logic)
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── AudioPlayer.jsx
│   ├── radio/
│   │   ├── RadioGrid.jsx
│   │   └── RadioCard.jsx
│   ├── settings/
│   │   ├── AdBreakSettings.jsx
│   │   └── GeneralSettings.jsx
│   ├── overlays/
│   │   ├── FloatingPlayer.jsx    # Unified floating player
│   │   └── Visualizer.jsx
│   └── shared/
│       ├── Notifications.jsx
│       └── LoadingIndicator.jsx
│
├── hooks/                         # Simplified custom hooks
│   ├── useAudio.js               # Wraps AudioManager
│   ├── useAdBreak.js             # Wraps AdBreakController
│   └── useSettings.js            # App settings
│
├── utils/                         # Pure utility functions
│   ├── timeUtils.js
│   ├── urlUtils.js
│   └── validation.js
│
├── data/
│   └── radioStations.js          # Station database
│
├── App.jsx                        # Thin orchestration layer
└── main.jsx
```

### Key New Components

#### 1. **AudioManager.js** - The Heart of the System

```javascript
class AudioManager {
  constructor() {
    this.currentSource = null;      // 'radio' | 'spotify' | 'youtube'
    this.sources = {
      radio: new RadioSource(),
      spotify: new SpotifySource(),
      youtube: new YouTubeSource()
    };
    this.state = 'idle';            // 'idle' | 'loading' | 'playing' | 'paused'
    this.volume = 0.5;
  }

  // Unified interface
  async play(type, config) {
    await this.stop();              // Always stop current first
    this.currentSource = type;
    await this.sources[type].play(config);
    this.syncVolume();
  }

  async stop() {
    if (this.currentSource) {
      await this.sources[this.currentSource].stop();
      this.currentSource = null;
    }
  }

  setVolume(vol) {
    this.volume = vol;
    this.syncVolume();
  }

  syncVolume() {
    Object.values(this.sources).forEach(s => s.setVolume(this.volume));
  }
}
```

#### 2. **StateManager.js** - React Context or Zustand Store

```javascript
const appState = {
  // Audio state
  currentStation: null,
  isPlaying: false,
  volume: 0.5,
  audioSource: null,          // 'radio' | 'spotify' | 'youtube' | 'lofi'

  // Ad break state
  isAdBreakActive: false,
  adBreakTimeLeft: null,
  adBreakMode: 'playlist',

  // UI state
  showVisualizer: true,
  showFloatingPlayer: false,

  // Settings
  autoCloseOverlays: true,
  useCommunityTimings: true
};

// Single dispatch for all state changes
const actions = {
  setStation: (station) => { /* ... */ },
  startAdBreak: (mode) => { /* ... */ },
  endAdBreak: () => { /* ... */ },
  setVolume: (vol) => { /* ... */ }
};
```

#### 3. **AdBreakController.js** - Simplified Ad Break Logic

```javascript
class AdBreakController {
  constructor(audioManager, state) {
    this.audioManager = audioManager;
    this.state = state;
    this.timer = null;
    this.savedStation = null;
  }

  async start(mode) {
    // Save current state
    this.savedStation = this.state.currentStation;

    // Switch based on mode
    switch(mode) {
      case 'playlist':
        await this.audioManager.play('spotify', {
          playlist: this.state.playlistId
        });
        break;
      case 'nonstop':
        await this.audioManager.play('radio', {
          station: getNonstopStation()
        });
        break;
      case 'lofi':
        await this.audioManager.play('youtube', {
          video: getLofiVideo()
        });
        break;
    }

    // Schedule end
    this.timer = setTimeout(() => this.end(), duration);
  }

  async end() {
    clearTimeout(this.timer);

    // Restore saved station
    if (this.savedStation) {
      await this.audioManager.play('radio', {
        station: this.savedStation
      });
    }
  }
}
```

## Migration Strategy

### Phase 1: Backup & Foundation (Day 1)
1. Create `old-version/` folder with current key files
2. Set up new folder structure
3. Implement AudioManager.js
4. Implement StateManager.js (React Context first, migrate to Zustand later)

### Phase 2: Service Layer (Day 2)
1. Extract RadioService.js from useAudioPlayer
2. Extract SpotifyService.js from spotifyUtils
3. Extract YouTubeService.js from youtubeUtils
4. Test each service independently

### Phase 3: Core Integration (Day 3)
1. Implement new useAudio hook using AudioManager
2. Implement AdBreakController
3. Update App.jsx to use new state management
4. Remove old hooks gradually

### Phase 4: UI Cleanup (Day 4)
1. Update components to use new hooks
2. Remove business logic from components
3. Consolidate floating player implementations
4. Remove dead code

### Phase 5: Testing & Polish (Day 5)
1. Test all mode switches
2. Test volume synchronization
3. Test ad break flows
4. Fix any regressions

## File Consolidation Plan

### Files to Delete (Empty/Legacy)
```
❌ src/components/CommunityTimingFeedback.jsx (empty)
❌ src/components/MusicVisualizer.jsx (empty)
❌ src/components/PlayerVisualizer.jsx (empty)
❌ src/utils/logger.js (empty)
❌ src/utils/radioStations.js (empty)
❌ src/utils/communityTimings.js (empty)
❌ src/utils/simpleOverrides.js (empty)
```

### Files to Merge/Refactor
```
🔀 useAudioPlayer.js (2000+ lines) → Split into:
   - AudioManager.js (core logic)
   - RadioService.js
   - SpotifyService.js
   - YouTubeService.js

🔀 useAdBreakTimer.js (1700+ lines) → Split into:
   - AdBreakController.js
   - CommunityTimingService.js
   - useAdBreak.js (thin wrapper)

🔀 App.jsx (650 lines) → Simplify to:
   - App.jsx (200 lines max)
   - Use StateManager context
```

### Files to Keep As-Is
```
✅ RadioGrid.jsx (good component)
✅ AudioPlayer.jsx (update to use new hooks)
✅ AdBreakSettings.jsx (update to use new state)
✅ data/allRadioStations.js (data file)
✅ MusicVisualizerSingle.jsx (feature component)
```

## Expected Benefits

### Before Restructuring
- 50+ files
- ~10,000 lines of code
- State scattered in 40+ places
- 3 competing audio systems
- Difficult to debug
- Hard to add features

### After Restructuring
- ~35 files (30% reduction)
- Same functionality
- State in 1 place (Context/Zustand)
- Unified audio abstraction
- Clear responsibility boundaries
- Easy to debug and extend

## Risks & Mitigation

### Risk 1: Breaking Existing Functionality
**Mitigation**:
- Keep old files in `old-version/` for reference
- Migrate one feature at a time
- Test thoroughly after each step

### Risk 2: Complex Service Dependencies
**Mitigation**:
- Start with independent services (Radio, Spotify, YouTube)
- Test each service before integration
- Use dependency injection for flexibility

### Risk 3: State Management Learning Curve
**Mitigation**:
- Start with React Context (familiar)
- Can migrate to Zustand later if needed
- Document state structure clearly

## Next Steps

1. **Get Your Approval** - Review this plan and confirm approach
2. **Create Backup** - Move critical files to `old-version/`
3. **Start Foundation** - Build AudioManager and StateManager
4. **Incremental Migration** - One system at a time
5. **Test & Iterate** - Ensure no regressions

## Questions for You

1. Are you comfortable with this level of restructuring?
2. Do you want to use React Context or would you prefer Zustand for state?
3. Should we preserve ALL current features or can we simplify some?
4. Any specific bugs you want prioritized during the refactor?

---

This restructuring will take time but will result in a much more maintainable, debuggable, and extensible codebase. The good news: your UI/UX is great and won't change at all!
