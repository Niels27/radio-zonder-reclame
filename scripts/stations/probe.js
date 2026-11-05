// Stream probe: decides whether a URL is playable by an <audio> element on an
// HTTPS page, the way the deployed site runs. Node 20+, no dependencies.
//
// A URL is "playable" when, after redirects:
//   - the final URL is HTTPS (HTTP streams are mixed content and get blocked)
//   - the server answers 2xx and starts sending audio bytes in a codec that
//     browsers decode natively (MP3, AAC, Ogg, FLAC)
// The probe also records whether the stream sends CORS headers on every hop
// of its redirect chain. The player only sets crossOrigin (needed for the
// visualizer) when that is true, because a crossOrigin request fails outright
// as soon as one response lacks the header.
//
// CLI: node scripts/stations/probe.js <url> [url...]

import { pathToFileURL } from 'node:url';

export const SITE_ORIGIN = 'https://niels27.github.io';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const PLAYLIST_TYPES = ['mpegurl', 'scpls', 'x-pls', 'pls+xml'];
const MAX_REDIRECTS = 5;

/** Identify the payload from its first bytes. */
export function sniffFormat(bytes) {
  const head = Buffer.from(bytes.subarray(0, 512)).toString('latin1');
  if (head.startsWith('#EXTM3U')) return /#EXT-X-/.test(head) ? 'hls' : 'm3u';
  if (/^\s*\[playlist\]/i.test(head)) return 'pls';
  if (/^\s*</.test(head)) return 'html';
  if (head.startsWith('OggS')) return 'ogg';
  if (head.startsWith('fLaC')) return 'flac';
  if (head.startsWith('ID3')) return 'mp3';

  // Scan for two consecutive MPEG / ADTS frame headers. A stream can start
  // mid-frame, so look past the start of the buffer.
  const limit = Math.min(bytes.length - 4, 16384);
  for (let i = 0; i < limit; i++) {
    if (bytes[i] !== 0xff || (bytes[i + 1] & 0xe0) !== 0xe0) continue;
    const layer = (bytes[i + 1] >> 1) & 0x03;
    if (layer === 0 && (bytes[i + 1] & 0xf0) === 0xf0) {
      // ADTS: frame length is 13 bits spread over bytes 3-5
      const len = ((bytes[i + 3] & 0x03) << 11) | (bytes[i + 4] << 3) | (bytes[i + 5] >> 5);
      if (len > 7 && bytes[i + len] === 0xff && (bytes[i + len + 1] & 0xf6) === 0xf0) return 'aac';
    } else if (layer === 1) {
      const frameLen = mp3FrameLength(bytes, i);
      if (frameLen && bytes[i + frameLen] === 0xff && (bytes[i + frameLen + 1] & 0xe0) === 0xe0) return 'mp3';
    }
  }
  if (/^\s*(https?:\/\/|#)/.test(head)) return 'm3u'; // bare URL list
  return 'unknown';
}

const MP3_BITRATES = {
  1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};
const MP3_SAMPLE_RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

function mp3FrameLength(bytes, i) {
  const version = (bytes[i + 1] >> 3) & 0x03; // 3 = MPEG1, 2 = MPEG2, 0 = MPEG2.5
  const bitrateIdx = bytes[i + 2] >> 4;
  const rateIdx = (bytes[i + 2] >> 2) & 0x03;
  if (version === 1 || bitrateIdx === 0 || bitrateIdx === 15 || rateIdx === 3) return 0;
  const bitrate = MP3_BITRATES[version === 3 ? 1 : 2][bitrateIdx] * 1000;
  const sampleRate = MP3_SAMPLE_RATES[version][rateIdx];
  const padding = (bytes[i + 2] >> 1) & 0x01;
  return Math.floor(((version === 3 ? 144 : 72) * bitrate) / sampleRate) + padding;
}

/** Extract stream URLs from an M3U or PLS playlist body. */
export function parsePlaylist(text) {
  const urls = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const match = line.match(/^(?:File\d+=)?(https?:\/\/\S+)$/i);
    if (match) urls.push(match[1]);
  }
  return [...new Set(urls)];
}

function codecFromContentType(type) {
  if (/mpeg|mp3/.test(type) && !/mpegurl/.test(type)) return 'mp3';
  if (/aac|mp4/.test(type)) return 'aac';
  if (/ogg|opus|vorbis/.test(type)) return 'ogg';
  if (/flac/.test(type)) return 'flac';
  return null;
}

/**
 * Probe one URL.
 * @returns {Promise<{ok: boolean, url: string, finalUrl?: string, codec?: string,
 *   cors?: boolean, bitrate?: number, playlist?: string[], error?: string}>}
 */
export async function probeStream(url, { timeoutMs = 12000, minBytes = 8192 } = {}) {
  const result = { ok: false, url };
  if (!/^https:\/\//i.test(url)) return { ...result, error: 'not https' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
  try {
    // Follow redirects by hand: a browser only allows a crossOrigin request if
    // every response in the redirect chain carries a CORS header, not just the last.
    let res;
    let current = url;
    result.cors = true;
    for (let hop = 0; ; hop++) {
      res = await fetch(current, {
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'User-Agent': BROWSER_UA, Origin: SITE_ORIGIN, Accept: '*/*' },
      });
      const acao = res.headers.get('access-control-allow-origin');
      result.cors &&= acao === '*' || acao === SITE_ORIGIN;
      const location = res.headers.get('location');
      if (res.status < 300 || res.status >= 400 || !location) break;
      if (hop === MAX_REDIRECTS) return { ...result, error: 'too many redirects' };
      res.body?.cancel().catch(() => {});
      current = new URL(location, current).href;
      if (!current.startsWith('https://')) return { ...result, finalUrl: current, error: 'redirects to http' };
    }
    result.finalUrl = current;
    result.status = res.status;
    const type = (res.headers.get('content-type') || '').toLowerCase();
    const icyBr = parseInt(res.headers.get('icy-br'), 10);
    if (icyBr > 0) result.bitrate = icyBr;

    if (!res.ok) return { ...result, error: `HTTP ${res.status}` };
    if (/text\/html/.test(type)) return { ...result, error: 'html page' };

    const bytes = await readBytes(res, minBytes);
    const sniffed = sniffFormat(bytes);

    if (sniffed === 'hls') return { ...result, error: 'hls' };
    if (sniffed === 'm3u' || sniffed === 'pls' || PLAYLIST_TYPES.some((t) => type.includes(t))) {
      return { ...result, error: 'playlist', playlist: parsePlaylist(Buffer.from(bytes).toString('utf8')) };
    }
    if (sniffed === 'html') return { ...result, error: 'html page' };

    const codec = ['mp3', 'aac', 'ogg', 'flac'].includes(sniffed) ? sniffed : codecFromContentType(type);
    if (!codec) return { ...result, error: `unrecognised payload (${type || 'no content-type'})` };
    if (bytes.length < minBytes) return { ...result, codec, error: `stream stalled after ${bytes.length} bytes` };
    return { ...result, ok: true, codec };
  } catch (err) {
    const reason = controller.signal.aborted ? 'timeout' : (err.cause?.code || err.cause?.message || err.message);
    return { ...result, error: String(reason) };
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

async function readBytes(res, minBytes) {
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (total < minBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;
    }
  } catch {
    // Timeout mid-read: judge on what arrived.
  } finally {
    reader.cancel().catch(() => {});
  }
  return Buffer.concat(chunks);
}

/**
 * Probe a URL and, when it is plain HTTP or a playlist, the HTTPS URLs it
 * implies (the https:// variant, or the entries of the playlist).
 * @returns {Promise<{playable: object[], error: string|null}>}
 */
export async function resolvePlayable(url, options) {
  const toHttps = (u) => u.replace(/^http:/i, 'https:');
  const probe = await probeStream(toHttps(url), options);
  if (probe.ok) return { playable: [probe], error: null };
  if (!probe.playlist?.length) return { playable: [], error: probe.error };

  const playable = [];
  let error = 'playlist without playable entries';
  for (const entry of probe.playlist.slice(0, 4)) {
    const inner = await probeStream(toHttps(entry), options);
    if (inner.ok) playable.push(inner);
    else error = `playlist entry: ${inner.error}`;
  }
  return { playable, error: playable.length ? null : error };
}

const IMAGE_SIGNATURES = [
  [0x89, 0x50, 0x4e, 0x47], // PNG
  [0xff, 0xd8, 0xff], // JPEG
  [0x47, 0x49, 0x46, 0x38], // GIF
  [0x52, 0x49, 0x46, 0x46], // RIFF (WebP)
  [0x00, 0x00, 0x01, 0x00], // ICO
];

/** Check that a logo URL serves an actual image over HTTPS. */
export async function probeImage(url, { timeoutMs = 10000 } = {}) {
  if (!/^https:\/\//i.test(url ?? '')) return { ok: false, error: 'not https' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': BROWSER_UA, Accept: 'image/*' },
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    if (!res.url.startsWith('https://')) return { ok: false, error: 'redirects to http' };
    const bytes = await readBytes(res, 64);
    const isImage =
      IMAGE_SIGNATURES.some((sig) => sig.every((b, i) => bytes[i] === b)) ||
      /^\s*(<\?xml|<svg)/i.test(Buffer.from(bytes).toString('latin1'));
    return isImage ? { ok: true } : { ok: false, error: 'not an image' };
  } catch (err) {
    return { ok: false, error: controller.signal.aborted ? 'timeout' : String(err.cause?.code || err.message) };
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const url of process.argv.slice(2)) {
    const probe = await probeStream(url);
    console.log(JSON.stringify(probe));
  }
}
