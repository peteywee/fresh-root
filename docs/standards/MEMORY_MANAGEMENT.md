---
title: "Memory Management for Production"
description: "Memory optimization, monitoring, and troubleshooting for production environments"
keywords:
  - memory
  - performance
  - production
  - optimization
  - troubleshooting
category: "standard"
status: "active"
audience:
  - operators
  - developers
  - architects
related-docs:
  - ../reference/PRODUCTION_READINESS.md
  - ERROR_PREVENTION_PATTERNS.md
---

# Memory Management for Production

## Critical Issue Fixed: Node Exit Code 9 (SIGKILL - Out of Memory)

### Problem

- System: 6.3GB total RAM, 0B swap
- VSCode TypeScript server consuming 10GB+
- Build/dev processes getting killed by OOM
- Exit code 9 = SIGKILL from OOM killer

### Root Cause

1. **VSCode memory leaks** - TypeScript server, language servers consuming unbounded memory
2. **No swap space** - No overflow buffer for temporary spikes
3. **Parallel builds** - Multiple worker threads competing for limited RAM

### Solutions Implemented

#### 1. Node Memory Limits (.env.local, .env.production)

```bash
NODE_OPTIONS=--max-old-space-size=1536
```

- Caps Node.js heap at 1.5GB per process
- Prevents unbounded memory growth

#### 2. Build Optimization (.pnpmrc)

```
node-linker=hoisted
fetch-timeout=60000
```

- Reduces parallel I/O operations
- Better memory utilization during installs

#### 3. VSCode Settings (.vscode/settings.json)

```json
{
  "typescript.tsserver.maxTsServerMemory": 512,
  "typescript.tsserver.experimental.enableProjectDiagnostics": false,
  "typescript.enableStaticTypeChecking": false
}
```

- Limits TypeScript server to 512MB
- Disables expensive diagnostics
- Reduces CPU/memory spikes

#### 4. Build Parallelism (run-dev.sh)

```bash
SWC_NUM_THREADS=2
```

- Limits SWC compiler threads to 2 instead of auto-detect (CPU count)
- Reduces peak memory footprint during compilation

### Usage

**Development:**

```bash
./run-dev.sh
# OR
NODE_OPTIONS="--max-old-space-size=1536" SWC_NUM_THREADS=2 pnpm dev
```

**Production Build:**

```bash
NODE_OPTIONS="--max-old-space-size=2048" pnpm build
```

**Tests:**

```bash
NODE_OPTIONS="--max-old-space-size=1536" pnpm vitest run
```

### Monitoring

Check actual memory usage:

```bash
free -h
ps aux --sort=-%mem | head -10
```

### Future Improvements

1. **Add swap space** (4-8GB recommended)
2. **Upgrade system RAM** to 16GB+ if possible
3. **CI/CD**: Use `--frozen-lockfile` to skip install-time optimizations
4. **Docker**: Run backend in separate container with dedicated memory

### If Crashes Persist

```bash
# Nuclear option: Force sequential builds
pnpm build --concurrency=1

# Clear all caches and retry
rm -rf .next node_modules .pnpm-store
pnpm install --frozen-lockfile
pnpm build
```
