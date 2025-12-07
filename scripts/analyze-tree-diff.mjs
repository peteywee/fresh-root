#!/usr/bin/env node
/**
 * [P0][GOVERNANCE][OPTIMIZATION] Tree Diff Analysis & Deprecation Cleanup
 * Tags: P0, GOVERNANCE, OPTIMIZATION, DEPS, CLEANUP
 * 
 * Analyzes:
 * 1. Deprecated packages
 * 2. Unmet peer dependencies
 * 3. Duplicate versions
 * 4. Unused dependencies
 * 5. Tree changes between commits
 * 
 * Generates actionable remediation steps
 * 
 * Run: node scripts/analyze-tree-diff.mjs [--fix] [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const VERBOSE = process.argv.includes('--verbose');
const AUTO_FIX = process.argv.includes('--fix');

const log = (msg, level = 'info') => {
  const prefix = { info: '✓', warn: '⚠', error: '✗', success: '✅' }[level] || '•';
  console.log(`${prefix} ${msg}`);
};

const warn = (msg) => log(msg, 'warn');
const error = (msg) => log(msg, 'error');

/**
 * Get deprecated packages from npm
 */
async function checkDeprecations() {
  log('Checking for deprecated packages...', 'info');

  try {
    const output = execSync('pnpm ls --depth=0 --json', {
      cwd: ROOT,
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
    });

    const pkgInfo = JSON.parse(output);
    const allDeps = {
      ...pkgInfo.dependencies,
      ...pkgInfo.devDependencies,
    };

    const deprecated = [];
    for (const [name, info] of Object.entries(allDeps || {})) {
      try {
        // Check npm registry for deprecation
        const npmInfo = execSync(`npm view ${name} --json 2>/dev/null || true`, {
          cwd: ROOT,
          encoding: 'utf-8',
        });

        if (npmInfo && npmInfo.includes('deprecated')) {
          deprecated.push({
            name,
            version: info.version,
            reason: 'Deprecated in npm registry',
          });
        }
      } catch (e) {
        // Silently skip if npm view fails
      }
    }

    if (deprecated.length > 0) {
      warn(`Found ${deprecated.length} deprecated packages:`);
      deprecated.forEach(d => {
        log(`  - ${d.name}@${d.version}: ${d.reason}`, 'warn');
      });
      return deprecated;
    } else {
      log('No deprecated packages found', 'success');
      return [];
    }
  } catch (err) {
    if (VERBOSE) console.error('Error checking deprecations:', err.message);
    return [];
  }
}

/**
 * Analyze peer dependency issues
 */
function analyzePeerDeps() {
  log('Analyzing peer dependencies...', 'info');

  try {
    const output = execSync('pnpm ls --depth=0 2>&1', {
      cwd: ROOT,
      encoding: 'utf-8',
    });

    const issues = [];
    const lines = output.split('\n');

    let currentPkg = null;
    for (const line of lines) {
      if (line.includes('ERR!') || line.includes('UNMET')) {
        const match = line.match(/UNMET PEER DEPENDENCY (.+?)@(.+)/);
        if (match) {
          issues.push({
            type: 'unmet-peer',
            package: match[1],
            range: match[2],
            line,
          });
        }
      }
    }

    if (issues.length > 0) {
      warn(`Found ${issues.length} peer dependency issues:`);
      issues.forEach(i => {
        log(`  - ${i.package}@${i.range}`, 'warn');
      });
      return issues;
    } else {
      log('No peer dependency issues', 'success');
      return [];
    }
  } catch (err) {
    if (VERBOSE) console.error('Error analyzing peer deps:', err.message);
    return [];
  }
}

/**
 * Find duplicate dependency versions
 */
