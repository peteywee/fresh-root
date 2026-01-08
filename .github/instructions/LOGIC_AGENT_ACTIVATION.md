# Logic Agent Activation Guide

**Status**: Ready to use
**Namespace**: `/logic`
**Confidence Floor**: 85% (always-on)
**Docs**: `.github/instructions/logic-agent*.instructions.md`

---

## How It's Wired In

### 1. Core Framework

- **File**: `logic-agent.instructions.md`
- **Contains**: 5-step verification protocol, senior dev checklist, anti-patterns
- **Purpose**: Foundation - how radical skepticism works

### 2. CLI Integration

- **File**: `logic-agent-cli.instructions.md`
- **Contains**: All `/logic` commands with flags, tags, and Mermaid visuals
- **Purpose**: Make the protocol invocable and practical

### 3. Quick Reference

- **File**: `LOGIC_AGENT_QUICK_REF.md`
- **Contains**: Command cheatsheet, use cases, power combos
- **Purpose**: Fast lookup during work

### 4. Master Directive Link

- **File**: `01_MASTER_AGENT_DIRECTIVE.instructions.md`
- **Change**: Added logic agent commands to slash command list
- **Purpose**: Central discovery point

### 5. INDEX Registration

- **File**: `INDEX.md`
- **Change**: Added "Operational Protocols" section
- **Purpose**: Documentation hierarchy

---

## Available Commands

### Core Commands

```bash
/logic verify       # Full 5-step verification
/logic chain        # Dependency chain check
/logic risk         # Risk assessment matrix
/logic test         # Coverage analysis
/logic assumptions  # Hidden assumptions
/logic red-team     # Attack analysis
/logic confidence   # Certainty rating
/logic decision     # Document choice
/logic ground       # Evidence check
```

### Power Combos

```bash
/logic gauntlet     # assumptions → verify → red-team
/logic ladder       # chain → confidence → ground
/logic deploy       # risk → test → decision
```

### Flags

```bash
-h, --help          # Show help
-v, --visual        # Mermaid diagram
-f, --fast          # Skip explanations
```

### Tags

```bash
#shipping           # Deploy decision
#arch               # Architecture
#bug                # Bug investigation
#perf               # Performance
```

---

## Quick Start

### Scenario 1: "I think we should do X"

```bash
You: I think we should cache queries

/logic verify
# Claim: Caching improves performance
# Evidence needed: benchmarks, hit rates, complexity cost
# Evidence gathered: [actual data]
# Analysis: 60% hits, 40% latency gain, moderate complexity
# Confidence: 80% 🟠 YELLOW (below floor)

/logic red-team
# Problem: Cache invalidation
# Risk: 5% stale data
# Mitigation: TTL + hooks

# Result: Need more evidence before proceeding (below 85% floor)
```

### Scenario 2: "Is this tested enough?"

```bash
You: Ready to deploy?

/logic test
# Happy path: ✓
# Error cases: ✗ (missing: timeout, null, concurrent)
# Integration: ✗
# Scale: ✗
# Coverage: 35% 🔴 GARBAGE

# Verdict: NOT safe to deploy
```

### Scenario 3: "What could go wrong?"

```bash
You: /logic red-team -v
# Shows Mermaid attack tree
# Lists critical, high, medium, low risks
# Includes: blast radius, probability, mitigation

# Result: Visual map of vulnerabilities
```

### Scenario 4: "Ready to ship?" (Full Check)

```bash
You: /logic deploy #shipping
# Runs: risk → test → decision
# Creates deploy readiness matrix
# Tags decision for audit trail

# Result: Clear go/no-go with evidence
```

---

## Integration Points

### In Conversation Flow

Agent works **always-on** but responds differently:

**Normal mode**:

```text
User: Should we cache this?
Agent: Yes, with these trade-offs...
```

**Logic mode** (invoked via `/logic`):

```text
User: Should we cache this?
/logic verify -v
Agent: [Full 5-step breakdown with Mermaid diagram]
Agent: [Confidence: X%, because...]
```

### When to Auto-Suggest

The agent should **automatically suggest** commands when:

