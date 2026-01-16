---

agent: "agent"
description: "Code review with priority tiers (Critical/Important/Suggestion)"
## tools: \["search/codebase", "changes", "problems", "usages", "runTasks"]

# Code Review
## Directive
Review: `${input:Target}`

Target can be: file path, "changes" for staged changes, or "pr" for current PR.

## Purpose
This prompt conducts thorough code reviews following the Fresh Schedules review standards,
identifying issues by priority (Critical → Important → Suggestion) and ensuring alignment with
established patterns.

## Review Workflow
### Phase 1: Context Gathering
1. **Understand the change scope**
   - What files are modified?
   - What is the intent of the change?
   - What existing patterns does this touch?

1. **Load relevant context**
   - Read the CODING\_RULES\_AND\_PATTERNS.md
   - Check for related tests
   - Review Firestore rules if data changes
   - Check API route patterns if SDK factory involved

### Phase 2: Review Checklist
#### 🔴 CRITICAL (Block Merge)
| Category             | Check                                 |
| -------------------- | ------------------------------------- |
| **Security**         | No exposed secrets, proper auth/authz |
| **Correctness**      | No logic errors, race conditions      |
| **Breaking Changes** | API contracts preserved or versioned  |
| **Data Safety**      | No data loss or corruption risk       |
| **Input Validation** | All inputs validated with Zod         |
| **Org Isolation**    | All queries scoped to orgId           |

#### 🟡 IMPORTANT (Requires Discussion)
| Category           | Check                               |
| ------------------ | ----------------------------------- |
| **Code Quality**   | SOLID principles, no duplication    |
| **Test Coverage**  | Tests for new/changed functionality |
| **Performance**    | No N+1 queries, proper caching      |
| **Architecture**   | Follows SDK factory pattern         |
| **Triad of Trust** | Schema + API + Rules aligned        |

#### 🟢 SUGGESTION (Non-blocking)
| Category           | Check                      |
| ------------------ | -------------------------- |
| **Readability**    | Clear naming, simple logic |
| **Optimization**   | Performance improvements   |
| **Best Practices** | Minor convention alignment |
| **Documentation**  | JSDoc, README updates      |

### Phase 3: Pattern Validation
Run pattern validator checks:

```bash
# Check for pattern violations
node scripts/validate-patterns.mjs --verbose

# Tier 0 (Security): -25 pts, blocks PR
# Tier 1 (Integrity): -10 pts, blocks PR
# Tier 2 (Architecture): -2 pts, warning
# Tier 3 (Style): -0.5 pts, info
# Minimum passing score: 90
```

### Phase 4: Review Output Format
```markdown
## Code Review: [File/PR Title]
### Summary
Brief description of what was reviewed and overall assessment.

### 🔴 Critical Issues
1. **[SEC-01]** Description of critical issue
   - File: `path/to/file.ts:42`
   - Impact: What could go wrong
   - Fix: How to resolve

### 🟡 Important Items
1. Description of important issue
   - Why it matters
   - Suggested resolution

### 🟢 Suggestions
1. Minor improvement suggestion

### ✅ What's Good
- Highlight well-implemented aspects
- Acknowledge good patterns used

### Checklist
- [[ ]] All critical issues resolved
- [[ ]] Tests pass
- [[ ]] Pattern validator score ≥ 90
- [[ ]] Triad of Trust verified (if applicable)
```

## Review Categories
### SDK Factory Review
When reviewing API routes:

- Uses `createOrgEndpoint` / `createAuthenticatedEndpoint` / `createPublicEndpoint`
- Input validation via `input: ZodSchema`
- Proper role-based access (`roles: ['manager']`)
- Rate limiting configured
- Org scoping in Firestore queries

### Security Review
- No secrets in code (env vars only)
- CSRF protection on mutations
- Rate limiting on sensitive endpoints
- Proper error logging (with context, no secrets)
- Auth middleware applied

### TypeScript Review
- Strict mode compliance
- No `any` types (use `unknown` + guards)
- Proper Zod inference (`z.infer<typeof Schema>`)
- No type duplication

### Test Review
- Unit tests for logic
- Integration tests for flows
- Mock utilities used correctly
- Coverage for new code paths

## Integration
This review prompt integrates with:

- `/audit` - Deep security audit
- `/red-team` - Adversarial analysis
- `/test` - Generate missing tests
- Pattern validator in CI pipeline
