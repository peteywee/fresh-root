#!/usr/bin/env node
// [P2][APP][CODE] Cli
// Tags: P2, APP, CODE
import { program } from "commander";
import fs from "fs";
import path from "path";

import { fixFiles } from "./fixer";

if (!program) {
  console.error(
    "CLI dependency 'commander' is missing. Install package dependencies (pnpm -w install) and try again.",
  );
  process.exit(1);
}
program
  .name("markdown-fixer")
  .description("Fix common markdown issues in files or directories")
  .option("-f, --fix", "apply fixes (otherwise dry run)")
  .option("-v, --verbose", "verbose logging for diagnostics")
  .argument("<paths...>", "files or directories to process")
  .action(async (paths: string[], options: { fix: boolean; verbose?: boolean }) => {
    const targets: string[] = [];
    const excludeDirs = new Set(["node_modules", ".next", "dist"]);
    const { collectMarkdownFiles } = await import("./fsHelpers");
    // Resolve paths from the original cwd, not the package directory
    const cwd = process.env.npm_config_local_prefix || process.env.INIT_CWD || process.cwd();
    const root = path.resolve(cwd);
    for (const p of paths) {
      const absolute = path.isAbsolute(p) ? path.normalize(p) : path.resolve(cwd, p);
      if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
        console.error(`Path outside working directory: ${absolute}`);
        continue;
      }
      if (fs.existsSync(absolute)) {
        const stats = fs.statSync(absolute);
        if (stats.isDirectory()) {
          collectMarkdownFiles(absolute, excludeDirs).forEach((f) => targets.push(f));
        } else if (stats.isFile()) {
          targets.push(absolute);
        }
      } else {
        console.error(`Path not found: ${absolute}`);
      }
    }

    for (const t of targets) {
      try {
        const raw = fs.readFileSync(t, "utf8");
        const { content: fixed, changed } = await fixFiles(raw);
        if (!changed) {
          console.log(`No changes: ${t}`);
          continue;
        }
        if (options.verbose) {
          console.log(`\n--- Diff for ${t} ---`);
          const before = raw.split("\n");
          const after = fixed.split("\n");
          // print first N lines where they differ
          let printed = 0;
          for (let i = 0; i < Math.max(before.length, after.length); i++) {
            const b = before[i] ?? "";
            const a = after[i] ?? "";
            if (b !== a && printed < 20) {
              console.log(`- ${b}`);
              console.log(`+ ${a}`);
              printed++;
            }
            if (printed >= 20) break;
          }
          console.log("--- End diff ---\n");
        }
        if (options.fix) {
          fs.writeFileSync(t, fixed, "utf8");
          console.log(`Fixed ${t}`);
        } else {
          console.log(`Would fix ${t}`);
        }
      } catch (err) {
        console.error(`Error processing ${t}:`, err instanceof Error ? err.message : String(err));
        if (options.verbose) console.error(err);
      }
    }
  });

program.parse(process.argv);
