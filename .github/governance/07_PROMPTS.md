# FRESH SCHEDULES - PROMPTS

> **Version**: 1.0.0\
> **Status**: REFERENCE\
> **Authority**: Sr Dev / Architecture\
> **Binding**: NO - These are templates

This document provides prompt templates for common agent invocations.

---

## ARCHITECT PROMPTS

### P-ARCH-001: Design New Feature

```
@architect design {FeatureName}

Context:
- Business requirement: {requirement}
- Affected domains: {domains}
- User roles involved: {roles}

Constraints:
- Must integrate with existing {existingSystem}
- Must support {scalability requirement}
- Timeline: {deadline}

Output needed:
- Schema definition
- API routes
- Firestore rules
- Migration plan (if applicable)
```

### P-ARCH-002: Design Schema Extension

```
@architect schema {EntityName}

Current schema: {link to existing}

New requirements:
- Add field: {fieldName} ({type}) for {purpose}
- Validation: {rules}
- Default value: {default or none}

Questions:
- Is this a breaking change?
- What's the migration path?
- Any security implications?
```

### P-ARCH-003: Review Architecture Decision

```
@architect review

Proposed change:
{description of proposed architecture change}

Rationale:
{why this approach was chosen}

Alternatives considered:
1. {alternative 1}
2. {alternative 2}

Questions:
- Does this align with existing patterns?
- What are the trade-offs?
- Should we document this as an ADR?
```

### P-ARCH-004: Design API Endpoint

```
@architect design api {resource}

Purpose: {what this endpoint does}
HTTP Method: {GET/POST/PUT/PATCH/DELETE}
Path: /api/{path}

Request:
- Body: {schema or none}
- Query params: {params or none}
- Path params: {params or none}

Response:
- Success: {expected data}
- Errors: {expected error cases}

Authorization:
- Required roles: {roles}
- Org scoping: {yes/no}
```

---

## REFACTOR PROMPTS

### P-REF-001: Fix Pattern Violation

```
@refactor fix {filepath}

Violation: {pattern_id}
Line: {line number}
Current code: {snippet or "see file"}

Expected pattern: {description}

Constraints:
- Minimal change only
- Don't change behavior
- Must pass typecheck
```

### P-REF-002: Apply Pattern to File

```
@refactor apply {pattern_id} to {filepath}

Pattern: {pattern_id} - {description}

File currently:
- Uses {old pattern}
- Needs to use {new pattern}

Example of correct pattern:
{code example}
```

### P-REF-003: Migrate to New API

```
@refactor migrate {filepath}

From: {old API/pattern}
To: {new API/pattern}

Current code uses:
- {old import}
- {old function call}

Should use:
- {new import}
- {new function call}

Reference: {link to migration guide}
```

### P-REF-004: Fix Type Error

```
@refactor fix type error in {filepath}:{line}

Error: {TypeScript error message}
Code: {problematic snippet}

Likely cause: {guess}

Constraints:
- Don't use `any`
- Don't use `// @ts-ignore`
- Preserve existing behavior
```

---

## GUARD PROMPTS

### P-GUARD-001: Review PR

```
@guard review PR#{number}

Target branch: {branch}
Changes: {summary or "see PR"}

Focus areas:
- Security: {specific concerns or "standard"}
- Performance: {specific concerns or "standard"}
- Tests: {coverage expectations}

Strict mode: {yes/no}
```

### P-GUARD-002: Pre-Submit Check

```
@guard review

About to submit changes to {files}

Target: {branch}

Questions:
- Ready to merge?
- Any blocking issues?
- What should I fix before submitting?
```

### P-GUARD-003: Security Review

```
@guard security review {filepath}

This file handles: {auth/data/secrets/etc}

Specific concerns:
- {concern 1}
- {concern 2}

Check for:
- Org isolation
- Role-based access
- Input validation
- Secret exposure
```

### P-GUARD-004: Merge Readiness

```
@guard merge check

PR: #{number}
Source: {branch}
Target: {branch}

Gates passed:
- [[ ]] STATIC
- [[ ]] CORRECTNESS
- [[ ]] SAFETY

Approvals: {count}

Question: Can this merge now?
```

---

## AUDITOR PROMPTS

### P-AUDIT-001: Full Compliance Report

```
@auditor report

