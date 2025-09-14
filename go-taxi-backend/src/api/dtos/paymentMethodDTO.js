const Joi = require('joi');

const validatePaymentMethod = (data) => {
  const schema = Joi.object({
    // Tipo de método: tarjeta o mercadopago
    tipo: Joi.string().valid('tarjeta', 'mercadopago').required(),
    // Debe contener al menos una propiedad (se delega a servicios validar la estructura)
    datos: Joi.object().min(1).required(),
  });
  return schema.validate(data);
};

module.exports = { validatePaymentMethod };
