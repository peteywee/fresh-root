#!/usr/bin/env node
// [P2][APP][CODE] Scaffold From Template
// Tags: P2, APP, CODE
/**
 * [MEDIUM][INFRA][GEN]
 * Tags: scaffolding, templates, codegen
 * Generate a new file from a template in docs/templates.
 * Usage:
 *   node scripts/gen/scaffold-from-template.mjs TemplateName OUT_PATH "Name=Foo" "Owner=platform"
 */
import fs from "node:fs";
import path from "node:path";

const [, , templateName, outPath, ...kv] = process.argv;
if (!templateName || !outPath) {
  console.error("Usage: scaffold-from-template.mjs <TemplateName> <OUT_PATH> [Key=Val]...");
  process.exit(1);
}

const tplFile = path.join("docs", "templates", `${templateName}.md`);
if (!fs.existsSync(tplFile)) {
  console.error(`Template not found: ${tplFile}`);
  process.exit(1);
}
const dict = Object.fromEntries(kv.map(p => p.split("=")));

let content = fs.readFileSync(tplFile, "utf8");
content = content.replace(/\$\{([A-Za-z0-9_]+)\}/g, (_, k) => dict[k] ?? "");

const outAbs = path.resolve(outPath);
fs.mkdirSync(path.dirname(outAbs), { recursive: true });
fs.writeFileSync(outAbs, content);
console.log(`Wrote ${outAbs}`);
