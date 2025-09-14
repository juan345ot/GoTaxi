const Joi = require('joi');

/*
 * Validadores para endpoints de autenticación (registro y login).
 *
 * Usamos Joi para definir reglas más estrictas y coherentes:
 *  - El teléfono debe ser numérico y tener entre 6 y 15 dígitos.
 *  - Si el rol es "conductor", la licencia y los datos del vehículo son obligatorios.
 *  - Permite roles opcionales (pasajero o conductor); si se omite, se asumirá pasajero a nivel de modelo.
 */
const vehiculoSchema = Joi.object().unknown(true);

const validateRegister = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().trim().required(),
    apellido: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('pasajero', 'conductor').optional(),
    telefono: Joi.string()
      .pattern(/^[0-9]+$/)
      .min(6)
      .max(15)
      .optional(),
    // La licencia es obligatoria solo para conductores
    licencia: Joi.when('role', {
      is: 'conductor',
      then: Joi.string().required(),
      otherwise: Joi.string().optional(),
    }),
    // Los datos del vehículo son obligatorios solo para conductores
    vehiculo: Joi.when('role', {
      is: 'conductor',
      then: vehiculoSchema.required(),
      otherwise: vehiculoSchema.optional(),
    }),
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
