# /iterate — Multi-Agent Implementation Orchestrator

> **Usage:** `/iterate <objective>` **Purpose:** Break complex objectives into optimized task
> graphs, assign to specialized subagents, validate via red team, finalize with srdev, then execute.

---

## Phase 0: Objective Analysis

**Input:** User objective statement

**Output:** Structured breakdown

```yaml
objective: "<one-line goal>"
scope:
  affected_systems: []
  estimated_complexity: trivial | moderate | complex | epic
  risk_level: low | medium | high | critical
constraints:
  time_budget: "<hours or sprints>"
  must_preserve: []
  blocked_by: []
success_criteria:
  - "<measurable outcome 1>"
  - "<measurable outcome 2>"
```

---

## Phase 1: Task Graph Generation

### 1.1 Decomposition Rules

| Complexity | Strategy          | Max Parallel | Max Depth |
| ---------- | ----------------- | ------------ | --------- |
| Trivial    | Single sequential | 1            | 1         |
| Moderate   | Parallel batch    | 3            | 2         |
| Complex    | Hybrid DAG        | 5            | 3         |
| Epic       | Phased hybrid     | 8            | 4         |

### 1.2 Task Schema

```typescript
interface Task {
  id: string; // T-001, T-002, etc.
  title: string; // Action-oriented (verb + noun)
  agent: AgentRole; // Who executes
  type: "parallel" | "sequential" | "gate";
  dependencies: string[]; // Task IDs that must complete first
  inputs: string[]; // Artifacts from dependencies
  outputs: string[]; // Artifacts produced
  success_criteria: string[]; // Must all pass for completion
  dod: string[]; // Definition of Done checklist
  estimated_minutes: number;
  risk: "low" | "medium" | "high";
}

type AgentRole =
  | "architect" // System design, API contracts, schema changes
  | "implementer" // Code writing, refactoring
  | "tester" // Test creation, coverage analysis
  | "reviewer" // Code review, pattern validation
  | "docs" // Documentation updates
  | "ops" // CI/CD, deployment, infrastructure
  | "security" // Security audit, vulnerability check
  | "redteam" // Adversarial review, edge cases
  | "srdev"; // Final authority, synthesis
```

### 1.3 Graph Optimization

**Parallel Batching Rules:**

1. Tasks with no shared dependencies → batch parallel
2. Tasks modifying same file → force sequential
3. Tests → parallel batch after implementation gate
4. Documentation → parallel with tests

**Gate Tasks:**

- Must complete before downstream tasks start
- Examples: schema changes, API contract updates, breaking changes

**Hybrid Pattern Example:**

```text
[T-001: Schema] ─────────────────────────────┐
       │                                      │
       ├──► [T-002: Backend] ──┐              │
       │                        ├──► [T-005: Integration Tests]
       └──► [T-003: Frontend] ─┘              │
                │                              │
                └──► [T-004: Unit Tests] ─────┘
                              │
                              ▼
                     [T-006: Red Team Review] ← GATE
                              │
                              ▼
                     [T-007: SrDev Final]
                              │
                              ▼
                     [T-008: Execute]
```

---

## Phase 2: Agent Assignment Protocol

### 2.1 Assignment Template

```markdown
## Task Assignment: {task.id}

**Agent:** @{agent_role} **Title:** {task.title} **Type:** {task.type} **Dependencies:**
{task.dependencies.join(", ") || "None"}

### Context

{relevant_context_from_codebase}

### Inputs

{task.inputs.map(i => `- ${i}`).join("\n")}

### Deliverables

{task.outputs.map(o => `- [ ] ${o}`).join("\n")}

### Success Criteria

{task.success_criteria.map((c, i) => `${i+1}. ${c}`).join("\n")}

### Definition of Done

{task.dod.map(d => `- [ ] ${d}`).join("\n")}

### Constraints

- Time budget: {task.estimated_minutes} minutes
- Risk level: {task.risk}
- Must not break: {constraints.must_preserve.join(", ")}

### Handoff

When complete, produce artifact and report: \`\`\`yaml task_id: {task.id} status: complete | blocked
| failed artifacts: [] blockers: [] notes: "" \`\`\`
```

### 2.2 Agent Specializations

| Agent           | Focus                       | Tools                                   | Validation                          |
| --------------- | --------------------------- | --------------------------------------- | ----------------------------------- |
| **architect**   | Design decisions, contracts | read_file, semantic_search, create_file | Schema compiles, no circular deps   |
| **implementer** | Code changes                | replace_string_in_file, create_file     | TypeScript compiles, lint passes    |
| **tester**      | Test coverage               | create_file, runTests                   | Tests pass, coverage ≥ threshold    |
| **reviewer**    | Pattern validation          | grep_search, read_file                  | No anti-patterns found              |
| **docs**        | Documentation               | create_file, replace_string_in_file     | Links valid, examples run           |
| **ops**         | Infrastructure              | run_in_terminal, create_file            | CI passes, deploys work             |
| **security**    | Vulnerabilities             | grep_search, semantic_search            | No secrets, no injection vectors    |
| **redteam**     | Break it                    | All tools                               | Finds edge cases, documents risks   |
| **srdev**       | Final synthesis             | All tools                               | Integrates all feedback, final call |

