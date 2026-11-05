# Station data

All stations live in [`src/data/stations.json`](../src/data/stations.json). It is the single
source of truth: the app, the favorites, the non-stop ad-break list and the checker all read it.
Stations that were removed because they stopped working are listed in
[`REMOVED_STATIONS.md`](REMOVED_STATIONS.md).

## Format

```json
{
  "id": "npo-radio-2",
  "name": "NPO Radio 2",
  "category": "npo",
  "genre": "hits",
  "description": "Pop, rock en verhalen",
  "about": "Optional longer text, shown as tooltip on the station name.",
  "website": "https://www.nporadio2.nl",
  "logo": "https://.../logo.png",
  "location": "Groningen",
  "country": "BE",
  "nonstop": true,
  "streams": [
    { "url": "https://icecast.omroep.nl/radio2-bb-mp3", "cors": true },
    { "url": "https://icecast.omroep.nl/radio2-sb-mp3" }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Lowercase slug, unique. Favorites and settings are stored by id, so **don't change ids** of existing stations. |
| `name` | yes | The station's own branding, no bitrate/codec suffixes. Unique. |
| `category` | yes | One of the categories below. |
| `genre` | yes | One of the genres below. Drives the genre filter. |
| `description` | yes | Short tag shown under the card (max ~35 characters, Dutch). |
| `about` | no | Longer description for the tooltip. |
| `website`, `logo` | no | `logo` must be HTTPS; without it the card shows the station's initials. |
| `location` | no | City/province (regional, local) or country name (global). Searchable. |
| `country` | no | ISO code, only for non-Dutch stations. |
| `nonstop` | no | `true` = continuous music without presenters. These show on the *Non-stop* tab. |
| `streams` | yes | Ordered list, best first. The player tries them in this order. |

`stream.cors` is `true` when the server sends CORS headers. Only then does the player load the
stream with `crossOrigin`, which the visualizer needs. A `crossOrigin` request to a server
without CORS fails outright, so the flag must be correct. The checker maintains it.

### Categories

Defined in [`src/data/categories.js`](../src/data/categories.js). Each station has exactly one.

| Key | Tab | What belongs here |
|---|---|---|
| `npo` | NPO | NPO stations and NPO's own theme channels |
| `commercial` | Commercieel | Main channel of national commercial stations (FM and/or national DAB+) |
| `themes` | Themakanalen | Online theme channels of those commercial broadcasters |
| `regional` | Regionaal | The 13 regional public broadcasters, plus regional commercial stations |
| `local` | Lokaal | Local public broadcasters and city stations |
| `online` | Webradio | Other Dutch internet stations (also AM/pirate nostalgia stations with a stream) |
| `religious` | Religieus | Religious stations |
| `global` | Global | Non-Dutch stations, including Flemish ones |

*Populair*, *Favorieten*, *Alle zenders* and *Non-stop* are views, not categories. *Populair* is
the `POPULAR_IDS` list in [`src/data/stations.js`](../src/data/stations.js), which also holds the
default station list for the non-stop ad-break mode (`DEFAULT_NONSTOP_IDS`).

### Genres

`hits`, `dance`, `rock`, `gold`, `dutch`, `urban`, `jazz-soul`, `classical`, `chill`, `talk`,
`world`, `mixed`. Labels are in `categories.js`.

## What makes a stream usable

The site is served over HTTPS, so:

- **Only `https://` streams work.** Browsers block `http://` audio on an HTTPS page as mixed
  content. Many Icecast/Shoutcast servers only offer HTTP; those stations cannot be played.
- **Playlists (`.pls`, `.m3u`) don't play** in an `<audio>` element; use the stream URL they
  contain. The checker does this automatically.
- **HLS-only streams are not supported** (no HLS player is bundled).
- Codecs: MP3 and AAC work everywhere; Ogg/Opus and FLAC work in Chrome and Firefox.
- Do not route streams through third-party CORS proxies. They break on endless streams and send
  listeners' traffic through someone else's server.

## Checking streams

```bash
npm run stations:check                       # probe everything and repair stations.json
npm run stations:check -- --dry-run          # report only; exits 1 if a station is dead
npm run stations:check -- --only qmusic,slam # a few stations
npm run stations:probe -- https://example.com/stream.mp3   # probe single URLs
npm run stations:validate                    # schema check only, no network
```

Requires Node 20+ and no dependencies. The checker, for every station:

1. probes each stream like a browser would (HTTPS after redirects, a 2xx response, and audio
   frames that actually arrive) and records whether the server sends CORS headers;
2. retries failures once with a longer timeout, so a briefly unavailable server does not get a
   station removed;
3. drops streams that still fail, replaces `http://` and playlist URLs with the HTTPS stream they
   lead to, and clears logos that do not load;
4. removes stations left without any working stream and appends them to
   `docs/REMOVED_STATIONS.md` with the reason.

Review the diff before committing; a station can be temporarily offline.

The [`stations-check` workflow](../.github/workflows/stations-check.yml) runs the dry run every
Monday and whenever `stations.json` changes. A failed run means a station died. Run the check
locally to repair the file.

> Run the check from a normal internet connection. Some sandboxed/corporate networks only allow
> port 443, which makes every stream on another port (common for Icecast/Shoutcast) look dead.

## Adding a station

1. Find the official stream URL: the station's web player (look for `.mp3`/`.aac` URLs in the
   page source or network tab), its "stream URL" or "luister live" page, or
   [Radio-Browser](https://www.radio-browser.info). For StreamTheWorld stations prefer
   `https://playerservices.streamtheworld.com/api/livestream-redirect/<MOUNT>.mp3`, which
   redirects to a working server; numbered hosts (`12345.live.streamtheworld.com`) rotate.
2. Test it: `npm run stations:probe -- <url>`.
3. Add the entry to `stations.json` (any position; the checker sorts the file), then run
   `npm run stations:check -- --only <id>` to fill in the `cors` flags and validate.

### Global stations

Only include a non-Dutch station when its stream is the station's **own official public stream**,
it is free to listen to, and it is not geo-blocked or behind a login. Never use a re-stream of
another station by a third party. Prefer stations that explicitly allow external players
(SomaFM, Radio Paradise, Radio Swiss, Radio France).
