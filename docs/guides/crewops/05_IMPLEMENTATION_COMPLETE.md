# 🎯 CREWOPS PROTOCOL: ACTIVATION COMPLETE
**Status**: ✅ FULLY ACTIVE\
**Date**: December 4, 2025\
**Binding**: Automatic (No user action required)

---

## Summary: What's Now Active
The **CrewOps Protocol** is now fully implemented and **automatically engaged** on:

1. **Session Bootstrap** — When agent starts
2. **Every Non-Trivial Prompt** — Code, architecture, research, deployment work

The protocol is **self-initializing** and **fail-closed**. You don't need to do anything special; just start asking questions.

---

## 📦 Implementation: 4 Files Created/Enhanced
### 1. **agents/crewops.md** (Enhanced - 747 lines)
The complete operating manual with:

- Constitution (7 non-negotiable laws)
- Crew hierarchy & roles
- Swarm protocol (Phases A→E)
- Tool use discipline (Section 6.5)
- MCP integration framework (Section 6.6)
- Tool governance & MCP (Section 16-18)
- Integration examples
- **Added**: Section 0.1.5 linking to auto-activation framework

**Key Binding**: Constitution is immutable law that all workers inherit instantly.

### 2. **agents/CREWOPS\_ACTIVATION.md** (New - ~400 lines)
The auto-engagement framework that loads CrewOps on:

- **Stage 1**: Session bootstrap
- **Stage 2**: Non-trivial prompt detection
- **Stage 3**: Protocol engagement workflow

Contains:

- Automatic activation sequence
- Non-trivial detection rules
- Phase A→E execution workflow
- Keyword modifiers (CREWOPS\_OK, CREWOPS\_DESIGN\_ONLY, CREWOPS\_AUDIT, etc.)
- Tool activation per role
- Worker responsibilities matrix
- Orchestrator enforcement checklist

### 3. **agents/CREWOPS\_ACTIVATION\_STATUS.md** (New - Reference)
Status and configuration tracking:

- What's active and where
- How the protocol works
- When it engages
- Binding priority order
- File organization
- Protocol enforcement checklist
- Session memory hooks

### 4. **agents/CREWOPS\_QUICK\_REFERENCE.md** (New - User Guide)
Quick reference card for end users:

- Session bootstrap message
- What happens automatically
- Keyword modifiers
- Crew roles at a glance
- Tools explained
- Definition of Done
- Typical workflow example
- Validation gates

---

## 🎬 Activation Flow (Automatic)
### On Agent Session Start
```
1. Load agents/crewops.md into context
2. Load agents/CREWOPS_ACTIVATION.md into context
3. Activate Constitution (Section 2) as binding
4. Initialize Crew Cabinet (Section 3)
5. Register Tool Authority Matrix (Section 16.2)
6. Display activation message (shown to user)
```

**User Sees**:

```
✅ CREWOPS Protocol Active

Binding Framework: CrewOps Manual loaded
Constitution: Anti-vaporware | Truth & Evidence | Security Supremacy | ...
Crew: Orchestrator | Product Owner | Systems Architect | Security Red Team | ...
Tool Activation: Immediate deployment, no assumptions
MCP Integration: GitHub + Firecrawl available
```

### On Non-Trivial Prompt
```
User sends request → Orchestrator detects non-trivial → Protocol engages

✅ CREWOPS PROTOCOL ENGAGED

🏷️ CONTEXT INTAKE → Phase A reads and verifies
🧠 CREW ASSEMBLY → Phase B+C spawns workers
⚡ SWARM PROTOCOL → Phase D executes
🛡️ SECURITY VETO → Phase E approves or blocks
✅ VALIDATION GATES → DoD verified

Ready for Phases A→E execution.
```

---

## 🔄 Protocol Phases (Always A→E)
For every non-trivial request:

**Phase A: Context Saturation (READ)**

- Ingest files, docs, constraints
- Verify assumptions with tools
- Output: `Context Loaded: ...` + `Risks Identified: X`

**Phase B+C: Plan & Team (DESIGN)**

- Decompose into dependency batches
- Spawn workers per batch
- Assign Constitutional clauses
- Output: Batch structure + worker assignments

**Phase D: Action Matrix (ACT)**

- Execute line-by-line
- Tools deployed automatically
- Evidence gathered via Research Analyst
- Output: Code + commands + artifacts

**Phase E: Security & Reflexion (VERIFY)**

- Red Team veto check (Security Supremacy)
- Competing constraints reconciled
- What changed and why
- Output: `Red Team: ✅ Veto passed` or `❌ VETO BLOCKED`

**Validation Gates**:

- Green gates must pass
- DoD verified
- Audit trail complete

