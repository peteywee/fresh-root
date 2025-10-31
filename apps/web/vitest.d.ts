/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import type { Assertion, AsymmetricMatchersContaining } from 'vitest'

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, void> {}
}
