# AI Behavior & Automation

This directory contains documentation for AI agent behavior, automation frameworks, and intelligent system design within Fresh Schedules.

## Overview

- **Purpose**: Define how AI agents (GitHub Copilot, Claude Code, custom agents) behave within the codebase
- **Scope**: Agent directives, automation patterns, cognition frameworks, and deployment strategies
- **Maintenance**: CI/CD automated (`maintain-docs.yml`)
- **Quality**: 10/10 compliance enforced

## Core Areas

### Cognition & Agent Behavior

- Agent directives and decision frameworks
- Hierarchical thinking patterns
- Prompt engineering best practices
- Safety and bias mitigation

### Automation & CrewOps

- Workflow orchestration
- Agent team coordination
- Parallel execution patterns
- Task delegation strategies

## Structure

```
ai/
├── README.md                           (this file)
├── GLOBAL_COGNITION_AGENT.md          (core agent behavior)
├── crewops/                           (team automation framework)
│   ├── README.md
│   ├── manual.md
│   ├── framework.md
│   ├── reference.md
│   └── implementation.md
```

## Quick Navigation

- **New to AI behavior?** Start with [GLOBAL_COGNITION_AGENT.md](./GLOBAL_COGNITION_AGENT.md)
- **Team automation?** See [crewops/framework.md](./crewops/framework.md)
- **Implementation details?** Check [crewops/implementation.md](./crewops/implementation.md)
- **Quick reference?** Browse [crewops/reference.md](./crewops/reference.md)

## CI/CD Maintenance

This directory is maintained by `.github/workflows/maintain-docs.yml`:

- **Validates**: All README.md files exist and are current
- **Generates**: Metrics and reports
- **Enforces**: 10/10 quality gates
- **Updates**: Cross-links to root-level `/AI_BEHAVIOR.md`

## Quality Standards

- ✅ All files follow self-explanatory code commenting guidelines
- ✅ Cross-references validated (0 broken links)
- ✅ 10/10 quality score maintained
- ✅ Last updated: December 7, 2025

---

**Breadcrumb**: [Home](../) > **AI** · [Rules](../rules/) · [Infrastructure](../infrastructure/)
