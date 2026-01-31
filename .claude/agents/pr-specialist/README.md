# PR Specialist Agent

Full pull request lifecycle management with GitHub best practices.

## Overview

The PR Specialist agent handles the complete PR workflow:

1. **Create** - Generate PRs with semantic titles and comprehensive descriptions
2. **Review** - Analyze PR changes, check CI status, summarize feedback
3. **Update** - Push new commits, rebase, respond to comments
4. **Merge** - Verify approvals, merge with appropriate strategy, cleanup

## Quick Start

### Create a PR

```
@pr create
```

This will:
- Analyze commits on current branch
- Generate a semantic PR title
- Create a summary of changes
- Generate a test plan checklist
- Create the PR on GitHub

### Review a PR

```
@pr review 123
```

This will:
- Fetch PR details and diff
- Summarize changes by file
- Check CI/CD status
- List review comments
- Identify potential issues

### Merge a PR

```
@pr merge 123
```

This will:
- Verify approval requirements met
- Confirm CI passes
- Merge with squash (default)
- Delete feature branch
- Sync local branches

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `@pr create` | Create new PR | `@pr create --base main` |
| `@pr review <n>` | Review PR #n | `@pr review 123` |
| `@pr merge <n>` | Merge PR #n | `@pr merge 123 --strategy squash` |
| `@pr update` | Update current PR | `@pr update` |
| `@pr status <n>` | Check PR status | `@pr status 123` |

## PR Title Conventions

Uses conventional commits format:

- `feat: add user authentication` - New feature
- `fix: resolve login timeout` - Bug fix
- `docs: update API documentation` - Documentation
- `refactor: simplify validation logic` - Code refactoring
- `test: add unit tests for auth` - Test additions
- `chore: update dependencies` - Maintenance

## Merge Strategies

| Strategy | When to Use |
|----------|-------------|
| `squash` | Default. Clean history, single commit per feature |
| `rebase` | Preserve individual commits, linear history |
| `merge` | Preserve branch history with merge commit |

## Configuration

### Default Settings

```javascript
{
  defaultMergeStrategy: "squash",
  autoDeleteBranch: true,
  requireApproval: true,
  requireCIPass: true,
}
```

### VS Code Integration

Add to `.vscode/settings.json`:

```json
{
  "claude.agents": {
    "enabled": true,
    "discoverable": true
  },
  "claude.agentAutocomplete": {
    "enabled": true,
    "triggerCharacters": ["@", "/"]
  }
}
```

## Keyboard Shortcuts

| OS | Shortcut | Action |
|----|----------|--------|
| Mac | `Cmd+Shift+P` | Insert @pr |
| Windows | `Ctrl+Shift+P` | Insert @pr |
| Linux | `Ctrl+Shift+P` | Insert @pr |

## Examples

### Full PR Workflow

```bash
# 1. Make changes on feature branch
git checkout -b feat/add-dark-mode

# 2. Commit changes
git add .
git commit -m "feat: add dark mode toggle"

# 3. Create PR
@pr create

# 4. Address review feedback, push updates
@pr update

# 5. Merge when approved
@pr merge
```

### Review External PR

```
@pr review 221

# Output:
## PR #221: Dev

**Branch**: dev -> main
**Status**: Open
**Author**: peteywee

### Changes Summary
- 15 files changed
- +234 / -89 lines

### CI Status
- Build: passing
- Tests: passing
- Lint: passing

### Approvals
- 0/1 required

### Open Comments
- None
```

## Related Agents

- [PR Conflict Resolver](../pr-conflict-resolver.md) - Handle merge conflicts
- [Review Agent](../review-agent/) - Detailed code review
- [Implement Agent](../implement-agent/) - Feature implementation

## Troubleshooting

### PR Creation Fails

1. Ensure you're on a feature branch (not main/dev)
2. Check GitHub CLI is authenticated: `gh auth status`
3. Verify remote is set: `git remote -v`

### Merge Blocked

1. Check CI status: `gh pr checks <number>`
2. Verify approvals: `gh pr view <number>`
3. Check for conflicts: `gh pr view <number> --json mergeable`

### Branch Not Deleting

1. Check branch protection rules
2. Verify you have delete permissions
3. Manual cleanup: `git push origin --delete <branch>`
