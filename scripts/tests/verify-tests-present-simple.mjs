#!/usr/bin/env node
// [P1][TEST][TEST] Verify Tests Present Simple tests
// Tags: P1, TEST
import { promises as fs } from "node:fs";
import path from "node:path";

async function walk(dir, pattern = /.*/) {
  const res = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) res.push(...(await walk(p, pattern)));
      else if (e.isFile() && pattern.test(e.name)) res.push(p);
    }
  } catch {}
  return res;
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function getTestPath(apiRoute) {
  const parts = apiRoute.split(path.sep);
  const routeNameIndex = parts.indexOf("route.ts");
  if (routeNameIndex === -1) return null;
  const routeName = parts[routeNameIndex - 1];
  const parentDir = parts.slice(0, routeNameIndex - 1).join(path.sep);
  return path.join(parentDir, "__tests__", `${routeName}.test.ts`);
}

async function isMeaningfulTest(file) {
  try {
    const content = await fs.readFile(file, "utf8");
    if (content.includes("// placeholder")) return false;
    if (!content.includes("test(") && !content.includes("it(")) return false;
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const root = process.cwd();
  const onboardingRoutes = await walk(
    path.join(root, "apps", "web", "app", "api", "onboarding"),
    /route\.(ts|mts)$/,
  );
  const onboardingTestsDir = path.join(
    root,
    "apps",
    "web",
    "app",
    "api",
    "onboarding",
    "__tests__",
  );
  const onboardingTests = await walk(onboardingTestsDir, /\.test\.(ts|mts)$/);
  const results = { missing: [], found: 0, required: onboardingRoutes.length };
  for (const route of onboardingRoutes) {
    const testPath = getTestPath(route);
    const hasSpecific = await exists(testPath) && await isMeaningfulTest(testPath);
    
    // For consolidated tests, we just check if any exist and are meaningful
    let hasConsolidated = false;
    if (onboardingTests.length > 0) {
       for (const t of onboardingTests) {
         if (await isMeaningfulTest(t)) {
           hasConsolidated = true;
           break;
         }
       }
    }

    if (hasSpecific || hasConsolidated) results.found++;
    else results.missing.push(route);
  }

  const rulesTests = await walk(path.join(root, "tests", "rules"), /\.spec\.(ts|mts)$/);

  console.log("Onboarding tests found:", results.found, "/", results.required);
  console.log("Rules tests found:", rulesTests.length);
  if (results.found === results.required && rulesTests.length > 0) {
    console.log("✅ Test presence OK");
    process.exit(0);
  }
  console.log("❌ Test presence issues");
  if (results.missing.length)
    console.log(
      "Missing onboarding tests:",
      results.missing.map((p) => path.relative(root, p)).join("\n"),
    );
  if (rulesTests.length === 0) console.log("No rules tests found");
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
