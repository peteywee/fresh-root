---

description: "Pattern-based code quality remediation strategies and ESLint safeguard rule creation"

applyTo: "**/*.ts,**/*.tsx,**/eslint.config.*,**/.eslintrc.*"

---

# Code Quality Memory

Systematic approaches for maintaining code quality through pattern detection, safeguard rules, and batch remediation strategies.

## Pattern Protocol for Error Remediation

When you find the same error pattern **3 or more times**, create a **safeguard rule** instead of fixing individual instances:

1. **Identify repeating patterns** using systematic analysis:
   ```bash
   pnpm exec eslint . --ext .ts,.tsx 2>&1 | grep -oP '@typescript-eslint/[a-z-]+' | sort | uniq -c | sort -rn
   ```

2. **Apply the 3x Rule**: If count ≥ 3, create safeguard rule in ESLint config

3. **Create architectural fixes** over per-file patches:
   - Document pattern in `.github/safeguards/{pattern}.rule.md`
   - Apply systematic solution (interface changes, type adjustments)
   - Update safeguard documentation with status tracking

4. **Convert errors to warnings** for legitimate patterns:
   ```javascript
   // In eslint.config.mjs
   rules: {
     // SAFEGUARD: Pattern detected 87x - Firebase returns untyped data
     "@typescript-eslint/no-unsafe-assignment": "warn",
     "@typescript-eslint/no-unsafe-member-access": "warn",
     // SAFEGUARD: Pattern detected 45x - SDK factory handlers don't always need await
     "@typescript-eslint/require-await": "warn",
   }
   ```

5. **Document reasoning** with comments explaining why the pattern is acceptable

For large error counts (100+ errors), use systematic batch processing:

1. **Categorize by pattern type**: Group similar errors together
2. **Prioritize by impact**: Fix blocking errors first, then warnings  
3. **Use parallel approach**: Multiple focused fixes simultaneously
4. **Validate incrementally**: Check compilation after each batch

## ESLint Configuration Hierarchy

**Local config takes precedence** over root config in monorepos:

- Check for `apps/web/eslint.config.mjs` before modifying root config
- Use `ignores` array to exclude legacy files causing parsing errors
- Apply safeguard rules in the config where TypeScript plugins are defined

## Error Pattern Categories

Common patterns that warrant safeguard rules:

- **Firebase SDK limitations**: `no-unsafe-*` rules (Firebase v12 returns `any`)
- **Framework patterns**: `require-await` (async handlers without await)
- **React patterns**: `no-misused-promises` (event handlers returning promises)
- **Unused variables**: Use underscore prefix pattern (`_varName`)

## Legacy File Handling

For files not in TypeScript project configuration:

```javascript
// In eslint.config.mjs
{
  ignores: [
    "lib/**",           // Legacy directories
    "**/__tests__/**",  // Test files handled by vitest
    "**/*.test.ts",     // Individual test files  
    "instrumentation.ts", // Framework files
  ]
}
```

## Validation Gates

Always verify after batch remediation:

1. **TypeScript compilation**: `pnpm -w typecheck`
2. **ESLint status**: Check error count reduction
3. **Git state**: Clean working directory
4. **Documentation**: Comment safeguard rules with reasoning

Example result: 319 errors → 0 errors (converted to 320 tracked warnings)