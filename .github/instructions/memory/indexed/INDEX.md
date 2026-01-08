# Memory Index
_Indexed, searchable knowledge base organized by domain and lesson type._

**Last Updated**: 2025-12-28 **Total Lessons**: 2 **Domains**: 2

## How to Use
1. **Search by domain**: Find related lessons in the domain table below
2. **Search by type**: Find gotchas, patterns, best-practices organized by category
3. **Search by tags**: Cross-referenced lessons sharing context/concern
4. **AI reference**: AI assistants use this index + metadata to find relevant guidance

## By Domain
_Lessons organized by their primary domain. Each domain folder at `memory/indexed/{domain}/`
contains individual lessons._

|Domain|Lesson Count|Recent Lessons|Tags|
|---|---|---|---|
|ci-cd|1|[issue-215-deployment-pipeline-enhancement-scope](ci-cd/issue-215-deployment-pipeline-enhancement-scope.md)|#ci-cd #deployment #rollback|
|project-handoff|1|[session-closeout-verify-claims-before-summary](project-handoff/session-closeout-verify-claims-before-summary.md)|#workflow #handoff #verification|

## By Type
### Patterns (Reusable Solutions)
_Effective approaches and best-practice patterns discovered across the codebase._

|Lesson|Domain|Priority|Created|
|---|---|---|---|
|(none yet)|—|—|—|

### Gotchas (Common Mistakes)
_Frequent mistakes, subtle bugs, and gotchas to avoid._

|Lesson|Domain|Priority|Created|
|---|---|---|---|
|(none yet)|—|—|—|

### Best Practices
_Standards, conventions, and proven approaches._

|Lesson|Domain|Priority|Created|
|---|---|---|---|
|(none yet)|—|—|—|

### Automation & Workflows
_Scripts, tools, and workflow improvements._

|Lesson|Domain|Priority|Created|
|---|---|---|---|
|[Issue #215: CI/CD enhancement scope (don’t break existing gates)](ci-cd/issue-215-deployment-pipeline-enhancement-scope.md)|ci-cd|1|2025-12-28|
|[Session closeout: verify before you summarize](project-handoff/session-closeout-verify-claims-before-summary.md)|project-handoff|2|2025-12-28|

### Critical Warnings
_High-priority lessons with safety, security, or major impact implications._

|Lesson|Domain|Priority|Created|
|---|---|---|---|
|(none yet)|—|—|—|

## By Tag
_Cross-referenced lessons sharing tags for related discovery._

### Common Tags
- `#pattern` - Reusable design patterns
- `#gotcha` - Common mistakes to avoid
- `#best-practice` - Standards and conventions
- `#automation` - Tools and scripts
- `#critical` - High-impact lessons
- `#debugging` - Debug techniques
- `#testing` - Test patterns
- `#performance` - Optimization
- `#security` - Security concerns
- `#typescript` - TypeScript specific
- `#git` - Git/SCM workflows
- `#monorepo` - Monorepo patterns
- `#ci-cd` - CI/CD pipelines

## Quick Links
- **[New Memory](https://github.com/peteywee/fresh-root/blob/main/.github/prompts/remember-enhanced.prompt.md)** -
  Use `/remember` to add new lessons
- **[Create Skill](https://github.com/peteywee/fresh-root/blob/main/.claude/skills/)** - Generate
  Claude Agent Skills from memory domains
- **[Memory Guidelines](https://github.com/peteywee/fresh-root/blob/main/.github/prompts/remember-enhanced.prompt.md#quality-standards)** -
  Best practices for memory entries

---

## Template: Adding New Lessons
When creating a new lesson in `memory/indexed/{domain}/{lesson-id}.md`, use this structure:

## ```yaml
description: "Brief domain/lesson responsibility"
applyTo: ["glob/patterns/**"]
tags: ["tag1", "tag2", "tag3"]
type: "pattern|gotcha|best-practice|automation|workflow"
domain: "domain-name"
priority: 1-3
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
relatedDomains: ["related-domain"]
relatedLessons: ["lesson-id"]
## keywords: ["keyword1", "keyword2"]

# Lesson Title
_Brief tagline._

## Problem
What problem or mistake this addresses.

## Solution
How to do it correctly.

## Why
Why this matters.

## Example
Code or concrete example.
```

Then update this INDEX with the new entry in the appropriate section.
