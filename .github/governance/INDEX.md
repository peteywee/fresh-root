# Governance Documentation Index

> **Location**: L0 (Canonical Source of Truth)  
> **Purpose**: Fast AI-optimized lookup for governance, protocols, directives  
> **Last Updated**: 2025-12-16

---

## Quick Tag Lookup

Search by tag to find relevant documents:

| Tag        | Documents                            |
| ---------- | ------------------------------------ |
| `api`      | 03_DIRECTIVES, A01_BATCH, A06_CODING |
| `security` | 03_DIRECTIVES, A03_SECURITY          |
| `agents`   | 06_AGENTS, A02_WORKER                |
| `branches` | 10_BRANCH_RULES, A05_BRANCH          |
| `testing`  | 11_GATES, 05_TESTING                 |
| `patterns` | A06_CODING, 11_GATES                 |
| `firebase` | A07_FIREBASE, 09_CI_CD               |
| `batch`    | A01_BATCH, 02_PROTOCOLS              |

---

## L0: Canonical Documents (01-12)

These 12 documents form the binding governance system. All other documentation extends or implements
these rules.

| ID  | Document                                     | Purpose                 | Key Sections                           |
| --- | -------------------------------------------- | ----------------------- | -------------------------------------- |
| 01  | [01_DEFINITIONS.md](./01_DEFINITIONS.md)     | Terms, values, entities | Core Values, Domain Terms, Pattern IDs |
| 02  | [02_PROTOCOLS.md](./02_PROTOCOLS.md)         | How things work         | Classification, Pipelines              |
| 03  | [03_DIRECTIVES.md](./03_DIRECTIVES.md)       | What's required (MUST)  | D01-D08, Security, API                 |
| 04  | [04_INSTRUCTIONS.md](./04_INSTRUCTIONS.md)   | How to do tasks         | Setup, Workflows                       |
| 05  | [05_BEHAVIORS.md](./05_BEHAVIORS.md)         | Expected behaviors      | Agent responses, Error handling        |
| 06  | [06_AGENTS.md](./06_AGENTS.md)               | Agent definitions       | Orchestrator, Architect, Guard         |
| 07  | [07_PROMPTS.md](./07_PROMPTS.md)             | Prompt patterns         | Slash commands, Templates              |
| 08  | [08_PIPELINES.md](./08_PIPELINES.md)         | CI/CD pipelines         | Family/Variant, Gate order             |
| 09  | [09_CI_CD.md](./09_CI_CD.md)                 | CI/CD configuration     | Workflows, Jobs                        |
| 10  | [10_BRANCH_RULES.md](./10_BRANCH_RULES.md)   | Branch strategy         | main, dev, feature/\*                  |
| 11  | [11_GATES.md](./11_GATES.md)                 | Quality gates           | STATIC, CORRECTNESS, SAFETY            |
| 12  | [12_DOCUMENTATION.md](./12_DOCUMENTATION.md) | Doc standards           | Headers, Format                        |

---

## L1: Amendments (Extensions to Canonical Docs)

Amendments provide focused extensions to the canonical documents. Each amendment states which
canonical doc it extends.

| ID  | Amendment                                                             | Extends         | Tags                          | Summary                                    |
| --- | --------------------------------------------------------------------- | --------------- | ----------------------------- | ------------------------------------------ |
| A01 | [A01_BATCH_PROTOCOL.md](./amendments/A01_BATCH_PROTOCOL.md)           | 02_PROTOCOLS    | api, batch, validation        | Batch processing rules, TODO list patterns |
| A02 | [A02_WORKER_DECISION.md](./amendments/A02_WORKER_DECISION.md)         | 06_AGENTS       | agents, routing, orchestrator | Worker routing logic, decision tree        |
| A03 | [A03_SECURITY_AMENDMENTS.md](./amendments/A03_SECURITY_AMENDMENTS.md) | 03_DIRECTIVES   | security, D01, patterns       | Security fix patterns (SF-001 to SF-005)   |
| A04 | [A04_RECONCILED_RULES.md](./amendments/A04_RECONCILED_RULES.md)       | 03_DIRECTIVES   | rules, conflicts              | Rule conflict resolution hierarchy         |
| A05 | [A05_BRANCH_STRATEGY.md](./amendments/A05_BRANCH_STRATEGY.md)         | 10_BRANCH_RULES | git, branches, workflow       | Extended branch workflow, commit format    |
| A06 | [A06_CODING_PATTERNS.md](./amendments/A06_CODING_PATTERNS.md)         | 03_DIRECTIVES   | patterns, api, sdk-factory    | Implementation patterns, templates         |
| A07 | [A07_FIREBASE_IMPL.md](./amendments/A07_FIREBASE_IMPL.md)             | 09_CI_CD        | firebase, config, deployment  | Firebase deployment, configuration         |
| A08 | [A08_IMPLEMENTATION_PLAN.md](./amendments/A08_IMPLEMENTATION_PLAN.md) | (root)          | plan, phases, governance      | Governance rollout status                  |

---

## Quick Reference

- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - One-page cheat sheet (print this)
- [PROTOCOL_DIRECTIVE_IMPROVEMENTS.md](./PROTOCOL_DIRECTIVE_IMPROVEMENTS.md) - Enhancement proposals

---

## How to Use This Index

### For AI Agents

1. **Search by tag**: Use the Quick Tag Lookup table
2. **Find canonical rule**: Check L0 documents (01-12)
3. **Find specific implementation**: Check L1 amendments (A01-A08)
4. **Need quick reference**: See QUICK_REFERENCE.md

### For Humans

- Start with QUICK_REFERENCE.md for overview
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
