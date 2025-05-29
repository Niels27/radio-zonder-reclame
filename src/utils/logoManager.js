// Logo management system for radio stations
// Handles fallback URLs, logo sharing between related stations, and failed logo logging

// High-quality Wikipedia Commons logos for popular stations (prefer PNG for cleaner look)
const PREMIUM_LOGOS = {
  'Radio 538': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Radio_538_logo_2019.svg/200px-Radio_538_logo_2019.svg.png',
  'Sky Radio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Sky_Radio_logo.svg/200px-Sky_Radio_logo.svg.png',
  'Q-music': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Qmusic_logo.svg/200px-Qmusic_logo.svg.png',
  'Qmusic': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Qmusic_logo.svg/200px-Qmusic_logo.svg.png',
  'Radio Veronica': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Radio_Veronica_logo_2015.svg/200px-Radio_Veronica_logo_2015.svg.png',
  'SLAM!': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/SLAM%21_logo_2015.svg/200px-SLAM%21_logo_2015.svg.png',
  '100% NL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/100%25NL_logo_2015.svg/200px-100%25NL_logo_2015.svg.png',
  'NPO Radio 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/NPO_Radio_1_logo_2014.svg/200px-NPO_Radio_1_logo_2014.svg.png',
  'NPO Radio 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/NPO_Radio_2_logo_2014.svg/200px-NPO_Radio_2_logo_2014.svg.png',
  '3FM': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/NPO_3FM_logo_2014.svg/200px-NPO_3FM_logo_2014.svg.png',
  'NPO Radio 4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/NPO_Radio_4_logo_2014.svg/200px-NPO_Radio_4_logo_2014.svg.png',
  'NPO Radio 5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/NPO_Radio_5_logo_2014.svg/200px-NPO_Radio_5_logo_2014.svg.png',
  'Radio 10': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Radio_10_logo_2015.svg/200px-Radio_10_logo_2015.svg.png',
  'BNR Nieuwsradio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/BNR_Nieuwsradio_logo_2016.svg/200px-BNR_Nieuwsradio_logo_2016.svg.png',
  'NPO FunX': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/NPO_FunX_logo_2014.svg/200px-NPO_FunX_logo_2014.svg.png',
  'KINK': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/KINK_logo_2015.svg/200px-KINK_logo_2015.svg.png',
  'Arrow Classic Rock': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Arrow_Classic_Rock_logo_2015.svg/200px-Arrow_Classic_Rock_logo_2015.svg.png',
  'JOE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Joe_logo_2015.svg/200px-Joe_logo_2015.svg.png',
  'Joe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Joe_logo_2015.svg/200px-Joe_logo_2015.svg.png',
  'Sublime': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Sublime_logo_2015.svg/200px-Sublime_logo_2015.svg.png',
  'NPO Soul & Jazz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/NPO_Soul_%26_Jazz_logo_2014.svg/200px-NPO_Soul_%26_Jazz_logo_2014.svg.png',
  'Radio Maria': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Radio_Maria_Nederland_logo.svg/200px-Radio_Maria_Nederland_logo.svg.png',
  'Groot Nieuws Radio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Groot_Nieuws_Radio_logo.svg/200px-Groot_Nieuws_Radio_logo.svg.png',
  'Concertzender': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Concertzender_Logo.svg/200px-Concertzender_Logo.svg.png',
  'Vibe Radio': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/64/Vibe_Radio_logo.png/200px-Vibe_Radio_logo.png',
  'KINK Distortion': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/KINK_logo_2015.svg/200px-KINK_logo_2015.svg.png',
  'Classic FM': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Classic_FM_logo.svg/200px-Classic_FM_logo.svg.png'
};

