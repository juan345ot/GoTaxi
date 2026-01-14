/**
 * Middleware global de manejo de errores.
 *
 * Formatea la respuesta de error en un contrato consistente:
 *   { code, message, details?, stack? }
 *
 * - code: identificador del tipo de error (ej. VALIDATION_ERROR, FORBIDDEN, etc.).
 * - message: descripción en lenguaje natural del problema.
 * - details: información extra opcional (p. ej. datos de entrada que fallaron).
 * - stack: sólo en modo development, para facilitar la depuración.
 */
/* eslint-disable no-unused-vars */
module.exports = (err, _req, res, _next) => {
  // Extraemos valores con fallback
  const status = err.status || 500;
  const code = err.code || 'SERVER_ERROR';
  const _message = err.message || 'Error interno del servidor';
  const details = err.details;

  // Estructura base de respuesta
  const response = { success: false, code, message: _message };
  if (details !== undefined) response.details = details;

  // Incluir stack trace sólo en entorno de desarrollo
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  // Loggear el stack para monitoreo de errores
  if (err.stack) {
    // eslint-disable-next-line no-console
    console.error(err.stack);
  }

  return res.status(status).json(response);
};
