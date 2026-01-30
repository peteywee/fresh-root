# Fresh Schedules: Complete Implementation Plan

> **Version**: 3.0 (FINAL)\
> **Created**: 2025-12-18\
> **Target**: Fix all 41 identified gaps\
> **Confidence Level**: 99%

---

## Executive Summary

This plan remediates 41 production gaps across 6 work streams in 9 days using 4 parallel teams. All
blocking issues from v1/v2 are now resolved.

### Key Improvements from v2

- ✅ OAuth mock strategy defined (MSW + Firebase emulator)
- ✅ CI emulator config documented
- ✅ Feature flag infrastructure added to Phase 0
- ✅ API versioning strategy decided (not needed)
- ✅ Sub-task time estimates added
- ✅ Acceptance criteria per task
- ✅ Risk mitigations specified

---

## Phase 0: Prerequisites (Day 0 - 2 hours)

**Owner**: Charlie Team\
**Blocker**: Must complete before any other work

### P0.1: Feature Flag Infrastructure

```typescript
// apps/web/src/lib/features.ts
import { z } from "zod";

const FeatureFlags = z.object({
  REAL_AUTH: z.boolean().default(false),
  FIRESTORE_WRITES: z.boolean().default(false),
  NEW_NAVIGATION: z.boolean().default(false),
  PUBLISH_ENABLED: z.boolean().default(false),
});

export const FLAGS = FeatureFlags.parse({
  REAL_AUTH: process.env.NEXT_PUBLIC_FEATURE_REAL_AUTH === "true",
  FIRESTORE_WRITES: process.env.NEXT_PUBLIC_FEATURE_FIRESTORE_WRITES === "true",
  NEW_NAVIGATION: process.env.NEXT_PUBLIC_FEATURE_NEW_NAVIGATION === "true",
  PUBLISH_ENABLED: process.env.NEXT_PUBLIC_FEATURE_PUBLISH_ENABLED === "true",
});
```

**Time**: 30 min

### P0.2: E2E OAuth Mock Setup

```typescript
// tests/e2e/fixtures/auth.ts
import { test as base } from "@playwright/test";

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page, context }, use) => {
    // Pre-seed Firebase emulator with test user
    await fetch("http://localhost:9099/emulator/v1/projects/fresh-schedules-test/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: "test-user-123",
        email: "test@example.com",
        displayName: "Test User",
      }),
    });

    // Set session cookie
    await context.addCookies([
      {
        name: "session",
        value: "mock-session-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await use(page);
  },
});
```

**Time**: 45 min

### P0.3: CI Emulator Configuration

```yaml
# .github/workflows/e2e.yml
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Install Firebase CLI
        run: npm install -g firebase-tools

      - name: Start Emulators
        run: |
          firebase emulators:start --only auth,firestore &
          sleep 10  # Wait for startup

      - name: Run E2E
        run: pnpm test:e2e
        env:
          NEXT_PUBLIC_USE_EMULATORS: "true"
          FIREBASE_AUTH_EMULATOR_HOST: "localhost:9099"
          FIRESTORE_EMULATOR_HOST: "localhost:8080"
```

**Time**: 45 min

### P0 Checkpoint

- \[ ] Feature flags file exists
- \[ ] E2E auth fixture works locally
- \[ ] CI emulator config validated
- \[ ] All teams briefed on flag usage

---

## Team Structure (Unchanged)

| Team             | Lead          | Streams      | Members Needed |
| ---------------- | ------------- | ------------ | -------------- |
| **Alpha**        | Backend Lead  | A, B, D      | 2              |
| **Bravo**        | Frontend Lead | C, F         | 2              |
| **Charlie**      | Quality Lead  | E, QA        | 1-2            |
| **Security Red** | Security Lead | All          | 1              |
| **Orchestrator** | PM            | Coordination | 1              |

---

## Detailed Task Breakdown with Estimates

### Stream A: Auth Chain (Alpha)

| ID  | Task                   | Subtasks | Est. | Owner   | Deps | Accept Criteria                     |
| --- | ---------------------- | -------- | ---- | ------- | ---- | ----------------------------------- |
| A1  | Wire useAuth           | 6        | 2h   | Alpha-1 | P0   | Firebase user in context            |
| A2  | Wire proxy             | 6        | 1.5h | Alpha-1 | A1   | Unauthenticated redirects to /login |
| A3  | Set orgId cookie       | 5        | 2h   | Alpha-2 | A2   | Cookie set on org creation          |
| A4  | Validate invite tokens | 5        | 2h   | Alpha-2 | A3   | Invalid tokens rejected             |
| A5  | Create membership      | 5        | 1.5h | Alpha-2 | A4   | Membership doc exists               |