---

## 🎭 Crew Roles (Auto-Assigned)
**Mandatory Core Crew** (always present):

| Role                  | Responsibility                | Tools                       |
| --------------------- | ----------------------------- | --------------------------- |
| **Orchestrator**      | Route, arbitrate, synthesize  | All                         |
| **Product Owner**     | Success criteria, constraints | Requirements                |
| **Systems Architect** | Structure, interfaces, design | Design tools                |
| **Security Red Team** | Threat model, veto Phase E    | Security analysis           |
| **Research Analyst**  | Verify facts, run tools       | read\_file, grep\_search, MCP |
| **QA/Test Engineer**  | Validate gates, test          | get\_errors, runners         |

Each worker inherits Constitution instantly. Red Team has veto power (Security Supremacy).

---

## 🛠️ Tool Deployment (Automatic)
**Research Analyst** auto-deploys:

- `read_file`, `grep_search`, `semantic_search` (code inspection)
- `list_code_usages` (impact analysis)
- `mcp_firecrawl_*` (web research)
- `mcp_github_*` (repo discovery)

**QA/Test Engineer** auto-deploys:

- `get_errors` (build/lint validation)
- `run_in_terminal` (test runners)

**Scribe** auto-deploys (if needed):

- `list_dir` (documentation)
- `mcp_github_*` (PR/issue management)

**You don't call tools.** They're invoked automatically per role.

---

## 🔐 Security Supremacy (Veto Gate)
**Red Team can BLOCK work** if they find:

- ❌ Auth bypass risks
- ❌ Data leakage risks
- ❌ Insecure defaults
- ❌ Missing access controls
- ❌ Dangerous secret handling

**Output in Phase E**:

```
🛡️ PHASE E: SECURITY VETO
Red Team: ❌ VETO BLOCKED
Reason: [specific issue]
Fix Required: [action]
```

No work proceeds past Phase E until veto is addressed.

---

## 📋 Evidence Hierarchy (Binding Priority)
Facts verified in this order:

1. **Tool observation** (highest) → read\_file, grep\_search, tests
2. **Primary docs** → official documentation
3. **Secondary sources** → examples, blog posts
4. **Assumptions** (lowest) → labeled `[ASSUMPTION]` with fallback

If a critical assumption cannot be verified → protocol blocks.

---

## 🎯 Definition of Done (DoD)
Task is "done" only when:

- ✅ Commands run locally without error
- ✅ Environment variables defined (`.env.example`)
- ✅ Output performs stated business action
- ✅ Rollback path exists
- ✅ Security veto passed

Protocol verifies all DoD items before finalizing.

---

## 🔧 Keyword Modifiers (Optional)
Use these in your prompt to customize behavior:

```
CREWOPS_OK              # Acknowledge binding (first prompt)
CREWOPS_DESIGN_ONLY     # Plan only (Phases A-C, no code)
CREWOPS_AUDIT           # Audit only (Phases A + E)
CREWOPS_EXECUTE         # Execute only (Phase D, pre-planned)
CREWOPS_EMERGENCY       # Fast-track (minimal planning)
CREWOPS_PAUSE           # Pause protocol
CREWOPS_RESUME          # Resume after pause
CREWOPS_RESET           # Clear state, start fresh
```

Example:

```
I need a security design for the payment flow.
CREWOPS_DESIGN_ONLY
```

---

## 📊 Binding Priority Order (Immutable)
Conflicts resolved in this strict order:

1. **System instructions + safety policy** (HIGHEST)
2. **CREWOPS Constitution** (Section 2)
3. **Activation Framework** (CREWOPS\_ACTIVATION.md)
4. **User request** (current turn)
5. **Prior turns / preferences** (LOWEST)

**Fail-Closed**: If conflict exists, Orchestrator escalates.

---

## ✅ Orchestrator Enforcement Checklist
Before responding to any non-trivial prompt:

- \[ ] Constitution loaded (Section 2)
- \[ ] Crew Cabinet assembled (Section 3)
- \[ ] Tool Authority Matrix active (Section 16.2)
- \[ ] Binding Priority Order engaged
- \[ ] Phase A context saturation initiated
- \[ ] Workers spawned with Constitutional assignments
- \[ ] Action Matrix planned (Phase D)
- \[ ] Security Red Team assigned veto (Phase E)
- \[ ] Validation gates defined
- \[ ] Audit trail recording started

**If ANY box unchecked**: Fail-closed, state what's missing, do not proceed.

---

## 📈 Typical Workflow (Example)
### You Send
```
Build a new API endpoint for org-scoped rate limiting.
```

