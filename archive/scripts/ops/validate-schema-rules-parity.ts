#!/usr/bin/env tsx
// [P1][INTEGRITY][SCRIPT] Schema-rules parity validator
// Tags: P1, INTEGRITY, SCRIPT, VALIDATION, SCHEMA, RULES

/**
 * Validates that Firestore security rules align with Zod schemas.
 *
 * Checks:
 * 1. All collections in rules have corresponding schemas
 * 2. All schema files are exported from packages/types
 * 3. All collections are documented in schema-map.md
 * 4. No orphaned schemas without rules
 *
 * Usage:
 *   pnpm tsx scripts/ops/validate-schema-rules-parity.ts
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { resolve } from "path";

// ANSI color codes
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Extract collection names from firestore.rules
 */
function extractCollectionsFromRules(rulesPath: string): Set<string> {
  const rulesContent = readFileSync(rulesPath, "utf8");
  const collections = new Set<string>();

  // Match patterns: match /collection/{id}
  const matchPattern = /match\s+\/([a-zA-Z_][a-zA-Z0-9_]*)\//g;
  let match;

  while ((match = matchPattern.exec(rulesContent)) !== null) {
    collections.add(match[1]);
  }

  return collections;
}

/**
 * Extract schema names from packages/types/src
 */
async function extractSchemasFromTypes(typesPath: string): Promise<Set<string>> {
  const schemas = new Set<string>();
  const files = readdirSync(typesPath);

  for (const file of files) {
    if (file.endsWith(".ts") && file !== "index.ts" && file !== "rbac.ts") {
      const baseName = file.replace(".ts", "");
      schemas.add(baseName);
    }
  }

  return schemas;
}

/**
 * Check if schema is exported from index.ts
 */
function isSchemaExported(indexPath: string, schemaName: string): boolean {
  const indexContent = readFileSync(indexPath, "utf8");
  const exportPattern = new RegExp(`export.*from.*["']./${schemaName}["']`, "i");
  return exportPattern.test(indexContent);
}

/**
 * Check if collection is documented in schema-map.md
 */
function isCollectionDocumented(schemaMapPath: string, collectionName: string): boolean {
  if (!existsSync(schemaMapPath)) {
    return false;
  }

  const schemaMapContent = readFileSync(schemaMapPath, "utf8");
  // Look for heading with collection name
  const headingPattern = new RegExp(`###\\s+${collectionName}`, "i");
  return headingPattern.test(schemaMapContent);
}

/**
 * Map collection names to expected schema file names
 */
function collectionToSchemaName(collection: string): string {
  const mappings: Record<string, string> = {
    organizations: "orgs",
    orgs: "orgs",
    memberships: "memberships",
    positions: "positions",
    schedules: "schedules",
    shifts: "shifts",
    venues: "venues",
    zones: "zones",
    attendance_records: "attendance",
    join_tokens: "join-tokens",
    users: "users", // Built-in, no schema needed
    databases: "SKIP", // Firestore system collection
  };

  return mappings[collection] || collection;
}

/**
 * Main validation function
 */
