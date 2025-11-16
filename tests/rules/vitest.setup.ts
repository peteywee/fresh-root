// [P0][TEST][TEST] Vitest Setup tests
// Tags: P0, TEST, TEST
import fs from "fs";
import path from "path";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { execSync } from "child_process";

function setEmulatorEnvFromConfig() {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase.test.json"), "utf8"));
    const em = cfg?.emulators;
    if (em) {
      if (!process.env.FIRESTORE_EMULATOR_HOST && em.firestore?.host && em.firestore?.port) {
        process.env.FIRESTORE_EMULATOR_HOST = `${em.firestore.host}:${em.firestore.port}`;
        process.env.FIREBASE_FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST;
      }
      if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST && em.storage?.host && em.storage?.port) {
        process.env.FIREBASE_STORAGE_EMULATOR_HOST = `${em.storage.host}:${em.storage.port}`;
      }
      if (!process.env.FIREBASE_AUTH_EMULATOR_HOST && em.auth?.host && em.auth?.port) {
        process.env.FIREBASE_AUTH_EMULATOR_HOST = `${em.auth.host}:${em.auth.port}`;
        process.env.AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST;
      }
      if (!process.env.GCLOUD_PROJECT && cfg?.projects?.default) {
        process.env.GCLOUD_PROJECT = cfg.projects.default;
      }
    }
  } catch (e) {
    // ignore — config may not exist in some contexts
  }
}

function maybeFreeMemory() {
  try {
    const mem = execSync("free -m").toString();
    const lines = mem.split(/\n/);
    const memParts = lines[1].trim().split(/\s+/);
    const availMb = Number(memParts[6] || memParts[3] || 0);
    // If less than 512MB free, try to kill heavyweight helpers that commonly run in the workspace
    if (!isNaN(availMb) && availMb < 512) {
      try {
        const procs = execSync("ps aux | rg 'playwright|cloudcode' -n || true").toString().trim();
        // get pids
        const pids = execSync("ps aux | rg 'playwright|cloudcode' | awk '{print $2}' || true")
          .toString()
          .trim()
          .split(/\s+/)
          .filter(Boolean);
        for (const pid of pids) {
          if (pid) {
            try {
              execSync(`kill -9 ${pid}`);
            } catch (e) {
              /* ignore */
            }
          }
        }
      } catch (e) {
        // best-effort; ignore
      }
    }
  } catch (e) {
    // ignore
  }
}

async function seedServiceAccount() {
  const firestoreHost =
    process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_FIRESTORE_EMULATOR_HOST;
  if (!firestoreHost) return;

  const [host, portStr] = firestoreHost.split(":");
  const port = Number(portStr);
  const rules = fs.readFileSync(path.join(process.cwd(), "firestore.rules"), "utf8");
  const projectId = process.env.GCLOUD_PROJECT || "demo-fresh";

  const testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules, host, port },
  });

  try {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      const svc = { onboarding: true, name: "onboarding-service" };
      await db.doc("service_accounts/svc-onboarding").set(svc);
    });
  } catch (e) {
    // ignore seeding errors — tests may handle seeding per-suite
  } finally {
    await testEnv.cleanup();
  }
}

(async () => {
  setEmulatorEnvFromConfig();
  maybeFreeMemory();
  await seedServiceAccount();
})();

export {};
