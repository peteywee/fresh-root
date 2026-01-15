# Agent Registry

**Version**: 1.0.0  
**Last Updated**: January 15, 2026

---

## Purpose

This registry catalogs all discoverable agents in the Fresh Schedules repository. Each agent is specialized for specific tasks and can be invoked by human developers or orchestrated by other agents.

---

## Active Agents

### PR Conflict Resolver

**Status**: ✅ Active  
**Location**: [pr-conflict-resolver.md](./pr-conflict-resolver.md)  
**Invocation**: Agent-based (invoked by orchestrator)

**Capabilities**:
- Analyzes merge conflicts in pull requests
- Identifies conflicting changes and their context
- Proposes resolution strategies
- Generates conflict-free merged code

**Use Cases**:
- Merging feature branches to dev
- Resolving conflicts in large PRs
- Handling complex multi-file conflicts

---

## Agent Discovery

### For AI Agents
When working on tasks, check this registry to see if a specialized agent exists:
1. Review the capabilities of available agents
2. Invoke the appropriate agent for the task
3. Provide necessary context in the invocation

### For Developers
To add a new agent:
1. Create agent definition in `.claude/agents/`
2. Add entry to this INDEX.md
3. Update [docs/INDEX.md](../../docs/INDEX.md) L4a section
4. Test agent invocation and capabilities

---

## Agent Structure

Each agent should include:
- **Name**: Clear, descriptive identifier
- **Status**: Active/Inactive/Deprecated
- **Location**: Path to agent definition
- **Invocations**: How to invoke (command, mention, automatic)
- **Capabilities**: What the agent can do
- **Use Cases**: When to use this agent
- **Dependencies**: Required tools, APIs, or context

---

## Invocation Methods

| Method | Format | Example | Use Case |
| ------ | ------ | ------- | -------- |
| **Agent-based** | Orchestrator calls agent | N/A | Complex multi-step tasks |
| **Mention** | `@agent-name` | `@ui-ux` | Quick invocation in conversation |
| **Command** | `/agent-command` | `/ui-ux` | Explicit command trigger |
| **Automatic** | Triggered by context | N/A | Pattern detection |

---

## Future Agents (Planned)

- **Test Generator**: Generate comprehensive test suites
- **Security Auditor**: OWASP compliance checking
- **Documentation Writer**: Auto-generate documentation
- **Code Reviewer**: Automated code review with standards enforcement
- **Performance Optimizer**: Identify and fix performance bottlenecks

---

## Related Documentation

- [Documentation INDEX](../../docs/INDEX.md) - Main documentation hub
- [CrewOps Manual](../../docs/architecture/CREWOPS_MANUAL.md) - Multi-agent coordination
- [Governance](../../.github/governance/INDEX.md) - Binding rules and directives

---

**Maintenance**: Update this registry when adding, modifying, or deprecating agents.
