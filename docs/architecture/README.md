# 🏗️ Architecture Documentation

This directory contains **auto-generated architectural documentation** for the Fresh Schedules
codebase.

## Files

- **`_index.md`** — Main architecture overview (auto-updated on every push)
- **`repomix-ci.md`** — Latest CI-generated dependency map
- **`repomix-ci.json`** — Machine-readable dependency report
- **`repomix-dashboard.md`** — Nightly updated dashboard
- **`repomix-dashboard.json`** — Dashboard metrics in JSON format

## Auto-Generation

| Trigger   | Script                                    | Output                | Frequency        |
| --------- | ----------------------------------------- | --------------------- | ---------------- |
| Push / PR | `.github/workflows/repomix-ci.yml`        | `repomix-ci.*`        | On every push/PR |
| Nightly   | `.github/workflows/repomix-dashboard.yml` | `repomix-dashboard.*` | 2 AM UTC daily   |
| Manual    | `pnpm repomix:ci`                         | All CI files          | On-demand        |
| Manual    | `pnpm repomix:dashboard`                  | All files + metrics   | On-demand        |

## Local Development

Generate reports locally:

```bash
# Generate CI reports (JSON + Markdown)
pnpm repomix:ci

# Generate dashboard + metrics
pnpm repomix:dashboard

# Update architecture index
pnpm docs:sync

# Collect metrics
pnpm docs:analyze
```

## Automation Hooks

### Pre-Push Hook

The `.husky/pre-push` hook runs lightweight Repomix analysis before pushing:

```bash
# Skip Repomix check
SKIP_REPOMIX=1 git push
```

### GitHub Actions

- **Repomix CI**: Generates reports on every push/PR (uploads as artifacts)
- **Repomix Dashboard**: Nightly scheduled run with auto-commit to main

## How It Works

1. **Local**: Pre-push hook generates `.repomix-cache.json` (compressed)
2. **CI (on-demand)**: GitHub Actions runs full analysis on push/PR
3. **CI (nightly)**: Scheduled dashboard regeneration with auto-commit
4. **Docs**: `docs-sync.mjs` merges reports into unified index
5. **Metrics**: `telemetry/repomix-metrics.mjs` tracks codebase growth

## Viewing Reports

- **In GitHub**: Check [Actions Artifacts](../../actions) for detailed reports
- **On main branch**: Read the auto-updated `_index.md`
- **Locally**: `pnpm repomix:ci && pnpm docs:sync`

---

**Last Generated:** Auto-managed by automation **Maintained By:** GitHub Actions + Husky hooks
