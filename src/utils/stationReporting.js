// Station reporting and override management service
// Handles user reports of failed stations and developer overrides
import { stationReportsAPI, isDemoMode } from './firebase.js';

class StationReportingService {
  constructor() {
    this.storageKeys = {
      reports: 'radio_station_reports',
      overrides: 'radio_station_overrides',
      reportCounter: 'radio_report_counter'
    };
    
    // Initialize storage if needed
    this.initializeStorage();
  }

  initializeStorage() {
    if (!localStorage.getItem(this.storageKeys.reports)) {
      localStorage.setItem(this.storageKeys.reports, JSON.stringify({}));
    }
    if (!localStorage.getItem(this.storageKeys.overrides)) {
      localStorage.setItem(this.storageKeys.overrides, JSON.stringify({}));
    }
    if (!localStorage.getItem(this.storageKeys.reportCounter)) {
      localStorage.setItem(this.storageKeys.reportCounter, '0');
    }
  }
  // Report a failed station
  async reportFailedStation(stationData, errorDetails) {
    const reports = this.getReports();
    const overrides = this.getOverrides();
    const timestamp = new Date().toISOString();
    const reportId = this.getNextReportId();

    const stationKey = stationData.name;
    const hasOverride = overrides[stationKey] && overrides[stationKey].active;

    if (!reports[stationKey]) {
      reports[stationKey] = {
        stationName: stationData.name,
        originalUrl: hasOverride ? overrides[stationKey].originalUrl : stationData.url,
        logoUrl: stationData.logo,
        description: stationData.description,
        category: stationData.originalCategory || 'unknown',
        reports: [],
        totalReports: 0,
        firstReported: timestamp,
        lastReported: timestamp,
        status: 'reported' // reported, investigating, fixed
      };
    }

    // Add this specific report
    const report = {
      reportId,
      timestamp,
      usingOverride: hasOverride,
      overrideUrl: hasOverride ? stationData.url : null, // The URL that was actually attempted
      errorDetails: {
        primaryError: errorDetails.primaryError || 'Connection failed',
        mediaErrorCode: errorDetails.mediaErrorCode,
        mediaErrorMessage: errorDetails.mediaErrorMessage,
        networkState: errorDetails.networkState,
        readyState: errorDetails.readyState,
        connectionType: errorDetails.connectionType,
        userAgent: navigator.userAgent,
        attemptedUrls: errorDetails.attemptedUrls || [stationData.url],
        fallbackAttempts: errorDetails.fallbackAttempts || 0
      },
      browserInfo: {
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      }
    };

    reports[stationKey].reports.push(report);
    reports[stationKey].totalReports++;
    reports[stationKey].lastReported = timestamp;

    // Save to localStorage (for backward compatibility and offline mode)
    this.saveReports(reports);

    console.log(`📊 Station reported: ${stationData.name} (Report #${reports[stationKey].totalReports})${hasOverride ? ' [Using Override]' : ''}`);

    // Also send to Firebase if not in demo mode
    try {
      const firebaseReport = {
        stationName: stationData.name,
        stationUrl: stationData.url,
        originalUrl: hasOverride ? overrides[stationKey].originalUrl : stationData.url,
        logoUrl: stationData.logo,
        description: stationData.description,
        category: stationData.originalCategory || 'unknown',
        reportId,
        timestamp,
        usingOverride: hasOverride,
        overrideUrl: hasOverride ? stationData.url : null,
        errorDetails: report.errorDetails,
        browserInfo: report.browserInfo
      };

      const firebaseResult = await stationReportsAPI.submitReport(firebaseReport);

      if (!firebaseResult.demo) {
        console.log(`🔥 Report also sent to Firebase: ${firebaseResult.id}`);
      }
    } catch (firebaseError) {
      console.warn('⚠️ Failed to send report to Firebase (saved locally):', firebaseError);
      // Don't fail the whole operation if Firebase fails
    }

    return {
      success: true,
      reportId,
      totalReports: reports[stationKey].totalReports
    };
  }

