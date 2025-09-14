const Joi = require('joi');

// Validación para pagos simulados (efectivo/tarjeta)
const validateSimulatedPayment = (data) => {
  const schema = Joi.object({
    // Se espera un ObjectId de Mongo (24 caracteres hexadecimales)
    tripId: Joi.string().hex().length(24).required(),
    // Monto positivo obligatorio
    monto: Joi.number().positive().required(),
    // Método permitido: efectivo o tarjeta (otras opciones rechazadas)
    metodo: Joi.string().valid('efectivo', 'tarjeta').required(),
  });
  return schema.validate(data);
};

// Validación para pagos vía Mercado Pago
const validateMpPayment = (data) => {
  const schema = Joi.object({
    tripId: Joi.string().hex().length(24).required(),
    monto: Joi.number().positive().required(),
  });
  return schema.validate(data);
};

module.exports = { validateSimulatedPayment, validateMpPayment };
