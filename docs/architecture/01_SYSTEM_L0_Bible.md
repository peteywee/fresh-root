---
title: "Project Bible - System Foundation"
description: "Core system specification, standards, and foundation freeze documentation"
keywords:
  - architecture
  - system-design
  - foundation
  - specification
  - bible
category: "architecture"
status: "active"
audience:
  - architects
  - team-leads
  - stakeholders
related-docs:
  - 02_SYSTEM_L1.md
  - FUTURE_PROOF_SYSTEM_DESIGN.md
---

# Project Bible v14.5 – Bridge Freeze Specification
**Role:** Foundation Freeze (finish 13.5→14 carry-over; standardize patterns for v15)\
**Owner:** Lead Developer (Docs) • CTO Oversight: Patrick Craven\
**Effective:** 2025-11-11

---

## 1. Purpose & Positioning
v14.5 is a **bridge release**. It completes all non-UI/UX work still lingering from 13.5→14 and
freezes the **one true way** to build API routes, imports, exports, and files. v15 will not change
these; it will **enforce** them and build vertically on top.

---

## 2. In/Out of Scope
**In:**

- Schema normalization (Network→Corp→Org→Venue→Staff), rules hardening, route parity with v14
  intents.
- Canonical standards: API Route, Import, Export, File Header/Tag.
- App Libs consolidation (guards, labor math, onboarding).
- CI-only tests; **no VS Code background servers**.

**Out (defer to v15):**

- UX redesign; AI scheduling; offline-strong; mobile wrappers.

---

## 3. Foundation Decisions (inherit from v14 Bible; align with v15 plan)
- Firebase remains primary; infra must be **provider-agnostic** (adapter interface).
- Tenant model frozen: Network → Corp → Org → Venue → Staff.
- Roles (RBAC): `staff`, `manager`, `owner`, `admin_internal (system-only)`.
- Org discoverability (directory + join approval) is accepted **pattern**, but UI wiring is v15.
- Performance gate ≥ 90 Lighthouse on golden path.
- Tests run in CI/Linux only.

---

## 4. Uniform Standards (authoritative for v14.5+)
- API Route Standard → `docs/standards/ROUTE_API_STANDARD.md`
- Import Standard → `docs/standards/IMPORT_STANDARD.md`
- Export Standard → `docs/standards/EXPORT_STANDARD.md`
- File Header & Tag Standard → `docs/standards/FILE_HEADER_STANDARD.md`
- Route Template → `apps/web/app/api/_template/route.ts`
- Import Template → `apps/web/src/lib/imports/_template.import.ts`
- Export Template → `apps/web/src/lib/exports/_template.export.ts`

These define **patterns**, not code guessing. v15 will require conformance.

---

## 5. Carry-Over Gaps to Close (13.5→14)
1. Mixed schemas in collections (orgs/venues/staff/shifts/attendance).
2. Routes that still accept old payloads or emit old shapes.
3. Guards scattered across routes instead of centralized App Libs.
4. Incomplete rules for RBAC and tenant scoping.
5. Missing import/export consistency, missing file headers/tags.

The checklists below are the **only** source of truth for closure.

---

## 6. Completion Checklists
### 6.1 Schema & Rules
- \[ ] Domain entities match canonical Zod schemas (L00).
- \[ ] Firestore rules enforce tenant + role model; tests added in rules-tests.
- \[ ] No route reads/writes old field names.

### 6.2 App Libs & Guards
- \[ ] `requireSession`, `requireOrgMembership`, `requireRole` live in App Libs and are reused.
- \[ ] Business logic (onboarding, labor math) imported from App Libs (no route-local logic).

### 6.3 API Routes
- \[ ] Every route conforms to **API Route Standard** (request parsing, Zod validate, error JSON).
- \[ ] Deprecated endpoints removed or wrapped by adapters mapping old→new (temporary, documented).

### 6.4 Import/Export
- \[ ] Importers accept CSV/XLSX; validate to schema; no UI coupling.
- \[ ] Exports stream CSV/JSON consistently; stable filenames; documented columns.

### 6.5 Testing/CI
- \[ ] Critical-path tests + key components run only in CI/Linux.
- \[ ] VS Code tasks disable background servers; docs warn explicitly.

---

## 7. Freeze Criteria (tag: `v14.5.0-bridge`)
- All 6.1–6.5 items checked.
- Bible v14.5 committed; standards present; templates compiling.
- CI green; Lighthouse ≥ 90 on golden path.
- Release notes written; v15 branch created.

---

## 8. Governance & Change Control
- Changes to standards require CTO approval pre-freeze.
- Post-freeze, only hotfixes; standards are immutable for v15 work.

---

## 9. Post-Freeze (v15 Path)
- v15 will **enforce** these standards and add features (directory UI, schedule hints, import
  assistant), not alter them.
