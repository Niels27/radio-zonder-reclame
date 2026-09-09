// utils/streamProxy.js - Much faster with parallel testing and user feedback
import { getStationDefinition } from '../data/fallbackStations.js';

export class StreamProxy {
  // Smarter alternatives generation - avoid redundant URLs
  static getCORSFriendlyAlternatives(originalUrl, stationName = null) {
    const alternatives = [];
    
    // 1. Handle SLAM player URLs specifically
    if (originalUrl.includes('player.slam.nl') || originalUrl.includes('stream=web')) {
      const streamMatch = originalUrl.match(/stream=([^&]+)/);
      if (streamMatch) {
        const streamId = streamMatch[1]; // e.g., "web13"
        alternatives.push(
          `http://stream.radiocorp.nl/${streamId}_mp3`,
          `https://stream.radiocorp.nl/${streamId}_mp3`,
          `http://stream.radiocorp.nl/${streamId}`,
          `https://stream.radiocorp.nl/${streamId}`
        );
      }
      return alternatives;
    }
    
    // 2. Extract station identifier from URL patterns
    let stationId = null;
    
    // Pattern: stream.STATION.nl/STATION or stream.radiocorp.nl/web13_mp3
    const streamPattern = /stream\.([^.]+)\.nl\/([^\/]+)/i;
    const streamMatch = originalUrl.match(streamPattern);
    if (streamMatch) {
      const domain = streamMatch[1].toLowerCase();
      const path = streamMatch[2].toLowerCase();
      
      // For radiocorp URLs, use the path as station ID
      if (domain === 'radiocorp') {
        stationId = path.replace('_mp3', '').replace('_aac', '');
      } else {
        stationId = domain;
      }
    }
    
    // Pattern: playerservices.streamtheworld.com/api/livestream-redirect/STATION.mp3
    const streamWorldPattern = /livestream-redirect\/([^.]+)\.([^?]+)/i;
    const streamWorldMatch = originalUrl.match(streamWorldPattern);
    if (streamWorldMatch) {
      stationId = streamWorldMatch[1].toLowerCase();
    }
    
    // 3. Generate smart alternatives (limit to avoid redundancy)
    if (stationId) {
      console.log(`🔍 Detected station ID: ${stationId}, generating targeted alternatives...`);
      
      // For SLAM/radiocorp streams, use specific known working patterns
      if (stationId.includes('web') || originalUrl.includes('radiocorp')) {
        alternatives.push(
          // Try with CORS proxy first for radiocorp streams
          `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`
        );
        return alternatives;
      }
      
      // Triple-IT CDN (most reliable)
      alternatives.push(
        `https://icecast-qmusicnl-cdp.triple-it.nl/${stationId}_96.mp3`,
        `https://icecast-qmusicnl-cdp.triple-it.nl/${stationId}_128.mp3`
      );
      
      // StreamTheWorld alternatives (only try 2-3 most reliable nodes)
      const reliableNodes = ['22063', '22763', '29033'];
      reliableNodes.forEach(node => {
        alternatives.push(`https://${node}.live.streamtheworld.com/${stationId.toUpperCase()}.mp3`);
      });
      
      // Limit to maximum 8 alternatives to avoid spam
      return alternatives.slice(0, 8);
    }
    
    return alternatives;
  }

