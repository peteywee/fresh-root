# Issue #207: API Documentation (OpenAPI)

## Labels

- P0: MEDIUM
- Area: Documentation, API

## Objective

Generate comprehensive OpenAPI documentation for all API endpoints with interactive playground.

## Scope

**In:**

- OpenAPI spec generation from Zod schemas
- Swagger UI endpoint
- All endpoints documented
- Authentication flow documentation
- API playground

**Out:**

- SDK generation (future work)
- Versioning strategy (future work)
- Rate limit documentation (covered in API responses)

## Files / Paths

- `apps/web/app/api/docs/route.ts` - Swagger UI endpoint (NEW)
- `apps/web/lib/openapi.ts` - OpenAPI spec generator (NEW)
- Package dependencies: `next-swagger-doc`, `swagger-ui-react`, `zod-to-openapi`

## Commands

```bash
# Install OpenAPI tools
pnpm add next-swagger-doc swagger-ui-react zod-to-openapi

# Generate OpenAPI spec
pnpm generate:openapi

# Start dev server and access docs
pnpm dev
# Navigate to http://localhost:3000/api/docs
```

## Acceptance Criteria

- [ ] OpenAPI spec generated from Zod schemas
- [ ] Swagger UI accessible at /api/docs
- [ ] All endpoints documented
- [ ] API playground functional
- [ ] Authentication flow documented

## Success KPIs

- **Endpoint Coverage**: 100% of public API endpoints documented
- **Accuracy**: 0 documentation/implementation mismatches
- **Adoption**: Developer feedback positive
- **Maintenance**: Auto-generated from schemas (no manual sync)

## Definition of Done

- [ ] OpenAPI spec generated
- [ ] Swagger UI accessible
- [ ] All endpoints documented
- [ ] Authentication working in playground
- [ ] Linked in roadmap

**Status**: NOT STARTED | **Priority**: MEDIUM | **Effort**: 8 hours
