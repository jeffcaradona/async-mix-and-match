# Visual Patterns & Diagrams

## Pattern Comparison

### Callback-Only Pattern
```
┌─ Function Call
│  └─ callbackFunc(param, callback)
│     └─ Returns: undefined
│     └─ Execution: 
│        ├─ Async work starts
│        └─ When done → callback(err, result)
│           ├─ If error → first argument is Error
│           └─ If success → first argument is null, second is result
│
└─ No promise involved
   Users must use callback pattern only
```

### Promise-Only Pattern
```
┌─ Function Call
│  └─ promiseFunc(param)
│     └─ Returns: Promise
│     └─ Execution:
│        ├─ Async work starts
│        └─ When done:
│           ├─ resolve(result) → Promise resolves
│           └─ reject(error) → Promise rejects
│
├─ Can use: .then()/.catch()
├─ Can use: async/await
└─ try/catch catches errors
```

### Dual-Mode Pattern
```
┌─ Function Call
│
├─ Branch 1: WITH Callback
│  └─ dualFunc(param, (err, result) => {})
│     ├─ Returns: undefined (NOT a promise!)
│     ├─ Promise created internally
│     └─ Promise consumed by function
│        ├─ resolve → calls callback(null, result)
│        └─ reject → calls callback(error)
│
└─ Branch 2: WITHOUT Callback
   └─ dualFunc(param)
      ├─ Returns: Promise
      ├─ Promise available to caller
      └─ Can use:
         ├─ .then()/.catch()
         └─ async/await

CRITICAL: Never use both branches simultaneously!
          User must choose: callback OR promise, never both
```

## Error Handling Comparison

### Callback Pattern Error Handling
```
Callback function (param, callback) {
  doAsync((err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
}

Usage:
callbackFunc(param, (err, result) => {
  ┌─ if (err) ────────────> Handle error
  │  } else {
  └─ Use result ──────────> Continue
});

Error flows: Async error → callback's err parameter
```

### Promise Pattern Error Handling
```
Function promiseFunc(param) {
  return new Promise((resolve, reject) => {
    doAsync((err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

Usage with await:
try {
  ├─ const result = await promiseFunc(param);
  └─ ... use result ...
} catch (err) {
  └─ Handle error
}

Error flows: Async error → reject() → catch block
```

### Dual-Mode Pattern Error Handling
```
Function dualFunc(param, callback) {
  const work = new Promise((resolve, reject) => {
    doAsync((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

  if (typeof callback === 'function') {
    // Path A: Callback mode
    work
      .then(r => callback(null, r))
      .catch(e => callback(e));
    return;  // ← Critical: don't return promise
  } else {
    // Path B: Promise mode
    return work;
  }
}

Usage with callback:
dualFunc(param, (err, result) => {
  if (err) ────────> Error caught from callback
  else ───────────> Use result
});

Usage with promise:
try {
  const result = await dualFunc(param);
} catch (err) {
  ──────────────> Error caught from promise
}
```

## Flow Diagrams

### ❌ BROKEN: Mixing Patterns (Your Original Code)

```
try {
  const result = await callbackFunc(param, (err, data) => {
    if (err) throw err;
    return data;
  });
} catch (err) {
  // catch block
}

Execution Flow:
┌──────────────────────────────
│ 1. callbackFunc called
│    ├─ Function returns undefined immediately
│    ├─ "await undefined" completes immediately
│    └─ result = undefined
│
│ 2. try/catch exits
│    └─ try block finished, no exception thrown
│
│ 3. [Later] Callback eventually executes
│    ├─ if (err) throw err
│    │   └─ ⚠️  UNHANDLED - thrown AFTER try/catch
│    │
│    └─ return data
│        └─ ⚠️  IGNORED - return value inside callback
│            └─ Never seen by outer code
│
└──────────────────────────────

Result: ❌
- result is undefined
- Errors are unhandled
- Return value ignored
```

### ✅ CORRECT: Callback-Only Pattern

```
callbackFunc(param, (err, result) => {
  if (err) {
    // Handle error
  } else {
    // Use result
  }
});

Execution Flow:
┌──────────────────────────────
│ 1. callbackFunc called
│    └─ Returns undefined immediately
│
│ 2. Async work happens internally
│
│ 3. When done, callback fires:
│    ├─ err = Error object (if failed) or null
│    ├─ result = undefined (if error) or actual result
│    └─ Error handling works ✓
│
└──────────────────────────────

Result: ✓
- Error caught in callback
- Result available in callback
- Clear error-first convention
```

### ✅ CORRECT: Promise-Only Pattern

