// Test script to verify feedback submission fixes
console.log('🧪 Testing Feedback Submission Fix...\n');

// Test the Firebase demo mode functionality
import { CommunityTimings } from './src/utils/communityTimings.jsx';
import { isDemoMode, setFirebaseDemoMode } from './src/utils/firebase.js';

async function testFeedbackSubmission() {
  console.log('1. Testing feedback submission in demo mode...');
  
  // Ensure we're in demo mode for testing
  setFirebaseDemoMode(true);
  console.log(`   Demo mode active: ${isDemoMode()}`);
  
  // Create test feedback data
  const testFeedback = {
    station: 'Joy Radio',
    type: 'timing_accuracy',
    rating: 'good',
    comment: 'Test feedback submission',
    timestamp: new Date().toISOString(),
    userAgent: 'Test Script'
  };
  
  try {
    console.log('   Submitting test feedback...');
    const result = await CommunityTimings.syncFeedbackToFirebase(testFeedback);
    console.log('   ✅ Feedback submission successful:', result);
    
    // Test local storage as well
    console.log('\n2. Testing local feedback storage...');
    CommunityTimings.storeFeedbackLocally(testFeedback, 'Joy Radio');
    console.log('   ✅ Local storage successful');
    
    console.log('\n🎉 All feedback tests passed! The Firebase error should be fixed.');
    
  } catch (error) {
    console.error('   ❌ Feedback submission failed:', error);
    console.log('\n💥 Test failed - there may still be issues with feedback submission.');
  }
}

// Run the test
testFeedbackSubmission().catch(console.error);
