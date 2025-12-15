/**
 * FRESH SCHEDULES - ORCHESTRATOR
 * 
 * Routes tasks to correct agents, supports parallel execution.
 * Designed for VS Code Agent Mode integration.
 * 
 * @version 1.0.0
 */

// =============================================================================
// TYPES
// =============================================================================

type AgentId = 'architect' | 'refactor' | 'guard' | 'auditor';
type ExecutionMode = 'delegate' | 'composite' | 'direct';

interface RoutingDecision {
  mode: ExecutionMode;
  agents: AgentId[];
  params: Record<string, string>;
}

interface AgentResult {
  agent: AgentId;
  status: 'success' | 'error' | 'timeout';
  output?: string;
  error?: string;
  duration: number;
}

interface OrchestratorResult {
  mode: ExecutionMode;
  agents: AgentResult[];
  synthesis?: string;
  timestamp: string;
}

// =============================================================================
// TRIGGER PATTERNS
// =============================================================================

const EXPLICIT_TRIGGERS: { pattern: RegExp; agent: AgentId }[] = [
  { pattern: /@architect\s+(.+)/i, agent: 'architect' },
  { pattern: /@refactor\s+(.+)/i, agent: 'refactor' },
  { pattern: /@guard\s+(.+)/i, agent: 'guard' },
  { pattern: /@auditor\s+(.+)/i, agent: 'auditor' },
  { pattern: /^as\s+fresh\s+architect/i, agent: 'architect' },
  { pattern: /^as\s+fresh\s+refactor/i, agent: 'refactor' },
  { pattern: /^as\s+fresh\s+guard/i, agent: 'guard' },
  { pattern: /^as\s+fresh\s+auditor/i, agent: 'auditor' },
];

const INTENT_KEYWORDS: { keywords: string[]; agent: AgentId }[] = [
  { 
    keywords: ['design', 'architect', 'schema', 'structure', 'api design', 'how should'],
    agent: 'architect' 
  },
  { 
    keywords: ['fix', 'refactor', 'pattern', 'violation', 'cleanup', 'migrate'],
    agent: 'refactor' 
  },
  { 
    keywords: ['review', 'pr', 'pull request', 'merge', 'ready', 'approve'],
    agent: 'guard' 
  },
  { 
    keywords: ['report', 'audit', 'compliance', 'metrics', 'score', 'how are we'],
    agent: 'auditor' 
  },
];

const MULTI_AGENT_SIGNALS = [
  'design and review',
  'find and fix',
  'audit and fix',
  'comprehensive',
  'full analysis',
  'multiple perspectives',
];

// =============================================================================
// ROUTING LOGIC
// =============================================================================

export function parseExplicitTrigger(input: string): { agent: AgentId; params: string } | null {
  for (const { pattern, agent } of EXPLICIT_TRIGGERS) {
    const match = input.match(pattern);
    if (match) {
      return { agent, params: match[1] || '' };
    }
  }
  return null;
}

export function detectIntent(input: string): AgentId | null {
  const lower = input.toLowerCase();
  
  for (const { keywords, agent } of INTENT_KEYWORDS) {
    if (keywords.some(kw => lower.includes(kw))) {
      return agent;
    }
  }
  
  return null;
}

export function isMultiAgentTask(input: string): boolean {
  const lower = input.toLowerCase();
  return MULTI_AGENT_SIGNALS.some(signal => lower.includes(signal));
}

export function detectRequiredAgents(input: string): AgentId[] {
  const lower = input.toLowerCase();
  const agents: AgentId[] = [];
  
  if (lower.includes('design') || lower.includes('architect')) {
    agents.push('architect');
  }
  if (lower.includes('fix') || lower.includes('refactor')) {
    agents.push('refactor');
  }
  if (lower.includes('review') || lower.includes('pr')) {
    agents.push('guard');
  }
  if (lower.includes('audit') || lower.includes('report')) {
    agents.push('auditor');
  }
  
  // Default to architect + guard for generic multi-agent
  if (agents.length === 0) {
    agents.push('architect', 'guard');
  }
  
  return agents;
}

export function routeTask(input: string): RoutingDecision {
  // 1. Check for explicit agent triggers
  const explicit = parseExplicitTrigger(input);
  if (explicit) {
    return {
      mode: 'delegate',
      agents: [explicit.agent],
      params: { task: explicit.params }
    };
  }
  
  // 2. Check for multi-agent signals
  if (isMultiAgentTask(input)) {
    return {
      mode: 'composite',
      agents: detectRequiredAgents(input),
      params: { task: input }
    };
  }
  
  // 3. Route by intent
  const intent = detectIntent(input);
  if (intent) {
    return {
      mode: 'delegate',
      agents: [intent],
      params: { task: input }
    };
  }
  
  // 4. Default: handle directly
  return {
    mode: 'direct',
    agents: [],
    params: { task: input }
  };
}

