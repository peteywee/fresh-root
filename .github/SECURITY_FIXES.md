This branch will contain minimal dependency upgrades to remediate security alerts reported by GitHub (2 critical, 8 moderate, 4 low).

Workflow:

- I will identify the exact GHSA entries from the GitHub Security/Dependabot UI or Dependabot PRs.
- Apply minimal version bumps to fix critical vulnerabilities first.
- Run workspace typecheck and tests locally before pushing each bump.

Status: WIP
