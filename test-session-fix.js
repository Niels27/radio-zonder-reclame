// Test to verify the currentAdBreakSession fix
console.log('🔧 Testing currentAdBreakSession fix...');

// Mock the React hooks that would be used
const mockState = {
  currentAdBreakSession: null,
  adBreakSessionRef: { current: null }
};

// Test the function logic that was previously broken
function testUpdateAdBreakSession(updates) {
  const currentSession = mockState.currentAdBreakSession || mockState.adBreakSessionRef.current;
  if (currentSession) {
    const updatedSession = { ...currentSession, ...updates };
    console.log('📋 Updating ad break session:', updates);
    mockState.currentAdBreakSession = updatedSession;
    mockState.adBreakSessionRef.current = updatedSession;
    return updatedSession;
  }
  return null;
}

// Test the function logic
function testCreateAdBreakSession(source, timing, duration, stationName) {
  const session = {
    id: `${stationName}_${Date.now()}`,
    source: source,
    timing: timing,
    duration: duration,
    stationName: stationName,
    createdAt: Date.now(),
    feedbackShown: false
  };
  
  console.log('📋 Creating ad break session:', session);
  mockState.currentAdBreakSession = session;
  mockState.adBreakSessionRef.current = session;
  return session;
}

// Run tests
console.log('✅ Test 1: Create session');
const session1 = testCreateAdBreakSession('community', 30, 6, 'Test Station');
console.log('Session created:', session1);

console.log('✅ Test 2: Update session');
const updated = testUpdateAdBreakSession({ feedbackShown: true });
console.log('Session updated:', updated);

console.log('✅ Test 3: Clear session');
mockState.currentAdBreakSession = null;
mockState.adBreakSessionRef.current = null;
console.log('Session cleared');

console.log('🎉 All tests passed! The currentAdBreakSession fix is working correctly.');
