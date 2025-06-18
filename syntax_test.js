// Test file to check syntax
import { useState, useEffect, useCallback, useRef } from 'react';

// Copy the problematic section to test
const testFunction = useCallback(() => {
  console.log('test');
}, [
  'test1', 
  'test2', 
  'test3', 
  'test4'
]);

export default testFunction;
