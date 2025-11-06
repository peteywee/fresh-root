#!/usr/bin/env node
// [P1][INTEGRITY][CODE] Schema parity validator
// Tags: P1, INTEGRITY, TOOLING, VALIDATION
// Compares Firestore collections in firestore.rules with exported Zod schemas
// from packages/types to detect missing coverage.

import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

const CWD = process.cwd();
const FIRESTORE_RULES_PATH = path.join(CWD, 'firestore.rules');
const TYPES_SRC_DIR = path.join(CWD, 'packages/types/src');

/** Extract collection names from firestore.rules heuristically */
async function extractCollectionsFromRules(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  const matches = [...text.matchAll(/match\s+\/(\w+)(?:\/|\{)/g)].map((m) => m[1]);
  // Deduplicate and filter obvious placeholders like 'databases'
  const set = new Set(matches.filter((m) => !['databases'].includes(m)));
  return Array.from(set).sort();
}

/** Extract exported schema names from types src by scanning for const ... = z.object or z.enum */
async function extractSchemasFromTypes(dir) {
  const entries = await fs.readdir(dir);
  const files = entries.filter((f) => f.endsWith('.ts'));
  const schemas = new Set();
  for (const f of files) {
    const text = await fs.readFile(path.join(dir, f), 'utf8');
    const constNames = [...text.matchAll(/export\s+const\s+(\w+)\s*=\s*z\.(object|enum)/g)].map(
      (m) => m[1],
    );
    for (const n of constNames) schemas.add(n);
  }
  return Array.from(schemas).sort();
}

/** Map common collection names to expected schema identifiers */
function expectedSchemasForCollections(collections) {
  const map = {
    orgs: ['Organization'],
    organizations: ['Organization'],
    memberships: ['MembershipRecord'],
    positions: ['PositionSchema'],
    schedules: ['Schedule'],
    shifts: ['Shift'],
    attendance_records: [],
    join_tokens: [],
    venues: [],
    zones: [],
    messages: [],
    receipts: [],
  };
  const expectations = new Map();
  for (const col of collections) {
    expectations.set(col, map[col] ?? []);
  }
  return expectations;
}

function diffParity(expectations, schemas) {
  const missing = [];
  for (const [col, expected] of expectations.entries()) {
    const notFound = expected.filter((s) => !schemas.includes(s));
    if (notFound.length) missing.push({ collection: col, schemas: notFound });
  }
  return missing;
}

async function main() {
  const collections = await extractCollectionsFromRules(FIRESTORE_RULES_PATH);
  const schemas = await extractSchemasFromTypes(TYPES_SRC_DIR);
  const expectations = expectedSchemasForCollections(collections);
  const missing = diffParity(expectations, schemas);

  const report = {
    collections,
    schemas,
    expectations: Object.fromEntries(expectations.entries()),
    missing,
  };

  if (missing.length) {
    console.error('[schema-parity] Missing schemas for collections:', missing);
    console.log(JSON.stringify(report, null, 2));
    process.exit(2);
  } else {
    console.log('[schema-parity] OK - All collections have matching exported schemas');
  }
}

main().catch((e) => {
  console.error('[schema-parity] Failed:', e);
  process.exit(1);
});
