#!/usr/bin/env node
// [P0][FIREBASE][FIREBASE] Test Firebase Admin tests
// Tags: P0, FIREBASE, FIREBASE, TEST
// Lightweight test to initialize Firebase Admin SDK without printing secrets.
import fs from "fs";
import path from "path";
import process from "process";
import admin from "firebase-admin";

function tryInit() {
  const keyPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  try {
    if (keyPath) {
      const resolved = path.resolve(keyPath);
      if (fs.existsSync(resolved)) {
        const json = JSON.parse(fs.readFileSync(resolved, "utf8"));
        admin.initializeApp({ credential: admin.credential.cert(json) });
        return { method: "cert", path: resolved };
      } else {
        return { error: `Service account file not found at ${resolved}` };
      }
    }

    // Fallback: application default credentials
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    return { method: "applicationDefault" };
  } catch (err) {
    return { error: err && err.message ? err.message : String(err) };
  }
}

const result = tryInit();
if (result.error) {
  console.error("Admin SDK initialization FAILED:", result.error);
  console.error(
    "Tip: set FIREBASE_SERVICE_ACCOUNT_KEY_PATH or GOOGLE_APPLICATION_CREDENTIALS to a service account JSON file, or configure ADC.",
  );
  process.exitCode = 2;
} else {
  const projectId =
    admin.app().options?.projectId || process.env.FIREBASE_PROJECT_ID || "(unknown)";
  console.log("Admin SDK initialized using:", result.method);
  if (result.path) console.log("service account path: (redacted)");
  console.log("projectId:", projectId);
}
