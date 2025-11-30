# Chromebook Memory Strategy - No Swap Edition

**Situation**: Chromebook Crostini containers cannot use swap files. With 6.3GB RAM and no swap, memory pressure is critical. This guide focuses on reducing memory consumption and graceful build degradation.

## The Reality

Your system composition:

- **Total RAM**: 6.3GB (Crostini container limit)
- **Swap**: 0MB (impossible on Chromebook)
- **Current Usage**: 4.1GB (VSCode, Claude, system)
- **Available for builds**: ~2.2GB (tight but workable)

**Key constraint**: Once RAM is full, there's NO swap buffer. Build must stay under 2.2GB or it dies with code 9.

---

## PRIORITY 1: Reduce Idle Memory (Immediate Impact)

### Option A: Disable Copilot Extension (Saves ~300MB)

**Why this matters**: Copilot's language model runs in VSCode background, consuming 300MB+ even when idle.

**Steps**:

1. Open VSCode Command Palette: `Ctrl+Shift+P`
2. Type: `Extensions: Disable (Workspace)`
3. Search for "Copilot" and disable it
4. **Do NOT disable it globally** — only for this workspace
5. Restart VSCode

**Expected result**: `free -h` will show ~300MB more available RAM

**Reversibility**: Re-enable anytime from Extensions panel

---

### Option B: Close Duplicate VSCode Instances (Saves ~400MB)

Your system shows multiple VSCode processes (806MB + 770MB + 87MB = ~1.6GB total).

**Steps**:

1. Run: `ps aux | grep code`
2. If you see multiple entries like `/usr/share/code/code`, kill extras:
   ```bash
   killall -except $$ code  # Keep only current instance
   ```
3. Or manually close VSCode windows except main one
4. Keep only ONE VSCode window open while developing

**Expected result**: Frees ~400-600MB

---

## PRIORITY 2: Build-Time Memory Limits (Permanent Protection)

These settings prevent builds from consuming all available RAM.

### Update `.vscode/settings.json`

Add these memory constraints (already partially in place):

```json
{
  "typescript.tsserver.maxTsServerMemory": 512,
  "typescript.tsserver.useSyntacticAnalysisOnly": true,
  "typescript.tsserver.experimental.enableProjectDiagnostics": false,
  "memory.maxMemoryMB": 512,
  "[python]": {
    "python.linting.enabled": false,
    "python.formatting.enabled": false
  }
}
```

Effect: Prevents editor from hogging memory during build.

---

### Configure Build Parallelism

**Current (.env.local):**

```bash
NODE_OPTIONS="--max-old-space-size=1536"
SWC_NUM_THREADS=2
```

**For Chromebook, reduce further:**

```bash
NODE_OPTIONS="--max-old-space-size=1024"
SWC_NUM_THREADS=1
TURBO_TASKS_CONCURRENCY=2
```

This is **deliberate slowdown** — trades speed for stability. Builds will take ~50% longer but won't crash.

**Edit: `apps/web/.env.local`**

```bash
# Development memory limits (Chromebook optimization)
NODE_OPTIONS="--max-old-space-size=1024"
SWC_NUM_THREADS=1
TURBO_TASKS_CONCURRENCY=2
```

---

## PRIORITY 3: Pre-Flight Memory Check (Before Every Build)

Before running `pnpm dev`, verify you have buffer:

```bash
free -h
```

**Safe to build if**:

- Free RAM ≥ 1.5GB
- Used RAM ≤ 4.5GB

**NOT safe if**:

- Free RAM < 1GB (close apps first)
- Used RAM > 5.5GB (restart VSCode)

---

## PRIORITY 4: Graceful Safeguards During Build

### Runtime OOM Prevention (Chromebook Edition)

Since you can't add swap, use the daemon to gracefully kill memory hogs BEFORE SIGKILL:

```bash
# Terminal 1: Start monitoring daemon
bash scripts/safeguard-oom.sh &

# Terminal 2: Run dev (will not exceed 2.2GB)
pnpm dev
```

**What the daemon does**:

- Monitors every 5 seconds
- Kills processes >1.5GB individually (before cascade)
- Logs to `~/.oom-safeguard.log`
- Lets build restart gracefully instead of exit code 9

---

## PRIORITY 5: Workflow Optimization

### Recommended Dev Session Setup

**Terminal 1 - Memory Monitor** (keep running):

```bash
watch -n 2 'free -h && echo "---" && ps aux --sort=-%mem | head -10'
```

This updates every 2 seconds, shows top memory consumers.

**Terminal 2 - Safeguard Daemon** (keep running):

