# Changelog

## v3.3 - Complete Restructuring (December 2024)

### Major Changes

#### Architecture Rewrite
- **Complete codebase restructuring** - Rebuilt from scratch with proper design patterns
- **50% code reduction** - From ~10,000 to ~5,000 lines
- **New core system:**
  - `AudioManager` - Unified audio controller with strict single-source enforcement
  - `StateManager` - Centralized React Context for all state
  - `VolumeNormalizer` - Smart volume control with safety protection
  - `InterruptionHandler` - User action intelligence
  - Service layer - RadioService, SpotifyService, YouTubeService
  - Simplified hooks - useAudio (300 lines), useAdBreak (350 lines)

#### Features Added
- ✅ Strict single-audio enforcement (only 1 stream plays at once)
- ✅ Crossfade transitions (optional, configurable)
- ✅ Volume normalization across all sources
- ✅ Emergency volume protection (automatic reduction on spikes)
- ✅ Smart user interruption handling
- ✅ Bar visualizer (real-time audio analysis for radio)
- ✅ Reduced console log spam (only meaningful changes)
- ✅ Volume initialization fix (slider matches actual volume on load)

#### Features Removed
- ❌ Community timing system (Firebase integration) - Too complex
- ❌ "Meld reclame" feedback button - Removed per user request
- ❌ YouTube minimize/maximize modes - Simplified to resizable windows only
- ❌ ~3000 lines of buggy legacy code
- ❌ 7 empty/unused files

#### Bug Fixes
- Fixed audio overlap (multiple streams playing simultaneously)
- Fixed volume desyncs between slider and actual playback
- Fixed volume initialization mismatch (slider vs audio)
- Fixed state persistence issues
- Fixed crossfade bugs (abrupt exits, forward references, overlap)
- Fixed visualizer audio element detection

#### Documentation
- Created comprehensive architecture documentation
- Project overview with feature list
- Changelog tracking all changes
- Migration guide for understanding new system

## v3.2 (Pre-Restructuring)

### Features
- 3 audio systems (Radio, Spotify, YouTube)
- Ad break timer with 3 modes (playlist, nonstop, lofi)
- Community timing system (removed in v3.3)
- 850+ Dutch radio stations
- Favorites system
- Visualizer (multiple types)
- Volume controls
- Floating YouTube players

### Known Issues (Fixed in v3.3)
- Audio overlap bugs
- Volume desyncs
- State management chaos (40+ state locations)
- Complex codebase (10,000+ lines)
- Mode switching bugs
- Difficult to maintain

## Technical Debt Resolved

### Before v3.3
- State scattered in 40+ places
- `useAudioPlayer.js` - 2000 lines, 29,000+ tokens
- `useAdBreakTimer.js` - 1700 lines
- 3 competing audio systems causing conflicts
- 7 empty legacy files
- No clear architecture
- Volume spikes common
- Audio overlap possible

### After v3.3
- Single source of truth (StateManager)
- `useAudio.js` - 300 lines (85% reduction)
- `useAdBreak.js` - 350 lines (79% reduction)
- Unified audio control (AudioManager)
- All legacy files removed
- Clean layered architecture
- Volume normalized with safety limits
- Audio overlap impossible

## Migration Notes

### For Users
- No action required - All settings and favorites preserved
- Volume will match slider on page load (was broken before)
- No more audio overlap issues
- Crossfade is optional (check settings)

### For Developers
- Old system backed up in `old-version/` folder
- New architecture uses:
  - `useAudio()` instead of `useAudioPlayer()`
  - `useAdBreak()` instead of `useAdBreakTimer()`
  - `StateManager` for all state
  - `AudioManager` for audio control
- See `docs/ARCHITECTURE.md` for details
