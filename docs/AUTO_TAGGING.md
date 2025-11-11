# Auto-Tagging System

## Overview

Files are automatically tagged with standardized headers when created or modified. Headers include:

- **Priority**: P0-P3 (critical to nice-to-have)
- **Area**: API, APP, ENV, RULES, TYPES, UTIL, etc.
- **Component**: ONBOARDING, NETWORK, ORG, etc.
- **JSDoc @fileoverview**: Purpose of the file

## Automatic Triggering

### On Git Commit (Recommended)

```bash
# Pre-commit hook automatically tags files
git add .
git commit -m "feat: add new feature"  # Auto-tags any new files
```

### During Development (Optional)

```bash
# Watch for new files and auto-tag in real-time
pnpm watch:tags
```

### Manual Tagging

```bash
# Tag all files in repo
pnpm tag:files

# Tag specific file
node scripts/tag-files.mjs --path apps/web/src/lib/myHelper.ts

# Dry run (preview changes)
node scripts/tag-files.mjs --dry-run
```

## File Types Supported

| Extension    | Header Format         | Example                    |
| ------------ | --------------------- | -------------------------- |
| `.ts`/`.tsx` | `// [P?][AREA][COMP]` | `// [P1][API][ONBOARDING]` |
| `.js`/`.mjs` | `// [P?][AREA][COMP]` | `// [P2][UTIL][HELPERS]`   |
| `.md`        | `#`                   | Markdown headings          |

## Priority Levels

- **P0**: Critical (security, core onboarding, infrastructure)
- **P1**: High (API routes, key helpers, rules)
- **P2**: Medium (utilities, tests, documentation)
- **P3**: Low (examples, comments, non-critical)

## Area Examples

`API`, `APP`, `ENV`, `RULES`, `TYPES`, `UTIL`, `TEST`, `DOC`

## Component Examples

`ONBOARDING`, `NETWORK`, `ORG`, `VENUE`, `CORPORATE`, `MEMBERSHIP`, `JOIN_TOKEN`, `VALIDATION`, `MIDDLEWARE`

## Integration Points

1. **Pre-commit**: Automatically tags new files before commit
1. **Post-checkout**: Tags files after branch switching
1. **Watch mode**: Optional real-time tagging during development
1. **Manual**: On-demand tagging via CLI

## Skipped Directories

Auto-tagging skips:

- `node_modules/`
- `.next/`, `dist/`, `build/`
- `.turbo/`, `.git/`

## Examples

### TypeScript API Route

```typescript
// [P1][API][ONBOARDING] Create network during onboarding
// Tags: P1, API, ONBOARDING, TRANSACTION
/**
 * @fileoverview
 * POST /api/onboarding/create-network-org
 * Creates network, org, venue, and initial memberships in single transaction.
 */
```

### TypeScript Helper

```typescript
// [P1][UTIL][ONBOARDING] Mark user onboarding complete
// Tags: P1, UTIL, ONBOARDING, HELPER
/**
 * @fileoverview
 * Sets canonical user.onboarding state after successful network creation.
 */
```

### Markdown Documentation

```markdown
# [P2][DOC][ONBOARDING] Onboarding Implementation Guide

...
```

## Troubleshooting

**Headers not appearing on new files?**

- Verify `.husky/pre-commit` is executable: `chmod +x .husky/pre-commit`
- Check git hooks are installed: `pnpm husky install`
- Run manually: `node scripts/tag-files.mjs`

**Duplicate headers?**

- Script detects existing headers and skips re-tagging
- Safe to run multiple times

**Wrong priority/area?**

- Edit file manually and update header
- Re-run `pnpm tag:files` to auto-fix if needed

