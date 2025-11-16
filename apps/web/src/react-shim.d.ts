// [P2][APP][CODE] React Shim D type definitions
// Tags: P2, APP, CODE
// Minimal React type shims for local development when `@types/react` isn't installed.
// These live in a .d.ts so the compiler can pick them up without augmenting modules
// inline inside TSX files. Replace with proper `@types/react` when available.
declare module "react" {
  // Hooks (minimal signatures)
  export function useCallback<T extends (...args: unknown[]) => any>(fn: T): T;
  export function useEffect(effect: (...args: any[]) => any, deps?: any[]): void;
  export function useState<T = any>(initial?: T): [T, (v: T) => void];

  // Common symbols that the app uses
  export const Suspense: any;
  export function memo<T extends (...args: any[]) => any>(component: T): T;

  // Allow importing React default (rare in this codebase but harmless)
  const React: any;
  export default React;
}

// Minimal JSX global so TS accepts intrinsic elements in TSX files.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
