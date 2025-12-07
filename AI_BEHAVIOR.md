# AI Behavior & Agent Directives

**🔗 Primary Sources**: `/ai/README.md`, `/.github/instructions/copilot-instructions.md`  
**Auto-maintained by**: `.github/workflows/maintain-docs.yml`  
**Last Updated**: December 7, 2025

---

## AI Agent Framework

This document describes how AI agents (GitHub Copilot, Claude Code, custom agents) should behave within Fresh Schedules.

## Core Principles

### 1. Hierarchical Decision Making
- Senior Dev makes strategic decisions
- Workers execute in parallel batches
- Atomic commits track all changes
- Council decides on unclear issues

### 2. Proactive Tool Usage
- Search before assuming
- Verify patterns in actual code
- Test changes before committing
- Validate no regressions

### 3. Production-Grade Standards
- All code must pass 10/10 quality gates
- No shortcuts, no guesses, no hallucinations
- Type-safe, validated, secured always
- Comprehensive error handling

### 4. Continuous Safeguard Creation
- Same error >3 times = create safeguard
- Automate pattern detection
- Block problematic code at compile time
- Document all safeguards

## Quick Navigation

### AI Automation Framework
- [/ai/README.md](/ai/README.md) - AI agent overview
- [/ai/GLOBAL_COGNITION_AGENT.md](/ai/GLOBAL_COGNITION_AGENT.md) - Agent directives
- [/ai/crewops/framework.md](/ai/crewops/framework.md) - Team automation

### Instruction Files
- [/.github/instructions/copilot-instructions.md](/.github/instructions/copilot-instructions.md) ⭐ **START HERE**
- [/.github/instructions/production-development-directive.instructions.md](/.github/instructions/production-development-directive.instructions.md) - Production standards
- [/.github/instructions/taming-copilot.instructions.md](/.github/instructions/taming-copilot.instructions.md) - Copilot control

### Root-level Mirror
- [/instructions/](/instructions/) - Mirrored copies of all instruction files

## Key Behaviors

### For Every Task
1. ✅ Parse request deeply
2. ✅ Create TODO list with dependencies
3. ✅ Spawn parallel workers where possible
4. ✅ Validate each result
5. ✅ Make atomic commits
6. ✅ Detect error patterns
7. ✅ Create safeguards if needed
8. ✅ Commit with confidence

### For Every Decision
- ✅ WHO is affected?
- ✅ WHAT are we solving?
- ✅ WHEN will this run?
- ✅ WHERE does it live?
- ✅ WHY this approach?
- ✅ HOW do we verify?

## Quality Standards

All AI-generated code must:
- ✅ Pass TypeScript strict mode
- ✅ Validate input with Zod
- ✅ Handle errors with context
- ✅ Include comprehensive tests
- ✅ Match existing patterns
- ✅ Achieve 10/10 quality score

---

**ℹ️  Detailed directives live in `/ai/` and `/.github/instructions/`. This is a navigation hub.**
