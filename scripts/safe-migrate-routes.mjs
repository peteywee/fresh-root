#!/usr/bin/env node
// [P0][SECURITY][CODE] Safe Route Migration
// Conservative conversion: only replaces 'export const <NAME> = withSecurity(handler, options);' patterns.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ROUTES_DIR = path.join(ROOT, 'apps/web/app/api');

function findRoutes(dir = ROUTES_DIR) {
  const routes = [];
  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (f === 'route.ts' || f === 'route.tsx') routes.push(full);
    }
  }
  walk(dir);
  return routes;
}

function replaceSimpleWithSecurity(content) {
  // Regex to match: export const NAME = withSecurity(async (req) => { ... }, { ... });
  // This regex is intentionally conservative: it matches only async arrow functions.
  const regex = /export\s+const\s+(\w+)\s*=\s*withSecurity\(\s*(async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\})\s*,\s*\{([\s\S]*?)\}\s*\)\s*;?/gm;

  let match;
  let out = content;
  let changes = 0;

  while ((match = regex.exec(content)) !== null) {
    const [full, name, handler, options] = match;
    // detect factory
    let factory = 'createAuthenticatedEndpoint';
    if (/requireAuth\s*:\s*false/.test(options)) factory = 'createPublicEndpoint';
    if (/requireRole|requireOrgMembership|roles\s*:\s*\[/.test(options)) factory = 'createOrgEndpoint';

    // Build config parts conservatively
    const rateMax = options.match(/maxRequests\s*:\s*(\d+)/)?.[1];
    const rateWin = options.match(/windowMs\s*:\s*(\d+)/)?.[1];
    const csrfFalse = /csrf\s*:\s*false/.test(options);
    const roles = options.match(/roles\s*:\s*\[([\s\S]*?)\]/)?.[1];

    const parts = [];
    if (rateMax || rateWin) parts.push(`rateLimit: { maxRequests: ${rateMax || 100}, windowMs: ${rateWin || 60000} }`);
    if (csrfFalse) parts.push('csrf: false');
    if (roles) parts.push(`roles: [${roles.trim()}]`);

    // Transform handler body: replace 'req.' -> 'request.' and 'context.userId' -> 'context.auth?.userId'
    let newHandler = handler.replace(/\breq\.(?=[a-zA-Z0-9_]+)/g, 'request.').replace(/context\.userId/g, 'context.auth?.userId');

    const configStr = parts.length ? `${parts.join(',\n  ')},\n  ` : '';
    const replacement = `export const ${name} = ${factory}({\n  ${configStr}handler: async ({ request, input, context, params }) => ${newHandler}\n});`;

    out = out.replace(full, replacement);
    changes++;
  }

  return { out, changes };
}

function main() {
  const routes = findRoutes();
  console.log('Found', routes.length, 'routes');

  let changed = 0;
  for (const r of routes) {
    const src = fs.readFileSync(r, 'utf-8');
    const { out, changes } = replaceSimpleWithSecurity(src);
    if (changes > 0) {
      fs.writeFileSync(r + '.bak', src, 'utf-8');
      fs.writeFileSync(r, out, 'utf-8');
      console.log(`Converted ${r} (${changes} replacements)`);
      changed += changes;
    }
  }

  console.log(`Done - ${changed} replacements`);
}

main();
