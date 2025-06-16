// QUICK TEST SCRIPT - Copy and paste into browser console

// Test the fix for Joy Radio community timings
async function testJoyRadioFix() {
  console.log('🔥 Testing Joy Radio community timing fix...');
  
  // Get current hour
  const currentHour = new Date().getHours();
  console.log(`⏰ Current hour: ${currentHour}`);
  
  // Test the new getSuggestedAdBreakTiming function
  try {
    const suggestions = await CommunityTimings.getSuggestedAdBreakTiming('Joy Radio', currentHour);
    console.log('✅ Community timing suggestions:', suggestions);
    
    if (suggestions) {
      console.log('🎯 SUCCESS: Found timing suggestions for Joy Radio!');
      if (suggestions.halfHour) {
        console.log(`  Half-hour: starts at ${suggestions.halfHour.starts}, ends at ${suggestions.halfHour.ends}`);
      }
      if (suggestions.fullHour) {
        console.log(`  Full-hour: starts at ${suggestions.fullHour.starts}, ends at ${suggestions.fullHour.ends}`);
      }
    } else {
      console.log('❌ FAILED: No suggestions found');
    }
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

// Test the raw data fetching
async function testRawDataFetch() {
  console.log('🔥 Testing raw data fetch...');
  
  try {
    const rawData = await CommunityTimings.fetchFromFirebase('Joy Radio');
    console.log('✅ Raw Firebase data:', rawData);
    
    if (rawData && rawData.length > 0) {
      console.log(`🎯 SUCCESS: Found ${rawData.length} raw timing reports`);
      rawData.forEach((timing, index) => {
        console.log(`  ${index + 1}. Hour ${timing.hour}, minute ${timing.minute}, type: ${timing.type}`);
      });
    } else {
      console.log('❌ FAILED: No raw data found');
    }
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

// Run both tests
console.log('🧪 Starting community timing tests...');
testRawDataFetch().then(() => testJoyRadioFix());

// Make functions available globally
window.testJoyRadioFix = testJoyRadioFix;
window.testRawDataFetch = testRawDataFetch;
