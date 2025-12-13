// ❌ BROKEN: This demonstrates what NOT to do
// Attempting to await a callback-based function

function callbackBasedFunction(param, callback) {
  setTimeout(() => {
    if (param === 'error') {
      callback(new Error('Something failed'));
    } else {
      callback(null, `Success: ${param}`);
    }
  }, 100);
}

// ❌ INCORRECT: Trying to await a callback-based function
async function brokenApproach() {
  try {
    // This doesn't work as expected!
    const result = await callbackBasedFunction('test', (err, data) => {
      if (err) throw err;  // This throw is inside the callback
      return data;         // This return is inside the callback
    });
    
    // result will be UNDEFINED because:
    // 1. The callback's return value is ignored
    // 2. await doesn't know about the callback at all
    console.log('Result:', result); // undefined
  } catch (error) {
    // This will NOT catch errors from the callback
    console.error('Caught:', error);
  }
}

// ❌ Even worse: callback might error after try/catch completes
async function worstCase() {
  try {
    const result = await callbackBasedFunction('error', (err, data) => {
      // This callback is executed AFTER the await returns undefined
      if (err) throw err;  // Unhandled error!
    });
  } catch (error) {
    // This catch block doesn't see the callback's error
    console.error('This never runs:', error);
  }
}

console.log('=== BROKEN APPROACH ===');
brokenApproach();

setTimeout(() => {
  console.log('\n=== WORST CASE (Unhandled Error) ===');
  worstCase();
  
  // The error from worstCase will be unhandled because the callback
  // executes after the try/catch completes
}, 300);
