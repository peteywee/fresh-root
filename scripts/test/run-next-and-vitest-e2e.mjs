// [P0][TEST][CODE] Run Next server + Vitest API E2E
// Tags: P0, TEST, CODE, E2E

import { spawn } from "node:child_process";
import net from "node:net";

const root = process.cwd();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth({ timeoutMs, baseUrl }) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    // If the server process already exited, stop waiting.
    if (globalThis.__nextDevExitCode != null) return false;
    try {
      const response = await fetch(`${baseUrl}/api/health`, { method: "GET" });
      if (response.ok) return true;
    } catch {
      // ignore
    }
    await sleep(250);
  }

  return false;
}

async function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Failed to allocate port")));
        return;
      }
      const { port } = address;
      server.close(() => resolve(port));
    });
  });
}

function killProcessTree(child) {
  if (!child || child.killed) return;

  // Prefer killing the process group (POSIX) so `pnpm` doesn't leave `next` orphaned.
  if (process.platform !== "win32" && child.pid) {
    try {
      process.kill(-child.pid, "SIGTERM");
      return;
    } catch {
      // fall back
    }
  }

  try {
    child.kill("SIGTERM");
  } catch {
    // ignore
  }
}

function run(command, args, { name, env }) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...(env ?? {}) },
    detached: process.platform !== "win32",
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
}

async function main() {
  const providedBaseUrl = process.env.TEST_BASE_URL;
  const port = providedBaseUrl ? Number(new URL(providedBaseUrl).port || 3000) : await getAvailablePort();

  // Ensure downstream consumers (Vitest + setup.ts) use the same base URL.
  const baseUrl = providedBaseUrl || `http://localhost:${port}`;
  process.env.TEST_BASE_URL = baseUrl;

  console.log(`[e2e-runner] Using base URL: ${baseUrl}`);

  // CI safety: do not allow non-localhost base URL
  await import("./guard-localhost-base-url.mjs");

  globalThis.__nextDevExitCode = null;

  const server = run(
    "pnpm",
    ["--filter", "@apps/web", "exec", "next", "dev", "--port", String(port)],
    {
      name: "next-dev",
      env: {
        PORT: String(port),
      },
    },
  );

  server.on("exit", (code) => {
    globalThis.__nextDevExitCode = code ?? 1;
  });

  const isUp = await waitForHealth({
    timeoutMs: process.env.CI ? 60_000 : 15_000,
    baseUrl,
  });

  if (!isUp || globalThis.__nextDevExitCode !== null) {
    if (globalThis.__nextDevExitCode !== null) {
      console.error(
        `[e2e-runner] Next.js server exited early with code ${globalThis.__nextDevExitCode ?? "unknown"}`,
      );
    }

    killProcessTree(server);

    if (process.env.CI) {
      console.error("Next.js server did not become healthy in time.");
      process.exit(1);
    }

    console.warn("Server not available; E2E tests may skip gracefully.");
  }

  const vitest = run("pnpm", ["vitest", "run", "--config", "vitest.e2e.config.ts"], {
    name: "vitest-e2e",
    env: {
      TEST_BASE_URL: baseUrl,
    },
  });

  const vitestExitCode = await new Promise((resolve) => {
    vitest.on("exit", (code) => resolve(code ?? 1));
  });

  killProcessTree(server);

  // Give Next a moment to exit cleanly
  await sleep(750);

  process.exit(vitestExitCode);
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("Failed to run E2E test runner", { error: message });
  process.exit(1);
});
