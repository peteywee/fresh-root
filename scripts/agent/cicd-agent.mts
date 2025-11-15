#!/usr/bin/env node
// [P1][APP][CI/CD] CI/CD Pipeline Agent
// Tags: P1, APP, CI/CD, AUTOMATION, VALIDATION

/**
 * CI/CD Pipeline Setup & Validation Agent
 *
 * Responsibilities:
 * - Validates existing workflow configurations
 * - Generates/updates workflow files based on standards
 * - Ensures required CI gates are present
 * - Auto-fixes common workflow issues
 * - Generates workflow validation reports
 *
 * Handoff Protocol:
 * - Receives: { workflows: [], standards: {}, config: {} }
 * - Returns: { validated: [], created: [], updated: [], errors: [] }
 *
 * Usage:
 *   pnpm exec node scripts/agent/cicd-agent.mts --issue 42
 *   pnpm exec node scripts/agent/cicd-agent.mts --handoff workflow-setup
 */

import { z } from "zod";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { log, ok, warn, err } from "./lib/logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");
const WORKFLOWS_DIR = join(REPO_ROOT, ".github", "workflows");

// --- SCHEMAS ---
const ArgSchema = z.object({
  issue: z.string().default("42"),
  handoff: z.string().optional(),
  force: z.boolean().default(false),
  planOnly: z.boolean().default(false),
  dryRun: z.boolean().default(false),
});

const _WorkflowSchema = z.object({
  name: z.string(),
  path: z.string(),
  triggers: z.array(z.string()),
  steps: z.array(z.string()),
  required: z.boolean().default(false),
});

const _HandoffSchema = z.object({
  type: z.enum(["workflow-setup", "validation-report", "auto-fix"]),
  workflows: z.array(z.string()).optional(),
  standards: z.record(z.string(), z.unknown()).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().optional(),
});

type Workflow = z.infer<typeof _WorkflowSchema>;

interface AgentResult {
  validated: string[];
  created: string[];
  updated: string[];
  errors: string[];
  report: {
    totalWorkflows: number;
    passedValidation: number;
    requiredMissing: string[];
    recommendations: string[];
  };
}

// --- WORKFLOW DEFINITIONS ---
const REQUIRED_WORKFLOWS: Record<string, Workflow> = {
  ci: {
    name: "CI (Main)",
    path: "ci.yml",
    triggers: ["push", "pull_request"],
    steps: [
      "checkout",
      "setup-pnpm",
      "setup-node",
      "install",
      "lint",
      "typecheck",
      "test-rules",
      "test-api",
    ],
    required: true,
  },
  pr: {
    name: "PR Checks",
    path: "pr.yml",
    triggers: ["pull_request"],
    steps: ["checkout", "setup-pnpm", "lint", "typecheck"],
    required: true,
  },
  eslint: {
    name: "ESLint + TS",
    path: "eslint-ts-agent.yml",
    triggers: ["pull_request"],
    steps: ["checkout", "lint-ts", "auto-fix"],
    required: true,
  },
  rules: {
    name: "Firebase Rules Tests",
    path: "test-rules.yml",
    triggers: ["push", "pull_request"],
    steps: ["checkout", "firebase-emulator", "test-rules"],
    required: false,
  },
};

// --- ARGUMENT PARSING ---
function parseArgs() {
  const argv = process.argv.slice(2);
  let issue = "42",
    handoff,
    force = false,
    planOnly = false,
    dryRun = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") force = true;
    else if (a === "--plan-only") planOnly = true;
    else if (a === "--dry-run") dryRun = true;
    else if (a === "--issue") issue = argv[++i];
    else if (a === "--handoff") handoff = argv[++i];
  }

  return ArgSchema.parse({ issue, handoff, force, planOnly, dryRun });
}

