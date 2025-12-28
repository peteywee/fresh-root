# Issue #212: Service Separation

## Labels

- P0: STRATEGIC
- Area: Architecture, Backend

## Objective

Separate monolithic application into autonomous microservices for better scalability and maintainability.

## Scope

**In:**
- Extract API service as autonomous service
- Implement event-driven architecture
- Service-to-service authentication
- API gateway configuration
- Service mesh (optional)

**Out:**
- Frontend separation (future work)
- Database per service (future work)
- Complete service mesh (optional for v1)

## Files / Paths

- New repository: `fresh-root-api-service`
- Event bus configuration (Pub/Sub/Kafka/Firebase Events)
- API gateway configuration (Kong/Tyk/AWS API Gateway)
- Service mesh configuration (Istio/Linkerd - optional)
- `docs/architecture/SERVICE_SEPARATION_PLAN.md` - Architecture plan (NEW)

## Commands

```bash
# Set up new service repository
git clone <api-service-repo>
cd fresh-root-api-service

# Deploy API service independently
pnpm deploy:api-service

# Configure API gateway
# See docs/architecture/SERVICE_SEPARATION_PLAN.md

# Test service-to-service communication
curl http://api-gateway/api/schedules
```

## Acceptance Criteria

- [ ] API service extracted and autonomous
- [ ] Event-driven communication working
- [ ] Service-to-service auth implemented
- [ ] API gateway routing traffic
- [ ] Services deploy independently
- [ ] Backward compatibility maintained

## Success KPIs

- **Service Independence**: 100% - services deploy separately
- **Event Latency**: <100ms for event propagation
- **Gateway Performance**: <50ms overhead
- **Deployment Time**: <15 minutes per service

## Definition of Done

- [ ] Services deployed independently
- [ ] Event-driven architecture operational
- [ ] API gateway configured
- [ ] Documentation complete
- [ ] Linked in roadmap

**Status**: NOT STARTED | **Priority**: STRATEGIC | **Effort**: 80 hours
