// Firebase configuration for community timing storage
import { initializeApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getIsProduction } from './logger.js';

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
      orderBy: (field, direction) => ({
        limit: (count) => ({
          get: async () => {
            console.log(`🔥 Demo: Would query ${collectionName} where ${field} ${operator} ${value}`);
            // Return some demo data for testing
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
    })  })
};
