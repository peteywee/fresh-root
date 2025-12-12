# Directive Integration Template

## Purpose
Use this template to map and integrate new directives from fear.zip into the repository's instruction hierarchy.

## Directive Analysis Form

### Source Information
- **File Name**: [Original filename from fear.zip]
- **Category**: [Constitutional / Governance / Operational / Procedural / Domain-specific]
- **Hierarchy Level**: [L0 / L1 / L2 / L3 / L4]

### Content Analysis
- **Primary Topic**: [Brief description]
- **Key Mandates**: 
  - [Mandate 1]
  - [Mandate 2]
  - [Mandate 3]

### Integration Mapping

#### Existing Overlap Check
- [ ] No overlap - completely new directive
- [ ] Partial overlap with: [existing instruction file name]
- [ ] Complete overlap - can merge with: [existing instruction file name]
- [ ] Conflicts with: [existing instruction file name]

#### Proposed Integration Action
- [ ] Create new instruction file
- [ ] Merge into existing file: [filename]
- [ ] Replace existing file: [filename]
- [ ] Split into multiple files
- [ ] Archive/deprecate in favor of new directive

#### Priority Assignment
**Recommended Priority**: [1-5 or "pattern-based"]

**Justification**: [Why this priority level?]

**Comparison with existing directives**:
- Above: [List lower priority directives]
- Same level as: [List same priority directives]
- Below: [List higher priority directives]

#### File Pattern Scope
**Proposed `applyTo` pattern**: `[file pattern]`

**Files affected** (estimate): [number of files or "all"]

**Examples**:
- `path/to/example1.ts`
- `path/to/example2.tsx`

### Integration Details

#### Proposed Filename
`[XX_DESCRIPTIVE_NAME.instructions.md or descriptive-name-memory.instructions.md]`

#### Frontmatter
```yaml
---
applyTo: "[pattern]"
description: "[brief description]"
priority: [N or omit]
---
```

#### Section Structure
1. [Section 1 heading]
2. [Section 2 heading]
3. [Section 3 heading]

### Validation Plan

#### Testing
- [ ] Instructions load without errors
- [ ] Priority conflicts resolved
- [ ] File patterns match correctly
- [ ] No circular dependencies
- [ ] Agent behavior aligns with directive

#### Documentation Updates
- [ ] Update `.github/copilot-instructions.md`
- [ ] Update `docs/repo-instruction-index.md`
- [ ] Update `docs/reconciled-rulebook.md`
- [ ] Update `01_MASTER_AGENT_DIRECTIVE.instructions.md` (if hierarchy changes)
- [ ] Update relevant domain documentation

#### Code Impact
- [ ] Review existing codebase compliance
- [ ] Identify non-compliant code patterns
- [ ] Create migration plan if needed
- [ ] Update linting rules if applicable

### Decision Log

**Date**: [YYYY-MM-DD]
**Reviewer**: [Name/Role]
**Decision**: [Approved / Needs revision / Rejected]
**Notes**: [Any additional context or decisions made]

---

## Example: Completed Template

### Source Information
- **File Name**: `00_CONSTITUTIONAL_LAW.md`
- **Category**: Constitutional
- **Hierarchy Level**: L0

### Content Analysis
- **Primary Topic**: Fundamental repository governance principles
- **Key Mandates**: 
  - All code must follow pnpm-only rule
  - Type safety is non-negotiable
  - Security-first development

### Integration Mapping

#### Existing Overlap Check
- [x] Partial overlap with: `01_MASTER_AGENT_DIRECTIVE.instructions.md`
- [ ] No overlap
- [ ] Complete overlap
- [ ] Conflicts with existing

#### Proposed Integration Action
- [x] Merge into existing file: `01_MASTER_AGENT_DIRECTIVE.instructions.md`
- Additional section at top establishing "constitutional" level

#### Priority Assignment
**Recommended Priority**: 0 (new highest level)

**Justification**: Constitutional laws are above even master directive - they define what CAN be in a directive.

**Comparison**:
- Above: Master Agent Directive (current priority 1)
- Same level as: None
- Below: All current directives

#### File Pattern Scope
**Proposed `applyTo` pattern**: `**` (all files)

### Validation Plan
✅ All checks completed

---

## Multiple Directive Tracking

Use this section to track multiple directives from fear.zip:

| # | Source File | Category | Priority | Action | Status |
|---|-------------|----------|----------|--------|--------|
| 1 | | | | | ⏳ Pending |
| 2 | | | | | ⏳ Pending |
| 3 | | | | | ⏳ Pending |

**Legend**:
- ⏳ Pending - Not started
- 🔍 Analyzing - Under review
- ✏️ Drafting - Integration in progress
- ✅ Complete - Integrated and validated
- ❌ Rejected - Not integrating

---

**Template Version**: 1.0
**Last Updated**: 2025-12-12
