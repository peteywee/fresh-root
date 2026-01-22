# Review & Refactor Agent

Review and refactor code according to guidelines.

## Overview

Senior expert software engineer agent that reviews and refactors code to maintain clean,
maintainable code aligned with project standards.

## When to Use

✅ **Use this agent for**:

- Code cleanup and refactoring
- Align code with guidelines
- Remove duplication
- Improve code quality

❌ **Don't use this agent for**:

- Feature implementation (use Implement Agent)
- Code review only (use Review Agent)
- Bug fixing (use Implement Agent)

## Invocation

```
Use the review and refactor agent to refactor the auth module
Refactor this code to match guidelines
Run the review and refactor agent on these files
```

## Process

1. **Load Guidelines**
   - Review `.github/instructions/*.md`
   - Review `.github/copilot-instructions.md`
   - Load coding standards

2. **Review Code**
   - Analyze current code
   - Identify refactoring opportunities
   - Find guideline violations

3. **Refactor**
   - Clean and maintainable code
   - Follow SOLID principles
   - No duplication
   - Keep files intact

4. **Validate**
   - Ensure tests still pass
   - Verify no regressions
   - Check lint/format

## Guidelines

- `.github/instructions/*.md` - Language/framework guidelines
- `.github/copilot-instructions.md` - Repository guidelines
- `docs/standards/CODING_RULES_AND_PATTERNS.md` - Coding standards

## See Also

- [Review Agent](./../review-agent/) — Code review
- [Implement Agent](./../implement-agent/) — Implementation