---

## Phase 3: Execution Engine

### 3.1 Parallel Batch Executor

```python
def execute_graph(tasks: List[Task]) -> ExecutionResult:
    completed = set()
    results = {}

    while len(completed) < len(tasks):
        # Find ready tasks (all deps satisfied)
        ready = [t for t in tasks
                 if t.id not in completed
                 and all(d in completed for d in t.dependencies)]

        # Batch by type
        parallel_batch = [t for t in ready if t.type == "parallel"]
        sequential = [t for t in ready if t.type == "sequential"]
        gates = [t for t in ready if t.type == "gate"]

        # Execute parallel batch concurrently
        if parallel_batch:
            batch_results = parallel_execute(parallel_batch)
            results.update(batch_results)
            completed.update(t.id for t in parallel_batch if batch_results[t.id].success)

        # Execute sequential one at a time
        for task in sequential:
            result = execute_single(task)
            results[task.id] = result
            if result.success:
                completed.add(task.id)
            else:
                break  # Stop on failure

        # Gates must pass before continuing
        for gate in gates:
            result = execute_single(gate)
            results[gate.id] = result
            if not result.success:
                return ExecutionResult(success=False, blocked_by=gate.id)
            completed.add(gate.id)

    return ExecutionResult(success=True, results=results)
```

### 3.2 Iteration Protocol

On task failure:

1. Capture error context
2. Route to appropriate agent for fix
3. Re-run failed task
4. Max 3 retries before escalation to srdev

---

## Phase 4: Red Team Review (Gate)

### 4.1 Red Team Prompt

```markdown
## 🔴 Red Team Review: {objective}

**Review Scope:** {completed_tasks.map(t => `- ${t.id}: ${t.title}`).join("\n")}

**Your Mission:** Find problems before production does.

### Attack Vectors

1. **Input Validation** — Can malformed input crash or bypass?
2. **Race Conditions** — What if concurrent requests hit this?
3. **Edge Cases** — Empty arrays, null refs, max values?
4. **Security** — Auth bypass, injection, data leakage?
5. **Performance** — N+1 queries, unbounded loops, memory leaks?
6. **Rollback** — If this fails in prod, can we recover?

### Review Checklist

- [ ] All success criteria actually verified (not just "looks good")
- [ ] Error paths tested, not just happy path
- [ ] Breaking changes have migration path
- [ ] Secrets/credentials not exposed
- [ ] Rate limiting considered
- [ ] Logging doesn't leak PII

### Output Format

\`\`\`yaml verdict: approved | conditional | rejected issues:

- severity: critical | high | medium | low title: "" description: "" affected_tasks: []
  suggested_fix: "" recommendations: [] risks_accepted: [] \`\`\`
```

---

## Phase 5: SrDev Final Review

### 5.1 SrDev Synthesis Prompt

```markdown
## 🎯 SrDev Final Review: {objective}

**Implementation Summary:** {task_results_summary}

**Red Team Findings:** {redteam_output}

### Your Responsibilities

1. **Validate** — Are success criteria actually met?
2. **Integrate** — Do all pieces work together?
3. **Correct** — Fix any issues red team found
4. **Consider** — What did we miss? Future implications?
5. **Decide** — Ship, iterate, or abort?

### Corrections Required

{redteam_issues.filter(i => i.severity in ["critical", "high"]).map(format)}

### Considerations

- Backward compatibility impact
- Documentation gaps
- Test coverage adequacy
- Monitoring/alerting needs
- Rollout strategy

### Final Implementation Plan

\`\`\`yaml decision: ship | iterate | abort corrections:

- task_id: "" action: "" owner: "" rollout: strategy: immediate | staged | feature-flagged stages:
  [] monitoring: alerts: [] dashboards: [] documentation: updates_required: [] \`\`\`
```

---

## Phase 6: Execute

### 6.1 Execution Prompt

