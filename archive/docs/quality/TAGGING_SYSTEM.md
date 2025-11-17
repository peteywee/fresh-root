# File Tagging System

This document describes the semantic tagging system used across the Fresh Schedules codebase. All files include standardized tags in their header comments to enable quick discovery, filtering, and understanding of purpose.

## Tag Format

```typescript
// [PRIORITY][AREA][COMPONENT] Brief description
// Tags: PRIORITY, AREA, COMPONENT, FEATURE1, FEATURE2
```

## Priority Tags

| Tag  | Meaning                       | When to Use                                          |
| ---- | ----------------------------- | ---------------------------------------------------- |
| `P0` | Critical - Production Blocker | Security foundations, authentication, data integrity |
| `P1` | High - Core Functionality     | Observability, backup/restore, type validation       |
| `P2` | Medium - Enhancement          | Performance optimizations, UX improvements           |
| `P3` | Low - Nice-to-Have            | Additional features, convenience utilities           |

## Area Tags

| Tag             | Meaning                        | Files                                        |
| --------------- | ------------------------------ | -------------------------------------------- |
| `SECURITY`      | Security-critical code         | Auth, RBAC, session management, encryption   |
| `RELIABILITY`   | Reliability & resilience       | Logging, monitoring, error tracking, backups |
| `INTEGRITY`     | Data integrity & validation    | Schemas, validators, rules tests             |
| `OBSERVABILITY` | Monitoring & debugging         | Logging, tracing, metrics, Sentry            |
| `API`           | API endpoints & routing        | Express routes, Next.js API routes           |
| `AUTH`          | Authentication & authorization | Session cookies, MFA, Firebase Auth          |
| `RBAC`          | Role-based access control      | Permission checks, role guards               |
| `EDGE`          | Edge security controls         | CORS, headers, rate limiting, body caps      |
| `FIREBASE`      | Firebase integration           | Admin SDK, client SDK, rules                 |
| `TEST`          | Testing code                   | Unit tests, integration tests, E2E tests     |

## Component Tags

| Tag                | Meaning                        | Files                                 |
| ------------------ | ------------------------------ | ------------------------------------- |
| `ENV`              | Environment configuration      | Environment variable validation       |
| `MIDDLEWARE`       | Express/Next.js middleware     | Request/response interceptors         |
| `LOGGING`          | Logging infrastructure         | Structured loggers, log formatters    |
| `SENTRY`           | Sentry error tracking          | Sentry initialization, helpers        |
| `OTEL`             | OpenTelemetry tracing          | Trace exporters, instrumentation      |
| `SESSION`          | Session management             | Cookie verification, token parsing    |
| `MFA`              | Multi-factor authentication    | MFA enforcement, verification         |
| `CORS`             | Cross-origin resource sharing  | CORS allowlist, headers               |
| `HSTS`             | HTTP Strict Transport Security | HSTS headers, HTTPS enforcement       |
| `RATE_LIMIT`       | Rate limiting                  | Request throttling, IP tracking       |
| `VALIDATION`       | Input validation               | Zod schemas, payload validation       |
| `RULES`            | Firebase security rules        | Firestore rules, storage rules        |
| `ADMIN_SDK`        | Firebase Admin SDK             | Server-side Firebase operations       |
| `CLIENT`           | Client-side code               | Browser-only code, web SDK            |
| `NEXTJS`           | Next.js specific               | Next.js pages, API routes, middleware |
| `EXPRESS`          | Express specific               | Express app, routes, middleware       |
| `VITEST`           | Vitest tests                   | Unit tests with Vitest                |
| `TENANT_ISOLATION` | Multi-tenancy                  | Org-level data isolation              |
| `BACKUP`           | Backup operations              | Data export, archival                 |
| `RUNBOOK`          | Operational runbooks           | Recovery procedures, checklists       |
| `SCHEMAS`          | Type definitions               | Zod schemas, TypeScript types         |
| `ERROR_TRACKING`   | Error monitoring               | Exception capture, reporting          |
| `PROFILING`        | Performance profiling          | CPU/memory profiling                  |
| `JSON`             | JSON output/parsing            | Structured JSON logs, API responses   |
| `ENTRYPOINT`       | Application entrypoint         | Main server file, index files         |
| `AUTHORIZATION`    | Authorization logic            | Permission checking, access control   |

## Feature Tags

Additional context-specific tags:

- `OBSERVABILITY` - Monitoring and debugging capabilities
- `JSON` - JSON-related operations
- `PROFILING` - Performance profiling
- `ERROR_TRACKING` - Error capture and reporting
- `TENANT_ISOLATION` - Multi-tenant data separation

## Examples

### Security Middleware

```typescript
// [P0][SECURITY][EDGE] Edge security: headers, CORS allowlist, rate limiting, body size caps
// Tags: P0, SECURITY, EDGE, CORS, HSTS, RATE_LIMIT, MIDDLEWARE
```

