// utils/communityTimings.js - Community-driven ad break timing system

import { getFirestoreDB, demoFirestore, isDemoMode } from './firebase.js';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Local cache for community timings
let communityTimingsCache = new Map();
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ✅ NEW: Logging throttle to reduce excessive console output
let lastLogTime = 0;
const LOG_THROTTLE_DURATION = 10 * 1000; // 10 seconds between logs

// Helper function to check if we should log
const shouldLog = (key = 'default') => {
  const now = Date.now();
  const cacheKey = `log_${key}`;
  const lastTime = communityTimingsCache.get(cacheKey) || 0;
  
  if (now - lastTime > LOG_THROTTLE_DURATION) {
    communityTimingsCache.set(cacheKey, now);
    return true;
  }
  return false;
};

// ✅ NEW: Configurable timing windows for reporting
const TIMING_WINDOWS = {
  HALF_HOUR: {
    BEFORE: 6, // 6 minutes before :30 (24-30)
    AFTER: 8   // 8 minutes after :30 (30-38)
  },
  FULL_HOUR: {
    BEFORE: 10, // 10 minutes before :00 (50-60)
    AFTER: 15   // 15 minutes after :00 (00-15)
  }
};

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

      console.log(`🔥 Attempting to report ad break: ${stationName} ${type} at ${now.getHours()}:${now.getMinutes()}`);
      
      // Store locally first (as backup)
      this.storeLocalReport(report);

      // Sync to Firebase for shared storage
      await this.syncToFirebase(report);

      console.log(`📊 Ad break reported successfully: ${stationName} ${type} at ${now.getMinutes()}:${now.getSeconds()}`);
      
      if (window.addNotification) {
        window.addNotification(`📊 Reclametiming gerapporteerd voor ${stationName}`, 'success', 2000);
      }

    } catch (error) {
      console.error('❌ Failed to report ad break timing:', error);
      if (window.addNotification) {
        window.addNotification(`❌ Fout bij rapporteren: ${error.message}`, 'error', 3000);
      }
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
      }      // Fetch from Firebase
      const timings = await this.fetchFromFirebase(stationName);
      
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
  }  // Fetch timings from Firebase
  static async fetchFromFirebase(stationName) {
    try {
      if (shouldLog(`fetch_${stationName}`)) {
        console.log(`🔥 Fetching community timings for: ${stationName}`);
      }
      
      if (isDemoMode()) {
        // Use demo data
        const result = await demoFirestore.collection('timing_reports')
          .where('station', '==', stationName)
          .orderBy('timestamp', 'desc')
          .limit(50)
          .get();
        
        const data = result.docs.map(doc => doc.data());
        if (shouldLog(`demo_${stationName}`)) {
          console.log(`🔥 Demo: Loaded ${data.length} timing reports for ${stationName}:`, data);
        }
        return data;
      }

      const db = getFirestoreDB();
      if (!db) {
        console.warn('❌ Firebase not available, using local data only');
        return [];
      }

      const q = query(
        collection(db, 'timing_reports'),
        where('station', '==', stationName),
        orderBy('timestamp', 'desc'),
        limit(50)
      );      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());
      if (shouldLog(`production_${stationName}`)) {
        console.log(`🔥 Production: Loaded ${data.length} timing reports for ${stationName}:`, data);
      }
      return data;
      
    } catch (error) {
      console.error('❌ Failed to fetch from Firebase:', error);
      return [];
    }
  }// Sync report to Firebase
  static async syncToFirebase(report) {
    try {
      if (isDemoMode()) {
        // Use demo storage
        await demoFirestore.collection('timing_reports').add(report);
        console.log('� Demo: Report stored to Firebase:', report);
        return;
      }

      const db = getFirestoreDB();
      if (!db) {
        console.warn('❌ Firebase not available, storing locally only');
        return;
      }

      const docRef = await addDoc(collection(db, 'timing_reports'), report);
      console.log('� Report synced to Firebase with ID:', docRef.id, report);
      
    } catch (error) {
      console.error('❌ Failed to sync to Firebase:', error);
      // Fail gracefully - local storage is still available
    }
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
      
      // ✅ NEW: Time window restrictions based on half-hour and full-hour intervals
      const canReportBasedOnTime = this.isInReportingWindow(currentMinute);
      
      if (!canReportBasedOnTime.canReport) {
        return canReportBasedOnTime;
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

  // ✅ NEW: Check if current time is within reporting windows
  static isInReportingWindow(currentMinute) {
    // Full hour window: 10min before (50-59) and 15min after (0-15)
    if ((currentMinute >= (60 - TIMING_WINDOWS.FULL_HOUR.BEFORE) && currentMinute <= 59) ||
        (currentMinute >= 0 && currentMinute <= TIMING_WINDOWS.FULL_HOUR.AFTER)) {
      return { canReport: true, window: 'full_hour' };
    }
    
    // Half hour window: 6min before (24-29) and 8min after (30-38)
    if ((currentMinute >= (30 - TIMING_WINDOWS.HALF_HOUR.BEFORE) && currentMinute <= 29) ||
        (currentMinute >= 30 && currentMinute <= (30 + TIMING_WINDOWS.HALF_HOUR.AFTER))) {
      return { canReport: true, window: 'half_hour' };
    }
    
    return { 
      canReport: false, 
           reason: `Rapporteren nu niet mogelijk` 

     // reason: `Rapporteren alleen mogelijk rond :00 (${60 - TIMING_WINDOWS.FULL_HOUR.BEFORE}-${TIMING_WINDOWS.FULL_HOUR.AFTER}) en :30 (${30 - TIMING_WINDOWS.HALF_HOUR.BEFORE}-${30 + TIMING_WINDOWS.HALF_HOUR.AFTER})` 
    };
  }  // ✅ NEW: Get community timing suggestions for ad break triggers
  static async getSuggestedAdBreakTiming(stationName, currentHour) {
    try {
      if (shouldLog(`suggestions_${stationName}_${currentHour}`)) {
        console.log(`🔥 Getting community timing suggestions for ${stationName} at hour ${currentHour}`);
      }
      
      // Get raw timings instead of processed ones
      const rawTimings = await this.fetchFromFirebase(stationName);
      if (!rawTimings || rawTimings.length === 0) {
        if (shouldLog(`no_timings_${stationName}`)) {
          console.log(`📊 No community timings found for ${stationName}`);
        }
        return null;
      }

      if (shouldLog(`raw_${stationName}_${currentHour}`)) {
        console.log(`🔥 Raw timings for ${stationName}:`, rawTimings);
      }

      // Filter by current hour for hour-specific timing
      const hourSpecificTimings = rawTimings.filter(timing => timing.hour === currentHour);
      
      if (shouldLog(`hour_specific_${stationName}_${currentHour}`)) {
        console.log(`🔥 Hour-specific timings for ${stationName} at ${currentHour}h:`, hourSpecificTimings);
      }
      
      if (hourSpecificTimings.length === 0) {
        if (shouldLog(`no_hour_timings_${stationName}_${currentHour}`)) {
          console.log(`📊 No hour-specific (${currentHour}h) timings found for ${stationName}`);
        }
        return null;
      }

      // Look for start/end pairs around 30min or 60min marks
      const suggestions = {
        halfHour: this.findTimingPairs(hourSpecificTimings, 30),
        fullHour: this.findTimingPairs(hourSpecificTimings, 0)
      };

      if (shouldLog(`final_suggestions_${stationName}_${currentHour}`)) {
        console.log(`📊 Community timing suggestions for ${stationName}:`, suggestions);
      }
      return suggestions;
      
    } catch (error) {
      console.error('❌ Failed to get community timing suggestions:', error);
      return null;
    }
  }

  // ✅ NEW: Find start/end timing pairs around target minute
  static findTimingPairs(timings, targetMinute) {
    const tolerance = targetMinute === 30 ? 8 : 15; // Different tolerance for half-hour vs full-hour
    
    const nearbyTimings = timings.filter(timing => {
      const diff = Math.abs(timing.minute - targetMinute);
      const wrappedDiff = Math.abs((timing.minute + 60) % 60 - targetMinute);
      return Math.min(diff, wrappedDiff) <= tolerance;
    });

    if (nearbyTimings.length === 0) return null;

    const starts = nearbyTimings.filter(t => t.type === 'start');
    const ends = nearbyTimings.filter(t => t.type === 'end');

    if (starts.length === 0 && ends.length === 0) return null;

    return {
      starts: starts.length > 0 ? Math.round(starts.reduce((sum, t) => sum + t.minute, 0) / starts.length) : null,
      ends: ends.length > 0 ? Math.round(ends.reduce((sum, t) => sum + t.minute, 0) / ends.length) : null,
      count: nearbyTimings.length
    };
  }

  // ✅ NEW: Submit feedback about timing accuracy
  static async submitFeedback(stationName, timingType, rating) {
    try {
      const now = new Date();
      const feedback = {
        station: stationName,
        timingType: timingType, // 'auto-switch', 'manual', etc.
        rating: rating, // 'too_early', 'perfect', 'too_late'
        timestamp: now.toISOString(),
        minute: now.getMinutes(),
        hour: now.getHours(),
        dayOfWeek: now.getDay(),
        version: '1.0'
      };

      console.log(`📝 Submitting feedback: ${stationName} ${timingType} rated as ${rating}`);
      
      // Store locally first
      this.storeLocalFeedback(feedback);

      // Sync to Firebase
      await this.syncFeedbackToFirebase(feedback);

      console.log(`✅ Feedback submitted successfully for ${stationName}`);
      
      if (window.addNotification) {
        window.addNotification(`📝 Feedback verzonden voor ${stationName}`, 'success', 2000);
      }

    } catch (error) {
      console.error('❌ Failed to submit feedback:', error);
      if (window.addNotification) {
        window.addNotification('❌ Feedback verzenden mislukt', 'error', 3000);
      }
      throw error;
    }
  }

  // Store feedback locally as backup
  static storeLocalFeedback(feedback) {
    try {
      const key = `feedback_${feedback.station}_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(feedback));
      console.log(`💾 Feedback stored locally: ${key}`);
    } catch (error) {
      console.warn('Failed to store feedback locally:', error);
    }
  }

  // Sync feedback to Firebase
  static async syncFeedbackToFirebase(feedback) {
    try {
      const db = getFirestoreDB();
      const feedbackCollection = collection(db, 'community_feedback');
      
      const docRef = await addDoc(feedbackCollection, feedback);
      console.log(`🔥 Feedback synced to Firebase: ${docRef.id}`);
      
    } catch (error) {
      console.error('Failed to sync feedback to Firebase:', error);
      throw error;
    }
  }
}

// ✅ NEW: React component for floating feedback widget - merged to reduce file count
import React, { useState, useEffect } from 'react';

export const CommunityTimingFeedback = ({ 
  isVisible, 
  onClose, 
  stationName, 
  timingType = 'auto-switch' 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setHasSubmitted(false);
      setIsSubmitting(false);
      setIsAnimating(true);
      
      // Auto-close after 10 seconds if no interaction
      const autoCloseTimer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(autoCloseTimer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible, onClose]);

  const handleFeedback = async (rating) => {
    if (isSubmitting || hasSubmitted) return;
    
    setIsSubmitting(true);
    
    try {
      await CommunityTimings.submitFeedback(stationName, timingType, rating);
      setHasSubmitted(true);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ maxWidth: '600px', width: '90vw' }}
    >
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-4">
        {hasSubmitted ? (
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span className="text-sm font-medium">Bedankt voor je feedback!</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white text-sm font-semibold">Community Timing Feedback</h4>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-xl leading-none"
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>
            
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handleFeedback('too_early')}
                disabled={isSubmitting}
                className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
                title="Te vroeg"
              >
                Te vroeg
              </button>
              
              <button
                onClick={() => handleFeedback('perfect')}
                disabled={isSubmitting}
                className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
                title="Perfect getimed"
              >
                Perfect
              </button>
              
              <button
                onClick={() => handleFeedback('too_late')}
                disabled={isSubmitting}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
                title="Te laat"
              >
                Te laat
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating indicator */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-800 border-b border-r border-gray-600 rotate-45"></div>
    </div>
  );
};

export default CommunityTimings;
