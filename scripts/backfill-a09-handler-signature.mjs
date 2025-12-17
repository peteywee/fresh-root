#!/usr/bin/env node
// [P0][INFRA][TOOLING] A09 Handler Signature Backfill (Self-Deleting)
// Comprehensive pattern fixer for all handler destructuring variations
// Automatically deletes itself after successful completion

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function findRouteFiles(dir = path.join(ROOT, 'apps/web/app/api')) {
  const files = [];
  function walk(cur) {
    if (!fs.existsSync(cur)) return;
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name === 'route.ts') files.push(full);
    }
  }
  walk(dir);
  return files;
}

function fixHandler(content) {
  // Regex to find handler: async ({ ... }) => with any destructuring
  const handlerRegex = /handler:\s*async\s*\(\s*\{\s*([^}]*?)\s*\}\s*\)\s*=>/g;
  
  return content.replace(handlerRegex, (match, destructuring) => {
    const params = new Set(
      destructuring
        .split(',')
        .map(p => p.trim().split(':')[0].trim())
        .filter(p => p.length > 0)
    );
    
    // Required params in canonical order
    const required = ['request', 'input', 'context', 'params'];
    const added = [];
    
    for (const param of required) {
      if (!params.has(param) && !params.has(`${param}: _${param}`)) {
        // Only add as unused (_param) if not already present
        const existingParam = Array.from(params).find(p => p.startsWith(param));
        if (!existingParam) {
          added.push(`${param}: _${param}`);
        }
      }
    }
    
    // Reconstruct destructuring with added params at the end
    const allParams = destructuring.trim() 
      ? [destructuring.trim(), ...added].join(', ')
      : added.join(', ');
    
    return `handler: async ({ ${allParams} }) =>`;
  });
}

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  const original = content;
  
  content = fixHandler(content);
  
  const changed = content !== original;
  if (changed) {
    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`✓ ${path.relative(ROOT, filepath)}`);
  }
  
  return changed;
}

async function main() {
  const scriptPath = fileURLToPath(import.meta.url);
  const routes = findRouteFiles();
  let fixedCount = 0;
  
  console.log(`\n📝 A09 Handler Signature Backfill (Comprehensive)\n`);
  
  for (const route of routes) {
    if (fixFile(route)) fixedCount++;
  }
  
  console.log(`\n✅ Fixed ${fixedCount} route files\n`);
  
  // Self-delete after success
  console.log(`🧹 Cleaning up backfill script...\n`);
  try {
    fs.unlinkSync(scriptPath);
    console.log(`✓ Self-deleted: ${path.relative(ROOT, scriptPath)}\n`);
  } catch (err) {
    console.error(`⚠️  Failed to self-delete: ${err.message}\n`);
  }
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
