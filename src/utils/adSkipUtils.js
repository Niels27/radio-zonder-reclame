// utils/adSkipUtils.js - Ad skipping functionality for Dutch radio streams
// Implements ad-free stream alternatives and pre-roll skip functionality

export class AdSkipUtils {

  // Known ad-free stream patterns (higher priority streams)
  static getAdFreeAlternatives(originalUrl, stationName) {
    const adFreeStreams = [];
    const stationKey = stationName?.toLowerCase().replace(/[^a-z0-9]/g, '');

    console.log(`🚫 Getting ad-free alternatives for: ${stationName} (${originalUrl})`);

    // 1. StreamTheWorld "SC" (Stream Control) versions - typically ad-free
    if (originalUrl.includes('streamtheworld.com')) {
      const stationMatch = originalUrl.match(/\/([A-Z0-9_]+)\.mp3/i);
      if (stationMatch) {
        const stationId = stationMatch[1];
        // SC (Stream Control) versions are usually ad-free
        adFreeStreams.push(
          `https://21223.live.streamtheworld.com/${stationId}_SC`,
          `https://22763.live.streamtheworld.com/${stationId}_SC`,
          `https://25243.live.streamtheworld.com/${stationId}_SC`
        );
      }
    }

    // 2. Triple-IT CDN streams - generally ad-free
    const tripleItStreams = this.getTripleItAlternatives(stationKey);
    adFreeStreams.push(...tripleItStreams);

    // 3. Direct radiocorp streams - often ad-free
    if (stationKey?.includes('slam') || originalUrl.includes('slam')) {
      adFreeStreams.push(
        'https://stream.slam.nl/slam',
        'https://stream.radiocorp.nl/web13_mp3', // SLAM main
        'https://stream.radiocorp.nl/web14_mp3'  // SLAM alternative
      );
    }
    // 4. Station-specific ad-free streams
    const stationSpecificStreams = this.getStationSpecificAdFree(stationKey);
    adFreeStreams.push(...stationSpecificStreams);

    // Remove duplicates and return
    const uniqueStreams = [...new Set(adFreeStreams)].filter(Boolean);

    console.log(`🚫 Found ${uniqueStreams.length} ad-free alternatives for ${stationName}:`, uniqueStreams);

    return uniqueStreams;
  }
  // Triple-IT CDN alternatives (known to be ad-free)
  static getTripleItAlternatives(stationKey) {
    const tripleItBase = 'https://icecast-qmusicnl-cdp.triple-it.nl/';
    const streams = [];

    const stationMappings = {
      'radio538': ['radio538_96.mp3', 'radio538_128.mp3'],
      '538': ['radio538_96.mp3', 'radio538_128.mp3'],
      'qmusic': ['qmusic_96.mp3', 'qmusic_128.mp3', 'Qmusic_nl_live_96.mp3'],
      'skyradio': ['skyradio_96.mp3', 'skyradio_128.mp3'],
      'sky': ['skyradio_96.mp3', 'skyradio_128.mp3'],
      'veronica': ['veronica_96.mp3', 'veronica_128.mp3'],
      'radioveronica': ['veronica_96.mp3', 'veronica_128.mp3'],
      'radio10': ['radio10_96.mp3', 'radio10_128.mp3'],
      '10': ['radio10_96.mp3', 'radio10_128.mp3'],
      'joe': ['Joe_nl_high.aac', 'joe_96.mp3'],
      '100nl': ['100pctnl_96.mp3', '100pctnl_128.mp3'],
      '100pctnl': ['100pctnl_96.mp3', '100pctnl_128.mp3'],
      'bnr': ['bnr_mp3_96.mp3', 'bnr_mp3_128.mp3'],
      'bnrnewsradio': ['bnr_mp3_96.mp3'],
      'sublime': ['sublime_96.mp3', 'sublime_128.mp3'],
      'kink': ['kink_96.mp3', 'kink_128.mp3'],
      'wildFM': ['wild_96.mp3', 'wild_128.mp3'],
      'wild': ['wild_96.mp3', 'wild_128.mp3']
    };

    if (stationKey && stationMappings[stationKey]) {
      stationMappings[stationKey].forEach(stream => {
        streams.push(tripleItBase + stream);
      });
    }

    return streams;
  }
  // Station-specific known ad-free streams
  static getStationSpecificAdFree(stationKey) {
    const adFreeStreams = {
      // NPO stations - public broadcasters (ad-free)
      'npo1': [
        'https://icecast.omroep.nl/radio1-bb-mp3',
        'https://icecast.omroep.nl/radio1-sb-mp3'
      ],
      'radio1': [
        'https://icecast.omroep.nl/radio1-bb-mp3',
        'https://icecast.omroep.nl/radio1-sb-mp3'
      ],
      'npo2': [
        'https://icecast.omroep.nl/radio2-bb-mp3',
        'https://icecast.omroep.nl/radio2-sb-mp3'
      ],
      'radio2': [
        'https://icecast.omroep.nl/radio2-bb-mp3',
        'https://icecast.omroep.nl/radio2-sb-mp3'
      ],
      'npo3fm': [
        'https://icecast.omroep.nl/3fm-bb-mp3',
        'https://icecast.omroep.nl/3fm-sb-mp3'
      ],
      '3fm': [
        'https://icecast.omroep.nl/3fm-bb-mp3',
        'https://icecast.omroep.nl/3fm-sb-mp3'
      ],

      // Commercial stations - ad-free CDN alternatives
      'radio538': [
        'https://21223.live.streamtheworld.com/RADIO538_SC',
        'https://22763.live.streamtheworld.com/RADIO538_SC',
        'https://icecast-qmusicnl-cdp.triple-it.nl/radio538_96.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/radio538_128.mp3'
      ],
      '538': [
        'https://21223.live.streamtheworld.com/RADIO538_SC',
        'https://22763.live.streamtheworld.com/RADIO538_SC',
        'https://icecast-qmusicnl-cdp.triple-it.nl/radio538_96.mp3'
      ],
      'qmusic': [
        'https://icecast-qmusicnl-cdp.triple-it.nl/qmusic_96.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/qmusic_128.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/Qmusic_nl_live_96.mp3',
        'https://25243.live.streamtheworld.com/QMUSICNL_SC'
      ],
      'skyradio': [
        'https://icecast-qmusicnl-cdp.triple-it.nl/skyradio_96.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/skyradio_128.mp3',
        'https://25243.live.streamtheworld.com/SKYRADIO_SC'
      ],
      'sky': [
        'https://icecast-qmusicnl-cdp.triple-it.nl/skyradio_96.mp3',
        'https://25243.live.streamtheworld.com/SKYRADIO_SC'
      ],
      'veronica': [
        'https://icecast-qmusicnl-cdp.triple-it.nl/veronica_96.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/veronica_128.mp3',
        'https://25243.live.streamtheworld.com/VERONICA_SC'
      ],
      'radioveronica': [
        'https://icecast-qmusicnl-cdp.triple-it.nl/veronica_96.mp3',
        'https://25243.live.streamtheworld.com/VERONICA_SC'
      ],
      'radio10': [
        'https://icecast-qmusicnl-cdp.triple-it.nl/radio10_96.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/radio10_128.mp3',
        'https://25243.live.streamtheworld.com/RADIO10_SC'
      ],
      '10': [
        'https://icecast-qmusicnl-cdp.triple-it.nl/radio10_96.mp3',
        'https://25243.live.streamtheworld.com/RADIO10_SC'
      ],
      'joe': [
        'https://icecast-qmusicnl-cdp.triple-it.nl/Joe_nl_high.aac',
        'https://icecast-qmusicnl-cdp.triple-it.nl/joe_96.mp3',
        'https://25243.live.streamtheworld.com/JOE_SC'
      ],
      'kink': [
        'https://25243.live.streamtheworld.com/KINK_SC',
        'https://22763.live.streamtheworld.com/KINK_SC',
        'https://kink.streamaudio.nl/kink_mp3'
      ],
      'slam': [
        'https://stream.slam.nl/slam',
        'https://stream.radiocorp.nl/web13_mp3',
        'https://stream.radiocorp.nl/web14_mp3',
        'https://25243.live.streamtheworld.com/SLAM_SC'
      ],
      'slamfm': [
        'https://stream.slam.nl/slam',
        'https://stream.radiocorp.nl/web13_mp3'
      ],
      '100nl': [
        'https://stream.100p.nl/100pctnl.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/100pctnl_96.mp3',
        'https://25243.live.streamtheworld.com/100NL_SC'
      ],
      '100pctnl': [
        'https://stream.100p.nl/100pctnl.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/100pctnl_96.mp3'
      ],

      // Additional Dutch stations
      'bnr': [
        'https://icecast-bnr-cdp.triple-it.nl/bnr_mp3_96.mp3',
        'https://icecast-bnr-cdp.triple-it.nl/bnr_mp3_128.mp3'
      ],
      'bnrnewsradio': [
        'https://icecast-bnr-cdp.triple-it.nl/bnr_mp3_96.mp3'
      ],
      'funx': [
        'https://icecast.omroep.nl/funx-bb-mp3',
        'https://icecast.omroep.nl/funx-sb-mp3'
      ],
      'arrow': [
        'https://25243.live.streamtheworld.com/ARROWCLASSICROCK_SC',
        'https://22763.live.streamtheworld.com/ARROWCLASSICROCK_SC'
      ],
      'arrowclassicrock': [
        'https://25243.live.streamtheworld.com/ARROWCLASSICROCK_SC'
      ],
      'golddigger': [
        'https://25243.live.streamtheworld.com/GOLDDIGGER_SC',
        'https://22763.live.streamtheworld.com/GOLDDIGGER_SC'
      ],
      'sublime': [
        'https://25243.live.streamtheworld.com/SUBLIME_SC',
        'https://22763.live.streamtheworld.com/SUBLIME_SC'
      ],
      'wild': [
        'https://25243.live.streamtheworld.com/WILDFM_SC',
        'https://22763.live.streamtheworld.com/WILDFM_SC'
      ],
      'wildfm': [
        'https://25243.live.streamtheworld.com/WILDFM_SC'
      ]
    };

    return adFreeStreams[stationKey] || [];
  }

