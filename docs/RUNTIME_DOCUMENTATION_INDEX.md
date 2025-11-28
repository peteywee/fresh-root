# Runtime Documentation Index

**Status:** Production Ready (Score: 130.0, Tier 0/1: 0 violations)  
**Last Updated:** November 28, 2025  
**Branch:** main (production)

---

## Quick Links to Runtime Resources

### 🎯 Production Standards (On Main)

These documents define what's running in production:

- **[Production Readiness Executive Summary](./PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md)** - Quick overview of deployment status
- **[Production Readiness Full Report](./PRODUCTION_READINESS.md)** - Comprehensive analysis of production systems

### 🔍 Development Reference (Cross-Branch)

For developers working on new features:

| Component | Documentation | Branch | Purpose |
|-----------|---------------|--------|---------|
| **Security Standards** | [Tier 0 Fixes](./PHASE_1_TIER_0_FIXES.md) | dev | Security wrapper requirements |
| **Integrity Standards** | [Tier 1 Fixes](./PHASE_2_TIER_1_FIXES.md) | dev | Type safety & Zod patterns |
| **Architecture** | [Symmetry Framework](./standards/SYMMETRY_FRAMEWORK.md) | dev | File layer fingerprints |
| **Patterns** | [Standards Index](./standards/00_STANDARDS_INDEX.md) | dev | Complete standards system |
| **CI/CD** | [Guard Main](../.github/workflows/guard-main.yml) | main | Production gate workflow |

### 📊 Metrics & Scoring

Current production metrics:

```
Pattern Score:        130.0 / 100 (44+ above 90 threshold)
Tier 0 (Security):    0 violations ✅
Tier 1 (Integrity):   0 violations ✅
Tier 2 (Architecture): 0 violations ✅
Tier 3 (Style):       0 violations ✅
TypeScript Errors:    0 ✅
ESLint Errors:        0 ✅
Build Status:         SUCCESS ✅
```

### 🚀 Runtime Components

#### Security (Tier 0 - Production Ready)
- ✅ **6 Protected Endpoints** - All have `withSecurity` wrapper
  - health, healthz, metrics, internal/backup, session, onboarding/admin-form
