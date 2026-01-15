#!/usr/bin/env node
/**
 * UI/UX Specialist Agent Configuration
 * 
 * Enables the agent to be called with:
 * - @ui-ux, @ui/ux, @ux, @design
 * - /ui-ux, /design
 * - Available in chat, PRs, issues, code reviews, text boxes
 * - Autocomplete with smart suggestions
 */

module.exports = {
  agent: {
    id: "ui-ux-specialist",
    name: "UI/UX Specialist",
    description: "Professional UI/UX design agent for component design, accessibility, and user experience",
    
    // Invocation patterns (enables discoverability)
    invocations: {
      mentions: ["@ui-ux", "@ui/ux", "@ux", "@design"],
      slashCommands: ["/ui-ux", "/design"],
      aliases: ["ux", "design", "ui", "accessibility", "wcag", "a11y"]
    },
    
    // Contexts where agent is available
    contexts: {
      chat: true,
      "pull-requests": true,
      issues: true,
      "code-review": true,
      "text-boxes": true,
      "pr-comments": true,
      "issue-comments": true
    },
    
    // Autocomplete configuration with smart suggestions
    autocomplete: {
      enabled: true,
      priority: 10, // High priority for discovery
      triggerChars: ["@", "/"],
      minChars: 1,
      debounce: 100,
      
      // Context-aware suggestions
      suggestions: {
        default: [
          "Review this UI for accessibility",
          "Design review for this component",
          "Check WCAG compliance",
          "Improve form ergonomics",
          "Review auth UX flow",
          "Design system consistency check",
          "Mobile responsiveness review",
          "Accessibility audit",
          "Component design feedback",
          "Color contrast analysis"
        ],
        
        pr: [
          "Design/UX review of these changes",
          "Check accessibility compliance",
          "Component design feedback",
          "WCAG audit for new UI"
        ],
        
        issue: [
          "Design system question",
          "Accessibility issue review",
          "UI bug analysis",
          "UX improvement suggestion"
        ],
        
        code: [
          "Review component accessibility",
          "Design system validation",
          "Responsive design check"
        ]
      }
    },
    
    // Capabilities (what the agent can do)
    capabilities: [
      "accessibility-review",
      "design-system-validation",
      "component-design",
      "form-ergonomics",
      "responsive-design",
      "wcag-compliance",
      "auth-ux-review",
      "animation-review",
      "color-contrast-check",
      "typography-audit",
      "mobile-first-review",
      "a11y-audit",
      "keyboard-navigation-check"
    ],
    
    // Tags for discovery and indexing
    tags: [
      "design",
      "accessibility",
      "ux",
      "ui",
      "wcag",
      "a11y",
      "wcag-2.1-aa",
      "inclusive-design",
      "user-experience",
      "component-design",
      "responsive",
      "mobile-first"
    ],
    
    keywords: [
      "ui", "ux", "design", "accessibility", "components", "forms", 
      "responsive", "wcag", "a11y", "user-experience", "design-system",
      "color", "typography", "spacing", "contrast", "keyboard",
      "screen-reader", "aria", "inclusive", "usability"
    ],
    
    // PR/Issue Integration
    prIntegration: {
      enabled: true,
      autoTrigger: false, // User must explicitly invoke
      inlineComments: true, // Can be mentioned in PR comments
      templates: {
        "design-review": {
          trigger: "design review",
          message: "Request design/UX review from @ui-ux specialist"
        },
        "accessibility-check": {
          trigger: "accessibility",
          message: "Request accessibility audit from @ui-ux specialist"
        },
        "component-design": {
          trigger: "component design",
          message: "Request component design feedback from @ui-ux specialist"
        },
        "wcag": {
          trigger: "wcag",
          message: "Request WCAG compliance check from @ui-ux specialist"
        }
      }
    },
    
    issueIntegration: {
      enabled: true,
      autoTrigger: false,
      inlineComments: true,
      templates: {
        "ui-bug": {
          trigger: "ui",
          message: "UI issue - tag @ui-ux specialist for review"
        },
        "accessibility": {
          trigger: "accessibility",
          message: "Accessibility issue - tag @ui-ux specialist"
        },
        "design-system": {
          trigger: "design",
          message: "Design system question - ask @ui-ux specialist"
        }
      }
    },
    
    // Keyboard shortcuts (platform-specific)
    shortcuts: {
      windows: {
        mention: "ctrl+shift+u",     // Quick mention
        command: "ctrl+k ctrl+u"     // Quick command
      },
      mac: {
        mention: "cmd+shift+u",      // Quick mention
        command: "cmd+k cmd+u"       // Quick command
      },
      linux: {
        mention: "ctrl+shift+u",     // Quick mention
        command: "ctrl+k ctrl+u"     // Quick command
      }
    },
    
    // Settings
    settings: {
      maxSuggestions: 10,
      showExamples: true,
      showCapabilities: true,
      highlightPriority: true
    }
  }
};
