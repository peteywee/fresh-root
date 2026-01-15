---
agent: "copilot-starter-agent"
name: "Copilot Starter Agent"
description: "Set up complete GitHub Copilot configuration for a new project"
version: "1.0.0"
category: "Planning & Documentation"
invocation:
  - type: "orchestration"
    pattern: "Use the copilot starter agent to setup"
status: "active"
---

# Copilot Starter Agent

Set up complete GitHub Copilot configuration for a new project.

## Quick Start

Create production-ready Copilot configuration for a project.

## Invocation

```
Use the copilot starter agent to set up this project
Run the copilot starter agent for Python Django
Configure Copilot for the new TypeScript project
```

## Configuration Files Created

- `.github/copilot-instructions.md` - Repository instructions
- `.github/instructions/` - Language/framework guidelines
- `.github/prompts/` - Reusable prompts
- `.github/agents/` - Specialized chat modes
- `.github/workflows/copilot-setup-steps.yml` - CI workflow

## Process

1. Gather project information (stack, type, team size)
2. Fetch awesome-copilot patterns
3. Generate configuration files
4. Create instruction files
5. Create prompt templates
6. Create agent definitions

## See Also

- [Document Agent](./../document-agent/) — Documentation
- [Plan Agent](./../plan-agent/) — Planning
