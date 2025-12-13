# Project Resources

Complete guide to the async-mix-and-match learning project.

## 📚 Documentation Files

### Main Documentation
- **[README.md](README.md)** - Start here!
  - Overview of the dangers of mixing async patterns
  - Detailed explanation of each problem with code examples
  - Three correct solution patterns with detailed explanations
  - Why dual-mode libraries work and how to use them

- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - For quick lookups
  - The three patterns at a glance
  - Error-first callback convention
  - What NOT to do (anti-patterns)
  - Decision tree for choosing a pattern
  - Real library examples
  - Tips and best practices

- **[PATTERNS-DIAGRAMS.md](PATTERNS-DIAGRAMS.md)** - Visual learning
  - Flow diagrams for each pattern
  - Execution flows showing what happens
  - Error propagation paths
  - Return value comparison
  - Why the broken pattern fails

- **[IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md)** - Big picture
  - Project structure overview
  - Key insights and rules
  - Common mistakes and fixes
  - Testing checklist
  - Further reading topics

## 💻 Runnable Examples

All examples are in the `examples/` directory. Run them with `node examples/filename.js`

### Example 1: The Problem
**File:** [examples/1-broken-mixing.js](examples/1-broken-mixing.js)
**What it shows:**
- Attempting to `await` a callback-based function
- Results in `undefined` instead of the actual result
- Errors in the callback are completely unhandled
- Demonstrates why mixing patterns is dangerous

**Run it:**
```bash
node examples/1-broken-mixing.js
```

**Expected output:**
Shows `result: undefined` and an unhandled error thrown outside try/catch

---

### Example 2: Callback-Only Pattern
**File:** [examples/2-callback-only.js](examples/2-callback-only.js)
**What it shows:**
- Traditional callback-based async function
- Proper error-first callback convention
- How to use callbacks correctly
- Success and error handling

**Run it:**
```bash
node examples/2-callback-only.js
```

**When to use this pattern:**
- Legacy Node.js codebases
- When callbacks are already in use
- Simple one-off async operations

---

### Example 3: Promise-Only Pattern
**File:** [examples/3-promise-only.js](examples/3-promise-only.js)
**What it shows:**
- Modern promise-based async function
- Using `async/await` with proper error handling
- Using `.then()` and `.catch()` methods
- How promises work internally

**Run it:**
```bash
node examples/3-promise-only.js
```

**When to use this pattern:**
- New code (recommended)
- Modern Node.js versions
- Any application not constrained by legacy systems

---

### Example 4: Dual-Mode Pattern (How Libraries Do It)
**File:** [examples/4-dual-mode.js](examples/4-dual-mode.js)
**What it shows:**
- How MongoDB, Express, and similar libraries work
- Detecting if a callback was provided
- Branching into callback or promise mode
- Returning different values based on usage pattern
- Both patterns working correctly

**Run it:**
```bash
node examples/4-dual-mode.js
```

**When to use this pattern:**
- Library APIs that need to support both patterns
- When you must maintain backward compatibility
- Not necessary for most application code

**Key insight:** Returns `undefined` if callback provided, returns promise if not

---

### Example 5: What NOT to Do
**File:** [examples/5-what-not-to-do.js](examples/5-what-not-to-do.js)
**What it shows:**
- Anti-pattern 1: Returning promise when callback provided
- Anti-pattern 2: Errors thrown in callbacks
- Anti-pattern 3: Mixing await with callbacks
- Why each is problematic
- What goes wrong in each case

**Run it:**
```bash
node examples/5-what-not-to-do.js
```

---

## 🧪 Test Suite

### Comprehensive Testing
**File:** [test-suite.js](test-suite.js)
**What it does:**
- Tests all three correct patterns
- Callback success and error cases
- Promise success and error cases
- Return value verification
- Complete output with color-coded results

**Run it:**
```bash
node test-suite.js
```

**Expected output:**
All tests pass with ✓ checkmarks showing:
- Each pattern works correctly
- Error handling works properly
- Functions return the expected values

---

## 🎯 Learning Path

### Beginner (Just want to understand the problem)
1. Read: [README.md](README.md) - Sections 1-3
2. Run: `node examples/1-broken-mixing.js` - See the problem
3. Read: "The Core Issue" section in README

**Time: 10 minutes**

---

### Intermediate (Want to use the correct patterns)
1. Read: [README.md](README.md) - All sections
2. Run: `node examples/2-callback-only.js`
3. Run: `node examples/3-promise-only.js`
4. Run: `node examples/4-dual-mode.js`
5. Skim: [QUICK-REFERENCE.md](QUICK-REFERENCE.md)

**Time: 30 minutes**

---

### Advanced (Want to implement dual-mode APIs)
1. Read: All documentation files
2. Run: All examples
3. Run: `node test-suite.js`
4. Study: [PATTERNS-DIAGRAMS.md](PATTERNS-DIAGRAMS.md) 
5. Implement: Your own dual-mode function

