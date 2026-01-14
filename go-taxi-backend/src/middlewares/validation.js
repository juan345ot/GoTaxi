/**
 * Middleware de validación genérico
 * Valida datos usando esquemas Joi
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errObj = new Error('Datos de entrada inválidos');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));
      return next(errObj);
    }

    next();
  };
};

/**
 * Middleware para validar parámetros de paginación
 */
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    const errObj = new Error('Página debe ser un número mayor a 0');
    errObj.status = 400;
    errObj.code = 'VALIDATION_ERROR';
    return next(errObj);
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    const errObj = new Error('Límite debe ser un número entre 1 y 100');
    errObj.status = 400;
    errObj.code = 'VALIDATION_ERROR';
    return next(errObj);
  }

  req.pagination = {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
  };

  next();
};

/**
 * Middleware para validar fechas
 */
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      const errObj = new Error('Fecha de inicio inválida');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      return next(errObj);
    }
    req.dateRange = { ...req.dateRange, startDate: start };
  }

  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      const errObj = new Error('Fecha de fin inválida');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      return next(errObj);
    }
    req.dateRange = { ...req.dateRange, endDate: end };
  }

  if (req.dateRange?.startDate && req.dateRange?.endDate) {
    if (req.dateRange.startDate > req.dateRange.endDate) {
      const errObj = new Error('Fecha de inicio debe ser anterior a fecha de fin');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      return next(errObj);
    }
  }

  next();
};

/**
 * Middleware para validar IDs de MongoDB
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      const errObj = new Error(`ID inválido: ${paramName}`);
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      return next(errObj);
    }

    next();
  };
};

/**
 * Middleware para sanitizar strings
 */
const sanitizeStrings = (req, res, next) => {
  const sanitize = obj => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>]/g, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

module.exports = {
  validate,
  validatePagination,
  validateDateRange,
  validateObjectId,
  sanitizeStrings,
};
