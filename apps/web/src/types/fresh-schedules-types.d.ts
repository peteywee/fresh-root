// [P2][APP][CODE] Fresh Schedules Types D type definitions
// Tags: P2, APP, CODE
// Minimal local module mapping to the workspace types package.
// This file intentionally re-exports the sources from `packages/types/src`
// so that imports of "@fresh-schedules/types" resolve during local dev.
declare module "@fresh-schedules/types" {
  export * from "../../../../packages/types/src";
}
