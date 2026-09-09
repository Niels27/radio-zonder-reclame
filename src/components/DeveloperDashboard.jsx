// Developer Dashboard - internal tools for stream testing and runtime debug toggles.
// Opened via the hidden triple-click target in App.jsx when localStorage.dev_mode === 'true'.
import React, { useState } from 'react';
import { getIsProduction, restoreConsole, setManualProductionMode } from '../utils/logger';
import { RadioStreamTester, startRadioStreamTest } from '../utils/radioStreamTester';
import { notify } from '../utils/eventBus';

const DeveloperDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('testing');
  const [loggingEnabled, setLoggingEnabled] = useState(!getIsProduction());

  const [isTestingStreams, setIsTestingStreams] = useState(false);
  const [testProgress, setTestProgress] = useState(null);
  const [testResults, setTestResults] = useState(null);

  const tabClass = (tab) =>
    `px-6 py-3 font-medium ${
      activeTab === tab
        ? 'border-b-2 border-blue-600 text-blue-600'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl h-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">🛠️ Developer Dashboard</h1>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ✕ Close
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button onClick={() => setActiveTab('testing')} className={tabClass('testing')}>
            🧪 Stream Testing
          </button>
          <button onClick={() => setActiveTab('settings')} className={tabClass('settings')}>
            ⚙️ Dev Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'testing' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">🧪 Radio Stream Testing</h2>

              {!isTestingStreams && !testResults && (
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    Test every radio station to find dead streams. Takes 15-20 minutes.
                  </p>
                  <button
                    onClick={async () => {
                      if (!confirm('Start a full radio stream test? This checks all stations and can take 15-20 minutes.')) return;
                      setIsTestingStreams(true);
                      setTestProgress({ tested: 0, total: 0, percentage: 0 });
                      try {
                        const results = await startRadioStreamTest(setTestProgress);
                        setTestResults(results);
                      } catch (error) {
                        console.error('Stream test failed:', error);
                        notify('❌ Stream test failed: ' + error.message, 'error', 5000);
                      } finally {
                        setIsTestingStreams(false);
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
                  >
                    🧪 Start Stream Test
                  </button>
                  <div>
                    <button
                      onClick={() => {
                        const previous = RadioStreamTester.loadPreviousResults();
                        if (previous) {
                          setTestResults(previous);
                          notify('📊 Previous test results loaded', 'info', 2000);
                        } else {
                          notify('No previous results found', 'info', 2000);
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
                    >
                      📊 Load Previous Results
                    </button>
                  </div>
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
                      if (window.radioStreamTester) window.radioStreamTester.abort();
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
                  <h4 className="font-semibold text-green-600">✅ Test Completed</h4>
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
                  <button
                    onClick={() => {
                      setTestResults(null);
                      setTestProgress(null);
                    }}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    🔄 Run New Test
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Developer Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Manual Production Mode</label>
                  <p className="text-xs text-gray-600 mb-2">
                    Current mode: <span className="font-bold">{getIsProduction() ? 'PRODUCTION' : 'DEVELOPMENT'}</span>
                  </p>
                  <button
                    onClick={() => {
                      const newMode = !getIsProduction();
                      setManualProductionMode(newMode);
                      setLoggingEnabled(!newMode);
                      alert(`Production mode ${newMode ? 'ENABLED' : 'DISABLED'}. Refresh to fully apply.`);
                    }}
                    className={`px-4 py-2 text-white rounded transition-colors ${
                      getIsProduction() ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {getIsProduction() ? '🔴 Switch to Development' : '🟢 Switch to Production'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Production: console logs disabled. Development: full logs enabled.
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
                        setTimeout(() => {
                          window.console = { log: () => {}, warn: () => {}, error: () => {} };
                        }, 100);
                      }
                    }}
                    className={`px-4 py-2 text-white rounded transition-colors ${
                      loggingEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    {loggingEnabled ? '🔊 Disable Logging' : '🔇 Enable Logging'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
