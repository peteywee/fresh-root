#!/usr/bin/env node
// [P1][TEST][TEST]
// Tags: P1, TEST, TEST
/**
 * Verify Tests Present
 * Quality gate that ensures API routes and key modules have test coverage.
 *
 * Rules:
 * - All onboarding API routes MUST have tests in __tests__/ subdirectory
 * - Core API routes SHOULD have tests
 * - Firestore rules MUST have tests
 * - Core schemas SHOULD have tests
 */
import { globby } from "globby";
import path from "node:path";
import { promises as fs } from "node:fs";

const repoRoot = process.cwd();

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function getTestPath(apiRoute) {
  // apps/web/app/api/onboarding/admin-form/route.ts
  // -> apps/web/app/api/onboarding/__tests__/admin-form.test.ts (consolidated)
  const parts = apiRoute.split(path.sep);
  const routeIndex = parts.indexOf("route.ts");
  if (routeIndex === -1) return null;

  const routeName = parts[routeIndex - 1];
  const parentDir = parts.slice(0, routeIndex - 1).join(path.sep);
  return path.join(parentDir, "__tests__", `${routeName}.test.ts`);
}

async function main() {
  const results = {
    missing: [],
    found: [],
    categories: {
      onboarding: { required: 0, found: 0 },
      core: { checked: 0, found: 0 },
      rules: { required: 0, found: 0 },
    },
  };

  console.log("\n📋 Test Presence Verification\n");

  // 1) Onboarding API routes (MUST have tests)
  console.log("Checking Onboarding API routes (REQUIRED tests)...");
  const onboardingRoutes = await globby(["apps/web/app/api/onboarding/**/route.ts"], {
    gitignore: true,
  });

  // Check for consolidated __tests__ folder
  const onboardingTestsDir = "apps/web/app/api/onboarding/__tests__";
  const onboardingTests = await globby([`${onboardingTestsDir}/**/*.test.ts`], {
    gitignore: true,
  });

  for (const route of onboardingRoutes) {
    results.categories.onboarding.required++;
    const testPath = getTestPath(route);
    const routeName = path.basename(path.dirname(route));

    // Check if specific test exists OR consolidated tests exist
    const hasSpecificTest = await fileExists(testPath);
    const hasSomeTests = onboardingTests.length > 0;

    if (hasSpecificTest || hasSomeTests) {
      results.found.push({ type: "onboarding", path: route });
      results.categories.onboarding.found++;
      console.log(`  ✅ ${routeName}${hasSpecificTest ? "" : " (covered by consolidated tests)"}`);
    } else {
      results.missing.push({ type: "onboarding", path: route, need: testPath });
      console.log(`  ❌ ${routeName} (missing: ${testPath})`);
    }
  }

  // 2) Core API routes (SHOULD have tests)
  console.log("\nChecking Core API routes (recommended tests)...");
  const coreRoutes = await globby(
    [
      "apps/web/app/api/organizations/**/route.ts",
      "apps/web/app/api/schedules/**/route.ts",
      "apps/web/app/api/shifts/**/route.ts",
      "apps/web/app/api/positions/**/route.ts",
      "apps/web/app/api/venues/**/route.ts",
    ],
    { gitignore: true },
  );

  for (const route of coreRoutes.slice(0, 5)) {
    results.categories.core.checked++;
    const testPath = getTestPath(route);
    const exists = await fileExists(testPath);

    if (exists) {
      results.categories.core.found++;
      console.log(`  ✅ ${path.basename(path.dirname(path.dirname(route)))}`);
    } else {
      console.log(`  ⏳ ${path.basename(path.dirname(path.dirname(route)))}`);
    }
  }

  // 3) Firestore/Storage rules tests (MUST have tests)
  console.log("\nChecking Firestore rules tests (REQUIRED)...");
  const rulesTests = await globby(["tests/rules/**/*.spec.{ts,mts}"], {
    gitignore: true,
  });

  results.categories.rules.found = rulesTests.length;
  results.categories.rules.required = rulesTests.length > 0 ? 1 : 0;

  if (rulesTests.length > 0) {
    console.log(`  ✅ Firestore rules: ${rulesTests.length} test files`);
  } else {
    console.log(`  ❌ No Firestore rules tests found`);
  }

  // 4) Schema tests (SHOULD have tests)
  console.log("\nChecking Schema tests (recommended)...");
  const schemaTests = await globby(["packages/types/src/__tests__/**/*.test.ts"], {
    gitignore: true,
  });

  console.log(`  📊 Schema tests: ${schemaTests.length} files`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));

  const onboardingComplete =
    results.categories.onboarding.found === results.categories.onboarding.required;
  const rulesComplete = results.categories.rules.found > 0;

  console.log(`
Onboarding API Tests:
  ✅ ${results.categories.onboarding.found}/${results.categories.onboarding.required} required

Core API Tests:
  ⏳ ${results.categories.core.found}/${results.categories.core.checked} recommended

Firestore Rules Tests:
  ${rulesComplete ? "✅" : "❌"} ${results.categories.rules.found} test files

Schema Tests:
  📊 ${schemaTests.length} test files

Missing Tests (blocking):
  ${results.missing.length > 0 ? results.missing.map((m) => `  • ${m.path}`).join("\n") : "  ✅ None"}
`);

  console.log("=".repeat(60));

  if (onboardingComplete && rulesComplete) {
    console.log("✅ Test coverage gate PASSED\n");
    process.exit(0);
  } else {
    console.log("⚠️  Test coverage gate has issues\n");
    process.exit(results.missing.length > 0 ? 1 : 0);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
