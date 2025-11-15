// [P1][OBSERVABILITY][LOGGING] Logger
// Tags: P1, OBSERVABILITY, LOGGING
export function log(msg) {
    console.log(`[agent] ${msg}`);
}
export function ok(msg) {
    console.log(`\x1b[32m[ok]\x1b[0m ${msg}`);
}
export function warn(msg) {
    console.warn(`\x1b[33m[warn]\x1b[0m ${msg}`);
}
export function err(msg) {
    console.error(`\x1b[31m[err]\x1b[0m ${msg}`);
}
