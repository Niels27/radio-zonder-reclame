// ✅ FIREBASE TEST DATA GENERATOR FOR JOY RADIO
// Copy and paste these commands into your browser console to test community timings

// 1. Check available test functions
testFirebase()

// 2. Generate full day of test data for Joy Radio (every 30 minutes)
generateJoyRadioTestData()

// 3. Generate quick test data for current hour only
generateQuickTestData("Joy Radio")

// 4. Check if you're in demo or production mode
isDemoMode()

// 5. Switch between modes
setFirebaseDemoMode(true)   // Demo mode
setFirebaseDemoMode(false)  // Production mode

// 6. Test other stations
generateQuickTestData("Radio 538")
generateQuickTestData("Sky Radio")

// WHAT THE TEST DATA CREATES:
// For each hour (0-23), it creates 4 timing reports:
// - Start at minute 25 (5 min before half-hour)
// - End at minute 35 (5 min after half-hour)  
// - Start at minute 55 (5 min before full-hour)
// - End at minute 5 (5 min after full-hour)

// TESTING STEPS:
// 1. Run generateJoyRadioTestData() in console
// 2. Select Joy Radio as current station
// 3. Enable "Community Timings" in Ad Break Settings  
// 4. Start ad break timer
// 5. Wait for automatic switching at 25, 35, 55, or 5 minutes
// 6. Should see green toast: "Community timing gebruikt voor switching"

// REPORT BUTTON TESTING:
// - Buttons enabled: 24-30, 30-38, 50-60, 00-15 minutes
// - Buttons disabled: Other times (grey with tooltip)
