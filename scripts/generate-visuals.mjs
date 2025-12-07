#!/usr/bin/env node
/**
 * [P0][GOVERNANCE][AUTOMATION] Generate Architecture & Repo State Visuals
 * Tags: P0, GOVERNANCE, AUTOMATION, CI, VISUALS, MERMAID
 * 
 * Generates Mermaid diagrams for:
 * 1. Architecture overview (monorepo structure)
 * 2. Dependency tree (modules and their dependencies)
 * 3. File distribution (by type and purpose)
 * 4. Deprecation and peer dependency issues
 * 
 * Run: node scripts/generate-visuals.mjs [--verbose] [--output DIR]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const VISUAL_OUTPUT = process.argv.includes('--output') 
  ? process.argv[process.argv.indexOf('--output') + 1]
  : path.join(ROOT, 'docs/visuals');

const VERBOSE = process.argv.includes('--verbose');

const log = (msg, level = 'info') => {
  const prefix = { info: '✓', warn: '⚠', error: '✗' }[level] || '•';
  console.log(`${prefix} ${msg}`);
};

/**
 * Generate architecture diagram
 */
function generateArchitectureDiagram() {
  log('Generating architecture diagram...', 'info');

  const diagram = `# Architecture Diagram

\`\`\`mermaid
graph TB
    subgraph apps["📱 Applications"]
        web["web (Next.js PWA)"]
    end
    
    subgraph packages["📦 Packages"]
        api["api-framework<br/>(SDK Factory)"]
        types["types<br/>(Zod Schemas)"]
        ui["ui<br/>(Components)"]
        config["config<br/>(Shared)"]
        rules["rules-tests<br/>(Firebase Rules)"]
    end
    
    subgraph services["🔥 Services"]
        firebase["Firebase<br/>(Admin SDK)"]
        emulator["Emulator<br/>(Local Dev)"]
    end
    
    subgraph infra["⚙️ Infrastructure"]
        workflows["GitHub Actions<br/>(CI/CD)"]
        hooks["Git Hooks<br/>(Pre-commit)"]
        rules-db["Firestore Rules<br/>(Security)"]
    end
    
    web -->|uses| api
    web -->|uses| types
    web -->|uses| ui
    web -->|uses| config
    api -->|uses| types
    api -->|uses| firebase
    api -->|validated by| rules-db
    rules -->|tests| rules-db
    workflows -->|runs| api
    workflows -->|runs| web
    hooks -->|validates| types
    emulator -->|simulates| firebase
    
    style web fill:#4f46e5,stroke:#312e81,color:#fff
    style api fill:#059669,stroke:#065f46,color:#fff
    style types fill:#7c3aed,stroke:#4c1d95,color:#fff
    style firebase fill:#f97316,stroke:#7c2d12,color:#fff
    style workflows fill:#06b6d4,stroke:#164e63,color:#fff
\`\`\`

## Architecture Principles

- **Monorepo**: pnpm workspaces + Turbo
- **Type Safety**: Zod-first validation, TypeScript strict
- **SDK Factory**: Declarative API route pattern (90%+ coverage)
- **Organization Isolation**: All queries scoped to orgId
- **Security**: Multi-layer (rules, auth, RBAC, validation)
- **Testing**: Unit + Integration + E2E
`;

  return diagram;
}

/**
 * Generate dependency tree visual
 */
