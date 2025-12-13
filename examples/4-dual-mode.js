// ✅ CORRECT: Dual-mode pattern (like MongoDB, Express, etc.)
// Supports both callbacks AND promises, but enforces using only ONE per call

function dualModeFunction(param1, param2, callback) {
  // Build the internal promise
  const work = new Promise((resolve, reject) => {
    // Simulate async work
    setTimeout(() => {
      if (param1 === 'error') {
        reject(new Error('Operation failed'));
      } else {
        resolve({
          param1,
          param2,
          message: `Processed: ${param1}`,
          timestamp: Date.now()
        });
      }
    }, 100);
  });

  // CRITICAL PATTERN: Detect callback and branch
  if (typeof callback === 'function') {
    // CALLBACK MODE: Consume the promise, return undefined
    work
      .then(result => callback(null, result))
      .catch(err => callback(err));
    
    return;  // Don't return promise - forces callback mode
  } else {
    // PROMISE MODE: Return promise only if no callback provided
    return work;
  }
}

async function main() {
  console.log('=== DUAL-MODE PATTERN ===\n');
  
  console.log('Test 1: Callback mode (success)');
  dualModeFunction('hello', 'world', (err, result) => {
    if (err) {
      console.error('Callback error:', err.message);
    } else {
      console.log('Callback result:', result);
    }
  });
  
  console.log('\nTest 2: Callback mode (error)');
  setTimeout(() => {
    dualModeFunction('error', 'world', (err, result) => {
      if (err) {
        console.error('Callback error caught:', err.message);
      } else {
        console.log('Callback result:', result);
      }
    });
  }, 200);
  
  console.log('\nTest 3: Promise mode (success)');
  setTimeout(async () => {
    try {
      const result = await dualModeFunction('test', 'data');
      console.log('Promise result:', result);
    } catch (error) {
      console.error('Promise error:', error.message);
    }
  }, 400);
  
  console.log('\nTest 4: Promise mode (error)');
  setTimeout(async () => {
    try {
      const result = await dualModeFunction('error', 'data');
      console.log('Promise result:', result);
    } catch (error) {
      console.error('Promise error caught:', error.message);
    }
  }, 600);
  
  console.log('\nTest 5: Promise mode with .then().catch()');
  setTimeout(() => {
    dualModeFunction('promise', 'test')
      .then(result => {
        console.log('Then:', result);
      })
      .catch(error => {
        console.error('Catch:', error.message);
      });
  }, 800);
}

main();
