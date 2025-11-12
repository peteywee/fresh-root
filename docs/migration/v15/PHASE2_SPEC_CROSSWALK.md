# Phase 2 – Spec Crosswalk (13.5 → 14 → 15)

**Purpose**  
Provide a **side-by-side mapping** of key concepts across v13.5, v14, and v15 plus the actual code locations.  
For each concept, we decide: **KEEP**, **CHANGE**, or **KILL** for v15 and point to the real implementation.

This file is meant to be **filled in over time** as migration work progresses.

---

## 1. Columns

Each row should use this structure:

- **Concept** – Domain or feature name (e.g., “Network”, “Onboarding Wizard”).
- **v13.5 Spec** – How 13.5 described it (short summary + section reference).
- **v14 Spec** – How 14 described it or changed it (short summary + ref).
- **Code Reality** – Where it currently lives in `fresh-root-main`.
- **v15 Decision** – `KEEP`, `CHANGE`, or `KILL`.
- **Notes** – Explanation and any migration notes.

---

## 2. Example Rows (remove once replaced)

| Concept | v13.5 Spec | v14 Spec | Code Reality | v15 Decision | Notes |
|--------|------------|----------|--------------|--------------|-------|
| Network / Org Model | Network → Org → Staff (early) | Expanded to Network → Corp → Org → Venue (noted gaps) | Types: `packages/types`, diagrams: `schema-network.md` | KEEP (refine) | Adopt full hierarchy; align rules + UI. |
| Onboarding Wizard | Basic user → org create/join | Flagged as under-specified | Routes: `apps/web/app/(onboarding)/**`; logic: `apps/web/src/lib/onboarding/**` | CHANGE | Define steps + validation contract formally. |

---

## 3. Crosswalk Table (working)

Prioritize tenant + scheduling + security primitives first.

| Concept | v13.5 Spec | v14 Spec | Code Reality | v15 Decision | Notes |
|--------|------------|----------|--------------|--------------|-------|
| Network | | | | | |
| Corp | | | | | |
| Org | | | | | |
| Venue | | | | | |
| Staff | | | | | |
| Onboarding Wizard | | | | | |
| Schedule Template | | | | | |
| Shift Instance | | | | | |
| Schedule Publish | | | | | |
| Attendance Record | | | | | |
| Manager Role | | | | | |
| Staff Role | | | | | |
| Session Handling | | | | | |
| MFA Flow | | | | | |
| Rate Limiting | | | | | |
| PWA Shell | | | | | |

---

## 4. Workflow for Filling Rows

1. Read v13.5 + v14 Bible sections.  
2. Inspect current code (types + implementation).  
3. Decide KEEP / CHANGE / KILL.  
4. Link code (path) + related layer doc.  
5. Open / link GitHub issue labeled `milestone:v15`.

---

## 5. Completion Definition

- All core rows populated (tenant, scheduling, attendance, roles, onboarding, security, PWA).  
- Each CHANGE/KILL has an issue.  
- No ambiguous blank cells in Decision column.  
- Reviewed + signed off by project owner.

