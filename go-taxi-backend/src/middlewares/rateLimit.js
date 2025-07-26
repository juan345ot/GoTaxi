const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  message: 'Demasiadas solicitudes, intenta más tarde.'
});
