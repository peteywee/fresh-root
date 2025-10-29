module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/rules/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  }
  ,
  // Increase timeout to allow emulator startup and test environment initialization
  testTimeout: 30000
};
