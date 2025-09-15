const rateLimit = require('express-rate-limit');

/*
 * Middleware de limitación de peticiones para proteger la API.
 *
 * Las ventanas y máximos se pueden ajustar mediante variables de entorno:
 *  - RATE_LIMIT_WINDOW_MS (por defecto 15 minutos)
 *  - RATE_LIMIT_MAX (por defecto 200 peticiones)
 *
 * Cuando se supera el límite, se delega el manejo al middleware de errores
 * mediante next(err), usando status 429 y código 'TOO_MANY_REQUESTS'.
 */

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 minutos
const max = parseInt(process.env.RATE_LIMIT_MAX, 10) || 200;

module.exports = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next, _options) => {
    const err = new Error('Demasiadas solicitudes, intenta más tarde');
    err.status = 429;
    err.code = 'TOO_MANY_REQUESTS';
    return next(err);
  },
});