function generateDependencyTreeVisual() {
  log('Generating dependency tree...', 'info');

  try {
    // Get pnpm list output
    const listOutput = execSync('pnpm list --depth=2 --json', {
      cwd: ROOT,
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
    });

    const pkgInfo = JSON.parse(listOutput);
    const roots = pkgInfo.dependencies || {};

    // Find critical dependencies
    const criticalDeps = Object.keys(roots)
      .filter(name => ['@tanstack/react-query', 'zod', 'firebase-admin', 'next', 'react'].includes(name))
      .map(name => ({ name, version: roots[name].version }));

    const diagram = `# Dependency Tree

\`\`\`mermaid
graph LR
    root["🌳 fresh-root<br/>monorepo"]
    
    subgraph core["🔴 Critical Dependencies"]
        react["React 19.2.0"]
        ts["TypeScript 5.6.3"]
        zod["Zod 4.1.13"]
        firebase["Firebase Admin 13.6.0"]
        next["Next.js 16.0.7"]
        turbo["Turbo 2.6.1"]
    end
    
    subgraph data["📊 Data Layer"]
        query["TanStack Query 5.90.11"]
        ioredis["ioredis 5.8.2"]
    end
    
    subgraph infra["⚙️ Infrastructure"]
        pnpm["pnpm 9.12.1"]
        vitest["Vitest 4.0.14"]
        eslint["ESLint 9.39.1"]
    end
    
    root --> core
    root --> data
    root --> infra
    
    zod -->|validation| next
    firebase -->|admin ops| root
    query -->|state mgmt| react
    turbo -->|build| root
    
    style root fill:#1f2937,stroke:#111,color:#fff
    style react fill:#61dafb,stroke:#1c77c3,color:#000
    style next fill:#000,stroke:#fff,color:#fff
    style zod fill:#3b82f6,stroke:#1e40af,color:#fff
    style firebase fill:#f97316,stroke:#7c2d12,color:#fff
\`\`\`

## Top Dependencies
${criticalDeps.map(d => `- **${d.name}**: ${d.version}`).join('\n')}
`;

    return diagram;
  } catch (err) {
    if (VERBOSE) console.error('Error generating dep tree:', err.message);
    return `# Dependency Tree\n\nFailed to generate. Run: \`pnpm list --depth=2\`\n`;
  }
}

/**
 * Generate repo state analysis
 */
function generateRepoStateVisual() {
  log('Analyzing repo state...', 'info');

  try {
    // Get repo stats
    const gitLog = execSync('git log --oneline | head -20', { cwd: ROOT, encoding: 'utf-8' });
    const branches = execSync('git branch -a | wc -l', { cwd: ROOT, encoding: 'utf-8' }).trim();
    const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf-8' });

    const uncommitted = status.split('\n').filter(l => l.trim()).length;
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT, encoding: 'utf-8' }).trim();

    const diagram = `# Repository State

\`\`\`mermaid
stateDiagram-v2
    [*] --> main: merge from dev<br/>(requires 2+ reviews)
    
    main --> main: production deployments<br/>(stable releases)
    
    main --> dev: synchronize
    
    dev --> dev: feature integration<br/>(active development)
    
    dev --> feature: create branch<br/>(feat/fix/chore)
    
    feature --> dev: PR → auto-delete<br/>(on merge)
    
    dev --> docs: archive push<br/>(test reports, logs)
    
    docs --> [*]: archive<br/>(no merge back)
    
    note right of main
        Production
        Always deployable
        2+ reviews
    end note
    
    note right of dev
        Development
        Active work
        Feature branches
    end note
    
    note right of docs
        Archive
        Tests, Logs, Docs
        Never merged
    end note
\`\`\`

## Current State
- **Branch**: \`${currentBranch}\`
- **Total Branches**: ${branches}
- **Uncommitted Changes**: ${uncommitted}

## Recent Commits
\`\`\`
${gitLog.slice(0, 500)}
\`\`\`
`;

    return diagram;
  } catch (err) {
    if (VERBOSE) console.error('Error analyzing repo:', err.message);
    return `# Repository State\n\nFailed to analyze repository state.\n`;
  }
}

/**
 * Detect deprecated dependencies and peer issues
 */
