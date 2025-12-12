## # Objective

name: UI-006 Design System Baseline (Tailwind + shadcn) about: Establish consistent tokens and
primitives; remove ad-hoc UI title: "\[UI-006] Design System Baseline" labels: \["ui", "frontend",
"P1"] assignees: \["peteywee"]

---

## Objective

Create a **cohesive UI** foundation that’s accessible, fast, and consistent.

## Scope

- Tailwind tokens, typography, spacing, radii, shadows.
- shadcn/ui primitives (Button, Input, Select, Dialog, Sheet, Tabs, Toast, Skeleton).

## Deliverables

- `apps/web/tailwind.config.ts`, `apps/web/styles/globals.css`
- `apps/web/components/ui/*` (generated shadcn components)

## Tasks

- \[ ] Configure theme tokens and typography scale.
- \[ ] Generate primitives via shadcn.
- \[ ] Replace ad-hoc buttons/inputs on Dashboard & Schedules.

## Acceptance Criteria

- Lighthouse overall ≥ **90** on Dashboard & Schedules.
- Lighthouse a11y ≥ **95**.

## KPIs

- Zero raw ad-hoc UI elements in code scan.

## Definition of Done

- Screenshots/Lighthouse reports attached; merged.
