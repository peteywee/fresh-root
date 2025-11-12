# Phase 3 – Code Migration Checklist (v15)

**Purpose**  
Track and enforce all code-level changes required to bring implementation in line with the **v15 Bible**, **Layer Specs**, and **Crosswalks**.

---

## 1. Preconditions

Before starting Phase 3:

- Phase 1 docs are complete:
  - `PHASE1_DOCUMENT_INVENTORY.md`
  - `PHASE1_PATTERN_MAP.md`
- Phase 2 docs are populated for core concepts:
  - `PHASE2_SPEC_CROSSWALK.md`
  - `PHASE2_SCHEMA_CROSSWALK.md`
- v15 Bible (`Project_Bible_v15.0.0.md`) exists and references the crosswalks.

---

## 2. Checklist – Layer Enforcement

### 2.1 Domain Kernel (Layer 00)

- [ ] `packages/types/**` has **no imports** from `apps/**` or `services/**`.  
- [ ] All externally-used domain entities have Zod schemas.  
- [ ] RBAC definitions live only in `packages/types/src/rbac.ts` and consumers import from there.

### 2.2 Infrastructure (Layer 01)

- [ ] Firebase Admin initialization is centralized (e.g., `services/api/src/firebase.ts`).  
- [ ] Env validation is centralized (no scattered `process.env` reads).  
- [ ] No file in `services/api/src/**` imports from `apps/web/app/**` or UI components.

### 2.3 Application Libraries (Layer 02)

- [ ] Business logic (onboarding, scheduling, attendance) lives under `apps/web/src/lib/**`.  
- [ ] No App Lib file imports from `apps/web/app/**`.  
- [ ] Guards like `requireSession`, `requireOrgMembership`, and `requireRole` are implemented here and re-used across routes.  
- [ ] Any direct Firestore or Admin usages happen via Infra helpers, not raw SDK calls scattered around.

### 2.4 API Edge (Layer 03)

- [ ] Each `apps/web/app/api/**` route:
  - [ ] Uses domain schemas for validation (from `@fresh-schedules/types`).  
  - [ ] Uses App Libs for business logic.  
  - [ ] Does not communicate with Firebase directly.  
- [ ] Middleware (`apps/web/middleware.ts`) calls App Libs or Infra helpers, not domain internals.

### 2.5 UI / UX (Layer 04)

- [ ] Pages and components do not import from `services/api/src/**`.  
- [ ] Data fetching logic is encapsulated in hooks/App Libs where practical.  
- [ ] Core flows (onboarding, scheduling) have clearly identified entry points.

---

## 3. Checklist – Concept-Level Changes (from Spec Crosswalk)

Use the rows in `PHASE2_SPEC_CROSSWALK.md` and translate them into tasks.

For each concept, ensure:

- [ ] Code has been updated to reflect the **v15 Decision** (`KEEP`, `CHANGE`, `KILL`).  
- [ ] Deprecated behaviors from v13.5/v14 have been removed or guarded.  
- [ ] New behavior is covered by tests.

Example entries (you may expand in a separate table or GitHub issues):

- [ ] Network/Corp/Org/Venue relationships updated in code and rules.  
- [ ] Onboarding wizard steps and payloads match v15 spec.  
- [ ] Schedule creation uses v15 labor-budget logic.  
- [ ] Attendance API uses `CreateAttendanceRecordSchema` end-to-end.  

---

## 4. Checklist – Rules & Security

- [ ] Firestore rules encode v15 tenant and role model (Network → Corp → Org → Venue; Manager vs Staff).  
- [ ] Rules tests in `packages/rules-tests/**` cover:
  - [ ] Manager can only act within their org/venues.  
  - [ ] Staff cannot mutate schedules.  
  - [ ] Cross-org access is denied.
- [ ] Any special-case rules (e.g., system/admin) are documented and tested.

---

## 5. Checklist – Tests & CI

- [ ] Unit tests for core App Libs (onboarding, scheduling, attendance).  
- [ ] API-level tests for critical routes:
  - Login/session  
  - Onboarding create/join org  
  - Schedule CRUD  
  - Attendance write
- [ ] CI pipelines (`.github/workflows/**`) are updated, if necessary, to:
  - [ ] Run typecheck.  
  - [ ] Run unit + rules + API tests.  
  - [ ] Fail on layer violations if added (custom lint).

---

## 6. Completion Criteria

Phase 3 – Code Migration is complete when:

- All checkboxes above are satisfied or explicitly waived with a rationale.  
- No routes or flows behave in the “old 13.5/14 way” contrary to the v15 Bible.  
- All P0/P1 bugs related to migration are closed or explicitly deferred to a post-freeze patch.