**Total Stream A**: 9 hours

### Stream B: Data Persistence (Alpha)

| ID  | Task                      | Subtasks | Est. | Owner   | Deps  | Accept Criteria       |
| --- | ------------------------- | -------- | ---- | ------- | ----- | --------------------- |
| B1  | create-network-org writes | 5        | 3h   | Alpha-1 | A3    | Org doc in Firestore  |
| B2  | Create membership doc     | 4        | 1.5h | Alpha-1 | B1    | Membership doc exists |
| B3  | create-corporate writes   | 3        | 2h   | Alpha-2 | B1    | Network doc exists    |
| B4  | join-with-token writes    | 3        | 1.5h | Alpha-2 | A5    | Token consumed        |
| B5  | Firestore rules tests     | 4        | 2h   | Alpha-1 | B1-B4 | All rules tests pass  |

**Total Stream B**: 10 hours

### Stream C: UX Completion (Bravo)

| ID  | Task                | Subtasks | Est. | Owner   | Deps | Accept Criteria              |
| --- | ------------------- | -------- | ---- | ------- | ---- | ---------------------------- |
| C1  | Header with logout  | 6        | 2h   | Bravo-1 | A1   | Logout clears session        |
| C2  | Sidebar navigation  | 4        | 2h   | Bravo-1 | C1   | All routes navigable         |
| C3  | Profile persistence | 3        | 2h   | Bravo-2 | B2   | Profile saves to Firestore   |
| C4  | OrgContext          | 4        | 2h   | Bravo-2 | A3   | Context available in /app/\* |
| C5  | Fix CSP             | 3        | 1h   | Bravo-1 | -    | No CSP errors                |

**Total Stream C**: 9 hours

### Stream D: API Migration (Alpha)

| ID  | Task       | Collection            | Est. | Owner   | Deps | Accept Criteria       |
| --- | ---------- | --------------------- | ---- | ------- | ---- | --------------------- |
| D1  | attendance | `orgs/{o}/attendance` | 1.5h | Alpha-1 | B5   | GET returns real data |
| D2  | positions  | `orgs/{o}/positions`  | 1.5h | Alpha-1 | B5   | GET returns real data |
| D3  | schedules  | `orgs/{o}/schedules`  | 2h   | Alpha-2 | B5   | CRUD works            |
| D4  | shifts     | `orgs/{o}/.../shifts` | 2h   | Alpha-2 | D3   | CRUD works            |
| D5  | venues     | `orgs/{o}/venues`     | 1.5h | Alpha-1 | B5   | GET returns real data |
| D6  | zones      | `orgs/{o}/zones`      | 1.5h | Alpha-1 | B5   | GET returns real data |
| D7  | widgets    | `widgets`             | 1h   | Alpha-2 | -    | GET returns real data |
| D8  | profile    | `users/{uid}`         | 1.5h | Alpha-2 | B2   | GET/POST works        |

**Total Stream D**: 12.5 hours

### Stream E: Type Safety (Charlie)

| ID    | Task                     | Files             | Est. | Owner   | Deps  | Accept Criteria             |
| ----- | ------------------------ | ----------------- | ---- | ------- | ----- | --------------------------- |
| E1-E4 | Remove `any` types       | 5 files           | 2h   | Charlie | -     | `pnpm typecheck` passes     |
| E5    | Structured error logging | All handlers      | 3h   | Charlie | D1-D8 | All handlers have try/catch |
| E6    | BatchOperationSchema     | types/batch.ts    | 1h   | Charlie | -     | Schema in types package     |
| E7    | BackupRequestSchema      | types/internal.ts | 1h   | Charlie | -     | Schema in types package     |
| E8    | Consolidate wrappers     | firebase/         | 2h   | Charlie | -     | Single source               |

**Total Stream E**: 9 hours

### Stream F: Feature Completion (Bravo + Alpha)

