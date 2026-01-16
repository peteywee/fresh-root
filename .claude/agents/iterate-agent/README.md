# Iterate Agent

Multi-Agent Implementation Orchestrator.

## Overview

The Iterate Agent orchestrates complex implementations by breaking them into task graphs, assigning specialized agents, and executing with validation and review.

## When to Use

✅ **Use this agent for**:
- Complex multi-step implementations
- Objectives requiring multiple agent types
- Large refactoring or architectural changes
- Parallel work coordination

❌ **Don't use this agent for**:
- Simple implementations (use Implement Agent)
- Planning (use Plan Agent)
- Single-agent tasks

## Invocation

```
Use the iterate agent to execute this objective
Run the iterate agent on the complex refactoring
Orchestrate the implementation of these features
```

## Process

### Phase 0: Objective Analysis
Input: User objective statement
Output: Structured breakdown with scope, constraints, success criteria

### Phase 1: Task Graph Generation
- Decompose objectives into tasks
- Define dependencies
- Optimize for parallelization
- Create task schema

### Phase 2: Agent Assignment
- Assign tasks to specialized agents
- Match agent roles to task types
- Distribute workload

### Phase 3: Validation
- Red team checks
- Pattern validation
- Risk assessment

### Phase 4: Sr Dev Review
- Final authority
- Approve execution plan
- Sign off on strategy

### Phase 5: Execution
- Execute agents in parallel/sequential
- Monitor progress
- Handle failures

## Task Types

| Type | Execution | Dependencies |
|------|-----------|--------------|
| **Sequential** | One after another | Previous task |
| **Parallel** | Simultaneously | Multiple or none |
| **Gate** | Blocks downstream | Must complete first |

## Agent Roles

- **architect** - System design, API contracts
- **implementer** - Code writing, refactoring
- **tester** - Test creation, coverage
- **reviewer** - Code review, pattern validation
- **docs** - Documentation updates
- **ops** - CI/CD, deployment
- **security** - Security audit, vulnerability
- **redteam** - Adversarial review
- **srdev** - Final authority

## Complexity Tiers

| Complexity | Strategy | Max Parallel | Max Depth |
|-----------|----------|--------------|-----------|
| **Trivial** | Single sequential | 1 | 1 |
| **Moderate** | Parallel batch | 3 | 2 |
| **Complex** | Hybrid DAG | 5 | 3 |
| **Epic** | Phased hybrid | 8 | 4 |

## Output Format

Structured execution report with:
- Task graph visualization
- Agent assignments
- Parallel batches
- Sequential gates
- Risk assessment
- Execution results

## See Also

- [Plan Agent](./../plan-agent/) — Create implementation plans
- [Implement Agent](./../implement-agent/) — Execute single-agent tasks
