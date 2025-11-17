#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '../../..')
const indexPath = path.join(repoRoot, 'reports', 'index.json')
if (!fs.existsSync(indexPath)) {
  console.error('reports/index.json not found. Run scripts/tools/index-repo.mjs first.')
  process.exit(2)
}

const raw = fs.readFileSync(indexPath, 'utf8')
let data
try { data = JSON.parse(raw) } catch (err) { console.error('Failed to parse index.json', err); process.exit(2) }

const files = Array.isArray(data.result && data.result.files) ? data.result.files : []

const patterns = {
  anyCast: { total: 0, files: [] },
  tsIgnore: { total: 0, files: [] },
  todo: { total: 0, files: [] },
  firestore: { total: 0, files: [] },
  rulesTesting: { total: 0, files: [] },
}

for (const entry of files) {
  const file = entry.path || entry.file || '<unknown>'
  const stats = entry.stats || {}
  if (stats.anyCast) { patterns.anyCast.total += stats.anyCast; patterns.anyCast.files.push({ file, count: stats.anyCast }) }
  if (stats.tsIgnore) { patterns.tsIgnore.total += stats.tsIgnore; patterns.tsIgnore.files.push({ file, count: stats.tsIgnore }) }
  if (stats.todo) { patterns.todo.total += stats.todo; patterns.todo.files.push({ file, count: stats.todo }) }
  if (stats.firestore) { patterns.firestore.total += stats.firestore; patterns.firestore.files.push({ file, count: stats.firestore }) }
  if (stats.rulesTesting) { patterns.rulesTesting.total += stats.rulesTesting; patterns.rulesTesting.files.push({ file, count: stats.rulesTesting }) }
}

const sortDesc = arr => arr.sort((a,b) => b.count - a.count)
for (const k of Object.keys(patterns)) {
  patterns[k].files = sortDesc(patterns[k].files)
  patterns[k].top10 = patterns[k].files.slice(0,10)
}

const outDir = path.join(repoRoot, 'reports')
fs.writeFileSync(path.join(outDir, 'patterns_summary.json'), JSON.stringify(patterns, null, 2))

const md = []
md.push('# Pattern Summary')
md.push('')
md.push('This report aggregates common patterns found by `scripts/tools/index-repo.mjs`.')
md.push('')
for (const k of Object.keys(patterns)) {
  md.push(`## ${k}`)
  md.push(`- Total occurrences: ${patterns[k].total}`)
  md.push('- Top 10 files:')
  md.push('')
  patterns[k].top10.forEach((f, i) => md.push(`${i+1}. ${f.file} — ${f.count}`))
  md.push('')
}

fs.writeFileSync(path.join(outDir, 'patterns_summary.md'), md.join('\n'))

console.log('Wrote reports/patterns_summary.json and patterns_summary.md')
