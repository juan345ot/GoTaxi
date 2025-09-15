require('dotenv').config();

module.exports = {
  // Puerto en el que se levanta la API. Convertimos a número para coherencia.
  PORT: Number(process.env.PORT) || 4000,

  // URI de conexión a MongoDB. Puede ser local o de MongoDB Atlas.
  MONGO_URI: process.env.MONGO_URI || '',

  // Clave secreta y expiración del JWT.
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',

  // Credenciales del usuario administrador por defecto (seeder).
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  // Token de acceso a Mercado Pago.
  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,

  // URL base para construir links (ej. emails, redirecciones).
  BASE_URL: process.env.BASE_URL || 'http://localhost:4000',

  // Configuración del servicio de correo.
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
  EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};
