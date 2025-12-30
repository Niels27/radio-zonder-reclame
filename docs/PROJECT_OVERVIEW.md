# Radio Zonder Reclame - Project Overview

## What is this?

A Dutch radio streaming web application that automatically switches to playlists (Spotify/YouTube) or alternative stations during commercial breaks.

**Live URL:** https://niels27.github.io/radio-zonder-reclame/

## Core Features

### 3 Audio Systems
1. **Radio** - Live Dutch radio stations (HTML5 Audio)
2. **Spotify** - Playlist playback during ad breaks (Spotify Web Playback SDK)
3. **YouTube** - Video/playlist playback during ad breaks (YouTube iframe API)

### Ad Break Handling
- **Manual Timer** - User sets custom ad break timings
- **3 Skip Modes:**
  - **Playlist Mode** - Plays Spotify/YouTube playlist
  - **Nonstop Mode** - Switches to ad-free radio stations
  - **Lofi Mode** - Plays lofi livestreams in resizable window

### Key Capabilities
- ✅ Strict single-audio enforcement (only 1 stream plays at once)
- ✅ Optional crossfade transitions between sources
- ✅ Volume normalization across all sources
- ✅ Favorites system
- ✅ Real-time music visualizer (bar-based for radio)
- ✅ Resizable YouTube mini-players with auto-close timers
- ✅ Smart interruption handling (user actions override automation)

## Technology Stack

### Frontend
- **React** - UI framework
- **TailwindCSS** - Styling
- **Vite** - Build tool

### Audio APIs
- HTML5 Audio API (radio streams)
- Spotify Web Playback SDK
- YouTube iframe API

### State Management
- React Context API (centralized state)
- localStorage for persistence

## Architecture

### New System (v3.3+)
- **AudioManager** - Unified audio controller with strict source enforcement
- **StateManager** - Centralized React Context for all state
- **VolumeNormalizer** - Smart volume control with safety protection
- **InterruptionHandler** - User action intelligence
- **Service Layer** - RadioService, SpotifyService, YouTubeService
- **Hooks** - useAudio, useAdBreak (simplified)

### Key Design Principles
1. **Single source of truth** - StateManager controls everything
2. **Strict audio enforcement** - Only 1 audio source can play
3. **Volume safety** - Emergency protection against spikes
4. **User-first** - Manual actions always override automation
5. **Separation of concerns** - Services handle playback, hooks connect to React

## Project Stats
- **Lines of code:** ~5,000 (reduced from ~10,000 after restructuring)
- **Components:** 20+
- **Radio stations:** 850+
- **Supported languages:** Dutch (primary audience)

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Recent Major Changes (v3.3)

### Complete Restructuring (Dec 2024)
- Removed 3000+ lines of buggy code
- Built new architecture from scratch
- Eliminated state desyncs completely
- Added strict single-audio enforcement
- Removed Firebase/community timing system (too complex)
- Simplified YouTube players (just resizable windows)
- Added crossfade support
- Volume normalization with safety limits

### What Was Removed
- ❌ Community timing system (Firebase integration)
- ❌ "Meld reclame" feedback button
- ❌ YouTube minimize/maximize modes
- ❌ ~3000 lines of legacy code
- ❌ 7 empty/unused files

### What Was Added
- ✅ AudioManager with strict enforcement
- ✅ Centralized StateManager
- ✅ VolumeNormalizer with emergency protection
- ✅ InterruptionHandler for smart user actions
- ✅ Crossfade transitions (optional)
- ✅ Proper bar visualizer
- ✅ Clean architecture with separation of concerns

## Known Limitations
- Spotify requires premium account
- Some radio streams may use HTTP (browser upgrades to HTTPS)
- YouTube ad blockers may cause iframe conflicts (not app's fault)

## Future Considerations
- Mobile responsive improvements
- Additional visualizer types
- Playlist management UI
- Station search/filter enhancements
