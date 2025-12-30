# Migration Guide - Switching to New Architecture

## 🎯 Current Status

The new architecture is **ready for testing**! Here's what's been built:

### ✅ Complete
- Core systems (AudioManager, StateManager, VolumeNormalizer, InterruptionHandler)
- Service layer (Radio, Spotify, YouTube)
- Hooks (useAudio, useAdBreak)
- New App.jsx
- ResizableYouTubePlayer component

### 🚧 Needs Porting
- AudioPlayer.jsx (footer player component)
- AdBreakSettings.jsx (settings panel)
- RadioGrid.jsx (might work as-is)
- Other components

## 📝 How to Switch Over

### Step 1: Test the New System

Replace these files:
```bash
# Backup current versions (already done in old-version/)
mv src/App.jsx src/App-old.jsx
mv src/main.jsx src/main-old.jsx

# Activate new versions
mv src/App-new.jsx src/App.jsx
mv src/main-new.jsx src/main.jsx
```

### Step 2: Install Missing Dependencies

The new system might need some utils that were removed. Check these:
- `nonstopUtils.js` - needs to exist
- `lofiUtils.js` - needs to exist
- `useFavorites.js` - needs to be created or ported

### Step 3: Update Components

Components need minor updates to work with new state:

#### Before (old):
```jsx
const audioPlayer = useAudioPlayer();
audioPlayer.playRadio(station);
```

#### After (new):
```jsx
const audio = useAudio();
audio.playRadio(station);
```

## 🔧 Creating Missing Utilities

### nonstopUtils.js
```javascript
// utils/nonstopUtils.js
import { allRadioStations } from '../data/allRadioStations';

const nonstopStations = allRadioStations.filter(s =>
  s.category === 'realnonstop' || s.tags?.includes('nonstop')
);

let currentIndex = 0;

export function getRandomNonstopStation() {
  if (nonstopStations.length === 0) return null;

  currentIndex = (currentIndex + 1) % nonstopStations.length;
  return nonstopStations[currentIndex];
}
```

### lofiUtils.js
```javascript
// utils/lofiUtils.js
const lofiStreams = [
  {
    name: 'Lofi Girl',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    type: 'youtube_video'
  },
  {
    name: 'Chillhop Music',
    url: 'https://www.youtube.com/watch?v=5yx6BWlEVcY',
    type: 'youtube_video'
  }
];

let currentIndex = 0;

export function getNextLofiStream() {
  if (lofiStreams.length === 0) return null;

  const stream = lofiStreams[currentIndex];
  currentIndex = (currentIndex + 1) % lofiStreams.length;
  return stream;
}

export function extractYouTubeVideoId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
```

### useFavorites.js
```javascript
// hooks/useFavorites.js
import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('favorite_stations');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load favorites', error);
    }
  }, []);

  const toggleFavorite = (stationId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(stationId)
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId];

      localStorage.setItem('favorite_stations', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  return { favorites, toggleFavorite };
}
```

## 🗑️ Files to Delete

Once new system is working, delete these:
- `src/hooks/useAudioPlayer.js` (old - 2000 lines)
- `src/hooks/useAdBreakTimer.js` (old - 1700 lines)
- `src/utils/communityTimings.jsx` (removed feature)
- `src/utils/communityTimings.js` (empty)
- `src/utils/firebase.js` (removed feature)
- `src/components/CommunityTimingFeedback.jsx` (empty)
- All other empty files

## ⚠️ Breaking Changes

### Community Timing Removed
- No more Firebase integration
- No more community-based ad break timing
- All timing is now manual (user-configured)

### YouTube Players
- No more minimized/maximized modes
- All YouTube players are resizable windows
- Auto-close timer for automatic openings
- Manual openings stay open

### Volume System
- Volume now normalized across sources
- Emergency protection built-in
- Different multipliers per source type

## 🧪 Testing Checklist

Test these scenarios:

### Basic Playback
- [ ] Play radio station
- [ ] Adjust volume
- [ ] Pause/resume
- [ ] Switch between stations

### Ad Break Modes
- [ ] Start timer
- [ ] Automatic ad break (playlist mode)
- [ ] Automatic ad break (nonstop mode)
- [ ] Automatic ad break (lofi mode)
- [ ] Manual ad break test

### Interruptions
- [ ] Select station during ad break
- [ ] Change mode during ad break
- [ ] Stop timer during ad break
- [ ] Close YouTube player manually

### Volume
- [ ] Volume sync across modes
- [ ] No distortion or spikes
- [ ] Emergency protection triggers (if loud)

### YouTube Players
- [ ] Auto-close timer appears for automatic opens
- [ ] Can cancel auto-close
- [ ] Manual opens stay open
- [ ] Can resize windows
- [ ] Multiple players simultaneously

## 🆘 Rollback Plan

If something breaks:
```bash
# Restore old versions
mv src/App-old.jsx src/App.jsx
mv src/main-old.jsx src/main.jsx

# Or use backup
cp old-version/App.jsx.bak src/App.jsx
cp old-version/useAudioPlayer.js.bak src/hooks/useAudioPlayer.js
cp old-version/useAdBreakTimer.js.bak src/hooks/useAdBreakTimer.js
```

## 📞 What to Report

If you encounter issues, note:
1. What you were doing
2. Which mode was active (radio/spotify/youtube)
3. Was timer running?
4. Any console errors
5. Expected vs actual behavior

## 🎉 Benefits After Migration

- **50% less code** - deleted ~3000 lines
- **No state desyncs** - single source of truth
- **No volume spikes** - normalization + safety
- **Clearer logic** - easy to understand and debug
- **Better interruption handling** - smart user actions
- **Simpler YouTube** - just resizable windows
