#!/usr/bin/env node

// [P1][LIBRARY][CODE] Repomix CLI wrapper for Fresh Schedules
// Tags: P1, LIBRARY, CODE, CLI

/**
 * CLI wrapper for repomix
 *
 * This CLI provides convenient access to repomix functionality
 * with Fresh Schedules branding.
 *
 * @example
 * ```bash
 * repomix /path/to/code --style markdown
 * repomix https://github.com/user/repo --compress
 * ```
 */

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Fresh Schedules Repomix CLI v0.1.0

Usage:
  repomix <path-or-repo> [options]

Arguments:
  <path-or-repo>    Local directory path or GitHub repository URL

Options:
  --style <format>        Output format: xml (default), markdown, plain
  --ignore <patterns>     Patterns to ignore (comma-separated)
  --include <patterns>    Patterns to include (comma-separated)
  --output <path>        Output file path
  --compress             Enable compression
  -h, --help            Show this help message
  -v, --version         Show version

Examples:
  repomix /path/to/code
  repomix /path/to/code --style markdown --output result.md
  repomix user/repo --compress

For more information, visit: https://github.com/yamadashy/repomix
    `);
    process.exit(0);
  }

  if (args[0] === "--version" || args[0] === "-v") {
    console.log("Fresh Schedules Repomix v0.1.0 (using repomix 0.2.43)");
    process.exit(0);
  }

  try {
    // Use repomix's runDefaultAction for CLI execution
    const { runDefaultAction } = await import("repomix");

    // Parse arguments - first arg is the target
    const target = args[0];

    if (!target) {
      console.error("Error: Please provide a target directory or repository");
      process.exit(1);
    }

    const cliOptions = parseCliArgs(args.slice(1));

    console.log(`\n📦 Running repomix on: ${target}\n`);

    // Call repomix with proper arguments
    await runDefaultAction([target], process.cwd(), cliOptions as Record<string, unknown>);

    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`\n❌ Error: ${message}`);
    console.error("\nFor help, run: repomix --help");
    process.exit(1);
  }
}

/**
 * Parse CLI arguments into repomix options
 */
function parseCliArgs(args: string[]): Record<string, unknown> {
  const options: Record<string, unknown> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--style" && i + 1 < args.length) {
      options.style = args[++i];
    } else if (arg === "--output" && i + 1 < args.length) {
      options.output = args[++i];
    } else if (arg === "--ignore" && i + 1 < args.length) {
      options.ignore = args[++i];
    } else if (arg === "--include" && i + 1 < args.length) {
      options.include = args[++i];
    } else if (arg === "--compress") {
      options.compress = true;
    }
  }

  return options;
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
