// Radio Stream Testing Utility - Smart testing with CSV skip logic and fallback-first strategy

import { getAllRadioStations } from '../data/allRadioStations.js';
import { getStationDefinition, updateStationDefinition } from '../data/fallbackStations.js';

export class RadioStreamTester {
  constructor() {
    this.results = {
      tested: 0,
      skipped: 0,
      working: [],
      failed: [],
      timeout: [],
      unknown: [],
      recovered: [],
      startTime: null,
      endTime: null
    };
    this.isRunning = false;
    this.currentTest = null;
    this.aborted = false;
    this.csvSkipData = new Map(); // Cache for CSV results
    
    // CORS proxies for fallback testing
    this.corsProxies = [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://thingproxy.freeboard.io/fetch/'
    ];
  }

  // ✅ ENHANCED: Auto-detect and load newest CSV file from project directory
  async loadExistingTestResults() {
    try {
      console.log('📄 Auto-detecting CSV test results from project directory...');
      
      // ✅ NEW: Try to load the specific CSV file you mentioned
      const knownCsvPath = '../radio_stream_test_results_2025-06-08T17-46-08.csv';
      
      try {
        const response = await fetch(knownCsvPath);
        if (response.ok) {
          const csvContent = await response.text();
          console.log('📄 Successfully loaded CSV from project directory!');
          this.parseCsvResults(csvContent);
          return;
        }
      } catch (fetchError) {
        console.log('📄 Could not fetch CSV from project directory, trying alternative methods...');
      }

      // ✅ FALLBACK: Check localStorage for cached CSV data
      const csvData = localStorage.getItem('latest_csv_test_results');
      
      if (csvData) {
        console.log('📄 Found cached CSV data, parsing...');
        this.parseCsvResults(csvData);
        return;
      }

      // ✅ NEW: Try to auto-detect CSV files by checking common patterns
      const csvPatterns = [
        '../radio_stream_test_results_2025-06-08T17-46-08.csv',
        './radio_stream_test_results_2025-06-08T17-46-08.csv',
        '/radio_stream_test_results_2025-06-08T17-46-08.csv',
        'radio_stream_test_results_2025-06-08T17-46-08.csv'
      ];

      for (const pattern of csvPatterns) {
        try {
          const response = await fetch(pattern);
          if (response.ok) {
            const csvContent = await response.text();
            console.log(`📄 Successfully loaded CSV from: ${pattern}`);
            this.parseCsvResults(csvContent);
            
            // Cache it for future use
            localStorage.setItem('latest_csv_test_results', csvContent);
            return;
          }
        } catch (error) {
          // Continue to next pattern
        }
      }

      console.log('📄 No existing CSV results found. All stations will be tested.');
      console.log('💡 To enable smart skipping, place your CSV file in the project root or cache it manually');
      
    } catch (error) {
      console.warn('⚠️ Failed to auto-load CSV results:', error);
      console.log('📄 Proceeding with full test...');
    }
  }

