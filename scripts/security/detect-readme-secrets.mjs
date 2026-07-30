#!/usr/bin/env node
// [P0][SECURITY][SCRIPT] Detect security details in README files
// Tags: P0, SECURITY, SCRIPT, GUARDRAIL

/**
 * Purpose: Scan README.md and related documentation for exposed security details
 * including API keys, credentials, tokens, and sensitive configuration values.
 * 
 * This script prevents security leaks by detecting patterns that match:
 * - Actual API keys and tokens (not placeholder examples)
 * - Real Firebase configuration values
 * - Database connection strings with credentials
 * - Private keys and certificates
 * - Email addresses in security contexts
 * 
 * Safe patterns (will NOT be flagged):
 * - Documentation placeholders: "YOUR_API_KEY", "your-project-id"
 * - Environment variable names: FIREBASE_API_KEY (without = value)
 * - Example domains: example.com, your-project.firebaseapp.com
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

// Security patterns to detect (actual secrets, not placeholders)
const SECURITY_PATTERNS = [
  // API Keys and Tokens (actual values, not placeholders)
  {
    pattern: /[A-Za-z0-9_-]{20,}@[A-Za-z0-9_-]+\.iam\.gserviceaccount\.com/g,
    type: 'SERVICE_ACCOUNT_EMAIL',
    description: 'Google Service Account email address',
    severity: 'HIGH'
  },
  {
    pattern: /AIza[0-9A-Za-z_-]{35}/g,
    type: 'GOOGLE_API_KEY',
    description: 'Google/Firebase API key',
    severity: 'HIGH'
  },
  {
    pattern: /[0-9]+-[0-9A-Za-z_-]{32}\.apps\.googleusercontent\.com/g,
    type: 'GOOGLE_OAUTH_CLIENT',
    description: 'Google OAuth client ID',
    severity: 'MEDIUM'
  },
  {
    pattern: /sk-[a-zA-Z0-9]{48,}/g,
    type: 'OPENAI_API_KEY',
    description: 'OpenAI API key',
    severity: 'HIGH'
  },
  {
    pattern: /ghp_[a-zA-Z0-9]{36,}/g,
    type: 'GITHUB_TOKEN',
    description: 'GitHub Personal Access Token',
    severity: 'HIGH'
  },
  {
    pattern: /gho_[a-zA-Z0-9]{36,}/g,
    type: 'GITHUB_OAUTH_TOKEN',
    description: 'GitHub OAuth Token',
    severity: 'HIGH'
  },
  
  // Database connections with credentials
  {
    pattern: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@[^\/\s]+/g,
    type: 'MONGODB_CONNECTION',
    description: 'MongoDB connection string with credentials',
    severity: 'HIGH'
  },
  {
    pattern: /postgres(ql)?:\/\/[^:]+:[^@]+@[^\/\s]+/g,
    type: 'POSTGRESQL_CONNECTION',
    description: 'PostgreSQL connection string with credentials',
    severity: 'HIGH'
  },
  {
    pattern: /redis:\/\/[^:]+:[^@]+@[^\/\s]+/g,
    type: 'REDIS_CONNECTION',
    description: 'Redis connection string with credentials',
    severity: 'MEDIUM'
  },
  
  // Private Keys
  {
    pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/g,
    type: 'PRIVATE_KEY',
    description: 'Private key in PEM format',
    severity: 'CRITICAL'
  },
  {
    pattern: /"private_key":\s*"-----BEGIN PRIVATE KEY-----[^"]+"/g,
    type: 'FIREBASE_PRIVATE_KEY',
    description: 'Firebase service account private key',
    severity: 'CRITICAL'
  },
  
  // Actual project IDs (not placeholders)
  {
    pattern: /fresh-schedules-[a-z0-9]{5,}/g,
    type: 'REAL_FIREBASE_PROJECT',
    description: 'Real Firebase project ID (non-demo)',
    severity: 'MEDIUM',
    exclude: ['fresh-schedules-test', 'fresh-schedules-demo']
  },
  
  // Upstash/Redis URLs with tokens
  {
    pattern: /https:\/\/[a-z0-9-]+\.upstash\.io/g,
    type: 'UPSTASH_URL',
    description: 'Upstash Redis URL',
    severity: 'LOW'
  },
  
  // Email addresses in non-example contexts
  {
    pattern: /[a-zA-Z0-9._%+-]+@(?!example\.com|test\.com|your-domain\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    type: 'REAL_EMAIL',
    description: 'Real email address (not example.com)',
    severity: 'LOW'
  }
];

// Whitelist patterns (these are safe and should NOT be flagged)
const WHITELIST_PATTERNS = [
  /YOUR_API_KEY/gi,
  /your-project-id/gi,
  /your-project\.firebaseapp\.com/gi,
  /your-project\.appspot\.com/gi,
  /example\.com/gi,
  /test\.com/gi,
  /localhost/gi,
  /127\.0\.0\.1/gi,
  /\$\{[^}]+\}/g,  // Template variables ${VAR}
  /demo-fresh/gi,  // Demo project
  /FIREBASE_\w+(?!=)/g,  // Env var names without values
  /NEXT_PUBLIC_\w+(?!=)/g,  // Next.js public env vars
  /UPSTASH_\w+(?!=)/g,  // Upstash env var names
  /REDIS_\w+(?!=)/g,  // Redis env var names
  /NODE_OPTIONS/gi,
  /API_BASE_URL/gi,
  /000000000000/g,  // Placeholder numbers
  /abcdef123456/g,  // Placeholder hex
  /G-XXXXXXXXXX/g,  // Placeholder measurement ID
  /1:000000000000:web/g  // Placeholder app ID pattern
];

/**
 * Check if text matches whitelist (safe patterns)
 */
