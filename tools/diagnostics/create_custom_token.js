#!/usr/bin/env node
// Create a custom token for a seeded emulator user and print it to stdout.
const admin = require("firebase-admin");

process.env.FIREBASE_AUTH_EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST || "localhost:9099";
const projectId = process.env.FIREBASE_PROJECT_ID || "fresh-schedules-dev";

try {
  admin.initializeApp({ projectId });
  const auth = admin.auth();
  const uid = process.argv[2] || "manager_uid_123";
  auth
    .createCustomToken(uid)
    .then((token) => {
      console.log(token);
    })
    .catch((err) => {
      console.error("Failed to create custom token:", err);
      process.exit(1);
    });
} catch (e) {
  console.error("Admin init error", e);
  process.exit(1);
}
