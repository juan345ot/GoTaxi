const { getApp } = require('../utils/request');
const { connect, disconnect } = require('../utils/mongoMemory');
const { cleanDB } = require('../utils/cleanDB');

describe('Simple API Tests', () => {
  beforeAll(async () => { 
    await connect(); 
  });
  
  afterAll(async () => { 
    await disconnect(); 
  });
  
  beforeEach(async () => { 
    await cleanDB(); 
  });

  it('should return health check', async () => {
    const response = await getApp().get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('ok', true);
    expect(response.body).toHaveProperty('service', 'go-taxi-backend');
  });

  it('should return 404 for non-existent route', async () => {
    const response = await getApp().get('/non-existent-route');
    expect(response.status).toBe(404);
  });
});
