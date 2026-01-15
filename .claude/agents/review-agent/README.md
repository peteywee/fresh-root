# Review Agent

Code review with priority tiers (Critical/Important/Suggestion).

## Overview

The Review Agent conducts thorough code reviews following Fresh Schedules review standards. It identifies issues by priority level (Critical → Important → Suggestion) and ensures alignment with established patterns.

## When to Use

✅ **Use this agent for**:
- Review before merging to main
- Check against coding standards
- Validate pattern compliance
- Verify Triad of Trust

❌ **Don't use this agent for**:
- Quick feedback (use direct comment)
- Test generation (use Test Agent)
- Security testing (use Audit/Red Team Agent)

## Invocation

```
Run the review agent on the PR changes
Use the review agent to review the new authentication module
Review these API routes
```

## Review Workflow

### Phase 1: Context Gathering
- Understand change scope
- Load relevant context
- Check related tests
- Review Firestore rules
- Check API patterns

### Phase 2: Review Checklist

🔴 **CRITICAL** (Block Merge):
| Category | Check |
|----------|-------|
| **Security** | No exposed secrets, proper auth/authz |
| **Correctness** | No logic errors, race conditions |
| **Breaking Changes** | API contracts preserved |
| **Data Safety** | No data loss or corruption |
| **Input Validation** | All inputs validated with Zod |
| **Org Isolation** | All queries scoped to orgId |

🟡 **IMPORTANT** (Requires Discussion):
| Category | Check |
|----------|-------|
| **Code Quality** | SOLID principles, no duplication |
| **Test Coverage** | Tests for new/changed functionality |
| **Performance** | No N+1 queries, proper caching |
| **Architecture** | Follows SDK factory pattern |
| **Triad of Trust** | Schema + API + Rules aligned |

🟢 **SUGGESTION** (Non-blocking):
| Category | Check |
|----------|-------|
| **Readability** | Clear naming, simple logic |
| **Optimization** | Performance improvements |
| **Best Practices** | Minor convention alignment |
| **Documentation** | JSDoc, README updates |

### Phase 3: Pattern Validation
```bash
node scripts/validate-patterns.mjs --verbose
# Tier 0 (Security): -25 pts, blocks PR
# Tier 1 (Integrity): -10 pts, blocks PR
# Tier 2 (Architecture): -2 pts, warning
# Tier 3 (Style): -0.5 pts, info
# Minimum passing score: 90
```

### Phase 4: Review Output
```markdown
## Code Review: [Target]

### 🔴 Critical Issues
1. **[SEC-01]** Description
   - File: path:line
   - Impact: What could go wrong
   - Fix: Resolution

### 🟡 Important Items
1. Description and suggestion

### 🟢 Suggestions
1. Minor improvement

### ✅ What's Good
- Highlight well-implemented aspects

### Checklist
- [ ] All critical issues resolved
- [ ] Tests pass
- [ ] Pattern validator score ≥ 90
```

## See Also

- [Implement Agent](./../implement-agent/) — Execute implementations
- [Test Agent](./../test-agent/) — Test generation
- [Red Team Agent](./../red-team-agent/) — Security testing
