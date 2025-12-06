/**
 * Security Scanner Integration
 * OWASP Top 10 vulnerability detection during test execution
 */

import * as fs from "fs";
import * as path from "path";

interface SecurityVulnerability {
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  location: string;
  description: string;
  cwe: string;
  owasp: string;
  remediation: string;
  confidence: number;
}

interface SecurityScanResult {
  vulnerabilities: SecurityVulnerability[];
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export class SecurityScanner {
  private vulnerabilities: SecurityVulnerability[] = [];

  /**
   * Scans codebase for security vulnerabilities
   */
  async scan(targetPaths: string[]): Promise<SecurityScanResult> {
    this.vulnerabilities = [];

    for (const targetPath of targetPaths) {
      if (fs.existsSync(targetPath)) {
        if (fs.statSync(targetPath).isDirectory()) {
          this.scanDirectory(targetPath);
        } else {
          this.scanFile(targetPath);
        }
      }
    }

    return this.generateResult();
  }

  /**
   * Scans directory recursively
   */
  private scanDirectory(dir: string): void {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.includes("node_modules")) {
        this.scanDirectory(filePath);
      } else if (file.endsWith(".ts") || file.endsWith(".js")) {
        this.scanFile(filePath);
      }
    }
  }

  /**
   * Scans individual file for vulnerabilities
   */
  private scanFile(filePath: string): void {
    const content = fs.readFileSync(filePath, "utf-8");

    // A01:2021 - Broken Access Control
    this.detectBrokenAccessControl(filePath, content);

    // A02:2021 - Cryptographic Failures
    this.detectCryptographicFailures(filePath, content);

    // A03:2021 - Injection
    this.detectInjection(filePath, content);

    // A04:2021 - Insecure Design
    this.detectInsecureDesign(filePath, content);

    // A05:2021 - Security Misconfiguration
    this.detectSecurityMisconfiguration(filePath, content);

    // A06:2021 - Vulnerable Components
    this.detectVulnerableComponents(filePath, content);

    // A07:2021 - Identification and Authentication Failures
    this.detectAuthFailures(filePath, content);

    // A08:2021 - Software and Data Integrity Failures
    this.detectIntegrityFailures(filePath, content);

    // A09:2021 - Security Logging and Monitoring Failures
    this.detectLoggingFailures(filePath, content);

    // A10:2021 - Server-Side Request Forgery
    this.detectSSRF(filePath, content);
  }

  private detectBrokenAccessControl(filePath: string, content: string): void {
    // Check for missing authorization checks
    if (content.includes("export async function") && !content.includes("requireAuth")) {
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (line.includes("export async function") && !line.includes("requireAuth")) {
          this.vulnerabilities.push({
            type: "Broken Access Control",
            severity: "high",
            location: `${filePath}:${i + 1}`,
            description: "API endpoint missing authorization check",
            cwe: "CWE-862",
            owasp: "A01:2021",
            remediation: "Add requireAuth() or requireRole() middleware",
            confidence: 0.7,
          });
        }
      });
    }
  }

  private detectCryptographicFailures(filePath: string, content: string): void {
    // Check for weak crypto
    const weakPatterns = [
      { pattern: /md5\(/gi, desc: "MD5 is cryptographically broken" },
      { pattern: /sha1\(/gi, desc: "SHA1 is cryptographically weak" },
      { pattern: /Math\.random\(/gi, desc: "Math.random() not cryptographically secure" },
    ];

    weakPatterns.forEach(({ pattern, desc }) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const line = content.substring(0, match.index).split("\n").length;
        this.vulnerabilities.push({
          type: "Cryptographic Failures",
          severity: "medium",
          location: `${filePath}:${line}`,
          description: desc,
          cwe: "CWE-327",
          owasp: "A02:2021",
          remediation: "Use crypto.randomBytes() or bcrypt for secure random generation",
          confidence: 0.9,
        });
      }
    });
  }

  private detectInjection(filePath: string, content: string): void {
    // SQL Injection
    const sqlPatterns = [
      /\$\{.*\}.*\b(SELECT|INSERT|UPDATE|DELETE)\b/gi,
      /query\([`'"].*\$\{/gi,
    ];

    sqlPatterns.forEach((pattern) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const line = content.substring(0, match.index).split("\n").length;
        this.vulnerabilities.push({
          type: "SQL Injection",
          severity: "critical",
          location: `${filePath}:${line}`,
          description: "Potential SQL injection via string interpolation",
          cwe: "CWE-89",
          owasp: "A03:2021",
          remediation: "Use parameterized queries or ORM methods",
          confidence: 0.8,
        });
      }
    });

    // Command Injection
    const cmdPatterns = [/exec\(.*\$\{/gi, /spawn\(.*\$\{/gi];

    cmdPatterns.forEach((pattern) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const line = content.substring(0, match.index).split("\n").length;
        this.vulnerabilities.push({
          type: "Command Injection",
          severity: "critical",
          location: `${filePath}:${line}`,
          description: "Potential command injection via unsanitized input",
          cwe: "CWE-78",
          owasp: "A03:2021",
          remediation: "Sanitize inputs and avoid shell execution",
          confidence: 0.9,
        });
      }
    });
  }

  private detectInsecureDesign(filePath: string, content: string): void {
    // Check for hardcoded secrets
    const secretPatterns = [
      /password\s*=\s*['"][^'"]+['"]/gi,
      /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
      /secret\s*=\s*['"][^'"]+['"]/gi,
    ];

    secretPatterns.forEach((pattern) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (!match[0].includes("process.env")) {
          const line = content.substring(0, match.index).split("\n").length;
          this.vulnerabilities.push({
            type: "Hardcoded Secrets",
            severity: "critical",
            location: `${filePath}:${line}`,
            description: "Hardcoded credentials detected",
            cwe: "CWE-798",
            owasp: "A04:2021",
            remediation: "Use environment variables or secret management",
            confidence: 0.85,
          });
        }
      }
    });
  }

  private detectSecurityMisconfiguration(filePath: string, content: string): void {
    // Check for debug mode in production
    if (content.includes("NODE_ENV") && content.includes("development")) {
      const line = content.indexOf("development");
      this.vulnerabilities.push({
        type: "Debug Mode Enabled",
        severity: "medium",
        location: `${filePath}:${content.substring(0, line).split("\n").length}`,
        description: "Debug mode may expose sensitive information",
        cwe: "CWE-489",
        owasp: "A05:2021",
        remediation: "Ensure debug mode is disabled in production",
        confidence: 0.6,
      });
    }

    // Check for CORS misconfiguration
    if (content.includes("Access-Control-Allow-Origin") && content.includes("*")) {
      const line = content.indexOf("Access-Control-Allow-Origin");
      this.vulnerabilities.push({
        type: "CORS Misconfiguration",
        severity: "medium",
        location: `${filePath}:${content.substring(0, line).split("\n").length}`,
        description: "Overly permissive CORS policy",
        cwe: "CWE-942",
        owasp: "A05:2021",
        remediation: "Restrict CORS to specific origins",
        confidence: 0.9,
      });
    }
  }

  private detectVulnerableComponents(filePath: string, content: string): void {
    // Check for outdated dependencies (basic check)
    if (filePath.endsWith("package.json")) {
      try {
        const pkg = JSON.parse(content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        Object.entries(deps).forEach(([name, version]) => {
          if (typeof version === "string" && version.includes("*")) {
            this.vulnerabilities.push({
              type: "Vulnerable Dependencies",
              severity: "low",
              location: filePath,
              description: `Wildcard version for ${name} may introduce vulnerabilities`,
              cwe: "CWE-1035",
              owasp: "A06:2021",
              remediation: "Pin dependency versions",
              confidence: 0.5,
            });
          }
        });
      } catch {
        // Invalid JSON
      }
    }
  }

  private detectAuthFailures(filePath: string, content: string): void {
    // Check for weak session management
    if (content.includes("session") && !content.includes("httpOnly")) {
      const line = content.indexOf("session");
      this.vulnerabilities.push({
        type: "Insecure Session Management",
        severity: "high",
        location: `${filePath}:${content.substring(0, line).split("\n").length}`,
        description: "Session cookie missing httpOnly flag",
        cwe: "CWE-1004",
        owasp: "A07:2021",
        remediation: "Set httpOnly and secure flags on session cookies",
        confidence: 0.7,
      });
    }
  }

  private detectIntegrityFailures(filePath: string, content: string): void {
    // Check for missing input validation
    if (content.includes("req.body") && !content.includes("parse")) {
      const line = content.indexOf("req.body");
      this.vulnerabilities.push({
        type: "Missing Input Validation",
        severity: "medium",
        location: `${filePath}:${content.substring(0, line).split("\n").length}`,
        description: "Request body used without validation",
        cwe: "CWE-20",
        owasp: "A08:2021",
        remediation: "Use Zod or similar validation library",
        confidence: 0.6,
      });
    }
  }

  private detectLoggingFailures(filePath: string, content: string): void {
    // Check for sensitive data in logs
    const sensitivePatterns = [/console\.log\(.*password/gi, /console\.log\(.*token/gi];

    sensitivePatterns.forEach((pattern) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const line = content.substring(0, match.index).split("\n").length;
        this.vulnerabilities.push({
          type: "Sensitive Data in Logs",
          severity: "medium",
          location: `${filePath}:${line}`,
          description: "Sensitive data may be logged",
          cwe: "CWE-532",
          owasp: "A09:2021",
          remediation: "Avoid logging sensitive data",
          confidence: 0.8,
        });
      }
    });
  }

  private detectSSRF(filePath: string, content: string): void {
    // Check for SSRF vulnerabilities
    const ssrfPatterns = [/fetch\(.*req\./gi, /axios\.get\(.*req\./gi];

    ssrfPatterns.forEach((pattern) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const line = content.substring(0, match.index).split("\n").length;
        this.vulnerabilities.push({
          type: "Server-Side Request Forgery",
          severity: "high",
          location: `${filePath}:${line}`,
          description: "Potential SSRF via user-controlled URL",
          cwe: "CWE-918",
          owasp: "A10:2021",
          remediation: "Validate and whitelist URLs before making requests",
          confidence: 0.7,
        });
      }
    });
  }

  private generateResult(): SecurityScanResult {
    const summary = {
      critical: this.vulnerabilities.filter((v) => v.severity === "critical").length,
      high: this.vulnerabilities.filter((v) => v.severity === "high").length,
      medium: this.vulnerabilities.filter((v) => v.severity === "medium").length,
      low: this.vulnerabilities.filter((v) => v.severity === "low").length,
    };

    // Calculate security score (0-100)
    const score = Math.max(
      0,
      100 - (summary.critical * 20 + summary.high * 10 + summary.medium * 5 + summary.low * 1),
    );

    // Determine grade
    let grade: "A" | "B" | "C" | "D" | "F";
    if (score >= 90) grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";
    else if (score >= 60) grade = "D";
    else grade = "F";

    return {
      vulnerabilities: this.vulnerabilities,
      score,
      grade,
      summary,
    };
  }

  /**
   * Generates security report
   */
  generateReport(result: SecurityScanResult): string {
    let report = "\n🔒 SECURITY SCAN REPORT\n";
    report += "═".repeat(70) + "\n\n";

    report += `Security Score: ${result.score}/100 (Grade: ${result.grade})\n\n`;

    report += `Vulnerabilities Found:\n`;
    report += `  🔴 Critical: ${result.summary.critical}\n`;
    report += `  🟠 High: ${result.summary.high}\n`;
    report += `  🟡 Medium: ${result.summary.medium}\n`;
    report += `  🟢 Low: ${result.summary.low}\n\n`;

    if (result.vulnerabilities.length > 0) {
      report += "Details:\n";
      report += "─".repeat(70) + "\n\n";

      // Group by severity
      ["critical", "high", "medium", "low"].forEach((severity) => {
        const vulns = result.vulnerabilities.filter((v) => v.severity === severity);

        if (vulns.length > 0) {
          report += `${severity.toUpperCase()} Severity:\n\n`;

          vulns.forEach((vuln, i) => {
            report += `${i + 1}. ${vuln.type}\n`;
            report += `   Location: ${vuln.location}\n`;
            report += `   OWASP: ${vuln.owasp}\n`;
            report += `   CWE: ${vuln.cwe}\n`;
            report += `   Confidence: ${(vuln.confidence * 100).toFixed(0)}%\n`;
            report += `   Description: ${vuln.description}\n`;
            report += `   💡 Remediation: ${vuln.remediation}\n\n`;
          });
        }
      });

      report += "\n🎯 Recommendations:\n";
      if (result.summary.critical > 0) {
        report += "  • URGENT: Address critical vulnerabilities immediately\n";
      }
      if (result.summary.high > 0) {
        report += "  • HIGH PRIORITY: Fix high severity issues before deployment\n";
      }
      if (result.grade === "F" || result.grade === "D") {
        report += "  • FAILING GRADE: Security review required\n";
      }
    } else {
      report += "✅ No vulnerabilities detected!\n";
    }

    return report;
  }

  /**
   * Saves report to file
   */
  saveReport(result: SecurityScanResult, outputPath: string = "tests/intelligence/security-report.json"): void {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  }
}

export const securityScanner = new SecurityScanner();
