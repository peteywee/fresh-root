---

id: A04 extends: 03_DIRECTIVES.md section: Rule Conflicts tags: \[rules, conflicts, resolution,
hierarchy] status: canonical priority: P1

## source: docs/reconciled-rulebook.md

# Amendment A04: Reconciled Rules & Conflict Resolution

## Purpose

Resolves conflicts between competing rules in 03_DIRECTIVES when multiple directives apply.

## Resolution Hierarchy

When directives conflict, apply in this order (highest to lowest):

1. **Security directives** → Always win
2. **Correctness** → Beats performance/convenience
3. **Maintainability** → Beats performance (unless critical path)
4. **Type safety** → Beats convenience
5. **Testing** → Required before merge
6. **Performance** → Optimize only after correctness verified

## Common Conflicts & Resolutions

### Conflict 1: Performance vs. Security

**Scenario**: Caching user data improves performance but may expose sensitive info\
**Resolution**: Security wins → encrypt cached data or reduce cache scope

### Conflict 2: Convenience vs. Type Safety

**Scenario**: Using `any` is faster to implement than proper types\
**Resolution**: Type safety wins → use proper types (may use `unknown` temporarily)

### Conflict 3: DRY vs. Clarity

**Scenario**: Abstract helper function vs. inline logic\
**Resolution**: Clarity wins if abstraction adds cognitive load

### Conflict 4: Early Optimization vs. Working Code

**Scenario**: Optimize before feature works\
**Resolution**: Working code wins → optimize after validation

## Escalation Path

If resolution unclear:

1. Check governance docs (01-12)
2. Check amendments (A01-A08)
3. Ask Orchestrator
4. If security-related → escalate to Security Red Team

## Pattern Examples

### Example 1: Input Validation

```typescript
// ❌ WRONG: Performance over security
if (input.length > 0) {
  process(input);
} // No validation

// ✅ CORRECT: Security first
const validated = InputSchema.parse(input); // Always validate
process(validated);
```

### Example 2: Error Handling

```typescript
// ❌ WRONG: Convenience over correctness
try {
  await action();
} catch {} // Silent failure

// ✅ CORRECT: Explicit error handling
try {
  await action();
} catch (err) {
  console.error("Action failed", { error: err.message });
  return errorResponse(err);
}
```

## Reference

Full rulebook: `archive/amendment-sources/reconciled-rulebook.md`
