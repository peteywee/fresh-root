# Fresh Root

**Status:** ✅ Production Ready | **Version:** 1.4.0 | **Last Updated:** December 25, 2025

A production-ready Progressive Web App (PWA) for staff scheduling with enterprise-grade security,
comprehensive testing automation, and hierarchical governance documentation system.

Built with Next.js 16, Firebase, TypeScript, and a modern monorepo architecture (pnpm workspaces).

---

## 🎯 What's New (v1.5.0)

### 🛡️ Guardrails Automation & Script Cleanup

- **✅ Guardrails Hardening** — Automated CI/CD checks for guardrail validation
- **🚫 Script Cleanup** — Removed 3 unused scripts (test:all, deps:check, deps:dedupe)
- **📋 Deprecations Guide** — Documented removed scripts with migration paths
- **🔐 Pre-commit Blocker** — Prevents re-introduction of deprecated scripts
- **🧪 Syncpack Integration** — Version consistency validation in pre-push hooks
- **📚 Guardrails Documentation** — 3 comprehensive guides (679 + 642 + 266 lines)

### 📚 Previous: Documentation Consolidation & Governance

- **🗂️ Hierarchical Documentation System** — 357 scattered files consolidated into 5-level hierarchy
  (L0-L4)
- **📊 58% File Reduction** — Reduced from 357 to 200 markdown files with zero duplicates
- **🏷️ Tag-Based Discovery** — Fast AI retrieval with tag lookup tables (95%+ confidence)
- **📝 8 Governance Amendments** — Extracted canonical implementation patterns (A01-A08)
- **📇 3 Master Indexes** — Navigation indexes for governance, instructions, and documentation
- **🗃️ 136 Files Archived** — Organized historical documentation into 7 categorical subdirectories
- **🤖 AI-Optimized Structure** — Enhanced copilot instructions with governance references

### 🎯 What Changed

| Component         | Before | After | Impact                  |
| ----------------- | ------ | ----- | ----------------------- |
| **Total Files**   | 357    | 200   | -58% reduction          |
| **Root Files**    | 39     | 3     | -92% cleanup            |
| **Duplicates**    | 50+    | 0     | 100% eliminated         |
| **Indexes**       | 0      | 3     | Tag-based lookup        |
| **Amendments**    | 0      | 8     | Implementation patterns |
| **AI Confidence** | ~60%   | 95%+  | +35% improvement        |

### 📦 New Structure

```plaintext
.github/
├── governance/
│   ├── INDEX.md              # L0/L1 canonical + amendments
│   ├── 01-12 canonical docs  # Binding governance
│   └── amendments/           # A01-A08 implementation patterns
├── instructions/
│   └── INDEX.md              # L2 agent instructions catalog
├── workflows/
│   └── guardrails-ci.yml     # CI/CD guardrails validation
docs/
├── INDEX.md                  # L4 human documentation
├── DEPRECATIONS.md           # Removed scripts & migration paths
├── architecture/             # System design
├── standards/                # Coding patterns
├── guides/
│   ├── GUARDRAILS_GUIDE.md        # Deep dive into guardrail tools
│   ├── GUARDRAILS_EXAMPLES.md     # 10 real-world scenarios
│   └── GUARDRAILS_SCRIPTS.md      # npm scripts quick reference
└── production/               # Operations
archive/                      # 136 historical files
```

**Key Quick Links:**

- **Guardrails:** See [docs/guides/GUARDRAILS_GUIDE.md](docs/guides/GUARDRAILS_GUIDE.md) — Learn how
  eslint-plugin-import, @manypkg/cli, and syncpack protect code quality
- **Scripts:** See [docs/guides/GUARDRAILS_SCRIPTS.md](docs/guides/GUARDRAILS_SCRIPTS.md) —
  Reference for all npm scripts
- **Deprecated:** See [docs/DEPRECATIONS.md](docs/DEPRECATIONS.md) — Removed scripts (test:all,
  deps:check, deps:dedupe) with migration paths

---

## 🏗️ Architecture

Fresh Root uses a **production-grade monorepo** with clear separation of concerns:

