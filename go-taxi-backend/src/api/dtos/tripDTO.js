const Joi = require('joi');

const validateCreateTrip = data => {
  const schema = Joi.object({
    origen: Joi.object({
      direccion: Joi.string().required(),
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }).required(),
    destino: Joi.object({
      direccion: Joi.string().required(),
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }).required(),
    // La tarifa debe ser un número positivo. Permitir cero para viajes gratuitos/promocionales.
    tarifa: Joi.number().min(0).required(),
    // Distancia (km) y duración (minutos) deben ser positivos
    distancia_km: Joi.number().positive().required(),
    duracion_min: Joi.number().positive().required(),
    // Método de pago: efectivo, tarjeta, o Mercado Pago
    metodoPago: Joi.string().valid('cash', 'card', 'mp').required(),
  });
  return schema.validate(data);
};

module.exports = { validateCreateTrip };
