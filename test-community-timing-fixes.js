// Test script to verify community timing fixes and prevent freezing
// Run this in the browser console while Joy Radio is playing with community timings enabled

console.log('🔧 Starting community timing fix verification...');

// Function to test rate limiting
function testRateLimit() {
  console.log('📊 Testing rate limiting...');
  
  // Try to call community timing functions rapidly
  for (let i = 0; i < 10; i++) {
    setTimeout(async () => {
      try {
        const timing = await window.CommunityTimings?.getSuggestedAdBreakTiming('Joy Radio', new Date().getHours());
        console.log(`Rate limit test ${i + 1}:`, timing ? 'Got data' : 'Rate limited');
      } catch (error) {
        console.error(`Rate limit test ${i + 1} error:`, error);
      }
    }, i * 100); // 100ms intervals
  }
}

// Function to monitor memory usage
function monitorMemory() {
  if (performance.memory) {
    const memory = performance.memory;
    console.log('💾 Memory usage:', {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
    });
  }
}

// Function to test cache effectiveness
function testCaching() {
  console.log('🗄️ Testing cache effectiveness...');
  
  // Check sessionStorage for cached results
  const keys = Object.keys(sessionStorage).filter(key => 
    key.includes('next_timing_') || key.includes('last_community_check_')
  );
  
  console.log('Cache keys found:', keys.length);
  keys.forEach(key => {
    console.log(`Cache: ${key} = ${sessionStorage.getItem(key)?.slice(0, 100)}...`);
  });
}

// Function to check for community timing UI updates
function checkUIUpdates() {
  console.log('🎨 Checking UI updates...');
  
  // Look for golden/yellow timer elements
  const yellowElements = document.querySelectorAll('.text-yellow-400, .bg-yellow-600');
  console.log('Yellow/gold UI elements found:', yellowElements.length);
  
  yellowElements.forEach(el => {
    console.log('Golden element:', el.textContent?.trim() || el.className);
  });
}

// Function to simulate Joy Radio usage and monitor for freezing
function simulateJoyRadioUsage() {
  console.log('📻 Simulating Joy Radio with community timings...');
  
  let iterationCount = 0;
  const startTime = Date.now();
  
  const interval = setInterval(() => {
    iterationCount++;
    
    // Check if we're still responsive
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    
    console.log(`Iteration ${iterationCount}: Elapsed ${Math.round(elapsed / 1000)}s - Still responsive`);
    
    // Monitor memory every 10 iterations
    if (iterationCount % 10 === 0) {
      monitorMemory();
    }
    
    // Test caching every 20 iterations
    if (iterationCount % 20 === 0) {
      testCaching();
    }
    
    // Check UI updates every 15 iterations
    if (iterationCount % 15 === 0) {
      checkUIUpdates();
    }
    
    // Stop after 2 minutes
    if (elapsed > 120000) {
      clearInterval(interval);
      console.log('✅ 2-minute test completed without freezing!');
    }
  }, 5000); // Every 5 seconds
  
  return interval;
}

// Main test runner
function runTests() {
  console.log('🚀 Running community timing fix verification tests...');
  
  monitorMemory();
  testRateLimit();
  testCaching();
  checkUIUpdates();
  
  // Start the main simulation
  console.log('📻 Starting Joy Radio simulation test...');
  const testInterval = simulateJoyRadioUsage();
  
  // Save test interval globally for manual stopping
  window.communityTimingTest = testInterval;
  
  console.log('Test running... Use clearInterval(window.communityTimingTest) to stop early.');
}

// Export for global access
window.testCommunityTimingFixes = runTests;
window.monitorMemory = monitorMemory;
window.testRateLimit = testRateLimit;
window.testCaching = testCaching;
window.checkUIUpdates = checkUIUpdates;

console.log('🔧 Community timing fix tests loaded!');
console.log('📋 Available functions:');
console.log('  - testCommunityTimingFixes() - Run full test suite');
console.log('  - monitorMemory() - Check memory usage');
console.log('  - testRateLimit() - Test API rate limiting');
console.log('  - testCaching() - Check cache effectiveness');
console.log('  - checkUIUpdates() - Look for golden timer UI');

// Auto-run if Joy Radio is detected
setTimeout(() => {
  const currentStation = document.querySelector('[data-station-name]')?.dataset?.stationName;
  if (currentStation?.includes('Joy') || currentStation?.includes('joy')) {
    console.log('🎵 Joy Radio detected - auto-starting tests...');
    runTests();
  } else {
    console.log('📻 No Joy Radio detected. Switch to Joy Radio and run testCommunityTimingFixes() manually.');
  }
}, 2000);
