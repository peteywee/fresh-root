# 🏗️ Branch Strategy Quick Reference

**Effective**: December 7, 2025  
**Owner**: Sr Dev (Architecture)  
**Status**: ACTIVE - All branches governed

---

## Quick Decision Tree

```
┌─ Are you writing feature code?
│  ├─ YES → Create feature/[issue-#]-description from dev
│  │        Work locally, commit daily minimum
│  │        When done: Create PR to dev
│  │        Merge → Feature branch auto-deletes ✅
│  │
│  └─ NO → Are you writing documentation/tests/reports?
│     ├─ YES → Commit to docs-tests-logs
│     │        This is your archive branch
│     │        Never merged to dev/main
│     │
│     └─ NO → Something else?
│        └─ Ask Sr Dev before committing
```

---

## The Three Branches

### 🟢 **main** (Production)

**What goes here**: Production-ready code only  
**Who can merge**: DevOps/Release team  
**PR Requirements**: 2+ approvals, all tests pass, E2E verified

```bash
# You CANNOT commit directly to main
# Only way to get code here: dev → main (PR, 2 reviews)

# If you have production-ready code on dev:
git checkout dev
git pull origin dev
# Then create PR to main on GitHub
```

### 🟡 **dev** (Working Branch)

**What goes here**: Feature code + tests you're actively developing  
**Who can merge**: Any engineer (1+ approval)  
**PR Requirements**: 1+ approval, tests pass, no docs/logs/metrics

```bash
# Create a feature branch FROM dev
git checkout dev
git pull origin dev
git checkout -b feature/123-my-feature

# Do your work, commit daily minimum
git add .
git commit -m "feat: implement X feature"
git push origin feature/123-my-feature

# When done: Create PR on GitHub (dev ← feature/123-my-feature)
# After merge: Feature branch auto-deleted ✅
```

### 📘 **docs-tests-logs** (Archive)

**What goes here**: ALL documentation, test results, reports  
**Who can merge**: Anyone (no review required)  
**Never merged back**: This is archive-only

```bash
# For documentation files
git checkout docs-tests-logs
git pull origin docs-tests-logs
git checkout -b docs/add-new-doc

git add docs/my-new-doc.md
git commit -m "docs: add new documentation"
git push origin docs/add-new-doc

# Create PR to docs-tests-logs
# After merge: Your documentation is permanently archived
```

---

## What Goes Where?

### ✅ Commit to **dev** (or feature from dev)
- TypeScript/JavaScript code (.ts, .tsx, .js)
- Package.json, tsconfig.json, eslint config
- Firestore rules (.rules)
- GitHub Actions workflows (.yml)
- Feature-specific documentation
- Tests that are part of features (but see below)

### ✅ Commit to **docs-tests-logs**
- Project documentation (docs/)
- Implementation reports
- E2E test suites
- Test results and coverage reports
- Performance metrics
- CI/CD logs
- Project summaries

### ❌ NEVER commit to **main** directly
- Create a PR from dev instead
- Main only accepts merges from dev

### ❌ NEVER commit docs/tests/logs to **dev**
- Move these to docs-tests-logs instead
- Automated checks will block these commits

---

## Commit Messages

### Feature Commits (dev branch)
```bash
git commit -m "feat: add new authentication flow"
git commit -m "fix: resolve login validation bug"
git commit -m "test: add E2E tests for auth"
git commit -m "refactor: simplify user service"
```

### Documentation Commits (docs-tests-logs)
```bash
git commit -m "docs: add architecture overview"
git commit -m "docs: document SDK factory pattern"
git commit -m "test: add E2E test results"
git commit -m "report: add performance metrics"
```

---

## PR Checklist by Branch

### Feature → Dev PR
- [ ] Source branch: feature/123-*
- [ ] Target branch: dev
- [ ] Tests passing locally: `pnpm test`
- [ ] TypeScript passing: `pnpm typecheck`
- [ ] Linting passing: `pnpm lint`
- [ ] 1+ approval required
- [ ] Description: What was added/fixed

