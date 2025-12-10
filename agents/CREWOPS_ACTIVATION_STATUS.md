# CREWOPS Protocol: Activation Status

**Status**: ✅ ACTIVE\
**Date**: December 4, 2025\
**Binding**: Automatic

---

## What's Active

### 1. **CrewOps Manual (agents/crewops.md)**

The complete operating manual for the TopShelf CrewOps Engine:

- Constitution (7 non-negotiable laws)
- Crew hierarchy & roles
- Swarm protocol (Phases A→E)
- Tool use discipline
- MCP integration framework
- Decision audit trail
- Integration examples

**Size**: 718 lines\
**Reference**: Link at Section 0.1.5 in crewops.md

### 2. **Automatic Activation Framework (agents/CREWOPS_ACTIVATION.md)**

The protocol that automatically engages:

- On session bootstrap (no user action needed)
- On every non-trivial prompt

**Covers**:

- Activation sequence (Stage 1, 2, 3)
- Non-trivial prompt detection
- Phase execution workflow
- Keyword modifiers (CREWOPS_OK, CREWOPS_DESIGN_ONLY, CREWOPS_EXECUTE, CREWOPS_EMERGENCY)
- Tool auto-activation per role
- Worker responsibilities matrix
- Orchestrator checklist
- Protocol failure fallback

**Size**: ~400 lines\
**Reference**: Linked from crewops.md Section 0.1.5

---

## How It Works

### On Session Start

```
Agent boots → Load CREWOPS.md + CREWOPS_ACTIVATION.md →
Display activation message → Ready for prompts
```

**Activation Message Displayed**:

```
✅ CREWOPS Protocol Active

Binding Framework: CrewOps Manual loaded
Constitution: Anti-vaporware | Truth & Evidence | Security Supremacy |
              Deterministic Delivery | Full-File Fidelity
Crew: Orchestrator | Product Owner | Systems Architect | Security Red Team |
      Research Analyst | QA/Test Engineer
Tool Activation: Immediate deployment, no assumptions
MCP Integration: GitHub + Firecrawl available

Phase A→E Execution: Context Saturation → Plan & Team → Action Matrix →
                     Security Veto → Validation
```

### On Non-Trivial Prompt

```
User sends request (code, architecture, research, deployment) →
Orchestrator detects "non-trivial" →
Protocol engages automatically →
Phases A→E execute in sequence →
Audit trail recorded
```

**Non-Trivial Detection**:

- Code generation/modification
- Architecture decisions
- External research needed
- Multi-step execution
- Security implications
- Deployment/release activity

**Trivial** (no protocol):

- Simple questions
- Quick explanations
- Reference lookups

### Protocol Flow (Every Non-Trivial Request)

```
🏷️ CONTEXT INTAKE
   ├─ Read goal + constraints + deliverable type
   └─ Label severity + lead worker

📖 PHASE A: CONTEXT SATURATION
   ├─ Ingest files, docs, prior context
   ├─ Verify all non-trivial assumptions
   └─ Output: "Context Loaded: ..." + "Risks Identified: X"

🧠 PHASE B+C: HIERARCHICAL DECOMPOSITION + WORKER SPAWNING
   ├─ Break into dependency batches (Foundation → Core → UI → Ops)
   ├─ Spawn one worker per batch
   ├─ Assign Constitutional clauses
   └─ Output: Batch structure + dependencies + worker assignments

⚡ PHASE D: ACTION MATRIX
   ├─ Execute line-by-line
   ├─ Tool calls parallelized
   ├─ Evidence gathered
   └─ Deliverables produced (code, commands, artifacts)

🛡️ PHASE E: SECURITY VETO + REFLEXION
   ├─ Red Team veto check (Security Supremacy)
   ├─ Competing constraints reconciled
   ├─ What changed and why
   └─ Final validation gates

✅ VALIDATION GATES
   ├─ Green gates verified
   ├─ DoD met
   └─ Audit trail complete
```

---

## Keyword Modifiers (Optional)

Users can modify protocol behavior with keywords in their prompt:

| Keyword               | Effect              | Use Case                      |
| --------------------- | ------------------- | ----------------------------- |
| `CREWOPS_OK`          | Acknowledge binding | First prompt to activate      |
| `CREWOPS_DESIGN_ONLY` | Phases A-C only     | "Plan it out, don't code"     |
| `CREWOPS_AUDIT`       | Phases A + E only   | "Find problems, don't fix"    |
| `CREWOPS_EXECUTE`     | Phase D only        | "Run the pre-planned actions" |
| `CREWOPS_EMERGENCY`   | Fast-track to D     | "Move fast, minimal planning" |
| `CREWOPS_PAUSE`       | Hold protocol       | Temporary suspension          |
| `CREWOPS_RESUME`      | Re-engage           | Resume after pause            |
| `CREWOPS_RESET`       | Clear state         | Fresh start                   |

---

## Tool Activation Rules (Automatic)

When protocol engages, tools auto-activate by role:

### Research Analyst

```
Tools: read_file | semantic_search | grep_search | file_search
MCP: mcp_firecrawl_* (web research)
Responsibility: Verify all non-trivial claims
```

### QA/Test Engineer

```
Tools: get_errors | run_in_terminal (test runners)
Responsibility: Validate green gates
```

### Scribe/Documentation Lead

