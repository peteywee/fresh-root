# CI/CD Pipeline Agent

**Tags**: P1, APP, CI/CD, AUTOMATION, VALIDATION, AGENT

## Overview

The **CI/CD Pipeline Agent** is a standalone automation agent responsible for:

- ✅ Validating existing GitHub Actions workflows
- ✅ Setting up required CI/CD workflows from templates
- ✅ Detecting and fixing common workflow configuration issues
- ✅ Generating compliance reports
- ✅ Providing handoff protocol for integration with other agents

## Architecture

### File Location

```text
scripts/agent/cicd-agent.mts
```

### Key Interfaces

```typescript
interface AgentResult {
  validated: string[]; // Workflows that passed validation
  created: string[]; // Newly created workflows
  updated: string[]; // Modified workflows
  errors: string[]; // Validation errors found
  report: {
    totalWorkflows: number;
    passedValidation: number;
    requiredMissing: string[];
    recommendations: string[];
  };
}
```

### Handoff Protocol

The agent can receive handoffs from other agents or systems:

```typescript
type HandoffType = "workflow-setup" | "validation-report" | "auto-fix";

interface Handoff {
  type: HandoffType;
  workflows?: string[];
  standards?: Record<string, unknown>;
  config?: Record<string, unknown>;
  timestamp?: string;
}
```

## Required Workflows

The agent ensures these workflows are present:

| Workflow       | File                  | Triggers           | Required | Purpose                                         |
| -------------- | --------------------- | ------------------ | -------- | ----------------------------------------------- |
| CI (Main)      | `ci.yml`              | push, pull_request | ✅ Yes   | Full CI pipeline (lint, typecheck, test, build) |
| PR Checks      | `pr.yml`              | pull_request       | ✅ Yes   | PR-specific validation                          |
| ESLint + TS    | `eslint-ts-agent.yml` | pull_request       | ✅ Yes   | Automated linting and TypeScript fixes          |
| Firebase Rules | `test-rules.yml`      | push, pull_request | ❌ No    | Firestore/Storage rules testing                 |

## Usage

### Standalone Execution

```bash
# Run validation
pnpm exec node scripts/agent/cicd-agent.mts

# With issue number
pnpm exec node scripts/agent/cicd-agent.mts --issue 42

# Plan mode (no changes)
pnpm exec node scripts/agent/cicd-agent.mts --plan-only

# Dry run
pnpm exec node scripts/agent/cicd-agent.mts --dry-run
```

### Handoff Protocol Usage

```bash
# Setup required workflows
pnpm exec node scripts/agent/cicd-agent.mts --handoff workflow-setup

# Generate validation report
pnpm exec node scripts/agent/cicd-agent.mts --handoff validation-report

# Auto-fix issues
pnpm exec node scripts/agent/cicd-agent.mts --handoff auto-fix
```

### Programmatic Usage

```typescript
import { runAgent, handleHandoff, validateWorkflow } from "./scripts/agent/cicd-agent.mjs";

// Run validation
const result = await runAgent({
  issue: "42",
  handoff: undefined,
  force: false,
  planOnly: false,
  dryRun: false,
});

// Handle handoff
const handoffResult = await handleHandoff("workflow-setup");

// Validate single workflow
const validation = await validateWorkflow("/path/to/workflow.yml");
```

## Validation Checks

The agent performs the following validations on each workflow:

### Required Fields

- ✅ `name:` field present
- ✅ `on:` field present

### Required Actions

- ✅ `actions/checkout` present
- ✅ `pnpm` setup found

### Best Practices

- ✅ Node.js version explicitly specified
- ✅ Error handling configured (`continue-on-error`)
- ✅ Proper step organization

### Output

Issues are reported with severity levels and recommendations.

## Report Generation

The agent generates:

### Console Output

- Summary statistics (validated, created, updated, errors)
- Detailed validation report
- Recommendations for fixes
- Issue details

### Structure

```text
✅ CI/CD Agent Summary
═══════════════════════════════════════════════════════════
✅ Validated: 8
✨ Created: 0
♻️  Updated: 0
❌ Errors: 2

📊 Report:
  Total Workflows: 8
  Passed Validation: 6
  Required Missing: 0

💡 Recommendations:
  • Fix 2 validation issue(s)

⚠️  Issues:
  • eslint.yml: Missing Node.js version specification
  • repo-agent.yml: Missing continue-on-error for non-critical steps
```

## Handoff Integration Points

### From Repo Agent (`agent.mts`)

```typescript
// Repo agent can trigger CI/CD setup
await handleHandoff("workflow-setup");
```

### From Compliance Refactor Script (`refactor-all.mjs`)

```bash
# Include CI/CD validation in compliance analysis
node scripts/refactor-all.mjs && \
  node scripts/agent/cicd-agent.mts --handoff validation-report
```

### From GitHub Actions

```yaml
- name: Validate CI/CD Pipelines
  run: pnpm exec node scripts/agent/cicd-agent.mts --handoff validation-report
```

## Workflow Templates

### CI Workflow Template

Generated when missing, includes:

- Checkout with full history
- pnpm v9.1.0 setup
- Node.js 20 setup with caching
- Install with fallback
- Lint (non-blocking)
- Typecheck (blocking)
- Test Rules (non-blocking)
- Test API (non-blocking)
- Build

### PR Workflow Template

Generated when missing, includes:

- Checkout PR branch
- pnpm v9.1.0 setup
- Node.js 20 setup with caching
- Install
- Lint (blocking)
- Typecheck (blocking)

## Error Handling

### Graceful Degradation

- Missing workflows are created from templates
- Validation issues are logged but non-blocking
- Continues processing on individual workflow errors

### Exit Codes

- `0` - Success (no errors)
- `1` - Validation errors found (recommendations made)

## Standards Compliance

This agent adheres to:

- ✅ [CI Workflow Standards](../../docs/tooling/CI_WORKFLOW_STANDARDS.md)
- ✅ [FRESH Engine v15.0](../../docs/standards/v15/INDEX.md)
- ✅ Repository coding standards (tagging, imports, naming)

## Future Enhancements

- [ ] Auto-fix implementation for common issues
- [ ] Workflow syntax linting (via `action-validator`)
- [ ] Integration with secret management
- [ ] Coverage report aggregation
- [ ] Deployment pipeline validation
- [ ] Multi-environment workflow support

## Related Documentation

- [CI Workflow Standards](../../docs/tooling/CI_WORKFLOW_STANDARDS.md)
- [Repository Agent](./agent.mts)
- [Compliance Refactor](../refactor-all.mjs)
- [GitHub Workflows Directory](.../../.github/workflows/)
