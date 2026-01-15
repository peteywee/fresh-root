# L3 Prompts Layer: DEPRECATED

> **Status**: Deprecated (January 15, 2026)  
> **Migration**: All L3 agents migrated to [L4a Agent Registry](../../.claude/agents/)  
> **Archive**: Old prompts preserved in `/archive/l3-prompts-deprecated/`

---

## What Happened

All **13 orchestration agent prompts** that were in this directory have been migrated to the new **L4a Agent Registry** at `.claude/agents/`.

### Why

- **Unified Discovery**: All agents now use YAML frontmatter for VS Code Copilot discovery
- **Consistent Structure**: Each agent has AGENT.md, config.js, README.md, QUICK_REFERENCE.md
- **Reduced Search Clutter**: L3 layer deprecated to avoid duplication in searches
- **Better Organization**: Agents grouped by domain in L4a

---

## Files Remaining in This Directory

### Still Active (3)
- ✅ `PROMPTS_SESSION_SUMMARY.md` — Session logging (internal use)
- ✅ `remember-enhanced.prompt.md` — Remember system prompt
- ✅ `plan-copilotInstruction.prompt.md` — Legacy plan instruction
- ✅ `ui-ux-agent.md` — UI/UX specialist detailed persona (supports L4a agent)

### Deprecated & Archived (13)
❌ Moved to `/archive/l3-prompts-deprecated/`:
- `audit.prompt.md`
- `create-implementation-plan.prompt.md`
- `deploy.prompt.md`
- `document.prompt.md`
- `documentation-writer.prompt.md`
- `github-copilot-starter.prompt.md`
- `implement.prompt.md`
- `iterate.prompt.md`
- `plan.prompt.md`
- `red-team.prompt.md`
- `review-and-refactor.prompt.md`
- `review.prompt.md`
- `test.prompt.md`

---

## Migration Path

### Old Way (L3)
```
.github/prompts/plan.prompt.md
  → Manual invocation
  → Not discoverable
```

### New Way (L4a)
```
.claude/agents/plan-agent/
├── AGENT.md              (Discovery manifest)
├── config.js             (Machine config)
├── README.md             (Full documentation)
└── QUICK_REFERENCE.md   (Fast lookup)

Invocation: @plan, /plan, or "Use the plan agent to..."
```

---

## How to Access Archived Prompts

If you need to reference old L3 prompts for any reason:

```bash
# View archived prompts
ls -la archive/l3-prompts-deprecated/

# Read a specific archived prompt
cat archive/l3-prompts-deprecated/plan.prompt.md
```

---

## Use L4a Agents Instead

All agents are now available in the [Agent Registry](../../.claude/agents/INDEX.md):

| Agent | Location | Invocation |
| --- | --- | --- |
| Plan Agent | `.claude/agents/plan-agent/` | `@plan` |
| Document Agent | `.claude/agents/document-agent/` | `@doc` |
| Test Engineer | `.claude/agents/test-engineer/` | `@test` |
| Code Review Expert | `.claude/agents/code-review-expert/` | `@review` |
| Backend API Expert | `.claude/agents/backend-api-expert/` | `@api` |
| Firebase Expert | `.claude/agents/firebase-expert/` | `@firebase` |
| Security Red Teamer | `.claude/agents/security-red-teamer/` | `@security` |
| DevOps & Infrastructure | `.claude/agents/devops-infrastructure/` | `@devops` |
| Copilot Starter Agent | `.claude/agents/copilot-starter-agent/` | `@setup` |
| Documentation Writer | `.claude/agents/documentation-writer-agent/` | `@writer` |
| Create Plan Agent | `.claude/agents/create-plan-agent/` | `@create-plan` |

---

## See Also

- [L4a Agent Registry](../../.claude/agents/INDEX.md) — All discoverable agents
- [Hierarchy Overview](../../.github/governance/INDEX.md#hierarchy) — L0-L4 layers
- [Instructions INDEX](./INDEX.md) — Updated with L4a reference

---

**Last Updated**: January 15, 2026
