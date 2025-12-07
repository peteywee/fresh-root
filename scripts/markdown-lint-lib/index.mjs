#!/usr/bin/env node

/**
 * [P0][LINT][CODE] Markdown Linting Rules Library with Auto-Fix
 * Tags: P0, LINT, CODE, MARKDOWN, RULES
 *
 * Comprehensive markdown linting configuration with 18 auto-fixable rules.
 * Supports strict, standard, and lenient profiles for different use cases.
 * Integrates with markdownlint-cli2 for production markdown validation.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

/**
 * [P0][LINT][CONFIG] Rule Profiles
 * Three configuration tiers with different strictness levels
 */
export const RULE_PROFILES = {
  strict: {
    description: "Comprehensive markdown linting - ALL 51 rules enabled",
    default: true,
    rules: {
      // Headers (13 rules)
      MD001: true,
      MD002: true,
      MD003: { style: "consistent" },
      MD018: true,
      MD019: true,
      MD020: true,
      MD021: true,
      MD022: { blanks: 1 },
      MD023: true,
      MD024: { siblings_only: true },
      MD025: true,
      MD026: { punctuation: ".,;:!?" },
      MD041: true,

      // Lists (8 rules)
      MD004: { style: "consistent" },
      MD005: true,
      MD006: true,
      MD007: { indent: 2 },
      MD029: { style: "ordered" },
      MD030: { ul_single: 1, ol_single: 1, ul_multi: 1, ol_multi: 1 },
      MD032: true,
      MD050: { style: "consistent" },

      // Whitespace & Spacing (10 rules)
      MD009: { br_spaces: 2, list_item_empty_lines: false, strict: true },
      MD010: { code_blocks: true },
      MD011: true,
      MD012: { maximum: 1 },
      MD027: true,
      MD028: true,
      MD037: true,
      MD038: true,
      MD039: true,
      MD049: { style: "consistent" },

      // Code (7 rules)
      MD031: { list_items: true, list_item_empty_lines: false },
      MD040: true,
      MD046: { style: "backtick" },
      MD047: true,
      MD048: { style: "backtick" },
      MD051: true,
      MD052: true,

      // Links & References (5 rules)
      MD011: true,
      MD034: true,
      MD035: { style: "consistent" },
      MD042: true,
      MD053: { enabled: false },

      // Advanced (5 rules)
      MD013: { line_length: 120, code_blocks: true, tables: true },
      MD014: true,
      MD033: { allowed_elements: [] },
      MD036: { punctuation: ".,;:!?" },
      MD044: { names: [], code_blocks: true, html_elements: false },

      // Additional (3 rules)
      MD043: false,
      MD045: false,
      MD054: false,
      MD055: false,
    },
  },

  standard: {
    description: "Standard markdown linting - 35 core rules (recommended)",
    default: false,
    rules: {
      // Headers (10 rules)
      MD001: true,
      MD003: { style: "consistent" },
      MD018: true,
      MD019: true,
      MD022: { blanks: 1 },
      MD023: true,
      MD025: true,
      MD026: { punctuation: ".,;:!?" },
      MD041: true,
      MD024: { siblings_only: true },

      // Lists (6 rules)
      MD004: { style: "consistent" },
      MD005: true,
      MD007: { indent: 2 },
      MD029: { style: "ordered" },
      MD030: { ul_single: 1, ol_single: 1, ul_multi: 1, ol_multi: 1 },
      MD050: { style: "consistent" },

      // Whitespace (8 rules)
      MD009: { br_spaces: 2, strict: true },
      MD010: { code_blocks: true },
      MD012: { maximum: 1 },
      MD027: true,
      MD037: true,
      MD038: true,
      MD039: true,
      MD049: { style: "consistent" },

      // Code (5 rules)
      MD031: { list_items: true },
      MD032: true,
      MD040: true,
      MD046: { style: "backtick" },
      MD047: true,

      // Links (3 rules)
      MD034: true,
      MD035: { style: "consistent" },
      MD042: true,

      // Misc (3 rules)
      MD014: true,
      MD033: { allowed_elements: [] },
      MD013: false,
    },
  },

  lenient: {
    description: "Lenient markdown linting - 15 essential rules only",
    default: false,
    rules: {
      // Absolute essentials
      MD001: true,
      MD009: { br_spaces: 2 },
      MD010: { code_blocks: false },
      MD012: { maximum: 2 },
      MD018: true,
      MD025: true,
      MD030: { ul_single: 1, ol_single: 1, ul_multi: 1, ol_multi: 1 },
      MD031: { list_items: true },
      MD034: true,
      MD040: true,
      MD046: { style: "backtick" },
      MD047: true,
      MD048: { style: "backtick" },
      MD035: { style: "consistent" },
      MD037: true,

      // Disabled
      MD002: false,
      MD013: false,
      MD029: false,
      MD041: false,
      MD045: false,
    },
  },
};

