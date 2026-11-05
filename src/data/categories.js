// Station taxonomy. Every station in stations.json has exactly one category
// (what kind of broadcaster it is) and one genre (what it mostly plays).
// Plain ESM without JSX so the Node scripts in scripts/stations can import it.

export const CATEGORIES = [
  { key: 'npo', label: 'NPO', description: 'Landelijke publieke omroep en NPO-themakanalen' },
  { key: 'commercial', label: 'Commercieel', description: 'Landelijke commerciële zenders (FM en DAB+)' },
  { key: 'themes', label: 'Thematisch', description: 'Online themakanalen van de landelijke commerciële zenders' },
  { key: 'regional', label: 'Regionaal', description: 'Regionale publieke omroepen en regionale commerciële zenders' },
  { key: 'local', label: 'Lokaal', description: 'Lokale publieke omroepen en stadszenders' },
  { key: 'online', label: 'Web', description: 'Nederlandse internetzenders' },
  { key: 'religious', label: 'Religieus', description: 'Christelijke en andere religieuze zenders' },
  { key: 'global', label: 'Global', description: 'Gratis zenders uit de rest van de wereld' },
];

export const GENRES = [
  { key: 'hits', label: 'Pop & hits' },
  { key: 'dance', label: 'Dance' },
  { key: 'rock', label: 'Rock & alternatief' },
  { key: 'gold', label: 'Gold & oldies' },
  { key: 'dutch', label: 'Nederlandstalig' },
  { key: 'urban', label: 'Urban & hiphop' },
  { key: 'jazz-soul', label: 'Jazz & soul' },
  { key: 'classical', label: 'Klassiek' },
  { key: 'chill', label: 'Chill & lounge' },
  { key: 'talk', label: 'Nieuws & talk' },
  { key: 'world', label: 'Wereldmuziek' },
  { key: 'mixed', label: 'Gevarieerd' },
];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);
export const GENRE_KEYS = GENRES.map((g) => g.key);
