# FRESH SCHEDULES - CI/CD
> **Version**: 1.0.0\
> **Status**: CANONICAL\
> **Authority**: Sr Dev / Architecture\
> **Location**: `.github/workflows/`

This document defines CI/CD workflows. Designed to be light and extensible.

---

## WORKFLOW OVERVIEW
| Workflow          | Trigger      | Purpose                |
| ----------------- | ------------ | ---------------------- |
| `ci.yml`          | PR, Push     | Core validation        |
| `orchestrate.yml` | PR, Manual   | Pipeline orchestration |
| `deploy.yml`      | Push to main | Production deployment  |
| `cleanup.yml`     | Merged PR    | Branch cleanup         |

---

## CORE CI WORKFLOW
```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, dev]
  push:
    branches: [main, dev]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  static:
    name: Static Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: TypeScript
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint:check

      - name: Format
        run: pnpm format:check

  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: static
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Unit Tests
        run: pnpm test:unit

      - name: Rules Tests
        run: pnpm test:rules

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        if: always()

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Upload Build
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: apps/web/.next
          retention-days: 1
```

---

## ORCHESTRATE WORKFLOW
```yaml
# .github/workflows/orchestrate.yml
name: Orchestrate

on:
  pull_request:
    branches: [main, dev]
  workflow_dispatch:
    inputs:
      pipeline:
        description: "Pipeline to run"
        required: false
        type: choice
        options:
          - auto
          - Feature.FAST
          - Feature.STANDARD
          - Feature.HEAVY
          - Security.STANDARD
          - Security.HEAVY

concurrency:
  group: orchestrate-${{ github.ref }}
  cancel-in-progress: true

jobs:
  classify:
    name: Classify Changes
    runs-on: ubuntu-latest
    outputs:
      pipeline: ${{ steps.detect.outputs.pipeline }}
      is_security: ${{ steps.detect.outputs.is_security }}
      file_count: ${{ steps.detect.outputs.file_count }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Detect Pipeline
        id: detect
        run: |
          if [ "${{ inputs.pipeline }}" != "" ] && [ "${{ inputs.pipeline }}" != "auto" ]; then
            echo "pipeline=${{ inputs.pipeline }}" >> $GITHUB_OUTPUT
            exit 0
          fi

          # Get changed files
          FILES=$(git diff --name-only origin/${{ github.base_ref }}...HEAD)
          FILE_COUNT=$(echo "$FILES" | wc -l)

          # Check for security files
          IS_SECURITY=false
          if echo "$FILES" | grep -qE "(firestore\.rules|\.env|/auth/|/security/|api-framework)"; then
            IS_SECURITY=true
          fi

          # Check for schema files
          IS_SCHEMA=false
          if echo "$FILES" | grep -qE "(packages/types/src/schemas|\.schema\.ts)"; then
            IS_SCHEMA=true
          fi

          # Determine pipeline
          if [ "$IS_SECURITY" = true ]; then
            PIPELINE="Security.STANDARD"
          elif [ "$IS_SCHEMA" = true ]; then
            PIPELINE="Schema.STANDARD"
          elif [ "$FILE_COUNT" -eq 1 ]; then
            PIPELINE="Feature.FAST"
          elif [ "$FILE_COUNT" -le 5 ]; then
            PIPELINE="Feature.STANDARD"
          else
            PIPELINE="Feature.HEAVY"
          fi

          echo "pipeline=$PIPELINE" >> $GITHUB_OUTPUT
          echo "is_security=$IS_SECURITY" >> $GITHUB_OUTPUT
          echo "file_count=$FILE_COUNT" >> $GITHUB_OUTPUT

  static:
    name: STATIC Gate
    runs-on: ubuntu-latest
    needs: classify
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: TypeScript
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint:check

      - name: Format
        run: pnpm format:check

  correctness:
    name: CORRECTNESS Gate
    runs-on: ubuntu-latest
    needs: [classify, static]
    if:
      contains(fromJson('["Feature.STANDARD","Feature.HEAVY","Bug.STANDARD","Bug.HEAVY","Schema.STANDARD","Schema.HEAVY","Refactor.STANDARD","Refactor.HEAVY","Security.STANDARD","Security.HEAVY"]'),
      needs.classify.outputs.pipeline)
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Unit Tests
        run: pnpm test:unit

      - name: Rules Tests
        run: pnpm test:rules

      - name: E2E Tests
        if: contains(needs.classify.outputs.pipeline, 'HEAVY')
        run: pnpm test:e2e

  safety:
    name: SAFETY Gate
    runs-on: ubuntu-latest
    needs: [classify, static]
    if:
      contains(fromJson('["Feature.HEAVY","Bug.HEAVY","Schema.STANDARD","Schema.HEAVY","Refactor.HEAVY","Security.STANDARD","Security.HEAVY"]'),
      needs.classify.outputs.pipeline)
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Pattern Validation
        run: node scripts/validate-patterns.mjs

      - name: Secret Scan
        run: |
          if command -v git-secrets &> /dev/null; then
            git secrets --scan
          else
            echo "git-secrets not installed, skipping"
          fi

      - name: Dependency Audit
        run: pnpm audit --audit-level=high
        continue-on-error: true

  summary:
    name: Pipeline Summary
    runs-on: ubuntu-latest
    needs: [classify, static, correctness, safety]
    if: always()
    steps:
      - name: Generate Summary
        run: |
          echo "## Pipeline: ${{ needs.classify.outputs.pipeline }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Gate | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|------|--------|" >> $GITHUB_STEP_SUMMARY
          echo "| STATIC | ${{ needs.static.result }} |" >> $GITHUB_STEP_SUMMARY
          echo "| CORRECTNESS | ${{ needs.correctness.result }} |" >> $GITHUB_STEP_SUMMARY
          echo "| SAFETY | ${{ needs.safety.result }} |" >> $GITHUB_STEP_SUMMARY

      - name: Check Results
        if:
          needs.static.result == 'failure' || needs.correctness.result == 'failure' ||
          needs.safety.result == 'failure'
        run: exit 1
```

