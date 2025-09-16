module.exports = {
  testEnvironment: 'node',
  rootDir: '..',
  testMatch: ['<rootDir>/tester/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tester/jest.setup.js'],
  globalTeardown: '<rootDir>/tester/globalTeardown.js',
  restoreMocks: true,
  clearMocks: true,
  resetMocks: true,
  maxWorkers: 1, // estable con MongoMemory
};
