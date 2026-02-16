// Component for reporting failed radio stations
import React, { useState, useEffect, useRef } from 'react';
import { stationReportingService } from '../utils/stationReporting.js';

const ReportStationButton = ({ currentStation, error }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const lastStationRef = useRef(null);

  // Track when station changes - reset failed state immediately
  useEffect(() => {
    const stationId = currentStation ? `${currentStation.name}-${currentStation.url}` : null;

    // If station changed, reset failed state immediately
    if (stationId !== lastStationRef.current) {
      lastStationRef.current = stationId;
      setHasFailed(false);
      setReported(false);
    }
  }, [currentStation]);

  // Track when error occurs - mark as failed
  // Also clear failed state when error clears (station successfully plays)
  useEffect(() => {
    if (!error) {
      // No error - station is playing successfully, clear failed state
      setHasFailed(false);
      setReported(false);
    } else if (currentStation && (
      error.includes('verloren') ||           // Lost connection
      error.includes('niet afspelen') ||      // Cannot play
      error.includes('stream URLs failed') || // All stream URLs failed
      error.includes('CORS restrictions') ||  // CORS issues
      error.includes('offline') ||            // Station offline
      error.includes('Verbinding mislukt') || // Connection failed
      error.includes('Verbindingsfout') ||    // Connection error (main error)
      error.includes('verbinding timeout') || // Timeout error
      error.includes('alle streams geprobeerd') || // All streams failed
      error.includes('timeout') ||            // Connection timeout
      error.includes('403') ||                // Forbidden
      error.includes('404') ||                // Not found
      error.includes('500')                   // Server error
    )) {
      setHasFailed(true);
    }
  }, [currentStation, error]);

  // Show button if station has failed, regardless of current error state
  const shouldShowButton = currentStation && hasFailed;

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
    return null;
  }

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
      title="Meld niet werkende radio"
    >
      {isReporting ? '...' : 'Meld niet werkende radio'}
    </button>
  );
};

export default ReportStationButton;
