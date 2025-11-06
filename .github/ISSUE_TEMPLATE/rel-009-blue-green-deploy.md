# Objective

---

name: REL-009 Blue/Green Deployment (zero downtime)
about: Deploy with smoke tests and automatic promotion; verified rollback
title: "[REL-009] Blue/Green Deploy"
labels: ["release", "platform", "P1"]
assignees: ["peteywee"]

---

## Objective

Achieve **zero-downtime** deploys with fast rollback.

## Scope

- Preview/green environment, smoke tests, auto-promotion, rollback script.

## Deliverables

- `.github/workflows/deploy.yml`
- `scripts/ops/rollback.sh`

## Tasks

- [ ] Provision green env; run smoke on deploy.
- [ ] Auto-promote when green; retain blue for fallback.
- [ ] Implement rollback script; document switchback.

## Acceptance Criteria

- Switchback completed in **< 5 minutes**.
- Smoke suite must be green pre-promotion.

## KPIs

- Downtime **0 min** across releases.

## Definition of Done

- Demo video/logs; merged with workflow in place.