  // ✅ ENHANCED: Parse CSV results with better error handling
  parseCsvResults(csvContent) {
    try {
      const lines = csvContent.split('\n');
      
      if (lines.length < 2) {
        console.warn('⚠️ CSV file appears to be empty or malformed');
        return;
      }

      const header = lines[0];
      console.log(`📄 CSV header: ${header}`);
      
      // Skip header and empty lines
      const dataLines = lines.slice(1).filter(line => line.trim() && !line.startsWith('//'));
      
      let skippableCount = 0;
      let totalProcessed = 0;
      
      dataLines.forEach((line, index) => {
        try {
          totalProcessed++;
          
          // Handle CSV parsing with proper quote handling
          const parts = this.parseCSVLine(line);
          
          if (parts.length >= 4) {
            const stationName = parts[0]?.trim();
            const url = parts[1]?.trim();
            const category = parts[2]?.trim();
            const status = parts[3]?.trim();
            
            // ✅ ENHANCED: Skip stations that were working or recovered
            if (stationName && (category === 'working' || category === 'recovered')) {
              this.csvSkipData.set(stationName, {
                category,
                status,
                url,
                lastTested: new Date()
              });
              skippableCount++;
              
              if (skippableCount <= 5) { // Show first 5 for verification
                console.log(`  ✅ Will skip: ${stationName} (${category})`);
              }
            }
          }
        } catch (lineError) {
          console.warn(`⚠️ Skipping malformed CSV line ${index + 2}: ${line.substring(0, 50)}...`);
        }
      });
      
      console.log(`📄 CSV Analysis Complete:`);
      console.log(`   📊 Total CSV entries: ${totalProcessed}`);
      console.log(`   ⏭️ Skippable stations: ${skippableCount}`);
      console.log(`   🧪 Estimated testing reduction: ${Math.round((skippableCount / totalProcessed) * 100)}%`);
      
      if (skippableCount > 5) {
        console.log(`   ... and ${skippableCount - 5} more stations will be skipped`);
      }

    } catch (error) {
      console.error('❌ Failed to parse CSV results:', error);
      console.log('📄 Proceeding with full test...');
    }
  }

