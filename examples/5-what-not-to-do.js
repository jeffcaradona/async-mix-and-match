// ❌ DANGEROUS: Anti-patterns to avoid

function versatileFunction(param, callback) {
  // Incorrectly implemented - tries to support both modes simultaneously
  const work = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (param === 'error') {
        reject(new Error('Failed'));
      } else {
        resolve(`Result: ${param}`);
      }
    }, 100);
  });

  // WRONG: Always returns promise, even when callback provided
  if (callback) {
    work
      .then(result => callback(null, result))
      .catch(err => callback(err));
  }

  return work;  // ❌ Returning promise when callback exists!
}

console.log('=== ANTI-PATTERN 1: Returning promise + callback ===\n');

console.log('Test: What happens if both are used together?');
versatileFunction('test', (err, result) => {
  if (err) {
    console.error('Callback error:', err.message);
  } else {
    console.log('Callback result:', result);
  }
})
  .then(result => {
    console.log('Promise then:', result);
  })
  .catch(err => {
    console.error('Promise catch:', err.message);
  });

console.log('Both callback AND promise will fire!');
console.log('This is confusing and unpredictable.\n');

// ================================

console.log('=== ANTI-PATTERN 2: Ignoring callback errors ===\n');

function badErrorHandling(param, callback) {
  setTimeout(() => {
    if (param === 'error') {
      // If callback throws, it becomes unhandled
      callback(new Error('Oops!'));
    }
  }, 100);
}

console.log('Test: Error thrown in callback');
badErrorHandling('error', (err) => {
  // If we throw here, it might not be caught
  throw err;  // Unhandled rejection!
});

console.log('(Error will be unhandled if callback throws)\n');

// ================================

console.log('=== ANTI-PATTERN 3: Mixing with await (from intro) ===\n');

function callbackOnly(param, callback) {
  setTimeout(() => {
    callback(null, `Result: ${param}`);
  }, 100);
}

async function badMixing() {
  // ❌ This looks like it should work, but doesn't
  try {
    const result = await callbackOnly('test', (err, data) => {
      if (err) throw err;
      return data;  // This return is ignored!
    });
    console.log('Result:', result);  // undefined!
  } catch (error) {
    console.error('Caught:', error);
  }
}

setTimeout(() => {
  badMixing();
}, 300);
