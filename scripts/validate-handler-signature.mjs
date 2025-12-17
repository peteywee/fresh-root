#!/usr/bin/env node
// [P0][VALIDATION][CI] Handler Signature Invariant Validator
// Tags: P0, VALIDATION, CI
// 
// Enforces A09_HANDLER_SIGNATURE_INVARIANT amendment:
// All SDK factory routes must destructure { request, input, context, params }
// Unused params must be prefixed with underscore (_param)
// 
// Runs in pre-commit hook and CI to prevent signature churn

import fs from 'fs';
import path from 'path';
import { globbySync } from 'globby';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
};

const log = {
  error: (msg) => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.warn(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${msg}${colors.reset}`),
};

/**
 * Canonical SDK factory handler parameters (in order)
 */
const CANONICAL_PARAMS = ['request', 'input', 'context', 'params'];

/**
 * Find all handler exports in a route file
 */
function findHandlers(content) {
  const handlers = [];
  
  // Match: export const METHOD = createXxxEndpoint({ handler: async ({ ... }) => { ... } })
  const regex = /export\s+const\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*=\s*create\w+Endpoint\s*\(\s*\{[^}]*handler\s*:\s*async\s*\(\s*\{\s*([^}]*)\s*\}\s*\)/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    const method = match[1];
    const destructuredParams = match[2];
    
    // Find line number
    const lineNum = content.substring(0, match.index).split('\n').length;
    
    handlers.push({
      method,
      destructuredParams: destructuredParams.trim(),
      startIdx: match.index,
      endIdx: match.index + match[0].length,
      line: lineNum,
    });
  }
  
  return handlers;
}

/**
 * Parse destructured params into { name, isUnderscored }
 */
function parseDestructuredParams(destructStr) {
  const params = [];
  
  // Split by comma, but handle nested objects/arrays
  let current = '';
  let depth = 0;
  
  for (const char of destructStr) {
    if (char === '{' || char === '[') depth++;
    else if (char === '}' || char === ']') depth--;
    else if (char === ',' && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) {
        // Handle both 'param' and 'param: _param' syntax
        const [name, alias] = trimmed.split(':').map(s => s.trim());
        params.push({
          original: name,
          alias: alias || name,
          isUnderscored: (alias || name).startsWith('_'),
        });
      }
      current = '';
      continue;
    }
    current += char;
  }
  
  if (current.trim()) {
    const trimmed = current.trim();
    const [name, alias] = trimmed.split(':').map(s => s.trim());
    params.push({
      original: name,
      alias: alias || name,
      isUnderscored: (alias || name).startsWith('_'),
    });
  }
  
  return params;
}

/**
 * Validate a single handler
 */
function validateHandler(file, handler) {
  const issues = [];
  
  const params = parseDestructuredParams(handler.destructuredParams);
  const paramNames = params.map(p => p.original);
  
  // Check 1: All canonical params present
  const missing = CANONICAL_PARAMS.filter(p => !paramNames.includes(p));
  if (missing.length > 0) {
    issues.push({
      type: 'missing_params',
      severity: 'error',
      message: `Missing required parameters: ${missing.join(', ')}`,
      expected: `{ ${CANONICAL_PARAMS.join(', ')} } or with underscore-prefixed unused params`,
      actual: `{ ${handler.destructuredParams} }`,
    });
  }
  
  // Check 2: No extra params beyond canonical
  const extra = paramNames.filter(p => !CANONICAL_PARAMS.includes(p));
  if (extra.length > 0) {
    issues.push({
      type: 'extra_params',
      severity: 'warn',
      message: `Unexpected parameters: ${extra.join(', ')}`,
    });
  }
  
  // Check 3: Order (if all canonical params present)
  if (missing.length === 0) {
    const order = paramNames.filter(p => CANONICAL_PARAMS.includes(p));
    const expectedOrder = CANONICAL_PARAMS.filter(p => order.includes(p));
    if (JSON.stringify(order) !== JSON.stringify(expectedOrder)) {
      issues.push({
        type: 'wrong_order',
        severity: 'error',
        message: `Parameters in wrong order`,
        expected: CANONICAL_PARAMS.join(', '),
        actual: order.join(', '),
      });
    }
  }
  
  return { isValid: issues.filter(i => i.severity === 'error').length === 0, issues };
}

/**
 * Check for merge conflict markers in handler code
 */
function hasMergeMarkers(content) {
  return /^<{7}|^={7}|^>{7}/m.test(content);
}

/**
 * Main validation run
 */
function validate() {
  log.header('🔍 HANDLER SIGNATURE INVARIANT VALIDATOR');
  log.info(`Checking: apps/web/app/api/**/route.ts`);
  log.info(`Standard: A09_HANDLER_SIGNATURE_INVARIANT\n`);
  
  // Paths to skip (templates, examples) from file-level validity counting
  const SKIP_FILES = new Set([
    'apps/web/app/api/_template/route.ts',
    'apps/web/app/api/_shared/rate-limit-examples.ts',
  ]);

  const routeFiles = globbySync(['apps/web/app/api/**/route.ts'], {
    cwd: ROOT,
    ignore: ['**/node_modules/**', '**/__tests__/**'],
  });
  
  log.info(`Found ${routeFiles.length} route files\n`);
  
  let totalFiles = 0;
  let validFiles = 0;
  let totalHandlers = 0;
  let validHandlers = 0;
  const failures = [];
  
  for (const routeFile of routeFiles) {
    const fullPath = path.join(ROOT, routeFile);
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    const handlers = findHandlers(content);
    // Count file-level validity only if not in skip list AND file has handlers we can validate
    const countFileValidity = !SKIP_FILES.has(routeFile) && handlers.length > 0;
    if (countFileValidity) totalFiles++;
    totalHandlers += handlers.length;
    
    // Check for merge markers
    if (hasMergeMarkers(content)) {
      failures.push({
        file: routeFile,
        issue: 'Merge conflict markers detected',
        severity: 'critical',
      });
      continue;
    }
    
    let fileValid = true;
    for (const handler of handlers) {
      const { isValid, issues } = validateHandler(routeFile, handler);
      
      if (isValid) {
        validHandlers++;
      } else {
        fileValid = false;
        failures.push({
          file: routeFile,
          method: handler.method,
          line: handler.line,
          issues,
          severity: 'error',
        });
      }
    }
    
    if (countFileValidity && fileValid) {
      validFiles++;
    }
  }
  
  // Report
  log.header('📊 VALIDATION RESULTS');
  log.info(`Files: ${validFiles}/${totalFiles} valid`);
  log.info(`Handlers: ${validHandlers}/${totalHandlers} valid\n`);
  
  if (failures.length === 0) {
    log.success(`All handlers match A09 invariant!\n`);
    return 0;
  }
  
  // Show failures
  log.error(`${failures.length} validation failure(s):\n`);
  
  for (const failure of failures) {
    console.log(`${colors.bold}${failure.file}${colors.reset}`);
    if (failure.method) console.log(`  ${failure.method} handler (line ${failure.line})`);
    
    if (failure.issue) {
      console.log(`  ${colors.red}${failure.issue}${colors.reset}`);
      console.log(`  Fix: Resolve merge markers before commit\n`);
      continue;
    }
    
    for (const issue of failure.issues) {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      console.log(`  ${icon} ${issue.message}`);
      if (issue.expected) console.log(`     Expected: ${issue.expected}`);
      if (issue.actual) console.log(`     Actual:   ${issue.actual}`);
    }
    console.log('');
  }
  
  log.header('🔧 HOW TO FIX');
  console.log(`
1. Keep the canonical parameter shape: { request, input, context, params }
2. Prefix unused parameters with underscore: { request: _request, input, context, params }
3. Never delete parameters; never reorder them.
4. Reference: .github/governance/amendments/A09_HANDLER_SIGNATURE_INVARIANT.md
  `);
  
  return failures.length > 0 ? 1 : 0;
}

// Run
const exitCode = validate();
process.exit(exitCode);
