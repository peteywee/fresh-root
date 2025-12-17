#!/usr/bin/env node
// [P0][API][CODE] Backfill handler signatures to A09 invariant
// Tags: P0, API, CODE
// 
// Auto-fixes handler destructuring to canonical form: { request, input, context, params }
// Adds underscore prefix for unused parameters (respects ESLint rule)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ROUTES_DIR = path.join(ROOT, 'apps/web/app/api');

/**
 * Find all route files in the API directory
 */
function findAllRouteFiles(dir = ROUTES_DIR) {
  const files = [];

  function walk(cur) {
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.isFile() && (e.name === 'route.ts' || e.name === 'route.tsx')) {
        files.push(full);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Extract all handler declarations from route file content
 * Returns array of { name, line, signature, body }
 */
function findHandlers(content) {
  const handlers = [];
  const lines = content.split('\n');

  // Match: export const GET = createXxxEndpoint({ ... handler: async ({ ... }) => { ... } ... });
  const handlerRegex = /export\s+const\s+(GET|POST|PATCH|DELETE|PUT|HEAD|OPTIONS)\s*=\s*create\w+Endpoint\(\{[\s\S]*?handler:\s*async\s*\(\s*({[\s\S]*?})\s*\)\s*=>/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/handler:\s*async\s*\(\s*({[^}]*})\s*\)\s*=>/);
    
    if (match) {
      const signature = match[1].trim();
      handlers.push({
        name: line.match(/export\s+const\s+(GET|POST|PATCH|DELETE|PUT|HEAD|OPTIONS)/)?.[1] || 'UNKNOWN',
        line: i + 1,
        signature,
        fullLine: line,
      });
    }
  }

  return handlers;
}

/**
 * Parse destructured parameters from signature like "{ request, context }"
 * Returns set of param names
 */
function parseParams(signature) {
  const match = signature.match(/\{\s*([^}]*)\s*\}/);
  if (!match) return new Set();
  
  return new Set(
    match[1]
      .split(',')
      .map(p => p.trim().replace(/^(\w+).*/, '$1').split(':')[0].trim())
      .filter(p => p.length > 0)
  );
}

/**
 * Build canonical signature with missing params added as underscore-prefixed
 * Canonical order: request, input, context, params
 */
function buildCanonicalSignature(currentParams) {
  const canonical = ['request', 'input', 'context', 'params'];
  const result = [];

  for (const param of canonical) {
    if (currentParams.has(param)) {
      result.push(param);
    } else {
      // Add with underscore prefix to indicate unused
      result.push(`${param}: _${param}`);
    }
  }

  return `{ ${result.join(', ')} }`;
}

/**
 * Check if handler already matches canonical form
 */
function isCanonical(signature) {
  const params = parseParams(signature);
  return (
    params.has('request') &&
    params.has('input') &&
    params.has('context') &&
    params.has('params')
  );
}

/**
 * Fix a single route file: update all handlers to canonical signature
 */
function fixRouteFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const handlers = findHandlers(content);

  if (handlers.length === 0) {
    return { fixed: 0, alreadyCanonical: 0, filepath };
  }

  let newContent = content;
  let fixedCount = 0;
  let alreadyCanonical = 0;

  // Process each handler (in reverse order to maintain line numbers)
  for (let i = handlers.length - 1; i >= 0; i--) {
    const handler = handlers[i];
    
    if (isCanonical(handler.signature)) {
      alreadyCanonical++;
      continue;
    }

    const currentParams = parseParams(handler.signature);
    const newSignature = buildCanonicalSignature(currentParams);

    // Replace the handler signature in the file
    // Find the exact position and replace
    const searchPattern = handler.signature;
    newContent = newContent.replace(
      new RegExp(
        `handler:\\s*async\\s*\\(\\s*${escapeRegExp(handler.signature)}\\s*\\)\\s*=>`,
        'g'
      ),
      `handler: async (${newSignature}) =>`
    );

    fixedCount++;
  }

  if (fixedCount > 0) {
    // Backup original
    fs.writeFileSync(filepath + '.a09-backup', content, 'utf-8');
    fs.writeFileSync(filepath, newContent, 'utf-8');
  }

  return { fixed: fixedCount, alreadyCanonical, filepath };
}

/**
 * Escape regex special characters
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Backfilling handler signatures to A09 invariant...\n');

  const routes = findAllRouteFiles();
  console.log(`Found ${routes.length} route files\n`);

  let totalFixed = 0;
  let totalAlreadyCanonical = 0;
  const results = [];

  for (const route of routes) {
    const result = fixRouteFile(route);
    results.push(result);
    totalFixed += result.fixed;
    totalAlreadyCanonical += result.alreadyCanonical;

    if (result.fixed > 0) {
      const rel = path.relative(ROOT, result.filepath);
      console.log(`✅ ${rel}`);
      console.log(`   Fixed: ${result.fixed}, Already canonical: ${result.alreadyCanonical}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`📊 BACKFILL SUMMARY`);
  console.log(`   Total handlers fixed: ${totalFixed}`);
  console.log(`   Already canonical: ${totalAlreadyCanonical}`);
  console.log(`   Route files processed: ${routes.length}`);
  console.log('='.repeat(70));

  if (totalFixed > 0) {
    console.log('\n✨ Backfill complete! Run validator to check:\n');
    console.log('   node scripts/validate-handler-signature.mjs\n');
  }
}

main();
