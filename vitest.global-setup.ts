// [P1][TEST][SERVER] Vitest global setup to run Next.js dev server
// Tags: P1, TEST, SERVER
import { spawn } from "node:child_process";
import http from "node:http";

function waitForHttp(url: string, timeoutMs = 60000, intervalMs = 500): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        // Any HTTP response indicates the server is up
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
        } else {
          setTimeout(check, intervalMs);
        }
      });
    };
    check();
  });
}

let child: ReturnType<typeof spawn> | undefined;

export default async function () {
  // By default, do NOT start the Next dev server locally during tests.
  // Start only when running in CI (e.g. GitHub Actions) or when explicitly
  // requested by setting START_NEXT_IN_TESTS=true in the environment.
  if (process.env.CI !== "true" && process.env.START_NEXT_IN_TESTS !== "true") {
    // Developer machines: skip launching background Next server to avoid
    // consuming RAM/CPU. To run local integration tests that require the
    // app server, set START_NEXT_IN_TESTS=true before running tests.
    // In CI, the workflow will set START_NEXT_IN_TESTS=true so the server
    // is started there.
    console.log(
      "[vitest.global-setup] Skipping starting Next.js dev server locally. Set START_NEXT_IN_TESTS=true to enable.",
    );
    return;
  }

  // If something is already listening, don't start another
  try {
    await waitForHttp("http://localhost:3000/api/health", 2000, 200);
    return; // server is already up
  } catch {}

  // Start Next.js dev server in apps/web
  try {
    // Provide a conservative default Node memory limit if none provided by caller
    const defaultNodeOptions = process.env.NODE_OPTIONS || "--max-old-space-size=2048";
    child = spawn(process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["dev"], {
      cwd: "apps/web",
      env: {
        ...process.env,
        NODE_OPTIONS: defaultNodeOptions,
        NODE_ENV: "test",
        NEXT_TELEMETRY_DISABLED: "1",
        // Minimal server env to satisfy env.server.ts validation during tests
        // Use demo project and a deterministic secret; never used in production
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "demo-fresh",
        SESSION_SECRET:
          process.env.SESSION_SECRET || "test-session-secret-0123456789abcdefghijklmnopqrstuvwxyz", // >=32 chars
        // Prefer emulators in tests to avoid real network calls
        NEXT_PUBLIC_USE_EMULATORS: process.env.NEXT_PUBLIC_USE_EMULATORS || "true",
        FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099",
        FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080",
        FIREBASE_STORAGE_EMULATOR_HOST:
          process.env.FIREBASE_STORAGE_EMULATOR_HOST || "127.0.0.1:9199",
      },
      stdio: "inherit",
    });
  } catch (spawnErr) {
    console.error("Failed to spawn Next dev server:", spawnErr);
    throw spawnErr;
  }

  if (child) {
    child.on("error", (err) => {
      console.error("Next dev server process error:", err);
    });
  }

  // Wait until server responds
  await waitForHttp("http://localhost:3000/api/health");

  // Return teardown
  return async () => {
    if (child && !child.killed) {
      try {
        const proc = child;
        // Send SIGTERM and wait up to 10s for graceful shutdown
        proc.kill("SIGTERM");
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            try {
              if (!proc.killed) proc.kill("SIGKILL");
            } catch {}
            resolve();
          }, 10_000);
          proc.once("exit", () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      } catch {}
    }
  };
}
