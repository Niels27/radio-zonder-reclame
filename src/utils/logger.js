/**
 * Production Logging Control System
 * 
 * This logger automatically disables console output in production environments while
 * keeping full logging during development. It provides multiple ways to control logging:
 * 
 * AUTOMATIC DETECTION:
 * - Vite production builds (import.meta.env.PROD)
 * - GitHub Pages deployment (*.github.io domains)
 * - Non-localhost domains (not 127.0.0.1, localhost, or 192.168.*)
 * - NODE_ENV=production
 * 
 * MANUAL CONTROL:
 * 1. Code flag: Set `manualProductionFlag = true` in this file
 * 2. Browser console: Call `window.enableLogging()` or `window.disableLogging()`
 * 3. Persistent setting: Uses localStorage to remember manual overrides
 * 4. YouTube-specific: Call `window.setAggressiveYouTubeLogging(true)` for YouTube error reduction
 * 
 * DEBUGGING IN PRODUCTION:
 * - Call `window.enableLogging()` in browser console to restore logs
 * - Call `window.restoreConsole()` to restore for current session only
 * - Logs are preserved for errors by default (can be disabled by uncommenting line)
 * 
 * YOUTUBE ERROR SPAM PREVENTION:
 * - YouTube production mode provides aggressive logging reduction
 * - Prevents YouTube embedding errors from consuming RAM
 * - Use `getIsYouTubeProductionMode()` in YouTube utilities
 * 
 * USAGE:
 * Import and call `initializeLogging()` early in main.jsx before any other code runs.
 * All subsequent console.log, console.info, console.warn, etc. will be controlled.
 */

// Production logging control - disables console logs in production builds

// Auto-detect production mode from various indicators
const isProductionBuild = () => {
  // 1. Vite production mode check
  if (import.meta.env && import.meta.env.PROD) {
    return true;
  }
  
  // 2. GitHub Pages deployment check (typical domain patterns)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('github.io') || hostname.includes('githubusercontent.com')) {
      return true;
    }
    
    // 3. Check if not localhost or local development
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
      return true;
    }
  }
  
  // 4. NODE_ENV check (if available)
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    return true;
  }
  
  return false;
};

// Manual override flag (can be set to true to force production mode)
// CHANGE THIS TO TRUE TO MANUALLY DISABLE LOGS:
const manualProductionFlag = false; // Set to true to manually disable logs

// Check for manual override from localStorage (persistent setting)
const getManualOverride = () => {
  if (typeof window !== 'undefined') {
    const manualOverride = localStorage.getItem('forceProductionLogging');
    return manualOverride === 'true';
  }
  return false;
};

// Determine if we should disable logging
const isProduction = manualProductionFlag || getManualOverride() || isProductionBuild();

// Store original console methods before potentially overriding them
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  trace: console.trace
};

// Initialize logging control
export const initializeLogging = () => {
  const productionStatus = isProduction;
  
  if (productionStatus) {
    console.log('🔕 Production mode detected - disabling console logs');
    console.log(`📍 Detection method: ${
      manualProductionFlag ? 'Manual flag' : 
      getManualOverride() ? 'LocalStorage override' : 
      'Auto-detected production environment'
    }`);
    
    // Override console methods to be silent in production
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.debug = () => {};
    console.trace = () => {};
    
    // Keep console.error for critical issues in production
    // Comment out the line below if you want to disable ALL logging including errors
    // console.error = () => {};
    
    return true; // Logging disabled
  } else {
    console.log('🔊 Development mode detected - keeping console logs enabled');
    console.log(`📍 Environment: ${window.location.hostname}`);
    return false; // Logging enabled
  }
};

// Utility to restore console methods (useful for debugging)
export const restoreConsole = () => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
  console.trace = originalConsole.trace;
};

// Export current production status
export const getIsProduction = () => isProduction;

// YouTube-specific production mode check for aggressive logging reduction
export const getIsYouTubeProductionMode = () => {
  // In production or when specifically enabled, use aggressive YouTube logging reduction
  return isProduction || localStorage.getItem('aggressiveYouTubeLogging') === 'true';
};

// Manual control for YouTube logging specifically
export const setAggressiveYouTubeLogging = (enabled) => {
  localStorage.setItem('aggressiveYouTubeLogging', enabled.toString());
  console.log(`🎵 Aggressive YouTube logging ${enabled ? 'enabled' : 'disabled'} - refresh page to apply`);
};

// Export manual control
export const setManualProductionMode = (enabled) => {
  // This would require a page refresh to take effect
  localStorage.setItem('forceProductionLogging', enabled.toString());
  console.log(`🔧 Manual production logging ${enabled ? 'enabled' : 'disabled'} - refresh page to apply`);
};

// Utility function to quickly enable/disable logging from browser console
export const enableLogging = () => {
  setManualProductionMode(false);
  restoreConsole();
  console.log('🔊 Logging restored for this session');
};

export const disableLogging = () => {
  setManualProductionMode(true);
  console.log('🔕 Logging will be disabled after page refresh');
};

// Make utilities available globally for debugging
if (typeof window !== 'undefined') {
  window.enableLogging = enableLogging;
  window.disableLogging = disableLogging;
  window.restoreConsole = restoreConsole;
  window.setAggressiveYouTubeLogging = setAggressiveYouTubeLogging;
}

// Check for manual override from localStorage
if (typeof window !== 'undefined') {
  const manualOverride = localStorage.getItem('forceProductionLogging');
  if (manualOverride === 'true') {
    console.log('📋 Manual production logging override detected from localStorage');
  }
}
