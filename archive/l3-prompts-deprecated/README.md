# L3 Prompts Archive Manifest

**Date**: January 15, 2026  
**Status**: Archived (Deprecated)  
**Reason**: Migrated to L4a Agent Registry

---

## Archive Contents

All files in this directory are deprecated L3 prompt files that have been migrated to the new L4a Agent Registry at `.claude/agents/`.

---

## Archived Files

| File | Agent | Migrated To | Status |
| --- | --- | --- | --- |
| `audit.prompt.md` | Audit Agent | `security-red-teamer/` | ✅ |
| `create-implementation-plan.prompt.md` | Create Implementation Plan | `create-plan-agent/` | ✅ |
| `deploy.prompt.md` | Deploy Agent | (specialized agent) | ✅ |
| `document.prompt.md` | Document Agent | `document-agent/` | ✅ |
| `documentation-writer.prompt.md` | Documentation Writer | `documentation-writer-agent/` | ✅ |
| `github-copilot-starter.prompt.md` | Copilot Starter | `copilot-starter-agent/` | ✅ |
| `implement.prompt.md` | Implement Agent | (specialized agent) | ✅ |
| `iterate.prompt.md` | Iterate Agent | (specialized agent) | ✅ |
| `plan.prompt.md` | Plan Agent | `plan-agent/` | ✅ |
| `red-team.prompt.md` | Red Team Agent | `security-red-teamer/` | ✅ |
| `review-and-refactor.prompt.md` | Review & Refactor | `code-review-expert/` | ✅ |
| `review.prompt.md` | Review Agent | `code-review-expert/` | ✅ |
| `test.prompt.md` | Test Agent | `test-engineer/` | ✅ |

---

## Why Were These Archived

### Before (L3)
- ❌ No discovery system
- ❌ Difficult to search
- ❌ Manual invocation only
- ❌ Inconsistent structure

### After (L4a)
- ✅ YAML frontmatter discovery
- ✅ Searchable via agent registry
- ✅ @-mention autocomplete
- ✅ Standardized structure
- ✅ Full documentation per agent
- ✅ Quick reference cards

---

## How to Use New L4a Agents

Instead of these archived prompts, use the agents in `.claude/agents/`:

```bash
# List all agents
ls .claude/agents/

# View agent documentation
cat .claude/agents/{agent-name}/README.md

# Quick reference
cat .claude/agents/{agent-name}/QUICK_REFERENCE.md
```

---

## Accessing Archived Content

If you need to reference the original L3 prompt content for historical reasons:

```bash
# View all archived prompts
ls -la /archive/l3-prompts-deprecated/

# Read a specific archived prompt
cat /archive/l3-prompts-deprecated/plan.prompt.md
```

---

## Searching

These archived prompts **will not appear in workspace searches** to avoid confusion. They are preserved for:
- Historical reference
- Compliance/audit trails
- Legacy system integration

---

## Related Documentation

- [L4a Agent Registry](../../.claude/agents/INDEX.md) — Use these agents instead
- [Instructions INDEX](../../.github/instructions/INDEX.md) — Updated with L4a reference
- [Deprecation Notice](../../.github/prompts/README_DEPRECATED.md) — More information

---

**Archive Date**: January 15, 2026  
**Migration Status**: ✅ Complete  
**Search Impact**: ✅ Excluded from active searches
