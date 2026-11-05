// Station data access. stations.json is the single source of truth; it is
// maintained with the scripts in scripts/stations (see docs/STATIONS.md).
//
// Station shape:
//   { id, name, category, genre, description, about?, website?, logo?,
//     location?, country?, nonstop?, streams: [{ url, cors? }] }

import stations from './stations.json';

export { CATEGORIES, GENRES } from './categories.js';

export const STATIONS = stations;

const byId = new Map(STATIONS.map((station) => [station.id, station]));

export const getStation = (id) => byId.get(id) ?? null;

// Shown first, in this order, on the "Populair" tab.
const POPULAR_IDS = [
  'npo-radio-2', 'radio-538', 'qmusic', 'sky-radio', 'radio-10', 'radio-veronica', '100-nl',
  'npo-radio-1', 'npo-3fm', 'slam', 'npo-funx', 'kink', 'joe', 'arrow-classic-rock', 'sublime',
  'bnr-nieuwsradio', 'npo-klassiek', 'npo-radio-5', 'radio-decibel', 'vibe-radio', 'joy-radio',
  'sky-radio-non-stop', 'qmusic-non-stop', 'radio-swiss-pop', 'radio-paradise',
];

export const POPULAR_STATIONS = POPULAR_IDS.map(getStation).filter(Boolean);

// Default rotation for the "Non-stop radio" ad-break mode: stations that run
// no commercials and (almost) no presenters. Users can change the list in the app.
export const DEFAULT_NONSTOP_IDS = [
  'radio-swiss-pop', 'fip-pop', 'radio-paradise', 'somafm-indie-pop-rocks',
].filter((id) => byId.has(id));

const normalizeName = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
const byName = new Map(STATIONS.map((station) => [normalizeName(station.name), station.id]));

/**
 * Map stored station references to current ids. Older versions stored station
 * names (favorites, custom non-stop list), so names - including names of
 * stations that were merged or renamed - are translated here.
 * @param {string[]} refs
 * @returns {Promise<string[]>} ids of stations that still exist, de-duplicated
 */
export async function resolveStationRefs(refs) {
  const unresolved = refs.filter((ref) => !byId.has(ref) && !byName.has(normalizeName(ref)));
  // The rename table is only needed once per browser, so keep it out of the main bundle.
  const legacy = unresolved.length ? (await import('./legacyStationNames.json')).default : {};
  const ids = refs.map((ref) => (byId.has(ref) ? ref : byName.get(normalizeName(ref)) ?? legacy[ref]));
  return [...new Set(ids.filter((id) => byId.has(id)))];
}
