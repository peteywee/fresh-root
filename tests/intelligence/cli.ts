#!/usr/bin/env node
/**
 * Production-Grade CLI for Test Intelligence System
 * Cross-platform, colored output, proper exit codes
 */

import { orchestrator } from "./orchestrator";
import { aiPrioritizer } from "./ai-test-prioritizer";
import { predictiveAnalytics } from "./predictive-analytics";
import { parallelizationOptimizer } from "./parallelization-optimizer";
import { securityScanner } from "./security-scanner";
import { testDataFactory } from "./test-data-factory";
import { e2eGenerator } from "./e2e-generator";
import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";

// Read version from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf-8")
);
const VERSION = packageJson.version || "1.0.0";

// Project root - determine if running from global install or local project
function getProjectRoot(): string {
  // If running globally, try to detect project root from cwd
  const cwd = process.cwd();
  
  // Check if we're in a project with apps/web/app/api
  if (fs.existsSync(path.join(cwd, "apps/web/app/api"))) {
    return cwd;
  }
  
  // Fallback to up from tests/intelligence
  return path.resolve(__dirname, "../..");
}

const PROJECT_ROOT = getProjectRoot();

// ANSI color codes (no dependencies needed)
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const c = (color: keyof typeof colors, text: string) => `${colors[color]}${text}${colors.reset}`;

// Config loader
interface Config {
  stages?: string[];
  parallel?: boolean;
  verbose?: boolean;
  output?: string;
}

const loadConfig = (): Config => {
  const configPath = path.join(process.cwd(), ".testintelrc.json");
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
  return {};
};

