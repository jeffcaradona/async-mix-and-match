# Quick Reference Guide

## The Three Patterns

### 1. Callback-Only (Traditional)
```javascript
function doWork(param, callback) {
  // Async work...
  callback(error, result);  // error-first convention
}

// Usage
doWork('value', (err, result) => {
  if (err) console.error(err);
  else console.log(result);
});
```

**Pros:** Works with legacy code, predictable behavior  
**Cons:** Can lead to callback hell with multiple operations  

---

### 2. Promise-Only (Modern)
```javascript
function doWork(param) {
  return new Promise((resolve, reject) => {
    // Async work...
    if (error) reject(error);
    else resolve(result);
  });
}

// Usage with async/await
try {
  const result = await doWork('value');
  console.log(result);
} catch (err) {
  console.error(err);
}

// Usage with .then()/.catch()
doWork('value')
  .then(result => console.log(result))
  .catch(err => console.error(err));
```

**Pros:** Modern, composable, clean error handling  
**Cons:** Requires modern Node.js versions  

---

### 3. Dual-Mode (Library Support)
```javascript
function doWork(param, callback) {
  // Create promise internally
  const work = new Promise((resolve, reject) => {
    // Async work...
    if (error) reject(error);
    else resolve(result);
  });

  // Detect if callback provided
  if (typeof callback === 'function') {
    // Callback mode: consume promise, return undefined
    work
      .then(result => callback(null, result))
      .catch(err => callback(err));
    return;  // Critical: don't return promise!
  } else {
    // Promise mode: return promise
    return work;
  }
}

// Usage - Callback style
doWork('value', (err, result) => {
  if (err) console.error(err);
  else console.log(result);
});

// Usage - Promise style
try {
  const result = await doWork('value');
  console.log(result);
} catch (err) {
  console.error(err);
}
```

**Pros:** Works with both old and new code  
**Cons:** More complex implementation, must enforce one mode per call  

---

## Error-First Callback Convention

When using callbacks, always follow this pattern:

```javascript
callback(error, result)
```

- **First argument:** Error object (null if no error)
- **Second argument:** Result value (undefined if error occurred)

```javascript
// ✓ CORRECT
function work(param, callback) {
  if (error) {
    callback(new Error('Failed'));  // Pass error as first arg
  } else {
    callback(null, result);         // Pass null first, result second
  }
}

// ✗ WRONG - Don't do this
function work(param, callback) {
  callback(result);                 // Missing error parameter
  // or
  callback(error, result, extra);   // Too many arguments
}
```

---

## What NOT to Do

### ❌ Don't Await Callback Functions
```javascript
// This doesn't work!
const result = await callbackFunction(param, (err, data) => {
  if (err) throw err;
  return data;  // This return is ignored!
});

console.log(result);  // undefined
```

### ❌ Don't Mix Both Patterns in One Call
```javascript
// DANGEROUS - Both callback and promise will execute
const promise = dualModeFunc(param, (err, result) => {
  console.log('Callback fired:', result);
});

await promise;  // Promise also fires!
// Both will execute, causing confusion
```

### ❌ Don't Return Promise When Callback Provided
```javascript
// WRONG: Returns promise when callback given
function badImpl(param, callback) {
  const work = new Promise(/* ... */);
  
  if (callback) {
    work.then(result => callback(null, result));
  }
  
  return work;  // ❌ Always returns promise!
}

// User gets both:
badImpl(param, (err, res) => { /*...*/ })
  .then(res => { /*...*/ });  // This also runs!
```

### ❌ Don't Ignore Callback Errors
```javascript
// WRONG: Errors in callback are unhandled
function badError(param, callback) {
  doAsyncWork((err, result) => {
    callback(err, result);
    // What if callback throws?
    // It becomes unhandled!
  });
}
```

---

## Decision Tree

```
Is the function part of a library that must support both?
├─ YES → Use Dual-Mode (Pattern 3)
└─ NO → Depends on your codebase:
    ├─ Greenfield project? → Use Promise-Only (Pattern 2)
    ├─ Legacy codebase? → Use Callback-Only (Pattern 1)
    └─ Mixed legacy + modern? → Use Promise-Only with callbacks where necessary
```

---

## Library Examples

### MongoDB Node.js Driver
```javascript
// Supports both
collection.findOne({ _id: 1 }, (err, doc) => { });
await collection.findOne({ _id: 1 });
```

### Express.js Async Middleware
```javascript
// Callback style (traditional)
app.get('/', (req, res, next) => {
  doWork((err, result) => {
    if (err) next(err);
    else res.send(result);
  });
});

// Async style (modern)
app.get('/', async (req, res, next) => {
  try {
    const result = await doWork();
    res.send(result);
  } catch (err) {
    next(err);
  }
});
```

### Node.js Core (fs module)
```javascript
// Callback style
fs.readFile('file.txt', (err, data) => { });

// Promise style (promisify)
const readFile = fs.promises.readFile;
const data = await readFile('file.txt');
```

