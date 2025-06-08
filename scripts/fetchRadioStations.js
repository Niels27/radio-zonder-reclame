// Radio Browser API fetcher for Dutch stations
// Run: node scripts/fetchRadioStations.js

import https from 'https';
import fs from 'fs';

const API_BASE = 'all.api.radio-browser.info';

// Wikipedia Commons logo URLs for major Dutch stations
const OFFICIAL_LOGOS = {
  'NPO Radio 1': 'https://upload.wikimedia.org/wikipedia/commons/8/82/NPO_Radio_1_logo_2014.svg',
  'NPO Radio 2': 'https://upload.wikimedia.org/wikipedia/commons/7/70/NPO_Radio_2_logo_2014.svg',
  '3FM': 'https://upload.wikimedia.org/wikipedia/commons/1/14/NPO_3FM_logo_2014.svg',
  'NPO Radio 4': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/NPO_Radio_4_logo_2014.svg',
  'NPO Radio 5': 'https://upload.wikimedia.org/wikipedia/commons/0/0e/NPO_Radio_5_logo_2014.svg',
  'NPO FunX': 'https://upload.wikimedia.org/wikipedia/commons/3/39/NPO_FunX_logo_2014.svg',
  'NPO Soul & Jazz': 'https://upload.wikimedia.org/wikipedia/commons/5/5d/NPO_Soul_%26_Jazz_logo_2014.svg',
  'Radio 538': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Radio_538_logo_2019.svg',
  'Sky Radio': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Sky_Radio_logo_2015.svg',
  'Q-music': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Qmusic_logo_2015.svg',
  'Radio Veronica': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Radio_Veronica_logo_2015.svg',
  'SLAM!': 'https://upload.wikimedia.org/wikipedia/commons/0/0f/SLAM%21_logo_2015.svg',
  '100% NL': 'https://upload.wikimedia.org/wikipedia/commons/4/48/100%25NL_logo_2015.svg',
  'Radio 10': 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Radio_10_logo_2015.svg',
  'BNR Nieuwsradio': 'https://upload.wikimedia.org/wikipedia/commons/e/e1/BNR_Nieuwsradio_logo_2016.svg',
  'Kink': 'https://upload.wikimedia.org/wikipedia/commons/8/8f/KINK_logo_2015.svg',
  'Arrow Classic Rock': 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Arrow_Classic_Rock_logo_2015.svg',
  'Joe': 'https://upload.wikimedia.org/wikipedia/commons/5/54/Joe_logo_2015.svg',
  'Sublime': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Sublime_logo_2015.svg'
};

const GENERIC_RADIO_ICON = 'https://cdn-icons-png.flaticon.com/512/727/727245.png';

const makeRequest = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Dutch Radio Browser/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Timeout')));
    req.end();
  });
};

