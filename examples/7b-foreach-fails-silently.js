// foreach-fails-silently.mjs

// Simulated async database save
async function saveUser(user) {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 500)
  );

  // Simulate a failure
  if (user === "Charlie") {
    throw new Error("Database write failed for Charlie");
  }

  console.log(`Saved ${user}`);
}

async function brokenVersion() {
  console.log("\n=== BROKEN VERSION (forEach) ===");

  const users = ["Alice", "Bob", "Charlie", "Diana"];

  try {
    users.forEach(async (user) => {
      await saveUser(user);
    });

    console.log("All users processed ✅ (but not really)");
  } catch (err) {
    console.error("Caught error:", err.message);
  }
}

async function correctVersion() {
  console.log("\n=== CORRECT VERSION (awaited) ===");

  const users = ["Alice", "Bob", "Charlie", "Diana"];

  try {
    for (const user of users) {
      await saveUser(user);
    }

    console.log("All users processed ✅");
  } catch (err) {
    console.error("Caught error:", err.message);
  }
}

await brokenVersion();

// Give time for async callbacks to run
await new Promise((r) => setTimeout(r, 1500));

await correctVersion();
