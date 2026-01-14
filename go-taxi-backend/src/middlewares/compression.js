/**
 * Middleware de compresión para optimizar el tamaño de las respuestas
 */

const compression = require('compression');

/**
 * Configuración de compresión
 */
const compressionConfig = {
  // Nivel de compresión(1-9, donde 9 es máxima compresión)
  level: process.env.NODE_ENV === 'production' ? 6 : 1,

  // Umbral mínimo de tamaño para comprimir(en bytes)
  threshold: 1024,

  // Filtrar qué tipos de contenido comprimir
  filter: (req, res) => {
    // No comprimir si ya está comprimido
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Usar el filtro por defecto de compression
    return compression.filter(req, res);
  },

  // Configuración específica para diferentes tipos de contenido
  compressionOptions: {
    // Para JSON
    'application/json': {
      level: 6,
      threshold: 1024,
    },
    // Para texto plano
    'text/plain': {
      level: 6,
      threshold: 1024,
    },
    // Para HTML
    'text/html': {
      level: 6,
      threshold: 1024,
    },
    // Para CSS
    'text/css': {
      level: 9,
      threshold: 1024,
    },
    // Para JavaScript
    'application/javascript': {
      level: 6,
      threshold: 1024,
    },
  },
};

/**
 * Middleware de compresión personalizado
 */
const compressionMiddleware = compression(compressionConfig);

/**
 * Middleware para agregar headers de compresión
 */
const addCompressionHeaders = (req, res, next) => {
  // Agregar header para indicar que el servidor soporta compresión
  res.setHeader('Vary', 'Accept-Encoding');

  // Agregar header de cache para respuestas comprimidas
  if (req.headers['accept-encoding'] && req.headers['accept-encoding'].includes('gzip')) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }

  next();
};

/**
 * Middleware para medir la compresión
 */
const measureCompression = (req, res, next) => {
  const originalWrite = res.write;
  const originalEnd = res.end;

  let originalSize = 0;
  const compressedSize = 0;

  res.write = function (chunk, encoding) {
    if (chunk) {
      originalSize += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
    }
    return originalWrite.call(this, chunk, encoding);
  };

  res.end = function (chunk, encoding) {
    if (chunk) {
      originalSize += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
    }

    // Calcular ratio de compresión
    if (originalSize > 0) {
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
      res.setHeader('X-Compression-Ratio', `${compressionRatio.toFixed(2)}%`);
      res.setHeader('X-Original-Size', originalSize);
    }

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Middleware para excluir ciertas rutas de la compresión
 */
const excludeRoutes = (excludedRoutes = []) => {
  return (req, res, next) => {
    // Verificar si la ruta está excluida
    const isExcluded = excludedRoutes.some(route => {
      if (typeof route === 'string') {
        return req.path.startsWith(route);
      }
      if (route instanceof RegExp) {
        return route.test(req.path);
      }
      return false;
    });

    if (isExcluded) {
      req.headers['x-no-compression'] = 'true';
    }

    next();
  };
};

/**
 * Configuración de compresión para diferentes entornos
 */
const getCompressionConfig = () => {
  const baseConfig = {
    level: 6,
    threshold: 1024,
    filter: compression.filter,
  };

  if (process.env.NODE_ENV === 'development') {
    return {
      ...baseConfig,
      level: 1, // Compresión mínima en desarrollo
      threshold: 2048, // Umbral más alto
    };
  }

  if (process.env.NODE_ENV === 'production') {
    return {
      ...baseConfig,
      level: 9, // Máxima compresión en producción
      threshold: 512, // Umbral más bajo
    };
  }

  return baseConfig;
};

module.exports = {
  compressionMiddleware,
  addCompressionHeaders,
  measureCompression,
  excludeRoutes,
  getCompressionConfig,
};
