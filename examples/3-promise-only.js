// ✅ CORRECT: Promise-native pattern
// Use promises/async internally

function promiseOnlyFunction(param1, param2) {
  // Always return a promise
  return new Promise((resolve, reject) => {
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
}

// Usage with async/await
async function main() {
  console.log('=== PROMISE-ONLY PATTERN ===\n');
  
  console.log('Test 1: Success case');
  try {
    const result = await promiseOnlyFunction('hello', 'world');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\nTest 2: Error case');
  try {
    const result = await promiseOnlyFunction('error', 'world');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error caught:', error.message);
  }
  
  console.log('\nTest 3: Using .then().catch()');
  promiseOnlyFunction('test', 'data')
    .then(result => {
      console.log('Then:', result);
    })
    .catch(error => {
      console.error('Catch:', error.message);
    });
}

main();