/**
 * [P0][LINT][CONFIG] Auto-Fixable Rules Registry
 * Tracks which rules can be automatically fixed by markdownlint-cli2
 * Total: 28 fixable rules out of 51
 */
export const AUTO_FIXABLE_RULES = {
  MD001: { name: "Header increment", fixable: true, priority: "high" },
  MD003: { name: "Header style", fixable: true, priority: "high" },
  MD004: { name: "List unordered style", fixable: true, priority: "high" },
  MD005: { name: "List indentation consistency", fixable: true, priority: "high" },
  MD007: { name: "Unordered list indentation", fixable: true, priority: "medium" },
  MD009: { name: "Trailing spaces", fixable: true, priority: "high" },
  MD010: { name: "Hard tabs", fixable: true, priority: "high" },
  MD012: { name: "Multiple blank lines", fixable: true, priority: "medium" },
  MD018: { name: "No space after heading marker", fixable: true, priority: "high" },
  MD019: { name: "Space before heading marker", fixable: true, priority: "high" },
  MD020: { name: "Closing heading markers", fixable: true, priority: "medium" },
  MD021: { name: "Multiple spaces inside heading markers", fixable: true, priority: "medium" },
  MD026: { name: "Heading punctuation", fixable: true, priority: "low" },
  MD027: { name: "Blockquote spacing", fixable: true, priority: "medium" },
  MD030: { name: "List spacing", fixable: true, priority: "medium" },
  MD031: { name: "Fenced code block blanks", fixable: true, priority: "medium" },
  MD032: { name: "List item blank lines", fixable: true, priority: "medium" },
  MD035: { name: "Horizontal rule style", fixable: true, priority: "low" },
  MD037: { name: "Emphasis marker spaces", fixable: true, priority: "high" },
  MD038: { name: "Code marker spaces", fixable: true, priority: "high" },
  MD039: { name: "Link text spaces", fixable: true, priority: "high" },
  MD046: { name: "Code block style", fixable: true, priority: "high" },
  MD047: { name: "Single trailing newline", fixable: true, priority: "high" },
  MD048: { name: "Code fence style", fixable: true, priority: "high" },
  MD049: { name: "Emphasis style", fixable: true, priority: "medium" },
  MD050: { name: "List marker style", fixable: true, priority: "medium" },
  MD051: { name: "Link fragments", fixable: true, priority: "low" },
  MD052: { name: "Reference links not used", fixable: true, priority: "low" },
};

/**
 * [P0][LINT][RULES] Comprehensive Rule Descriptions
 * COMPLETE 51-rule set with full documentation and examples
 */
