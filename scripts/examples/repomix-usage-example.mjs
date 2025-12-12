#!/usr/bin/env node

// [P2][UTIL][SCRIPT] Example repomix usage script
// Tags: P2, UTIL, SCRIPT, EXAMPLE

/**
 * Example usage of the @fresh-schedules/repomix package
 *
 * This script demonstrates both CLI and programmatic usage patterns
 */

import { runDefaultAction, setLogLevel, getVersion } from '@fresh-schedules/repomix';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

async function main() {
  console.log('\n🎯 Fresh Schedules Repomix Example\n');

  const version = await getVersion();
  console.log(`📦 Repomix Package Version: ${version}`);

  // Example 1: Analyze API framework package
  console.log('\n📊 Example 1: Analyzing API Framework Package...\n');

  try {
    await runDefaultAction(
      [resolve(process.cwd(), 'packages/api-framework')],
      process.cwd(),
      {
        output: {
          style: 'markdown',
          filePath: './repomix-output-api-framework.md'
        }
      }
    );

    console.log('✅ Analysis complete! Output saved to: repomix-output-api-framework.md\n');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`⚠️  Example 1 skipped: ${message}\n`);
  }

  // Example 2: Show how to use as library
  console.log('💡 Example 2: Library Usage\n');
  console.log(`
To use @fresh-schedules/repomix as a library in your code:

import { runDefaultAction } from '@fresh-schedules/repomix';

await runDefaultAction(
  ['./path/to/analyze'],        // directories
  process.cwd(),                 // working directory
  {
    output: {
      style: 'markdown',
      filePath: './output.md'
    },
    compress: true               // optional: compress for smaller output
  }
);
  `);

  // Example 3: Show CLI usage
  console.log('🖥️  Example 3: CLI Usage\n');
  console.log(`
Use the CLI from command line:

# Get help
pnpm repomix --help

# Analyze current directory as Markdown
pnpm repomix . --style markdown --output codebase.md

# Analyze with compression
pnpm repomix packages/api-framework --compress --output analysis.xml

# Analyze specific patterns
pnpm repomix . --include "src/**" --exclude "**/*.test.ts"
  `);

  console.log('✅ Examples complete!\n');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
