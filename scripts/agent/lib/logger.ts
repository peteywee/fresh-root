export function log(msg: string) {
  console.log(`[agent] ${msg}`);
}
export function ok(msg: string) {
  console.log(`\x1b[32m[ok]\x1b[0m ${msg}`);
}
export function warn(msg: string) {
  console.warn(`\x1b[33m[warn]\x1b[0m ${msg}`);
}
export function err(msg: string) {
  console.error(`\x1b[31m[err]\x1b[0m ${msg}`);
}
