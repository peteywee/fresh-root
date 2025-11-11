# NPM Scripts Analysis & Consolidation

## Scripts Audit

### Active & Essential ✅

| Script | Purpose | Keep? | Notes |
|--------|---------|-------|-------|
| `prepare` | Husky setup | ✅ | Required for git hooks |
| `lint` | ESLint check | ✅ | Core quality gate |
| `lint:fix` | Auto-fix lint | ✅ | Used in CI and locally |
| `fix` | Full fix (lint + format) | ✅ | Convenience wrapper |
| `format` | Prettier format | ✅ | Code style |
| `typecheck` | TypeScript validation | ✅ | Critical for CI/CD |
| `build` | Full build | ✅ | Production build |
| `dev` | Dev server (web) | ✅ | Main development entry |
| `test` | Unit tests (Vitest) | ✅ | Fast test feedback |
| `test:rules` | Firestore rules tests | ✅ | Security validation |
| `test:e2e` | Playwright E2E tests | ✅ | Integration testing |
| `tag:files` | Auto-tag files | ✅ | New - file headers |
| `watch:tags` | Watch-mode tagging | ✅ | New - optional |

### Potentially Outdated ⚠️

| Script | Purpose | Status | Recommendation |
|--------|---------|--------|-----------------|
| `build:agent` | TypeScript agent build | ⚠️ | Check if agent still used |
| `run:agent` | Run compiled agent | ⚠️ | Check if agent still used |
| `check:deps` | Verify no deprecated deps | ✅ | Keep - good for CI |
| `dev:all` | Run web + API concurrently | ⚠️ | **CONSOLIDATE**: Use `dev` if API not needed |
| `emu` | Firebase emulator | ✅ | Keep - useful locally |
| `emu:firestore` | Firestore-only emulator | ✅ | Keep - focused testing |
| `web:dev` | Web dev (redundant) | ⚠️ | **CONSOLIDATE**: Same as `dev` |
| `web:build` | Web build (redundant) | ⚠️ | **CONSOLIDATE**: Use `build` |
| `web:start` | Web start (redundant) | ⚠️ | **CONSOLIDATE**: Use `start` |
| `web:test` | Web test (redundant) | ⚠️ | **CONSOLIDATE**: Use `test` |
| `api:dev` | API dev | ⚠️ | Check if API workspace still active |
| `api:test` | API test | ⚠️ | Check if API workspace still active |
| `api:build` | API build | ⚠️ | Check if API workspace still active |
| `api:docker:build` | Docker build | ⚠️ | Check if Docker workflow still used |
| `api:docker:run` | Docker run | ⚠️ | Check if Docker workflow still used |
| `test:safe` | Memory-safe testing | ⚠️ | **CONSOLIDATE**: Use only if needed |
| `test:rules:auto` | Auto rules testing | ⚠️ | **CONSOLIDATE**: Use `test:rules` |
| `test:rules:dev` | Dev rules testing | ⚠️ | **CONSOLIDATE**: Use `test:rules` |
| `test:rules:ci` | CI rules testing | ✅ | Keep - CI specific |
| `ci` | Full CI pipeline | ✅ | Keep - GitHub Actions orchestrates this |

## Consolidation Recommendations

### Remove or Archive These (5 scripts)

```diff
- "web:dev": "pnpm --filter @apps/web dev",              # Use: dev
- "web:build": "pnpm --filter @apps/web build",          # Use: build
- "web:start": "pnpm --filter @apps/web start",          # Use: start
- "web:test": "pnpm --filter @apps/web test",            # Use: test
- "test:safe": "NODE_OPTIONS=\"--max-old-space-size=4096\" pnpm -w vitest run --maxWorkers=1 --reporter=dot",  # Use: test
```

### Review & Decide These (6 scripts)

```
- "build:agent"      → Still using agent? Keep or remove
- "run:agent"        → Still using agent? Keep or remove
- "dev:all"          → API still needed? Keep or consolidate
- "api:*" (4 scripts) → @fresh-schedules/api still needed? Keep or remove
- "test:rules:auto"  → Use case? Consolidate or keep
- "test:rules:dev"   → Covered by test:rules? Consider removing
```

### Keep These As-Is (13 scripts)

All remaining scripts are active, non-redundant, and necessary for the workflow.

## Node Cache Management

### Solution: Automatic Node Cache Cleanup

Create a configuration that automatically deletes Node caches when they exceed a certain size.

#### Option 1: npm Cache Limit (Recommended)

Add to `package.json`:

```json
{
  "npm": {
    "cache": {
      "max": "1GB"
    }
  }
}
```

Or via CLI (one-time):

```bash
npm config set cache:max 1GB --location=project
```

Clean existing cache:

