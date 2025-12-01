#!/usr/bin/env node
// [P0][SECURITY][CODE] Migrate Org Patterns
// Tags: P0, SECURITY, CODE
// Convert patterns like withSecurity(requireOrgMembership(requireRole("manager")(async (req, context) => { ... })), { ...})
// into createOrgEndpoint({ roles: ['manager'], handler: async ({ request, context }) => { ... } })

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ROUTES_DIR = path.join(ROOT, 'apps/web/app/api');

function findRoutes() {
  const result = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) walk(path.join(dir, e.name));
      else if (e.isFile() && (e.name === 'route.ts' || e.name === 'route.tsx')) result.push(path.join(dir, e.name));
    }
  }
  walk(ROUTES_DIR);
  return result;
}

function findRequireRoleOptions(expr) {
  const roles = [];
  const regex = /requireRole\(\s*['"]([a-zA-Z0-9_\-]+)['"]\s*\)/g;
  let m;
  while ((m = regex.exec(expr)) !== null) roles.push(m[1]);
  return roles;
}

function findRequireOrg(expr) {
  return /requireOrgMembership\(/.test(expr) || /requireCompanyMembership\(/.test(expr);
}

function findHandlerSource(expr) {
  // find the last 'async (' and capture from there to matching '}' for block
  const asyncIdx = expr.lastIndexOf('async');
  if (asyncIdx === -1) return null;
  // find '(' after asyncIdx
  const parenIdx = expr.indexOf('(', asyncIdx);
  if (parenIdx === -1) return null;

  // find matching )
  let depth = 0,
    i = parenIdx;
  for (; i < expr.length; i++) {
    if (expr[i] === '(') depth++;
    else if (expr[i] === ')') {
      depth--;
      if (depth === 0) break;
    }
  }
  const paramsEnd = i; // index of )
  // Find '=>' after paramsEnd
  const arrowIdx = expr.indexOf('=>', paramsEnd);
  if (arrowIdx === -1) return null;
  // Find body start
  const bodyStart = expr.indexOf('{', arrowIdx);
  if (bodyStart === -1) return null;
  // find matching '}' for body
  let depth2 = 0;
  let j = bodyStart;
  for (; j < expr.length; j++) {
    if (expr[j] === '{') depth2++;
    else if (expr[j] === '}') {
      depth2--;
      if (depth2 === 0) break;
    }
  }
  const bodyEnd = j;
  return expr.slice(asyncIdx, bodyEnd + 1);
}

function convertFile(file) {
  let content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('withSecurity(')) return false;

  let modified = false;
  // For simplicity, search for withSecurity occurrences and attempt convert where requireOrgMembership exists
  let idx = 0;
  while ((idx = content.indexOf('withSecurity(', idx)) !== -1) {
    // find params start index after withSecurity(
    const open = content.indexOf('(', idx);
    const close = (function findClose(k) {
      let d = 0;
      for (let p = k; p < content.length; p++) {
        if (content[p] === '(') d++;
        else if (content[p] === ')') {
          d--;
          if (d === 0) return p;
        }
      }
      return -1;
    })(open + 1);
    if (close === -1) break;
    const inner = content.slice(open + 1, close); // everything between withSecurity( ... )
    // We expect inner is like 'requireOrgMembership(requireRole("manager")(async (...) => { ... })) , { options }
    // Find the comma separating handler and options
    const commaPos = (function findCommaAtTopLevel(s) {
      let depth = 0;
      for (let p = 0; p < s.length; p++) {
        if (s[p] === '(') depth++;
        else if (s[p] === ')') depth--;
        else if (s[p] === ',' && depth === 0) return p;
      }
      return -1;
    })(inner);
    if (commaPos === -1) { idx = close + 1; continue; }
    const midHandlerExpr = inner.slice(0, commaPos).trim();
    const optionsExpr = inner.slice(commaPos + 1).trim();

    // If optionsExpr starts with '{' and ends with '}' it's options; trim trailing ')' if present
    let optionsContent = optionsExpr;
    if (optionsContent.endsWith(')')) optionsContent = optionsContent.slice(0, optionsContent.length - 1);
    if (optionsContent.startsWith('{') && optionsContent.endsWith('}')) optionsContent = optionsContent.slice(1, -1);

    if (!findRequireOrg(midHandlerExpr)) { idx = close + 1; continue; }

    // Extract roles
    const roles = findRequireRoleOptions(midHandlerExpr);
    const handlerSrc = findHandlerSource(midHandlerExpr);
    if (!handlerSrc) { idx = close + 1; continue; }

    // Now compose new createOrgEndpoint call
    const roleStr = roles.length ? `roles: [${roles.map(r => `"${r}"`).join(', ')}],\n  ` : '';

    let handlerBody = handlerSrc.replace(/\breq\.(?=[a-zA-Z0-9_]+)/g, 'request.');
    handlerBody = handlerBody.replace(/context\.userId/g, 'context.auth?.userId');
    handlerBody = handlerBody.replace(/context\.orgId/g, 'context.org?.orgId');

    // assemble new endpoint
    const newEndpoint = `createOrgEndpoint({\n  ${roleStr}handler: async ({ request, input, context, params }) => ${handlerBody}\n})`;

    // Replace the original 'withSecurity(...' call with newEndpoint
    const replStart = idx;
    const replEnd = close + 1;
    content = content.slice(0, replStart) + newEndpoint + content.slice(replEnd);
    modified = true;
    idx = replStart + newEndpoint.length;
  }

  if (modified) {
    fs.writeFileSync(file + '.bakOrg', fs.readFileSync(file, 'utf-8'));
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Converted org membership patterns in', file);
  }
  return modified;
}

function main() {
  const routes = findRoutes();
  let migrated = 0;
  for (const r of routes) if (convertFile(r)) migrated++;
  console.log('Done', migrated, 'files with org membership converted');
}

main();