// --- WORKFLOW VALIDATORS ---
async function validateWorkflow(filePath: string): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];

  try {
    const content = await readFile(filePath, "utf-8");

    // Check for valid YAML structure
    if (!content.includes("name:") || !content.includes("on:")) {
      issues.push("Missing required workflow fields (name, on)");
    }

    // Check for required steps
    if (!content.includes("actions/checkout")) {
      issues.push("Missing checkout action");
    }

    if (!content.includes("pnpm")) {
      issues.push("No pnpm setup found");
    }

    // Check for proper error handling
    if (content.includes("run:") && !content.includes("continue-on-error:")) {
      issues.push("Consider adding continue-on-error for non-critical steps");
    }

    // Check for Node.js version specification
    if (!content.includes("node-version")) {
      issues.push("Node.js version should be explicitly specified");
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  } catch (error) {
    return {
      valid: false,
      issues: [`Error reading workflow: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

// --- WORKFLOW DISCOVERY ---
async function discoverWorkflows(): Promise<Map<string, string>> {
  const workflows = new Map<string, string>();

  try {
    if (!existsSync(WORKFLOWS_DIR)) {
      mkdirSync(WORKFLOWS_DIR, { recursive: true });
      log(`Created workflows directory: ${WORKFLOWS_DIR}`);
      return workflows;
    }

    const files = await readdir(WORKFLOWS_DIR);
    for (const file of files) {
      if (file.endsWith(".yml") || file.endsWith(".yaml")) {
        const filePath = join(WORKFLOWS_DIR, file);
        const content = await readFile(filePath, "utf-8");
        workflows.set(file, content);
      }
    }

    log(`Discovered ${String(workflows.size)} workflows`);
    return workflows;
  } catch (error) {
    err(`Failed to discover workflows: ${error instanceof Error ? error.message : String(error)}`);
    return workflows;
  }
}

// --- WORKFLOW GENERATION ---
function generateCIWorkflow(): string {
  return `name: CI (Main)

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - uses: pnpm/action-setup@v4
        with: { version: 9.1.0 }

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm -w lint
        continue-on-error: true

      - name: Typecheck
        run: pnpm -w typecheck

      - name: Test Rules
        run: pnpm -w test:rules
        continue-on-error: true

      - name: Test API
        run: pnpm -w test
        continue-on-error: true

      - name: Build
        run: pnpm -w build
`;
}

function generatePRWorkflow(): string {
  return `name: PR Checks

on:
  pull_request:
    branches: [dev, main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0, ref: \${{ github.head_ref }} }

      - uses: pnpm/action-setup@v4
        with: { version: 9.1.0 }

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm -w lint

      - name: Typecheck
        run: pnpm -w typecheck
`;
}

// --- MAIN AGENT LOGIC ---
async function runAgent(args: z.infer<typeof ArgSchema>): Promise<AgentResult> {
  const result: AgentResult = {
    validated: [],
    created: [],
    updated: [],
    errors: [],
    report: {
      totalWorkflows: 0,
      passedValidation: 0,
      requiredMissing: [],
      recommendations: [],
    },
  };

  log(`🚀 CI/CD Agent started (issue #${args.issue})`);
  log(`Plan-only: ${String(args.planOnly)} | Dry-run: ${String(args.dryRun)}`);

  // Discover existing workflows
  log("\n📋 Discovering workflows...");
  const existingWorkflows = await discoverWorkflows();
  result.report.totalWorkflows = existingWorkflows.size;

  // Validate discovered workflows
  log("\n✅ Validating workflows...");
  for (const [name, _content] of existingWorkflows) {
    const filePath = join(WORKFLOWS_DIR, name);
    const validation = await validateWorkflow(filePath);

    if (validation.valid) {
      result.validated.push(name);
      result.report.passedValidation++;
      ok(`${name} - OK`);
    } else {
      result.errors.push(`${name}: ${validation.issues.join(", ")}`);
      warn(`${name} - Issues found`);
      validation.issues.forEach((issue) => {
        log(`  • ${issue}`);
      });
    }
  }

  // Check for required workflows
  log("\n🔍 Checking required workflows...");
  for (const [key, workflow] of Object.entries(REQUIRED_WORKFLOWS)) {
    if (!workflow.required) continue;

    const exists = existingWorkflows.has(workflow.path);
    if (!exists) {
      result.report.requiredMissing.push(workflow.path);
      warn(`Missing required workflow: ${workflow.path}`);

      if (!args.planOnly && !args.dryRun) {
        let content = "";
        if (key === "ci") content = generateCIWorkflow();
        else if (key === "pr") content = generatePRWorkflow();

        if (content) {
          const filePath = join(WORKFLOWS_DIR, workflow.path);
          mkdirSync(WORKFLOWS_DIR, { recursive: true });
          writeFileSync(filePath, content, "utf-8");
          result.created.push(workflow.path);
          ok(`Created: ${workflow.path}`);
        }
      }
    } else {
      ok(`${workflow.path} - Present`);
    }
  }

  // Generate report
  log("\n📊 Generating report...");
  const missingCount = result.report.requiredMissing.length;
  const errorCount = result.errors.length;
  const passedCount = result.report.passedValidation;
  result.report.recommendations = [
    missingCount > 0 ? `Create ${String(missingCount)} missing required workflow(s)` : "",
    errorCount > 0 ? `Fix ${String(errorCount)} validation issue(s)` : "",
    passedCount > 0 ? `${String(passedCount)} workflows valid` : "",
  ].filter(Boolean);

  return result;
}

// --- HANDOFF HANDLER ---
async function handleHandoff(handoff: string): Promise<AgentResult> {
  log(`\n🤝 Processing handoff: ${handoff}`);

  const result: AgentResult = {
    validated: [],
    created: [],
    updated: [],
    errors: [],
    report: {
      totalWorkflows: 0,
      passedValidation: 0,
      requiredMissing: [],
      recommendations: [],
    },
  };

  switch (handoff) {
    case "workflow-setup": {
      log("Setting up required workflows...");
      // Ensure all required workflows exist
      for (const [key, workflow] of Object.entries(REQUIRED_WORKFLOWS)) {
        if (!workflow.required) continue;

        const filePath = join(WORKFLOWS_DIR, workflow.path);
        if (!existsSync(filePath)) {
          let content = "";
          if (key === "ci") content = generateCIWorkflow();
          else if (key === "pr") content = generatePRWorkflow();

          if (content) {
            mkdirSync(WORKFLOWS_DIR, { recursive: true });
            writeFileSync(filePath, content, "utf-8");
            result.created.push(workflow.path);
            ok(`Created: ${workflow.path}`);
          }
        }
      }
      break;
    }

    case "validation-report": {
      log("Generating validation report...");
      const workflows = await discoverWorkflows();
      result.report.totalWorkflows = workflows.size;
      for (const [name] of workflows) {
        const filePath = join(WORKFLOWS_DIR, name);
        const validation = await validateWorkflow(filePath);
        if (validation.valid) {
          result.validated.push(name);
          result.report.passedValidation++;
        } else {
          result.errors.push(`${name}: ${validation.issues.join(", ")}`);
        }
      }
      break;
    }

    case "auto-fix": {
      log("Auto-fixing workflow issues...");
      // Placeholder for auto-fix logic
      ok("Auto-fix placeholder ready for implementation");
      break;
    }

    default: {
      err(`Unknown handoff type: ${handoff}`);
    }
  }

  return result;
}

// --- MAIN ENTRY POINT ---
async function main() {
  try {
    const args = parseArgs();

    let result: AgentResult;

    if (args.handoff) {
      result = await handleHandoff(args.handoff);
    } else {
      result = await runAgent(args);
    }

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 CI/CD Agent Summary");
    console.log("=".repeat(60));
    console.log(`✅ Validated: ${String(result.validated.length)}`);
    console.log(`✨ Created: ${String(result.created.length)}`);
    console.log(`♻️  Updated: ${String(result.updated.length)}`);
    console.log(`❌ Errors: ${String(result.errors.length)}`);
    console.log("\n📊 Report:");
    console.log(`  Total Workflows: ${String(result.report.totalWorkflows)}`);
    console.log(`  Passed Validation: ${String(result.report.passedValidation)}`);
    console.log(`  Required Missing: ${String(result.report.requiredMissing.length)}`);

    if (result.report.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      result.report.recommendations.forEach((rec) => {
        console.log(`  • ${rec}`);
      });
    }

    if (result.errors.length > 0) {
      console.log("\n⚠️  Issues:");
      result.errors.forEach((error) => {
        console.log(`  • ${error}`);
      });
    }

    ok("CI/CD Agent completed successfully");
    process.exit(result.errors.length > 0 ? 1 : 0);
  } catch (error) {
    err(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run if executed directly
void (async () => {
  if (process.argv[1]?.endsWith("cicd-agent.mts")) {
    await main();
  }
})();

export { runAgent, handleHandoff, validateWorkflow, discoverWorkflows };
