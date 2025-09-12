module.exports = {
  configure: jest.fn(),
  preferences: {
    create: jest.fn().mockResolvedValue({
      body: { id: 'pref_test_123', init_point: 'https://mp.test/pref_test_123' },
    }),
  },
};
