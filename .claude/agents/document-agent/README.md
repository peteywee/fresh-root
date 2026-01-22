# Document Agent

Generate or update documentation (JSDoc, README, ADRs, API docs).

## Overview

The Document Agent generates and maintains comprehensive documentation following Fresh Schedules
standards.

## When to Use

✅ **Use this agent for**:

- Generate JSDoc for new code
- Update API documentation
- Create ADRs for decisions
- Generate README files
- Create user guides

❌ **Don't use this agent for**:

- Code implementation (use Implement Agent)
- Code review (use Review Agent)

## Invocation

```
Use the document agent to document the auth module
Generate documentation for the schedule API
Create ADR for the new caching strategy
```

## Documentation Types

### Code (JSDoc)

```typescript
/**
 * Brief description of what the function does.
 *
 * @param {Type} paramName - Description
 * @returns {Type} Description
 * @throws {ErrorType} When thrown
 * @example
 * // Example usage
 * const result = functionName(arg1);
 */
```

### API Documentation

- HTTP method and path
- Authentication requirements
- Request schema
- Response schema
- Error responses
- Examples

### Architecture (ADR Format)

```markdown
# ADR-XXX: Title

## Status

Proposed | Accepted

## Context

The issue we're seeing...

## Decision

What we've decided...

## Consequences

What becomes easier/harder...
```

### User Documentation

- README files
- How-to guides
- Tutorials
- Getting started

## Process

1. **Documentation Discovery**
   - Identify documentation gaps
   - Check existing documentation
   - Determine documentation type

2. **Documentation Generation**
   - Generate JSDoc
   - Generate API docs
   - Generate ADRs
   - Generate user guides

3. **Validation**
   - All public APIs documented
   - Examples provided
   - Clear and accurate

## Output Format

- Markdown files for guides and architecture
- JSDoc in source files
- API documentation with examples

## See Also

- [Implement Agent](./../implement-agent/) — Code implementation
- [Review Agent](./../review-agent/) — Code review
