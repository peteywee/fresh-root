# Project Documentation Index

**Last Updated:** November 7, 2025
**Status:** ✅ Complete and Production Ready

## Overview

This repository contains comprehensive technical documentation covering all aspects of the Fresh Root project, including architecture, development journey, critical issues solved, and reproducibility guides.

## Core Documentation

### 1. [README.md](../README.md)

**Main project documentation** - Quick start, features, installation, and basic usage.

### 2. Development Journey & Fixes (Archived)

Historical fix documentation has been moved to `docs/archive/` for reference:

| Document                                                                 | Purpose                     | Key Topics                                                 |
| ------------------------------------------------------------------------ | --------------------------- | ---------------------------------------------------------- |
| **[archive/TEST_FIXES_ROUND2.md](./archive/TEST_FIXES_ROUND2.md)**       | Critical bug fixes (Oct 31) | Storage emulator, auth tokens, Docker, ESLint, Next.js API |
| **[archive/BRANCH_CONSOLIDATION.md](./archive/BRANCH_CONSOLIDATION.md)** | Repository cleanup (Oct 31) | 7 branches merged, conflict resolution, branch deletion    |
| **[archive/CI_FIX_PNPM_VERSION.md](./archive/CI_FIX_PNPM_VERSION.md)**   | GitHub Actions fix          | pnpm version mismatch resolution                           |
| **[archive/ERROR_FIXES_SUMMARY.md](./archive/ERROR_FIXES_SUMMARY.md)**   | Historical fixes            | Previous rounds of bug fixes                               |

### 3. Project Planning & Process

| Document                                     | Purpose                           |
| -------------------------------------------- | --------------------------------- |
| **[GOALS.md](./GOALS.md)**                   | Project objectives and milestones |
| **[SCOPE.md](./SCOPE.md)**                   | Feature scope and boundaries      |
| **[PROCESS.md](./PROCESS.md)**               | Development process and workflows |
| **[REPO_STANDARDS.md](./REPO_STANDARDS.md)** | Code standards and conventions    |

### 4. Setup & Usage Guides

| Document                                                | Purpose                                |
| ------------------------------------------------------- | -------------------------------------- |
| **[../SETUP.md](../SETUP.md)**                          | Step-by-step setup instructions        |
| **[../USAGE.md](../USAGE.md)**                          | Application usage guide                |
| **[../CONTRIBUTING.md](../CONTRIBUTING.md)**            | Contribution guidelines                |
| **[VS Code Workspace Rules](../.vscode/docs/RULES.md)** | Editor rules: no deprecated deps/peers |

### 5. AI Development Context

Located in `docs/ai/`:

- **CHAT_CONTEXT.md** - Context for AI pair programming
- **CHATMODE.md** - AI interaction guidelines
- **SYSTEM_PROMPT.md** - AI system prompts
- **TOOLS.md** - Available development tools

### 6. Runbooks

Located in `docs/RUNBOOKS/`:

- **Onboarding.md** - New developer onboarding
- **PublishNotify.md** - Release process
- **Scheduling.md** - Schedule management workflows

## Quick Reference

### Repository Status (October 31, 2025)

**Branches:** 3 active (main, dev, copilot/sub-pr-29)
**Tests:** ✅ All passing
**CI/CD:** ✅ Green
**Security:** ✅ CodeQL scanning active
**Documentation:** ✅ Comprehensive

### Technology Stack

| Category            | Technology          | Version   |
| ------------------- | ------------------- | --------- |
| **Frontend**        | Next.js             | 16.x      |
| **UI**              | React               | 18.x      |
| **Language**        | TypeScript          | 5.6.3     |
| **Styling**         | Tailwind CSS        | 3.x       |
| **Backend**         | Firebase            | 10.x      |
| **Package Manager** | pnpm                | 9.1.0     |
| **Testing**         | Vitest + Playwright | 2.x + 1.x |
| **CI/CD**           | GitHub Actions      | N/A       |

### Critical Files Reference

| File                           | Purpose                                   |
| ------------------------------ | ----------------------------------------- |
| `firebase.json`                | Firebase configuration (emulators, rules) |
| `firestore.rules`              | Database security rules (RBAC)            |
| `storage.rules`                | Storage security rules                    |
| `pnpm-workspace.yaml`          | Monorepo configuration                    |
| `package.json`                 | Root dependencies (pnpm@9.1.0)            |
| `.github/workflows/ci.yml`     | Main CI pipeline                          |
| `.github/workflows/codeql.yml` | Security scanning                         |

## Architecture Overview

### System Layers

````text
┌─────────────────────────────────┐
│     Client (Next.js PWA)        │
│     React 18 + TypeScript       │
└────────────┬────────────────────┘
             │ HTTPS/REST
             ▼
