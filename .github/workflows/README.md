# GitHub Actions Workflows

This directory contains CI/CD workflows for the Fresh Root project. All workflows are designed to be maintainable, efficient, and future-proof.

## 📋 Workflows Overview

### Core CI/CD

#### 🔄 `ci.yml` - Main CI Pipeline
**Trigger:** Push to main/dev, Pull Requests, Manual dispatch

**Jobs:**
1. **Validate** - Formatting & pattern validation (10 min timeout)
2. **Type Check** - TypeScript type checking (10 min timeout)
3. **Lint** - ESLint with report generation (10 min timeout)
4. **Build** - Build all packages & apps (15 min timeout)
5. **Test** - Run test suite with coverage (15 min timeout)
6. **Security** - Audit dependencies (10 min timeout)
7. **CI Success** - Final status check

**Features:**
- Concurrency control (cancels outdated runs)
- Parallel job execution for speed
- Artifact uploads (build output, coverage, lint reports)
- Comprehensive error reporting

---

#### 📊 `pr-feedback.yml` - Pull Request Analytics
**Trigger:** PR open, sync, reopen

**Jobs:**
1. **PR Info** - Statistics and metrics
2. **Size Check** - Bundle size analysis

**Features:**
- Auto-updates existing comment
- File change tracking
- Build size monitoring

---

### Repository Analysis

#### 🧠 `repomix-ci.yml` - Repository Analysis
**Trigger:** Push to main/dev, Pull Requests, Manual dispatch

Generates dependency maps and architecture documentation on every PR.

**Features:**
- JSON and Markdown output
- Artifact uploads
- PR comments with truncated analysis

---

#### 📈 `repomix-dashboard.yml` - Nightly Dashboard
**Trigger:** Scheduled (2 AM UTC daily), Manual dispatch

Generates comprehensive repository dashboard overnight.

**Features:**
- Full dependency analysis
- Auto-commit to docs
- Architecture index updates

---

### Maintenance

#### 🔒 `dependency-check.yml` - Dependency Monitoring
**Trigger:** Weekly (Monday 8 AM UTC), Manual dispatch, Dependency file changes

**Jobs:**
1. **Audit** - Security vulnerability scanning
2. **Outdated** - Check for outdated packages
3. **Compatibility** - Version compatibility checks

**Features:**
- Critical vulnerability blocking
- Dependency tree reports
- Node.js/pnpm version validation

---

## 🛠️ Workflow Standards

### Common Configuration

All workflows use centralized environment variables:

```yaml
env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9.12.1'
```

### Concurrency Control

Workflows use concurrency groups to cancel outdated runs:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Timeout Protection

All jobs have explicit timeouts to prevent hanging:

```yaml
timeout-minutes: 10  # Adjust per job
```

### Caching Strategy

Node.js setup includes automatic pnpm caching:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'pnpm'
```

---

## 🚀 Usage

### Running Workflows Locally

**Prerequisites:**
```bash
# Ensure correct versions
node --version  # Should be >= 20.10.0
pnpm --version  # Should be >= 9.0.0
```

**Simulate CI pipeline:**
```bash
# Full CI sequence
pnpm format:check
pnpm validate:patterns
pnpm typecheck
pnpm lint
pnpm build
pnpm test
pnpm audit --audit-level moderate
```

### Manual Workflow Dispatch

Navigate to Actions → Select workflow → "Run workflow"

Available for:
- `ci.yml`
- `repomix-dashboard.yml`
- `dependency-check.yml`

---

## 🔧 Maintenance

### Updating Node.js Version

1. Update `NODE_VERSION` in all workflow files
2. Update `engines.node` in root `package.json`
3. Update `.nvmrc` file

### Updating pnpm Version

1. Update `PNPM_VERSION` in all workflow files
2. Update `packageManager` in root `package.json`
3. Update `engines.pnpm` in root `package.json`

### Adding New Jobs

When adding jobs to `ci.yml`:

1. Add job with explicit timeout
2. Include proper error handling
3. Update `ci-success` dependencies
4. Document in this README

---

## 📊 Artifacts

### Retention Policy

| Artifact | Retention | Size Limit |
|----------|-----------|------------|
| Build output | 7 days | ~100MB |
| Coverage reports | 7 days | ~50MB |
| Lint reports | 7 days | ~5MB |
| Audit reports | 30 days | ~5MB |
| Dependency trees | 30 days | ~1MB |
| Repomix analysis | 14 days | ~10MB |

---

## 🐛 Troubleshooting

### Build Failures

**Common issues:**

1. **Tailwind CSS v4 PostCSS error**
   - Ensure `@tailwindcss/postcss` is installed
   - Check `postcss.config.cjs` uses correct plugin

2. **Type check failures**
   - Run `pnpm typecheck` locally first
   - Check for missing dependencies in packages

3. **Test failures**
   - Verify tests pass locally
   - Check for environment-specific issues

### Cache Issues

**Clear GitHub Actions cache:**
1. Go to Actions → Caches
2. Delete relevant caches
3. Re-run workflow

### Timeout Issues

If jobs timeout frequently:
1. Increase timeout in workflow
2. Optimize build/test processes
3. Consider splitting into smaller jobs

---

## 🔐 Security

### Secrets Required

None currently - all workflows use public repositories.

### Permissions

Workflows use minimal required permissions:
- `contents: read` - Read repository
- `pull-requests: write` - Comment on PRs (pr-feedback only)
- `issues: write` - Update PR comments (repomix-ci only)

---

## 📝 Best Practices

1. **Always test locally** before pushing workflow changes
2. **Use explicit versions** for actions (e.g., `@v4` not `@latest`)
3. **Set timeouts** on all jobs and steps
4. **Handle failures gracefully** with `continue-on-error` when appropriate
5. **Document changes** in this README
6. **Monitor workflow runs** for performance regressions
7. **Keep workflows DRY** - use environment variables and reusable components

---

## 🔄 Future Improvements

Planned enhancements:

- [ ] E2E testing workflow
- [ ] Performance benchmarking
- [ ] Auto-deployment to staging
- [ ] Dependency update automation
- [ ] Code coverage thresholds
- [ ] Matrix testing (multiple Node.js versions)
- [ ] Reusable workflow templates

---

**Last Updated:** December 15, 2025  
**Maintained By:** DevOps Team  
**Questions?** Create an issue or contact the maintainers.
