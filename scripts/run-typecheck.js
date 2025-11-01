#!/usr/bin/env node
const { spawnSync } = require("child_process");
const { resolve } = require("path");
const { readdirSync, statSync } = require("fs");

function findTsconfigs(dir) {
  const results = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try {
      entries = readdirSync(cur);
    } catch (e) {
      continue;
    }
    if (entries.includes("tsconfig.json")) {
      // skip empty tsconfig.json files (some scaffolds create placeholder files)
      try {
        const cfg = require("fs")
          .readFileSync(require("path").resolve(cur, "tsconfig.json"), "utf8")
          .trim();
        if (!cfg) {
          // don't add an empty config
        } else {
          results.push(cur);
        }
      } catch (e) {
        // ignore read errors and continue
      }
      // continue searching deeper so package-level tsconfigs are also found
    }
    for (const e of entries) {
      if (e === "node_modules" || e === ".git") continue;
      const p = resolve(cur, e);
      let st;
      try {
        st = statSync(p);
      } catch (err) {
        continue;
      }
      if (st.isDirectory()) stack.push(p);
    }
  }
  return results;
}

const root = resolve(__dirname, "..");
const tsconfigs = findTsconfigs(root);
if (!tsconfigs.length) {
  console.log("No tsconfig.json files found.");
  process.exit(0);
}

// Resolve the tsc binary inside the workspace's node_modules
let tscBin;
try {
  tscBin = require.resolve("typescript/bin/tsc", { paths: [root] });
} catch (err) {
  console.error(
    "Could not resolve tsc. Make sure TypeScript is installed in the workspace devDependencies.",
  );
  process.exit(2);
}

let failed = false;
for (const dir of tsconfigs) {
  console.log(`Typechecking ${dir}`);
  const res = spawnSync(process.execPath, [tscBin, "-p", dir, "--noEmit"], { stdio: "inherit" });
  if (res.status !== 0) failed = true;
}
process.exit(failed ? 1 : 0);
