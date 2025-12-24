---
description: "Git workflow patterns, pre-commit hook strategies, and repository hygiene"
applyTo: ".husky/**,scripts/**/*.mjs,scripts/**/*.sh"
priority: 2
---

# Git Workflow Memory

Effective patterns for maintaining repository health, preventing common mistakes, and automating
quality gates.

## Pre-Commit Hook: Documentation File Organization

**Problem**: Documentation files accumulate at repository root, cluttering the main directory.
Without enforcement, docs end up in wrong locations.

**Solution**: Add pre-commit hook to block `.md` files from root except whitelisted files.

**Implementation** (`.husky/pre-commit`):

```bash
# Block documentation files from being committed to root directory
# Only README.md, LICENSE, and WARP.md are allowed at root
DISALLOWED_ROOT_DOCS=$(git diff --cached --name-only | grep -E '\.md$' | grep -v -E '^(README\.md|LICENSE|WARP\.md)$' | grep -v '/' || true)
if [ ! -z "$DISALLOWED_ROOT_DOCS" ]; then
  echo "🚫 ERROR: Documentation files should not be committed to root directory"
  echo ""
  echo "Disallowed files:"
  echo "$DISALLOWED_ROOT_DOCS" | sed 's/^/  - /'
  echo ""
  echo "✅ Move them to one of these locations:"
  echo "  - docs/architecture/       (system design, decisions)"
  echo "  - docs/standards/          (coding patterns, rules)"
  echo "  - docs/guides/             (how-to tutorials)"
  echo "  - docs/production/         (operations, deployment)"
  echo "  - docs/templates/          (reusable templates)"
  echo "  - docs/reports/            (analysis, audits)"
  echo "  - archive/                 (historical/superseded docs)"
  echo ""
  echo "📝 For details, see: docs/guides/DOCUMENTATION_FILING_GUIDE.md"
  exit 1
fi
```

**Key patterns**:

1. **Use regex with `grep -v -E`** for cleaner whitelist patterns than multiple `grep -v` pipes
2. **Exclude subdirectories** with `grep -v '/'` to only catch root-level files
3. **Add helpful error messages** with specific folder suggestions
4. **Prevent future clutter** without blocking legitimate commits to docs/ subfolders

**Testing the hook**:

```bash
# Should BLOCK this:
echo "# Doc" > BAD_LOCATION.md && git add BAD_LOCATION.md && git commit -m "test"
# Output: 🚫 ERROR: Documentation files should not be committed...

# Should ALLOW this:
echo "# Doc" > docs/guides/GOOD_GUIDE.md && git add docs/guides/GOOD_GUIDE.md && git commit -m "test"
# Output: [dev abc123] test
```

**Git hooks configuration**:

Ensure git knows where to find hooks:

```bash
git config core.hooksPath .husky
```

## Pre-Commit Hook Execution Order

**Pattern**: Hooks run in sequence. Order matters for efficiency.

**Recommended order**:

1. **Merge conflict check** — Fast, blocks bad state early
2. **File organization checks** — Fast, prevents clutter
3. **TypeScript typecheck** — Medium (2-3s), catches type errors early
4. **Linting** — Medium (2-3s), catches style/pattern violations

**Why**: Quick checks first (fail fast), slow checks last (only if quick checks pass).

## Hook Testing Strategy

**Before deploying a hook**:

1. **Test blocking case** — Try to commit file that SHOULD be blocked

   ```bash
   # Should fail
   echo "# Test" > BAD.md && git add BAD.md && git commit -m "test" 2>&1 | grep -q "ERROR"
   ```

2. **Test allowing case** — Commit files that SHOULD be allowed

   ```bash
   # Should succeed
   echo "# Test" > docs/guides/GOOD.md && git add docs/guides/GOOD.md && git commit -m "test"
   ```

3. **Test edge cases** — README.md, LICENSE, files with spaces in names
   ```bash
   touch "My Doc.md" && git add "My Doc.md" && git commit -m "test"  # Should block
   ```

**Common pitfalls**:

- ❌ Using single quotes in bash `grep` patterns (escaping issues)
- ❌ Forgetting to redirect `stderr` for grep errors: `grep ... 2>&1`
- ❌ Not using `|| true` at end of command to prevent early exit
- ❌ Testing without proper git config: `git config core.hooksPath .husky`

## When Hooks Fail to Execute

**Diagnosis**:

```bash
# Check if hooks path is set
git config core.hooksPath

# Check if hook file is executable
ls -la .husky/pre-commit  # Should show -rwxr-xr-x

# Check if bash shebang is correct
head -1 .husky/pre-commit  # Should be #!/usr/bin/env bash
```

**Solutions**:

1. Set hooks path: `git config core.hooksPath .husky`
2. Make executable: `chmod +x .husky/pre-commit`
3. Verify shebang: First line must be `#!/usr/bin/env bash`

## Preventing Documentation Clutter: The Full Picture

**Hierarchy (enforced by hook)**:

```
Root (BLOCKED except README.md, LICENSE, WARP.md)
  └── Block docs from accumulating here

docs/ (ALLOWED - organized by purpose)
├── architecture/    (design decisions, system overview)
├── standards/       (coding patterns, rules, validation)
├── guides/          (how-to tutorials, setup guides)
├── production/      (operations, deployment, monitoring)
├── templates/       (reusable snippets, boilerplate)
└── reports/         (analysis, audits, metrics)

archive/ (ALLOWED - historical/superseded)
├── amendment-sources/
├── execution/
├── historical/
└── ...
```

**Hook prevents root clutter while allowing freedom in proper folders.**