async function validate(): Promise<ValidationResult> {
  const result: ValidationResult = {
    ok: true,
    errors: [],
    warnings: [],
  };

  const rootPath = resolve(__dirname, "../..");
  const rulesPath = resolve(rootPath, "firestore.rules");
  const typesPath = resolve(rootPath, "packages/types/src");
  const indexPath = resolve(typesPath, "index.ts");
  const schemaMapPath = resolve(rootPath, "docs/schema-map.md");

  console.log(`${BLUE}🔍 Validating schema-rules parity...${RESET}\n`);

  // Check that files exist
  if (!existsSync(rulesPath)) {
    result.errors.push(`Firestore rules not found: ${rulesPath}`);
    result.ok = false;
    return result;
  }

  if (!existsSync(typesPath)) {
    result.errors.push(`Types directory not found: ${typesPath}`);
    result.ok = false;
    return result;
  }

  // Extract collections and schemas
  const collectionsInRules = extractCollectionsFromRules(rulesPath);
  const schemasInTypes = await extractSchemasFromTypes(typesPath);

  console.log(`${BLUE}📋 Found ${collectionsInRules.size} collections in rules${RESET}`);
  console.log(`${BLUE}📦 Found ${schemasInTypes.size} schema files in types${RESET}\n`);

  // Check 1: Every collection in rules has a corresponding schema
  console.log(`${BLUE}✓ Check 1: Collections → Schemas${RESET}`);
  for (const collection of collectionsInRules) {
    const schemaName = collectionToSchemaName(collection);

    if (schemaName === "SKIP") {
      console.log(`  ${YELLOW}⊘ ${collection} (system collection, skipped)${RESET}`);
      continue;
    }

    if (schemaName === "users") {
      console.log(`  ${YELLOW}⊘ ${collection} (built-in auth, no schema needed)${RESET}`);
      continue;
    }

    if (!schemasInTypes.has(schemaName)) {
      result.errors.push(`Collection "${collection}" in rules has no schema: ${schemaName}.ts`);
      result.ok = false;
      console.log(`  ${RED}✗ ${collection} → ${schemaName}.ts MISSING${RESET}`);
    } else {
      console.log(`  ${GREEN}✓ ${collection} → ${schemaName}.ts${RESET}`);
    }
  }

  console.log();

  // Check 2: Every schema is exported from index.ts
  console.log(`${BLUE}✓ Check 2: Schemas → Exports${RESET}`);
  for (const schema of schemasInTypes) {
    if (!isSchemaExported(indexPath, schema)) {
      result.errors.push(`Schema "${schema}" not exported from index.ts`);
      result.ok = false;
      console.log(`  ${RED}✗ ${schema}.ts NOT EXPORTED${RESET}`);
    } else {
      console.log(`  ${GREEN}✓ ${schema}.ts exported${RESET}`);
    }
  }

  console.log();

  // Check 3: Collections are documented
  console.log(`${BLUE}✓ Check 3: Collections → Documentation${RESET}`);
  for (const collection of collectionsInRules) {
    const schemaName = collectionToSchemaName(collection);

    if (schemaName === "SKIP" || schemaName === "users") {
      continue;
    }

    // Convert schema name to documentation name
    const docName = schemaName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    if (!isCollectionDocumented(schemaMapPath, docName)) {
      result.warnings.push(`Collection "${collection}" not documented in schema-map.md`);
      console.log(`  ${YELLOW}⚠ ${collection} NOT DOCUMENTED${RESET}`);
    } else {
      console.log(`  ${GREEN}✓ ${collection} documented${RESET}`);
    }
  }

  console.log();

  // Check 4: No orphaned schemas
  console.log(`${BLUE}✓ Check 4: Orphaned Schemas${RESET}`);
  const expectedSchemas = new Set(
    Array.from(collectionsInRules)
      .map(collectionToSchemaName)
      .filter((s) => s !== "SKIP" && s !== "users"),
  );

  for (const schema of schemasInTypes) {
    if (!expectedSchemas.has(schema)) {
      result.warnings.push(`Schema "${schema}" has no corresponding collection in rules`);
      console.log(`  ${YELLOW}⚠ ${schema}.ts ORPHANED${RESET}`);
    }
  }

  return result;
}

/**
 * Entry point
 */
async function main() {
  try {
    const result = await validate();

    console.log("\n" + "=".repeat(60));

    if (result.ok && result.warnings.length === 0) {
      console.log(`${GREEN}✓ All checks passed!${RESET}`);
      process.exit(0);
    }

    if (result.errors.length > 0) {
      console.log(`${RED}\n❌ ${result.errors.length} error(s) found:${RESET}`);
      result.errors.forEach((err, i) => {
        console.log(`${RED}  ${i + 1}. ${err}${RESET}`);
      });
    }

    if (result.warnings.length > 0) {
      console.log(`${YELLOW}\n⚠️  ${result.warnings.length} warning(s):${RESET}`);
      result.warnings.forEach((warn, i) => {
        console.log(`${YELLOW}  ${i + 1}. ${warn}${RESET}`);
      });
    }

    console.log();

    if (!result.ok) {
      console.log(`${RED}Validation failed. Please fix errors before deploying.${RESET}`);
      process.exit(1);
    } else {
      console.log(`${GREEN}Validation passed with warnings.${RESET}`);
      process.exit(0);
    }
  } catch (error) {
    console.error(`${RED}Fatal error:${RESET}`, error);
    process.exit(1);
  }
}

// Only run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
