---
name: UX-007 Scheduler Week Grid (virtualized + publish pipeline)
about: Deliver the sub-5-minute scheduling flow with performant grid and keyboard ops
title: "[UX-007] Scheduler Week Grid"
labels: ["ux","frontend","P1"]
assignees: ["peteywee"]
---

## Objective

Hit the **publish ≤ 5 minutes** benchmark with a fast Week grid and keyboard-first flow.

## Scope

- Virtualized grid, drag-create/resize, keyboard shortcuts (N new, D duplicate).
- Sticky budget header (allowed hours calc) with warnings.

## Deliverables

- `apps/web/components/scheduler/*`
- `apps/web/app/(schedules)/*`

## Tasks

- [ ] Implement virtualization and drag/resize interactions.
- [ ] Keyboard shortcuts and conflict highlights.
- [ ] Budget header: allowed$ and allowedHours from inputs.

## Acceptance Criteria

- 1k visible rows ≥ **55 FPS**.
- Create 10 shifts in **< 90s**.
- Publish schedule in **≤ 5 minutes** with demo org.

## KPIs

- Time-to-interactive (Schedules) ≤ 2.5s, CLS < 0.01.

## Definition of Done

- Video evidence attached; CI green; merged.