  // ✅ NEW: Proper CSV parsing that handles quotes and commas
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else if (char !== '"' || inQuotes) {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  // ✅ ENHANCED: Check if station should be skipped with better logging
  shouldSkipStation(stationName) {
    const csvResult = this.csvSkipData.get(stationName);
    
    if (csvResult) {
      console.log(`⏭️ Skipping ${stationName} - previously ${csvResult.category} (from CSV)`);
      return true;
    }
    
    return false;
  }

  // ✅ ENHANCED: Smart station URL selection with fallback-first strategy
  getStationUrlsWithFallbackFirst(station) {
    const fallbackDef = getStationDefinition(station.name);
    
    if (fallbackDef && fallbackDef.urls && fallbackDef.urls.length > 0) {
      console.log(`🔄 Using fallback-first strategy for ${station.name} (${fallbackDef.urls.length} URLs)`);
      return {
        urls: fallbackDef.urls,
        hasFallback: true,
        originalUrl: station.url
      };
    } else {
      console.log(`📻 Using original URL for ${station.name}`);
      return {
        urls: [station.url],
        hasFallback: false,
        originalUrl: station.url
      };
    }
  }

  // ✅ ENHANCED: Test all stations with auto CSV loading
  async testAllStations(progressCallback) {
    if (this.isRunning) {
      throw new Error('Test already running');
    }

    this.isRunning = true;
    this.aborted = false;
    this.results = {
      tested: 0,
      skipped: 0,
      working: [],
      failed: [],
      timeout: [],
      unknown: [],
      recovered: [],
      startTime: new Date(),
      endTime: null
    };

    console.log('🧪 Starting SMART radio stream test with auto CSV detection...');
    
    // ✅ ENHANCED: Auto-load existing CSV results for smart skipping
    await this.loadExistingTestResults();
    
    let allStations;
    try {
      allStations = getAllRadioStations();
      
      if (!Array.isArray(allStations) || allStations.length === 0) {
        throw new Error('No stations available for testing');
      }
      
      console.log(`📊 Loaded ${allStations.length} radio stations`);
      
      // Filter out invalid stations and test station
      const validStations = allStations.filter((station, index) => {
        const isValid = station && 
          typeof station === 'object' && 
          station.name && 
          station.url &&
          station.name !== 'TEST FAILING STATION';
        
        if (!isValid && station.name !== 'TEST FAILING STATION') {
          console.warn(`❌ Invalid station at index ${index}:`, station);
        }
        
        return isValid;
      });
      
      if (validStations.length === 0) {
        throw new Error('No valid stations found for testing');
      }
      
      allStations = validStations;
      console.log(`📊 ${allStations.length} valid stations ready for smart testing`);
      
    } catch (error) {
      console.error('❌ Failed to load stations for testing:', error);
      this.isRunning = false;
      throw new Error(`Failed to load stations: ${error.message}`);
    }
    
    const totalStations = allStations.length;
    let stationsToTest = [];
    let skippedCount = 0;

    // ✅ ENHANCED: Smart filtering with CSV-based skipping
    for (const station of allStations) {
      if (this.shouldSkipStation(station.name)) {
        skippedCount++;
      } else {
        stationsToTest.push(station);
      }
    }

    console.log(`🎯 SMART TEST PLAN:`);
    console.log(`   📊 Total stations: ${totalStations}`);
    console.log(`   ⏭️ Skipping (CSV working/recovered): ${skippedCount}`);
    console.log(`   🧪 Need testing: ${stationsToTest.length}`);
    console.log(`   ⚡ Efficiency gain: ${Math.round((skippedCount / totalStations) * 100)}%`);
    console.log(`   ⏱️ Estimated time saved: ~${Math.round((skippedCount * 8) / 60)} minutes`);

    this.results.skipped = skippedCount;

    // Initial progress callback
    if (progressCallback) {
      progressCallback({
        tested: 0,
        total: totalStations,
        current: `Smart planning complete - ${skippedCount} stations skipped`,
        percentage: Math.round((skippedCount / totalStations) * 100),
        working: 0,
        failed: 0,
        timeout: 0,
        recovered: 0,
        skipped: skippedCount
      });
    }

    // ✅ Test only stations that need testing
    for (let i = 0; i < stationsToTest.length && !this.aborted; i++) {
      const station = stationsToTest[i];
      this.currentTest = station;
      
      console.log(`🧪 Testing ${i + 1}/${stationsToTest.length}: ${station.name}`);
      
      try {
        const result = await Promise.race([
          this.testStationWithFallbackFirst(station),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Overall test timeout after 15 seconds')), 15000)
          )
        ]);
        
        // Categorize results
        if (result && result.status === 'working') {
          this.results.working.push(result);
          console.log(`✅ Station ${i + 1} WORKING: ${station.name}`);
        } else if (result && result.status === 'recovered') {
          this.results.recovered.push(result);
          console.log(`🔄 Station ${i + 1} RECOVERED: ${station.name} via ${result.method}`);
        } else if (result && result.errorType === 'timeout') {
          this.results.timeout.push(result);
          console.log(`⏱️ Station ${i + 1} TIMEOUT: ${station.name}`);
        } else {
          this.results.failed.push(result || {
            station: station.name,
            url: station.url,
            status: 'failed',
            lastError: 'Unknown error',
            errorType: 'unknown'
          });
          console.log(`❌ Station ${i + 1} FAILED: ${station.name} - ${result?.lastError || 'Unknown error'}`);
        }
        
      } catch (error) {
        console.error(`💥 Unexpected error testing ${station.name}:`, error);
        this.results.unknown.push({
          station: station.name,
          url: station.url,
          status: 'unknown',
          error: error.message
        });
      }
      
      this.results.tested++;
      
      // Progress update
      if (progressCallback) {
        const progress = {
          tested: this.results.tested,
          total: totalStations,
          current: station.name,
          percentage: Math.round(((this.results.tested + this.results.skipped) / totalStations) * 100),
          working: this.results.working.length,
          failed: this.results.failed.length,
          timeout: this.results.timeout.length,
          recovered: this.results.recovered.length,
          skipped: this.results.skipped
        };
        
        console.log(`📊 Progress: ${progress.percentage}% (${this.results.tested + this.results.skipped}/${totalStations}) - ${progress.recovered} recovered`);
        
        try {
          progressCallback(progress);
        } catch (progressError) {
          console.warn('Progress callback error:', progressError);
        }
      }
      
      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    this.results.endTime = new Date();
    this.isRunning = false;
    this.currentTest = null;

    console.log('🏁 Smart radio stream testing completed!');
    this.printSummary();
    await this.updateFallbackStations();
    await this.writeFailedStationsToFile();
    this.saveResults();
    
    return this.results;
  }

  // ✅ NEW: Test station with fallback-first strategy
  async testStationWithFallbackFirst(station, maxAttempts = 2) {
    console.log(`🧪 Testing: ${station.name}`);
    
    // Get URLs with fallback-first strategy
    const urlConfig = this.getStationUrlsWithFallbackFirst(station);
    
    // Try each URL in the fallback-first order
    for (let urlIndex = 0; urlIndex < urlConfig.urls.length; urlIndex++) {
      const url = urlConfig.urls[urlIndex];
      const isFirstUrl = urlIndex === 0;
      const isFallbackUrl = urlConfig.hasFallback && urlIndex > 0;
      
      console.log(`🔗 Trying URL ${urlIndex + 1}/${urlConfig.urls.length}: ${url} ${isFallbackUrl ? '(fallback)' : '(primary)'}`);
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const testResult = await this.performStreamTest(url, station.name, attempt);
          
          if (testResult.success) {
            const status = urlConfig.hasFallback && isFirstUrl ? 'working' : 
                          urlConfig.hasFallback && !isFirstUrl ? 'recovered' : 'working';
            
            console.log(`✅ ${station.name} - ${status} with URL ${urlIndex + 1} (attempt ${attempt})`);
            
            return {
              station: station.name,
              url: url,
              originalUrl: urlConfig.originalUrl,
              status: status,
              method: isFallbackUrl ? 'fallback_url' : 'primary_url',
              attempt: attempt,
              responseTime: testResult.responseTime,
              statusCode: testResult.statusCode
            };
          }
        } catch (error) {
          console.warn(`❌ ${station.name} - Failed URL ${urlIndex + 1} attempt ${attempt}: ${error.message}`);
        }
      }
    }
    
