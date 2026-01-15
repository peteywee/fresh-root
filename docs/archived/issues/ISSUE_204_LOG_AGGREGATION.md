# Issue #204: Log Aggregation Configuration
## Labels
- P0: MEDIUM
- Area: Observability, DevOps

## Objective
Configure centralized log aggregation to enable efficient debugging of production issues and improve observability.

## Scope
**In:**

- Log aggregation service setup (Datadog/ELK/Loki)
- Structured logging configuration
- Log shipping setup
- Contextual logging (requestId, userId, orgId)
- Alert configuration for critical log patterns

**Out:**

- Log analytics/ML (future work)
- Custom log parsing (use standard formats)
- Historical log migration

## Files / Paths
- `apps/web/src/lib/logger.ts` - Enhanced structured logging
- `docker-compose.yml` - Log aggregation service (if self-hosted)
- `.env.production` - Log aggregation credentials
- `docs/OBSERVABILITY_SETUP.md` - Logging guide (NEW)
- `docs/runbooks/LOG_QUERIES.md` - Common log queries (NEW)

## Commands
```bash
# Test structured logging locally
pnpm dev

# Make test request
curl http://localhost:3000/api/schedules

# Query logs (example for Datadog)
# See docs/runbooks/LOG_QUERIES.md for service-specific commands
```

## Acceptance Criteria
- \[ ] Log aggregation service configured
- \[ ] Logs centralized and searchable
- \[ ] Alerts configured for critical patterns
- \[ ] Documentation complete
- \[ ] Retention policies set
- \[ ] RequestId correlation working

## Success KPIs
- **Log Centralization**: 100% of application logs aggregated
- **Search Performance**: <2s to query last 24h of logs
- **Alert Response**: <5min from error to alert
- **Retention**: 30 days minimum

## Definition of Done
- \[ ] CI green
- \[ ] Docs updated
- \[ ] Log aggregation operational
- \[ ] Alerts tested and working
- \[ ] Linked in roadmap

**Status**: NOT STARTED | **Priority**: MEDIUM | **Effort**: 4 hours