export const RULE_DESCRIPTIONS = {
  // HEADERS (13 rules)
  MD001: {
    name: "Heading increment",
    description: "Heading levels should not be skipped (h2 after h1, not h3)",
    example: "❌ # H1\\n### H3 (skipped H2)\\n✅ # H1\\n## H2\\n### H3",
    fixable: true,
    category: "headers",
  },
  MD002: {
    name: "First heading level",
    description: "Document should start with heading level 1",
    example: "❌ ## H2 first\\n✅ # H1 first",
    fixable: false,
    category: "headers",
  },
  MD003: {
    name: "Heading style",
    description: "Heading style should be consistent (# vs underline)",
    example: "❌ # H1\\n== H2\\n✅ # H1\\n## H2",
    fixable: true,
    category: "headers",
  },
  MD018: {
    name: "No space after heading marker",
    description: "Space required after # heading marker",
    example: "❌ #Heading\\n✅ # Heading",
    fixable: true,
    category: "headers",
  },
  MD019: {
    name: "Space before heading marker",
    description: "No space before heading marker",
    example: "❌  # Heading\\n✅ # Heading",
    fixable: true,
    category: "headers",
  },
  MD020: {
    name: "Closing heading markers",
    description: "No closing heading markers needed",
    example: "❌ # Heading #\\n✅ # Heading",
    fixable: true,
    category: "headers",
  },
  MD021: {
    name: "Multiple spaces inside heading markers",
    description: "No multiple spaces inside heading markers",
    example: "❌ #  Heading (double space)\\n✅ # Heading",
    fixable: true,
    category: "headers",
  },
  MD022: {
    name: "Heading surrounded by blank lines",
    description: "Headings should be surrounded by blank lines",
    example: "❌ Text\\n# Heading\\nText\\n✅ Text\\n\\n# Heading\\n\\nText",
    fixable: false,
    category: "headers",
  },
  MD023: {
    name: "Heading level consistency",
    description: "Heading levels should increase by one",
    example: "❌ # H1\\n### H3\\n✅ # H1\\n## H2\\n### H3",
    fixable: false,
    category: "headers",
  },
  MD024: {
    name: "Duplicate heading names",
    description: "Avoid duplicate heading names in same document",
    example: "❌ # Title\\n## Section\\n# Title\\n✅ # Title\\n## Section 1\\n## Section 2",
    fixable: false,
    category: "headers",
  },
  MD025: {
    name: "Multiple top-level headings",
    description: "Only one top-level heading per document",
    example: "❌ # Title1\\n# Title2\\n✅ # Title\\n## Subtitle",
    fixable: false,
    category: "headers",
  },
  MD026: {
    name: "Heading punctuation",
    description: "Headings should not end with punctuation",
    example: "❌ # Heading!\\n✅ # Heading",
    fixable: true,
    category: "headers",
  },
  MD041: {
    name: "First line must be heading",
    description: "First line of file should be heading level 1",
    example: "❌ Text\\n# Heading\\n✅ # Heading\\nText",
    fixable: false,
    category: "headers",
  },

  // LISTS (8 rules)
  MD004: {
    name: "Unordered list style",
    description: "List markers should be consistent (*, -, +)",
    example: "❌ * Item1\\n- Item2\\n✅ * Item1\\n* Item2",
    fixable: true,
    category: "lists",
  },
  MD005: {
    name: "List indentation consistency",
    description: "List items at same level should have same indentation",
    example: "❌ * Item1\\n  * SubItem\\n * Item2\\n✅ * Item1\\n  * SubItem\\n* Item2",
    fixable: true,
    category: "lists",
  },
  MD006: {
    name: "Start unordered list at column 0",
    description: "Unordered lists should start at column 0",
    example: "❌   * Item (3 spaces)\\n✅ * Item (0 spaces)",
    fixable: false,
    category: "lists",
  },
  MD007: {
    name: "Unordered list indentation",
    description: "Unordered list indentation should be consistent",
    example: "❌ * Item1\\n  * Nested (3 spaces)\\n✅ * Item1\\n  * Nested (2 spaces)",
    fixable: true,
    category: "lists",
  },
  MD029: {
    name: "Ordered list style",
    description: "Ordered lists should be numbered consistently",
    example: "❌ 1) Item\\n2) Item\\n✅ 1. Item\\n2. Item",
    fixable: true,
    category: "lists",
  },
  MD030: {
    name: "List spacing",
    description: "Spacing between list items should be consistent",
    example: "❌ -  Item1\\n- Item2\\n✅ - Item1\\n- Item2",
    fixable: true,
    category: "lists",
  },
  MD032: {
    name: "List item blank lines",
    description: "Lists should not have blank lines between items",
    example: "❌ - Item1\\n\\n- Item2\\n✅ - Item1\\n- Item2",
    fixable: true,
    category: "lists",
  },
  MD050: {
    name: "List marker style",
    description: "List markers should be consistent within file",
    example: "❌ * Item and - Item\\n✅ All + Item",
    fixable: true,
    category: "lists",
  },

  // WHITESPACE & SPACING (10 rules)
  MD009: {
    name: "Trailing spaces",
    description: "Lines should not end with trailing spaces",
    example: "❌ Line with spaces   \\n✅ Line without spaces",
    fixable: true,
    category: "whitespace",
  },
  MD010: {
    name: "Hard tabs",
    description: "Should use spaces instead of tabs",
    example: "❌ \\t(tab)\\n✅   (spaces)",
    fixable: true,
    category: "whitespace",
  },
  MD011: {
    name: "Reversed link syntax",
    description: "Avoid reversed link syntax",
    example: "❌ (text)[url]\\n✅ [text](url)",
    fixable: false,
    category: "links",
  },
  MD012: {
    name: "Multiple blank lines",
    description: "No more than one blank line between elements",
    example: "❌ Line1\\n\\n\\nLine2\\n✅ Line1\\n\\nLine2",
    fixable: true,
    category: "whitespace",
  },
  MD027: {
    name: "Blockquote spacing",
    description: "Multiple blockquotes should be separated",
    example: "❌ > Quote1\\n> Quote2\\n✅ > Quote1\\n\\n> Quote2",
    fixable: true,
    category: "spacing",
  },
  MD028: {
    name: "Blank line inside blockquote",
    description: "Blockquotes should not have blank lines inside",
    example: "❌ > Line1\\n>\\n> Line2\\n✅ > Line1\\n> Line2",
    fixable: false,
    category: "spacing",
  },
  MD037: {
    name: "Spaces inside emphasis markers",
    description: "No spaces inside emphasis markers",
    example: "❌ ** text **\\n✅ **text**",
    fixable: true,
    category: "emphasis",
  },
  MD038: {
    name: "Spaces inside code markers",
    description: "No spaces inside code markers",
    example: "❌ ` code `\\n✅ `code`",
    fixable: true,
    category: "code",
  },
  MD039: {
    name: "Spaces inside link text",
    description: "No spaces inside link text",
    example: "❌ [ link ]\\n✅ [link]",
    fixable: true,
    category: "links",
  },
  MD049: {
    name: "Emphasis style consistency",
    description: "Emphasis markers should be consistent",
    example: "❌ *italic* and _italic_\\n✅ All *italic*",
    fixable: true,
    category: "emphasis",
  },

  // CODE (7 rules)
  MD031: {
    name: "Fenced code block blanks",
    description: "Blank lines around code blocks",
    example: "❌ Text\\n\\`\\`\\`code\\n✅ Text\\n\\n\\`\\`\\`code",
    fixable: true,
    category: "code",
  },
  MD040: {
    name: "Code block language",
    description: "Code blocks should specify language",
    example: "❌ \\`\\`\\`\\ncode\\n\\`\\`\\`\\n✅ \\`\\`\\`javascript\\ncode\\n\\`\\`\\`",
    fixable: false,
    category: "code",
  },
  MD046: {
    name: "Code block style",
    description: "Code blocks should use consistent fence style",
    example: "❌ ~~~code~~~\\n✅ \\`\\`\\`code\\`\\`\\`",
    fixable: true,
    category: "code",
  },
  MD047: {
    name: "Single trailing newline",
    description: "Files should end with single newline",
    example: "❌ Line\\n\\n\\n✅ Line\\n",
    fixable: true,
    category: "whitespace",
  },
  MD048: {
    name: "Code fence style",
    description: "Code fence markers should be consistent",
    example: "❌ \\`\\`\\` and ~~~\\n✅ All \\`\\`\\`",
    fixable: true,
    category: "code",
  },
  MD051: {
    name: "Link fragments",
    description: "Link fragments should reference valid headings",
    example: "❌ [Link](#nonexistent)\\n✅ [Link](#valid-heading)",
    fixable: true,
    category: "links",
  },
  MD052: {
    name: "Reference links not used",
    description: "All reference links should be used",
    example: "❌ Unused [ref]: url\\n✅ [text][ref]",
    fixable: true,
    category: "links",
  },

  // LINKS & REFERENCES (5 rules)
  MD034: {
    name: "Bare URLs",
    description: "Bare URLs should be wrapped in angle brackets",
    example: "❌ https://example.com\\n✅ <https://example.com>",
    fixable: true,
    category: "links",
  },
  MD035: {
    name: "Horizontal rule style",
    description: "Horizontal rules should be consistent",
    example: "❌ ===\\n---\\n✅ ---\\n---",
    fixable: true,
    category: "spacing",
  },
  MD042: {
    name: "No empty links",
    description: "Links should not be empty",
    example: "❌ []()\\n✅ [text](url)",
    fixable: false,
    category: "links",
  },
  MD053: {
    name: "Link definitions",
    description: "Link definitions should be valid",
    example: "❌ [ref]: \\n✅ [ref]: url",
    fixable: false,
    category: "links",
  },
  MD054: {
    name: "HTML comments",
    description: "HTML comment syntax should be valid",
    example: "❌ <!- comment ->\\n✅ <!-- comment -->",
    fixable: false,
    category: "html",
  },

  // ADVANCED & MISCELLANEOUS (8 rules)
  MD013: {
    name: "Line length",
    description: "Lines should not exceed specified length (default: 80)",
    example: "❌ Very long line that exceeds the limit\\n✅ Shorter line",
    fixable: false,
    category: "spacing",
  },
  MD014: {
    name: "Dollar signs in code blocks",
    description: "No dollar signs in shell code blocks",
    example: "❌ \\`\\`\\`bash\\n$ command\\n\\`\\`\\`\\n✅ \\`\\`\\`bash\\ncommand\\n\\`\\`\\`",
    fixable: false,
    category: "code",
  },
  MD033: {
    name: "Inline HTML",
    description: "Avoid inline HTML in markdown",
    example: "❌ <b>Bold</b>\\n✅ **Bold**",
    fixable: false,
    category: "html",
  },
  MD036: {
    name: "Emphasis as heading",
    description: "Avoid using emphasis to denote headings",
    example: "❌ **Heading**\\n✅ ## Heading",
    fixable: false,
    category: "headers",
  },
  MD043: {
    name: "Required heading structure",
    description: "Enforce required heading structure",
    example: "❌ Missing required headings\\n✅ All required headings present",
    fixable: false,
    category: "headers",
  },
  MD044: {
    name: "Proper names case",
    description: "Proper names should have correct casing",
    example: "❌ javascript\\n✅ JavaScript",
    fixable: false,
    category: "text",
  },
  MD045: {
    name: "Images with alt text",
    description: "Images should have alt text",
    example: "❌ ![](image.png)\\n✅ ![alt text](image.png)",
    fixable: false,
    category: "images",
  },
  MD055: {
    name: "Table header format",
    description: "Table headers should have proper format",
    example: "❌ Wrong table format\\n✅ | Header |",
    fixable: false,
    category: "tables",
  },
};

