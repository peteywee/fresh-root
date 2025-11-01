# Fresh Schedules — PROJECT BIBLE (v13, Production-Ready)

**Status:** Authoritative, executable specification for a **server-first, RBAC-secured scheduling platform** with caching, auth, Firestore rules, observability, CI/CD, and zero-downtime releases.  
**Owner:** Patrick (peteywee) • Repo: `peteywee/fresh-root`

---

## Labels

- Priority: **P0** (this document governs all current work until GA)
- Areas: **platform**, **backend**, **frontend**, **security**, **rules**, **observability**, **e2e**, **release**, **ui**, **ux**

> Every issue/PR derived from this Bible must include **Labels, Objective, Scope, Files/Paths, Commands, Acceptance Criteria, Success KPIs, Definition of Done**. Missing any = invalid.

---

## 0) Executive Summary

You are now at **Plan C: Production Hardening**. Version 12 was not production-ready; **v13 is**.  
This Bible is your **single source of truth** to:

1. Reconstruct the app from zero,
2. Execute work in **dependency blocks** (Security → Reliability → Integrity → Experience → Release),
3. Validate with **tests, metrics, and CI/CD gates**,
4. Ship with **Blue/Green** and a documented rollback.

**North Star UX:** From dashboard to a published weekly schedule in **≤ 5 minutes** on a seeded demo org, with performance ≥ Lighthouse 90 and a11y ≥ 95.

---

## 1) Architecture Overview (Top-Down)

### 1.1 High-Level

- **Client (Next.js App Router)**: minimal client logic; uses Firebase Web SDK **only for Auth UX** (sign-in/MFA). All privileged actions call server.
- **Server/API (Express or Next API route layer)**: **source of truth** for data writes. Uses **Firebase Admin SDK** for Firestore, verifies **session cookies**, enforces **RBAC** and **MFA** for privileged roles.
- **Data (Firestore)**: multi-tenant data model with **rules** ensuring tenant isolation. Zod validation at API boundary, rule tests for allow/deny.
- **Cache (optional Redis)**: response & list caching with short TTL (e.g., 30s) to meet p95 latency targets.
- **Observability**: Sentry (errors), OpenTelemetry (traces), JSON logs (reqId/latency). Dashboards + alerting.
- **CI/CD**: build → test (unit/rules/e2e) → Blue/Green deploy → smoke → promote/rollback.
- **Backups**: daily Firestore export; documented **restore drill**.

### 1.2 System Data Flow (Auth-first)

1. User signs in via **Firebase Web SDK** (email/password or provider) and completes **MFA** if privileged.
2. Web calls **/api/session** to mint a **session cookie** (Admin SDK verify).
3. Subsequent requests include cookie → **API verifies** → attaches `userToken { uid, orgId, roles, mfa }`.
4. API validates payloads (**Zod**), checks **RBAC + rules expectations**, writes via **Admin SDK**.
5. Logs and traces emitted; p95 targets monitored; backups scheduled.

---

## 2) Environments & Configuration

### 2.1 Environments

- `dev`: local + emulator-friendly; verbose logs; non-PII debug only.
- `preview`: PR deployments; real auth w/ masked PII; restricted writes.
- `prod`: **session-only auth**, **MFA required** for privileged roles; rate-limits, caps, and WAF headers.

### 2.2 Environment Variables (Fail-Fast)

| Variable                              | Scope  | Required | Notes                                                                    |
| ------------------------------------- | ------ | -------: | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_FIREBASE_API_KEY`        | Web    |      Yes | Firebase Web                                                             |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`    | Web    |      Yes | Firebase Web                                                             |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`     | Web    |      Yes | Firebase Web                                                             |
| `NEXT_PUBLIC_USE_EMULATORS`           | Web    |      Dev | `"true"` enables emulator                                                |
| `SESSION_SECRET`                      | Server |      Dev | Only for local JWT sessions; **prod** uses real Firebase session cookies |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Server |  Prod/CI | Inline service acct JSON (safer for CI than files)                       |
| `SENTRY_DSN`                          | Both   |       No | Error tracking                                                           |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`  | Server |       No | Traces export URL                                                        |
| `REDIS_URL`                           | Server |       No | Optional cache                                                           |
| `CORS_ORIGINS`                        | Server |      Yes | Comma list of allowed origins                                            |
| `FIREBASE_PROJECT_ID`                 | Ops    |      Yes | For backups                                                              |
| `BACKUP_BUCKET`                       | Ops    |      Yes | `gs://bucket`                                                            |

