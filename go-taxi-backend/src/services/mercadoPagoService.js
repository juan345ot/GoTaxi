// src/services/mercadoPagoService.js
const mercadopago = require('mercadopago');
const { MP_ACCESS_TOKEN } = require('../config/env');

mercadopago.configure({
  access_token: MP_ACCESS_TOKEN
});

exports.createPayment = async ({ monto, description, payer_email }) => {
  const preference = {
    items: [
      { title: description, unit_price: monto, quantity: 1 }
    ],
    payer: { email: payer_email },
    back_urls: {
      success: process.env.BASE_URL + '/payments/success',
      failure: process.env.BASE_URL + '/payments/failure',
      pending: process.env.BASE_URL + '/payments/pending'
    },
    auto_return: "approved"
  };
  return await mercadopago.preferences.create(preference);
};

// (Opcional) obtener status de un pago
exports.getPaymentStatus = async (paymentId) => {
  return await mercadopago.payment.findById(paymentId);
};
