// components/RadioGrid.jsx - Ensure proper favorites integration
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\components\RadioGrid.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Star } from 'lucide-react';
import LoadingIndicator from './LoadingIndicator';
import { useFavorites } from '../hooks/useFavorites';
import { LogoFallback } from '../utils/logoFallback.js';
import { getBestLogoUrl, getLogoFallbacks, shouldMonitorLogo, logFailedLogo, getFailedLogos } from '../utils/logoManager.js';
import { allRadioStations, isPopularStation, getPopularStations } from '../data/allRadioStations.js';
import { RadioStreamTester } from '../utils/radioStreamTester';
// Import the failed stations from the codebase file
import { isFailedStation } from '../data/failedStations.js';

const categories = [
    { key: 'all', label: 'Alle stations' },
    { key: 'popular', label: 'Populair' },
    { key: 'favorites', label: 'Favorieten' },
    { key: 'public', label: 'Publiek' },
    { key: 'commercial', label: 'Commercieel' },
    { key: 'news', label: 'Nieuws' },
    { key: 'regional', label: 'Regionaal' },
    { key: 'local', label: 'Lokaal' },
    { key: 'religious', label: 'Religieus' },
    { key: 'specialty', label: 'Specialiteit' },
    { key: 'nonstop', label: 'Non-stop' },
     { key: 'realnonstop', label: '' }
  ];
