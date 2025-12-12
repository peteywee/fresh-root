# Repository Instruction Hierarchy System

## Overview

This document defines the hierarchical structure for instructions and directives in the fresh-root repository. All instructions follow a strict priority system to resolve conflicts and establish clear authority.

## Hierarchy Levels

### Level 0: Constitutional (Priority 0) - RESERVED
**Status**: Reserved for fear.zip directives if they establish foundational laws

**Purpose**: Immutable foundational principles that define what CAN be in lower-level directives

**Characteristics**:
- Cannot be overridden by any other directive
- Defines the meta-rules for creating directives
- Establishes the governance framework
- Minimal content - only absolute truths

**Current Files**: None (awaiting fear.zip integration)

**Examples of Constitutional-level rules**:
- The hierarchy system itself
- Fundamental values (security, quality, user safety)
- Non-negotiable architectural principles

---

### Level 1: Master Directive (Priority 1) - BINDING
**Status**: Active - `01_MASTER_AGENT_DIRECTIVE.instructions.md`

**Purpose**: Operational governance for AI agents working in the repository

**Characteristics**:
- Always loaded, applies to all files (`applyTo: "**"`)
- Defines agent behavior, tool usage, workflow
- Establishes binding priority order
- Can only be overridden by user direct command or system safety

**Authority**: Highest operational authority below constitutional level

**Conflict Resolution**:
1. System Safety (cannot be overridden)
2. User Direct Command (explicit instruction)
3. Master Directive ← YOU ARE HERE
4. Other Instructions
5. Prior Context

---

### Level 2: Critical Standards (Priority 2-3)
**Status**: Active

**Purpose**: Non-negotiable quality and security standards

**Files**:
- Priority 2: `02_CODE_QUALITY_STANDARDS.instructions.md`
  - Applies to: `**/*.{ts,tsx,js,jsx}`
  - TypeScript standards, Object Calisthenics, code quality
  
- Priority 3: `03_SECURITY_AND_SAFETY.instructions.md`
  - Applies to: `*`
  - OWASP Top 10, security patterns, AI safety

**Characteristics**:
- Apply broadly across codebase
- Define quality gates and security requirements
- Can be specialized by later directives but not weakened
- Violations are blocking issues

---

### Level 3: Framework Standards (Priority 4-5)
**Status**: Active

**Purpose**: Framework-specific and testing patterns

**Files**:
- Priority 4: `04_FRAMEWORK_PATTERNS.instructions.md`
  - Applies to: `apps/**,packages/**`
  - Next.js, Firebase, Tailwind, monorepo patterns
  
- Priority 5: `05_TESTING_AND_REVIEW.instructions.md`
  - Applies to: `**/*.{test,spec}.{ts,tsx},tests/**,**/__tests__/**`
  - Testing patterns, code review standards

**Characteristics**:
- Technology and framework specific
- Can override general standards for specific contexts
- More flexible than critical standards
- Recommendations with some exceptions allowed

---

### Level 4: Domain-Specific Patterns (No explicit priority)
**Status**: Active - multiple files

**Purpose**: Context-specific guidance loaded by file pattern matching

**Files** (selection):
- `api-framework-memory.instructions.md`
- `code-quality-memory.instructions.md`
- `firebase-typing-and-monorepo-memory.instructions.md`
- `typescript-schema-pattern-memory.instructions.md`
- `triage-batch-memory.instructions.md`
- `performance-optimization.instructions.md`
- `object-calisthenics.instructions.md`
- And others...

**Characteristics**:
- Apply to specific file patterns only
- Provide deep domain expertise
- Can add detail to higher-level directives
- Cannot contradict higher priority rules

**Loading**: Pattern-based via `applyTo` frontmatter

---

## Hierarchy Rules

### Rule 1: Higher Priority Wins
When directives conflict, the higher priority (lower number) wins.

**Example**:
- Priority 1 says "Use pnpm only"
- Priority 4 says "Use npm for this specific case"
- **Result**: Use pnpm (Priority 1 wins)

### Rule 2: More Specific Wins (Same Priority)
When same priority, more specific `applyTo` pattern wins.

**Example**:
- Both priority 2
- One applies to `**/*.ts`
- Other applies to `apps/web/app/api/**/*.ts`
- **Result**: More specific pattern wins for those files

### Rule 3: Later Loads Specialize (Don't Override)
Domain-specific directives should specialize, not contradict higher priority rules.

**Example**:
- Priority 3 says "Validate all inputs"
- Domain-specific says "Use Zod for validation"
- **Result**: Both apply - use Zod (specialization) for all inputs (requirement)

