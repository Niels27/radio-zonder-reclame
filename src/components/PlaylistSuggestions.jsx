import React from 'react';

const PlaylistSuggestions = ({ onSelectPlaylist, onClose }) => {
  const suggestedPlaylists = [
    {
      name: 'YouTube Music Top Charts',
      url: 'https://youtube.com/playlist?list=PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI',
      description: 'Populaire muziek van YouTube Music'
    },
    {
      name: 'YouTube Audio Library - Popular',
      url: 'https://youtube.com/playlist?list=PLrqH1_6zd_A_4rONHTSh2c-Sj2PShcTFa',
      description: 'Gratis muziek van YouTube Audio Library'
    },
    {
      name: 'Top 40 Hits 2024',
      url: 'https://youtube.com/playlist?list=PLp4d_5DLCMJSuBbp0JMjJAp-JLY3L2o_e',
      description: 'Actuele hitparade'
    },
    {
      name: 'Chill Electronic Music',
      url: 'https://youtube.com/playlist?list=PLu8u1Y8b7LM3I6b6vLJJkT3TZN4q0q2z7',
      description: 'Ontspannende elektronische muziek'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Probeer deze playlists</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-yellow-900 bg-opacity-50 rounded-lg border border-yellow-600">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-400 mb-1">Waarom kan ik mijn playlist niet afspelen?</h4>
              <p className="text-yellow-100 text-sm">
                De eigenaar van de playlist heeft embedding uitgeschakeld. Dit betekent dat de playlist niet afgespeeld kan worden op externe websites zoals deze.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {suggestedPlaylists.map((playlist, index) => (
            <div
              key={index}
              className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => onSelectPlaylist(playlist.url)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">{playlist.name}</h4>
                  <p className="text-gray-300 text-sm">{playlist.description}</p>
                </div>
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="font-semibold text-white mb-2">💡 Tips voor het kiezen van playlists:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Kies playlists van officiële YouTube kanalen</li>
            <li>• Zoek naar playlists met veel views en likes</li>
            <li>• Vermijd privé playlists</li>
            <li>• Maak je eigen playlist met publieke video's</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlaylistSuggestions;
