# CREWOPS Quick Reference Card
**Status**: ✅ ACTIVE (Auto-Engaging)\
**Session**: Automatic\
**Binding**: Immutable

---

## 🚀 Session Bootstrap (Automatic)
When you start, you'll see:

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

**You don't need to do anything.** The protocol is active.

---

## 📌 For Your First Prompt
Include one of these (optional):

### Handshake (Explicit Acknowledgment)
```
Goal: [what you want]
Constraints: [what limits you]
Deliverable: [plan/code/audit/refactor/release]

CREWOPS_OK
```

### Or Just Ask (Protocol Auto-Engages)
```
[Your request here - any non-trivial task]
```

The protocol detects "non-trivial" automatically and engages Phases A→E.

---

## 🎯 What Happens Automatically
### Phase A: Context Saturation
- Agent reads your goal, files, constraints
- Verifies assumptions with tools
- Displays: `Context Loaded: ...` + `Risks Identified: X`

### Phase B+C: Planning + Team Assembly
- Breaks task into dependency batches
- Spawns workers with role assignments
- Displays: Batch structure + Constitutional assignments

### Phase D: Action Matrix
- Executes line-by-line
- Runs tools in parallel
- Displays: `[ ] Action 1 → [tool] → [result] → [x] Done`

### Phase E: Security + Validation
- Red Team approves or vetos (Security Supremacy)
- Competing constraints resolved
- Displays: Green gates + what changed

---

## 🔧 Keyword Modifiers (Optional)
Add any of these to your prompt to customize behavior:

```
CREWOPS_OK              # Acknowledge binding (first prompt)
CREWOPS_DESIGN_ONLY     # Plan only (no code)
CREWOPS_AUDIT           # Find problems (no fixes)
CREWOPS_EXECUTE         # Run pre-planned (Phase D only)
CREWOPS_EMERGENCY       # Fast-track (minimal planning)
CREWOPS_PAUSE           # Pause protocol
CREWOPS_RESUME          # Resume after pause
CREWOPS_RESET           # Clear state, start fresh
```

Example:

```
I need a security audit for the auth flow.
CREWOPS_AUDIT
```

---

## 🎭 Crew Roles (What Each Does)
| Role                  | When       | What They Do                    |
| --------------------- | ---------- | ------------------------------- |
| **Orchestrator**      | Always     | Routes, arbitrates, synthesizes |
| **Product Owner**     | Phase A, B | Defines success criteria        |
| **Systems Architect** | Phase B, D | Design decisions, interfaces    |
| **Security Red Team** | Phase E    | Veto unsafe work                |
| **Research Analyst**  | Phase A, D | Verify facts, run tools         |
| **QA/Test Engineer**  | Phase D, E | Validate gates, test            |

You don't manage them. They self-coordinate per the Constitution.

---

## 🛠️ Tools (Automatic Deployment)
**Research Analyst uses**:

- `read_file`, `grep_search`, `semantic_search` (code inspection)
- `mcp_firecrawl_*` (web research)
- `mcp_github_*` (repo inspection)

**QA/Test Engineer uses**:

- `get_errors` (build/lint validation)
- `run_in_terminal` (test runners)

**Scribe uses**:

- `list_dir` (documentation)
- `mcp_github_*` (PR/issue management)

**You don't call tools.** They're deployed automatically per role.

---

## 📋 Definition of Done (DoD)
Task is "done" only when:

- ✅ Commands run locally without error
- ✅ Env vars defined in `.env.example`
- ✅ Output performs stated business action
- ✅ Rollback path exists
- ✅ Security veto passed

If not verified, protocol states clearly.

---

## 🔴 Red Team Veto (Security Supremacy)
Red Team can block work if they find:

- ❌ Auth bypass risk
- ❌ Data leakage risk
- ❌ Insecure defaults
- ❌ Missing access controls
- ❌ Dangerous secret handling

If veto triggered, Phase E output states clearly:

```
🛡️ PHASE E: SECURITY VETO
Red Team: ❌ VETO BLOCKED
Reason: Auth context not validated; org-scoping missing
Fix Required: [specific action]
```

---

## 📊 Evidence Hierarchy (What Proves Things)
Protocol uses facts in this order:

