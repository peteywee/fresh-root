# Contributing to Fresh Schedules

Thank you for your interest in contributing to Fresh Schedules! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and constructive in all interactions
- Assume good intentions from others
- Provide and accept constructive feedback gracefully
- Focus on what is best for the community and project

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Git

### Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/fresh-root.git
   cd fresh-root
   ```

2. **Install dependencies**:
   ```bash
   corepack enable
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cd apps/web
   cp .env.example .env.local
   # Edit .env.local with your Firebase config
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples**:
```
feat(auth): add Google OAuth sign-in
fix(api): handle empty response in user profile endpoint
docs(readme): update installation instructions
test(components): add tests for Button component
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type - use proper types or `unknown`
- Export types and interfaces that might be reused
- Use Zod for runtime validation

### React

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components small and focused
- Use proper prop types

### Styling

- Use Tailwind CSS utility classes
- Follow the existing design patterns
- Ensure responsive design for mobile and desktop
- Test across different browsers

### Code Organization

```
apps/web/
├── app/
│   ├── api/           # API routes
│   ├── components/    # Shared components
│   │   └── ui/        # Reusable UI components
│   ├── lib/           # Utilities and helpers
│   └── (app)/         # App pages
├── src/               # Legacy structure (being migrated)
└── public/            # Static assets
```

### API Routes

- Use consistent error handling with the validation utilities
- Validate all inputs with Zod schemas
- Return consistent response shapes
- Add JSDoc comments for documentation
- Include example requests/responses

### Component Guidelines

- Add JSDoc comments with examples
- Include prop types with TypeScript
- Write unit tests for components
- Handle loading and error states
- Make components accessible (ARIA attributes)

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage
```

### Writing Tests

- Place test files next to the code they test (`__tests__` directory)
- Name test files with `.test.ts` or `.test.tsx` extension
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

**Example**:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## Linting and Type Checking

```bash
# Run linter
pnpm lint

# Run type checker
pnpm typecheck

# Build project
pnpm build
```

Fix all linting and type errors before submitting a PR.

## Pull Request Process

1. **Create a branch** from `main` or `develop`
2. **Make your changes** following the coding standards
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Run tests and linting**:
   ```bash
   pnpm test
   pnpm lint
   pnpm typecheck
   ```
6. **Commit your changes** with conventional commit messages
7. **Push to your fork** and create a pull request
8. **Fill out the PR template** completely
9. **Wait for review** and address feedback

### PR Requirements

- [ ] All tests pass
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] PR description is clear and complete

### PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Commit messages follow conventions
```

## Issue Guidelines

### Reporting Bugs

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, versions)
- Screenshots if applicable
- Error messages or logs

### Feature Requests

Include:
- Clear description of the feature
- Use cases and benefits
- Potential implementation approach
- Mockups or examples if applicable

### Questions

- Check existing documentation first
- Search for similar questions in issues
- Be specific about what you need help with
- Include context and what you've tried

## Additional Resources

- [README.md](README.md) - Project overview
- [SETUP.md](SETUP.md) - Setup instructions
- [USAGE.md](USAGE.md) - Usage guide
- [API Documentation](apps/web/docs/API.md) - API reference

## Getting Help

- Open an issue for bugs or feature requests
- Join our community discussions
- Check the documentation
- Ask questions in issues with the `question` label

Thank you for contributing to Fresh Schedules! 🎉
