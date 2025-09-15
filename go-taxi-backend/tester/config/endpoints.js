/*
 * Endpoints de referencia para las pruebas.
 *
 * Se han actualizado las rutas de pagos para reflejar los cambios
 * en la API del backend. La propiedad `createPreference` apunta ahora
 * al endpoint de pago con Mercado Pago (`/api/payments/mercadopago`),
 * que devuelve una preferencia de pago simulada usando el mock de
 * Mercado Pago. La ruta `webhook` se mantiene por si en el futuro
 * se implementa un webhook de notificaciones.
 */
module.exports = {
  health: '/health',
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    me: '/api/auth/me',
  },
  payments: {
    // Se utiliza el endpoint de Mercado Pago para generar una preferencia de pago
    createPreference: '/api/payments/mercadopago',
    webhook: '/api/payments/webhook',
  },
};