1. **Tool observation** (highest confidence) → `read_file`, `grep_search`
2. **Primary docs** → official documentation
3. **Secondary sources** → blog posts, examples
4. **Assumptions** (lowest confidence) → labeled `[ASSUMPTION]`

If critical assumption cannot be verified → protocol blocks and states why.

---

## ✅ Validation Gates (Before Finalizing)
**Required gates for code work**:

- \[ ] `pnpm install` succeeds
- \[ ] `pnpm typecheck` passes
- \[ ] `pnpm build` succeeds
- \[ ] Core flows work (business action verified)
- \[ ] Security checks align to RBAC

If not verified: Protocol states clearly what remains + how to verify.

---

## 🚨 If Something Fails
Protocol is fail-closed:

```
⚠️ CREWOPS_INIT_FAILED: [reason]
Fallback: Standard mode activated
Override: CREWOPS_FORCE to re-attempt
```

Or mid-execution:

```
[ ] Action 1 (Worker X) → [TOOL_FAILURE: timeout]
Fallback: [alternative approach]
Retry: [command to run manually]
```

---

## 📝 Deliverable Types (Choose One)
```
DELIVERABLE: plan-only      # Phases A-C: Design only
DELIVERABLE: code           # Phases A-E: Full implementation
DELIVERABLE: audit          # Phases A + E: Find issues
DELIVERABLE: refactor       # Phases A-E: Quality focus
DELIVERABLE: release        # Phases A-E: Production gates
```

Example:

```
I need to design a new caching strategy.
DELIVERABLE: plan-only
```

---

## 🔗 Reference Docs
**Main Manual**: `agents/crewops.md` (747 lines)

- Constitution
- Crew hierarchy
- Phases A→E
- Tool discipline
- MCP integration

**Activation Framework**: `agents/CREWOPS_ACTIVATION.md` (~400 lines)

- Auto-engagement rules
- Non-trivial detection
- Phase workflows
- Keyword modifiers

**Status Tracker**: `agents/CREWOPS_ACTIVATION_STATUS.md`

- What's active
- How it works
- Enforcement checklist

---

## 🎯 Typical Workflow
### You Send
```
Build a new API endpoint for org-scoped rate limiting.
```

### Agent Responds (Automatically)
```
✅ CREWOPS Protocol Active
[activation message]

📖 PHASE A: CONTEXT SATURATION
Context Loaded: [summary]
Risks Identified: 4
  - Rate-limit state must be org-scoped
  - Schema must include user ID + org ID
  - Firestore rules must reflect quotas
  - Security: prevent quota exhaustion

🧠 PHASE B+C: PLAN & TEAM
Batch 1 (Foundation): Schema + Rules
  [SPAWNING WORKER]: Systems Architect (Clauses: 2.1, 2.5, 2.7)
Batch 2 (Core Logic): Rate-limit logic
  [SPAWNING WORKER]: Backend Engineer (Clauses: 2.2, 2.4)
Batch 3 (API): Endpoint + validation
  [SPAWNING WORKER]: API Engineer (Clauses: 2.1, 2.5)

⚡ PHASE D: ACTION MATRIX
[x] Verify current rate-limit.ts
    → Tool: read_file → [result] → [decision]
[x] Design schema
    → Tool: grep_search → [result] → [decision]
[x] Generate endpoint code
    → File artifact: apps/web/app/api/rate-limit/route.ts
    → [code] → [decision]

🛡️ PHASE E: SECURITY VETO
Red Team: ✅ Veto passed
- Auth validated (org + user context)
- Firestore rules allow admin override
- Secrets via env vars

✅ VALIDATION GATES
- [[ ]] pnpm install → pass
- [[ ]] pnpm typecheck → pass
- [[ ]] pnpm test → pass (new tests included)
- [[ ]] Core flow → verified
- [[ ]] Rollback → ready
```

---

## 🚀 That's It
The protocol handles everything automatically. You just:

1. State what you want
2. The crew figures out how
3. Validation gates verify it works

No micromanagement needed. The Constitution and Phase framework do the heavy lifting.

---

**Status**: ✅ Protocol Active\
**Binding**: Automatic\
**Ready**: Yes\
**Version**: 1.0\
**Last Updated**: December 4, 2025
