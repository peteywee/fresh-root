// prettier.config.cjs
// Local Prettier configuration for Fresh Root (no external @iac-fresh dependencies).

/** @type {import("prettier").Config} */
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",
  overrides: [
    {
      files: ["*.md", "*.mdx"],
      options: {
        proseWrap: "always",
      },
    },
    {
      files: ["*.yml", "*.yaml"],
      options: {
        singleQuote: false,
      },
    },
  ],
};
