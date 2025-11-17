const fs = require('fs');
const p = 'reports/pnpm-outdated-latest.json';
if (!fs.existsSync(p)) { console.error('missing report', p); process.exit(1); }
const obj = JSON.parse(fs.readFileSync(p, 'utf8')) || {};
const rows = [['package','current','wanted','latest','type','workspace','homepage'].join(',')];
for (const [name, it] of Object.entries(obj)) {
  const cur = it.current || '';
  const wanted = it.wanted || '';
  const latest = it.latest || '';
  const type = it.dependencyType || it.type || '';
  const ws = it.workspace || it.path || '';
  const homepage = (it.latestInfo && it.latestInfo.homepage) || (it.packageJson && it.packageJson.homepage) || '';
  const esc = s => '"' + String(s).replace(/"/g, '""') + '"';
  rows.push([esc(name), esc(cur), esc(wanted), esc(latest), esc(type), esc(ws), esc(homepage)].join(','));
}
fs.writeFileSync('reports/migration-manifest.csv', rows.join('\n'));
console.log('wrote reports/migration-manifest.csv');

// Generate refactor plan
const lines = Object.entries(obj).map(([name,it])=>({name, current:it.current||'', wanted:it.wanted||'', latest:it.latest||'', type:it.dependencyType||it.type||''}));
const priorityKeywords=["next","react","firebase","firebase-admin","typescript","eslint","prettier","pnpm","vite","playwright","vitest","@tanstack","@react","@types","node"];
const core=[]; const dev=[]; for(const pck of lines){ const n=pck.name.toLowerCase(); if(priorityKeywords.some(k=>n.includes(k))) core.push(pck); else if((pck.type||'').toLowerCase().includes('dev')) dev.push(pck); else dev.push(pck);} 
let md = '# Refactor Plan (automated draft)\n\n## Summary\nThis draft identifies priority packages and recommended upgrade batches for v15 migration. Review and adjust before applying.\n\n## Core Priority Upgrades\n';
md += core.length ? core.map(p=>`- **${p.name}**: ${p.current} -> ${p.latest} (wanted: ${p.wanted})`).join('\n') + '\n' : '- None detected\n';
md += '\n## Dev / Secondary Upgrades\n'; md += dev.length ? dev.map(p=>`- ${p.name}: ${p.current} -> ${p.latest}`).join('\n') + '\n' : '- None detected\n';
md += '\n## Suggested Batches\n1. Dev tooling: eslint, prettier, typescript, vitest\n2. Core runtime libs: next, react, react-dom, firebase, firebase-admin\n3. Testing & e2e: playwright, test runners\n4. Remaining deps: low-risk updates\n\n## Notes\n- Run each batch in its own branch/PR. Use emulators and `pnpm -w typecheck` between batches.\n- When upgrading core runtime libs, run local emulators and integration tests.\n';
fs.writeFileSync('reports/refactor-plan.md', md);
console.log('wrote reports/refactor-plan.md');
