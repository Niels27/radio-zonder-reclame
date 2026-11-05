// components/RadioGrid.jsx - Station browser: category tabs, genre filter,
// search and the grid of station cards.

import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Search, X, ExternalLink } from 'lucide-react';
import { CATEGORIES, GENRES, POPULAR_STATIONS, STATIONS } from '../data/stations.js';
import { useFavorites } from '../hooks/useFavorites';

const TABS = [
  { key: 'popular', label: 'Populair' },
  { key: 'favorites', label: 'Favorieten' },
  { key: 'all', label: 'Alle zenders' },
  ...CATEGORIES.filter((c) => c.key !== 'global'),
  { key: 'nonstop', label: 'Non-stop', description: 'Doorlopend muziek, zonder presentatie' },
  CATEGORIES.find((c) => c.key === 'global'),
];
const TAB_KEYS = new Set(TABS.map((t) => t.key));
const GENRE_LABELS = Object.fromEntries(GENRES.map((g) => [g.key, g.label]));
const TAB_STORAGE_KEY = 'radio_selected_category';

function loadTab() {
  try {
    const saved = JSON.parse(localStorage.getItem(TAB_STORAGE_KEY));
    return TAB_KEYS.has(saved) ? saved : 'popular';
  } catch {
    return 'popular';
  }
}

function saveTab(key) {
  try {
    localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(key));
  } catch {
    // Not persisted; harmless.
  }
}

function stationsForTab(tab, favorites) {
  switch (tab) {
    case 'popular': return POPULAR_STATIONS;
    case 'all': return STATIONS;
    case 'nonstop': return STATIONS.filter((s) => s.nonstop);
    case 'favorites': {
      const byId = new Map(STATIONS.map((s) => [s.id, s]));
      return favorites.map((id) => byId.get(id)).filter(Boolean);
    }
    default: return STATIONS.filter((s) => s.category === tab);
  }
}

function matchesQuery(station, query) {
  return (
    station.name.toLowerCase().includes(query) ||
    station.description.toLowerCase().includes(query) ||
    station.location?.toLowerCase().includes(query)
  );
}

const initials = (name) => {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length >= 2 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
};