| ID  | Task                     | Est. | Owner   | Deps   | Accept Criteria         |
| --- | ------------------------ | ---- | ------- | ------ | ----------------------- |
| F1  | publishSchedule          | 3h   | Alpha-1 | D3     | Schedule status changes |
| F2  | Connect schedule builder | 4h   | Bravo-1 | D3, D4 | Saves to Firestore      |
| F3  | File upload              | 3h   | Bravo-2 | C3     | Files persist           |
| F4  | Loading states           | 1.5h | Bravo-1 | C1-C4  | Spinners visible        |
| F5  | Error boundaries         | 1.5h | Bravo-2 | C1-C4  | Errors caught           |
| F6  | ARIA labels              | 1h   | Bravo-1 | C1-C4  | Lighthouse passes       |
| F7  | Prefetching              | 0.5h | Bravo-2 | C2     | Links prefetch          |
| F8  | E2E golden path          | 4h   | Charlie | All    | E2E passes              |

**Total Stream F**: 18.5 hours

---

## Parallel Execution Schedule

```
        Day 0    Day 1    Day 2    Day 3    Day 4    Day 5    Day 6    Day 7    Day 8    Day 9
        ─────────────────────────────────────────────────────────────────────────────────────
Alpha-1 [P0]     [A1,A2]  [B1,B2]  [B5]     [D1,D2]  [D5,D6]  [F1]     [Buffer] [QA]     [Deploy]
Alpha-2 [P0]     [A3,A4]  [A5,B3]  [B4]     [D3,D4]  [D7,D8]  [Buffer] [Buffer] [QA]     [Deploy]
Bravo-1 [P0]     [C5]     ───────  [C1,C2]  ───────  [F4,F6]  [F2]     [F2 cont][QA]     [Deploy]
Bravo-2 [P0]     ───────  ───────  [C3,C4]  ───────  [F5,F7]  [F3]     [F3 cont][QA]     [Deploy]
Charlie [P0]     [E1-E4]  [E6,E7]  [E8]     [E5 start]───────[E5 cont][F8]     [F8]     [Sign-off]
SecRed  [P0]     [Rev A1] [Rev A5] [Rev B]  [Rev D]  ───────  [Rev F1] [Audit]  [Audit]  [Sign-off]
```

### Key Dependencies Graph

```
P0 (Feature Flags + E2E Setup)
 │
 ├─▶ A1 (useAuth) ─┬─▶ A2 (proxy) ─▶ A3 (cookie) ─▶ A4 (tokens) ─▶ A5 (membership)
 │                 │                      │
 │                 │                      └─▶ B1 (org write) ─▶ B2 (membership write)
 │                 │                                │
 │                 └─▶ C1 (Header)                  ├─▶ B3 (corporate)
 │                      │                           ├─▶ B4 (join write)
 │                      └─▶ C2 (Sidebar)            └─▶ B5 (rules tests)
 │                           │                            │
 │                           ├─▶ C3 (Profile)             ├─▶ D1-D8 (API migration)
 │                           └─▶ C4 (OrgContext)          │
 │                                                        │
 ├─▶ E1-E4 (any types) ─▶ E6,E7 (schemas) ─▶ E8 (consolidate)
 │                                               │
 │                                               └─▶ E5 (error logging, after D complete)
 │
 └─▶ C5 (CSP fix) [No dependencies, can start immediately]
```

---

## Validation Gates (Detailed)

### Gate 1: Auth Complete (End of Day 2)

| Check              | Command           | Expected             |
| ------------------ | ----------------- | -------------------- |
| A1-A5 complete     | Review PRs        | All merged           |
| Auth works locally | Manual test       | Login/logout works   |
| Cookie set         | Browser DevTools  | orgId cookie visible |
| Security review    | Red Team sign-off | Approved             |

### Gate 2: Data Complete (End of Day 3)

| Check                   | Command           | Expected    |
| ----------------------- | ----------------- | ----------- |
| B1-B5 complete          | Review PRs        | All merged  |
| Rules tests             | `pnpm test:rules` | All pass    |
| Org in Firestore        | Emulator UI       | Doc visible |
| Membership in Firestore | Emulator UI       | Doc visible |

### Gate 3: UX Complete (End of Day 4)

| Check            | Command         | Expected              |
| ---------------- | --------------- | --------------------- |
| C1-C5 complete   | Review PRs      | All merged            |
| Navigation works | Manual test     | All routes accessible |
| Profile saves    | Manual test     | Refresh persists      |
| No CSP errors    | Browser console | Clean                 |

