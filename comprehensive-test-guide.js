// COMPREHENSIVE TESTING GUIDE - Copy this to browser console
// Run at http://localhost:5174

console.log('🧪 COMPREHENSIVE SLAM! TESTING GUIDE');
console.log('====================================\n');

async function runCompleteTest() {
  console.log('TESTING OVERVIEW:');
  console.log('1. Station definitions (8 fallback URLs)');
  console.log('2. Override system integration');
  console.log('3. StreamProxy improved logic');
  console.log('4. CORS fallback handling\n');

  try {
    // Test 1: Check station definitions
    console.log('📋 TEST 1: Station Definitions');
    const { getStationDefinition } = await import('./src/data/stationDefinitions.js');
    const slamDef = getStationDefinition('SLAM!');
    console.log(`✅ Found ${slamDef.urls.length} URLs for SLAM!`);
    slamDef.urls.forEach((url, i) => console.log(`   ${i+1}. ${url}`));

    // Test 2: Override system
    console.log('\n🔧 TEST 2: Override System');
    const { stationReportingService } = await import('./src/utils/stationReporting.js');
    
    // Clear any existing overrides first
    stationReportingService.setOverrides({});
    
    const originalStation = { name: 'SLAM!', url: 'https://stream.slam.nl/slam' };
    let effectiveData = stationReportingService.getEffectiveStationData(originalStation);
    console.log('✅ Without override:', effectiveData.url);
    
    // Set an override
    const overrides = {};
    overrides['SLAM!'] = {
      url: 'https://29033.live.streamtheworld.com/SLAM_MP3_SC',
      active: true,
      originalUrl: 'https://stream.slam.nl/slam'
    };
    stationReportingService.setOverrides(overrides);
    
    effectiveData = stationReportingService.getEffectiveStationData(originalStation);
    console.log('✅ With override:', effectiveData.url);
    console.log('✅ Has override flag:', effectiveData._hasOverride);

    // Test 3: StreamProxy with improved logic
    console.log('\n🔍 TEST 3: StreamProxy Logic');
    const { StreamProxy } = await import('./src/utils/streamProxy.js');
    
    console.log('Scenario A: Testing with override URL...');
    try {
      const result = await StreamProxy.findWorkingStream(
        effectiveData.url,
        (progress) => console.log(`   📡 ${progress}`),
        'SLAM!'
      );
      console.log(`✅ Success: ${result}`);
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }

    console.log('\nScenario B: Testing with original URL...');
    try {
      const result = await StreamProxy.findWorkingStream(
        'https://stream.slam.nl/slam',
        (progress) => console.log(`   📡 ${progress}`),
        'SLAM!'
      );
      console.log(`✅ Success: ${result}`);
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }

    // Test 4: Integration flow
    console.log('\n🎵 TEST 4: Complete Integration Flow');
    console.log('This simulates what happens when you click play on SLAM!:');
    console.log('1. Override applied → URL becomes override URL');
    console.log('2. StreamProxy tries override URL first');
    console.log('3. If override fails → tries station definition URLs');
    console.log('4. If all fail → tries legacy alternatives');
    
  } catch (error) {
    console.log('❌ Test error:', error);
  }

  console.log('\n=== MANUAL TESTING STEPS ===');
  console.log('🎯 Step 1: Test without override');
  console.log('   - Find SLAM! in radio grid');
  console.log('   - Click play');
  console.log('   - Should try original URL → fallbacks');
  
  console.log('\n🎯 Step 2: Test with override');
  console.log('   - Press Ctrl+Shift+D');
  console.log('   - Go to URL Overrides tab');
  console.log('   - Set override for SLAM!');
  console.log('   - Play SLAM! → should try override → fallbacks');
  
  console.log('\n🎯 Step 3: Test bad override');
  console.log('   - Set override to: https://bad-url.example.com');
  console.log('   - Play SLAM! → should fail override → use fallbacks');
  
  console.log('\n✅ TESTING GUIDE COMPLETE');
}

runCompleteTest();
