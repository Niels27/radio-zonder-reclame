// Developer Dashboard for managing radio station reports and overrides
import React, { useState, useEffect } from 'react';
import { stationReportingService } from '../utils/stationReporting';
import { getAllRadioStations, getPopularStations } from '../data/allRadioStations';
import { getIsProduction, restoreConsole, setManualProductionMode } from '../utils/logger';
import { RadioStreamTester, startRadioStreamTest } from '../utils/radioStreamTester';
// Community timings removed (ad break timing submissions)
// Station reports still work via stationReportingService

const DeveloperDashboard = ({ onClose }) => {
  // ✅ ADD: Minimize state
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [activeTab, setActiveTab] = useState('reports');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [reports, setReports] = useState({});
  const [overrides, setOverrides] = useState({});
  const [selectedStation, setSelectedStation] = useState(null);
  const [editingOverride, setEditingOverride] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [allStations, setAllStations] = useState([]);
  const [stationSearch, setStationSearch] = useState('');
  const [testingStation, setTestingStation] = useState(null);
  const [loggingEnabled, setLoggingEnabled] = useState(!getIsProduction());  const [isTestingStreams, setIsTestingStreams] = useState(false);
  const [testProgress, setTestProgress] = useState(null);  const [testResults, setTestResults] = useState(null);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = () => {
    const stats = stationReportingService.getDashboardStats();
    const allReports = stationReportingService.getReports();
    const allOverrides = stationReportingService.getOverrides();
    
    setDashboardStats(stats);
    setReports(allReports);
    setOverrides(allOverrides);

    // Load all available stations
    try {
      const stations = getAllRadioStations();
      setAllStations(stations);
    } catch (error) {
      console.error('Failed to load stations:', error);
      setAllStations([]);
    }
  };

  const handleStatusUpdate = (stationName, newStatus, notes = '') => {
    stationReportingService.updateStationStatus(stationName, newStatus, notes);
    loadData();
  };

  const handleSetOverride = (stationName, overrideData) => {
    stationReportingService.setStationOverride(stationName, overrideData);
    loadData();
    setEditingOverride(null);
  };
  const handleRemoveOverride = (stationName) => {
    stationReportingService.removeStationOverride(stationName);
    loadData();
  };

  const testStationUrl = async (station, url = null) => {
    const testUrl = url || station.url;
    setTestingStation(station.name);
    
    try {
      // Create a test audio element
      const audio = new Audio();
      
      const testPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          audio.removeEventListener('canplay', resolve);
          audio.removeEventListener('error', reject);
          reject(new Error('Timeout - station took too long to respond'));
        }, 10000); // 10 second timeout
        
        audio.addEventListener('canplay', () => {
          clearTimeout(timeout);
          resolve();
        }, { once: true });
        
        audio.addEventListener('error', (e) => {
          clearTimeout(timeout);
          reject(e.target.error || new Error('Failed to load'));
        }, { once: true });
        
        audio.src = testUrl;
      });
      
      await testPromise;
      alert(`✅ Station "${station.name}" works! URL: ${testUrl}`);
    } catch (error) {
      alert(`❌ Station "${station.name}" failed: ${error.message}\nURL: ${testUrl}`);
    } finally {
      setTestingStation(null);
    }
  };

  const exportData = () => {
    const data = stationReportingService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radio-reports-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          stationReportingService.importData(data);
          loadData();
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredReports = Object.entries(reports).filter(([_, station]) => {
    if (filterStatus === 'all') return true;
    return station.status === filterStatus;
  });

  if (!dashboardStats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-center">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ✅ ADD: Minimized floating widget
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl font-medium"
          title="Open Developer Dashboard"
        >
          🛠️ Dashboard
        </button>
      </div>
    );
  }

  // ✅ UPDATED: Full dashboard with minimize button
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">🛠️ Developer Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={exportData}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              📤 Export Data
            </button>
            <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
              📥 Import Data
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
            {/* ✅ ADD: Minimize button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              title="Minimize dashboard"
            >
              ➖ Minimize
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{dashboardStats.totalReports}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">{dashboardStats.totalStationsReported}</div>
              <div className="text-sm text-gray-600">Stations Reported</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{dashboardStats.solvedStations}</div>
              <div className="text-sm text-gray-600">Solved</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">{dashboardStats.unsolvedStations}</div>
              <div className="text-sm text-gray-600">Unsolved</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{dashboardStats.totalOverrides}</div>
              <div className="text-sm text-gray-600">Total Overrides</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'reports'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-black hover:text-gray-900'
            }`}
            style={{ color: activeTab === 'reports' ? undefined : '#000' }}
          >
            📊 Station Reports
          </button>
          <button
            onClick={() => setActiveTab('overrides')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'overrides'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-black hover:text-gray-900'
            }`}
            style={{ color: activeTab === 'overrides' ? undefined : '#000' }}
          >
            🔧 URL Overrides
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'recent'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-black hover:text-gray-900'
            }`}
            style={{ color: activeTab === 'recent' ? undefined : '#000' }}
          >
            🕒 Recent Activity
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'testing'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-black hover:text-gray-900'
            }`}
            style={{ color: activeTab === 'testing' ? undefined : '#000' }}          >
            🧪 Stream Testing
          </button>
          {/* Community Timings tab removed */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'settings'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-black hover:text-gray-900'
            }`}
            style={{ color: activeTab === 'settings' ? undefined : '#000' }}
          >
            ⚙️ Dev Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'reports' && (
            <div className="h-full flex">
              {/* Station List */}
              <div className="w-1/3 border-r overflow-y-auto">
                <div className="p-4 border-b">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 border rounded text-black"
                  >
                    <option value="all">All Stations</option>
                    <option value="reported">Reported</option>
                    <option value="investigating">Investigating</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div className="p-4">
                  {filteredReports.map(([stationName, station]) => (
                    <div
                      key={stationName}
                      onClick={() => setSelectedStation(station)}
                      className={`p-3 border rounded mb-2 cursor-pointer hover:bg-gray-50 ${
                        selectedStation?.stationName === stationName ? 'bg-blue-50 border-blue-300' : ''
                      } text-black`}
                    >
                      <div className="font-medium text-black">{stationName}</div>
                      <div className="text-sm text-black">
                        {station.totalReports} reports • {station.status}
                      </div>
                      <div className="text-xs text-black">
                        Last: {new Date(station.lastReported).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Station Details */}
              <div className="flex-1 overflow-y-auto">
                {selectedStation ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">{selectedStation.stationName}</h2>
                      <div className="flex gap-2">
                        {['reported', 'investigating', 'fixed'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(selectedStation.stationName, status)}
                            className={`px-3 py-1 text-xs rounded ${
                              selectedStation.status === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove all reports for "${selectedStation.stationName}"? This action cannot be undone.`)) {
                              stationReportingService.removeStation(selectedStation.stationName);
                              loadData();
                              setSelectedStation(null);
                            }
                          }}
                          className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          remove
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="font-medium mb-2 text-gray-900">Station Info</h3>
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-900">
                          <div><strong>Original URL:</strong> {selectedStation.originalUrl}</div>
                          <div><strong>Category:</strong> {selectedStation.category}</div>
                          <div><strong>Description:</strong> {selectedStation.description}</div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2 text-gray-900">Report Summary</h3>
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-900">
                          <div><strong>Total Reports:</strong> {selectedStation.totalReports}</div>
                          <div><strong>First Reported:</strong> {new Date(selectedStation.firstReported).toLocaleString()}</div>
                          <div><strong>Last Reported:</strong> {new Date(selectedStation.lastReported).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <button
                        onClick={() => {
                          // Get the station data from allStations
                          const stationData = allStations.find(s => s.name === selectedStation.stationName);
                          const existingOverride = overrides[selectedStation.stationName];
                          
                          setEditingOverride({
                            stationName: selectedStation.stationName,
                            name: selectedStation.stationName,
                            url: existingOverride?.url || stationData?.url || selectedStation.originalUrl || '',
                            logo: existingOverride?.logo || stationData?.logo || '',
                            originalUrl: stationData?.url || selectedStation.originalUrl || '',
                            category: stationData?.category || selectedStation.category || ''
                          });
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        🔧 Set URL Override
                      </button>
                    </div>

                    <h3 className="font-medium mb-2 text-gray-900">Individual Reports</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedStation.reports.map((report) => (
                        <div key={report.reportId} className="bg-gray-50 p-3 rounded text-sm text-gray-900">
                          <div className="flex justify-between mb-2">
                            <span><strong>Report #{report.reportId}</strong></span>
                            <span>{new Date(report.timestamp).toLocaleString()}</span>
                          </div>
                          {report.usingOverride && (
                            <div className="bg-yellow-100 p-2 rounded mb-2">
                              <div><strong>⚠️ Using Override URL:</strong> {report.overrideUrl}</div>
                              <div><strong>Original URL:</strong> {selectedStation.originalUrl}</div>
                            </div>
                          )}
                          <div><strong>Error:</strong> {report.errorDetails.primaryError}</div>
                          {report.errorDetails.mediaErrorCode && (
                            <div><strong>Media Error:</strong> {report.errorDetails.mediaErrorCode} - {report.errorDetails.mediaErrorMessage}</div>
                          )}
                          <div><strong>Attempted URLs:</strong> {report.errorDetails.attemptedUrls?.join(', ')}</div>
                          <div><strong>Browser:</strong> {report.browserInfo.platform} - {report.browserInfo.language}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a station to view details
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ ADD: Stream Testing Tab */}
          {activeTab === 'testing' && (
            <div className="p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-900">🧪 Radio Stream Testing</h2>
              
              {!isTestingStreams && !testResults && (
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    Test all radio stations to identify non-working streams. This will take 10-20 minutes.
                  </p>
                  <button
                    onClick={async () => {
                      if (confirm('Start comprehensive radio stream test? This will test all 850+ stations and may take 15-20 minutes.')) {
                        setIsTestingStreams(true);
                        setTestProgress({ tested: 0, total: 0, percentage: 0 });
                        
                        try {
                          const results = await startRadioStreamTest((progress) => {
                            setTestProgress(progress);
                          });
                          setTestResults(results);
                        } catch (error) {
                          console.error('Stream test failed:', error);
                          if (window.addNotification) {
                            window.addNotification('❌ Stream test failed: ' + error.message, 'error', 5000);
                          }
                        } finally {
                          setIsTestingStreams(false);
                        }
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
                  >
                    🧪 Start Stream Test
                  </button>
                </div>
              )}

              {isTestingStreams && testProgress && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Testing streams...</span>
                    <span className="text-sm font-mono text-gray-900">{testProgress.percentage}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${testProgress.percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Current: {testProgress.current}</div>
                    <div>Progress: {testProgress.tested} / {testProgress.total}</div>
                    <div className="flex gap-4">
                      <span className="text-green-600">✅ Working: {testProgress.working}</span>
                      <span className="text-red-600">❌ Failed: {testProgress.failed}</span>
                      <span className="text-yellow-600">⏱️ Timeout: {testProgress.timeout}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (window.radioStreamTester) {
                        window.radioStreamTester.abort();
                      }
                      setIsTestingStreams(false);
                      setTestProgress(null);
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors"
                  >
                    🛑 Abort Test
                  </button>
                </div>
              )}

              {testResults && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600">✅ Test Completed!</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="bg-gray-200 p-2 rounded text-center">
                      <div className="text-gray-900 font-bold">{testResults.tested}</div>
                      <div className="text-gray-600">Total</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded text-center">
                      <div className="text-green-600 font-bold">{testResults.working.length}</div>
                      <div className="text-gray-600">Working</div>
                    </div>
                    <div className="bg-red-100 p-2 rounded text-center">
                      <div className="text-red-600 font-bold">{testResults.failed.length}</div>
                      <div className="text-gray-600">Failed</div>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded text-center">
                      <div className="text-yellow-600 font-bold">{testResults.timeout.length}</div>
                      <div className="text-gray-600">Timeout</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    Duration: {Math.round((testResults.endTime - testResults.startTime) / 1000)} seconds
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setTestResults(null);
                        setTestProgress(null);
                      }}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                    >
                      🔄 Run New Test
                    </button>
                    
                    <button
                      onClick={() => {
                        const previous = RadioStreamTester.loadPreviousResults();
                        if (previous) {
                          setTestResults(previous);
                          if (window.addNotification) {
                            window.addNotification('📊 Previous test results loaded', 'info', 2000);
                          }
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
                    >
                      📊 Load Previous
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'overrides' && (
            <div className="h-full flex">
              {/* Station Browser */}
              <div className="w-1/2 border-r overflow-y-auto">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-bold mb-2 text-gray-900">All Stations</h2>
                  <input
                    type="text"
                    value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    placeholder="Search stations..."
                    className="w-full p-2 border rounded text-black"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {allStations.length} stations available • Search by name or URL
                  </p>
                </div>
                <div className="p-4">
                  {allStations
                    .filter(station => 
                      station.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
                      station.url.toLowerCase().includes(stationSearch.toLowerCase()) ||
                      (station.category && station.category.toLowerCase().includes(stationSearch.toLowerCase()))
                    )
                    .slice(0, 50) // Limit to first 50 results for performance
                    .map((station) => (
                    <div key={station.name} className="border rounded-lg p-3 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {station.logo && (
                            <img 
                              src={station.logo} 
                              alt={station.name}
                              className="w-8 h-8 rounded object-cover"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <div>
                            <h3 className="font-medium text-sm text-gray-900">{station.name}</h3>
                            <p className="text-xs text-gray-600">{station.category}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => testStationUrl(station)}
                            disabled={testingStation === station.name}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                            title="Test this station URL"
                          >
                            {testingStation === station.name ? '🔄' : '▶️'}
                          </button>
                          <button
                            onClick={() => setEditingOverride({ 
                                name: station.name, 
                                url: station.url, 
                                logo: station.logo,
                                originalUrl: station.url,
                                category: station.category 
                            })}
                            className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                            title="Create override for this station"
                          >
                            🔧
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-900 truncate">
                        <strong>URL:</strong> {station.url}
                      </div>
                      {overrides[station.name] && (
                        <div className="text-xs text-blue-600 mt-1">
                          ✓ Has override
                        </div>
                      )}
                    </div>
                  ))}
                  {stationSearch && allStations.filter(station => 
                    station.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
                    station.url.toLowerCase().includes(stationSearch.toLowerCase()) ||
                    (station.category && station.category.toLowerCase().includes(stationSearch.toLowerCase()))
                  ).length > 50 && (
                    <div className="text-center text-gray-600 text-sm mt-4">
                      Showing first 50 results. Use search to narrow down.
                    </div>
                  )}
                </div>
              </div>

              {/* Current Overrides */}
              <div className="w-1/2 overflow-y-auto">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-bold mb-2 text-gray-900">Active Overrides</h2>
                  <p className="text-gray-600 text-sm">
                    These URLs override the defaults from allRadioStations.js
                  </p>
                </div>
                <div className="p-4">
                  {Object.keys(overrides).length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No overrides configured</p>
                      <p className="text-sm">Use the station browser to create overrides</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(overrides).map(([stationName, override]) => (
                        <div key={stationName} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {override.logo && (
                                <img 
                                  src={override.logo} 
                                  alt={stationName}
                                  className="w-8 h-8 rounded object-cover"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              )}
                              <h3 className="font-medium text-gray-900">{stationName}</h3>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => testStationUrl({ name: stationName }, override.url)}
                                disabled={testingStation === stationName}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                                title="Test override URL"
                              >
                                {testingStation === stationName ? '🔄' : '▶️'}
                              </button>
                              <button
                                onClick={() => setEditingOverride({ stationName, ...override })}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleRemoveOverride(stationName)}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-900">
                            <div className="truncate"><strong>URL:</strong> {override.url}</div>
                            {override.originalUrl && override.originalUrl !== override.url && (
                              <div className="truncate"><strong>Original:</strong> {override.originalUrl}</div>
                            )}
                            <div><strong>Updated:</strong> {new Date(override.updatedAt).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Recent Reports</h2>
              <div className="space-y-3">
                {dashboardStats.recentReports.map((report) => (
                  <div key={`${report.stationName}-${report.reportId}`} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{report.stationName}</div>
                        <div className="text-sm text-gray-600">{report.primaryError}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>          )}

          {/* Community Timings tab removed - Firebase/ad break timing submissions feature removed */}

          {activeTab === 'settings' && (
  <div className="p-6 overflow-y-auto">
    <h2 className="text-xl font-bold mb-4 text-gray-900">Developer Settings</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900">Manual Production Mode</label>
        <p className="text-xs text-gray-600 mb-2">
          Current mode: <span className="font-bold">{getIsProduction() ? 'PRODUCTION' : 'DEVELOPMENT'}</span>
        </p>
        <button
          onClick={() => {
            const currentMode = getIsProduction();
            const newMode = !currentMode;
            setManualProductionMode(newMode);
            alert(`Production mode ${newMode ? 'ENABLED' : 'DISABLED'}.\nWas: ${currentMode ? 'Production' : 'Development'}\nNow: ${newMode ? 'Production' : 'Development'}`);
            
            // Force a reload of the logging state
            setLoggingEnabled(!newMode);
          }}
          className={`px-4 py-2 text-white rounded transition-colors ${
            getIsProduction() 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {getIsProduction() ? '🔴 Switch to Development' : '🟢 Switch to Production'}
        </button>
        <p className="text-xs text-gray-500 mt-1">
          {getIsProduction() 
            ? 'Production mode: console logs disabled, optimized performance' 
            : 'Development mode: full console logs, debug info enabled'
          }
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900">Console Logging</label>
        <p className="text-xs text-gray-600 mb-2">
          Current: <span className="font-bold">{loggingEnabled ? 'ENABLED' : 'DISABLED'}</span>
        </p>
        <button
          onClick={() => {
            const newLogging = !loggingEnabled;
            setLoggingEnabled(newLogging);
            if (newLogging) {
              restoreConsole();
              console.log('🔊 Console logging enabled');
            } else {
              console.log('🔇 Console logging will be disabled');
              // Disable console after this message
              setTimeout(() => {
                window.originalConsole = window.console;
                window.console = { log: () => {}, warn: () => {}, error: () => {} };
              }, 100);
            }
          }}
          className={`px-4 py-2 text-white rounded transition-colors ${
            loggingEnabled 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          {loggingEnabled ? '🔊 Disable Logging' : '🔇 Enable Logging'}        </button>
      </div>
      {/* Firebase Community Storage section removed */}
    </div>
  </div>
)}
        </div>

        {/* Override Edit Modal */}
        {editingOverride && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">
                {editingOverride.stationName ? 'Edit Override' : 'Set Override'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const stationName = editingOverride.stationName || editingOverride.name;
                  handleSetOverride(stationName, {
                    url: formData.get('url'),
                    logo: formData.get('logo'),
                    originalUrl: editingOverride.originalUrl
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Station Name</label>
                  <input
                    type="text"
                    value={editingOverride.stationName || editingOverride.name || ''}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-50 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New URL</label>
                  <input
                    name="url"
                    type="url"
                    defaultValue={editingOverride.url || ''}
                    required
                    className="w-full p-2 border rounded text-black"
                    placeholder="https://stream.example.com/radio.mp3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Logo URL (optional)</label>
                  <input
                    name="logo"
                    type="url"
                    defaultValue={editingOverride.logo || ''}
                    className="w-full p-2 border rounded text-black"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Override
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOverride(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperDashboard;
