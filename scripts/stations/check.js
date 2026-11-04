// Verify every stream and logo in src/data/stations.json and repair the file.
//
//   npm run stations:check                 check everything, rewrite the file
//   npm run stations:check -- --dry-run    report only; exit code 1 if a station is dead
//   npm run stations:check -- --only npo-radio-1,qmusic
//   npm run stations:validate              schema check only, no network (used in CI)
//   --report                               also print one `REPORT {json}` line per changed station
//
// For each station:
//   - streams that fail twice are dropped; http:// and playlist (.pls/.m3u)
//     URLs are replaced by the playable HTTPS URL they lead to
//   - the `cors` flag is refreshed (the player only sets crossOrigin when true)
//   - logos that do not load as an HTTPS image are cleared (the UI shows initials)
//   - a station left without any playable stream is removed and logged in
//     docs/REMOVED_STATIONS.md

import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { probeImage, resolvePlayable } from './probe.js';
import {
  REMOVED_FILE, hostOf, mapConcurrent, readStations, validateStations, writeStations,
} from './lib.js';

const { values: args } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    only: { type: 'string' },
    validate: { type: 'boolean', default: false },
    report: { type: 'boolean', default: false },
    concurrency: { type: 'string', default: '16' },
  },
});
const concurrency = Number(args.concurrency);
const dryRun = args['dry-run'];

const stations = readStations();
const problems = validateStations(stations);
if (problems.length) {
  console.error(`stations.json is invalid:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
if (args.validate) {
  console.log(`stations.json is valid (${stations.length} stations).`);
  process.exit(0);
}

const onlyIds = args.only ? new Set(args.only.split(',')) : null;
const targets = onlyIds ? stations.filter((s) => onlyIds.has(s.id)) : stations;

const streamResults = await probeAll(
  [...new Set(targets.flatMap((s) => s.streams.map((x) => x.url)))],
  (url, timeoutMs) => resolvePlayable(url, { timeoutMs }),
  (r) => r.playable.length > 0,
  'streams',
);
const logoResults = await probeAll(
  [...new Set(targets.map((s) => s.logo).filter(Boolean))],
  (url, timeoutMs) => probeImage(url, { timeoutMs }),
  (r) => r.ok,
  'logos',
);

const removed = [];
let changedStreams = 0;
let clearedLogos = 0;

for (const station of targets) {
  const streams = [];
  const seen = new Set();
  for (const { url } of station.streams) {
    for (const p of streamResults.get(url).playable) {
      if (seen.has(p.url)) continue;
      seen.add(p.url);
      streams.push({ url: p.url, cors: p.cors });
    }
  }
  const streamsChanged =
    JSON.stringify(streams) !== JSON.stringify(station.streams.map(({ url, cors }) => ({ url, cors: !!cors })));
  if (streamsChanged) changedStreams++;
  const logoFailed = Boolean(station.logo && !logoResults.get(station.logo).ok);

  if (args.report && (streamsChanged || logoFailed)) {
    const errors = Object.fromEntries(station.streams.map(({ url }) => [url, streamResults.get(url).error]));
    console.log(`REPORT ${JSON.stringify({ id: station.id, streams, errors, logoFailed })}`);
  }

  if (streams.length === 0) {
    const reasons = station.streams.map(({ url }) => `${url} (${streamResults.get(url).error})`);
    removed.push({ station, reasons });
    continue;
  }
  station.streams = streams;

  if (logoFailed) {
    station.logo = null;
    clearedLogos++;
  }
}

console.log(
  `\n${targets.length} stations checked: ${targets.length - removed.length} playable, ` +
    `${removed.length} dead, ${changedStreams} with changed streams, ${clearedLogos} logos cleared.`,
);
for (const { station, reasons } of removed) console.log(`  dead: ${station.name}\n    ${reasons.join('\n    ')}`);

if (dryRun) {
  process.exit(removed.length ? 1 : 0);
}

const removedIds = new Set(removed.map((r) => r.station.id));
writeStations(stations.filter((s) => !removedIds.has(s.id)));
if (removed.length) appendRemoved(removed);
console.log('stations.json updated.');

/**
 * Probe every URL, then retry the failures once with a longer timeout so a
 * single slow or briefly unavailable server does not get a station removed.
 */
async function probeAll(urls, probe, isOk, label) {
  const results = new Map();
  const run = async (list, timeoutMs) => {
    let done = 0;
    await mapConcurrent(
      list,
      async (url) => {
        results.set(url, await probe(url, timeoutMs));
        if (++done % 50 === 0) process.stdout.write(`  ${label}: ${done}/${list.length}\r`);
      },
      { concurrency, perHost: 3, hostOf },
    );
  };
  await run(urls, 12000);
  const failed = urls.filter((u) => !isOk(results.get(u)));
  if (failed.length) {
    console.log(`  ${label}: retrying ${failed.length} failures`);
    await run(failed, 20000);
  }
  console.log(`  ${label}: ${urls.filter((u) => isOk(results.get(u))).length}/${urls.length} OK`);
  return results;
}

function appendRemoved(entries) {
  const date = new Date().toISOString().slice(0, 10);
  const rows = entries.map(({ station, reasons }) =>
    `| ${date} | ${escapeCell(station.name)} | ${station.category} | ${escapeCell(reasons.join('<br>'))} |`,
  );
  fs.appendFileSync(REMOVED_FILE, `${rows.join('\n')}\n`);
}

function escapeCell(text) {
  return String(text).replace(/\|/g, '\\|');
}
