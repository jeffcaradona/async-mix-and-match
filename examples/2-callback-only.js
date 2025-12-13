// ✅ CORRECT: Callback-only pattern
// Keep it simple - use callbacks only

function callbackOnlyFunction(param1, param2, callback) {
  // Simulate async work (database, network, etc.)
  setTimeout(() => {
    if (param1 === 'error') {
      // Error-first convention: callback(error, null)
      callback(new Error('Operation failed'));
    } else {
      // Success: callback(null, result)
      callback(null, {
        param1,
        param2,
        message: `Processed: ${param1}`,
        timestamp: Date.now()
      });
    }
  }, 100);
}

// Usage with callback
function main() {
  console.log('=== CALLBACK-ONLY PATTERN ===\n');
  
  console.log('Test 1: Success case');
  callbackOnlyFunction('hello', 'world', (err, result) => {
    if (err) {
      console.error('Error:', err.message);
    } else {
      console.log('Result:', result);
    }
  });
  
  console.log('\nTest 2: Error case');
  setTimeout(() => {
    callbackOnlyFunction('error', 'world', (err, result) => {
      if (err) {
        console.error('Error caught:', err.message);
      } else {
        console.log('Result:', result);
      }
    });
  }, 200);
}

main();
