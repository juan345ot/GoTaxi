const getApp = require('../utils/request');
const { connect, disconnect } = require('../utils/mongoMemory');
const endpoints = require('../config/endpoints');

// Quitá el .skip cuando tengas operativo el endpoint
describe.skip('Payments (Mercado Pago)', () => {
  beforeAll(async () => { await connect(); });
  afterAll(async () => { await disconnect(); });

  it('createPreference devuelve id (mock)', async () => {
    const res = await getApp()
      .post(endpoints.payments.createPreference)
      .send({ amount: 1000, currency: 'ARS', description: 'Test ride' });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id', 'pref_test_123');
  });
});