- ✅ **7 Validated Write Endpoints** - All validate input with Zod
  - auth/mfa/setup, onboarding/*, session/bootstrap

**CI Gate:** Guard-main enforces zero exceptions

#### Integrity (Tier 1 - Production Ready)
- ✅ **4 Schema Files** - All export Zod + z.infer types
  - compliance, links, onboarding types
- ✅ **Type Safety** - Single source of truth for all entities

**CI Gate:** Guard-main enforces zero exceptions

#### Architecture (Tier 2 - Complete)
- ✅ **3 Complete Triads** - Schema ↔ API ↔ Rules alignment
  - Schedule, Organization, Shift

**CI Gate:** Automatically validated

#### Code Quality (TypeScript & ESLint)
- ✅ **Zero Compilation Errors** - All code type-safe
- ✅ **Zero Blocking ESLint Errors** - Code quality enforced
- ✅ **Build Success** - Artifacts verified

**CI Gate:** Guard-main enforces on every PR

---

## How Runtime Docs Link to Development

### Branch Strategy

**main** (production):
- Contains: Working runtime code, production gates, deployment docs
- Read-only access via guard-main.yml (no direct commits)
- Only accepts PRs from dev branch that pass all checks

**dev** (development):
- Contains: Development standards, phase plans, implementation guides
- Writable for feature branches
- All changes vetted by ci-patterns.yml + pr.yml before merge to main

### Documentation Linking

**Developers implementing features should:**

1. Start on **dev** branch
2. Reference implementation docs:
   - Security requirements → [PHASE_1_TIER_0_FIXES.md](./PHASE_1_TIER_0_FIXES.md)
   - Type safety requirements → [PHASE_2_TIER_1_FIXES.md](./PHASE_2_TIER_1_FIXES.md)
   - Architecture requirements → [SYMMETRY_FRAMEWORK.md](./standards/SYMMETRY_FRAMEWORK.md)
3. Create feature branch from dev
4. Follow patterns & run `pnpm lint:patterns`
5. Open PR to dev (triggers ci-patterns.yml + pr.yml)
6. After approval, PR merges to main (auto-creates PR, triggers guard-main.yml)
7. If all checks pass → deployed to production

**For production verification:**

- Check [PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md](./PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md)
- Verify guard-main workflow logs on GitHub
- See what's deployed via commit history on main

---

## CI/CD Workflow Integration

### Files That Link Development to Production

| File | Location | Purpose | Links |
|------|----------|---------|-------|
| guard-main.yml | .github/workflows | Production gate | Links to: 90+ score requirement, Tier 0/1 rules |
| ci-patterns.yml | .github/workflows | Dev validation | Links to: Standards index, phase plans |
| pr.yml | .github/workflows | PR fast-track | Links to: Type requirements, security rules |
| validate-patterns.mjs | scripts | Pattern validator | Links to: All standards documents |

### How to Read the Links

**When CI fails on main:**
1. Check guard-main.yml logs (guards/production-gate)
2. Links point to: dev branch documentation
3. Fix locally following dev documentation
4. Create PR from dev again

**When CI fails on dev:**
1. Check pr.yml or ci-patterns.yml logs
2. Links point to: standards and phase plans
3. Fix following referenced documentation
4. Commit and push to re-trigger

---

## Runtime Verification

### Verify Production Ready

```bash
# On main branch:
git checkout main
FRESH_PATTERNS_MIN_SCORE=90 pnpm lint:patterns
```

Expected output:
```
💎 SCORE: 130.0 points — PERFECT
  🔴 Tier 0 (Security):    0 ✅
  🟠 Tier 1 (Integrity):   0 ✅
```

### Verify Development Standards

```bash
# On dev branch:
git checkout dev
pnpm lint:patterns:verbose
```

Expected output:
```
All patterns and standards compliance visible
See: docs/standards/00_STANDARDS_INDEX.md for interpretation
```

---

## Documentation Map

```
fresh-root/
├── docs/
│   ├── RUNTIME_DOCUMENTATION_INDEX.md (this file) ← START HERE
│   ├── PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md (main branch)
│   ├── PRODUCTION_READINESS.md (main branch)
│   ├── PHASE_1_TIER_0_FIXES.md (dev branch)
│   ├── PHASE_2_TIER_1_FIXES.md (dev branch)
│   ├── PHASE_3_TIER3_CLEANUP.md (dev branch)
│   ├── MIGRATION_ROADMAP.md (dev branch)
│   ├── standards/
│   │   ├── 00_STANDARDS_INDEX.md (dev branch)
│   │   ├── SYMMETRY_FRAMEWORK.md (dev branch)
│   │   └── ...
│   └── ...
├── .github/
│   ├── workflows/
│   │   ├── guard-main.yml ← Production gate
│   │   ├── ci-patterns.yml ← Dev validation
│   │   ├── pr.yml ← PR checks
│   │   └── ...
│   └── agents/
│       ├── OPERATING_AGREEMENT.md (dev branch)
│       ├── COGNITIVE_ARCHITECTURE.md (dev branch)
│       └── ...
└── scripts/
    └── validate-patterns.mjs ← Enforces all standards
```

---

## Key Principles

1. **main branch = Runtime**
   - Only production-ready code
   - Guard-main enforces 90+ score
   - Automatic deployment after PR merge

2. **dev branch = Development**
   - Standards and implementation guides
   - Phase plans and roadmaps
   - Feature branches created from here

3. **Documentation Always Links**
   - CI logs reference appropriate docs
   - Guards on main link to dev standards
   - Standards link to implementation examples

4. **No Runtime Errors to Main**
   - All tests, type checks, validations on dev first
   - guard-main is final gate before production
   - "Green on main" = safe to deploy

---

## Support & Troubleshooting

**Q: Which branch should I check for production docs?**  
A: main branch for production readiness, dev branch for implementation guidance

**Q: Where are the standards defined?**  
A: dev branch - see [docs/standards/00_STANDARDS_INDEX.md](./standards/00_STANDARDS_INDEX.md)

**Q: How do I link from my feature branch to the standards?**  
A: Create PR to dev, which will reference standards automatically via CI

**Q: What if I need to update documentation?**  
A: Update on dev branch, merge to main via normal PR process with guard-main approval

**Q: Where do I check what's currently in production?**  
A: Check main branch commit history and [PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md](./PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md)

---

**Last Updated:** 2025-11-28  
**Maintained By:** FRESH Engine  
**Status:** Production Ready ✅
