const Joi = require('joi');

const validateCreateAddress = data => {
  const schema = Joi.object({
    nombre: Joi.string().trim().required().max(50).messages({
      'string.empty': 'El nombre de la dirección es obligatorio',
      'string.max': 'El nombre no puede exceder 50 caracteres',
    }),
    calle: Joi.string().trim().required().messages({
      'string.empty': 'La calle es obligatoria',
    }),
    altura: Joi.string().trim().allow('').optional(),
    ciudad: Joi.string().trim().required().messages({
      'string.empty': 'La ciudad es obligatoria',
    }),
    direccionCompleta: Joi.string().trim().required().messages({
      'string.empty': 'La dirección completa es obligatoria',
    }),
    coordenadas: Joi.object({
      latitud: Joi.number().optional(),
      longitud: Joi.number().optional(),
    }).optional(),
    esFavorita: Joi.boolean().optional(),
  });
  return schema.validate(data);
};

const validateUpdateAddress = data => {
  const schema = Joi.object({
    nombre: Joi.string().trim().max(50).optional(),
    calle: Joi.string().trim().optional(),
    altura: Joi.string().trim().allow('').optional(),
    ciudad: Joi.string().trim().optional(),
    direccionCompleta: Joi.string().trim().optional(),
    coordenadas: Joi.object({
      latitud: Joi.number().optional(),
      longitud: Joi.number().optional(),
    }).optional(),
    esFavorita: Joi.boolean().optional(),
  });
  return schema.validate(data);
};

module.exports = {
  validateCreateAddress,
  validateUpdateAddress,
};