  // Test if a stream likely has ads based on URL patterns
  static isLikelyToHaveAds(url) {
    const adPatterns = [
      'livestream-redirect',     // StreamTheWorld redirect often has ads
      'api/livestream',          // API endpoints often inject ads
      'playerservices',          // Player services usually have ads
      '/m3u',                    // M3U playlists can contain ad injection
      'redirect'                 // Any redirect service might inject ads
    ];

    return adPatterns.some(pattern => url.includes(pattern));
  }

  // Sort URLs by ad-free likelihood (higher score = more likely ad-free)
  static sortByAdFreeLikelihood(urls) {
    return urls.sort((a, b) => {
      const scoreA = this.getAdFreeScore(a);
      const scoreB = this.getAdFreeScore(b);
      return scoreB - scoreA; // Higher score first
    });
  }
  // Get ad-free likelihood score for a URL
  static getAdFreeScore(url) {
    let score = 0;

    // Higher scores for known ad-free patterns
    if (url.includes('_SC')) score += 50; // StreamTheWorld SC streams
    if (url.includes('triple-it.nl')) score += 45; // Triple-IT CDN
    if (url.includes('icecast.omroep.nl')) score += 40; // NPO direct streams
    if (url.includes('stream.slam.nl')) score += 35; // SLAM direct
    if (url.includes('stream.100p.nl')) score += 35; // 100% NL direct
    if (url.includes('kink.streamaudio.nl')) score += 35; // KINK direct CDN
    if (url.includes('stream.radiocorp.nl')) score += 30; // RadioCorp direct
    if (url.includes('.live.streamtheworld.com')) score += 30; // Direct StreamTheWorld
    if (url.includes('/stream')) score += 20; // Direct stream endpoints
    if (url.includes('_96.mp3') || url.includes('_128.mp3')) score += 15; // Quality-specific streams
    if (url.includes('-bb-mp3') || url.includes('-sb-mp3')) score += 15; // NPO quality streams
    if (url.includes('.aac')) score += 10; // AAC streams often direct

    // Additional ad-free indicators
    if (url.includes('icecast-')) score += 20; // Icecast servers
    if (url.includes('cdp.')) score += 15; // Content delivery platforms
    if (url.includes('high.aac')) score += 12; // High quality streams

    // Lower scores for likely ad-containing patterns
    if (url.includes('livestream-redirect')) score -= 30;
    if (url.includes('playerservices')) score -= 25;
    if (url.includes('api/livestream')) score -= 20;
    if (url.includes('/m3u')) score -= 15;
    if (url.includes('redirect')) score -= 10;
    if (url.includes('tunein')) score -= 10; // TuneIn often has ads

    return score;
  }

