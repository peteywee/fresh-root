const fs=require('fs');
const path='reports/migration-manifest.csv';
if(!fs.existsSync(path)) { console.error('manifest missing'); process.exit(1); }
const csv=fs.readFileSync(path,'utf8').split(/\r?\n/).slice(1).filter(Boolean).map(l=>{
  const parts=l.match(/(?:"(.*?)")/g)?.map(s=>s.replace(/^"|"$/g,'').replace(/""/g,'"'))||[];
  return {name:parts[0], current:parts[1], wanted:parts[2], latest:parts[3], type:parts[4]};
});
const priority=['next','react','firebase','firebase-admin','typescript','eslint','prettier','pnpm','vite','playwright','vitest','node','@tanstack','@react'];
function major(v){ if(!v) return null; const m=v.split(/[.-]/)[0]; const n=m.replace(/[^0-9]/g,''); return n?Number(n):null; }
function riskFor(p){ const name=p.name.toLowerCase(); const cur=major(p.current); const lat=major(p.latest); const isCore = priority.some(k=>name.includes(k)); const isDev = (p.type||'').toLowerCase().includes('dev');
  if(cur===null && lat!==null) return 'medium';
  if(cur!==null && lat!==null && lat>cur) {
    if(lat>cur+0) {
      // major bump
      return isCore? 'high' : 'medium';
    }
  }
  if(isCore && !isDev && cur!==null && lat!==null && lat>cur) return 'medium';
  return 'low';
}
const rows=[['package','current','latest','type','risk','notes'].join(',')];
const notes=[];
for(const p of csv){ const r=riskFor(p); let note=''; if(r==='high'){ note='Major version change or core runtime package — test in emulators, upgrade in isolated branch.'; }
 if(r==='medium'){ note='Minor/patch or dev-tool update; run typecheck and lint after upgrade.'; }
 if(p.name.toLowerCase().includes('firebase-admin')) note+=' Check admin SDK API changes and service-account flows.';
 if(p.name.toLowerCase().includes('glob') && p.latest && p.latest.startsWith('11')) note+=' glob@11 introduces ESM-only changes — verify tooling imports (use glob@11 ESM API).';
 rows.push([`"${p.name}"`,`"${p.current}"`,`"${p.latest}"`,`"${p.type}"`,`"${r}"`,`"${note.trim()}"`].join(','));
}
fs.writeFileSync('reports/compatibility-matrix.csv', rows.join('\n'));
let md='# Compatibility Notes & Actions\n\n';
md += 'Generated compatibility matrix with risk classifications.\n\n';
md += '## High-risk packages (require isolated upgrade and tests)\n';
const high=csv.filter(p=>riskFor(p)==='high');
if(high.length) md+=high.map(p=>`- **${p.name}** (${p.current} -> ${p.latest}): test with emulators and integration tests`).join('\n')+"\n"; else md+="- None\n";
md += '\n## Medium-risk packages\n';
const med=csv.filter(p=>riskFor(p)==='medium');
if(med.length) md+=med.map(p=>`- ${p.name} (${p.current} -> ${p.latest})`).join('\n')+"\n"; else md+="- None\n";
md+='\n## Low-risk packages\n';
const low=csv.filter(p=>riskFor(p)==='low');
if(low.length) md+=low.map(p=>`- ${p.name} (${p.current} -> ${p.latest})`).join('\n')+"\n"; else md+="- None\n";
md+='\n## Suggested first batch\n- Dev tooling: TypeScript, ESLint, Prettier, Vitest, turbo\n\n## Suggested commands per batch\n';
md += '```\\n# example: update dev deps batch\\n';
md += 'pnpm -w add -D typescript@latest eslint@latest prettier@latest vitest@latest\\n';
md += 'pnpm -w install --frozen-lockfile\\n';
md += 'pnpm -w typecheck\\n';
md += 'pnpm -w lint --fix\\n';
md += '```\\n';
fs.writeFileSync('reports/compatibility-notes.md', md);
console.log('wrote reports/compatibility-matrix.csv and compatibility-notes.md');
