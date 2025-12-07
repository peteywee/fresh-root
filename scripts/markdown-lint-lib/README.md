# Markdown Linting Rules Library

Comprehensive markdown linting configuration with **28 auto-fixable rules** out of **51 total rules** and **3 profile tiers** (strict, standard, lenient). Fully integrated with `markdownlint-cli2`.

## Quick Start

### 1. Install markdownlint-cli2

```bash
pnpm add -D markdownlint-cli2 markdownlint
```

### 2. Generate Configuration

```bash
# Strict profile (ALL 51 rules enabled)
node scripts/markdown-lint-lib/index.mjs strict --output .markdownlint-cli2.jsonc

# Standard profile (35 core rules - recommended)
node scripts/markdown-lint-lib/index.mjs standard --output .markdownlint-cli2.jsonc

# Lenient profile (15 essential rules)
node scripts/markdown-lint-lib/index.mjs lenient --output .markdownlint-cli2.jsonc
```

### 3. Run Linting or Auto-Fix

```bash
# Check for issues (exit code 1 if issues found)
markdownlint-cli2 "**/*.md" "#node_modules"

# Auto-fix all issues
markdownlint-cli2 --fix "**/*.md" "#node_modules"

# Using the task wrapper
node scripts/markdown-lint-lib/task.mjs               # Validate
node scripts/markdown-lint-lib/task.mjs --fix         # Auto-fix
node scripts/markdown-lint-lib/task.mjs --fix --profile=strict  # Strict + fix all
```

## Profiles

### Strict (51 rules)

**ALL markdown linting rules enabled.** Maximum coverage and strictest enforcement.

```bash
node scripts/markdown-lint-lib/index.mjs strict
```

**Includes all rules across all categories:**

- Headers (13), Lists (8), Whitespace (10), Code (7), Links (5), Advanced (8)

### Standard (35 rules) ⭐ Recommended

Balanced set of essential rules with best-practice enforcement. Good for most projects.

```bash
node scripts/markdown-lint-lib/index.mjs standard
```

### Lenient (15 rules)

Minimal essential rules only. Best for permissive documentation or legacy projects.

```bash
node scripts/markdown-lint-lib/index.mjs lenient
```

## Auto-Fixable Rules (28 Total)

| Code | Rule | Priority | Category |
|------|------|----------|----------|
| MD001 | Header increment | High | Headers |
| MD003 | Header style | High | Headers |
| MD004 | List unordered style | High | Lists |
| MD005 | List indentation consistency | High | Lists |
| MD007 | Unordered list indentation | Medium | Lists |
| MD009 | Trailing spaces | High | Whitespace |
| MD010 | Hard tabs | High | Whitespace |
| MD012 | Multiple blank lines | Medium | Whitespace |
| MD018 | No space after heading marker | High | Headers |
| MD019 | Space before heading marker | High | Headers |
| MD020 | Closing heading markers | Medium | Headers |
| MD021 | Multiple spaces in heading | Medium | Headers |
| MD026 | Heading punctuation | Low | Headers |
| MD027 | Blockquote spacing | Medium | Spacing |
| MD030 | List spacing | Medium | Lists |
| MD031 | Code block blanks | Medium | Code |
| MD032 | List item blank lines | Medium | Lists |
| MD035 | Horizontal rule style | Low | Spacing |
| MD037 | Emphasis marker spaces | High | Emphasis |
| MD038 | Code marker spaces | High | Code |
| MD039 | Link text spaces | High | Links |
| MD046 | Code block style | High | Code |
| MD047 | Single trailing newline | High | Whitespace |
| MD048 | Code fence style | High | Code |
| MD049 | Emphasis style | Medium | Emphasis |
| MD050 | List marker style | Medium | Lists |
| MD051 | Link fragments | Low | Links |
| MD052 | Reference links unused | Low | Links |

## Rule Categories (51 Total)

### Headers (13 rules)

- **MD001**: Header increment levels (h2 after h1, not h3)
- **MD002**: First heading must be H1
- **MD003**: Heading style consistency (# vs underline)
- **MD018**: Space after heading marker ✅ Fixable
- **MD019**: No space before heading marker ✅ Fixable
- **MD020**: Closing heading markers ✅ Fixable
- **MD021**: Multiple spaces inside heading markers ✅ Fixable
- **MD022**: Headings surrounded by blank lines
- **MD023**: Heading level consistency
- **MD024**: No duplicate heading names
- **MD025**: Only one H1 per document
- **MD026**: No punctuation at end of headings ✅ Fixable
- **MD041**: First line must be heading

### Lists (8 rules)

- **MD004**: List marker consistency (*, -, +) ✅ Fixable
- **MD005**: List indentation consistency ✅ Fixable
- **MD006**: Start unordered list at column 0
- **MD007**: Unordered list indentation ✅ Fixable
- **MD029**: Ordered list item style (1., 1), etc) ✅ Fixable
- **MD030**: List spacing between items ✅ Fixable
- **MD032**: List item blank lines ✅ Fixable
- **MD050**: List marker style consistency ✅ Fixable

### Whitespace & Spacing (10 rules)

- **MD009**: No trailing spaces ✅ Fixable
- **MD010**: No hard tabs (use spaces) ✅ Fixable
- **MD012**: Max 1 blank line between elements ✅ Fixable
- **MD027**: Blockquote spacing ✅ Fixable
- **MD028**: No blank lines inside blockquotes
- **MD037**: No spaces inside emphasis markers ✅ Fixable
- **MD038**: No spaces inside code markers ✅ Fixable
- **MD039**: No spaces inside link text ✅ Fixable
- **MD047**: Single newline at end of file ✅ Fixable
- **MD049**: Emphasis style consistency ✅ Fixable

