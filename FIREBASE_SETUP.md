# Firebase Setup Guide for Station Reporting

This guide will help you set up Firebase to collect station failure reports from your users.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "no-ads-radio")
4. Disable Google Analytics (not needed for this)
5. Click "Create project"

## Step 2: Set Up Firestore Database

1. In your Firebase project, click "Firestore Database" in the left menu
2. Click "Create database"
3. **Production mode** (recommended) - More secure, requires security rules
4. Choose a location (e.g., `eur3` for Europe)
5. Click "Enable"

### Set Up Security Rules

Once the database is created, go to the "Rules" tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to write station reports (anonymous reporting)
    match /station_reports/{reportId} {
      allow write: if true;
      allow read: if false; // Only you can read via Firebase Console
    }
  }
}
```

Click "Publish" to save the rules.

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the **Web** icon (`</>`) to add a web app
5. Enter app nickname (e.g., "No Ads Radio Web")
6. **Don't** check "Also set up Firebase Hosting"
7. Click "Register app"
8. Copy the `firebaseConfig` object

## Step 4: Update Your Code

Open `src/utils/firebase.js` and replace the placeholder config with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  // Your actual API key
  authDomain: "your-project.firebaseapp.com",     // Your actual domain
  projectId: "your-project-id",                    // Your actual project ID
  storageBucket: "your-project.appspot.com",      // Your actual bucket
  messagingSenderId: "123456789012",              // Your actual sender ID
  appId: "1:123456789012:web:abcdef123456789"     // Your actual app ID
};
```

## Step 5: Build and Deploy

```bash
npm run build
```

The app will now send reports to Firebase!

## Testing

### Demo Mode (Default)
- By default, Firebase runs in **demo mode** when config isn't set up
- Reports are saved to localStorage only
- Console shows: `🔥 Firebase Demo Mode - Station reports will be saved locally only`

### Production Mode (After Setup)
- Once you add your Firebase config, it will automatically detect and use Firebase
- Console shows: `🔥 Firebase initialized for station reporting`
- Reports are sent to both localStorage AND Firebase

### Manual Mode Toggle
You can manually switch modes in browser console:

```javascript
// Switch to demo mode (localStorage only)
window.setFirebaseDemoMode(true)

// Switch to production mode (Firebase)
window.setFirebaseDemoMode(false)

// Check current mode
window.getFirebaseDemoMode()
```

## Viewing Reports

### Option 1: Firebase Console (Recommended)
1. Go to Firebase Console → Firestore Database
2. Click on `station_reports` collection
3. View all reports with full details

### Option 2: Export Data Programmatically
In browser console:

```javascript
// Get all reports from Firebase
const reports = await stationReportsAPI.getAllReports(100);
console.table(reports);

// Get reports for specific station
const slamnl = await stationReportsAPI.getStationReports('SLAM!', 10);
console.table(slamnl);
```

## Data Structure

Each report in Firebase contains:

```javascript
{
  // Station info
  stationName: "SLAM!",
  stationUrl: "https://...",
  logoUrl: "https://...",
  description: "...",
  category: "dance",

  // Report metadata
  reportId: 123,
  timestamp: "2025-01-15T10:30:00.000Z",
  createdAt: "2025-01-15T10:30:00.000Z",

  // Error details
  errorDetails: {
    primaryError: "Verbindingsfout - kan radio niet laden",
    connectionType: "4g",
    userAgent: "Mozilla/5.0...",
    attemptedUrls: ["https://..."],
    // ... more technical details
  },

  // Browser info
  browserInfo: {
    platform: "Win32",
    language: "nl-NL",
    cookieEnabled: true,
    onLine: true
  }
}
```

## Security Notes

- The API key in `firebaseConfig` is **safe to expose** in client-side code
- Security is handled by Firestore security rules (see Step 2)
- Users can write reports but cannot read other users' reports
- Only you (as admin) can read reports via Firebase Console

## Cost

Firebase free tier includes:
- 50,000 document reads/day
- 20,000 document writes/day
- 1 GB storage

This is more than enough for station reporting. You'll likely never hit these limits.

## Troubleshooting

### "Firebase initialization failed"
- Check that your `firebaseConfig` is correct
- Check browser console for specific error
- App will automatically fall back to demo mode

### Reports not appearing in Firebase
- Check Firestore security rules are published
- Open browser console and look for `🔥 Report also sent to Firebase: xxx`
- If you see `🔥 Firebase Demo Mode`, config isn't set up yet

### Want to clear all local data?
In browser console:
```javascript
stationReportingService.clearAllData()
```

## Next Steps

After setup, you can:
1. Monitor which stations users report most
2. Fix broken stations and update your station list
3. Use `setStationOverride()` to provide working URLs for broken stations
4. Build a dashboard to visualize reports (optional)
