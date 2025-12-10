# Repository Visuals & Analytics

**Generated**: 2025-12-10T10:19:32.868Z  
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
node scripts/generate-visuals.mjs --verbose
```

**In CI (automated)**:
Runs on every push to `dev` and `main` branches via GitHub Actions.

## Viewing Mermaid Diagrams

- **GitHub**: Renders automatically in `.md` files
- **VS Code**: Install "Markdown Preview Mermaid Support" extension
- **Web**: Use https://mermaid.live to paste diagrams

---

**Last Updated**: 12/10/2025, 10:19:32 AM  
**Status**: ✅ Auto-maintained
