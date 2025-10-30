module.exports = {
  testEnvironment: 'node',
  // Explicit list to avoid picking up a broken intermediate file during edits
  testMatch: [
    '**/tests/rules/firestore.spec.ts',
    '**/tests/rules/messages_receipts.spec.ts',
    '**/tests/rules/storage.fixed.spec.ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json', diagnostics: true }]
  }
  ,
  // Increase timeout to allow emulator startup and test environment initialization
  testTimeout: 30000
};
