// components/VisualizerSettings.jsx - Beautiful settings overlay for visualizer configuration
import React from 'react';

const VisualizerSettings = ({ 
  isOpen, 
  onClose, 
  visualizerType, 
  onVisualizerTypeChange,
  visualizerBlur,
  onVisualizerBlurChange
}) => {
  const visualizerTypes = [
        { 
      id: 'bars', 
      name: 'Frequency Bars', 
      description: 'Classic audio spectrum with smooth gradients',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="10" width="2.5" height="11" rx="1" fill="currentColor"/>
          <rect x="7" y="6" width="2.5" height="15" rx="1" fill="currentColor"/>
          <rect x="11" y="8" width="2.5" height="13" rx="1" fill="currentColor"/>
          <rect x="15" y="4" width="2.5" height="17" rx="1" fill="currentColor"/>
          <rect x="19" y="9" width="2.5" height="12" rx="1" fill="currentColor"/>
        </svg>
      ),
      preview: 'Dynamic frequency bars with beautiful color gradients and glow effects'
    },
    { 
      id: 'wavy', 
      name: 'Organic Waves', 
      description: 'Smooth flowing organic waves with particles',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>
          <path d="M2 17c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>
          <circle cx="8" cy="10" r="1" fill="currentColor"/>
          <circle cx="16" cy="14" r="1" fill="currentColor"/>
        </svg>
      ),
      preview: 'Beautiful flowing waves that respond to music with floating particles'
    },

    { 
      id: 'electric', 
      name: 'Electric Storm', 
      description: 'Sharp electric waves with lightning effects',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12L4 8L6 16L8 6L10 18L12 4L14 20L16 8L18 14L20 10L22 12"/>
          <path d="M6 2L8 6L10 2"/>
          <path d="M14 22L16 18L18 22"/>
        </svg>
      ),
      preview: 'Aggressive electric waveforms with dynamic lightning arcs'
    },
    { 
      id: 'none', 
      name: 'Disabled', 
      description: 'No visualization',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeWidth="3"/>
        </svg>
      ),
      preview: 'Turn off visualization completely'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-gray-600 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Visualizer Settings
            </h3>            <p className="text-gray-400 text-sm">
              Choose your visualizer type - it automatically moves between header and footer
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-200 hover:bg-gray-700 rounded-lg p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>        {/* Visualizer Type Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h4 className="text-lg font-semibold text-white">
              Visualizer Type
            </h4>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              Moves between header and footer
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {visualizerTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onVisualizerTypeChange(type.id)}
                className={`group p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  visualizerType === type.id
                    ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25'
                    : 'border-gray-600 bg-gray-700/50 hover:border-blue-400 hover:bg-gray-700'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`transition-colors ${
                    visualizerType === type.id ? 'text-blue-400' : 'text-gray-300 group-hover:text-blue-400'
                  }`}>
                    {type.icon}
                  </div>
                  <div className="text-center">
                    <span className={`text-sm font-semibold block ${
                      visualizerType === type.id ? 'text-blue-400' : 'text-white'
                    }`}>
                      {type.name}
                    </span>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {type.description}
                    </span>
                  </div>
                </div>
              </button>
            ))}          </div>
          
          {/* Footer Blur Settings */}
          <div className="mt-6 p-4 bg-gray-700/20 border border-gray-600/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <h5 className="text-md font-medium text-white">
                Footer Blur Effect
              </h5>
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                When scrolled down
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Blur Amount</span>
                <span className="text-sm text-blue-400 font-medium">{visualizerBlur}px</span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={visualizerBlur}
                  onChange={(e) => onVisualizerBlurChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(visualizerBlur / 8) * 100}%, #4b5563 ${(visualizerBlur / 8) * 100}%, #4b5563 100%)`
                  }}
                />
                <style jsx>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  }
                  .slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  }
                `}</style>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>Sharp (0px)</span>
                <span>Very Blurry (8px)</span>
              </div>
            </div>
          </div>
          
          {/* Info about single visualizer behavior */}
          <div className="mt-4 p-3 bg-gray-700/30 border border-gray-600/50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-300">
                  <strong>Smart positioning:</strong> The visualizer appears in the header when visible, 
                  and moves to the footer when you scroll down. This prevents audio issues and ensures 
                  smooth performance.
                </p>
              </div>
            </div>
          </div>
        </div>

     
      </div>
    </div>
  );
};

export default VisualizerSettings;