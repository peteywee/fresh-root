# Fresh Schedules – Documentation Index (v15)

This index is the **entry point** for all project documentation. It tells you **where to look** for specs, migration plans, layer definitions, and runbooks.

---

## Section 1 – Bibles (Specs by Version)

| Version | Files | Status | Notes |
|---------|-------|--------|-------|
| v13.5 (Historical) | `docs/bible/Project_Bible_v13.5.md` | Historical | Early network/org/venue + onboarding concepts |
| v14.0.0 (Historical) | `docs/bible/Project_Bible_v14.0.0.md`, `docs/Biblev14.md` | Historical (reference) | Blocks 1–3 + GAPS |
| v15.0.0 (Canonical) | `docs/bible/Project_Bible_v15.0.0.md` | Canonical | All new work must align |
| v15 Migration Plan | `docs/bible/Project_Bible_v15_MIGRATION_PLAN.md` | Canonical | Operational transition plan |

---

## Section 2 – Migration (v15)

Directory: `docs/migration/v15/`

| Phase | Docs | Purpose |
|-------|------|---------|
| Phase 1 – Discover | `PHASE1_DOCUMENT_INVENTORY.md`, `PHASE1_PATTERN_MAP.md` | Inventory + pattern freeze |
| Phase 2 – Crosswalks | `PHASE2_SPEC_CROSSWALK.md`, `PHASE2_SCHEMA_CROSSWALK.md` | Map legacy → v15 concepts & schemas |
| Phase 3 – Migration | `PHASE3_CODE_MIGRATION_CHECKLIST.md` (TBD), `PHASE3_DATA_MIGRATION_CHECKLIST.md` (TBD) | Execute code + data changes |
| Phase 4 – Freeze | `PHASE4_HARDENING_AND_FREEZE.md` (TBD) | Hardening & release tag |

---

## Section 3 – Layers (Architecture Contracts)

| Layer | Doc | Responsibility |
|-------|-----|----------------|
| 00 | `LAYER_00_DOMAIN_KERNEL.md` | Domain types, Zod schemas, invariants |
| 01 | `LAYER_01_INFRASTRUCTURE.md` | Firebase Admin, env, rules, observability |
| 02 | `LAYER_02_APP_LIBS.md` | Application logic (onboarding, scheduling, guards) |
| 03 | `LAYER_03_API_EDGE.md` | HTTP boundaries / API routes / middleware |
| 04 | `LAYER_04_UI_UX.md` | Pages, components, design system, UX flows |

---

## Section 4 – Other Important Docs

Supporting material (non-exhaustive):

- `docs/ARCHITECTURE_DIAGRAMS.md`
- `docs/schema-map.md`
- `docs/schema-network.md`
- `docs/BLOCK1_SLO_SUMMARY.md`
- `docs/BLOCK3_IMPLEMENTATION.md`
- `docs/BLOCK4_PLANNING.md`
- `docs/CLEANUP_SUMMARY_2025-11-07.md`
- `docs/COMPLETE_TECHNICAL_DOCUMENTATION.md`

---

## Section 5 – How to Use This Index

1. Unsure where something lives? Start here and pick Bible / Migration / Layers / Other.
2. Changing behavior or flows? Read `Project_Bible_v15.0.0.md` → relevant layer doc → migration crosswalk(s).
3. Migration work? Keep crosswalks & checklists updated with each change.
4. Adding an architectural concept? Update Bible (if conceptual), layer doc (if structural), migration docs (if transitional).

---

## Section 6 – Ownership & Update Policy

Owner: Patrick (CTO / Lead Architect) + AI assistant.
Policy: Every architecture/domain/flow change updates this index and related migration docs.
Historical bibles (v13.5/v14) are read‑only except status annotations.

---

## 4. Other Important Docs (Existing)

Examples (paths may vary slightly):

- `docs/ARCHITECTURE_DIAGRAMS.md`
- `docs/schema-map.md`
- `docs/schema-network.md`
- `docs/BLOCK1_SLO_SUMMARY.md`
- `docs/BLOCK3_IMPLEMENTATION.md`
- `docs/BLOCK4_PLANNING.md`
- `docs/CLEANUP_SUMMARY_2025-11-07.md`
- `docs/COMPLETE_TECHNICAL_DOCUMENTATION.md`

These are referenced by the v15 Bible and Migration Plan as **supporting material**.

---

## 5. How to Use This Index

1. **You don’t know where something lives?**
   - Start here.
   - Choose: Bible / Migration / Layers / Other.

2. **You need to change behavior or flows?**
   - Read `Project_Bible_v15.0.0.md` first.
   - Then find the relevant section in `docs/layers/`.
   - Finally, look at the migration docs if this touches old behavior.

3. **You’re doing migration work?**
   - Start in `docs/migration/v15/`.
   - Never change code without updating the corresponding checklist or crosswalk.

---

## 6. Ownership and Status

- **Owner:** CTO / Lead Architect (currently: Patrick + AI assistant).
- **Update policy:**
  - Every significant code change that affects architecture, domain, or flows must be reflected here.
  - v13.5 and v14 docs must not be edited except to mark them explicitly as “historical”.