Scope: full repository
Format: full
Compare to: {previous commit or "none"}

Include:
- Security compliance
- Type safety score
- Pattern compliance
- Test coverage
- Trend analysis
```

### P-AUDIT-002: Scoped Report

```
@auditor report --scope={path}

Focus: {path}
Format: {full/summary/json}

Specific checks:
- {specific pattern}
- {specific metric}
```

### P-AUDIT-003: Compare Commits

```
@auditor compare {commit1} {commit2}

Show:
- What changed between commits
- Compliance delta
- New violations introduced
- Violations fixed
```

### P-AUDIT-004: Sprint Health Check

```
@auditor report

Period: last {n} days
Format: summary

Questions:
- Are we improving or degrading?
- What are the top 3 issues to fix?
- What's blocking our compliance score?
```

---

## ORCHESTRATOR PROMPTS

### P-ORCH-001: Multi-Agent Task

```
{task description}

This requires:
- Design from Architect
- Review from Guard
- {any other agents}

Run in parallel where possible.
Synthesize results.
```

### P-ORCH-002: Design and Review

```
Design and review a new {feature} feature

Requirements:
{requirements}

I need:
1. Architecture design
2. Review of that design
3. Implementation recommendations
```

### P-ORCH-003: Audit and Fix

```
Find and fix all {pattern_id} violations

1. Run audit to find violations
2. Generate fixes for each
3. Show me the diffs
```

### P-ORCH-004: Comprehensive Analysis

```
Analyze {path or feature}

I need perspectives from:
- Architect: Is the structure sound?
- Guard: Are there security issues?
- Auditor: How does it compare to standards?

Synthesize findings into actionable recommendations.
```

---

## COMMON TASK PROMPTS

### Create New Entity (Full Flow)

```
Create a new {EntityName} entity

Business requirements:
- {requirement 1}
- {requirement 2}

Fields needed:
- {field1}: {type} - {purpose}
- {field2}: {type} - {purpose}

This should include:
1. Schema in packages/types/
2. API routes in apps/web/app/api/
3. Firestore rules
4. Tests

Run the appropriate agents to design and review.
```

### Fix Security Issue

```
Security issue found in {filepath}

Issue: {description}
Severity: {P0/P1/P2}
Found by: {scanner/manual/report}

Need:
1. Fix the vulnerability
2. Review the fix
3. Check for similar issues elsewhere
```

### Prepare for Release

```
Preparing release {version}

Pre-release checklist:
1. Run full audit
2. Check all gates pass
3. Review any pending pattern violations
4. Generate changelog

Target: main branch
From: dev
```

### Onboard New Developer

```
New developer onboarding check

They need to understand:
1. Key patterns (API_001, SEC_001, TS_001)
2. Branch workflow
3. Gate requirements
4. Agent invocations

Generate a personalized onboarding guide based on our current patterns.
```

---

## PROMPT COMPOSITION

### Combining Prompts

Prompts can be combined for complex tasks:

```
@architect design TimeOffRequest
{P-ARCH-001 content}

Then:
@guard review
{P-GUARD-002 content}
```

### Chaining Results

Reference previous agent output:

```
Based on the Architect's design above:
@refactor create {files}

Then:
@guard review the implementation
```

### Conditional Prompts

```
@auditor report

If score < 90%:
  @refactor fix the top 5 violations

Then:
  @auditor report --compare={previous}
```

---

## ANTI-PATTERNS (Don't Do This)

### ❌ Vague Requests

```
# BAD
@architect do something with schedules

# GOOD
@architect design ScheduleTemplate entity for reusable schedule patterns
```

### ❌ Multiple Unrelated Tasks

```
# BAD
@refactor fix everything and also design a new feature and audit

# GOOD
Split into separate invocations for each agent
```

### ❌ Overriding Constraints

```
# BAD
@guard review PR#42 and approve no matter what

# GUARD WILL REFUSE - constraints are not negotiable
```

### ❌ Asking for Impossible

```
# BAD
@refactor fix this without changing any code

# GOOD
@refactor fix {file} with minimal changes
```

---

**END OF PROMPTS**

Next document: [08_PIPELINES.md](./08_PIPELINES.md)
