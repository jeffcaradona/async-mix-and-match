# Async Mix and Match - Complete Guide

A comprehensive learning project demonstrating the dangers of mixing async/callback patterns in JavaScript, and how to implement them correctly.

## 🚀 Quick Start

### New to this topic?
Start with the main guide:
```bash
# Read the comprehensive guide
cat README.md

# Or just run the test suite
node test-suite.js
```

### Want to see the problem?
```bash
node examples/1-broken-mixing.js
```

### Want to see solutions?
```bash
node examples/2-callback-only.js      # Traditional callbacks
node examples/3-promise-only.js       # Modern async/await
node examples/4-dual-mode.js          # How libraries support both
```

---

## 📚 Documentation

| File | Purpose | Read Time |
|------|---------|-----------|
| **README.md** | Complete guide with all patterns and dangers | 15 min |
| **QUICK-REFERENCE.md** | Cheat sheet for quick lookup | 5 min |
| **PATTERNS-DIAGRAMS.md** | Visual flow diagrams | 10 min |
| **IMPLEMENTATION-SUMMARY.md** | Big picture overview | 10 min |
| **PROJECT-RESOURCES.md** | Guide to all resources | 5 min |

**Recommended learning order:**
1. This file (you are here)
2. [README.md](README.md) - Understanding the problem & solutions
3. Run [examples/](examples/) - See patterns in action
4. [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - Keep this handy

---

## 💻 Examples & Tests

### Five Example Files
```
examples/
├── 1-broken-mixing.js       # ❌ What NOT to do
├── 2-callback-only.js       # ✅ Traditional pattern
├── 3-promise-only.js        # ✅ Modern pattern
├── 4-dual-mode.js          # ✅ How libraries do it
└── 5-what-not-to-do.js     # ❌ Common mistakes
```

Run any example:
```bash
node examples/1-broken-mixing.js
```

### Comprehensive Test Suite
```bash
node test-suite.js
```

Validates all three correct patterns with:
- Success cases
- Error handling
- Return value verification
- Color-coded output

---

## 🎯 The Three Patterns

### Pattern 1: Callback-Only
Traditional Node.js style. Use when stuck with legacy code.
```javascript
function work(param, callback) {
  setTimeout(() => {
    if (error) callback(error);
    else callback(null, result);
  }, 100);
}

work('value', (err, result) => {
  if (err) console.error(err);
  else console.log(result);
});
```

### Pattern 2: Promise-Only  
Modern style. **Recommended for new code.**
```javascript
function work(param) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (error) reject(error);
      else resolve(result);
    }, 100);
  });
}

try {
  const result = await work('value');
  console.log(result);
} catch (err) {
  console.error(err);
}
```

### Pattern 3: Dual-Mode
How MongoDB, Express, etc. support both patterns.
```javascript
function work(param, callback) {
  const work = new Promise((resolve, reject) => {
    // ... async operation ...
  });

  if (typeof callback === 'function') {
    // Callback mode: consume promise internally
    work.then(r => callback(null, r)).catch(e => callback(e));
    return;  // ← Return undefined!
  } else {
    // Promise mode: return promise
    return work;
  }
}

// Both work:
work('value', (err, res) => { });    // Callback
await work('value');                 // Promise
```

---

## ⚠️ The Core Problem

Your original problematic code:
```javascript
const result = await some_function(param1, param2, (err, result) => {
  if (err) throw err;
  return result;
});
```

**Three things go wrong:**
1. ❌ `await` expects a promise, but gets `undefined`
2. ❌ Errors in the callback aren't caught by `try/catch`
3. ❌ The callback's `return` value is completely ignored

**Result:** `result` is `undefined` and errors are unhandled

See [examples/1-broken-mixing.js](examples/1-broken-mixing.js) for a live demonstration.

---

## ✅ The Solution

**Pick ONE pattern per function and stick with it.**

For your code, the solution is to use promises:
```javascript
// ✅ Correct: Use promises
async function work(param1, param2) {
  // Implementation here
}

try {
  const result = await work(param1, param2);
  console.log(result);
} catch (error) {
  console.error(error);
}
```

---

## 🔑 Key Rules

1. **Don't mix patterns** - One per function call
2. **Use error-first callbacks** - `callback(err, result)`
3. **Return promises for promise mode** - When no callback provided
4. **Return nothing for callback mode** - When callback provided
5. **Test both success and error cases** - Always

---

## 📖 Learning Paths

### "Just fix my code" (5 minutes)
1. Read "The Core Problem" section above
2. Look at [examples/3-promise-only.js](examples/3-promise-only.js)
3. Apply the promise pattern to your code

### "I want to understand" (30 minutes)
1. Read [README.md](README.md)
2. Run all 5 examples
3. Review [QUICK-REFERENCE.md](QUICK-REFERENCE.md)

### "I need to implement async APIs" (1-2 hours)
1. Read all documentation
2. Study the examples
3. Review [PATTERNS-DIAGRAMS.md](PATTERNS-DIAGRAMS.md)
4. Implement a dual-mode function
5. Run test suite to verify

---

## 🧪 Running Tests

Test all patterns at once:
```bash
node test-suite.js
```

Expected output:
```
=== 1. CALLBACK-ONLY PATTERN ===
✓ Callback result: test
✓ Error caught: Callback function error

=== 2. PROMISE-ONLY PATTERN ===
✓ Promise result: test
✓ Error caught: Promise function error

=== 3. DUAL-MODE PATTERN - CALLBACK MODE ===
✓ Dual-mode result: test
✓ Error caught: Dual-mode function error

... (more tests)

Key principle:
Users choose ONE pattern per function call...
```

---

## 📚 All Documentation Files

- **[README.md](README.md)** - Full guide covering dangers and solutions
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Quick lookup for patterns
- **[PATTERNS-DIAGRAMS.md](PATTERNS-DIAGRAMS.md)** - Flow diagrams
- **[IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md)** - Overview & references
- **[PROJECT-RESOURCES.md](PROJECT-RESOURCES.md)** - Complete resource guide

---

## 💡 Common Questions

**Q: Should I use callbacks or promises?**  
A: **Promises.** Use callbacks only if you're working with legacy code.

**Q: How do I convert a callback function to promises?**  
A: Wrap it in `new Promise()`. See [examples/3-promise-only.js](examples/3-promise-only.js).

**Q: What's the error-first callback convention?**  
A: Always: `callback(error, result)` where error is null on success.

**Q: Do I need to support dual-mode?**  
A: Only if you're building a library. Most app code should pick one pattern.

**Q: Why does `await` on a callback function fail?**  
A: Because callback-based functions don't return promises. See [examples/1-broken-mixing.js](examples/1-broken-mixing.js).

**Q: How do libraries like MongoDB support both?**  
A: They detect if a callback is provided and branch accordingly. See [examples/4-dual-mode.js](examples/4-dual-mode.js).

---

## 🎓 Key Concepts

### Error-First Callback Convention
```javascript
function work(callback) {
  callback(error, result);  // Error first!
  callback(null, result);   // null if no error
}
```

### Promise Pattern
```javascript
function work() {
  return new Promise((resolve, reject) => {
    if (error) reject(error);
    else resolve(result);
  });
}
```

### Async/Await (Built on Promises)
```javascript
async function work() {
  try {
    const result = await something();
    return result;
  } catch (error) {
    console.error(error);
  }
}
```

### Dual-Mode Implementation
```javascript
function work(param, callback) {
  const promise = new Promise((resolve, reject) => { /*...*/ });
  
  if (typeof callback === 'function') {
    promise.then(r => callback(null, r)).catch(e => callback(e));
    return;
  }
  return promise;
}
```

---

## 🚀 Next Steps

1. **Understand the problem**
   - Read the "Core Problem" section above
   - Run [examples/1-broken-mixing.js](examples/1-broken-mixing.js)

2. **Learn the solutions**
   - Read [README.md](README.md)
   - Run examples 2-4

3. **Fix your code**
   - Use the promise pattern
   - Test with success and error cases

4. **Keep this reference handy**
   - Bookmark [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
   - Refer to examples as needed

---

## 📞 Need Help?

Everything is well documented here. Check:
- **Confused about patterns?** → Read [README.md](README.md)
- **Need quick answer?** → Check [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
- **Want visual explanation?** → See [PATTERNS-DIAGRAMS.md](PATTERNS-DIAGRAMS.md)
- **Looking for examples?** → Browse [examples/](examples/) directory
- **Need overview?** → Read [PROJECT-RESOURCES.md](PROJECT-RESOURCES.md)

---

## ✨ Summary

This project teaches you:
- ✅ Why mixing async patterns is dangerous
- ✅ How to implement callback-only functions
- ✅ How to implement promise-only functions
- ✅ How libraries implement dual-mode functions
- ✅ Common mistakes and how to avoid them
- ✅ Best practices for async code

All with working examples and comprehensive tests.

**Start with [README.md](README.md) or run `node test-suite.js` to get started!**

---

**Created:** December 13, 2025  
**Status:** Complete with examples, tests, and documentation  
**Last Updated:** December 13, 2025
