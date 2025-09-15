/*
 * Mock de la librería mercadopago para pruebas.
 *
 * Además de la función `preferences.create` utilizada para generar
 * preferencias de pago, se incluye ahora el namespace `payment`
 * con el método `findById` para simular la consulta del estado de
 * un pago en Mercado Pago. Esto permite testear servicios que
 * consultan pagos sin realizar llamadas reales.
 */
module.exports = {
  configure: jest.fn(),
  preferences: {
    create: jest.fn().mockResolvedValue({
      body: { id: 'pref_test_123', init_point: 'https://mp.test/pref_test_123' },
    }),
  },
  payment: {
    findById: jest.fn().mockResolvedValue({
      body: {
        id: 'pmt_test_123',
        status: 'approved',
        status_detail: 'accredited',
        amount: 1000,
      },
    }),
  },
};