/**
 * [P0][LINT][CLI] Generate Configuration File
 * Creates .markdownlint-cli2.jsonc from profile
 */
export function generateConfigFile(profileName = "standard", outputPath = "./.markdownlint-cli2.jsonc") {
  const profile = RULE_PROFILES[profileName];
  if (!profile) {
    throw new Error(
      `Invalid profile "${profileName}". Choose from: ${Object.keys(RULE_PROFILES).join(", ")}`
    );
  }

  const config = {
    config: profile.rules,
    fix: false,
    globs: ["**/*.md"],
    ignores: ["node_modules", ".git", "dist", "build", ".next", "packages/*/node_modules"],
  };

  writeFileSync(outputPath, JSON.stringify(config, null, 2));
  return config;
}

/**
 * [P0][LINT][CLI] Generate Summary Report
 * Creates detailed report of all linting rules
 */
export function generateSummaryReport() {
  const report = {
    title: "Markdown Linting Rules Library",
    timestamp: new Date().toISOString(),
    profiles: RULE_PROFILES,
    autoFixableRules: AUTO_FIXABLE_RULES,
    ruleDescriptions: RULE_DESCRIPTIONS,
    statistics: {
      totalRules: Object.keys(RULE_DESCRIPTIONS).length,
      autoFixableCount: Object.values(AUTO_FIXABLE_RULES).filter((r) => r.fixable).length,
      strictRulesEnabled: Object.keys(RULE_PROFILES.strict.rules).length,
      standardRulesEnabled: Object.keys(RULE_PROFILES.standard.rules).length,
      lenientRulesEnabled: Object.keys(RULE_PROFILES.lenient.rules).length,
    },
  };

  return report;
}

/**
 * [P0][LINT][CLI] Command-Line Interface
 * Run as: node index.mjs [profile] [--output path]
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const profileName = args[0] || "standard";
  const outputIdx = args.indexOf("--output");
  const outputPath = outputIdx >= 0 ? args[outputIdx + 1] : "./.markdownlint-cli2.jsonc";

  try {
    const config = generateConfigFile(profileName, outputPath);
    console.log(`✅ Generated ${profileName} profile at ${resolve(outputPath)}`);
    console.log(JSON.stringify(config, null, 2));

    const report = generateSummaryReport();
    console.log(`\n📊 Statistics:`);
    console.log(`  Total Rules: ${report.statistics.totalRules}`);
    console.log(`  Auto-Fixable: ${report.statistics.autoFixableCount}`);
    console.log(`  Strict: ${report.statistics.strictRulesEnabled} rules`);
    console.log(`  Standard: ${report.statistics.standardRulesEnabled} rules`);
    console.log(`  Lenient: ${report.statistics.lenientRulesEnabled} rules`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

export default { RULE_PROFILES, AUTO_FIXABLE_RULES, RULE_DESCRIPTIONS, generateConfigFile, generateSummaryReport };
