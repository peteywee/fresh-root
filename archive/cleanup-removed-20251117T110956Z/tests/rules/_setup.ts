// [P1][TEST][UTIL] Shared setup for Firestore/Storage rules tests
// Tags: TEST, FIREBASE, RULES, EMULATOR, UTIL
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import fs from "fs";
import path from "path";

// Broad matcher for rule denials across emulator versions and error shapes
// Examples include:
// - PERMISSION_DENIED
// - Missing or insufficient permissions
// - FirebaseError: ... false for 'get'|'set'|'update'
export const DENY_RE = /(PERMISSION_DENIED|Missing or insufficient permissions|false for)/i;

function parseHostPort(envVar?: string): { host?: string; port?: number } {
  if (!envVar) return {};
  const [host, portStr] = envVar.split(":");
  const port = Number(portStr);
  return { host, port: Number.isFinite(port) ? port : undefined };
}

function readRulesFile(relative: string): string {
  const filePath = path.join(process.cwd(), relative);
  return fs.readFileSync(filePath, "utf8");
}

export async function initFirestoreTestEnv(projectId: string): Promise<RulesTestEnvironment> {
  const firestoreEnv =
    process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_FIRESTORE_EMULATOR_HOST;
  const storageEnv = process.env.FIREBASE_STORAGE_EMULATOR_HOST;

  const firestore = {
    rules: readRulesFile("firestore.rules"),
    ...parseHostPort(firestoreEnv ?? ""),
  } as { rules: string; host?: string; port?: number };

  const storage = storageEnv
    ? ({ rules: readRulesFile("storage.rules"), ...parseHostPort(storageEnv) } as {
        rules: string;
        host?: string;
        port?: number;
      })
    : undefined;

  const testEnv = await initializeTestEnvironment({
    projectId,
    firestore,
    ...(storage ? { storage } : {}),
  });

  return testEnv;
}
