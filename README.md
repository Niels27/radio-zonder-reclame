# Radio Zonder Reclame

Dutch radio streaming application with automatic ad-break switching.

**Live:** https://niels27.github.io/radio-zonder-reclame/

## Quick Start

```bash
npm install
npm run dev
```

## Features

- 🎵 850+ Dutch radio stations
- 🎧 Automatic ad-break detection and switching
- 🎼 3 skip modes: Playlist (Spotify/YouTube), Nonstop Radio, Lofi
- 📊 Real-time music visualizer
- ❤️ Favorites system
- 🔊 Smart volume normalization
- ⚡ No audio overlap - strict single-source enforcement

## Documentation

See [`docs/`](./docs/) folder:
- [Project Overview](./docs/PROJECT_OVERVIEW.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Changelog](./docs/CHANGELOG.md)

## Tech Stack

- React + Vite
- TailwindCSS
- HTML5 Audio API
- Spotify Web Playback SDK
- YouTube iframe API

## Development

```bash
# Install dependencies
npm install

# Run dev server (localhost:4173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Version

**v3.3** - Complete architecture restructuring (December 2024)

## License

MIT
