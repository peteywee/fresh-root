#!/usr/bin/env node
// [P1][REFACTOR][ORCHESTRATOR] Surgical Refactoring Orchestrator
// Tags: P1, REFACTOR, ORCHESTRATOR, DIFFS, ROLLBACK, MANIFEST
/**
 * Surgical Refactoring Orchestrator (v15.0 compliant)
 *
 * Responsibilities:
 * ✅ Orchestrate AST-based transformations
 * ✅ Generate unified diffs for review
 * ✅ Create backups and rollback keys
 * ✅ Track all changes in manifest
 * ✅ Support --plan-only for safe preview
 * ✅ Provide handoff protocol for agents
 *
 * Prime Directive: NON-DESTRUCTIVE SURGICAL OPERATIONS
 * All changes reversible and fully tracked.
 */
import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { refactorFile, generateManifest, rollback } from "./ast-engine.mts";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
// --- ARGUMENT PARSING ---
function parseArgs() {
  const argv = process.argv.slice(2);
  let planOnly = false;
  let generateDiffs = true;
  let createBackups = true;
  let dryRun = false;
  let rollbackMode = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--plan-only") planOnly = true;
    else if (arg === "--dry-run") dryRun = true;
    else if (arg === "--no-diffs") generateDiffs = false;
    else if (arg === "--no-backups") createBackups = false;
    else if (arg === "--rollback") rollbackMode = true;
  }
  return { planOnly, generateDiffs, createBackups, dryRun, rollbackMode };
}
// --- DIFF REPORT GENERATOR ---
async function generateDiffReport(allChanges) {
  const report = [];
  report.push("# 🔍 Surgical Refactoring Diff Report\n");
  report.push(`Generated: ${new Date().toISOString()}\n`);
  report.push("---\n");
  let totalAdditions = 0;
  let totalDeletions = 0;
  for (const file of allChanges) {
    report.push(`## ${file.filePath}\n`);
    let fileAdditions = 0;
    let fileDeletions = 0;
    for (const change of file.changes) {
      fileAdditions += change.stats.additions;
      fileDeletions += change.stats.deletions;
      report.push(`### [${change.type.toUpperCase()}]\n`);
      report.push("```diff\n");
      report.push(change.unified);
      report.push("\n```\n");
    }
    report.push(`**Summary**: +${String(fileAdditions)} / -${String(fileDeletions)}\n\n`);
    totalAdditions += fileAdditions;
    totalDeletions += fileDeletions;
  }
  report.push("---\n");
  report.push(`## Overall Summary\n`);
  report.push(`- **Total Changes**: ${String(allChanges.length)} files\n`);
  report.push(`- **Additions**: +${String(totalAdditions)}\n`);
  report.push(`- **Deletions**: -${String(totalDeletions)}\n`);
  return report.join("\n");
}
// --- MAIN ORCHESTRATOR ---
async function orchestrate() {
  const args = parseArgs();
  console.log("🔧 Surgical Refactoring Orchestrator (v15.0)\n");
  console.log(`Plan-only: ${String(args.planOnly)}`);
  console.log(`Create backups: ${String(args.createBackups)}`);
  console.log(`Generate diffs: ${String(args.generateDiffs)}`);
  console.log();
  // Rollback mode
  if (args.rollbackMode) {
    console.log("🔄 Rollback mode enabled...\n");
    const result = await rollback(".refactor-manifest.json");
    console.log(`✅ Restored: ${String(result.restored)} files`);
    console.log(`❌ Failed: ${String(result.failed)} files`);
    process.exit(result.failed > 0 ? 1 : 0);
  }
  // Get files to refactor
  process.chdir(REPO_ROOT);
  const files = execSync("git ls-files --cached --others --exclude-standard", { encoding: "utf-8" })
    .split("\n")
    .filter(
      (file) =>
        (file.endsWith(".ts") || file.endsWith(".tsx")) &&
        !file.includes("node_modules") &&
        !file.includes(".next"),
    );
  console.log(`📄 Found ${String(files.length)} files to analyze\n`);
  // Refactor each file
  const allChanges = [];
  const manifesto = [];
  for (const file of files.slice(0, 10)) {
    // Limit for demo
    const result = await refactorFile(file, {
      planOnly: args.planOnly,
      dryRun: args.dryRun,
      createBackup: args.createBackups,
      generateDiff: args.generateDiffs,
    });
    if (result.changes.length > 0) {
      allChanges.push({
        filePath: file,
        changes: result.diffs.map((d) => ({
          type: result.changes[0]?.type || "unknown",
          stats: d.stats,
          unified: d.unified,
        })),
      });
      manifesto.push(...result.changes);
    }
  }
  // Generate reports
  if (args.generateDiffs && allChanges.length > 0) {
    console.log("📊 Generating diff report...\n");
    const diffReport = await generateDiffReport(allChanges);
    await fs.writeFile(".refactor-diffs.md", diffReport, "utf-8");
    console.log("✅ Diffs saved to .refactor-diffs.md\n");
  }
  // Generate manifest
  if (manifesto.length > 0) {
    const manifest = await generateManifest(manifesto);
    console.log("📋 Change Manifest Summary:");
    console.log(`- Total changes: ${String(manifest.summary.total)}`);
    console.log(`- By type: ${JSON.stringify(manifest.summary.byType)}`);
    console.log(`- Backups created: ${String(manifest.summary.totalBackups)}`);
    console.log(`- Rollback key: ${manifest.summary.rollbackKey}\n`);
  }
  if (args.planOnly) {
    console.log("✅ Plan-only mode: No changes applied\n");
    console.log("To apply changes, run without --plan-only flag");
  } else {
    console.log("✅ Refactoring complete!\n");
    console.log("To rollback all changes, run: node scripts/refactor/orchestrator.mjs --rollback");
  }
}
orchestrate().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
