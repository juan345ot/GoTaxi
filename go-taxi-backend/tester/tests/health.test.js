const getApp = require('../utils/request');
const { connect, disconnect } = require('../utils/mongoMemory');
const endpoints = require('../config/endpoints');

describe('Healthcheck', () => {
  beforeAll(async () => { await connect(); });
  afterAll(async () => { await disconnect(); });

  it('GET /health => 200', async () => {
    const res = await getApp().get(endpoints.health);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});