### Dev → Main PR
- [ ] Source branch: dev
- [ ] Target branch: main
- [ ] All tests passing (E2E verified)
- [ ] No docs/tests/logs files
- [ ] Release notes included
- [ ] 2+ approvals required
- [ ] Commit history clean

### Docs → Docs-Tests-Logs PR
- [ ] Documentation files only
- [ ] No code changes
- [ ] No review required
- [ ] Clear description of what's documented

---

## Common Scenarios

### "I'm done with my feature, how do I merge?"

```bash
# 1. Ensure everything is committed
git status  # Should be clean

# 2. Push your branch
git push origin feature/123-my-feature

# 3. Go to GitHub and create PR
#    Source: feature/123-my-feature
#    Target: dev
#    Title: "feat: description of your feature"
#    Description: What was changed

# 4. Get 1+ approval from team

# 5. Merge the PR
#    ✅ Feature branch auto-deletes

# 6. Your code is now in dev!
```

### "How do I get my code to production?"

```bash
# 1. Your code must be on dev branch first
#    (via feature PR already merged)

# 2. Create PR: dev → main
#    Title: "release: v1.2.3"
#    Description: Release notes

# 3. Get 2+ approvals

# 4. Merge to main
#    ✅ Your code is now in production!
```

### "Where do I put my documentation?"

```bash
# 1. Check out docs-tests-logs branch
git checkout docs-tests-logs
git pull origin docs-tests-logs

# 2. Create a branch (optional, but good practice)
git checkout -b docs/add-new-guide

# 3. Create your documentation
# docs/my-new-guide.md

# 4. Commit it
git add docs/
git commit -m "docs: add new guide"
git push origin docs/add-new-guide

# 5. Create PR to docs-tests-logs
#    (or commit directly if no review needed)

# 6. Your documentation is now in the archive!
```

---

## Automated Checks (Won't Let You Merge If...)

### All Branches
- ✅ No skipped tests (`test.skip`, `test.only`)
- ✅ No debug code (`console.log`, `debugger`)
- ✅ No unresolved TODOs/FIXMEs
- ✅ No secrets in commits

### Main Branch (Only)
- ❌ Source is not dev branch
- ❌ Contains docs/test files
- ❌ No release notes in PR
- ❌ Less than 2 approvals

### Dev Branch
- ❌ Contains docs/test/log files (move to docs-tests-logs)
- ❌ Less than 1 approval

### Docs-Tests-Logs Branch
- ❌ Contains feature code
- ❌ Contains regular source files

---

## Emergency: How to Fix a Wrong Commit

### "I committed code to docs-tests-logs (oops!)"

```bash
# 1. Don't push yet if possible
git reset HEAD~1 --soft

# 2. If already pushed:
git checkout dev
git pull origin dev
git cherry-pick [commit-hash]
git push origin dev

# 3. Delete from docs-tests-logs
git checkout docs-tests-logs
git push origin docs-tests-logs:docs-tests-logs

# 4. Create PR on dev instead
```

### "I merged to main directly (big oops!)"

```bash
# Escalate to Sr Dev immediately
# We'll need to create a revert commit on main
# And establish new procedures to prevent this

# For future: Main only accepts from dev
```

---

## Metrics to Track

📊 Monitor these to keep branches healthy:

- **Commit Frequency**: Are features getting 1+ commits/day?
- **Feature Lifetime**: How long between creation and merge?
- **PR Review Time**: How fast are PRs getting reviewed?
- **Branch Count**: Should be 3 primary + 1-3 active features
- **Merge Frequency**: How often is dev merging to main?

---

## Questions?

Ask in Slack #engineering or contact Sr Dev

---

**Last Updated**: December 7, 2025  
**Next Review**: January 7, 2026
