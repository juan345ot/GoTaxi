const Joi = require('joi');

const validateSimulatedPayment = (data) => {
  const schema = Joi.object({
    tripId: Joi.string().required(),
    monto: Joi.number().required(),
    metodo: Joi.string().valid('efectivo', 'tarjeta').required()
  });
  return schema.validate(data);
};

const validateMpPayment = (data) => {
  const schema = Joi.object({
    tripId: Joi.string().required(),
    monto: Joi.number().required()
  });
  return schema.validate(data);
};

module.exports = { validateSimulatedPayment, validateMpPayment };
