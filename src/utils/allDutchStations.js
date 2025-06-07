// Generated Dutch radio stations from Radio-Browser API
// Generated on: 2025-05-29T16:41:14.814Z
// Total stations: 806

// Station overrides are now applied from stationDefinitions.js
import { getStationDefinition } from '../data/stationDefinitions.js';

// Popular stations list - the 24 most popular Dutch radio stations
const popularStationNames = [
 // 'TEST FAILING STATION',
  'Radio 538',
  'Sky Radio',
  'Qmusic',
  'Radio Veronica',
  'SLAM!',
  '100% NL',
  'Radio 10',
  'NPO Radio 1', 
  'NPO Radio 2', 
  '3FM',
  'NPO Radio 4',
  'NPO FunX',
  'KINK',
  'Arrow Classic Rock',
  'JOE',
  'Sublime',
  'Joy Radio',
  'Classic FM',
  'Vibe Radio',
  'Radio 538 Non-Stop', 
  'Sky Radio Non-Stop @ Work',
  'Qmusic Non-Stop',
  'Slam! Mixmarathon',
];

// Check if a station is in the popular list
export const isPopularStation = (stationName) => {
  return popularStationNames.includes(stationName);
};

// Get all popular stations from the database
export const getPopularStations = () => {
  const popularStations = [];
  
  // Search through all categories to find popular stations
  Object.entries(allDutchStations).forEach(([category, stations]) => {
    Object.values(stations).forEach(station => {
      if (isPopularStation(station.name)) {
        popularStations.push({
          ...station,
          originalCategory: category
        });
      }
    });
  });
  
  // Sort by the order defined in popularStationNames
  return popularStations.sort((a, b) => {
    const indexA = popularStationNames.indexOf(a.name);
    const indexB = popularStationNames.indexOf(b.name);
    return indexA - indexB;
  });
};

// Statistics
export const getStats = () => ({
  total: 806,
  public: 55,
  commercial: 77,
  regional: 2,
  local: 30,
  news: 66,
  religious: 7,
  specialty: 81,
  other: 488
});

// Get all stations from all categories
export const getAllStations = () => {
  const allStations = [];
  
  Object.entries(allDutchStations).forEach(([category, stations]) => {
    Object.values(stations).forEach(station => {
      // Check if there's a custom definition for this station
      const customDefinition = getStationDefinition(station.name);
      
      if (customDefinition) {
        // Use custom definition with multiple URLs
        allStations.push({
          ...station,
          url: customDefinition.urls[0], // Primary URL for compatibility
          urls: customDefinition.urls,   // All URLs for fallback
          logo: customDefinition.logo || station.logo,
          description: customDefinition.description || station.description,
          category,
          originalCategory: category,
          hasCustomDefinition: true
        });
      } else {
        // Use original station data
        allStations.push({
          ...station,
          urls: [station.url], // Convert single URL to array for consistency
          category,
          originalCategory: category,
          hasCustomDefinition: false
        });
      }
    });
  });
  
  return allStations;
};

