// [P1][TEST][EMULATOR] Run Firestore/Storage/Auth rules tests on free ports
// Tags: TEST, FIREBASE, RULES, EMULATOR, CI
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import net from "node:net";
import process from "node:process";
import { execa } from "execa";

/**
 * Find a free TCP port by asking the OS for an ephemeral port (port 0), then closing it.
 */
async function getFreePort(host = "127.0.0.1") {
  return await new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on("error", reject);
    srv.listen({ host, port: 0, exclusive: true }, () => {
      const address = srv.address();
      // Close immediately and return the assigned port
      if (typeof address === "object" && address && "port" in address) {
        const p = address.port;
        srv.close(() => resolve(p));
      } else {
        srv.close(() => reject(new Error("Failed to allocate a free port")));
      }
    });
  });
}

function makeTempConfig(contentObj) {
  const dir = mkdtempSync(join(tmpdir(), "firebase-rules-tests-"));
  const file = join(dir, "firebase.dynamic.test.json");
  writeFileSync(file, JSON.stringify(contentObj, null, 2));
  return { dir, file };
}

function waitForPort(host, port, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.once("connect", () => {
        socket.destroy();
        resolve(true);
      });
      socket.once("timeout", () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs)
          return reject(new Error(`Timeout waiting for ${host}:${port}`));
        setTimeout(tryOnce, 250);
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs)
          return reject(new Error(`Timeout waiting for ${host}:${port}`));
        setTimeout(tryOnce, 250);
      });
      socket.connect(port, host);
    };
    tryOnce();
  });
}

async function main() {
  const HOST = "127.0.0.1";

  // Pre-select free ports to avoid conflicts
  const [authPort, firestorePort, storagePort] = await Promise.all([
    getFreePort(HOST),
    getFreePort(HOST),
    getFreePort(HOST),
  ]);

  // Minimal firebase config overriding emulator ports
  const config = {
    emulators: {
      singleProjectMode: false,
      auth: { host: HOST, port: authPort },
      firestore: { host: HOST, port: firestorePort },
      storage: { host: HOST, port: storagePort },
      // Disable UI to keep things lean
      ui: { enabled: false },
    },
    // Keep default project behavior; tests use demo-fresh
  };

  const { dir, file } = makeTempConfig(config);

  // Compose env vars for the test process so clients connect to our dynamic ports
  const envExports = [
    `FIREBASE_AUTH_EMULATOR_HOST=${HOST}:${authPort}`,
    `FIRESTORE_EMULATOR_HOST=${HOST}:${firestorePort}`,
    `FIREBASE_STORAGE_EMULATOR_HOST=${HOST}:${storagePort}`,
  ].join(" ");

  // Inner test command (vitest with rules config)
  const testCmd = `${envExports} pnpm vitest run --config tests/rules/vitest.config.ts --reporter=dot`;

  // Start emulators in the background, wait for ports, run tests, then cleanly stop
  const startArgs = [
    "--config",
    file,
    "emulators:start",
    "--only",
    "auth,firestore,storage",
    "--project",
    "demo-fresh",
  ];

  let emulatorProc;
  try {
    emulatorProc = execa("firebase", startArgs, {
      stdio: "inherit",
    });

    // Wait for emulator ports to accept connections
    await Promise.all([
      waitForPort(HOST, authPort),
      waitForPort(HOST, firestorePort),
      waitForPort(HOST, storagePort),
    ]);

    // Run tests with env pointing to our dynamic ports
    const testProc = execa("bash", ["-lc", testCmd], {
      stdio: "inherit",
      env: {
        ...process.env,
        CI: process.env.CI || "true",
      },
    });
    const { exitCode } = await testProc;

    // Shut down emulators
    if (emulatorProc && emulatorProc.pid) {
      try {
        process.kill(emulatorProc.pid, "SIGINT");
      } catch {}
    }
    await emulatorProc.catch(() => {});

    process.exit(exitCode ?? 0);
  } catch (err) {
    // Surface the error but ensure temp dir is cleaned up
    console.error("[rules-tests] Failed:", err && err.shortMessage ? err.shortMessage : err);
    try {
      if (emulatorProc && emulatorProc.pid) {
        process.kill(emulatorProc.pid, "SIGINT");
        await emulatorProc.catch(() => {});
      }
    } catch {}
    process.exit(typeof err?.exitCode === "number" ? err.exitCode : 1);
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

main();
