# OOM Crash Prevention Guide (Code 9 - SIGKILL)

**Problem**: VSCode process killed by system OOM killer (exit code 9, SIGKILL)
**Root Cause**: 6.3GB system RAM with 0 swap space + 4.1GB used = insufficient memory pressure buffer
**Solution**: Swap + process monitoring + memory caps

## Quick Fix (1 minute)

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verify
swapon --show
free -h

# Make permanent (optional - survives reboot)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Verify Memory Safety

```bash
# Check current memory status
bash scripts/check-memory-preflight.sh

# Should show:
# ✅ Memory check PASSED
# ✅ Swap available: 2048MB
```

## Start OOM Safeguard (Background Protection)

```bash
# Terminal 1: Run safeguard (one-time per session)
bash scripts/safeguard-oom.sh &

# Terminal 2: Do your work
pnpm dev
```

## VSCode Protection (Already Configured)

The following safeguards are in `.vscode/settings.json`:

- **TypeScript Server**: Capped at 512MB
- **Syntactic Analysis Only**: Reduces analysis memory footprint
- **Project Diagnostics**: Disabled (memory intensive)

## Node.js Build Protection (Already Configured)

- **Heap Limit**: 1536MB (via `run-dev.sh` or `.env.local`)
- **SWC Threads**: Limited to 2 (vs unlimited)
- **Memory Monitoring**: Via `scripts/safeguard-oom.sh`

## System Limits (Recommended)

```bash
# Check current limits
ulimit -a

# Set temporary limits (session only)
ulimit -v 6291456  # 6GB virtual memory limit
ulimit -m 6291456  # 6GB memory limit

# Or add to ~/.bashrc for permanent
echo 'ulimit -v 6291456' >> ~/.bashrc
```

## Troubleshooting

### Still getting OOM crashes?

1. **Check swap is active**:
   ```bash
   swapon --show
   free -h
   ```

2. **Increase swap** (if 2GB not enough):
   ```bash
   # Add another 2GB
   sudo fallocate -l 2G /swapfile2
   sudo chmod 600 /swapfile2
   sudo mkswap /swapfile2
   sudo swapon /swapfile2
   ```

3. **Reduce parallel build tasks**:
   ```bash
   # In .env.local
   SWC_NUM_THREADS=1
   NODE_OPTIONS="--max-old-space-size=1024"
   ```

4. **Close unnecessary applications**:
   - VSCode Extensions: Disable Cloud Code, Remote extensions if not using
   - Browser: Close extra tabs
   - Terminal: Kill unused shells

### Memory is still high after swap added?

```bash
# Check which process is using most memory
ps aux --sort=-%mem | head -5

# If pnpm/build process is stuck:
pkill -f pnpm
pkill -f node
pkill -f esbuild

# Then retry
pnpm dev
```

## Monitoring Real-Time

```bash
# Watch memory in real-time
watch -n 1 'free -h && echo "" && ps aux --sort=-%mem | head -8'

# Or use a dedicated tool
# sudo apt install htop
# htop
```

## Long-Term Solutions

1. **Upgrade System RAM**: 8GB minimum for comfortable development
2. **Use faster storage**: SSD for swap improves performance
3. **CI/CD**: Offload builds to remote CI for testing
4. **Docker**: Isolate builds in containers with memory limits

## Prevention Best Practices

- ✅ Always check memory before starting dev server: `bash scripts/check-memory-preflight.sh`
- ✅ Run safeguard in background: `bash scripts/safeguard-oom.sh &`
- ✅ Use `run-dev.sh` launcher (includes memory setup): `bash run-dev.sh`
- ✅ Monitor with `watch -n 1 free -h` in separate terminal
- ✅ Keep swap ratio: RAM:Swap should be at least 1:0.5 (prefer 1:1)

## Exit Code Reference

- **Exit 0**: Success
- **Exit 1**: General error
- **Exit 9 (SIGKILL)**: OOM killer ← We're preventing this
- **Exit 130 (SIGINT)**: Ctrl+C
- **Exit 143 (SIGTERM)**: Graceful kill

---

**Last Updated**: November 29, 2025
**Status**: All safeguards in place, monitoring active
