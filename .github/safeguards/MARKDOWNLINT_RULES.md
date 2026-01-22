# Markdownlint Rules Safeguard

> **Last Updated**: 2026-01-02  
> **Status**: Active

## Purpose

This document explains which markdownlint rules are disabled and why. These decisions are
intentional safeguards to prevent pre-commit hook failures on documentation that cannot be
auto-fixed.

## Disabled Rules

| Rule  | Name                                         | Reason                                            |
| ----- | -------------------------------------------- | ------------------------------------------------- |
| MD002 | First heading should be top level            | Conflicts with YAML frontmatter                   |
| MD003 | Heading style                                | Mixed styles (atx/setext) across docs             |
| MD022 | Headings should be surrounded by blank lines | Cannot be auto-fixed reliably                     |
| MD025 | Single H1                                    | Multi-section docs legitimately need multiple H1s |
| MD031 | Fenced code blocks surrounded by blank lines | Cannot be auto-fixed reliably                     |
| MD032 | Lists surrounded by blank lines              | Cannot be auto-fixed reliably                     |
| MD033 | Inline HTML                                  | Used intentionally in docs (badges, etc.)         |
| MD034 | Bare URLs                                    | Common in link-heavy docs                         |
| MD036 | Emphasis used instead of heading             | Intentional styling choice                        |
| MD040 | Fenced code language                         | Many example blocks don't need lang               |
| MD041 | First line should be heading                 | Conflicts with YAML frontmatter                   |
| MD051 | Link fragments should be valid               | TOC anchors with `-1` suffix from generators      |
| MD058 | Table formatting                             | Cannot be auto-fixed reliably                     |
| MD060 | Table column style                           | Too strict for compact tables                     |

## Enabled Rules (Enforced)

These rules ARE enforced and will fail the pre-commit hook:

- **MD001**: Heading increment (no skipping levels)
- **MD003**: Heading style consistency
- **MD004**: List marker style consistency
- **MD005**: List indentation
- **MD007**: Unordered list indentation (2 spaces)
- **MD009**: Trailing spaces
- **MD010**: Hard tabs
- **MD012**: Multiple consecutive blank lines (max 2)
- **MD018**: No space after hash in heading
- **MD019**: Multiple spaces after hash
- **MD023**: Heading indentation
- **MD024**: Duplicate headings (siblings only)
- **MD026**: Trailing punctuation in heading
- **MD030**: Spaces after list markers
- **MD038**: Spaces inside code spans
- **MD046**: Code block style

## Configuration Files

- `.markdownlint.json` - Main config (rules enabled/disabled)
- `.markdownlintignore` - Paths excluded from linting

## Adding New Rules

Before enabling a new rule:

1. Test it against the entire codebase: `pnpm exec markdownlint-cli2 "**/*.md"`
2. Verify it can be auto-fixed: `pnpm exec markdownlint-cli2 --fix "**/*.md"`
3. If >50 violations that can't be auto-fixed, do NOT enable
4. Update this document when changing rules

## Pre-commit Hook

The hook in `.husky/pre-commit` only lints staged markdown files and excludes:

- `.github/governance/**`
- `.github/instructions/**`
- `.github/prompts/**`
- `.github/copilot-instructions.md`
- `archive/**`
- `docs/**`

This allows documentation-heavy directories to evolve without blocking commits.
