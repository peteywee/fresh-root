# Project Bible v15 – Migration Plan (13.5 → 14 → 15)

**Purpose**
Define a concrete, step-by-step plan to migrate Fresh Schedules from the v13.5/v14 spec + existing codebase to a **consistent, canonical v15 system**.
This is not a marketing document; it is an **operational plan**.

---

## 1. Scope

### 1.1 In Scope

- All behavior and flows described in:
  - `Project_Bible_v13.5.md` (network/corp/org/venue, early onboarding).
  - `Project_Bible_v14.0.0.md` (Blocks 1–3, GAPS).
- All implemented code in `fresh-root-main`, specifically:
  - `packages/types/**`
  - `services/api/src/**`
  - `apps/web/src/lib/**`
  - `apps/web/app/**`
  - `firestore.rules`, `storage.rules`
- All Firestore schemas and data access patterns currently in use.

### 1.2 Out of Scope for v15

- AI assistant scheduling features.
- Deep analytics and BI exports.
- Native wrappers (Capacitor/Expo) and mobile app store distributions.
- Large new features not already specified in v13.5/v14 (these go to v15.1+).

---

## 2. Migration Phases Overview

The migration is broken into four phases:

1. **Phase 1 – Document & Discover**
   - Inventory existing docs, code, rules, and tests.
   - Identify patterns already in use and decide what is “frozen skeleton” vs “flexible clay”.
2. **Phase 2 – Crosswalk & Plan Lock**
   - Map concepts and schemas from v13.5 → v14 → v15.
   - Decide what to keep, change, and kill.
   - Produce a precise backlog of migration tasks tied to code paths.
3. **Phase 3 – Code & Data Migration**
   - Update code and rules to match v15 Bible and layer specs.
   - Implement data migrations where schemas have changed.
   - Ensure all tests pass on the new behavior.
4. **Phase 4 – Hardening & Freeze**
   - Performance tuning, PWA checks, security review.
   - Lock scope and tag v15.0.0 as a freeze-point.

Each phase has its own doc(s) under `docs/migration/v15/`.

---

## 3. Phase 1 – Document & Discover

### 3.1 Objectives

- Establish a **complete, tagged inventory** of important artifacts (docs, code, rules, tests).
- Make existing patterns **explicit**, not just implied:
  - Layering (Domain, Infra, App Libs, API, UI).
  - Tenant model (network → corp → org → venue).
  - Blocks (1–4).

### 3.2 Artifacts

- `docs/migration/v15/PHASE1_DOCUMENT_INVENTORY.md`
- `docs/migration/v15/PHASE1_PATTERN_MAP.md`

### 3.3 Acceptance Criteria

- Every significant doc/code area is listed with:
  - Path
  - Role (bible, schema, rules, layer, test)
  - Tags: `block:*`, `area:*`, `state:*`
- Patterns for layers, domain, and blocks are described and have:
  - A list of “Frozen” patterns.
  - A list of “Flexible” (to evolve) patterns.

---

## 4. Phase 2 – Crosswalk & Plan Lock

### 4.1 Objectives

- Convert v13.5 + v14 + code reality into a **single, explicit plan** for v15.
- For every major concept, answer:
  - What did 13.5 say?
  - What did 14 say?
  - What does the code currently do?
  - What will v15 do?

### 4.2 Artifacts

- `docs/migration/v15/PHASE2_SPEC_CROSSWALK.md`
- `docs/migration/v15/PHASE2_SCHEMA_CROSSWALK.md`

### 4.3 Acceptance Criteria

- For each major domain concept (network, org, venue, staff, shift, attendance):
  - There is a row in the **Spec Crosswalk**.
  - There is a row in the **Schema Crosswalk**.
- Each row has a **v15 decision**: KEEP, CHANGE, or KILL, plus:
  - Reference to actual code path.
  - Reference to relevant layer spec.
- There is a migration backlog (GitHub issues) tied to these rows and labeled `milestone:v15`.

---

## 5. Phase 3 – Code & Data Migration

### 5.1 Objectives

- Bring implementation into strict alignment with v15.
- Ensure no part of the running system is still “thinking” in 13.5 or 14 semantics.

### 5.2 Workstreams

1. **Code Migration**
   - Update `apps/web/src/lib/**` and `services/api/src/**` to match v15 flows and types.
   - Introduce/solidify data access layer(s) (no raw Firestore in UI or API).
   - Enforce layer boundaries as per `docs/layers/*.md`.
2. **Rules & Security Migration**
   - Update `firestore.rules` and `storage.rules` to match v15 tenant and role model.
   - Expand rules tests in `packages/rules-tests/**`.
3. **Data Migration**
   - Write scripts to transform legacy Firestore docs into v15 schema.
   - Run and validate migrations in the emulator before prod.

### 5.3 Artifacts

- `PHASE3_CODE_MIGRATION_CHECKLIST.md`
- `PHASE3_DATA_MIGRATION_CHECKLIST.md`

### 5.4 Acceptance Criteria

- All golden-path flows (signup → onboarding → schedule → staff view) work under v15.
- No remaining code paths rely on deprecated schemas or concepts.
- All rules tests and app tests pass.

---

## 6. Phase 4 – Hardening & Freeze

### 6.1 Objectives

- Make v15 **safe to ship**:
  - Security, performance, operational readiness.

### 6.2 Key Activities

- Performance tuning (Lighthouse, bundle sizes, DB query patterns).
- PWA checks (installability, offline stance).
- Security and privacy review (rules, logs, data retention).
- Documentation updates:
  - `Project_Bible_v15.0.0.md` reconciled with actual state.
  - Layers docs and migration docs marked as complete.

### 6.3 Acceptance Criteria

- v15 passes defined SLOs (Block 1 SLO doc).
- “All Green Before You Push” checks are satisfied.
- v15.0.0 is tagged in git and declared the new baseline.

---

## 7. Governance

- **Single Source of Truth:**
  - For vision and behavior: `Project_Bible_v15.0.0.md`.
  - For migration progress: `docs/migration/v15/**`.
  - For structural boundaries: `docs/layers/*.md`.
- **Change Policy:**
  - Any change to architecture, layers, or domain must:
    - Update relevant layer doc(s).
    - Update migration docs if it affects v15 scope.
    - Be reflected in v15 Bible if it changes behavior.
