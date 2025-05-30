// utils/streamProxy.js - Much faster with parallel testing and user feedback
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\utils\streamProxy.js
export class StreamProxy {
  static corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://corsproxy.io/?',
    'https://cors-proxy.htmldriven.com/?url=',
  ];

  static async findWorkingStream(originalUrl, onProgress = null) {
    console.log(`🔍 Finding working stream for: ${originalUrl}`);
    
    // First try the original URL quickly
    try {
      onProgress?.(`Testing original stream...`);
      const works = await this.testStreamUrl(originalUrl, 1500); // Very short timeout
      if (works) {
        console.log(`✅ Original URL works: ${originalUrl}`);
        return originalUrl;
      }
    } catch (error) {
      console.log(`❌ Original stream blocked by CORS or failed`);
    }

    // Get all alternative URLs
    const alternatives = this.generateAlternativeUrls(originalUrl);
    
    if (alternatives.length > 0) {
      onProgress?.(`Trying ${alternatives.length} alternative streams...`);
      
      // Test alternatives in parallel with short timeout
      const alternativeTests = alternatives.map(async (url, index) => {
        try {
          await this.testStreamUrl(url, 2000); // Short timeout for alternatives
          return { url, index, success: true };
        } catch (error) {
          return { url, index, success: false, error: error.message };
        }
      });

      // Wait for first successful alternative or all to fail
      try {
        const results = await Promise.allSettled(alternativeTests);
        const successful = results
          .filter(result => result.status === 'fulfilled' && result.value.success)
          .map(result => result.value);

        if (successful.length > 0) {
          // Sort by original index to prefer earlier alternatives
          successful.sort((a, b) => a.index - b.index);
          const winner = successful[0];
          console.log(`✅ Alternative URL works: ${winner.url}`);
          return winner.url;
        }
      } catch (error) {
        console.log(`❌ All alternatives failed`);
      }
    }

    // Try CORS proxies in parallel
    onProgress?.(`Trying CORS proxies...`);
    
    const proxyTests = this.corsProxies.map(async (proxy, index) => {
      try {
        const proxiedUrl = proxy + encodeURIComponent(originalUrl);
        await this.testStreamUrl(proxiedUrl, 3000); // Slightly longer for proxies
        return { proxy, proxiedUrl, index, success: true };
      } catch (error) {
        return { proxy, proxiedUrl: proxy + encodeURIComponent(originalUrl), index, success: false, error: error.message };
      }
    });

    try {
      const proxyResults = await Promise.allSettled(proxyTests);
      const successfulProxy = proxyResults
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => result.value);

      if (successfulProxy.length > 0) {
        // Sort by original index to prefer better proxies
        successfulProxy.sort((a, b) => a.index - b.index);
        const winner = successfulProxy[0];
        console.log(`✅ CORS proxy works: ${winner.proxiedUrl}`);
        return winner.proxiedUrl;
      }
    } catch (error) {
      console.log(`❌ All CORS proxies failed`);
    }

    // If all else fails, return original URL (user might have CORS extension)
    onProgress?.(`No working streams found, using original...`);
    console.log(`⚠️ No working stream found, returning original: ${originalUrl}`);
    return originalUrl;
  }

  static generateAlternativeUrls(originalUrl) {
    const alternatives = [];
    
    // For SLAM radio specifically - use known working URLs first
    if (originalUrl.includes('slam.nl')) {
      alternatives.push(
         // From your data - these might work better
        'http://streaming.slam.nl/slam_aac',
        'https://22673.live.streamtheworld.com/WEB14_MP3_SC',
        'http://streaming.slam.nl/web11_aac',
        'http://stream.radiocorp.nl/web13_mp3',
        'http://stream.radiocorp.nl/web10_mp3',
        'http://stream.slam.nl/WEB16_MP3',
        'http://stream.slam.nl/WEB09_MP3',

        // Then the previous ones as fallback
        'https://22393.live.streamtheworld.com/SLAM.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/slam_96.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/slam_128.mp3'
      );
    }
    
    // For Radio 538
    if (originalUrl.includes('538')) {
      alternatives.push(
        'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO538.mp3',
        'https://22763.live.streamtheworld.com/RADIO538.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/radio538_96.mp3'
      );
    }
    
    // For Sky Radio
    if (originalUrl.includes('skyradio')) {
      alternatives.push(
        'https://playerservices.streamtheworld.com/api/livestream-redirect/SKYRADIO.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/skyradio_96.mp3'
      );
    }
    
    // For Q-music
    if (originalUrl.includes('qmusic')) {
      alternatives.push(
        'https://playerservices.streamtheworld.com/api/livestream-redirect/QMUSICNL.mp3',
        'https://icecast-qmusicnl-cdp.triple-it.nl/qmusic_96.mp3'
      );
    }

    // Try HTTPS if HTTP (quick fix)
    if (originalUrl.startsWith('http://')) {
      alternatives.push(originalUrl.replace('http://', 'https://'));
    }
    
    return [...new Set(alternatives)]; // Remove duplicates
  }

  static testStreamUrl(url, timeout = 8000) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const timeoutId = setTimeout(() => {
        audio.src = '';
        reject(new Error('Stream test timeout'));
      }, timeout);
      
      const cleanup = () => {
        clearTimeout(timeoutId);
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('error', onError);
      };
      
      const onCanPlay = () => {
        cleanup();
        resolve(url);
      };
      
      const onError = (e) => {
        cleanup();
        reject(new Error(`Stream test failed: ${e.message || 'Unknown error'}`));
      };
      
      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('error', onError);
      audio.src = url;
      audio.load();
    });
  }
}