const { getApp } = require('../utils/request');
const { connect, disconnect } = require('../utils/mongoMemory');
const { cleanDB } = require('../utils/cleanDB');
const endpoints = require('../config/endpoints');
const { buildUser } = require('../factories/userFactory');

/*
 * Tests para el flujo de pagos con Mercado Pago.
 *
 * Se crea un usuario pasajero, se autentica, y luego se invoca el
 * endpoint POST /api/payments/mercadopago con un tripId de ejemplo.
 * El mock de Mercado Pago devuelve 'pref_test_123' como id de preferencia,
 * lo que se verifica en la respuesta.
 */
describe('Payments (Mercado Pago)', () => {
  beforeAll(async () => { await connect(); });
  afterAll(async () => { await disconnect(); });
  beforeEach(async () => { await cleanDB(); });

  it('debería crear preferencia de Mercado Pago y retornar el id de la preferencia (mock)', async () => {
    // Crear y autenticar un pasajero
    const user = buildUser();
    const reg = await getApp().post(endpoints.auth.register).send(user);
    expect([200, 201]).toContain(reg.status);
    const login = await getApp().post(endpoints.auth.login).send({ email: user.email, password: user.password });
    expect(login.status).toBe(200);
    const token = login.body.data.accessToken;

    // Invocar el endpoint de Mercado Pago con tripId y monto
    const res = await getApp()
      .post(endpoints.payments.createPreference)
      .set('Authorization', `Bearer ${token}`)
      .send({ tripId: '507f1f77bcf86cd799439011', monto: 1000 });
    expect([200, 201]).toContain(res.status);
    // Debe devolver un objeto payment con el mp_preference_id correcto
    expect(res.body).toHaveProperty('payment');
    expect(res.body.payment).toHaveProperty('mp_preference_id', 'pref_test_123');
    // Y la respuesta de Mercado Pago simulada
    expect(res.body).toHaveProperty('mercadoPago');
    expect(res.body.mercadoPago).toHaveProperty('id', 'pref_test_123');
  });
});
