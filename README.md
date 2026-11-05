# Radio Zonder Reclame

Nederlandse radio-app die tijdens reclameblokken automatisch naar je eigen playlist
(YouTube / Spotify) of een non-stop zender schakelt, en daarna terug naar je radiozender.

**Live:** https://niels27.github.io/radio-zonder-reclame/

## Features

- Nederlandse zenders: NPO, landelijk commercieel, themakanalen, regionale en lokale omroepen,
  webradio en religieuze zenders, plus een *Global*-sectie met gratis zenders uit de rest van de wereld
- Zoeken op naam, genre of plaats; filteren op genre; favorieten
- Robuust afspelen: elke zender heeft een of meer geteste streams; valt een stream weg, dan
  wordt automatisch opnieuw verbonden of de volgende stream geprobeerd
- Automatische reclamepauze-wisseling op vaste minuten, met als alternatief YouTube, Spotify of
  een non-stop zender (lijst instelbaar)
- Pre-roll reclame overslaan bij commerciële zenders, music visualizer
- Strikt één audiobron tegelijk

## Tech stack

React 19 + Vite 6 · Tailwind CSS · HTML5 Audio · Spotify Web Playback SDK · YouTube IFrame API

## Development

```bash
npm install
npm run dev      # http(s)://127.0.0.1:4178/radio-zonder-reclame/
npm run build    # production build -> dist/
npm run preview  # serve the production build locally
npm run lint
```

### Local HTTPS (optional)

The dev server uses HTTPS when it finds `127.0.0.1.pem` and `127.0.0.1-key.pem` in the project
root, otherwise HTTP. The files are gitignored; generate your own
with [mkcert](https://github.com/FiloSottile/mkcert): `mkcert 127.0.0.1`.

## Project structure

```
src/
  data/         stations.json (all stations), categories.js, stations.js (lookups, popular list)
  core/         AudioManager (one source at a time, volume), AdBreakController, StateManager
  services/     RadioService (streams, fallbacks, reconnect), SpotifyService, YouTubeService
  hooks/        useAudio, useAdBreak, useFavorites
  components/   UI: RadioGrid, AudioPlayer, AdBreakSettings, overlays
  utils/        event bus, notifications, Spotify/YouTube helpers, pre-roll, non-stop list
scripts/stations/   stream probe and checker for stations.json (Node, no dependencies)
docs/               STATIONS.md (data format, checking, adding stations), REMOVED_STATIONS.md
```

## Station data

Stations are maintained in `src/data/stations.json`. Every stream is verified with
`npm run stations:check`, which drops dead streams, fixes HTTPS/CORS details and removes stations
without a working stream (logged in `docs/REMOVED_STATIONS.md`). A GitHub Actions workflow runs
the same check weekly. See [docs/STATIONS.md](docs/STATIONS.md).

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`: lint, station data validation, build,
and publish `dist/` to GitHub Pages. The repo's **Settings → Pages → Source** must be set to
**GitHub Actions**. The `base` path in `vite.config.js` (`/radio-zonder-reclame/`) must match the
repo name. See [HOSTING.md](HOSTING.md) for moving to a custom domain.

## License

MIT
