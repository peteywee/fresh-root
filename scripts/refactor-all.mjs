#!/usr/bin/env node
// [P2][APP][CODE] Refactor All
// Tags: P2, APP, CODE
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// --- CONFIGURATION ---
const FILE_PATTERNS = ["apps/**/*.ts", "apps/**/*.tsx", "packages/**/*.ts", "firestore.rules"];
const EXCLUDE_PATTERNS = ["**/node_modules/**", "**/.next/**", "**/dist/**"];
const OUTPUT_FILE = "refactor-plan.md";
// ---------------------

console.log("Generating refactoring plan...");

const files = execSync("git ls-files", { encoding: "utf-8" })
  .split("\n")
  .filter((file) => {
    if (!file) return false;
    if (EXCLUDE_PATTERNS.some((p) => file.includes(p.replace(/\*\*/g, "")))) return false;
    return FILE_PATTERNS.some((p) => new RegExp(p.replace(/\*\*/g, ".*")).test(file));
  });

if (files.length === 0) {
  console.log("No files found to refactor. Exiting.");
  process.exit(0);
}

const plan = [
  `# Automated Refactoring Plan`,
  `**Generated:** ${new Date().toISOString()}`,
  `**Files to Process:** ${files.length}`,
  "---",
  "This plan contains a series of prompts to run with the `Refactor Compliance Agent` in VS Code. Copy each prompt into the chat window to get the compliant version of the file.",
  "",
];

for (const file of files) {
  const fileContent = fs.readFileSync(file, "utf-8");
  const prompt = `Refactor this file to be 100% compliant with all project standards.\n\n**File Path:** \`${file}\`\n\n**File Content:**\n\`\`\`typescript\n${fileContent}\n\`\`\``;

  plan.push(`## Refactor: ${file}`);
  plan.push("**Copy the following prompt and run it with the `Refactor Compliance Agent`:**");
  plan.push("markdown");
  plan.push(prompt);
  plan.push("");
  plan.push("");
}

fs.writeFileSync(OUTPUT_FILE, plan.join("\n"));

console.log(`\n✅ Refactoring plan generated successfully!`);
console.log(`See \`${OUTPUT_FILE}\` for the full list of prompts.`);

EOF;
