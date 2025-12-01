#!/usr/bin/env node
// [P0][SECURITY][CODE] Complete Route Migration
// Enhanced conversion script that handles nested wrappers (withRequestLogging, withSecurity) and converts to SDK factories.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ROUTES_DIR = path.join(ROOT, 'apps/web/app/api');

function findAllWithSecurityFiles(dir = ROUTES_DIR) {
  const files = [];

  function walk(cur) {
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && (e.name === 'route.ts' || e.name === 'route.tsx')) {
        const content = fs.readFileSync(full, 'utf-8');
        if (content.includes('withSecurity(')) files.push(full);
      }
    }
  }

  walk(dir);
  return files;
}

// Helper: find matching closing bracket for start position (parens or braces)
function findMatching(content, start, openChar, closeChar) {
  let depth = 0;
  for (let i = start; i < content.length; i++) {
    if (content[i] === openChar) depth++;
    else if (content[i] === closeChar) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function detectFactoryFromOptions(options) {
  if (!options) return 'createAuthenticatedEndpoint';
  if (/requireOrgMembership|requireRole|roles\s*:/.test(options)) return 'createOrgEndpoint';
  if (/requireAuth\s*:\s*false/.test(options)) return 'createPublicEndpoint';
  if (/requireAuth\s*:\s*true/.test(options)) return 'createAuthenticatedEndpoint';
  // default to auth
  return 'createAuthenticatedEndpoint';
}

function buildConfigFromOptions(options) {
  const configParts = [];

  if (!options || options.trim().length === 0) return configParts;

  // Extract rate limit
  const maxMatch = options.match(/maxRequests\s*:\s*(\d+)/);
  const windowMatch = options.match(/windowMs\s*:\s*(\d+)/);
  if (maxMatch || windowMatch) {
    const maxRequests = maxMatch ? maxMatch[1] : '100';
    const windowMs = windowMatch ? windowMatch[1] : '60000';
    configParts.push(`rateLimit: { maxRequests: ${maxRequests}, windowMs: ${windowMs} }`);
  }

  // csrf (explicit false)
  const csrfFalse = /csrf\s*:\s*false/.test(options);
  if (csrfFalse) configParts.push('csrf: false');

  // roles
  const rolesMatch = options.match(/roles\s*:\s*\[([\s\S]*?)\]/);
  if (rolesMatch) {
    const roleList = rolesMatch[1].trim();
    configParts.push(`roles: [${roleList}]`);
  }

  return configParts;
}

function replaceReqWithRequest(handlerBody) {
  // Replace 'req.' with 'request.' but don't replace 'require' words.
  // Use a heuristic to replace occurrences of 'req.' and 'req[' which are property accesses.
  return handlerBody.replace(/\breq\.(?=[a-zA-Z0-9_]+)/g, 'request.').replace(/\breq\s*\[/g, 'request[');
}

function replaceContextUserId(handlerBody) {
  // Replace 'context.userId' with 'context.auth?.userId'
  return handlerBody.replace(/context\.userId/g, 'context.auth?.userId');
}

function convertFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  if (!content.includes('withSecurity(')) return false;

  let newContent = content;
  let changed = false;

  // We'll find occurrences of withSecurity across file. For each, locate surrounding wrapper nesting.
  let idx = 0;
  while ((idx = newContent.indexOf('withSecurity(', idx)) !== -1) {
    // find opening paren position
    const openPos = newContent.indexOf('(', idx + 'withSecurity'.length);
    if (openPos === -1) break;

    // First arg: handler - could be an async function expression. We need to find the end of the function.
    // We assume the handler is either an arrow function: async (args) => { ... } or function-block.
    // Find the end of the first arg (the function) by balancing parens from 'async (' or '(' etc.

    // find 'async' preceding the '(' or find '(' following, to locate function parameters start
    const asyncIdx = newContent.lastIndexOf('async', openPos);
    let paramsStart = openPos + 1; // fallback
    if (asyncIdx !== -1 && asyncIdx < openPos) {
      // find '(' after asyncIdx
      const parenIdx = newContent.indexOf('(', asyncIdx);
      if (parenIdx !== -1 && parenIdx > asyncIdx) paramsStart = parenIdx;
    } else {
      // not async: might be (req) => ... or (req) => or function()
      const parenIdx = newContent.indexOf('(', openPos);
      paramsStart = parenIdx;
    }

    if (paramsStart === -1) break;

    // find the matching ) for the function params
    const paramsEnd = findMatching(newContent, paramsStart, '(', ')');
    if (paramsEnd === -1) break;

    // after paramsEnd, there should be '=>' for arrow, then block starting with '{'
    const arrowIdx = newContent.indexOf('=>', paramsEnd);
    if (arrowIdx === -1) {
      console.log(`  ⚠️  Skipping complex handler (no arrow) in ${filepath}`);
      idx = openPos + 1;
      continue;
    }

    // handler body start: find '{' after arrowIdx
    const bodyStart = newContent.indexOf('{', arrowIdx);
    if (bodyStart === -1) break;
    const bodyEnd = findMatching(newContent, bodyStart, '{', '}');
    if (bodyEnd === -1) break;

    const handlerSource = newContent.slice(asyncIdx, bodyEnd + 1);

    // Now find comma after handler function to get options
    const afterHandlerIdx = bodyEnd + 1;
    // skip whitespace
    let commaIdx = afterHandlerIdx;
    while (/[\s;\n\r]/.test(newContent[commaIdx])) commaIdx++;
    if (newContent[commaIdx] !== ',') {
      // No options supplied? withSecurity(handler) only
      // Options = empty
      commaIdx = -1;
    }

    let optionsSource = '';
    let callEnd = -1;

    if (commaIdx !== -1) {
      // find options object start
      let optionsStart = newContent.indexOf('{', commaIdx);
      if (optionsStart === -1) {
        // options might be inline variable; find the end of the argument by finding the matching ) after comma
        const parenEnd = findMatching(newContent, openPos + 1, '(', ')');
        callEnd = newContent.indexOf(')', parenEnd);
        optionsSource = newContent.slice(commaIdx + 1, callEnd).trim();
      } else {
        const optionsEnd = findMatching(newContent, optionsStart, '{', '}');
        optionsSource = newContent.slice(optionsStart + 1, optionsEnd).trim();
        // find closing paren for withSecurity
        let p = optionsEnd + 1;
        while (p < newContent.length && newContent[p] !== ')') p++;
        callEnd = p;
      }
    } else {
      // no comma/options
      // find closing paren for the function call: ) after the handler's body
      let p = bodyEnd + 1;
      while (p < newContent.length && newContent[p] !== ')') p++;
      callEnd = p;
    }

    if (callEnd === -1) break;

    // Determine factory and config
    const factory = detectFactoryFromOptions(optionsSource);
    const configParts = buildConfigFromOptions(optionsSource);

    // Build new handler code: wrap inside a handler: async ({ request, input, context, params }) => { ... }
    const newHandlerBody = replaceReqWithRequest(handlerSource);
    const newHandlerBody2 = replaceContextUserId(newHandlerBody);

    // We must clean trailing 'async ' prefix if needed
    const strippedHandler = newHandlerBody2.replace(/^async\s*/,'').trim();

    const configStr = configParts.length > 0 ? `${configParts.join(',\n  ')},\n  ` : '';

    const newExport = `(${newContent.slice(idx, newContent.indexOf('=', idx))} = ${factory}({\n  ${configStr}handler: async ({ request, input, context, params }) => ${strippedHandler}\n}));`;

    // Replace the withSecurity(...) expression with newExport - carefull: we only want to replace the expression starting at idx up to callEnd
    const replaceStart = idx;
    const replaceEnd = callEnd + 1; // include closing paren
    newContent = newContent.slice(0, replaceStart) + newExport + newContent.slice(replaceEnd);

    changed = true;

    // move idx forward
    idx = replaceStart + newExport.length;
  }

  if (!changed) return false;

  // Now fix imports: remove withSecurity import and add required SDK imports
  // Remove the withSecurity import line completely
  newContent = newContent.replace(/import\s*\{[^}]*\bwithSecurity\b[^}]*\}\s*from\s*['\"]\.\.\/\/_shared\/middleware['\"];?\n/g, '');

  // Add factory import if not present
  const factorySet = new Set();
  if (newContent.includes('createAuthenticatedEndpoint(')) factorySet.add('createAuthenticatedEndpoint');
  if (newContent.includes('createOrgEndpoint(')) factorySet.add('createOrgEndpoint');
  if (newContent.includes('createPublicEndpoint(')) factorySet.add('createPublicEndpoint');
  if (!factorySet.size) factorySet.add('createAuthenticatedEndpoint');

  const existingSdkImport = newContent.match(/import\s*\{([^}]*)\}\s*from\s*['\"]@fresh-schedules\/api-framework['\"];?/);
  if (existingSdkImport) {
    // augment list
    const current = existingSdkImport[1].split(',').map(s=>s.trim()).filter(Boolean);
    const need = Array.from(factorySet).filter(f=>!current.includes(f));
    if (need.length) {
      const newList = current.concat(need).join(', ');
      newContent = newContent.replace(existingSdkImport[0], `import { ${newList} } from "@fresh-schedules/api-framework";`);
    }
  } else {
    // insert after last import
    const lastImportIdx = newContent.lastIndexOf('import ');
    const insertIdx = newContent.indexOf('\n', lastImportIdx);
    const importLine = `import { ${Array.from(factorySet).join(', ')} } from "@fresh-schedules/api-framework";\n`;
    newContent = newContent.slice(0, insertIdx+1) + importLine + newContent.slice(insertIdx+1);
  }

  // Backup the original file
  fs.writeFileSync(filepath + '.bak', content, 'utf-8');
  fs.writeFileSync(filepath, newContent, 'utf-8');
  console.log(`  ✅ Converted: ${filepath}`);
  return true;
}

function main() {
  const files = findAllWithSecurityFiles();
  console.log('Found', files.length, 'files with withSecurity');

  let migrated = 0;
  for (const f of files) {
    try {
      const ok = convertFile(f);
      if (ok) migrated++;
    } catch (err) {
      console.error('Error converting', f, err);
    }
  }

  console.log(`\nMigration complete: ${migrated} modified, ${files.length - migrated} unchanged`);
}

main();
