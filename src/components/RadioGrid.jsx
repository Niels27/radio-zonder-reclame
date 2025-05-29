import React, { useState, useMemo } from 'react';
import { Search, Star, StarOff, X } from 'lucide-react';
import { allDutchStations, isPopularStation, getPopularStations } from '../utils/allDutchStations';
import { useFavorites } from '../hooks/useFavorites';
import LoadingIndicator from './LoadingIndicator';

const RadioGrid = ({ onStationSelect, currentStation, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // Combine all stations from allDutchStations
  const allStations = useMemo(() => {
    const stations = [];
    
    // Add popular stations first (marked as default for UI purposes)
    const popularStations = getPopularStations().map(station => ({
      ...station,
      isDefault: true,
      category: 'popular'
    }));
    
    stations.push(...popularStations);
    
    // Add all other stations
    Object.entries(allDutchStations).forEach(([category, categoryStations]) => {
      Object.values(categoryStations).forEach(station => {
        // Skip if already added as popular station
        if (!isPopularStation(station.name)) {
          stations.push({
            ...station,
            isDefault: false,
            category
          });
        }
      });
    });

    return stations;
  }, []);

  // Filter stations based on search and category
  const filteredStations = useMemo(() => {
    let stations = allStations;

    // Filter by search query - search across ALL stations regardless of category
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      stations = stations.filter(station =>
        station.name.toLowerCase().includes(query) ||
        station.description?.toLowerCase().includes(query)
      );
      // If searching, show all results regardless of category
      return stations;
    }

    // Only apply category filter if not searching
    if (selectedCategory === 'favorites') {
      stations = stations.filter(station => isFavorite(station.name));
    } else if (selectedCategory === 'popular') {
      stations = stations.filter(station => station.isDefault);
    } else if (selectedCategory !== 'all') {
      stations = stations.filter(station => station.category === selectedCategory);
    }

    return stations;
  }, [allStations, searchQuery, selectedCategory, isFavorite]);

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
    { key: 'specialty', label: 'Specialiteit' }
  ];

  const handleStationSelect = (station) => {
    // Ensure station has required properties for audio player
    const stationData = {
      name: station.name,
      url: station.url,
      description: station.description || '',
      logo: station.logo || station.favicon
    };
    onStationSelect(stationData);
  };

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
           >
             <Search size={20} />
           </button>
         ) : (
           <div className="flex items-center gap-2 bg-radio-card rounded-lg px-4 py-2">
             <Search size={16} className="text-radio-secondary" />
             <input
               type="text"
               placeholder="Zoek radiozenders..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-transparent border-none outline-none text-radio-text placeholder-radio-secondary min-w-64"
               autoFocus
             />
             <button
               onClick={() => {
                 setShowSearch(false);
                 setSearchQuery('');
               }}
               className="text-radio-secondary hover:text-radio-text transition-colors"
             >
               <X size={16} />
             </button>
           </div>
         )}
       </div>
     </div>

     {/* Category filters */}
     <div className="flex flex-wrap gap-2 mb-6">
       {categories.map(category => (
         <button
           key={category.key}
           onClick={() => setSelectedCategory(category.key)}
           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
             selectedCategory === category.key
               ? 'bg-radio-accent text-white'
               : 'bg-radio-card text-radio-text hover:bg-radio-hover'
           }`}
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
     {(searchQuery || selectedCategory !== 'all') && (
       <div className="mb-4 text-radio-secondary">
         {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''} gevonden
       </div>
     )}
     
     {/* Loading overlay */}
     {isLoading && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-radio-dark p-6 rounded-lg">
           <LoadingIndicator message="Verbinding maken met radiozender..." />
         </div>
       </div>
     )}
     
     {/* Stations grid */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
       {filteredStations.map((station) => (
         <div
           key={`${station.name}-${station.category}`}
           className={`radio-card ${
             currentStation?.name === station.name ? 'active' : ''
           } ${isLoading && currentStation?.name === station.name ? 'opacity-50' : ''} relative`}
           onClick={() => handleStationSelect(station)}
         >
           {/* Favorite button for all stations */}
           <button
             onClick={(e) => {
               e.stopPropagation();
               toggleFavorite(station);
             }}
             className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
             title={isFavorite(station.name) ? 'Verwijder van favorieten' : 'Voeg toe aan favorieten'}
           >
             {isFavorite(station.name) ? (
               <Star size={16} className="text-yellow-400 fill-yellow-400" />
             ) : (
               <Star size={16} className="text-white" />
             )}
           </button>

           <div className="flex flex-col items-center text-center">
             {/* Station logo or first letter */}
             <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 overflow-hidden">
               {station.logo ? (
                 <img
                   src={station.logo}
                   alt={station.name}
                   className="w-full h-full object-cover"
                   onError={(e) => {
                     e.target.style.display = 'none';
                     e.target.nextSibling.style.display = 'flex';
                   }}
                 />
               ) : null}
               <div 
                 className={`w-full h-full bg-radio-accent rounded-full flex items-center justify-center ${station.logo ? 'hidden' : ''}`}
               >
                 <span className="text-white font-bold text-lg">
                   {station.name.charAt(0)}
                 </span>
               </div>
             </div>
             
             <h3 className="font-semibold text-lg mb-1">{station.name}</h3>
             <p className="text-radio-secondary text-sm">{station.description}</p>
             
             {/* Category badge for non-default stations */}
             {!station.isDefault && (
               <div className="mt-1 text-xs text-radio-accent bg-radio-accent/10 px-2 py-1 rounded-full">
                 {categories.find(c => c.key === station.category)?.label || station.category}
               </div>
             )}
             
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


