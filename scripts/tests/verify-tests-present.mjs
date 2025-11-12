#!/usr/bin/env node
/**
 * Verifies presence (not execution) of test files for:
 * - app/api/** /route.ts -> a sibling or mapped test file
 * - exported Schema -> matching spec file naming
 */
import { promises as fs } from "node:fs";
import { globby } from "globby";
import path from "node:path";

const missing = [];

function routeToTestCandidates(route) {
  const dir = path.dirname(route);
  return [
    path.join(dir, "__tests__", path.basename(dir) + ".spec.ts"),
    path.join(
      "apps/web/app/lib/api",
      "__tests__",
      path.basename(dir) + ".spec.ts"
    ),
  ];
}

function schemaToTestCandidates(schemaFile, schemaName) {
  const base = path.basename(schemaFile).replace(/\.ts$/, "");
  return [
    schemaFile
      .replace(/\/src\//, "/src/__tests__/")
      .replace(base + ".ts", base + ".test.ts"),
    schemaFile
      .replace(/\/src\//, "/src/__tests__/")
      .replace(
        base + ".ts",
        schemaName.replace(/Schema$/, "").toLowerCase() + ".test.ts"
      ),
  ];
}

(async () => {
  const routes = await globby(["apps/web/app/api/**/route.ts"], {
    gitignore: true,
  });
  for (const r of routes) {
    const cands = routeToTestCandidates(r);
    const exists = await Promise.all(
      cands.map(async (f) =>
        fs
          .access(f)
          .then(() => true)
          .catch(() => false)
      )
    );
    if (!exists.some(Boolean))
      missing.push({ kind: "route-test-missing", route: r, try: cands });
  }

  const typeFiles = await globby(["packages/types/src/**/*.ts"], {
    gitignore: true,
  });
  for (const tf of typeFiles) {
    const content = await fs.readFile(tf, "utf8");
    const matches = [
      ...content.matchAll(/export\s+const\s+(\w+Schema)\s*=\s*z\./g),
    ];
    for (const m of matches) {
      const cands = schemaToTestCandidates(tf, m[1]);
      const exists = await Promise.all(
        cands.map(async (f) =>
          fs
            .access(f)
            .then(() => true)
            .catch(() => false)
        )
      );
      if (!exists.some(Boolean))
        missing.push({
          kind: "schema-test-missing",
          file: tf,
          schema: m[1],
          try: cands,
        });
    }
  }

  if (missing.length) {
    console.error(
      "Missing tests (presence check only):\n" +
        missing.map((p) => JSON.stringify(p)).join("\n")
    );
    process.exit(1);
  } else {
    console.log("All required test files present.");
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
