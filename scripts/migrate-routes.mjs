#!/usr/bin/env node
// [P0][SECURITY][CODE] Migrate Routes
// Tags: P0, SECURITY, CODE
/**
 * Route Migration Service Worker
 * Automates the conversion of withSecurity pattern to SDK factories
 * 
 * Usage: node scripts/migrate-routes.mjs [--routes=route1,route2 | --all]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ROUTES_DIR = path.join(ROOT, 'apps/web/app/api');

/**
 * Determine which SDK factory to use based on auth patterns
 */
function detectFactory(content) {
  const hasRequireAuth = /requireAuth\s*[:=]\s*true|requireAuth\s*\(/.test(content);
  const hasRequireOrgMembership = /requireOrgMembership/.test(content);
  const hasRequireRole = /requireRole/.test(content);
  const hasRequire2FA = /require2FA\s*[:=]\s*true|require2FA\s*\(/.test(content);

  if (hasRequire2FA) return 'createAdminEndpoint'; // or special 2FA handler
  if (hasRequireRole || hasRequireOrgMembership) return 'createAuthenticatedEndpoint';
  if (hasRequireAuth) return 'createAuthenticatedEndpoint';
  return 'createPublicEndpoint';
}

/**
 * Extract auth level from withSecurity options
 */
function extractAuthConfig(content) {
  const match = content.match(/withSecurity\(\s*(?:.*?),\s*\{\s*([\s\S]*?)\s*\}\s*\)/);
  if (!match) return {};

  const options = match[1];
  const config = {};

  if (/requireAuth\s*[:=]\s*true/.test(options)) config.requireAuth = true;
  if (/require2FA\s*[:=]\s*true/.test(options)) config.require2FA = true;

  // Extract rate limit
  const rateLimitMatch = options.match(/maxRequests\s*[:=]\s*(\d+)|windowMs\s*[:=]\s*(\d+)/g);
  if (rateLimitMatch) {
    const maxReqs = options.match(/maxRequests\s*[:=]\s*(\d+)/);
    const windowMs = options.match(/windowMs\s*[:=]\s*(\d+)/);
    if (maxReqs || windowMs) {
      config.rateLimit = {
        maxRequests: maxReqs ? parseInt(maxReqs[1]) : 100,
        windowMs: windowMs ? parseInt(windowMs[1]) : 60000,
      };
    }
  }

  return config;
}

/**
 * Replace imports: remove legacy, add SDK
 */
function replaceImports(content, factory) {
  let result = content;

  // Remove old imports
  result = result.replace(/import\s*\{[^}]*\bwithSecurity\b[^}]*\}\s+from\s+['"]\.\.\/_shared\/middleware['"];?\n/g, '');
  result = result.replace(/import\s*\{[^}]*\brequireOrgMembership\b[^}]*\}\s+from[^;]+;?\n/g, '');
  result = result.replace(/import\s*\{[^}]*\brequireRole\b[^}]*\}\s+from[^;]+;?\n/g, '');
  result = result.replace(/import\s*\{[^}]*\b(parseJson|badRequest|ok|serverError)\b[^}]*\}\s+from[^;]+;?\n/g, '');

  // Add SDK import if not present
  const factories = new Set([factory]);
  if (factory === 'createAuthenticatedEndpoint') {
    factories.add('createOrgEndpoint');
  }

  const importLine = `import { ${Array.from(factories).join(', ')} } from "@fresh-schedules/api-framework";`;

  // Find insertion point (after last import)
  const lastImportMatch = result.match(/^import\s+.*;?$/m);
  if (lastImportMatch) {
    const insertPos = result.lastIndexOf('\n', result.indexOf(lastImportMatch[0]) + lastImportMatch[0].length);
    result = result.slice(0, insertPos + 1) + importLine + result.slice(insertPos + 1);
  } else {
    result = importLine + '\n\n' + result;
  }

  return result;
}

/**
 * Convert a single withSecurity export to SDK factory
 */
function convertExport(content, factory) {
  const exportPattern = /export\s+(const\s+\w+\s*=\s*)withSecurity\(\s*(.*?),\s*\{\s*([\s\S]*?)\s*\}\s*\);?/;

  return content.replace(exportPattern, (match, prefix, handler, options) => {
    const config = extractAuthConfig(match);
    const configStr = JSON.stringify(config, null, 2)
      .replace(/"/g, '')
      .replace(/,/g, ',')
      .replace(/\n/g, '\n  ');

    return `export ${prefix}${factory}({
  ${configStr},
  handler: async ({ request, input, context, params }) => {
    ${handler}
  }
});`;
  });
}

/**
 * Migrate a single route file
 */
function migrateRoute(filepath) {
  if (!fs.existsSync(filepath)) {
    console.log(`  ⚠️  File not found: ${filepath}`);
    return false;
  }

  let content = fs.readFileSync(filepath, 'utf-8');
  const original = content;

  // Skip if already migrated
  if (/createEndpoint|createPublicEndpoint|createAuthenticatedEndpoint/.test(content)) {
    if (!/withSecurity/.test(content)) {
      console.log(`  ✅ Already migrated: ${path.basename(filepath)}`);
      return false;
    }
  }

  // Skip if no withSecurity
  if (!/withSecurity/.test(content)) {
    console.log(`  ℹ️  No withSecurity pattern: ${path.basename(filepath)}`);
    return false;
  }

  try {
    const factory = detectFactory(content);
    content = replaceImports(content, factory);
    content = convertExport(content, factory);

    if (content !== original) {
      fs.writeFileSync(filepath, content, 'utf-8');
      console.log(`  ✅ Migrated (${factory}): ${path.basename(filepath)}`);
      return true;
    }
  } catch (err) {
    console.log(`  ❌ Error migrating ${path.basename(filepath)}: ${err.message}`);
    return false;
  }

  return false;
}

/**
 * Find all route files
 */
function findRoutes(dir = ROUTES_DIR) {
  const routes = [];

  function walk(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);

      if (stat.isDirectory()) {
        walk(filepath);
      } else if (file === 'route.ts' || file === 'route.tsx') {
        routes.push(filepath);
      }
    }
  }

  walk(dir);
  return routes;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const allFlag = args.includes('--all');
  const routesArg = args.find(a => a.startsWith('--routes='));

  console.log('\n🚀 Route Migration Service Worker\n');

  let routesToMigrate = [];

  if (allFlag) {
    routesToMigrate = findRoutes();
    console.log(`Found ${routesToMigrate.length} route files\n`);
  } else if (routesArg) {
    const routeNames = routesArg.replace('--routes=', '').split(',');
    routesToMigrate = routeNames.map(name => {
      const filepath = path.join(ROUTES_DIR, name);
      return filepath.endsWith('route.ts') ? filepath : path.join(filepath, 'route.ts');
    });
  } else {
    console.log('Usage: node scripts/migrate-routes.mjs [--all | --routes=path/to/route.ts,...]');
    console.log('Example: node scripts/migrate-routes.mjs --all');
    console.log('Example: node scripts/migrate-routes.mjs --routes=publish/route.ts,schedules/route.ts');
    process.exit(1);
  }

  let migrated = 0;
  let skipped = 0;

  for (const route of routesToMigrate) {
    if (migrateRoute(route)) {
      migrated++;
    } else {
      skipped++;
    }
  }

  console.log(`\n📊 Summary: ${migrated} migrated, ${skipped} skipped\n`);
  process.exit(migrated > 0 ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
