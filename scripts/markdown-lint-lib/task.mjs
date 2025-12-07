#!/usr/bin/env node

/**
 * [P0][LINT][TASK] Markdown Lint Runtime Task
 * Tags: P0, LINT, TASK, MARKDOWN, AUTOMATION
 *
 * Integrated runtime task for markdown linting with auto-fix capabilities.
 * Can be used standalone or as part of CI/CD pipeline with markdownlint-cli2.
 *
 * Usage:
 *   node scripts/markdown-lint-lib/task.mjs [--fix] [--profile=strict] [--check]
 *   pnpm run docs:lint
 *   pnpm run docs:fix
 */

import { spawn } from "child_process";
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";
import { generateConfigFile, generateSummaryReport } from "./index.mjs";

/**
 * [P0][LINT][TASK] Task Configuration
 */
const TASK_CONFIG = {
  name: "markdown-lint",
  description: "Lint and fix markdown files with comprehensive rules",
  globs: ["**/*.md"],
  ignores: ["node_modules", ".git", "dist", "build", "coverage", ".next", "packages/*/node_modules"],
  timeout: 60000,
  exitCodes: {
    success: 0,
    lintErrors: 1,
    taskFailure: 2,
  },
};

/**
 * [P0][LINT][TASK] Parse Command-Line Arguments
 */
function parseArgs(args = process.argv.slice(2)) {
  return {
    fix: args.includes("--fix"),
    check: args.includes("--check"),
    profile: args.find((a) => a.startsWith("--profile="))?.split("=")[1] || "standard",
    verbose: args.includes("--verbose") || args.includes("-v"),
    quiet: args.includes("--quiet") || args.includes("-q"),
    config: args.find((a) => a.startsWith("--config="))?.split("=")[1],
  };
}

/**
 * [P0][LINT][TASK] Run Linting Task
 */
async function runLintTask(options = {}) {
  const { fix = false, check = false, profile = "standard", verbose = false, quiet = false, config } = options;

  if (!quiet) {
    console.log(`📝 Starting markdown linting task...`);
    console.log(`  Profile: ${profile}`);
    console.log(`  Fix: ${fix ? "enabled" : "disabled"}`);
    console.log(`  Check: ${check ? "enabled" : "disabled"}`);
  }

  try {
    // Generate config file if not specified
    const configPath = config || resolve("./.markdownlint-cli2.jsonc");
    if (!existsSync(configPath)) {
      if (!quiet) console.log(`  Generating config file: ${configPath}`);
      generateConfigFile(profile, configPath);
    }

    // Build markdownlint-cli2 command
    const cliArgs = [];
    if (fix) cliArgs.push("--fix");
    cliArgs.push("**/*.md");
    cliArgs.push("#node_modules");

    // Run markdownlint-cli2
    return new Promise((resolve, reject) => {
      const cli = spawn("markdownlint-cli2", cliArgs, {
        stdio: verbose ? "inherit" : "pipe",
        timeout: TASK_CONFIG.timeout,
      });

      let output = "";
      let errorOutput = "";

      if (!verbose) {
        cli.stdout?.on("data", (data) => {
          output += data.toString();
        });
        cli.stderr?.on("data", (data) => {
          errorOutput += data.toString();
        });
      }

      cli.on("close", (code) => {
        if (code === TASK_CONFIG.exitCodes.success) {
          if (!quiet) console.log(`✅ All markdown files passed linting`);
          resolve({ success: true, code, output });
        } else if (code === TASK_CONFIG.exitCodes.lintErrors && fix) {
          if (!quiet) console.log(`✅ Fixed ${output.split("\n").length} linting issues`);
          resolve({ success: true, code, output, fixed: true });
        } else if (code === TASK_CONFIG.exitCodes.lintErrors) {
          if (!quiet) console.log(`⚠️  Linting errors found (use --fix to auto-correct)`);
          if (!quiet && output) console.log(output);
          resolve({ success: false, code, output, errors: true });
        } else {
          reject(new Error(`Linting task failed with exit code ${code}\n${errorOutput}`));
        }
      });

      cli.on("error", (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error(`❌ Task error: ${error.message}`);
    throw error;
  }
}

/**
 * [P0][LINT][TASK] Validate Markdown Files
 */
async function validateMarkdown(files = ["**/*.md"]) {
  if (process.env.SKIP_LINT === "true") {
    console.log("⏭️  Skipping markdown linting (SKIP_LINT=true)");
    return { skipped: true };
  }

  return runLintTask({
    fix: false,
    check: true,
    verbose: process.env.VERBOSE === "true",
  });
}

/**
 * [P0][LINT][TASK] Auto-Fix Markdown Files
 */
async function fixMarkdown(profile = "standard") {
  return runLintTask({
    fix: true,
    profile,
    verbose: process.env.VERBOSE === "true",
  });
}

/**
 * [P0][LINT][TASK] Generate Report
 */
function generateReport() {
  const report = generateSummaryReport();
  console.log("\n📊 Markdown Linting Rules Summary:");
  console.log(`\nTotal Rules: ${report.statistics.totalRules}`);
  console.log(`Auto-Fixable: ${report.statistics.autoFixableCount}`);
  console.log(`\nProfiles:`);
  console.log(`  - strict (${report.statistics.strictRulesEnabled} rules)`);
  console.log(`  - standard (${report.statistics.standardRulesEnabled} rules)`);
  console.log(`  - lenient (${report.statistics.lenientRulesEnabled} rules)`);
  console.log(`\nAuto-Fixable Rules:`);
  Object.entries(report.autoFixableRules).forEach(([code, rule]) => {
    if (rule.fixable) {
      console.log(`  ${code} (${rule.priority}): ${rule.name}`);
    }
  });
  return report;
}

/**
 * [P0][LINT][TASK] CLI Entry Point
 */
async function main() {
  const args = parseArgs();

  try {
    if (args.verbose) {
      generateReport();
    }

    if (args.fix) {
      await fixMarkdown(args.profile);
    } else {
      const result = await validateMarkdown();
      if (result.errors) {
        process.exit(TASK_CONFIG.exitCodes.lintErrors);
      }
    }
  } catch (error) {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(TASK_CONFIG.exitCodes.taskFailure);
  }
}

// Export for use as module or CLI
export { runLintTask, validateMarkdown, fixMarkdown, generateReport, TASK_CONFIG };

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
