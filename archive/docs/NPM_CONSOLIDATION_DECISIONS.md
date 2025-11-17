# Consolidation Plan: Scripts

## Quick Decision Tree

Answer these questions to decide what to keep:

### 1. Agent Scripts

**Question**: Do you actively use the TypeScript agent in `scripts/agent/`?

- **YES** → Keep both scripts
- **NO** → Remove both scripts

### 2. API Scripts

**Question**: Is `@fresh-schedules/api` workspace still under development?

- **YES** → Keep `dev:all`, `api:dev`, `api:test`, `api:build`
- **NO** → Remove all 4 scripts

### 3. Docker Scripts

**Question**: Do you deploy API via Docker?

- **YES** → Keep both scripts
- **NO** → Remove both scripts

### 4. Redundant Web Scripts

**Question**: Are these used by external tools or CI?

- **YES** → Keep them as aliases for backward compatibility
- **NO** → Remove all 4 (`web:dev`, `web:build`, `web:start`, `web:test`)

### 5. Test Scripts

**Question**: Do you need memory-safe or auto-running test variants?

- **YES** → Keep them
- **NO** → Remove all 3

---

## Immediate Consolidation (Safe, No Data Loss)

If you want to consolidate **now** without breaking anything:

### Step 1: Check if Components Still Exist

```bash
# Check if agent is used
ls -la scripts/agent/

# Check if API workspace exists
ls -la services/api/

# Check if Docker files exist
ls -la services/api/Dockerfile
```

### Step 2: Decision Matrix

Fill in your answers:

| Component              | Exists? | Still Used? | Action        |
| ---------------------- | ------- | ----------- | ------------- |
| `scripts/agent/`       | YES/NO  | YES/NO      | KEEP / REMOVE |
| `@fresh-schedules/api` | YES/NO  | YES/NO      | KEEP / REMOVE |
| Docker setup           | YES/NO  | YES/NO      | KEEP / REMOVE |

### Step 3: Apply Consolidation

Once you've answered, I'll create an optimized `package.json` with only the scripts you need.

---

## Safe Removals (Very Low Risk)

These are **always** safe to remove (they're redundant or easily replaceable):

```bash
# Current behavior vs. Replacement:
web:dev          → pnpm dev
web:build        → pnpm build
web:start        → pnpm start
web:test         → pnpm test
test:safe        → pnpm test (with NODE_OPTIONS if needed)
test:rules:dev   → pnpm test:rules
test:rules:auto  → pnpm test:rules (manual run)
```

---

## Node Cache Configuration (Ready to Deploy)

### Simplest Solution (Recommended)

Add to `.npmrc`:

```ini
store-dir-max-size=5GB
```

Then run once:

```bash
pnpm store prune
```

**Done!** pnpm now auto-cleans when cache exceeds 5GB.

### Add Helper Scripts

Update `package.json` scripts section:

```json
{
  "scripts": {
    "cache:cleanup": "npm cache clean --force && pnpm store prune",
    "cache:status": "npm cache verify && pnpm store status"
  }
}
```

Usage:

```bash
pnpm cache:status    # Check current cache size
pnpm cache:cleanup   # Manual cleanup
```

### Scheduled Cleanup (Optional)

For automatic weekly cleanup, add cron job (Linux/macOS):

```bash
crontab -e
# Add line:
0 2 1 * * cd /home/patrick/fresh-root-10/fresh-root && pnpm cache:cleanup
```

---

## What Should I Do Now

**Option A: Quick Consolidation** (5 min)

1. Answer the decision matrix above
2. I'll generate optimized `package.json`
3. You test locally

**Option B: Cache Configuration Only** (2 min)

1. I create updated `.npmrc`
2. Run `pnpm store prune`
3. Done

**Option C: Both** (7 min)

1. I'll handle both consolidation and cache config
2. You test

Which would you prefer?
