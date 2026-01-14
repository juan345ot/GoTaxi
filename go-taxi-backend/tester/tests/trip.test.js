const { getApp } = require('../utils/request');
const { buildUser } = require('../factories/userFactory');
const { cleanDB } = require('../utils/cleanDB');
const { connect, disconnect } = require('../utils/mongoMemory');

describe('Trip API', () => {
  let authToken;
  let passengerId;
  let driverId;
  let tripId;
  let request;

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  beforeEach(async () => {
    // Limpiar base de datos antes de cada test
    await cleanDB();
    
    request = getApp();
    
    // Crear usuario pasajero
    const passenger = await buildUser({ role: 'pasajero' });
    const passengerRes = await request.post('/api/auth/register').send(passenger);
    
    // Debug: imprimir respuesta si falla
    if (passengerRes.status !== 201) {
      console.log('Error en registro de pasajero:', passengerRes.body);
    }
    
    authToken = passengerRes.body.data.accessToken;
    passengerId = passengerRes.body.data.user.id;

    // Crear usuario conductor
    const driver = await buildUser({ role: 'conductor' });
    const driverRes = await request.post('/api/auth/register').send(driver);
    
    // Debug: imprimir respuesta si falla
    if (driverRes.status !== 201) {
      console.log('Error en registro de conductor:', driverRes.body);
    }
    
    driverId = driverRes.body.data.user.id;
  });

  describe('POST /api/trips', () => {
    it('should create a new trip successfully', async () => {
      const tripData = {
        origen: {
          direccion: 'Av. Corrientes 1234, Buenos Aires',
          lat: -34.6037,
          lng: -58.3816
        },
        destino: {
          direccion: 'Av. Santa Fe 5678, Buenos Aires',
          lat: -34.5875,
          lng: -58.3974
        },
        tarifa: 1500,
        distancia_km: 5.2,
        duracion_min: 15,
        metodoPago: 'cash'
      };

      const response = await request
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData);

      // Debug: imprimir respuesta si falla
      if (response.status !== 201) {
        console.log('Error en creación de viaje:', response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.passengerId).toBe(passengerId);
      expect(response.body.data.status).toBe('pendiente');
      
      tripId = response.body.data.id;
    });

    it('should fail to create trip without required fields', async () => {
      const tripData = {
        origen: {
          direccion: 'Av. Corrientes 1234, Buenos Aires',
          lat: -34.6037,
          lng: -58.3816
        }
        // Missing destino, tarifa, etc.
      };

      const response = await request
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail to create trip without authentication', async () => {
      const tripData = {
        origen: {
          direccion: 'Av. Corrientes 1234, Buenos Aires',
          lat: -34.6037,
          lng: -58.3816
        },
        destino: {
          direccion: 'Av. Santa Fe 5678, Buenos Aires',
          lat: -34.5875,
          lng: -58.3974
        },
        tarifa: 1500,
        distancia_km: 5.2,
        duracion_min: 15,
        metodoPago: 'cash'
      };

      const response = await request
        .post('/api/trips')
        .send(tripData);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/trips/:id', () => {
    beforeEach(async () => {
      // Crear un viaje para las pruebas
      const tripData = {
        origen: {
          direccion: 'Av. Corrientes 1234, Buenos Aires',
          lat: -34.6037,
          lng: -58.3816
        },
        destino: {
          direccion: 'Av. Santa Fe 5678, Buenos Aires',
          lat: -34.5875,
          lng: -58.3974
        },
        tarifa: 1500,
        distancia_km: 5.2,
        duracion_min: 15,
        metodoPago: 'cash'
      };

      const response = await request
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData);

      tripId = response.body.data.id;
    });

    it('should get trip by id successfully', async () => {
      const response = await request
        .get(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(tripId);
    });

    it('should fail to get non-existent trip', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request
        .get(`/api/trips/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail to get trip without authentication', async () => {
      const response = await getApp().get(`/api/trips/${tripId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/trips', () => {
    beforeEach(async () => {
      // Crear varios viajes para las pruebas
      const trips = [
        {
          origen: { direccion: 'Origen 1', lat: -34.6037, lng: -58.3816 },
          destino: { direccion: 'Destino 1', lat: -34.5875, lng: -58.3974 },
          tarifa: 1000,
          distancia_km: 3.5,
          duracion_min: 10,
          metodoPago: 'cash'
        },
        {
          origen: { direccion: 'Origen 2', lat: -34.6037, lng: -58.3816 },
          destino: { direccion: 'Destino 2', lat: -34.5875, lng: -58.3974 },
          tarifa: 2000,
          distancia_km: 7.8,
          duracion_min: 20,
          metodoPago: 'card'
        }
      ];

      for (const tripData of trips) {
        await request
          .post('/api/trips')
          .set('Authorization', `Bearer ${authToken}`)
          .send(tripData);
      }
    });

    it('should get user trips with pagination', async () => {
      const response = await request
        .get('/api/trips?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(response.body.pagination).toHaveProperty('total', 2);
    });

    it('should get user trips filtered by status', async () => {
      const response = await request
        .get('/api/trips?status=pendiente')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach(trip => {
        expect(trip.status).toBe('pendiente');
      });
    });
  });

  describe('PUT /api/trips/:id/assign', () => {
    beforeEach(async () => {
      // Crear un viaje para asignar
      const tripData = {
        origen: {
          direccion: 'Av. Corrientes 1234, Buenos Aires',
          lat: -34.6037,
          lng: -58.3816
        },
        destino: {
          direccion: 'Av. Santa Fe 5678, Buenos Aires',
          lat: -34.5875,
          lng: -58.3974
        },
        tarifa: 1500,
        distancia_km: 5.2,
        duracion_min: 15,
        metodoPago: 'cash'
      };

      const response = await request
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData);

      tripId = response.body.data.id;
    });

    it('should assign driver to trip successfully', async () => {
      // Crear un admin para asignar conductor usando el endpoint de test
      const admin = await buildUser({ role: 'admin' });
      admin.email = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
      const adminRes = await request.post('/api/auth/admin/test').send(admin);
      
      // Verificar que el registro fue exitoso
      if (adminRes.status !== 201) {
        console.log('Error en registro de admin:', adminRes.body);
      }
      
      expect(adminRes.status).toBe(201);
      expect(adminRes.body.data).toBeDefined();
      expect(adminRes.body.data.accessToken).toBeDefined();
      
      const adminToken = adminRes.body.data.accessToken;

      const response = await request
        .put(`/api/trips/${tripId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ driverId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.driverId).toBe(driverId);
      expect(response.body.data.status).toBe('accepted');
    });

    it('should fail to assign driver without admin role', async () => {
      // Crear un usuario normal (no admin)
      const normalUser = await buildUser({ role: 'pasajero' });
      const normalUserRes = await getApp().post('/api/auth/register').send(normalUser);
      const normalUserToken = normalUserRes.body.data.accessToken;

      const response = await request
        .put(`/api/trips/${tripId}/assign`)
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({ driverId });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/trips/:id/cancel', () => {
    beforeEach(async () => {
      // Crear un viaje para cancelar
      const tripData = {
        origen: {
          direccion: 'Av. Corrientes 1234, Buenos Aires',
          lat: -34.6037,
          lng: -58.3816
        },
        destino: {
          direccion: 'Av. Santa Fe 5678, Buenos Aires',
          lat: -34.5875,
          lng: -58.3974
        },
        tarifa: 1500,
        distancia_km: 5.2,
        duracion_min: 15,
        metodoPago: 'cash'
      };

      const response = await request
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData);

      tripId = response.body.data.id;
    });

    it('should cancel trip successfully', async () => {
      const response = await request
        .post(`/api/trips/${tripId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Cambio de planes' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should fail to cancel non-existent trip', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request
        .post(`/api/trips/${fakeId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Cambio de planes' });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/trips/active', () => {
    it('should get active trips (admin only)', async () => {
      // Crear un admin usando el endpoint de test
      const admin = await buildUser({ role: 'admin' });
      admin.email = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
      const adminRes = await request.post('/api/auth/admin/test').send(admin);
      
      // Verificar que el registro fue exitoso
      if (adminRes.status !== 201) {
        console.log('Error en registro de admin:', adminRes.body);
      }
      
      expect(adminRes.status).toBe(201);
      expect(adminRes.body.data).toBeDefined();
      expect(adminRes.body.data.accessToken).toBeDefined();
      
      const adminToken = adminRes.body.data.accessToken;

      const response = await request
        .get('/api/trips/active')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail to get active trips without admin role', async () => {
      const response = await request
        .get('/api/trips/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/trips/stats', () => {
    beforeEach(async () => {
      // Crear algunos viajes para estadísticas
      const trips = [
        {
          origen: { direccion: 'Origen 1', lat: -34.6037, lng: -58.3816 },
          destino: { direccion: 'Destino 1', lat: -34.5875, lng: -58.3974 },
          tarifa: 1000,
          distancia_km: 3.5,
          duracion_min: 10,
          metodoPago: 'cash'
        },
        {
          origen: { direccion: 'Origen 2', lat: -34.6037, lng: -58.3816 },
          destino: { direccion: 'Destino 2', lat: -34.5875, lng: -58.3974 },
          tarifa: 2000,
          distancia_km: 7.8,
          duracion_min: 20,
          metodoPago: 'card'
        }
      ];

      for (const tripData of trips) {
        await request
          .post('/api/trips')
          .set('Authorization', `Bearer ${authToken}`)
          .send(tripData);
      }
    });

    it('should get trip statistics', async () => {
      const response = await request
        .get('/api/trips/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('completed');
      expect(response.body.data).toHaveProperty('cancelled');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('totalFare');
      expect(response.body.data).toHaveProperty('averageFare');
    });
  });
});