┌─────────────────────────────────┐
│   API Routes (Next.js)          │
│   Zod Validation + Middleware   │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│      Firebase Services          │
│  Auth | Firestore | Storage     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│     Security Rules Engine       │
│   firestore.rules | storage.rules│
└─────────────────────────────────┘

```text

### Monorepo Structure

```text

fresh-root/
├── apps/web/              # Next.js PWA
├── packages/              # Shared packages
│   ├── types/            # TypeScript types
│   ├── ui/               # UI components
│   ├── rules-tests/      # Rules testing
│   └── config/           # Shared configs
├── services/api/          # Dockerized API
├── tests/                 # E2E + Rules tests
└── .github/workflows/     # CI/CD pipelines
````

## Development Journey Highlights

### Phase 1-3: Foundation (Pre-October 2025)

- Next.js app with Firebase
- Monorepo structure
- Authentication & UI
- Testing infrastructure
- CI/CD pipelines

### Phase 4: Repository Consolidation (October 31, 2025)

**MAJOR MILESTONE**: Cleaned up repository

- ✅ Consolidated 7 feature branches
- ✅ Resolved merge conflicts (kept dev version)
- ✅ Deleted 9 stale branches
- ✅ Repository: 12+ branches → 3 branches

### Phase 5: Critical Bug Fixes (October 31, 2025)

**MAJOR MILESTONE**: Resolved 6+ critical failures

1. ✅ Storage emulator configuration
1. ✅ Auth token format in tests
1. ✅ Collection path mismatches
1. ✅ Docker build with optional deps
1. ✅ PNPM version mismatch in CI
1. ✅ ESLint import order
1. ✅ Next.js cache API update

### Current State

```text
✅ Production Ready
✅ All tests passing
✅ CI/CD pipeline green
✅ Security scanning active
✅ Documentation complete
✅ Ready for deployment
```

## Common Tasks

### Development

```bash
pnpm dev                    # Start dev server
pnpm build                  # Build all
pnpm typecheck             # Type checking
pnpm lint                  # Linting
pnpm test                  # All tests
```

### Firebase

```bash
firebase emulators:start    # Start emulators
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### Git Operations

```bash
git branch -a              # List branches
gh pr create               # Create PR
gh pr view 29              # View PR
```

## Known Pitfalls & Solutions

### 1. Emulator Connection Refused

**Problem:** `ECONNREFUSED 127.0.0.1:8080`
**Solution:** Start emulators with `firebase emulators:start`

### 2. pnpm Version Mismatch

**Problem:** CI fails with version conflict
**Solution:** Use exact version (9.1.0) in workflows to match package.json

### 3. Auth Token Format

**Problem:** Rules tests fail with PERMISSION_DENIED
**Solution:** Use `{ orgId: 'org123', roles: ['member'] }` format

### 4. Docker Build Slow

**Problem:** Build takes 10+ minutes
**Solution:** Use `--no-optional` flag and BuildKit

### 5. Merge Conflicts in Lockfile

**Problem:** Massive conflicts in pnpm-lock.yaml
**Solution:** Regenerate lockfile instead of manual resolution

## Next Steps

### Short Term (2 weeks)

- [ ] E2E test coverage expansion
- [ ] User profile editing
- [ ] Organization settings page
- [ ] Staging deployment
- [ ] Monitoring setup (Sentry)

### Medium Term (1 month)

- [ ] Schedule templates
- [ ] Conflict detection
- [ ] Notification system
- [ ] Mobile apps
- [ ] Export functionality

### Long Term (Quarter)

- [ ] Multi-organization support
- [ ] AI scheduling optimization
- [ ] Time-off management
- [ ] Shift swap functionality
- [ ] Analytics dashboard

## Resources

### External Links

- **[Firebase Console](https://console.firebase.google.com/)**
- **[GitHub Repository](https://github.com/peteywee/fresh-root)**
- **[Next.js Documentation](https://nextjs.org/docs)**
- **[pnpm Documentation](https://pnpm.io/)**

### Internal Tools

- **MCP Server**: `packages/mcp-server/` - Model Context Protocol tools
- **Repo Agent**: `scripts/agent/` - Automated refactoring agent
- **Seeding Scripts**: `scripts/seed/` - Database seeding

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for:

- Code style guidelines
- PR process
- Commit conventions
- Testing requirements

## License

This project is licensed under the terms specified in the [LICENSE](../LICENSE) file.

---

**Document Version:** 1.0
**Maintained By:** Patrick Craven
**Last Review:** October 31, 2025
**Next Review:** November 15, 2025
