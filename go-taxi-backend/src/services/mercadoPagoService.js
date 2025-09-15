const mercadopago = require('mercadopago');
const { MP_ACCESS_TOKEN, BASE_URL } = require('../config/env');
const { logToFile } = require('../utils/logger');

// Configuramos Mercado Pago con el token de acceso
mercadopago.configure({ access_token: MP_ACCESS_TOKEN });

/*
 * Crea una preferencia de pago en Mercado Pago.
 * - monto: número positivo (validado a nivel de DTO/controlador).
 * - description: descripción del producto/servicio.
 * - payer_email: email del pagador.
 *
 * Devuelve la respuesta de Mercado Pago o lanza un error con código y status
 * para que el controlador lo maneje.
 */
exports.createPayment = async ({ monto, description, payer_email }) => {
  const amount = Number(monto);
  const preference = {
    items: [{ title: description, unit_price: amount, quantity: 1 }],
    payer: { email: payer_email },
    back_urls: {
      success: `${BASE_URL}/payments/success`,
      failure: `${BASE_URL}/payments/failure`,
      pending: `${BASE_URL}/payments/pending`,
    },
    auto_return: 'approved',
  };
  try {
    const response = await mercadopago.preferences.create(preference);
    return response;
  } catch (err) {
    logToFile(`Error creando preferencia MP: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'MP_CREATE_PREFERENCE_FAILED';
    err.details = err.details || { amount, description, payer_email };
    throw err;
  }
};

/*
 * Obtiene el estado de un pago por ID en Mercado Pago.
 */
exports.getPaymentStatus = async (paymentId) => {
  try {
    const response = await mercadopago.payment.findById(paymentId);
    return response;
  } catch (err) {
    logToFile(`Error consultando pago MP ${paymentId}: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'MP_GET_PAYMENT_FAILED';
    err.details = err.details || { paymentId };
    throw err;
  }
};
