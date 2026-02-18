// ❌ PROBLEM: forEach silently swallows errors from async callbacks
// Run with: node examples/7b-foreach-fails-silently.js
//
// When an async callback passed to forEach throws (or rejects),
// the error is attached to a Promise that forEach discards.
// The surrounding try/catch never sees it — the failure is silent.
//
// Two approaches are compared:
//   1. ❌ forEach — error thrown inside async callback goes unhandled
//   2. ✅ for...of — error propagates out and is caught normally

// Simulated async database save that fails for a specific user
async function saveUser(user) {
  // Simulate variable-latency async work (e.g. a DB round-trip)
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 500)
  );

  // Simulate a hard failure mid-batch
  if (user === "Charlie") {
    throw new Error("Database write failed for Charlie");
  }

  console.log(`Saved ${user}`);
}

// ❌ BROKEN: The async callback returns a rejected Promise,
// but forEach discards it. The catch block never fires and
// the console falsely reports success.
async function brokenVersion() {
  console.log("\n=== BROKEN VERSION (forEach) ===");

  const users = ["Alice", "Bob", "Charlie", "Diana"];

  try {
    users.forEach(async (user) => {
      // This async callback returns a Promise.
      // forEach ignores the Promise, so the rejection is never surfaced.
      await saveUser(user);
    });

    // Execution reaches here immediately — forEach does not wait.
    // Even when Charlie's save fails, this "success" message still prints.
    console.log("All users processed ✅ (but not really)");
  } catch (err) {
    // This catch block is unreachable for errors from the async callback.
    console.error("Caught error:", err.message);
  }
}

// ✅ CORRECT: for...of respects await, so a rejection from saveUser
// propagates out of the loop and is caught by the surrounding try/catch.
async function correctVersion() {
  console.log("\n=== CORRECT VERSION (awaited) ===");

  const users = ["Alice", "Bob", "Charlie", "Diana"];

  try {
    for (const user of users) {
      await saveUser(user); // Rejection surfaces here and is catchable
    }

    console.log("All users processed ✅");
  } catch (err) {
    // Charlie's failure is caught and handled here as expected.
    console.error("Caught error:", err.message);
  }
}

await brokenVersion();

// In Node.js v15+, the unhandled rejection from Charlie's failed save will
// crash the process here — demonstrating that the error was never caught.
// The correctVersion below shows how for...of properly surfaces the error.
await new Promise((r) => setTimeout(r, 1500));

await correctVersion();
