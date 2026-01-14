/**
 * Utilidades para crear respuestas estandarizadas de la API
 */
/* eslint-disable no-console */

/**
 * Crea una respuesta de error estandarizada
 * @param {Object} res - Objeto response de Express
 * @param {number} status - Código de estado HTTP
 * @param {string} message - Mensaje de error
 * @param {string} code - Código de error personalizado
 * @param {Object} details - Detalles adicionales del error
 * @param {Object} originalError - Error original(opcional)
 * @returns {Object} Respuesta de error
 */
const createErrorResponse = (
  res,
  status,
  message,
  code = 'ERROR',
  details = null,
  originalError = null,
) => {
  const errorResponse = {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
  };

  if (details) {
    errorResponse.details = details;
  }

  if (originalError && process.env.NODE_ENV === 'development') {
    errorResponse.originalError = originalError;
  }

  return res.status(status).json(errorResponse);
};

/**
 * Crea una respuesta de éxito estandarizada
 * @param {Object} res - Objeto response de Express
 * @param {number} status - Código de estado HTTP(por defecto 200)
 * @param {Object} data - Datos a devolver
 * @param {string} message - Mensaje de éxito
 * @param {Object} meta - Metadatos adicionales
 * @returns {Object} Respuesta de éxito
 */
const createSuccessResponse = (
  res,
  data = null,
  message = 'Operación exitosa',
  status = 200,
  meta = null,
) => {
  const successResponse = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    successResponse.data = data;
  }

  if (meta) {
    successResponse.meta = meta;
  }

  return res.status(status).json(successResponse);
};

/**
 * Crea una respuesta de validación estandarizada
 * @param {Object} res - Objeto response de Express
 * @param {Object} validationError - Error de validación de Joi
 * @returns {Object} Respuesta de error de validación
 */
const createValidationErrorResponse = (res, validationError) => {
  const details = validationError.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message,
    value: detail.context?.value,
  }));

  // Crear mensaje de error más específico
  const errorMessages = details.map(detail => detail.message).join(', ');
  const errorMessage = `Datos inválidos: ${errorMessages}`;

  return createErrorResponse(res, 400, errorMessage, 'VALIDATION_ERROR', details);
};

/**
 * Crea una respuesta de error interno del servidor
 * @param {Object} res - Objeto response de Express
 * @param {Error} error - Error original
 * @param {string} operation - Nombre de la operación que falló
 * @returns {Object} Respuesta de error interno
 */
const createInternalErrorResponse = (res, error, operation = 'Operación') => {
  console.error(`Error inesperado en ${operation}: ${error.message}`);

  return createErrorResponse(
    res,
    500,
    'Error interno del servidor',
    'INTERNAL_SERVER_ERROR',
    null,
    process.env.NODE_ENV === 'development' ? error.message : null,
  );
};

/**
 * Crea una respuesta de recurso no encontrado
 * @param {Object} res - Objeto response de Express
 * @param {string} resource - Nombre del recurso
 * @param {string} identifier - Identificador del recurso
 * @returns {Object} Respuesta de recurso no encontrado
 */
const createNotFoundResponse = (res, resource = 'Recurso', identifier = null) => {
  const message = identifier
    ? `${resource} con identificador '${identifier}' no encontrado`
    : `${resource} no encontrado`;

  return createErrorResponse(res, 404, message, 'RESOURCE_NOT_FOUND');
};

/**
 * Crea una respuesta de acceso denegado
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje personalizado
 * @returns {Object} Respuesta de acceso denegado
 */
const createForbiddenResponse = (res, message = 'Acceso denegado') => {
  return createErrorResponse(res, 403, message, 'FORBIDDEN');
};

/**
 * Crea una respuesta de no autorizado
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje personalizado
 * @returns {Object} Respuesta de no autorizado
 */
const createUnauthorizedResponse = (res, message = 'No autorizado') => {
  return createErrorResponse(res, 401, message, 'UNAUTHORIZED');
};

module.exports = {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
  createInternalErrorResponse,
  createNotFoundResponse,
  createForbiddenResponse,
  createUnauthorizedResponse,
};
