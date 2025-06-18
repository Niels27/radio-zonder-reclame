// Quick test to verify nonstop cycling button functionality
console.log('🧪 Testing nonstop cycling functionality...');

// Test the button visibility logic
const testButtonLogic = () => {
  console.log('=== Testing Button Visibility Logic ===');
  
  // Simulate different states
  const scenarios = [
    {
      name: 'Manual Nonstop Mode',
      adBreakMode: 'nonstop',
      isAdBreakActive: false,
      isManualTestActive: false,
      isInNonstopMode: true,
      expected: true
    },
    {
      name: 'Ad Break Nonstop Mode',
      adBreakMode: 'nonstop',
      isAdBreakActive: true,
      isManualTestActive: false,
      isInNonstopMode: false,
      expected: true
    },
    {
      name: 'Manual Test Nonstop Mode',
      adBreakMode: 'nonstop',
      isAdBreakActive: false,
      isManualTestActive: true,
      isInNonstopMode: false,
      expected: true
    },
    {
      name: 'Playlist Mode (should not show)',
      adBreakMode: 'playlist',
      isAdBreakActive: true,
      isManualTestActive: false,
      isInNonstopMode: false,
      expected: false
    },
    {
      name: 'Nonstop Mode But Inactive',
      adBreakMode: 'nonstop',
      isAdBreakActive: false,
      isManualTestActive: false,
      isInNonstopMode: false,
      expected: false
    }
  ];
  
  scenarios.forEach(scenario => {
    window.isInNonstopMode = scenario.isInNonstopMode;
    
    const isManualNonstopActive = window.isInNonstopMode || false;
    const shouldShowButton = scenario.adBreakMode === 'nonstop' && 
                             (scenario.isAdBreakActive || scenario.isManualTestActive || isManualNonstopActive);
    
    const result = shouldShowButton === scenario.expected ? '✅ PASS' : '❌ FAIL';
    console.log(`${result} ${scenario.name}: ${shouldShowButton} (expected: ${scenario.expected})`);
  });
  
  // Reset
  window.isInNonstopMode = false;
};

// Test nonstop station cycling
const testNonstopStations = async () => {
  console.log('=== Testing Nonstop Station Logic ===');
  
  try {
    const nonstopUtils = await import('./src/utils/nonstopUtils.js');
    
    // Get a few stations
    const station1 = nonstopUtils.getRandomNonstopStation();
    const station2 = nonstopUtils.getRandomNonstopStation();
    const station3 = nonstopUtils.getRandomNonstopStation();
    
    console.log('Station 1:', station1?.name || 'No station');
    console.log('Station 2:', station2?.name || 'No station');
    console.log('Station 3:', station3?.name || 'No station');
    
    // Test failure handling
    if (station1) {
      nonstopUtils.markStationAsFailed(station1.name);
      const nextStation = nonstopUtils.getRandomNonstopStation();
      console.log('After marking failure, next station:', nextStation?.name);
      console.log('Should be different from failed:', nextStation?.name !== station1.name ? '✅ PASS' : '❌ FAIL');
    }
  } catch (error) {
    console.error('❌ Error testing nonstop stations:', error);
  }
};

// Run tests
testButtonLogic();
testNonstopStations();

console.log('🧪 Test completed. Check the app UI for cycling button functionality.');
