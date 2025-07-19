const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

exports.createPayment = async ({ monto, description, payer_email }) => {
  const preference = {
    items: [
      { title: description, unit_price: monto, quantity: 1 }
    ],
    payer: { email: payer_email }
  };
  return await mercadopago.preferences.create(preference);
};
