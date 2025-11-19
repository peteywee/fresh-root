#!/usr/bin/env node
// Adds a basic 'TEST SPEC' section to docs files that are missing it.
import { promises as fs } from 'node:fs';
import { globby } from 'globby';

async function main() {
  const docFiles = await globby(['docs/api/**/*.md', 'docs/schemas/**/*.md'], { gitignore: true });
  let count = 0;
  for (const f of docFiles) {
    const content = await fs.readFile(f, 'utf8');
    if (!/TEST SPEC/i.test(content)) {
      const testSpec = `\n\n## TEST SPEC\n\n- TODO: Add tests for this doc. Example: \`apps/web/app/api/onboarding/__tests__/onboarding-consolidated.test.ts\`\n`;
      await fs.writeFile(f, content + testSpec);
      console.log(`Updated: ${f}`);
      count++;
    }
  }
  console.log(`Done. Added TEST SPEC to ${count} files.`);
}

main().catch((err)=>{ console.error(err); process.exit(1); });
