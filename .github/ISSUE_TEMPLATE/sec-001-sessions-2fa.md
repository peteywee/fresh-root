---
name: SEC-001 Sessions & 2FA (Prod-grade auth)
about: Enforce session-only auth + 2FA for privileged roles; ban dev headers in prod
title: "[SEC-001] Sessions & 2FA"
labels: ["security","backend","P0"]
assignees: ["peteywee"]
---

## Objective

Enforce **session-only authentication** in production and **2FA** for `org_owner|admin|manager`. Remove dev header pathways from prod.

## Scope

- Firebase session cookies (web) and verification middleware (API).
- 2FA enforcement for privileged roles.
- Prod build refuses any `x-user-token` or similar dev headers.

## Deliverables

- `apps/web/lib/session.ts`: session cookie create/verify helpers.
- `services/api/src/mw/session.ts`: middleware reading verified claims into `req.userToken`.
- `services/api/src/mw/session.guard.test.ts`: integration tests.
- Docs: `docs/SECURITY.md` auth section.

## Dependencies

- Firebase Auth, project config, cookie secret envs.

## Tasks

- [ ] Implement cookie-based session creation & invalidation.
- [ ] API middleware verifying Firebase session and populating claims.
- [ ] Gate writes: **require verified session** + role checks.
- [ ] Reject dev headers in `NODE_ENV=production`.
- [ ] Tests for 401 (no session), 403 (missing 2FA for privileged), 200 (happy path).
- [ ] Docs updated and envs added to `.env.example`.

## Acceptance Criteria

- POST privileged route w/o session ⇒ **401**.
- Manager/Owner missing 2FA ⇒ **403** with actionable message.
- All happy-path flows pass; no dev header accepted in prod.

## KPIs

- 100% privileged writes require verified session.
- 0 unauthenticated write attempts succeed (7-day logs).

## Definition of Done

- CI green (unit/rules), evidence links/screenshots in comments, merged to `develop`.