**Policy:** Missing required envs = **fatal** at boot (fail-fast config check).

---

## 3) Dependency Blocks (Critical Path)

### Block 1 — Security Core (P0)

**Goal:** No unauthenticated/unauthorized writes, enforced MFA, hardened edge.

**Scope:**

- Session cookies: create/verify/clear
- Middleware: `requireSession`, `require2FAForManagers`
- Edge controls: Helmet, rate limits, size caps, strict CORS
- Tests: 401/403/happy paths

**Files/Paths:**

- `apps/web/lib/session.ts`
- `services/api/src/mw/session.ts`
- `services/api/src/mw/security.ts`
- `services/api/src/mw/session.guard.test.ts`
- `docs/SECURITY.md`

**Acceptance Criteria:**

- POST without session → **401**
- Privileged without MFA → **403 mfa_required**
- Dev headers **rejected in prod**
- Flood/oversize throttled or **413**

**Success KPIs:** 0 unauthenticated writes; p95 auth < 150ms

**DoD:** CI green; docs updated; env validated

---

### Block 2 — Reliability Core (P1)

**Goal:** Errors visible, latency traced, data safely backed up and restorable.

**Scope:**

- JSON logs (reqId, latencyMs, uid, orgId)
- Sentry init + release tagging
- OTel traces (API→Firestore)
- Daily Firestore export + restore drill runbook

**Files/Paths:**

- `services/api/src/obs/log.ts`
- `services/api/src/obs/sentry.ts`
- `services/api/src/obs/otel.ts`
- `scripts/ops/backup-firestore.sh`
- `docs/runbooks/restore.md`

**Acceptance Criteria:**

- Synthetic error in Sentry with trace
- Traces include DB spans and reqId correlation
- Restore drill completes & checksum verified

**Success KPIs:** MTTR ≤ 30m; backups 100% success

**DoD:** Dashboards + alerts live, scripted backup scheduled

---

### Block 3 — Integrity Core (P1)

**Goal:** Payload correctness and tenant isolation guaranteed.

**Scope:**

- Zod schemas for core entities
- API validators for write routes
- Rules test matrix (allow + ≥3 denials per collection)

**Files/Paths:**

- `packages/types/src/*.ts` (orgs, memberships, positions, schedules, shifts)
- `services/api/src/validators/*.ts`
- `tests/rules/*.test.ts`

**Acceptance Criteria:**

- Invalid payload → **422** (pointer messages)
- Cross-org write/read → **denied**
- Rules suite green, coverage ≥ 85%

**Success KPIs:** 0 policy regressions; coverage maintained

**DoD:** CI green with coverage evidence

---

### Block 4 — Experience Layer (P1)

**Goal:** Sub-5-minute schedule publish with consistent, accessible UI.

**Scope:**

- Tailwind tokens + global styles
- UI primitives (shadcn/ui or custom light primitives)
- Scheduler **Week Grid** (virtualized) with keyboard ops and sticky budget header

**Files/Paths:**

- `apps/web/tailwind.config.ts`
- `apps/web/styles/globals.css`
- `apps/web/components/ui/*`
- `apps/web/components/scheduler/*` (types, grid, virtualizer)

**Acceptance Criteria:**

- Lighthouse **≥ 90** overall, **a11y ≥ 95**
- 1k visible rows ≥ 55 FPS
- Create 10 shifts **< 90s**; publish **≤ 5 min**

