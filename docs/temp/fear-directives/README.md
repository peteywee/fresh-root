# Fear Directives Integration - Temporary Workspace

## Purpose

This temporary folder is designated for extracting and processing new directives from `fear.zip`. These directives are described as "laws" that establish a hierarchical governance structure for the repository.

## Status

**AWAITING**: fear.zip file to be placed in this directory for processing.

## Integration Process

### Phase 1: Extraction
1. Place fear.zip in this directory
2. Extract contents while preserving structure
3. Review directive files and metadata
4. Identify hierarchy and priority information

### Phase 2: Analysis
1. Analyze directive content and categorization
2. Map to existing instruction hierarchy
3. Identify conflicts or overlaps with current instructions
4. Determine appropriate priority levels (1-5+ scale)

### Phase 3: Integration
1. Reconcile with existing `.github/instructions/` directives
2. Assign proper priority numbers based on hierarchy
3. Add appropriate frontmatter metadata:
   - `applyTo`: file pattern matching
   - `description`: brief summary
   - `priority`: numeric hierarchy level
4. Place integrated directives in `.github/instructions/`
5. Update instruction index files

### Phase 4: Validation
1. Verify no conflicting priorities
2. Test instruction loading and hierarchy
3. Update documentation references
4. Validate with existing codebase patterns

## Current Instruction Hierarchy

### Priority Levels (Existing)

| Priority | File | Scope | Description |
|----------|------|-------|-------------|
| 1 | 01_MASTER_AGENT_DIRECTIVE | `**` | Master directive, always loaded, highest authority |
| 2 | 02_CODE_QUALITY_STANDARDS | `**/*.{ts,tsx,js,jsx}` | Code quality and TypeScript standards |
| 3 | 03_SECURITY_AND_SAFETY | `*` | OWASP, security, AI safety |
| 4 | 04_FRAMEWORK_PATTERNS | `apps/**,packages/**` | Next.js, Firebase, framework patterns |
| 5 | 05_TESTING_AND_REVIEW | `**/*.{test,spec}.*` | Testing and code review standards |

### Domain-Specific Instructions (No explicit priority)

These apply to specific file patterns:
- `api-framework-memory.instructions.md` - API route patterns
- `code-quality-memory.instructions.md` - ESLint safeguards
- `firebase-typing-and-monorepo-memory.instructions.md` - Firebase/monorepo patterns
- `typescript-schema-pattern-memory.instructions.md` - Zod schema patterns
- `triage-batch-memory.instructions.md` - Batch processing patterns
- And others...

## Integration Guidelines

### Naming Convention
New directives should follow the established pattern:
- Core directives (priority 1-5): `0X_DESCRIPTION.instructions.md`
- Domain-specific: `descriptive-name-memory.instructions.md`
- Best practices: `descriptive-name-best-practices.instructions.md`

### Frontmatter Template
```yaml
---
applyTo: "file/pattern/**"
description: "Brief description of directive purpose"
priority: N  # 1-5 for core, optional for domain-specific
---
```

### Hierarchy Rules
1. **Priority 1** (Binding): Overrides all others, system safety and user commands only
2. **Priority 2-3** (Critical): Core quality and security standards
3. **Priority 4-5** (Important): Framework and testing patterns
4. **No priority** (Contextual): Domain-specific patterns, loaded by file matching

### Conflict Resolution
When new directives conflict with existing ones:
1. Check if higher priority directive already covers the rule
2. Merge related content if appropriate
3. Create new priority level if genuinely new hierarchy tier
4. Document any deprecations or replacements

## Expected Directive Categories

Based on problem statement ("laws" with hierarchy), expect:
- Constitutional/foundational laws (priority 1-2 level)
- Governance laws (priority 2-3 level)
- Operational laws (priority 3-4 level)
- Procedural laws (priority 4-5 level)
- Domain-specific regulations (pattern-based)

## Files to Update After Integration

1. `.github/copilot-instructions.md` - Main agent guide
2. `docs/repo-instruction-index.md` - Instruction inventory
3. `docs/reconciled-rulebook.md` - Unified rulebook
4. `.github/instructions/01_MASTER_AGENT_DIRECTIVE.instructions.md` - May need hierarchy updates

## Validation Checklist

After integration:
- [ ] All directives have proper frontmatter
- [ ] No priority conflicts or duplicates
- [ ] File patterns don't overlap inappropriately
- [ ] Hierarchy is documented and clear
- [ ] Instructions are referenced in index files
- [ ] Existing codebase patterns still work
- [ ] Agent can load and process instructions correctly

## Notes

- This temp folder should be cleaned up after successful integration
- Keep original fear.zip as backup until validation complete
- Document any major changes or restructuring decisions
- Test with actual agent behavior before finalizing

---

**Created**: 2025-12-12
**Status**: Awaiting fear.zip file
**Next Action**: Place fear.zip in this directory for processing
