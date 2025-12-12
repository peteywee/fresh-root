## # Objective

name: OBS-003 Observability (Sentry + OTel + JSON logs) about: Wire Sentry, structured logs with
reqId, and OpenTelemetry traces + dashboards title: "\[OBS-003] Observability" labels:
\["observability", "platform", "backend", "P1"] assignees: \["peteywee"]

---

## Objective

Full-stack **observability**: structured logs, error tracking, and distributed tracing with p95
dashboards and alerts.

## Scope

- API and Web: Sentry init, JSON logs (reqId, uid, orgId, route, latencyMs), OpenTelemetry spans.

## Deliverables

- `services/api/src/obs/sentry.ts`, `.../obs/otel.ts`, `.../obs/log.ts`
- `apps/web/lib/obs/sentry.ts`, `.../otel.ts`
- Dashboards & alert policies documentation.

## Tasks

- \[ ] Add reqId creation/propagation.
- \[ ] Structure all logs as JSON; no PII.
- \[ ] Sentry init and release tagging.
- \[ ] OTel tracer provider, spans around API and Firestore calls.
- \[ ] Grafana/Cloud dashboards + alert on error budget burn.

## Acceptance Criteria

- Synthetic error appears in Sentry with trace.
- p95 charts populated; alert fires on threshold breach.

## KPIs

- MTTR ≤ 30 minutes via error alert + trace pinpointing.

## Definition of Done

- CI green; dashboards & alert links posted in comments.
