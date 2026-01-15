---
agent: "document-agent"
name: "Document Agent"
description: "Generate or update documentation (JSDoc, README, ADRs, API docs)"
version: "1.0.0"
category: "Planning & Documentation"
invocation:
  - type: "orchestration"
    pattern: "Use the document agent to document"
status: "active"
---

# Document Agent

Generate or update documentation (JSDoc, README, ADRs, API docs).

## Quick Start

Generate comprehensive documentation across multiple types.

## Invocation

```
Use the document agent to document the auth module
Run the document agent on this API route
Generate documentation for the schedule feature
```

## Documentation Types

- **Code (JSDoc)**: Functions, classes, parameters
- **API**: Endpoint specs, schemas, examples
- **Architecture**: ADRs, system design
- **User**: README, guides, tutorials

## Process

1. Documentation discovery (identify gaps)
2. Determine documentation type
3. Generate content (JSDoc, README, ADRs)
4. Validate completeness

## Output Format

- Markdown files for guides and ADRs
- JSDoc for code documentation
- API documentation with examples

## See Also

- [Implement Agent](./../implement-agent/) — Code implementation
- [Review Agent](./../review-agent/) — Code review
