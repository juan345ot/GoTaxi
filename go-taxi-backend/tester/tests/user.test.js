const { getApp } = require('../utils/request');
const { buildUser } = require('../factories/userFactory');
const { connect, disconnect } = require('../utils/mongoMemory');
const { cleanDB } = require('../utils/cleanDB');

describe('User API', () => {
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
    
    // Debug: mostrar el error si el registro falla
    if (response.status !== 201 && response.status !== 200) {
      console.log('Registration failed:', {
        status: response.status,
        body: response.body,
        user: user
      });
    }
    
    expect([200, 201]).toContain(response.status);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('user');
    
    authToken = response.body.data.accessToken;
    userId = response.body.data.user.id;
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile successfully', async () => {
      const response = await getApp()
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('role');
    });

    it('should fail to get profile without authentication', async () => {
      const response = await getApp().get('/api/users/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        nombre: 'Juan Carlos',
        apellido: 'Pérez',
        telefono: '5491123456789'
      };

      const response = await getApp()
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      // Debug: mostrar el error si la actualización falla
      if (response.status !== 200) {
        console.log('Profile update failed:', {
          status: response.status,
          body: response.body,
          updateData: updateData
        });
      } else {
        console.log('Profile update success:', {
          status: response.status,
          body: response.body,
          updateData: updateData
        });
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nombre).toBe('Juan Carlos');
      expect(response.body.data.apellido).toBe('Pérez');
      expect(response.body.data.telefono).toBe('5491123456789');
    });

    it('should fail to update profile with invalid data', async () => {
      const updateData = {
        nombre: 'A', // Too short
        email: 'invalid-email', // Invalid email format
        telefono: '123' // Too short
      };

      const response = await getApp()
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail to update profile without authentication', async () => {
      const updateData = {
        nombre: 'Juan Carlos'
      };

      const response = await getApp()
        .put('/api/users/profile')
        .send(updateData);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/users/password', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'Passw0rd!',
        newPassword: 'NewPassword456!'
      };

      const response = await getApp()
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      // Debug: mostrar el error si el cambio de contraseña falla
      if (response.status !== 200) {
        console.log('Password change failed:', {
          status: response.status,
          body: response.body,
          passwordData: passwordData
        });
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Contraseña actualizada exitosamente');
    });

    it('should fail to change password with wrong current password', async () => {
      const passwordData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword456!'
      };

      const response = await getApp()
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail to change password with weak new password', async () => {
      const passwordData = {
        currentPassword: 'Passw0rd!',
        newPassword: 'weak' // Too weak
      };

      const response = await getApp()
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail to change password without authentication', async () => {
      const passwordData = {
        currentPassword: 'Passw0rd!',
        newPassword: 'NewPassword456!'
      };

      const response = await getApp()
        .put('/api/users/password')
        .send(passwordData);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 501 not implemented', async () => {
      const refreshData = {
        refreshToken: 'valid-refresh-token' // This would need to be a real refresh token
      };

      // Note: Refresh token logic is not fully implemented yet
      const response = await getApp()
        .post('/api/auth/refresh')
        .send(refreshData);

      // Should return 501 Not Implemented
      expect(response.status).toBe(501);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NOT_IMPLEMENTED');
    });

    it('should fail to refresh token without refresh token', async () => {
      const response = await getApp()
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await getApp()
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout exitoso');
    });

    it('should fail to logout without authentication', async () => {
      const response = await getApp().post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users (Admin only)', () => {
    let adminToken;

    beforeEach(async () => {
      // Crear un admin
      const admin = await buildUser({ role: 'admin' });
      const adminRes = await getApp().post('/api/auth/admin/test').send(admin);
      adminToken = adminRes.body.data.accessToken;
    });

    it('should get all users (admin only)', async () => {
      const response = await getApp()
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should get users with pagination', async () => {
      const response = await getApp()
        .get('/api/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 5);
    });

    it('should get users filtered by role', async () => {
      const response = await getApp()
        .get('/api/users?role=pasajero')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      response.body.data.users.forEach(user => {
        expect(user.role).toBe('pasajero');
      });
    });

    it('should fail to get users without admin role', async () => {
      const response = await getApp()
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/users/:id', () => {
    let adminToken;

    beforeEach(async () => {
      // Crear un admin
      const admin = await buildUser({ role: 'admin' });
      const adminRes = await getApp().post('/api/auth/admin/test').send(admin);
      adminToken = adminRes.body.data.accessToken;
    });

    it('should get user by id (admin only)', async () => {
      const response = await getApp()
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
    });

    it('should fail to get non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await getApp()
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail to get user without admin role', async () => {
      const response = await getApp()
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/users/:id', () => {
    let adminToken;

    beforeEach(async () => {
      // Crear un admin
      const admin = await buildUser({ role: 'admin' });
      const adminRes = await getApp().post('/api/auth/admin/test').send(admin);
      adminToken = adminRes.body.data.accessToken;
    });

    it('should update user by id (admin only)', async () => {
      const updateData = {
        nombre: 'Admin Updated',
        apellido: 'User'
      };

      const response = await getApp()
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nombre).toBe('Admin Updated');
    });

    it('should fail to update user without admin role', async () => {
      const updateData = {
        nombre: 'Unauthorized Update'
      };

      const response = await getApp()
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    let adminToken;

    beforeEach(async () => {
      // Crear un admin
      const admin = await buildUser({ role: 'admin' });
      const adminRes = await getApp().post('/api/auth/admin/test').send(admin);
      adminToken = adminRes.body.data.accessToken;
    });

    it('should delete user by id (admin only)', async () => {
      const response = await getApp()
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail to delete user without admin role', async () => {
      const response = await getApp()
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});