const categorizeStation = (station) => {
  const name = station.name.toLowerCase();
  const tags = station.tags ? station.tags.toLowerCase() : '';
  
  // NPO = public
  if (name.includes('npo') || name.includes('radio 1') || name.includes('radio 2') || name.includes('3fm') || name.includes('radio 4') || name.includes('radio 5') || name.includes('funx') || name.includes('soul') || name.includes('concertzender')) {
    return 'public';
  }
  
  // Major commercials
  if (name.includes('538') || name.includes('qmusic') || name.includes('sky radio') || name.includes('radio 10') || name.includes('veronica') || name.includes('slam') || name.includes('100%') || name.includes('kink') || name.includes('arrow') || name.includes('joe') || name.includes('sublime')) {
    return 'commercial';
  }
  
  // News stations
  if (name.includes('bnr') || name.includes('nieuws') || name.includes('news') || tags.includes('news')) {
    return 'news';
  }
  
  // Regional patterns
  if (name.includes('fm') && (name.includes('noord') || name.includes('zuid') || name.includes('oost') || name.includes('west') || name.includes('flevoland') || name.includes('friesland') || name.includes('groningen') || name.includes('drenthe') || name.includes('overijssel') || name.includes('gelderland') || name.includes('utrecht') || name.includes('holland') || name.includes('zeeland') || name.includes('brabant') || name.includes('limburg'))) {
    return 'regional';
  }
  
  // Local city stations
  if (name.includes('amsterdam') || name.includes('rotterdam') || name.includes('utrecht') || name.includes('den haag') || name.includes('haarlem') || name.includes('eindhoven') || name.includes('tilburg') || name.includes('groningen') || name.includes('nijmegen') || name.includes('enschede') || name.includes('apeldoorn') || name.includes('arnhem')) {
    return 'local';
  }
  
  // Religious stations
  if (name.includes('maria') || name.includes('groot nieuws') || name.includes('evangelie') || name.includes('christelijk') || tags.includes('christian') || tags.includes('religious')) {
    return 'religious';
  }
  
  // Specialty genres
  if (tags.includes('jazz') || tags.includes('classical') || tags.includes('metal') || tags.includes('electronic') || tags.includes('folk') || name.includes('jazz') || name.includes('classical') || name.includes('metal') || name.includes('dance') || name.includes('distortion')) {
    return 'specialty';
  }
  
  return 'other';
};

const getLogo = (stationName, favicon) => {
  // First check official logos
  const officialLogo = OFFICIAL_LOGOS[stationName];
  if (officialLogo) return officialLogo;
  
  // Then try favicon from API
  if (favicon && favicon.trim() && favicon !== '') {
    return favicon;
  }
  
  // Fallback to generic icon
  return GENERIC_RADIO_ICON;
};

const cleanStationName = (name) => {
  return name
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[^\w\s\-&!%]/g, '')
    .trim();
};

const generateDescription = (station) => {
  const name = station.name.toLowerCase();
  const tags = station.tags ? station.tags.toLowerCase().split(',').map(t => t.trim()) : [];
  
  // Generate description based on name patterns and tags
  if (name.includes('klassiek') || tags.includes('classical')) return 'Klassieke muziek';
  if (name.includes('jazz') || tags.includes('jazz')) return 'Jazz muziek';
  if (name.includes('rock') || tags.includes('rock')) return 'Rock muziek';
  if (name.includes('pop') || tags.includes('pop')) return 'Pop muziek';
  if (name.includes('dance') || tags.includes('dance')) return 'Dance muziek';
  if (name.includes('nieuws') || tags.includes('news')) return 'Nieuws en informatie';
  if (name.includes('hits')) return 'Populaire hits';
  if (name.includes('urban') || tags.includes('urban')) return 'Urban muziek';
  if (name.includes('folk') || tags.includes('folk')) return 'Folk muziek';
  if (name.includes('metal') || tags.includes('metal')) return 'Metal muziek';
  if (name.includes('electronic') || tags.includes('electronic')) return 'Elektronische muziek';
  
  // Default descriptions based on category
  const category = categorizeStation(station);
  switch (category) {
    case 'public': return 'Publieke omroep';
    case 'commercial': return 'Commerciële radio';
    case 'regional': return 'Regionale radio';
    case 'local': return 'Lokale radio';
    case 'religious': return 'Religieuze radio';
    case 'news': return 'Nieuws en informatie';
    case 'specialty': return 'Gespecialiseerde muziek';
    default: return 'Nederlandse radio';
  }
};