// =============================================================================
// AGENT CONTRACTS (for reference)
// =============================================================================

export const AGENT_CONTRACTS = {
  architect: {
    name: 'FRESH Architect',
    purpose: 'Design schemas, APIs, and system structure',
    triggers: ['@architect', 'design', 'schema', 'structure'],
    outputs: ['Schema Proposal', 'API Design', 'ADR'],
    tone: 'Authoritative but collaborative',
  },
  refactor: {
    name: 'FRESH Refactor',
    purpose: 'Fix pattern violations and apply code improvements',
    triggers: ['@refactor', 'fix', 'pattern'],
    outputs: ['Unified Diff', 'Before/After'],
    tone: 'Precise, minimal commentary',
  },
  guard: {
    name: 'FRESH Guard',
    purpose: 'Review PRs and gate merges',
    triggers: ['@guard', 'review', 'PR', 'merge'],
    outputs: ['Verdict', 'Violation List'],
    tone: 'Firm but fair',
  },
  auditor: {
    name: 'FRESH Auditor',
    purpose: 'Generate compliance reports and metrics',
    triggers: ['@auditor', 'report', 'audit', 'metrics'],
    outputs: ['Compliance Report', 'Metrics'],
    tone: 'Neutral, data-driven',
  },
};

// =============================================================================
// EXECUTION (VS Code Agent Mode Integration)
// =============================================================================

export async function executeAgent(
  agent: AgentId,
  params: Record<string, string>,
  timeout = 60000
): Promise<AgentResult> {
  const start = Date.now();
  
  try {
    // In VS Code Agent Mode, this would dispatch to the actual agent
    // For now, return a placeholder that indicates the agent should handle it
    
    const contract = AGENT_CONTRACTS[agent];
    
    return {
      agent,
      status: 'success',
      output: `[${contract.name}] Ready to handle: ${params.task}\n\nOutputs: ${contract.outputs.join(', ')}`,
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      agent,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

export async function executeParallel(
  agents: AgentId[],
  params: Record<string, string>,
  timeout = 60000
): Promise<AgentResult[]> {
  const promises = agents.map(agent =>
    Promise.race([
      executeAgent(agent, params, timeout),
      new Promise<AgentResult>(resolve =>
        setTimeout(() => resolve({
          agent,
          status: 'timeout',
          error: `Agent timed out after ${timeout}ms`,
          duration: timeout,
        }), timeout)
      ),
    ])
  );
  
  return Promise.all(promises);
}

export function synthesizeResults(results: AgentResult[]): string {
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status !== 'success');
  
  let synthesis = '## Orchestrator Synthesis\n\n';
  
  if (successful.length > 0) {
    synthesis += '### Agent Outputs\n\n';
    for (const result of successful) {
      const contract = AGENT_CONTRACTS[result.agent];
      synthesis += `#### ${contract.name}\n${result.output}\n\n`;
    }
  }
  
  if (failed.length > 0) {
    synthesis += '### Issues\n\n';
    for (const result of failed) {
      synthesis += `- **${result.agent}**: ${result.error}\n`;
    }
  }
  
  return synthesis;
}

// =============================================================================
// MAIN ORCHESTRATOR
// =============================================================================

export async function orchestrate(input: string): Promise<OrchestratorResult> {
  const routing = routeTask(input);
  const timestamp = new Date().toISOString();
  
  if (routing.mode === 'direct') {
    return {
      mode: 'direct',
      agents: [],
      synthesis: 'No agent required. Handling directly.',
      timestamp,
    };
  }
  
  if (routing.mode === 'delegate') {
    const result = await executeAgent(routing.agents[0], routing.params);
    return {
      mode: 'delegate',
      agents: [result],
      timestamp,
    };
  }
  
  // Composite mode: parallel execution
  const results = await executeParallel(routing.agents, routing.params);
  const synthesis = synthesizeResults(results);
  
  return {
    mode: 'composite',
    agents: results,
    synthesis,
    timestamp,
  };
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

if (typeof process !== 'undefined' && process.argv[1]?.includes('orchestrator')) {
  const input = process.argv.slice(2).join(' ');
  
  if (!input) {
    console.log(`
FRESH SCHEDULES ORCHESTRATOR

Usage:
  npx ts-node orchestrator.ts <task>

Examples:
  npx ts-node orchestrator.ts "@architect design TimeOff"
  npx ts-node orchestrator.ts "@refactor fix route.ts"
  npx ts-node orchestrator.ts "@guard review PR#42"
  npx ts-node orchestrator.ts "@auditor report"
  npx ts-node orchestrator.ts "design and review a new feature"

Agent Contracts:
${Object.entries(AGENT_CONTRACTS).map(([id, c]) => 
  `  ${id}: ${c.purpose}`
).join('\n')}
`);
    process.exit(0);
  }
  
  orchestrate(input).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}

export default orchestrate;
