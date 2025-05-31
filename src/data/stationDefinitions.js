// Station definitions with multiple fallback URLs
// This file can be directly edited to override station URLs
// URLs are tried in order from first to last

export const stationDefinitions = {
  // Popular stations with known working alternatives
  "SLAM!": {
    name: "SLAM!",
    urls: [
      // CORS-friendly URLs first
      "https://icecast-qmusicnl-cdp.triple-it.nl/slam_96.mp3",
      "https://icecast-qmusicnl-cdp.triple-it.nl/slam_128.mp3", 
      "https://29033.live.streamtheworld.com/SLAM_MP3_SC",
      "https://22393.live.streamtheworld.com/SLAM.mp3",
      "https://22673.live.streamtheworld.com/WEB14_MP3_SC"
    ],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/SLAM%21_logo_2015.svg/200px-SLAM%21_logo_2015.svg.png",
    description: "Pop muziek"
  },
  
  "JOE": {
    name: "JOE",
    urls: [
      "https://icecast-qmusicnl-cdp.triple-it.nl/Joe_nl_high.aac",
      "https://22063.live.streamtheworld.com/JOE.mp3",
      "https://playerservices.streamtheworld.com/api/livestream-redirect/JOE.mp3"
    ],
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/54/Joe_logo_2015.svg",
    description: "Pop muziek"
  },
  
  "Radio 538": {
    name: "Radio 538",
    urls: [
      // Direct streaming URLs (CORS-friendly)
      "https://22763.live.streamtheworld.com/RADIO538.mp3",
      "https://icecast-qmusicnl-cdp.triple-it.nl/radio538_96.mp3",
      // Redirect URLs last
      "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO538.mp3"
    ],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Radio_538_logo_2019.svg/200px-Radio_538_logo_2019.svg.png",
    description: "Pop muziek"
  },
  
  "Sky Radio": {
    name: "Sky Radio",
    urls: [
      // Direct streaming URLs first
      "https://icecast-qmusicnl-cdp.triple-it.nl/skyradio_96.mp3",
      "https://25243.live.streamtheworld.com/SKYRADIO_MP3_SC",
      // Redirect URLs last
      "https://playerservices.streamtheworld.com/api/livestream-redirect/SKYRADIO.mp3"
    ],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Sky_Radio_logo_2019.svg/200px-Sky_Radio_logo_2019.svg.png",
    description: "Pop muziek"
  },
  
  "Qmusic": {
    name: "Qmusic",
    urls: [
      // Direct streaming URLs first
      "https://icecast-qmusicnl-cdp.triple-it.nl/qmusic_96.mp3",
      "https://icecast-qmusicnl-cdp.triple-it.nl/qmusic_128.mp3",
      // Redirect URLs last
      "https://playerservices.streamtheworld.com/api/livestream-redirect/QMUSICNL.mp3"
    ],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Qmusic_logo_Q_2018.svg/200px-Qmusic_logo_Q_2018.svg.png",
    description: "Pop muziek"
  },
  
  "KINK": {
    name: "KINK",
    urls: [
      "https://25243.live.streamtheworld.com/KINK_SC",
      "https://playerservices.streamtheworld.com/api/livestream-redirect/KINK.mp3"
    ],
    logo: "https://kink.nl/static/apple-touch-icon.png",
    description: "Commerciële radio"
  },
  
  "Radio Veronica": {
    name: "Radio Veronica", 
    urls: [
      "https://22183.live.streamtheworld.com/VERONICAAAC.aac",
      "https://icecast-qmusicnl-cdp.triple-it.nl/veronica_96.mp3",
      "https://playerservices.streamtheworld.com/api/livestream-redirect/VERONICAAAC.aac"
    ],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Veronica_logo_2015.svg/200px-Veronica_logo_2015.svg.png",
    description: "Pop muziek"
  },
  
  "Radio 10": {
    name: "Radio 10",
    urls: [
      // Direct streaming URLs first
      "https://22063.live.streamtheworld.com/RADIO10.mp3",
      "https://icecast-qmusicnl-cdp.triple-it.nl/radio10_96.mp3",
      // Redirect URLs last
      "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO10.mp3"
    ],
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Radio_10_logo_2015.svg",
    description: "Publieke omroep"
  },

  "TEST FAILING STATION": {
    name: "TEST FAILING STATION",
    urls: [
      "http://this-will-definitely-fail.example.com/nonexistent-stream.mp3"
    ],
    logo: "https://via.placeholder.com/64x64/ff0000/ffffff?text=FAIL",
    description: "Test station that should fail"
  },

  "Slam! Mixmarathon": {
    name: "Slam! Mixmarathon",
    urls: [
      // Use CORS proxy for radiocorp streams
      "https://corsproxy.io/?http%3A%2F%2Fstream.radiocorp.nl%2Fweb13_mp3",
      "https://api.allorigins.win/raw?url=http%3A%2F%2Fstream.radiocorp.nl%2Fweb13_mp3",
      "http://stream.radiocorp.nl/web13_mp3",
      "https://stream.radiocorp.nl/web13_mp3"
    ],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/SLAM%21_logo_2015.svg/200px-SLAM%21_logo_2015.svg.png",
    description: "SLAM! Mixmarathon - Non-stop mixes"
  },
  
  "SLAM! Hardstyle": {
    name: "SLAM! Hardstyle", 
    urls: [
      "https://corsproxy.io/?http%3A%2F%2Fstream.radiocorp.nl%2Fweb14_mp3",
      "http://stream.radiocorp.nl/web14_mp3"
    ],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/SLAM%21_logo_2015.svg/200px-SLAM%21_logo_2015.svg.png",
    description: "SLAM! Hardstyle"
  },

  "Sky Radio Non-Stop @ Work": {
    name: "Sky Radio Non-Stop @ Work",
    urls: [
      "https://22433.live.streamtheworld.com/SKYRADIO_NONSTOP_WORK.mp3",
      "https://icecast-qmusicnl-cdp.triple-it.nl/skyradio_96.mp3",
      "https://25243.live.streamtheworld.com/SKYRADIO_MP3_SC",
      "https://playerservices.streamtheworld.com/api/livestream-redirect/SKYRADIO.mp3"
    ],
    logo: "http://www.skyradio.nl/favicon.ico",
    description: "Perfect voor op kantoor"
  },

  "Radio 538 Non-Stop": {
    name: "Radio 538 Non-Stop", 
    urls: [
      "https://21223.live.streamtheworld.com/538NONSTOP.mp3",
      "https://22763.live.streamtheworld.com/RADIO538.mp3",
      "https://icecast-qmusicnl-cdp.triple-it.nl/radio538_96.mp3",
      "https://playerservices.streamtheworld.com/api/livestream-redirect/TLPSTR09.mp3"
    ],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/538_logo.png/250px-538_logo.png",
    description: "Non-stop hits zonder praat"
  }
};

// Function to get station definition with fallbacks
export function getStationDefinition(stationName) {
  return stationDefinitions[stationName] || null;
}

// Function to add or update a station definition
export function updateStationDefinition(stationName, urls, logo = null, description = null) {
  if (!Array.isArray(urls)) {
    urls = [urls];
  }
  
  stationDefinitions[stationName] = {
    name: stationName,
    urls: urls,
    logo: logo,
    description: description
  };
  
  console.log(`✅ Updated station definition for "${stationName}" with ${urls.length} URLs`);
  return true;
}
