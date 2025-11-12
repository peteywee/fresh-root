# Phase 4 – Hardening & Freeze (v15)

**Purpose**  
Ensure v15 is **secure, performant, and operationally ready**, then establish a **code freeze** point (v15.0.0) that becomes the new baseline.

---

## 1. Security Hardening

### 1.1 Rules & Auth

- [ ] Firestore rules reviewed against:
  - Tenant model (Network → Corp → Org → Venue).
  - Roles (Manager, Staff, any system/admin roles).
- [ ] `packages/rules-tests/**` includes tests for:
  - [ ] Cross-org access denial.
  - [ ] Staff write limitations.
  - [ ] Org/venue scoping for reads/writes.
- [ ] Auth flows:
  - [ ] Login/session flow tested.
  - [ ] Optional MFA path tested if implemented.
  - [ ] Session expiration/refresh behavior validated.

### 1.2 Secrets & Config

- [ ] All secrets are stored in secure locations (env/CI secrets), not in code.
- [ ] Env validation (Layer 01) rejects invalid or missing required variables.
- [ ] Dev/stage/prod configs are documented in `environment.md` or equivalent.

---

## 2. Performance & PWA

### 2.1 Performance

- [ ] Lighthouse run on key pages (landing, onboarding, dashboard, schedule):
  - [ ] Performance score ≥ agreed threshold (e.g., 90).
  - [ ] No obvious blocking scripts or oversized payloads.
- [ ] Bundle analysis (Next.js):
  - [ ] Large dependencies identified and lazy-loaded if appropriate.
  - [ ] No unexpected polyfills or dead code hotspots.

### 2.2 PWA

- [ ] `manifest.json` is valid and references correct icons.
- [ ] Service worker registration works (no runtime errors).
- [ ] App is installable in at least one major browser (Chrome, Edge).
- [ ] Offline stance decided and documented:
  - Example: “Offline-lite: shell loads, but API calls fail gracefully.”

---

## 3. Reliability & Observability

### 3.1 Logging & Tracing

- [ ] Key operations emit logs (auth, onboarding, schedule publish, attendance).
- [ ] Logs include correlation IDs or request IDs where applicable.
- [ ] Any tracing (OTel) or error reporting (Sentry) integrations are configured and tested.

### 3.2 Alerts & SLOs

- [ ] Block 1/2 SLOs are defined and measurable:
  - Example: Error rate, latency, uptime targets.
- [ ] Basic alerting set up for:
  - [ ] High error rate.
  - [ ] Critical endpoints failing.

---

## 4. Documentation Finalization

- [ ] `Project_Bible_v15.0.0.md` updated to reflect **actual shipped behavior**.
- [ ] `PHASE2_SPEC_CROSSWALK.md` and `PHASE2_SCHEMA_CROSSWALK.md` updated with final v15 decisions/status.
- [ ] `PHASE3_CODE_MIGRATION_CHECKLIST.md` and `PHASE3_DATA_MIGRATION_CHECKLIST.md` checked off and annotated.
- [ ] Layer docs (`docs/layers/*.md`) updated to match what is actually enforced.

---

## 5. Code Freeze Procedure (v15.0.0)

- [ ] All P0/P1 issues for v15 are resolved or explicitly waived.
- [ ] A final PR merges migration branches into the main branch.
- [ ] CI is green on:
  - Typecheck
  - Unit tests
  - Rules tests
  - API tests
- [ ] Tag created:
  - `v15.0.0` in git.
- [ ] Create a short release note (even if internal):
  - High-level features.
  - Migration summary.
  - Known limitations.

After this tag, only **hotfixes** are allowed until v15 is stable in production.

---

## 6. Post-Freeze Planning

- [ ] Create v15.1+ backlog:
  - AI assistant scheduling.
  - Advanced analytics.
  - Mobile wrappers (Capacitor/Expo).
  - UX enhancements beyond the MVP.
- [ ] Ensure new work is explicitly **out of v15 scope** and will not destabilize the foundation.

---

## 7. Completion Criteria

Phase 4 – Hardening & Freeze is complete when:

- Security, performance, reliability, and documentation checklists are satisfied.
- v15.0.0 is tagged and running in production.
- There is a clear, written separation between:
  - **What v15 guarantees**, and
  - **What future versions might change.**
