const Joi = require('joi');

const validateCreateTrip = (data) => {
  const schema = Joi.object({
    origen: Joi.object({
      direccion: Joi.string().required(),
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required(),
    destino: Joi.object({
      direccion: Joi.string().required(),
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required(),
    tarifa: Joi.number().required(),
    distancia_km: Joi.number().required(),
    duracion_min: Joi.number().required()
  });
  return schema.validate(data);
};

module.exports = { validateCreateTrip };
