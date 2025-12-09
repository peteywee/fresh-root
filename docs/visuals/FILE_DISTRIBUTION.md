# File Distribution

```mermaid
pie title File Types in Repository
    "TypeScript/TSX (289)" : 289
    "Tests (52)" : 52
    "Documentation (176)" : 176
    "Config & Other" : 50
```

## Codebase Metrics
- **TypeScript Files**: 289
- **Test Files**: 52
- **Documentation**: 176 files
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
