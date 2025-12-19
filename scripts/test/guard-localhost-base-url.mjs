// [P0][TEST][CODE] Guard E2E base URL
// Tags: P0, TEST, CODE, E2E, SECURITY

const value = process.env.TEST_BASE_URL;

if (!value) {
  // Default in runner is localhost; nothing to validate.
  // Do not call process.exit here because this file is imported as a module.
  // Returning implicitly keeps the importing process alive.
} else {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    // If it's not a valid URL string, fail closed in CI
    if (process.env.CI) {
      throw new Error("TEST_BASE_URL must be a valid URL in CI.");
    }
    console.warn("TEST_BASE_URL is not a valid URL; ignoring in non-CI.");
    parsed = null;
  }

  if (parsed) {
    const allowedHosts = new Set(["localhost", "127.0.0.1", "::1"]);

    if (process.env.CI && !allowedHosts.has(parsed.hostname)) {
      throw new Error(
        `Refusing to run E2E against non-localhost TEST_BASE_URL in CI: ${value}`,
      );
    }
  }
}