// Station families - related stations that should share logos
const STATION_FAMILIES = {
  '538': ['Radio 538', '538 TOP 50', '538 Dance Department', '538 Non-Stop', 'Radio 538 Non-Stop', '538 Party', '538 90s', 'Radio 538 Ibiza', 'Radio 538 Dance Department', 'Radio 538 Nonstop'],
  'Sky Radio': ['Sky Radio', 'Sky Radio Non-Stop', 'Sky Radio Non-Stop @ Work', 'Sky Radio Lounge', 'Sky Radio Smooth Hits', 'Sky Radio Nice & Easy', 'Sky Radio Christmas', 'Sky Radio Nederland'],
  'Qmusic': ['Q-music', 'Qmusic', 'QMUSIC', 'Qmusic Non-Stop', 'Qmusic Het Foute Uur', 'QMUSIC NEDERLAND', 'QMUSIC 90s & 00s', 'Q music Nederland', 'Q-Music Limburg'],
  'SLAM!': ['SLAM!', 'SLAM! Non Stop', 'SLAM! DANCE CLASSICS', 'SLAM! Juize', 'SLAM! MixMarathon', 'SLAM! Housuh In De Pauzuh', 'SLAM! The Boom Room', 'Slam! Mixmarathon', 'Slam! The Boom Room', 'Slam! 40', 'SLAM! WKNDMX'],
  'KINK': ['KINK', 'KINK DNA', 'KINK Distortion', 'KINK DISTORTION', 'Kink 90s'],
  'Radio Veronica': ['Radio Veronica', 'Radio Veronica Live', '192 Radio Veronica', 'Veronica Non-stop', 'Veronica Rock Radio'],
  'Joe': ['JOE', 'Joe', 'JOE mp3', 'Joe 70s & 80s'],
  'NPO': ['NPO Radio 1', 'NPO Radio 2', '3FM', 'NPO Radio 4', 'NPO Radio 5', 'NPO FunX', 'NPO FunX NL', 'NPO Soul & Jazz'],
  'Radio 10': ['Radio 10', 'Radio 10 60s & 70s Hits', 'Radio 10 Disco Classics', 'RADIO 10 TOP 4000']
};

// Failed logo tracking
const failedLogos = new Set();
const logoCache = new Map();

// Get family base name for a station
function getStationFamily(stationName) {
  for (const [family, stations] of Object.entries(STATION_FAMILIES)) {
    if (stations.some(station => 
      stationName.toLowerCase().includes(station.toLowerCase()) || 
      station.toLowerCase().includes(stationName.toLowerCase())
    )) {
      return family;
    }
  }
  return null;
}

// Get the best logo URL for a station
export function getBestLogoUrl(station) {
  const stationName = station.name;
  
  // First, try premium logo
  if (PREMIUM_LOGOS[stationName]) {
    return PREMIUM_LOGOS[stationName];
  }
  
  // Try to find a family match and use the premium logo
  const family = getStationFamily(stationName);
  if (family && PREMIUM_LOGOS[family]) {
    return PREMIUM_LOGOS[family];
  }
  
  // If no premium logo, return original station logo
  return station.logo || station.favicon;
}

// Get fallback logo URLs in order of preference
export function getLogoFallbacks(station) {
  const urls = [];
  const bestUrl = getBestLogoUrl(station);
  
  if (bestUrl) {
    urls.push(bestUrl);
  }
  
  // Add original URLs if different from best URL
  if (station.logo && station.logo !== bestUrl) {
    urls.push(station.logo);
  }
  
  if (station.favicon && station.favicon !== bestUrl && station.favicon !== station.logo) {
    urls.push(station.favicon);
  }
  
  // Try to create additional fallback URLs
  const stationName = station.name.toLowerCase();
  
  // Generic fallbacks for common domains
  if (stationName.includes('npo')) {
    urls.push('https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/NPO_logo_%282014%29.svg/200px-NPO_logo_%282014%29.svg.png');
  }
  
  // Try to construct logo URLs from station name
  const cleanName = station.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  urls.push(`https://upload.wikimedia.org/wikipedia/commons/thumb/${cleanName}_logo.svg/200px-${cleanName}_logo.svg.png`);
  
  return urls.filter(url => url && url !== 'https://cdn-icons-png.flaticon.com/512/727/727245.png');
}

// Async logo validation - tries multiple URLs until one works
export async function validateLogo(station) {
  const fallbacks = getLogoFallbacks(station);
  
  for (const url of fallbacks) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return url;
      }
    } catch (error) {
      logFailedLogo(station, url, error);
    }
  }
  
  // All URLs failed
  if (shouldMonitorLogo(station)) {
    console.warn(`🟡 No working logo found for monitored station: ${station.name}`, {
      category: station.category || station.originalCategory,
      attemptedUrls: fallbacks
    });
  }
  
  return null;
}

// Log failed logo for tracking
export function logFailedLogo(station, url, error) {
  const key = `${station.name}|${url}`;
  if (!failedLogos.has(key)) {
    failedLogos.add(key);
    console.warn('Logo loading failed:', {
      stationName: station.name,
      category: station.category || 'unknown',
      logoUrl: url,
      error: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// Get all failed logos for debugging
export function getFailedLogos() {
  return Array.from(failedLogos).map(key => {
    const [stationName, url] = key.split('|');
    return { stationName, url };
  });
}

// Check if station should be monitored for logo issues (popular/public/commercial)
export function shouldMonitorLogo(station) {
  const category = station.category || station.originalCategory || '';
  return ['popular', 'public', 'commercial'].includes(category) || station.isDefault;
}

// Clear failed logo cache (for testing)
export function clearFailedLogos() {
  failedLogos.clear();
}
