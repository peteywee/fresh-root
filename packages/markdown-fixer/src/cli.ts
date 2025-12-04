#!/usr/bin/env node
import { program } from "commander";
import fs from "fs";
import path from "path";

import { fixFiles } from "./fixer";

program
  .name("markdown-fixer")
  .description("Fix common markdown issues in files or directories")
  .option("-f, --fix", "apply fixes (otherwise dry run)")
  .argument("<paths...>", "files or directories to process")
  .action(async (paths: string[], options: { fix: boolean }) => {
    const targets: string[] = [];
    for (const p of paths) {
      const absolute = path.resolve(p);
      if (fs.existsSync(absolute)) {
        const stats = fs.statSync(absolute);
        if (stats.isDirectory()) {
          const all = fs.readdirSync(absolute);
          for (const f of all) {
            if (f.endsWith(".md") || f.endsWith(".markdown")) targets.push(path.join(absolute, f));
          }
        } else if (stats.isFile()) {
          targets.push(absolute);
        }
      } else {
        console.error(`Path not found: ${absolute}`);
      }
    }

    for (const t of targets) {
      const raw = fs.readFileSync(t, "utf8");
      const { content: fixed, changed } = await fixFiles(raw);
      if (!changed) {
        console.log(`No changes: ${t}`);
        continue;
      }
      if (options.fix) {
        fs.writeFileSync(t, fixed, "utf8");
        console.log(`Fixed ${t}`);
      } else {
        console.log(`Would fix ${t}`);
      }
    }
  });

program.parse(process.argv);
