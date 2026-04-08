// [P0][TEST][SECURITY] Security guard rail tests for README sanitization
// Tags: P0, TEST, SECURITY, GUARDRAIL

import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = join(process.cwd());
const SCRIPT_PATH = join(ROOT_DIR, 'scripts/security/detect-readme-secrets.mjs');

/**
 * Helper to run the security scanner on a test file
 */
function runScanner(content: string): { exitCode: number; output: string } {
  const testFile = join(ROOT_DIR, 'TEST_README.md');
  
  try {
    // Write test content
    writeFileSync(testFile, content, 'utf8');
    
    // Temporarily modify scanner to scan our test file
    const originalScript = readFileSync(SCRIPT_PATH, 'utf8');
    const modifiedScript = originalScript.replace(
      "const filesToScan = [",
      "const filesToScan = ['TEST_README.md', //"
    );
    writeFileSync(SCRIPT_PATH, modifiedScript, 'utf8');
    
    try {
      // Run the scanner
      const output = execSync(`node ${SCRIPT_PATH}`, {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      return { exitCode: 0, output };
    } catch (error: any) {
      return { 
        exitCode: error.status || 1, 
        output: error.stdout + error.stderr 
      };
    } finally {
      // Restore original script
      writeFileSync(SCRIPT_PATH, originalScript, 'utf8');
    }
  } finally {
    // Clean up test file
    try {
      unlinkSync(testFile);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

describe('README Security Sanitization Guard Rail', () => {
  describe('Detection: API Keys and Tokens', () => {
    it('should detect Google/Firebase API keys', () => {
      const content = `
# Setup
Configure your Firebase:
FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('GOOGLE_API_KEY');
    });
    
    it('should detect service account emails', () => {
      const content = `
Service account: firebase-adminsdk-abc123@my-project.iam.gserviceaccount.com
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('SERVICE_ACCOUNT_EMAIL');
    });
    
    it('should detect GitHub tokens', () => {
      const content = `
Token: ghp_1234567890abcdefghijklmnopqrstuvwxyzAB
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('GITHUB_TOKEN');
    });
    
    it('should detect OpenAI API keys', () => {
      const content = `
OPENAI_API_KEY=sk-proj-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGH
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('OPENAI_API_KEY');
    });
  });
  
  describe('Detection: Database Connections', () => {
    it('should detect MongoDB connection strings with credentials', () => {
      const content = `
mongodb://username:password@cluster0.mongodb.net/mydb
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('MONGODB_CONNECTION');
    });
    
    it('should detect PostgreSQL connection strings', () => {
      const content = `
postgres://user:pass@localhost:5432/database
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('POSTGRESQL_CONNECTION');
    });
    
    it('should detect Redis connection strings with credentials', () => {
      const content = `
redis://user:password@redis.example.com:6379
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('REDIS_CONNECTION');
    });
  });
  
  describe('Detection: Private Keys', () => {
    it('should detect PEM private keys', () => {
      const content = `
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('PRIVATE_KEY');
    });
  });
  
  describe('Whitelist: Safe Patterns', () => {
    it('should allow placeholder API keys', () => {
      const content = `
# Configuration
FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('No security details detected');
    });
    
    it('should allow placeholder project IDs', () => {
      const content = `
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(0);
    });
    
    it('should allow example.com email addresses', () => {
      const content = `
Contact: support@example.com
Test user: test@example.com
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(0);
    });
    
    it('should allow environment variable names without values', () => {
      const content = `
# Required environment variables:
- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- REDIS_URL
- UPSTASH_REDIS_REST_URL
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(0);
    });
    
    it('should allow localhost and 127.0.0.1', () => {
      const content = `
Development server: http://localhost:3000
Redis: redis://localhost:6379
API: http://127.0.0.1:4000
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(0);
    });
    
    it('should allow demo/test project IDs', () => {
      const content = `
FIREBASE_PROJECT_ID=demo-fresh
For testing: fresh-schedules-test
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(0);
    });
  });
  
  describe('Context Awareness', () => {
    it('should ignore patterns in documentation context', () => {
      const content = `
Replace YOUR_API_KEY with your actual API key
Example: FIREBASE_API_KEY=your-firebase-api-key
Placeholder format: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(0);
    });
  });
  
  describe('Severity Levels', () => {
    it('should report CRITICAL severity for private keys', () => {
      const content = `
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('CRITICAL');
    });
    
    it('should report HIGH severity for API keys', () => {
      const content = `
AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('HIGH');
    });
  });
  
  describe('Multiple Findings', () => {
    it('should detect multiple issues in one file', () => {
      const content = `
# Config
FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Service: firebase-admin@my-project.iam.gserviceaccount.com
Database: mongodb://user:pass@cluster.mongodb.net/db
`;
      
      const result = runScanner(content);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('GOOGLE_API_KEY');
      expect(result.output).toContain('SERVICE_ACCOUNT_EMAIL');
      expect(result.output).toContain('MONGODB_CONNECTION');
    });
  });
  
  describe('Pre-commit Hook Integration', () => {
    it('should have the security scanner in pre-commit hook', () => {
      const preCommitPath = join(ROOT_DIR, '.husky/pre-commit');
      const preCommitContent = readFileSync(preCommitPath, 'utf8');
      
      expect(preCommitContent).toContain('scripts/security/detect-readme-secrets.mjs');
      expect(preCommitContent).toContain('[SECURITY]');
    });
    
    it('should block commits with README changes when secrets detected', () => {
      const preCommitPath = join(ROOT_DIR, '.husky/pre-commit');
      const preCommitContent = readFileSync(preCommitPath, 'utf8');
      
      // Verify the hook checks for staged README files
      expect(preCommitContent).toMatch(/README\.md/);
      
      // Verify it exits with error on failure
      expect(preCommitContent).toContain('exit 1');
    });
  });
});

describe('Guard Rail Documentation', () => {
  it('should have clear error messages', () => {
    const content = `
FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`;
    
    const result = runScanner(content);
    expect(result.output).toContain('Action Required');
    expect(result.output).toContain('Remove or sanitize');
    expect(result.output).toContain('placeholders');
  });
  
  it('should reference .env.example for guidance', () => {
    const content = `
FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`;
    
    const result = runScanner(content);
    expect(result.output).toContain('.env.example');
  });
});