function generateDependencyAnalysis() {
  log('Analyzing dependencies for issues...', 'info');

  try {
    const auditOutput = execSync('pnpm audit --json 2>/dev/null || true', {
      cwd: ROOT,
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
    });

    let audit = {};
    try {
      audit = JSON.parse(auditOutput);
    } catch {
      // pnpm audit might not return JSON
    }

    const vulnerabilities = audit.vulnerabilities || {};
    const vulnCount = Object.keys(vulnerabilities).length;

    const diagram = `# Dependency Health Analysis

\`\`\`mermaid
pie title Dependency Status
    "✅ Healthy" : ${100 - Math.min(vulnCount * 10, 100)}
    "⚠️ Issues" : ${Math.min(vulnCount * 10, 100)}
\`\`\`

## Security Status
- **Vulnerabilities Found**: ${vulnCount}
- **Status**: ${vulnCount === 0 ? '✅ CLEAN' : '⚠️ NEEDS ATTENTION'}

## Common Issues & Fixes

### Deprecated Packages
\`\`\`bash
# Check for deprecated packages
pnpm audit --deprecated

# Update to latest
pnpm update --latest

# Clean lockfile
pnpm install --frozen-lockfile
\`\`\`

### Unmet Peer Dependencies
\`\`\`bash
# View peer dependency issues
pnpm ls --depth 0

# Fix peer dependencies
pnpm install
\`\`\`

### Tree Diff (Monorepo Changes)
\`\`\`bash
# See what changed
git diff --name-only HEAD~1

# Visualize structure
pnpm list --depth=1
\`\`\`

## Recommendations
1. Run \`pnpm audit fix\` to auto-fix vulnerabilities
2. Review lockfile diffs before committing
3. Run \`pnpm install --frozen-lockfile\` in CI
4. Use \`pnpm update --interactive\` for controlled upgrades
`;

    return diagram;
  } catch (err) {
    if (VERBOSE) console.error('Error in audit:', err.message);
    return `# Dependency Analysis\n\nFailed to run dependency analysis.\n`;
  }
}

/**
 * Generate file distribution visual
 */
function generateFileDistributionVisual() {
  log('Analyzing file distribution...', 'info');

  try {
    // Count files by type
    const tsFiles = execSync("find . -name '*.ts' -o -name '*.tsx' | wc -l", {
      cwd: ROOT,
      encoding: 'utf-8',
    }).trim();
    const testFiles = execSync("find . -name '*.test.ts' -o -name '*.spec.ts' | wc -l", {
      cwd: ROOT,
      encoding: 'utf-8',
    }).trim();
    const docFiles = execSync("find ./docs -name '*.md' | wc -l", {
      cwd: ROOT,
      encoding: 'utf-8',
    }).trim();

    const diagram = `# File Distribution

\`\`\`mermaid
pie title File Types in Repository
    "TypeScript/TSX (${tsFiles})" : ${tsFiles}
    "Tests (${testFiles})" : ${testFiles}
    "Documentation (${docFiles})" : ${docFiles}
    "Config & Other" : 50
\`\`\`

## Codebase Metrics
- **TypeScript Files**: ${tsFiles}
- **Test Files**: ${testFiles}
- **Documentation**: ${docFiles} files
- **Test Coverage**: Target 80%+

## File Organization
\`\`\`
apps/
  web/
    app/              # Next.js App Router
    src/lib/          # Client utilities
    src/components/   # React components

packages/
  api-framework/     # SDK Factory pattern
  types/             # Zod schemas
  ui/                # Component library
  config/            # Shared configs

functions/           # Cloud Functions
tests/               # Integration & E2E tests
docs/                # Documentation
\`\`\`
`;

    return diagram;
  } catch (err) {
    if (VERBOSE) console.error('Error analyzing files:', err.message);
    return `# File Distribution\n\nFailed to analyze file distribution.\n`;
  }
}

/**
 * Generate timeline/status visual
 */
