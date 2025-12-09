#!/usr/bin/env node

/**
 * [P0][CI][VALIDATION] Branch file pattern validator
 * Tags: P0, CI, VALIDATION, GOVERNANCE
 *
 * Validates that files in a commit match the allowed patterns for their target branch.
 *
 * Updated Dec 8, 2025:
 * - docs/ now allowed on ALL branches
 * - docs/production/ must sync to main
 * - docs/dev/ auto-managed with dated versions (latest only)
 * - Removed docs-tests-logs branch restrictions
 */

const fs = require("fs");
const path = require("path");

// Branch-specific file patterns
const BRANCH_RULES = {
  main: {
    name: "Main (Production)",
    allowed: [
      // Source code
      /^apps\/.*\.(ts|tsx|js|jsx|json|css|md)$/,
      /^packages\/.*\.(ts|tsx|js|jsx|json|css|md)$/,
      /^functions\/.*\.(ts|tsx|js|jsx|json)$/,
      /^public\/.*\.(ts|tsx|js|jsx|json|css|svg|png|jpg|gif|webp|ico)$/,
      /^src\/.*\.(ts|tsx|js|jsx|json|css)$/,
      // Documentation - ALL docs allowed on main
      /^docs\/.*\.(md|mermaid|svg|png)$/,
      /^\.github\/instructions\/.*\.md$/,
      /^\.github\/prompts\/.*\.md$/,
      /^agents\/.*\.md$/,
      // Config
      /^\.github\/workflows\/.*\.yml$/,
      /^\.husky\/.*$/,
      /^scripts\/.*\.(ts|js|mjs|sh)$/,
      /^(tsconfig|jest|vitest|turbo|prettier|eslint|tailwind|postcss)[^/]*\.(json|js|mjs|cjs)$/,
      /^package\.json$/,
      /^pnpm-lock\.yaml$/,
      /^pnpm-workspace\.yaml$/,
      /^(firestore|storage)\.rules$/,
      /^firebase\.json$/,
      /^README\.md$/,
      /^LICENSE$/,
      /^\.env\.example$/,
    ],
    forbidden: [
      // Only block CI artifacts, not docs
      { regex: /\.(log)$/, reason: "Log files should not be committed" },
      { regex: /^coverage\//, reason: "Coverage reports are generated, not committed" },
      { regex: /^\.next\//, reason: "Build artifacts should not be committed" },
      { regex: /^node_modules\//, reason: "Dependencies should not be committed" },
    ],
  },
  dev: {
    name: "Dev (Development)",
    allowed: [
      // Source code
      /^apps\/.*\.(ts|tsx|js|jsx|json|css|md)$/,
      /^packages\/.*\.(ts|tsx|js|jsx|json|css|md)$/,
      /^functions\/.*\.(ts|tsx|js|jsx|json)$/,
      /^public\/.*\.(ts|tsx|js|jsx|json|css|svg|png|jpg|gif|webp|ico)$/,
      /^src\/.*\.(ts|tsx|js|jsx|json|css)$/,
      // Tests - all tests allowed on dev
      /^tests\/.*\.(test|spec|e2e)\.(ts|tsx|js)$/,
      /^__tests__\/.*\.(test|spec)\.(ts|tsx|js)$/,
      /^(apps|packages)\/.*\/__tests__\/.*\.(test|spec)\.(ts|tsx|js)$/,
      /^e2e\/.*\.(spec|e2e)\.(ts|tsx|js)$/,
      // Documentation - ALL docs allowed on dev
      /^docs\/.*\.(md|mermaid|svg|png)$/,
      /^\.github\/instructions\/.*\.md$/,
      /^\.github\/prompts\/.*\.md$/,
      /^agents\/.*\.md$/,
      /^plan\/.*\.md$/,
      // Config
      /^\.github\/workflows\/.*\.yml$/,
      /^\.husky\/.*$/,
      /^scripts\/.*\.(ts|js|mjs|sh)$/,
      /^(tsconfig|jest|vitest|turbo|prettier|eslint|tailwind|postcss)[^/]*\.(json|js|mjs|cjs)$/,
      /^package\.json$/,
      /^pnpm-lock\.yaml$/,
      /^pnpm-workspace\.yaml$/,
      /^(firestore|storage)\.rules$/,
      /^firebase\.json$/,
      /^README\.md$/,
      /^\.env\.example$/,
    ],
    forbidden: [
      // Only block CI artifacts
      { regex: /\.(log)$/, reason: "Log files should not be committed" },
      { regex: /^coverage\//, reason: "Coverage reports are generated, not committed" },
      { regex: /^\.next\//, reason: "Build artifacts should not be committed" },
      { regex: /^node_modules\//, reason: "Dependencies should not be committed" },
    ],
  },
  "docs-tests-logs": {
    name: "Docs-Tests-Logs (Archive)",
    allowed: [
      // Archive branch - accepts everything except production code
      /^docs\/.*\.(md|mermaid|svg|png)$/,
      /^\.github\/.*\.(md|yml)$/,
      /^agents\/.*\.md$/,
      /^e2e\/.*\.(spec|e2e)\.(ts|tsx|js)$/,
      /^tests\/.*\.(test|spec)\.(ts|tsx|js)$/,
      /\.(log|report|metrics)$/,
      /^coverage\//,
      /^performance-metrics/,
      /^TEST_RESULTS/,
      /^CI_REPORTS/,
    ],
    forbidden: [
      // Production code should not go here
      {
        regex: /^apps\/.*\.(ts|tsx)$/,
        reason: "Production code belongs on dev/main",
      },
      { regex: /^packages\/(?!.*\.md$).*\.(ts|tsx)$/, reason: "Production code belongs on dev/main" },
      { regex: /^functions\/.*\.(ts)$/, reason: "Production code belongs on dev/main" },
    ],
  },
  feature: {
    name: "Feature Branch",
    allowed: [
      // Source code
      /^apps\/.*\.(ts|tsx|js|jsx|json|css|md)$/,
      /^packages\/.*\.(ts|tsx|js|jsx|json|css|md)$/,
      /^functions\/.*\.(ts|tsx|js|jsx|json)$/,
      /^src\/.*\.(ts|tsx|js|jsx|json|css)$/,
      // Tests
      /^(apps|packages|functions)\/.*\/__tests__\/.*\.(test|spec)\.(ts|tsx|js)$/,
      /^tests\/.*\.(test|spec)\.(ts|tsx|js)$/,
      // Documentation - feature docs allowed
      /^docs\/.*\.(md|mermaid|svg|png)$/,
      /^\.github\/instructions\/.*\.md$/,
      /^\.github\/prompts\/.*\.md$/,
      /^plan\/.*\.md$/,
      // Config
      /^\.github\/workflows\/.*\.yml$/,
      /^scripts\/.*\.(ts|js|mjs|sh)$/,
      /^package\.json$/,
      /^pnpm-lock\.yaml$/,
    ],
    forbidden: [],
  },
};

/**
 * Validate files against branch rules
 */
function validateFiles(branchType, files) {
  const rules = BRANCH_RULES[branchType] || BRANCH_RULES.feature;
  const errors = [];
  const warnings = [];

  if (files.length === 0) {
    console.log("✅ No files to validate");
    return { success: true, errors, warnings };
  }

  files.forEach((file) => {
    // Skip empty lines and common ignored patterns
    if (!file || file.startsWith('.git/')) return;

    // Check if file matches forbidden patterns
    const forbiddenRule = rules.forbidden.find((rule) =>
      rule.regex.test(file)
    );
    if (forbiddenRule) {
      errors.push({
        file,
        reason: forbiddenRule.reason,
        severity: "ERROR",
      });
      return;
    }

    // Check if file matches allowed patterns
    const isAllowed = rules.allowed.some((regex) => regex.test(file));
    if (!isAllowed) {
      // Only warn for truly unexpected files, not docs
      if (/^node_modules\//.test(file) || /^\.next\//.test(file)) {
        errors.push({
          file,
          reason: "Build artifacts should not be committed",
          severity: "ERROR",
        });
      } else {
        // Downgrade to warning for unrecognized patterns
        warnings.push({
          file,
          reason: `File does not match standard patterns for ${branchType} (review recommended)`,
          severity: "WARNING",
        });
      }
    }
  });

  return {
    success: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Format output for GitHub Actions
 */
function formatOutput(branchType, result) {
  const branch = BRANCH_RULES[branchType] || BRANCH_RULES.feature;

  console.log(`\n📋 Branch File Validation for: ${branch.name}`);
  console.log("═".repeat(60));

  if (result.errors.length > 0) {
    console.error("\n❌ VALIDATION ERRORS:");
    result.errors.forEach((error) => {
      console.error(
        `   ${error.file}\n   └─ ${error.reason}`
      );
    });
  }

  if (result.warnings.length > 0) {
    console.warn("\n⚠️  WARNINGS:");
    result.warnings.forEach((warning) => {
      console.warn(
        `   ${warning.file}\n   └─ ${warning.reason}`
      );
    });
  }

  if (result.success) {
    console.log("\n✅ All files valid for " + branch.name);
  }

  console.log("\n📌 Allowed patterns for " + branch.name + ":");
  branch.allowed.slice(0, 5).forEach((regex) => {
    console.log(`   ${regex}`);
  });
  if (branch.allowed.length > 5) {
    console.log(`   ... and ${branch.allowed.length - 5} more patterns`);
  }

  return result.success ? 0 : 1;
}

// Main execution
const [branchType, filesStr] = process.argv.slice(2);

if (!branchType || !filesStr) {
  console.error("Usage: node validate-branch-files.js <branch> <files>");
  console.error("  branch: main, dev, docs-tests-logs, or feature");
  console.error("  files: newline-separated list of changed files");
  process.exit(1);
}

const files = filesStr
  .split("\n")
  .map((f) => f.trim())
  .filter(Boolean);

const result = validateFiles(branchType, files);
const exitCode = formatOutput(branchType, result);

process.exit(exitCode);
