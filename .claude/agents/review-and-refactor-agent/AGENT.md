---
agent: "review-and-refactor-agent"
name: "Review & Refactor Agent"
description: "Review and refactor code according to guidelines"
version: "1.0.0"
category: "Quality & Process"
invocation:
  - type: "orchestration"
    pattern: "Use the review and refactor agent to refactor"
status: "active"
---

# Review & Refactor Agent

Review and refactor code in your project according to defined instructions.

## Quick Start

Review coding guidelines and refactor code to match standards.

## Invocation

```
Use the review and refactor agent to refactor the auth module
Run the review and refactor agent on these files
Refactor this code to match guidelines
```

## Process

1. Load coding guidelines (`.github/instructions/*.md`)
2. Review code carefully
3. Refactor to match standards
4. Keep files intact (no splitting)
5. Ensure tests still pass

## See Also

- [Review Agent](./../review-agent/) — Code review
- [Implement Agent](./../implement-agent/) — Implementation