```bash
npm cache clean --force
pnpm store prune
```

#### Option 2: pnpm Cache Management (Better for pnpm)

pnpm has built-in cache management. Configure in `.npmrc`:

```ini
# Store size limit (pnpm cleans automatically)
store-dir-max-size=5GB

# Verify store health
# pnpm store status

# Manual cleanup
# pnpm store prune
```

Or add to `package.json`:

```json
{
  "pnpm": {
    "storeDirMaxSize": "5GB"
  }
}
```

#### Option 3: Scheduled Cleanup Script

Create `scripts/cleanup-caches.mjs`:

```javascript
#!/usr/bin/env node
import { exec } from 'child_process';
import { statSync, rmSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const getCacheSize = (dir) => {
  try {
    const stats = statSync(dir, { recursive: true });
    return stats.size || 0;
  } catch {
    return 0;
  }
};

const LIMITS = {
  npm: '2GB',
  pnpm: '5GB',
  node_modules: '10GB',
};

const PATHS = {
  npm: path.join(homedir(), '.npm'),
  pnpm: path.join(homedir(), '.pnpm-store'),
};

const cleanCaches = async () => {
  console.log('🧹 Checking Node cache sizes...\n');

  // Check npm cache
  try {
    const npmSize = getCacheSize(PATHS.npm);
    const npmSizeGB = (npmSize / 1024 / 1024 / 1024).toFixed(2);
    console.log(`📦 npm cache: ${npmSizeGB}GB`);

    if (npmSize > 2 * 1024 * 1024 * 1024) {
      console.log('   → Cleaning npm cache...');
      await execAsync('npm cache clean --force');
    }
  } catch (error) {
    console.log('   → npm cache not found or error');
  }

  // Check pnpm store
  try {
    const pnpmSize = getCacheSize(PATHS.pnpm);
    const pnpmSizeGB = (pnpmSize / 1024 / 1024 / 1024).toFixed(2);
    console.log(`📦 pnpm store: ${pnpmSizeGB}GB`);

    if (pnpmSize > 5 * 1024 * 1024 * 1024) {
      console.log('   → Pruning pnpm store...');
      await execAsync('pnpm store prune');
    }
  } catch (error) {
    console.log('   → pnpm store not found or error');
  }

  console.log('\n✅ Cache cleanup complete!');
};

cleanCaches().catch(console.error);
```

Add to `package.json`:

```json
{
  "scripts": {
    "cache:cleanup": "node scripts/cleanup-caches.mjs",
    "cache:status": "npm cache verify && pnpm store status"
  }
}
```

#### Option 4: GitHub Actions Cleanup (for CI)

Add to `.github/workflows/cache-cleanup.yml`:

```yaml
name: Cache Cleanup

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Clean npm cache
        run: npm cache clean --force
      - name: Clean pnpm store
        run: pnpm store prune
```

## Recommended Configuration

### Step 1: Configure pnpm (Primary)

Create or update `.npmrc`:

```ini
# Store management
store-dir-max-size=5GB

# Performance
lockfile-only=false
modules-dir=node_modules
prefer-workspace-packages=true
```

### Step 2: Add Cleanup Scripts

```json
{
  "scripts": {
    "cache:cleanup": "npm cache clean --force && pnpm store prune",
    "cache:status": "npm cache verify && pnpm store status",
    "install:clean": "pnpm cache:cleanup && pnpm install --frozen-lockfile"
  }
}
```

### Step 3: Periodic Cleanup

**Via Cron (macOS/Linux):**

```bash
# Edit crontab
crontab -e

# Add (monthly cleanup at 2 AM on first day)
0 2 1 * * cd /path/to/fresh-root && pnpm cache:cleanup
```

**Via npm postinstall:**

```json
{
  "scripts": {
    "postinstall": "node scripts/cleanup-caches.mjs"
  }
}
```

## Quick Start

### Immediate Actions

```bash
# Check cache sizes
pnpm store status

# Clean everything
pnpm cache:cleanup

# Verify
pnpm store status

# Reinstall clean
pnpm install --frozen-lockfile
```

### Long-term Configuration

1. **Update `.npmrc`** with store size limits
2. **Add cleanup scripts** to package.json
3. **Schedule cron job** or set postinstall hook
4. **Monitor** with `pnpm store status` periodically

### GitHub Actions Integration

Add the cache-cleanup workflow to run weekly on Sunday.

## Benefits

✅ **Automatic cleanup** - No manual intervention needed
✅ **Predictable disk space** - Prevents runaway cache growth
✅ **Faster CI** - Smaller cache = faster downloads
✅ **Fresh installs** - Regular cache purge prevents stale packages
✅ **Lower costs** - Reduced disk I/O and GitHub Actions time
