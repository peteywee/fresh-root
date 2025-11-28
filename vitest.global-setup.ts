// [P1][TEST][TEST] Vitest Global Setup tests
// Tags: P1, TEST, TEST
// [P1 BLOCK 3] Vitest Global Setup
// - Optionally boot a local Next.js dev server before tests
// - Ensure we don't double-bind in CI / hosted runners
// - Now also patches process.listeners for Vitest/Node20 interop

import { spawn } from "node:child_process";
import http from "node:http";

// [VITEST-PATCH] Ensure process.listeners exists for Node 20+ / Vitest
if (typeof process.listeners !== "function") {
  // Vitest expects process.listeners(event) to be callable when wiring error hooks.
  // Some polyfills/envs can replace it; we guard to keep the test runner stable.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process as any).listeners = ((event: string) => []) as any;
}

function waitForHttp(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
          res.resume();
          return resolve();
        }
        res.resume();
        if (Date.now() - start > timeoutMs) {
          return reject(new Error(`Timed out waiting for ${url}, last status: ${res.statusCode}`));
        }
        setTimeout(attempt, 500);
      });

      req.on("error", (err) => {
        if (Date.now() - start > timeoutMs) {
          return reject(new Error(`Timed out waiting for ${url}, last error: ${err}`));
        }
        setTimeout(attempt, 500);
      });
    };

    attempt();
  });
}

async function globalSetup() {
  const shouldStartNext =
    process.env.START_NEXT_IN_TESTS === "true" &&
    process.env.CI !== "true" &&
    process.env.VERCEL !== "1";

  if (!shouldStartNext) {
    return;
  }

  console.log("[vitest.global-setup] Starting Next.js dev server for tests...");

  const dev = spawn("pnpm", ["--filter", "@apps/web", "dev"], {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: "3100",
    },
  });

  process.on("exit", () => {
    dev.kill("SIGTERM");
  });

  await waitForHttp("http://localhost:3100/api/healthz", 60_000);
  console.log("[vitest.global-setup] Next.js dev server is ready.");
}

export default globalSetup;
