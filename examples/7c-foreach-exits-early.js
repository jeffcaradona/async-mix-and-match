// ❌ DANGER: forEach can let the process exit while async work is still in-flight
// Run with: node examples/7c-foreach-exits-early.js
//
// This demonstrates a real production failure mode:
// the process exits cleanly while async work is still "in flight" —
// because nothing is keeping the event loop alive.
//
// We intentionally schedule work in a way that DOES NOT keep Node alive.
//
// Two approaches are compared:
//   1. ❌ forEach — fire-and-forget writes may be lost if the process exits
//   2. ✅ Promise.all — awaiting all writes prevents early exit

import { setTimeout as delay } from "node:timers/promises";

/**
 * "Fire-and-forget" async write:
 * - It schedules a microtask chain (Promises)
 * - It does NOT schedule timers/sockets/IO that keep the event loop alive
 * So if the main script ends, Node can exit before this completes.
 */
async function saveUserFireAndForget(user) {
  // Create a bunch of promise work (microtasks) that *appears* async…
  for (let i = 0; i < 200_000; i++) {
    // Yield to the microtask queue repeatedly.
    // This is async, but it doesn't create event-loop handles.
    await Promise.resolve();
  }

  console.log(`✅ Saved ${user}`);
}

/**
 * ❌ DANGEROUS: forEach fires all async callbacks and ignores their Promises.
 * The outer async function returns as soon as forEach returns — before any
 * of the saveUserFireAndForget calls have completed.  If nothing else is
 * keeping the event loop alive after this point, Node.js can exit and all
 * in-flight writes will be silently lost.
 */
async function dangerousForEach() {
  console.log("\n=== DANGEROUS VERSION (forEach + fire-and-forget) ===");

  const users = ["Alice", "Bob", "Charlie", "Diana"];

  users.forEach(async (user) => {
    // This returns a Promise, but forEach ignores it.
    await saveUserFireAndForget(user);
  });

  console.log("Main says: done ✅ (but writes are still in-flight)");
  console.log("If Node exits now with code 0, those writes are lost.\n");
}

/**
 * ✅ SAFE: Promise.all collects every Promise returned by the map and awaits
 * the entire batch.  The outer async function does not return until every
 * write has settled, so the process cannot exit before the work is done.
 */
async function safeVersionPromiseAll() {
  console.log("\n=== SAFE VERSION (Promise.all) ===");

  const users = ["Alice", "Bob", "Charlie", "Diana"];

  await Promise.all(users.map((u) => saveUserFireAndForget(u)));

  console.log("Main says: done ✅ (and writes really finished)\n");
}

/**
 * Run the dangerous case first.
 * We do NOT add any extra timers after it.
 * That means if nothing else is keeping the event loop alive, Node can exit.
 */
await dangerousForEach();

// Uncomment this to *force* the process to stay alive long enough
// to see the saves complete (this simulates “something else keeps it alive”):
//
// await delay(2000);

// Now show the correct fix (this WILL keep the process alive because we await):
await safeVersionPromiseAll();