  // Get all reports
  getReports() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKeys.reports)) || {};
    } catch (e) {
      console.error('Error parsing reports:', e);
      return {};
    }
  }

  // Save reports
  saveReports(reports) {
    localStorage.setItem(this.storageKeys.reports, JSON.stringify(reports));
  }

  // Get station overrides (developer-set custom URLs)
  getOverrides() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKeys.overrides)) || {};
    } catch (e) {
      console.error('Error parsing overrides:', e);
      return {};
    }
  }

  // Save station overrides
  saveOverrides(overrides) {
    localStorage.setItem(this.storageKeys.overrides, JSON.stringify(overrides));
  }

  // Set override for a station (developer function)
  setStationOverride(stationName, overrideData) {
    // Validate URL to prevent javascript: or data: injection
    if (overrideData.url && !/^https?:\/\//i.test(overrideData.url)) {
      console.warn('Rejected override URL - must start with http:// or https://', overrideData.url);
      return false;
    }

    const overrides = this.getOverrides();
    const timestamp = new Date().toISOString();

    overrides[stationName] = {
      ...overrideData,
      updatedAt: timestamp,
      originalUrl: overrideData.originalUrl,
      active: true
    };
    
    this.saveOverrides(overrides);
    
    console.log(`🔧 Override set for ${stationName}:`, overrideData);
    
    return true;
  }

  // Remove override for a station
  removeStationOverride(stationName) {
    const overrides = this.getOverrides();
    if (overrides[stationName]) {
      delete overrides[stationName];
      this.saveOverrides(overrides);
      console.log(`🔧 Override removed for ${stationName}`);
      return true;
    }
    return false;
  }

  // Get effective station data (with overrides applied)
  getEffectiveStationData(originalStationData) {
    const overrides = this.getOverrides();
    const override = overrides[originalStationData.name];
    
    if (override && override.active) {
      console.log(`🔧 Using override for ${originalStationData.name}`);
      return {
        ...originalStationData,
        url: override.url || originalStationData.url,
        logo: override.logo || originalStationData.logo,
        _hasOverride: true,
        _overrideData: override
      };
    }
    
    return originalStationData;
  }

  // Get next report ID
  getNextReportId() {
    const current = parseInt(localStorage.getItem(this.storageKeys.reportCounter) || '0');
    const next = current + 1;
    localStorage.setItem(this.storageKeys.reportCounter, next.toString());
    return next;
  }
  // Get dashboard statistics
  getDashboardStats() {
    const reports = this.getReports();
    const overrides = this.getOverrides();
    
    // Calculate solved and unsolved stations
    const stationsByStatus = Object.values(reports).reduce((acc, station) => {
      acc[station.status] = (acc[station.status] || 0) + 1;
      return acc;
    }, {});
    
    const solvedStations = (stationsByStatus.fixed || 0);
    const unsolvedStations = (stationsByStatus.reported || 0) + (stationsByStatus.investigating || 0);
    
    const stats = {
      totalStationsReported: Object.keys(reports).length,
      totalReports: Object.values(reports).reduce((sum, station) => sum + station.totalReports, 0),
      totalOverrides: Object.keys(overrides).length,
      solvedStations,
      unsolvedStations,
      mostReportedStations: Object.entries(reports)
        .sort(([,a], [,b]) => b.totalReports - a.totalReports)
        .slice(0, 10)
        .map(([name, data]) => ({
          name,
          totalReports: data.totalReports,
          lastReported: data.lastReported,
          status: data.status
        })),
      recentReports: Object.values(reports)
        .flatMap(station => 
          station.reports.map(report => ({
            stationName: station.stationName,
            reportId: report.reportId,
            timestamp: report.timestamp,
            primaryError: report.errorDetails.primaryError
          }))
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20)
    };
    
    return stats;
  }

  // Update station status (for developer dashboard)
  updateStationStatus(stationName, status, notes = '') {
    const reports = this.getReports();
    if (reports[stationName]) {
      reports[stationName].status = status;
      reports[stationName].statusNotes = notes;
      reports[stationName].statusUpdated = new Date().toISOString();
      this.saveReports(reports);
      return true;
    }
    return false;
  }

  // Export data for backup/analysis
  exportData() {
    return {
      reports: this.getReports(),
      overrides: this.getOverrides(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Import data from backup
  importData(data) {
    if (data.reports) {
      this.saveReports(data.reports);
    }
    if (data.overrides) {
      this.saveOverrides(data.overrides);
    }
    console.log('📊 Data imported successfully');
  }

  // Clear all data (nuclear option)
  clearAllData() {
    localStorage.removeItem(this.storageKeys.reports);
    localStorage.removeItem(this.storageKeys.overrides);
    localStorage.removeItem(this.storageKeys.reportCounter);
    this.initializeStorage();
    console.log('🧹 All reporting data cleared');
  }

  // Remove station completely (for developer dashboard)
  removeStation(stationName) {
    const reports = this.getReports();
    if (reports[stationName]) {
      delete reports[stationName];
      this.saveReports(reports);
      console.log(`🗑️ Station removed: ${stationName}`);
      return true;
    }
    return false;
  }
}

// Create singleton instance
export const stationReportingService = new StationReportingService();

// Export class for testing
export { StationReportingService };
