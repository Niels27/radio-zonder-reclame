// components/NonstopSettingsOverlay.jsx - Nonstop radio station management overlay
// Extracted from AdBreakSettings.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { allRadioStations } from '../data/allRadioStations.js';
import { refreshNonstopStations } from '../utils/nonstopUtils.js';
import { notify } from '../utils/eventBus';

const NonstopSettingsOverlay = ({
  isOpen,
  onClose,
  audioPlayer
}) => {
  const [nonstopSearchTerm, setNonstopSearchTerm] = useState('');
  const [nonstopRemovalError, setNonstopRemovalError] = useState('');
  const [testingStation, setTestingStation] = useState(null);
  const [customNonstopStations, setCustomNonstopStations] = useState(() => {
    try {
      const saved = localStorage.getItem('custom_nonstop_stations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save custom nonstop stations
  useEffect(() => {
    try {
      localStorage.setItem('custom_nonstop_stations', JSON.stringify(customNonstopStations));
      refreshNonstopStations();
    } catch (error) {
      console.warn('Failed to save custom nonstop stations:', error);
    }
  }, [customNonstopStations]);

  // Get all available radio stations for search
  const getAllRadioStationsForSearch = () => {
    const allStations = [];
    Object.entries(allRadioStations).forEach(([category, stations]) => {
      if (category !== 'realnonstop') {
        Object.values(stations).forEach(station => {
          allStations.push({ ...station, category });
        });
      }
    });
    return allStations;
  };

  // Get default nonstop stations from realnonstop category
  const getDefaultNonstopStations = () => {
    const removedDefaults = JSON.parse(localStorage.getItem('removed_default_stations') || '[]');
    return Object.values(allRadioStations.realnonstop || {})
      .filter(station => !removedDefaults.includes(station.name));
  };

  // Get combined list of all configured nonstop stations
  const getAllConfiguredNonstopStations = () => {
    const defaultStations = getDefaultNonstopStations();
    const customStations = [];

    customNonstopStations.forEach(stationName => {
      let foundStation = null;
      Object.entries(allRadioStations).forEach(([category, stations]) => {
        if (category !== 'realnonstop') {
          Object.values(stations).forEach(station => {
            if (station.name === stationName) {
              foundStation = { ...station, isCustom: true };
            }
          });
        }
      });
      if (foundStation) customStations.push(foundStation);
    });

    const defaultWithFlag = defaultStations.map(station => ({ ...station, isDefault: true }));
    return [...defaultWithFlag, ...customStations];
  };

  // Filter stations based on search term
  const getFilteredStations = () => {
    if (!nonstopSearchTerm.trim()) return [];
    const allStations = getAllRadioStationsForSearch();
    return allStations.filter(station =>
      station.name.toLowerCase().includes(nonstopSearchTerm.toLowerCase()) ||
      station.description?.toLowerCase().includes(nonstopSearchTerm.toLowerCase())
    ).slice(0, 20);
  };

  const addNonstopStation = (stationName) => {
    if (!customNonstopStations.includes(stationName)) {
      setCustomNonstopStations([...customNonstopStations, stationName]);
    }
  };

  const removeNonstopStation = (stationName) => {
    const defaultStations = getDefaultNonstopStations();
    const totalStations = defaultStations.length + customNonstopStations.length;
    const isDefaultStation = defaultStations.some(station => station.name === stationName);

    if (isDefaultStation) {
      if (totalStations <= 1) {
        setNonstopRemovalError('Er moet minstens 1 radio zijn ingesteld');
        setTimeout(() => setNonstopRemovalError(''), 3000);
        return;
      }
      const removedDefaults = JSON.parse(localStorage.getItem('removed_default_stations') || '[]');
      if (!removedDefaults.includes(stationName)) {
        removedDefaults.push(stationName);
        localStorage.setItem('removed_default_stations', JSON.stringify(removedDefaults));
      }
      setCustomNonstopStations([...customNonstopStations]);
      notify(`Standaard station weggehaald: ${stationName}`, 'info', 3000);
    } else {
      if (totalStations <= 1) {
        setNonstopRemovalError('Er moet minstens 1 radio zijn ingesteld');
        setTimeout(() => setNonstopRemovalError(''), 3000);
        return;
      }
      setCustomNonstopStations(customNonstopStations.filter(name => name !== stationName));
      notify(`Custom station verwijderd: ${stationName}`, 'info', 3000);
    }
    setNonstopRemovalError('');
  };

  const testStation = async (station) => {
    if (!audioPlayer?.playRadio || testingStation) return;

    setTestingStation(station.name);
    try {
      const success = await audioPlayer.playRadio(station);
      if (success) {
        notify(`Test: ${station.name}`, 'info', 3000);
      } else {
        notify(`Kan ${station.name} niet afspelen`, 'error', 3000);
      }
    } catch (error) {
      notify(`Fout bij testen ${station.name}: ${error.message}`, 'error', 3000);
    } finally {
      setTestingStation(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-end mb-6">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

       {/* <div className="mb-4 p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            Tijdens een reclamepauze wordt automatisch gewisseld tussen deze radio stations in willekeurige volgorde.
          </p>
        </div>*/}
        {nonstopRemovalError && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg">
            <p className="text-red-300 text-sm">{nonstopRemovalError}</p>
          </div>
        )}

        {/* Configured stations */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-3">Geconfigureerde Non-stop Stations</h4>
          <div className="space-y-2">
            {getAllConfiguredNonstopStations().map((station) => (
              <div key={station.name} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  {station.isDefault && (
                    <span className="text-green-400 text-xs bg-green-600/20 px-2 py-1 rounded">Standaard</span>
                  )}
                  <div>
                    <div className="text-white font-medium">{station.name}</div>
                    <div className="text-gray-400 text-sm">{station.description || 'Non-stop muziek'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => testStation(station)}
                    disabled={!!testingStation}
                    className={`px-2 py-1 text-white text-xs rounded transition-colors ${
                      testingStation === station.name
                        ? 'bg-yellow-600 cursor-wait'
                        : testingStation
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-500'
                    }`}
                    title="Test dit station"
                  >
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {testingStation === station.name ? 'Testen...' : 'Test'}
                    </div>
                  </button>
                  <button
                    onClick={() => removeNonstopStation(station.name)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Verwijderen"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and add */}
        <div>
          <h4 className="text-lg font-medium text-white mb-3">Station Toevoegen</h4>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Zoek radio stations..."
              value={nonstopSearchTerm}
              onChange={(e) => setNonstopSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          {nonstopSearchTerm.trim() && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {getFilteredStations().map((station) => {
                const isAlreadyConfigured = getAllConfiguredNonstopStations().some(s => s.name === station.name);
                return (
                  <div key={`${station.category}-${station.name}`} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{station.name}</div>
                      <div className="text-gray-400 text-sm">{station.description || station.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => testStation(station)}
                        disabled={!!testingStation}
                        className={`px-2 py-1 text-white text-xs rounded transition-colors ${
                          testingStation === station.name
                            ? 'bg-yellow-600 cursor-wait'
                            : testingStation
                              ? 'bg-gray-600 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-500'
                        }`}
                        title="Test dit station"
                      >
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          {testingStation === station.name ? 'Testen...' : 'Test'}
                        </div>
                      </button>
                      <button
                        onClick={() => { addNonstopStation(station.name); setNonstopSearchTerm(''); }}
                        disabled={isAlreadyConfigured}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded"
                      >
                        {isAlreadyConfigured ? 'Toegevoegd' : 'Toevoegen'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {getFilteredStations().length === 0 && (
                <div className="text-gray-400 text-center py-4">Geen resultaten gevonden</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NonstopSettingsOverlay;
