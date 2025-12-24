# ⚡ Repomix Automation — Quick Start

## TL;DR

Your codebase now has **fully autonomous Repomix automation**:

- ✅ **Pre-push hook** — Lightweight check before every push
- ✅ **CI/CD** — Full analysis on every push/PR (GitHub Actions)
- ✅ **Nightly dashboard** — Auto-updated at 2 AM UTC
- ✅ **Metrics tracking** — Monitors codebase growth over time
- ✅ **Auto-docs** — Reports merged into `docs/architecture/_index.md`

---

## 🚀 One-Time Setup

Nothing to do! Everything is already installed.

---

## 📋 Your Commands

Add these to your workflow:

```bash
# Generate reports locally (CI format)
pnpm repomix:ci

# Full automation suite (reports + sync + metrics)
pnpm repomix:dashboard

# Just update the architecture index
pnpm docs:sync

# Just collect growth metrics
pnpm docs:analyze
```

---

## 🔄 Automatic Triggers

| Trigger     | What Runs           | When              |
| ----------- | ------------------- | ----------------- |
| `git push`  | Pre-push hook + CI  | Now + immediately |
| PR creation | CI analysis         | On every PR       |
| Nightly     | Dashboard + metrics | 2 AM UTC daily    |

---

## 📖 View Results

- **`docs/architecture/_index.md`** — Main report (auto-updated)
- **GitHub Actions artifacts** — Raw reports (every push)
- **`docs/metrics/repomix-metrics.log`** — Growth history (nightly)

---

## ⚙️ Skip Automation (When Needed)

```bash
# Skip Repomix pre-push check
SKIP_REPOMIX=1 git push

# Skip all checks
SKIP_CHECKS=1 git push
```

---

## 📍 Where to Find Everything

```
Fresh Schedules Root/
├── .github/workflows/
│   ├── repomix-ci.yml              (CI automation)
│   └── repomix-dashboard.yml       (Nightly dashboard)
├── .husky/
│   └── pre-push                    (Local hook)
├── scripts/
│   ├── docs-sync.mjs               (Sync reports → docs)
│   └── telemetry/repomix-metrics.mjs (Track growth)
└── docs/
    ├── architecture/               (Generated reports)
    └── metrics/                    (Growth tracking)
```

---

## 🎯 Next Step

**Push your code:**

```bash
git add .
git commit -m "🚀 Enable Repomix full automation"
git push
```

Then check [GitHub Actions](../../actions) → **Repomix CI Analysis** tab.

---

**Full setup guide:** See `REPOMIX_AUTOMATION_SETUP.md`
