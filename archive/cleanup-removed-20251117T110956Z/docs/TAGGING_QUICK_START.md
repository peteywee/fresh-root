# Quick Start: Auto-Tagging

## How It Works

Every new file automatically gets a header like this:

```typescript
// [P1][API][ONBOARDING] Brief description
// Tags: P1, API, ONBOARDING
/**
 * @fileoverview
 * What this file does.
 */
```

**Automatically triggered on:**

- ✅ `git commit` (pre-commit hook)
- ✅ `git checkout` (post-checkout hook)
- ✅ Optional: `pnpm watch:tags` (real-time during dev)

## Usage

### Default (Auto on Commit)

```bash
git add .
git commit -m "feat: add new API"  # Headers auto-added!
```

### Real-Time During Development

```bash
# Terminal 1 - Watch for new files
pnpm watch:tags

# Terminal 2 - Create files as usual
# They'll be tagged automatically!
```

### Manual Run

```bash
pnpm tag:files                # Tag all files
pnpm tag:files -- --dry-run   # Preview changes
```

## File Types Auto-Tagged

| Extension     | Prefix Format         |
| ------------- | --------------------- |
| `.ts`, `.tsx` | `// [P?][AREA][COMP]` |
| `.js`, `.mjs` | `// [P?][AREA][COMP]` |
| `.md`         | `# Title`             |

## Priority Quick Reference

- **P0**: Security, critical paths, core infrastructure
- **P1**: API routes, main helpers, rules
- **P2**: Utilities, tests, secondary helpers
- **P3**: Examples, comments, nice-to-have

## Troubleshooting

**Files not auto-tagged?**

```bash
# Ensure hooks are installed
pnpm husky install

# Make pre-commit executable
chmod +x .husky/pre-commit

# Run manually
pnpm tag:files
```

**Want to disable auto-tagging?**

```bash
# Temporarily skip hooks
git commit --no-verify

# Permanently disable
husky uninstall
```

## Full Documentation

See `docs/AUTO_TAGGING.md` for complete details.