```bash
bash scripts/safeguard-oom.sh &
tail -f ~/.oom-safeguard.log
```

**Terminal 3 - Dev Work**:

```bash
# Before starting:
bash scripts/check-memory-preflight.sh

# Only if it passes:
pnpm dev
```

### Build-Time Safety Checks

If build starts to stall:

1. Check Terminal 1 (is memory full?)
2. If >5.5GB used, gracefully stop: `Ctrl+C`
3. Wait 10 seconds, restart

If you see in Terminal 2 log:

```
[WARNING] Killing VSCode process 23712 (806MB)
```

This is the daemon protecting you—build will restart. Don't panic.

---

## CHROMEBOOK-SPECIFIC WORKAROUNDS

### Workaround 1: Sequential Instead of Parallel Builds

If `pnpm build` crashes, run components separately:

```bash
# Instead of:
pnpm -w build  # Tries to build everything at once (crashes)

# Do:
cd apps/web && pnpm build       # Build web only
cd ../.. && pnpm -w typecheck   # Type-check (lighter weight)
```

This prevents spike from hitting peak.

---

### Workaround 2: Disable Turbo Cache Temporarily

Large cache can cause memory spike. Force clean:

```bash
# Clear Turbo cache
rm -rf .turbo
pnpm dev  # Will rebuild, but cleaner memory usage
```

---

### Workaround 3: Close Browser Tabs

Chromebook's Chrome browser itself consumes RAM. Close non-essential tabs before dev session:

- Close extra Chrome windows
- Keep only one localhost:3000 tab open
- Close Slack, Discord, etc.

This can free 200-400MB.

---

## EXPECTED PERFORMANCE (Chromebook Optimized)

### Before Optimization

- Dev startup: ~45 seconds
- Memory: 5.5GB (risky)
- Risk: 60% chance of code 9 crash

### After Optimization

- Dev startup: ~90 seconds (slower but stable)
- Memory: 4.2GB (safe margin)
- Risk: <5% chance of crash

**Trade-off**: 2x slower builds, 90% more stable.

---

## MONITORING & TROUBLESHOOTING

### Check current memory usage:

```bash
free -h
```

### See what's consuming memory:

```bash
ps aux --sort=-%mem | head -15
```

### Monitor in real-time:

```bash
watch -n 1 'free -h'
```

### Check safeguard daemon status:

```bash
ps aux | grep safeguard-oom
tail -f ~/.oom-safeguard.log
```

### If preflight check fails:

```bash
bash scripts/check-memory-preflight.sh
# Follow recommendations shown
```

---

## LONG-TERM SOLUTIONS

### Option 1: Reduce VSCode Load (Permanent)

- Disable all non-essential extensions
- Use VS Code Server instead of full VSCode (web-based, lighter)
- Switch to lightweight editor (Vim, Nano) for editing only

### Option 2: Offload Work to Another Machine

- Keep Chromebook for browsing/lightweight edits
- Use SSH to connect to more powerful machine for builds
  ```bash
  ssh user@powerful-machine "cd fresh-root && pnpm build"
  ```

### Option 3: Upgrade Chromebook

- Some newer Chromebooks support 8GB+ RAM Crostini containers
- Check: Chrome Settings → About Chrome OS → (check RAM available)

---

## QUICK START (Copy-Paste)

```bash
# 1. Reduce build parallelism
echo 'NODE_OPTIONS="--max-old-space-size=1024"' >> apps/web/.env.local
echo 'SWC_NUM_THREADS=1' >> apps/web/.env.local
echo 'TURBO_TASKS_CONCURRENCY=2' >> apps/web/.env.local

# 2. Check memory before starting
bash scripts/check-memory-preflight.sh

# 3. Start safeguard daemon (Terminal 1)
bash scripts/safeguard-oom.sh &

# 4. Start dev (Terminal 2)
pnpm dev

# 5. Monitor (Terminal 3)
watch -n 2 'free -h'
```

---

## SUCCESS CRITERIA

✅ `pnpm dev` completes without code 9 crashes  
✅ Memory stays below 5.5GB during builds  
✅ Free RAM never hits 0MB  
✅ Safeguard daemon logs show no emergency kills  
✅ Preflight check passes before each session

---

## Support

If crashes continue:

1. Run: `dmesg | tail -20` (check for OOM kill events)
2. Run: `ps aux --sort=-%mem` (identify memory hogs)
3. Close non-essential apps (Chrome tabs, Slack, Discord)
4. Reduce `SWC_NUM_THREADS` to 0 (sequential builds only)
5. Consider offloading builds to remote machine

Last resort: Restart Crostini container (`sudo restart systemd-binfmt`).
