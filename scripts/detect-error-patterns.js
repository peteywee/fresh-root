#!/usr/bin/env node
// [P2][APP][CODE] Detect Error Patterns
// Tags: P2, APP, CODE

/**
 * FRESH-ROOT: Recurring Error Pattern Detection
 * Series-A Standard: Identifies errors that have occurred >3 times
 * 
 * Runs as pre-commit hook to catch patterns before they become widespread.
 * Tracks: TS1128, TS1005, TS1472, TS1109 and others
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const PATTERN_LOG = path.join(ROOT, '.git', 'error-patterns.json');
const THRESHOLD = 3;  // Alert if error >3 times

// Error patterns to watch (from ERROR_PREVENTION_PATTERNS.md)
const CRITICAL_PATTERNS = {
  'TS1128': { name: 'Declaration or statement expected', category: 'syntax', limit: 0 },
  'TS1005': { name: 'Unexpected token/operator', category: 'syntax', limit: 0 },
  'TS1472': { name: 'Catch/finally expected', category: 'syntax', limit: 0 },
  'TS1109': { name: 'Type compatibility', category: 'type', limit: 50 },  // React version OK
  'TS2786': { name: 'React component type issue', category: 'react', limit: 50 },  // Known React 19 compat issue
  'TS2345': { name: 'Type argument mismatch', category: 'type', limit: 50 },  // Next.js version mismatch OK
  'no-unused-imports': { name: 'Unused import detected', category: 'eslint', limit: 5 },
};

const CODE_SMELL_PATTERNS = [
  { pattern: /async\s*\(\s*\)\s*=>\s*async\s*\(/, message: 'Nested async arrow functions (TS1005)' },
  { pattern: /await\s+\w+\.json\s*\(\s*$/, message: 'Incomplete JSON parsing (missing closing paren)' },
  { pattern: /try\s*\{[^}]*\}(?!\s*catch)(?!\s*finally)/, message: 'Try without catch/finally (TS1472)' },
  { pattern: /export\s+const\s+\w+\s*=\s*\w+\(\{[^}]*handler[^}]*\}\)/, message: 'Possible malformed handler pattern' },
];

function parseTypeCheckErrors() {
  try {
    const output = execSync('cd ' + ROOT + ' && pnpm -w typecheck 2>&1 || true', { encoding: 'utf8' });
    const errors = {};
    
    for (const [code, info] of Object.entries(CRITICAL_PATTERNS)) {
      const matches = output.match(new RegExp('error ' + code, 'g'));
      if (matches) {
        errors[code] = matches.length;
      }
    }
    
    return errors;
  } catch (err) {
    console.error('⚠️  Could not parse typecheck errors:', err.message);
    return {};
  }
}

function parseLintErrors() {
  try {
    const output = execSync('cd ' + ROOT + ' && pnpm -w lint 2>&1 || true', { encoding: 'utf8' });
    const errors = {};
    
    for (const [rule, info] of Object.entries(CRITICAL_PATTERNS)) {
      if (info.category === 'eslint') {
        const matches = output.match(new RegExp(rule, 'g'));
        if (matches) {
          errors[rule] = matches.length;
        }
      }
    }
    
    return errors;
  } catch (err) {
    console.warn('⚠️  Could not parse lint errors (optional)');
    return {};
  }
}

function detectCodeSmells() {
  const issues = [];
  
  try {
    const routeDir = path.join(ROOT, 'apps/web/app/api');
    const files = execSync(`find ${routeDir} -name "*.ts" -type f`, { encoding: 'utf8' }).split('\n').filter(Boolean);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const smell of CODE_SMELL_PATTERNS) {
        if (smell.pattern.test(content)) {
          issues.push({
            file: path.relative(ROOT, file),
            message: smell.message,
            severity: 'warning',
          });
        }
      }
    }
  } catch (err) {
    console.warn('⚠️  Could not scan for code smells');
  }
  
  return issues;
}

function loadPatternHistory() {
  if (!fs.existsSync(PATTERN_LOG)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(PATTERN_LOG, 'utf8'));
  } catch {
    return {};
  }
}

function savePatternHistory(history) {
  try {
    fs.writeFileSync(PATTERN_LOG, JSON.stringify(history, null, 2));
  } catch (err) {
    console.warn('⚠️  Could not save pattern history:', err.message);
  }
}

// Main checks
console.log('🔍 Analyzing error patterns...\n');

const typeCheckErrors = parseTypeCheckErrors();
const lintErrors = parseLintErrors();
const codeSmells = detectCodeSmells();
const history = loadPatternHistory();

let alertCount = 0;
const violations = [];

// Check typecheck errors against limits
for (const [code, count] of Object.entries(typeCheckErrors)) {
  const info = CRITICAL_PATTERNS[code];
  if (count > info.limit) {
    violations.push({
      code,
      name: info.name,
      count,
      limit: info.limit,
      status: 'error',
    });
    alertCount++;
  }
}

// Check lint errors
for (const [rule, count] of Object.entries(lintErrors)) {
  const info = CRITICAL_PATTERNS[rule];
  if (info && count > info.limit) {
    violations.push({
      code: rule,
      name: info.name,
      count,
      limit: info.limit,
      status: 'warning',
    });
  }
}

// Report findings
if (violations.length > 0) {
  console.log('❌ ERROR PATTERN VIOLATIONS DETECTED:\n');
  
  for (const v of violations) {
    const status = v.status === 'error' ? '❌' : '⚠️ ';
    console.log(`${status} ${v.code}: ${v.name}`);
    console.log(`   Found: ${v.count} | Limit: ${v.limit}`);
    console.log(`   Action: Fix ${v.code} errors before committing\n`);
  }
  
  console.log('📚 See docs/ERROR_PREVENTION_PATTERNS.md for solutions\n');
}

if (codeSmells.length > 0) {
  console.log('⚠️  CODE SMELLS DETECTED:\n');
  for (const smell of codeSmells) {
    console.log(`   ${smell.file}: ${smell.message}`);
  }
  console.log('');
}

if (violations.length === 0 && codeSmells.length === 0) {
  console.log('✅ No recurring error patterns detected\n');
}

// Save history for trend tracking
history[new Date().toISOString()] = {
  typeCheckErrors,
  lintErrors,
  codeSmells: codeSmells.length,
  violations: violations.length,
};
savePatternHistory(history);

// Exit with failure if critical errors exceeded
if (alertCount > 0) {
  process.exit(1);
}

console.log('✅ Pattern detection completed\n');