---

## Tips & Best Practices

1. **Pick one pattern per codebase** - Don't mix callback and promise code
2. **Document clearly** - State which pattern your function uses
3. **Use error-first callbacks** - Consistency is key
4. **Avoid callback hell** - Use promises or async/await
5. **Don't force dual-mode unless necessary** - Most code doesn't need it
6. **Test error cases** - Make sure errors are properly caught
7. **Use TSDoc/JSDoc** - Document parameter types and return values

---

## Testing Your Implementation

```javascript
// Test callback mode
function test(callback) {
  myFunc('test', (err, result) => {
    if (err) {
      console.error('❌ Callback error:', err.message);
    } else {
      console.log('✓ Callback success:', result);
    }
    callback();
  });
}

// Test promise mode
async function testAsync() {
  try {
    const result = await myFunc('test');
    console.log('✓ Promise success:', result);
  } catch (err) {
    console.error('❌ Promise error:', err.message);
  }
}

test(() => testAsync());
```
---

## Decision Tree: Which Pattern to Use?

```
START: Are you writing NEW code?
│
├─ YES → Use Promise-Only (Pattern 2)
│        ├─ Write async/await everywhere
│        ├─ Cleaner, more modern
│        └─ Better error handling with try/catch
│
└─ NO → Must support BOTH old and new code?
   ├─ YES → Use Dual-Mode (Pattern 3)
   │        ├─ Implement carefully
   │        ├─ Only if absolutely necessary
   │        └─ Examples: Libraries, public APIs
   │
   └─ NO → Follow existing codebase pattern
          ├─ Already using callbacks?
          │  └─ Use Callback-Only (Pattern 1)
          │
          └─ Already using promises?
             └─ Use Promise-Only (Pattern 2)
```

---

## Best Practices Checklist

### ✅ Choosing a Pattern

- [ ] Check what pattern your codebase uses
- [ ] Document which pattern the function uses
- [ ] Review similar functions for consistency
- [ ] For new code: prefer Promise-Only (Pattern 2)
- [ ] For libraries: only use Dual-Mode if necessary

### ✅ Callback Pattern Implementation

- [ ] Use error-first convention: `callback(err, result)`
- [ ] Never call callback twice
- [ ] Handle both sync and async errors
- [ ] Document callback signature in JSDoc
- [ ] Test error cases thoroughly
- [ ] Consider `process.nextTick()` for timing consistency

### ✅ Promise Pattern Implementation

- [ ] Always return a Promise
- [ ] Use `resolve()` for success
- [ ] Use `reject()` for errors
- [ ] Prefer `async/await` in calling code
- [ ] Use `try/catch` for error handling
- [ ] Test both success and error paths
- [ ] Handle unhandled rejections

### ✅ Dual-Mode Pattern Implementation (Advanced)

- [ ] Create internal promise for actual work
- [ ] Detect callback: `if (typeof callback === 'function')`
- [ ] **CRITICAL**: Return `undefined` if callback provided
- [ ] **CRITICAL**: Return promise only if no callback
- [ ] Document clearly that both patterns are supported
- [ ] Test callback usage thoroughly
- [ ] Test promise usage thoroughly
- [ ] Verify only ONE path executes per call
- [ ] Test error cases for both patterns

### ✅ Error Handling

- [ ] **Callbacks**: Pass error as first argument: `callback(err, result)`
- [ ] **Promises**: Use `reject(err)` or `throw new Error()`
- [ ] **Async/Await**: Use `try/catch` blocks
- [ ] Test error paths separately
- [ ] Never silently ignore errors
- [ ] Log or handle all errors appropriately

### ✅ Testing Async Code

- [ ] Test success case
- [ ] Test error case
- [ ] Test timeout behavior (if applicable)
- [ ] Test callback mode (if supported)
- [ ] Test promise mode (if supported)
- [ ] Verify only one path executes (dual-mode)
- [ ] Verify no double execution
- [ ] Check for unhandled rejections

---

## Common Mistakes & How to Fix Them

### ❌ Mistake 1: Always Returning Promise in Dual-Mode

```javascript
// WRONG - Always returns promise, even with callback
function bad(param, callback) {
  return new Promise((resolve, reject) => {
    if (callback) callback(null, param);
    resolve(param);  // Callback exists but also returns!
  });
}
```

### ✅ Fix: Return Undefined in Callback Mode

```javascript
// CORRECT - Conditional return
function good(param, callback) {
  if (callback) {
    callback(null, param);
    return;  // Return undefined
  }
  return Promise.resolve(param);
}
```

---

### ❌ Mistake 2: Calling Both Callback and Rejecting

```javascript
// WRONG - Both fire
function bad(param, callback) {
  return new Promise((resolve, reject) => {
    if (param === 'fail') {
      callback(new Error('Failed'));
      reject(new Error('Also failed'));  // Both!
    }
  });
}
```