  // Create pre-roll skip functionality
  static createPrerollSkipButton(audioElement, onSkip) {
    const button = document.createElement('button');
    button.innerHTML = `
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 18l8.5-6L4 6v12zM13 6v12l8.5-6L13 6z"/>
      </svg>
      Pre-roll reclame overslaan
    `;
    button.className = 'preroll-skip-button px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-lg';
    button.style.cssText = `
      position: fixed;
      bottom: 140px;
      right: 20px;
      z-index: 1000;
      animation: fadeInSlide 0.3s ease-out;
    `;

    // Add CSS animation
    if (!document.getElementById('preroll-skip-styles')) {
      const styles = document.createElement('style');
      styles.id = 'preroll-skip-styles';
      styles.textContent = `
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeOutSlide {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100px); }
        }
        .preroll-skip-button.fade-out {
          animation: fadeOutSlide 0.3s ease-in forwards;
        }
      `;
      document.head.appendChild(styles);
    }

    button.addEventListener('click', () => {
      this.skipPreroll(audioElement, 15); // Skip 30 seconds
      onSkip?.();
      this.removePrerollSkipButton(button);
    });

    document.body.appendChild(button);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      this.removePrerollSkipButton(button);
    }, 6000);

    return button;
  }

  // Remove pre-roll skip button with animation
  static removePrerollSkipButton(button) {
    if (!button || !button.parentNode) return;

    button.classList.add('fade-out');
    setTimeout(() => {
      if (button.parentNode) {
        button.parentNode.removeChild(button);
      }
    }, 300);
  }

  // Skip pre-roll ads by seeking forward
  static skipPreroll(audioElement, seconds = 30) {
    if (!audioElement) return false;

    try {
      const currentTime = audioElement.currentTime || 0;
      const newTime = currentTime + seconds;

      console.log(`⏭️ Skipping ${seconds}s of pre-roll: ${currentTime}s → ${newTime}s`);

      // Check if we can seek to the new position
      if (audioElement.duration && newTime < audioElement.duration) {
        audioElement.currentTime = newTime;
        return true;
      } else if (!audioElement.duration) {
        // For live streams, just set the time and let it handle it
        audioElement.currentTime = newTime;
        return true;
      }

      return false;
    } catch (error) {
      console.warn('Could not skip pre-roll:', error);
      return false;
    }
  }

  // Enhanced stream sorting with ad-free priority
  static sortStreamsWithAdFreePriority(urls, stationName) {
    const adFreeAlternatives = this.getAdFreeAlternatives(urls[0], stationName);
    const allUrls = [...adFreeAlternatives, ...urls];

    // Remove duplicates while preserving order
    const uniqueUrls = [];
    const seen = new Set();

    for (const url of allUrls) {
      if (!seen.has(url)) {
        seen.add(url);
        uniqueUrls.push(url);
      }
    }

    // Sort by ad-free likelihood
    return this.sortByAdFreeLikelihood(uniqueUrls);
  }
  // Check if pre-roll skip should be offered
  static shouldOfferPrerollSkip(url, stationName) {
    // Don't offer skip for known ad-free streams
    if (this.getAdFreeScore(url) > 100) {
      console.log(`🚫 Not offering skip - high ad-free score (${this.getAdFreeScore(url)}) for:`, url);
      return false;
    }

    // Enhanced commercial station detection
    const commercialStations = [
      // Main commercial radio groups
      '538', 'radio538',
      'qmusic', 'q-music',
      'sky', 'skyradio', 'sky radio',
      'veronica', 'radioveronica', 'radio veronica',
      'radio10', '10', 'radio 10',
      'slam', 'slamfm', 'slam fm',
      'joe', 'joefm', 'joe fm',
      'kink', 'kinkfm', 'kink fm',
      '100nl', '100pctnl', '100%nl', '100% nl',

      // Talpa Network stations
      'arrow', 'arrowclassicrock', 'arrow classic rock',
      'golddigger', 'gold digger',
      'sublime', 'sublime fm',
      'wild', 'wildfm', 'wild fm',

      // Other commercial stations
      'bnr', 'bnrnewsradio', 'bnr newsradio'
    ];

    const stationLower = stationName?.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isCommercial = commercialStations.some(station =>
      stationLower?.includes(station.replace(/[^a-z0-9]/g, ''))
    );

    // Enhanced URL pattern detection for likely ad injection
    //const hasLikelyAds = this.isLikelyToHaveAds(url);
    const hasLikelyAds = true;

    const shouldOffer = isCommercial && hasLikelyAds;

    console.log(`🚫 Pre-roll skip decision for ${stationName}: commercial=${isCommercial}, hasAds=${hasLikelyAds}, offer=${shouldOffer}`);

    return shouldOffer;
  }
  // Test function to verify ad-free detection (for debugging)
  static testAdFreeDetection() {
    console.log('🧪 Testing ad-free stream detection...');

    const testStations = [
      { name: 'Radio 538', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO538.mp3' },
      { name: 'Q-music', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/QMUSICNL.mp3' },
      { name: 'Sky Radio', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SKYRADIO.mp3' },
      { name: 'NPO Radio 1', url: 'https://icecast.omroep.nl/radio1-bb-mp3' },
      { name: 'SLAM!', url: 'https://stream.slam.nl/slam' }
    ];

    testStations.forEach(station => {
      console.log(`\n🧪 Testing: ${station.name}`);
      console.log(`Original URL: ${station.url}`);
      console.log(`Ad-free score: ${this.getAdFreeScore(station.url)}`);
      console.log(`Should offer pre-roll skip: ${this.shouldOfferPrerollSkip(station.url, station.name)}`);

      const alternatives = this.getAdFreeAlternatives(station.url, station.name);
      console.log(`Found ${alternatives.length} alternatives`);

      if (alternatives.length > 0) {
        const sorted = this.sortByAdFreeLikelihood([station.url, ...alternatives]);
        console.log('Sorted by ad-free likelihood:', sorted.map(url => `${url} (score: ${this.getAdFreeScore(url)})`));
      }
    });
  }
}
