const Joi = require('joi');

const validateUpdateUser = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().optional(),
    apellido: Joi.string().optional(),
    telefono: Joi.string().optional(),
    password: Joi.string().min(6).optional(),
    foto: Joi.string().optional()
  });
  return schema.validate(data);
};

module.exports = { validateUpdateUser };