export const allDutchStations = {
  "public": {
    "TEST FAILING STATION": {
      "name": "TEST FAILING STATION",
      "url": "http://this-will-definitely-fail.example.com/nonexistent-stream.mp3",
      "logo": "https://via.placeholder.com/64x64/ff0000/ffffff?text=FAIL",
      "description": "Test station that always fails",
      "bitrate": 128,
      "city": "Test City",
      "votes": 1
    },
    "Radio 10": {
      "name": "Radio 10",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/RADIO10.mp3",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/9/9b/Radio_10_logo_2015.svg",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 6169
    },
    "Concertzender Baroque": {
      "name": "Concertzender Baroque",
      "url": "http://streams.greenhost.nl:8080/barok",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Klassieke muziek",
      "bitrate": 128,
      "city": null,
      "votes": 3605
    },
    "Radio 10 60s & 70s Hits": {
      "name": "Radio 10 60s & 70s Hits",
      "url": "http://playerservices.streamtheworld.com/pls/TLPSTR18.pls",
      "logo": "https://www.radio10.nl/favicon.ico",
      "description": "Populaire hits",
      "bitrate": 128,
      "city": null,
      "votes": 1800
    },
    "Concertzender Oude Muziek": {
      "name": "Concertzender Oude Muziek",
      "url": "http://streams.greenhost.nl:8080/oudemuziek",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Concertzender_Logo.svg/1200px-Concertzender_Logo.svg.png",
      "description": "Klassieke muziek",
      "bitrate": 128,
      "city": null,
      "votes": 1767
    },
    "Classic FM": {
    "name": "Classic FM",
    "url": "https://25553.live.streamtheworld.com/CLASSICFM.mp3",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/f/f8/Classic_FM_logo.svg",
    "description": "Klassieke muziek voor iedereen",
    "bitrate": 128,
    "city": null,
    "votes": 2198
    },
    "Sky Radio 101 FM": {
      "name": "Sky Radio",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/SKYRADIO.mp3",
      "logo": "http://www.skyradio.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 1292
    },
    "Concertzender Geen dag zonder Bach": {
      "name": "Concertzender Geen dag zonder Bach",
      "url": "http://streams.greenhost.nl:8080/bach",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Klassieke muziek",
      "bitrate": 128,
      "city": null,
      "votes": 1069
    },
    "Radio 538 Ibiza": {
      "name": "Radio 538 Ibiza",
      "url": "http://playerservices.streamtheworld.com/m3u/TLPSTR19.m3u",
      "logo": "https://www.538.nl/icons/apple-icon-120x120.png",
      "description": "Dance muziek",
      "bitrate": 128,
      "city": null,
      "votes": 812
    },
    "Radio 538 Nonstop": {
      "name": "Radio 538 Nonstop",
      "url": "http://playerservices.streamtheworld.com/m3u/TLPSTR09.m3u",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/538_logo.png/250px-538_logo.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 745
    },
    "Concertzender Gregoriaans": {
      "name": "Concertzender Gregoriaans",
      "url": "http://streams.greenhost.nl:8080/gregoriaans",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Klassieke muziek",
      "bitrate": 128,
      "city": null,
      "votes": 656
    },
    "Radio 538 Party": {
      "name": "Radio 538 Party",
      "url": "http://playerservices.streamtheworld.com/m3u/TLPSTR16.m3u",
      "logo": "https://www.538.nl/favicon.ico",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 530
    },
    "Radio 538": {
      "name": "Radio 538",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/RADIO538.mp3",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/538_logo.png/250px-538_logo.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 491
    },
    "NPO FunX NL": {
      "name": "NPO FunX NL",
      "url": "http://icecast.omroep.nl/funx-bb-mp3.m3u",
      "logo": "https://www.funx.nl/apple-touch-icon.png",
      "description": "Urban muziek",
      "bitrate": 192,
      "city": null,
      "votes": 479
    },
    "Feel Good Radio 1076 FM": {
      "name": "Feel Good Radio 1076 FM",
      "url": "http://live.feelgoodradio.eu:8344/stream",
      "logo": "https://feelgoodradio.nl/favicon.ico",
      "description": "Publieke omroep",
      "bitrate": 192,
      "city": null,
      "votes": 461
    },
    "RADIO 10 TOP 4000": {
      "name": "RADIO 10 TOP 4000",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR24.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": null,
      "votes": 335
    },
    "Concertzender De Muzikant": {
      "name": "Concertzender De Muzikant",
      "url": "http://streams.greenhost.nl:8080/amateurmuziek",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 303
    },
      "Radio 2": {
    "name": "Radio 2",
    "url": "https://live-radio-cf-vrt.akamaized.net/groupa/live/d8c422c8-465a-4ba9-b9c2-76b44ce9b060/live.isml/live-audio=128000.m3u8",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/4/41/VRT_Radio_2_logo.svg",
    "description": "Vlaamse hits (populair in NL)",
    "bitrate": 128,
    "city": null,
    "votes": 2341
  },
   "NPO Radio 2": {
    "name": "NPO Radio 2",
    "url": "https://icecast.omroep.nl/radio2-bb-mp3",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/7/79/NPO_Radio_2_logo_2014.svg",
    "description": "De beste muziek en verhalen",
    "bitrate": 192,
    "city": null,
    "votes": 9876
  },
  "3FM": {
    "name": "3FM",
    "url": "https://icecast.omroep.nl/3fm-bb-mp3",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/3/34/NPO_3FM_logo_2014.svg",
    "description": "Alternative, indie en nieuwe muziek",
    "bitrate": 192,
    "city": null,
    "votes": 7654
  },
  "NPO Radio 4": {
    "name": "NPO Radio 4",
    "url": "https://icecast.omroep.nl/radio4-bb-mp3",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/a/ae/NPO_Radio_4_logo_2014.svg",
    "description": "Klassieke muziek",
    "bitrate": 192,
    "city": null,
    "votes": 2345
  },
  "NPO Radio 5": {
    "name": "NPO Radio 5",
    "url": "https://icecast.omroep.nl/radio5-bb-mp3",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/f/f4/NPO_Radio_5_logo_2014.svg",
    "description": "Nostalgie jaren 60, 70, 80",
    "bitrate": 192,
    "city": null,
    "votes": 4567
  },
  "NPO FunX": {
 "name": "NPO FunX",
 "url": "https://icecast.omroep.nl/funx-bb-mp3",
 "logo": "https://upload.wikimedia.org/wikipedia/commons/5/56/NPO_FunX_logo_2014.svg",
 "description": "Urban, hip-hop en R&B",
 "bitrate": 192,
 "city": null,
 "votes": 3421
},
    "Concertzender Jazz": {
      "name": "Concertzender Jazz",
      "url": "http://streams.greenhost.nl:8080/jazz",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Jazz muziek",
      "bitrate": 256,
      "city": null,
      "votes": 295
    },
    "FunX Slow Jamz": {
      "name": "FunX Slow Jamz",
      "url": "http://icecast.omroep.nl/funx-slowjamzfb-bb-mp3.m3u",
      "logo": "https://www.funx.nl/apple-touch-icon.png",
      "description": "Publieke omroep",
      "bitrate": 192,
      "city": null,
      "votes": 285
    },
    "Concertzender November Music": {
      "name": "Concertzender November Music",
      "url": "http://streams.greenhost.nl:8080/novembermusic",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 240
    },
    "Concertzender X-Rated": {
      "name": "Concertzender X-Rated",
      "url": "http://streams.greenhost.nl:8080/concertzenderlive",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 238
    },
    "Soul Radio": {
      "name": "Soul Radio",
      "url": "http://soulradio02.live-streams.nl/live",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": "Noord-Holland",
      "votes": 232
    },
    "Concertzender Orint Express": {
      "name": "Concertzender Orint Express",
      "url": "http://streams.greenhost.nl:8080/orientexpress",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 225
    },
    "Concertzender": {
      "name": "Concertzender",
      "url": "http://streams.greenhost.nl:8080/live",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 256,
      "city": null,
      "votes": 223
    },
    "Concertzender Folk it!": {
      "name": "Concertzender Folk it!",
      "url": "http://streams.greenhost.nl:8080/folkit",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Folk muziek",
      "bitrate": 128,
      "city": null,
      "votes": 218
    },
    "Radio 10 non-stop": {
      "name": "Radio 10 non-stop",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR15.mp3",
      "logo": "https://www.radio10.nl/favicon.ico",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 210
    },
    "Concertzender Jazznotjazz": {
      "name": "Concertzender Jazznotjazz",
      "url": "http://streams.greenhost.nl:8080/jazznotjazz",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Jazz muziek",
      "bitrate": 128,
      "city": null,
      "votes": 207
    },
    "Concertzender Utrecht Muziek": {
      "name": "Concertzender Utrecht Muziek",
      "url": "http://streams.greenhost.nl:8080/vredenburg",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 195
    },
    "Concertzender - Hard Bop": {
      "name": "Concertzender - Hard Bop",
      "url": "http://streams.greenhost.nl:8080/hardbop",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 168
    },
    "Concertzender Filmmuziek": {
      "name": "Concertzender Filmmuziek",
      "url": "http://streams.greenhost.nl:8080/film",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 168
    },
    "Concertzender Wereldmuziek": {
      "name": "Concertzender Wereldmuziek",
      "url": "http://streams.greenhost.nl:8080/wereldmuziek",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 168
    },
    "Concertzender De Gehoorde Stilte": {
      "name": "Concertzender De Gehoorde Stilte",
      "url": "http://streams.greenhost.nl:8080/gehoordestilte",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 151
    },
    "Radio 538 Verrckte Stunde": {
      "name": "Radio 538 Verrckte Stunde",
      "url": "http://playerservices.streamtheworld.com/m3u/TLPSTR21.m3u",
      "logo": "https://www.538.nl/favicon.ico",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 143
    },
    "Concertzender Raakvlakken": {
      "name": "Concertzender Raakvlakken",
      "url": "http://streams.greenhost.nl:8080/raakvlakken",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 138
    },
    "Concertzender Nieuwe Muziek": {
      "name": "Concertzender Nieuwe Muziek",
      "url": "http://streams.greenhost.nl:8080/nieuwemuziek",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 128
    },
    "Concertzender Solta a Franga": {
      "name": "Concertzender Solta a Franga",
      "url": "http://streams.greenhost.nl:8080/slotaafranga",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 104
    },
    "Radio 538 Dance Department": {
      "name": "Radio 538 Dance Department",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR01aac.m3u8",
      "logo": "https://www.538.nl/favicon.ico",
      "description": "Dance muziek",
      "bitrate": 96,
      "city": null,
      "votes": 86
    },
    "Soulshow Radio": {
      "name": "Soulshow Radio",
      "url": "https://icecast-soulshow-cdp.triple-it.nl/soulshow_128.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 86
    },
    "Concertzender Radiophonics": {
      "name": "Concertzender Radiophonics",
      "url": "http://streams.greenhost.nl:8080/radiophonics",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 51
    },
    "Concertzender Crosslinks": {
      "name": "Concertzender Crosslinks",
      "url": "http://streams.greenhost.nl:8080/pop",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": null,
      "votes": 46
    },
    "RTV Maastricht Radio 1075 FM": {
      "name": "RTV Maastricht Radio 1075 FM",
      "url": "https://stream.rtvmaastricht.nl/rtv/radio_audio/icecast.audio",
      "logo": "https://rtvmaastricht.nl/rtvmaastricht_nl/images/logo-xs.png",
      "description": "Publieke omroep",
      "bitrate": 320,
      "city": null,
      "votes": 44
    },
    "Radio 509 Hilversum": {
      "name": "Radio 509 Hilversum",
      "url": "http://provisioning.streamtheworld.com/pls/RADIO509AAC.pls",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 96,
      "city": null,
      "votes": 38
    },
    "Radio 1224": {
      "name": "Radio 1224",
      "url": "https://stream.radio1224.nl/1224",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 320,
      "city": "Gelderland",
      "votes": 22
    },
    "ConcertZender Klassieke Muziek": {
      "name": "ConcertZender Klassieke Muziek",
      "url": "http://streams.greenhost.nl:8080/klassiek",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Klassieke muziek",
      "bitrate": 128,
      "city": null,
      "votes": 18
    },
    "Soul Show NL": {
      "name": "Soul Show NL",
      "url": "https://icecast-soulshow-cdp.triple-it.nl/soulshow_128.mp3?ver=402073",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 15
    },
    "Concertzender - De Gehoorde Stilte": {
      "name": "Concertzender - De Gehoorde Stilte",
      "url": "http://streams.greenhost.nl:8080/gehoordestilte",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 14
    },
    "Concertzender Pop": {
      "name": "Concertzender Pop",
      "url": "http://streams.greenhost.nl:8080/pop",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": null,
      "votes": 14
    },
    "Radio 10 80s Hits": {
      "name": "Radio 10 80s Hits",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR20.mp3",
      "logo": "https://cdn-profiles.tunein.com/s74982/images/logod.png?t=638756566650000000",
      "description": "Populaire hits",
      "bitrate": 128,
      "city": null,
      "votes": 13
    },
    "Radio 13": {
      "name": "Radio 13",
      "url": "https://stream2.mfmstreaming.nl/8040/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 192,
      "city": null,
      "votes": 7
    },
    "Radio 10 Disco Classics": {
      "name": "Radio 10 Disco Classics",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR23.mp3",
      "logo": "https://cdn-profiles.tunein.com/s98495/images/logod.png?t=638756566650000000",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 6
    },
    "Radio 10 90s Hits": {
      "name": "Radio 10 90s Hits",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR22.mp3",
      "logo": "https://cdn-profiles.tunein.com/s88604/images/logod.png?t=638756566660000000",
      "description": "Populaire hits",
      "bitrate": 128,
      "city": null,
      "votes": 5
    },
    "Radio 105": {
      "name": "Radio 105",
      "url": "https://loa.beheerstream.nl:8094/stream",
      "logo": "https://static.wixstatic.com/media/7e13fe_b533853fb7224340925b1d5f184c937b~mv2.jpg/v1/fill/w_180,h_150,al_c,q_80,enc_avif,quality_auto/180%20x%20150%20Logo.jpg",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": "Noord-Holland, Amsterdam",
      "votes": 1
    },
    "Radio 4 Brainport 192 k MP3": {
      "name": "Radio 4 Brainport 192 k MP3",
      "url": "https://server-67.stream-server.nl:8774/rbij.mp3",
      "logo": "https://www.radio4brainport.org/site2019/wp-content/uploads/2019/07/cropped-Logo-Radio4Brainport-320x240.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Noord-Brabant, Eindhoven",
      "votes": 1
    },
    "Radio 182": {
      "name": "Radio 182",
      "url": "https://player.streamforce.nl/listen/radio182/stream",
      "logo": "https://radio182.nl/wp-content/uploads/2020/06/logo.png",
      "description": "Publieke omroep",
      "bitrate": 320,
      "city": "Zuid-Holland, Waddinxveen",
      "votes": 0
    },
    "Radio 4 Brainport Eindhoven 64 k AAC": {
      "name": "Radio 4 Brainport Eindhoven 64 k AAC",
      "url": "https://server-67.stream-server.nl:8770/listen",
      "logo": "https://www.radio4brainport.org/site2019/wp-content/uploads/2019/07/cropped-Logo-Radio4Brainport-320x240.png",
      "description": "Nieuws en informatie",
      "bitrate": 64,
      "city": "Noord-Brabant, Eindhoven",
      "votes": 0
    },
    "Radio 538 Hitzone": {
      "name": "Radio 538 Hitzone",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR11.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Publieke omroep",
      "bitrate": 128,
      "city": null,
      "votes": 0
    }
  },
  "commercial": {
    "Arrow Classic Rock": {
      "name": "Arrow Classic Rock",
      "url": "http://stream.gal.io/arrow",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Arrow_Classic_Rock_logo_2015.svg",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": null,
      "votes": 9846
    },
    "SLAM!": {
      "name": "SLAM!",
      "url": "https://stream.slam.nl/slam",
      "logo": "https://www.slam.nl/favicon.ico",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": null,
      "votes": 3563
    },
    "Qmusic": {
      "name": "Qmusic",
      "url": "https://icecast-qmusicnl-cdp.triple-it.nl/Qmusic_nl_live_96.mp3",
      "logo": "https://qmusic.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": null,
      "votes": 2980
    },
    "Sky Radio 80s Hits": {
      "name": "Sky Radio 80s Hits",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/SRGSTR04.mp3",
      "logo": "http://www.skyradio.nl/favicon.ico",
      "description": "Populaire hits",
      "bitrate": 128,
      "city": null,
      "votes": 2890
    },
    "Sky Radio Hits": {
      "name": "Sky Radio Hits",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/SRGSTR01.mp3?dist=skyradio_web&ttag=talpa_consent:0&gdpr=1&gdpr_consent=BO2svb6O2svb6ADABANLDTAAAAAxKAAA",
      "logo": "https://www.skyradio.nl/favicon.ico",
      "description": "Populaire hits",
      "bitrate": 128,
      "city": null,
      "votes": 2104
    },
    "100% NL": {
      "name": "100% NL",
      "url": "http://stream.100p.nl/100pctnl.mp3",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/4/48/100%25NL_logo_2015.svg",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 1882
    },
    "SLAM! Non Stop": {
      "name": "SLAM! Non Stop",
      "url": "http://stream.radiocorp.nl/web10_mp3",
      "logo": "https://www.slam.nl/favicon.ico",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": null,
      "votes": 1823
    },
    "Sky Radio Christmas": {
      "name": "Sky Radio Christmas",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/SRGSTR08.mp3",
      "logo": "http://www.skyradio.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 1597
    },
    "KINK": {
      "name": "KINK",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/KINK.mp3",
      "logo": "https://kink.nl/static/apple-touch-icon.png",
      "description": "Commerciële radio",
      "bitrate": 192,
      "city": null,
      "votes": 1514
    },
    "Sublime - Live": {
      "name": "Sublime - Live",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/SUBLIME.mp3?",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Jazz muziek",
      "bitrate": 192,
      "city": null,
      "votes": 1106
    },
    "Sky Radio 90s Hits": {
      "name": "Sky Radio 90s Hits",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/SRGSTR05.mp3",
      "logo": "http://www.skyradio.nl/favicon.ico",
      "description": "Populaire hits",
      "bitrate": 128,
      "city": null,
      "votes": 1005
    },
    "Slam! Mixmarathon": {
      "name": "Slam! Mixmarathon",
      "url": "http://stream.radiocorp.nl/web13_mp3",
      "logo": "https://www.slam.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 950
    },
    "538 Dance Departmetn": {
      "name": "538 Dance Departmetn",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR01.mp3",
      "logo": "https://www.538.nl/favicon.ico",
      "description": "Dance muziek",
      "bitrate": 128,
      "city": null,
      "votes": 793
    },
    "Joe 70s & 80s": {
      "name": "Joe 70s & 80s",
      "url": "https://icecast-qmusicnl-cdp.triple-it.nl/Joe_nl_high.aac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Commerciële radio",
      "bitrate": 95,
      "city": null,
      "votes": 626
    },
    "JOE": {
      "name": "JOE",
      "url": "https://stream.joe.nl/joe/aachigh",
      "logo": "https://static.mytuner.mobi/media/tvos_radios/pkhqkus8dmde.jpg",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": null,
      "votes": 591
    },
    "Radio Veronica": {
      "name": "Radio Veronica",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/VERONICAAAC.aac",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/3/3d/Veronica-Logo.svg",
      "description": "Commerciële radio",
      "bitrate": 64,
      "city": null,
      "votes": 538
    },
    "Sky Radio Lovesongs": {
      "name": "Sky Radio Lovesongs",
      "url": "http://provisioning.streamtheworld.com/pls/SRGSTR03AAC.pls",
      "logo": "http://www.skyradio.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 64,
      "city": null,
      "votes": 504
    },
    "KINK80s": {
      "name": "KINK80s",
      "url": "http://playerservices.streamtheworld.com/pls/KINK_DNA.pls",
      "logo": "https://kink.nl/static/icon.png",
      "description": "Commerciële radio",
      "bitrate": 192,
      "city": null,
      "votes": 458
    },
    "KINK CLASSICS": {
      "name": "KINK CLASSICS",
      "url": "http://playerservices.streamtheworld.com/pls/KINK_DNA.pls",
      "logo": "https://kink.nl/static/apple-touch-icon.png",
      "description": "Commerciële radio",
      "bitrate": 192,
      "city": null,
      "votes": 442
    },
    "Kink 192k mp3": {
      "name": "Kink 192k mp3",
      "url": "http://provisioning.streamtheworld.com/pls/KINK.pls",
      "logo": "https://kinkfm.nl/static/apple-touch-icon.png",
      "description": "Commerciële radio",
      "bitrate": 192,
      "city": "NH",
      "votes": 422
    },
    "Qmusic Non-Stop": {
      "name": "Qmusic Non-Stop",
      "url": "https://icecast-qmusicnl-cdp.triple-it.nl/Qmusic_nl_nonstop_96.mp3",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/7/70/Qmusic_logo.svg",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": null,
      "votes": 408
    },
    "Slam! The Boom Room": {
      "name": "Slam! The Boom Room",
      "url": "http://stream.radiocorp.nl/web12_aac",
      "logo": "https://www.slam.nl/favicon.ico",
      "description": "Dance muziek",
      "bitrate": 96,
      "city": null,
      "votes": 404
    },

    "QMUSIC NEDERLAND": {
      "name": "QMUSIC NEDERLAND",
      "url": "https://stream.qmusic.nl/qmusic/mp3",
      "logo": "https://qmusic.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 345
    },
    "Qmusic Het Foute Uur": {
      "name": "Qmusic Het Foute Uur",
      "url": "https://icecast-qmusicnl-cdp.triple-it.nl/Qmusic_nl_fouteuur_96.mp3",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/7/70/Qmusic_logo.svg",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": null,
      "votes": 317
    },
    "SLAM! DANCE CLASSICS": {
      "name": "SLAM! DANCE CLASSICS",
      "url": "http://stream.slam.nl/WEB15_MP3",
      "logo": "https://scale.slam.nl/imageScaled/?site=slam&file=1580746671_Substations.jpg",
      "description": "Dance muziek",
      "bitrate": 128,
      "city": null,
      "votes": 314
    },
    "JOE mp3": {
      "name": "JOE mp3",
      "url": "https://icecast-qmusicnl-cdp.triple-it.nl/Joe_nl.mp3",
      "logo": "https://static.mytuner.mobi/media/tvos_radios/pkhqkus8dmde.jpg",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 291
    },
    "Sublime Live": {
      "name": "Sublime Live",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/SUBLIME.mp3",
      "logo": "https://6nl7xj2ntppk.b-cdn.net/73cf20f2-a361-480b-bc2f-bec43b6a2bd5",
      "description": "Commerciële radio",
      "bitrate": 192,
      "city": null,
      "votes": 289
    },
    "KINK 128k aac": {
      "name": "KINK 128k aac",
      "url": "https://playerservices.streamtheworld.com/pls/KINKAAC.pls",
      "logo": "https://kink.nl/static/favicon-32x32.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 286
    },
    "538 Non-Stop": {
      "name": "538 Non-Stop",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR09.mp3",
      "logo": "https://raw.githubusercontent.com/wootje/radiotv/main/radio/logo/538nonstop.gif",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": "Noord-Holland",
      "votes": 281
    },
    "Sky Radio Lounge": {
      "name": "Sky Radio Lounge",
      "url": "http://provisioning.streamtheworld.com/pls/SRGSTR07AAC.pls",
      "logo": "http://www.skyradio.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 64,
      "city": null,
      "votes": 278
    },
    "SLAM! Housuh In De Pauzuh": {
      "name": "SLAM! Housuh In De Pauzuh",
      "url": "http://stream.slam.nl/WEB16_MP3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 259
    },
    "Sky Radio Nice & Easy": {
      "name": "Sky Radio Nice & Easy",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/SRGSTR07.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 247
    },
    "KINK DISTORTION": {
      "name": "KINK DISTORTION",
      "url": "https://playerservices.streamtheworld.com/pls/KINK_DISTORTIONAAC.pls",
      "logo": "https://kink.nl/static/apple-touch-icon.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 220
    },
    "538 TOP 50": {
      "name": "538 TOP 50",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR13AAC.aac",
      "logo": "https://www.538.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": null,
      "votes": 198
    },
    "Sky Radio Nederland": {
      "name": "Sky Radio Nederland",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/SKYRADIO.mp3?dist=skyradio_web&amp;ttag=talpa_consent:1&amp;gdpr=1&amp;gdpr_consent=CPd5woAPd5woAADABBNLCcCsAP_AAEJAAAAAGgQGAAKgAXABAADIAIkATABNACeAGIANwAfgBAACMAHeAQgAi0BHAEdAJcATsArICKQF5gL2AYIA0ADBICYAFQALgAgABkAEQAJoATwAxAB-AEAAIwAd4BCACLQEcAR0AnYCKQF5gMEAKCQCQAKgAgABkAEQAJgATwB3gEcAXmKgBgBMAI4AvMZADACYARwBeY6AWABUAEAAMgAiABMACeAGIAd4BFgCOALzHAAgALgEIIQBAAmABiAHeARwkABAAuSgDABEACYAGIAd4BHAF5lIBYAFQAQAAyACIAEwAJ4AYgB3gEWAI4AvMoABAAuA.e8AAAAAAA7AA%22%20title=%22Sky%20Radio%20-%20Non-Stop%22",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 197
    },
    "Sky Radio Smooth Hits": {
      "name": "Sky Radio Smooth Hits",
      "url": "http://provisioning.streamtheworld.com/pls/SRGSTR15AAC.pls",
      "logo": "http://www.skyradio.nl/favicon.ico",
      "description": "Populaire hits",
      "bitrate": 64,
      "city": null,
      "votes": 197
    },
    "Kink 90s": {
      "name": "Kink 90s",
      "url": "https://playerservices.streamtheworld.com/pls/KINK_90S.pls",
      "logo": "https://kink.nl/_next/image?url=https%3A%2F%2Fapi.kink.nl%2Fcache%2Fi%2F4000%2Fimages%2F4414.w1600.b80bbb6.c013fc6.q90.jpg&w=1920&q=75",
      "description": "Commerciële radio",
      "bitrate": 192,
      "city": null,
      "votes": 190
    },
    "192 Radio Veronica": {
      "name": "192 Radio Veronica",
      "url": "http://server-14.stream-server.nl:8030/",
      "logo": "https://cdn-radiotime-logos.tunein.com/s178298g.png",
      "description": "Commerciële radio",
      "bitrate": 192,
      "city": null,
      "votes": 185
    },
    "538 Radio": {
      "name": "538 Radio",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO538.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 137
    },
    "KINK DNA": {
      "name": "KINK DNA",
      "url": "http://playerservices.streamtheworld.com/pls/KINK_DNAAAC.pls",
      "logo": "https://kink.nl/static/favicon-32x32.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 132
    },
    "Radio Veronica Live": {
      "name": "Radio Veronica Live",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/VERONICA.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 118
    },
    "538 Classics": {
      "name": "538 Classics",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR08.mp3",
      "logo": "https://images.ctfassets.net/3p0bn61n86ty/1UmRrGgak1DxWnJ98Tfch6/afe41001535ecba843cd1a2880ca8093/2021-538-logo-RGB-Zwart-nieuw.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 99
    },
    "Arrow CAZ!": {
      "name": "Arrow CAZ!",
      "url": "http://stream.arrowcaz.nl/caz128kmp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 86
    },
    "538 Classics AAC": {
      "name": "538 Classics AAC",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR08AAC.aac",
      "logo": "https://www.538.nl/favicon.ico",
      "description": "Dance muziek",
      "bitrate": 96,
      "city": null,
      "votes": 82
    },
    "Joe 70s and 80s": {
      "name": "Joe 70s and 80s",
      "url": "https://icecast-qmusicnl-cdp.triple-it.nl/Joe_nl_high.aac",
      "logo": "https://joe.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": null,
      "votes": 72
    },
    "SLAM! Juize": {
      "name": "SLAM! Juize",
      "url": "http://stream.slam.nl/WEB09_MP3",
      "logo": "https://slam.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 70
    },
    "538 90s AAC": {
      "name": "538 90s AAC",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR21AAC.aac",
      "logo": "https://www.538.nl/favicon.ico",
      "description": "Dance muziek",
      "bitrate": 96,
      "city": null,
      "votes": 69
    },
    "Sky Radio Non-Stop": {
      "name": "Sky Radio Non-Stop",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/SKYRADIO.mp3",
      "logo": "http://www.skyradio.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 58
    },
    "538 Party MP3 Stream": {
      "name": "538 Party MP3 Stream",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR16.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 45
    },
    "QMUSIC 90s & 00s 96k aac": {
      "name": "QMUSIC 90s & 00s 96k aac",
      "url": "https://stream.qmusic.nl/90s-00s/aachigh",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Commerciële radio",
      "bitrate": 95,
      "city": null,
      "votes": 41
    },
    "SLAM! MixMarathon 96kbps": {
      "name": "SLAM! MixMarathon 96kbps",
      "url": "http://streaming.slam.nl/web13_aac",
      "logo": "https://www.radio.de/images/broadcasts/da/0d/116003/2/c300.png",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": "Amsterdam",
      "votes": 41
    },
    "Sublime": {
      "name": "Sublime",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/SUBLIME.mp3?dist=sublime_website",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/9/92/Sublime_logo_2015.svg",
      "description": "Commerciële radio",
      "bitrate": 192,
      "city": null,
      "votes": 41
    },
    "Qmusic 90s & 00s 64k aac": {
      "name": "Qmusic 90s & 00s 64k aac",
      "url": "https://stream.qmusic.nl/90s-00s/aaclow",
      "logo": "https://cdn-radio.dpgmedia.net/2/72/3d/09/109/Site-logo-_220x220_2.png",
      "description": "Commerciële radio",
      "bitrate": 64,
      "city": null,
      "votes": 38
    },
    "QMUSIC THEMA": {
      "name": "QMUSIC THEMA",
      "url": "https://stream.qmusic.nl/thema/mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": "Noord-Holland",
      "votes": 36
    },
    "Qmusic Summer": {
      "name": "Qmusic Summer",
      "url": "https://stream.qmusic.nl/thema/mp3",
      "logo": "https://qmusic.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 31
    },
    "KINK 64kbps": {
      "name": "KINK 64kbps",
      "url": "https://playerservices.streamtheworld.com/pls/KINKAAC2.pls",
      "logo": "https://kink.nl/static/apple-touch-icon.png",
      "description": "Rock muziek",
      "bitrate": 96,
      "city": null,
      "votes": 29
    },
    "SLAM": {
      "name": "SLAM",
      "url": "http://streaming.slam.nl/slam_aac",
      "logo": "https://2ptqdc73ga5k.b-cdn.net/w_320,h_320,q_85/44u2e6owci2l-slam-default-header-mobile.png",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": null,
      "votes": 25
    },
    "100% NL Non-Stop": {
      "name": "100% NL Non-Stop",
      "url": "https://stream.100p.nl/web02_mp3",
      "logo": "https://scale.100p.nl/imageScaled/?site=100pnl&file=1561108141_Nonstop.jpg&w=150&h=150&cropped=0",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 24
    },
    "538 Party AAC Stream": {
      "name": "538 Party AAC Stream",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR16AAC.aac",
      "logo": "https://www.radio.de/assets/fav/apple-touch-icon.png",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": null,
      "votes": 17
    },
    "Radio Olympia - 100% Piratenhits en Nederlandstalige muziek": {
      "name": "Radio Olympia - 100% Piratenhits en Nederlandstalige muziek",
      "url": "https://streams.olympia-streams.nl/olympia",
      "logo": "https://www.olympia-radio.nl/assets/themes/olympia-radio_nl/img/logo.png",
      "description": "Populaire hits",
      "bitrate": 192,
      "city": null,
      "votes": 17
    },
    "Joe 60s & 70s": {
      "name": "Joe 60s & 70s",
      "url": "https://icecast-qmusicbe-cdp.triple-it.nl/joe_60s_70s.aac?aw_0_1st.skey=1686378120&aw_0_1st.playerid=site-player",
      "logo": "https://cdn-radio.dpgmedia.net/6/7c/6a/1e/47/JOE-7-WEBSITE-220x220.png",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": null,
      "votes": 16
    },
    "100% NL Liefde": {
      "name": "100% NL Liefde",
      "url": "https://www.mp3streams.nl/zender/100-nl-liefde/stream/105-aac-96",
      "logo": "https://www.mp3streams.nl/logo/z/100-nl-liefde",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": null,
      "votes": 9
    },
    "Slam! 00s": {
      "name": "Slam! 00s",
      "url": "https://22353.live.streamtheworld.com/WEB15_MP3_SC",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 9
    },
    "Veronica Goud van oud": {
      "name": "Veronica Goud van oud",
      "url": "https://21633.live.streamtheworld.com/DAB01_AAC.aac",
      "logo": "https://www.radioveronica.nl/veronica/veronica-logo.svg",
      "description": "Rock muziek",
      "bitrate": 96,
      "city": "Netherlands",
      "votes": 9
    },
    "Radion Veronica Top 1000 AllerTijden": {
      "name": "Radion Veronica Top 1000 AllerTijden",
      "url": "https://28973.live.streamtheworld.com/WEB06_AAC.aac",
      "logo": "https://www.radioveronica.nl/veronica/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": null,
      "votes": 6
    },
    "538 Hitzone": {
      "name": "538 Hitzone",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR11.mp3",
      "logo": "https://www.538.nl/favicon.ico",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 5
    },
    "Slam! 40": {
      "name": "Slam! 40",
      "url": "https://22673.live.streamtheworld.com/WEB14_MP3_SC",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 4
    },
    "SLAM! WKNDMX": {
      "name": "SLAM! WKNDMX",
      "url": "http://streaming.slam.nl/web11_aac",
      "logo": "https://api.radioveronica.nl/media/kyopzbwj/slam-wkndmx-1_1.png",
      "description": "Dance muziek",
      "bitrate": 96,
      "city": null,
      "votes": 4
    },
    "Veronica Non-stop": {
      "name": "Veronica Non-stop",
      "url": "https://21633.live.streamtheworld.com/DAB02_AAC.aac",
      "logo": "null",
      "description": "Rock muziek",
      "bitrate": 96,
      "city": null,
      "votes": 4
    },
    "KINK - http": {
      "name": "KINK - http",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/KINK.mp3",
      "logo": "https://kink.nl/static/apple-touch-icon.png",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": null,
      "votes": 3
    },
    "Sublime Jazz": {
      "name": "Sublime Jazz",
      "url": "https://stream.sublime.nl/web21_mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Jazz muziek",
      "bitrate": 128,
      "city": null,
      "votes": 3
    },
    "538 Zomer": {
      "name": "538 Zomer",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR06.mp3",
      "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqIMGtFnIORtit1NhrjbqFrClcYXUjXpf8YEZ-Aq4Qt_ILF0LDsX1hmloviOrvUZHGPGk&usqp=CAU",
      "description": "Commerciële radio",
      "bitrate": 128,
      "city": null,
      "votes": 2
    },
    "Arrow": {
      "name": "Arrow",
      "url": "https://stream.player.arrow.nl/arrow",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": "amsterdam",
      "votes": 2
    },
    "QMUSIC NEDERLAND AAC HIGH": {
      "name": "QMUSIC NEDERLAND AAC HIGH",
      "url": "https://stream.qmusic.nl/qmusic/aachigh",
      "logo": "https://qmusic.nl/assets/favicon/default-67977c4f518d45d3a639958e1c6c072532dd2e05cbef9e42cb9f8ecde1964c97.ico",
      "description": "Commerciële radio",
      "bitrate": 96,
      "city": null,
      "votes": 2
    },
    "Slam Rock Radio": {
      "name": "Slam Rock Radio",
      "url": "https://cloud-faro.beheerstream.com/proxy/qohhfiiq?mp=/;",
      "logo": "https://www.slamrockradio.com/images/logo-SlamRockRadio.png",
      "description": "Rock muziek",
      "bitrate": 128,
      "city": null,
      "votes": 2
    },
    "Veronica Rock Radio": {
      "name": "Veronica Rock Radio",
      "url": "https://21223.live.streamtheworld.com/VERONICAAAC.aac",
      "logo": "https://api.radioveronica.nl/media/utpdvkit/radio-veronica-rock-radio-1_1.png",
      "description": "Rock muziek",
      "bitrate": 64,
      "city": null,
      "votes": 2
    },
      "Radio 538 Non-Stop": {
    "name": "Radio 538 Non-Stop",
    "url": "https://21223.live.streamtheworld.com/538NONSTOP.mp3",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/538_logo.png/250px-538_logo.png",
    "description": "Non-stop hits zonder praat",
    "bitrate": 128,
    "city": null,
    "votes": 3421
  },
    "Sky Radio Non-Stop @ Work": {
    "name": "Sky Radio Non-Stop @ Work",
    "url": "https://22433.live.streamtheworld.com/SKYRADIO_NONSTOP_WORK.mp3",
    "logo": "http://www.skyradio.nl/favicon.ico",
    "description": "Perfect voor op kantoor",
    "bitrate": 128,
    "city": null,
    "votes": 2156
  },
    "Qmusic Non-Stop": {
    "name": "Qmusic Non-Stop",
    "url": "https://icecast-qmusicnl-cdp.triple-it.nl/Qmusic_nl_nonstop_96.mp3",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/1/14/Qmusic_logo.svg",
    "description": "Non-stop muziek",
    "bitrate": 96,
    "city": null,
    "votes": 2834
  },  "Q-music": {
    "name": "Q-music",
    "url": "https://icecast-qmusicnl-cdp.triple-it.nl/Qmusic_nl_live_96.mp3",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/1/14/Qmusic_logo.svg",
    "description": "Q sounds better",
    "bitrate": 96,
    "city": null,
    "votes": 6892
  },
  
  },
  "regional": {
    "Team FM Gelderland": {
      "name": "Team FM Gelderland",
      "url": "http://audiostreamen.nl/gelderland",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Regionale radio",
      "bitrate": 192,
      "city": null,
      "votes": 17
    },
    "ZuidWest FM": {
      "name": "ZuidWest FM",
      "url": "https://icecast.zuidwestfm.nl/zuidwest.aac",
      "logo": "https://www.zuidwestupdate.nl/wp-content/uploads/2021/03/logos-outline-small.png",
      "description": "Regionale radio",
      "bitrate": 96,
      "city": null,
      "votes": 8
    }
  },
  "local": {
    "Amsterdam Funk Channel": {
      "name": "Amsterdam Funk Channel",
      "url": "http://stream.afc.fm:8504/;stream.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Lokale radio",
      "bitrate": 192,
      "city": null,
      "votes": 2211
    },
    "Dance Radio Amsterdam": {
      "name": "Dance Radio Amsterdam",
      "url": "http://stream.danceradio.nl:9920/",
      "logo": "https://danceradio.nl/wp-content/uploads/2023/10/cropped-faviconpng-180x180.png",
      "description": "Dance muziek",
      "bitrate": 185,
      "city": "Amsterdam",
      "votes": 515
    },
    "Nautic Radio Groningen": {
      "name": "Nautic Radio Groningen",
      "url": "http://stream.nauticradio.net:14260/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Lokale radio",
      "bitrate": 320,
      "city": null,
      "votes": 291
    },
    "Radio Stad Den Haag": {
      "name": "Radio Stad Den Haag",
      "url": "https://stream.radiostaddenhaag.com/stream/1/;",
      "logo": "https://www.liveradio.ie/files/images/335003/resized/180x172c/radio_stad_den_haag.jpg",
      "description": "Lokale radio",
      "bitrate": 192,
      "city": "ZH",
      "votes": 246
    },
    "DANCEFM  The Beat of Amsterdam": {
      "name": "DANCEFM  The Beat of Amsterdam",
      "url": "https://streams.dancefm.net/mp3-hq",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 256,
      "city": null,
      "votes": 157
    },
    "Haarlem Shuffle FLAC": {
      "name": "Haarlem Shuffle FLAC",
      "url": "https://stream.tbmp.nl:8000/haarlemshuffle.flac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Lokale radio",
      "bitrate": 128,
      "city": null,
      "votes": 98
    },
    "TrendFM Den Haag": {
      "name": "TrendFM Den Haag",
      "url": "https://trendfm.live-streams.nl:18030/mobiel",
      "logo": "https://trendfm.nu/wp-content/uploads/2020/06/tfmlogomobile.png",
      "description": "Lokale radio",
      "bitrate": 64,
      "city": null,
      "votes": 86
    },
    "Danceradio Den Haag": {
      "name": "Danceradio Den Haag",
      "url": "http://server5.radio-streams.net:8065/",
      "logo": "https://danceradiodenhaag.nl/wp-content/uploads/2020/06/favi-radio.png",
      "description": "Dance muziek",
      "bitrate": 256,
      "city": null,
      "votes": 73
    },
    "Enschede FM": {
      "name": "Enschede FM",
      "url": "http://stream1.icehosting.nl:8126/",
      "logo": "https://media.1twente.nl/logos/favicon/apple-touch-icon.png",
      "description": "Lokale radio",
      "bitrate": 192,
      "city": "Overijssel",
      "votes": 37
    },
    "Salsa Radio Amsterdam": {
      "name": "Salsa Radio Amsterdam",
      "url": "https://stream.radiojar.com/tanwgvckkxhvv",
      "logo": "https://usercontent.one/wp/www.salsaradioamsterdam.nl/wp-content/uploads/2022/07/background_rozelp.png",
      "description": "Lokale radio",
      "bitrate": 128,
      "city": "Noord",
      "votes": 33
    },
    "Haarlem Shuffle": {
      "name": "Haarlem Shuffle",
      "url": "https://stream.tbmp.nl:8000/haarlemshufflehigh.mp3",
      "logo": "http://www.haarlem105shuffle.nl/shuffle1200.png",
      "description": "Lokale radio",
      "bitrate": 320,
      "city": null,
      "votes": 24
    },
    "dB962 Amsterdam": {
      "name": "dB962 Amsterdam",
      "url": "http://stream.db962.nl:8030/listen.pls",
      "logo": "https://db962.nl/wp-content/uploads/2023/07/image-2.png",
      "description": "Lokale radio",
      "bitrate": 320,
      "city": null,
      "votes": 19
    },
    "RaZO Amsterdam": {
      "name": "RaZO Amsterdam",
      "url": "https://s42.myradiostream.com/33512/listen.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Lokale radio",
      "bitrate": 128,
      "city": null,
      "votes": 13
    },
    "Delta Radio Nijmegen Works in Home Assistant": {
      "name": "Delta Radio Nijmegen Works in Home Assistant",
      "url": "http://streamdelta.lokaalradio.nl:9005/download.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Lokale radio",
      "bitrate": 256,
      "city": "Gelderland",
      "votes": 12
    },
    "Amsterdam Funk Channel AFC": {
      "name": "Amsterdam Funk Channel AFC",
      "url": "https://stream.afc.fm/",
      "logo": "https://www.afc.fm/wp-content/uploads/2023/12/afcfm.png",
      "description": "Lokale radio",
      "bitrate": 192,
      "city": "Noord-Holland, Amsterdam",
      "votes": 9
    },
    "Delta Radio Nijmegen": {
      "name": "Delta Radio Nijmegen",
      "url": "https://www.deltaradio90.nl/deltaradio90.m3u",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Lokale radio",
      "bitrate": 256,
      "city": "Nijmegen",
      "votes": 9
    },
    "Free Radio Rotterdam": {
      "name": "Free Radio Rotterdam",
      "url": "https://streams.freeradiorotterdam.nl:9443/freeradiorotterdam",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Lokale radio",
      "bitrate": 128,
      "city": "ZH",
      "votes": 5
    },
    "Haarlem105": {
      "name": "Haarlem105",
      "url": "https://stream.tbmp.nl:8010/haarlem105.web",
      "logo": "https://i0.wp.com/haarlem105.nl/wp-content/uploads/2020/02/cropped-h105-fav.png?fit=180%2c180&#038;ssl=1",
      "description": "Lokale radio",
      "bitrate": 128,
      "city": null,
      "votes": 5
    },
    "Den Haag FM": {
      "name": "Den Haag FM",
      "url": "https://server3.radio-streams.net:18012/denhaagfm",
      "logo": "https://s.regiogroei.cloud/img/brand-logos/resized/logo_denhaagfm.jpg",
      "description": "Lokale radio",
      "bitrate": 192,
      "city": null,
      "votes": 4
    },
    "1Twente Enschede": {
      "name": "1Twente Enschede",
      "url": "https://stream1.icehosting.nl/1twente/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Lokale radio",
      "bitrate": 192,
      "city": null,
      "votes": 3
    },
    "Amsterdam Funk Channel AFC low bandwidth": {
      "name": "Amsterdam Funk Channel AFC low bandwidth",
      "url": "https://stream.afc.fm/index.html?sid=2",
      "logo": "https://www.afc.fm/wp-content/uploads/2023/12/afcfm.png",
      "description": "Lokale radio",
      "bitrate": 192,
      "city": "Noord-Holland, Amsterdam",
      "votes": 3
    },
    "Jamm FM Amsterdam": {
      "name": "Jamm FM Amsterdam",
      "url": "https://ats.jammfm.nl/stream320.php",
      "logo": "https://www.jammfm.nl/wp-content/uploads/2024/07/Logo-Website-links01.png",
      "description": "Lokale radio",
      "bitrate": 128,
      "city": null,
      "votes": 3
    },
    "247Spice Radio Amsterdam": {
      "name": "247Spice Radio Amsterdam",
      "url": "https://stream.247streaming.live/247spice.mp3",
      "logo": "https://247spice.com/wp-content/uploads/2020/11/247_Spice_Color_901FM_01-transparant.png",
      "description": "Lokale radio",
      "bitrate": 192,
      "city": "Noord-Holland, Amsterdam",
      "votes": 1
    },
    "Beats from Amsterdam": {
      "name": "Beats from Amsterdam",
      "url": "http://stream.legendhits.nl:8017/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Lokale radio",
      "bitrate": 320,
      "city": "Noord-Holland",
      "votes": 1
    },
    "Radio Amerika Rotterdam": {
      "name": "Radio Amerika Rotterdam",
      "url": "https://stream13.shoutcastsolutions.com/proxy/radioamerika?mp=/stream",
      "logo": "https://www.radioamerika.nl/wp-content/uploads/2022/11/logo-NW-1.jpg",
      "description": "Lokale radio",
      "bitrate": 256,
      "city": null,
      "votes": 1
    },
    "Radio Haarlem": {
      "name": "Radio Haarlem",
      "url": "https://live.radiohaarlem.nl:8000/radio.mp3",
      "logo": "https://radiohaarlem.nl/wp-content/uploads/2023/03/Logo-RadioHaarlem.png",
      "description": "Lokale radio",
      "bitrate": 192,
      "city": "Noord-Holland",
      "votes": 1
    },
    "Radio Uniek Rotterdam": {
      "name": "Radio Uniek Rotterdam",
      "url": "https://stream.hosting078.nl:8044/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Lokale radio",
      "bitrate": 256,
      "city": "Rotterdam",
      "votes": 1
    },
    "247Jamz Amsterdam": {
      "name": "247Jamz Amsterdam",
      "url": "https://stream.247streaming.live/247jamz.mp3",
      "logo": "https://247streaming.network/img/Logo.png",
      "description": "Lokale radio",
      "bitrate": 192,
      "city": "Noord-Holland, Amsterdam",
      "votes": 0
    },
    "Den Haag Totaal": {
      "name": "Den Haag Totaal",
      "url": "https://server3.radio-streams.net:18012/denhaagtotaal",
      "logo": "http://www.denhaagtotaal.nl/Den-Haag-Totaal-logo-Layers.gif",
      "description": "Lokale radio",
      "bitrate": 192,
      "city": "Zuid-Holland, Den Haag",
      "votes": 0
    },
    "Radio Atletico Den Haag": {
      "name": "Radio Atletico Den Haag",
      "url": "https://mediaserv38.live-streams.nl:8074/stream.mp3",
      "logo": "https://radioatletico.nl/images/logo1.png",
      "description": "Lokale radio",
      "bitrate": 256,
      "city": "Nederland",
      "votes": 0
    }
  },
  "news": {
    "BNR Nieuwsradio": {
      "name": "BNR Nieuwsradio",
      "url": "https://stream.bnr.nl/bnr_aac_96_20",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/e/e1/BNR_Nieuwsradio_logo_2016.svg",
      "description": "Nieuws en informatie",
      "bitrate": 96,
      "city": null,
      "votes": 1901
    },
    "RTV Oost Radio": {
      "name": "RTV Oost Radio",
      "url": "http://streams.rtvoost.nl/audio/oost/mp3",
      "logo": "https://s.regiogroei.cloud/oost/b41727b/img/favicons/oost/apple-touch-icon.png?v=1686046828987",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Overijssel",
      "votes": 445
    },
    "Omroep Brabant": {
      "name": "Omroep Brabant",
      "url": "http://streaming.omroepbrabant.nl/mp3hq",
      "logo": "http://www.omroepbrabant.nl/favicon.ico",
      "description": "Nieuws en informatie",
      "bitrate": 256,
      "city": "Brabant",
      "votes": 282
    },
    "Airplay Radio": {
      "name": "Airplay Radio",
      "url": "https://stream.and-stuff.nl:8443/live-airplay_320",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nieuws en informatie",
      "bitrate": 320,
      "city": "Overijssel",
      "votes": 278
    },
    "Groot Nieuws Radio": {
      "name": "Groot Nieuws Radio",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/GNR.mp3",
      "logo": "https://www.grootnieuwsradio.nl/favicons/favicon-1-180x180.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": null,
      "votes": 122
    },
    "Groot Nieuws Radio Blijde Klanken": {
      "name": "Groot Nieuws Radio Blijde Klanken",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/GNRBK.mp3",
      "logo": "https://www.grootnieuwsradio.nl/favicons/favicon-1-180x180.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": null,
      "votes": 105
    },
    "Groot Nieuws Radio Non-Stop": {
      "name": "Groot Nieuws Radio Non-Stop",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/GNRNONSTOP.mp3",
      "logo": "https://images.cvandaag.nl/artikel-foto/0fdee9961e3678d8bd55c560ea6f0384/groot-nieuws-radio.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": null,
      "votes": 41
    },
    "BNR nieuwsradio - http": {
      "name": "BNR nieuwsradio - http",
      "url": "http://stream.bnr.nl/bnr_mp3_128_20",
      "logo": "https://static.bnr.nl/assets/bnr-next/logo.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": null,
      "votes": 11
    },
    "PI4VRZA": {
      "name": "PI4VRZA",
      "url": "https://stream.pi4vrz.nl:9000/webstream.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": null,
      "votes": 11
    },
    "BNR Business Beats": {
      "name": "BNR Business Beats",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/BNR_BUSINESS_BEATS.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": null,
      "votes": 8
    },
    "Grandprix radio - http": {
      "name": "Grandprix radio - http",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/GRAND_PRIX_RADIO.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": null,
      "votes": 8
    },
    "BNR Niuewsradio": {
      "name": "BNR Niuewsradio",
      "url": "https://stream.bnr.nl/bnr_mp3_128_01",
      "logo": "https://www.bnr.nl/favicon.ico",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": null,
      "votes": 7
    },
    "SRC Rivierenland": {
      "name": "SRC Rivierenland",
      "url": "https://cc6.beheerstream.com/proxy/src1?mp=/stream;stream.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Gelderland",
      "votes": 6
    },
    "Stichting Streekomroep de Bevelanden SOB FM": {
      "name": "Stichting Streekomroep de Bevelanden SOB FM",
      "url": "http://stream.sobfm.nl:8686/stream",
      "logo": "https://cdn.onlineradiobox.com/img/l/8/76738.v5.png",
      "description": "Pop muziek",
      "bitrate": 256,
      "city": "Zeeland",
      "votes": 6
    },
    "Radio Gelderland 320k": {
      "name": "Radio Gelderland 320k",
      "url": "https://stream.40upradio.nl/gld",
      "logo": "https://s.regiogroei.cloud/img/brand-logos/resized/logo_gelderland.png",
      "description": "Nieuws en informatie",
      "bitrate": 320,
      "city": "Gelderland, Arnhem",
      "votes": 3
    },
    "HoornRadio": {
      "name": "HoornRadio",
      "url": "https://server-23.stream-server.nl:18382/;",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Noord-Holland, Hoorn",
      "votes": 2
    },
    "Radio Apeldoorn high bandwidth": {
      "name": "Radio Apeldoorn high bandwidth",
      "url": "https://streamingradio.rtv-apeldoorn.nl/listen/radio_apeldoorn/rtvapeldoornhigh.mp3",
      "logo": "https://streamingradio.rtv-apeldoorn.nl/static/uploads/album_art.1644611234.jpg",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Gelderland, Apeldoorn",
      "votes": 2
    },
    "Donderschoer Radio 2nd server": {
      "name": "Donderschoer Radio 2nd server",
      "url": "https://server-28.stream-server.nl:8806/stream",
      "logo": "https://donderschoerradio.nl/.cm4all/mediadb/Nieuw%20Logo.jpg",
      "description": "Nieuws en informatie",
      "bitrate": 320,
      "city": "Gelderland, Eerbeek",
      "votes": 1
    },
    "LOVE Lokale Omroep Volendam Edam": {
      "name": "LOVE Lokale Omroep Volendam Edam",
      "url": "https://nlpo.stream.vip/rtvlove/mp3-192/nlpo.stream.vip/",
      "logo": "https://www.rtvlove.nl/wp-content/themes/rtvlove-2016/gfx/love-logo-oval.svg",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Noord-Holland, Volendam & Edam",
      "votes": 1
    },
    "LOVE Lokale Omroep Volendam Edam DAB": {
      "name": "LOVE Lokale Omroep Volendam Edam DAB",
      "url": "https://webstream.rtvlove.nl/DAB-RTVLOVE",
      "logo": "https://www.rtvlove.nl/wp-content/themes/rtvlove-2016/gfx/love-logo-oval.svg",
      "description": "Nieuws en informatie",
      "bitrate": 256,
      "city": "Noord-Holland, Volendam & Edam",
      "votes": 1
    },
    "Leuk FM": {
      "name": "Leuk FM",
      "url": "https://nlpo.stream.vip/leukfm/mp3-192/nlpo.stream.vip/",
      "logo": "https://www.leuk.fm/wp-content/uploads/2024/05/logo-leukfm.jpg",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Gelderland, Lichtenvoorde",
      "votes": 1
    },
    "Lokale Omroep Goirle Radio": {
      "name": "Lokale Omroep Goirle Radio",
      "url": "https://nlpo.stream.vip/logfm/mp3-192/nlpo.stream.vip/",
      "logo": "https://www.lokaleomroepgoirle.nl/wp-content/uploads/2016/04/LOG-header-logo.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Noord-Brabant, Goirle",
      "votes": 1
    },
    "Midvliet FM": {
      "name": "Midvliet FM",
      "url": "https://cloud-faro.beheerstream.com/proxy/radlqowi?mp=/midvliet",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Zuid-Holland, Leidschendam",
      "votes": 1
    },
    "Omroep Land van Cuijk 2nd server 320k": {
      "name": "Omroep Land van Cuijk 2nd server 320k",
      "url": "https://loa.beheerstream.nl:8048/listen.pls?sid=1",
      "logo": "https://redbee-fsly-vod.cdn.redbee.live/imagescaler002/nlpo/omroeplandvancuijk/assets/cffc8ba9_950389b/posters/32a69246bf2d421e72f845199a5b0796/32a69246bf2d421e72f845199a5b0796.jpg",
      "description": "Nieuws en informatie",
      "bitrate": 320,
      "city": "Noord-Brabant, Mill, kerkstraat 3",
      "votes": 1
    },
    "Radio Apeldoorn": {
      "name": "Radio Apeldoorn",
      "url": "https://streamingradio.rtv-apeldoorn.nl/listen/radio_apeldoorn/rtvapeldoornmid.mp3",
      "logo": "https://www.rtv-apeldoorn.nl/images/RTVApeldoorn/SiteLogo.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Gelderland, Apeldoorn",
      "votes": 1
    },
    "Radio Hollandia Den Haag": {
      "name": "Radio Hollandia Den Haag",
      "url": "https://stream.excellentfm.nl/radiohollandia",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nieuws en informatie",
      "bitrate": 320,
      "city": "Zuid-Holland, Den Haag",
      "votes": 1
    },
    "Radio ZO-NWS": {
      "name": "Radio ZO-NWS",
      "url": "https://nlpo.stream.vip/zonws/mp3-192/nlpo/",
      "logo": "https://www.zo-nws.nl/%3A/logo%20zonws.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Limburg, Schinveld",
      "votes": 1
    },
    "Rivierenland Radio 2nd server320k": {
      "name": "Rivierenland Radio 2nd server320k",
      "url": "https://server-28.stream-server.nl:8802/stream",
      "logo": "https://www.rivierenland-radio.nl/",
      "description": "Nieuws en informatie",
      "bitrate": 320,
      "city": "Gelderland, Hedel, Veldweg 31",
      "votes": 1
    },
    "RTV Seaport": {
      "name": "RTV Seaport",
      "url": "https://nlpo.stream.vip/seaport/mp3-192/nlpo.stream.vip/",
      "logo": "https://i0.wp.com/www.rtvseaport.nl/wp-content/uploads/2014/08/RTVSeaport_logo_cmyk_RAAM.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Noord-Holland, Velsen",
      "votes": 1
    },
    "RTW FM": {
      "name": "RTW FM",
      "url": "https://loa.beheerstream.nl:8104/stream",
      "logo": "https://rtvmiddenholland.nl/wp-content/uploads/2024/03/Logo-rtw-waddinxveen.webp",
      "description": "Nieuws en informatie",
      "bitrate": 320,
      "city": "Zuid-Holland, Waddinxveen, Mauritslaan 55",
      "votes": 1
    },
    "Studio DMN": {
      "name": "Studio DMN",
      "url": "https://stream.it-facilities.be:9006/stream;",
      "logo": "https://www.studiodmn.nl/images/logo-small-dmn.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Noord-Holland, Diemen",
      "votes": 1
    },
    "BR6 Radio": {
      "name": "BR6 Radio",
      "url": "https://qxjr001.digiplay.nl/stream/9160/stream",
      "logo": "https://rtvmiddenholland.nl/wp-content/uploads/2024/02/BR6-logo-799x272-1.jpg",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Zuid-Holland, Bodegraven",
      "votes": 0
    },
    "BredaNu 192k MP3": {
      "name": "BredaNu 192k MP3",
      "url": "https://icecast.bredanu.nl/bredanu.mp3",
      "logo": "https://bredanu.nl/wp-content/uploads/2023/08/BredaNu-logo-nw-op-donker-1-.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Noord-Brabant, Breda",
      "votes": 0
    },
    "BredaNu 96k AAC": {
      "name": "BredaNu 96k AAC",
      "url": "https://icecast.bredanu.nl/bredanu.aac",
      "logo": "https://bredanu.nl/wp-content/uploads/2023/08/BredaNu-logo-nw-op-donker-1-.png",
      "description": "Nieuws en informatie",
      "bitrate": 96,
      "city": "Noord-Brabant, Breda",
      "votes": 0
    },
    "BredaNu 2 192k MP3": {
      "name": "BredaNu 2 192k MP3",
      "url": "https://icecast.bredanu.nl/bredanu.staging.mp3",
      "logo": "https://bredanu.nl/wp-content/uploads/2023/08/BredaNu-logo-nw-op-donker-1-.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Noord-Brabant, Breda",
      "votes": 0
    },
    "BredaNu 2 96k AAC": {
      "name": "BredaNu 2 96k AAC",
      "url": "https://icecast.bredanu.nl/bredanu.staging.aac",
      "logo": "https://bredanu.nl/wp-content/uploads/2023/08/BredaNu-logo-nw-op-donker-1-.png",
      "description": "Nieuws en informatie",
      "bitrate": 96,
      "city": "Noord-Brabant, Breda",
      "votes": 0
    },
    "Centrum Radio": {
      "name": "Centrum Radio",
      "url": "https://stream.centrumradio.eu/centrumradio.aac",
      "logo": "https://centrumradio.eu/wp-content/uploads/2016/03/CentrumRadio_Fulllogo.png",
      "description": "Nieuws en informatie",
      "bitrate": 64,
      "city": "Noord-Brabant, Valkenswaard",
      "votes": 0
    },
    "Donderschoer Radio": {
      "name": "Donderschoer Radio",
      "url": "https://loa.beheerstream.nl:8110/stream",
      "logo": "https://donderschoerradio.nl/.cm4all/mediadb/Nieuw%20Logo.jpg",
      "description": "Nieuws en informatie",
      "bitrate": 320,
      "city": "Gelderland, Eerbeek",
      "votes": 0
    },
    "Gouwestad radio": {
      "name": "Gouwestad radio",
      "url": "https://stream2.mfmstreaming.nl/8020/stream",
      "logo": "https://rtvmiddenholland.nl/wp-content/uploads/2024/03/GSLogo2022.jpg",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Zuid-Holland, Midden Holland, Gouda",
      "votes": 0
    },
    "Hotradiohits Dab": {
      "name": "Hotradiohits Dab",
      "url": "https://server-67.stream-server.nl:8400/listen.pls?sid=1",
      "logo": "https://www.hotradiohits.nl/image/web/logo.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Overijssel, Borne",
      "votes": 0
    },
    "Koekstad Radio": {
      "name": "Koekstad Radio",
      "url": "https://server-67.stream-server.nl:8788/stream",
      "logo": "https://www.koekstadradio.nl/wp-content/uploads/2025/04/koekstad-fm-logo-large-2024-e1743543311176-250x94.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Overijssel, Deventer, Zutphenseweg 4-A",
      "votes": 0
    },
    "Langstraat FM": {
      "name": "Langstraat FM",
      "url": "https://mediaserv38.live-streams.nl:18026/stream",
      "logo": "https://www.langstraatmedia.nl/wp-content/uploads/2018/05/LangstraatMediaCompleet.png",
      "description": "Nieuws en informatie",
      "bitrate": 320,
      "city": "Professor Eykmanweg 7C, Waalwijk, Noord-Brabant",
      "votes": 0
    },
    "Lokale Omroep Ameland": {
      "name": "Lokale Omroep Ameland",
      "url": "https://loa.beheerstream.nl:8040/stream",
      "logo": "https://cdn.onlineradiobox.com/img/l/5/9435.v7.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Friesland, Ameland, Nes, Kardinaal de Jongweg 29",
      "votes": 0
    },
    "MFM Brabant": {
      "name": "MFM Brabant",
      "url": "https://nlpo.stream.vip/brabant/mp3-192/nlpo.stream.vip/",
      "logo": "https://dtvnieuws.nl/logos/DTV_NIEUWS-light.svg",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Noord-Brabant",
      "votes": 0
    },
    "Radio 80": {
      "name": "Radio 80",
      "url": "https://nlpo.stream.vip/rtv80/mp3-192/nlpo",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Noord-Holland, Egmond aan zee",
      "votes": 0
    },
    "Radio A-FM": {
      "name": "Radio A-FM",
      "url": "https://nlpo.stream.vip/radioafm/mp3-192/nlpo.stream.vip/",
      "logo": "https://www.radioafm.nl/wp-content/themes/RTV_Altena_WP_Theme/assets/img/website_AFM.svg",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Noord-Brabant, Nieuwendijk",
      "votes": 0
    },
    "Radio Amersfoort": {
      "name": "Radio Amersfoort",
      "url": "http://qxjr001.digiplay.nl:9180/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Utrecht, Amersfoort",
      "votes": 0
    },
    "Radio Awaaz": {
      "name": "Radio Awaaz",
      "url": "https://mediaserv38.live-streams.nl:18039/stream",
      "logo": "https://jplayer-generator.live-streams.nl/upload/21216186.jpg",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": null,
      "votes": 0
    },
    "Radio Boven IJ": {
      "name": "Radio Boven IJ",
      "url": "http://server-67.stream-server.nl:8774/rbij.mp3",
      "logo": "https://www.radiobovenij.amsterdam/podcast/LogoPodcast.jpg",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Noord-Holland",
      "votes": 0
    },
    "Radio Excellent": {
      "name": "Radio Excellent",
      "url": "https://stream.excellentfm.nl/live.aac",
      "logo": "https://radiomap.eu/nl/images/excellent.gif",
      "description": "Nieuws en informatie",
      "bitrate": 320,
      "city": "Utrecht, De Meern, Emmikkerboslaan 14",
      "votes": 0
    },
    "Radio Lelystad": {
      "name": "Radio Lelystad",
      "url": "https://nlpo.stream.vip/lelystad/mp3-192/nlpo.stream.vip/",
      "logo": "https://radiolelystad.nl/templates/yootheme/cache/5f/2111logo-5f554697.jpeg",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Flevoland, Lelystad",
      "votes": 0
    },
    "Radio Omroep Venlo": {
      "name": "Radio Omroep Venlo",
      "url": "https://nlpo.stream.vip/venlo/mp3-192/nlpo",
      "logo": "https://omroepvenlo.nl/logos/OMROEP_VENLO-light.svg",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Limburg, Venlo",
      "votes": 0
    },
    "Radio Purmerend DAB": {
      "name": "Radio Purmerend DAB",
      "url": "http://stream.zxp.nl:8000/radiopurmerend_dab",
      "logo": "https://rtvpurmerend.nl/rtvpurmerend_nl/images/logo.svg",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Noord-Holland, Purmerend",
      "votes": 0
    },
    "Radio Ridderkerk": {
      "name": "Radio Ridderkerk",
      "url": "https://nlpo.stream.vip/ridderk/mp3-192/nlpo.stream.vip/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Zuid-Holland, Ridderkerk",
      "votes": 0
    },
    "Radio Son en Breugel": {
      "name": "Radio Son en Breugel",
      "url": "https://nlpo.stream.vip/breugel/mp3-192/nlpo.stream.vip/",
      "logo": "https://www.radiosenb.nl/skin/radiosenb/img/Logo-Radio-S-B.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Noord-Brabant, Son en Breugel",
      "votes": 0
    },
    "Radio Stad Montfoort": {
      "name": "Radio Stad Montfoort",
      "url": "http://stream001.digiplay.nl:9038/stream",
      "logo": "https://www.radiostadmontfoort.nl/cms/img/spaw/rsm%20logo%20144px.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Utrecht, Montfoort, Antoniushof 2",
      "votes": 0
    },
    "Radio Texel": {
      "name": "Radio Texel",
      "url": "https://cast6.asurahosting.com/proxy/radiotex/stream",
      "logo": "https://www.radiotexel.nl/wp-content/uploads/2020/06/logo-wit.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Noord-Holland, Texel",
      "votes": 0
    },
    "Regio FM": {
      "name": "Regio FM",
      "url": "http://audiostreamen.nl:8030/stream",
      "logo": "https://radiomap.eu/nl/images/regio.gif",
      "description": "Nieuws en informatie",
      "bitrate": 256,
      "city": "Groningen, Siddeburen, Hoofdweg 99A ",
      "votes": 0
    },
    "RPL": {
      "name": "RPL",
      "url": "http://qxjr001.digiplay.nl:9101/stream",
      "logo": "https://rtvmiddenholland.nl/wp-content/uploads/2023/11/RPL-logo-Retina-e1706562916453.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Utrecht, Midden Holland, Woerden, Rubensstraat 1 ",
      "votes": 0
    },
    "RTV Connect Radio": {
      "name": "RTV Connect Radio",
      "url": "https://nlpo.stream.vip/connectfm/mp3-192/nlpo.stream.vip/",
      "logo": "https://rtvconnect.stream.prepr.io/1qb7szcwblhr/w_1950/radio-stream.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": null,
      "votes": 0
    },
    "RtvAlbrandswaard": {
      "name": "RtvAlbrandswaard",
      "url": "https://streamer.hosting078.nl:1850/stream",
      "logo": "https://www.rtvalbrandswaard.com/wp-content/uploads/2021/07/Logo-RTV-Albrandswaard-Naam-FC_V1.jpg",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Zuid-Holland, Rhoon, Stationsstraat 6",
      "votes": 0
    },
    "RTW": {
      "name": "RTW",
      "url": "https://player.streamforce.nl:8502/stream",
      "logo": "https://rtvmiddenholland.nl/wp-content/uploads/2024/03/Logo-rtw-waddinxveen.webp",
      "description": "Nieuws en informatie",
      "bitrate": 256,
      "city": "Zuid-Holland, Waddinxveen",
      "votes": 0
    },
    "SAMEN 1": {
      "name": "SAMEN 1",
      "url": "https://server-67.stream-server.nl:8754/stream",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Samen1_Logo.png/250px-Samen1_Logo.png",
      "description": "Nieuws en informatie",
      "bitrate": 128,
      "city": "Gelderland, Apeldoorn",
      "votes": 0
    },
    "Samen1 radio": {
      "name": "Samen1 radio",
      "url": "https://server-67.stream-server.nl:8752/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": "Gelderland, Apeldoorn",
      "votes": 0
    },
    "SRC FM 2 - Rivierenland en Vijfheerenlanden": {
      "name": "SRC FM 2 - Rivierenland en Vijfheerenlanden",
      "url": "https://loa.beheerstream.nl:8126/stream",
      "logo": "https://www.src.fm/images/logo_social.png",
      "description": "Nieuws en informatie",
      "bitrate": 320,
      "city": "Gelderland, Culemborg, Stationsplein 11A",
      "votes": 0
    },
    "TraxxRadio": {
      "name": "TraxxRadio",
      "url": "https://server-28.stream-server.nl:8896/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nieuws en informatie",
      "bitrate": 192,
      "city": null,
      "votes": 0
    }
  },
  "religious": {
    "Christelijke Omroep": {
      "name": "Christelijke Omroep",
      "url": "http://primastream1.primareclame.nl:11231/",
      "logo": "http://cdn-profiles.tunein.com/s304951/images/logoq.jpg?t=154227",
      "description": "Religieuze radio",
      "bitrate": 320,
      "city": null,
      "votes": 111
    },
    "Radio Maria Nederland": {
      "name": "Radio Maria Nederland",
      "url": "https://stream.radiomaria.nl/mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Religieuze radio",
      "bitrate": 160,
      "city": null,
      "votes": 77
    },
    "Maasbach Radio": {
      "name": "Maasbach Radio",
      "url": "http://stream.maasbachradio.com:8064/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Religieuze radio",
      "bitrate": 128,
      "city": null,
      "votes": 33
    },
    "Que Brille 800!": {
      "name": "Que Brille 800!",
      "url": "https://cdn.instream.audio/:9050/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Religieuze radio",
      "bitrate": 128,
      "city": "Bonaire",
      "votes": 14
    },
    "Klokradio": {
      "name": "Klokradio",
      "url": "http://cloud-faro.beheerstream.com:8320//stream",
      "logo": "https://i0.wp.com/klokradio.nl/wp-content/uploads/2017/08/klokradio-favicon-2017-100px.png?fit=100%2c100&#038;ssl=1",
      "description": "Religieuze radio",
      "bitrate": 192,
      "city": "Zuid-Holland",
      "votes": 10
    },
    "Urk FM": {
      "name": "Urk FM",
      "url": "http://urk.fm:8000/geestelijk.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Religieuze radio",
      "bitrate": 128,
      "city": null,
      "votes": 5
    },
    "Reformatorische Omroep 1": {
      "name": "Reformatorische Omroep 1",
      "url": "https://radio1.reformatorischeomroep.nl/live.m3u",
      "logo": "https://reformatorischeomroep.nl/",
      "description": "Religieuze radio",
      "bitrate": 192,
      "city": "Gelderland",
      "votes": 2
    }
  },
  "specialty": {
    "Intense Radio - We love Dance HQ FLAC": {
      "name": "Intense Radio - We love Dance HQ FLAC",
      "url": "http://secure.live-streams.nl/flac.ogg",
      "logo": "https://www.intenseradio.net/wp-content/uploads/fbrfg/apple-touch-icon.png?v=gaek7lvrgd",
      "description": "Dance muziek",
      "bitrate": 1411,
      "city": "Burgenland",
      "votes": 44462
    },
    "Intense Radio - We love Dance 256k": {
      "name": "Intense Radio - We love Dance 256k",
      "url": "http://intenseradio.live-streams.nl:8000/main",
      "logo": "https://www.intenseradio.net/wp-content/uploads/fbrfg/apple-touch-icon.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": null,
      "votes": 43376
    },
    "Synthetic FM The New Italo generation sound": {
      "name": "Synthetic FM The New Italo generation sound",
      "url": "https://mediaserv38.live-streams.nl:18030/stream",
      "logo": "https://syntheticfm.com/logo-synth-italo.png",
      "description": "Elektronische muziek",
      "bitrate": 320,
      "city": "Burgenland",
      "votes": 33923
    },
    "Synthetic FM - The radio for the Synth lovers": {
      "name": "Synthetic FM - The radio for the Synth lovers",
      "url": "https://mediaserv38.live-streams.nl:18040/live",
      "logo": "https://syntheticfm.com/logo-syntheticfm1.png",
      "description": "Elektronische muziek",
      "bitrate": 256,
      "city": "Burgenland",
      "votes": 28850
    },
    "Hi On Line Lounge Radio": {
      "name": "Hi On Line Lounge Radio",
      "url": "http://mediaserv33.live-streams.nl:8036/live",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Elektronische muziek",
      "bitrate": 320,
      "city": null,
      "votes": 4586
    },
    "Fantasy Italo Dance 90s radio": {
      "name": "Fantasy Italo Dance 90s radio",
      "url": "https://mscp2.live-streams.nl:8152/italodance",
      "logo": "https://jplayer-generator.live-streams.nl/upload/96142657.jpg",
      "description": "Dance muziek",
      "bitrate": 256,
      "city": "Zuid-Holland",
      "votes": 3129
    },
    "C-Dance RETRO": {
      "name": "C-Dance RETRO",
      "url": "http://s45.myradiostream.com:18304/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 192,
      "city": null,
      "votes": 2935
    },
    "Hi On Line Jazz Radio": {
      "name": "Hi On Line Jazz Radio",
      "url": "http://mediaserv38.live-streams.nl:8006/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Jazz muziek",
      "bitrate": 320,
      "city": null,
      "votes": 2561
    },
    "Deep Radio": {
      "name": "Deep Radio",
      "url": "http://stream.deep.radio/hd",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": "Noord-Holland",
      "votes": 1635
    },
    "Jazz de Ville - Chill": {
      "name": "Jazz de Ville - Chill",
      "url": "https://onair22.xdevel.com/proxy/xautocloud_td3e_421?mp=/stream",
      "logo": "https://www.jazzdeville.com/favicon/jazzdeville/apple-touch-icon.png",
      "description": "Jazz muziek",
      "bitrate": 128,
      "city": null,
      "votes": 1332
    },
    "All Oldies Channel": {
      "name": "All Oldies Channel",
      "url": "http://radio.alloldieschannel.com:8000/stream",
      "logo": "https://alloldieschannel.com/wp-content/uploads/2020/01/cropped-backgroundalloldieschannel-180x180.png",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": "Noord Brabant",
      "votes": 1205
    },
    "JAMM FM": {
      "name": "JAMM FM",
      "url": "https://www.jammfm.nl/stream/listen.pls",
      "logo": "https://cdn-radiotime-logos.tunein.com/s122234q.png",
      "description": "Gespecialiseerde muziek",
      "bitrate": 320,
      "city": null,
      "votes": 731
    },
    "Hi On Line Radio - Jazz": {
      "name": "Hi On Line Radio - Jazz",
      "url": "http://mediaserv38.live-streams.nl:8006/live",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Jazz muziek",
      "bitrate": 320,
      "city": null,
      "votes": 611
    },
    "Q-Dance Radio": {
      "name": "Q-Dance Radio",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/Q_DANCE.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 192,
      "city": null,
      "votes": 599
    },
    "Jazz de Ville - Groove": {
      "name": "Jazz de Ville - Groove",
      "url": "https://onair22.xdevel.com/proxy/xautocloud_1kha_423?mp=/stream",
      "logo": "https://www.jazzdeville.com/favicon/jazzdeville/apple-touch-icon.png",
      "description": "Jazz muziek",
      "bitrate": 128,
      "city": null,
      "votes": 583
    },
    "Tukker FM": {
      "name": "Tukker FM",
      "url": "https://stream.tukkerfm.nl/tukkerfm",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Folk muziek",
      "bitrate": 192,
      "city": null,
      "votes": 529
    },
    "Jazz de Ville - Jazz": {
      "name": "Jazz de Ville - Jazz",
      "url": "https://onair22.xdevel.com/proxy/xautocloud_kkyb_420?mp=/stream",
      "logo": "https://www.jazzdeville.com/favicon/jazzdeville/apple-touch-icon.png",
      "description": "Jazz muziek",
      "bitrate": 128,
      "city": null,
      "votes": 474
    },
    "Celtcast": {
      "name": "Celtcast",
      "url": "https://caster04.streampakket.com/proxy/8982/CeltCast",
      "logo": "https://celtcast.com/wp-content/uploads/2017/04/cropped-CeltCast-Community-Radio-Square-Black-with-White-512-270x270.jpg",
      "description": "Folk muziek",
      "bitrate": 192,
      "city": null,
      "votes": 438
    },
    "Jazz de Ville - Dance": {
      "name": "Jazz de Ville - Dance",
      "url": "https://onair22.xdevel.com/proxy/xautocloud_6cqz_422?mp=/stream",
      "logo": "https://www.jazzdeville.com/favicon/jazzdeville/apple-touch-icon.png",
      "description": "Jazz muziek",
      "bitrate": 128,
      "city": null,
      "votes": 428
    },
    "Hi On Line Radio - Classical": {
      "name": "Hi On Line Radio - Classical",
      "url": "http://mediaserv30.live-streams.nl:8088/live",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Klassieke muziek",
      "bitrate": 320,
      "city": null,
      "votes": 400
    },
    "Pinguin Aardschok": {
      "name": "Pinguin Aardschok",
      "url": "https://streams.pinguinradio.com/Aardschok192.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Gespecialiseerde muziek",
      "bitrate": 192,
      "city": null,
      "votes": 315
    },
    "Dancegroove Radio": {
      "name": "Dancegroove Radio",
      "url": "https://server7.streamserver24.com:8080/proxy/marasalf?mp=/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 128,
      "city": "Amsterdam",
      "votes": 309
    },
    "Classicnl Opera": {
      "name": "Classicnl Opera",
      "url": "https://classic.nl/streams/?s=opera",
      "logo": "https://www.classic.nl/favicon.ico",
      "description": "Klassieke muziek",
      "bitrate": 256,
      "city": "Utrecht",
      "votes": 238
    },
    "Soundtrack Radio Station": {
      "name": "Soundtrack Radio Station",
      "url": "http://quincy.torontocast.com:2410/stream",
      "logo": "https://www.radio.net/images/broadcasts/9d/8d/39794/1/c300.png",
      "description": "Klassieke muziek",
      "bitrate": 128,
      "city": "Amsterdam",
      "votes": 221
    },
    "DANCEableRADIO": {
      "name": "DANCEableRADIO",
      "url": "http://s14.myradiostream.com:19580/listen.pls?sid=1",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": "Rotterdam",
      "votes": 178
    },
    "classic nl soundtracks": {
      "name": "classic nl soundtracks",
      "url": "https://stream.classic.nl/classicnl-soundtracks.mp3",
      "logo": "https://www.classic.nl/images/icons/apple-icon-120x120.png",
      "description": "Klassieke muziek",
      "bitrate": 256,
      "city": null,
      "votes": 170
    },
    "Ice Radio The Alternative": {
      "name": "Ice Radio The Alternative",
      "url": "https://stream.iceradio.nl/iceradio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Jazz muziek",
      "bitrate": 128,
      "city": "Utrecht",
      "votes": 149
    },
    "Radio 078 Synth": {
      "name": "Radio 078 Synth",
      "url": "https://panel.beheerstream.com:2199/tunein/ujogqmho.pls",
      "logo": "https://radio078.fm/favicon.ico",
      "description": "Elektronische muziek",
      "bitrate": 320,
      "city": null,
      "votes": 107
    },
    "Intense Radio - We love Dance": {
      "name": "Intense Radio - We love Dance",
      "url": "http://intenseradio.live-streams.nl:8000/main",
      "logo": "https://www.intenseradio.net/wp-content/uploads/fbrfg/apple-touch-icon.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": null,
      "votes": 103
    },
    "New Dance Radio": {
      "name": "New Dance Radio",
      "url": "https://modspeedy.radioca.st/stream2",
      "logo": "https://newdanceradio.fun/favicon.ico",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": null,
      "votes": 100
    },
    "Classicnl": {
      "name": "Classicnl",
      "url": "https://classic.nl/streams/?s=main",
      "logo": "https://www.classic.nl/favicon.ico",
      "description": "Klassieke muziek",
      "bitrate": 192,
      "city": "Utrecht",
      "votes": 98
    },
    "Classic NL": {
      "name": "Classic NL",
      "url": "https://classic.nl/streams/?s=main",
      "logo": "https://classic.nl/images/icons/favicon-32x32.png",
      "description": "Klassieke muziek",
      "bitrate": 192,
      "city": null,
      "votes": 91
    },
    "DanceFM": {
      "name": "DanceFM",
      "url": "http://streams.bigfm.de/bigfm-dance-64-aac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 128,
      "city": null,
      "votes": 75
    },
    "Pure Lounge Radio FLAC": {
      "name": "Pure Lounge Radio FLAC",
      "url": "https://mscp4.live-streams.nl:8142/lounge.ogg",
      "logo": "https://www.pureloungeradio.com/images/Pureloungeradio-achtergrond.jpg",
      "description": "Gespecialiseerde muziek",
      "bitrate": 1411,
      "city": null,
      "votes": 72
    },
    "Radioachterhoeknl": {
      "name": "Radioachterhoeknl",
      "url": "https://stream.radioachterhoek.nl/index.html?sid=1",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Gespecialiseerde muziek",
      "bitrate": 320,
      "city": "Gelderland",
      "votes": 60
    },
    "Beats 2 Dance - Trance": {
      "name": "Beats 2 Dance - Trance",
      "url": "https://mediaserv38.live-streams.nl:18002/trance",
      "logo": "https://beats2dance.com/wp-content/uploads/2022/11/dj-set.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": "Netherlands",
      "votes": 52
    },
    "classic nl mind radio": {
      "name": "classic nl mind radio",
      "url": "https://stream.classic.nl/classicnl-mindradio.mp3",
      "logo": "https://www.classic.nl/images/logo-footer.png",
      "description": "Klassieke muziek",
      "bitrate": 256,
      "city": null,
      "votes": 51
    },
    "Classic nl original": {
      "name": "Classic nl original",
      "url": "https://stream.classic.nl/classicnl.mp3",
      "logo": "https://classic.nl/images/beeldmerk-classicnl@2x.png",
      "description": "Klassieke muziek",
      "bitrate": 192,
      "city": null,
      "votes": 50
    },
    "Deep Dance Radio": {
      "name": "Deep Dance Radio",
      "url": "https://cast1.torontocast.com:2205/stream",
      "logo": "https://www.deepdanceradio.nl/favicon.ico",
      "description": "Dance muziek",
      "bitrate": 192,
      "city": null,
      "votes": 48
    },
    "Pyro-Tec Retro": {
      "name": "Pyro-Tec Retro",
      "url": "http://stream.zeno.fm/nqtl8hjdqzxvv",
      "logo": "https://zeno.fm/favicon.ico",
      "description": "Dance muziek",
      "bitrate": 128,
      "city": "Rotterdam",
      "votes": 48
    },
    "Beata 2 Dance - House": {
      "name": "Beata 2 Dance - House",
      "url": "https://mediaserv38.live-streams.nl:18002/house",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": "Netherlands",
      "votes": 43
    },
    "Cool Dance Radio": {
      "name": "Cool Dance Radio",
      "url": "https://stream.cooldanceradio.com/stream1/stream.mp3",
      "logo": "https://www.cooldanceradio.com/favicon.ico",
      "description": "Dance muziek",
      "bitrate": 192,
      "city": null,
      "votes": 43
    },
    "Classicnl Soundtracks": {
      "name": "Classicnl Soundtracks",
      "url": "https://classic.nl/streams/?s=soundtracks",
      "logo": "https://classic.nl/favicon.ico",
      "description": "Klassieke muziek",
      "bitrate": 256,
      "city": "Utrecht",
      "votes": 41
    },
    "World of Jazz": {
      "name": "World of Jazz",
      "url": "http://streams.greenhost.nl:8080/jazz",
      "logo": "https://www.concertzender.nl/wp-content/uploads/2024/04/WoJ-logo_zwart_verticaal_RGB.jpg",
      "description": "Jazz muziek",
      "bitrate": 256,
      "city": null,
      "votes": 37
    },
    "ISKC Extreme Metal": {
      "name": "ISKC Extreme Metal",
      "url": "http://mediaserv68.live-streams.nl:8012/ExtremeMetal",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Metal muziek",
      "bitrate": 320,
      "city": "Rotterdam",
      "votes": 36
    },
    "All Day Jazz": {
      "name": "All Day Jazz",
      "url": "https://mediaserv73.live-streams.nl:8027/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Jazz muziek",
      "bitrate": 320,
      "city": "Zuid-Holland",
      "votes": 35
    },
    "Cream": {
      "name": "Cream",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/CREAM.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Jazz muziek",
      "bitrate": 192,
      "city": null,
      "votes": 34
    },
    "Pyro-Tec Radio": {
      "name": "Pyro-Tec Radio",
      "url": "http://stream.zeno.fm/wfafmjdyhrrvv",
      "logo": "https://zeno.fm/_next/image/?url=https%3A%2F%2Fimages.zeno.fm%2FKGqdS-mYt5FV81P1MRN0HV6nMivRMtoebSDWYsP2cgY%2Frs%3Afit%3A240%3A240%2Fg%3Ace%3A0%3A0%2FaHR0cHM6Ly9zdHJlYW0tdG9vbHMuemVub21lZGlhLmNvbS9jb250ZW50L3N0YXRpb25zL2FneHpmbnBsYm04dGMzUmhkSE55TWdzU0NrRjFkR2hEYkdsbGJuUVlnSUNRMmZxam9Bc01DeElPVTNSaGRHbHZibEJ5YjJacGJHVVlnSUNRNllhVTR3b01vZ0VFZW1WdWJ3L2ltYWdlLz91cGRhdGVkPTE2NjE3MTIzNjMwMDA.webp&w=1920&q=100",
      "description": "Dance muziek",
      "bitrate": 128,
      "city": "Rotterdam",
      "votes": 34
    },
    "Hitzzz das radio": {
      "name": "Hitzzz das radio",
      "url": "https://stream.hitzzz.nl/hitzzz",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Klassieke muziek",
      "bitrate": 192,
      "city": null,
      "votes": 27
    },
    "Radio-Goldenwave": {
      "name": "Radio-Goldenwave",
      "url": "http://mscp3.live-streams.nl:8070/radio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Klassieke muziek",
      "bitrate": 320,
      "city": null,
      "votes": 22
    },
    "Beats2Dance - House": {
      "name": "Beats2Dance - House",
      "url": "https://mediaserv38.live-streams.nl:18002/house",
      "logo": "https://i.postimg.cc/sg6D9HcP/house-logo-white.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": null,
      "votes": 20
    },
    "Classic Mind Radio": {
      "name": "Classic Mind Radio",
      "url": "https://classic.nl/streams/?s=mindradio",
      "logo": "https://www.classic.nl/favicon.ico",
      "description": "Klassieke muziek",
      "bitrate": 256,
      "city": "Utrecht",
      "votes": 19
    },
    "Decibel Eurodance": {
      "name": "Decibel Eurodance",
      "url": "https://stream.decibel.nl/02.mp3",
      "logo": "https://i0.wp.com/www.decibel.nl/wp-content/uploads/2022/04/Eurodance.png?w=1060&ssl=1",
      "description": "Dance muziek",
      "bitrate": 192,
      "city": null,
      "votes": 19
    },
    "Stilok": {
      "name": "Stilok",
      "url": "http://streaming1.steigerstudios.nl/stilok-mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Klassieke muziek",
      "bitrate": 192,
      "city": null,
      "votes": 18
    },
    "Radio Seagull": {
      "name": "Radio Seagull",
      "url": "http://stream.radioseagull.net:8000/seagull",
      "logo": "https://pbs.twimg.com/profile_images/725305078660341761/kANcRaAd_400x400.jpg",
      "description": "Klassieke muziek",
      "bitrate": 128,
      "city": null,
      "votes": 17
    },
    "C-Dance": {
      "name": "C-Dance",
      "url": "http://s45.myradiostream.com:18304/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 192,
      "city": null,
      "votes": 16
    },
    "RTV Love Volendam Edam": {
      "name": "RTV Love Volendam Edam",
      "url": "https://webstream.rtvlove.nl/live",
      "logo": "https://www.rtvlove.nl/wp-content/uploads/cropped-rtvlove-favicon-180x180.png",
      "description": "Gespecialiseerde muziek",
      "bitrate": 128,
      "city": "Noord-Holland",
      "votes": 16
    },
    "Radio Twente Gold": {
      "name": "Radio Twente Gold",
      "url": "https://c18.radioboss.fm:8403/stream",
      "logo": "https://cdn.onlineradiobox.com/img/l/2/115442.v15.png",
      "description": "Jazz muziek",
      "bitrate": 192,
      "city": "Overijssel",
      "votes": 15
    },
    "Dancevibes Radio": {
      "name": "Dancevibes Radio",
      "url": "https://everestcast.live-streams.nl:8025/stream",
      "logo": "https://dancevibesradio.eu/wp-content/uploads/2021/11/DANCEVIBES-LOGO-2.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": null,
      "votes": 13
    },
    "Grand Prix Radio Dance": {
      "name": "Grand Prix Radio Dance",
      "url": "https://eu-playerservices.streamtheworld.com/api/livestream-redirect/GPRDANCEAAC.aac?lsid=app%3Abrowser-1711892652042l1lq6akqk",
      "logo": "https://grandprixradio.nl/themes/flixi/favicons/apple-touch-icon.png?v=2",
      "description": "Dance muziek",
      "bitrate": 128,
      "city": null,
      "votes": 11
    },
    "zendpiraat": {
      "name": "zendpiraat",
      "url": "https://cc6.beheerstream.com/proxy/wluhlvrs?mp=/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Gespecialiseerde muziek",
      "bitrate": 320,
      "city": "Groningen",
      "votes": 11
    },
    "Q-Dance": {
      "name": "Q-Dance",
      "url": "http://25273.live.streamtheworld.com/Q_DANCE.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 192,
      "city": null,
      "votes": 10
    },
    "Food and Lounge": {
      "name": "Food and Lounge",
      "url": "https://stream.laut.fm/food-and-lounge",
      "logo": "https://laut.fm/assets/touch-icons/favicon-16x16.png?21f4f2f5",
      "description": "Jazz muziek",
      "bitrate": 128,
      "city": "Lelystad",
      "votes": 9
    },
    "beats2dance - Techno": {
      "name": "beats2dance - Techno",
      "url": "https://mediaserv38.live-streams.nl:18002/techno",
      "logo": "https://beats2dance.com/wp-content/uploads/2020/09/logo-profiel-foto.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": null,
      "votes": 8
    },
    "RADIO ALEX FM CHRISTMAS NLDE": {
      "name": "RADIO ALEX FM CHRISTMAS NLDE",
      "url": "https://stream.laut.fm/radioalexfmchristmas",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Folk muziek",
      "bitrate": 128,
      "city": null,
      "votes": 8
    },
    "Jazz & World Radio": {
      "name": "Jazz & World Radio",
      "url": "https://stream.jazzandworld.radio//JAZZANDWORLD.mp3",
      "logo": "https://jazzandworld.radio/wp-content/uploads/2022/01/JWR-main-logo@x2.png",
      "description": "Jazz muziek",
      "bitrate": 128,
      "city": null,
      "votes": 6
    },
    "Klasse FM": {
      "name": "Klasse FM",
      "url": "https://mediaserv38.live-streams.nl:18023/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": "Gelderland",
      "votes": 6
    },
    "flitsradio van willem": {
      "name": "flitsradio van willem",
      "url": "https://streamer.hosting078.nl:1835/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Klassieke muziek",
      "bitrate": 320,
      "city": null,
      "votes": 5
    },
    "beats2dance - Trance": {
      "name": "beats2dance - Trance",
      "url": "https://mediaserv38.live-streams.nl:18002/trance",
      "logo": "https://beats2dance.com/wp-content/uploads/2020/09/logo-profiel-foto.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": null,
      "votes": 4
    },
    "AfterhoursFM": {
      "name": "AfterhoursFM",
      "url": "https://ah.fm/live.m3u",
      "logo": "https://ah.fm/wp-content/uploads/2023/03/transparent-white.png",
      "description": "Gespecialiseerde muziek",
      "bitrate": 64,
      "city": null,
      "votes": 2
    },
    "Danceclassiceu": {
      "name": "Danceclassiceu",
      "url": "https://mediaserv21.live-streams.nl:8011/stream/;type=v2",
      "logo": "https://danceclassic.eu/wp-content/uploads/2024/06/DC.EU_.png",
      "description": "Dance muziek",
      "bitrate": 192,
      "city": null,
      "votes": 2
    },
    "Nicky FM": {
      "name": "Nicky FM",
      "url": "https://caster08.streampakket.com/proxy/nickyfm/stream",
      "logo": "https://www.nickyfm.nl/wp-content/uploads/2022/01/nicky-fm-logo-1000x200-banner.jpg",
      "description": "Gespecialiseerde muziek",
      "bitrate": 256,
      "city": "Overijssel",
      "votes": 2
    },
    "WAVE": {
      "name": "WAVE",
      "url": "http://radio.wave.frl/listen/waveradio/radio.mp3",
      "logo": "https://wave.frl/favicon.png",
      "description": "Folk muziek",
      "bitrate": 192,
      "city": "Friesland",
      "votes": 2
    },
    "40UP ClassicNL Mindradio": {
      "name": "40UP ClassicNL Mindradio",
      "url": "https://stream.40upradio.nl/thema1",
      "logo": "https://dev.40upradio.nl/wp-content/uploads/2021/12/40-up-radio.jpg",
      "description": "Klassieke muziek",
      "bitrate": 128,
      "city": "Noord-Holland, Amsterdam",
      "votes": 1
    },
    "Fryslan Strijders - Piratenhits op volle toeren": {
      "name": "Fryslan Strijders - Piratenhits op volle toeren",
      "url": "https://streambeheer.fryslanstrijders.nl/proxy/fryslanstrijders/stream",
      "logo": "https://fryslanstrijders.nl/wp-content/uploads/2021/01/img.png",
      "description": "Populaire hits",
      "bitrate": 128,
      "city": "Kingdom of the Netherlands",
      "votes": 1
    },
    "Hi On Line - Jazz": {
      "name": "Hi On Line - Jazz",
      "url": "https://mediaserv38.live-streams.nl:18006/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Jazz muziek",
      "bitrate": 320,
      "city": "Noord-Holland, Amsterdam",
      "votes": 1
    },
    "Pure Radio Holland - Dance Channel": {
      "name": "Pure Radio Holland - Dance Channel",
      "url": "https://streamserver.pure-isp.eu/listen/pure_radio_holland_-_dance_channel/aac-plus?ver=678021",
      "logo": "https://pureradio.eu/wp-content/uploads/2023/02/Logo-Pure-Radio-Dance-Channel-170x170.jpg.webp",
      "description": "Dance muziek",
      "bitrate": 256,
      "city": null,
      "votes": 1
    },
    "RTV794": {
      "name": "RTV794",
      "url": "https://nlpo.stream.vip/radio794fm/mp3-192/nlpo/",
      "logo": "https://cdn.nieuwsned.nl/d2ddea18f00665ce8623e36bd4e3c7c5/2023/09/27/20/48/15/rtv794_logo.jpg",
      "description": "Klassieke muziek",
      "bitrate": 128,
      "city": "Gelderland, Heerde",
      "votes": 1
    },
    "40UP ClassicNL Soundtracks": {
      "name": "40UP ClassicNL Soundtracks",
      "url": "https://stream.40upradio.nl/thema2",
      "logo": "https://dev.40upradio.nl/wp-content/uploads/2021/12/40-up-radio.jpg",
      "description": "Klassieke muziek",
      "bitrate": 128,
      "city": "Noord-Holland, Amsterdam",
      "votes": 0
    },
    "D2BS": {
      "name": "D2BS",
      "url": "http://solid1.streamupsolutions.com:8041/d2bs",
      "logo": "https://d2bs.nl/images/D2BS.png",
      "description": "Pop muziek",
      "bitrate": 320,
      "city": null,
      "votes": 0
    },
    "Radio Terranova": {
      "name": "Radio Terranova",
      "url": "https://server-28.stream-server.nl:8914/stream",
      "logo": "https://www.radioterranova.nl/bannerradioterranova.jpg",
      "description": "Folk muziek",
      "bitrate": 192,
      "city": "Noord-Holland, Amsterdam",
      "votes": 0
    }
  },
  "other": {
    "5638": {
      "name": "5638",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR08.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 0
    },
    "Fantasy Italo Radio": {
      "name": "Fantasy Italo Radio",
      "url": "https://italo.live-streams.nl/fantasy",
      "logo": "https://italo.nu/fantasy-logo.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": "Burgenland",
      "votes": 117819
    },
    "Radio Continu": {
      "name": "Radio Continu",
      "url": "http://stream.radiocontinu.nl/radiocontinu",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 2503
    },
    "Hi On Line World Radio": {
      "name": "Hi On Line World Radio",
      "url": "http://mediaserv38.live-streams.nl:8027/live",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 2402
    },
    "Grolloo Radio": {
      "name": "Grolloo Radio",
      "url": "https://uk1.streamingpulse.com/ssl/grollooradio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1865
    },
    "Nashville FM": {
      "name": "Nashville FM",
      "url": "http://server-10.stream-server.nl:8300/",
      "logo": "https://www.nashvilletv.nl/wp-content/uploads/2016/04/cropped-nashvilletv-logo-favicon-180x180.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1714
    },
    "Italo Power": {
      "name": "Italo Power",
      "url": "http://stream.radioitalopower.com:10018/italopower",
      "logo": "https://www.italopower.com/assets/img/apple-touch-icon.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 1241
    },
    "192 Radio HQ": {
      "name": "192 Radio HQ",
      "url": "http://server-27.stream-server.nl:8192/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1079
    },
    "Golden Oldies Radio": {
      "name": "Golden Oldies Radio",
      "url": "https://sonic.magicdragon.nl/8034/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Rotterdam",
      "votes": 875
    },
    "Hi On Line Latin Radio": {
      "name": "Hi On Line Latin Radio",
      "url": "http://mediaserv33.live-streams.nl:8034/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 855
    },
    "Slow Radio Gold": {
      "name": "Slow Radio Gold",
      "url": "https://stream11.slowradio.com/",
      "logo": "https://en.slowradio.com/img/favicons/apple-touch-icon.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 792
    },
    "Pinguin Radio": {
      "name": "Pinguin Radio",
      "url": "http://streams.pinguinradio.com/PinguinRadio320.mp3",
      "logo": "https://pinguinradio.com/dist/images/content/p-radio.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 791
    },
    "Pinguin Indie": {
      "name": "Pinguin Indie",
      "url": "http://streams.pinguinradio.com/PinguinRadio192.mp3",
      "logo": "https://pinguinradio.com/assets/icons/icon-72x72.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 750
    },
    "Real Hardstyle Radio": {
      "name": "Real Hardstyle Radio",
      "url": "https://stream.realhardstyle.nl/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 607
    },
    "Baars classic Rock": {
      "name": "Baars classic Rock",
      "url": "http://server-66.stream-server.nl:8840/",
      "logo": "http://www.baarsclassicrock.nl/favicon.ico",
      "description": "Rock muziek",
      "bitrate": 320,
      "city": null,
      "votes": 586
    },
    "Oude Piraten Hits": {
      "name": "Oude Piraten Hits",
      "url": "http://server-67.stream-server.nl:8910/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Populaire hits",
      "bitrate": 192,
      "city": null,
      "votes": 578
    },
    "Olympia Classics": {
      "name": "Olympia Classics",
      "url": "http://streams.olympia-classics.nl/classics",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 530
    },
    "ISKC Blues Cafe": {
      "name": "ISKC Blues Cafe",
      "url": "http://mediaserv68.live-streams.nl:8012/BluesCafe",
      "logo": "https://i0.wp.com/iskcrocks.com/wp-content/uploads/2019/09/blues-cafe-740.jpg?w=720&ssl=1",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 490
    },
    "Sjeffm": {
      "name": "Sjeffm",
      "url": "https://caster05.streampakket.com/proxy/8112/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Weert",
      "votes": 486
    },
    "RADIONL": {
      "name": "RADIONL",
      "url": "http://stream.radionl.fm/radionl",
      "logo": "https://www.radionl.fm/wp-content/uploads/2024/10/cropped-fav-180x180.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 460
    },
    "jungletrainnet - 247 drum and bass": {
      "name": "jungletrainnet - 247 drum and bass",
      "url": "https://chat.jungletrain.net/streamtest/;stream/1",
      "logo": "https://jungletrain.net/jth-inc/images/jtlogo.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 451
    },
    "ArabNights": {
      "name": "ArabNights",
      "url": "https://arabnights-prod.live-streams.nl:18020/live",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 432
    },
    "Joy Radio": {
      "name": "Joy Radio",
      "url": "http://stream.joyradio.nl/joyradio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "90s & 00s hits",
      "bitrate": 192,
      "city": null,
      "votes": 395
    },
    "RTV Noord Holland NH Radio": {
      "name": "RTV Noord Holland NH Radio",
      "url": "https://ice.cr6.streamzilla.xlcdn.com:8000/sz=nhnieuws=NHRadio_mp3",
      "logo": "https://www.nhnieuws.nl/nh/apple-touch-icon.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord-Holland",
      "votes": 385
    },
    "Ujala Radio": {
      "name": "Ujala Radio",
      "url": "http://stream2.ujala.nl/stream/2/listen.mp3",
      "logo": "https://ujala.nl/wp-content/uploads/2017/02/cropped-ujala-logo_los-180x180.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 385
    },
    "ISKC Rock Radio": {
      "name": "ISKC Rock Radio",
      "url": "https://www.iskcrocks.com/rock.m3u",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 320,
      "city": null,
      "votes": 378
    },
    "Q music Nederland": {
      "name": "Q music Nederland",
      "url": "https://stream.qmusic.nl/qmusic/aachigh",
      "logo": "https://qmusic.nl/favicon.ico",
      "description": "Pop muziek",
      "bitrate": 95,
      "city": null,
      "votes": 368
    },
    "Hi On Line Radio - Latin": {
      "name": "Hi On Line Radio - Latin",
      "url": "http://mediaserv33.live-streams.nl:8034/live",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 362
    },
    "KX Classics": {
      "name": "KX Classics",
      "url": "http://stream.kxclassikx.nl/",
      "logo": "http://www.kxclassics.nl/images/favicon/apple-icon-120x120.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 338
    },
    "Grand Prix Radio": {
      "name": "Grand Prix Radio",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/GRAND_PRIX_RADIO.mp3",
      "logo": "https://grandprixradio.nl/themes/flixi/favicons/apple-touch-icon.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 333
    },
    "LX Classics": {
      "name": "LX Classics",
      "url": "http://www.lxclassics.com/playlist/LXClassics.m3u",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 316
    },
    "Freak31": {
      "name": "Freak31",
      "url": "http://stream.freak31.com:8322/",
      "logo": "https://static.wixstatic.com/media/f13c33_866969d6fd224cf59eb44f47a88fc300.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Amsterdam",
      "votes": 300
    },
    "ADM Hardstyle Radio": {
      "name": "ADM Hardstyle Radio",
      "url": "http://kathy.torontocast.com:2450/stream",
      "logo": "https://hardstyleradio.nu/images/sitelogo.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 295
    },
    "Hi On Line Radio - Flac": {
      "name": "Hi On Line Radio - Flac",
      "url": "http://mscp2.live-streams.nl:8100/flac.flac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 261
    },
    "Omrop Frysln Radio": {
      "name": "Omrop Frysln Radio",
      "url": "https://d3pvma9xb2775h.cloudfront.net/icecast/omropfryslan/radio.mp3",
      "logo": "https://s.regiogroei.cloud/img/favicons/friesland/apple-touch-icon.png?v=1687163124059",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Friesland",
      "votes": 254
    },
    "Old Mens Radio": {
      "name": "Old Mens Radio",
      "url": "http://server-10.stream-server.nl:8140/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 252
    },
    "Pinguin Classics": {
      "name": "Pinguin Classics",
      "url": "http://streams.pinguinradio.com/PinguinClassics192.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 251
    },
    "Slow Radio": {
      "name": "Slow Radio",
      "url": "https://stream1.slowradio.com/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 234
    },
    "Keizerstad Radio 80s": {
      "name": "Keizerstad Radio 80s",
      "url": "http://server-06.stream-server.nl:8800/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 320,
      "city": "Gelderland",
      "votes": 227
    },
    "Radio Noordvaarder Reiki": {
      "name": "Radio Noordvaarder Reiki",
      "url": "http://stream.radionoordvaarder.nl:8050/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 227
    },
    "Echtepiratennl": {
      "name": "Echtepiratennl",
      "url": "https://azuraserv3.live-streams.nl:8040/stream.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Drenthe",
      "votes": 220
    },
    "Italoradiofm": {
      "name": "Italoradiofm",
      "url": "http://cc6.beheerstream.com:8102/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 219
    },
    "Omroep West": {
      "name": "Omroep West",
      "url": "http://icecast.stream.bbvms.com/omroepwest_radio",
      "logo": "https://s.regiogroei.cloud/img/favicons/west/apple-touch-icon.png?v=1698053263425",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Zuid-Holland",
      "votes": 216
    },
    "INTERGALACTIC FM - Disco Fetish": {
      "name": "INTERGALACTIC FM - Disco Fetish",
      "url": "http://radio.intergalactic.fm/2.m3u",
      "logo": "https://www.intergalactic.fm/themes/custom/ifm/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 212
    },
    "RTV Maastricht 1075": {
      "name": "RTV Maastricht 1075",
      "url": "http://stream.rtvmaastricht.nl:8081/rtv/radio_audio/icecast.audio",
      "logo": "http://www.rtvmaastricht.nl/rtvmaastricht_nl/images/favicon/apple-touch-icon.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Limburg",
      "votes": 206
    },
    "PureClassix Flac": {
      "name": "PureClassix Flac",
      "url": "http://mscp4.live-streams.nl:8140/flac.ogg",
      "logo": "https://cdn-profiles.tunein.com/s206043/images/logod.png?t=637460687100000000",
      "description": "Nederlandse radio",
      "bitrate": 1411,
      "city": null,
      "votes": 202
    },
    "INTERGALACTIC FM - Cybernetic Broadcasting System": {
      "name": "INTERGALACTIC FM - Cybernetic Broadcasting System",
      "url": "http://radio.intergalactic.fm/1.m3u",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 196
    },
    "Tropixx FM 1055 Philipsburg": {
      "name": "Tropixx FM 1055 Philipsburg",
      "url": "http://stream.sxmradio.com:8060/channel2.mp3",
      "logo": "http://tropixx.fm/wp-content/uploads/2021/08/cropped-tropixx-site-icon-180x180.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Sint Maarten",
      "votes": 175
    },
    "Radio Caroline 259 Gold": {
      "name": "Radio Caroline 259 Gold",
      "url": "https://happy.radiocaroline.nl/listen/classic_rock/radio128.mp3",
      "logo": "https://radiocaroline259.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 170
    },
    "Pinguin On the Rocks": {
      "name": "Pinguin On the Rocks",
      "url": "http://streams.pinguinradio.com/PinguinOnTheRocks192.mp3",
      "logo": "https://pinguinradio.com/assets/img/logo/pinguinrock.svg",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": null,
      "votes": 167
    },
    "Ice Radio Netherlands": {
      "name": "Ice Radio Netherlands",
      "url": "https://stream.iceradio.nl/iceradio",
      "logo": "https://iceradio.nl/wp-content/uploads/2020/07/iceradio-logo-kuiken-trans.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 166
    },
    "HouseBeatsfm": {
      "name": "HouseBeatsfm",
      "url": "https://mediaserv38.live-streams.nl:18048/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 156
    },
    "Only 80s Radio": {
      "name": "Only 80s Radio",
      "url": "https://server-28.stream-server.nl:8850/stream",
      "logo": "https://www.only80sradio.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 147
    },
    "Hardstyle FM": {
      "name": "Hardstyle FM",
      "url": "http://stream.laut.fm/hardstylefm",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 145
    },
    "Synthwave City FM - New": {
      "name": "Synthwave City FM - New",
      "url": "https://synthwave-rex.radioca.st/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 145
    },
    "X1043 Philipsburg": {
      "name": "X1043 Philipsburg",
      "url": "http://stream.sxmradio.com:8060/1043.mp3",
      "logo": "https://static.wixstatic.com/media/5218a9_a6b816efe4ba450682e490d509934b92.png",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": "Sint Maarten",
      "votes": 142
    },
    "Freez FM": {
      "name": "Freez FM",
      "url": "http://stream.freezfm.nl/freezfm",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": null,
      "votes": 129
    },
    "ICE RADIO": {
      "name": "ICE RADIO",
      "url": "https://stream.iceradio.nl/iceradiohq?ver=30283",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 320,
      "city": null,
      "votes": 128
    },
    "Laser 101 - 1011 Philipsburg": {
      "name": "Laser 101 - 1011 Philipsburg",
      "url": "http://stream.sxmradio.com:8060/channel7.mp3",
      "logo": "http://laser101.fm/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Sint Maarten",
      "votes": 128
    },
    "Delta Piraat": {
      "name": "Delta Piraat",
      "url": "http://stream.deltafm.nl:8125/listen.pls",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 127
    },
    "Efteling Kids Radio": {
      "name": "Efteling Kids Radio",
      "url": "http://playerservices.streamtheworld.com/m3u/TLPSTR07.m3u",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 123
    },
    "Magic FM": {
      "name": "Magic FM",
      "url": "https://stream.magicfm.nl/magicfm",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 123
    },
    "XXL Stenders": {
      "name": "XXL Stenders",
      "url": "https://mcp-1.streampanel.nl:8020/bonanza_mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 122
    },
    "80s Alive": {
      "name": "80s Alive",
      "url": "http://media2.hostin.cc/80s-alive.mp3",
      "logo": "https://alive.radio/wp-content/uploads/2021/10/80s-alive-bg-2021-4k-met-logo-scaled.jpg",
      "description": "Rock muziek",
      "bitrate": 320,
      "city": null,
      "votes": 121
    },
    "INTERGALACTIC FM - The Dream Machine": {
      "name": "INTERGALACTIC FM - The Dream Machine",
      "url": "http://radio.intergalactic.fm/3.m3u",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 120
    },
    "Simone FM": {
      "name": "Simone FM",
      "url": "https://stream.simone.nl/simone",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": null,
      "votes": 120
    },
    "Grandprix radio": {
      "name": "Grandprix radio",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/GRAND_PRIX_RADIO.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 111
    },
    "Hardcore Power Radio": {
      "name": "Hardcore Power Radio",
      "url": "https://hardcorepower.beheerstream.nl/8012/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 111
    },
    "Olympia Radio": {
      "name": "Olympia Radio",
      "url": "http://streams.olympia-radio.nl/olympia",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 108
    },
    "Waterstad FM": {
      "name": "Waterstad FM",
      "url": "http://stream.waterstadfm.nl/waterstadfm",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Friesland",
      "votes": 106
    },
    "Hi On Line Radio - France": {
      "name": "Hi On Line Radio - France",
      "url": "http://mediaserv21.live-streams.nl:8000/live",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 105
    },
    "ISKC Rock Radio RPO Recent Prog Only": {
      "name": "ISKC Rock Radio RPO Recent Prog Only",
      "url": "http://mediaserv68.live-streams.nl:8012/RockRadio2",
      "logo": "https://i0.wp.com/iskcrocks.com/wp-content/uploads/2021/06/RPO-1-720.jpg?fit=720%2C400&amp;ssl=1",
      "description": "Rock muziek",
      "bitrate": 320,
      "city": null,
      "votes": 104
    },
    "ISKC Rock Radio XXL": {
      "name": "ISKC Rock Radio XXL",
      "url": "http://mediaserv68.live-streams.nl:8012/XXL",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 320,
      "city": null,
      "votes": 103
    },
    "Olympia Classics - Greatest Hits Of The 60s 70s 80s & 90s": {
      "name": "Olympia Classics - Greatest Hits Of The 60s 70s 80s & 90s",
      "url": "http://streams.olympia-streams.nl/classics192",
      "logo": "https://www.olympia-classics.nl/assets/themes/olympia-classics_nl/img/logo.png",
      "description": "Populaire hits",
      "bitrate": 192,
      "city": null,
      "votes": 97
    },
    "Blackwwod FM": {
      "name": "Blackwwod FM",
      "url": "http://server-24.stream-server.nl:8326/stream",
      "logo": "https://i0.wp.com/blackwoodfm.com/wp-content/uploads/2020/04/cropped-favicon.png?fit=180%2c180&#038;ssl=1",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 92
    },
    "Extra Gold": {
      "name": "Extra Gold",
      "url": "http://extragold.stream-server.nl/stream?type=http&nocache=124795",
      "logo": "http://www.extragold.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 91
    },
    "BigB21": {
      "name": "BigB21",
      "url": "http://stream.b21fm.nl:9010/",
      "logo": "https://www.bigb21.nl/img/favicon.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 88
    },
    "Pureclassix": {
      "name": "Pureclassix",
      "url": "http://server5.radio-streams.net:8001/live",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 88
    },
    "Radio10": {
      "name": "Radio10",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/RADIO10.mp3",
      "logo": "https://www.radio10.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 86
    },
    "Oasis 963 FM Philipsburg": {
      "name": "Oasis 963 FM Philipsburg",
      "url": "http://stream.sxmradio.com:8060/channel5.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Sint Maarten",
      "votes": 85
    },
    "Studio040": {
      "name": "Studio040",
      "url": "https://stream.studio040.nl/studio040.mp3",
      "logo": "https://studio040.nl/favicons/studio_040_favicon.png",
      "description": "Pop muziek",
      "bitrate": 160,
      "city": "Noord Brabant",
      "votes": 81
    },
    "Goud van Oud": {
      "name": "Goud van Oud",
      "url": "http://server-23.stream-server.nl:8118/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Rotterdam",
      "votes": 76
    },
    "Q-Music": {
      "name": "Q-Music",
      "url": "https://icecast-qmusicnl-cdp.triple-it.nl/Qmusic_nl_live_high.aac?aw_0_1st.playerId=redirect",
      "logo": "https://qmusic.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 95,
      "city": null,
      "votes": 75
    },
    "Riverside Radio": {
      "name": "Riverside Radio",
      "url": "https://stream.and-stuff.nl:8443/riverside",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 2000,
      "city": null,
      "votes": 75
    },
    "Christmas Hits Radio NL": {
      "name": "Christmas Hits Radio NL",
      "url": "https://stream06.dotpoint.nl:8006/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Populaire hits",
      "bitrate": 128,
      "city": "Noord-Holland",
      "votes": 71
    },
    "00s Alive": {
      "name": "00s Alive",
      "url": "https://stream.00sa.live/00s-alive.aac",
      "logo": "https://alive.radio/favicon.ico",
      "description": "Pop muziek",
      "bitrate": 96,
      "city": null,
      "votes": 69
    },
    "Hi On Line Radio - Lounge": {
      "name": "Hi On Line Radio - Lounge",
      "url": "http://mediaserv33.live-streams.nl:2199/tunein/hionlinelounge.pls",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Amsterdam",
      "votes": 69
    },
    "Radio Seabreeze": {
      "name": "Radio Seabreeze",
      "url": "https://mediaserv38.live-streams.nl:18025/stream1",
      "logo": "https://radioseabreeze.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 69
    },
    "Radio Caroline 259 MP3 320": {
      "name": "Radio Caroline 259 MP3 320",
      "url": "https://happy.radiocaroline.nl/listen/classic_rock/radio320.mp3",
      "logo": "https://www.radiocaroline.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 68
    },
    "Candlelight Radio": {
      "name": "Candlelight Radio",
      "url": "https://candlelight.nl/candlelight.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 67
    },
    "RADIO ALEX FM DENL": {
      "name": "RADIO ALEX FM DENL",
      "url": "https://stream.radiostreamserver.de/listen/alexfm/de-nl.mp3",
      "logo": "https://images.zeno.fm/s-8wFSBFzu012EpmbN-_asRM366OysXM9lmItcRVAec/rs:fit:440:440/g:ce:0:0/aHR0cHM6Ly9zdHJlYW0tdG9vbHMuemVub21lZGlhLmNvbS9jb250ZW50L3N0YXRpb25zL2FneHpmbnBsYm04dGMzUmhkSE55TWdzU0NrRjFkR2hEYkdsbGJuUVlnSUN3Z1B5WHNBc01DeElPVTNSaGRHbHZibEJ5YjJacGJHVVlnSUN3NEpLWXhna01vZ0VFZW1WdWJ3L2ltYWdlLz9yZXNpemU9NDQweDQ0MCZ1cGRhdGVkPTE2NjE5NzEzODYwMDA.webp",
      "description": "Pop muziek",
      "bitrate": 320,
      "city": "Amsterdam",
      "votes": 67
    },
    "Pearl FM 981 Philipsburg": {
      "name": "Pearl FM 981 Philipsburg",
      "url": "http://stream.sxmradio.com:8060/channel6.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": "Sint Maarten",
      "votes": 66
    },
    "RADIO MONIQUE 918": {
      "name": "RADIO MONIQUE 918",
      "url": "https://radiomonique918.radioca.st/stream",
      "logo": "https://radiomonique.am/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 66
    },
    "WILD FM": {
      "name": "WILD FM",
      "url": "https://stream.wildfm.nl/wildfm.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": null,
      "votes": 65
    },
    "Hot Radio Hits": {
      "name": "Hot Radio Hits",
      "url": "http://www.hotradiohits.nl/include/stream/hotradiohits.m3u",
      "logo": "http://www.hotradiohits.nl/favicon.ico",
      "description": "Populaire hits",
      "bitrate": 192,
      "city": null,
      "votes": 64
    },
    "Pure Radio Various Channel FLAC": {
      "name": "Pure Radio Various Channel FLAC",
      "url": "https://streamserver.pure-isp.eu/radio/8070/flac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 60
    },
    "Heuvellandexpress": {
      "name": "Heuvellandexpress",
      "url": "http://server-28.stream-server.nl:8840/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Limburg",
      "votes": 57
    },
    "NixxFM": {
      "name": "NixxFM",
      "url": "https://mediacp.shoutcastradio.nl:8002/NixxFM.m3u",
      "logo": "https://i0.wp.com/www.nixxfm.nl/wp-content/uploads/2022/02/cropped-favicon-nixx-fm.jpg?fit=180%2c180&#038;ssl=1",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": "flevoland",
      "votes": 57
    },
    "Sunlite": {
      "name": "Sunlite",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/SUNLITE_MP3.mp3",
      "logo": "https://sunlite.nl/favicon_new.ico",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 57
    },
    "In Tha House": {
      "name": "In Tha House",
      "url": "https://www.inthahouse.nl/stream",
      "logo": "https://www.inthahouse.nl/wp-content/uploads/2021/12/cropped-android-chrome-512x512-1-32x32.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Zuid-Holland",
      "votes": 54
    },
    "Radio Chilling Station": {
      "name": "Radio Chilling Station",
      "url": "http://mediaserv30.live-streams.nl:8090/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 54
    },
    "Apres Ski Radio": {
      "name": "Apres Ski Radio",
      "url": "https://stream-24.zeno.fm/qqbwd2x8d2zuv?zs=VzE6e4CwROOSeWMCik-I-Q",
      "logo": "http://juraini-ferary.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 52
    },
    "TRANCE 21": {
      "name": "TRANCE 21",
      "url": "https://mscp3.live-streams.nl:8022/radio",
      "logo": "https://www.trance21.com/gallery/favicons/favicon-120x120.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 51
    },
    "FRENCHCORE24FM Radio": {
      "name": "FRENCHCORE24FM Radio",
      "url": "https://a8.asurahosting.com:7890/radio.mp3",
      "logo": "https://www.frenchcore24fm-radio.nl/apple-touch-icon.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Zuid-Holland",
      "votes": 50
    },
    "ISKC Hardrock Channel Speler": {
      "name": "ISKC Hardrock Channel Speler",
      "url": "http://mediaserv68.live-streams.nl:8012/HardRockChannel",
      "logo": "https://i0.wp.com/iskcrocks.com/wp-content/uploads/2014/10/cropped-Baloon720.jpg?fit=192%2C192&ssl=1",
      "description": "Rock muziek",
      "bitrate": 320,
      "city": "Rotterdam",
      "votes": 48
    },
    "Niederlande - Radio Erasmus": {
      "name": "Niederlande - Radio Erasmus",
      "url": "http://caster02.streampakket.com:8636/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 320,
      "city": null,
      "votes": 48
    },
    "Radio Decibel": {
      "name": "Radio Decibel",
      "url": "http://stream.decibel.nl/decibel.mp3",
      "logo": "https://www.decibel.nl/favicon.ico",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": null,
      "votes": 48
    },
    "Kerstradionl": {
      "name": "Kerstradionl",
      "url": "https://mediacp.audiostreamen.nl:8168/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 46
    },
    "Sky LoveSongs": {
      "name": "Sky LoveSongs",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/SRGSTR03.mp3",
      "logo": "https://www.skyradio.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 43
    },
    "Grunn FM": {
      "name": "Grunn FM",
      "url": "https://stream.grunnfm.nl/grunnfm",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": "Groningen",
      "votes": 42
    },
    "Dutch Delite Dnb Radio": {
      "name": "Dutch Delite Dnb Radio",
      "url": "https://radio.dutchdelite.nl/dnb.m3u",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 41
    },
    "Alternative Rock Radio": {
      "name": "Alternative Rock Radio",
      "url": "https://25243.live.streamtheworld.com/KINK_SC",
      "logo": "https://static.mytuner.mobi/media/tvos_radios/yTMB8WVAUb.png",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": null,
      "votes": 40
    },
    "happyradio NL": {
      "name": "happyradio NL",
      "url": "https://stream.happy.radio:8000/192",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord-Brabant",
      "votes": 40
    },
    "Intergalactic FM  CBS TV": {
      "name": "Intergalactic FM  CBS TV",
      "url": "https://intergalactic.tv/live/smil:tv.smil/playlist.m3u8",
      "logo": "https://www.intergalactic.fm/themes/custom/ifm/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 1692,
      "city": null,
      "votes": 40
    },
    "Kick Radio - 80s & 90s Hits": {
      "name": "Kick Radio - 80s & 90s Hits",
      "url": "https://live.onlineradiostreaming.nl/kick",
      "logo": "https://play-lh.googleusercontent.com/nSmckM1HjUVk_qcJGQK00X6izrB32WSZfmq0cMPiAeQoL5jeErrU29e8FG5kh01LsvI",
      "description": "Populaire hits",
      "bitrate": 192,
      "city": null,
      "votes": 40
    },
    "Noise Radio": {
      "name": "Noise Radio",
      "url": "https://a5.asurahosting.com:7640/radio.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 40
    },
    "Radio Caroline 259 Gold 64kbps": {
      "name": "Radio Caroline 259 Gold 64kbps",
      "url": "https://happy.radiocaroline.nl/listen/classic_rock/radio64.mp3",
      "logo": "https://radiocaroline259.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 64,
      "city": null,
      "votes": 40
    },
    "Radio Deep Underground": {
      "name": "Radio Deep Underground",
      "url": "https://radio.radiodeepunderground.com/listen/radio_deep_underground/rdu-320.mp3",
      "logo": "https://radiodeepunderground.com/wp-content/uploads/2024/08/cropped-favicon-16x16-1-1-180x180.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": "Amsterdam ",
      "votes": 40
    },
    "HappyHits": {
      "name": "HappyHits",
      "url": "https://mediacp.audiostreamen.nl:8150/stream",
      "logo": "https://www.happyhits.eu/logo/HappyHits500x500.jpg",
      "description": "Populaire hits",
      "bitrate": 128,
      "city": "Overijssel",
      "votes": 39
    },
    "FZO MP3 stream": {
      "name": "FZO MP3 stream",
      "url": "http://www.flevoziekenomroep.nl/mp3.m3u",
      "logo": "https://www.fzo.nu/logo-ss.png",
      "description": "Nederlandse radio",
      "bitrate": 160,
      "city": "flevoland",
      "votes": 37
    },
    "Calypso AM 675": {
      "name": "Calypso AM 675",
      "url": "http://178.19.116.3:8016/stream",
      "logo": "https://calypso675.com/wp-content/uploads/2020/10/cropped-Logo-Calypso-01-180x180.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 36
    },
    "Glow FM": {
      "name": "Glow FM",
      "url": "https://stream.glowfm.nl/glowfm.mp3",
      "logo": "https://glowfm.nl/favicon.png",
      "description": "Pop muziek",
      "bitrate": 160,
      "city": "Eindhoven",
      "votes": 36
    },
    "Radio Time Out Trance": {
      "name": "Radio Time Out Trance",
      "url": "https://s3.slotex.pl/shoutcast/7056/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 34
    },
    "Extra AM": {
      "name": "Extra AM",
      "url": "http://caster04.streampakket.com:8047/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 33
    },
    "Maasland Radio": {
      "name": "Maasland Radio",
      "url": "http://panel.beheerstream.com:2199/tunein/maaslandradio.pls",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Limburg",
      "votes": 33
    },
    "SuperFM - IJmuiden": {
      "name": "SuperFM - IJmuiden",
      "url": "https://stream.edfm.nl/super",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 96,
      "city": null,
      "votes": 33
    },
    "Andys80s": {
      "name": "Andys80s",
      "url": "https://stream02.pcradio.ru/andys_80s-med",
      "logo": "https://cache.usercontentapp.com/logo/stations/8372.png?format=png&enlarge=0&quality=90&width=960",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Amsterdam",
      "votes": 32
    },
    "Classicnl Mind Radio": {
      "name": "Classicnl Mind Radio",
      "url": "https://classic.nl/streams/?s=mindradio",
      "logo": "https://classic.nl/images/icons/favicon-96x96.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 32
    },
    "40up Radio": {
      "name": "40up Radio",
      "url": "https://stream.40upradio.nl/40up",
      "logo": "https://dev.40upradio.nl/favicon.ico",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": null,
      "votes": 31
    },
    "Double Z": {
      "name": "Double Z",
      "url": "http://www.internetpiraten.com/luisteren/streams/listen192.pls",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 31
    },
    "Hi On Line": {
      "name": "Hi On Line",
      "url": "http://mscp2.live-streams.nl:8100/flac.flac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Breda, Flac 44,1 ",
      "votes": 31
    },
    "076 Radio": {
      "name": "076 Radio",
      "url": "http://live.hostingbudget.nl:1220/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 320,
      "city": null,
      "votes": 30
    },
    "90s Alive": {
      "name": "90s Alive",
      "url": "https://stream.90sa.live/90s-alive.mp3",
      "logo": "https://alive.radio/wp-content/uploads/2023/03/90s-alive-logo-2023-1000x1000-1-770x770.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 30
    },
    "Free Musi Radio": {
      "name": "Free Musi Radio",
      "url": "http://stream.freemusicradio.nl:8100/stream.oga",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 2000,
      "city": null,
      "votes": 30
    },
    "Radio Regenboog": {
      "name": "Radio Regenboog",
      "url": "http://server-28.stream-server.nl:8830/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 64,
      "city": "Nederland",
      "votes": 30
    },
    "RHYTHM 21 Zwolle": {
      "name": "RHYTHM 21 Zwolle",
      "url": "https://mscp3.live-streams.nl:8022/radio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": "Overijssel",
      "votes": 30
    },
    "Radio Experience 1008AM": {
      "name": "Radio Experience 1008AM",
      "url": "https://totaal-streaming.de:8030/radio2",
      "logo": "https://radioexperience.nl/wp-content/uploads/2021/06/cropped-microphone-1018787_1920-180x180.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 29
    },
    "Radio 078": {
      "name": "Radio 078",
      "url": "https://cc6.beheerstream.com/proxy/radio078?mp=/stream",
      "logo": "https://radio078.fm/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 28
    },
    "De Hollandse Piraten Gigant": {
      "name": "De Hollandse Piraten Gigant",
      "url": "https://dhpgstreaming.nl/proxy/dhpg/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Overijssel",
      "votes": 27
    },
    "Radio Nostalgia": {
      "name": "Radio Nostalgia",
      "url": "http://cast1.torontocast.com:1630/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 27
    },
    "Keizertstad Classics": {
      "name": "Keizertstad Classics",
      "url": "http://stream.keizerstad.nl/classics.mp3",
      "logo": "https://www.radio.net/images/broadcasts/25/96/2167/1/c300.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": null,
      "votes": 26
    },
    "Radio Noordzee": {
      "name": "Radio Noordzee",
      "url": "https://22553.live.streamtheworld.com/TLPSTR17.mp3",
      "logo": "https://i.ibb.co/fYsYN5nv/486279844-1309381596939444-8468122003951244453-n.jpg",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 26
    },
    "Hete Hits": {
      "name": "Hete Hits",
      "url": "https://mcp-2.mm-stream.nl:8000/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Populaire hits",
      "bitrate": 256,
      "city": "Emmen",
      "votes": 24
    },
    "World Music Radio Classic": {
      "name": "World Music Radio Classic",
      "url": "https://server-67.stream-server.nl:8792/stream",
      "logo": "https://www.wmrclassic.com/wmr_files/favicon-32x32.png",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": null,
      "votes": 24
    },
    "GL8 MediaGL8 Media": {
      "name": "GL8 MediaGL8 Media",
      "url": "http://stream.stream.delivery/gl8media",
      "logo": "https://gl8.localgrid.nl/images/GL8/Huisstijl/gl8.jpg",
      "description": "Pop muziek",
      "bitrate": 256,
      "city": "Limburg",
      "votes": 23
    },
    "SinterklaasRadio": {
      "name": "SinterklaasRadio",
      "url": "https://stream06.dotpoint.nl:8004/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Noord-Holland",
      "votes": 23
    },
    "ISKC Old Mens Rock": {
      "name": "ISKC Old Mens Rock",
      "url": "http://mediaserv68.live-streams.nl:8012/OldMenRock",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 320,
      "city": "Rotterdam",
      "votes": 22
    },
    "Radio Bonita": {
      "name": "Radio Bonita",
      "url": "http://live.hostingbudget.nl:1040/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 22
    },
    "Vibe Radio": {
      "name": "Vibe Radio",
      "url": "https://stream.viberadio.nl/viberadio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": null,
      "votes": 22
    },
    "Omroep Venray": {
      "name": "Omroep Venray",
      "url": "http://icecast.omroepvenray.nl/lov.mp3",
      "logo": "https://www.omroepvenray.nl/templates/omroepv/favicon.ico",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": "Limburg",
      "votes": 21
    },
    "Radio Halloo": {
      "name": "Radio Halloo",
      "url": "http://mediacp.audiostreamen.nl:8174/stream",
      "logo": "https://www.radiohalloo.nl/wp-content/uploads/2022/01/cropped-icon-radio-halloo-180x180.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Altijd bij jou!",
      "votes": 21
    },
    "Tigray Beat FM Radio": {
      "name": "Tigray Beat FM Radio",
      "url": "https://stream.zeno.fm/pd13h8kft68uv",
      "logo": "https://zenoimages.s3.us-west-001.backblazeb2.com/agxzfnplbm8tc3RhdHNyMgsSCkF1dGhDbGllbnQYgICwv7_OlwgMCxIOU3RhdGlvblByb2ZpbGUYgIDwwJWotwgMogEEemVubw/images/logo",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 21
    },
    "Hofstad radio": {
      "name": "Hofstad radio",
      "url": "https://solid41.streamupsolutions.com/proxy/toyfkozk?mp=/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 320,
      "city": null,
      "votes": 20
    },
    "HitstreamFM": {
      "name": "HitstreamFM",
      "url": "https://www.hitstream.fm/static/hitstream.asx",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Populaire hits",
      "bitrate": 192,
      "city": null,
      "votes": 19
    },
    "OOG Radio": {
      "name": "OOG Radio",
      "url": "https://nlpo.stream.vip/oogfm/mp3-192/nlpo/",
      "logo": "https://www.oogtv.nl/wp-content/uploads/2019/06/OOG_logo.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Groningen",
      "votes": 19
    },
    "40UP ClassicNL Opera": {
      "name": "40UP ClassicNL Opera",
      "url": "https://stream.40upradio.nl/thema3",
      "logo": "https://dev.40upradio.nl/wp-content/uploads/2021/12/40-up-radio.jpg",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Noord-Holland, Amsterdam",
      "votes": 18
    },
    "Good Times Bad Times": {
      "name": "Good Times Bad Times",
      "url": "https://radio.goodtimesbadtimes.club/radio/8000/radio.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 18
    },
    "Operator Radio": {
      "name": "Operator Radio",
      "url": "https://origin.streamnerd.nl/operator/operator/icecast.audio",
      "logo": "https://operator-radio.com/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 18
    },
    "dizgo radio fm": {
      "name": "dizgo radio fm",
      "url": "http://mediaserv30.live-streams.nl:8079/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 17
    },
    "RADIO ALEX FM ROERMOND": {
      "name": "RADIO ALEX FM ROERMOND",
      "url": "https://stream.radiostreamserver.de/listen/alexfm/roermond.mp3",
      "logo": "https://i1.sndcdn.com/avatars-ewH1mKzlXAtjbj1b-2xCS6Q-t500x500.jpg",
      "description": "Pop muziek",
      "bitrate": 320,
      "city": "Limburg",
      "votes": 17
    },
    "RTV Slingeland": {
      "name": "RTV Slingeland",
      "url": "https://ms2.mx-cd.net/dtv-21/105-567919/Slingeland_FM.smil/playlist.m3u8",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 131,
      "city": "Gelderland",
      "votes": 17
    },
    "Radio Speedy Gemert": {
      "name": "Radio Speedy Gemert",
      "url": "https://server-27.stream-server.nl:18312/;listen.m3u",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord-Brabant",
      "votes": 16
    },
    "Relax FM Online": {
      "name": "Relax FM Online",
      "url": "https://caster04.streampakket.com/proxy/8009/stream",
      "logo": "https://www.relaxfmonline.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "South-Holland",
      "votes": 16
    },
    "40ROCK Radio": {
      "name": "40ROCK Radio",
      "url": "http://40rockstream.live-streams.nl/live",
      "logo": "https://40rockradio.nl/wp-content/uploads/2021/04/40ROCK-Favicon-geel.png",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": null,
      "votes": 15
    },
    "4ever49radio": {
      "name": "4ever49radio",
      "url": "https://mediaserv73.live-streams.nl:18002/stream",
      "logo": "https://4ever49radio.nl/wp-content/uploads/2022/11/cropped-4EVER49-V2.1-Full-Colour-1000x10000-1.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 15
    },
    "Ijsselstreek Radio": {
      "name": "Ijsselstreek Radio",
      "url": "https://mediaserv38.live-streams.nl:18029/radio",
      "logo": "https://www.ijsselstreekradio.nl/icon.png",
      "description": "Pop muziek",
      "bitrate": 256,
      "city": "Zuid-Holland",
      "votes": 15
    },
    "ISKC Only Live": {
      "name": "ISKC Only Live",
      "url": "https://mediaserv68.live-streams.nl:18012/OnlyLive",
      "logo": "https://i0.wp.com/iskcrocks.com/wp-content/uploads/2014/10/cropped-Baloon720.jpg?fit=192%2C192&ssl=1",
      "description": "Rock muziek",
      "bitrate": 320,
      "city": "Rotterdam",
      "votes": 15
    },
    "Omroep Eemsdelta": {
      "name": "Omroep Eemsdelta",
      "url": "https://streams.radiomast.io/063fcf6f-4083-4c4e-85a8-31b0a709f40d",
      "logo": "https://omroepeemsdelta.nl/wp-content/uploads/2020/06/cropped-Logo512-1.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 15
    },
    "Omroep Land van Cuijk": {
      "name": "Omroep Land van Cuijk",
      "url": "https://nlpo.stream.vip/cuijkrad/mp3-192/nlpo/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": "Noord-Brabant",
      "votes": 15
    },
    "Rob Stenders stream": {
      "name": "Rob Stenders stream",
      "url": "http://streams.robstenders.nl:8063/bonanza_mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 15
    },
    "AmorFM": {
      "name": "AmorFM",
      "url": "http://media155.streampartner.nl:8068/live",
      "logo": "null",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 14
    },
    "Ideaal FM": {
      "name": "Ideaal FM",
      "url": "http://server-10.stream-server.nl:8564/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": null,
      "votes": 14
    },
    "Pure Lounge Radio": {
      "name": "Pure Lounge Radio",
      "url": "https://mscp4.live-streams.nl:8142/lounge.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 14
    },
    "ValleiRadionl": {
      "name": "ValleiRadionl",
      "url": "http://server-25.stream-server.nl:8366/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": null,
      "votes": 14
    },
    "80s Hitradio": {
      "name": "80s Hitradio",
      "url": "https://s22.myradiostream.com/7728/listen.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 13
    },
    "keizerstad classic": {
      "name": "keizerstad classic",
      "url": "https://stream.keizerstad.nl/classics.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": null,
      "votes": 13
    },
    "Platinum Radio HardStyle": {
      "name": "Platinum Radio HardStyle",
      "url": "https://live.platinumradio.nl:8030/radio.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Zuid-Holland",
      "votes": 13
    },
    "Radio 9 Oostzaan": {
      "name": "Radio 9 Oostzaan",
      "url": "http://caster01.streampakket.com:9350/;",
      "logo": "http://www.radio9oostzaan.nl/icon.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 13
    },
    "Radio Twilight": {
      "name": "Radio Twilight",
      "url": "http://live.hostingbudget.nl:4270/stream",
      "logo": "https://radio-twilight.nl/wp-content/uploads/2020/06/cropped-logo-black-background-180x180.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 13
    },
    "Twente FM": {
      "name": "Twente FM",
      "url": "http://stream.twentefm.nl:8004/high",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 96,
      "city": "Overijssel",
      "votes": 13
    },
    "VechtdalNL": {
      "name": "VechtdalNL",
      "url": "http://streams.rtvvechtdal.nl:8000/VechtdalNL.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Nieuwleusen",
      "votes": 13
    },
    "Armin van Buuren": {
      "name": "Armin van Buuren",
      "url": "https://stream01.pcradio.ru/Armin_van_buuren-med",
      "logo": "null",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 12
    },
    "Fomix": {
      "name": "Fomix",
      "url": "https://stream.radiofomix.nl/listen/fomix/stream.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Zeeland",
      "votes": 12
    },
    "Happy Rock Radio Caroline 259": {
      "name": "Happy Rock Radio Caroline 259",
      "url": "https://happy.rcgoldserver.nl/listen/classic_rock/radio320.mp3",
      "logo": "https://radiocaroline259.nl/images/happy%20rock%20radio%20caroline-259%20gold.jpg",
      "description": "Rock muziek",
      "bitrate": 320,
      "city": null,
      "votes": 12
    },
    "IndieXL": {
      "name": "IndieXL",
      "url": "http://server-23.stream-server.nl:8438/;listen.pls_",
      "logo": "https://www.indiexl.nl/wp-content/themes/indiexl.nl/includes/img/logo-trans.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 12
    },
    "ISKC Radio Active": {
      "name": "ISKC Radio Active",
      "url": "http://mediaserv68.live-streams.nl:8012/RadioActive",
      "logo": "https://i0.wp.com/iskcrocks.com/wp-content/uploads/2014/10/cropped-Baloon720.jpg?fit=192%2C192&ssl=1",
      "description": "Rock muziek",
      "bitrate": 320,
      "city": "Rotterdam",
      "votes": 12
    },
    "Radio Spannenburg": {
      "name": "Radio Spannenburg",
      "url": "https://stream.radiospannenburg.nl/radiospannenburg",
      "logo": "https://radiospannenburg.nl/wp-content/uploads/2024/02/cropped-logo_web_app-180x180.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Balk",
      "votes": 12
    },
    "Streekstad Centraal": {
      "name": "Streekstad Centraal",
      "url": "https://radiostreams.streekstadcentraal.nl:9443/01",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord-Holland",
      "votes": 12
    },
    "ABTT": {
      "name": "ABTT",
      "url": "http://server-06.stream-server.nl:8600/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 11
    },
    "Das radio": {
      "name": "Das radio",
      "url": "https://stream2.mfmstreaming.nl:7001/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Overijssel",
      "votes": 11
    },
    "Free Music Radio": {
      "name": "Free Music Radio",
      "url": "https://centova.mediastreamhost.nl/tunein/freemusicradio.pls",
      "logo": "https://freemusicradio.nl/images/FreeMusicRadio_Logo_160.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 11
    },
    "Hardzone Radio": {
      "name": "Hardzone Radio",
      "url": "http://s40.myradiostream.com:23504/listen.pls",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Noord-Holland, Amsterdam",
      "votes": 11
    },
    "Hollands Palet": {
      "name": "Hollands Palet",
      "url": "https://hollandspalet.live-streams.nl:18010/live",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 11
    },
    "Jinglegek": {
      "name": "Jinglegek",
      "url": "https://server-26.stream-server.nl:8632/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 11
    },
    "Maxhitradio24": {
      "name": "Maxhitradio24",
      "url": "https://streaming.shoutcast.com/maxhitradio24",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "n.brabant",
      "votes": 11
    },
    "Niederlande - Donderschoer Radio": {
      "name": "Niederlande - Donderschoer Radio",
      "url": "http://audiostreamen.nl:8400/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": null,
      "votes": 11
    },
    "RadioNL kids": {
      "name": "RadioNL kids",
      "url": "https://stream.radionlkids.nl/rnlkids",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord holland",
      "votes": 11
    },
    "Colinblackburn1980": {
      "name": "Colinblackburn1980",
      "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/Q_DANCE.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 10
    },
    "Optimaal fm": {
      "name": "Optimaal fm",
      "url": "http://stream-10.pmteurope.com:8002/stream",
      "logo": "https://radiooptimaalfm.nl/wp-content/themes/Radio2/streams/Live-player-pop-out.php",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "nederland",
      "votes": 10
    },
    "Radio Calypso": {
      "name": "Radio Calypso",
      "url": "http://mcp-1.streampanel.nl:18024/stream",
      "logo": "https://www.facebook.com/groups/322409195086719/?ref=share_group_link",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Groningen",
      "votes": 10
    },
    "Radion JND": {
      "name": "Radion JND",
      "url": "https://stream.radiojnd.nl/radiojnd.mp3",
      "logo": "https://radiojnd.nl/wp-content/uploads/2020/11/logo-radio-jnd.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 10
    },
    "Eternal project": {
      "name": "Eternal project",
      "url": "http://stream-57.zeno.fm/ewtv4c3htyduv?zs=Lez02kZQSp-fZkstUkBMTw",
      "logo": "https://www.google.com/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 9
    },
    "Foute Radio": {
      "name": "Foute Radio",
      "url": "http://stream.dotpoint.nl:8000/fouteradio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": null,
      "votes": 9
    },
    "Koekstad Radio Deventer": {
      "name": "Koekstad Radio Deventer",
      "url": "https://server-67.stream-server.nl:8788/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 9
    },
    "Non-stop Geheime zender muziek": {
      "name": "Non-stop Geheime zender muziek",
      "url": "https://stream.geheimezenderstream.nl/stream",
      "logo": "https://www.geheimezenderstream.nl/logo/logo-500PNG.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Overijssel",
      "votes": 9
    },
    "Piraten Stream Twente": {
      "name": "Piraten Stream Twente",
      "url": "http://stream.piratentwente.com:8020/live",
      "logo": "https://www.piratentwente.com/img/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 9
    },
    "Radio joyride": {
      "name": "Radio joyride",
      "url": "https://server-67.stream-server.nl/stream/radiojoyride",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Brabant",
      "votes": 9
    },
    "Rainz FM": {
      "name": "Rainz FM",
      "url": "https://stream2.mfmstreaming.nl/8032/stream.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": "Zuid-Holland",
      "votes": 9
    },
    "rtvlove Volendam": {
      "name": "rtvlove Volendam",
      "url": "https://webstream.rtvlove.nl/live",
      "logo": "https://www.rtvlove.nl/wp-content/uploads/cropped-rtvlove-favicon-180x180.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Noord-Holland",
      "votes": 9
    },
    "Studio 040 TV": {
      "name": "Studio 040 TV",
      "url": "http://ms7.mx-cd.net/tv/117-475839/Studio040.smil/playlist.m3u8",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 1894,
      "city": "Brabant",
      "votes": 9
    },
    "Bierfest Radio": {
      "name": "Bierfest Radio",
      "url": "https://stream.bierfestradio.com/bierfestradio",
      "logo": "https://www.bierfestradio.com/uploads/3/9/6/3/3963899/logo-bierfestradio_orig.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 8
    },
    "Hardrock": {
      "name": "Hardrock",
      "url": "http://server-23.stream-server.nl:8326/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": null,
      "votes": 8
    },
    "Havenstad Radio": {
      "name": "Havenstad Radio",
      "url": "https://mediaserv33.live-streams.nl:8056/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": "ZH",
      "votes": 8
    },
    "Hot Jamz Urban Radio": {
      "name": "Hot Jamz Urban Radio",
      "url": "https://stream02.dotpoint.nl:8030/stream",
      "logo": "https://www.hotjamz.nl/wp-content/uploads/2018/03/cropped-hotjamz.png",
      "description": "Urban muziek",
      "bitrate": 128,
      "city": null,
      "votes": 8
    },
    "Radio Oranje": {
      "name": "Radio Oranje",
      "url": "https://securestream.digipal.nl:1816/;stream.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 8
    },
    "Radio Van Noord Tot Zuid": {
      "name": "Radio Van Noord Tot Zuid",
      "url": "http://live.hostingbudget.nl:1800/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 8
    },
    "Rivierenland Radio": {
      "name": "Rivierenland Radio",
      "url": "https://rivierenlandradio.stream-server.nl/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Noord-Brabant",
      "votes": 8
    },
    "Salland1": {
      "name": "Salland1",
      "url": "https://stream.and-stuff.nl:8443/live-airplay_320",
      "logo": "https://cdn-profiles.tunein.com/s87697/images/logod.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Overijssel",
      "votes": 8
    },
    "Sinterklaas Radio": {
      "name": "Sinterklaas Radio",
      "url": "http://stream.tbmp.nl:8000/sinterklaasradiohigh.mp3",
      "logo": "https://www.sintfm.nl/sintfm.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 8
    },
    "Unity NL": {
      "name": "Unity NL",
      "url": "https://icecast.rudeboymedia.nl/unitynl.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Leiderdorp",
      "votes": 8
    },
    "Urk FM geestelijk": {
      "name": "Urk FM geestelijk",
      "url": "http://urk.fm:8000/geestelijk.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 8
    },
    "Bollenstreek Omroep": {
      "name": "Bollenstreek Omroep",
      "url": "https://stream.bollenstreekomroep.nl/live-mp3-192-stereo",
      "logo": "https://i0.wp.com/www.bollenstreekomroep.nl/wp-content/uploads/2024/04/cropped-bo-logo-150x150-1.jpg?fit=180%2c180&#038;ssl=1",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 7
    },
    "Alex FM Non Stop Hits": {
      "name": "Alex FM Non Stop Hits",
      "url": "https://radioalexfm.stream.laut.fm/radioalexfm?ref=web-app&start_time=1709718045653",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Populaire hits",
      "bitrate": 128,
      "city": null,
      "votes": 7
    },
    "Ancient FM": {
      "name": "Ancient FM",
      "url": "https://mediaserv73.live-streams.nl:18058/stream",
      "logo": "https://www.ancientfm.com/assets/images/ancientfm-logo.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 7
    },
    "Deurne Media Groep": {
      "name": "Deurne Media Groep",
      "url": "http://s22.myradiostream.com:13628/",
      "logo": "https://dmgdeurne.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord-Brabant",
      "votes": 7
    },
    "Ijsselstreekradio": {
      "name": "Ijsselstreekradio",
      "url": "http://mediaserv38.live-streams.nl:8029/radio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 256,
      "city": "Zuid-Holland",
      "votes": 7
    },
    "KBC Radio": {
      "name": "KBC Radio",
      "url": "https://stream01.itego.nl/kbc-low?1728143490",
      "logo": "https://dvw7f7sqjk3ag.cloudfront.net/images/radio/47130.jpg",
      "description": "Nederlandse radio",
      "bitrate": 80,
      "city": null,
      "votes": 7
    },
    "Roundandsound Radio": {
      "name": "Roundandsound Radio",
      "url": "https://stream.roundandsound.nl/1",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Gelderland",
      "votes": 7
    },
    "Variafm": {
      "name": "Variafm",
      "url": "http://server1.streamgigant.nl:9031/varia192",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 7
    },
    "XD Radio": {
      "name": "XD Radio",
      "url": "http://streams.xdradio.nl/stream/xdradio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 137,
      "city": null,
      "votes": 7
    },
    "Xmas Radio": {
      "name": "Xmas Radio",
      "url": "https://stream.tbmp.nl:8000/xmasradiohigh.mp3",
      "logo": "http://www.xmasradio.nl/xmasradio.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 7
    },
    "Alleen Klassiek": {
      "name": "Alleen Klassiek",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/SERVICE06.mp3",
      "logo": "https://i.postimg.cc/XqS5LZRg/logog.webp",
      "description": "Klassieke muziek",
      "bitrate": 192,
      "city": "Noord holland",
      "votes": 6
    },
    "Happy Sound Music Limburg": {
      "name": "Happy Sound Music Limburg",
      "url": "https://server-28.stream-server.nl/stream/happysoundmusic",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 192,
      "city": "Limburg",
      "votes": 6
    },
    "Hoppa Radio": {
      "name": "Hoppa Radio",
      "url": "http://mscp3.live-streams.nl:8132/radio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": null,
      "votes": 6
    },
    "LeagueFM": {
      "name": "LeagueFM",
      "url": "https://radiopaneel.league-fm.nl/listen/leaguefm/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Noord-Brabant",
      "votes": 6
    },
    "Q-Music Limburg": {
      "name": "Q-Music Limburg",
      "url": "https://www.mp3streams.nl/zender/qmusic-limburg/stream/49-aac-64",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 96,
      "city": null,
      "votes": 6
    },
    "Radio Sputnik Underground!": {
      "name": "Radio Sputnik Underground!",
      "url": "http://radiosputnik.nl:8002/.m3u",
      "logo": "http://www.radiosputnik.nl/assets/images/android-icon-192x192.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 6
    },
    "Samen1": {
      "name": "Samen1",
      "url": "https://server-67.stream-server.nl:18752/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Gelderland",
      "votes": 6
    },
    "Tisto in Concert": {
      "name": "Tisto in Concert",
      "url": "https://ia801804.us.archive.org/33/items/tiesto-tiesto-in-concert-2003/Tiesto%20-%20Tiesto%20In%20Concert%20%282003%29.mp3",
      "logo": "https://en.wikipedia.org/wiki/Tiësto_in_Concert#/media/File:Tiësto_in_Concert_poster.jpg",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 6
    },
    "Vera Radio": {
      "name": "Vera Radio",
      "url": "https://mscp3.live-streams.nl:8082/live",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Limburg",
      "votes": 6
    },
    "WestRadio  AAC 96kbps": {
      "name": "WestRadio  AAC 96kbps",
      "url": "http://streaming.westradio.nl/WestRadio-aac-96",
      "logo": "https://www.westradio.nl/img/AppIcons/WestRadio.AppIcon.256px.png",
      "description": "Nederlandse radio",
      "bitrate": 96,
      "city": null,
      "votes": 6
    },
    "Zwartewater FM": {
      "name": "Zwartewater FM",
      "url": "https://panel.beheerstream.com:2199/tunein/zwartewaterfm-stream.pls",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 6
    },
    "955 EASY FM": {
      "name": "955 EASY FM",
      "url": "https://mediaserv68.live-streams.nl:18007/stream",
      "logo": "https://easyfm.nl/wp-content/uploads/2022/10/EASY-FM-ALMERE-RADIO-LOGO-770x274-1.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 5
    },
    "AccentFM": {
      "name": "AccentFM",
      "url": "https://stream.accentfm.nl/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 5
    },
    "PJD3 Power 1027 Philipsburg": {
      "name": "PJD3 Power 1027 Philipsburg",
      "url": "http://stream.sxmradio.com:8060/channel3.mp3",
      "logo": "https://firebasestorage.googleapis.com/v0/b/radiogalaxy-580f4.appspot.com/o/images%2FIMG_20240623_144011156.jpg?alt=media&token=63f1e8de-dddc-4ef6-be25-419d43c5697a",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": null,
      "votes": 5
    },
    "Pure Radio Holland - Trance-Electro Channel": {
      "name": "Pure Radio Holland - Trance-Electro Channel",
      "url": "https://streamserver.pure-isp.eu/listen/pure_radio_holland_-_trance-electro_channel/aac-plus?ver=560092",
      "logo": "https://pureradio.eu/wp-content/uploads/2023/02/Logo-Pure-Radio-Trance-Channel-1024x1024-1-170x170.jpg.webp",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 5
    },
    "Radio Exclusief": {
      "name": "Radio Exclusief",
      "url": "https://cloud-faro.beheerstream.com/proxy/iqienyzy?mp=/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Gelderland",
      "votes": 5
    },
    "Radio Hulchul": {
      "name": "Radio Hulchul",
      "url": "https://everestcast.live-streams.nl:18010/stream",
      "logo": "null",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 5
    },
    "Radio Ultiem": {
      "name": "Radio Ultiem",
      "url": "http://server-21.stream-server.nl:8382/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Amsterdam",
      "votes": 5
    },
    "Rara Radio": {
      "name": "Rara Radio",
      "url": "https://58c04fb1d143f.streamlock.net/rararadio/rararadio/chunklist_w697961126.m3u8",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 5
    },
    "RN7": {
      "name": "RN7",
      "url": "https://stream.stream.delivery/rn7",
      "logo": "https://rn7.nl/favicons/rn7_favicon.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 5
    },
    "Shine Radio": {
      "name": "Shine Radio",
      "url": "https://caster05.streampakket.com/proxy/9320/stream",
      "logo": "https://static.wixstatic.com/media/10c9fc_5ef184f610d64db6b3f8088767325c05~mv2.png/v1/fill/w_478,h_523,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Shine%20logo%20gold.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 5
    },
    "Yoursafe Radio": {
      "name": "Yoursafe Radio",
      "url": "https://radiostream.yoursafe.nl/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Noord-Holland",
      "votes": 5
    },
    "Atlanticabreda": {
      "name": "Atlanticabreda",
      "url": "https://caster05.streampakket.com:2199/tunein/atlantica.pls",
      "logo": "https://www.atlanticabreda.nl/229v.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 4
    },
    "beeRadio": {
      "name": "beeRadio",
      "url": "https://stream.beeradio.nl/main",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 4
    },
    "BoemerangFM": {
      "name": "BoemerangFM",
      "url": "https://radio.mediacp.eu/stream/boemerangfm",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 4
    },
    "GOD Radio": {
      "name": "GOD Radio",
      "url": "https://stream.wildfm.nl/GOD_Radio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 4
    },
    "Hallo Kids Radio": {
      "name": "Hallo Kids Radio",
      "url": "https://stream.hallokidsradio.nl/hallokids",
      "logo": "https://www.hallokidsradio.nl/favicon.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 4
    },
    "MaiBus Radio": {
      "name": "MaiBus Radio",
      "url": "https://server-67.stream-server.nl:8818/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 4
    },
    "Mushroom Radio": {
      "name": "Mushroom Radio",
      "url": "https://radio.goodtimesbadtimes.club/radio/8020/radio.mp3",
      "logo": "https://radiomushroom.org/images/logo.jpg",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "The Hague",
      "votes": 4
    },
    "PI2NOS": {
      "name": "PI2NOS",
      "url": "https://stream.hobbyscoop.nl/pi2nos",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 32,
      "city": null,
      "votes": 4
    },
    "Pure Radio Holland - Hardcore Channel": {
      "name": "Pure Radio Holland - Hardcore Channel",
      "url": "https://streamserver.pure-isp.eu/listen/pure_radio_holland_-_hardcore_channel/aac-plus?ver=866785",
      "logo": "https://pureradio.eu/wp-content/uploads/2023/02/Logo-Pure-Radio-Hardcore-Channel-170x170.jpg.webp",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 4
    },
    "Radio Calypso 64 kbps AAC Plus Stream": {
      "name": "Radio Calypso 64 kbps AAC Plus Stream",
      "url": "https://mcp-1.streampanel.nl:8024/mobiel",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 64,
      "city": "Groningen",
      "votes": 4
    },
    "Radio Erasmus": {
      "name": "Radio Erasmus",
      "url": "http://caster04.streampakket.com:8636/stream",
      "logo": "https://static-media.streema.com/media/cache/b5/25/b5258a78aa97c6368cc05c4fe78abb30.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "ZH",
      "votes": 4
    },
    "Radio Grensland": {
      "name": "Radio Grensland",
      "url": "https://digistreamer.nl:8030/radio.mp3",
      "logo": "https://www.radiogrensland.com/wp-content/uploads/2021/05/Grensland-Logo-300-100.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 4
    },
    "Radio Toekan": {
      "name": "Radio Toekan",
      "url": "http://server-10.stream-server.nl:8544/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": null,
      "votes": 4
    },
    "Radio Weststellingwerf Centraal": {
      "name": "Radio Weststellingwerf Centraal",
      "url": "https://mcp-2.mm-stream.nl:8017/stream",
      "logo": "https://i0.wp.com/www.radiocentraal.com/cms/wp-content/uploads/2022/06/cropped-mstile-310x310-1.png?fit=32%2C32&ssl=1",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 4
    },
    "Saba Radio Q 939 FM Netherlands": {
      "name": "Saba Radio Q 939 FM Netherlands",
      "url": "https://s1.northrich.nl:38123/streamq939",
      "logo": "null",
      "description": "Pop muziek",
      "bitrate": 96,
      "city": null,
      "votes": 4
    },
    "Veluwe FM": {
      "name": "Veluwe FM",
      "url": "https://server-51.stream-server.nl:18438/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Harderwijk",
      "votes": 4
    },
    "Alex FM Non-Stop": {
      "name": "Alex FM Non-Stop",
      "url": "https://radioalexfmhits.stream.laut.fm/radioalexfmhits?ref=web-app&start_time=1709718823255",
      "logo": "https://assets.laut.fm/18f7036d2ebfa127df0635c6061bbcdb?t=_640x640",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": null,
      "votes": 3
    },
    "All Sports Radio": {
      "name": "All Sports Radio",
      "url": "https://streaming.hofhosting.nl/proxy/allsports_main?mp=/stream",
      "logo": "https://allsportsradio.nl/favicon/allsportsradio/apple-touch-icon.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 3
    },
    "Columbia AM 1395": {
      "name": "Columbia AM 1395",
      "url": "https://caster04.streampakket.com/proxy/8031/stream",
      "logo": "https://columbia-am.nl/wp-content/uploads/2021/11/cropped-Logo-Columbia-Blau.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 3
    },
    "Decibel Party Sound of Ibiza": {
      "name": "Decibel Party Sound of Ibiza",
      "url": "https://stream.decibel.nl/04.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 3
    },
    "Echobox": {
      "name": "Echobox",
      "url": "https://play.streamnerd.nl/echobox/echobox/icecast.audio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 3
    },
    "Echte Piratenhits": {
      "name": "Echte Piratenhits",
      "url": "https://echtepiratenhits.com/stream/wmp.asx",
      "logo": "https://echtepiratenhits.com/assets/images/logo-400x110.png",
      "description": "Populaire hits",
      "bitrate": 192,
      "city": null,
      "votes": 3
    },
    "Falcon Radio": {
      "name": "Falcon Radio",
      "url": "http://server-16.stream-server.nl:8926/;",
      "logo": "https://favicons.teamtailor-cdn.com/icon?size=80..120..200&url=https%3a%2f%2ffalconfm.nl%2f",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 3
    },
    "Gewoonpiraten altijd gezellig": {
      "name": "Gewoonpiraten altijd gezellig",
      "url": "https://server-67.stream-server.nl:8802/stream",
      "logo": "https://www.gewoonpiraten.nl/images/gptbanner.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 3
    },
    "Grand Prix Radio Classics": {
      "name": "Grand Prix Radio Classics",
      "url": "https://eu-player-redirect.streamtheworld.com/api/livestream-redirect/GPRCLASSICSAAC.aac?lsid=app%3Abrowser-1732200021666izj9zpla1",
      "logo": "https://grandprixradio.be/themes/flixi/favicons/apple-touch-icon.png?v=2",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 3
    },
    "Hardcore Power Radio 2nd server": {
      "name": "Hardcore Power Radio 2nd server",
      "url": "https://loa.beheerstream.nl:8012/stream",
      "logo": "https://www.allradio.nl/uploaded/logo/hardcore-power.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Zuid-Holland, Den Haag",
      "votes": 3
    },
    "Hi On Line - World": {
      "name": "Hi On Line - World",
      "url": "https://mediaserv38.live-streams.nl:18027/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Noord-Holland, Amsterdam",
      "votes": 3
    },
    "Hot Jamz": {
      "name": "Hot Jamz",
      "url": "https://stream02.dotpoint.nl:8030/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 3
    },
    "Island 92": {
      "name": "Island 92",
      "url": "https://ais-sa1.streamon.fm/7338_48k.aac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 47,
      "city": null,
      "votes": 3
    },
    "JEY": {
      "name": "JEY",
      "url": "https://stream.jeyradio.nl/JEY",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord-Holland",
      "votes": 3
    },
    "Muziekteam": {
      "name": "Muziekteam",
      "url": "https://mcp-1.streampanel.nl:2000/tunein/muziekteam-1/stream/pls",
      "logo": "https://www.muziekteam.nl/images/lup%20header%20nieuw.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 3
    },
    "PiratenRadionl - 247 de Beste PiratenHits vanuit Twente": {
      "name": "PiratenRadionl - 247 de Beste PiratenHits vanuit Twente",
      "url": "https://stream.piratenradio.nl/listen/piratenradio/prradio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Populaire hits",
      "bitrate": 192,
      "city": "Overijssel",
      "votes": 3
    },
    "Radio Hoeksche Waard": {
      "name": "Radio Hoeksche Waard",
      "url": "https://cloud-faro.beheerstream.com/proxy/omroephw?mp=/live",
      "logo": "https://www.omroephw.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Hoeksche Waard",
      "votes": 3
    },
    "Radio Nnnevot": {
      "name": "Radio Nnnevot",
      "url": "http://i1.cdn.jetstre.am:8000/sz=stichtingradiononnevot=radiostream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Zuid - Limburg",
      "votes": 3
    },
    "Radionickita": {
      "name": "Radionickita",
      "url": "https://fra-pioneer08.dedicateware.com:1685/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 64,
      "city": null,
      "votes": 3
    },
    "RTV Connect": {
      "name": "RTV Connect",
      "url": "https://stream.rtvconnect.nl/radio/8000/ffm-320-mp3",
      "logo": "https://www.rtvconnect.nl/favicons/rtv_favicon.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 3
    },
    "RTV Parkstad": {
      "name": "RTV Parkstad",
      "url": "https://stream.rtvparkstad.nl/rtvparkstad.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Zuid - Limburg",
      "votes": 3
    },
    "Unique Rock": {
      "name": "Unique Rock",
      "url": "http://mscp2.live-streams.nl:8180/radio",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": null,
      "votes": 3
    },
    "Veraradio": {
      "name": "Veraradio",
      "url": "https://mscp3.live-streams.nl:8082/live",
      "logo": "https://www.vera-radio.nl",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Zuid - Limburg",
      "votes": 3
    },
    "World Music Radio Classic!": {
      "name": "World Music Radio Classic!",
      "url": "https://server-67.stream-server.nl:8792/stream",
      "logo": "https://www.wmrclassic.com/wmr_files/classic_30.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 3
    },
    "YouRRadio": {
      "name": "YouRRadio",
      "url": "https://server6.radio-streams.net/proxy/marcel13/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": "Overijssel",
      "votes": 3
    },
    "ZFM Zandvoort": {
      "name": "ZFM Zandvoort",
      "url": "https://icecast.bytesheep.net/zfmzandvoort.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 3
    },
    "Abdulbasit Abdulsamad": {
      "name": "Abdulbasit Abdulsamad",
      "url": "https://radio.mp3islam.com/listen/abdulbasit/radio.mp3",
      "logo": "null",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 2
    },
    "2Tunes TuneBot": {
      "name": "2Tunes TuneBot",
      "url": "http://server6.radio-streams.net:8023/stream",
      "logo": "https://www.2tunes.nl/assets/images/Logo-dspsej5P.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "constitutionele monarchie",
      "votes": 2
    },
    "AlexFM Nonstop": {
      "name": "AlexFM Nonstop",
      "url": "https://radioalexfmhits.stream.laut.fm/radioalexfmhits?t302=2024-03-06_08-21-40&uuid=25a57695-a22f-4083-b348-b104684576af",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 2
    },
    "beeClassics": {
      "name": "beeClassics",
      "url": "https://stream.beeradio.nl/classics",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 2
    },
    "devrolijkesnuiters": {
      "name": "devrolijkesnuiters",
      "url": "https://server-67.stream-server.nl:8794/stream",
      "logo": "https://www.devrolijkesnuiters.nl/uploads/devrolijkesnuiters.nl/1703461960-My%20Post.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Uithuizen",
      "votes": 2
    },
    "Happy Radio Monique 963 Gold on Ice": {
      "name": "Happy Radio Monique 963 Gold on Ice",
      "url": "https://server-10.rcgoldserver.nl/listen/happy_oldies/radio320.mp3",
      "logo": "https://www.radiomonique.nl/images/Happy%20Oldies%20Radio%20Monique%20963%20Gold%20.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 2
    },
    "Hi online": {
      "name": "Hi online",
      "url": "http://mscp2.live-streams.nl:8100/flac.flac",
      "logo": "http://www.rolandrispens.com/wp-content/uploads/2019/08/Schermafbeelding-2019-08-20-om-17.06.09-1024x510.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 2
    },
    "i-turn Radio": {
      "name": "i-turn Radio",
      "url": "http://live2.i-turnradio.nl/stream4",
      "logo": "https://liveonlineradio.net/wp-content/uploads/2015/11/i-turn-Radio-100x47.jpg",
      "description": "Nederlandse radio",
      "bitrate": 48,
      "city": null,
      "votes": 2
    },
    "Island 92 Philipsburg": {
      "name": "Island 92 Philipsburg",
      "url": "http://ais-sa1.streamon.fm/7338_48k.aac",
      "logo": "https://firebasestorage.googleapis.com/v0/b/radiogalaxy-580f4.appspot.com/o/images%2FIMG_20241115_213722426.jpg?alt=media&token=2832fcdc-bfa8-4090-8bac-3753f0caa320",
      "description": "Rock muziek",
      "bitrate": 47,
      "city": null,
      "votes": 2
    },
    "Jumbo Radio": {
      "name": "Jumbo Radio",
      "url": "https://streams.automates.media/jumboradio",
      "logo": "https://jumbo.com/apple-touch-icon.png?v=3",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 2
    },
    "Lokale Omroep Leek LOL FM": {
      "name": "Lokale Omroep Leek LOL FM",
      "url": "https://server6.radio-streams.net:2199/tunein/stichti2.pls",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 2
    },
    "MediaMarkt FM": {
      "name": "MediaMarkt FM",
      "url": "https://stream.cuecreative.nl/mediamarktfm",
      "logo": "https://brandslogos.com/wp-content/uploads/images/large/media-markt-logo.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 2
    },
    "MusicVaria": {
      "name": "MusicVaria",
      "url": "https://server-67.stream-server.nl:2000/tunein/MusicVaria/stream/pls",
      "logo": "https://musicvaria.nl/afbeedingen/218.gif",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 2
    },
    "Non Stop AlexFM": {
      "name": "Non Stop AlexFM",
      "url": "https://radioalexfmhits.stream.laut.fm/radioalexfmhits?ref=web-app&start_time=1709718823255",
      "logo": "https://assets.laut.fm/18f7036d2ebfa127df0635c6061bbcdb?t=_640x640",
      "description": "Rock muziek",
      "bitrate": 128,
      "city": null,
      "votes": 2
    },
    "OnDair": {
      "name": "OnDair",
      "url": "https://stream.zeno.fm/vistyzosypbvv",
      "logo": "https://ondair.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 2
    },
    "Powerstation Buddha": {
      "name": "Powerstation Buddha",
      "url": "https://a11.asurahosting.com:7110/radio.mp3",
      "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRazg4CH2MVkVP7V5S9VHUAnu953XI_wgI_D5DltnJBMQYQgkJWjnOFGX-T6vLo-Zjneyo&usqp=CAU",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 2
    },
    "Pure Classix Radio": {
      "name": "Pure Classix Radio",
      "url": "http://mscp4.live-streams.nl:8140/live.mp3",
      "logo": "https://www.canva.com/design/DAGiX4CZ3EE/MKkelzWZ_zFO_OCvMmqBtQ/view?utm_content=DAGiX4CZ3EE&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hcca3917674",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Zeeland",
      "votes": 2
    },
    "Pure Radio Holland - The Underground Channel": {
      "name": "Pure Radio Holland - The Underground Channel",
      "url": "https://streamserver.pure-isp.eu/listen/pure_radio_holland_the_underground_channel/aac-plus?ver=412779",
      "logo": "https://pureradio.eu/wp-content/uploads/2023/02/Logo-Pure-Radio-Underground-Channel-170x170.jpg.webp",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 2
    },
    "Pure Twenty Four Pure 24": {
      "name": "Pure Twenty Four Pure 24",
      "url": "https://c32.radioboss.fm:8775/stream",
      "logo": "https://primary.jwwb.nl/public/l/g/f/temp-fmgkhncapvhqpctxyban/p24-1-standard-smev91.png ",
      "description": "Rock muziek",
      "bitrate": 192,
      "city": "Noord holland",
      "votes": 2
    },
    "Radio Beverwijk": {
      "name": "Radio Beverwijk",
      "url": "http://stream.stream.delivery/beverwijk",
      "logo": "http://www.radiobeverwijk.nl/fileadmin/templates/images/logo-radio-beverwijk.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 2
    },
    "Radio Golfbreker": {
      "name": "Radio Golfbreker",
      "url": "https://mcp-1.streampanel.nl/stream/vdijk",
      "logo": "https://www.fokkovandijk.nl/favicon.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Groningen",
      "votes": 2
    },
    "radio Goudenpijl": {
      "name": "radio Goudenpijl",
      "url": "https://hostingbudgeteverestcast.nl:2580/stream",
      "logo": "null",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 2
    },
    "Radio Seabreeze AM": {
      "name": "Radio Seabreeze AM",
      "url": "https://mediaserv38.live-streams.nl:2199/tunein/radioseabreeze-stream1.pls",
      "logo": "https://radioseabreeze.nl/wp-content/uploads/2023/04/banner2023-768x192.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 2
    },
    "radio twentestad": {
      "name": "radio twentestad",
      "url": "https://mscp2.live-streams.nl:8072/twentestad320",
      "logo": "null",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 2
    },
    "Starlicht": {
      "name": "Starlicht",
      "url": "http://live.urkfm.nl:8000/urkfm.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 2
    },
    "Tirolia-Express": {
      "name": "Tirolia-Express",
      "url": "https://server-28.stream-server.nl:8846/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 2
    },
    "Wonderjaren streaming radio": {
      "name": "Wonderjaren streaming radio",
      "url": "https://server-67.stream-server.nl:2000/tunein/wonderjarenstreamingradio/stream/asx",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Noord Brabant",
      "votes": 2
    },
    "40UP 320k stream": {
      "name": "40UP 320k stream",
      "url": "https://stream.40upradio.nl/bp-transmit",
      "logo": "https://dev.40upradio.nl/wp-content/uploads/2021/12/40-up-radio.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Noord-Holland, Amsterdam",
      "votes": 1
    },
    "40UP KBC 128k": {
      "name": "40UP KBC 128k",
      "url": "https://stream.40upradio.nl/kbc-high",
      "logo": "https://dev.40upradio.nl/wp-content/uploads/2021/12/40-up-radio.jpg",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Noord-Holland, Amsterdam",
      "votes": 1
    },
    "Airplay FM": {
      "name": "Airplay FM",
      "url": "https://s1.citrus3.com:2000/stream/airplayfm",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 128,
      "city": "Oude wetering",
      "votes": 1
    },
    "American Forces Network Benelux-The Eagle": {
      "name": "American Forces Network Benelux-The Eagle",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/AFNE_BLX_SC",
      "logo": "https://europe.afn.mil/Portals/100/Images/BeneluxSB.png",
      "description": "Nederlandse radio",
      "bitrate": 96,
      "city": "Limburg, Brunssum",
      "votes": 1
    },
    "AnZoRadio": {
      "name": "AnZoRadio",
      "url": "https://stream.laut.fm/anzoradio",
      "logo": "https://i0.wp.com/anzoradio.com/wp-content/uploads/2024/08/2023anzoradiologo_300px.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Utrecht",
      "votes": 1
    },
    "Beeradio Classic": {
      "name": "Beeradio Classic",
      "url": "http://stream.beeradio.nl/classics",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "Bie Os Radio": {
      "name": "Bie Os Radio",
      "url": "https://nlpo.stream.vip/stein/mp3-192/nlpo",
      "logo": "https://favicons.teamtailor-cdn.com/icon?size=80..120..200&url=https%3a%2f%2fwww.omroepbieos.nl%2f",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 1
    },
    "Caribbean FM": {
      "name": "Caribbean FM",
      "url": "https://nlpo.stream.vip/saltocar/mp3-192/nlpo/play.m3u8",
      "logo": "https://www.salto.nl/wp-content/uploads/sites/4/2021/06/radio-poster-caribbeanfm.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 1
    },
    "das total erlebnis": {
      "name": "das total erlebnis",
      "url": "https://radio.dastotalerlebnis.com/listen/main/hifi.aac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": "Gelderland",
      "votes": 1
    },
    "Deventer Radio": {
      "name": "Deventer Radio",
      "url": "https://stream.deventerrtv.nl:8443/mp3",
      "logo": "https://www.deventerrtv.nl/own-files/apple-touch-icon.png",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": "Overijssel",
      "votes": 1
    },
    "Echobox Radio": {
      "name": "Echobox Radio",
      "url": "https://play.streamnerd.nl/echobox/echobox/icecast.audio",
      "logo": "https://www.echobox.radio/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Amsterdam",
      "votes": 1
    },
    "Fidelio Radio": {
      "name": "Fidelio Radio",
      "url": "http://server3.radio-streams.net:2199/tunein/fidelios-stream.pls",
      "logo": "https://fidelioradio.nl/gallery_gen/4aeb3e12247eeef911fc5b3795c7f656_1762x670_fit.PNG?ts=1729887689",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "Freak Radio NL": {
      "name": "Freak Radio NL",
      "url": "http://streaming.shoutcast.com/freakradio",
      "logo": "https://freakradio.nl/wp-content/uploads/fbrfg/favicon-96x96.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "FZO AACPLUS stream": {
      "name": "FZO AACPLUS stream",
      "url": "http://www.flevoziekenomroep.nl/aacplus.m3u",
      "logo": "https://www.fzo.nu/logo-ss.png",
      "description": "Nederlandse radio",
      "bitrate": 160,
      "city": "flevoland",
      "votes": 1
    },
    "Good Life Radio": {
      "name": "Good Life Radio",
      "url": "https://streaming.hofhosting.nl/proxy/goodlife_main?mp=/stream",
      "logo": "https://goodliferadio.nl/favicon/goodliferadio/apple-touch-icon.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 1
    },
    "Groove95": {
      "name": "Groove95",
      "url": "http://mediaserv68.live-streams.nl:8053/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Alkmaar",
      "votes": 1
    },
    "Happy Radio": {
      "name": "Happy Radio",
      "url": "https://stream.happy.radio:8000/320",
      "logo": "null",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "Happy Sound Music": {
      "name": "Happy Sound Music",
      "url": "https://server-28.stream-server.nl:8918/stream",
      "logo": "https://happysoundradio.online/wp-content/uploads/go-x/u/7664c157-a9bb-4f07-a28b-0335191f0150/l0,t0,w1798,h1798/image-683x683.png",
      "description": "Dance muziek",
      "bitrate": 192,
      "city": "Limburg, Roermond, Kasteel osenstraat 12",
      "votes": 1
    },
    "Hitradio Centraal FM": {
      "name": "Hitradio Centraal FM",
      "url": "http://server-hostingexpert.eu:1040/stream.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "HitRadio1nl": {
      "name": "HitRadio1nl",
      "url": "https://everestcast.live-streams.nl:8556/stream",
      "logo": "https://thumbs.dreamstime.com/b/de-uitstekende-oranje-draagbare-radio-van-fm-d-107762044.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Gelderland",
      "votes": 1
    },
    "HITZZZ!!": {
      "name": "HITZZZ!!",
      "url": "https://stream.hitzzz.nl/hitzzz",
      "logo": "https://www.hitzzz.nl/wp-content/uploads/2024/01/hitzzz-logo_desktop.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Groningen, Ter Apel, Oude Weg 29",
      "votes": 1
    },
    "HotrodRadio": {
      "name": "HotrodRadio",
      "url": "https://everestcast.live-streams.nl:8171/api/links/?t=winamp&l=hotrodradio&c=1",
      "logo": "https://hotrodradio.nl/wp-content/uploads/cropped-Banner_Kerst_Final2-768x132.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "httpswwwopenstageradioeu": {
      "name": "httpswwwopenstageradioeu",
      "url": "https://server-28.stream-server.nl:8834/stream",
      "logo": "https://www.openstageradio.eu/uploads/openstageradio.eu/1678666345-OSR%20banner%202.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "KilRock": {
      "name": "KilRock",
      "url": "http://mediaserv30.live-streams.nl:8013/low",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Rock muziek",
      "bitrate": 48,
      "city": "Zeeland",
      "votes": 1
    },
    "KingFM": {
      "name": "KingFM",
      "url": "https://server-28.stream-server.nl:8870/",
      "logo": "https://www.kingfm.nl/uploads/kingfm.nl/1739935618-vp9cymca.png",
      "description": "Dance muziek",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "KL85": {
      "name": "KL85",
      "url": "https://s19.myradiostream.com/18068/listen.mp3?sid=1",
      "logo": "https://kl85.net/wp-content/uploads/2024/02/829x829-170x170.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 1
    },
    "Laser 1011 FM Philipsburg": {
      "name": "Laser 1011 FM Philipsburg",
      "url": "http://201.220.14.41:8060/channel7.mp3",
      "logo": "null",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 1
    },
    "Magic-PowerRadio": {
      "name": "Magic-PowerRadio",
      "url": "https://server-28.stream-server.nl:8904/stream",
      "logo": "https://www.magic-powerradio.nl/uploads/magic-powerradio.nl/1689545823-02%20logo.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": "Limburg, Tegelen, Fazantenpad",
      "votes": 1
    },
    "MD Radio": {
      "name": "MD Radio",
      "url": "http://vps2.sandoz.cloud:8630/radio.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Limburg",
      "votes": 1
    },
    "MeerRadio": {
      "name": "MeerRadio",
      "url": "https://nlpo.stream.vip/radiomer/mp3-192/nlpo/",
      "logo": "https://meerradio.nl/wp-content/uploads/2023/07/Watermerk-meerradio.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Noord-Holland",
      "votes": 1
    },
    "NH Gooi": {
      "name": "NH Gooi",
      "url": "https://stream.nhgooi.nl:8001/mp3live",
      "logo": "https://nhgooi.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord Brabant",
      "votes": 1
    },
    "Non-Stop Cobra Team": {
      "name": "Non-Stop Cobra Team",
      "url": "https://server-67.stream-server.nl:8496/relay",
      "logo": "https://cobrateam.nl/wp-content/uploads/2022/11/Cobra-Logo-Website.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 1
    },
    "Nostalgie NL": {
      "name": "Nostalgie NL",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/NOSTALGIENLAAC.aac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 64,
      "city": null,
      "votes": 1
    },
    "Penguin Indie": {
      "name": "Penguin Indie",
      "url": "http://streams.pinguinradio.com/PinguinRadio320.mp3",
      "logo": "https://pinguinradio.com/assets/icons/icon-128x128.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "Piratenhitsfm": {
      "name": "Piratenhitsfm",
      "url": "http://mscp3.live-streams.nl:8330/live.ogg",
      "logo": "https://i0.wp.com/www.piratenhits.fm/wp-content/uploads/2021/12/logo-favicon.png?fit=192%2C192&ssl=1",
      "description": "Populaire hits",
      "bitrate": 256,
      "city": null,
      "votes": 1
    },
    "Piratenkanjers": {
      "name": "Piratenkanjers",
      "url": "https://ex52.voordeligstreamen.nl/8095/stream",
      "logo": "https://piratenkanjers.nl/wp-content/uploads/2024/09/header.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "Piratenstream Test1": {
      "name": "Piratenstream Test1",
      "url": "https://server1.piratenstream.nl/radio/8190/stream.aac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "Planet 90": {
      "name": "Planet 90",
      "url": "https://loa.beheerstream.nl:8010/",
      "logo": "https://www.planet90.com/assets/images/logo495-495x163.png",
      "description": "Dance muziek",
      "bitrate": 192,
      "city": "Noord-Holland",
      "votes": 1
    },
    "Queer Hits HQ": {
      "name": "Queer Hits HQ",
      "url": "https://stream.queerhits.nl/queerhits.hq",
      "logo": "https://queerhits.nl/wp-content/uploads/2025/01/queerhits1500.jpg",
      "description": "Populaire hits",
      "bitrate": 1200,
      "city": null,
      "votes": 1
    },
    "Quest Radio": {
      "name": "Quest Radio",
      "url": "https://ams-pioneer02.dedicateware.com:1735/stream",
      "logo": "https://questradio.nl/promoman.ico",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Gelderland",
      "votes": 1
    },
    "Radio 3Heuvelland": {
      "name": "Radio 3Heuvelland",
      "url": "http://caster04.streampakket.com:8115/stream",
      "logo": "https://favicons.teamtailor-cdn.com/icon?size=80..120..200&url=https%3a%2f%2f3heuvelland.nl%2f",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 1
    },
    "Radio Acacia": {
      "name": "Radio Acacia",
      "url": "https://securestream3.digipal.nl:2259/;192kbs.mp3",
      "logo": "https://playerservices.digipal.nl/acacia/playerlogo.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 1
    },
    "Radio Capelle": {
      "name": "Radio Capelle",
      "url": "https://live.radiocapelle.nl/radiocapelle-high.mp3",
      "logo": "http://radiocapelle.nl/images/radiocapelle.svg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Zuid-Holland, Capelle aan den IJssel",
      "votes": 1
    },
    "Radio City FM": {
      "name": "Radio City FM",
      "url": "https://mediaserv38.live-streams.nl:18007/stream",
      "logo": "https://radiocityfm.nu/wp-content/uploads/2020/11/logo-cityfm.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Zuid-Holland, Rotterdam",
      "votes": 1
    },
    "Radio de Branding": {
      "name": "Radio de Branding",
      "url": "https://server-28.stream-server.nl:8814/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord-Holland, Heemstede",
      "votes": 1
    },
    "Radio Esperando": {
      "name": "Radio Esperando",
      "url": "http://server-28.stream-server.nl:8888/stream",
      "logo": "https://radioesperando.nl/",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Groningen",
      "votes": 1
    },
    "Radio n31": {
      "name": "Radio n31",
      "url": "https://radion31.beheerstream.nl:8092/",
      "logo": "https://www.facebook.com/share/1AXZvdqc9Y/?mibextid=LQQJ4d",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Friesland",
      "votes": 1
    },
    "Radio Readymix": {
      "name": "Radio Readymix",
      "url": "https://server-26.stream-server.nl:8522/stream",
      "logo": "https://www.radioreadymix.nl/.cm4all/uproc.php/0/Logo%202019/.Sticker.jpg/picture-1200?_=16a30478678",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "Radio Trammelant": {
      "name": "Radio Trammelant",
      "url": "https://server-67.stream-server.nl:8762/stream",
      "logo": "https://radiotrammelant.nl/wp-content/uploads/2021/08/logo_3.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 1
    },
    "Radio Verona": {
      "name": "Radio Verona",
      "url": "https://mcp-1.streampanel.nl:8020/RadioVelona",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Pop muziek",
      "bitrate": 192,
      "city": null,
      "votes": 1
    },
    "Radio Zuyd": {
      "name": "Radio Zuyd",
      "url": "http://radiozuyd.shoutcaststream.com:8199/stream",
      "logo": "http://radiozuyd.nl/wp-content/uploads/2018/11/Logo-Radio-Zuyd-2.png",
      "description": "Nederlandse radio",
      "bitrate": 160,
      "city": "Limburg, Heerle",
      "votes": 1
    },
    "RADIO10AAC": {
      "name": "RADIO10AAC",
      "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO10AAC.aac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 96,
      "city": null,
      "votes": 1
    },
    "RN7nl": {
      "name": "RN7nl",
      "url": "http://stream.stream.delivery/rn7nl",
      "logo": "https://rn7.stream.prepr.io/w_1174/5ik66fw57pew-logo-4.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "Robintimo Radio": {
      "name": "Robintimo Radio",
      "url": "https://stream.robintimo.nl:8000/radio.mp3",
      "logo": "https://www.robintimo.nl/wp-content/uploads/2022/10/Logo-van-Robintimo-Radio.webp",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 1
    },
    "Salland 747": {
      "name": "Salland 747",
      "url": "https://radio2.stream24.net:8270/live.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 1
    },
    "SH Radio": {
      "name": "SH Radio",
      "url": "https://loa.beheerstream.nl:8058/stream",
      "logo": "https://primary.jwwb.nl/public/l/h/u/temp-mfnmvuwmtliqelppzfzu/j7l52m/sh_radio_logo_-1.jpg",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Zuid-Holland, Rotterdam",
      "votes": 1
    },
    "Sleutelstad Radio": {
      "name": "Sleutelstad Radio",
      "url": "https://sleutelstad.radioca.st/stream",
      "logo": "https://sleutelstad.nl/wp-content/themes/sleutelstad/img/sleutelstad_logo_payoff.svg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Zuid-Holland",
      "votes": 1
    },
    "Station amg": {
      "name": "Station amg",
      "url": "https://stream.rcast.net/71079",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 1
    },
    "Station One Internet Radio": {
      "name": "Station One Internet Radio",
      "url": "https://server-67.stream-server.nl:2000/tunein/StationOneInternetRadio/stream/pls",
      "logo": "https://stationoneinternetradio.nl/img/S1%20logo%20klein.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 1
    },
    "Studio Emmeloord": {
      "name": "Studio Emmeloord",
      "url": "https://cast.streamkeuze.nl/studioemmeloord",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 1
    },
    "Sunset Radio": {
      "name": "Sunset Radio",
      "url": "https://server-28.stream-server.nl:8854/stream",
      "logo": "https://cdn.onlineradiobox.com/img/l/7/77527.v8.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Zeeland, Sluiskil",
      "votes": 1
    },
    "The SID Station": {
      "name": "The SID Station",
      "url": "http://173.208.54.18:8144/stream",
      "logo": "https://c64radio.com/images/tsslogo.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 1
    },
    "VC 1  Veluwe Centraal": {
      "name": "VC 1  Veluwe Centraal",
      "url": "https://caster04.streampakket.com/proxy/8018/stream",
      "logo": "https://veluwecentraal.com/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 1
    },
    "Waterland Radio": {
      "name": "Waterland Radio",
      "url": "https://waterlandradio.beheerstream.nl:7020/stream",
      "logo": "https://www.waterlandradio.nl/wp-content/uploads/2023/04/logo_waterlandradio_mobile.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 1
    },
    "Waterland Radio 320k": {
      "name": "Waterland Radio 320k",
      "url": "https://loa.beheerstream.nl:8034/stream",
      "logo": "https://www.waterlandradio.nl/wp-content/uploads/2023/04/logo_waterlandradio_site.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord-Holland, Purmerend",
      "votes": 1
    },
    "Webradio Happy-Tigers": {
      "name": "Webradio Happy-Tigers",
      "url": "https://server-67.stream-server.nl:8756/stream",
      "logo": "https://static.mytuner.mobi/media/tvos_radios/4zgFmUGemN.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Zuid-Holland, Rotterdam",
      "votes": 1
    },
    "ZAP! FM": {
      "name": "ZAP! FM",
      "url": "https://zapstream.nl/1",
      "logo": "https://www.zap.fm/uploads/logo/logo.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 1
    },
    "Zeeuws FM": {
      "name": "Zeeuws FM",
      "url": "https://server-28.stream-server.nl:8838/stream",
      "logo": "https://zeeuwsfm.nl/wp-content/uploads/2024/08/cropped-logo-zeeuws.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Zeeland, Sas van Gent",
      "votes": 1
    },
    "Zender Groenveld": {
      "name": "Zender Groenveld",
      "url": "https://server-28.stream-server.nl:8912/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Limburg, Venlo",
      "votes": 1
    },
    "ZO-NWS Radio": {
      "name": "ZO-NWS Radio",
      "url": "https://nlpo.stream.vip/zonws/mp3-192/nlpo/",
      "logo": "https://www.zo-nws.nl/%3A/logo%20zonws.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 1
    },
    "1Achterhoek": {
      "name": "1Achterhoek",
      "url": "https://nlpo.stream.vip/achterhoek/mp3-192/nlpo.stream.vip/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Gelderland",
      "votes": 0
    },
    "4EverRadio": {
      "name": "4EverRadio",
      "url": "https://ex52.voordeligstreamen.nl/8036/stream",
      "logo": "https://static.wixstatic.com/media/271b84_4b60b5e81d1b4a1da469470b2ccb268b~mv2.png/v1/fill/w_138,h_134,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/4EverRadio%20Logo.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Friesland",
      "votes": 0
    },
    "Aalburg FM": {
      "name": "Aalburg FM",
      "url": "https://server-28.stream-server.nl:8808/stream",
      "logo": "https://www.aalburg-fm.nl/wp-content/uploads/2023/09/LOGO-2-2-1.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord-Brabant, Wijk en Aalburg, de Wiek 47",
      "votes": 0
    },
    "Aladna FM": {
      "name": "Aladna FM",
      "url": "https://aladnafm.beheerstream.nl/8024/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Gelderland",
      "votes": 0
    },
    "Alex FM": {
      "name": "Alex FM",
      "url": "https://stream-33.zeno.fm/txy2thr6wp8uv",
      "logo": "https://alexfm.nl/assets/imgs/logos/header_logo.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 0
    },
    "Altijd Hitradio": {
      "name": "Altijd Hitradio",
      "url": "http://mscp2.live-streams.nl:8170/altijdhits",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 0
    },
    "AXL": {
      "name": "AXL",
      "url": "https://mediaserv30.live-streams.nl:18005/stream",
      "logo": "https://axlstream.nl/wp-content/uploads/2023/09/AXL2024.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 0
    },
    "beeHollands": {
      "name": "beeHollands",
      "url": "https://stream.beeradio.nl/hollands",
      "logo": "https://bee.radio/wp-content/uploads/2025/04/beeHollands.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 0
    },
    "ChathotelRadio": {
      "name": "ChathotelRadio",
      "url": "https://a5.asurahosting.com:7410/radio.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Netherlands",
      "votes": 0
    },
    "Clos FM": {
      "name": "Clos FM",
      "url": "https://server-28.stream-server.nl:8864/stream",
      "logo": "https://www.closfm.nl/uploads/closfm.nl/1710176731-cd5b8381-b9f5-4419-a050-4b0225356c15.jpeg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Noord-Brabant, Tilburg",
      "votes": 0
    },
    "Clubstitute Radio": {
      "name": "Clubstitute Radio",
      "url": "https://stream01.eliveld-ict.nl/listen/clubstitute_radio/radio.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Dance muziek",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Cuppie": {
      "name": "Cuppie",
      "url": "https://server2.inetcast.nl:3265/stream?x=1742631938077",
      "logo": "https://www.maasenwaalradio.com/",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Nederland",
      "votes": 0
    },
    "DailyBaseRadio": {
      "name": "DailyBaseRadio",
      "url": "https://stream.rcast.net/63861",
      "logo": "http://serv4.verzoeksysteem.nl/uploads/nonstop/7022/14_Afbeelding%20van%20WhatsApp%20op%202024-08-26%20om%2000.12.48_6b51dd64.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 0
    },
    "De Vrolijke Snuiters": {
      "name": "De Vrolijke Snuiters",
      "url": "https://server-67.stream-server.nl:8794/",
      "logo": "https://www.devrolijkesnuiters.nl/uploads/devrolijkesnuiters.nl/1703461960-My%20Post.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Groningen, Uithuizen",
      "votes": 0
    },
    "Decibel greatest hits": {
      "name": "Decibel greatest hits",
      "url": "https://stream.decibel.nl/03.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Populaire hits",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "echo-radio": {
      "name": "echo-radio",
      "url": "https://stream.echo-radio.nl/listen/echo-radio/radio.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 0
    },
    "Exclusive Radio": {
      "name": "Exclusive Radio",
      "url": "https://linux26.live-streams.nl:18000/?nocache=86041",
      "logo": "https://www.exclusieffm.eu/wp-content/uploads/2018/08/exclusieffm-banner2.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "F Test": {
      "name": "F Test",
      "url": "https://server-67.stream-server.nl:8768/stream",
      "logo": "https://www.telco.eu/images/logo.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": "Gelderland, Hedel",
      "votes": 0
    },
    "FlevoZiekenOmroep": {
      "name": "FlevoZiekenOmroep",
      "url": "http://stream.heerema.net/studio?_res_tag_=audio",
      "logo": "https://www.fzo.nu/logo-ss.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 0
    },
    "FlevoZiekenOmroep HLS audio": {
      "name": "FlevoZiekenOmroep HLS audio",
      "url": "https://video.fzo.nu/live.m3u8",
      "logo": "https://www.flevoziekenomroep.nl/images/stories/header_bg1.svg",
      "description": "Nederlandse radio",
      "bitrate": 52,
      "city": "Flevoland, Almere",
      "votes": 0
    },
    "flitsradio": {
      "name": "flitsradio",
      "url": "https://streamer.hosting078.nl:1835/stream",
      "logo": "https://www.flitsradio.nl/wp-content/uploads/2025/01/logo-flitsradio.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Gelderland, Ede",
      "votes": 0
    },
    "Friendtastic Radio": {
      "name": "Friendtastic Radio",
      "url": "http://server-26.stream-server.nl:8652/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 0
    },
    "Geheime Zender Stream": {
      "name": "Geheime Zender Stream",
      "url": "https://mediacp.audiostreamen.nl:2000/stream/8160/stream",
      "logo": "https://mediacp.audiostreamen.nl:2000/pub/8160/background.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "GLD - INHOUSE MER DHD": {
      "name": "GLD - INHOUSE MER DHD",
      "url": "https://stream.40upradio.nl/gld",
      "logo": "https://dev.40upradio.nl/wp-content/uploads/2021/12/40-up-radio.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Noord-Holland, Amsterdam",
      "votes": 0
    },
    "GLXY RADIO": {
      "name": "GLXY RADIO",
      "url": "https://stream.glxy.radio/GLXY",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "GLXY THROWBACK RADIO": {
      "name": "GLXY THROWBACK RADIO",
      "url": "https://stream.glxy.radio/GLXY_OG",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 0
    },
    "GLXYRADIO": {
      "name": "GLXYRADIO",
      "url": "https://stream23.gal.io/GLXY_CF01",
      "logo": "https://glxy.radio/wp-content/uploads/2022/01/GLXY-LOGO-RGB-500.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Groeistad Radio": {
      "name": "Groeistad Radio",
      "url": "http://213.202.241.176:8564/stream",
      "logo": "https://www.groeistad.com/images/logo_groeistad.png",
      "description": "Pop muziek",
      "bitrate": 160,
      "city": null,
      "votes": 0
    },
    "Hit Radio Loz": {
      "name": "Hit Radio Loz",
      "url": "https://loa.beheerstream.nl:8112/stream",
      "logo": "http://hitradioloz.nl/images/hitradiolozradio.jpg",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Zuid-Holland, Leiden",
      "votes": 0
    },
    "Hitradio 038": {
      "name": "Hitradio 038",
      "url": "https://loa.beheerstream.nl:8018/stream",
      "logo": "https://hitradio038.eu/wp-content/uploads/2022/07/facebook_1658737516426_6957249400103467120-300x150.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Overijssel, Zwolle",
      "votes": 0
    },
    "Hitstream FM": {
      "name": "Hitstream FM",
      "url": "https://stream.streamhits.nl/stream/1/",
      "logo": "https://www.hitstream.fm/static/logo-2a23f21b0d3facae9130b5718ae8842f.png",
      "description": "Populaire hits",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Hollands Op Zijn Best": {
      "name": "Hollands Op Zijn Best",
      "url": "https://mediaserv33.live-streams.nl:8009/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Hoppa Music Holland": {
      "name": "Hoppa Music Holland",
      "url": "https://server-28.stream-server.nl:8822/stream",
      "logo": "https://www.hoppa-music-holland.nl/images/news/logo-icon.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Intercity Radio": {
      "name": "Intercity Radio",
      "url": "https://server-28.stream-server.nl:8804/stream",
      "logo": "https://intercityradio.nl/wp-content/uploads/2020/05/Main-Logo-intercity-radio.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Gelderland, Arnhem",
      "votes": 0
    },
    "Klassefm": {
      "name": "Klassefm",
      "url": "https://mediaserv38.live-streams.nl:18023/stream",
      "logo": "https://klasse.fm/wp-content/uploads/2020/06/Klasse.FM-logo-transparant.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Gelderland, Nijmegen",
      "votes": 0
    },
    "Kromhout Radio": {
      "name": "Kromhout Radio",
      "url": "https://server-67.stream-server.nl:8784/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Lichtstad Radio": {
      "name": "Lichtstad Radio",
      "url": "https://securestream.digipal.nl:1687/;luister.mp3?1734446627077",
      "logo": "https://www.lichtstad-radio.nl/digipal_uploads/headerdb/2138211385.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Loeradio": {
      "name": "Loeradio",
      "url": "https://loestream.nl/live.ogg",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Gelderland",
      "votes": 0
    },
    "Maasenwaalradio": {
      "name": "Maasenwaalradio",
      "url": "https://server2.inetcast.nl:3265/stream?x=1742631873630",
      "logo": "https://www.maasenwaalradio.com/",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "nederland",
      "votes": 0
    },
    "Maenda Country": {
      "name": "Maenda Country",
      "url": "https://radio.streampanel.nl/mcraac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 96,
      "city": null,
      "votes": 0
    },
    "mArt radio": {
      "name": "mArt radio",
      "url": "https://beta.surilive.com/mart/stream",
      "logo": "https://radiomart.nl/favicon.ico",
      "description": "Nederlandse radio",
      "bitrate": 112,
      "city": null,
      "votes": 0
    },
    "MBhitradio": {
      "name": "MBhitradio",
      "url": "https://everestcast.live-streams.nl:18116/stream",
      "logo": "https://everestcast.live-streams.nl:18101/media/djs/1674386865688-thumbnail.jpeg",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": null,
      "votes": 0
    },
    "ML5 Radio": {
      "name": "ML5 Radio",
      "url": "https://mediacp.audiostreamen.nl:2000/stream/8182",
      "logo": "https://www.ml5.nl/wp-content/uploads/2020/08/cropped-logo_ml5-180x180-1-150x150.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Midden Limburg",
      "votes": 0
    },
    "Moonlight-Radio": {
      "name": "Moonlight-Radio",
      "url": "https://server-67.stream-server.nl:8780/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Music from earth": {
      "name": "Music from earth",
      "url": "https://server-28.stream-server.nl:8922/stream",
      "logo": "https://primary.jwwb.nl/public/z/j/u/temp-bqzsjohodqbdickmvoew/84461044_2851346148220645_8198702108292153344_n-high.jpg?enable-io=true&amp;enable=upscale&amp;width=186",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Drenthe, Smilde",
      "votes": 0
    },
    "Nora FM": {
      "name": "Nora FM",
      "url": "https://25333.live.streamtheworld.com/NORA_FM.mp3",
      "logo": "https://norafm.nl/wp-content/uploads/2025/01/NoraFM_Logo_300x300-150x150.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "NoraFM - de Fijnste muziekmix": {
      "name": "NoraFM - de Fijnste muziekmix",
      "url": "https://caster05.streampakket.com/proxy/rein1234",
      "logo": "https://norafm.nl/wp-content/uploads/2024/12/logo_kerst-150x150.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Omroep Zilt": {
      "name": "Omroep Zilt",
      "url": "https://omroepzilt1.streampartner.nl/live?type=.mp3",
      "logo": "https://omroepzilt.nl/wp-content/uploads/2022/08/cropped-cropped-WitteZ-MAX-150px-e1659601380483.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 0
    },
    "OnlinepiraatNL": {
      "name": "OnlinepiraatNL",
      "url": "https://loa.beheerstream.nl:8016/stream",
      "logo": "https://onlinepiraat.nl/wp-content/uploads/2024/08/Opvullogo_wallpaper-2048x513.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 0
    },
    "onverantwoordcom": {
      "name": "onverantwoordcom",
      "url": "https://loa.beheerstream.nl:8008/stream",
      "logo": "https://onverantwoord.com/wp-content/uploads/2023/01/onverantwoord.svg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Noord-Holland, Wervershoof",
      "votes": 0
    },
    "PI3UTR": {
      "name": "PI3UTR",
      "url": "https://stream.hobbyscoop.nl/pi3utr",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 32,
      "city": null,
      "votes": 0
    },
    "PinQradio": {
      "name": "PinQradio",
      "url": "https://s18.myradiostream.com/3194/;?type=http&nocache=1744091383?0.841561797877854",
      "logo": "https://pinqradio.com/wp-content/uploads/2020/06/cropped-PinQradio-long.png",
      "description": "Nederlandse radio",
      "bitrate": 160,
      "city": "Amsterdam",
      "votes": 0
    },
    "PJD2 The Voice of Sint Maarten 1027 FM": {
      "name": "PJD2 The Voice of Sint Maarten 1027 FM",
      "url": "http://142.4.219.8:8181/stream",
      "logo": "null",
      "description": "Pop muziek",
      "bitrate": 64,
      "city": null,
      "votes": 0
    },
    "PJD2 The Voice of Sint Maarten 1300 AM": {
      "name": "PJD2 The Voice of Sint Maarten 1300 AM",
      "url": "http://142.4.219.8:8193/stream",
      "logo": "null",
      "description": "Pop muziek",
      "bitrate": 64,
      "city": null,
      "votes": 0
    },
    "PJD3 Power 1027 FM Philipsburg": {
      "name": "PJD3 Power 1027 FM Philipsburg",
      "url": "http://201.220.14.41:8060/channel3.mp3",
      "logo": "null",
      "description": "Pop muziek",
      "bitrate": 128,
      "city": null,
      "votes": 0
    },
    "Polder radio": {
      "name": "Polder radio",
      "url": "https://server-67.stream-server.nl:8734/",
      "logo": "https://polderradio.nl/wp-content/uploads/2023/04/cropped-Polder-Radio-logo.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord-Brabant, Veen",
      "votes": 0
    },
    "Polder Radio stream 2": {
      "name": "Polder Radio stream 2",
      "url": "https://server-67.stream-server.nl:8738/",
      "logo": "https://polderradio.nl/wp-content/uploads/2023/04/cropped-Polder-Radio-logo.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Noord-Brabant, Veen",
      "votes": 0
    },
    "Polder Radio stream 3": {
      "name": "Polder Radio stream 3",
      "url": "https://server-67.stream-server.nl:8734/",
      "logo": "https://polderradio.nl/wp-content/uploads/2023/04/cropped-Polder-Radio-logo.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord-Brabant, Veen",
      "votes": 0
    },
    "Powersound Radio": {
      "name": "Powersound Radio",
      "url": "https://mscp2.live-streams.nl:8112/",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 256,
      "city": "Zuid-Holland",
      "votes": 0
    },
    "Q Musik Top40 NL": {
      "name": "Q Musik Top40 NL",
      "url": "https://icecast-qmusicnl-cdp.triple-it.nl/Qmusic_nl_top40_high.aac",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 96,
      "city": null,
      "votes": 0
    },
    "Queer Hits": {
      "name": "Queer Hits",
      "url": "https://stream.queerhits.nl/queerhits.aac",
      "logo": "https://queerhits.nl/wp-content/uploads/2025/01/queerhits1500.jpg",
      "description": "Populaire hits",
      "bitrate": 160,
      "city": null,
      "votes": 0
    },
    "Radio 0511": {
      "name": "Radio 0511",
      "url": "https://443-1.autopo.st/191/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Radio Blacklight": {
      "name": "Radio Blacklight",
      "url": "https://server-28.stream-server.nl:8876/autodj",
      "logo": "https://www.radioblacklight.nl/images/logo%20blacklight.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Radio De Musketiers": {
      "name": "Radio De Musketiers",
      "url": "https://loa.beheerstream.nl:8022/stream",
      "logo": "https://www.radiodemusketiers.nl/wp-content/uploads/2023/03/cropped-bannerRDM.jpg",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Limburg, Kerkrade",
      "votes": 0
    },
    "Radio De Stemmingmaker": {
      "name": "Radio De Stemmingmaker",
      "url": "https://server-28.stream-server.nl:8894/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Radio Enkhuizen": {
      "name": "Radio Enkhuizen",
      "url": "https://mediaserv38.live-streams.nl:18003/stream",
      "logo": "https://radioenkhuizen.nl/wp-content/uploads/2020/12/RadioEnkhuizen_logo_DEF.svg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Noord-Holland, Enkhuizen",
      "votes": 0
    },
    "Radio Haaglanden": {
      "name": "Radio Haaglanden",
      "url": "https://stream.excellentfm.nl/radiohaaglanden",
      "logo": "https://radiohaaglanden.nl/wp-content/uploads/2025/03/cropped-Logo-Silver-Groot-Formaat.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Zuid-Holland, Den Haag",
      "votes": 0
    },
    "Radio HB": {
      "name": "Radio HB",
      "url": "https://server1.nl.eu.org/stream.ogg",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 16,
      "city": null,
      "votes": 0
    },
    "Radio Hermax": {
      "name": "Radio Hermax",
      "url": "https://stream.radiohermax.nl/listen/hermax/hermax",
      "logo": "https://stream.radiohermax.nl/static/uploads/hermax/album_art.1707338120.jpg",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Overijssel",
      "votes": 0
    },
    "Radio Powerline": {
      "name": "Radio Powerline",
      "url": "https://server-67.stream-server.nl:8836/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Radio Seabreeze 1395 AM": {
      "name": "Radio Seabreeze 1395 AM",
      "url": "https://mediaserv38.live-streams.nl:18025/stream1",
      "logo": "https://radioseabreeze.nl/wp-content/uploads/2023/04/banner2023.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Friesland",
      "votes": 0
    },
    "Radio Stad Woerden": {
      "name": "Radio Stad Woerden",
      "url": "https://server-28.stream-server.nl:8886/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Utrecht, Woerden",
      "votes": 0
    },
    "Radio074": {
      "name": "Radio074",
      "url": "https://server-67.stream-server.nl:8746/stream",
      "logo": "https://radio074.nl/wp-content/uploads/2025/02/logo-radio074-golven-grijs-transparant-CLEAN.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Overijssel, Hengelo",
      "votes": 0
    },
    "Radio416": {
      "name": "Radio416",
      "url": "https://server6.radio-streams.net/proxy/radio416/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 0
    },
    "Radio750": {
      "name": "Radio750",
      "url": "https://solid48.streamupsolutions.com/proxy/ofufrjbi/radio750",
      "logo": "https://radio750.nl/wp-content/uploads/2025/02/Radio750-logo-vierkant.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Zuid-Holland",
      "votes": 0
    },
    "radiooptimaalfm": {
      "name": "radiooptimaalfm",
      "url": "http://stream-10.pmteurope.com:8002/stream",
      "logo": "https://radiooptimaalfm.nl/wp-content/themes/Radio2/streams/Live-player-pop-out.php",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Gelderland, Arnhem",
      "votes": 0
    },
    "Regio Team FM": {
      "name": "Regio Team FM",
      "url": "https://server-28.stream-server.nl:8916/stream",
      "logo": "https://www.regioteamfm.nl/wp-content/uploads/2020/08/RTFM-1-wit-2.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Rijnstreek FM Wageningen": {
      "name": "Rijnstreek FM Wageningen",
      "url": "https://stream.rtvrijnstreek.nl:1973/rtvrstreek",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Romeo-Z Deventer": {
      "name": "Romeo-Z Deventer",
      "url": "https://loa.beheerstream.nl:8002/listen.pls?sid=1",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Overijssel, Deventer",
      "votes": 0
    },
    "Romeo-Z Deventer ch 2": {
      "name": "Romeo-Z Deventer ch 2",
      "url": "https://loa.beheerstream.nl:8002/listen.pls?sid=55",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Overijssel, Deventer",
      "votes": 0
    },
    "Rozo Radio": {
      "name": "Rozo Radio",
      "url": "http://server3.radio-streams.net:8007/live",
      "logo": "https://vhn-huisomroep.nl/____impro/1/onewebmedia/i286823014299902169.jpg",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Noord-Brabant, Oosterhout",
      "votes": 0
    },
    "RSO radio": {
      "name": "RSO radio",
      "url": "https://rsoradio.streampartner.nl/live",
      "logo": "https://rtv-rso.nl/wp-content/uploads/2023/07/logozonderachtergrond1.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Groningen, Groningen",
      "votes": 0
    },
    "RTV Hollands Midden": {
      "name": "RTV Hollands Midden",
      "url": "https://securestream2.digipal.nl:1805/stream",
      "logo": "https://rtvhollandsmidden.nl/wp-content/uploads/2023/11/logo-rtvhm.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Zuid-Holland, Ter Aar",
      "votes": 0
    },
    "RTV NOF": {
      "name": "RTV NOF",
      "url": "https://stream.rtvnof.nl/rtvnof1",
      "logo": "https://www.rtvnof.nl/wp-content/themes/rtvnof/img/logo_rtvnof.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "RTV NOF radio": {
      "name": "RTV NOF radio",
      "url": "https://stream.rtvnof.nl/rtvnof1",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Friesland, De Westereen",
      "votes": 0
    },
    "RTV Rijnstreek": {
      "name": "RTV Rijnstreek",
      "url": "https://stream.rtvrijnstreek.nl:1973/rtvrstreek",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "SmelneFM": {
      "name": "SmelneFM",
      "url": "https://smelnefm_icecast.streampartner.nl/live",
      "logo": "https://static.mytuner.mobi/media/tvos_radios/gHwrjCpmNF.png",
      "description": "Nederlandse radio",
      "bitrate": 185,
      "city": null,
      "votes": 0
    },
    "SRC FM": {
      "name": "SRC FM",
      "url": "https://cc6.beheerstream.com/proxy/src1?mp=/stream;stream.mp3",
      "logo": "https://www.src.fm/images/logo_mob.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 0
    },
    "Stoetertv Radio": {
      "name": "Stoetertv Radio",
      "url": "https://server-28.stream-server.nl:8920/stream",
      "logo": "https://lh4.googleusercontent.com/ukevL9-Eoe6hhbfXRMhPTu2B6zozQLgWhQ9FPvID_UMXTE3B8pt7vzbpRsXvIL_GR4klpOWVjlaieD5tk5ipx8o=w16383",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": null,
      "votes": 0
    },
    "Studio Music Station": {
      "name": "Studio Music Station",
      "url": "https://stream.studiomusicstation.nl/radio/8010/radio.mp3",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 0
    },
    "SuperMixFM": {
      "name": "SuperMixFM",
      "url": "https://loa.beheerstream.nl:8110/stream",
      "logo": "https://supermixfm.nl/wp-content/uploads/2020/04/cropped-supermixfm-header-trans-3.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": "Overijssel, Deventer",
      "votes": 0
    },
    "Venlo Vintage": {
      "name": "Venlo Vintage",
      "url": "https://stream-10.pmteurope.com:8040/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Limburg",
      "votes": 0
    },
    "VOORSTVELUWEZOOM": {
      "name": "VOORSTVELUWEZOOM",
      "url": "https://mscp2.live-streams.nl:8122/radio",
      "logo": "https://cdn.nieuwsned.nl/07e1cd7dca89a1678042477183b7ac3f/files/cropped-cropped-logo-vvz-2024-blauw-rond.png",
      "description": "Nederlandse radio",
      "bitrate": 320,
      "city": null,
      "votes": 0
    },
    "Wagenbergtotaal": {
      "name": "Wagenbergtotaal",
      "url": "https://server-28.stream-server.nl:8826/stream",
      "logo": "https://www.wagenbergtotaal.nl/wp-content/uploads/2021/02/logo2.png",
      "description": "Nederlandse radio",
      "bitrate": 192,
      "city": "Noord-Brabant",
      "votes": 0
    },
    "Wonderjaren - Streaming radio": {
      "name": "Wonderjaren - Streaming radio",
      "url": "https://server-67.stream-server.nl:8748/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": "Noord-Brabant, Oss",
      "votes": 0
    },
    "Yoursaferadio": {
      "name": "Yoursaferadio",
      "url": "https://radiostream.yoursafe.nl/stream",
      "logo": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      "description": "Nederlandse radio",
      "bitrate": 128,
      "city": null,
      "votes": 0
    }
  }
};

// Search stations by name
export const searchStations = (query) => {
  const all = getAllStations();
  const searchTerm = query.toLowerCase();
  return all.filter(station => 
    station.name.toLowerCase().includes(searchTerm) ||
    station.description.toLowerCase().includes(searchTerm)
  );
};

// Get stations by category
export const getStationsByCategory = (category) => {
  return Object.values(allDutchStations[category] || {});
};
