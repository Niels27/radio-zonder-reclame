// Firebase configuration for community timing storage
import { initializeApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getIsProduction } from './logger.js';

// ✅ NEW: Simple logging throttle for Firebase demo logs
let firebaseLogCache = new Map();
const FIREBASE_LOG_THROTTLE = 10 * 1000; // 10 seconds

const shouldLogFirebase = (key) => {
  const now = Date.now();
  const lastTime = firebaseLogCache.get(key) || 0;
  
  if (now - lastTime > FIREBASE_LOG_THROTTLE) {
    firebaseLogCache.set(key, now);
    return true;
  }
  return false;
};

// Firebase config (public keys - safe to expose)
const firebaseConfig = {
  apiKey: "AIzaSyB_demo_key_for_community_timings",
  authDomain: "no-ads-radio-community.firebaseapp.com",
  projectId: "no-ads-radio-community",
  storageBucket: "no-ads-radio-community.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Dynamic demo mode based on production setting
const getDemoMode = () => {
  // If user manually set firebase mode, use that
  const manualMode = localStorage.getItem('firebase_demo_mode');
  if (manualMode !== null) {
    return JSON.parse(manualMode);
  }
  
  // Otherwise, use demo mode in development, real mode in production
  return !getIsProduction();
};

// Export isDemoMode as a getter function
export const isDemoMode = () => getDemoMode();

let app = null;
let db = null;

export const initFirebase = () => {
  const isDemoMode = getDemoMode();
  
  if (isDemoMode) {
    console.log('🔥 Firebase Demo Mode - Community timings will be simulated');
    return null;
  }
  
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log('🔥 Firebase initialized for community timings');
    }
    return db;
  } catch (error) {
    console.warn('Failed to initialize Firebase:', error);
    return null;
  }
};

export const getFirestoreDB = () => {
  const isDemoMode = getDemoMode();
  if (isDemoMode) return null;
  return db || initFirebase();
};

// Manual Firebase mode control
export const setFirebaseDemoMode = (enabled) => {
  localStorage.setItem('firebase_demo_mode', JSON.stringify(enabled));
  console.log(`🔥 Firebase mode set to: ${enabled ? 'Demo' : 'Production'}`);
};

export const getFirebaseDemoMode = () => {
  return getDemoMode();
};

// Demo mode functions that simulate Firebase behavior
export const demoFirestore = {
  // Simulate storing timing reports
  collection: (collectionName) => ({
    add: async (data) => {
      console.log(`🔥 Demo: Would store in ${collectionName}:`, data);
      return { id: 'demo_' + Date.now() };
    },
    where: (field, operator, value) => ({
      orderBy: (field, direction) => ({        limit: (count) => ({
          get: async () => {
            if (shouldLogFirebase(`query_${value}`)) {
              console.log(`🔥 Demo: Would query ${collectionName} where ${field} ${operator} ${value}`);
            }
            
            // Return enhanced demo data based on station
            if (value === 'Joy Radio') {
              const currentHour = new Date().getHours();
              const demoReports = [
                {
                  id: 'demo1',
                  data: () => ({
                    station: value,
                    type: 'start',
                    minute: 25,
                    hour: currentHour,
                    timestamp: new Date().toISOString(),
                    dayOfWeek: new Date().getDay()
                  })
                },
                {
                  id: 'demo2',
                  data: () => ({
                    station: value,
                    type: 'end',
                    minute: 35,
                    hour: currentHour,
                    timestamp: new Date().toISOString(),
                    dayOfWeek: new Date().getDay()
                  })
                },
                {
                  id: 'demo3',
                  data: () => ({
                    station: value,
                    type: 'start',
                    minute: 55,
                    hour: currentHour,
                    timestamp: new Date().toISOString(),
                    dayOfWeek: new Date().getDay()
                  })
                },
                {
                  id: 'demo4',
                  data: () => ({
                    station: value,
                    type: 'end',
                    minute: 5,
                    hour: currentHour,
                    timestamp: new Date().toISOString(),
                    dayOfWeek: new Date().getDay()
                  })
                }              ];
              if (shouldLogFirebase(`joy_radio_hour_${currentHour}`)) {
                console.log(`🔥 Demo: Returning ${demoReports.length} Joy Radio timing reports for hour ${currentHour}`);
              }
              return { docs: demoReports };
            }
            
            // Default demo data for other stations
            const demoReports = [
              {
                id: 'demo1',
                data: () => ({
                  station: value,
                  type: 'start',
                  minute: 29,
                  hour: 14,
                  timestamp: new Date().toISOString(),
                  dayOfWeek: new Date().getDay()
                })
              },
              {
                id: 'demo2',
                data: () => ({
                  station: value,
                  type: 'end',
                  minute: 33,
                  hour: 14,
                  timestamp: new Date().toISOString(),
                  dayOfWeek: new Date().getDay()
                })
              }
            ];
            return { docs: demoReports };
          }
        })
      })
    })
  })
};

