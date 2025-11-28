// [P2][APP][ENV] Cleanup Iac Configs
// Tags: P2, APP, ENV
// scripts/cleanup-iac-configs.mjs
// One-time script to remove stale @iac-fresh config deps from the root package.json.

import fs from "fs";
import path from "path";

const pkgPath = path.join(process.cwd(), "package.json");
if (!fs.existsSync(pkgPath)) {
  console.error("package.json not found at", pkgPath);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const targets = [
  "@iac-fresh/eslint-config",
  "@iac-fresh/prettier-config",
];

let changed = false;

function strip(field) {
  if (!pkg[field]) return;
  for (const name of targets) {
    if (pkg[field][name]) {
      console.log(`Removing ${name} from ${field}`);
      delete pkg[field][name];
      changed = true;
    }
  }
}

strip("dependencies");
strip("devDependencies");
strip("optionalDependencies");
strip("peerDependencies");

if (changed) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  console.log("✅ package.json updated");
} else {
  console.log("No @iac-fresh deps found in package.json");
}
