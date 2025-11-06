# Objective

---

name: SEC-002 Edge Controls (rate limits, WAF, caps)
about: Add rate-limit, Helmet, body-size caps, CORS; throttle abuse and reduce attack surface
title: "[SEC-002] Edge Controls"
labels: ["security", "platform", "backend", "P0"]
assignees: ["peteywee"]

---

## Objective

Protect the API with **rate-limits**, **WAF-style headers**, and **payload caps**.

## Scope

- Express layer: per-IP & per-user rate limit, Helmet, JSON body size cap (100–256 KB), CORS policy.

## Deliverables

- `services/api/src/mw/security.ts`: limiter + Helmet + size caps + CORS.
- `services/api/test/security.test.ts`: abuse/oversize tests.
- Docs snippet in `docs/SECURITY.md`.

## Tasks

- [ ] Sliding-window limit for write routes; separate bucket for reads.
- [ ] Body size caps; return 413 on oversize.
- [ ] Harden headers via Helmet; strict CORS domains.
- [ ] Tests that flood requests are throttled; oversize fails 413.

## Acceptance Criteria

- Flood test throttled deterministically.
- Oversize payload ⇒ **413 Payload Too Large**.
- No regressions on happy path.

## KPIs

- 99.9% uptime under synthetic attack sim.
- Error rate ≤ 1% during flood with intact service.

## Definition of Done

- CI green; code merged; `SECURITY.md` updated.
