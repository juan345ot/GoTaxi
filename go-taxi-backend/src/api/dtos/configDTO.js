const Joi = require('joi');

const validateConfig = (data) => {
  const schema = Joi.object({
    tipo: Joi.string().valid('tarifa', 'comision').required(),
    // valor debe ser un número positivo (tarifa o comisión)
    valor: Joi.number().positive().required(),
    descripcion: Joi.string().optional()
  });
  return schema.validate(data);
};

module.exports = { validateConfig };