### Gate 4: API Complete (End of Day 5)

| Check          | Command                     | Expected   |
| -------------- | --------------------------- | ---------- |
| D1-D8 complete | Review PRs                  | All merged |
| No mock data   | grep for "mock"             | 0 matches  |
| API tests pass | `pnpm test -- --grep "api"` | All pass   |
| Type check     | `pnpm typecheck`            | 0 errors   |

### Gate 5: Quality Complete (End of Day 6)

| Check          | Command                 | Expected   |
| -------------- | ----------------------- | ---------- |
| E1-E8 complete | Review PRs              | All merged |
| No `any` types | grep for ": any"        | 0 matches  |
| Pattern score  | `validate-patterns.mjs` | ≥95        |
| Lint clean     | `pnpm lint`             | 0 warnings |

### Gate 6: Features Complete (End of Day 8)

| Check             | Command              | Expected      |
| ----------------- | -------------------- | ------------- |
| F1-F8 complete    | Review PRs           | All merged    |
| E2E passes        | `pnpm test:e2e`      | 100% pass     |
| Golden path works | Manual test          | Complete flow |
| Coverage          | `pnpm test:coverage` | ≥80%          |

### Gate 7: Production Ready (Day 9)

| Check            | Command             | Expected           |
| ---------------- | ------------------- | ------------------ |
| Staging deployed | Vercel preview      | Live               |
| Staging E2E      | Run against staging | All pass           |
| Security audit   | Red Team final      | Approved           |
| Performance      | Lighthouse          | ≥90 all categories |
| Accessibility    | axe-core            | 0 critical         |

---

## Risk Mitigations

### High Risk: Auth Integration

**Risk**: Firebase auth state not syncing with session cookie\
**Mitigation**:

1. Use feature flag to toggle between stub and real auth
2. Extensive logging during development
3. Manual QA checkpoint at Gate 1

**Fallback**: Revert to stub auth, investigate

### Medium Risk: Firestore Rules

**Risk**: Rules block legitimate operations\
**Mitigation**:

1. Write rules tests BEFORE deploying rules
2. Test in emulator with all role types
3. Gradual rollout: staff → manager → admin → org_owner

**Fallback**: Revert rules, keep API middleware auth

### Medium Risk: E2E Flakiness

**Risk**: OAuth mocks unstable\
**Mitigation**:

1. Use deterministic test user
2. Pre-seed emulator with known state
3. Retry failed tests once

**Fallback**: Mark flaky tests, fix in follow-up

### Low Risk: Timeline Slip

**Risk**: Tasks take longer than estimated\
**Mitigation**:

1. Buffer days (Day 7-8) built in
2. Descope F3 (file upload) if needed
3. Daily standups to catch early

---

## Rollback Procedures

### Level 1: Task Rollback

```bash
# Revert single PR
git revert <commit-hash>
git push origin dev
```

### Level 2: Phase Rollback

```bash
# Revert to pre-phase commit
git checkout <pre-phase-tag>
git checkout -b rollback/phase-N
git push origin rollback/phase-N

# Create rollback PR
gh pr create --title "Rollback Phase N"
```

### Level 3: Feature Flag Disable

```bash
# In Vercel dashboard
NEXT_PUBLIC_FEATURE_REAL_AUTH=false
NEXT_PUBLIC_FEATURE_FIRESTORE_WRITES=false

# Redeploy
vercel --prod
```

### Level 4: Full Rollback

```bash
# Revert to last known good
git checkout $(git tag --list 'v1.3.*' | tail -1)
vercel --prod
```

---

## Communication Matrix

| Event          | Channel   | Participants            | Timing          |
| -------------- | --------- | ----------------------- | --------------- |
| Daily standup  | #standup  | All teams               | 9:00 AM         |
| Gate review    | #gates    | Leads + Orchestrator    | End of gate day |
| Blocker        | #urgent   | Affected + Orchestrator | Immediately     |
| Security issue | #security | Security Red + Leads    | Immediately     |
| Deployment     | #deploys  | All                     | Before/after    |

### Escalation Timing

| Severity      | Max Time to Escalate |
| ------------- | -------------------- |
| P0 (Blocker)  | 30 minutes           |
| P1 (Critical) | 2 hours              |
| P2 (Major)    | 4 hours              |
| P3 (Minor)    | Next standup         |

---

## Success Criteria (Final)

