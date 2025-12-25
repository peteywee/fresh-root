// [P1][TEST][TEST] Vitest Setup tests
// Tags: P1, TEST, TEST
/**
 * Global Vitest setup for the Fresh Root monorepo.
 *
 * We specifically guard `process.listeners` because some code under test
 * (or a polyfill) appears to overwrite it with a non-function, which then
 * breaks Vitest's internal uncaughtException handler:
 *
 *   TypeError: process.listeners is not a function
 *
 * This file ensures `process.listeners` is always a function during tests.
 */

const anyProcess = process as any;

// Capture the original implementation if it's valid.
const originalListeners =
  typeof anyProcess.listeners === "function" ? anyProcess.listeners.bind(process) : undefined;

// Ensure process.listeners is a function right away.
if (!originalListeners) {
  anyProcess.listeners = function (_event: string) {
    return [];
  };
} else {
  anyProcess.listeners = originalListeners;
}

// In case some test or polyfill overwrites process.listeners later,
// periodically restore a safe implementation during the test run.
const restoreInterval = setInterval(() => {
  if (typeof anyProcess.listeners !== "function") {
    anyProcess.listeners = originalListeners
      ? originalListeners
      : function (_event: string) {
          return [];
        };
  }
}, 50);

// Do not keep the process alive for this interval if Node wants to exit.
if (typeof (restoreInterval as any).unref === "function") {
  (restoreInterval as any).unref();
}

// If you have per-package setup (like apps/web/vitest.setup.ts), pull it in here
// so all existing setup keeps working.
try {
  // Vitest will resolve this TS module just fine.
  await import("@apps/web/vitest.setup");
} catch {
  // If apps/web/vitest.setup.ts doesn't exist, ignore.
}
