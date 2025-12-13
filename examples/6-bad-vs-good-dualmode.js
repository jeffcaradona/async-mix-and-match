// Demonstrates the difference between BAD and GOOD dual-mode async patterns
// This example also shows potential V8 deoptimization issues

// BAD: Always returns promise AND calls callback (inconsistent return type)
// This causes:
// 1. Double execution (both callback and promise fire)
// 2. Inconsistent function signature (return type changes based on usage)
// 3. V8 can't optimize - function shape is unpredictable
function badDualMode(param, callback) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (param === 'fail') {
        // Both paths execute!
        if (typeof callback === 'function') callback(new Error('Failure!'));
        reject(new Error('Failure!'));
      } else {
        // Both paths execute!
        if (typeof callback === 'function') callback(null, param);
        resolve(param);
      }
    }, 10);
  });
}

// GOOD: Consistent return type per code path
// This allows:
// 1. Only one execution path
// 2. Consistent function signature (undefined OR Promise, never both)
// 3. V8 can optimize - function shape is predictable
function goodDualMode(param, callback) {
  if (typeof callback === 'function') {
    // Callback path: returns undefined
    setTimeout(() => {
      if (param === 'fail') callback(new Error('Failure!'));
      else callback(null, param);
    }, 10);
    return; // undefined
  } else {
    // Promise path: returns Promise
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (param === 'fail') reject(new Error('Failure!'));
        else resolve(param);
      }, 10);
    });
  }
}

// Simpler sync versions for performance testing
function badDualModeSync(param, callback) {
  // Always returns a value, even when callback provided
  if (typeof callback === 'function') {
    callback(null, param);
  }
  return param; // ❌ Always returns, inconsistent!
}

function goodDualModeSync(param, callback) {
  if (typeof callback === 'function') {
    callback(null, param);
    return; // ✅ Returns undefined
  }
  return param; // ✅ Returns value only when no callback
}

console.log('=== BAD DUAL-MODE: Both callback and promise fire ===');
console.log('Notice: BOTH the callback AND promise rejection are triggered!\n');

badDualMode('fail', (err, res) => {
  if (err) console.log('  ❌ Callback error:', err.message);
  else console.log('  Callback result:', res);
}).catch(err => {
  console.log('  ❌ Promise error:', err.message);
});

setTimeout(() => {
  console.log('\n=== BAD DUAL-MODE: Success case ===');
  badDualMode('success', (err, res) => {
    if (err) console.log('  Callback error:', err.message);
    else console.log('  ✓ Callback result:', res);
  }).then(res => {
    console.log('  ✓ Promise result:', res);
  });
}, 50);

setTimeout(() => {
  console.log('\n=== GOOD DUAL-MODE: Only one path fires ===');
  console.log('Notice: Only the callback fires (promise not returned)\n');
  
  goodDualMode('fail', (err, res) => {
    if (err) console.log('  ✓ Callback error (correct):', err.message);
    else console.log('  Callback result:', res);
  });
}, 150);

setTimeout(() => {
  console.log('\n=== GOOD DUAL-MODE: Promise mode ===');
  console.log('Notice: Only the promise fires (no callback provided)\n');
  
  goodDualMode('fail')
    .then(res => console.log('  Promise result:', res))
    .catch(err => console.log('  ✓ Promise error (correct):', err.message));
}, 250);

setTimeout(() => {
  console.log('\n=== PERFORMANCE TEST: V8 Optimization ===');
  console.log('Running 1,000,000 iterations to warm up V8...\n');
  
  const iterations = 1000000;
  
  // Test bad pattern
  console.time('Bad pattern (inconsistent returns)');
  for (let i = 0; i < iterations; i++) {
    badDualModeSync(i, (err, res) => {});
    badDualModeSync(i); // Different return value!
  }
  console.timeEnd('Bad pattern (inconsistent returns)');
  
  // Test good pattern - callback mode
  console.time('Good pattern (callback mode)');
  for (let i = 0; i < iterations; i++) {
    goodDualModeSync(i, (err, res) => {});
  }
  console.timeEnd('Good pattern (callback mode)');
  
  // Test good pattern - promise mode
  console.time('Good pattern (promise mode)');
  for (let i = 0; i < iterations; i++) {
    goodDualModeSync(i);
  }
  console.timeEnd('Good pattern (promise mode)');
  
  console.log('\n💡 To see V8 deoptimizations, run:');
  console.log('   node --trace-opt --trace-deopt 6-bad-vs-good-dualmode.js');
  console.log('\n💡 For detailed optimization status:');
  console.log('   node --trace-opt --trace-deopt --allow-natives-syntax 6-bad-vs-good-dualmode.js');
}, 350);
