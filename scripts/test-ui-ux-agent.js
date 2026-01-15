#!/usr/bin/env node
/**
 * UI/UX Specialist Agent - Configuration Test Suite
 * 
 * Tests all invocation methods, contexts, and autocomplete configurations
 * Run with: node scripts/test-ui-ux-agent.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}`),
  test: (num, desc) => console.log(`\n${colors.cyan}Test ${num}:${colors.reset} ${desc}`),
  result: (passed, total) => {
    const pct = Math.round((passed / total) * 100);
    const icon = pct === 100 ? '✅' : pct >= 80 ? '⚠️ ' : '❌';
    console.log(`\n${icon} ${colors.bold}Results: ${passed}/${total} passed (${pct}%)${colors.reset}`);
  }
};

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    log.success(message);
    testsPassed++;
  } else {
    log.error(message);
    testsFailed++;
  }
}

// ============================================================================
// MAIN TEST SUITE
// ============================================================================

console.log(`\n${colors.bold}${colors.cyan}UI/UX Specialist Agent - Configuration Tests${colors.reset}`);
console.log(`${colors.gray}Testing invocation methods, contexts, and autocomplete${colors.reset}\n`);

// Test 1: File Structure
log.header('Test Suite 1: File Structure');
log.test(1, 'All configuration files exist');

const requiredFiles = {
  '.claude/agents/ui-ux-specialist/AGENT.md': 'Agent manifest',
  '.claude/agents/ui-ux-specialist/config.js': 'Autocomplete config',
  '.claude/agents/ui-ux-specialist/README.md': 'Agent documentation',
  '.github/prompts/ui-ux-agent.md': 'Detailed persona'
};

Object.entries(requiredFiles).forEach(([file, desc]) => {
  assert(fs.existsSync(file), `${file} (${desc})`);
});

// Test 2: AGENT.md YAML Frontmatter
log.header('Test Suite 2: AGENT.md Manifest');
log.test(2, 'YAML frontmatter is valid');

const agentContent = fs.readFileSync('.claude/agents/ui-ux-specialist/AGENT.md', 'utf8');
const frontmatterMatch = agentContent.match(/^---\n([\s\S]*?)\n---/);
assert(frontmatterMatch !== null, 'Frontmatter block exists (--- ... ---)');

const requiredFrontmatterFields = ['name', 'description', 'invocations', 'contexts', 'keywords'];
if (frontmatterMatch) {
  const yaml = frontmatterMatch[1];
  requiredFrontmatterFields.forEach(field => {
    assert(yaml.includes(field + ':'), `Frontmatter includes '${field}'`);
  });
}

// Test 3: Invocation Patterns
log.header('Test Suite 3: Invocation Patterns');
log.test(3, 'All invocation methods configured');

const config = require(path.resolve('.claude/agents/ui-ux-specialist/config.js')).agent;

const requiredMentions = ['@ui-ux', '@ux', '@design'];
requiredMentions.forEach(mention => {
  assert(config.invocations.mentions.includes(mention), `Mention '${mention}' available`);
});

const requiredCommands = ['/ui-ux', '/design'];
requiredCommands.forEach(cmd => {
  assert(config.invocations.slashCommands.includes(cmd), `Slash command '${cmd}' available`);
});

assert(config.invocations.aliases.length > 0, `${config.invocations.aliases.length} aliases configured`);

// Test 4: Context Availability
log.header('Test Suite 4: Context Availability');
log.test(4, 'Agent available in all required contexts');

const requiredContexts = ['chat', 'pull-requests', 'issues', 'code-review', 'text-boxes'];
requiredContexts.forEach(ctx => {
  const key = ctx === 'pull-requests' ? 'pull-requests' : ctx;
  assert(
    config.contexts[key] === true,
    `Available in ${ctx}`
  );
});

// Test 5: Autocomplete Configuration
log.header('Test Suite 5: Autocomplete Configuration');
log.test(5, 'Autocomplete is properly configured');

assert(config.autocomplete.enabled === true, 'Autocomplete enabled');
assert(config.autocomplete.triggerChars.includes('@'), "Trigger char '@' included");
assert(config.autocomplete.triggerChars.includes('/'), "Trigger char '/' included");
assert(config.autocomplete.minChars === 1, 'Minimum 1 character to trigger');
assert(config.autocomplete.debounce === 100, 'Debounce set to 100ms');
assert(config.autocomplete.priority === 10, 'High priority (10)');

// Test 6: Autocomplete Suggestions
log.header('Test Suite 6: Autocomplete Suggestions');
log.test(6, 'Context-aware suggestions available');

assert(config.autocomplete.suggestions.default.length > 0, 'Default suggestions exist');
assert(config.autocomplete.suggestions.pr.length > 0, 'PR-specific suggestions exist');
assert(config.autocomplete.suggestions.issue.length > 0, 'Issue-specific suggestions exist');
assert(config.autocomplete.suggestions.code.length > 0, 'Code-specific suggestions exist');

console.log(`   ${colors.gray}Default: ${config.autocomplete.suggestions.default.length} suggestions${colors.reset}`);
console.log(`   ${colors.gray}PR: ${config.autocomplete.suggestions.pr.length} suggestions${colors.reset}`);
console.log(`   ${colors.gray}Issue: ${config.autocomplete.suggestions.issue.length} suggestions${colors.reset}`);
console.log(`   ${colors.gray}Code: ${config.autocomplete.suggestions.code.length} suggestions${colors.reset}`);

// Test 7: PR/Issue Integration
log.header('Test Suite 7: PR/Issue Integration');
log.test(7, 'PR and issue templates configured');

assert(config.prIntegration.enabled === true, 'PR integration enabled');
assert(config.prIntegration.inlineComments === true, 'PR inline comments enabled');
assert(config.issueIntegration.enabled === true, 'Issue integration enabled');
assert(config.issueIntegration.inlineComments === true, 'Issue inline comments enabled');

assert(Object.keys(config.prIntegration.templates).length > 0, 'PR templates configured');
assert(Object.keys(config.issueIntegration.templates).length > 0, 'Issue templates configured');

// Test 8: Keyboard Shortcuts
log.header('Test Suite 8: Keyboard Shortcuts');
log.test(8, 'Shortcuts configured for all platforms');

assert(config.shortcuts.windows !== undefined, 'Windows shortcuts configured');
assert(config.shortcuts.mac !== undefined, 'Mac shortcuts configured');
assert(config.shortcuts.linux !== undefined, 'Linux shortcuts configured');

// Test 9: Capabilities and Tags
log.header('Test Suite 9: Capabilities and Tags');
log.test(9, 'Agent capabilities and tags defined');

assert(config.capabilities.length >= 10, `${config.capabilities.length} capabilities defined`);
assert(config.tags.length >= 8, `${config.tags.length} tags defined`);
assert(config.keywords.length >= 15, `${config.keywords.length} keywords defined`);

// Test 10: VS Code Settings
log.header('Test Suite 10: VS Code Settings');
log.test(10, 'VS Code is configured for agent discovery');

const vscodeSettings = JSON.parse(fs.readFileSync('.vscode/settings.json', 'utf8'));

assert(vscodeSettings['claude.agents']?.enabled === true, 'claude.agents.enabled = true');
assert(vscodeSettings['claude.agents']?.discoverable === true, 'claude.agents.discoverable = true');
assert(vscodeSettings['claude.agents']?.showAutocomplete === true, 'claude.agents.showAutocomplete = true');

assert(vscodeSettings['claude.agentAutocomplete']?.enabled === true, 'claude.agentAutocomplete.enabled = true');
assert(vscodeSettings['claude.agentAutocomplete']?.showSuggestions === true, 'claude.agentAutocomplete.showSuggestions = true');

assert(vscodeSettings['claude.mentions']?.enabled === true, 'claude.mentions.enabled = true');
assert(vscodeSettings['claude.mentions']?.inPullRequests === true, 'claude.mentions.inPullRequests = true');
assert(vscodeSettings['claude.mentions']?.inIssues === true, 'claude.mentions.inIssues = true');
assert(vscodeSettings['claude.mentions']?.inTextBoxes === true, 'claude.mentions.inTextBoxes = true');

// Test 11: File Content Validation
log.header('Test Suite 11: File Content Validation');
log.test(11, 'Configuration files have required content');

assert(agentContent.includes('UI/UX Specialist'), 'AGENT.md has agent name');
assert(agentContent.includes('Quick Invocation') || agentContent.includes('invocation'), 'AGENT.md documents invocation');

const configContent = fs.readFileSync('.claude/agents/ui-ux-specialist/config.js', 'utf8');
assert(configContent.includes('ui-ux-specialist'), 'config.js references correct agent ID');
assert(configContent.includes('autocomplete'), 'config.js has autocomplete settings');

const readmeContent = fs.readFileSync('.claude/agents/ui-ux-specialist/README.md', 'utf8');
assert(readmeContent.includes('Invocation Methods'), 'README.md documents invocation methods');
assert(readmeContent.includes('Test'), 'README.md includes test instructions');

// ============================================================================
// RESULTS
// ============================================================================

log.header('Test Results');
log.result(testsPassed, testsPassed + testsFailed);

if (testsFailed === 0) {
  console.log(`\n${colors.green}${colors.bold}🎉 All tests passed! Agent is ready for use.${colors.reset}`);
  console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
  console.log('  1. Try typing @ui-ux in chat');
  console.log('  2. Try /ui-ux slash command');
  console.log('  3. Mention agent in a PR or issue');
  console.log('  4. Check autocomplete on @ui and /de');
  process.exit(0);
} else {
  console.log(`\n${colors.red}${colors.bold}⚠️  ${testsFailed} test(s) failed.${colors.reset}`);
  console.log(`${colors.cyan}Please review the configuration files.${colors.reset}\n`);
  process.exit(1);
}
