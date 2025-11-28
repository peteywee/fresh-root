# Global Cognition Agent - Scripts

This directory contains the minimal agent harness and tasks for the Global Cognition Agent.

- `agent.mjs` - the main harness (CLI), runs a set of checks and outputs a JSON artifact under `artifacts/`.
- `tasks/rbac.mjs` - a simple RBAC heuristic scan for missing guard tokens in API routes.
- `tasks/pattern-scan.mjs` - a simple pattern scan for inline `adminDb.` or `transaction` usage in UI and API code.

Usage examples:

```bash
# Run all checks locally (fast checks)
NODE_OPTIONS=--max-old-space-size=2048 node scripts/agent/agent.mjs --scope all --format json --scan-rbac --scan-patterns

# Run just doc parity and index check
node scripts/agent/agent.mjs --scope documentation

# Run in CI (example run by workflow)
node scripts/agent/agent.mjs --pr 123 --scope all --format json --scan-rbac --scan-patterns
```
