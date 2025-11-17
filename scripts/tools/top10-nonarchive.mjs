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

const scored = files.map((entry) => {
  const file = entry.path || entry.file || '<unknown>'
  const stats = entry.stats || {}
  const anyCast = stats.anyCast || 0
  const tsIgnore = stats.tsIgnore || 0
  const todo = stats.todo || 0
  const firestore = stats.firestore || 0
  const score = anyCast * 5 + tsIgnore * 4 + firestore * 3 + todo * 2
  return { file, anyCast, tsIgnore, todo, firestore, score }
})

// exclude archive/ files and node_modules, .git, public, and non-source files
const filtered = scored.filter(e => !e.file.startsWith('archive/') && !e.file.includes('node_modules') && !e.file.startsWith('.git') && /\.(ts|mts|cts|js|mjs|cjs|tsx|jsx)$/.test(e.file))

filtered.sort((a,b) => b.score - a.score || b.anyCast - a.anyCast)

const top10 = filtered.slice(0, 10)

const outDir = path.join(repoRoot, 'reports')
fs.writeFileSync(path.join(outDir, 'top10_nonarchive.json'), JSON.stringify(top10, null, 2))
console.log('Wrote reports/top10_nonarchive.json')