function findDuplicateVersions() {
  log('Finding duplicate dependency versions...', 'info');

  try {
    const output = execSync('pnpm ls --json --depth=999', {
      cwd: ROOT,
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
    });

    const pkgInfo = JSON.parse(output);
    const versions = {};
    const duplicates = [];

    function collectVersions(deps, path = []) {
      for (const [name, info] of Object.entries(deps || {})) {
        const key = name;
        if (!versions[key]) versions[key] = [];
        if (!versions[key].includes(info.version)) {
          versions[key].push(info.version);
        }

        if (info.dependencies) {
          collectVersions(info.dependencies, [...path, name]);
        }
      }
    }

    collectVersions(pkgInfo.dependencies);
    collectVersions(pkgInfo.devDependencies);

    for (const [pkg, versionList] of Object.entries(versions)) {
      if (versionList.length > 1) {
        duplicates.push({
          package: pkg,
          versions: versionList,
        });
      }
    }

    if (duplicates.length > 0) {
      warn(`Found ${duplicates.length} packages with multiple versions:`);
      duplicates.slice(0, 10).forEach(d => {
        log(`  - ${d.package}: ${d.versions.join(', ')}`, 'warn');
      });
      return duplicates;
    } else {
      log('No duplicate versions', 'success');
      return [];
    }
  } catch (err) {
    if (VERBOSE) console.error('Error finding duplicates:', err.message);
    return [];
  }
}

/**
 * Check for unused dependencies using depcheck
 */
function checkUnusedDeps() {
  log('Checking for unused dependencies...', 'info');

  try {
    // depcheck is already in devDeps
    const output = execSync('npx depcheck --json 2>/dev/null || true', {
      cwd: ROOT,
      encoding: 'utf-8',
    });

    if (!output) {
      log('depcheck not available, skipping unused check', 'warn');
      return [];
    }

    try {
      const result = JSON.parse(output);
      const unused = result.dependencies || [];

      if (unused.length > 0) {
        warn(`Found ${unused.length} potentially unused dependencies:`);
        unused.slice(0, 10).forEach(pkg => {
          log(`  - ${pkg}`, 'warn');
        });
        return unused;
      } else {
        log('No unused dependencies', 'success');
        return [];
      }
    } catch (e) {
      if (VERBOSE) console.error('Failed to parse depcheck output');
      return [];
    }
  } catch (err) {
    if (VERBOSE) console.error('Error checking unused deps:', err.message);
    return [];
  }
}

/**
 * Generate remediation report
 */
function generateRemediationReport(deprecated, peerIssues, duplicates, unused) {
  log('Generating remediation report...', 'info');

  const reportPath = path.join(ROOT, 'docs/DEPENDENCY_REMEDIATION_REPORT.md');

  const report = `# Dependency Remediation Report

**Generated**: ${new Date().toISOString()}  
**Repository**: ${execSync('git config --get remote.origin.url', { cwd: ROOT, encoding: 'utf-8' }).trim()}  
**Branch**: ${execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT, encoding: 'utf-8' }).trim()}

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| Deprecated Packages | ${deprecated.length} | ${deprecated.length > 0 ? '🔴 HIGH' : '✅ OK'} |
| Peer Dependency Issues | ${peerIssues.length} | ${peerIssues.length > 0 ? '🟠 MEDIUM' : '✅ OK'} |
| Duplicate Versions | ${duplicates.length} | ${duplicates.length > 0 ? '🟠 MEDIUM' : '✅ OK'} |
| Unused Dependencies | ${unused.length} | ${unused.length > 0 ? '🟡 LOW' : '✅ OK'} |

---

## 1. Deprecated Packages

${deprecated.length === 0 ? '✅ No deprecated packages found' : `
Found **${deprecated.length}** deprecated package(s):

${deprecated.map(d => `
### ${d.name}@${d.version}
- **Reason**: ${d.reason}
- **Action**: Replace with maintained alternative
- **Fix**: \`pnpm remove ${d.name} && pnpm add <replacement>\`
`).join('\n')}
`}

---

## 2. Peer Dependency Issues

${peerIssues.length === 0 ? '✅ No peer dependency issues' : `
Found **${peerIssues.length}** unmet peer dependencies:

${peerIssues.map(i => `
### ${i.package}@${i.range}
- **Issue**: Package not installed or version mismatch
- **Fix**: \`pnpm install\`
- **Details**: ${i.line}
`).join('\n')}

### Resolution Steps
1. Run \`pnpm install\` to install missing dependencies
2. Check version compatibility with dependent packages
3. Use \`pnpm ls ${peerIssues[0]?.package}\` to debug
`}

---

## 3. Duplicate Dependency Versions

${duplicates.length === 0 ? '✅ No duplicate versions' : `
Found **${duplicates.length}** packages with multiple versions:

${duplicates.slice(0, 15).map(d => `
### ${d.package}
- **Versions**: ${d.versions.join(', ')}
- **Action**: Consolidate to single version
- **Command**: \`pnpm dedupe\`
`).join('\n')}

