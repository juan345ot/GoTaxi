/**
 * Middleware de caché básico en memoria
 * En producción se debería usar Redis
 */
/* eslint-disable no-console */

const cache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Generar clave de caché basada en la request
 */
const generateCacheKey = req => {
  const { method, originalUrl, query, user } = req;
  const userId = user?.id || 'anonymous';
  const queryString = Object.keys(query).length > 0 ? JSON.stringify(query) : '';
  return `${method}:${originalUrl}:${userId}:${queryString}`;
};

/**
 * Middleware de caché para GET requests
 */
const cacheMiddleware = (ttl = DEFAULT_TTL) => {
  return (req, res, next) => {
    // No usar cache en modo test
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req);
    const cached = cache.get(cacheKey);

    if (cached) {
      // Verificar si el caché no ha expirado
      if (Date.now() - cached.timestamp < ttl) {
        console.log(`Cache hit: ${cacheKey}`);
        return res.json(cached.data);
      } else {
        // Remover caché expirado
        cache.delete(cacheKey);
      }
    }

    // Interceptar la respuesta para guardarla en caché
    const originalJson = res.json;
    res.json = function (data) {
      // Solo cachear respuestas exitosas(no errores de autorización)
      if (res.statusCode >= 200 && res.statusCode < 300 && res.statusCode !== 403) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
        console.log(`Cache set: ${cacheKey}`);
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Invalidar caché por patrón
 */
const invalidateCache = pattern => {
  let invalidated = 0;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      invalidated++;
    }
  }
  console.log(`Cache invalidated: ${invalidated} entries for pattern: ${pattern}`);
  return invalidated;
};

/**
 * Invalidar caché de un usuario específico
 */
const invalidateUserCache = userId => {
  return invalidateCache(`:${userId}:`);
};

/**
 * Invalidar caché de una ruta específica
 */
const invalidateRouteCache = route => {
  return invalidateCache(route);
};

/**
 * Limpiar caché expirado
 */
const cleanExpiredCache = () => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > DEFAULT_TTL) {
      cache.delete(key);
      cleaned++;
    }
  }

  console.log(`Cache cleaned: ${cleaned} expired entries`);
  return cleaned;
};

/**
 * Obtener estadísticas del caché
 */
const getCacheStats = () => {
  const now = Date.now();
  let active = 0;
  let expired = 0;

  for (const [, value] of cache.entries()) {
    if (now - value.timestamp < DEFAULT_TTL) {
      active++;
    } else {
      expired++;
    }
  }

  return {
    total: cache.size,
    active,
    expired,
    memoryUsage: process.memoryUsage(),
  };
};

/**
 * Limpiar todo el caché
 */
const clearAllCache = () => {
  const size = cache.size;
  cache.clear();
  console.log(`Cache cleared: ${size} entries removed`);
  return size;
};

// Limpiar caché expirado cada 10 minutos
setInterval(cleanExpiredCache, 10 * 60 * 1000);

module.exports = {
  cacheMiddleware,
  invalidateCache,
  invalidateUserCache,
  invalidateRouteCache,
  cleanExpiredCache,
  getCacheStats,
  clearAllCache,
};
