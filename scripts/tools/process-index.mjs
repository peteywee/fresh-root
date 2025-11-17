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

// Heuristic for "v15-compliant":
// - no explicit `as any` casts (anyCast === 0)
// - no `// @ts-ignore` usages (tsIgnore === 0)
// - no TODOs (todo === 0)
// - no direct Firestore API usage (firestore === 0)
// This is a conservative metric — adjust as needed.

const files = Array.isArray(data.result && data.result.files) ? data.result.files : []

let compliantCount = 0
const scored = files.map((entry) => {
  const file = entry.path || entry.file || '<unknown>'
  const stats = entry.stats || {}
  const anyCast = stats.anyCast || 0
  const tsIgnore = stats.tsIgnore || 0
  const todo = stats.todo || 0
  const firestore = stats.firestore || 0
  const score = anyCast * 5 + tsIgnore * 4 + firestore * 3 + todo * 2
  const compliant = anyCast === 0 && tsIgnore === 0 && todo === 0 && firestore === 0
  if (compliant) compliantCount++
  return { file, anyCast, tsIgnore, todo, firestore, score, compliant }
})

scored.sort((a,b) => b.score - a.score || b.anyCast - a.anyCast)

const top10 = scored.slice(0, 10)

const outDir = path.join(repoRoot, 'reports')
fs.writeFileSync(path.join(outDir, 'top10_offenders.json'), JSON.stringify(top10, null, 2))

const summary = {
  totalFilesIndexed: files.length,
  v15_compliant_files: compliantCount,
  top10_count: top10.length,
}

fs.writeFileSync(path.join(outDir, 'v15_summary.json'), JSON.stringify(summary, null, 2))

const md = []
md.push('# v15 Compliance Summary')
md.push('\n')
md.push(`- Total files indexed: ${summary.totalFilesIndexed}`)
md.push(`- Files that meet conservative v15 criteria: ${summary.v15_compliant_files}`)
md.push('\n')
md.push('## Top 10 Worst Offending Files (by weighted score)')
md.push('\n')
top10.forEach((e, i) => {
  md.push(`${i+1}. **${e.file}** — score: ${e.score} — anyCast: ${e.anyCast}, tsIgnore: ${e.tsIgnore}, firestore: ${e.firestore}, todo: ${e.todo}`)
})

fs.writeFileSync(path.join(outDir, 'v15_summary.md'), md.join('\n'))

console.log('Wrote reports/v15_summary.json, v15_summary.md, top10_offenders.json')