function isWhitelisted(text) {
  return WHITELIST_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Scan content for security patterns
 */
function scanContent(content, filename) {
  const findings = [];
  const lines = content.split('\n');
  
  for (const patternConfig of SECURITY_PATTERNS) {
    const { pattern, type, description, severity, exclude = [] } = patternConfig;
    
    lines.forEach((line, index) => {
      // Reset regex state
      pattern.lastIndex = 0;
      
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const matchedText = match[0];
        
        // Skip if whitelisted
        if (isWhitelisted(matchedText)) {
          continue;
        }
        
        // Skip if in exclusion list
        if (exclude.includes(matchedText)) {
          continue;
        }
        
        // Skip if it's just documentation about the pattern
        const lineContext = line.toLowerCase();
        if (lineContext.includes('example') || 
            lineContext.includes('placeholder') ||
            lineContext.includes('your-') ||
            lineContext.includes('replace with')) {
          continue;
        }
        
        findings.push({
          file: filename,
          line: index + 1,
          column: match.index + 1,
          type,
          description,
          severity,
          match: matchedText,
          context: line.trim()
        });
      }
    });
  }
  
  return findings;
}

/**
 * Scan README and related documentation files
 */
function scanReadmeFiles() {
  const filesToScan = [
    'README.md',
    'docs/README.md',
    'docs/guides/QUICK_START.md',
    'docs/guides/DEPLOYMENT.md'
  ];
  
  let allFindings = [];
  let filesScanned = 0;
  
  for (const file of filesToScan) {
    const filepath = join(ROOT_DIR, file);
    
    if (!existsSync(filepath)) {
      continue;
    }
    
    filesScanned++;
    const content = readFileSync(filepath, 'utf8');
    const findings = scanContent(content, file);
    allFindings = allFindings.concat(findings);
  }
  
  return { findings: allFindings, filesScanned };
}

/**
 * Format and display findings
 */
function displayFindings(findings, filesScanned) {
  if (findings.length === 0) {
    console.log('✅ No security details detected in README files');
    console.log(`   Scanned ${filesScanned} file(s)`);
    return 0;
  }
  
  console.error('🚨 SECURITY ISSUE: Potential secrets detected in README files!\n');
  
  // Group by severity
  const bySeverity = {
    CRITICAL: findings.filter(f => f.severity === 'CRITICAL'),
    HIGH: findings.filter(f => f.severity === 'HIGH'),
    MEDIUM: findings.filter(f => f.severity === 'MEDIUM'),
    LOW: findings.filter(f => f.severity === 'LOW')
  };
  
  for (const [severity, items] of Object.entries(bySeverity)) {
    if (items.length === 0) continue;
    
    const emoji = severity === 'CRITICAL' ? '🔴' : 
                  severity === 'HIGH' ? '🟠' : 
                  severity === 'MEDIUM' ? '🟡' : '🔵';
    
    console.error(`\n${emoji} ${severity} (${items.length} finding${items.length > 1 ? 's' : ''}):`);
    console.error('─'.repeat(80));
    
    for (const finding of items) {
      console.error(`\n  File: ${finding.file}:${finding.line}:${finding.column}`);
      console.error(`  Type: ${finding.type}`);
      console.error(`  Description: ${finding.description}`);
      console.error(`  Context: ${finding.context.substring(0, 100)}${finding.context.length > 100 ? '...' : ''}`);
    }
  }
  
  console.error('\n' + '─'.repeat(80));
  console.error(`\n❌ Found ${findings.length} potential security issue(s) in ${filesScanned} file(s)\n`);
  console.error('🔧 Action Required:');
  console.error('   1. Remove or sanitize the detected secrets');
  console.error('   2. Replace with placeholders (YOUR_API_KEY, your-project-id, example.com)');
  console.error('   3. Move actual credentials to .env.local (never commit this file)');
  console.error('   4. Review .env.example for safe documentation patterns\n');
  
  return 1;
}

// Main execution
try {
  const { findings, filesScanned } = scanReadmeFiles();
  const exitCode = displayFindings(findings, filesScanned);
  process.exit(exitCode);
} catch (error) {
  console.error('❌ Error scanning files:', error.message);
  process.exit(1);
}