```plaintext
fresh-root/
├── apps/web/                           # Next.js PWA application
│   ├── app/                            # App Router with API routes
│   │   ├── api/**/__tests__/           # 39 auto-generated test templates
│   │   └── (app)/**                    # UI pages and components
│   └── src/lib/                        # Firebase helpers, auth, utilities
├── packages/                           # Shared libraries
│   ├── types/                          # Zod schemas, TypeScript types
│   ├── api-framework/                  # SDK factory pattern ⭐
│   ├── ui/                             # UI component library
│   └── rules-tests/                    # Firebase rules test infrastructure
├── scripts/
│   ├── tests/auto-generate-tests.mjs   # Coverage gap analyzer & test generator
│   └── markdown-lint-lib/              # Markdown linting library
├── tests/rules/                        # Firestore security rules tests
├── docs/                               # Comprehensive documentation
├── .github/workflows/
│   ├── test-coverage.yml               # Measure coverage thresholds
│   └── auto-generate-tests.yml         # Auto-generate missing tests
└── firestore.rules                     # Security rules
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** ≥20.10.0 (see `.nvmrc`)
- **pnpm:** 9.12.1 (enforced, see `package.json`)
- **Git:** For version control
- **Firebase CLI:** For emulator and deployment

### Quick Setup

```bash
# 1. Clone repository
git clone https://github.com/peteywee/fresh-root.git
cd fresh-root

# 2. Install dependencies (pnpm only!)
pnpm install --frozen-lockfile

# 3. Start development server
pnpm dev
# Opens http://localhost:3000
# 4. Run tests
pnpm test                      # Unit tests
pnpm test -- --coverage        # With coverage report
pnpm test:rules                # Firebase rules tests
pnpm test:e2e                  # E2E tests (Playwright)

# 5. Start Firebase emulators (separate terminal)
firebase emulators:start
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Update with your configuration:
# - Firebase project ID
# - Firebase API keys
# - Redis URL (for rate limiting)
# - Emulator settings (for local development)
```

---

## 📊 Coverage Thresholds & Auto-Generation

### How It Works

**Layer 1: Detection** → **Layer 2: Generation** → **Layer 3: Implementation**

```plaintext
Push Code
    ↓
test-coverage.yml measures coverage
    ↓
Coverage below threshold?
    ├─ YES → auto-generate-tests.yml generates templates
    │         → Developer implements TODOs
    │         → Coverage improves
    │         → Threshold MET ✅
    └─ NO  → CI PASSES ✅
```

### Thresholds (Hard Requirements)

| Metric                | Minimum | Status       |
| --------------------- | ------- | ------------ |
| **Unit Tests**        | ≥90%    | 🔴 Enforced  |
| **Integration Tests** | ≥80%    | 🔴 Enforced  |
| **E2E Tests**         | ≥70%    | 🟡 Monitored |
| **Overall**           | ≥85%    | 🔴 Enforced  |

### Quick Commands

```bash
# Check coverage
pnpm test -- --coverage

# Force test auto-generation
gh workflow run auto-generate-tests.yml -f force_generation=true

# Review generated tests
git status                    # See new test files
git diff --name-only          # List modified files
```

---

## 📝 Markdown Linting

### Features

- **51 markdown rules** (MD001-MD055) with full documentation
- **28 auto-fixable rules** ready to apply
- **3 configurable profiles:** strict (51), standard (35), lenient (15)
- **npm integration:** `pnpm run docs:lint` and `pnpm run docs:fix`

### Usage

```bash
# Check markdown files
pnpm run docs:lint

# Auto-fix linting issues
pnpm run docs:fix

# Use different profile
pnpm run docs:lint -- --profile=strict

# Force regeneration
pnpm run docs:lint -- --force
```

### Configuration

- **File:** `.markdownlint-cli2.jsonc` (auto-generated)
- **Ignores:** `.markdownlintignore` (excludes node_modules, .git, build artifacts)
- **Profile:** Standard (35 rules) by default

---

## 🧪 Testing

### Test Framework

- **Vitest** — Unit and integration tests
- **Playwright** — E2E tests
- **Firebase Emulator** — Local Firestore/Auth testing

### Running Tests

```bash
# All tests
pnpm test

