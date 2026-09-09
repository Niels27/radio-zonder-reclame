# Radio Zonder Reclame

Nederlandse radio-streaming app die tijdens reclameblokken automatisch naar je eigen
playlist (Spotify / YouTube), nonstop-radio of lofi schakelt.

**Live:** https://niels27.github.io/radio-zonder-reclame/

## Features

- 850+ Nederlandse radiozenders
- Automatische reclamepauze-detectie en omschakeling
- Skip-modi: Playlist (Spotify / YouTube), Nonstop Radio, Lofi
- Music visualizer, favorieten, volumenormalisatie
- Strikt één audiobron tegelijk (geen overlap)

## Tech stack

React 19 + Vite 6 · TailwindCSS · HTML5 Audio API · Spotify Web Playback SDK · YouTube IFrame API

## Development

```bash
npm install
npm run dev      # https://127.0.0.1:4178/radio-zonder-reclame/
npm run build    # production build -> dist/
npm run preview  # serve the production build locally
```

### Local HTTPS (optional)

The dev server uses HTTPS when it finds `127.0.0.1.pem` and `127.0.0.1-key.pem` in the
project root, otherwise it falls back to HTTP. These files are gitignored - generate your
own with [mkcert](https://github.com/FiloSottile/mkcert):

```bash
mkcert 127.0.0.1
# produces 127.0.0.1.pem and 127.0.0.1-key.pem
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds `dist/` and
publishes it to GitHub Pages. The repo's **Settings → Pages → Source** must be set to
**GitHub Actions**. The `base` path in `vite.config.js` (`/radio-zonder-reclame/`) must
match the repo name.

## Developer dashboard

An internal panel (stream tester + debug toggles) is available by running
`localStorage.dev_mode = 'true'` in the browser console, then triple-clicking the small
area in the top-right of the header. It stores nothing server-side.

## License

MIT
