# Create Pull Request

Create a new pull request from the current branch to main with auto-generated title and description.

## Workflow

1. **Check current state**:
   ```bash
   git status
   git branch --show-current
   ```

2. **Verify not on main/dev**:
   - If on main or dev, inform user they need to be on a feature branch

3. **Check for uncommitted changes**:
   - If changes exist, ask user if they want to commit first

4. **Analyze commits for PR**:
   ```bash
   git log origin/main..HEAD --oneline
   git diff origin/main --stat
   ```

5. **Generate PR content**:
   - **Title**: Use conventional commits format based on commit messages
     - `feat:` for new features
     - `fix:` for bug fixes
     - `docs:` for documentation
     - `refactor:` for code refactoring
     - `test:` for test additions
     - `chore:` for maintenance
   - **Summary**: 2-3 bullet points describing key changes
   - **Test plan**: Checklist of verification steps

6. **Create the PR**:
   ```bash
   gh pr create --base main --head [branch] --title "[title]" --body "$(cat <<'EOF'
   ## Summary
   - [change 1]
   - [change 2]

   ## Test plan
   - [ ] [verification step 1]
   - [ ] [verification step 2]

   🤖 Generated with [Claude Code](https://claude.ai/claude-code)
   EOF
   )"
   ```

7. **Return the PR URL**

## Example Output

```
Created PR #225: feat(auth): add two-factor authentication

Branch: feat/2fa → main
URL: https://github.com/owner/repo/pull/225

Summary:
- Added TOTP-based 2FA
- Updated login flow
- Added backup codes

Next: Request review or wait for CI
```
