// [P2][APP][ENV] Jest Playwright Config
// Tags: P2, APP, ENV
module.exports = {
  browsers: ["chromium"],
  launchOptions: { headless: true },
  serverOptions: {
    command: "pnpm --filter @apps/web dev",
    port: 3000,
    launchTimeout: 60000,
    usedPortAction: "kill",
  },
};
module.exports = {
  browsers: ["chromium"],
  launchOptions: { headless: true },
  serverOptions: {
    command: "pnpm --filter @apps/web dev",
    port: 3000,
    launchTimeout: 60000,
    usedPortAction: "kill",
  },
};
