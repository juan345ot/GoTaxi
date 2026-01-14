module.exports = {
  testEnvironment: 'node',
  rootDir: '..',
  testMatch: ['<rootDir>/tester/tests/trip.test.js', '<rootDir>/tester/tests/user.test.js'],
  globalSetup: '<rootDir>/tester/globalSetup.js',
  globalTeardown: '<rootDir>/tester/globalTeardown.js',
  setupFilesAfterEnv: ['<rootDir>/tester/integration.setup.js'],
  restoreMocks: true,
  clearMocks: true,
  resetMocks: true,
  maxWorkers: 1, // estable con MongoMemory
  testTimeout: 30000, // 30 segundos para tests de integración
};