**Time: 1-2 hours**

---

### Refresher (Quick lookup)
1. [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - Cheat sheet
2. [PATTERNS-DIAGRAMS.md](PATTERNS-DIAGRAMS.md) - Visual diagrams
3. `grep` the examples directory for patterns you need

---

## 🔍 Quick Find

### I want to understand...

**...why await on callback functions doesn't work**
- Read: [README.md](README.md) - "Dangers" section
- See: [examples/1-broken-mixing.js](examples/1-broken-mixing.js)
- Diagram: [PATTERNS-DIAGRAMS.md](PATTERNS-DIAGRAMS.md) - "BROKEN" section

**...how to write callback functions**
- Read: [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - "Pattern 1"
- See: [examples/2-callback-only.js](examples/2-callback-only.js)

**...how to write promise functions**
- Read: [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - "Pattern 2"
- See: [examples/3-promise-only.js](examples/3-promise-only.js)

**...how libraries support both patterns**
- Read: [README.md](README.md) - "Correct Patterns" section
- See: [examples/4-dual-mode.js](examples/4-dual-mode.js)
- Diagram: [PATTERNS-DIAGRAMS.md](PATTERNS-DIAGRAMS.md) - "Dual-Mode"

**...what mistakes to avoid**
- Read: [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - "What NOT to Do"
- See: [examples/5-what-not-to-do.js](examples/5-what-not-to-do.js)

**...how error handling works**
- Read: [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - "Error-First Convention"
- Diagram: [PATTERNS-DIAGRAMS.md](PATTERNS-DIAGRAMS.md) - "Error Handling"

**...which pattern to use**
- Read: [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - "Decision Tree"
- Read: [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) - Table comparison

---

## 📋 File Directory

```
async-mix-and-match/
├── README.md                           # Main guide (START HERE)
├── QUICK-REFERENCE.md                  # Cheat sheet
├── PATTERNS-DIAGRAMS.md                # Visual diagrams
├── IMPLEMENTATION-SUMMARY.md           # Overview & references
├── PROJECT-RESOURCES.md                # This file
├── test-suite.js                       # Run all tests
└── examples/
    ├── 1-broken-mixing.js              # The problem
    ├── 2-callback-only.js              # Solution 1
    ├── 3-promise-only.js               # Solution 2
    ├── 4-dual-mode.js                  # Solution 3
    └── 5-what-not-to-do.js             # Anti-patterns
```

---

## ✅ Testing & Validation

### Run all tests
```bash
node test-suite.js
```

### Run specific example
```bash
node examples/1-broken-mixing.js
node examples/2-callback-only.js
node examples/3-promise-only.js
node examples/4-dual-mode.js
node examples/5-what-not-to-do.js
```

### Expected behavior

| Example | Expected Output |
|---------|-----------------|
| 1-broken-mixing.js | Shows `undefined` result, then unhandled error |
| 2-callback-only.js | Shows successful callbacks and caught errors |
| 3-promise-only.js | Shows successful promises and caught errors |
| 4-dual-mode.js | Shows both callback and promise modes working |
| 5-what-not-to-do.js | Demonstrates anti-patterns and their problems |

---

## 🎓 Key Takeaways

1. **Never mix patterns** - Choose one per function call
2. **Error-first callbacks** - Always: `callback(err, result)`
3. **Dual-mode requires care** - Must return `undefined` for callbacks, promise for no callback
4. **Promises are modern** - Use them for new code
5. **Callbacks for legacy** - Support them for backward compatibility
6. **Test both paths** - Always test error cases

---

## 💡 Tips for Implementation

When writing your own async functions:

1. **Pick one pattern** and stick with it
2. **Document clearly** which pattern your function uses
3. **Test error cases** thoroughly
4. **Use consistent conventions** (error-first for callbacks)
5. **Avoid unnecessary complexity** - only use dual-mode if required
6. **Consider your audience** - what do users expect?

---

## 🔗 References

### Node.js Documentation
- [Callback Hell](http://callbackhell.com/) - Why callbacks can be problematic
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Async/Await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await)

### Real-World Libraries
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/) - Uses dual-mode
- [Express.js](https://expressjs.com/) - Supports both callback and async middleware
- [Node.js Core Modules](https://nodejs.org/api/) - fs module uses callbacks, fs.promises uses promises

---

## 📞 Questions?

If something isn't clear:
1. Check the relevant example
2. Look at the diagrams
3. Read the quick reference
4. Examine the test suite
5. Review the detailed documentation

Each resource approaches the topic from a different angle, so multiple perspectives should help clarify any confusion.

---

**Last Updated:** December 13, 2025
**Project Status:** Complete with examples, tests, and documentation
