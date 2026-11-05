// utils/nonstopUtils.js - The station list for the "Non-stop radio" ad-break mode.
//
// The user's list is stored as station ids. Older versions stored station
// names in two keys (added stations + removed defaults); those are migrated
// once by loadNonstopIds().

import { DEFAULT_NONSTOP_IDS, getStation, resolveStationRefs } from '../data/stations.js';

const STORAGE_KEY = 'nonstop_station_ids';
const LEGACY_ADDED_KEY = 'custom_nonstop_stations';
const LEGACY_REMOVED_KEY = 'removed_default_stations';
const LEGACY_DEFAULTS = ['Alex FM Non Stop Hits', 'Non Stop AlexFM'];

const readJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

/** Configured ids (sync). Falls back to the defaults when nothing is stored. */
export function getNonstopIds() {
  const stored = readJson(STORAGE_KEY);
  const ids = Array.isArray(stored) ? stored.filter((id) => getStation(id)) : [];
  return ids.length ? ids : DEFAULT_NONSTOP_IDS;
}

export function setNonstopIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable: the list lasts for this session only.
  }
}

/** Configured ids, migrating the pre-id storage format if present. */
export async function loadNonstopIds() {
  const added = readJson(LEGACY_ADDED_KEY);
  const removed = readJson(LEGACY_REMOVED_KEY);
  if (!Array.isArray(added) && !Array.isArray(removed)) return getNonstopIds();

  // Same list the user had: old defaults they kept plus stations they added.
  const kept = LEGACY_DEFAULTS.filter((name) => !(removed ?? []).includes(name));
  const ids = await resolveStationRefs([...kept, ...(added ?? [])]);
  setNonstopIds(ids);
  localStorage.removeItem(LEGACY_ADDED_KEY);
  localStorage.removeItem(LEGACY_REMOVED_KEY);
  return ids;
}

let rotation = 0;

/**
 * Stations to try for the next ad break, in order. The starting point rotates
 * so consecutive breaks do not always play the same station; the rest of the
 * list follows as fallbacks in case a stream is down.
 */
export function getNonstopCandidates() {
  const stations = getNonstopIds().map(getStation).filter(Boolean);
  if (stations.length === 0) return [];
  const start = rotation++ % stations.length;
  return [...stations.slice(start), ...stations.slice(0, start)];
}
