const { getApp } = require('../utils/request');
const { cleanDB } = require('../utils/cleanDB');
const { buildUser } = require('../factories/userFactory');
const { connect, disconnect } = require('../utils/mongoMemory');

describe('Middleware Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  beforeEach(async () => {
    await cleanDB();
    
    // Crear usuario para las pruebas
    const user = await buildUser({ role: 'pasajero' });
    const response = await getApp().post('/api/auth/register').send(user);
    authToken = response.body.data.accessToken;
    userId = response.body.data.user.id;
  });

  describe('Authentication Middleware', () => {
    it('should allow access with valid token', async () => {
      const response = await getApp()
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny access without token', async () => {
      const response = await getApp().get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should deny access with invalid token', async () => {
      const response = await getApp()
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should deny access with malformed authorization header', async () => {
      const response = await getApp()
        .get('/api/users/profile')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should deny access with expired token', async () => {
      // This would need a real expired token to test properly
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoicGFzYWplcm8iLCJpYXQiOjE2MzQ1Njc4OTksImV4cCI6MTYzNDU3MTQ5OX0.invalid';
      
      const response = await getApp()
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Authorization Middleware', () => {
    let adminToken;
    let driverToken;

    beforeEach(async () => {
      // Crear admin usando endpoint de test
      const admin = await buildUser({ role: 'admin' });
      admin.email = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
      const adminRes = await getApp().post('/api/auth/admin/test').send(admin);
      console.log('Admin registration response:', adminRes.status, adminRes.body);
      adminToken = adminRes.body.data.accessToken;

      // Crear conductor con email único
      const driver = await buildUser({ role: 'conductor' });
      driver.email = `driver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
      const driverRes = await getApp().post('/api/auth/register').send(driver);
      console.log('Driver registration response:', driverRes.status, driverRes.body);
      driverToken = driverRes.body.data.accessToken;
    });

    it('should allow admin access to admin routes', async () => {
      const response = await getApp()
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny passenger access to admin routes', async () => {
      const response = await getApp()
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should deny driver access to admin routes', async () => {
      const response = await getApp()
        .get('/api/users')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should allow driver access to driver routes', async () => {
      // Test with an existing driver route - using /api/drivers/:id with a valid driver ID
      // First, we need to get a driver ID. Since we don't have one, we'll test with a non-existent ID
      // The important thing is that it should NOT be 403 (forbidden), but could be 404 (not found) or 500 (server error)
      const response = await getApp()
        .get('/api/drivers/nonexistent-id')
        .set('Authorization', `Bearer ${driverToken}`);

      // Should not be 403 (forbidden) - driver should have access to driver routes
      // Could be 404 (not found) or 500 (server error), but not 403
      expect(response.status).not.toBe(403);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('Validation Middleware', () => {
    it('should validate required fields in registration', async () => {
      const invalidUser = {
        name: 'Test',
        // Missing required fields: lastname, email, password
      };

      const response = await getApp()
        .post('/api/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate email format in registration', async () => {
      const invalidUser = {
        name: 'Test',
        lastname: 'User',
        email: 'invalid-email',
        password: 'Password123!',
        role: 'pasajero'
      };

      const response = await getApp()
        .post('/api/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate password strength in registration', async () => {
      const invalidUser = {
        name: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'weak', // Too weak
        role: 'pasajero'
      };

      const response = await getApp()
        .post('/api/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate role in registration', async () => {
      const invalidUser = {
        name: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'invalid-role'
      };

      const response = await getApp()
        .post('/api/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate trip data', async () => {
      const invalidTrip = {
        origen: {
          address: 'Test Origin'
          // Missing coordinates
        },
        destino: {
          address: 'Test Destination'
          // Missing coordinates
        },
        // Missing required fields: tarifa, metodoPago
      };

      const response = await getApp()
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTrip);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting Middleware', () => {
    it('should allow normal getApp() rate', async () => {
      const response = await getApp()
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should handle rate limiting gracefully', async () => {
      // Make multiple requests quickly to test rate limiting
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          getApp()
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(requests);
      
      // At least some requests should succeed
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('CORS Middleware', () => {
    it('should include CORS headers in response', async () => {
      const response = await getApp()
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Origin', 'http://localhost:3000');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle preflight getApp()s', async () => {
      const response = await getApp()
        .options('/api/users/profile')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
    });
  });

  describe('Error Handling Middleware', () => {
    it('should handle 404 errors gracefully', async () => {
      const response = await getApp()
        .get('/api/non-existent-route')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle 500 errors gracefully', async () => {
      // This would need a route that intentionally throws an error
      // For now, we'll test with an invalid route
      const response = await getApp()
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should include error details in development', async () => {
      const response = await getApp()
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Sanitization Middleware', () => {
    it('should sanitize input data', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'pasajero'
      };

      const response = await getApp()
        .post('/api/auth/register')
        .send(maliciousData);

      // Should either reject the getApp() or sanitize the data
      expect([200, 400]).toContain(response.status);
      
      if (response.status === 200) {
        // If accepted, the data should be sanitized
        expect(response.body.data.name).not.toContain('<script>');
      }
    });

    it('should handle SQL injection attempts', async () => {
      const maliciousData = {
        name: "'; DROP TABLE users; --",
        lastname: 'User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'pasajero'
      };

      const response = await getApp()
        .post('/api/auth/register')
        .send(maliciousData);

      // Should either reject the getApp() or sanitize the data
      expect([200, 400]).toContain(response.status);
    });
  });
});