// Progressive Logo Component with Fallback Support
const StationLogo = ({ station, className = "w-full h-full" }) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [hasTriedOriginal, setHasTriedOriginal] = useState(false);
  
  const logoUrls = useMemo(() => {
    const urls = [];
    
    // First try the premium logo from logoManager
    const bestUrl = getBestLogoUrl(station);
    if (bestUrl) {
      urls.push(bestUrl);
    }
    
    // Then try original station logos if they exist
    if (station.logo && station.logo !== bestUrl) {
      urls.push(station.logo);
    }
    if (station.favicon && station.favicon !== bestUrl && station.favicon !== station.logo) {
      urls.push(station.favicon);
    }
    
    // Add fallback URLs only if we don't have any original logos
    if (urls.length === 0) {
      urls.push(...getLogoFallbacks(station));
    }
    
    return urls.filter(Boolean);
  }, [station]);
  
  const currentUrl = logoUrls[currentUrlIndex];
  
  const handleImageError = async (error) => {
   // console.log(`Logo failed for ${station.name}: ${currentUrl}`, error);
    
    /* Log failed logo for monitoring if it's a priority station
    if (shouldMonitorLogo(station)) {
      logFailedLogo(station, currentUrl, error?.toString() || 'Unknown error');
    }*/
    
    // Try next URL in fallback chain
    if (currentUrlIndex < logoUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setImageError(false);
      setHasTriedOriginal(true);
    } else {
      // All URLs failed, show fallback
      setImageError(true);
      setHasTriedOriginal(true);
    }
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  // Reset when station changes
  useEffect(() => {
    setCurrentUrlIndex(0);
    setImageError(false);
    setHasTriedOriginal(false);
  }, [station.name]);

  // If we have a logo URL and haven't failed, show image
  if (currentUrl && !imageError) {
    return (
      <img
        src={currentUrl}
        alt={`${station.name} logo`}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  // Only show text fallback if we've actually tried the original logos and they failed
  if (imageError || (hasTriedOriginal && logoUrls.length === 0)) {
    // Generate a nice blue circle with initials (like before)
    return (
      <div 
        className={`${className} bg-blue-600 rounded-full flex items-center justify-center text-white font-bold`}
        style={{ fontSize: '1.5rem' }}
      >
        {LogoFallback.getLogoText(station.name)}
      </div>
    );
  }

  // Loading state - show blue circle while checking
  return (
    <div 
      className={`${className} bg-blue-600 rounded-full flex items-center justify-center text-white font-bold animate-pulse`}
      style={{ fontSize: '1.5rem' }}
    >
      {LogoFallback.getLogoText(station.name)}
    </div>
  );
};

// Update SmartText component to better detect overflow
const SmartText = ({ text, className, isName = false }) => {
  const [shouldScroll, setShouldScroll] = useState(false);
  const textRef = React.useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const element = textRef.current;
        // For station names (2 lines), check if content exceeds the height
        if (isName) {
          const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
          const maxHeight = lineHeight * 2; // 2 lines
          setShouldScroll(element.scrollHeight > maxHeight + 2); // +2 for tolerance
        } else {
          // For descriptions (1 line), check horizontal overflow
          setShouldScroll(element.scrollWidth > element.clientWidth);
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text, isName]);

  return (
    <div className={`${isName ? 'px-2 mb-1 flex-1 flex items-center' : 'px-2 mb-2'}`}>
      <div 
        ref={textRef}
        className={`${className} ${shouldScroll ? 'text-overflow' : ''} w-full text-center`}
      >
        {text}
      </div>
    </div>
  );
};

// Update the RadioGrid component to cache selected category:

const RadioGrid = ({ onStationSelect, currentStation, isLoading, isPlaying }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Load selected category from cache, default to 'popular'
  const [selectedCategory, setSelectedCategory] = useState(() => {
    try {
      const saved = localStorage.getItem('radio_selected_category');
      return saved ? JSON.parse(saved) : 'popular';
    } catch {
      return 'popular';
    }
  });
  
  const [previousCategory, setPreviousCategory] = useState(() => {
    try {
      const saved = localStorage.getItem('radio_previous_category');
      return saved ? JSON.parse(saved) : 'popular';
    } catch {
      return 'popular';
    }
  });
  
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // Cache selected category when it changes
  useEffect(() => {
    try {
      localStorage.setItem('radio_selected_category', JSON.stringify(selectedCategory));
    } catch (error) {
      console.warn('Failed to save selected category:', error);
    }
  }, [selectedCategory]);

  // Debug effect to monitor favorites changes
  useEffect(() => {
    console.log('RadioGrid - Favorites changed:', favorites);
  }, [favorites]);

  // Logo monitoring - expose functions to global console for debugging
  useEffect(() => {
    window.radioLogoDebug = {
      getFailedLogos: () => {
        try {
          return getFailedLogos();
        } catch (error) {
          console.error('Error getting failed logos:', error);
          return [];
        }
      },
      logStats: () => {
        try {
          const failed = getFailedLogos();
          return {
            totalFailed: failed.length,
            failedStations: failed.map(f => f.stationName),
            lastFailures: failed.slice(-5)
          };
        } catch (error) {
          console.error('Error getting logo stats:', error);
          return { error: error.message };
        }
      }
    };

    return () => {
      delete window.radioLogoDebug;
    };
  }, []);

  // Combine all stations from allStations
  const allStations = useMemo(() => {
    const stations = [];
    
    // Add popular stations first
    const popularStations = getPopularStations();
    stations.push(...popularStations.map(station => ({
      ...station,
      category: 'popular',
      isDefault: true
    })));
    
    // Add other categories from allStations
    Object.entries(allRadioStations).forEach(([category, categoryStations]) => {
      if (category !== 'popular') {
        Object.values(categoryStations).forEach(station => {
          // Only add if not already in popular stations
          if (!popularStations.find(p => p.name === station.name)) {
            stations.push({
              ...station,
              category,
              originalCategory: category
            });
          }
        });
      }
    });
    
    return stations;
  }, []);

  // Filter stations based on search and category
  const filteredStations = useMemo(() => {
    let filtered = allStations;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(station => 
        station.name.toLowerCase().includes(query) ||
        station.description.toLowerCase().includes(query) ||
        station.city?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory === 'favorites') {
      console.log('Filtering favorites, current favorites:', favorites); // Debug log
      console.log('All stations count:', filtered.length); // Debug log
      filtered = filtered.filter(station => {
        const isFav = favorites.includes(station.name);
        return isFav;
      });
      console.log('Filtered favorites count:', filtered.length); // Debug log
    } else if (selectedCategory === 'popular') {
      filtered = filtered.filter(station => station.isDefault || station.category === 'popular');
    } else if (selectedCategory === 'all') {
      // For 'all' category, only show stations that have a valid category
      const validCategories = categories.map(cat => cat.key).filter(key => key !== 'all' && key !== 'favorites');
      filtered = filtered.filter(station => {
        const hasValidCategory = station.category && validCategories.includes(station.category);
        const hasValidOriginalCategory = station.originalCategory && validCategories.includes(station.originalCategory);
        const isPopular = station.isDefault || station.category === 'popular';
        
        return hasValidCategory || hasValidOriginalCategory || isPopular;
      });
    } else {
      // For specific categories, only show stations that belong to that category
      filtered = filtered.filter(station => 
        station.category === selectedCategory || 
        station.originalCategory === selectedCategory
      );
    }

    return filtered;
  }, [allStations, searchQuery, selectedCategory, favorites]);



  const handleStationSelect = (station) => {
    if (isLoading) return;
    onStationSelect(station);
  };

  // ✅ NEW: Auto-toggle category when searching
  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      // When starting to search, switch to "all" and remember previous category
      if (selectedCategory !== 'all') {
        setPreviousCategory(selectedCategory);
        setSelectedCategory('all');
      }
    } else {
      // When clearing search, restore previous category
      if (selectedCategory === 'all' && previousCategory !== 'all') {
        setSelectedCategory(previousCategory);
      }
    }
  };

  // Update the search input section:
  {!showSearch ? (
    <button
      onClick={() => setShowSearch(true)}
      className="p-2 rounded-lg bg-radio-card text-radio-text hover:bg-radio-hover transition-colors"
      title="Zoeken"
      id="search-icon"
    >
      <Search size={20} />
    </button>
  ) : (
    <div className="flex items-center gap-2 bg-radio-dark rounded-lg px-4 py-2">
      <Search size={16} className="text-radio-secondary" />
      <input
        type="text"
        placeholder="Zoek radiozenders..."
        value={searchQuery}
        onChange={(e) => handleSearchQueryChange(e.target.value)} // ← Use the new handler
        className="bg-transparent border-none outline-none text-white placeholder-radio-secondary min-w-64"
        autoFocus
      />
      <button
        onClick={() => {
          setShowSearch(false);
          // Reset search and category
          if (searchQuery.trim() && selectedCategory === 'all' && previousCategory !== 'all') {
            setSelectedCategory(previousCategory);
          }
          setSearchQuery('');
        }}
        className="text-radio-secondary hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )}

  // Update the category selection to sync with auto-toggle:
  const handleCategoryChange = (categoryKey) => {
    setSelectedCategory(categoryKey);
    // If manually selecting a category while searching, update the previous category
    if (searchQuery.trim() && categoryKey !== 'all') {
      setPreviousCategory(categoryKey);
    } else if (!searchQuery.trim()) {
      setPreviousCategory(categoryKey);
    }
  };

  // Update the category buttons:
  {categories.map(category => (
    <button
      key={category.key}
      onClick={() => handleCategoryChange(category.key)} // ← Use the new handler
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        selectedCategory === category.key
          ? 'bg-radio-accent text-white'
          : 'bg-radio-dark text-white hover:bg-gray-700'
      } ${searchQuery.trim() && category.key === 'all' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`} // ← Add visual indicator when auto-selected
    >
      {category.label}
      {category.key === 'favorites' && favorites.length > 0 && (
        <span className="ml-2 bg-radio-accent/20 text-radio-accent px-2 py-0.5 rounded-full text-xs">
          {favorites.length}
        </span>
      )}
    </button>
  ))}

  // Update the results count message:
  {(searchQuery || selectedCategory !== 'popular') && ( // ← Changed from 'all' to 'popular' since popular is now default
    <div className="mb-4 text-radio-secondary">
      {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''} gevonden
      {searchQuery && selectedCategory === 'all' && (
        <span className="ml-2 text-blue-400 text-xs">(zoekt in alle categorieën)</span>
      )}
    </div>
  )}

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with search */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Nederlandse Radiozenders</h1>
            
            {!showSearch ? (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-lg bg-radio-card text-radio-text hover:bg-radio-hover transition-colors"
                title="Zoeken"
                id="search-icon"
              >
                <Search size={20} />
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-radio-dark rounded-lg px-4 py-2">
                <Search size={16} className="text-radio-secondary" />
                <input
                  type="text"
                  placeholder="Zoek radiozenders..."
                  value={searchQuery}
                  onChange={(e) => handleSearchQueryChange(e.target.value)} // ← Use the new handler
                  className="bg-transparent border-none outline-none text-white placeholder-radio-secondary min-w-64"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    // Reset search and category
                    if (searchQuery.trim() && selectedCategory === 'all' && previousCategory !== 'all') {
                      setSelectedCategory(previousCategory);
                    }
                    setSearchQuery('');
                  }}
                  className="text-radio-secondary hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category filters */}
       <div className="flex flex-wrap gap-2 mb-6">
          {categories.filter(category => category.key !== 'realnonstop').map(category => (
            <button
              key={category.key}
              onClick={() => handleCategoryChange(category.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-radio-accent text-white'
                  : 'bg-radio-dark text-white hover:bg-gray-700'
              } ${searchQuery.trim() && category.key === 'all' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
            >
              {category.label}
              {category.key === 'favorites' && favorites.length > 0 && (
                <span className="ml-2 bg-radio-accent/20 text-radio-accent px-2 py-0.5 rounded-full text-xs">
                  {favorites.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results count */}
        {(searchQuery || selectedCategory !== 'popular') && ( // ← Changed from 'all' to 'popular' since popular is now default
          <div className="mb-4 text-radio-secondary">
            {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''} gevonden
            {searchQuery && selectedCategory === 'all' && (
              <span className="ml-2 text-blue-400 text-xs">(zoekt in alle categorieën)</span>
            )}
          </div>
        )}
        
    
        
        {/* Stations grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
          {filteredStations.map((station) => (            <div
              key={station.name}
              onClick={() => handleStationSelect(station)}
              className={`radio-card relative overflow-hidden aspect-square ${
                currentStation?.name === station.name ? 'active' : ''
              } ${
                currentStation?.name === station.name && isPlaying ? 'playing' : ''
              } group`}
            >
              {/* Station Logo */}
              <div className="station-logo h-1/2 mb-2 flex items-center justify-center p-2">
                <StationLogo station={station} className="w-full h-full max-w-16 max-h-16" />
              </div>

              {/* Station Name - Smart scrolling text */}
              <SmartText 
                text={station.name}
                className={`station-name leading-tight font-medium ${
                  isFailedStation(station.name) 
                    ? 'text-red-400'     // ✅ Red text for failed stations
                    : 'text-white'       // ✅ White text for working stations
                }`}
                isName={true}
              />

              {/* Station Description - Smart scrolling text */}
              <SmartText 
                text={station.description}
                className="station-description text-gray-400 text-xs"
                isName={false}
              />              {/* Loading Indicator */}
             {isLoading && currentStation?.name === station.name && !window.isAdBreakActive && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-400 text-xs">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500 mr-1"></div>
                    <span className="text-xs"></span>
                  </div>
                </div>
              )}

              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Favorite button clicked for:', station.name);
                  console.log('Current isFavorite status:', isFavorite(station.name));
                  toggleFavorite(station.name);
                  // Force a small delay to see if state updates
                  setTimeout(() => {
                    console.log('After toggle - isFavorite status:', isFavorite(station.name));
                  }, 100);
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                title={isFavorite(station.name) ? 'Uit favorieten verwijderen' : 'Aan favorieten toevoegen'}
              >
                <svg 
                  className={`w-3 h-3 transition-colors ${isFavorite(station.name) ? 'text-yellow-400' : 'text-gray-400'}`} 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>

             { /* Failed Station Indicator */}
                    {/* {failedStations.includes(station.name) && (
                      <div className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full" title="Station gerapporteerd als niet werkend"></div>
                    )} */}
                    </div>
                    ))}
                  </div>

                  {/* No results message */}
        {filteredStations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-radio-secondary text-lg mb-2">
              Geen radiozenders gevonden
            </div>
            <div className="text-radio-secondary text-sm">
              Probeer een andere zoekterm of categorie
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RadioGrid;