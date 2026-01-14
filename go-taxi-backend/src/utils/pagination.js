/**
 * Utilidades para paginación
 */

/**
 * Crear objeto de paginación
 */
const createPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
    offset: (page - 1) * limit,
  };
};

/**
 * Validar parámetros de paginación
 */
const validatePaginationParams = (page, limit, maxLimit = 100) => {
  const errors = [];

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    errors.push('Página debe ser un número mayor a 0');
  }

  if (isNaN(limitNum) || limitNum < 1) {
    errors.push('Límite debe ser un número mayor a 0');
  }

  if (limitNum > maxLimit) {
    errors.push(`Límite no puede ser mayor a ${maxLimit}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    page: pageNum || 1,
    limit: limitNum || 10,
  };
};

/**
 * Aplicar paginación a una consulta de MongoDB
 */
const applyPagination = (query, page, limit) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

/**
 * Crear metadatos de paginación para respuesta
 */
const createPaginationMeta = (pagination, data) => {
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage,
      nextPage: pagination.nextPage,
      prevPage: pagination.prevPage,
    },
  };
};

/**
 * Calcular offset para paginación
 */
const calculateOffset = (page, limit) => {
  return (page - 1) * limit;
};

/**
 * Crear enlaces de paginación para APIs
 */
const createPaginationLinks = (pagination, baseUrl, query = {}) => {
  const links = {
    self: createPageUrl(baseUrl, pagination.page, query),
    first: createPageUrl(baseUrl, 1, query),
    last: createPageUrl(baseUrl, pagination.totalPages, query),
  };

  if (pagination.hasNextPage) {
    links.next = createPageUrl(baseUrl, pagination.nextPage, query);
  }

  if (pagination.hasPrevPage) {
    links.prev = createPageUrl(baseUrl, pagination.prevPage, query);
  }

  return links;
};

/**
 * Crear URL para una página específica
 */
const createPageUrl = (baseUrl, page, query = {}) => {
  const url = new URL(baseUrl);
  url.searchParams.set('page', page);

  Object.keys(query).forEach(key => {
    if (key !== 'page' && query[key] !== undefined && query[key] !== null) {
      url.searchParams.set(key, query[key]);
    }
  });

  return url.toString();
};

/**
 * Middleware para extraer parámetros de paginación de la query
 */
const extractPaginationParams = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const validation = validatePaginationParams(page, limit);

  if (!validation.isValid) {
    const errObj = new Error(validation.errors.join(', '));
    errObj.status = 400;
    errObj.code = 'INVALID_PAGINATION_PARAMS';
    return next(errObj);
  }

  req.pagination = {
    page: validation.page,
    limit: validation.limit,
    offset: calculateOffset(validation.page, validation.limit),
  };

  next();
};

/**
 * Crear respuesta paginada estándar
 */
const createPaginatedResponse = (data, pagination, baseUrl = '', query = {}) => {
  const response = {
    success: true,
    data,
    pagination: createPaginationMeta(pagination, data).pagination,
  };

  if (baseUrl) {
    response.links = createPaginationLinks(pagination, baseUrl, query);
  }

  return response;
};

module.exports = {
  createPagination,
  validatePaginationParams,
  applyPagination,
  createPaginationMeta,
  calculateOffset,
  createPaginationLinks,
  createPageUrl,
  extractPaginationParams,
  createPaginatedResponse,
};
