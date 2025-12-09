# CI/CD Deployment Guide: FRESH-ROOT Series-A
## Package Management: pnpm-only Policy
**CRITICAL:** This monorepo uses **pnpm exclusively**. Using npm or yarn will break dependency resolution and cause deployment failures.

### Why pnpm?
1. **Monorepo Support**: Native workspace management across 8+ packages
2. **Strict Dependency Resolution**: Prevents transitive dependency issues
3. **Disk Efficiency**: Hard-linking prevents duplication
4. **Lock File Integrity**: pnpm-lock.yaml provides deterministic installs
5. **Series-A Standard**: Production-grade tooling for enterprise deployments

### Environment Requirements
```bash
# Minimum versions (enforced by package.json engines field)
node >= 20.10.0
pnpm >= 9.0.0
```

### Installation & Setup
```bash
# 1. Verify pnpm is installed
pnpm --version

# 2. Install monorepo dependencies
pnpm install

# 3. Verify setup (runs pnpm enforcement checks)
pnpm prepare
```

### CI/CD Pipeline: pnpm-only Commands
#### GitHub Actions Workflow (.github/workflows/\*)
```yaml
name: Build & Deploy

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # ALWAYS use pnpm - never npm
      - uses: pnpm/action-setup@v2
        with:
          version: 9.12.1

      - uses: actions/setup-node@v3
        with:
          node-version: "20.10.0"
          cache: "pnpm" # Use pnpm cache, not npm

      # Install - pnpm only
      - run: pnpm install --frozen-lockfile

      # Type checking
      - run: pnpm typecheck

      # Linting
      - run: pnpm lint

      # Testing
      - run: pnpm test

      # Build
      - run: pnpm build
```

### Common Commands
| Task                        | Command                                    |
| --------------------------- | ------------------------------------------ |
| Install all dependencies    | `pnpm install`                             |
| Add package to workspace    | `pnpm add package-name -w`                 |
| Add package to specific app | `pnpm --filter @apps/web add package-name` |
| Update dependencies         | `pnpm update`                              |
| Remove package              | `pnpm remove package-name`                 |
| Type checking               | `pnpm typecheck`                           |
| Linting                     | `pnpm lint`                                |
| Formatting                  | `pnpm format`                              |
| Testing                     | `pnpm test`                                |
| Build                       | `pnpm build`                               |

### Troubleshooting
#### Error: "npm ERR! code ERESOLVE"
```bash
# You ran 'npm install' - DO NOT DO THIS
# Fix:
rm package-lock.json node_modules -rf
pnpm install
```

#### Error: "Cannot find module"
```bash
# Lock file mismatch (npm or yarn used)
# Fix:
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Error: "engine" violations
```bash
# pnpm version too old
# Fix:
pnpm add -g pnpm@latest
pnpm install
```

### Enforcement Mechanisms
1. **`.npmrc`**: Enables `engine-strict=true` to reject npm/yarn
2. **`scripts/enforce-pnpm.js`**: Pre-commit hook validates lock file
3. **`package.json::packageManager`**: Specifies pnpm as official manager
4. **`package.json::engines`**: Requires Node >= 20.10.0, pnpm >= 9.0.0
5. **GitHub Branch Protection**: CI fails if lock file not pnpm-lock.yaml

### Emergency: Recovering from npm Usage
If npm or yarn was accidentally used:

```bash
# 1. Remove all lock files
rm package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null

# 2. Clean install
rm -rf node_modules
pnpm install

# 3. Verify
pnpm lint

# 4. Commit the corrected lock file
git add pnpm-lock.yaml
git commit -m "fix: restore pnpm lock file (npm was used by mistake)"
```

---

**Last Updated**: December 1, 2025\
**Series-A Phase**: Enforced standard for production deployments\
**Maintainer**: FRESH-ROOT Core Team
