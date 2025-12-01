#!/usr/bin/env node
// [P1][OBSERVABILITY][LOGGING] Replace Request Logging
// Tags: P1, OBSERVABILITY, LOGGING
// Replace "withRequestLogging(withSecurity(handler, options))" with "createXEndpoint({ handler: async (...) => { console.info('[REQUEST]', ...); return original handler; }, ...})"

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ROUTES_DIR = path.join(ROOT, 'apps/web/app/api');

function findFiles() {
  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && (e.name === 'route.ts' || e.name === 'route.tsx')) {
        const c = fs.readFileSync(full, 'utf-8');
        if (c.includes('withRequestLogging(') && c.includes('withSecurity(')) files.push(full);
      }
    }
  }
  walk(ROUTES_DIR);
  return files;
}

function convertFile(pathname) {
  const src = fs.readFileSync(pathname, 'utf8');
  let out = src;
  // Match withRequestLogging(withSecurity(<handler>, { ... }))
  const regex = /withRequestLogging\(\s*withSecurity\(\s*(async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\})\s*,\s*\{([\s\S]*?)\}\s*\)\s*\)/gm;
  let m;
  let changes = 0;
  while ((m = regex.exec(src)) !== null) {
    const [full, handler, options] = m;
    // Determine factory
    let factory = 'createAuthenticatedEndpoint';
    if (/requireAuth\s*:\s*false/.test(options)) factory = 'createPublicEndpoint';
    if (/requireRole|requireOrgMembership|roles\s*:\s*\[/.test(options)) factory = 'createOrgEndpoint';

    // We'll inline a logging statement at top of handler
    // Remove 'async ' prefix from handler if present
    let newHandler = handler.replace(/\breq\./g, 'request.');
    // Insert a logging line after the opening '{'
    newHandler = newHandler.replace(/\{\s*/, '{\n      console.info("[REQUEST]", { method: request.method, path: new URL(request.url).pathname, requestId: context?.requestId || "unknown" });\n');

    const parts = [];
    const maxMatch = options.match(/maxRequests\s*:\s*(\d+)/);
    const winMatch = options.match(/windowMs\s*:\s*(\d+)/);
    if (maxMatch || winMatch) parts.push(`rateLimit: { maxRequests: ${maxMatch ? maxMatch[1] : 100}, windowMs: ${winMatch ? winMatch[1] : 60000} }`);
    if (/csrf\s*:\s*false/.test(options)) parts.push('csrf: false');
    const rolesMatch = options.match(/roles\s*:\s*\[([\s\S]*?)\]/);
    if (rolesMatch) parts.push(`roles: [${rolesMatch[1].trim()}]`);

    const config = parts.length ? parts.join(',\n  ') + ',\n  ' : '';
    const replacement = `${factory}({\n  ${config}handler: async ({ request, input, context, params }) => ${newHandler}\n})`;

    out = out.replace(full, replacement);
    changes++;
  }

  if (changes > 0) {
    fs.writeFileSync(pathname + '.bak2', src, 'utf-8');
    fs.writeFileSync(pathname, out, 'utf-8');
    console.log('Converted', pathname, `(${changes} replacements)`);
  }
}

function main() {
  const files = findFiles();
  console.log('Found', files.length, 'files with nested logging wrappers');
  for (const f of files) {
    convertFile(f);
  }
}

main();
