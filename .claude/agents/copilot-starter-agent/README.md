# Copilot Starter Agent

Set up complete GitHub Copilot configuration for a new project.

## Overview

Creates a complete, production-ready GitHub Copilot configuration for any technology stack or project type.

## When to Use

✅ **Use this agent for**:
- New project bootstrap
- Copilot setup for existing projects
- Technology stack change
- Team onboarding

❌ **Don't use this agent for**:
- Modifying existing configuration
- Code implementation
- Project execution

## Invocation

```
Use the copilot starter agent to set up this project
Run the copilot starter agent for Python Django
Configure Copilot for the new TypeScript project
```

## Project Information Required

Gather from user:
1. **Primary Language/Framework** (e.g., JavaScript/React, Python/Django)
2. **Project Type** (web app, API, mobile, library)
3. **Additional Technologies** (database, cloud, testing)
4. **Team Size** (solo, small, enterprise)
5. **Development Style** (strict, flexible, specific patterns)

## Configuration Files Created

### 1. `.github/copilot-instructions.md`
Main repository instructions for all Copilot interactions.

### 2. `.github/instructions/` Directory
- `${primaryLanguage}.instructions.md` - Language guidelines
- `testing.instructions.md` - Testing standards
- `documentation.instructions.md` - Documentation
- `security.instructions.md` - Security practices
- `performance.instructions.md` - Performance
- `code-review.instructions.md` - Code review standards

### 3. `.github/prompts/` Directory
- `setup-component.prompt.md` - Component creation
- `write-tests.prompt.md` - Test generation
- `code-review.prompt.md` - Code review
- `refactor-code.prompt.md` - Refactoring
- `generate-docs.prompt.md` - Documentation
- `debug-issue.prompt.md` - Debugging

### 4. `.github/agents/` Directory
- `architect.agent.md` - Architecture planning
- `reviewer.agent.md` - Code review
- `debugger.agent.md` - Debugging

### 5. `.github/workflows/copilot-setup-steps.yml`
GitHub Actions workflow for CI environment setup.

## Process

1. **Gather Project Information**
   - Ask for technology stack
   - Understand project type
   - Learn team structure

2. **Research Patterns**
   - Fetch awesome-copilot collections
   - Find existing instruction patterns
   - Identify best practices

3. **Generate Configuration**
   - Create instruction files
   - Create prompt templates
   - Create agent definitions
   - Create CI workflow

4. **Validate**
   - Verify all files created
   - Check for consistency
   - Ensure completeness

## See Also

- [Document Agent](./../document-agent/) — Documentation
- [Plan Agent](./../plan-agent/) — Planning
