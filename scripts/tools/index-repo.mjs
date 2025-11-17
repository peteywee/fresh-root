#!/usr/bin/env node
// [P0][APP][CODE] Index Repo
// Tags: P0, APP, CODE
import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const IGNORE = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.pnpm',
  'reports',
]);

function isBinary(file) {
  const binaryExt = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.zip', '.gz', '.tgz'];
  return binaryExt.includes(path.extname(file).toLowerCase());
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (IGNORE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (e.isFile()) {
      files.push(full);
    }
  }
  return files;
}

const PATTERNS = {
  todo: /TODO|FIXME|XXX/gi,
  anyCast: /\bas any\b|as any/gi,
  tsIgnore: /@ts-ignore|\/\*\s*@ts-ignore/gi,
  firestore: /\bfirestore\b|admin\.firestore|firebase\.firestore|getFirestore\(|collection\(|doc\(/gi,
  rulesTesting: /@firebase\/rules-unit-testing/gi,
  tests: /describe\(|it\(|test\(/gi,
};

function matches(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

function groupByType(file) {
  const ext = path.extname(file).toLowerCase();
  if (file.includes('.github/workflows') || ext === '.yml' || ext === '.yaml') return 'workflow';
  if (ext === '.md' || file.toLowerCase().includes('/docs/')) return 'docs';
  if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx' || ext === '.mts') return 'code';
  if (ext === '.json') return 'config';
  if (file.endsWith('firestore.rules') || file.endsWith('storage.rules')) return 'rules';
  if (file.startsWith(path.join(ROOT, 'scripts'))) return 'scripts';
  return 'other';
}

async function index() {
  const all = await walk(ROOT);
  const result = { files: [], summary: {} };
  const groupMap = {};
  for (const file of all) {
    const rel = path.relative(ROOT, file);
    if (rel.startsWith('reports') || rel.startsWith('archive/backups')) continue;
    if (isBinary(file)) continue;
    let text = '';
    try {
      text = await fs.readFile(file, 'utf8');
    } catch (e) {
      continue;
    }
    const entry = {
      path: rel,
      size: text.length,
      type: groupByType(file),
      stats: {},
    };
    for (const k of Object.keys(PATTERNS)) {
      entry.stats[k] = matches(text, PATTERNS[k]);
    }
    // package.json scripts
    if (rel === 'package.json') {
      try {
        const pj = JSON.parse(text);
        entry.scripts = Object.keys(pj.scripts || {}).sort();
      } catch (e) {}
    }
    result.files.push(entry);
    groupMap[entry.type] = groupMap[entry.type] || [];
    groupMap[entry.type].push(entry);
  }

  // summary counts
  const summary = {
    totalFiles: result.files.length,
    totals: {},
    topFiles: {},
  };
  for (const k of Object.keys(PATTERNS)) summary.totals[k] = 0;
  for (const f of result.files) {
    for (const k of Object.keys(PATTERNS)) summary.totals[k] += f.stats[k] || 0;
  }
  // top files per pattern
  for (const k of Object.keys(PATTERNS)) {
    const sorted = [...result.files].sort((a, b) => (b.stats[k] || 0) - (a.stats[k] || 0));
    summary.topFiles[k] = sorted.slice(0, 10).filter((e) => (e.stats[k] || 0) > 0).map((e) => ({ path: e.path, count: e.stats[k] }));
  }

  // write outputs
  const outDir = path.join(ROOT, 'reports');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'index.json'), JSON.stringify({ result, summary, groups: groupMap }, null, 2), 'utf8');

  // write group summaries markdown
  const md = [];
  md.push('# Repo Index — Groups');
  md.push(`Generated: ${new Date().toISOString()}`);
  for (const [group, files] of Object.entries(groupMap)) {
    md.push(`\n## ${group} (${files.length} files)`);
    files.slice(0, 200).forEach((f) => {
      md.push(`- ${f.path} — size=${f.size} — todos=${f.stats.todo || 0} any=${f.stats.anyCast || 0} firestore=${f.stats.firestore || 0}`);
    });
  }
  await fs.writeFile(path.join(outDir, 'index_by_group.md'), md.join('\n'), 'utf8');

  // docs index
  const docs = (groupMap.docs || []).map((f) => `- ${f.path} (todos=${f.stats.todo})`).join('\n');
  await fs.writeFile(path.join(outDir, 'index_docs.md'), `# Docs Index\n\n${docs}\n`, 'utf8');

  console.log('Wrote reports/index.json, index_by_group.md, index_docs.md');
}

index().catch((e) => { console.error(e); process.exit(1); });
