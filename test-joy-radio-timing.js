// Test script to verify Joy Radio timing data for current hour
import { CommunityTimings } from './src/utils/communityTimings.jsx';

async function testJoyRadioTiming() {
  console.log('🧪 Testing Joy Radio community timing data...');
  console.log('Current time:', new Date().toLocaleTimeString());
  console.log('Current hour:', new Date().getHours());
  
  try {
    const timings = await CommunityTimings.getCommunityTimings('Joy Radio');
    
    if (timings) {
      console.log('✅ Joy Radio timing data found:');
      console.log('- Predicted next ad break:', timings.nextAdBreak);
      console.log('- Confidence level:', timings.confidence);
      console.log('- Data source:', timings.source);
      console.log('- Raw data:', timings);
    } else {
      console.log('❌ No timing data found for Joy Radio');
    }
    
    // Test feedback submission
    console.log('\n🧪 Testing feedback submission...');
    await CommunityTimings.submitFeedback('Joy Radio', 'auto-switch', 'accurate');
    console.log('✅ Feedback submission test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testJoyRadioTiming();
