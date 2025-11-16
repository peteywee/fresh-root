#!/usr/bin/env node
// [P1][TEST][TEST] Test Interactive tests
// Tags: P1, TEST, TEST
/**
 * [P0][SCRIPT][TEST] Interactive test runner
 * Tags: P0, SCRIPT, TEST, INTERACTIVE
 *
 * Prompts the user for test options (server startup, memory boost) and runs tests accordingly.
 * This way you don't have to remember env vars or flags.
 */

import pkg from "prompts";
const prompts = pkg;
import { spawn } from "child_process";
import { platform } from "os";

const isWin = platform() === "win32";
const pnpmCmd = isWin ? "pnpm.cmd" : "pnpm";

async function main() {
  console.log("\n🧪 Fresh Schedules Interactive Test Runner\n");

  const response = await prompts([
    {
      type: "select",
      name: "testType",
      message: "What would you like to do?",
      choices: [
        { title: "Run unit tests only (no server)", value: "unit" },
        {
          title: "Run full tests with server (slower, integration tests)",
          value: "full",
        },
        { title: "Run with increased memory (8GB Node)", value: "memory" },
        {
          title: "Custom: Full tests + increased memory",
          value: "custom",
        },
      ],
      initial: 0,
    },
  ]);

  const { testType } = response;

  let env = { ...process.env };
  let description = "";

  switch (testType) {
    case "unit":
      description = "Running unit tests (no server)...";
      break;

    case "full":
      env.START_NEXT_IN_TESTS = "true";
      description = "Running full tests with Next server...";
      break;

    case "memory":
      env.NODE_OPTIONS = "--max-old-space-size=8192";
      description = "Running tests with 8GB Node memory...";
      break;

    case "custom":
      env.START_NEXT_IN_TESTS = "true";
      env.NODE_OPTIONS = "--max-old-space-size=8192";
      description = "Running full tests with server + 8GB memory...";
      break;
  }

  console.log(`\n${description}\n`);

  // Ensure a conservative Node memory limit is set unless caller requested otherwise
  if (!env.NODE_OPTIONS) env.NODE_OPTIONS = "--max-old-space-size=2048";

  // Run pnpm -w test with the configured environment
  let child;
  try {
    child = spawn(pnpmCmd, ["-w", "test"], {
      env,
      stdio: "inherit",
      shell: true,
    });
  } catch (spawnErr) {
    console.error("Failed to spawn test runner:", spawnErr);
    process.exit(1);
  }

  if (child) {
    child.on("exit", (code) => {
      process.exit(code ?? 0);
    });

    child.on("error", (err) => {
      console.error("Test runner process error:", err);
      process.exit(1);
    });
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
