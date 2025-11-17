#!/usr/bin/env node
// [P2][APP][CODE] Fix Runtime Anys
// Tags: P2, APP, CODE
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

const isRuntimeSource = (p) => {
  if (!p) return false
  // exclude archive, docs, tests, __tests__, and hidden dirs
  const lower = p.toLowerCase()
  if (lower.startsWith('archive/') || lower.includes('/archive/') ) return false
  if (lower.startsWith('docs/') || lower.includes('/docs/')) return false
  if (lower.includes('/tests/') || lower.includes('/__tests__/') || /\.test\.|\.spec\./i.test(p)) return false
  if (lower.endsWith('.md') || lower.endsWith('.json')) return false
  // only source code extensions
  return /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(p)
}

const candidates = files.map(e => e.path || e.file).filter(Boolean).filter(isRuntimeSource)

const changed = []
for (const relative of candidates) {
  const abs = path.join(repoRoot, relative)
  if (!fs.existsSync(abs)) continue
  let src = fs.readFileSync(abs, 'utf8')
  let out = src

  // Conservative replacements
  out = out.replace(/\s+as\s+any\b/g, ' as unknown')
  out = out.replace(/<any>/g, '<unknown>')
  out = out.replace(/\/\/\s*@ts-ignore(.*)$/gm, '// TODO: revisit ts-ignore:$1')
  out = out.replace(/\/\*\s*@ts-ignore\s*\*\//g, '/* TODO: revisit ts-ignore */')

  if (out !== src) {
    fs.writeFileSync(abs, out, 'utf8')
    changed.push(relative)
    console.log('Patched', relative)
  }
}

const outDir = path.join(repoRoot, 'reports')
fs.writeFileSync(path.join(outDir, 'runtime_anys_fixed.json'), JSON.stringify({ patched: changed.length, files: changed }, null, 2))
console.log(`Patched ${changed.length} files. Wrote reports/runtime_anys_fixed.json`)
