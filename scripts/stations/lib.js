// Shared helpers for the station scripts: reading, validating and writing
// src/data/stations.json in one canonical format so diffs stay small.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORY_KEYS, GENRE_KEYS } from '../../src/data/categories.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const STATIONS_FILE = path.join(ROOT, 'src/data/stations.json');
export const REMOVED_FILE = path.join(ROOT, 'docs/REMOVED_STATIONS.md');

const FIELD_ORDER = [
  'id', 'name', 'category', 'genre', 'description', 'about', 'website', 'logo',
  'location', 'country', 'nonstop', 'streams',
];

export function readStations() {
  return JSON.parse(fs.readFileSync(STATIONS_FILE, 'utf8'));
}

/** Write stations sorted by category, then name, with a fixed field order. */
export function writeStations(stations) {
  const sorted = [...stations].sort(
    (a, b) =>
      CATEGORY_KEYS.indexOf(a.category) - CATEGORY_KEYS.indexOf(b.category) ||
      a.name.localeCompare(b.name, 'nl', { sensitivity: 'base' }),
  );
  const normalized = sorted.map((station) => {
    const out = {};
    for (const key of FIELD_ORDER) {
      const value = station[key];
      if (value === undefined || value === null || value === '' || value === false) continue;
      out[key] = key === 'streams' ? value.map(({ url, cors }) => (cors ? { url, cors } : { url })) : value;
    }
    return out;
  });
  fs.writeFileSync(STATIONS_FILE, `${JSON.stringify(normalized, null, 2)}\n`);
}

/** URL-safe id from a station name: "100% NL" -> "100-nl", "Omrop Fryslân" -> "omrop-fryslan". */
function slugify(name) {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' en ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Returns a list of problems; empty means the file is valid. */
export function validateStations(stations) {
  const problems = [];
  const ids = new Set();
  const names = new Set();
  for (const s of stations) {
    const where = `"${s.name ?? s.id ?? '?'}"`;
    if (!s.id || s.id !== slugify(s.id)) problems.push(`${where}: invalid id "${s.id}"`);
    if (ids.has(s.id)) problems.push(`${where}: duplicate id "${s.id}"`);
    ids.add(s.id);
    if (!s.name) problems.push(`${where}: missing name`);
    if (names.has(s.name?.toLowerCase())) problems.push(`${where}: duplicate name`);
    names.add(s.name?.toLowerCase());
    if (!CATEGORY_KEYS.includes(s.category)) problems.push(`${where}: unknown category "${s.category}"`);
    if (!GENRE_KEYS.includes(s.genre)) problems.push(`${where}: unknown genre "${s.genre}"`);
    if (!s.description) problems.push(`${where}: missing description`);
    if (!Array.isArray(s.streams) || s.streams.length === 0) problems.push(`${where}: no streams`);
    for (const stream of s.streams ?? []) {
      if (!/^https:\/\//.test(stream.url)) problems.push(`${where}: stream is not https: ${stream.url}`);
    }
    for (const key of ['logo', 'website']) {
      if (s[key] && !/^https?:\/\//.test(s[key])) problems.push(`${where}: invalid ${key}`);
    }
    if (s.logo && !s.logo.startsWith('https://')) problems.push(`${where}: logo is not https`);
  }
  return problems;
}

/** Run async `worker` over `items` with a global and a per-host concurrency cap. */
export async function mapConcurrent(items, worker, { concurrency = 16, perHost = 3, hostOf = () => '' } = {}) {
  const results = new Array(items.length);
  const queue = items.map((item, index) => ({ item, index }));
  const active = new Map();
  let running = 0;

  await new Promise((resolve) => {
    const next = () => {
      if (queue.length === 0 && running === 0) return resolve();
      for (let i = 0; i < queue.length && running < concurrency; ) {
        const host = hostOf(queue[i].item);
        if ((active.get(host) ?? 0) >= perHost) {
          i++;
          continue;
        }
        const { item, index } = queue.splice(i, 1)[0];
        running++;
        active.set(host, (active.get(host) ?? 0) + 1);
        Promise.resolve(worker(item, index))
          .then((value) => (results[index] = value))
          .catch((error) => (results[index] = { error }))
          .finally(() => {
            running--;
            active.set(host, active.get(host) - 1);
            next();
          });
      }
    };
    next();
  });
  return results;
}

export const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};
