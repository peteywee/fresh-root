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
  // Allow opting out if an external server is already running
  if (process.env.START_NEXT_IN_TESTS === "false") {
    return;
  }

  // If something is already listening, don't start another
  try {
    await waitForHttp("http://localhost:3000/api/health", 2000, 200);
    return; // server is already up
  } catch {}

  // Start Next.js dev server in apps/web
  child = spawn(process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["dev"], {
    cwd: "apps/web",
    env: {
      ...process.env,
      NODE_ENV: "test",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: "inherit",
  });

  // Wait until server responds
  await waitForHttp("http://localhost:3000/api/health");

  // Return teardown
  return async () => {
    if (child && !child.killed) {
      try {
        child.kill("SIGTERM");
      } catch {}
    }
  };
}