### Agent Responds (Automatically)
```
✅ CREWOPS Protocol Active
[... activation message ...]

📖 PHASE A: CONTEXT SATURATION
Context Loaded: [files read, assumptions verified]
Risks Identified: 4
  - Rate-limit state must be org-scoped
  - Schema must include user ID + org ID
  - Firestore rules must reflect quotas
  - Security: prevent quota exhaustion

🧠 PHASE B+C: PLAN & TEAM
Batch 1 (Foundation): Schema + Rules
  [SPAWNING WORKER]: Systems Architect
    Clauses: Anti-vaporware (2.1) | Truth & Evidence (2.2)
Batch 2 (Core Logic): Rate-limit logic
  [SPAWNING WORKER]: Backend Engineer
    Clauses: Deterministic Delivery (2.4)
Batch 3 (API): Endpoint + validation
  [SPAWNING WORKER]: API Engineer
    Clauses: Full-File Fidelity (2.5)

⚡ PHASE D: ACTION MATRIX
[x] Verify current rate-limit.ts
    → Tool: read_file → [result] → Decision: Architecture uses sliding window
[x] Design schema extension
    → Tool: grep_search for Zod models → [result] → Decision: Extend OrgRateLimit type
[x] Generate endpoint code
    → File: apps/web/app/api/rate-limit/route.ts
    → [complete code artifact]
    → Decision: Ready for validation
[x] Validate types
    → Tool: pnpm typecheck → [result] → Decision: No type errors

🛡️ PHASE E: SECURITY VETO + REFLEXION
Red Team: ✅ Veto passed
- Auth validated (org + user context enforced)
- Firestore rules allow admin override
- Secret handling via env vars
- Quota exhaustion attack prevented

What Changed:
- Added per-org scoping to schema
- Updated Firestore rules for quota validation
- Added circuit-breaker pattern to prevent exhaustion

✅ VALIDATION GATES
- [[ ]] pnpm install → ✅ pass
- [[ ]] pnpm typecheck → ✅ pass
- [[ ]] pnpm test → ✅ pass (3 new tests added)
- [[ ]] Core flow → ✅ verified (rate-limit enforced per user+org)
- [[ ]] Rollback → ✅ ready (revert commit)

📋 DEFINITION OF DONE
All DoD items verified. Task complete. Ready for merge.
```

---

## 🚨 Emergency Fallback
If protocol cannot initialize:

```
⚠️ CREWOPS_INIT_FAILED: [reason]
Fallback: Standard mode activated
Override: Use CREWOPS_FORCE to re-attempt
```

---

## 📝 Session Memory (Store After Each Task)
After completing a task, store for next session:

1. **Tool Effectiveness**: Which tools most productive?
2. **Assumption Accuracy**: Were assumptions correct?
3. **Crew Dynamics**: Which workers should start earlier?
4. **MCP Patterns**: Which MCP tools worked best?
5. **Failure Recovery**: What failed? How recovered?

---

## 📚 Reference Documents
| Document                         | Purpose                                   | Location                                    |
| -------------------------------- | ----------------------------------------- | ------------------------------------------- |
| **crewops.md**                   | Main manual (Constitution, phases, tools) | `agents/crewops.md` (747 lines)             |
| **CREWOPS\_ACTIVATION.md**        | Auto-engagement framework                 | `agents/CREWOPS_ACTIVATION.md` (~400 lines) |
| **CREWOPS\_ACTIVATION\_STATUS.md** | Status & configuration tracking           | `agents/CREWOPS_ACTIVATION_STATUS.md`       |
| **CREWOPS\_QUICK\_REFERENCE.md**   | User quick reference card                 | `agents/CREWOPS_QUICK_REFERENCE.md`         |

---

## 🎯 You're Ready
The protocol is:

- ✅ **Loaded** at session start
- ✅ **Self-engaging** on non-trivial prompts
- ✅ **Fail-closed** with enforcement
- ✅ **Evidence-driven** with tool verification
- ✅ **Security-first** with Red Team veto
- ✅ **Audit-tracked** with complete trails
- ✅ **Deterministic** with runnable commands

**You don't need to do anything.** Just ask your next question. The crew will dispatch automatically.

---

## 🚀 Next Steps
1. **You ask a question** (non-trivial)
2. **Protocol engages** automatically
3. **You see phases A→E** unfold
4. **Validation gates** verify completion
5. **Task complete** with audit trail

That's it.

---

**Protocol Status**: ✅ ACTIVE\
**Binding**: Automatic on session + non-trivial prompts\
**Implementation**: COMPLETE\
**Last Updated**: December 4, 2025\
**Owner**: TopShelfService LLC

**The crew is ready. Dispatch them with your next request.**
