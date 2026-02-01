---

title: "Repomix Integration Guide"
description: "Guide to using Repomix as a CLI tool and library in Fresh Schedules."
keywords:
  - repomix
  - integration
  - tooling
category: "guide"
status: "active"
audience:
  - developers
  - ai-agents
related-docs:
  - README.md
  - ./REPOMIX_INDEX.md
  - ../architecture/REPOMIX_MCP_TOOLS_REFERENCE.md
createdAt: "2026-01-31T07:18:59Z"
lastUpdated: "2026-01-31T07:18:59Z"

---

# Repomix Integration Guide

Repomix has been integrated into Fresh Schedules as both a **CLI tool** and a **library** for
analyzing and packaging codebases.

## Quick Start

### CLI Usage

```bash
# Get help
pnpm repomix --help

# Pack current directory as XML (default)
pnpm repomix .

# Pack as Markdown for readability
pnpm repomix . --style markdown --output codebase.md

# Pack a specific directory
pnpm repomix packages/api-framework

# Pack with compression for AI analysis
pnpm repomix . --compress --output compressed.xml

# Pack a GitHub repository
pnpm repomix user/repo --style markdown
```

### CLI Options

- `--style <format>` - Output format: `xml` (default), `markdown`, `json`, `plain`
- `--output <path>` - Output file path (default: `repomix-output.{xml|md|json}`)
- `--ignore <patterns>` - Patterns to ignore (comma-separated)
- `--include <patterns>` - Patterns to include (comma-separated)
- `--compress` - Enable compression for smaller output
- `-v, --version` - Show version
- `-h, --help` - Show help

### Library Usage

Use repomix programmatically in your code:

```typescript
import { runDefaultAction, setLogLevel } from "@fresh-schedules/repomix";

// Set log level (optional)
setLogLevel("info");

// Run repomix on directories
await runDefaultAction(
  ["./apps", "./packages"], // Directories to analyze
  process.cwd(), // Working directory
  {
    output: {
      style: "markdown",
      filePath: "./analysis.md",
    },
    compress: false,
  },
);
```

## Common Use Cases

### 1. Generate Codebase Documentation

```bash
# Create a markdown representation of your codebase
pnpm repomix . --style markdown --output CODEBASE.md
```

### 2. Prepare for AI Analysis

```bash
# Compress output for ChatGPT/Claude analysis
pnpm repomix . --style xml --compress --output ai-input.xml
```

### 3. Analyze Specific Package

```bash
# Analyze just the API framework package
pnpm repomix packages/api-framework --style markdown
```

### 4. Exclude node_modules and build artifacts

```bash
pnpm repomix . \
  --style markdown \
  --ignore "node_modules/**,dist/**,.next/**,coverage/**"
```

### 5. Generate focused analysis

```bash
# Only include API routes
pnpm repomix . \
  --include "app/api/**" \
  --style markdown \
  --output api-only.md
```

## Package Details

### Location

```
packages/repomix/
├── src/
│   ├── index.ts      # Library exports
│   └── cli.ts        # CLI implementation
├── dist/             # Built files (after pnpm build)
├── package.json
├── tsconfig.json
└── README.md
```

### Package Name

- **NPM**: `@fresh-schedules/repomix`
- **Workspace**: `@fresh-schedules/repomix` (internal package)

### Scripts

```bash
# Build the package
pnpm --filter @fresh-schedules/repomix build

# Type check
pnpm --filter @fresh-schedules/repomix typecheck

# Clean build artifacts
pnpm --filter @fresh-schedules/repomix clean
```

## Library API

### Exported Functions

```typescript
// Run repomix on directories
export async function runDefaultAction(
  directories: string[],
  cwd: string,
  options: CliOptions,
): Promise<DefaultActionRunnerResult>;

// Set logging level
export function setLogLevel(level: string): void;

// Get library version
export async function getVersion(): Promise<string>;
```

### Exported Types

```typescript
export type RepomixConfig    // Configuration schema
export type CliOptions       // CLI options interface
```

## Integration Points

### Root Package.json

Added convenience command:

```json
{
  "scripts": {
    "repomix": "node packages/repomix/dist/cli.js"
  }
}
```

### Dependency Chain

- **fresh-root** (root)
  - Depends on: `@fresh-schedules/repomix`
- **@fresh-schedules/repomix** (package)
  - Depends on: `repomix@^0.2.43`

## Examples

### Example 1: CI/CD Integration

```bash
# !/bin/bash
# Generate codebase documentation for each release
VERSION=$(node -p "require('./package.json').version")
pnpm repomix . \
  --style markdown \
  --ignore "node_modules/**,dist/**,.next/**" \
  --output "docs/CODEBASE-v${VERSION}.md"
```

### Example 2: Programmatic API Usage

```typescript
// scripts/analyze-codebase.ts
import { runDefaultAction, setLogLevel } from "@fresh-schedules/repomix";

async function main() {
  setLogLevel("info");

  // Analyze production code
  await runDefaultAction(["apps/web", "packages"], process.cwd(), {
    output: {
      style: "xml",
      filePath: "./reports/codebase-analysis.xml",
    },
    ignore: {
      customPatterns: ["**/*.test.ts", "**/__tests__/**"],
    },
  });

  console.log("✅ Analysis complete!");
}

main().catch(console.error);
```

### Example 3: GitHub Repository Analysis

```bash
# Analyze a GitHub repository directly
pnpm repomix peteywee/fresh-root \
  --style markdown \
  --include "packages/**" \
  --compress
```

## Troubleshooting

### CLI not found

```bash
# Ensure the package is built
pnpm --filter @fresh-schedules/repomix build

# Try using the full path
node packages/repomix/dist/cli.js --help
```

### Build errors

```bash
# Clean and rebuild
pnpm --filter @fresh-schedules/repomix clean
pnpm --filter @fresh-schedules/repomix build
```

### Type errors in library usage

Ensure you're importing from the correct path:

```typescript
// ✅ Correct
import { runDefaultAction } from "@fresh-schedules/repomix";

// ❌ Wrong
import { runDefaultAction } from "@fresh-schedules/repomix/dist/index";
```

## Architecture

```
┌─────────────────────────────────────────┐
│  fresh-root (root workspace)            │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  @fresh-schedules/repomix       │   │
│  │  (package/wrapper)              │   │
│  ├─────────────────────────────────┤   │
│  │  • CLI Entry: src/cli.ts         │   │
│  │  • Library: src/index.ts         │   │
│  │  • Dependencies: repomix@0.2.43  │   │
│  └─────────────────────────────────┘   │
│           ↓                              │
│  ┌─────────────────────────────────┐   │
│  │  repomix (npm dependency)       │   │
│  │  (core analysis tool)           │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Related Documentation

- [repomix GitHub](https://github.com/yamadashy/repomix)
- [repomix Documentation](https://repomix.com)
- [Fresh Schedules Codebase Guide](./)

## Version Information

- **@fresh-schedules/repomix**: v0.1.0
- **repomix (underlying)**: v0.2.43
- **Node requirement**: >=20.10.0
- **pnpm requirement**: >=9.0.0

---

Last Updated: December 11, 2025
