// utils/communityTimings.js - Community-driven ad break timing system

// GitHub repository for storing community timings (using GitHub as free backend)
const GITHUB_REPO = 'no-ads-radio-community/timings';
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}`;

// Local cache for community timings
let communityTimingsCache = new Map();
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class CommunityTimings {
  
  // Report an ad break timing for a specific station
  static async reportAdBreak(stationName, type = 'start') {
    try {
      const now = new Date();
      const report = {
        station: stationName,
        type: type, // 'start' or 'end'
        timestamp: now.toISOString(),
        minute: now.getMinutes(),
        hour: now.getHours(),
        dayOfWeek: now.getDay(),
        userAgent: navigator.userAgent.substring(0, 50), // Limited for privacy
        version: '1.0'
      };

      // Store locally first
      this.storeLocalReport(report);

      // Try to sync to GitHub (fire and forget)
      this.syncToGitHub(report).catch(error => {
        console.warn('Failed to sync timing to GitHub:', error);
      });

      console.log(`📊 Ad break reported: ${stationName} ${type} at ${now.getMinutes()}:${now.getSeconds()}`);
      
      if (window.addNotification) {
        window.addNotification(`📊 Reclametiming gerapporteerd voor ${stationName}`, 'success', 2000);
      }

    } catch (error) {
      console.error('Failed to report ad break timing:', error);
    }
  }

  // Store report locally
  static storeLocalReport(report) {
    try {
      const localReports = JSON.parse(localStorage.getItem('community_timing_reports') || '[]');
      localReports.push(report);
      
      // Keep only last 100 reports to prevent storage bloat
      if (localReports.length > 100) {
        localReports.splice(0, localReports.length - 100);
      }
      
      localStorage.setItem('community_timing_reports', JSON.stringify(localReports));
    } catch (error) {
      console.warn('Failed to store local timing report:', error);
    }
  }

  // Get community timings for a station
  static async getCommunityTimings(stationName) {
    try {
      // Check cache first
      const cacheKey = stationName.toLowerCase();
      const now = Date.now();
      
      if (communityTimingsCache.has(cacheKey) && (now - lastFetchTime) < CACHE_DURATION) {
        return communityTimingsCache.get(cacheKey);
      }

      // Fetch from GitHub
      const timings = await this.fetchFromGitHub(stationName);
      
      // Process and validate timings
      const processedTimings = this.processTimings(timings);
      
      // Cache the result
      communityTimingsCache.set(cacheKey, processedTimings);
      lastFetchTime = now;
      
      return processedTimings;

    } catch (error) {
      console.warn('Failed to fetch community timings:', error);
      return null;
    }
  }

  // Fetch timings from GitHub
  static async fetchFromGitHub(stationName) {
    const fileName = `${stationName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    const url = `${GITHUB_API_BASE}/contents/stations/${fileName}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return []; // No timings yet for this station
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = atob(data.content);
      return JSON.parse(content);
      
    } catch (error) {
      console.warn('Failed to fetch from GitHub:', error);
      return [];
    }
  }

  // Sync report to GitHub (simplified approach)
  static async syncToGitHub(report) {
    // For now, we'll collect reports locally and sync them in batches
    // This avoids GitHub API rate limits and the need for authentication
    
    // In a real implementation, you'd want to:
    // 1. Batch reports and send them periodically
    // 2. Use a serverless function (Vercel/Netlify) as a proxy
    // 3. Or use a dedicated backend service
    
    console.log('📊 Report queued for sync:', report);
  }

  // Process and validate timings
  static processTimings(rawTimings) {
    if (!Array.isArray(rawTimings) || rawTimings.length === 0) {
      return null;
    }

    // Group timings by approximate hour (30min and 60min intervals)
    const groupedTimings = this.groupTimingsByInterval(rawTimings);
    
    // Calculate average timings for each interval
    const averagedTimings = this.calculateAverageTimings(groupedTimings);
    
    return averagedTimings;
  }

  // Group timings by 30-minute intervals
  static groupTimingsByInterval(timings) {
    const groups = {
      '30min': [], // Around :29-:31
      '60min': []  // Around :59-:01
    };

    timings.forEach(timing => {
      const minute = timing.minute;
      
      // Check if timing is around 30-minute mark (±8 minutes)
      if (this.isNearInterval(minute, 30, 8)) {
        groups['30min'].push(timing);
      }
      
      // Check if timing is around 60-minute mark (±8 minutes)
      if (this.isNearInterval(minute, 60, 8) || this.isNearInterval(minute, 0, 8)) {
        groups['60min'].push(timing);
      }
    });

    return groups;
  }

  // Check if a minute is near a target interval
  static isNearInterval(minute, target, tolerance) {
    if (target === 60) target = 0; // Handle hour boundary
    
    const diff = Math.abs(minute - target);
    const wrappedDiff = Math.abs((minute + 60) % 60 - target);
    
    return Math.min(diff, wrappedDiff) <= tolerance;
  }

  // Calculate average timings from grouped data
  static calculateAverageTimings(groupedTimings) {
    const result = {};

    Object.entries(groupedTimings).forEach(([interval, timings]) => {
      if (timings.length >= 3) { // Need at least 3 reports for reliability
        const averageMinute = this.calculateAverageMinute(timings);
        const confidence = Math.min(timings.length / 10, 1); // Confidence based on sample size
        
        result[interval] = {
          minute: averageMinute,
          confidence: confidence,
          sampleSize: timings.length,
          lastUpdated: Math.max(...timings.map(t => new Date(t.timestamp).getTime()))
        };
      }
    });

    return Object.keys(result).length > 0 ? result : null;
  }

  // Calculate average minute, handling hour boundaries
  static calculateAverageMinute(timings) {
    const minutes = timings.map(t => t.minute);
    
    // Convert to 0-59 range and handle wraparound
    const normalizedMinutes = minutes.map(m => {
      // If we have values near 0 and near 60, adjust for averaging
      if (minutes.some(x => x < 10) && minutes.some(x => x > 50)) {
        return m < 30 ? m + 60 : m;
      }
      return m;
    });

    const average = normalizedMinutes.reduce((sum, m) => sum + m, 0) / normalizedMinutes.length;
    return Math.round(average % 60);
  }

  // Submit feedback on timing accuracy
  static async submitTimingFeedback(stationName, feedback, currentMinute) {
    try {
      const adjustment = feedback === 'early' ? 10 : -10; // 10 seconds adjustment
      
      const feedbackReport = {
        station: stationName,
        type: 'feedback',
        feedback: feedback, // 'early' or 'late'
        currentMinute: currentMinute,
        adjustment: adjustment,
        timestamp: new Date().toISOString()
      };

      // Store locally
      this.storeLocalReport(feedbackReport);

      console.log(`📊 Timing feedback submitted: ${stationName} was ${feedback}`);
      
      if (window.addNotification) {
        window.addNotification('Bedankt voor je feedback!', 'success', 2000);
      }

    } catch (error) {
      console.error('Failed to submit timing feedback:', error);
    }
  }

  // Get suggested timings for ad break timer (replaces user settings when available)
  static async getSuggestedTimings(stationName) {
    try {
      const communityTimings = await this.getCommunityTimings(stationName);
      
      if (!communityTimings) {
        return null; // Fall back to user settings
      }

      const suggestions = {};

      // Convert community timings to the format expected by ad break timer
      if (communityTimings['30min']) {
        suggestions.minute1 = communityTimings['30min'].minute;
        suggestions.confidence1 = communityTimings['30min'].confidence;
      }

      if (communityTimings['60min']) {
        suggestions.minute2 = communityTimings['60min'].minute;
        suggestions.confidence2 = communityTimings['60min'].confidence;
      }

      return Object.keys(suggestions).length > 0 ? suggestions : null;

    } catch (error) {
      console.warn('Failed to get suggested timings:', error);
      return null;
    }
  }
  // Clear local cache (for testing/debugging)
  static clearCache() {
    communityTimingsCache.clear();
    lastFetchTime = 0;
    localStorage.removeItem('community_timing_reports');
    console.log('📊 Community timing cache cleared');
  }

  // Get all local timing reports for management dashboard
  static getLocalReports() {
    try {
      const localReports = JSON.parse(localStorage.getItem('community_timing_reports') || '[]');
      return localReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.warn('Failed to get local timing reports:', error);
      return [];
    }
  }

  // Delete a specific local timing report
  static deleteLocalReport(reportIndex) {
    try {
      const localReports = JSON.parse(localStorage.getItem('community_timing_reports') || '[]');
      if (reportIndex >= 0 && reportIndex < localReports.length) {
        localReports.splice(reportIndex, 1);
        localStorage.setItem('community_timing_reports', JSON.stringify(localReports));
        console.log(`📊 Deleted timing report at index ${reportIndex}`);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to delete timing report:', error);
      return false;
    }
  }
  // Clear all local timing reports
  static clearAllLocalReports() {
    try {
      localStorage.removeItem('community_timing_reports');
      console.log('📊 All local timing reports cleared');
      return true;
    } catch (error) {
      console.warn('Failed to clear timing reports:', error);
      return false;
    }
  }

  // Get grouped reports by station with averages
  static getGroupedReportsByStation() {
    try {
      const reports = this.getLocalReports();
      const grouped = {};

      reports.forEach((report, index) => {
        const station = report.station;
        if (!grouped[station]) {
          grouped[station] = {
            station,
            reports: [],
            startReports: [],
            endReports: [],
            avgStart: null,
            avgEnd: null,
            totalReports: 0
          };
        }

        grouped[station].reports.push({ ...report, index });
        grouped[station].totalReports++;

        if (report.type === 'start') {
          grouped[station].startReports.push(report);
        } else if (report.type === 'end') {
          grouped[station].endReports.push(report);
        }
      });

      // Calculate averages for each station
      Object.values(grouped).forEach(stationData => {
        if (stationData.startReports.length > 0) {
          const avgStartMinutes = stationData.startReports.reduce((sum, r) => sum + (r.hour * 60 + r.minute), 0) / stationData.startReports.length;
          const avgStartHour = Math.floor(avgStartMinutes / 60);
          const avgStartMin = Math.round(avgStartMinutes % 60);
          stationData.avgStart = `${String(avgStartHour).padStart(2, '0')}:${String(avgStartMin).padStart(2, '0')}`;
        }

        if (stationData.endReports.length > 0) {
          const avgEndMinutes = stationData.endReports.reduce((sum, r) => sum + (r.hour * 60 + r.minute), 0) / stationData.endReports.length;
          const avgEndHour = Math.floor(avgEndMinutes / 60);
          const avgEndMin = Math.round(avgEndMinutes % 60);
          stationData.avgEnd = `${String(avgEndHour).padStart(2, '0')}:${String(avgEndMin).padStart(2, '0')}`;
        }
      });

      return Object.values(grouped).sort((a, b) => a.station.localeCompare(b.station));
    } catch (error) {
      console.warn('Failed to get grouped reports:', error);
      return [];
    }
  }

  // Check if user can report (cooldown and time restrictions)
  static canUserReport(stationName, reportType) {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Time restrictions: cannot report between 15-25min or 40-50min of any hour
      if ((currentMinute >= 15 && currentMinute <= 25) || (currentMinute >= 40 && currentMinute <= 50)) {
        return { canReport: false, reason: 'Rapporteren is uitgeschakeld tussen :15-:25 en :40-:50 van elk uur' };
      }

      const reports = this.getLocalReports();
      const stationReports = reports.filter(r => r.station === stationName);
      
      if (stationReports.length === 0) {
        return { canReport: true };
      }

      // Get most recent reports
      const recentReports = stationReports
        .filter(r => {
          const reportTime = new Date(r.timestamp);
          const timeDiff = now - reportTime;
          return timeDiff < 25 * 60 * 1000; // Within last 25 minutes
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      if (recentReports.length === 0) {
        return { canReport: true };
      }

      const lastReport = recentReports[0];
      const lastReportTime = new Date(lastReport.timestamp);
      const timeDiff = now - lastReportTime;

      // Same button cooldown: 15 minutes
      if (lastReport.type === reportType && timeDiff < 15 * 60 * 1000) {
        const remainingMs = 15 * 60 * 1000 - timeDiff;
        const remainingMin = Math.ceil(remainingMs / (60 * 1000));
        return { canReport: false, reason: `Wacht nog ${remainingMin} minuten voor dezelfde melding` };
      }

      // Different button cooldown: 4 minutes
      if (lastReport.type !== reportType && timeDiff < 4 * 60 * 1000) {
        const remainingMs = 4 * 60 * 1000 - timeDiff;
        const remainingMin = Math.ceil(remainingMs / (60 * 1000));
        return { canReport: false, reason: `Wacht nog ${remainingMin} minuten tussen verschillende meldingen` };
      }

      return { canReport: true };
    } catch (error) {
      console.warn('Failed to check report cooldown:', error);
      return { canReport: true }; // Allow reporting if check fails
    }
  }
}

export default CommunityTimings;
