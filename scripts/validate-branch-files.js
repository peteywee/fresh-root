#!/usr/bin/env node

/**
 * [P0][CI][VALIDATION] Branch file pattern validator
 * Tags: P0, CI, VALIDATION, GOVERNANCE
 *
 * Validates that files in a commit match the allowed patterns for their target branch.
 * Prevents docs/tests/logs from being committed to main/dev
 * Prevents code from being committed to docs-tests-logs
 */

const fs = require("fs");
const path = require("path");

// Branch-specific file patterns
const BRANCH_RULES = {
  main: {
    name: "Main (Production)",
    allowed: [
      /^apps\/.*\.(ts|tsx|js|jsx|json|css)$/,
      /^packages\/.*\.(ts|tsx|js|jsx|json|css)$/,
      /^functions\/.*\.(ts|tsx|js|jsx|json|css)$/,
      /^public\/.*\.(ts|tsx|js|jsx|json|css|svg|png|jpg|gif|webp)$/,
      /^src\/.*\.(ts|tsx|js|jsx|json|css)$/,
      /^\.github\/workflows\/(?!.*-(test|coverage|performance|report)).*\.yml$/,
      /^\.husky\/.*$/,
      /^scripts\/(?!.*-test).*\.(ts|js|mjs)$/,
      /^(tsconfig|jest|vitest|turbo|prettier|eslint)[^/]*\.(json|js|mjs|cjs)$/,
      /^package\.json$/,
      /^pnpm-lock\.yaml$/,
      /^(firestore|storage)\.rules$/,
      /^README\.md$/,
      /^LICENSE$/,
    ],
    forbidden: [
      { regex: /^docs\//, reason: "Documentation belongs on docs-tests-logs" },
      { regex: /\.e2e\.ts$/, reason: "E2E tests belong on docs-tests-logs" },
      {
        regex: /\.spec\.ts$/,
        reason: "Test files belong on docs-tests-logs",
      },
      {
        regex: /IMPLEMENTATION_COMPLETE/,
        reason: "Reports belong on docs-tests-logs",
      },
      {
        regex: /PHASE_\d+_|SUMMARY|REPORT/,
        reason: "Project reports belong on docs-tests-logs",
      },
      { regex: /\.(log|report|metrics)$/, reason: "CI logs belong on docs-tests-logs" },
      { regex: /coverage/, reason: "Coverage reports belong on docs-tests-logs" },
      {
        regex: /performance-metrics/,
        reason: "Performance data belongs on docs-tests-logs",
      },
    ],
  },
  dev: {
    name: "Dev (Working Branch)",
    allowed: [
      /^apps\/.*\.(ts|tsx|js|jsx)$/,
      /^packages\/.*\.(ts|tsx|js|jsx)$/,
      /^functions\/.*\.(ts|tsx|js|jsx)$/,
      /^src\/.*\.(ts|tsx|js|jsx)$/,
      /^tests\/.*\.(test|spec)\.(ts|tsx|js)$/,
      /^__tests__\/.*\.(test|spec)\.(ts|tsx|js)$/,
      /^(apps|packages)\/.*\/__tests__\/.*\.(test|spec)\.(ts|tsx|js)$/,
      /^\.github\/workflows\/.*\.yml$/,
      /^scripts\/.*\.(ts|js|mjs)$/,
      /^(tsconfig|jest|vitest|turbo|prettier|eslint)[^/]*\.(json|js|mjs|cjs)$/,
      /^package\.json$/,
      /^pnpm-lock\.yaml$/,
      /^(firestore|storage)\.rules$/,
    ],
    forbidden: [
      {
        regex: /^docs\/(?!feature-\d+)/,
        reason: "Only feature-specific docs allowed; general docs go to docs-tests-logs",
      },
      {
        regex: /IMPLEMENTATION_COMPLETE/,
        reason: "Project reports belong on docs-tests-logs",
      },
      {
        regex: /PHASE_\d+_|SUMMARY|REPORT/,
        reason: "Project reports belong on docs-tests-logs",
      },
      { regex: /\.(log|report|metrics)$/, reason: "CI logs belong on docs-tests-logs" },
      { regex: /coverage/, reason: "Coverage reports belong on docs-tests-logs" },
      {
        regex: /performance-metrics/,
        reason: "Performance data belongs on docs-tests-logs",
      },
    ],
  },
  "docs-tests-logs": {
    name: "Docs-Tests-Logs (Archive)",
    allowed: [
      /^docs\/.*\.md$/,
      /^\.github\/(IMPLEMENTATION_COMPLETE|REPORTS|SUMMARIES|BRANCH_STRATEGY)/,
      /^\.github\/workflows\/(coverage|performance|test-results).*\.yml$/,
      /^e2e\/.*\.(spec|e2e)\.(ts|tsx|js)$/,
      /^tests\/.*\.(test|spec)\.(ts|tsx|js)$/,
      /\.(log|report|metrics)$/,
      /^coverage\//,
      /^performance-metrics/,
      /^TEST_RESULTS/,
      /^CI_REPORTS/,
      /^\.github\/.*\.md$/,
    ],
    forbidden: [
      {
        regex: /^apps\/.*\.ts$/,
        reason: "Feature code belongs on dev/main",
      },
      { regex: /^packages\/.*\.ts$/, reason: "Feature code belongs on dev/main" },
      { regex: /^functions\/.*\.ts$/, reason: "Feature code belongs on dev/main" },
      { regex: /^scripts\/.*\.(ts|js)$/, reason: "Scripts belong on dev/main" },
      {
        regex: /^src\/.*\.ts$/,
        reason: "Source code belongs on dev/main",
      },
    ],
  },
  feature: {
    name: "Feature Branch",
    allowed: [
      /^apps\/.*\.(ts|tsx|js|jsx)$/,
      /^packages\/.*\.(ts|tsx|js|jsx)$/,
      /^functions\/.*\.(ts|tsx|js|jsx)$/,
      /^src\/.*\.(ts|tsx|js|jsx)$/,
      /^(apps|packages|functions)\/.*\/__tests__\/.*\.(test|spec)\.(ts|tsx|js)$/,
      /^tests\/.*\.(test|spec)\.(ts|tsx|js)$/,
      /^docs\/feature-[0-9]+-.*\.md$/,
      /^\.github\/workflows\/feature-.*\.yml$/,
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
      // Check for common unintended patterns
      if (/\.(log|report|metrics)$/.test(file)) {
        errors.push({
          file,
          reason: "CI logs/reports belong on docs-tests-logs",
          severity: "ERROR",
        });
      } else if (/^docs\//.test(file)) {
        errors.push({
          file,
          reason: "Documentation belongs on docs-tests-logs",
          severity: "ERROR",
        });
      } else if (/IMPLEMENTATION_COMPLETE|REPORTS|SUMMARY/.test(file)) {
        errors.push({
          file,
          reason: "Project reports belong on docs-tests-logs",
          severity: "ERROR",
        });
      } else {
        warnings.push({
          file,
          reason: `File does not match allowed patterns for ${branchType}`,
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