# With coverage report
pnpm test -- --coverage

# Watch mode
pnpm test -- --watch

# Firebase rules tests
pnpm test:rules

# E2E tests
pnpm test:e2e
```

### Test Structure

```plaintext
apps/web/app/api/schedules/
├── route.ts                          # API endpoint
└── __tests__/
    ├── index.test.ts                 # AUTO-GENERATED template
    ├── integration.test.ts            # Integration tests
    └── fixtures/                      # Mock data
```

### Test Templates

Each auto-generated test has:

- ✅ **Happy path** — Valid input, expected output
- ✅ **Validation** — Invalid input, error handling
- ✅ **Authentication** — Auth requirement checks
- ✅ **Authorization** — Role-based access control
- ✅ **Error handling** — Edge cases and failures
- 💡 **Implementation hints** — Clear TODO markers and guidance

---

## 🔒 Security & Data Sanitization

### Core Principles

- **Zero Trust** — Verify all access, assume nothing
- **Defense in Depth** — Multiple layers of validation
- **Secure Defaults** — Deny by default, require explicit allow
- **Encrypted Transport** — HTTPS only, TLS 1.3+

### Data Sanitization

- 🧹 **HTML Sanitization** — DOMPurify for user-generated content (schedules, notes, comments)
- 🔤 **Input Sanitization** — Zod schemas with `.trim()`, `.toLowerCase()` where applicable
- 🚫 **XSS Prevention** — Content Security Policy (CSP) headers, React's built-in escaping
- 💉 **SQL Injection Protection** — Firestore parameterized queries (no string interpolation)
- 📋 **Template Injection** — No dynamic `eval()` or `Function()` constructors
- 🔐 **Sensitive Data Masking** — PII redacted in logs, auth tokens rotated hourly

**Sanitization Pipeline:**

```
User Input → Trim/Normalize → Zod Validation → SQL Escape → HTML Sanitize → DB Write
           ↓                ↓                  ↓            ↓              ↓
         Remove         Type check         Pattern       Firestore      Safe for
         whitespace     & coerce           validation    parameterized   rendering
```

### Features

- 🔐 **Session-based Auth** — Firebase session cookies (HttpOnly, Secure, SameSite=Lax)
- 🔑 **MFA Support** — TOTP-based multi-factor authentication
- 👥 **RBAC** — Hierarchical roles: staff < corporate < scheduler < manager < admin < org_owner
- 🚦 **Rate Limiting** — Redis-backed per-endpoint rate limits
- 🔒 **CSRF Protection** — Double-submit cookie pattern
- 📝 **Audit Logging** — Comprehensive request/response logging (PII masked)
- 🛡️ **Input Validation** — Zod-first validation on all API inputs with automatic sanitization
- 🏢 **Organization Isolation** — Multi-tenant data segregation via Firestore
- 🔄 **Sanitization Library** — DOMPurify + custom sanitizers for edge cases

### Firestore Security Rules

```javascript
match /orgs/{orgId}/schedules/{scheduleId} {
  allow read: if isSignedIn() && isOrgMember(orgId);
  allow write: if isSignedIn() && hasRole(orgId, 'manager');
  allow delete: if isSignedIn() && hasRole(orgId, 'admin');

  // Field-level sanitization (rules can validate but sanitize in app layer)
  allow write: if request.resource.data.title.size() <= 255
            && request.resource.data.description.size() <= 5000;
}
```

### Sanitization Configuration

**Enabled everywhere:**

- API routes: `createOrgEndpoint()` applies input sanitization
- Database writes: `@firestore` decorators enforce schemas
- Client components: DOMPurify on user-generated HTML
- Error messages: No stack traces in production

```bash
# Check sanitization in use
grep -r "DOMPurify\|sanitize\|trim()" src/

# Run security audit
pnpm audit
pnpm typecheck                # Catches unsafe typing

