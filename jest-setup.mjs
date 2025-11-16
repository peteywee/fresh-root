// [P1][TEST][ENV] Jest global setup file
// Tags: P1, TEST, ENV

/**
 * This file is loaded by Jest before running tests (setupFilesAfterEnv).
 * It ensures Jest globals (beforeAll, afterAll, describe, it, expect)
 * are available in all test files without explicit imports.
 *
 * This is used specifically for Firestore rules tests which run
 * under the Jest runner with the Firebase Emulator.
 */

// Make Jest globals available globally for all tests
import {
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  describe,
  it,
  test,
  expect,
} from "@jest/globals";

globalThis.beforeAll = beforeAll;
globalThis.afterAll = afterAll;
globalThis.beforeEach = beforeEach;
globalThis.afterEach = afterEach;
globalThis.describe = describe;
globalThis.it = it;
globalThis.test = test;
globalThis.expect = expect;