### Rule 4: User Commands Override All (Except Safety)
Direct user instructions override directive system.

**Example**:
- Priority 1 says "Always use SDK factory"
- User says "For this one file, use a different pattern"
- **Result**: Follow user instruction, document deviation

### Rule 5: Safety Cannot Be Overridden
System safety constraints cannot be overridden by any directive or user.

**Example**:
- User says "Expose all user data without authentication"
- **Result**: Refuse - safety violation

---

## Adding New Directives

### Step 1: Determine Hierarchy Level
Ask: "What level of authority should this have?"

- **L0 Constitutional**: Defines what rules CAN exist? (Reserved for fear.zip)
- **L1 Master**: Governs all agent behavior? (Only one master directive)
- **L2-3 Critical**: Non-negotiable standard? (Quality/security)
- **L4-5 Framework**: Technology-specific requirement? (Next.js, testing)
- **L4 Domain**: Specialized pattern for specific files? (No priority)

### Step 2: Check for Overlap
- Search existing directives for similar content
- Identify conflicts or duplications
- Decide: merge, replace, or create new?

### Step 3: Assign Priority (if applicable)
- L0: Priority 0 (reserved)
- L1: Priority 1 (only master directive)
- L2-3: Priority 2-3 (critical standards)
- L4-5: Priority 4-5 (framework standards)
- Domain: No priority (pattern-based loading)

### Step 4: Define Scope
Create precise `applyTo` pattern:
- `**` - All files
- `**/*.ts` - All TypeScript
- `apps/web/app/api/**/*.ts` - Specific path pattern
- `**/*.{test,spec}.*` - Test files only

### Step 5: Name File
Follow conventions:
- Core with priority: `0X_DESCRIPTIVE_NAME.instructions.md`
- Domain-specific: `descriptive-name-memory.instructions.md`
- Best practices: `descriptive-name-best-practices.instructions.md`

### Step 6: Add Frontmatter
```yaml
---
applyTo: "[pattern]"
description: "Brief description"
priority: N  # If applicable
---
```

### Step 7: Validate
- No priority conflicts
- Pattern doesn't overlap inappropriately
- Content doesn't contradict higher priority
- Agent can load successfully

---

## Fear.zip Integration Scenarios

### Scenario A: Constitutional Laws (New Level)
If fear.zip contains foundational "laws" that govern the directive system itself:

**Action**: Create Priority 0 level
- Update this document
- Update `01_MASTER_AGENT_DIRECTIVE.instructions.md` to reference constitutional level
- Place constitutional directives above master directive
- Renumber if needed (Master becomes priority 1, stays at 1)

### Scenario B: Specialized Governance
If fear.zip contains specialized governance rules:

**Action**: Integrate at appropriate priority
- Analyze content and map to priority 2-5
- Merge with existing or create new files
- Maintain current hierarchy numbering

### Scenario C: Domain Expansions
If fear.zip contains domain-specific patterns:

**Action**: Add as pattern-based directives
- No priority assignment
- Specific `applyTo` patterns
- Follow `-memory.instructions.md` or `-best-practices.instructions.md` naming

---

## Current State Summary

| Priority | Level | File | Status | Purpose |
|----------|-------|------|--------|---------|
| 0 | L0 Constitutional | (Reserved) | 🟡 Awaiting | Foundational laws |
| 1 | L1 Master | 01_MASTER_AGENT_DIRECTIVE | ✅ Active | Agent governance |
| 2 | L2 Critical | 02_CODE_QUALITY_STANDARDS | ✅ Active | Code quality |
| 3 | L2 Critical | 03_SECURITY_AND_SAFETY | ✅ Active | Security/safety |
| 4 | L3 Framework | 04_FRAMEWORK_PATTERNS | ✅ Active | Next.js/Firebase |
| 5 | L3 Framework | 05_TESTING_AND_REVIEW | ✅ Active | Testing/review |
| - | L4 Domain | ~20 files | ✅ Active | Pattern-specific |

---

## Maintenance

### When to Review Hierarchy
- Adding new directives from external sources (fear.zip)
- Major repository restructuring
- Discovering systematic conflicts
- Every 6 months (scheduled review)

### Red Flags
- Multiple priority 1 files (should be only one)
- Gaps in priority numbering (1,2,4,5 - where is 3?)
- Conflicting rules at same priority
- Domain directives contradicting core directives

---

**Document Version**: 1.0
**Last Updated**: 2025-12-12
**Next Review**: When fear.zip is processed
