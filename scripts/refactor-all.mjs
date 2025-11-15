#!/usr/bin/env -S node --input-type=module
// [P0][APP][CODE] Refactor All
// Tags: P0, APP, CODE

/**
 * @fileoverview Master Compliance Refactor Agent - Analyzes and fixes code violations
 * @layer 02
 * @package fresh-schedules-scripts
 * @purpose Orchestrates compliance analysis across all files using v15 standards
 * @owner patrick_craven
 * @block_id BLOCK-3
 * @project Fresh Schedules
 *
 * @meta
 *   Status: Ready
 *   Last-Checked: 2025-11-15T14:00:00Z
 *   Checked-By: FRESH-Engine-v15.0
 */

import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// --- CONFIGURATION ---
const FILE_PATTERNS = ["apps/**/*.ts", "apps/**/*.tsx", "packages/**/*.ts", "firestore.rules"];
const EXCLUDE_PATTERNS = ["**/node_modules/**", "**/.next/**", "**/dist/**"];
const OUTPUT_FILE = "refactor-plan.md";
const MANIFEST_FILE = "migration-manifest.csv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = execSync("git rev-parse --show-toplevel", {
  encoding: "utf-8",
  cwd: __dirname,
}).trim();
const STANDARDS_DIR = path.join(REPO_ROOT, "docs", "standards");

// --- STANDARDS LOADER ---
async function loadStandards() {
  const standards = {};
  const standardFiles = [
    "IMPORTS_STANDARD.md",
    "NAMING_STANDARD.md",
    "BARREL_STANDARD.md",
    "DIRECTORY_LAYOUT_STANDARD.md",
  ];

  for (const file of standardFiles) {
    const filePath = path.join(STANDARDS_DIR, file);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      standards[file.replace(".md", "")] = content;
    } catch (err) {
      console.warn(`⚠️  Standard not found: ${file}`);
    }
  }

  return standards;
}

// --- ANALYSIS FUNCTIONS ---
function analyzeImports(content) {
  const violations = [];
  const lines = content.split("\n");
  const importGroups = [[], [], [], [], []];

  for (const line of lines) {
    if (!line.trim().startsWith("import")) continue;

    if (line.includes('from "fs') || line.includes("from 'fs")) importGroups[0].push(line);
    else if (line.includes('from "react') || line.includes("from 'react"))
      importGroups[1].push(line);
    else if (line.includes('from "@') || line.includes("from '@")) importGroups[2].push(line);
    else if (line.includes('from "./') || line.includes("from './")) importGroups[3].push(line);
    else if (line.includes("css") || line.includes("scss")) importGroups[4].push(line);
  }

  // Check for missing type-only imports
  if (!content.includes("import type")) {
    violations.push({
      severity: "medium",
      rule: "IMPORTS_STANDARD",
      message: "Consider using 'import type' for type-only imports to reduce bundle size.",
    });
  }

  return violations;
}

function analyzeNaming(content) {
  const violations = [];

  // Check for tenantId (should be networkId)
  if (content.includes("tenantId")) {
    violations.push({
      severity: "critical",
      rule: "NAMING_STANDARD",
      message: "Found 'tenantId' - use 'networkId' instead (canonical form).",
    });
  }

  // Check for organizationId (should be orgId)
  if (content.match(/organizationId|organizationID/)) {
    violations.push({
      severity: "critical",
      rule: "NAMING_STANDARD",
      message: "Found non-canonical org ID naming. Use 'orgId' consistently.",
    });
  }

  return violations;
}

function analyzeDirectoryLayout(filePath) {
  const violations = [];
  const isUIPath = filePath.includes("components/") || filePath.includes("app/(routes)");

  // Check for firebase-admin in UI layer
  if (isUIPath && (filePath.endsWith(".ts") || filePath.endsWith(".tsx"))) {
    violations.push({
      severity: "info",
      rule: "DIRECTORY_LAYOUT_STANDARD",
      message: "File is in UI layer (Layer 03). Verify no firebase-admin imports.",
    });
  }

  return violations;
}

