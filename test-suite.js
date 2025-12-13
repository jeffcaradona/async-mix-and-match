// Comprehensive test suite demonstrating all patterns and anti-patterns

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(label, message) {
  console.log(`${colors.cyan}${label}${colors.reset} ${message}`);
}

function success(msg) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function error(msg) {
  console.log(`${colors.red}✗${colors.reset} ${msg}`);
}

function section(title) {
  console.log(`\n${colors.bright}${colors.cyan}=== ${title} ===${colors.reset}\n`);
}

// ============= Pattern Implementations =============

function callbackOnlyFunc(param, callback) {
  setImmediate(() => {
    if (param === 'err') {
      callback(new Error('Callback function error'));
    } else {
      callback(null, `Callback result: ${param}`);
    }
  });
}

function promiseOnlyFunc(param) {
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      if (param === 'err') {
        reject(new Error('Promise function error'));
      } else {
        resolve(`Promise result: ${param}`);
      }
    });
  });
}

function dualModeFunc(param, callback) {
  const work = new Promise((resolve, reject) => {
    setImmediate(() => {
      if (param === 'err') {
        reject(new Error('Dual-mode function error'));
      } else {
        resolve(`Dual-mode result: ${param}`);
      }
    });
  });

  if (typeof callback === 'function') {
    work
      .then(result => callback(null, result))
      .catch(err => callback(err));
    return;
  } else {
    return work;
  }
}

// ============= Tests =============

async function runTests() {
  section('1. CALLBACK-ONLY PATTERN');

  // Success case
  await new Promise((resolve) => {
    callbackOnlyFunc('test', (err, result) => {
      if (err) {
        error(`Unexpected error: ${err.message}`);
      } else {
        success(result);
      }
      resolve();
    });
  });

  // Error case
  await new Promise((resolve) => {
    callbackOnlyFunc('err', (err, result) => {
      if (err) {
        success(`Error caught: ${err.message}`);
      } else {
        error('Should have received error');
      }
      resolve();
    });
  });

  // ====

  section('2. PROMISE-ONLY PATTERN');

  // Success case
  try {
    const result = await promiseOnlyFunc('test');
    success(result);
  } catch (err) {
    error(`Unexpected error: ${err.message}`);
  }

  // Error case
  try {
    const result = await promiseOnlyFunc('err');
    error('Should have thrown error');
  } catch (err) {
    success(`Error caught: ${err.message}`);
  }

  // ====

  section('3. DUAL-MODE PATTERN - CALLBACK MODE');

  // Success case
  await new Promise((resolve) => {
    dualModeFunc('test', (err, result) => {
      if (err) {
        error(`Unexpected error: ${err.message}`);
      } else {
        success(result);
      }
      resolve();
    });
  });

  // Error case
  await new Promise((resolve) => {
    dualModeFunc('err', (err, result) => {
      if (err) {
        success(`Error caught: ${err.message}`);
      } else {
        error('Should have received error');
      }
      resolve();
    });
  });

  // ====

  section('4. DUAL-MODE PATTERN - PROMISE MODE');

  // Success case
  try {
    const result = await dualModeFunc('test');
    success(result);
  } catch (err) {
    error(`Unexpected error: ${err.message}`);
  }

  // Error case
  try {
    const result = await dualModeFunc('err');
    error('Should have thrown error');
  } catch (err) {
    success(`Error caught: ${err.message}`);
  }

  // ====

  section('5. DUAL-MODE PATTERN - .then().catch() MODE');

  await dualModeFunc('test')
    .then(result => {
      success(result);
    })
    .catch(err => {
      error(`Unexpected error: ${err.message}`);
    });

  await dualModeFunc('err')
    .then(result => {
      error('Should have caught error');
    })
    .catch(err => {
      success(`Error caught: ${err.message}`);
    });

  // ====

  section('6. KEY INSIGHT: What dualModeFunc returns');

  const withCallback = dualModeFunc('test', (err, result) => {
    // callback is used
  });

  const withoutCallback = dualModeFunc('test');

  log('With callback, returns:', withCallback === undefined ? 'undefined' : 'promise');
  log('Without callback, returns:', withoutCallback instanceof Promise ? 'promise' : 'undefined');

  if (withCallback === undefined) {
    success('Correctly returns undefined when callback provided');
  }

  if (withoutCallback instanceof Promise) {
    success('Correctly returns promise when no callback provided');
  }

  section('SUMMARY');

  console.log(`${colors.bright}Three correct patterns:${colors.reset}

1. ${colors.cyan}Callback-only${colors.reset}
   - No return value for caller
   - Use error-first convention
   - Simple and works well with older code

2. ${colors.cyan}Promise-only${colors.reset}
   - Always returns a promise
   - Use async/await or .then()/.catch()
   - Modern, recommended approach

3. ${colors.cyan}Dual-mode${colors.reset}
   - Detect callback presence
   - Return promise only if no callback
   - Forces users into one mode per call
   - Used by MongoDB, Express, etc.

${colors.bright}Key principle:${colors.reset}
Users choose ONE pattern per function call. The function
enforces this by either consuming the promise (callback mode)
or returning it (promise mode), never both.
`);
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
