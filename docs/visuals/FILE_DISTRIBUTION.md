# File Distribution

```mermaid
pie title File Types in Repository
    "TypeScript/TSX (292)" : 292
    "Tests (53)" : 53
    "Documentation (178)" : 178
    "Config & Other" : 50
```

## Codebase Metrics
- **TypeScript Files**: 292
- **Test Files**: 53
- **Documentation**: 178 files
- **Test Coverage**: Target 80%+

## File Organization
```
apps/
  web/
    app/              # Next.js App Router
    src/lib/          # Client utilities
    src/components/   # React components

packages/
  api-framework/     # SDK Factory pattern
  types/             # Zod schemas
  ui/                # Component library
  config/            # Shared configs

functions/           # Cloud Functions
tests/               # Integration & E2E tests
docs/                # Documentation
```
