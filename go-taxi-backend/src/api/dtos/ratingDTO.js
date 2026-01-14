const Joi = require('joi');

const validateCreateRating = data => {
  const schema = Joi.object({
    // El ID del viaje debe ser un ObjectId válido
    trip: Joi.string().hex().length(24).required(),
    // Puntuación entera entre 1 y 5
    puntuacion: Joi.number().integer().min(1).max(5).required(),
    // Comentario opcional; permite vacío o null
    comentario: Joi.string().allow('', null),
    // Autor de la calificación: pasajero o conductor
    autor: Joi.string().valid('pasajero', 'conductor').required(),
    // Si el autor es pasajero, se requiere el ID del conductor
    conductor: Joi.when('autor', {
      is: 'pasajero',
      then: Joi.string().hex().length(24).required(),
      otherwise: Joi.string().hex().length(24).optional(),
    }),
    // Si el autor es conductor, se requiere el ID del pasajero
    pasajero: Joi.when('autor', {
      is: 'conductor',
      then: Joi.string().hex().length(24).required(),
      otherwise: Joi.string().hex().length(24).optional(),
    }),
  });
  return schema.validate(data);
};

module.exports = { validateCreateRating };
