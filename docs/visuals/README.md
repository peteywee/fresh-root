# Repository Visuals & Analytics

**Generated**: 2025-12-07T08:13:18.491Z  
**Auto-updated**: On every commit (CI workflow)

## Contents

- [Architecture Diagram](./ARCHITECTURE.md) - System structure and dependencies
- [Dependency Tree](./DEPENDENCIES.md) - Package dependencies and versions
- [Repository State](./REPO_STATE.md) - Branch status and git history
- [Dependency Health](./DEPENDENCY_HEALTH.md) - Security audit and issues
- [File Distribution](./FILE_DISTRIBUTION.md) - Code metrics and organization
- [Status Timeline](./STATUS_TIMELINE.md) - Project milestones and health

## Usage

**Update locally**:
```bash
# Generate all visuals
node scripts/generate-visuals.mjs

# With verbose output
node scripts/generate-visuals.mjs --verbose

# Custom output directory
node scripts/generate-visuals.mjs --output ./custom-output
```

## ⚙️ Maintenance

The visual generation script automatically:
1. Deletes previous versions (only latest in repo)
2. Detects dependencies from `pnpm list`
3. Analyzes repository state from git
4. Runs security audits
5. Generates Mermaid diagrams
6. Updates this index file

---

**Last Updated**: 12/7/2025, 8:13:18 AM  
**Status**: ✅ Auto-maintained
