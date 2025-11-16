# ⚡ QUICK START — v15 Interactive Refactoring

## 30-Second Setup

```bash
# 1. Install git hooks (one-time)
pnpm add -D husky lint-staged && pnpm prepare

# 2. Create pre-commit hook
npx husky add .husky/pre-commit "pnpm lint-staged"

# 3. Launch interactive control panel
pnpm refactor:interactive
```

## Choose Your Path

### 🎮 **Path 1: Interactive (Safest, Most Control)**

```bash
pnpm refactor:interactive
```

**What you get:**

- Real-time phase status
- Pause/resume capability
- Granular control (skip phases, jump ahead)
- One-command rollback
- Visual progress tracking

**Time:** ~8 min | **Risk:** Minimal | **Learning:** High

---

### ⚡ **Path 2: Quick Commands (Fast, Reliable)**

```bash
# See what will change
pnpm refactor:plan

# Test everything
pnpm refactor:dry-run

# Apply permanently
pnpm refactor:apply

# Commit
git add . && git commit -m "chore: v15 refactoring"
```

**What you get:**

- Full control
- See each step
- Stop at any point
- Automatic rollback keys

**Time:** ~5 min | **Risk:** Low | **Learning:** Low

---

### 🚀 **Path 3: One-Liner (Fastest, Automated)**

```bash
pnpm refactor:plan && pnpm refactor:dry-run && pnpm qa:full && pnpm refactor:apply && git add . && git commit -m "chore: v15 refactoring"
```

**What you get:**

- Fully automated
- Pre-commit auto-gates quality
- Instant feedback
- Zero memory overhead

**Time:** ~5 min | **Risk:** Low | **Learning:** None

---

## Available Commands

```bash
# Planning Phase
pnpm refactor:plan         # Analyze (no changes)
pnpm refactor:status       # Show current stats
pnpm refactor:diff         # View proposed diffs

# Execution Phase
pnpm refactor:dry-run      # Test with backups
pnpm refactor:apply        # Apply permanently
pnpm refactor:interactive  # Interactive control

# Recovery Phase
pnpm refactor:rollback     # Undo last change
git restore .              # Manual fallback

# Quality Phase
pnpm qa:typecheck          # Type checking
pnpm qa:test               # Unit tests
pnpm qa:full               # All checks
```

---

## What Gets Changed

### Files: 6

1. `apps/web/app/(app)/demo/page.tsx`
2. `apps/web/app/(app)/protected/page.tsx`
3. `apps/web/app/(app)/protected/dashboard/page.tsx`
4. `apps/web/app/(app)/protected/schedules/page.tsx`
5. `apps/web/app/(app)/protected/schedules/page.server.ts`
6. `apps/web/app/(auth)/login/page.tsx`

### Changes: Import Reorganization Only

- Preserves all comments
- Respects your tagging system
- Maintains functionality
- **100% reversible**

---

## Status Dashboard

```bash
cat .refactor-manifest.json | jq '.summary'
```

Shows:

- Total changes
- By transformation type
- Backups created
- Rollback key
- Timestamps

---

## Emergency Commands

```bash
# Undo everything
pnpm refactor:rollback

# Or manual reset
git restore .

# Or full reset
git reset --hard HEAD
```

All take **< 30 seconds**.

---

## Verification

```bash
# After any phase, verify quality:
pnpm qa:full

# Output should show:
# ✅ Typecheck: PASSED
# ✅ Tests: PASSED
# ✅ Lint: PASSED
```

---

## Next Steps

1. **Choose your path** (above)
2. **Run the commands**
3. **Verify with `pnpm qa:full`**
4. **Commit when ready**

**That's it! v15 ready in ~5-8 minutes.**

---

**Questions?** Check `docs/INTERACTIVE_WORKFLOW.md` for detailed reference.
