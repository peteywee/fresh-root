# Issue #217: GraphQL API Layer

## Labels

- P0: FUTURE
- Area: API, Backend

## Objective

Implement GraphQL API layer alongside REST API for more flexible client queries and reduced over-fetching.

## Scope

**In:**

- GraphQL schema design
- GraphQL server setup (Apollo/GraphQL Yoga)
- Type generation from schemas
- GraphQL playground
- Query optimization

**Out:**

- Complete REST API replacement (maintain both)
- Real-time subscriptions (future work)
- GraphQL federation (future work)

## Files / Paths

- `apps/web/app/api/graphql/route.ts` - GraphQL endpoint (NEW)
- `graphql/schema.graphql` - GraphQL schema (NEW)
- `graphql/resolvers/` - Resolver implementations (NEW)
- Type generation configuration
- `docs/API_GRAPHQL_GUIDE.md` - GraphQL documentation (NEW)

## Commands

```bash
# Install GraphQL dependencies
pnpm add graphql apollo-server-nextjs graphql-tag

# Generate types from schema
pnpm generate:graphql-types

# Start GraphQL playground
pnpm dev
# Navigate to http://localhost:3000/api/graphql

# Run GraphQL query
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ schedules { id name } }"}'
```

## Acceptance Criteria

- [ ] GraphQL schema designed
- [ ] GraphQL server operational
- [ ] Type generation working
- [ ] Playground accessible
- [ ] Core queries implemented

## Success KPIs

- **Query Performance**: p95 <200ms
- **Type Safety**: 100% generated types
- **Adoption**: 20% of clients using GraphQL
- **Documentation Quality**: All queries documented

## Definition of Done

- [ ] GraphQL API operational
- [ ] Types generated automatically
- [ ] Playground functional
- [ ] Documentation complete
- [ ] Linked in roadmap

**Status**: NOT STARTED | **Priority**: FUTURE | **Effort**: 40 hours
