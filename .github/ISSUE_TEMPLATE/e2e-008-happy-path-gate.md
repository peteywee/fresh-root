# Objective

---

name: E2E-008 Happy Path Gate (Playwright)
about: Automate onboarding → create org → plan → publish; gate PRs on E2E
title: "[E2E-008] Happy Path Gate"
labels: ["e2e", "platform", "P1"]
assignees: ["peteywee"]

---

## Objective

Automate the **end-to-end** flow and make it a required PR check.

## Scope

- Playwright spec covering: sign-in → onboarding → org → forecast/wage/labor% → schedule creation → publish → role rules.

## Deliverables

- `e2e/playwright/*.spec.ts`
- CI update in `.github/workflows/ci.yml`

## Tasks

- [ ] Seed data fixtures.
- [ ] Implement E2E with screenshots/video artifacts.
- [ ] Make E2E a required check on `develop` and `main`.

## Acceptance Criteria

- E2E green in CI, artifacts uploaded on failure.

## KPIs

- 100% critical flow coverage; PRs blocked when failing.

## Definition of Done

- Required check active; merged with evidence.
