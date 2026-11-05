// components/NonstopSettingsOverlay.jsx - Edit the station list used by the
// "Non-stop radio" ad-break mode.

import React, { useEffect, useMemo, useState } from 'react';
import { DEFAULT_NONSTOP_IDS, STATIONS, getStation } from '../data/stations.js';
import { getNonstopIds, loadNonstopIds, setNonstopIds } from '../utils/nonstopUtils.js';
import { notify } from '../utils/eventBus';

const MAX_RESULTS = 20;

const PlayIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
);
const CloseIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const NonstopSettingsOverlay = ({ isOpen, onClose, audioPlayer }) => {
  const [ids, setIds] = useState(getNonstopIds);
  const [query, setQuery] = useState('');
  const [testingId, setTestingId] = useState(null);

  useEffect(() => {
    loadNonstopIds().then(setIds);
  }, []);

  const updateIds = (next) => {
    setIds(next);
    setNonstopIds(next);
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return STATIONS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    ).slice(0, MAX_RESULTS);
  }, [query]);

  const add = (id) => {
    if (!ids.includes(id)) updateIds([...ids, id]);
    setQuery('');
  };

  const remove = (id) => {
    if (ids.length <= 1) {
      notify('Er moet minstens 1 zender in de lijst staan', 'warning', 3000);
      return;
    }
    updateIds(ids.filter((x) => x !== id));
  };

  const test = async (station) => {
    if (!audioPlayer?.playRadio || testingId) return;
    setTestingId(station.id);
    try {
      const ok = await audioPlayer.playRadio(station);
      if (!ok) notify(`Kan ${station.name} niet afspelen`, 'error', 3000);
    } finally {
      setTestingId(null);
    }
  };

  if (!isOpen) return null;

  const testButton = (station, color) => (
    <button
      onClick={() => test(station)}
      disabled={Boolean(testingId)}
      title="Test deze zender"
      className={`px-2 py-1 text-white text-xs rounded transition-colors flex items-center gap-1 ${
        testingId === station.id ? 'bg-yellow-600 cursor-wait'
          : testingId ? 'bg-gray-600 cursor-not-allowed'
            : color
      }`}
    >
      <PlayIcon />
      {testingId === station.id ? 'Testen...' : 'Test'}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-lg border border-gray-600 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Non-stop zenders</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white" title="Sluiten">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Tijdens een reclamepauze wordt de volgende zender uit deze lijst gespeeld. Werkt een zender
          niet, dan wordt automatisch de volgende geprobeerd.
        </p>

        <div className="mb-6 space-y-2">
          {ids.map(getStation).filter(Boolean).map((station) => (
            <div key={station.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                {DEFAULT_NONSTOP_IDS.includes(station.id) && (
                  <span className="text-green-400 text-xs bg-green-600/20 px-2 py-1 rounded">Standaard</span>
                )}
                <div className="min-w-0">
                  <div className="text-white font-medium truncate">{station.name}</div>
                  <div className="text-gray-400 text-sm truncate">{station.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {testButton(station, 'bg-blue-600 hover:bg-blue-500')}
                <button onClick={() => remove(station.id)} className="text-red-400 hover:text-red-300 p-1" title="Verwijderen">
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => updateIds(DEFAULT_NONSTOP_IDS)}
            className="text-xs text-gray-400 hover:text-white underline"
          >
            Standaardlijst herstellen
          </button>
        </div>

        <h4 className="text-lg font-medium text-white mb-3">Zender toevoegen</h4>
        <input
          type="text"
          placeholder="Zoek zenders..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full mb-4 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
        {query.trim() && (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {results.map((station) => (
              <div key={station.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="min-w-0">
                  <div className="text-white font-medium truncate">{station.name}</div>
                  <div className="text-gray-400 text-sm truncate">{station.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  {testButton(station, 'bg-green-600 hover:bg-green-500')}
                  <button
                    onClick={() => add(station.id)}
                    disabled={ids.includes(station.id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded"
                  >
                    {ids.includes(station.id) ? 'Toegevoegd' : 'Toevoegen'}
                  </button>
                </div>
              </div>
            ))}
            {results.length === 0 && <div className="text-gray-400 text-center py-4">Geen resultaten gevonden</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default NonstopSettingsOverlay;
