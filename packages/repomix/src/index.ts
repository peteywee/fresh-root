// [P1][LIBRARY][CODE] Repomix library wrapper exports
// Tags: P1, LIBRARY, CODE

/**
 * Repomix library integration for Fresh Schedules
 *
 * This module provides direct access to repomix functions
 * for programmatic codebase analysis and packaging.
 *
 * @example
 * ```typescript
 * import { runDefaultAction } from '@fresh-schedules/repomix';
 *
 * await runDefaultAction({
 *   targets: ['/path/to/code'],
 *   output: { style: 'markdown' },
 * });
 * ```
 */

// Re-export repomix core functions and types for library usage
export { runDefaultAction, runRemoteAction, setLogLevel } from "repomix";
export type { RepomixConfig, CliOptions } from "repomix";

/**
 * Get repomix wrapper version information
 */
export async function getVersion(): Promise<string> {
  return "0.1.0"; // @fresh-schedules/repomix version
}
