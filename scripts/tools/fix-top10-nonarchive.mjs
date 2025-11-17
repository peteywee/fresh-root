#!/usr/bin/env node
// [P2][APP][CODE] Fix Top10 Nonarchive
// Tags: P2, APP, CODE
import fs from 'fs'
import path from 'path'

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '../../..')
const listPath = path.join(repoRoot, 'reports', 'top10_nonarchive.json')
if (!fs.existsSync(listPath)) {
  console.error('reports/top10_nonarchive.json not found. Run scripts/tools/top10-nonarchive.mjs first.')
  process.exit(2)
}

const list = JSON.parse(fs.readFileSync(listPath, 'utf8'))
const changed = []

for (const item of list) {
  const relative = item.file
  const abs = path.join(repoRoot, relative)
  if (!fs.existsSync(abs)) {
    console.warn('File not found, skipping:', relative)
    continue
  }
  let src = fs.readFileSync(abs, 'utf8')
  let out = src

  // Replace ` as any` -> ` as unknown`
  out = out.replace(/\s+as\s+any\b/g, ' as unknown')
  // Replace <any> generics
  out = out.replace(/<any>/g, '<unknown>')
  // Convert single-line @ts-ignore to TODO comment
  out = out.replace(/\/\/\s*@ts-ignore(.*)$/gm, '// TODO: revisit ts-ignore:$1')
  // Convert block @ts-ignore comments
  out = out.replace(/\/\*\s*@ts-ignore\s*\*\//g, '/* TODO: revisit ts-ignore */')

  if (out !== src) {
    fs.writeFileSync(abs, out, 'utf8')
    changed.push(relative)
    console.log('Patched', relative)
  } else {
    console.log('No changes for', relative)
  }
}

console.log('\nPatched files count:', changed.length)
if (changed.length > 0) process.exit(0)
else process.exit(0)
