// ❌ PROBLEM: forEach does NOT await async callbacks
// Run with: node examples/7-foreach-async-problem
//
// This demonstrates the core forEach + async mismatch:
// forEach was designed for synchronous iteration.
// When you pass it an async callback, it fires all iterations
// immediately and ignores the returned promises — so the code
// that follows forEach runs BEFORE any of the async work finishes.
//
// Three approaches are compared:
//   1. ❌ forEach — fires callbacks, ignores promises, does not wait
//   2. ✅ for...of — awaits each iteration sequentially
//   3. ✅ Promise.all — runs all iterations in parallel, then waits

// Simulate async persistence (e.g. a database or network write)
async function saveUser(user) {
  console.log(`Starting save for ${user}`);

  // Random delay to simulate variable DB/network latency
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 1000)
  );

  console.log(`Finished save for ${user}`);
}

// ❌ BROKEN: forEach ignores the Promise returned by each async callback.
// Code after forEach runs immediately — before any saves finish.
async function demoForEachProblem() {
  const users = ["Alice", "Bob", "Charlie", "Diana"];

  console.log("\n=== Using forEach with async callback ===");

  users.forEach(async (user) => {
    // This async callback returns a Promise, but forEach discards it.
    await saveUser(user);
  });

  // This line executes right away because forEach does not await anything.
  console.log("This logs BEFORE saves complete ❌");
}

// ✅ CORRECT (sequential): for...of respects await, so each save
// finishes before the next one starts.
async function demoCorrectSequential() {
  const users = ["Alice", "Bob", "Charlie", "Diana"];

  console.log("\n=== Using for...of (sequential, awaited) ===");

  for (const user of users) {
    await saveUser(user);
  }

  // This line only executes after every save has completed.
  console.log("This logs AFTER saves complete ✅");
}

// ✅ CORRECT (parallel): Promise.all launches all saves at once and
// awaits the entire batch, giving better throughput than sequential.
async function demoCorrectParallel() {
  const users = ["Alice", "Bob", "Charlie", "Diana"];

  console.log("\n=== Using Promise.all (parallel, awaited) ===");

  await Promise.all(
    users.map((user) => saveUser(user))
  );

  console.log("All saves complete (parallel) ✅");
}

// Run demos in sequence so their output doesn't interleave
await demoForEachProblem();

// Pause to visually separate the forEach output from the next demo
await new Promise((r) => setTimeout(r, 2000));

await demoCorrectSequential();

await demoCorrectParallel();