  static async followRedirects(url) {
    console.log(`🔄 Following redirects for: ${url}`);
    
    // Skip redirect following for known problematic patterns
    const problematicPatterns = [
      'stream.slam.nl',
      'stream.joe.nl', 
      'playerservices.streamtheworld.com',
      'livestream-redirect'
    ];
    
    if (problematicPatterns.some(pattern => url.includes(pattern))) {
      console.log(`⚠️ Skipping redirect for known problematic URL pattern`);
      return url;
    }
    
    // Try simple redirect following for other URLs
    try {
      const response = await fetch(url, { 
        method: 'HEAD', 
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (response.url && response.url !== url) {
        console.log(`🔄 Redirect found: ${url} → ${response.url}`);
        return response.url;
      }
      return url;
    } catch (error) {
      console.log(`❌ Redirect following failed: ${error.message}`);
      return url;
    }
  }

  static async testStreamUrl(url, timeout = 6000, cancellationToken = null) {
    return new Promise((resolve, reject) => {
      // Check for cancellation before starting
      if (cancellationToken?.cancel) {
        reject(new Error('Connection canceled'));
        return;
      }
      
      const audio = new Audio();

      const timeoutId = setTimeout(() => {
        audio.removeEventListener('canplay', resolve);
        audio.removeEventListener('error', reject);
        audio.src = '';
        reject(new Error('Stream test timeout'));
      }, timeout);
      
      // Check for cancellation periodically
      const cancellationCheck = setInterval(() => {
        if (cancellationToken?.cancel) {
          clearTimeout(timeoutId);
          clearInterval(cancellationCheck);
          audio.removeEventListener('canplay', resolve);
          audio.removeEventListener('error', reject);
          audio.src = '';
          reject(new Error('Connection canceled'));
        }
      }, 100);
      
      audio.addEventListener('canplay', () => {
        clearTimeout(timeoutId);
        clearInterval(cancellationCheck);
        audio.src = '';
        resolve();
      }, { once: true });
      
      audio.addEventListener('error', (e) => {
        clearTimeout(timeoutId);
        clearInterval(cancellationCheck);
        audio.src = '';
        const error = e.target.error;
        reject(new Error(error ? `Media error: ${error.code}` : 'Unknown error'));
      }, { once: true });
      
      audio.src = url;
    });
  }
  static async findWorkingStream(originalUrl, onProgress = null, stationName = null, cancellationToken = null, enableAdFreePriority = false) {
    console.log(`🔍 Finding working stream for: ${originalUrl}${stationName ? ` (${stationName})` : ''}`);
    
    // Check for cancellation at start
    if (cancellationToken?.cancel) {
      throw new Error('Connection canceled');
    }

    // NEW: Apply ad-free stream prioritization if enabled
    if (enableAdFreePriority && stationName) {
      console.log(`🚫 Ad-free prioritization enabled for: ${stationName}`);
      
      // Import AdSkipUtils dynamically to avoid circular dependency
      const { AdSkipUtils } = await import('./adSkipUtils.js');
      
      // Get ad-free alternatives with original URL included
      const adFreeUrls = AdSkipUtils.getAdFreeAlternatives(originalUrl, stationName);
      
      if (adFreeUrls.length > 0) {
        console.log(`🚫 Found ${adFreeUrls.length} ad-free alternatives, testing them first...`);
        onProgress?.(`Testing ${adFreeUrls.length} ad-free streams...`);
        
        for (let i = 0; i < adFreeUrls.length; i++) {
          if (cancellationToken?.cancel) {
            throw new Error('Connection canceled');
          }
          
          const adFreeUrl = adFreeUrls[i];
          
          try {
            console.log(`🚫 Testing ad-free URL ${i + 1}: ${adFreeUrl}`);
            await this.testStreamUrl(adFreeUrl, 4000, cancellationToken);
            console.log(`✅ Ad-free URL works: ${adFreeUrl}`);
            return adFreeUrl;
          } catch (error) {
            if (error.message === 'Connection canceled') {
              throw error;
            }
            console.log(`❌ Ad-free URL ${i + 1} failed: ${adFreeUrl} (${error.message})`);
          }
        }
        
        console.log(`⚠️ All ad-free alternatives failed, falling back to standard search...`);
      }
    }
    
    // 1. FIRST: Try station definitions if available
    if (stationName) {
      const stationDef = getStationDefinition(stationName);
      if (stationDef && stationDef.urls && stationDef.urls.length > 0) {
        console.log(`📋 Found ${stationDef.urls.length} URLs in station definition for ${stationName}`);
        onProgress?.(`Trying ${stationDef.urls.length} optimized URLs...`);
        
        for (let i = 0; i < stationDef.urls.length; i++) {
          if (cancellationToken?.cancel) {
            throw new Error('Connection canceled');
          }
          
          const fallbackUrl = stationDef.urls[i];
          
          if (fallbackUrl === originalUrl) {
            console.log(`⏭️ Skipping duplicate URL: ${fallbackUrl}`);
            continue;
          }
          
          try {
            console.log(`🔄 Testing station definition URL ${i + 1}: ${fallbackUrl}`);
            await this.testStreamUrl(fallbackUrl, 4000, cancellationToken);
            console.log(`✅ Station definition URL works: ${fallbackUrl}`);
            return fallbackUrl;
          } catch (error) {
            if (error.message === 'Connection canceled') {
              throw error;
            }
            console.log(`❌ Station definition URL ${i + 1} failed: ${fallbackUrl} (${error.message})`);
          }
        }
      }
    }
    
    // 2. SECOND: Generate smart alternatives (limited set)
    const alternatives = this.getCORSFriendlyAlternatives(originalUrl, stationName);
    if (alternatives.length > 0) {
      console.log(`🎯 Generated ${alternatives.length} targeted alternatives`);
      onProgress?.(`Trying ${alternatives.length} alternatives...`);
      
      for (let i = 0; i < alternatives.length; i++) {
        if (cancellationToken?.cancel) {
          throw new Error('Connection canceled');
        }
        
        const altUrl = alternatives[i];
        
        if (altUrl === originalUrl) continue;
        
        try {
          console.log(`🔄 Testing alternative ${i + 1}: ${altUrl}`);
          await this.testStreamUrl(altUrl, 4000, cancellationToken);
          console.log(`✅ Alternative works: ${altUrl}`);
          return altUrl;
        } catch (error) {
          if (error.message === 'Connection canceled') {
            throw error;
          }
          console.log(`❌ Alternative ${i + 1} failed: ${altUrl} (${error.message})`);
        }
      }
    }
    
    // 3. THIRD: Try original URL
    if (cancellationToken?.cancel) {
      throw new Error('Connection canceled');
    }
    
    try {
      onProgress?.(`Testing original URL...`);
      console.log(`🔄 Testing original URL: ${originalUrl}`);
      await this.testStreamUrl(originalUrl, 4000, cancellationToken);
      console.log(`✅ Original URL works: ${originalUrl}`);
      return originalUrl;
    } catch (error) {
      if (error.message === 'Connection canceled') {
        throw error;
      }
      console.log(`❌ Original URL failed: ${originalUrl} (${error.message})`);
    }
    
    throw new Error(`All stream URLs failed for ${stationName || 'station'} - may be offline or have CORS restrictions`);
  }
}