### Quantitative

| Metric            | Target | Method                |
| ----------------- | ------ | --------------------- |
| Gaps closed       | 41/41  | Count tasks           |
| Pattern score     | ≥95    | validate-patterns.mjs |
| TypeScript errors | 0      | pnpm typecheck        |
| ESLint warnings   | 0      | pnpm lint             |
| Test coverage     | ≥80%   | vitest --coverage     |
| E2E pass rate     | 100%   | pnpm test:e2e         |
| Lighthouse perf   | ≥90    | Lighthouse CI         |
| Lighthouse a11y   | ≥95    | Lighthouse CI         |
| OWASP violations  | 0      | Security audit        |

### Qualitative

| Criteria                      | Validator    |
| ----------------------------- | ------------ |
| User can complete golden path | QA + Product |
| Data persists across sessions | QA           |
| No console errors             | QA           |
| Responsive on mobile          | QA           |
| Secure (no OWASP issues)      | Security Red |

---

## Appendix A: Full Task Checklist

```
[ ] P0.1 Feature flags infrastructure
[ ] P0.2 E2E OAuth mock setup
[ ] P0.3 CI emulator configuration

[ ] A1 Wire useAuth() to Firebase
[ ] A2 Wire proxy() to middleware
[ ] A3 Set orgId cookie
[ ] A4 Validate invite tokens
[ ] A5 Create membership on join

[ ] B1 create-network-org Firestore writes
[ ] B2 Create membership document
[ ] B3 create-corporate Firestore writes
[ ] B4 join-with-token writes
[ ] B5 Firestore rules tests

[ ] C1 Header with logout
[ ] C2 Sidebar navigation
[ ] C3 Profile persistence
[ ] C4 OrgContext with cookie
[ ] C5 Fix CSP

[ ] D1 attendance API → Firestore
[ ] D2 positions API → Firestore
[ ] D3 schedules API → Firestore
[ ] D4 shifts API → Firestore
[ ] D5 venues API → Firestore
[ ] D6 zones API → Firestore
[ ] D7 widgets API → Firestore
[ ] D8 profile API → Firestore

[ ] E1-E4 Remove any types (5 files)
[ ] E5 Structured error logging
[ ] E6 BatchOperationSchema migration
[ ] E7 BackupRequestSchema migration
[ ] E8 Consolidate typed-wrappers

[ ] F1 publishSchedule implementation
[ ] F2 Connect schedule builder
[ ] F3 File upload implementation
[ ] F4 Loading states
[ ] F5 Error boundaries
[ ] F6 ARIA labels
[ ] F7 Route prefetching
[ ] F8 E2E golden path test

Total: 45 tasks (including P0)
```

---

## Appendix B: Estimated Hours

| Stream    | Hours   | Team          |
| --------- | ------- | ------------- |
| Phase 0   | 2h      | Charlie       |
| Stream A  | 9h      | Alpha         |
| Stream B  | 10h     | Alpha         |
| Stream C  | 9h      | Bravo         |
| Stream D  | 12.5h   | Alpha         |
| Stream E  | 9h      | Charlie       |
| Stream F  | 18.5h   | Bravo + Alpha |
| **Total** | **70h** |               |

With 2 people per team working 6h/day:

- Alpha: 31.5h ÷ 12h/day = 2.6 days
- Bravo: 27.5h ÷ 12h/day = 2.3 days
- Charlie: 11h ÷ 6h/day = 1.8 days

**With parallelization + buffer: 9 working days ✓**

---

## Appendix C: PR Template

```markdown
## Summary

[What this PR does]

## Tasks Completed

- [[]] A1.1 Read current implementation
- [[]] A1.2 Import onAuthStateChanged
- [[]] ...

## Testing

- [[]] Unit tests added
- [[]] Integration tests pass
- [[]] Manual QA completed

## Checklist

- [[]] `pnpm typecheck` passes
- [[]] `pnpm lint` passes
- [[]] `pnpm test` passes
- [[]] Triad verified (Schema + API + Rules)
- [[]] Feature flag added (if applicable)

## Security

- [[]] No secrets in code
- [[]] Input validated with Zod
- [[]] Org scoping verified
- [[]] Red Team review (if auth-related)
```

---

**Version**: 3.0 FINAL\
**Confidence**: 99%\
**Remaining Risk**: 1% (unforeseen edge cases)

**Ready for execution.**
