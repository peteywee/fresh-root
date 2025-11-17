# Fresh Schedules – Documentation Index (v15-prep)

This is the single entry point to navigate all project docs. It prioritizes **v15** artifacts while keeping historical material available under `archive/` and `v14/`.

---

## 1) Bibles & Scope

- **Project Bible v15.0.0** → `docs/bible/Project_Bible_v15.0.0.md`
- **Scope & Authority (v15)** → `docs/bible/Project_Bible_v15_SCOPE_AND_AUTHORITY.md`
- Historical:
  - v14 Bible → `docs/bible/Project_Bible_v14.0.0.md`
  - v13.5 Bible → `docs/bible/Project_Bible_v13.5.md`
  - v14 legacy extras → `docs/archive/Biblev14_legacy.md`
  - v14 freeze docs → `docs/v14/`

---

## 2) Migration (v15)

- **Plan** → `docs/bible/Project_Bible_v15_MIGRATION_PLAN.md`
- **Phase 2 (Crosswalks):**
  - Spec Crosswalk → `docs/migration/v15/PHASE2_SPEC_CROSSWALK.md`
  - Schema Crosswalk → `docs/migration/v15/PHASE2_SCHEMA_CROSSWALK.md`
- **Phase 3 (Execution):**
  - Code Migration Checklist → `docs/migration/v15/PHASE3_CODE_MIGRATION_CHECKLIST.md`
  - Data Migration Checklist → `docs/migration/v15/PHASE3_DATA_MIGRATION_CHECKLIST.md`
- **Phase 4 (Freeze):**
  - Hardening & Freeze → `docs/migration/v15/PHASE4_HARDENING_AND_FREEZE.md`

---

## 3) Layers (Contracts)

- L00 Domain Kernel → `docs/layers/LAYER_00_DOMAIN_KERNEL.md`
- L01 Infrastructure → `docs/layers/LAYER_01_INFRASTRUCTURE.md`
- **L02 Application Libraries → `docs/layers/LAYER_02_APPLICATION_LIBS.md` (canonical)**
- L03 API Edge → `docs/layers/LAYER_03_API_EDGE.md`
- L04 UI/UX → `docs/layers/LAYER_04_UI_UX.md`

---

## 4) Blocks & Quality

- Blocks overview → `docs/blocks/BLOCK1_BLOCK2_PROGRESS.md`, `docs/blocks/BLOCK3_IMPLEMENTATION.md`, `docs/blocks/BLOCK4_PLANNING.md`
- Quality & performance → `docs/quality/`
- Security → `docs/security/`

---

## 5) Runbooks

- Onboarding → `docs/runbooks/onboarding.md`
- Scheduling → `docs/runbooks/scheduling.md`
- Backup/Restore → `docs/runbooks/backup-scheduler.md`, `docs/runbooks/restore.md`
- Logging/Alerts → `docs/runbooks/logging-retention.md`, `docs/runbooks/uptime-alerts.md`

---

## 6) Schema

- Map → `docs/schema-map.md`
- Tenant → `docs/schema-network.md`

---

## 7) Tooling & Processes

- CI standards → `docs/tooling/CI_WORKFLOW_STANDARDS.md`
- Environment → `docs/tooling/environment.md`
- Repo standards → `docs/tooling/REPO_STANDARDS.md`
- Prompts & templates → `docs/prompts/`

> **Note:** Tests must run only in CI/Linux (not VS Code). See `docs/tooling/INTERACTIVE_TEST_RUNNER.md`.
