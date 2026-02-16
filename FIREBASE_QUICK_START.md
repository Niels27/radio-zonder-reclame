# Firebase Quick Start 🚀

## TL;DR

Your app now has Firebase integration for collecting station failure reports!

**Current Status:** Running in **demo mode** (localStorage only)

**To enable Firebase:** Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

## What Changed?

### ✅ Fixed Issues:
1. **Loading indicator bug** - No longer shows forever after ad breaks
2. **Report button** - Text changed to "Meld niet werkende radio" and persists until station change

### ✅ Added Firebase:
1. **[src/utils/firebase.js](src/utils/firebase.js)** - Firebase configuration and API
2. **Updated [src/utils/stationReporting.js](src/utils/stationReporting.js)** - Now sends reports to Firebase
3. **Firebase SDK installed** - `npm install firebase` (already done)

---

## How It Works

### Demo Mode (Current - No Setup Needed)
- Reports saved to **browser localStorage**
- Console shows: `🔥 Firebase Demo Mode`
- Works offline, perfect for development
- **You can't see other users' reports**

### Production Mode (After Firebase Setup)
- Reports sent to **Firebase Firestore**
- Console shows: `🔥 Firebase initialized for station reporting`
- Also saves to localStorage as backup
- **You can see ALL users' reports in Firebase Console**

---

## Testing in Browser Console

```javascript
// Check if Firebase is enabled
window.getFirebaseDemoMode()
// Returns: true (demo) or false (production)

// Toggle Firebase mode
window.setFirebaseDemoMode(true)   // Switch to demo mode
window.setFirebaseDemoMode(false)  // Switch to production mode

// View all reports (if Firebase is set up)
const reports = await window.stationReportsAPI.getAllReports(100)
console.table(reports)

// View reports for specific station
const slam = await window.stationReportsAPI.getStationReports('SLAM!', 10)
console.table(slam)

// Export local reports
stationReportingService.exportData()
```

---

## What Users See

When a radio fails to load:
1. Error message appears: **"Verbindingsfout - kan radio niet laden"**
2. Orange button appears: **"Meld niet werkende radio"**
3. User clicks button → Report sent
4. Button changes to green: **"✓ Gemeld"**
5. Button persists until user switches to another station

---

## What You See (Developer)

### Without Firebase (Demo Mode):
- Reports in browser localStorage only
- Open DevTools → Application → Local Storage → `radio_station_reports`

### With Firebase (Production Mode):
- Reports in Firebase Console
- Go to: https://console.firebase.google.com/
- Navigate to: Firestore Database → `station_reports` collection
- See all reports from all users with full details

---

## Next Steps

### To Deploy with Firebase:
1. Read [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) (5 minutes)
2. Create Firebase project
3. Update [src/utils/firebase.js](src/utils/firebase.js) with your config
4. Build: `npm run build`
5. Deploy your `dist/` folder

### To Deploy Without Firebase:
- Just deploy as-is!
- Reports will be saved to each user's localStorage
- You won't see reports, but the feature still works for users

---

## Files Modified

1. **[src/hooks/useAudio.js](src/hooks/useAudio.js)** - Fixed loading indicator
2. **[src/components/ReportStationButton.jsx](src/components/ReportStationButton.jsx)** - Updated button text and persistence
3. **[src/utils/firebase.js](src/utils/firebase.js)** - NEW: Firebase integration
4. **[src/utils/stationReporting.js](src/utils/stationReporting.js)** - Added Firebase support
5. **[src/App.jsx](src/App.jsx)** - Exposed Firebase utilities to window
6. **[package.json](package.json)** - Added Firebase dependency

---

## Questions?

- **"Do I need Firebase?"** - Only if you want to see reports from all users
- **"Is it secure?"** - Yes, Firebase security rules prevent users from reading other reports
- **"What does it cost?"** - Free tier is plenty (50k reads, 20k writes per day)
- **"Can I test without Firebase?"** - Yes! It's in demo mode by default
