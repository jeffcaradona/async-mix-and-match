# async-mix-and-match
The dangers of mixing async promises and callbacks
## Overview
This project demonstrates common pitfalls when mixing callback-based and promise-based asynchronous code in Node.js. Mixing these patterns can lead to silent failures, unhandled errors, and unpredictable application behavior.

## Key Dangers

### 1. **Await on Callback-Based Functions**
Awaiting a callback-based function doesn't work as expected because the function doesn't return a promise.

```javascript
// ❌ PROBLEMATIC: Awaiting a callback-based function
try {
  const result = await some_versatile_async_function(param1, param2, (err, result) => {
    if (err) throw err;  // This throw is INSIDE the callback
    return result;       // This return is INSIDE the callback - doesn't affect outer code
  });
  // result will be UNDEFINED - the callback's return value is ignored!
  console.log(result); // undefined
} catch (error) {
  // This will NOT catch errors thrown in the callback
}
```

**Why it fails:**
- `await` expects a promise, but the function returns `undefined`
- The `try/catch` block cannot catch errors thrown inside the callback
- The `return result` inside the callback is never seen by the outer code
- Error handling is completely broken

---

### 2. **Error Handling Failures**
Errors thrown in callbacks are not caught by try/catch blocks.

```javascript
// ❌ BROKEN ERROR HANDLING
try {
  const result = await database.query(sql, (err, data) => {
    if (err) throw err;  // This error is thrown AFTER try/catch completes
  });
} catch (error) {
  console.log('Caught error:', error); // Will never execute for callback errors
}
```

---

### 3. **Race Conditions and Silent Failures**
The function may complete before the callback is processed, or the promise may resolve while errors are still pending.

```javascript
// ❌ RACE CONDITION
try {
  const result = await versatile_function(param1, param2, (err, data) => {
    // This callback executes in the background
    // Meanwhile, the await has already returned undefined
    if (err) throw err; // Unhandled rejection!
  });
} catch (error) {
  // Won't catch callback errors
}
```

---

## Correct Patterns

### ✅ **Pattern 1: Callback-Only Function**
```javascript
function callbackOnlyFunction(param1, param2, callback) {
  // Simulate async work
  setTimeout(() => {
    if (param1 === 'error') {
      callback(new Error('Failed'));
    } else {
      callback(null, `Result: ${param1}`);
    }
  }, 100);
}

// Usage - callback mode
callbackOnlyFunction(1, 2, (err, result) => {
  if (err) console.error(err);
  else console.log(result);
});
```

### ✅ **Pattern 2: Promise-Native Function**
```javascript
async function promiseOnlyFunction(param1, param2) {
  // Use promises/async internally
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (param1 === 'error') {
        reject(new Error('Failed'));
      } else {
        resolve(`Result: ${param1}`);
      }
    }, 100);
  });
}

// Usage - promise mode
try {
  const result = await promiseOnlyFunction(1, 2);
  console.log(result);
} catch (error) {
  console.error(error);
}
```

### ✅ **Pattern 3: Dual-Mode Function (The Right Way)**
This is how popular libraries (MongoDB, Express, etc.) support both patterns safely.

```javascript
function dualModeFunction(param1, param2, callback) {
  // Create the promise that will handle the async work
  const work = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (param1 === 'error') {
        reject(new Error('Failed'));
      } else {
        resolve(`Result: ${param1}`);
      }
    }, 100);
  });

  // CRITICAL: Detect callback and branch the logic
  if (typeof callback === 'function') {
    // CALLBACK MODE: Handle promise internally, don't return it
    work
      .then(result => callback(null, result))
      .catch(err => callback(err));
    
    return;  // ← Return undefined, not the promise!
  } else {
    // PROMISE MODE: Return promise only if no callback
    return work;
  }
}

// Usage - Callback mode (returns undefined)
dualModeFunction(1, 2, (err, result) => {
  if (err) console.error('Callback error:', err);
  else console.log('Callback result:', result);
});

// Usage - Promise mode (returns promise)
try {
  const result = await dualModeFunction(1, 2);
  console.log('Promise result:', result);
} catch (error) {
  console.error('Promise error:', error);
}
```

**Why this works:**
- Function detects if callback was provided
- If callback exists: consumes the promise internally, returns `undefined` 
- If no callback: returns the promise for `await` or `.then()`
- User **can only use one mode per call**, preventing the mixing issue

---

## Project Structure

### Examples
Learn by seeing the good and bad patterns in action:

- [examples/1-broken-mixing.js](examples/1-broken-mixing.js) - ❌ What NOT to do: Mixing promises and callbacks
- [examples/2-callback-only.js](examples/2-callback-only.js) - ✅ Correct callback-only pattern
- [examples/3-promise-only.js](examples/3-promise-only.js) - ✅ Correct promise-only pattern
- [examples/4-dual-mode.js](examples/4-dual-mode.js) - ✅ How libraries support both safely
- [examples/5-what-not-to-do.js](examples/5-what-not-to-do.js) - ❌ Common anti-patterns
- [examples/6-bad-vs-good-dualmode.js](examples/6-bad-vs-good-dualmode.js) - ⚡ Bad vs Good: Double execution & performance
- [examples/6b-deopt-analysis.js](examples/6b-deopt-analysis.js) - 🔬 V8 optimization analysis
- [examples/7-foreach-async-problem](examples/7-foreach-async-problem) - ❌ forEach does not await async callbacks
- [examples/7b-foreach-fails-silently.js](examples/7b-foreach-fails-silently.js) - ❌ forEach silently swallows async errors
- [examples/7c-foreach-exits-early.js](examples/7c-foreach-exits-early.js) - ❌ forEach allows process exit with in-flight writes

### Testing
- [test-suite.js](test-suite.js) - Comprehensive test demonstrating all patterns

Run the test suite:
```bash
node test-suite.js
```

Run individual examples:
```bash
node examples/1-broken-mixing.js          # Shows the problem
node examples/2-callback-only.js          # Callback pattern
node examples/3-promise-only.js           # Promise pattern
node examples/4-dual-mode.js              # Dual-mode pattern
node examples/5-what-not-to-do.js         # Anti-patterns
node examples/6-bad-vs-good-dualmode.js   # Double execution demo
node examples/6b-deopt-analysis.js        # Performance & optimization
node examples/7-foreach-async-problem     # forEach async timing problem
node examples/7b-foreach-fails-silently.js  # forEach silent error swallowing
node examples/7c-foreach-exits-early.js   # forEach early process exit
```

---

## The Core Issue

When you try to `await` a callback-based function like in your code:

```javascript
const result = await some_versatile_async_function(param1, param2, (err, result) => {
  if (err) throw err;
  return result;
});
```

Three things go wrong:
1. `await` expects a promise, but the function returns `undefined`
2. The `try/catch` block **cannot catch errors** thrown in the callback
3. The callback's `return` statement is **completely ignored**

Result: `result` is `undefined` and errors are unhandled.