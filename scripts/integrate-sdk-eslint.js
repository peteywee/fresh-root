#!/usr/bin/env node
// [P1][SDK][SCRIPT] ESLint integration script for API Framework
// Tags: P1, SDK, SCRIPT, INTEGRATION

/**
 * Script to integrate @fresh-schedules/api-framework ESLint configuration
 * into your project's eslint.config.mjs file
 * 
 * Usage: node scripts/integrate-sdk-eslint.js
 */

const fs = require('fs');
const path = require('path');

const APPS_WEB_ESLINT_CONFIG = path.join(process.cwd(), 'apps/web/eslint.config.mjs');
const SDK_ESLINT_CONFIG = path.join(process.cwd(), 'packages/api-framework/eslint.config.js');

function main() {
  console.log('🔧 Integrating API Framework ESLint configuration...');
  
  // Check if SDK config exists
  if (!fs.existsSync(SDK_ESLINT_CONFIG)) {
    console.error('❌ API Framework ESLint config not found at:', SDK_ESLINT_CONFIG);
    process.exit(1);
  }
  
  // Check if apps/web config exists
  if (!fs.existsSync(APPS_WEB_ESLINT_CONFIG)) {
    console.error('❌ apps/web ESLint config not found at:', APPS_WEB_ESLINT_CONFIG);
    process.exit(1);
  }
  
  try {
    // Read existing config
    const configContent = fs.readFileSync(APPS_WEB_ESLINT_CONFIG, 'utf8');
    
    // Check if SDK integration is already present
    if (configContent.includes('@fresh-schedules/api-framework/eslint')) {
      console.log('✅ API Framework ESLint rules already integrated');
      return;
    }
    
    // Find the extends array and add SDK config
    const sdkConfigLine = '    ...require("@fresh-schedules/api-framework/eslint.config.js"),';
    
    if (configContent.includes('export default [')) {
      // Add to export array
      const updatedContent = configContent.replace(
        'export default [',
        `export default [\n  // API Framework patterns and safeguards\n${sdkConfigLine}`
      );
      
      fs.writeFileSync(APPS_WEB_ESLINT_CONFIG, updatedContent);
      console.log('✅ Added API Framework ESLint rules to apps/web/eslint.config.mjs');
    } else {
      console.warn('⚠️  Could not automatically integrate. Please add this line to your eslint.config.mjs:');
      console.log('   ', sdkConfigLine);
    }
    
  } catch (err) {
    console.error('❌ Error integrating ESLint config:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}