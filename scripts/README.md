# scripts

This directory contains utility scripts for repository maintenance.

## refactor-all.mjs

Generates `refactor-plan.md` containing a per-file prompt to run with the "Refactor Compliance Agent".

Usage:

1. Make the script executable (if needed):

```bash
chmod +x scripts/refactor-all.mjs
```

2. Run the script from the repository root:

```bash
node scripts/refactor-all.mjs
```

This will produce `refactor-plan.md` in the repository root with prompts for each matched file.

Notes:
- The script uses `git ls-files` to find files; ensure you're in a git working tree with files checked out.
- If you prefer, you can run the script with `node` without making it executable.