// CLI commands
const commands = {
  async run(mode: "full" | "quick" = "full") {
    try {
      const result = mode === "quick" ? await orchestrator.runQuick() : await orchestrator.runFull();
      const failed = result.stages.filter((s) => s.status === "failed").length;
      process.exit(failed > 0 ? 1 : 0);
    } catch (err: any) {
      console.error(c("red", `✗ Error: ${err.message}`));
      process.exit(1);
    }
  },

  async prioritize(limit = 20) {
    try {
      const testFiles = await glob("**/*.test.ts", { cwd: PROJECT_ROOT, ignore: ["**/node_modules/**"] });
      const changedFiles = await aiPrioritizer.getChangedFiles();
      const priorities = aiPrioritizer.prioritizeTests(testFiles.slice(0, limit), changedFiles);
      console.log(aiPrioritizer.generateReport(priorities));
      process.exit(0);
    } catch (err: any) {
      console.error(c("red", `✗ Error: ${err.message}`));
      process.exit(1);
    }
  },

  async predict(limit = 20) {
    try {
      const testFiles = await glob("**/*.test.ts", { cwd: PROJECT_ROOT, ignore: ["**/node_modules/**"] });
      const predictions = predictiveAnalytics.predictFailures(testFiles.slice(0, limit));
      console.log(predictiveAnalytics.generateReport());
      process.exit(predictions.filter((p) => p.failureProbability > 0.7).length > 0 ? 1 : 0);
    } catch (err: any) {
      console.error(c("red", `✗ Error: ${err.message}`));
      process.exit(1);
    }
  },

  async parallel(limit = 20) {
    try {
      const testFiles = await glob("**/*.test.ts", { cwd: PROJECT_ROOT, ignore: ["**/node_modules/**"] });
      const optimization = parallelizationOptimizer.optimize(testFiles.slice(0, limit));
      console.log(parallelizationOptimizer.generateReport(optimization));
      process.exit(0);
    } catch (err: any) {
      console.error(c("red", `✗ Error: ${err.message}`));
      process.exit(1);
    }
  },

  async security(paths: string[] = ["apps/web/app/api"]) {
    try {
      const result = await securityScanner.scan(paths);
      console.log(securityScanner.generateReport(result));
      securityScanner.saveReport(result);
      process.exit(result.summary.critical > 0 ? 1 : 0);
    } catch (err: any) {
      console.error(c("red", `✗ Error: ${err.message}`));
      process.exit(1);
    }
  },

  data(count = 5) {
    try {
      const users = testDataFactory.generateUsers(count);
      console.log(JSON.stringify(users, null, 2));
      process.exit(0);
    } catch (err: any) {
      console.error(c("red", `✗ Error: ${err.message}`));
      process.exit(1);
    }
  },

  async e2e(subCommand: string = "run", ...args: string[]) {
    try {
      switch (subCommand) {
        case "generate":
          const generated = await e2eGenerator.generate(args.length > 0 ? args : undefined);
          console.log(c("green", `\n✅ Generated ${generated.length} E2E test files`));
          process.exit(0);
          break;
        case "run":
          const report = await e2eGenerator.run(args[0]);
          process.exit(report.summary.failed > 0 ? 1 : 0);
          break;
        case "list":
          await e2eGenerator.list();
          process.exit(0);
          break;
        default:
          console.log(`
${c("cyan", "E2E Test Commands:")}

  ${c("green", "testintel e2e generate")}     Generate E2E tests from API routes
  ${c("green", "testintel e2e run")}          Run all E2E tests
  ${c("green", "testintel e2e list")}         List existing E2E tests

${c("yellow", "Examples:")}
  testintel e2e generate              Generate tests for all API routes
  testintel e2e generate apps/web     Generate for specific path
  testintel e2e run                   Run all E2E tests
  testintel e2e list                  Show existing tests
`);
          process.exit(0);
      }
    } catch (err: any) {
      console.error(c("red", `✗ Error: ${err.message}`));
      process.exit(1);
    }
  },

  help() {
    console.log(`
${c("cyan", "Test Intelligence CLI")} ${c("gray", "v" + VERSION)}

${c("yellow", "Usage:")}
  testintel <command> [options]

${c("yellow", "Commands:")}
  ${c("green", "run [mode]")}          Run test suite (full|quick, default: full)
  ${c("green", "e2e [action]")}        E2E tests (generate|run|list)
  ${c("green", "prioritize [limit]")}  AI test prioritization (default: 20 tests)
  ${c("green", "predict [limit]")}     Predict test failures (default: 20 tests)
  ${c("green", "parallel [limit]")}    Optimize parallelization (default: 20 tests)
  ${c("green", "security [paths...]")} Scan for vulnerabilities (default: apps/web/app/api)
  ${c("green", "data [count]")}        Generate test data (default: 5 users)
  ${c("green", "help, --help, -h")}    Show this help
  ${c("green", "version, --version")}  Show version

${c("yellow", "Examples:")}
  testintel run
  testintel run quick
  testintel prioritize 50
  testintel security apps/web lib
  testintel data 10

${c("yellow", "Config File:")}
  Create ${c("cyan", ".testintelrc.json")} in project root:
  {
    "stages": ["security", "prioritize"],
    "parallel": true,
    "verbose": true,
    "output": "junit"
  }

${c("yellow", "Exit Codes:")}
  0 - Success
  1 - Failure (tests failed, vulnerabilities found, etc.)
`);
    process.exit(0);
  },

  version() {
    console.log(VERSION);
    process.exit(0);
  },
};

// Parse CLI args
const args = process.argv.slice(2);
const command = args[0] || "help";
const options = args.slice(1);

// Execute command
(async () => {
  switch (command) {
    case "run":
      await commands.run((options[0] as "full" | "quick") || "full");
      break;
    case "prioritize":
      await commands.prioritize(parseInt(options[0]) || 20);
      break;
    case "predict":
      await commands.predict(parseInt(options[0]) || 20);
      break;
    case "parallel":
      await commands.parallel(parseInt(options[0]) || 20);
      break;
    case "security":
      await commands.security(options.length > 0 ? options : undefined);
      break;
    case "data":
      commands.data(parseInt(options[0]) || 5);
      break;
    case "e2e":
      await commands.e2e(options[0] || "run", ...options.slice(1));
      break;
    case "version":
    case "-v":
    case "--version":
      commands.version();
      break;
    case "help":
    case "-h":
    case "--help":
    default:
      commands.help();
  }
})();
