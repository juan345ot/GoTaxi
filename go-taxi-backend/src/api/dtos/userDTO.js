const Joi = require('joi');

const validateUpdateUser = data => {
  const schema = Joi.object({
    nombre: Joi.string().trim().optional(),
    apellido: Joi.string().trim().optional(),
    // El teléfono, si se envía, debe contener sólo números y tener longitud razonable
    telefono: Joi.string()
      .pattern(/^[0-9]+$/)
      .min(6)
      .max(15)
      .allow('')
      .optional(),
    // Dirección del usuario
    direccion: Joi.string().trim().allow('').optional(),
    // La contraseña debe tener al menos 6 caracteres si se incluye
    password: Joi.string().min(6).optional(),
    // La ruta de la foto debe ser una cadena; no validamos formato de URL aquí
    foto: Joi.string().optional(),
  });
  return schema.validate(data);
};

module.exports = { validateUpdateUser };
