// [P2][APP][CODE] Fresh Schedules Types D type definitions
// Tags: P2, APP, CODE
/**
 * Local type shim for the shared "@fresh-schedules/types" package.
 *
 * This allows the apps/web project to import the workspace types package
 * using the module specifier "@fresh-schedules/types" without additional
 * TS path config.
 *
 * It simply re-exports everything from the package's src entrypoint.
 */
declare module "@fresh-schedules/types" {
  export * from "../../../../packages/types/src";
}
