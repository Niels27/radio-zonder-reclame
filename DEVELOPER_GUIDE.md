# Developer Guide - Station Reporting System

## Overview
This radio app now includes a comprehensive station reporting system that allows users to report non-working radio stations and provides developers with tools to manage station overrides and track issues.

## Features Implemented

### 1. Station Report Button
- **Location**: Appears next to radio connection error messages in the audio player
- **Text**: "Melden dat deze radio niet werkt"
- **Functionality**: 
  - Only shows for radio connection errors (not playlist errors)
  - Only appears when there's a current station and the error mentions "verloren"
  - Captures detailed error information including timestamps, browser info, and error details
  - Shows confirmation feedback when report is submitted

### 2. Developer Dashboard
- **Access**: Press `Ctrl+Shift+D` anywhere in the app
- **Functionality**:
  - View all reported stations with detailed statistics
  - Manage station URL and logo overrides
  - Filter stations by status (reported, investigating, fixed, ignored)
  - Export/import reporting data
  - Update station status with notes

## How to Use

### For Users
1. When a radio station fails to connect, an error message will appear
2. If the error is a connection issue, a "Melden dat deze radio niet werkt" button will appear
3. Click the button to report the station as non-working
4. The button will show "✓ Gemeld" for 3 seconds to confirm the report

### For Developers
1. Press `Ctrl+Shift+D` to open the Developer Dashboard
2. Use the tabs to navigate between:
   - **Station Reports**: View reported stations and manage their status
   - **URL Overrides**: Create custom URLs and logos for stations
   - **Recent Activity**: View recent reporting activity

#### Managing Station Reports
- Click on any station in the list to view detailed information
- Update status: reported → investigating → fixed/ignored
- Add notes to track investigation progress

#### Creating Station Overrides
- Click "Add Override" to create a new station override
- Enter station name, custom URL, and optional logo URL
- Overrides take precedence over original station data

## Data Storage
- All data is stored in localStorage with the following keys:
  - `radio_station_reports`: User reports and station issues
  - `radio_station_overrides`: Developer-defined URL/logo overrides
  - `radio_report_counter`: Global counter for report IDs

## Technical Details

### Report Data Structure
Each station report includes:
```javascript
{
  stationName: "Station Name",
  originalUrl: "original-stream-url",
  logoUrl: "logo-url",
  description: "station description",
  category: "station category",
  reports: [
    {
      reportId: 1,
      timestamp: "ISO timestamp",
      errorCode: "media error code",
      errorMessage: "error details",
      browserInfo: "user agent string",
      source: "audio_player"
    }
  ],
  totalReports: 1,
  firstReported: "ISO timestamp",
  lastReported: "ISO timestamp",
  status: "reported" // reported, investigating, fixed, ignored
}
```

### Override Data Structure
```javascript
{
  "Station Name": {
    url: "custom-stream-url",
    logo: "custom-logo-url",
    active: true,
    createdAt: "ISO timestamp",
    updatedAt: "ISO timestamp"
  }
}
```

## Files Modified/Created

### Modified Files
- `src/components/AudioPlayer.jsx`: Added ReportStationButton integration
- `src/App.jsx`: Added keyboard shortcut and DeveloperDashboard component

### Existing Infrastructure (Already Present)
- `src/components/ReportStationButton.jsx`: Report button component
- `src/components/DeveloperDashboard.jsx`: Complete dashboard interface
- `src/utils/stationReporting.js`: Reporting service with full functionality

## Benefits for Maintenance
1. **User-Driven Issue Detection**: Users can easily report problematic stations
2. **Centralized Management**: All station issues and overrides in one dashboard
3. **No Code Changes Required**: Fix stations by creating overrides instead of editing source code
4. **Data Persistence**: All reports and overrides survive app updates
5. **Export/Import**: Backup and restore reporting data as needed

## Future Enhancements
- Automatic station health monitoring
- Integration with external station APIs
- Batch station URL updates
- Analytics on most reported stations
- Email notifications for critical issues
