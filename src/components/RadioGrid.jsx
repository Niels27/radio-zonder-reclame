import React from 'react';
import { radioStations } from '../utils/radioStations';
import LoadingIndicator from './LoadingIndicator';

const RadioGrid = ({ onStationSelect, currentStation, isLoading }) => {
  const stationList = Object.values(radioStations);

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">        <h1 className="text-3xl font-bold text-center mb-8">
          Nederlandse Radiozenders
        </h1>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-radio-dark p-6 rounded-lg">
              <LoadingIndicator message="Verbinding maken met radiozender..." />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stationList.map((station) => (
            <div
              key={station.name}
              className={`radio-card ${
                currentStation?.name === station.name ? 'active' : ''
              } ${isLoading && currentStation?.name === station.name ? 'opacity-50' : ''}`}
              onClick={() => onStationSelect(station)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-radio-accent rounded-full flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">
                    {station.name.charAt(0)}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg mb-1">{station.name}</h3>
                <p className="text-radio-secondary text-sm">{station.description}</p>
                  {currentStation?.name === station.name && (
                  <div className="mt-2 flex items-center text-radio-accent text-sm">
                    <div className="w-2 h-2 bg-radio-accent rounded-full mr-2 animate-pulse"></div>
                    Nu Aan Het Spelen
                  </div>
                )}
                
                {isLoading && currentStation?.name === station.name && (
                  <div className="mt-2 text-radio-secondary text-sm">
                    Laden...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
       
      </div>
    </div>
  );
};

export default RadioGrid;