function analyzeBarrels(content, filePath) {
  const violations = [];

  if (filePath.endsWith("index.ts") || filePath.endsWith("index.tsx")) {
    const hasRuntimeExport = content.includes("export {") && !content.includes("export type");
    const hasJustification = content.includes("BARREL_RUNTIME_JUSTIFICATION");

    if (hasRuntimeExport && !hasJustification) {
      violations.push({
        severity: "high",
        rule: "BARREL_STANDARD",
        message:
          "Runtime barrel without justification. Add '// BARREL_RUNTIME_JUSTIFICATION:' comment or use 'export type' only.",
      });
    }
  }

  return violations;
}

// --- MAIN ANALYSIS ---
async function generateRefactorPlan() {
  console.log("📚 Loading standards...");
  const standards = await loadStandards();
  console.log(`✅ Loaded ${Object.keys(standards).length} standards\n`);

  console.log("🔍 Scanning files...");

  // Change to repo root for git command
  process.chdir(REPO_ROOT);

  const files = execSync("git ls-files", { encoding: "utf-8" })
    .split("\n")
    .filter((file) => {
      if (!file) return false;
      if (EXCLUDE_PATTERNS.some((p) => file.includes(p.replace(/\*\*/g, "")))) return false;
      return FILE_PATTERNS.some((p) => new RegExp(p.replace(/\*\*/g, ".*")).test(file));
    });

  if (files.length === 0) {
    console.log("❌ No files found to refactor. Exiting.");
    process.exit(0);
  }

  console.log(`📄 Found ${files.length} files to analyze\n`);

  const plan = [
    `# Automated Refactoring Plan`,
    `**Generated:** ${new Date().toISOString()}`,
    `**Files Analyzed:** ${files.length}`,
    "---",
    "",
  ];

  const manifest = [
    "file_path,file_hash,layer,status,violation_count_critical,violation_count_high,last_checked_by,last_checked_at",
  ];
  let statsTotal = 0;
  let statsCritical = 0;
  let statsHigh = 0;

  for (const file of files) {
    try {
      const filePath = path.join(REPO_ROOT, file);
      const fileContent = await fs.readFile(filePath, "utf-8");

      // Run all analyzers
      const allViolations = [
        ...analyzeImports(fileContent),
        ...analyzeNaming(fileContent),
        ...analyzeDirectoryLayout(file),
        ...analyzeBarrels(fileContent, file),
      ];

      const criticalCount = allViolations.filter((v) => v.severity === "critical").length;
      const highCount = allViolations.filter((v) => v.severity === "high").length;

      statsTotal += allViolations.length;
      statsCritical += criticalCount;
      statsHigh += highCount;

      if (allViolations.length > 0) {
        plan.push(`## 📋 ${file}`);
        plan.push(
          `**Violations:** ${criticalCount} critical, ${highCount} high, ${allViolations.filter((v) => v.severity === "medium").length} medium`,
        );
        plan.push("");

        for (const violation of allViolations) {
          const icon =
            violation.severity === "critical" ? "🔴" : violation.severity === "high" ? "🟠" : "🟡";
          plan.push(`${icon} **[${violation.rule}]** ${violation.message}`);
        }
        plan.push("");
      }

      // Add to manifest
      const status =
        criticalCount > 0 ? "Needs-Manual-Review" : highCount > 0 ? "Needs-Refactor" : "Ready";
      manifest.push(
        `${file},${Buffer.from(fileContent).toString("base64").substring(0, 16)},2,${status},${criticalCount},${highCount},FRESH-Engine-v15.0,${new Date().toISOString()}`,
      );
    } catch (err) {
      console.error(`❌ Error processing ${file}: ${err.message}`);
    }
  }

  plan.push("---");
  plan.push(`## Summary`);
  plan.push(`- **Total Violations:** ${statsTotal}`);
  plan.push(`- **Critical:** ${statsCritical}`);
  plan.push(`- **High:** ${statsHigh}`);
  plan.push(`- **Files Analyzed:** ${files.length}`);

  await fs.writeFile(OUTPUT_FILE, plan.join("\n"));
  await fs.writeFile(MANIFEST_FILE, manifest.join("\n"));

  console.log(`✅ Analysis complete!`);
  console.log(`📄 Refactor plan: ${OUTPUT_FILE}`);
  console.log(`📊 Manifest: ${MANIFEST_FILE}`);
  console.log(
    `\n📈 Summary:\n  Critical: ${statsCritical}\n  High: ${statsHigh}\n  Total: ${statsTotal}`,
  );
}

generateRefactorPlan().catch((err) => {
  console.error("💥 Fatal error:", err.message);
  process.exit(1);
});
