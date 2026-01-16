---
agent: "review-agent"
name: "Review Agent"
description: "Code review with priority tiers (Critical/Important/Suggestion)"
version: "1.0.0"
category: "Quality & Process"
invocation:
  - type: "orchestration"
    pattern: "Use the review agent to review code"
status: "active"
tools:
  - "search/codebase"
  - "changes"
  - "problems"
  - "usages"
  - "runTasks"
---

# Review Agent

Code review with priority tiers (Critical/Important/Suggestion).

## Quick Start

Use this agent to:
- Review code changes with tiered priorities
- Check against coding standards
- Validate pattern compliance
- Verify Triad of Trust (Schema + API + Rules)
- Run pattern validator

## Invocation

```
Use the review agent to review this code
Run the review agent on the PR changes
Review the new API routes
```

## Review Tiers

🔴 **CRITICAL** (Block Merge):
- Security issues
- Logic errors
- Breaking changes
- Data safety risks
- Input validation
- Organization isolation

🟡 **IMPORTANT** (Requires Discussion):
- Code quality
- Test coverage
- Performance
- Architecture
- Triad of Trust

🟢 **SUGGESTION** (Non-blocking):
- Readability
- Optimization
- Best practices
- Documentation

## Output Format

```markdown
## Code Review: [Target]
### 🔴 Critical Issues
1. **[SEC-01]** Description
   - File: path/to/file.ts:42
   - Impact: [consequence]
   - Fix: [resolution]

### 🟡 Important Items
1. Description and suggestion

### 🟢 Suggestions
1. Minor improvement

### ✅ What's Good
- Highlight well-implemented aspects
```

## See Also

- [Implement Agent](./../implement-agent/) — Execute implementations
- [Test Agent](./../test-agent/) — Test generation
- [Red Team Agent](./../red-team-agent/) — Security testing