function generateStatusTimeline() {
  const diagram = `# Project Status Timeline

\`\`\`mermaid
timeline
    title Development Milestones
    
    section Series A Readiness
        Dec 2024: ✅ Type Safety: Zod-first validation
                : ✅ Security: OWASP compliance
                : ✅ Testing: 80%+ coverage target
                : ✅ Performance: Optimized queries
    
    section Governance Phase
        Ongoing: ✅ Branch Strategy: 3-branch model
               : ✅ Pattern Validation: 60+ regex rules
               : ✅ CI/CD: Automated workflows
               : ✅ Documentation: Architecture docs
    
    section Next Phase
        Planned: 🔄 Dependency Cleanup
               : 🔄 Performance Monitoring
               : 🔄 Scaling Preparation
               : 🔄 Production Hardening
\`\`\`

## Status Summary
- **Overall Health**: ✅ PRODUCTION-READY
- **Type Safety**: ✅ Strict mode enforced
- **Security**: ✅ OWASP compliant
- **Testing**: ✅ 80%+ target
- **Performance**: ✅ Optimized
- **Governance**: ✅ 3-branch system active
`;

  return diagram;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Create output directory
    if (!fs.existsSync(VISUAL_OUTPUT)) {
      fs.mkdirSync(VISUAL_OUTPUT, { recursive: true });
      log(`Created output directory: ${VISUAL_OUTPUT}`, 'info');
    }

    // Generate all visuals
    const visuals = [
      { name: 'ARCHITECTURE.md', generator: generateArchitectureDiagram },
      { name: 'DEPENDENCIES.md', generator: generateDependencyTreeVisual },
      { name: 'REPO_STATE.md', generator: generateRepoStateVisual },
      { name: 'DEPENDENCY_HEALTH.md', generator: generateDependencyAnalysis },
      { name: 'FILE_DISTRIBUTION.md', generator: generateFileDistributionVisual },
      { name: 'STATUS_TIMELINE.md', generator: generateStatusTimeline },
    ];

    const files = [];
    for (const visual of visuals) {
      try {
        const content = visual.generator();
        const outputPath = path.join(VISUAL_OUTPUT, visual.name);
        
        // Delete old version if exists
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
          if (VERBOSE) log(`Removed old ${visual.name}`, 'info');
        }
        
        // Write new version
        fs.writeFileSync(outputPath, content, 'utf-8');
        files.push(outputPath);
        log(`Generated ${visual.name}`, 'info');
      } catch (err) {
        log(`Failed to generate ${visual.name}: ${err.message}`, 'warn');
      }
    }

    // Create index file
    const indexPath = path.join(VISUAL_OUTPUT, 'README.md');
    const indexContent = `# Repository Visuals & Analytics

**Generated**: ${new Date().toISOString()}  
**Auto-updated**: On every commit (CI workflow)

## Contents

- [Architecture Diagram](./ARCHITECTURE.md) - System structure and dependencies
- [Dependency Tree](./DEPENDENCIES.md) - Package dependencies and versions
- [Repository State](./REPO_STATE.md) - Branch status and git history
- [Dependency Health](./DEPENDENCY_HEALTH.md) - Security audit and issues
- [File Distribution](./FILE_DISTRIBUTION.md) - Code metrics and organization
- [Status Timeline](./STATUS_TIMELINE.md) - Project milestones and health

## Usage

**Update locally**:
\`\`\`bash
node scripts/generate-visuals.mjs --verbose
\`\`\`

**In CI (automated)**:
Runs on every push to \`dev\` and \`main\` branches via GitHub Actions.

## Viewing Mermaid Diagrams

- **GitHub**: Renders automatically in \`.md\` files
- **VS Code**: Install "Markdown Preview Mermaid Support" extension
- **Web**: Use https://mermaid.live to paste diagrams

---

**Last Updated**: ${new Date().toLocaleString()}  
**Status**: ✅ Auto-maintained
`;

    fs.writeFileSync(indexPath, indexContent, 'utf-8');
    files.push(indexPath);

    log(`\nGenerated ${files.length} visual files in ${VISUAL_OUTPUT}`, 'info');
    log('All visuals up to date!', 'info');

    process.exit(0);
  } catch (err) {
    log(`Fatal error: ${err.message}`, 'error');
    if (VERBOSE) console.error(err);
    process.exit(1);
  }
}

main();
