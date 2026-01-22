# Logic Agent Quick Reference

**Namespace**: `/logic` **Confidence Floor**: 85% (always-on)

---

## Commands by Use Case

### "I'm not sure if this will work"

```text
/logic verify
```

Full 5-step verification: claim → evidence → ground → verdict

### "Is my logic sound?"

```text
/logic chain
```

Verify dependency chain: A→B→C all solid?

### "What am I missing?"

```text
/logic assumptions
```

List all hidden assumptions, mark which are verified

### "What could go wrong?"

```text
/logic red-team
```

Attack the solution systematically, find failure modes

### "How confident should I be?"

```text
/logic confidence
```

Rate certainty (0-100%) with evidence breakdown

### "Show me proof, not theory"

```text
/logic ground
```

Display actual evidence: test output, benchmarks, code

### "Document this decision"

```text
/logic decision
```

Record choice with evidence, alternatives, risks

### "Is this tested enough?"

```text
/logic test
```

Coverage analysis: happy path, errors, scale, integration

### "What's the risk?"

```text
/logic risk
```

Risk matrix: severity × probability × impact

---

## Flags

| Flag       | Short | Purpose           |
| ---------- | ----- | ----------------- |
| `--help`   | `-h`  | Show help         |
| `--visual` | `-v`  | Mermaid diagram   |
| `--fast`   | `-f`  | Skip explanations |

**Tags**: `#shipping` `#arch` `#bug` `#perf`

---

## Power Combos

**The Gauntlet** (bulletproof a proposal):

```text
/logic gauntlet
```

Runs: assumptions → verify → red-team

**The Confidence Ladder** (build certainty):

```text
/logic ladder
```

Runs: chain → confidence → ground

**The Deployment Checklist** (ready to ship?):

```text
/logic deploy
```

Runs: risk → test → decision

---

## Confidence Thresholds

```text
≥90% = 🟢 CLEAR     → Proceed
85-89% = 🟡 CAUTION → Proceed, document
70-84% = 🟠 YELLOW  → Needs verification
<70% = 🔴 GARBAGE   → Cannot proceed
```

**Floor**: 85% minimum (enforced)

---

## When to Use

✅ Major decisions ✅ Before code review ✅ After bug discovered ✅ Planning features ✅ Merging PRs
✅ Performance concerns

❌ Quick syntax q's ❌ Obvious fixes ❌ Under severe time pressure ❌ Documented patterns

---

## What It Rejects

❌ "Probably works" ❌ "I think..." ❌ "Most likely..." ❌ "In my experience..."

## What It Requires

✅ Actual evidence ✅ Measured data ✅ Code shown ✅ Tests passing ✅ Reasoning mapped

---

## Example Flow

**You**: "Should we cache this?"

**`/logic verify -v`** shows:

- Cache hits: 60%
- Latency improvement: 40%
- Invalidation complexity: high

**`/logic red-team`** finds:

- Stale data risk (5% queries)
- Network failure recovery
- Rollback difficulty

**`/logic confidence`** rates:

- 80% 🟠 YELLOW (below floor)
- Missing: invalidation tests

**Result**: Add tests before proceeding

---

## Quick Commands

```bash
/logic verify       5-step verification
/logic chain        Dependency check
/logic risk         Risk matrix
/logic test         Coverage analysis
/logic assumptions  Hidden assumptions
/logic red-team     Attack analysis
/logic confidence   Certainty rating
/logic decision     Document choice
/logic ground       Evidence check

/logic gauntlet     Full bulletproof
/logic ladder       Build certainty
/logic deploy       Deploy readiness

/logic -h           Show help
```

---

**See full docs**: [logic-agent-cli.instructions.md](./logic-agent-cli.instructions.md)
