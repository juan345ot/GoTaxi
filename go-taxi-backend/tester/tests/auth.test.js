const { getApp } = require('../utils/request');
const { connect, disconnect } = require('../utils/mongoMemory');
const { cleanDB } = require('../utils/cleanDB');
const endpoints = require('../config/endpoints');
const { buildUser } = require('../factories/userFactory');

describe('Auth', () => {
  beforeAll(async () => { await connect(); });
  afterAll(async () => { await disconnect(); });
  beforeEach(async () => { await cleanDB(); });

  it('Register -> Login -> Obtener perfil', async () => {
    const user = buildUser();

    // Registro del usuario
    const reg = await getApp().post(endpoints.auth.register).send(user);
    expect([200, 201]).toContain(reg.status);
    expect(reg.body).toHaveProperty('data');
    expect(reg.body.data).toHaveProperty('user');
    expect(reg.body.data).toHaveProperty('accessToken');
    const userId = reg.body.data.user.id;

    // Debug: verificar que el usuario se creó correctamente
    console.log('Usuario registrado:', reg.body.data.user.email);

    // Login
    const log = await getApp().post(endpoints.auth.login).send({
      email: user.email,
      password: user.password,
    });
    
    // Debug: verificar la respuesta del login
    console.log('Login response status:', log.status);
    console.log('Login response body:', log.body);
    
    expect(log.status).toBe(200);
    expect(log.body).toHaveProperty('data');
    expect(log.body.data).toHaveProperty('accessToken');
    const token = log.body.data.accessToken;

    // Obtener el perfil del usuario actual
    const me = await getApp()
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    // Debe devolver el email correcto
    expect(me.body.data.email || me.body.data.user?.email).toBe(user.email);
  });
});
