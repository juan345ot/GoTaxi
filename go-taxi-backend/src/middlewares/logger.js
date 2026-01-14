const morgan = require('morgan');

/*
 * Middleware de logging HTTP utilizando morgan.
 *
 * - En modo producción utiliza el formato 'combined', más detallado.
 * - En desarrollo usa 'dev' para legibilidad.
 * - Omitimos el log de la ruta /health para evitar ruido en monitoreo.
 */
const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

module.exports = morgan(format, {
  skip: req => req.path === '/health',
});
