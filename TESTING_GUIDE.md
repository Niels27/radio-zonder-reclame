# 🧪 Community Timing Test Guide

## **Quick Test Setup for Joy Radio**

### 1. **Open Browser Console**
- Press `F12` or right-click → Inspect → Console tab

### 2. **Available Test Functions**
Type `testFirebase()` in console to see all available functions:

```javascript
testFirebase()
```

### 3. **Generate Full Day Test Data**
This creates timing data for Joy Radio for every 30 minutes of the day:

```javascript
generateJoyRadioTestData()
```

This will create:
- **Start timings**: 25 and 55 minutes of each hour
- **End timings**: 35 and 5 minutes of each hour
- **Total**: 96 timing reports (4 per hour × 24 hours)

### 4. **Generate Quick Test Data (Current Hour)**
For faster testing, generate data just for the current hour:

```javascript
generateQuickTestData("Joy Radio")
```

### 5. **Test Different Stations**
```javascript
generateQuickTestData("Radio 538")
generateQuickTestData("Sky Radio")
```

### 6. **Check Demo/Production Mode**
```javascript
isDemoMode()  // Returns true for demo, false for production
```

### 7. **Switch Modes**
```javascript
setFirebaseDemoMode(true)   // Switch to demo mode
setFirebaseDemoMode(false)  // Switch to production mode
```

---

## **Testing Steps**

### **Step 1: Generate Test Data**
```javascript
// In browser console:
generateJoyRadioTestData()
```

### **Step 2: Verify Data in Dashboard**
1. Open Developer Dashboard (⚙️ icon)
2. Go to "Community Timings" tab
3. Should see Joy Radio with timing averages

### **Step 3: Test Auto-Switching**
1. Select Joy Radio as current station
2. Enable "Community Timings" in Ad Break Settings
3. Start ad break timer
4. Wait for timing trigger (around 25, 35, 55, or 5 minutes)
5. Should see green toast: "🌐 Community timing gebruikt voor switching"

### **Step 4: Test Report Buttons**
1. Click "Meld reclame" button on Joy Radio
2. Between 24-38 or 50-15 minutes → Buttons enabled
3. Other times → Buttons greyed out with message

---

## **Expected Results**

### **Community Timing Data:**
- Joy Radio should show consistent timings around half-hour (:30) and full-hour (:00)
- Start times: 25 and 55 minutes
- End times: 35 and 5 minutes

### **Auto-Switching:**
- When timer hits 25, 35, 55, or 5 minutes → Use community timing
- Other manual times → Use fallback timing

### **Report Buttons:**
- **Enabled**: 24-30, 30-38, 50-60, 00-15 minutes
- **Disabled**: 16-23, 39-49 minutes

---

## **Troubleshooting**

### **No Data Showing in Dashboard:**
```javascript
// Check mode
isDemoMode()

// If demo mode, try production
setFirebaseDemoMode(false)
generateJoyRadioTestData()
```

### **Firebase Errors:**
```javascript
// Check console for error messages
// Switch back to demo mode for testing
setFirebaseDemoMode(true)
generateJoyRadioTestData()
```

### **Clear Cache:**
```javascript
// Reload page to clear timing cache
location.reload()
```