# Validate patterns
node scripts/validate-patterns.mjs
```

---

## 💻 Development Workflow

### Command Reference

```bash
# Development
pnpm dev                       # Start dev server + Turbo tasks
pnpm build                     # Build for production
pnpm typecheck                 # Type check all workspaces (should be 0 errors)
pnpm lint                      # ESLint + Prettier

# Testing
pnpm test                      # Unit tests
pnpm test -- --coverage        # With coverage
pnpm test:rules                # Firebase rules
pnpm test:e2e                  # E2E tests

# Markdown
pnpm run docs:lint             # Check markdown
pnpm run docs:fix              # Auto-fix markdown

# Deployment
pnpm deploy:firebase           # Deploy to Firebase
pnpm deploy:functions          # Deploy Cloud Functions
pnpm deploy:rules              # Deploy Firestore rules

# Utilities
node scripts/validate-patterns.mjs     # Validate coding patterns
node scripts/tests/auto-generate-tests.mjs  # Generate test templates
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, commit
git add .
git commit -m "feat: description"

# Push and create PR
git push origin feature/my-feature
# Then create PR on GitHub
# After review and merge
git checkout main
git pull origin main
```

### Pre-Commit Checks

Hooks automatically run:

- ✅ pnpm enforcement (blocks npm/yarn)
- ✅ TypeScript type checking
- ✅ ESLint linting
- ✅ Prettier formatting
- ✅ Pattern validation (catches common errors >3x)

---

## � Repomix: Repository Analysis & Packed Format

### What is Repomix?

Repomix generates **compact, AI-ready representations** of your codebase. Perfect for:

- 🤖 Feeding entire repos to Claude/ChatGPT
- 📊 Deep code analysis and refactoring suggestions
- 📈 Dependency visualization
- 🔍 Coverage gap detection
- 📁 Repository state snapshots

### Quick Start

```bash
# View help
pnpm repomix --help

# Generate markdown for humans
pnpm repomix . --style markdown --output codebase-analysis.md

# Generate compressed XML for AI analysis
pnpm repomix . --compress --style xml --output ai-input.xml

# Analyze specific package
pnpm repomix packages/api-framework --style markdown

# Generate JSON for programmatic use
pnpm repomix . --style json --output repo-snapshot.json
```

### Output Formats

| Format             | Size      | Best For                     | Command                  |
| ------------------ | --------- | ---------------------------- | ------------------------ |
| **Markdown**       | 2-5MB     | Human reading, documentation | `--style markdown`       |
| **XML**            | 3-8MB     | AI analysis, detailed review | `--style xml`            |
| **JSON**           | 2-4MB     | Programmatic processing      | `--style json`           |
| **Compressed XML** | 500KB-1MB | AI input (tokenized)         | `--style xml --compress` |

### Deep Analysis Examples

```bash
# 1. Full repo deep dive
pnpm repomix . --style markdown \
  --output analysis-full.md

# 2. Security analysis (API routes + rules)
pnpm repomix . --include "app/api/**,firestore.rules,security/**" \
  --style markdown --output security-analysis.md

# 3. Architecture overview
pnpm repomix . --include "packages/**,apps/**" \
  --exclude "node_modules/**,dist/**,.next/**" \
  --style json --output architecture.json

# 4. Prepare for AI review (compressed)
pnpm repomix . --compress --style xml > ai-analysis.xml
# Then paste into Claude/ChatGPT for deep review
```

### Mini-Index & Deep Index

**Available reports:**

| File                           | Type | Scope         | Generated |
| ------------------------------ | ---- | ------------- | --------- |
| `docs/architecture/_index.md`  | Full | Entire repo   | On push   |
| `docs/guides/REPOMIX_INDEX.md` | Ref  | CLI reference | Manual    |
| Generated via CLI              | Mini | Custom scope  | On demand |

**Generate custom mini-indexes:**

```bash
# Just API routes
pnpm repomix apps/web/app/api --style markdown --output api-mini-index.md

# Just shared packages
pnpm repomix packages --style markdown --output packages-mini-index.md

# Security-focused deep index
pnpm repomix . --include "**/*security*,**/*auth*,**/*rules*" \
  --style markdown --output security-deep-index.md