```markdown
## ⚡ Execute Implementation Plan

**Decision:** {srdev_decision} **Corrections Applied:** {corrections_count}

### Execution Order

{final_task_order.map((t, i) => `${i+1}. ${t.id}: ${t.title}`).join("\n")}

### Pre-Flight Checks

- [ ] All corrections from srdev applied
- [ ] Tests passing locally
- [ ] No merge conflicts with main
- [ ] CI/CD pipeline ready

### Execute

{for each task in order}

1. Apply changes for {task.id}
2. Verify success criteria
3. Run tests
4. Commit with message: "{task.id}: {task.title}" {end for}

### Post-Execution

- [ ] All tests green
- [ ] Commit history clean
- [ ] PR ready for review (if applicable)
- [ ] Documentation updated
```

---

## Quick Reference: /iterate Invocation

```text
/iterate Implement Redis rate limiting with idempotency support
```

**Expands to:**

1. **Analyze** → Break into tasks with dependencies
2. **Assign** → Specialized agents get scoped work
3. **Execute** → Parallel/sequential/hybrid execution
4. **RedTeam** → Adversarial review gate
5. **SrDev** → Final corrections and considerations
6. **Act** → Execute the approved plan

---

## Example: Full Iteration

### Input

```text
/iterate Add bulk member import with CSV validation
```

### Generated Task Graph

```yaml
tasks:
  - id: T-001
    title: Design CSV schema and validation rules
    agent: architect
    type: gate
    dependencies: []
    outputs: [schema.ts, validation-rules.md]

  - id: T-002
    title: Implement CSV parser with streaming
    agent: implementer
    type: parallel
    dependencies: [T-001]
    outputs: [csv-parser.ts]

  - id: T-003
    title: Implement validation pipeline
    agent: implementer
    type: parallel
    dependencies: [T-001]
    outputs: [validator.ts]

  - id: T-004
    title: Create bulk import API endpoint
    agent: implementer
    type: sequential
    dependencies: [T-002, T-003]
    outputs: [route.ts]

  - id: T-005
    title: Unit tests for parser and validator
    agent: tester
    type: parallel
    dependencies: [T-002, T-003]
    outputs: [*.test.ts]

  - id: T-006
    title: Integration tests for import flow
    agent: tester
    type: sequential
    dependencies: [T-004, T-005]
    outputs: [import.integration.test.ts]

  - id: T-007
    title: Red Team Review
    agent: redteam
    type: gate
    dependencies: [T-006]

  - id: T-008
    title: SrDev Final
    agent: srdev
    type: gate
    dependencies: [T-007]

  - id: T-009
    title: Execute
    agent: implementer
    type: sequential
    dependencies: [T-008]

execution_order:
  batch_1: [T-001]              # Gate
  batch_2: [T-002, T-003]       # Parallel
  batch_3: [T-004]              # Sequential (needs both)
  batch_4: [T-005]              # Parallel with implementation
  batch_5: [T-006]              # Integration gate
  batch_6: [T-007]              # Red team gate
  batch_7: [T-008]              # SrDev gate
  batch_8: [T-009]              # Execute
```

---

## Meta: Prompt Engineering Notes

### Weighting Factors for Task Type Selection

| Factor                  | Parallel Weight | Sequential Weight |
| ----------------------- | --------------- | ----------------- |
| Independent files       | +2              | 0                 |
| Shared state            | -3              | +3                |
| Test vs implementation  | +1              | 0                 |
| Schema/contract changes | -2              | +2                |
| Documentation           | +2              | 0                 |
| High risk               | -1              | +1                |
| Time critical           | +1              | -1                |

**Formula:**

```text
task_type = parallel_weight > sequential_weight ? "parallel" : "sequential"
if (is_blocking_downstream) task_type = "gate"
```

### Agent Selection Heuristics

| Task Keywords                     | Primary Agent | Backup      |
| --------------------------------- | ------------- | ----------- |
| schema, type, interface, contract | architect     | srdev       |
| implement, create, add, fix       | implementer   | srdev       |
| test, coverage, spec              | tester        | implementer |
| review, audit, check              | reviewer      | security    |
| docs, readme, guide               | docs          | implementer |
| deploy, ci, pipeline              | ops           | srdev       |
| auth, security, encrypt           | security      | srdev       |

---

## Confidence Rating System

### Task-Level Confidence (0-100)

Each completed task receives a confidence score:

| Score  | Label          | Meaning                           | Action                    |
| ------ | -------------- | --------------------------------- | ------------------------- |
| 90-100 | 🟢 **Ship**    | Production ready, fully validated | Commit immediately        |
| 75-89  | 🟡 **Review**  | Solid but needs second look       | Peer review before commit |
| 50-74  | 🟠 **Iterate** | Works but has gaps                | Address gaps, re-score    |
| 25-49  | 🔴 **Rework**  | Fundamental issues                | Return to agent for fixes |
| 0-24   | ⛔ **Abort**   | Wrong approach entirely           | Redesign from scratch     |

### Confidence Calculation Formula

