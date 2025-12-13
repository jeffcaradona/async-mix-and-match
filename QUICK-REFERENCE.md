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
