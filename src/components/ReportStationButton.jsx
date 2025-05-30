// Component for reporting failed radio stations
import React, { useState } from 'react';
import { stationReportingService } from '../utils/stationReporting';

const ReportStationButton = ({ station, errorDetails, onReported }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const handleReport = async () => {
    if (isReporting || reported) return;
    
    setIsReporting(true);
    
    try {
      const result = stationReportingService.reportFailedStation(station, errorDetails);
      
      if (result.success) {
        setReported(true);
        console.log(`✅ Station reported: ${station.name} (Total reports: ${result.totalReports})`);
        
        // Call callback if provided
        if (onReported) {
          onReported(result);
        }
        
        // Auto-hide the "reported" state after 3 seconds
        setTimeout(() => {
          setReported(false);
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Error reporting station:', error);
    } finally {
      setIsReporting(false);
    }
  };
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
      className="ml-2 px-3 py-1 text-xs bg-orange-600 text-orange-100 hover:bg-orange-500 rounded-md border border-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Meld deze radio als niet werkend"
    >
      {isReporting ? '...' : 'Melden dat deze radio niet werkt'}
    </button>
  );
};

export default ReportStationButton;
