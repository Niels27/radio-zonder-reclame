// Component for reporting failed radio stations
import React, { useState } from 'react';
import { stationReportingService } from '../utils/stationReporting.js';

const ReportStationButton = ({ currentStation, error }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reported, setReported] = useState(false);

  // Add extra debugging to understand the timing
  console.log('🔍 ReportStationButton Render:', {
    timestamp: new Date().toISOString(),
    currentStation: currentStation ? {
      name: currentStation.name,
      url: currentStation.url
    } : 'NO STATION',
    error: error || 'NO ERROR',
    propsReceived: {
      currentStation: typeof currentStation,
      error: typeof error
    }
  });

  // Show button for radio connection errors - EXPANDED CONDITIONS
  const shouldShowButton = currentStation && error && (
    error.includes('verloren') ||           // Lost connection
    error.includes('niet afspelen') ||      // Cannot play
    error.includes('stream URLs failed') || // All stream URLs failed
    error.includes('CORS restrictions') ||  // CORS issues
    error.includes('offline') ||            // Station offline
    error.includes('Verbinding mislukt') || // Connection failed
    error.includes('timeout') ||            // Connection timeout
    error.includes('403') ||                // Forbidden
    error.includes('404') ||                // Not found
    error.includes('500')                   // Server error
  );

  console.log('🔍 ReportStationButton Decision:', {
    shouldShowButton,
    hasStation: !!currentStation,
    hasError: !!error,
    stationName: currentStation?.name,
    errorMessage: error
  });

  const handleReport = async () => {
    if (!currentStation || isReporting) return;

    setIsReporting(true);
    try {
      await stationReportingService.reportFailedStation(currentStation, {
        primaryError: error,
        timestamp: new Date().toISOString(),
        source: 'user_report_button',
        userAgent: navigator.userAgent,
        connectionType: navigator.connection?.effectiveType || 'unknown'
      });
      
      console.log('✅ Station reported successfully:', currentStation.name);
      setReported(true);
      
      // Reset button after 3 seconds
      setTimeout(() => setReported(false), 3000);
    } catch (error) {
      console.error('❌ Error reporting station:', error);
    } finally {
      setIsReporting(false);
    }
  };

  // Don't render if conditions aren't met
  if (!shouldShowButton) {
    console.log('🚫 ReportStationButton: Not showing button - conditions not met');
    return null;
  }

  console.log('✅ ReportStationButton: Showing button for', currentStation?.name);

  if (reported) {
    return (
      <button
        disabled
        className="ml-2 px-3 py-1 text-xs bg-green-600 text-green-100 rounded-md border border-green-500 cursor-not-allowed"
      >
        ✓ Gemeld
      </button>
    );
  }

  return (
    <button
      onClick={handleReport}
      disabled={isReporting}
      className="ml-2 px-3 py-1 text-sm bg-orange-600 text-orange-100 hover:bg-orange-500 rounded-md border border-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Melden dat radio niet werkt / Verzoek tot fixen"
    >
      {isReporting ? '...' : 'Melden dat radio niet werkt / Verzoek tot fixen'}
    </button>
  );
};

export default ReportStationButton;
