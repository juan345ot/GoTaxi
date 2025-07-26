const Joi = require('joi');

const validateConfig = (data) => {
  const schema = Joi.object({
    tipo: Joi.string().valid('tarifa', 'comision').required(),
    valor: Joi.number().required(),
    descripcion: Joi.string().optional()
  });
  return schema.validate(data);
};

module.exports = { validateConfig };
