// [P1][API][CONFIG] ESLint configuration for API Framework SDK usage
// Tags: P1, API, CONFIG, SDK, CODE_QUALITY

/**
 * ESLint configuration optimized for @fresh-schedules/api-framework usage
 * Integrates Pattern Protocol safeguard rules for SDK endpoints
 */

module.exports = {
  overrides: [
    {
      files: ["**/app/api/**/*.ts", "**/app/api/**/*.tsx"],
      rules: {
        // SAFEGUARD: SDK factory patterns don't always need await (87x occurrences)
        // Pattern: Handler functions that return NextResponse.json() directly
        "@typescript-eslint/require-await": "warn",
        
        // SAFEGUARD: Firebase SDK returns untyped data (45x occurrences) 
        // Pattern: Firestore doc.data(), snapshot results
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-unsafe-member-access": "warn", 
        "@typescript-eslint/no-unsafe-return": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
        "@typescript-eslint/no-unsafe-argument": "warn",
        
        // SAFEGUARD: React event handlers with promises (8x occurrences)
        // Pattern: onClick handlers that call async SDK methods
        "@typescript-eslint/no-misused-promises": "warn",
        
        // SAFEGUARD: Unused parameters in SDK handlers (common pattern)
        // Pattern: Handler destructures { request, input, context, params } but only uses some
        "@typescript-eslint/no-unused-vars": [
          "warn",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
          },
        ],
        
        // SAFEGUARD: SDK endpoints often have simple return patterns
        // Pattern: Single NextResponse.json() return in handler
        "prefer-const": "warn",
        
        // SAFEGUARD: Firebase errors have dynamic messages
        // Pattern: catch (err) { console.error(err.message) }
        "@typescript-eslint/restrict-template-expressions": "warn",
      },
    },
    {
      files: ["**/app/api/**/__tests__/**/*.ts", "**/app/api/**/*.test.ts"],
      rules: {
        // TEST: Allow any patterns in test files
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-explicit-any": "off",
        
        // TEST: Mock functions often have unused parameters
        "@typescript-eslint/no-unused-vars": "off",
        
        // TEST: Test descriptions can be verbose
        "max-len": "off",
      },
    },
  ],
  
  // SDK-specific environment settings
  env: {
    node: true,
    es2022: true,
  },
  
  // SDK requires these globals from Next.js
  globals: {
    NextRequest: "readonly",
    NextResponse: "readonly",
  },
  
  settings: {
    // Help TypeScript understand SDK imports
    "import/resolver": {
      typescript: {
        project: ["apps/web/tsconfig.json", "packages/*/tsconfig.json"],
      },
    },
  },
};