// ✅ NEW: Test data generator for Joy Radio community timings
export const generateJoyRadioTestData = async () => {
  console.log('🔥 Generating LIMITED test community timing data for Joy Radio...');
  
  const stationName = 'Joy Radio';
  const today = new Date();
  const currentHour = today.getHours();
  const reports = [];
  
  // ✅ OPTIMIZATION: Generate data only for current hour and next 2 hours to reduce data volume
  const hoursToGenerate = [currentHour, (currentHour + 1) % 24, (currentHour + 2) % 24];
  
  for (const hour of hoursToGenerate) {
    // Half-hour timings (around :30) - only 1 pair per hour instead of multiple
    const halfHourStart = new Date(today);
    halfHourStart.setHours(hour, 28, 0, 0); // 2 min before :30
    
    const halfHourEnd = new Date(today);
    halfHourEnd.setHours(hour, 33, 0, 0); // 3 min after :30
    
    // Full-hour timings (around :00) - only 1 pair per hour
    const fullHourStart = new Date(today);
    fullHourStart.setHours(hour, 57, 0, 0); // 3 min before :00 (previous hour)
    
    const fullHourEnd = new Date(today);
    fullHourEnd.setHours(hour, 4, 0, 0); // 4 min after :00
    
    // Create reports - only 4 reports per hour instead of many
    reports.push(
      {
        station: stationName,
        type: 'start',
        timestamp: halfHourStart.toISOString(),
        minute: 28,
        hour: hour,
        dayOfWeek: today.getDay(),
        userAgent: 'Test Data Generator (Limited)',
        version: '1.0'
      },
      {
        station: stationName,
        type: 'end',
        timestamp: halfHourEnd.toISOString(),
        minute: 33,
        hour: hour,
        dayOfWeek: today.getDay(),
        userAgent: 'Test Data Generator (Limited)',
        version: '1.0'
      },
      {
        station: stationName,
        type: 'start',
        timestamp: fullHourStart.toISOString(),
        minute: 57,
        hour: hour,
        dayOfWeek: today.getDay(),
        userAgent: 'Test Data Generator (Limited)',
        version: '1.0'
      },
      {
        station: stationName,
        type: 'end',
        timestamp: fullHourEnd.toISOString(),
        minute: 4,
        hour: (hour + 1) % 24, // End is in the next hour
        dayOfWeek: today.getDay(),        userAgent: 'Test Data Generator (Limited)',
        version: '1.0'
      }
    );
  }
  
  try {
    if (isDemoMode()) {
      console.log('🔥 Demo Mode: Simulating Firebase writes for Joy Radio test data');
      
      // ✅ OPTIMIZATION: Clear existing test data first to prevent accumulation
      const existingData = await demoFirestore.collection('timing_reports')
        .where('station', '==', stationName)
        .where('userAgent', '==', 'Test Data Generator (Limited)')
        .get();
      
      console.log(`🔥 Clearing ${existingData.docs.length} existing test reports`);
      for (const doc of existingData.docs) {
        await demoFirestore.collection('timing_reports').doc(doc.id).delete();
      }
      
      for (const report of reports) {
        await demoFirestore.collection('timing_reports').add(report);
      }
      console.log(`🔥 Demo: Generated ${reports.length} LIMITED test timing reports for ${stationName} (current hour +2)`);
    } else {
      const db = getFirestoreDB();
      if (!db) {
        console.error('❌ Firebase not available for test data generation');
        return;
      }
      
      const { collection, addDoc } = await import('firebase/firestore');
      
      for (const report of reports) {
        await addDoc(collection(db, 'timing_reports'), report);
        console.log('🔥 Added test report:', report);
      }
      
      console.log(`🔥 Production: Generated ${reports.length} LIMITED test timing reports for ${stationName}`);
    }
    
    if (window.addNotification) {
      window.addNotification(
        `✅ Generated ${reports.length} LIMITED test timings for ${stationName} (current hour +2)`, 
        'success', 
        4000
      );
    }
    
  } catch (error) {
    console.error('❌ Failed to generate test data:', error);
    if (window.addNotification) {
      window.addNotification(`❌ Failed to generate test data: ${error.message}`, 'error', 5000);
    }
  }
};