```
Tools: list_dir | semantic_search
MCP: mcp_github_* (PR/issue work)
Responsibility: Audit trail + decision tracking
```

### Security Red Team

```
Constitutional Clause: Security Supremacy (Section 2.3)
Responsibility: Veto Phase E (auth bypass, data leakage, insecure defaults, etc.)
```

### Orchestrator

```
Authority: Route tools, arbitrate conflicts, synthesize results
Responsibility: Enforce Constitution + Priority Order + All Phases
```

---

## Binding Priority (Immutable)

Conflicts resolved in order:

1. System instructions + safety policy
2. CREWOPS Constitution
3. CREWOPS Activation Framework
4. User request (current turn)
5. Prior turns / preferences

**Fail-Closed**: If conflict exists, Orchestrator escalates.

---

## Files Created/Modified

| File                           | Action   | Size       | Purpose                         |
| ------------------------------ | -------- | ---------- | ------------------------------- |
| `agents/crewops.md`            | Enhanced | 747 lines  | Main manual + tool/MCP sections |
| `agents/CREWOPS_ACTIVATION.md` | Created  | ~400 lines | Auto-activation framework       |

---

## Quick Reference: What Gets Displayed When

### On Session Start

```
✅ CREWOPS Protocol Active
[Binding Framework, Constitution, Crew, Tools, Phase A→E]
```

### On Non-Trivial Prompt

```
✅ CREWOPS PROTOCOL ENGAGED

🏷️ CONTEXT INTAKE
🧠 CREW ASSEMBLY
⚡ SWARM PROTOCOL INITIATION
📋 GATES ENGAGED

Ready for Phases A→E execution.
```

### After Phase A (Context Saturation)

```
📖 PHASE A: CONTEXT SATURATION
Context Loaded: [summary]
Risks Identified: [count + list]
Assumptions Verified: [list]
```

### After Phase B+C (Planning)

```
🧠 PHASE B+C: HIERARCHICAL DECOMPOSITION + WORKER SPAWNING
Batch 1: [scope] → [SPAWNING WORKER]: "Name" (Constitutional clauses)
Batch 2: [scope] → [SPAWNING WORKER]: "Name" (Constitutional clauses)
...
```

### After Phase D (Execution)

```
⚡ PHASE D: ACTION MATRIX
[x] Action 1 (Worker X) → [tool] → [observation] → [decision]
[x] Action 2 (Worker Y) → [tool] → [observation] → [decision]
...
```

### After Phase E (Veto + Validation)

```
🛡️ PHASE E: SECURITY VETO + REFLEXION
Red Team: ✅ Veto passed / ❌ Veto blocked (reason)
Competing Constraints: [reconciliation]
What Changed: [list of revisions]

✅ VALIDATION GATES
[x] Green gate 1 passed
[x] Green gate 2 passed
```

---

## Protocol Enforcement

**Orchestrator Checklist (Before Responding)**:

- \[ ] Constitution loaded (Section 2)
- \[ ] Crew Cabinet assembled (Section 3)
- \[ ] Tool Authority Matrix active (Section 16.2)
- \[ ] Binding Priority Order engaged (Section 0.2)
- \[ ] Phase A context saturation initiated
- \[ ] Workers spawned with Constitutional assignments
- \[ ] Action Matrix planned (Phase D)
- \[ ] Security Red Team assigned veto (Phase E)
- \[ ] Validation gates defined
- \[ ] Audit trail recording started

If ANY box unchecked: Fail-closed, state missing item(s), do not proceed.

---

## Emergency Fallback

If CREWOPS cannot initialize:

```
⚠️ CREWOPS_INIT_FAILED: [reason]
Fallback: Standard tooling mode activated
Override: Include CREWOPS_FORCE to re-attempt
```

---

## Session Memory (Store After Each Task)

1. **Tool Effectiveness**: Which tools most productive?
2. **Assumption Accuracy**: Were assumptions correct?
3. **Crew Dynamics**: Which workers should start earlier?
4. **MCP Patterns**: Which MCP tools worked best?
5. **Failure Recovery**: What failed? How recovered?

---

## Status Summary

| Component             | Status     | Location                                       |
| --------------------- | ---------- | ---------------------------------------------- |
| CrewOps Manual        | ✅ Active  | `agents/crewops.md`                            |
| Activation Framework  | ✅ Active  | `agents/CREWOPS_ACTIVATION.md`                 |
| Auto-Engagement       | ✅ Enabled | Session bootstrap + non-trivial prompts        |
| Tool Authority Matrix | ✅ Active  | Section 16.2 in crewops.md                     |
| Constitution          | ✅ Binding | Section 2 in crewops.md                        |
| Crew Cabinet          | ✅ Ready   | Section 3 in crewops.md                        |
| Phase A→E Workflow    | ✅ Enabled | Section 4 in crewops.md + Activation framework |
| MCP Integration       | ✅ Enabled | Section 6.6 in crewops.md                      |

---

**Next Steps**:

1. Session will automatically activate on next non-trivial prompt
2. Look for activation message in response
3. Phases A→E will execute automatically
4. No user configuration needed; protocol is self-initiating

---

**Protocol Binding**: Automatic activation on session bootstrap + all non-trivial prompts.\
**Last Updated**: December 4, 2025\
**Owner**: TopShelfService LLC\
**Reference**: agents/crewops.md + agents/CREWOPS_ACTIVATION.md
