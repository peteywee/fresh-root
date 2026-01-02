# Governance Documentation Index
> **Location**: L0 (Canonical Source of Truth)\
> **Purpose**: Fast AI-optimized lookup for governance, protocols, directives\
> **Last Updated**: 2025-12-16

---

## Quick Tag Lookup
Search by tag to find relevant documents:

| Tag        | Documents                            |
| ---------- | ------------------------------------ |
| `api`      | 03\_DIRECTIVES, A01\_BATCH, A06\_CODING |
| `security` | 03\_DIRECTIVES, A03\_SECURITY          |
| `agents`   | 06\_AGENTS, A02\_WORKER                |
| `branches` | 10\_BRANCH\_RULES, A05\_BRANCH          |
| `testing`  | 11\_GATES, 05\_TESTING                 |
| `patterns` | A06\_CODING, 11\_GATES                 |
| `firebase` | A07\_FIREBASE, 09\_CI\_CD               |
| `batch`    | A01\_BATCH, 02\_PROTOCOLS              |

---

## L0: Canonical Documents (01-12)
These 12 documents form the binding governance system. All other documentation extends or implements
these rules.

| ID  | Document                                     | Purpose                 | Key Sections                           |
| --- | -------------------------------------------- | ----------------------- | -------------------------------------- |
| 01  | [01\_DEFINITIONS.md](./01_DEFINITIONS.md)     | Terms, values, entities | Core Values, Domain Terms, Pattern IDs |
| 02  | [02\_PROTOCOLS.md](./02_PROTOCOLS.md)         | How things work         | Classification, Pipelines              |
| 03  | [03\_DIRECTIVES.md](./03_DIRECTIVES.md)       | What's required (MUST)  | D01-D08, Security, API                 |
| 04  | [04\_INSTRUCTIONS.md](./04_INSTRUCTIONS.md)   | How to do tasks         | Setup, Workflows                       |
| 05  | [05\_BEHAVIORS.md](./05_BEHAVIORS.md)         | Expected behaviors      | Agent responses, Error handling        |
| 06  | [06\_AGENTS.md](./06_AGENTS.md)               | Agent definitions       | Orchestrator, Architect, Guard         |
| 07  | [07\_PROMPTS.md](./07_PROMPTS.md)             | Prompt patterns         | Slash commands, Templates              |
| 08  | [08\_PIPELINES.md](./08_PIPELINES.md)         | CI/CD pipelines         | Family/Variant, Gate order             |
| 09  | [09\_CI\_CD.md](./09_CI_CD.md)                 | CI/CD configuration     | Workflows, Jobs                        |
| 10  | [10\_BRANCH\_RULES.md](./10_BRANCH_RULES.md)   | Branch strategy         | main, dev, feature/\*                  |
| 11  | [11\_GATES.md](./11_GATES.md)                 | Quality gates           | STATIC, CORRECTNESS, SAFETY            |
| 12  | [12\_DOCUMENTATION.md](./12_DOCUMENTATION.md) | Doc standards           | Headers, Format                        |

---

## L1: Amendments (Extensions to Canonical Docs)
Amendments provide focused extensions to the canonical documents. Each amendment states which
canonical doc it extends.

| ID  | Amendment                                                             | Extends         | Tags                          | Summary                                    |
| --- | --------------------------------------------------------------------- | --------------- | ----------------------------- | ------------------------------------------ |
| A01 | [A01\_BATCH\_PROTOCOL.md](./amendments/A01_BATCH_PROTOCOL.md)           | 02\_PROTOCOLS    | api, batch, validation        | Batch processing rules, TODO list patterns |
| A02 | [A02\_WORKER\_DECISION.md](./amendments/A02_WORKER_DECISION.md)         | 06\_AGENTS       | agents, routing, orchestrator | Worker routing logic, decision tree        |
| A03 | [A03\_SECURITY\_AMENDMENTS.md](./amendments/A03_SECURITY_AMENDMENTS.md) | 03\_DIRECTIVES   | security, D01, patterns       | Security fix patterns (SF-001 to SF-005)   |
| A04 | [A04\_RECONCILED\_RULES.md](./amendments/A04_RECONCILED_RULES.md)       | 03\_DIRECTIVES   | rules, conflicts              | Rule conflict resolution hierarchy         |
| A05 | [A05\_BRANCH\_STRATEGY.md](./amendments/A05_BRANCH_STRATEGY.md)         | 10\_BRANCH\_RULES | git, branches, workflow       | Extended branch workflow, commit format    |
| A06 | [A06\_CODING\_PATTERNS.md](./amendments/A06_CODING_PATTERNS.md)         | 03\_DIRECTIVES   | patterns, api, sdk-factory    | Implementation patterns, templates         |
| A07 | [A07\_FIREBASE\_IMPL.md](./amendments/A07_FIREBASE_IMPL.md)             | 09\_CI\_CD        | firebase, config, deployment  | Firebase deployment, configuration         |
| A08 | [A08\_IMPLEMENTATION\_PLAN.md](./amendments/A08_IMPLEMENTATION_PLAN.md) | (root)          | plan, phases, governance      | Governance rollout status                  |

---

## Quick Reference
- [QUICK\_REFERENCE.md](./QUICK_REFERENCE.md) - One-page cheat sheet (print this)
- [PROTOCOL\_DIRECTIVE\_IMPROVEMENTS.md](./PROTOCOL_DIRECTIVE_IMPROVEMENTS.md) - Enhancement proposals

---

## How to Use This Index
### For AI Agents
1. **Search by tag**: Use the Quick Tag Lookup table
2. **Find canonical rule**: Check L0 documents (01-12)
3. **Find specific implementation**: Check L1 amendments (A01-A08)
4. **Need quick reference**: See QUICK\_REFERENCE.md

### For Humans
- Start with QUICK\_REFERENCE.md for overview
- Read canonical docs (01-12) for complete understanding
- Check amendments for specific implementation patterns

### Hierarchy
```
L0 (Canonical) → L1 (Amendments) → L2 (Instructions) → L3 (Prompts) → L4 (Docs)
```

All levels below L1 must align with governance. Conflicts resolved by escalating to canonical docs.

---

## Related Indexes
- [Instructions Index](../../instructions/INDEX.md) - Agent instructions (L2)
- [Documentation Index](../../../docs/INDEX.md) - Human guides (L4)
- [Prompts](../../prompts/) - Slash command templates (L3)

---

**Binding Authority**: L0 + L1 documents in this folder are the authoritative source for all
development decisions.