// ✅ NEW: Quick test function for current hour
export const generateQuickTestData = async (stationName = 'Joy Radio') => {
  console.log(`🔥 Generating quick test data for ${stationName}...`);
  
  const now = new Date();
  const currentHour = now.getHours();
  
  const reports = [
    // Half-hour start (25 minutes)
    {
      station: stationName,
      type: 'start',
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, 25).toISOString(),
      minute: 25,
      hour: currentHour,
      dayOfWeek: now.getDay(),
      userAgent: 'Quick Test Generator',
      version: '1.0'
    },
    // Half-hour end (35 minutes)
    {
      station: stationName,
      type: 'end',
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, 35).toISOString(),
      minute: 35,
      hour: currentHour,
      dayOfWeek: now.getDay(),
      userAgent: 'Quick Test Generator',
      version: '1.0'
    },
    // Full-hour start (55 minutes of previous hour)
    {
      station: stationName,
      type: 'start',
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, 55).toISOString(),
      minute: 55,
      hour: currentHour,
      dayOfWeek: now.getDay(),
      userAgent: 'Quick Test Generator',
      version: '1.0'
    },
    // Full-hour end (5 minutes of current hour)
    {
      station: stationName,
      type: 'end',
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, 5).toISOString(),
      minute: 5,
      hour: currentHour,
      dayOfWeek: now.getDay(),
      userAgent: 'Quick Test Generator',
      version: '1.0'
    }
  ];
  
  try {
    if (isDemoMode()) {
      for (const report of reports) {
        await demoFirestore.collection('timing_reports').add(report);
      }
      console.log(`🔥 Demo: Added ${reports.length} quick test reports for ${stationName}`);
    } else {
      const db = getFirestoreDB();
      if (!db) {
        console.error('❌ Firebase not available for quick test data');
        return;
      }
      
      const { collection, addDoc } = await import('firebase/firestore');
      
      for (const report of reports) {
        await addDoc(collection(db, 'timing_reports'), report);
        console.log('🔥 Added quick test report:', report);
      }
      
      console.log(`🔥 Production: Added ${reports.length} quick test reports for ${stationName}`);
    }
    
    if (window.addNotification) {
      window.addNotification(
        `✅ Added ${reports.length} quick test timings for ${stationName} (hour ${currentHour})`, 
        'success', 
        4000
      );
    }
    
  } catch (error) {
    console.error('❌ Failed to generate quick test data:', error);
    if (window.addNotification) {
      window.addNotification(`❌ Failed to generate quick test data: ${error.message}`, 'error', 5000);
    }
  }
};

// ✅ NEW: Expose test functions to global console for easy access
if (typeof window !== 'undefined') {
  window.generateJoyRadioTestData = generateJoyRadioTestData;
  window.generateQuickTestData = generateQuickTestData;
  window.testFirebase = () => {
    console.log('🔥 Firebase Test Functions Available:');
    console.log('  generateJoyRadioTestData() - Generate full day of test data for Joy Radio');
    console.log('  generateQuickTestData("Station Name") - Generate test data for current hour');
    console.log('  isDemoMode() - Check if in demo mode');
    console.log('  setFirebaseDemoMode(true/false) - Switch between demo/production mode');
  };
}
