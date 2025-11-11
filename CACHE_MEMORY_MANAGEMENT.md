# Cache & Memory Management

> Node/npm cache management configuration for dev machine memory optimization.
> Automatic cache cleanup runs on GitHub Actions only - local development skips tests.

## Your Setup

- ✅ **Local Development**: No testing (saves memory)
- ✅ **GitHub Actions**: All tests run automatically
- ✅ **Automatic Cache Cleanup**: Configured at 3GB threshold

## Quick Commands

```bash
# Check current cache size
pnpm cache:info

# Manual cleanup (when cache is large)
pnpm cache:clean

# Run tests only on GitHub (not locally)
# - Push to dev branch
# - Create PR to main
# - GitHub Actions automatically runs all tests
```

## How It Works

### `.npmrc` Configuration

```properties
# Aggressive cleanup for dev machines
store-dir-max-size=3GB          # Delete cache when > 3GB
store-max-ttl=604800000         # Keep only 7 days of cache
prefer-offline=true             # Use offline cache when possible
```

**Auto-triggers when:**

* Cache exceeds 3GB
* Cache entries older than 7 days
* pnpm automatically purges orphaned packages

### GitHub Actions (Always Tests)

Your CI pipeline runs:

1. **Unit + Typecheck + Lint** (`unit-and-lint` job)
2. **Firestore Rules Tests** (`rules-tests` job)
3. **E2E Tests** (main branch only via `e2e-tests` job)

GitHub Actions has sufficient resources so tests don't cause memory issues.

## Memory Optimization Timeline

| Step | Action | Memory Impact |
|------|--------|---------------|
| 1 | Push to `dev` branch | ✅ Minimal (no local tests) |
| 2 | Create PR to `main` | ✅ Zero (pre-commit tags files only) |
| 3 | GitHub Actions runs | ✅ Tests run on GitHub servers |
| 4 | Cache auto-cleanup | ✅ Local cache stays < 3GB |

## Monitoring Cache

```bash
# Check what's in cache
pnpm store status

# Verify cleanup is working
ls -lh ~/.pnpm-store/v3  # Linux/macOS
dir %APPDATA%\pnpm       # Windows
```

## If Cache Gets Too Large

**Aggressive cleanup:**

```bash
pnpm store prune
pnpm cache:clean
```

**Nuclear option:**

```bash
rm -rf ~/.pnpm-store     # Linux/macOS
rmdir /s %APPDATA%\pnpm  # Windows
```

## Why This Setup

| Approach | Memory | CI/CD | Trade-off |
|----------|--------|-------|-----------|
| **Local testing** | ❌ Heavy (> 4GB) | ⚠️ Slow | Developer experience vs resources |
| **GitHub only** ✅ | ✅ < 3GB | ✅ Fast | Offload to GitHub runners |
| **Cache cleanup** ✅ | ✅ Auto-managed | ✅ Reliable | No manual intervention needed |

**You chose**: GitHub-only testing + automatic local cache cleanup = best of both worlds.

## References

* `.npmrc` - Cache configuration (3GB threshold, 7-day TTL)
* `package.json` scripts - `cache:clean`, `cache:info`
* `.github/workflows/ci-tests.yml` - GitHub Actions pipeline
* Local testing → GitHub (via PR) → GitHub Actions tests