const StationLogo = ({ station }) => {
  const [failed, setFailed] = useState(false);
  if (station.logo && !failed) {
    return (
      <img
        src={station.logo}
        alt=""
        loading="lazy"
        className="w-full h-full max-w-16 max-h-16 object-contain"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
      {initials(station.name)}
    </div>
  );
};

const StationCard = memo(function StationCard({
  station, isActive, isPlaying, isConnecting, isFavorite, onSelect, onToggleFavorite,
}) {
  const nameRef = useRef(null);
  const descriptionRef = useRef(null);

  // Long names/descriptions scroll on hover. Overflow is measured only for the
  // hovered card, so a grid of a thousand cards does not measure on render.
  const markOverflow = () => {
    const name = nameRef.current;
    const description = descriptionRef.current;
    name?.classList.toggle('text-overflow', name.scrollHeight > name.clientHeight + 2);
    description?.classList.toggle('text-overflow', description.scrollWidth > description.clientWidth);
  };

  const tooltip = [station.about || station.description, station.location].filter(Boolean).join(' - ');

  return (
    <div
      onClick={() => onSelect(station)}
      onMouseEnter={markOverflow}
      className={`radio-card relative overflow-hidden aspect-square group ${isActive ? 'active' : ''} ${
        isPlaying ? 'playing' : ''
      }`}
    >
      <div className="station-logo h-1/2 mb-2 flex items-center justify-center p-2">
        <StationLogo station={station} />
      </div>

      <div className="px-2 mb-1 flex-1 flex items-center">
        <div ref={nameRef} title={tooltip} className="station-name leading-tight font-medium text-white w-full text-center">
          {station.name}
          {station.website && (
            <a
              href={station.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hidden group-hover:inline-flex items-center align-middle ml-1 p-0.5 rounded-full hover:bg-black/30"
              title={`Website van ${station.name}`}
            >
              <ExternalLink className="w-3 h-3 text-gray-300" />
            </a>
          )}
        </div>
      </div>

      <div className="px-2 mb-2">
        <div ref={descriptionRef} className="station-description text-gray-400 text-xs w-full text-center">
          {station.description}
        </div>
      </div>

      {isConnecting && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500" />
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(station.id);
        }}
        className={`card-corner-btn absolute top-1 right-1 p-1 rounded-full bg-black/30 hover:bg-black/50 transition-colors focus:opacity-100 ${
          isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        title={isFavorite ? 'Uit favorieten verwijderen' : 'Aan favorieten toevoegen'}
      >
        <svg className={`w-3 h-3 ${isFavorite ? 'text-yellow-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    </div>
  );
});

const RadioGrid = ({ onStationSelect, currentStation, isLoading, isPlaying }) => {
  const [tab, setTab] = useState(loadTab);
  const [genre, setGenre] = useState(null);
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const searching = query.trim().length > 0;
  // A search always covers every station; the selected tab comes back when it is cleared.
  const activeTab = searching ? 'all' : tab;

  const tabStations = useMemo(() => {
    const list = stationsForTab(activeTab, favorites);
    const q = query.trim().toLowerCase();
    return q ? list.filter((s) => matchesQuery(s, q)) : list;
  }, [activeTab, favorites, query]);

  const genresInTab = useMemo(() => {
    const present = new Set(tabStations.map((s) => s.genre));
    return GENRES.filter((g) => present.has(g.key));
  }, [tabStations]);

  const visibleStations = genre ? tabStations.filter((s) => s.genre === genre) : tabStations;

  const selectTab = (key) => {
    setTab(key);
    setGenre(null);
    setQuery('');
    saveTab(key);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setQuery('');
  };

  // Stable callback so memoized cards don't re-render on every parent render
  // (the app re-renders every second while the ad-break countdown runs).
  const latest = useRef({ isLoading, onStationSelect });
  latest.current = { isLoading, onStationSelect };
  const handleSelect = useCallback((station) => {
    if (!latest.current.isLoading) latest.current.onStationSelect(station);
  }, []);

  const tabInfo = TABS.find((t) => t.key === activeTab);

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Radiozenders</h1>
          {showSearch ? (
            <div className="flex items-center gap-2 bg-radio-dark rounded-lg px-4 py-2">
              <Search size={16} className="text-radio-secondary" />
              <input
                type="text"
                placeholder="Zoek op naam, genre of plaats..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setGenre(null);
                }}
                onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                className="bg-transparent border-none outline-none text-white placeholder-radio-secondary min-w-64"
                autoFocus
              />
              <button onClick={closeSearch} className="text-radio-secondary hover:text-white transition-colors" title="Sluiten">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              id="search-icon"
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-lg bg-radio-card text-radio-text hover:bg-radio-hover transition-colors"
              title="Zoeken"
            >
              <Search size={20} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map(({ key, label, description }) => (
            <button
              key={key}
              onClick={() => selectTab(key)}
              title={description}
              className={`px-[14px] py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === key ? 'bg-radio-accent text-white' : 'bg-radio-dark text-white hover:bg-gray-700'
              }`}
            >
              {label}
              {key === 'favorites' && favorites.length > 0 && (
                <span className="ml-2 bg-radio-accent/20 text-radio-accent px-2 py-0.5 rounded-full text-xs">
                  {favorites.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {genresInTab.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {[{ key: null, label: 'Alle genres' }, ...genresInTab].map(({ key, label }) => (
              <button
                key={key ?? 'all'}
                onClick={() => setGenre(key)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  genre === key ? 'bg-gray-200 text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {activeTab !== 'popular' && (
          <div className="mb-4 text-radio-secondary text-sm">
            {visibleStations.length} {visibleStations.length === 1 ? 'zender' : 'zenders'}
            {genre && ` in ${GENRE_LABELS[genre]}`}
            {searching ? ' gevonden in alle categorieën' : tabInfo?.description && ` - ${tabInfo.description}`}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
          {visibleStations.map((station) => {
            const isActive = currentStation?.id === station.id;
            return (
              <StationCard
                key={station.id}
                station={station}
                isActive={isActive}
                isPlaying={isActive && isPlaying}
                isConnecting={isActive && isLoading}
                isFavorite={isFavorite(station.id)}
                onSelect={handleSelect}
                onToggleFavorite={toggleFavorite}
              />
            );
          })}
        </div>

        {visibleStations.length === 0 && (
          <div className="text-center py-12 text-radio-secondary">
            <div className="text-lg mb-2">
              {activeTab === 'favorites' ? 'Nog geen favorieten' : 'Geen zenders gevonden'}
            </div>
            <div className="text-sm">
              {activeTab === 'favorites'
                ? 'Klik op de ster van een zender om hem hier te bewaren.'
                : 'Probeer een andere zoekterm of categorie.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RadioGrid;
