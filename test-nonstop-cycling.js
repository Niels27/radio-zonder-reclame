// Test script to verify nonstop cycling functionality
console.log('🧪 Testing nonstop cycling functionality...');

// Test 1: Check if manual nonstop mode shows cycling button
console.log('Test 1: Manual nonstop mode cycling button');
window.isInNonstopMode = true;
console.log('Set window.isInNonstopMode = true');
console.log('Check if cycling button appears in AudioPlayer...');

// Test 2: Check if nonstop station rotation works
console.log('Test 2: Station rotation functionality');
import('../src/utils/nonstopUtils.js').then(nonstopUtils => {
  const station1 = nonstopUtils.getRandomNonstopStation();
  const station2 = nonstopUtils.getRandomNonstopStation();
  const station3 = nonstopUtils.getRandomNonstopStation();
  
  console.log('Station 1:', station1?.name);
  console.log('Station 2:', station2?.name);
  console.log('Station 3:', station3?.name);
  
  // Test failure handling
  if (station1) {
    nonstopUtils.markStationAsFailed(station1.name);
    console.log(`Marked ${station1.name} as failed`);
    
    const nextStation = nonstopUtils.getRandomNonstopStation();
    console.log('Next station after failure:', nextStation?.name);
    console.log('Should be different from failed station:', nextStation?.name !== station1.name);
  }
});

// Test 3: Reset flag
setTimeout(() => {
  console.log('Test 3: Cleanup');
  window.isInNonstopMode = false;
  console.log('Reset window.isInNonstopMode = false');
}, 5000);