```
try {
  const result = await promiseFunc(param);
  // Use result
} catch (err) {
  // Handle error
}

Execution Flow:
┌──────────────────────────────
│ 1. promiseFunc called
│    └─ Returns Promise immediately
│
│ 2. await pauses execution
│    └─ Waits for promise to settle
│
│ 3. Async work happens internally
│
│ 4. When done:
│    ├─ If success:
│    │  └─ Promise resolves
│    │     ├─ await returns value
│    │     └─ result assigned
│    │
│    └─ If error:
│       └─ Promise rejects
│          ├─ Exception thrown
│          └─ Jumps to catch block
│
│ 5. Error handling works ✓
│
└──────────────────────────────

Result: ✓
- Error caught in catch block
- Result available in try block
- Clean async/await syntax
```

### ✅ CORRECT: Dual-Mode Pattern

```
// Callback usage
dualFunc(param, (err, result) => {
  if (err) handle(err);
  else use(result);
});

// Promise usage
try {
  const result = await dualFunc(param);
  use(result);
} catch (err) {
  handle(err);
}

Internal Flow (Callback mode):
┌──────────────────────────────
│ 1. dualFunc called WITH callback
│    ├─ Creates Promise internally
│    ├─ Promise work starts
│    └─ Returns undefined (not the promise!)
│
│ 2. Function creates callbacks:
│    └─ work.then() and work.catch()
│       └─ These handle the internal promise
│
│ 3. When async work completes:
│    ├─ If success: work.then() →
│    │              callback(null, result)
│    │
│    └─ If error: work.catch() →
│                 callback(error)
│
│ 4. Error handling via callback ✓
│
└──────────────────────────────

Internal Flow (Promise mode):
┌──────────────────────────────
│ 1. dualFunc called WITHOUT callback
│    ├─ Creates Promise internally
│    └─ Returns that Promise
│
│ 2. await receives promise
│    └─ Waits for settlement
│
│ 3. When async work completes:
│    ├─ If success: resolve(result)
│    │              ├─ await returns result
│    │              └─ Continue normally
│    │
│    └─ If error: reject(error)
│                 ├─ Exception thrown
│                 └─ Jump to catch
│
│ 4. Error handling via try/catch ✓
│
└──────────────────────────────

Result: ✓ Both patterns work
- Callback users get callback behavior
- Promise users get promise behavior
- Never both simultaneously
```

## Return Value Reference

```
Function Returns    | Callback Provided | Promise Provided
────────────────────┼──────────────────┼─────────────────
Callback-Only       | N/A              | undefined
Promise-Only        | N/A              | Promise
Dual-Mode           | undefined        | Promise
```

When implementing dual-mode: **This is the key to making it work!**

```javascript
if (typeof callback === 'function') {
  // Callback mode: return undefined (implicitly)
  work.then(r => callback(null, r)).catch(e => callback(e));
  return;  // ← No value returned
} else {
  // Promise mode: return promise
  return work;  // ← Promise returned
}
```

## Call Signature Comparison

### Callback-Only
```javascript
// Signature
function foo(param1, param2, callback) { }

// Usage
foo(a, b, (err, result) => { });
foo(a, b, (err, result) => { });  // Can't use await
foo(a, b);  // Error: callback required

// Returns
undefined
```

### Promise-Only
```javascript
// Signature  
async function foo(param1, param2) { }
// or
function foo(param1, param2) { return new Promise(...); }

// Usage
await foo(a, b);
foo(a, b).then(r => { });
foo(a, b).catch(e => { });

// Returns
Promise<result>
```

### Dual-Mode
```javascript
// Signature
function foo(param1, param2, callback?) { }
//                                  ↑ optional!

// Usage
foo(a, b, (err, result) => { });  // Callback mode
await foo(a, b);                  // Promise mode
foo(a, b).then(r => { });         // Promise mode
foo(a, b).catch(e => { });        // Promise mode

// Returns
undefined (callback mode)
Promise<result> (promise mode)
```

## Error Propagation

### Callback Pattern
```
┌─ Async Error ──→ callback(error, undefined)
│                      ↓
│                  (err, result) argument
│                      ↓
│                  if (err) { ... }
└─────────────────────────────────────✓
```

### Promise Pattern
```
┌─ Async Error ──→ reject(error)
│                      ↓
│                  Promise rejects
│                      ↓
│                  .catch() handler
│                  or catch block
└─────────────────────────────────────✓
```

### Dual-Mode Pattern (Callback)
```
┌─ Async Error ──→ reject(error)
│                      ↓
│                  catch in dualFunc
│                      ↓
│                  callback(error)
│                      ↓
│                  if (err) { ... }
└─────────────────────────────────────✓
```

### Dual-Mode Pattern (Promise)
```
┌─ Async Error ──→ reject(error)
│                      ↓
│                  Promise rejects
│                      ↓
│                  .catch() handler
│                  or catch block
└─────────────────────────────────────✓
```

---

These diagrams show why the three patterns work and why mixing them fails.
