const Joi = require('joi');

const validateRegister = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().required(),
    apellido: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('pasajero', 'conductor'),
    telefono: Joi.string().optional(),
    licencia: Joi.string().optional(),
    vehiculo: Joi.object().optional()
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  return schema.validate(data);
};

module.exports = { validateRegister, validateLogin };
 