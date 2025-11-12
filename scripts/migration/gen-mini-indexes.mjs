#!/usr/bin/env node
// [P1][TOOL][MIGRATION]
// Tags: P1, TOOL, MIGRATION
// Generate consolidated mini-indexes for Zod schemas and API routes

import { globbySync } from "globby";
import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const ROOT = process.cwd();

// Collect Zod schemas
const schemaFiles = globbySync("packages/types/src/**/*.ts", {
  root: ROOT,
  ignore: ["packages/types/src/__tests__/**", "packages/types/src/index.ts"],
});

const schemas = schemaFiles.map((file) => {
  const name = file.split("/").pop().replace(".ts", "");
  return {
    file: file.replace(ROOT + "/", ""),
    name,
    path: `packages/types/src/${name}.ts`,
  };
});

// Collect API routes
const apiFiles = globbySync("apps/web/app/api/**/route.ts", {
  root: ROOT,
});

const apiRoutes = apiFiles.map((file) => {
  const pathParts = file
    .replace("apps/web/app/api/", "")
    .replace("/route.ts", "")
    .split("/");
  const route = "/" + pathParts.join("/");
  return {
    file: file.replace(ROOT + "/", ""),
    route,
    path: `apps/web/app/api/${pathParts.join("/")}`,
  };
});

// Generate Zod schemas index
const schemasIndex = `# Zod Schemas Mini-Index

Consolidated index of Zod schema definitions in \`packages/types/src/\`.

## Core Schemas

${schemas
  .filter((s) => !s.name.includes("v14"))
  .map((s) => `- **${s.name}** → \`${s.file}\``)
  .join("\n")}

## Legacy (v14) Schemas

${schemas
  .filter((s) => s.name.includes("v14"))
  .map((s) => `- **${s.name}** → \`${s.file}\``)
  .join("\n")}

## Statistics

- Total schemas: ${schemas.length}
- Core schemas: ${schemas.filter((s) => !s.name.includes("v14")).length}
- Legacy (v14): ${schemas.filter((s) => s.name.includes("v14")).length}

---

Generated: ${new Date().toISOString()}
`;

// Generate API routes index
const apiIndex = `# API Routes Mini-Index

Consolidated index of Next.js API routes in \`apps/web/app/api/\`.

## Routes by Category

### Core Routes
${apiRoutes
  .filter(
    (r) =>
      ![
        "/onboarding",
        "/internal",
        "/auth",
        "/session/bootstrap",
      ].some((prefix) => r.route.startsWith(prefix))
  )
  .map((r) => `- **${r.route}** → \`${r.file}\``)
  .join("\n")}

### Onboarding Routes
${apiRoutes
  .filter((r) => r.route.startsWith("/onboarding"))
  .map((r) => `- **${r.route}** → \`${r.file}\``)
  .join("\n")}

### Auth Routes
${apiRoutes
  .filter((r) => r.route.startsWith("/auth"))
  .map((r) => `- **${r.route}** → \`${r.file}\``)
  .join("\n")}

### Session Routes
${apiRoutes
  .filter((r) => r.route.startsWith("/session"))
  .map((r) => `- **${r.route}** → \`${r.file}\``)
  .join("\n")}

### Internal Routes
${apiRoutes
  .filter((r) => r.route.startsWith("/internal"))
  .map((r) => `- **${r.route}** → \`${r.file}\``)
  .join("\n")}

## Statistics

- Total routes: ${apiRoutes.length}
- Public routes: ${apiRoutes.filter((r) => !r.route.startsWith("/internal")).length}
- Internal routes: ${apiRoutes.filter((r) => r.route.startsWith("/internal")).length}

---

Generated: ${new Date().toISOString()}
`;

// Write files
const docsDir = "docs/migration/v15";
mkdirSync(docsDir, { recursive: true });

writeFileSync(`${docsDir}/SCHEMAS_MINI_INDEX.md`, schemasIndex);
writeFileSync(`${docsDir}/API_ROUTES_MINI_INDEX.md`, apiIndex);

console.log(`✅ Generated mini-indexes:`);
console.log(`   - ${docsDir}/SCHEMAS_MINI_INDEX.md (${schemas.length} schemas)`);
console.log(`   - ${docsDir}/API_ROUTES_MINI_INDEX.md (${apiRoutes.length} routes)`);