```typescript
interface ConfidenceFactors {
  tests_passing: number; // 0-25 pts
  success_criteria_met: number; // 0-25 pts
  no_type_errors: number; // 0-15 pts
  no_lint_errors: number; // 0-10 pts
  documentation_complete: number; // 0-10 pts
  security_reviewed: number; // 0-10 pts
  edge_cases_covered: number; // 0-5 pts
}

function calculateConfidence(factors: ConfidenceFactors): number {
  return Object.values(factors).reduce((sum, v) => sum + v, 0);
}
```

### Aggregate Confidence (Commit Readiness)

```yaml
commit_confidence:
  formula: |
    (Σ task_confidence × task_weight) / Σ task_weight
    × redteam_modifier 
    × srdev_modifier

  modifiers:
    redteam:
      approved: 1.0
      conditional: 0.85
      rejected: 0.0
    srdev:
      ship: 1.0
      iterate: 0.9
      abort: 0.0

  thresholds:
    commit: 85 # Auto-commit if ≥85
    review: 70 # Requires human review if 70-84
    block: <70 # Cannot commit, must iterate
```

### Weight Assignment by Task Type

| Task Type              | Base Weight | Risk Multiplier | Final Weight |
| ---------------------- | ----------- | --------------- | ------------ |
| Schema/Contract (gate) | 3.0         | × risk_factor   | 3.0-4.5      |
| Core Implementation    | 2.0         | × risk_factor   | 2.0-3.0      |
| Tests                  | 1.5         | × 1.0           | 1.5          |
| Documentation          | 1.0         | × 1.0           | 1.0          |
| Refactor               | 1.0         | × risk_factor   | 1.0-1.5      |

```typescript
const RISK_MULTIPLIERS = {
  low: 1.0,
  medium: 1.25,
  high: 1.5,
};
```

### Confidence Report Format

```yaml
# Generated after each iteration cycle
confidence_report:
  timestamp: "2025-12-19T23:45:00Z"
  objective: "Implement Redis rate limiting"

  tasks:
    - id: T-001
      title: "Design Redis client singleton"
      agent: architect
      confidence: 92
      factors:
        tests_passing: 25
        success_criteria_met: 25
        no_type_errors: 15
        no_lint_errors: 10
        documentation_complete: 10
        security_reviewed: 7
        edge_cases_covered: 0
      weight: 3.0

    - id: T-002
      title: "Implement rate limiter"
      agent: implementer
      confidence: 78
      factors:
        tests_passing: 20
        success_criteria_met: 20
        no_type_errors: 15
        no_lint_errors: 10
        documentation_complete: 5
        security_reviewed: 5
        edge_cases_covered: 3
      weight: 2.5

  gates:
    redteam:
      verdict: conditional
      modifier: 0.85
      issues_found: 2
      issues_resolved: 1

    srdev:
      decision: ship
      modifier: 1.0
      corrections: 1

  aggregate:
    raw_score: 84.2
    weighted_score: 71.57 # After modifiers
    final_confidence: 72
    recommendation: review

  commit_decision:
    can_commit: false
    reason: "Below auto-commit threshold (85)"
    required_action: "Human review required"
    blocking_tasks: [T-002]
```

### Visual Confidence Dashboard

```text
┌─────────────────────────────────────────────────────────────┐
│  📊 ITERATION CONFIDENCE REPORT                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Objective: Implement Redis rate limiting                   │
│  Iteration: #2                                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TASK CONFIDENCE                                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ T-001 Design      ████████████████████░░ 92 🟢      │   │
│  │ T-002 Implement   ███████████████░░░░░░░ 78 🟡      │   │
│  │ T-003 Tests       ████████████████████░░ 95 🟢      │   │
│  │ T-004 Docs        ██████████████░░░░░░░░ 70 🟠      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ GATES                                                │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🔴 RedTeam:  CONDITIONAL (×0.85)                    │   │
│  │ 🎯 SrDev:    SHIP (×1.0)                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AGGREGATE                                            │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Raw:      84.2                                       │   │
│  │ Weighted: 71.6                                       │   │
│  │ Final:    72 🟠 ITERATE                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️  COMMIT BLOCKED — Resolve T-002 edge cases             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Confidence-Based Actions

| Final Score | Commit    | Next Action                     |
| ----------- | --------- | ------------------------------- |
| ≥ 90        | ✅ Auto   | Deploy to staging               |
| 85-89       | ✅ Auto   | Monitor closely                 |
| 75-84       | 🔍 Review | Human approval required         |
| 60-74       | ⏸️ Hold   | Fix blocking issues, re-iterate |
| < 60        | ❌ Block  | Major rework or abort           |

---

**Version:** 1.1.0 **Last Updated:** December 19, 2025 **Owner:** @srdev
