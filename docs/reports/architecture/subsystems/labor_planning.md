# L2 — Labor Planning & Forecasting

> **Status:** Draft (repo-grounded fill).

This subsystem covers labor budgeting inputs (forecast sales, labor % targets, average wage) and
the computations that inform staffing decisions.

## 1. Role in the System

- Convert demand forecasts (e.g. sales) and policy inputs into labor budget constraints.
- Provide fast, deterministic calculations used during scheduling.
- Serve as an input layer for shift generation/assignment.

Key locations in this repo:

- `apps/web/src/lib/labor/computeLaborBudget.ts` (core calculation function).
- `apps/web/src/lib/store.ts` (client-side planning inputs persisted via Zustand).
- Related scheduling context: `docs/reports/mega-report/03_SUBSYSTEMS_L2/scheduling.md`.

## 2. Panel Summary (Initial Pass)

- Distributed Systems (Elena): Mostly local computation; distributed concerns arise when syncing inputs across clients/orgs.
- Security (Marcus): Budget inputs may be sensitive (wages); ensure access control if stored/shared.
- DDD (Ingrid): Treat “Planning” as a domain with explicit value objects and invariants.
- Platform (Kenji): Keep compute functions pure and testable; avoid hidden dependencies.
- Staff Engineer (Priya): Ensure input validation is explicit and errors are predictable.
- Database (Omar): If persisted in Firestore, define canonical document structure and revision strategy.
- API Design (Sarah): Expose stable DTOs for planning inputs and outputs; avoid leaking UI-only state.
- Devil's Advocate (Rafael): Oversimplified budgeting can mislead; document assumptions and rounding rules.
- Strategic/Impact (Victoria): Labor planning is core product value; correctness and clarity matter more than cleverness.

## 3. Critical Findings (Current)

No confirmed “Critical” issues recorded in this doc yet.

Known constraints visible in code:

- `computeLaborBudget` throws `RangeError` for invalid inputs and uses simple formulas (dollars and hours).
- Planning inputs are currently stored client-side (`apps/web/src/lib/store.ts`) and default to example values.

## 4. Architectural Notes & Invariants

- Calculations must be deterministic and unit-testable (pure functions with explicit inputs/outputs).
- Input validation must reject non-finite numbers and out-of-range percentages.
- Rounding behavior should be explicit and consistent across UI and backend.
- If planning is persisted server-side, treat wages as sensitive data and apply strict role-based access.

## 5. Example Patterns

- **Good Pattern Example:** Explicit contract docs and predictable errors in `apps/web/src/lib/labor/computeLaborBudget.ts`.
- **Risky Pattern Example:** Storing sensitive wage/budget inputs only client-side (no shared source-of-truth) if collaboration is expected.
- **Refactored Pattern:** Introduce a shared “planning” schema in `packages/types` and persist org-level planning inputs with auditability.

## 6. Open Questions

- Are forecast inputs per-venue, per-zone, or global per org?
- Should labor planning be saved as drafts with versioning/audit logs?
- What are the expected compliance constraints that interact with budgeting (breaks, overtime rules, max hours)?

