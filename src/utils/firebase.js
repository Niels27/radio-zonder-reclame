// Firebase configuration for station failure reporting
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Firebase config (you'll need to replace these with your actual Firebase project credentials)
// Get these from: https://console.firebase.google.com/ -> Project Settings -> General
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Check if running in demo mode (for development without Firebase)
const getDemoMode = () => {
  const manualMode = localStorage.getItem('firebase_demo_mode');
  if (manualMode !== null) {
    return JSON.parse(manualMode);
  }

  // Default to demo mode if config hasn't been set up yet
  return firebaseConfig.apiKey === "YOUR_API_KEY_HERE";
};

export const isDemoMode = () => getDemoMode();

let app = null;
let db = null;

// Initialize Firebase
export const initFirebase = () => {
  if (getDemoMode()) {
    console.log('🔥 Firebase Demo Mode - Station reports will be saved locally only');
    return null;
  }

  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log('🔥 Firebase initialized for station reporting');
    }
    return db;
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed, falling back to demo mode:', error);
    localStorage.setItem('firebase_demo_mode', 'true');
    return null;
  }
};

// Get Firestore database instance
export const getFirestoreDB = () => {
  if (getDemoMode()) return null;
  return db || initFirebase();
};

// Manual Firebase mode control (for testing)
export const setFirebaseDemoMode = (enabled) => {
  localStorage.setItem('firebase_demo_mode', JSON.stringify(enabled));
  console.log(`🔥 Firebase mode set to: ${enabled ? 'Demo (localStorage)' : 'Production (Firestore)'}`);
  window.location.reload(); // Reload to reinitialize
};

export const getFirebaseDemoMode = () => {
  return getDemoMode();
};

// Station Reports API - Real Firebase functions
export const stationReportsAPI = {
  // Submit a failed station report
  async submitReport(reportData) {
    const db = getFirestoreDB();

    if (!db) {
      console.log('🔥 Demo: Would submit report:', reportData);
      return { id: 'demo_' + Date.now(), demo: true };
    }

    try {
      const docRef = await addDoc(collection(db, 'station_reports'), {
        ...reportData,
        createdAt: new Date().toISOString(),
        version: '1.0'
      });

      console.log('✅ Report submitted to Firebase:', docRef.id);
      return { id: docRef.id, demo: false };
    } catch (error) {
      console.error('❌ Firebase report submission failed:', error);
      throw error;
    }
  },

  // Get recent reports for a specific station (for analytics/debugging)
  async getStationReports(stationName, maxResults = 10) {
    const db = getFirestoreDB();

    if (!db) {
      console.log('🔥 Demo: Would query reports for:', stationName);
      return [];
    }

    try {
      const q = query(
        collection(db, 'station_reports'),
        where('stationName', '==', stationName),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );

      const querySnapshot = await getDocs(q);
      const reports = [];

      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return reports;
    } catch (error) {
      console.error('❌ Firebase query failed:', error);
      return [];
    }
  },

  // Get all reports (for developer dashboard)
  async getAllReports(maxResults = 100) {
    const db = getFirestoreDB();

    if (!db) {
      console.log('🔥 Demo: Would query all reports');
      return [];
    }

    try {
      const q = query(
        collection(db, 'station_reports'),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );

      const querySnapshot = await getDocs(q);
      const reports = [];

      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return reports;
    } catch (error) {
      console.error('❌ Firebase query failed:', error);
      return [];
    }
  }
};

// Initialize Firebase when module loads
initFirebase();