| Trigger | Suggested Command |
| ------- | ----------------- |
| Major architectural decision | `/logic red-team` |
| "I think..." or "probably..." | `/logic ground` |
| Complex logic chain | `/logic chain -v` |
| Before merging PR | `/logic deploy` |
| After bug discovered | `/logic assumptions` |
| Performance claim | `/logic verify` |
| "Ready to ship" | `/logic gauntlet #shipping` |

---

## Confidence Floor Enforcement

All outputs include confidence rating:

```text
≥90% = 🟢 CLEAR     → Proceed with high confidence
85-89% = 🟡 CAUTION → Proceed, document unknowns
70-84% = 🟠 YELLOW  → Needs verification (below PR gate)
<70% = 🔴 GARBAGE   → Cannot proceed, must verify more
```

**Floor**: 85% minimum is **always enforced**.

Below 85% triggers automatic warning and blocks recommendation.

---

## Using in Code Review

**Pattern**: Review code → question assumption → invoke command

```text
Reviewer: "This query lacks indexes"
Author: Agrees, but proposes lazy optimization

Reviewer: "Let's verify with data"
/logic risk #perf

# Risk: Slow queries under load
# Probability: 80% at scale
# Impact: 2hr debugging + deploy

Author: "OK, adding indexes now"
```

---

## Power Moves (Command Combos)

### The Gauntlet (Bulletproof Proposal)

```bash
/logic gauntlet
# 1. assumptions - Find hidden ones
# 2. verify - Test each assumption
# 3. red-team - Attack the result
# Result: Proposal is airtight or you found issues
```

### The Confidence Ladder (Build Certainty)

```bash
/logic ladder -v
# 1. chain - Understand the dependencies
# 2. confidence - Rate your certainty
# 3. ground - Show the evidence
# Result: Visual progression from claim to verified truth
```

### The Deployment Checklist (Ship It)

```bash
/logic deploy #shipping
# 1. risk - What could break?
# 2. test - Is it tested?
# 3. decision - Should we deploy?
# Result: Decision is grounded and tagged for audit
```

---

## What Changes With This Agent

### Before (Without Logic Agent)

```text
Dev: "This should work in production"
Team: "Looks good, ship it"
Result: Breaks in production
```

### After (With Logic Agent)

```text
Dev: "This should work in production"
Team: "Let's verify"

/logic deploy
# Runs risk → test → decision
# Shows: 70% confidence 🟠 YELLOW
# Missing: 3 error case tests

Team: "Need to add tests first"
Result: Works in production
```

---

## Setting the Culture

**Normalize asking**: "Let's ground this with `/logic verify`"

**Normalize skepticism**: "What evidence supports that?"

**Normalize documentation**: "Here's the `/logic decision` we made"

**Normalize safety**: "Run the `/logic risk` assessment"

---

## Troubleshooting

### "The agent is too skeptical"

That's the point. Skepticism catches bugs.

### "This slows us down"

Short term: yes (5 min to verify)
Long term: no (prevents 3hr debugging)

### "I'm confident without evidence"

Then you're guessing, not confident.
Actual confidence comes with proof.

### "We don't have time for this"

You have time to fix bugs?
This prevents them.

### "My confidence is below 85%"

That's the point. You need more verification.
The floor exists to catch this.

---

## Making It Stick

### Day 1: Awareness

- Read quick ref: `LOGIC_AGENT_QUICK_REF.md`
- Try one command: `/logic verify` on next decision
- See the value

### Day 2-7: Integration

- Use in code reviews
- Use before merging
- Use when uncertain
- Commands become muscle memory

### Week 2+: Culture

- Team uses naturally
- Questions come with `/logic ground`
- Decisions documented with `/logic decision`
- Bugs prevented through `/logic red-team`

---

## The Bottom Line

**You are not smarter than reality.**

No amount of clever reasoning beats grounded verification.

This agent makes that unavoidable.

Type `/logic -h` to see all commands.

---

**Status**: Active and ready to use
**Start**: Now
**Invocation**: `/logic <command>`
**Reference**: [LOGIC_AGENT_QUICK_REF.md](./LOGIC_AGENT_QUICK_REF.md)
