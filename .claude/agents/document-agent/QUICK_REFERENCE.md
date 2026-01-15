# Document Agent — Quick Reference

## Invocation
```
Use the document agent to document [target]
```

## Documentation Types
- **Code (JSDoc)**: Functions, classes, parameters
- **API**: Endpoints, schemas, examples
- **Architecture**: ADRs, design decisions
- **User**: README, guides, tutorials

## JSDoc Template
```typescript
/**
 * Brief description.
 *
 * @param {Type} name - Description
 * @returns {Type} Description
 * @throws {Error} When
 * @example
 * // Usage
 * functionName(arg);
 */
```

## ADR Template
```markdown
# ADR-XXX: Title
## Status: Proposed/Accepted
## Context: [Issue]
## Decision: [What we decided]
## Consequences: [Impacts]
```

## Validation
- [ ] All public APIs documented
- [ ] Examples provided
- [ ] Clear and accurate

## See Also
- [README.md](./README.md) — Full documentation
- [AGENT.md](./AGENT.md) — Configuration
