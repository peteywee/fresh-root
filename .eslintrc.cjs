/** Unified ESLint config across workspaces */
module.exports = {
  root: true,
  ignorePatterns: ["**/dist/**", "**/.next/**", "**/coverage/**", "**/.firebase/**"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  settings: {
    react: { version: "detect" }
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "next/core-web-vitals",
    "prettier"
  ],
  plugins: ["import"],
  rules: {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", ["parent", "sibling", "index"]],
      "newlines-between": "always"
    }],
    "react/jsx-no-useless-fragment": "warn",
    "react/prop-types": "off"
  }
};
