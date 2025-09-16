const getApp = require('../utils/request');
const { connect, disconnect } = require('../utils/mongoMemory');
const cleanDB = require('../utils/cleanDB');
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
    expect(reg.body).toHaveProperty('user');
    expect(reg.body).toHaveProperty('token');
    const userId = reg.body.user.id;

    // Login
    const log = await getApp().post(endpoints.auth.login).send({
      email: user.email,
      password: user.password,
    });
    expect(log.status).toBe(200);
    expect(log.body).toHaveProperty('token');
    const token = log.body.token;

    // Obtener el perfil con el ID devuelto en el registro
    const me = await getApp()
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    // Debe devolver el email correcto
    expect(me.body.email || me.body.user?.email).toBe(user.email);
  });
});
