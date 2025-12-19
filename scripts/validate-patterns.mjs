#!/usr/bin/env node
// [P2][APP][CODE] Validate Patterns
// Tags: P2, APP, CODE
/**
 * @fileoverview Pattern Validator - Detects symmetry violations in Fresh Schedules codebase
 * @layer Process
 * @package @fresh-schedules/scripts
 * @purpose Automated detection of pattern deviations based on the Symmetry Framework
 * @owner FRESH Engine
 * @version 2.0 — Tiered Severity System with explicit Tier 1 and score thresholds
 *
 * TIER SYSTEM:
 *   🔴 TIER 0 (SECURITY): -25 points each, blocks PR, alerts team
 *   🟠 TIER 1 (INTEGRITY): -10 points each, blocks PR
 *   🟡 TIER 2 (ARCHITECTURE): -2 points each, warning only
 *   🟢 TIER 3 (STYLE): -0.5 points each, informational
 *
 * THRESHOLDS (defaults, overridable via CLI/env):
 *   MIN_SCORE: 90  (below this, overall status is FAILING)
 *   Tier 0 or Tier 1: Blocks CI/CD — no exceptions
 *   Score < 90: Fails CI on main and all PRs
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative, extname, basename, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

// ─────────────────────────────────────────────────────────────────────────────
// Configuration: thresholds
// ─────────────────────────────────────────────────────────────────────────────

function parseEnvNumber(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

const DEFAULT_MIN_SCORE = 90;
const MIN_SCORE = parseEnvNumber("FRESH_PATTERNS_MIN_SCORE", DEFAULT_MIN_SCORE);

// Skip validation if SKIP_PATTERN_VALIDATOR is set
if (process.env.SKIP_PATTERN_VALIDATOR === "true") {
  console.log("⏭️  SKIP_PATTERN_VALIDATOR=true — Pattern validation skipped");
  process.exit(0);
}

// Directories to skip during scan (prevents OOM)
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  "dist",
  "build",
  "coverage",
  ".cache",
  ".pnpm",
  "out",
  "repomix",
]);

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION: Pattern Definitions (kept inline for now)
// ─────────────────────────────────────────────────────────────────────────────

const PATTERNS = {
  // Layer 00: Domain Types
  SCHEMA_FILE: {
    layer: 0,
    pathMatch: /packages\/types\/src\/(?!.*\.test\.ts$).*\.ts$/,
    checks: [
      {
        name: "Header Present",
        tier: 3,
        severity: "info",
        test: (content) => /^\/\/ \[P\d\]\[.+\]\[SCHEMA\]/m.test(content),
        message: "Missing standard header: // [P#][CATEGORY][SCHEMA] description",
      },
      {
        name: "Zod Import",
        tier: 1,
        severity: "error",
        test: (content) => /import \{\s*z\s*\} from ['"]zod['"]/.test(content),
        message: 'Missing Zod import: import { z } from "zod"',
      },
      {
        name: "Type Inference Pattern",
        tier: 1,
        severity: "error",
        test: (content) => {
          const hasInfer = /export type\s+\w+\s*=\s*z\.infer<\s*typeof\s+\w+Schema\s*>/.test(
            content,
          );
          return hasInfer;
        },
        message: "Types must be inferred from Zod schemas using z.infer<typeof NameSchema>",
      },
    ],
  },

  // Layer 02: API Routes
  API_ROUTE: {
    layer: 2,
    pathMatch: /apps\/web\/app\/api\/.*\/route\.ts$/,
    checks: [
      {
        name: "Header Present",
        tier: 3,
        severity: "info",
        test: (content) => /^\/\/ \[P\d\]\[.+\]\[API\]/m.test(content),
        message: "Missing standard header: // [P#][API][CODE] description",
      },
      {
        name: "Security Wrapper",
        tier: 0,
        severity: "error",
        test: (content) => /(withSecurity|requireOrgMembership|requireSession|createOrgEndpoint|createAuthenticatedEndpoint|createPublicEndpoint|createAdminEndpoint)/.test(content),
        message:
          "API route missing security wrapper (withSecurity/requireOrgMembership/requireSession/create*Endpoint)",
      },
      {
        name: "Write Validation",
        tier: 0,
        severity: "error",
        test: (content) => {
          // If file has POST or PATCH, require evidence of validation
          const hasWrite = /(POST|PATCH|PUT)\s*=/.test(content);
          if (!hasWrite) return true;
          const hasValidation =
            /parseJson\(|safeParse\(|\.parse\(/.test(content) || /Schema\s*\.parse\(/.test(content) || /\binput\s*:/m.test(content);
          return hasValidation;
        },
        message: "Write API routes must validate input using Zod before use",
      },
    ],
  },

  // Layer 01: Firestore Rules
  FIRESTORE_RULES: {
    layer: 1,
    pathMatch: /firestore\.rules$/,
    checks: [
      {
        name: "Root Deny Present",
        tier: 0,
        severity: "error",
        test: (content) =>
          /match \/databases\/\{database\}\/documents \{\s*\/\/? default deny/i.test(content) ||
          /allow\s+read,\s*write:\s*if\s+false;/.test(content),
        message: "Firestore rules must deny by default at root",
      },
      // Additional rules checks can be added here as needed
    ],
  },
};

// Triad entities: schema/API/rules coverage
const TRIAD_ENTITIES = [
  {
    name: "Schedule",
    schema: "packages/types/src/schedules.ts",
    api: "apps/web/app/api/schedules/route.ts",
    rulesPattern: /match \/schedules\//,
  },
  {
    name: "Organization",
    schema: "packages/types/src/orgs.ts",
    api: "apps/web/app/api/organizations/route.ts",
    rulesPattern: /match \/orgs\//,
  },
  {
    name: "Shift",
    schema: "packages/types/src/shifts.ts",
    api: "apps/web/app/api/shifts/route.ts",
    rulesPattern: /match \/shifts\//,
  },
  // Extend as needed: Venue, Position, Staff, etc.
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper utilities
// ─────────────────────────────────────────────────────────────────────────────

function readFileSafe(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function walkDir(root, targetPath, files = []) {
  try {
    const stats = statSync(targetPath);
    if (stats.isDirectory()) {
      const dirName = basename(targetPath);
      // Skip known heavy directories to prevent OOM
      if (SKIP_DIRS.has(dirName) || dirName.startsWith(".")) {
        return files;
      }
      for (const entry of readdirSync(targetPath)) {
        // Skip hidden files/dirs and known heavy dirs
        if (entry.startsWith(".") || SKIP_DIRS.has(entry)) continue;
        const full = join(targetPath, entry);
        walkDir(root, full, files);
      }
    } else if (stats.isFile()) {
      files.push(targetPath);
    }
  } catch (err) {
    // Skip broken symlinks and inaccessible paths
    if (err.code !== "ENOENT" && err.code !== "EACCES") {
      throw err;
    }
  }
  return files;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validator
// ─────────────────────────────────────────────────────────────────────────────

class PatternValidator {
  constructor(rootDir, options = {}) {
    this.rootDir = rootDir;
    this.options = {
      verbose: !!options.verbose,
    };
    this.results = {
      errors: [],
      warnings: [],
      info: [],
      triadStatus: [],
    };
  }

  log(msg) {
    if (this.options.verbose) console.log(msg);
  }

  classify(path) {
    const rel = relative(this.rootDir, path);
    for (const [key, pattern] of Object.entries(PATTERNS)) {
      if (pattern.pathMatch.test(rel)) return { key, pattern, rel };
    }
    return null;
  }

  scanFile(path) {
    const classification = this.classify(path);
    if (!classification) return;

    const { key, pattern, rel } = classification;
    const content = readFileSafe(path);

    this.log(`Checking [${key}] ${rel}`);

    for (const check of pattern.checks) {
      const ok = check.test(content);
      if (!ok) {
        const record = {
          file: rel,
          pattern: key,
          name: check.name,
          message: check.message,
          tier: check.tier,
          severity: check.severity,
        };
        if (check.tier === 0 || check.severity === "error") {
          this.results.errors.push(record);
        } else if (check.tier === 1 || check.severity === "warn" || check.severity === "warning") {
          this.results.warnings.push(record);
        } else {
          this.results.info.push(record);
        }
      }
    }
  }

  scanDirectory(targetPath) {
    const files = walkDir(this.rootDir, targetPath);
    this.log(`Found ${files.length} files to check`);
    for (const file of files) {
      // Only check relevant file types
      if (/\.(ts|tsx|rules)$/.test(file)) {
        this.scanFile(file);
      }
    }
  }

  validateTriad() {
    this.log("\nChecking Triad of Trust...\n");

    const rulesPath = join(this.rootDir, "firestore.rules");
    const rulesContent = readFileSafe(rulesPath);

    for (const entity of TRIAD_ENTITIES) {
      const status = {
        entity: entity.name,
        schema: false,
        api: false,
        rules: false,
      };

      const schemaPath = join(this.rootDir, entity.schema);
      const apiPath = join(this.rootDir, entity.api);

      if (existsSync(schemaPath)) status.schema = true;
      if (existsSync(apiPath)) status.api = true;
      if (rulesContent && entity.rulesPattern.test(rulesContent)) status.rules = true;

      this.results.triadStatus.push(status);
    }
  }

  printReport() {
    const tier0 = this.results.errors.filter((e) => e.tier === 0);
    const tier1 = this.results.errors.filter((e) => e.tier === 1);
    const tier2 = this.results.warnings.filter((e) => e.tier === 2);
    const tier3 = this.results.info.filter((e) => e.tier === 3);

    let score = 100;
    score -= tier0.length * 25;
    score -= tier1.length * 10;
    score -= tier2.length * 2;
    score -= tier3.length * 0.5;

    const completeTriads = this.results.triadStatus.filter(
      (t) => t.schema && t.api && t.rules,
    ).length;
    score += completeTriads * 5;
    if (tier0.length === 0) score += 10;
    if (tier1.length === 0) score += 5;

    score = Math.max(0, score);

    let status = "FAILING";
    let statusEmoji = "❌";
    if (score >= 95) {
      status = "PERFECT";
      statusEmoji = "💎";
    } else if (score >= 90) {
      status = "EXCELLENT";
      statusEmoji = "🏆";
    } else if (score >= MIN_SCORE) {
      status = "PASSING";
      statusEmoji = "✅";
    }

    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log(`${statusEmoji} SCORE: ${score.toFixed(1)} points — ${status}`);
    console.log("───────────────────────────────────────────────────────────────");
    console.log(`  🔴 Tier 0 (Security):    ${tier0.length}`);
    console.log(`  🟠 Tier 1 (Integrity):   ${tier1.length}`);
    console.log(`  🟡 Tier 2 (Architecture): ${tier2.length}`);
    console.log(`  🟢 Tier 3 (Style):       ${tier3.length}`);
    console.log(`  🎯 Complete Triads:      ${completeTriads}`);
    console.log(`  🧱 MIN_SCORE threshold:  ${MIN_SCORE}`);
    console.log("═══════════════════════════════════════════════════════════════\n");

    if (tier0.length > 0) {
      console.log("🔴 Tier 0 Violations (Security):");
      for (const e of tier0) {
        console.log(`  - [${e.file}] ${e.name}: ${e.message}`);
      }
      console.log("");
    }

    if (tier1.length > 0) {
      console.log("🟠 Tier 1 Violations (Integrity):");
      for (const e of tier1) {
        console.log(`  - [${e.file}] ${e.name}: ${e.message}`);
      }
      console.log("");
    }

    if (tier2.length > 0) {
      console.log("🟡 Tier 2 Warnings (Architecture):");
      for (const e of tier2) {
        console.log(`  - [${e.file}] ${e.name}: ${e.message}`);
      }
      console.log("");
    }

    if (tier3.length > 0) {
      console.log("🟢 Tier 3 Info (Style):");
      for (const e of tier3) {
        console.log(`  - [${e.file}] ${e.name}: ${e.message}`);
      }
      console.log("");
    }

    console.log("📐 TRIAD OF TRUST STATUS:");
    console.log("───────────────────────────────────────────────────────────────");
    console.log("  Entity        │ Schema │ API │ Rules");
    console.log("  ──────────────┼────────┼─────┼──────");
    for (const t of this.results.triadStatus) {
      const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);
      console.log(
        `  ${pad(t.entity, 13)} │   ${t.schema ? "✅" : "❌"}   │  ${t.api ? "✅" : "❌"} │  ${t.rules ? "✅" : "❌"}`,
      );
    }
    console.log("───────────────────────────────────────────────────────────────\n");

    if (tier0.length > 0 || tier1.length > 0) {
      console.log(
        `🚫 CRITICAL: Tier 0/1 violations detected. CI WILL BLOCK. Fix security and integrity issues before merging.`,
      );
    } else if (score < MIN_SCORE) {
      console.log(
        `⚠️  Score ${score.toFixed(1)} is below minimum threshold (${MIN_SCORE}). CI WILL BLOCK. Add missing headers or fix Tier 2 issues.`,
      );
    } else if (score >= 95) {
      console.log("💎 PERFECT: Codebase meets all production standards. Ready to deploy.");
    } else if (score >= 90) {
      console.log("🏆 EXCELLENT: Core patterns solid. Address remaining Tier 3 for 100%.");
    } else {
      console.log("✅ PASSING: Standards met. Improvements welcome.");
    }
  }

  run(targetPath = this.rootDir) {
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║         FRESH SCHEDULES PATTERN VALIDATOR                    ║");
    console.log("║         Symmetry Framework v2.0 — Tiered Severity            ║");
    console.log("╚══════════════════════════════════════════════════════════════╝\n");

    console.log(`Scanning: ${targetPath}\n`);

    this.scanDirectory(targetPath);
    this.validateTriad();
    this.printReport();

    const tier0Count = this.results.errors.filter((e) => e.tier === 0).length;
    const tier1Count = this.results.errors.filter((e) => e.tier === 1).length;

    let score = 100;
    const tier2 = this.results.warnings.filter((e) => e.tier === 2).length;
    const tier3 = this.results.info.filter((e) => e.tier === 3).length;

    score -= tier0Count * 25;
    score -= tier1Count * 10;
    score -= tier2 * 2;
    score -= tier3 * 0.5;

    const completeTriads = this.results.triadStatus.filter(
      (t) => t.schema && t.api && t.rules,
    ).length;
    score += completeTriads * 5;
    if (tier0Count === 0) score += 10;
    if (tier1Count === 0) score += 5;
    score = Math.max(0, score);

    // CI Exit rules:
    // - Any Tier 0 => fail
    // - Any Tier 1 => fail
    // - Score < MIN_SCORE => fail
    if (tier0Count > 0 || tier1Count > 0 || score < MIN_SCORE) {
      return 1;
    }
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI entry
// ─────────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const verbose = args.includes("--verbose") || args.includes("-v");
const targetArg = args.find((a) => !a.startsWith("-"));
const targetPath = targetArg ? join(ROOT, targetArg) : ROOT;

const validator = new PatternValidator(ROOT, { verbose });
const exitCode = validator.run(targetPath);

// Write machine-readable report for tooling/agents to consume
try {
  const outPath = join(ROOT, "pattern-validation-report.json");
  const report = {
    errors: validator.results.errors,
    warnings: validator.results.warnings,
    info: validator.results.info,
    triadStatus: validator.results.triadStatus,
    minScore: MIN_SCORE,
  };
  try {
    const { writeFileSync } = await import('fs');
    writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
    if (verbose) console.log(`Wrote report to ${outPath}`);
  } catch (e) {
    if (verbose) console.error('Failed to write report file', e);
  }
} catch (e) {
  if (verbose) console.error('Could not generate machine report', e);
}

process.exit(exitCode);
