---
description:
  "Lessons learned from GitHub Actions workflows, environment variables, and CI debugging"
applyTo: ".github/workflows/*.yml,.github/workflows/**/*.yml"
---

# GitHub Actions Memory

Hard-won lessons from CI/CD pipeline debugging, environment configuration, and workflow
optimization.

## Environment Variables in Build Jobs

**Pattern**: Environment variables from GitHub Secrets must be explicitly declared in the `env:`
block of each job that needs them.

**Why**: Unlike local development, GitHub Actions jobs are isolated. Environment variables aren't
inherited across jobs or steps automatically.

**Implementation**:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      # Explicitly declare all required secrets
      NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
      NODE_OPTIONS: ${{ secrets.NODE_OPTIONS }}
    steps:
      - name: Build
        run: pnpm build
```

**Key Points**:

- Add env block at job level (applies to all steps) or step level (applies to specific step)
- Use `${{ secrets.SECRET_NAME }}` syntax to reference GitHub Secrets
- If a build works locally but fails in CI with "missing environment variable" errors, check the env
  block first
- All workflows that run builds need the same environment variables configured

## pnpm Script Argument Passing

**Pattern**: When using `pnpm <script>` with arguments, avoid the `--` separator if the underlying
command will interpret it literally.

**Issue**: `pnpm repomix -- . --style markdown` passes `"--"` as a literal argument to the script,
breaking CLI parsers that don't expect it.

**Solution**: Remove the `--` separator:

```yaml
# ❌ Wrong - passes "--" as an argument
run: pnpm repomix -- . --style markdown --output result.md

# ✅ Correct - arguments passed directly
run: pnpm repomix . --style markdown --output result.md
```

**When to Use `--`**:

- Only when the underlying CLI tool explicitly supports it for argument separation
- Not needed for most npm/pnpm scripts that simply proxy to the actual command

## CLI Wrapper API Alignment

**Pattern**: When wrapping external CLI libraries, match their exact API expectations rather than
creating abstractions.

**Lesson**: We wrapped `repomix` library and tried to pass
`output: { filePath: string, style: string }` but the library expected
`output: string, style: string` as separate flat properties.

**Key Principle**: Read the TypeScript types of the library you're wrapping and match them exactly:

```typescript
// ❌ Wrong - creating nested structure
const options = {
  output: { filePath: args.output, style: args.style },
};

// ✅ Correct - matching library's flat API
const options = {
  output: args.output,
  style: args.style,
};
```

**Validation Strategy**:

1. Check the library's TypeScript definitions (`.d.ts` files in `node_modules`)
2. Test locally with the exact command format before committing
3. Match the library's expected structure precisely

## Local Testing Before CI

**Pattern**: Test CLI commands locally using the exact syntax that will run in CI before pushing
changes.

**Workflow**:

```bash
# Test the exact command that CI will run
pnpm repomix . --style markdown --output /tmp/test.md

# Verify it completes successfully before pushing
# Check for:
# - Argument parsing errors
# - Missing environment variables
# - Unexpected output formats
```

**Why**: CI debugging is slow (commit → push → wait → check logs). Local testing catches issues in
seconds.

**Time Saved**: A 5-minute local test can save 30+ minutes of CI iteration cycles.

## Build Success vs Runtime Failures

**Pattern**: A successful build in CI doesn't guarantee the application will run correctly.

**Example**: Next.js builds can succeed even if runtime environment variables are missing, but page
generation fails with Zod validation errors.

**What to Check**:

- Build logs for warnings (not just errors)
- Page data collection phase in Next.js builds
- Any "optional" environment variables that are actually required at runtime

**Verification**: Test the built application locally with production environment settings before
assuming CI success means production-ready.
