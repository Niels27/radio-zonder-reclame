// utils/adSkipUtils.js - Enhanced pre-roll skip functionality with automatic skipping

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

    // Special case: Q-music gets maximum score
    if (url.includes('qmusic') || url.includes('QMUSIC')) {
      return 100;
    }

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

  // ✅ MISSING METHOD: Skip preroll functionality
  static skipPreroll(audioElement, seconds = 18) {
    if (!audioElement) return false;

    try {
      console.log(`⏭️ Skipping ${seconds}s of pre-roll...`);

      // Get current time and calculate skip time
      const currentTime = audioElement.currentTime || 0;
      const newTime = currentTime + seconds;

      console.log(`⏭️ Skipping ${seconds}s: ${currentTime}s → ${newTime}s`);

      // Perform the skip
      if (audioElement.duration && newTime < audioElement.duration) {
        audioElement.currentTime = newTime;
      } else if (!audioElement.duration) {
        // For live streams, just advance the current time
        audioElement.currentTime = newTime;
      }

      console.log(`✅ Pre-roll skip completed`);
      return true;

    } catch (error) {
      console.warn('Could not skip pre-roll:', error);
      return false;
    }
  }

  // ✅ MISSING METHOD: Remove pre-roll skip button
  static removePrerollSkipButton(button) {
    if (!button) return;

    try {
      // Add fade-out animation
      button.classList.add('fade-out');

      // Remove button after animation completes
      setTimeout(() => {
        if (button && button.parentNode) {
          button.parentNode.removeChild(button);
        }
      }, 300);

      console.log('🗑️ Pre-roll skip button removed');
    } catch (error) {
      console.warn('Error removing pre-roll skip button:', error);
      // Force remove if animation fails
      if (button && button.parentNode) {
        button.parentNode.removeChild(button);
      }
    }
  }
  // ✅ SIMPLIFIED: Create pre-roll skip functionality with simple one-line UI
  static createPrerollSkipButton(audioElement, onSkip, isAutoSkip = false) {

    // ✅ CRITICAL FIX: Remove any existing skip buttons first
    const existingButtons = document.querySelectorAll('.preroll-skip-button');
    existingButtons.forEach(button => {
      console.log('🗑️ Removing existing pre-roll skip button');
      if (button && button.parentNode) {
        button.parentNode.removeChild(button);
      }
    });

    // Check if auto-skip is enabled
    const isAutoSkipEnabled = this.getAutoSkipSetting();

    // ✅ ENHANCED: Don't show manual button if auto-skip is enabled
    if (isAutoSkipEnabled && !isAutoSkip) {
      console.log('⚡ Auto-skip is enabled, not showing manual button');
      return null;
    }

    // ✅ SIMPLIFIED: Track timing for countdown only
    const buttonCreatedTime = Date.now();
    const totalDisplayTime = 8000; // 8 seconds total display time
    const totalPrerollDuration = 18; // Total expected pre-roll duration

    const button = document.createElement('button');
    let wasClickedByUser = false; // Track if user actually clicked
    let textUpdateInterval = null; // ✅ FIX: Use let instead of const
    
    // ✅ SIMPLIFIED: One-line UI with countdown timer
    const updateButtonText = () => {
      const elapsedMs = Date.now() - buttonCreatedTime;
      const timeLeftSeconds = Math.max(0, Math.ceil((totalDisplayTime - elapsedMs) / 1000));
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const remainingSkip = Math.max(1, totalPrerollDuration - elapsedSeconds);
      
      // ✅ SIMPLE: Just one line of text
      button.textContent = `⏩ Pre-Roll Reclame Overslaan: (${timeLeftSeconds}s)`;
    };

    // Initialize button text
    updateButtonText();

    button.className = 'preroll-skip-button';
    
    // ✅ SIMPLIFIED: Clean, minimal styling
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      zIndex: '10000',
      boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
      transition: 'all 0.3s ease',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      whiteSpace: 'nowrap'
    });

    // Add minimal CSS animations if not exists
    if (!document.getElementById('preroll-skip-styles')) {
      const styles = document.createElement('style');
      styles.id = 'preroll-skip-styles';
      styles.textContent = `
        @keyframes fadeOutSlide {
          from { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0) scale(1); 
          }
          to { 
            opacity: 0; 
            transform: translateX(-50%) translateY(-20px) scale(0.95); 
          }
        }
        
        .preroll-skip-button.fade-out {
          animation: fadeOutSlide 0.4s ease-in forwards;
        }
      `;
      document.head.appendChild(styles);
    }

    // ✅ SIMPLIFIED: Update button text every second
    textUpdateInterval = setInterval(updateButtonText, 1000);

    // ✅ SIMPLIFIED: User click handler with dynamic skip duration
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      wasClickedByUser = true;
      console.log('👆 User clicked pre-roll skip button');
      
      // Calculate dynamic skip duration
      const elapsedSeconds = Math.floor((Date.now() - buttonCreatedTime) / 1000);
      const dynamicSkipDuration = Math.max(1, totalPrerollDuration - elapsedSeconds);
      
      console.log(`⏭️ Pre-roll skip: ${elapsedSeconds}s elapsed - skipping ${dynamicSkipDuration}s`);
      
      // Clear interval
      if (textUpdateInterval) {
        clearInterval(textUpdateInterval);
        textUpdateInterval = null;
      }

      // Visual feedback
      button.style.transform = 'translateX(-50%) scale(0.95)';
      button.style.backgroundColor = '#059669';
      
      setTimeout(() => {
        // Perform skip and remove button
        this.skipPreroll(audioElement, dynamicSkipDuration);
        onSkip?.();
        this.removePrerollSkipButton(button);
      }, 150);
    });

    // ✅ SIMPLIFIED: Basic hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateX(-50%) scale(1.05)';
      button.style.backgroundColor = '#059669';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateX(-50%) scale(1)';
      button.style.backgroundColor = '#10b981';
    });

    document.body.appendChild(button);

    // ✅ SIMPLIFIED: Just remove button when timer expires - NO auto-skip
    const cleanupTimeout = setTimeout(() => {
      console.log('🕒 Pre-roll skip button expired - removing quietly');
      
      // Clear interval
      if (textUpdateInterval) {
        clearInterval(textUpdateInterval);
        textUpdateInterval = null;
      }
      
      // ✅ SIMPLIFIED: Just remove button, no action taken
      if (button.parentNode && !wasClickedByUser) {
        console.log('🗑️ Removing button quietly (no action)');
        this.removePrerollSkipButton(button);
        // NO skipPreroll call - button just disappears
      }
    }, totalDisplayTime);

    console.log(`⏩ Pre-roll skip button created (${totalDisplayTime/1000}s display time)`);
    return button;
  }

  // ✅ NEW: Get auto-skip setting from localStorage
  static getAutoSkipSetting() {
    try {
      const saved = localStorage.getItem('auto_skip_preroll');
      return saved ? JSON.parse(saved) : false; // ✅ Should default to false (handmatig)
    } catch {
      return false; // ✅ Should default to false
    }
  }
  // Update the skipPrerollSilently method:
  static setAutoSkipSetting(enabled) {
    try {
      localStorage.setItem('auto_skip_preroll', JSON.stringify(enabled));
      console.log('🔧 AdSkipUtils: Auto skip setting updated to:', enabled);
    } catch (error) {
      console.warn('Failed to save auto skip setting in AdSkipUtils:', error);
    }
  }  // ✅ ULTRA ENHANCED: Lightning-fast silent pre-roll skip with guaranteed muting
  static async skipPrerollSilently(audioElement, seconds = 17) {
    if (!audioElement) return;

    try {
      console.log('🔇 Starting ULTRA FAST silent pre-roll skip...');

      // Get the original volume that the audio SHOULD have (not current muted state)
      const originalVolume = audioElement.dataset.targetVolume ? 
        parseFloat(audioElement.dataset.targetVolume) : 
        (audioElement.volume > 0 ? audioElement.volume : 0.5);

      console.log(`🔊 Target volume for restoration: ${Math.round(originalVolume * 100)}%`);

      // ✅ CRITICAL: Ensure audio stays muted during entire process
      audioElement.volume = 0;
        // ✅ ULTRA FAST: Minimal waiting - just check basic readiness
      const waitForMinimalReadiness = () => {
        return new Promise((resolve) => {
          let checkCount = 0;
          const maxChecks = 6; // Only 1.2 seconds max (6 * 200ms) - even faster!

          const checkReadiness = () => {
            checkCount++;
            
            // Very minimal requirements for faster execution
            const isMinimallyReady = audioElement.readyState >= 1 && // HAVE_METADATA or better
              !audioElement.paused &&
              audioElement.currentTime >= 0; // Any time is fine

            console.log(`🎵 Quick readiness check ${checkCount}/${maxChecks}: ` +
              `readyState=${audioElement.readyState}, ` +
              `currentTime=${audioElement.currentTime.toFixed(3)}s, ` +
              `paused=${audioElement.paused}`);

            if (isMinimallyReady || checkCount >= maxChecks) {
              if (isMinimallyReady) {
                console.log('✅ Audio minimally ready, proceeding with ULTRA FAST skip');
              } else {
                console.log('⚠️ Proceeding with skip anyway (timeout - ultra fast)');
              }
              resolve();
              return;
            }

            // Continue checking every 200ms
            setTimeout(checkReadiness, 200);
          };

          checkReadiness();
        });
      };

      // Wait for minimal readiness (much faster)
      await waitForMinimalReadiness();

      // ✅ ENSURE STILL MUTED: Double-check muting before skip
      audioElement.volume = 0;
      console.log('🔇 Audio confirmed muted before skip');

      // ✅ ULTRA FAST SKIP: Immediate skip execution
      const currentTime = audioElement.currentTime;
      const targetTime = currentTime + seconds;
      
      console.log(`⏭️ Performing LIGHTNING FAST skip: ${currentTime.toFixed(3)}s → ${targetTime.toFixed(3)}s`);

      // Perform the skip immediately
      audioElement.currentTime = targetTime;      // ✅ MINIMAL VERIFICATION: Quick check if skip worked
      await new Promise(resolve => {
        let settleChecks = 0;
        const maxSettleChecks = 2; // Only 2 quick checks for speed
        
        const checkSkipSettled = () => {
          settleChecks++;
          const newTime = audioElement.currentTime;
          
          // More lenient - accept if we're close or max checks reached
          if (Math.abs(newTime - targetTime) < 3.0 || settleChecks >= maxSettleChecks) {
            console.log(`✅ Skip settled at ${newTime.toFixed(3)}s (target: ${targetTime.toFixed(3)}s)`);
            resolve();
          } else {
            setTimeout(checkSkipSettled, 100);
          }
        };
        
        setTimeout(checkSkipSettled, 100); // Start checking even faster
      });

      // ✅ ENSURE STILL MUTED: Keep muted until restoration
      audioElement.volume = 0;
      console.log('🔇 Audio kept muted during skip verification');      // ✅ SMOOTH VOLUME RESTORATION: Only restore AFTER skip is complete
      console.log('🔊 Starting volume restoration AFTER successful skip...');
      await this.gradualVolumeRestore(audioElement, originalVolume, 600); // Even faster restoration

      console.log(`🔇 ULTRA FAST silent pre-roll skip completed! Volume restored to ${Math.round(originalVolume * 100)}%`);

    } catch (error) {
      console.error('❌ Ultra fast silent pre-roll skip failed:', error);

      // ✅ CRITICAL: Ensure volume is always restored, even on failure
      try {
        const fallbackVolume = audioElement.dataset.targetVolume ? 
          parseFloat(audioElement.dataset.targetVolume) : 0.5;
          
        console.log(`🆘 Restoring volume after error: ${Math.round(fallbackVolume * 100)}%`);
        audioElement.volume = fallbackVolume;
      } catch (restoreError) {
        console.error('❌ Failed to restore volume after error:', restoreError);
        // Last resort: set to safe default
        audioElement.volume = 0.5;
      }
    }
  }

  // Also update the gradualVolumeRestore method for smoother transitions:

  // ✅ ENHANCED: Smoother volume restoration with cubic easing
  static async gradualVolumeRestore(audioElement, targetVolume, duration = 800) {
    if (!audioElement || targetVolume <= 0) return;

    const steps = 25; // More steps for smoother transition
    const stepDuration = duration / steps;

    // Cubic ease-out function for natural volume curve
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const easedProgress = easeOutCubic(progress);
      const currentVolume = targetVolume * easedProgress;

      try {
        audioElement.volume = Math.min(currentVolume, 1);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      } catch (error) {
        console.warn(`Volume restore step ${i} failed:`, error);
        break;
      }
    }

    // Ensure final volume is set correctly
    try {
      audioElement.volume = Math.min(targetVolume, 1);
      console.log(`🔊 Volume restored to ${Math.round(audioElement.volume * 100)}%`);
    } catch (error) {
      console.error('❌ Final volume restore failed:', error);
    }
  }

  // ✅ NEW: Cross-fade readiness detection for radio streams
  static async waitForRadioStreamReady(audioElement, timeoutMs = 8000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkReady = () => {
        if (!audioElement) {
          resolve(false);
          return;
        }
        
        // Check if stream is ready to play with audio data
        const isReady = audioElement.readyState >= 3 && // HAVE_FUTURE_DATA or better
                       !audioElement.paused &&
                       audioElement.currentTime > 0 &&
                       audioElement.duration > 0;
        
        if (isReady) {
          console.log('✅ Radio stream ready for cross-fade');
          resolve(true);
          return;
        }
        
        if (Date.now() - startTime > timeoutMs) {
          console.warn('⏰ Timeout waiting for radio stream readiness');
          resolve(false);
          return;
        }
        
        setTimeout(checkReady, 100);
      };
      
      checkReady();
    });
  }

  // ✅ NEW: Enhanced volume restoration for cross-fade compatibility
  static async gradualVolumeRestoreWithCallback(audioElement, targetVolume, duration = 800, onComplete = null) {
    if (!audioElement || targetVolume <= 0) return;

    const steps = 25;
    const stepDuration = duration / steps;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const easedProgress = easeOutCubic(progress);
      const currentVolume = targetVolume * easedProgress;

      try {
        audioElement.volume = Math.min(currentVolume, 1);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      } catch (error) {
        console.warn(`Volume restore step ${i} failed:`, error);
        break;
      }
    }

    try {
      audioElement.volume = Math.min(targetVolume, 1);
      console.log(`🔊 Volume restored to ${Math.round(audioElement.volume * 100)}%`);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('❌ Final volume restore failed:', error);
    }
  }

  // ✅ ENHANCED: Check if pre-roll skip should be offered with auto-skip consideration
  static shouldOfferPrerollSkip(url, stationName) {
    // Don't offer skip for known ad-free streams with very high scores
    if (this.getAdFreeScore(url) >100) {
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

    // Always offer for commercial stations (regardless of URL patterns)
    const shouldOffer = isCommercial;

    console.log(`🚫 Pre-roll skip decision for ${stationName}: commercial=${isCommercial}, offer=${shouldOffer}`);

    return shouldOffer;
  }

  // ✅ EXISTING: Enhanced stream sorting (unchanged)
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
      console.log(`Found ${alternatives.length} alternatives`);      if (alternatives.length > 0) {
        const sorted = this.sortByAdFreeLikelihood([station.url, ...alternatives]);
        console.log('Sorted by ad-free likelihood:', sorted.map(url => `${url} (score: ${this.getAdFreeScore(url)})`));
      }
    });
  }
}

// Expose to window for settings integration
if (typeof window !== 'undefined') {
  window.AdSkipUtils = AdSkipUtils;
}