module.exports = {
  testEnvironment: 'node',
  rootDir: '..',
  testMatch: ['<rootDir>/tester/tests/**/*.test.js'],
  globalSetup: '<rootDir>/tester/globalSetup.js',
  setupFilesAfterEnv: ['<rootDir>/tester/jest.setup.js'],
  globalTeardown: '<rootDir>/tester/globalTeardown.js',
  restoreMocks: true,
  clearMocks: true,
  resetMocks: true,
  maxWorkers: 1, // estable con MongoMemory
  forceExit: true, // Forzar salida después de los tests para evitar que Jest se quede colgado
};