**Success KPIs:** TTI ≤ 2.5s; CLS < 0.01

**DoD:** Demo video + metrics attached; no ad-hoc UI remnants

---

### Block 5 — Validation & Release (P1→P2)

**Goal:** Nothing broken ships; deploys are zero-downtime with fast rollback.

**Scope:**

- Playwright happy path (auth → onboarding → org → plan → publish)
- CI gate requires E2E green
- Blue/Green deployment + smoke + rollback script

**Files/Paths:**

- `e2e/playwright/*.spec.ts` & `playwright.config.ts`
- `.github/workflows/deploy.yml`
- `scripts/ops/rollback.sh`

**Acceptance Criteria:**

- 100% critical flow coverage; artifacts on failure
- Smoke green before promotion
- Rollback **< 5 min**

**Success KPIs:** Downtime = 0 min; ≥ 99% deploy success

**DoD:** Verified switchback; tag `v1.0.0-foundation` signed

---

## 4) Firebase Integration (Authoritative)

### 4.1 What We Use

- **Firebase Web SDK (`firebase`)**: **Auth UX only** (sign-in/MFA).
- **Firebase Admin SDK (`firebase-admin`)**: verify session cookies; all privileged Firestore ops.
- **@firebase/rules-unit-testing**: simulate clients and assert allow/deny.
- **firebase-tools** (optional): emulators locally; **prod backups use `gcloud`**.

### 4.2 Client Auth (Web)

`apps/web/lib/firebase-client.ts` (minimal: `initializeApp`, `getAuth`, optional `connectAuthEmulator`).

### 4.3 Session Cookies (Server)

- Web calls `/api/session` to mint session cookie via Admin SDK (preferred in prod).
- Middleware verifies cookie → `req.userToken`.
- Privileged routes check `mfa===true` for `org_owner|admin|manager`.

### 4.4 Rules Testing

- `tests/rules/*.test.ts` covers success + ≥3 denials per sensitive collection (wrong role, cross-org, missing fields).

### 4.5 Backups & Restore

- **Daily** `gcloud firestore export` → `gs://bucket/prefix`.
- Quarterly **restore drill** documented in `docs/runbooks/restore.md`.

---

## 5) Files / Paths (Master Index)

docs/
PROJECT-BIBLE-v13.md # THIS FILE
PLAN-C.md # (optional) roadmap overview
PLAN-C-OVERVIEW.md # narrative plan
SECURITY.md
runbooks/restore.md

scripts/
ops/backup-firestore.sh
ops/rollback.sh
gh-setup-labels.sh

packages/types/
src/orgs.ts
src/memberships.ts
src/positions.ts
src/schedules.ts
src/shifts.ts

services/api/
src/mw/session.ts
src/mw/security.ts
src/mw/session.guard.test.ts
src/obs/log.ts
src/obs/sentry.ts
src/obs/otel.ts
src/validators/\*.ts
src/lib/firebase-admin.ts # singleton Admin init

apps/web/
lib/session.ts
lib/firebase-client.ts
tailwind.config.ts
styles/globals.css
components/ui/_
components/scheduler/_

tests/rules/
\*.test.ts

e2e/playwright/
playwright.config.ts
happy-path.spec.ts

.github/
ISSUE_TEMPLATE/\*.md
workflows/deploy.yml

yaml
Copy code

---

## 6) Command Registry (Deterministic)

```bash
# Bootstrap / install
pnpm install

# Quality gates
pnpm -w lint
pnpm -w typecheck
pnpm -w test         # unit + rules if wired
pnpm -w vitest run   # middleware tests

# E2E
pnpm -w exec playwright test

# Dev / build
pnpm -w dev
pnpm -w build

# Backups (prod)
FIREBASE_PROJECT_ID=<id> BACKUP_BUCKET=gs://<bucket> ./scripts/ops/backup-firestore.sh

# Deploy (Blue/Green workflow; provider-specific wiring inside deploy.yml)
gh workflow run deploy.yml
```