const fetchDutchStations = async () => {
  console.log('📻 Fetching Dutch radio stations from Radio-Browser API...');
  
  try {
    const stations = await makeRequest('/json/stations/bycountry/netherlands');
    console.log(`📡 Found ${stations.length} stations`);
    
    // Filter and process stations
    const processed = stations
      .filter(station => {
        // Filter criteria
        const hasWorkingUrl = station.url && station.url.trim() !== '';
        const hasName = station.name && station.name.trim() !== '';
        const isAudio = station.url.includes('.mp3') || station.url.includes('.aac') || station.url.includes('.m3u') || station.url.includes('stream');
        const notExplicit = !station.tags || !station.tags.toLowerCase().includes('adult');
        const hasVotes = station.votes >= 0; // Even 0 votes is okay
        
        return hasWorkingUrl && hasName && isAudio && notExplicit;
      })
      .map(station => {
        const cleanName = cleanStationName(station.name);
        const category = categorizeStation(station);
        const logo = getLogo(cleanName, station.favicon);
        const description = generateDescription(station);
        
        return {
          name: cleanName,
          url: station.url,
          logo: logo,
          description: description,
          category: category,
          bitrate: station.bitrate || 128,
          votes: station.votes || 0,
          city: station.state || null,
          tags: station.tags || ''
        };
      })
      .filter(station => station.name.length > 0)
      .sort((a, b) => b.votes - a.votes); // Sort by popularity
    
    console.log(`✅ Processed ${processed.length} valid stations`);
    
    // Remove duplicates (same name)
    const unique = [];
    const seen = new Set();
    
    for (const station of processed) {
      const key = station.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(station);
      }
    }
    
    console.log(`🎯 ${unique.length} unique stations after deduplication`);
    
    // Categorize stations
    const categorized = {
      public: {},
      commercial: {},
      regional: {},
      local: {},
      news: {},
      religious: {},
      specialty: {},
      other: {}
    };
    
    unique.forEach(station => {
      const category = station.category;
      categorized[category][station.name] = {
        name: station.name,
        url: station.url,
        logo: station.logo,
        description: station.description,
        bitrate: station.bitrate,
        city: station.city,
        votes: station.votes
      };
    });
    
    // Generate output
    const output = `// Generated Dutch radio stations from Radio-Browser API
// Generated on: ${new Date().toISOString()}
// Total stations: ${unique.length}

export const allStations = ${JSON.stringify(categorized, null, 2)};

// Get all stations as flat array
export const getAllRadioStations = () => {
  const all = [];
  Object.values(allStations).forEach(category => {
    Object.values(category).forEach(station => {
      all.push(station);
    });
  });
  return all;
};

// Search stations by name
export const searchStations = (query) => {
  const all = getAllRadioStations();
  const searchTerm = query.toLowerCase();
  return all.filter(station => 
    station.name.toLowerCase().includes(searchTerm) ||
    station.description.toLowerCase().includes(searchTerm)
  );
};

// Get stations by category
export const getStationsByCategory = (category) => {
  return Object.values(allStations[category] || {});
};

// Statistics
export const getStats = () => ({
  total: ${unique.length},
  public: ${Object.keys(categorized.public).length},
  commercial: ${Object.keys(categorized.commercial).length},
  regional: ${Object.keys(categorized.regional).length},
  local: ${Object.keys(categorized.local).length},
  news: ${Object.keys(categorized.news).length},
  religious: ${Object.keys(categorized.religious).length},
  specialty: ${Object.keys(categorized.specialty).length},
  other: ${Object.keys(categorized.other).length}
});
`;
    
    // Write to file
    fs.writeFileSync('./src/data/allRadioStations.js', output);
    
    // Generate stats
    const stats = {
      total: unique.length,
      categories: Object.keys(categorized).map(cat => ({
        name: cat,
        count: Object.keys(categorized[cat]).length
      })),
      generated: new Date().toISOString()
    };
    
    fs.writeFileSync('./src/utils/stationStats.json', JSON.stringify(stats, null, 2));
    
    console.log('📊 Statistics:');
    stats.categories.forEach(cat => {
      console.log(`  ${cat.name}: ${cat.count} stations`);
    });
    
    console.log('✅ Files generated:');
    console.log('  - src/data/allRadioStations.js');
    console.log('  - src/utils/stationStats.json');
    
  } catch (error) {
    console.error('❌ Error fetching stations:', error);
    process.exit(1);
  }
};

// Run the script
fetchDutchStations();