### Code & Fences (7 rules)

- **MD031**: Blank lines around code blocks ✅ Fixable
- **MD040**: Code blocks must specify language
- **MD046**: Code fence style consistency (backticks) ✅ Fixable
- **MD047**: Single newline at end of file ✅ Fixable
- **MD048**: Code fence marker consistency ✅ Fixable
- **MD051**: Link fragments point to valid headings ✅ Fixable
- **MD052**: Reference links must be used ✅ Fixable

### Links & References (5 rules)

- **MD011**: Reversed link syntax detection
- **MD034**: Bare URLs should use angle brackets ✅ Fixable
- **MD035**: Horizontal rule style consistency ✅ Fixable
- **MD042**: No empty links
- **MD053**: Link definitions must be valid

### Advanced & Miscellaneous (8 rules)

- **MD013**: Line length limit (configurable)
- **MD014**: No $ in shell code blocks
- **MD033**: No inline HTML
- **MD036**: Avoid emphasis as heading
- **MD043**: Required heading structure
- **MD044**: Proper names case sensitivity
- **MD045**: Images with alt text
- **MD055**: Table header format

---

**✅ = Auto-fixable with `--fix` flag**

## Integration Examples

### NPM Scripts

```json
{
  "scripts": {
    "docs:lint": "markdownlint-cli2 \"**/*.md\" \"#node_modules\"",
    "docs:fix": "markdownlint-cli2 --fix \"**/*.md\" \"#node_modules\"",
    "docs:lint:strict": "node scripts/markdown-lint-lib/index.mjs strict && markdownlint-cli2 \"**/*.md\" \"#node_modules\"",
    "docs:lint:standard": "node scripts/markdown-lint-lib/index.mjs standard && markdownlint-cli2 \"**/*.md\" \"#node_modules\"",
    "docs:lint:lenient": "node scripts/markdown-lint-lib/index.mjs lenient && markdownlint-cli2 \"**/*.md\" \"#node_modules\"",
    "docs:fix:strict": "node scripts/markdown-lint-lib/task.mjs --fix --profile=strict",
    "docs:fix:standard": "node scripts/markdown-lint-lib/task.mjs --fix --profile=standard"
  }
}
```

### GitHub Actions

```yaml
- name: Lint Markdown (Standard)
  run: pnpm run docs:lint

- name: Auto-Fix Markdown
  run: pnpm run docs:fix
  if: failure()

- name: Strict Linting Check
  run: pnpm run docs:lint:strict
```

### Pre-Commit Hook

```yaml
- repo: https://github.com/DavidAnson/markdownlint-cli2
  rev: v0.20.0
  hooks:
    - id: markdownlint-cli2
      args: ["--fix"]
```

## Configuration Files

The library generates `.markdownlint-cli2.jsonc` with profile-specific rules:

```jsonc
{
  "config": {
    // Headers
    "MD001": true,
    "MD003": { "style": "consistent" },
    "MD018": true,
    // ... more rules based on profile
  },
  "fix": true,
  "globs": ["**/*.md", "#node_modules"],
  "ignores": ["node_modules", ".git", "dist", "build"]
}
```

## Environment Variables

- `SKIP_LINT=true` - Skip linting entirely
- `VERBOSE=true` - Enable verbose output with rule details
- `MARKDOWN_PROFILE=strict|standard|lenient` - Override default profile

## Troubleshooting

### "markdownlint-cli2: command not found"

Install as dev dependency:

```bash
pnpm add -D markdownlint-cli2
```

### Code block without language causes MD040 error

Add language specifier:

```markdown
# ❌ Wrong
\`\`\`
code
\`\`\`

# ✅ Correct
\`\`\`javascript
code
\`\`\`
```

### Trailing spaces detected (MD009)

Remove whitespace at end of lines. Use `--fix` to auto-correct or enable "trim trailing whitespace" in your editor.

### Line too long (MD013)

Wrap at column 120 (or reconfigure in strict profile). Standard profile disables this rule.

### "This is too strict!"

Switch to standard or lenient profile. Edit profile rules in `index.mjs` as needed.

## Statistics

```
Total Rules: 51
Auto-Fixable: 28 (55%)
Non-Fixable: 23 (45%)

Strict Profile: 51 rules enabled (comprehensive)
Standard Profile: 35 rules enabled (recommended)
Lenient Profile: 15 rules enabled (minimal)
```

## Rule Reference

Full documentation with examples available in `RULE_DESCRIPTIONS` export from `index.mjs`.

```bash
# View all rules with descriptions
node scripts/markdown-lint-lib/index.mjs --verbose

# Generate config and report
node scripts/markdown-lint-lib/task.mjs --verbose
```

## Further Reading

- [markdownlint Official Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/RULES.md)
- [markdownlint-cli2 Documentation](https://github.com/DavidAnson/markdownlint-cli2)
- [VSCode Extension](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)
- [Markdown Best Practices](https://www.markdownguide.org/)

## License

MIT - Same as markdownlint

---

**Last Updated**: December 7, 2025  
**Status**: Production Ready  
**Coverage**: ALL 51 markdown linting rules with 28 auto-fix support
