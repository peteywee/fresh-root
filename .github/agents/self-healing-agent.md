# Self-Healing & Self-Updating Agent

## Overview

The repo-agent now includes self-updating and self-healing capabilities to automatically maintain itself and detect/fix common repository issues.

## Features

### 🔄 Self-Update

**Automatically pulls latest agent code from main branch**

- Checks for updates to `scripts/agent/` directory
- Fetches latest changes from `origin/main`
- Stashes local modifications before updating
- Rebuilds agent after update
- Exits with code 77 to signal restart required

**Usage:**
```bash
# Enable (default)
pnpm run:agent --issue 21

# Disable
pnpm run:agent --issue 21 --no-self-update
```

**Workflow Integration:**
The agent automatically updates itself before running tasks, ensuring it always uses the latest logic and fixes.

### 🩹 Self-Heal

**Detects and fixes common repository issues**

Diagnostic checks and auto-fixes:

1. **Missing pnpm-lock.yaml**
   - Detection: Checks if lockfile exists
   - Fix: Creates default lockfile structure

2. **Missing node_modules**
   - Detection: Checks if dependencies are installed
   - Fix: Runs `pnpm install`

3. **TypeScript Errors**
   - Detection: Runs `pnpm -w typecheck`
   - Fix: Attempts `eslint --fix` to auto-resolve issues

4. **Missing firebase.json**
   - Detection: Checks for Firebase config
   - Fix: Creates default configuration with emulator settings

5. **Missing Agent Build Artifacts**
   - Detection: Checks for `dist/agent/` directory
   - Fix: Runs `pnpm run build:agent`

**Usage:**
```bash
# Enable (default)
pnpm run:agent --issue 21

# Disable
pnpm run:agent --issue 21 --no-self-heal
```

**Behavior:**
- Runs diagnostics before main agent tasks
- Applies fixes in best-effort mode (non-fatal)
- Logs all detected issues and applied fixes
- Continues execution even if some fixes fail

## CLI Options

```bash
node --enable-source-maps ./dist/agent/agent.mjs [options]

Options:
  --issue <number>       GitHub issue number (default: "21")
  --force                Force overwrite existing files
  --plan-only            Dry-run mode, no changes written
  --no-self-heal         Disable self-healing diagnostics
  --no-self-update       Disable automatic agent updates
```

## Exit Codes

- `0` - Success
- `1` - Error (standard failure)
- `77` - Self-update applied, restart required

## Integration with CI/CD

### GitHub Actions Workflow

The repo-agent workflow automatically handles self-updates:

```yaml
- name: Build agent
  run: pnpm run build:agent

- name: Run agent
  id: agent
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    set -euo pipefail
    node --enable-source-maps ./dist/agent/agent.mjs --issue "$ISSUE_NUMBER"
```

If the agent self-updates (exit code 77), the workflow can detect this and re-run:

```yaml
- name: Re-run if updated
  if: steps.agent.outputs.exit_code == 77
  run: node --enable-source-maps ./dist/agent/agent.mjs --issue "$ISSUE_NUMBER"
```

## Safety Features

1. **Stashing**: Local changes are stashed before self-update
2. **Non-Fatal Healing**: Self-heal failures don't stop execution
3. **Best-Effort Mode**: Uses `|| true` and `reject: false` for resilience
4. **Explicit Toggles**: Can disable features via CLI flags
5. **Logging**: All actions logged with timestamps and status

## Example Output

```
[agent] Repo agent started. Issue #21 | planOnly=false | force=false
[agent] git root: /home/user/fresh-root
[self-update] Checking for agent updates...
[self-update] Agent is up to date
[self-heal] Running diagnostics...
[self-heal] Detected 2 issue(s): Missing node_modules, TypeScript errors detected
[self-heal] Applied 2 fix(es): Installed dependencies, Attempted ESLint auto-fix
[agent] Monorepo structure OK
[agent] RBAC schemas ensured
[agent] Firestore rules & indexes ensured
[agent] Repo agent completed successfully.
```

## Troubleshooting

### Agent Won't Update

**Symptom:** Self-update claims no changes, but you know there are updates

**Solution:**
```bash
# Manually fetch and reset agent
git fetch origin main
git checkout origin/main -- scripts/agent/
pnpm run build:agent
```

### Self-Heal Doesn't Fix Issue

**Symptom:** Diagnostic detects issue but fix doesn't work

**Solution:**
- Check logs for specific error messages
- Manually apply the fix to understand why it failed
- Add more robust healing logic if it's a common issue

### Exit Code 77 Loop

**Symptom:** Agent keeps exiting with 77 and never completes

**Solution:**
```bash
# Disable self-update temporarily
pnpm run:agent --issue 21 --no-self-update
```

## Future Enhancements

Planned self-healing capabilities:

- **Dependency Conflicts**: Auto-resolve version mismatches
- **Git Conflicts**: Detect and attempt auto-merge
- **Firestore Rules**: Validate and suggest fixes
- **Test Failures**: Analyze and suggest repairs
- **Security Vulnerabilities**: Auto-update deps with known CVEs

## Related Documentation

- [Repo Agent Workflow](../.github/workflows/repo-agent.yml)
- [ESLint+TypeScript Agent](./eslint-ts-agent.md)
- [Agent Tasks](../../scripts/agent/tasks/)
