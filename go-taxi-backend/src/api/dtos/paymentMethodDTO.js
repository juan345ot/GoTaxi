const Joi = require('joi');

const validatePaymentMethod = (data) => {
  const schema = Joi.object({
    tipo: Joi.string().valid('tarjeta', 'mercadopago').required(),
    datos: Joi.object().required()
  });
  return schema.validate(data);
};

module.exports = { validatePaymentMethod };