---

## DEPLOY WORKFLOW
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          # Add other env vars as needed

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"

      - name: Deploy Firestore Rules
        if:
          contains(github.event.head_commit.message, '[rules]') ||
          contains(github.event.head_commit.modified, 'firestore.rules')
        run: |
          npm install -g firebase-tools
          firebase deploy --only firestore:rules --token ${{ secrets.FIREBASE_TOKEN }}
```

---

## CLEANUP WORKFLOW
```yaml
# .github/workflows/cleanup.yml
name: Cleanup

on:
  pull_request:
    types: [closed]
    branches: [dev]

jobs:
  cleanup:
    name: Delete Merged Branch
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - name: Delete Branch
        uses: actions/github-script@v7
        with:
          script: |
            const branch = context.payload.pull_request.head.ref;
            const patterns = ['feature/', 'fix/', 'refactor/', 'chore/'];

            if (patterns.some(p => branch.startsWith(p))) {
              await github.rest.git.deleteRef({
                owner: context.repo.owner,
                repo: context.repo.repo,
                ref: `heads/${branch}`
              });
              console.log(`Deleted branch: ${branch}`);
            } else {
              console.log(`Skipping branch: ${branch}`);
            }
```

---

## REUSABLE WORKFLOWS
### Setup Action
```yaml
# .github/actions/setup/action.yml
name: Setup
description: Common setup steps

runs:
  using: composite
  steps:
    - uses: pnpm/action-setup@v2
      with:
        version: 8

    - uses: actions/setup-node@v4
      with:
        node-version: "20"
        cache: "pnpm"

    - run: pnpm install --frozen-lockfile
      shell: bash
```

### Usage in Workflows
```yaml
jobs:
  build:
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: pnpm build
```

---

## EXTENDING WORKFLOWS
### Adding a New Gate
1. Add job to `orchestrate.yml`:

```yaml
new_gate:
  name: NEW_GATE
  needs: [classify, static]
  if: contains(needs.classify.outputs.pipeline, 'HEAVY')
  steps:
    - uses: actions/checkout@v4
    - uses: ./.github/actions/setup
    - run: pnpm run new-check
```

1. Add to summary job `needs`:

```yaml
summary:
  needs: [classify, static, correctness, safety, new_gate]
```

1. Update pipeline configs in `08_PIPELINES.md`

### Adding a New Pipeline
1. Add to classification logic in `orchestrate.yml`
2. Update gate conditions to include new pipeline
3. Document in `08_PIPELINES.md`

### Environment-Specific Deploys
```yaml
# Add to deploy.yml
jobs:
  deploy-dev:
    if: github.ref == 'refs/heads/dev'
    environment: dev
    # ...

  deploy-production:
    if: github.ref == 'refs/heads/main'
    environment: production
    # ...
```

---

## SECRETS REQUIRED
| Secret              | Used By    | Purpose             |
| ------------------- | ---------- | ------------------- |
| `VERCEL_TOKEN`      | deploy.yml | Vercel deployment   |
| `VERCEL_ORG_ID`     | deploy.yml | Vercel organization |
| `VERCEL_PROJECT_ID` | deploy.yml | Vercel project      |
| `FIREBASE_TOKEN`    | deploy.yml | Firebase CLI auth   |
| `CODECOV_TOKEN`     | ci.yml     | Coverage reporting  |

---

## TROUBLESHOOTING
### Gate Failures
| Issue              | Solution                                 |
| ------------------ | ---------------------------------------- |
| TypeScript errors  | Run `pnpm typecheck` locally             |
| Lint failures      | Run `pnpm lint --fix`                    |
| Format failures    | Run `pnpm format`                        |
| Test failures      | Run `pnpm test:unit` locally             |
| Pattern violations | Run `node scripts/validate-patterns.mjs` |

### Workflow Issues
| Issue                   | Solution                         |
| ----------------------- | -------------------------------- |
| Workflow not triggering | Check branch patterns in `on:`   |
| Concurrency conflicts   | Check `concurrency:` group names |
| Secrets not found       | Verify secrets in repo settings  |
| Cache issues            | Clear cache in Actions settings  |

---

**END OF CI/CD**

Next document: [10\_BRANCH\_RULES.md](./10_BRANCH_RULES.md)
