// Debug script to test auto-close behavior
console.log('🔍 Debug: Auto-close setting test');

// Test localStorage
try {
  const autoCloseValue = localStorage.getItem('auto_close_overlays');
  console.log('🔍 LocalStorage auto_close_overlays:', autoCloseValue);
  console.log('🔍 Parsed value:', JSON.parse(autoCloseValue || 'true'));
} catch (error) {
  console.error('🔍 Error reading localStorage:', error);
}

// Test if value is being passed correctly
setTimeout(() => {
  console.log('🔍 Window objects:');
  console.log('🔍 window.stopAllManualModes:', typeof window.stopAllManualModes);
  console.log('🔍 window.isInNonstopMode:', window.isInNonstopMode);
  console.log('🔍 window.isAdBreakActive:', window.isAdBreakActive);
}, 2000);
