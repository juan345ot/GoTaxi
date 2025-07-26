const Joi = require('joi');

const validateCreateRating = (data) => {
  const schema = Joi.object({
    trip: Joi.string().required(),
    puntuacion: Joi.number().min(1).max(5).required(),
    comentario: Joi.string().allow('', null),
    autor: Joi.string().valid('pasajero', 'conductor').required(),
    conductor: Joi.string().optional(),
    pasajero: Joi.string().optional()
  });
  return schema.validate(data);
};

module.exports = { validateCreateRating };
