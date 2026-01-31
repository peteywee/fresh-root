/**
 * PR Specialist Agent Configuration
 *
 * Machine-readable config for autocomplete, suggestions, and VS Code integration.
 */

module.exports.agent = {
  id: "pr-specialist",
  name: "PR Specialist",
  description: "Full pull request lifecycle management - create, review, update, and merge PRs",
  version: "1.0.0",

  invocations: {
    mentions: ["@pr", "@pull-request", "@pr-specialist"],
    slashCommands: ["/pr", "/pull-request", "/create-pr"],
    aliases: ["pr-helper", "pr-manager"],
  },

  contexts: {
    chat: true,
    "pull-requests": true,
    issues: true,
    "code-review": true,
    textboxes: true,
  },

  autocomplete: {
    enabled: true,
    minChars: 1,
    debounceMs: 100,
    triggerCharacters: ["@", "/"],
    suggestions: [
      {
        label: "@pr create",
        description: "Create a new pull request from current branch",
        insertText: "@pr create",
      },
      {
        label: "@pr review",
        description: "Review an existing pull request",
        insertText: "@pr review ",
      },
      {
        label: "@pr merge",
        description: "Merge an approved pull request",
        insertText: "@pr merge ",
      },
      {
        label: "@pr update",
        description: "Update PR with latest changes",
        insertText: "@pr update",
      },
      {
        label: "@pr status",
        description: "Check PR status and CI results",
        insertText: "@pr status ",
      },
      {
        label: "/create-pr",
        description: "Create PR with auto-generated description",
        insertText: "/create-pr",
      },
    ],
  },

  capabilities: [
    "pr-creation",
    "pr-review",
    "pr-merge",
    "branch-management",
    "commit-analysis",
    "ci-status-check",
    "conflict-detection",
    "reviewer-assignment",
    "label-management",
  ],

  tags: [
    "git",
    "github",
    "pull-request",
    "merge",
    "review",
    "branch",
    "ci-cd",
  ],

  prIntegration: {
    enabled: true,
    templates: {
      create: {
        title: "[type]: [description]",
        body: "## Summary\n\n## Test plan\n\n## Related issues",
      },
    },
    triggers: ["@pr", "/pr"],
  },

  shortcuts: {
    windows: "Ctrl+Shift+P",
    mac: "Cmd+Shift+P",
    linux: "Ctrl+Shift+P",
  },

  settings: {
    defaultMergeStrategy: "squash",
    autoDeleteBranch: true,
    requireApproval: true,
    requireCIPass: true,
    branchNaming: {
      pattern: "{type}/{ticket}-{description}",
      regex:
        "^(feature|fix|refactor|chore|hotfix)\\/[A-Z]+-[0-9]+-[a-z0-9-]+$|^(feature|fix|refactor|chore)\\/[a-z0-9-]+$",
      examples: [
        "feature/FS-123-add-time-off",
        "fix/FS-456-schedule-calc",
        "refactor/FS-789-cleanup",
        "chore/update-deps",
        "hotfix/FS-999-auth-bypass",
      ],
    },
  },
};

module.exports.commands = {
  create: {
    description: "Create a new pull request",
    usage: "@pr create [--base <branch>] [--title <title>]",
    examples: [
      "@pr create",
      "@pr create --base main",
      "@pr create --title 'feat: add new feature'",
    ],
  },
  review: {
    description: "Review an existing pull request",
    usage: "@pr review <pr-number>",
    examples: [
      "@pr review 123",
      "@pr review #123",
    ],
  },
  merge: {
    description: "Merge an approved pull request",
    usage: "@pr merge <pr-number> [--strategy <squash|rebase|merge>]",
    examples: [
      "@pr merge 123",
      "@pr merge 123 --strategy squash",
    ],
  },
  update: {
    description: "Update PR branch with latest changes",
    usage: "@pr update [<pr-number>]",
    examples: [
      "@pr update",
      "@pr update 123",
    ],
  },
  status: {
    description: "Check PR status and CI results",
    usage: "@pr status <pr-number>",
    examples: [
      "@pr status 123",
    ],
  },
};