### ✅ Fix: Separate Paths Completely

```javascript
// CORRECT - Only one path
function good(param, callback) {
  if (callback) {
    // Callback path only
    callback(param === 'fail' ? new Error('Failed') : null, param);
    return;
  }
  // Promise path only
  return param === 'fail' 
    ? Promise.reject(new Error('Failed'))
    : Promise.resolve(param);
}
```

---

### ❌ Mistake 3: Awaiting Callback Functions

```javascript
// WRONG - Await doesn't work on callbacks
const result = await callbackFunction(param, (err, data) => {
  return data;  // This return is ignored!
});
console.log(result);  // undefined
```

### ✅ Fix: Use Promise-Only Functions or Promisify

```javascript
// CORRECT - Use promise function
const result = await promiseFunction(param);
console.log(result);  // Has actual value

// OR convert callback to promise
const { promisify } = require('util');
const promisedFunc = promisify(callbackFunction);
const result = await promisedFunc(param);
```

---

### ❌ Mistake 4: Not Handling Errors in Callbacks

```javascript
// WRONG - Error is silently ignored
function bad(param, callback) {
  if (!param) {
    callback(new Error('No param'));  // Caller might ignore!
  } else {
    callback(null, 'success');
  }
}

// Caller forgets to check err
bad(null, (err, result) => {
  console.log(result);  // undefined, but no error!
});
```

### ✅ Fix: Always Check Error First

```javascript
// CORRECT - Always check error
bad(null, (err, result) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Result:', result);
});
```

---

### ❌ Mistake 5: Inconsistent Error Handling in Async

```javascript
// WRONG - Some errors uncaught
async function bad() {
  const result = await someFunc();
  throw new Error('Oops');  // This throws!
  // But outer code might not have try/catch
}

bad();  // Unhandled rejection!
```

### ✅ Fix: Always Wrap Async in Try/Catch

```javascript
// CORRECT - All errors caught
async function good() {
  try {
    const result = await someFunc();
    throw new Error('Oops');
  } catch (err) {
    console.error('Caught:', err);
  }
}

good();  // Safe
```

---

## When to Refactor: Callbacks → Promises

### Refactor If:
- [ ] Codebase is stable (no active feature work)
- [ ] Test coverage is good (catches regressions)
- [ ] Team is comfortable with async/await
- [ ] You can do it module by module (don't refactor everything at once)
- [ ] You have time for QA testing

### Refactor Strategy:
1. Start with lowest-level modules (no dependencies)
2. Convert one module at a time
3. Update callers to use promises
4. Use dual-mode temporarily if needed
5. Test thoroughly after each module

### Tools to Help:
- `util.promisify()` - Convert callback → promise
- `util.callbackify()` - Convert promise → callback (rare)
- TypeScript - Catches async bugs at compile time
- ESLint rules - `no-callback-literal`, etc.

---

## Real-World Example: Express.js

### Old Callback Style (Express 4)

```javascript
app.get('/api/user/:id', (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  });
});
```

**Issues:**
- Nested callbacks
- Error handling scattered
- Hard to read and test

### Modern Style (Express 5)

```javascript
app.get('/api/user/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    next(err);  // Express error handler
  }
});
```

**Benefits:**
- Cleaner, linear flow
- Error handling with try/catch
- Easier to test
- Easier to debug

### Dual-Mode Example (Library Support)

```javascript
// MongoDB driver supports both
collection.findOne({ _id }, (err, doc) => {
  if (err) console.error(err);
  else console.log(doc);
});

// AND promise mode
const doc = await collection.findOne({ _id });
```

---

## Performance Considerations

| Pattern | Speed | Memory | V8 Optimization |
|---------|-------|--------|-----------------|
| Callback-Only | Fastest | Lowest | Excellent (monomorphic) |
| Promise-Only | Good | Low | Very good (monomorphic) |
| Dual-Mode (correct) | Good | Low | Very good (monomorphic paths) |
| Dual-Mode (incorrect) | Slow | High | Poor (polymorphic) |

**In Practice:**
- Unless handling millions of ops/sec, differences are negligible
- **Correctness and readability > performance**
- Bad dual-mode is both slow AND wrong

---

## Quick Decision Table

| Situation | Use | Reason |
|-----------|-----|--------|
| New code | Promise-Only | Modern, clean, simple |
| Legacy callbacks | Callback-Only | Maintain consistency |
| Supporting both | Dual-Mode | Library requirement (rare) |
| Migrating code | Promise-Only | Future-proof |
| Library API | Dual-Mode | User choice |
| Express middleware | Async/Await | Native support |
| Database queries | Promise-Only | All modern DBs support it |

---

## Further Reading

- [Node.js Async Patterns](https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/)
- [MDN: Async/Await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await)
- [Express 5 Async Errors](https://expressjs.com/en/guide/error-handling.html)
- [Promise Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)