### Structured Logger

```typescript
// [P1][RELIABILITY][OBS] Structured JSON logger for production observability
// Tags: P1, RELIABILITY, OBSERVABILITY, LOGGING, JSON
```

### Firestore Rules

```plaintext
// [P1][INTEGRITY][RULES] Firestore security rules for multi-tenant RBAC
// Tags: P1, INTEGRITY, FIRESTORE, RULES, SECURITY, RBAC, TENANT_ISOLATION
```

### Test File

```typescript
// [P0][SECURITY][TEST] Edge security middleware tests (CORS, headers, rate limiting, size caps)
// Tags: P0, SECURITY, TEST, EDGE, VITEST
```

## Tagged Files Inventory

### API Service (`services/api/src/`)

| File             | Priority | Areas       | Components                                       |
| ---------------- | -------- | ----------- | ------------------------------------------------ |
| `env.ts`         | P0       | SECURITY    | ENV, VALIDATION                                  |
| `firebase.ts`    | P0       | SECURITY    | FIREBASE, ADMIN_SDK                              |
| `rbac.ts`        | P0       | SECURITY    | RBAC, AUTHORIZATION, TENANT_ISOLATION            |
| `index.ts`       | P0       | SECURITY    | API, EXPRESS, ENTRYPOINT                         |
| `mw/session.ts`  | P0       | SECURITY    | AUTH, SESSION, MFA, MIDDLEWARE                   |
| `mw/security.ts` | P0       | SECURITY    | EDGE, CORS, HSTS, RATE_LIMIT, MIDDLEWARE         |
| `mw/logger.ts`   | P1       | RELIABILITY | OBSERVABILITY, LOGGING, MIDDLEWARE               |
| `obs/log.ts`     | P1       | RELIABILITY | OBSERVABILITY, LOGGING, JSON                     |
| `obs/sentry.ts`  | P1       | RELIABILITY | OBSERVABILITY, SENTRY, ERROR_TRACKING, PROFILING |

### Tests (`services/api/test/`, `tests/rules/`)

| File                            | Priority | Areas       | Components                       |
| ------------------------------- | -------- | ----------- | -------------------------------- |
| `test/log.test.ts`              | P1       | RELIABILITY | TEST, LOGGING, VITEST            |
| `test/security.test.ts`         | P0       | SECURITY    | TEST, EDGE, VITEST               |
| `test/rbac.test.ts`             | P0       | SECURITY    | TEST, RBAC, VITEST               |
| `tests/rules/firestore.spec.ts` | P1       | INTEGRITY   | TEST, FIRESTORE, RULES, SECURITY |

### Web App (`apps/web/`)

| File                    | Priority | Areas    | Components                      |
| ----------------------- | -------- | -------- | ------------------------------- |
| `lib/firebase-admin.ts` | P0       | SECURITY | FIREBASE, ADMIN_SDK, NEXTJS     |
| `src/lib/env.ts`        | P0       | SECURITY | ENV, VALIDATION, NEXTJS, CLIENT |

### Rules

| File              | Priority | Areas     | Components                                         |
| ----------------- | -------- | --------- | -------------------------------------------------- |
| `firestore.rules` | P1       | INTEGRITY | FIRESTORE, RULES, SECURITY, RBAC, TENANT_ISOLATION |

## Using Tags

### Searching by Priority

```bash
# Find all P0 files
grep -r "// \[P0\]" --include="*.ts" --include="*.js" --include="*.rules"

# Find all P1 reliability work
grep -r "\[P1\]\[RELIABILITY\]" --include="*.ts"
```

### Searching by Area

```bash
# Find all security-related files
grep -r "Tags:.*SECURITY" --include="*.ts" --include="*.js"

# Find all observability files
grep -r "Tags:.*OBSERVABILITY" --include="*.ts"
```

### Searching by Component

```bash
# Find all middleware files
grep -r "Tags:.*MIDDLEWARE" --include="*.ts"

# Find all test files
grep -r "Tags:.*TEST" --include="*.ts"
```

## Tag Maintenance

When creating new files:

1. **Determine priority**: Is this P0 (critical), P1 (core), P2 (enhancement), or P3 (nice-to-have)?
2. **Identify area**: What domain does this belong to (SECURITY, RELIABILITY, INTEGRITY)?
3. **List components**: What specific features/technologies are used?
4. **Write both lines**:
   - Line 1: Bracket format with brief description
   - Line 2: Full tag list for searchability

When modifying files:

- Update tags if the file's purpose significantly changes
- Add new component tags if new features are integrated
- Keep priority and area tags stable unless fundamentally changed

## Benefits

- **Instant context**: See file purpose without reading code
- **Targeted search**: Find all P0 security work instantly
- **Impact analysis**: Identify blast radius of changes
- **Onboarding**: New developers understand structure quickly
- **Audit trails**: Track security-critical vs. enhancement code
- **Dependency mapping**: See what touches auth, logging, etc.
