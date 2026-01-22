---

goal: "Complete 41 Production Gaps with Individual Team Assignments & Visual Timeline"
version: "4.0"
date\_created: "2025-12-18"
last\_updated: "2025-12-18"
owner: "Orchestrator (PM)"
status: "In progress"
## tags: \["feature", "architecture", "migration", "production-readiness"]

# Fresh Schedules: Complete Implementation Plan v4
![Status: In Progress](https://img.shields.io/badge/status-In%20Progress-yellow)
![Teams: 5](https://img.shields.io/badge/teams-5-blue)
![Tasks: 45](https://img.shields.io/badge/tasks-45-green)
![Days: 9](https://img.shields.io/badge/duration-9%20days-orange)

> **Version**: 4.0\
> **Created**: 2025-12-18\
> **Target**: Close 41 production gaps across 6 work streams\
> **Confidence Level**: 99%

---

## 1. Requirements & Constraints

### Requirements

- **REQ-001**: All 41 identified gaps must be closed before production deployment
- **REQ-002**: Pattern validation score must reach ≥95 (currently ~85)
- **REQ-003**: Zero TypeScript compilation errors (`pnpm typecheck`)
- **REQ-004**: E2E golden path test must pass 100%
- **REQ-005**: Security Red Team must approve all auth-related changes
- **SEC-001**: OWASP Top 10 compliance verified
- **SEC-002**: No secrets in codebase, all from environment variables
- **SEC-003**: Firestore rules must pass all security tests

### Constraints

- **CON-001**: Must use existing SDK factory pattern (no new frameworks)
- **CON-002**: Must maintain backward compatibility with existing API consumers
- **CON-003**: Must complete within 9 working days
- **CON-004**: Teams work 6h productive hours per day

### Guidelines

- **GUD-001**: Follow Triad of Trust (Schema + API + Firestore Rules)
- **GUD-002**: All PRs require typecheck + lint + tests before merge
- **GUD-003**: Feature flags for risky features
- **PAT-001**: SDK factory pattern for all API routes
- **PAT-002**: Zod-first validation at all boundaries

---

## 2. Team Structure & Individual Duties

### 🔷 Team Roster

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRESH SCHEDULES v4                              │
│                      IMPLEMENTATION WAR ROOM                            │
├─────────────────────────────────────────────────────────────────────────┤
│  ORCHESTRATOR (PM)                                                      │
│  └── Coordination, gate reviews, escalation, communication             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ ALPHA TEAM   │  │ BRAVO TEAM   │  │ CHARLIE TEAM │  │ SECURITY    │ │
│  │ (Backend)    │  │ (Frontend)   │  │ (Quality)    │  │ RED TEAM    │ │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├─────────────┤ │
│  │ Alpha-1: SR  │  │ Bravo-1: SR  │  │ Charlie: QA  │  │ SecRed: SEC │ │
│  │ Alpha-2: MID │  │ Bravo-2: MID │  │              │  │             │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                         │
│  LEGEND: SR = Senior, MID = Mid-level, QA = QA Lead, SEC = Security    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 👤 Individual Duty Assignments

| Person           | Role            | Responsibility                                      | Streams | Daily Hours |
| ---------------- | --------------- | --------------------------------------------------- | ------- | ----------- |
| **Orchestrator** | PM              | Coordination, standups, gate reviews, escalation    | All     | 4h          |
| **Alpha-1**      | Senior Backend  | Auth chain, data persistence, API core routes       | A, B, D | 6h          |
| **Alpha-2**      | Mid Backend     | Token validation, secondary API routes, joins       | A, B, D | 6h          |
| **Bravo-1**      | Senior Frontend | Header, navigation, schedule builder, UI polish     | C, F    | 6h          |
| **Bravo-2**      | Mid Frontend    | Profile, context, file upload, error handling       | C, F    | 6h          |
| **Charlie**      | QA Lead         | Type safety, schema creation, E2E tests, validation | E, QA   | 6h          |
| **SecRed**       | Security Lead   | Code review, auth audit, OWASP check, sign-off      | All     | 4h          |

### 📋 Individual Task Ownership Matrix

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                          TASK OWNERSHIP MATRIX                                │
├───────────┬───────────────────────────────────────────────────────────────────┤
│ ALPHA-1   │ A1, A2, B1, B2, B5, D1, D2, D5, D6, F1                           │
│           │ Focus: Auth core, Firestore writes, rules, core API               │
├───────────┼───────────────────────────────────────────────────────────────────┤
│ ALPHA-2   │ A3, A4, A5, B3, B4, D3, D4, D7, D8                                │
│           │ Focus: Cookies, tokens, membership, CRUD APIs                     │
├───────────┼───────────────────────────────────────────────────────────────────┤
│ BRAVO-1   │ C1, C2, C5, F2, F4, F6                                            │
│           │ Focus: Navigation, builder, loading states, accessibility         │
├───────────┼───────────────────────────────────────────────────────────────────┤
│ BRAVO-2   │ C3, C4, F3, F5, F7                                                │
│           │ Focus: Profile, context, file upload, error boundaries            │
├───────────┼───────────────────────────────────────────────────────────────────┤
│ CHARLIE   │ P0.1-P0.3, E1-E8, F8                                              │
│           │ Focus: Prerequisites, type safety, schemas, E2E                   │
├───────────┼───────────────────────────────────────────────────────────────────┤
│ SECRED    │ Review: A1, A5, B*, D*, F1                                        │
│           │ Focus: Auth code, data access, publish, final audit               │
└───────────┴───────────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Phases

### Phase 0: Prerequisites (Day 0)

- **GOAL-P0**: Establish infrastructure for safe feature rollout and E2E testing

| Task | Description                                                          | Owner   | Est. | Accept Criteria                   | Completed | Date |
| ---- | -------------------------------------------------------------------- | ------- | ---- | --------------------------------- | --------- | ---- |
| P0.1 | Create feature flags infrastructure (`apps/web/src/lib/features.ts`) | Charlie | 30m  | File exists, flags parseable      |           |      |
| P0.2 | E2E OAuth mock setup with Firebase emulator                          | Charlie | 45m  | Test user can authenticate in E2E |           |      |
| P0.3 | CI emulator configuration in GitHub Actions                          | Charlie | 45m  | CI workflow starts emulators      |           |      |

**Checkpoint**:

- \[ ] Feature flags file exists and exports `FLAGS` object
- \[ ] E2E auth fixture works locally
- \[ ] CI emulator config validated
- \[ ] All team members briefed

---

### Phase 1: Auth Chain (Days 1-2)

- **GOAL-A**: Complete authentication pipeline from Firebase to session

| Task | Description                                       | Owner   | Est. | Accept Criteria                             | Completed | Date |
| ---- | ------------------------------------------------- | ------- | ---- | ------------------------------------------- | --------- | ---- |
| A1   | Wire `useAuth()` to Firebase `onAuthStateChanged` | Alpha-1 | 2h   | Firebase user in React context              |           |      |
| A2   | Wire `proxy()` to middleware for route protection | Alpha-1 | 1.5h | Unauthenticated redirects to `/login`       |           |      |
| A3   | Set `orgId` cookie on org creation/selection      | Alpha-2 | 2h   | Cookie visible in DevTools after org create |           |      |
| A4   | Validate invite tokens in join flow               | Alpha-2 | 2h   | Invalid tokens return 400 error             |           |      |
| A5   | Create membership document on join                | Alpha-2 | 1.5h | Membership doc exists in Firestore          |           |      |

**Gate 1 Checkpoint** (End of Day 2):

- \[ ] All A1-A5 PRs merged
- \[ ] Login/logout works locally
- \[ ] `orgId` cookie visible after org creation
- \[ ] SecRed review approved

---

### Phase 2: Data Persistence (Days 2-3)

- **GOAL-B**: All onboarding flows write to Firestore

| Task | Description                                           | Owner   | Est. | Accept Criteria                      | Completed | Date |
| ---- | ----------------------------------------------------- | ------- | ---- | ------------------------------------ | --------- | ---- |
| B1   | `create-network-org` writes org document to Firestore | Alpha-1 | 3h   | Org doc visible in emulator UI       |           |      |
| B2   | Create membership document for org creator            | Alpha-1 | 1.5h | Membership doc with `org_owner` role |           |      |
| B3   | `create-corporate` writes network document            | Alpha-2 | 2h   | Network doc visible in emulator      |           |      |
| B4   | `join-with-token` marks token as consumed             | Alpha-2 | 1.5h | Token `used: true` in Firestore      |           |      |
| B5   | Write and run Firestore security rules tests          | Alpha-1 | 2h   | `pnpm test:rules` passes             |           |      |

**Gate 2 Checkpoint** (End of Day 3):

- \[ ] All B1-B5 PRs merged
- \[ ] Rules tests pass: `pnpm test:rules`
- \[ ] Org and membership docs visible in emulator
- \[ ] SecRed review approved

---

### Phase 3: UX Completion (Days 3-4)

- **GOAL-C**: Complete navigation, profile, and context infrastructure

| Task | Description                         | Owner   | Est. | Accept Criteria                      | Completed | Date |
| ---- | ----------------------------------- | ------- | ---- | ------------------------------------ | --------- | ---- |
| C1   | Header component with logout button | Bravo-1 | 2h   | Logout clears session and redirects  |           |      |
| C2   | Sidebar navigation with all routes  | Bravo-1 | 2h   | All `/app/*` routes accessible       |           |      |
| C3   | Profile page persists to Firestore  | Bravo-2 | 2h   | Profile data survives page refresh   |           |      |
| C4   | `OrgContext` reads from cookie      | Bravo-2 | 2h   | `useOrg()` returns orgId in `/app/*` |           |      |
| C5   | Fix Content Security Policy errors  | Bravo-1 | 1h   | Zero CSP errors in browser console   |           |      |

**Gate 3 Checkpoint** (End of Day 4):

- \[ ] All C1-C5 PRs merged
- \[ ] Navigation works end-to-end
- \[ ] Profile saves and persists
- \[ ] No CSP errors

---

### Phase 4: API Migration (Days 4-5)

- **GOAL-D**: Replace all mock data with Firestore reads

| Task | Collection                        | Owner   | Est. | Accept Criteria       | Completed | Date |
| ---- | --------------------------------- | ------- | ---- | --------------------- | --------- | ---- |
| D1   | `orgs/{o}/attendance` → Firestore | Alpha-1 | 1.5h | GET returns real data |           |      |
| D2   | `orgs/{o}/positions` → Firestore  | Alpha-1 | 1.5h | GET returns real data |           |      |
| D3   | `orgs/{o}/schedules` → Firestore  | Alpha-2 | 2h   | Full CRUD works       |           |      |
| D4   | `orgs/{o}/.../shifts` → Firestore | Alpha-2 | 2h   | Full CRUD works       |           |      |
| D5   | `orgs/{o}/venues` → Firestore     | Alpha-1 | 1.5h | GET returns real data |           |      |
| D6   | `orgs/{o}/zones` → Firestore      | Alpha-1 | 1.5h | GET returns real data |           |      |
| D7   | `widgets` → Firestore             | Alpha-2 | 1h   | GET returns real data |           |      |
| D8   | `users/{uid}` profile → Firestore | Alpha-2 | 1.5h | GET/POST works        |           |      |

**Gate 4 Checkpoint** (End of Day 5):

- \[ ] All D1-D8 PRs merged
- \[ ] `grep -r "mock" apps/web/app/api` returns 0 matches
- \[ ] All API tests pass
- \[ ] `pnpm typecheck` passes

---

### Phase 5: Type Safety (Days 1-6, parallel)

- **GOAL-E**: Eliminate all `any` types and add missing schemas

| Task  | Description                                    | Owner   | Est. | Accept Criteria                               | Completed | Date |
| ----- | ---------------------------------------------- | ------- | ---- | --------------------------------------------- | --------- | ---- |
| E1-E4 | Remove `any` types from 5 identified files     | Charlie | 2h   | `grep ": any"` returns 0                      |           |      |
| E5    | Add structured error logging to all handlers   | Charlie | 3h   | All handlers have try/catch with context      |           |      |
| E6    | Create `BatchOperationSchema` in types package | Charlie | 1h   | Schema exported from `@fresh-schedules/types` |           |      |
| E7    | Create `BackupRequestSchema` in types package  | Charlie | 1h   | Schema exported from `@fresh-schedules/types` |           |      |
| E8    | Consolidate Firebase typed wrappers            | Charlie | 2h   | Single source in `packages/types`             |           |      |

**Gate 5 Checkpoint** (End of Day 6):

- \[ ] All E1-E8 PRs merged
- \[ ] Zero `any` types
- \[ ] Pattern score ≥95
- \[ ] `pnpm lint` clean

---

### Phase 6: Feature Completion (Days 6-8)

- **GOAL-F**: Complete core features and polish

| Task | Description                                    | Owner   | Est. | Accept Criteria                        | Completed | Date |
| ---- | ---------------------------------------------- | ------- | ---- | -------------------------------------- | --------- | ---- |
| F1   | Implement `publishSchedule` with status change | Alpha-1 | 3h   | Schedule status changes to `published` |           |      |
| F2   | Connect schedule builder to Firestore          | Bravo-1 | 4h   | Drag-drop saves to Firestore           |           |      |
| F3   | Implement file upload (if time permits)        | Bravo-2 | 3h   | Files persist in Storage               |           |      |
| F4   | Add loading states to all async operations     | Bravo-1 | 1.5h | Spinners visible during loads          |           |      |
| F5   | Add error boundaries to route segments         | Bravo-2 | 1.5h | Errors caught, friendly message shown  |           |      |
| F6   | Add ARIA labels for accessibility              | Bravo-1 | 1h   | Lighthouse a11y ≥95                    |           |      |
| F7   | Add route prefetching to navigation            | Bravo-2 | 30m  | Links prefetch on hover                |           |      |
| F8   | Write E2E golden path test                     | Charlie | 4h   | Full flow test passes                  |           |      |

**Gate 6 Checkpoint** (End of Day 8):

- \[ ] All F1-F8 PRs merged (F3 optional)
- \[ ] E2E passes: `pnpm test:e2e`
- \[ ] Golden path works manually
- \[ ] Coverage ≥80%

---

### Phase 7: Production Readiness (Day 9)

- **GOAL-PROD**: Final validation and deployment

| Task   | Description                         | Owner        | Est. | Accept Criteria       | Completed | Date |
| ------ | ----------------------------------- | ------------ | ---- | --------------------- | --------- | ---- |
| QA1    | Deploy to staging environment       | Orchestrator | 1h   | Vercel preview live   |           |      |
| QA2    | Run E2E against staging             | Charlie      | 1h   | All tests pass        |           |      |
| QA3    | Security audit and sign-off         | SecRed       | 2h   | Audit document signed |           |      |
| QA4    | Performance validation (Lighthouse) | Charlie      | 1h   | ≥90 all categories    |           |      |
| QA5    | Accessibility validation (axe-core) | Bravo-1      | 30m  | 0 critical issues     |           |      |
| DEPLOY | Production deployment               | Orchestrator | 1h   | Production live       |           |      |

**Gate 7 Checkpoint** (Day 9 EOD):

- \[ ] Staging E2E passes
- \[ ] Security audit approved
- \[ ] Lighthouse ≥90
- \[ ] **PRODUCTION DEPLOYED** 🚀

---

## 4. Visual Timeline

### 📅 9-Day Gantt Chart

```
         │ Day 0  │ Day 1  │ Day 2  │ Day 3  │ Day 4  │ Day 5  │ Day 6  │ Day 7  │ Day 8  │ Day 9  │
─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
Alpha-1  │  P0    │ A1 A2  │ B1 B2  │  B5    │ D1 D2  │ D5 D6  │  F1    │ Buffer │   QA   │ Deploy │
         │████████│████████│████████│████████│████████│████████│████████│░░░░░░░░│▓▓▓▓▓▓▓▓│████████│
─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
Alpha-2  │  P0    │ A3 A4  │ A5 B3  │  B4    │ D3 D4  │ D7 D8  │ Buffer │ Buffer │   QA   │ Deploy │
         │████████│████████│████████│████████│████████│████████│░░░░░░░░│░░░░░░░░│▓▓▓▓▓▓▓▓│████████│
─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
Bravo-1  │  P0    │  C5    │  ───   │ C1 C2  │  ───   │ F4 F6  │  F2    │ F2 ct. │   QA   │ Deploy │
         │████████│████    │        │████████│        │████████│████████│████████│▓▓▓▓▓▓▓▓│████████│
─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
Bravo-2  │  P0    │  ───   │  ───   │ C3 C4  │  ───   │ F5 F7  │  F3    │ F3 ct. │   QA   │ Deploy │
         │████████│        │        │████████│        │████████│████████│████████│▓▓▓▓▓▓▓▓│████████│
─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
Charlie  │  P0    │ E1-E4  │ E6 E7  │  E8    │ E5 st. │  E5    │ E5 ct. │  F8    │  F8    │Signoff │
         │████████│████████│████████│████████│████████│████████│████████│████████│████████│████████│
─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
SecRed   │  P0    │ Rev A1 │ Rev A5 │ Rev B  │ Rev D  │  ───   │ Rev F1 │ Audit  │ Audit  │Signoff │
         │████████│▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓│        │▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓│████████│
─────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘

LEGEND: ████ = Active work   ░░░░ = Buffer   ▓▓▓▓ = Review/QA   ─── = Available for support
```

### 📊 Workload Distribution

```
                    HOURS PER TEAM MEMBER
    ┌────────────────────────────────────────────────────┐
    │                                                    │
    │  Alpha-1   ████████████████████████████████  31.5h │
    │                                                    │
    │  Alpha-2   ██████████████████████████████    28.0h │
    │                                                    │
    │  Bravo-1   ████████████████████████████      27.5h │
    │                                                    │
    │  Bravo-2   ██████████████████████████        24.0h │
    │                                                    │
    │  Charlie   ████████████████████              18.0h │
    │                                                    │
    │  SecRed    ██████████████                    12.0h │
    │                                                    │
    └────────────────────────────────────────────────────┘
                        0h   10h   20h   30h   40h
```

### 🔗 Dependency Flow Diagram

```
                                 ┌─────────────────┐
                                 │   PHASE 0       │
                                 │ Feature Flags   │
                                 │ E2E Setup       │
                                 │ CI Emulators    │
                                 └────────┬────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
              ▼                           ▼                           ▼
     ┌────────────────┐          ┌────────────────┐          ┌────────────────┐
     │   STREAM A     │          │   STREAM C     │          │   STREAM E     │
     │   Auth Chain   │          │   UX Complete  │          │   Type Safety  │
     └───────┬────────┘          └───────┬────────┘          └───────┬────────┘
             │                           │                           │
             │ A1 → A2 → A3 → A4 → A5    │ C5 → C1 → C2              │ E1-E4 → E6,E7 → E8
             │       ↓                   │       ↓                   │            ↓
             │       │                   │   C3, C4                  │           E5
             ▼       │                   ▼                           │            │
     ┌───────────────┴──┐                                            │            │
     │   STREAM B       │                                            │            │
     │ Data Persistence │                                            │            │
     └───────┬──────────┘                                            │            │
             │                                                        │            │
             │ B1 → B2                                                │            │
             │ B3 → B4                                                │            │
             │ B5 (rules tests)                                       │            │
             │                                                        │            │
             ▼                                                        ▼            │
     ┌────────────────┐                                     ┌─────────────────────┐
     │   STREAM D     │                                     │   STREAM F          │
     │ API Migration  │◄────────────────────────────────────│ Feature Completion  │
     └───────┬────────┘                                     └──────────┬──────────┘
             │                                                         │
             │ D1-D8 (all APIs to Firestore)                          │ F1-F8
             │                                                         │
             └────────────────────────┬────────────────────────────────┘
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │   GATE 7            │
                            │ Production Ready    │
                            │ ══════════════════  │
                            │ • Staging E2E ✓     │
                            │ • Security Audit ✓  │
                            │ • Lighthouse ≥90 ✓  │
                            │ • DEPLOY 🚀         │
                            └─────────────────────┘
```

---

## 5. Success Criteria & Acceptance

### 📈 Quantitative Success Metrics

| Metric            | Target | Current | Method                  | Owner        |
| ----------------- | ------ | ------- | ----------------------- | ------------ |
| Gaps Closed       | 41/41  | 0/41    | Task count              | Orchestrator |
| Pattern Score     | ≥95    | ~85     | `validate-patterns.mjs` | Charlie      |
| TypeScript Errors | 0      | 0       | `pnpm typecheck`        | All          |
| ESLint Warnings   | 0      | ~20     | `pnpm lint`             | All          |
| Test Coverage     | ≥80%   | ~60%    | `vitest --coverage`     | Charlie      |
| E2E Pass Rate     | 100%   | N/A     | `pnpm test:e2e`         | Charlie      |
| Lighthouse Perf   | ≥90    | N/A     | Lighthouse CI           | Charlie      |
| Lighthouse A11y   | ≥95    | N/A     | Lighthouse CI           | Bravo-1      |
| OWASP Violations  | 0      | 0       | Security audit          | SecRed       |

### ✅ Qualitative Success Criteria

| Criteria             | Validator    | Accept Criteria                                          |
| -------------------- | ------------ | -------------------------------------------------------- |
| Golden path complete | QA + Product | User can signup → create org → create schedule → publish |
| Data persists        | QA           | All data survives page refresh and re-login              |
| No console errors    | QA           | Browser console clean (no red errors)                    |
| Responsive design    | QA           | Works on mobile (375px) and desktop (1920px)             |
| Secure               | SecRed       | No OWASP Top 10 vulnerabilities                          |
| Accessible           | Bravo-1      | Screen reader navigable, keyboard accessible             |

### 🏁 Definition of Done (Per Task)

- \[ ] Code compiles: `pnpm typecheck` passes
- \[ ] Linting clean: `pnpm lint` passes
- \[ ] Tests pass: `pnpm test` includes new coverage
- \[ ] Triad verified: Schema + API + Rules aligned (if applicable)
- \[ ] PR approved by at least 1 reviewer
- \[ ] SecRed review (if auth/data related)
- \[ ] Merged to `dev` branch

---

## 6. Alternatives Considered

- **ALT-001**: Monolithic deployment (rejected - too risky without gates)
- **ALT-002**: Outsource to contractors (rejected - context switching cost)
- **ALT-003**: Reduce scope to 20 critical gaps (rejected - technical debt compounds)
- **ALT-004**: Extend timeline to 14 days (rejected - buffer days sufficient)

---

## 7. Dependencies

- **DEP-001**: Firebase emulator must be available for local development
- **DEP-002**: GitHub Actions runners must support Firebase CLI
- **DEP-003**: Vercel preview deployments for staging
- **DEP-004**: All team members must have access to Firebase console
- **DEP-005**: `@fresh-schedules/types` package must be buildable

---

## 8. Files Affected

### New Files

- `apps/web/src/lib/features.ts` - Feature flags
- `tests/e2e/fixtures/auth.ts` - E2E auth fixture
- `packages/types/src/batch.ts` - BatchOperationSchema
- `packages/types/src/internal.ts` - BackupRequestSchema

### Modified Files

- `apps/web/app/api/**/*.ts` - All API routes (SDK factory migration)
- `apps/web/src/hooks/useAuth.ts` - Wire to Firebase
- `apps/web/src/components/Header.tsx` - Add logout
- `apps/web/src/components/Sidebar.tsx` - Navigation
- `firestore.rules` - Security rules updates
- `.github/workflows/e2e.yml` - CI emulator config

---

## 9. Testing Strategy

- **TEST-001**: Unit tests for all new schemas (Vitest)
- **TEST-002**: Integration tests for API routes (Vitest)
- **TEST-003**: Firestore rules tests (`pnpm test:rules`)
- **TEST-004**: E2E golden path test (Playwright)
- **TEST-005**: Visual regression tests (if time permits)
- **TEST-006**: Accessibility audit (axe-core)
- **TEST-007**: Performance audit (Lighthouse CI)

---

## 10. Risks & Mitigations

| ID       | Risk                             | Probability | Impact | Mitigation                                |
| -------- | -------------------------------- | ----------- | ------ | ----------------------------------------- |
| RISK-001 | Auth integration fails           | Medium      | High   | Feature flag to revert, extensive logging |
| RISK-002 | Firestore rules block operations | Medium      | High   | Test in emulator first, gradual rollout   |
| RISK-003 | E2E tests flaky                  | High        | Medium | Deterministic test users, retry logic     |
| RISK-004 | Timeline slip                    | Low         | Medium | Buffer days built in, F3 can be descoped  |
| RISK-005 | Team member unavailable          | Low         | Medium | Cross-training, shared ownership          |

### Assumptions

- **ASSUMPTION-001**: All team members available for 9 consecutive days
- **ASSUMPTION-002**: Firebase emulator works in CI environment
- **ASSUMPTION-003**: No major bugs discovered in existing code
- **ASSUMPTION-004**: Vercel deployment pipeline is stable

---

## 11. Communication & Escalation

### Daily Cadence

| Time     | Event           | Participants         | Channel   |
| -------- | --------------- | -------------------- | --------- |
| 9:00 AM  | Daily standup   | All teams            | #standup  |
| EOD      | Progress update | Leads                | #progress |
| Gate day | Gate review     | Leads + Orchestrator | #gates    |

### Escalation Matrix

| Severity    | Max Time     | Escalate To          | Channel       |
| ----------- | ------------ | -------------------- | ------------- |
| P0 Blocker  | 30 min       | Orchestrator + Leads | #urgent       |
| P1 Critical | 2 hours      | Orchestrator         | #urgent       |
| P2 Major    | 4 hours      | Lead                 | #team-channel |
| P3 Minor    | Next standup | Team                 | Daily standup |

### Security Escalation

- Any auth bypass → **IMMEDIATE** SecRed + Orchestrator
- Data leak risk → **IMMEDIATE** SecRed + Orchestrator
- OWASP violation → **2 hours** SecRed review

---

## 12. Rollback Procedures

### Level 1: Task Rollback

```bash
git revert <commit-hash>
git push origin dev
```

### Level 2: Phase Rollback

```bash
git checkout <pre-phase-tag>
git checkout -b rollback/phase-N
gh pr create --title "Rollback Phase N"
```

### Level 3: Feature Flag Disable

```bash
# Set in environment
NEXT_PUBLIC_FEATURE_REAL_AUTH=false
NEXT_PUBLIC_FEATURE_FIRESTORE_WRITES=false
# Redeploy
```

### Level 4: Full Rollback

```bash
git checkout $(git tag --list 'v1.4.*' | tail -1)
# Redeploy stable version
```

---

## 13. Related Specifications

- [SDK Factory Comprehensive Guide](../standards/SDK_FACTORY_COMPREHENSIVE_GUIDE.md)
- [Coding Rules and Patterns](../standards/CODING_RULES_AND_PATTERNS.md)
- [Governance Index](../../.github/governance/INDEX.md)
- [Security & OWASP Instructions](../../.github/instructions/03_SECURITY_AND_SAFETY.instructions.md)
- [CrewOps Manual](../architecture/CREWOPS_MANUAL.md)

---

## Appendix A: Full Task Checklist

```
PHASE 0: PREREQUISITES
[ ] P0.1 Feature flags infrastructure
[ ] P0.2 E2E OAuth mock setup
[ ] P0.3 CI emulator configuration

PHASE 1: AUTH CHAIN (Stream A)
[ ] A1 Wire useAuth() to Firebase
[ ] A2 Wire proxy() to middleware
[ ] A3 Set orgId cookie
[ ] A4 Validate invite tokens
[ ] A5 Create membership on join

PHASE 2: DATA PERSISTENCE (Stream B)
[ ] B1 create-network-org Firestore writes
[ ] B2 Create membership document
[ ] B3 create-corporate Firestore writes
[ ] B4 join-with-token writes
[ ] B5 Firestore rules tests

PHASE 3: UX COMPLETION (Stream C)
[ ] C1 Header with logout
[ ] C2 Sidebar navigation
[ ] C3 Profile persistence
[ ] C4 OrgContext with cookie
[ ] C5 Fix CSP

PHASE 4: API MIGRATION (Stream D)
[ ] D1 attendance API → Firestore
[ ] D2 positions API → Firestore
[ ] D3 schedules API → Firestore
[ ] D4 shifts API → Firestore
[ ] D5 venues API → Firestore
[ ] D6 zones API → Firestore
[ ] D7 widgets API → Firestore
[ ] D8 profile API → Firestore

PHASE 5: TYPE SAFETY (Stream E)
[ ] E1-E4 Remove any types (5 files)
[ ] E5 Structured error logging
[ ] E6 BatchOperationSchema migration
[ ] E7 BackupRequestSchema migration
[ ] E8 Consolidate typed-wrappers

PHASE 6: FEATURE COMPLETION (Stream F)
[ ] F1 publishSchedule implementation
[ ] F2 Connect schedule builder
[ ] F3 File upload implementation (optional)
[ ] F4 Loading states
[ ] F5 Error boundaries
[ ] F6 ARIA labels
[ ] F7 Route prefetching
[ ] F8 E2E golden path test

PHASE 7: PRODUCTION READINESS
[ ] QA1 Deploy to staging
[ ] QA2 Run E2E against staging
[ ] QA3 Security audit
[ ] QA4 Performance validation
[ ] QA5 Accessibility validation
[ ] DEPLOY Production deployment

Total: 49 tasks
```

---

## Appendix B: Hours Summary

| Stream    | Hours     | Primary Owner |
| --------- | --------- | ------------- |
| Phase 0   | 2h        | Charlie       |
| Stream A  | 9h        | Alpha         |
| Stream B  | 10h       | Alpha         |
| Stream C  | 9h        | Bravo         |
| Stream D  | 12.5h     | Alpha         |
| Stream E  | 9h        | Charlie       |
| Stream F  | 18.5h     | Bravo + Alpha |
| QA/Deploy | 6.5h      | All           |
| **TOTAL** | **76.5h** |               |

**Per-person capacity**: 6h/day × 9 days = 54h\
**Team capacity**: 6 people × 54h = 324h available\
**Utilization**: 76.5h / 324h = **23.6%** (comfortable margin)

---

**Version**: 4.0\
**Confidence**: 99%\
**Status**: Ready for Execution

**Created**: 2025-12-18\
**Last Updated**: 2025-12-18