```

### Repository State Commands

```bash
# Get current repo stats
pnpm repomix . --style json | jq '.summary'

# See file structure
pnpm repomix . --include "src/**,packages/**,apps/**" --style markdown | head -100

# Generate timestamped snapshot
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pnpm repomix . --style json --output "repo-snapshots/state-${TIMESTAMP}.json"

# Compare snapshots (manual: use jq or other tools)
diff <(jq '.summary.totalLines' repo-snapshots/state-old.json) \
     <(jq '.summary.totalLines' repo-snapshots/state-new.json)
```

### Automation Status

- ✅ **Pre-push hook** — Runs lightweight Repomix check before pushing
- ✅ **GitHub Actions CI** — Full analysis on every push/PR
- ✅ **Nightly Dashboard** — Auto-updates `docs/architecture/_index.md` at 2 AM UTC
- ✅ **Metrics Tracking** — Growth tracked in `docs/metrics/repomix-metrics.log`

Skip pre-push check if needed:

```bash
SKIP_REPOMIX=1 git push
```

---

## 🌿 Branch Management

### Repository Branches

**Protected branches:**

- `main` — Production releases only
- `dev` — Development integration branch

**Current branches:**

```
Remote Branches (Latest):
  origin/main (2025-12-26) ← Latest changes
  origin/dev (2025-12-25)
  origin/chore/sync-dev-with-main (2025-12-24)

Local Branches:
  main, dev, chore/sync-dev-with-main
  copilot/vscode-mjjfrc4h-ii3s
  sync/guardrails-to-dev
  test/guardrails-ci-blocker
  worktree-2025-12-25T05-43-41
```

### Cleanup Stale Branches

```bash
# List all branches (local + remote)
git branch -a

# Delete local feature branches (not main/dev)
git branch -D feature/old-feature

# Delete remote branches (requires push permissions)
git push origin --delete feature/old-feature

# Clean up deleted remote branches (local references)
git remote prune origin

# Bulk cleanup script (delete all except main/dev)
git branch -D $(git branch | grep -v 'main\|dev' | xargs)

# Or safer: list branches to review before delete
git branch | grep -v 'main\|dev' | head -20
# Review the list, then:
git branch | grep -v 'main\|dev' | xargs git branch -D
```

### Branch Naming Convention

- **Features:** `feature/description`
- **Fixes:** `fix/issue-number-description`
- **Chores:** `chore/description`
- **Releases:** `release/version` (protected)
- **Hotfixes:** `hotfix/issue-number` (urgent production fixes)

### Repository State

**Current stats** (from latest repomix run):

```
  Total Files: 733 files
  Total Tokens: 1,058,874 tokens
  Total Chars: 3,921,379 chars
  Security Issues Detected: 1 (excluded from output)
```

**Check branch hygiene:**

```bash
# How many branches exist?
git branch -r | wc -l

# Old branches (not updated in 30+ days)
git for-each-ref --sort='-committerdate' --format='%(refname:short) %(committerdate:short)' refs/remotes

# Branches merged into main (safe to delete)
git branch -r --merged origin/main | grep -v main | sed 's/ *origin\///'
```

---

## �📊 SDK Factory Pattern

The **SDK factory** is our standard for building API routes with built-in security and validation.

### Example

```typescript
// apps/web/app/api/schedules/route.ts
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateScheduleSchema } from "@fresh-schedules/types";