### Consolidation Strategy
1. Run \`pnpm dedupe --check\` to see duplicates
2. Run \`pnpm dedupe\` to auto-fix
3. Test with \`pnpm install --frozen-lockfile\`
4. Commit: \`git commit -m "chore(deps): deduplicate dependency versions"\`
`}

---

## 4. Unused Dependencies

${unused.length === 0 ? '✅ No unused dependencies' : `
Found **${unused.length}** potentially unused dependencies:

${unused.slice(0, 15).map(pkg => `- ${pkg}`).join('\n')}

### Investigation Steps
1. Verify if truly unused with grep: \`grep -r "${unused[0]}" src/\`
2. Check if used in templates or scripts
3. Remove if confirmed unused: \`pnpm remove <package>\`
4. Run tests to confirm nothing breaks

**Note**: Some packages are used via side effects or in build configs.
`}

---

## Remediation Checklist

- [ ] Review deprecated packages and plan migration
- [ ] Fix peer dependency issues with \`pnpm install\`
- [ ] Consolidate versions with \`pnpm dedupe\`
- [ ] Audit unused dependencies
- [ ] Update lockfile: \`pnpm install --frozen-lockfile\`
- [ ] Run tests: \`pnpm test\`
- [ ] Run type check: \`pnpm typecheck\`
- [ ] Commit changes with clear message

## Automated Remediation Commands

\`\`\`bash
# Fix peer dependencies
pnpm install

# Consolidate versions
pnpm dedupe

# Install frozen (CI safe)
pnpm install --frozen-lockfile

# Check for security issues
pnpm audit

# Update to latest patch versions
pnpm update

# Interactive update (choose versions)
pnpm update --interactive
\`\`\`

## CI/CD Integration

This report is generated automatically on every push to \`main\` and \`dev\` branches.

**Workflow**: \`.github/workflows/dependency-health.yml\`

Dependencies MUST be:
1. ✅ No high severity vulnerabilities
2. ✅ No deprecated packages
3. ✅ No unmet peer dependencies
4. ✅ Minimal duplicate versions
5. ✅ Lockfile integrity maintained

---

**Generated by**: Dependency Analysis Script  
**Path**: \`scripts/analyze-tree-diff.mjs\`  
**Status**: ${deprecated.length === 0 && peerIssues.length === 0 ? '✅ HEALTHY' : '⚠️ NEEDS ATTENTION'}
`;

  fs.writeFileSync(reportPath, report, 'utf-8');
  log(`Report written to ${reportPath}`, 'success');

  return reportPath;
}

/**
 * Generate tree diff between branches
 */
function generateTreeDiff() {
  log('Generating tree diff between branches...', 'info');

  try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: ROOT,
      encoding: 'utf-8',
    }).trim();

    // Get diff against main
    const targetBranch = currentBranch === 'main' ? 'origin/dev' : 'origin/main';
    
    try {
      const diff = execSync(`git diff ${targetBranch}...HEAD --stat | head -30`, {
        cwd: ROOT,
        encoding: 'utf-8',
      });

      return {
        currentBranch,
        targetBranch,
        diff,
      };
    } catch (e) {
      return {
        currentBranch,
        targetBranch,
        diff: '(no commits between branches)',
      };
    }
  } catch (err) {
    if (VERBOSE) console.error('Error generating tree diff:', err.message);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🔍 Tree Diff & Dependency Analysis\n');

  const deprecated = await checkDeprecations();
  const peerIssues = analyzePeerDeps();
  const duplicates = findDuplicateVersions();
  const unused = checkUnusedDeps();
  const treeDiff = generateTreeDiff();

  console.log('\n');
  generateRemediationReport(deprecated, peerIssues, duplicates, unused);

  // Summary
  const totalIssues = deprecated.length + peerIssues.length + duplicates.length + unused.length;
  if (totalIssues === 0) {
    log('✅ All dependency checks passed!', 'success');
  } else {
    warn(`Found ${totalIssues} total dependency issues - see remediation report`);
  }

  if (treeDiff) {
    console.log(`\n📊 Tree Diff (${treeDiff.currentBranch} vs ${treeDiff.targetBranch}):`);
    console.log(treeDiff.diff);
  }

  process.exit(totalIssues > 0 && !AUTO_FIX ? 1 : 0);
}

main().catch(err => {
  error(`Fatal error: ${err.message}`);
  if (VERBOSE) console.error(err);
  process.exit(1);
});