    // If all existing URLs failed, try generating new fallback methods
    console.log(`🔄 All known URLs failed for ${station.name}, trying new fallback methods...`);
    
    const fallbackResult = await this.tryNewFallbackMethods(station);
    if (fallbackResult.success) {
      return {
        station: station.name,
        url: fallbackResult.workingUrl,
        originalUrl: station.url,
        status: 'recovered',
        method: fallbackResult.method,
        responseTime: fallbackResult.responseTime
      };
    }
    
    // All methods failed
    return {
      station: station.name,
      url: station.url,
      status: 'failed',
      attempts: maxAttempts,
      lastError: fallbackResult.lastError || 'All methods failed',
      errorType: this.categorizeError(new Error(fallbackResult.lastError || 'Failed'))
    };
  }

  // ✅ NEW: Try new fallback methods for completely failed stations
  async tryNewFallbackMethods(station) {
    const stationName = station.name;
    const originalUrl = station.url;
    let lastError = '';

    // 1. Try HTTPS upgrade if HTTP
    if (originalUrl.startsWith('http://')) {
      try {
        const httpsUrl = originalUrl.replace('http://', 'https://');
        const result = await this.performStreamTest(httpsUrl, stationName, 1);
        
        if (result.success) {
          return {
            success: true,
            workingUrl: httpsUrl,
            method: 'https_upgrade',
            responseTime: result.responseTime
          };
        }
      } catch (error) {
        lastError = error.message;
        console.log(`  ❌ HTTPS upgrade failed: ${error.message}`);
      }
    }

    // 2. Try CORS proxies for HTTP URLs
    if (originalUrl.startsWith('http://')) {
      for (const proxy of this.corsProxies) {
        try {
          const proxiedUrl = this.createProxiedUrl(originalUrl, proxy);
          const result = await this.performStreamTest(proxiedUrl, stationName, 1);
          
          if (result.success) {
            return {
              success: true,
              workingUrl: proxiedUrl,
              method: `cors_proxy_${proxy.split('/')[2] || 'unknown'}`,
              responseTime: result.responseTime
            };
          }
        } catch (error) {
          lastError = error.message;
          console.log(`  ❌ CORS proxy failed (${proxy}): ${error.message}`);
        }
      }
    }

    // 3. Try alternative stream formats
    const altUrls = this.generateAlternativeUrls(originalUrl);
    for (const altUrl of altUrls) {
      try {
        const result = await this.performStreamTest(altUrl, stationName, 1);
        
        if (result.success) {
          return {
            success: true,
            workingUrl: altUrl,
            method: 'alternative_format',
            responseTime: result.responseTime
          };
        }
      } catch (error) {
        lastError = error.message;
        console.log(`  ❌ Alternative format failed (${altUrl}): ${error.message}`);
      }
    }

    return { success: false, lastError };
  }

  // ✅ NEW: Generate updated fallbackStations.js file
  async updateFallbackStations() {
    console.log(`📝 Generating updated fallbackStations.js...`);
    
    try {
      // Get current fallback stations
      const currentFallbacks = await import('../data/fallbackStations.js');
      const fallbackStations = { ...currentFallbacks.fallbackStations };
      
      // Add/update stations that were recovered with new working URLs
      for (const recovered of this.results.recovered) {
        const existing = fallbackStations[recovered.station];
        let urls = [];
        
        if (existing) {
          // Add new working URL to the front, remove if already exists
          urls = [recovered.url, ...existing.urls.filter(url => url !== recovered.url)];
        } else {
          // Create new entry
          urls = [recovered.url];
          if (recovered.originalUrl && recovered.originalUrl !== recovered.url) {
            urls.push(recovered.originalUrl);
          }
        }
        
        fallbackStations[recovered.station] = {
          name: recovered.station,
          urls: urls,
          logo: existing?.logo || null,
          description: existing?.description || `Auto-recovered via ${recovered.method}`
        };
      }

      // Generate the new file content
      const timestamp = new Date().toISOString();
      
      let fileContent = `// filepath: c:\\Users\\niels\\Documents\\Visual Studio Code\\no ads radio project\\src\\data\\fallbackStations.js
// Station definitions with multiple fallback URLs - AUTO-UPDATED
// This file can be directly edited to override station URLs
// URLs are tried in order from first to last
// Last updated: ${timestamp}

export const fallbackStations = {\n`;

      // Write all stations
      Object.values(fallbackStations).forEach(station => {
        fileContent += `  "${station.name}": {\n`;
        fileContent += `    name: "${station.name}",\n`;
        fileContent += `    urls: [\n`;
        station.urls.forEach(url => {
          fileContent += `      "${url}",\n`;
        });
        fileContent += `    ],\n`;
        fileContent += `    logo: ${station.logo ? `"${station.logo}"` : 'null'},\n`;
        fileContent += `    description: ${station.description ? `"${station.description}"` : 'null'}\n`;
        fileContent += `  },\n\n`;
      });

      fileContent += `};

// Function to get station definition with fallbacks
export function getStationDefinition(stationName) {
  return fallbackStations[stationName] || null;
}

// Function to add or update a station definition
export function updateStationDefinition(stationName, urls, logo = null, description = null) {
  if (!Array.isArray(urls)) {
    urls = [urls];
  }
  
  fallbackStations[stationName] = {
    name: stationName,
    urls: urls,
    logo: logo,
    description: description
  };
  
  console.log(\`✅ Updated station definition for "\${stationName}" with \${urls.length} URLs\`);
  return true;
}

// Auto-generated statistics
export const fallbackStats = {
  totalStations: ${Object.keys(fallbackStations).length},
  lastUpdated: "${timestamp}",
  recoveredInLastTest: ${this.results.recovered.length}
};
`;

      // Create downloadable file
      const blob = new Blob([fileContent], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fallbackStations.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`📄 Downloaded updated fallbackStations.js with ${Object.keys(fallbackStations).length} stations`);
      console.log(`💡 Replace the existing src/data/fallbackStations.js file with the downloaded version`);
      
      return Object.keys(fallbackStations).length;
      
    } catch (error) {
      console.error('❌ Failed to generate fallbackStations.js:', error);
      throw error;
    }
  }

  // ✅ ENHANCED: Print summary with smart test statistics
  printSummary() {
    const { tested, skipped, working, recovered, failed, timeout, unknown, startTime, endTime } = this.results;
    const duration = Math.round((endTime - startTime) / 1000);
    const totalProcessed = tested + skipped;
    const totalWorking = working.length + recovered.length + skipped; // Include skipped as working
    const successRate = Math.round((totalWorking / totalProcessed) * 100);
    const timesSaved = Math.round((skipped * 8) / 60); // Estimate 8 seconds per test
    
    console.log(`
🧪 SMART RADIO STREAM TEST SUMMARY
═══════════════════════════════════════════════════
📊 Total Processed: ${totalProcessed}
⏭️ Skipped (Previously Working): ${skipped}
🧪 Actually Tested: ${tested}
✅ Working (Original): ${working.length} (${Math.round((working.length / totalProcessed) * 100)}%)
🔄 Recovered (Fallback): ${recovered.length} (${Math.round((recovered.length / totalProcessed) * 100)}%)
🎯 Total Success Rate: ${totalWorking} (${successRate}%)
❌ Failed: ${failed.length} (${Math.round((failed.length / totalProcessed) * 100)}%)
⏱️ Timeout: ${timeout.length} (${Math.round((timeout.length / totalProcessed) * 100)}%)
❓ Unknown: ${unknown.length} (${Math.round((unknown.length / totalProcessed) * 100)}%)
⏰ Duration: ${duration} seconds (⚡ Saved ~${timesSaved} minutes)
⚡ Efficiency Gain: ${Math.round((skipped / totalProcessed) * 100)}%
═══════════════════════════════════════════════════
    `);

    if (recovered.length > 0) {
      console.log('🔄 RECOVERED STATIONS (new fallback URLs found):');
      recovered.slice(0, 10).forEach(result => {
        console.log(`  • ${result.station} (${result.method})`);
      });
      if (recovered.length > 10) {
        console.log(`  ... and ${recovered.length - 10} more recovered stations`);
      }
    }

    if (failed.length > 0) {
      console.log('❌ PERMANENTLY FAILED STATIONS:');
      failed.slice(0, 10).forEach(result => {
        console.log(`  • ${result.station} (${result.errorType}): ${result.lastError}`);
      });
      if (failed.length > 10) {
        console.log(`  ... and ${failed.length - 10} more failed stations`);
      }
    }

    console.log(`\n💡 Next steps:`);
    console.log(`   1. Replace src/data/failedStations.js with downloaded version`);
    console.log(`   2. Replace src/data/fallbackStations.js with downloaded version`);
    console.log(`   3. Failed stations will show red text in UI`);
    console.log(`   4. Recovered stations will use new fallback URLs automatically`);
  }

  // ✅ Existing methods (createProxiedUrl, generateAlternativeUrls, performStreamTest, etc.)
  createProxiedUrl(originalUrl, proxy) {
    if (proxy.includes('corsproxy.io')) {
      return `${proxy}${encodeURIComponent(originalUrl)}`;
    } else if (proxy.includes('allorigins.win')) {
      return `${proxy}${encodeURIComponent(originalUrl)}`;
    } else {
      return `${proxy}${originalUrl}`;
    }
  }

  generateAlternativeUrls(originalUrl) {
    const alternatives = [];
    
    if (originalUrl.includes('.pls')) {
      alternatives.push(originalUrl.replace('.pls', '.mp3'));
      alternatives.push(originalUrl.replace('.pls', '.aac'));
    }
    
    if (originalUrl.includes('.m3u')) {
      alternatives.push(originalUrl.replace('.m3u', '.mp3'));
      alternatives.push(originalUrl.replace('.m3u', '.aac'));
    }

    if (originalUrl.includes('?')) {
      alternatives.push(originalUrl.split('?')[0]);
    }

    if (originalUrl.includes(':8')) {
      const baseUrl = originalUrl.split(':8')[0];
      alternatives.push(`${baseUrl}:8000/stream`);
      alternatives.push(`${baseUrl}:8080/stream`);
      alternatives.push(`${baseUrl}:8128/stream`);
    }

    return alternatives;
  }

  async performStreamTest(url, stationName, attempt) {
    const startTime = Date.now();
    const timeout = 5000; // Reduced to 5 seconds for efficiency
    
    return new Promise((resolve, reject) => {
      if (this.aborted) {
        reject(new Error('Test aborted'));
        return;
      }

      const audio = new Audio();
      let resolved = false;
      let timeoutId;
      let cleanupDone = false;
      
      const cleanup = () => {
        if (cleanupDone) return;
        cleanupDone = true;
        
        try {
          audio.removeEventListener('canplay', handleSuccess);
          audio.removeEventListener('loadeddata', handleSuccess);
          audio.removeEventListener('error', handleError);
          
          audio.pause();
          audio.src = '';
          audio.load();
        } catch (e) {
          // Ignore cleanup errors
        }
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      const handleSuccess = () => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve({
          success: true,
          responseTime: Date.now() - startTime,
          statusCode: 200
        });
      };

      const handleError = (e) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        
        const error = e.target?.error;
        let errorMessage = 'Unknown audio error';
        
        if (error) {
          switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
              errorMessage = 'Media loading aborted';
              break;
            case error.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error';
              break;
            case error.MEDIA_ERR_DECODE:
              errorMessage = 'Media decode error';
              break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Media format not supported';
              break;
          }
        }
        
        reject(new Error(errorMessage));
      };

      timeoutId = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        cleanup();
        reject(new Error(`Timeout after ${timeout}ms`));
      }, timeout);

      audio.addEventListener('canplay', handleSuccess, { once: true });
      audio.addEventListener('loadeddata', handleSuccess, { once: true });
      audio.addEventListener('error', handleError, { once: true });

      try {
        audio.crossOrigin = 'anonymous';
        audio.preload = 'metadata';
        audio.volume = 0;
        audio.src = url;
        audio.load();
      } catch (error) {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(error);
        }
      }
    });
  }

  categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('network')) return 'network';
    if (message.includes('cors')) return 'cors';
    if (message.includes('not supported')) return 'format';
    if (message.includes('404') || message.includes('not found')) return 'not_found';
    if (message.includes('403') || message.includes('forbidden')) return 'forbidden';
    if (message.includes('500') || message.includes('server')) return 'server_error';
    if (message.includes('aborted')) return 'aborted';
    
    return 'unknown';
  }

  // ✅ NEW: Write failed stations to codebase file
  async writeFailedStationsToFile() {
    try {
      const failedStationNames = [
        ...this.results.failed.map(r => r.station),
        ...this.results.timeout.map(r => r.station),
        ...this.results.unknown.map(r => r.station)
      ].sort();

      const timestamp = new Date().toISOString();
      
      const fileContent = `// filepath: c:\\Users\\niels\\Documents\\Visual Studio Code\\no ads radio project\\src\\data\\failedStations.js
// Auto-generated list of failed radio stations
// Generated on: ${timestamp}
// Total failed stations: ${failedStationNames.length}

// Stations that failed all connection attempts including fallbacks
export const failedStations = [
${failedStationNames.map(name => `  "${name}"`).join(',\n')}
];

// Check if a station is in the failed list
export const isFailedStation = (stationName) => {
  return failedStations.includes(stationName);
};

// Get failed stations count
export const getFailedStationsCount = () => failedStations.length;

// Summary from last test
export const testSummary = {
  totalTested: ${this.results.tested},
  totalSkipped: ${this.results.skipped},
  working: ${this.results.working.length},
  recovered: ${this.results.recovered.length},
  failed: ${this.results.failed.length},
  timeout: ${this.results.timeout.length},
  unknown: ${this.results.unknown.length},
  testDate: "${timestamp}",
  successRate: "${Math.round(((this.results.working.length + this.results.recovered.length + this.results.skipped) / (this.results.tested + this.results.skipped)) * 100)}%",
  efficiencyGain: "${Math.round((this.results.skipped / (this.results.tested + this.results.skipped)) * 100)}%"
};
`;

      const blob = new Blob([fileContent], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'failedStations.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`📄 Downloaded failedStations.js with ${failedStationNames.length} failed stations`);
      
      localStorage.setItem('failed_radio_stations', JSON.stringify(failedStationNames));
      
      return failedStationNames;
      
    } catch (error) {
      console.error('❌ Failed to write failed stations file:', error);
      throw error;
    }
  }

  abort() {
    console.log('🛑 Aborting smart radio stream test...');
    this.aborted = true;
    this.isRunning = false;
    this.currentTest = null;
  }

  saveResults() {
    try {
      localStorage.setItem('radio_test_results', JSON.stringify(this.results));
      
      const failedStationNames = [
        ...this.results.failed.map(r => r.station),
        ...this.results.timeout.map(r => r.station),
        ...this.results.unknown.map(r => r.station)
      ];
      
      localStorage.setItem('failed_radio_stations', JSON.stringify(failedStationNames));
      
      console.log(`💾 Smart test results saved`);
      
    } catch (error) {
      console.error('Failed to save test results:', error);
    }
  }

  static loadPreviousResults() {
    try {
      const saved = localStorage.getItem('radio_test_results');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load previous test results:', error);
      return null;
    }
  }

  static getFailedStations() {
    try {
      const saved = localStorage.getItem('failed_radio_stations');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load failed stations list:', error);
      return [];
    }
  }

  // ✅ NEW: Static method to manually load a CSV file
  static async loadCsvFromFile(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }
      
      const csvContent = await response.text();
      localStorage.setItem('latest_csv_test_results', csvContent);
      
      console.log(`📄 Successfully loaded and cached CSV from: ${filePath}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to load CSV from ${filePath}:`, error);
      return false;
    }
  }

  // ✅ ENHANCED: Method to load CSV data for smart skipping
  static loadCsvDataForSkipping(csvContent) {
    try {
      localStorage.setItem('latest_csv_test_results', csvContent);
      console.log('📄 CSV data cached for smart skipping in next test');
      return true;
    } catch (error) {
      console.error('Failed to cache CSV data:', error);
      return false;
    }
  }

  // ✅ NEW: Clear cached CSV data
  static clearCachedCsvData() {
    try {
      localStorage.removeItem('latest_csv_test_results');
      console.log('📄 Cleared cached CSV data');
      return true;
    } catch (error) {
      console.error('Failed to clear cached CSV data:', error);
      return false;
    }
  }
}

// Convenience function to start testing
export const startRadioStreamTest = async (progressCallback) => {
  const tester = new RadioStreamTester();
  return await tester.testAllStations(progressCallback);
};

// ✅ NEW: Convenience function to load CSV and start testing
export const startSmartRadioStreamTest = async (csvFilePath, progressCallback) => {
  // Try to load CSV file first
  if (csvFilePath) {
    await RadioStreamTester.loadCsvFromFile(csvFilePath);
  }
  
  const tester = new RadioStreamTester();
  return await tester.testAllStations(progressCallback);
};

// Expose to global console for manual testing
if (typeof window !== 'undefined') {
  window.RadioStreamTester = RadioStreamTester;
  window.startRadioStreamTest = startRadioStreamTest;
  window.startSmartRadioStreamTest = startSmartRadioStreamTest;
  
  // ✅ NEW: Auto-load the known CSV file for convenience
  window.loadKnownCSV = () => {
    return RadioStreamTester.loadCsvFromFile('../radio_stream_test_results_2025-06-08T17-46-08.csv');
  };
}