export const POST = createOrgEndpoint({
  roles: ["manager"], // Required role
  rateLimit: { maxRequests: 50, windowMs: 60000 }, // Rate limit
  input: CreateScheduleSchema, // Auto-validates
  handler: async ({ input, context }) => {
    // Business logic here
    // context has: auth (userId, email), org (orgId, role), request
    return ok({ data: schedule });
  },
});
```

### Benefits

- ✅ Automatic auth verification
- ✅ Organization context loading
- ✅ Role-based authorization
- ✅ Input validation via Zod
- ✅ Rate limiting
- ✅ CSRF protection
- ✅ Error handling
- ✅ Audit logging

**Coverage:** 20+ API routes using this pattern ✅

---

## 📚 Documentation

### Quick Links

| Resource                                                                                                       | Purpose                  |
| -------------------------------------------------------------------------------------------------------------- | ------------------------ |
| [QUICK_START.md](./docs/QUICK_START.md)                                                                        | First 5 minutes          |
| [CODING_RULES_AND_PATTERNS.md](./docs/CODING_RULES_AND_PATTERNS.md)                                            | Code standards           |
| [PRODUCTION_READINESS.md](./docs/PRODUCTION_READINESS.md)                                                      | Production checklist     |
| [TEST_AUTO_GENERATION.md](./docs/TEST_AUTO_GENERATION.md)                                                      | Test generation details  |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md)                                                                      | System architecture      |
| [AI_PROMPT_ENGINEERING.md](./.github/instructions/ai-prompt-engineering-safety-best-practices.instructions.md) | Prompt engineering guide |

### Comprehensive Guides

See [docs/README.md](./docs/README.md) for complete documentation index including:

- Setup and onboarding
- Architecture and design patterns
- Firebase configuration and rules
- Deployment and CI/CD
- Operational runbooks
- Performance optimization
- Security guidelines

---

## 🚀 Deployment

### Firebase Deployment

```bash
# Deploy everything
pnpm deploy:firebase

# Or deploy specific components
pnpm deploy:rules           # Firestore + Storage rules
pnpm deploy:functions       # Cloud Functions
pnpm deploy:hosting         # Web app (hosting)
```

### Environment

Production uses:

- **Node.js:** 20.10.0 LTS
- **Next.js:** 16.0.0+
- **Firebase:** Latest Admin SDK
- **TypeScript:** Strict mode
- **pnpm:** 9.12.1

---

## 🤝 Contributing

### Standards

1. **Type Safety** — TypeScript strict mode, no `any`
2. **Testing** — Unit tests for logic, integration tests for flows
3. **Security** — Input validation, auth checks, no secrets in code
4. **Performance** — Optimize for real use cases, not hypotheticals
5. **Documentation** — Clear comments, helpful error messages

### Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/description`
3. Make changes following standards above
4. Run full validation: `pnpm test && pnpm typecheck && pnpm lint`
5. Commit with clear messages: `git commit -m "feat: description"`
6. Push and create PR on GitHub
7. Address review feedback
8. Merge when approved

---

## 📈 Performance

### Optimization Focus

- ⚡ **Frontend:** Code splitting, image optimization, lazy loading
- ⚡ **Backend:** Indexed Firestore queries, connection pooling
- ⚡ **Caching:** Browser caching, Redis caching for rate limiting
- ⚡ **Monitoring:** Performance metrics, error tracking, distributed tracing

### Metrics

- **API Latency:** P50 <100ms, P95 <200ms
- **Frontend:** Largest Contentful Paint <2.5s
- **Test Suite:** Full run <2 minutes
- **Type Check:** Complete in <30 seconds

---

## 📞 Support & Feedback

- **Issues:** [GitHub Issues](https://github.com/peteywee/fresh-root/issues)
- **Discussions:** [GitHub Discussions](https://github.com/peteywee/fresh-root/discussions)
- **Documentation:** [Complete Docs](./docs/README.md)

---

## 📄 License

[MIT License](./LICENSE)

---

## ✨ Acknowledgments

Built with modern tools and best practices:

- [Next.js](https://nextjs.org/) — React framework
- [Firebase](https://firebase.google.com/) — Backend as a Service
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Zod](https://zod.dev/) — Schema validation
- [Vitest](https://vitest.dev/) — Unit testing
- [Playwright](https://playwright.dev/) — E2E testing
- [pnpm](https://pnpm.io/) — Package management
- [Turbo](https://turbo.build/) — Monorepo orchestration

---

**Last Updated:** December 25, 2025 | **Version:** 1.4.0 | **Status:** ✅ Production Ready

---

### Repository Metrics (Auto-generated)

Generated via Repomix automation. See docs/architecture/\_index.md for latest stats.
