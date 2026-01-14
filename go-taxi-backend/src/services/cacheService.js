/**
 * Servicio de caché avanzado con soporte para memoria y Redis
 * Incluye estrategias de invalidación, TTL dinámico y métricas
 */
/* eslint-disable no-console */

const cache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
const CACHE_PREFIXES = {
  USER: 'user',
  TRIP: 'trip',
  DRIVER: 'driver',
  API: 'api',
  STATS: 'stats',
};

// Configuración de TTL por tipo de dato
const TTL_CONFIG = {
  [CACHE_PREFIXES.USER]: 10 * 60 * 1000, // 10 minutos
  [CACHE_PREFIXES.TRIP]: 2 * 60 * 1000, // 2 minutos
  [CACHE_PREFIXES.DRIVER]: 5 * 60 * 1000, // 5 minutos
  [CACHE_PREFIXES.API]: 5 * 60 * 1000, // 5 minutos
  [CACHE_PREFIXES.STATS]: 15 * 60 * 1000, // 15 minutos
};

class CacheService {
  constructor() {
    this.redis = null;
    this.useRedis = process.env.REDIS_URL && process.env.NODE_ENV === 'production';
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      invalidations: 0,
    };
    this.invalidationStrategies = new Map();
    this.initializeRedis();
    this.setupInvalidationStrategies();
  }

  /**
   * Configurar estrategias de invalidación
   */
  setupInvalidationStrategies() {
    // Estrategia para usuarios: invalidar cuando se actualiza perfil, viajes, etc.
    this.invalidationStrategies.set('user', {
      patterns: ['user:{userId}:*', 'trip:*:user:{userId}:*', 'driver:*:user:{userId}:*'],
      triggers: ['profile_update', 'password_change', 'status_change'],
    });

    // Estrategia para viajes: invalidar cuando cambia estado, se asigna conductor, etc.
    this.invalidationStrategies.set('trip', {
      patterns: ['trip:{tripId}:*', 'trip:*:{tripId}:*', 'driver:*:trip:{tripId}:*'],
      triggers: ['status_change', 'driver_assignment', 'cancellation', 'completion'],
    });

    // Estrategia para conductores: invalidar cuando cambia disponibilidad, rating, etc.
    this.invalidationStrategies.set('driver', {
      patterns: ['driver:{driverId}:*', 'trip:*:driver:{driverId}:*'],
      triggers: ['availability_change', 'rating_update', 'location_update'],
    });

    // Estrategia para estadísticas: invalidar cuando cambian datos relacionados
    this.invalidationStrategies.set('stats', {
      patterns: ['stats:*'],
      triggers: ['user_creation', 'trip_creation', 'trip_completion', 'trip_cancellation'],
    });
  }

  /**
   * Inicializar Redis si está disponible
   */
  async initializeRedis() {
    if (this.useRedis) {
      try {
        const redis = require('redis');
        this.redis = redis.createClient({
          url: process.env.REDIS_URL,
          retry_strategy: options => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              console.warn('Redis no disponible, usando caché en memoria');
              return undefined;
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              return new Error('Retry time exhausted');
            }
            if (options.attempt > 10) {
              return undefined;
            }
            return Math.min(options.attempt * 100, 3000);
          },
        });

        this.redis.on('error', err => {
          console.warn('Redis error:', err);
          this.redis = null;
          this.useRedis = false;
        });

        await this.redis.connect();
        console.log('✅ Redis conectado para caché');
      } catch (error) {
        console.warn('⚠️ Redis no disponible, usando caché en memoria:', error.message);
        this.redis = null;
        this.useRedis = false;
      }
    }
  }

  /**
   * Generar clave de caché con hash para parámetros complejos
   * @param {string} prefix - Prefijo del tipo de caché
   * @param {string} identifier - Identificador principal
   * @param {Object} params - Parámetros adicionales
   * @returns {string} Clave de caché generada
   */
  generateKey(prefix, identifier, params = {}) {
    const paramString = Object.keys(params).length > 0 ? `:${JSON.stringify(params)}` : '';
    return `${prefix}:${identifier}${paramString}`;
  }

  /**
   * Generar clave de caché con hash para parámetros complejos
   * @param {string} prefix - Prefijo del tipo de caché
   * @param {string} identifier - Identificador principal
   * @param {Object} params - Parámetros adicionales
   * @returns {string} Clave de caché generada
   */
  generateKeyWithHash(prefix, identifier, params = {}) {
    const crypto = require('crypto');
    const paramString =
      Object.keys(params).length > 0
        ? `:${crypto.createHash('md5').update(JSON.stringify(params)).digest('hex')}`
        : '';
    return `${prefix}:${identifier}${paramString}`;
  }

  /**
   * Obtener TTL apropiado para el tipo de dato
   * @param {string} prefix - Prefijo del tipo de caché
   * @param {number} customTtl - TTL personalizado(opcional)
   * @returns {number} TTL en milisegundos
   */
  getTTL(prefix, customTtl = null) {
    if (customTtl !== null) return customTtl;
    return TTL_CONFIG[prefix] || DEFAULT_TTL;
  }

  /**
   * Obtener valor del caché con métricas
   * @param {string} key - Clave del caché
   * @returns {Promise<any>} Valor del caché o null si no existe
   */
  async get(key) {
    try {
      if (this.useRedis && this.redis) {
        const value = await this.redis.get(key);
        if (value) {
          this.metrics.hits++;
          return JSON.parse(value);
        } else {
          this.metrics.misses++;
          return null;
        }
      } else {
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
          this.metrics.hits++;
          return cached.data;
        }
        if (cached) {
          cache.delete(key);
        }
        this.metrics.misses++;
        return null;
      }
    } catch (error) {
      console.error('Error getting cache:', error);
      this.metrics.misses++;
      return null;
    }
  }

  /**
   * Establecer valor en el caché con métricas
   * @param {string} key - Clave del caché
   * @param {any} data - Datos a almacenar
   * @param {number} ttl - TTL en milisegundos(opcional)
   * @returns {Promise<boolean>} True si se almacenó correctamente
   */
  async set(key, data, ttl = DEFAULT_TTL) {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.setEx(key, Math.floor(ttl / 1000), JSON.stringify(data));
      } else {
        cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl,
        });
      }
      this.metrics.sets++;
      return true;
    } catch (error) {
      console.error('Error setting cache:', error);
      return false;
    }
  }

  /**
   * Establecer valor en el caché con TTL automático basado en el prefijo
   * @param {string} prefix - Prefijo del tipo de caché
   * @param {string} identifier - Identificador principal
   * @param {any} data - Datos a almacenar
   * @param {Object} params - Parámetros adicionales
   * @param {number} customTtl - TTL personalizado(opcional)
   * @returns {Promise<boolean>} True si se almacenó correctamente
   */
  async setWithPrefix(prefix, identifier, data, params = {}, customTtl = null) {
    const key = this.generateKey(prefix, identifier, params);
    const ttl = this.getTTL(prefix, customTtl);
    return this.set(key, data, ttl);
  }

  /**
   * Eliminar valor del caché con métricas
   * @param {string} key - Clave del caché
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  async del(key) {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.del(key);
      } else {
        cache.delete(key);
      }
      this.metrics.deletes++;
      return true;
    } catch (error) {
      console.error('Error deleting cache:', error);
      return false;
    }
  }

  /**
   * Invalidar caché usando estrategias predefinidas
   * @param {string} strategy - Nombre de la estrategia
   * @param {Object} params - Parámetros para la invalidación
   * @returns {Promise<number>} Número de claves invalidadas
   */
  async invalidateByStrategy(strategy, params = {}) {
    const strategyConfig = this.invalidationStrategies.get(strategy);
    if (!strategyConfig) {
      console.warn(`Estrategia de invalidación no encontrada: ${strategy}`);
      return 0;
    }

    let totalInvalidated = 0;
    for (const pattern of strategyConfig.patterns) {
      const resolvedPattern = this.resolvePattern(pattern, params);
      totalInvalidated += await this.invalidatePattern(resolvedPattern);
    }

    this.metrics.invalidations += totalInvalidated;
    return totalInvalidated;
  }

  /**
   * Resolver patrón de invalidación con parámetros
   * @param {string} pattern - Patrón con placeholders
   * @param {Object} params - Parámetros para reemplazar
   * @returns {string} Patrón resuelto
   */
  resolvePattern(pattern, params) {
    let resolvedPattern = pattern;
    for (const [key, value] of Object.entries(params)) {
      resolvedPattern = resolvedPattern.replace(`{${key}}`, value);
    }
    return resolvedPattern;
  }

  /**
   * Invalidar caché por patrón con métricas
   * @param {string} pattern - Patrón de búsqueda
   * @returns {Promise<number>} Número de claves invalidadas
   */
  async invalidatePattern(pattern) {
    try {
      if (this.useRedis && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(keys);
        }
        this.metrics.invalidations += keys.length;
        return keys.length;
      } else {
        let invalidated = 0;
        for (const key of cache.keys()) {
          if (key.includes(pattern)) {
            cache.delete(key);
            invalidated++;
          }
        }
        this.metrics.invalidations += invalidated;
        return invalidated;
      }
    } catch (error) {
      console.error('Error invalidating cache pattern:', error);
      return 0;
    }
  }

  /**
   * Invalidar caché de usuario usando estrategia
   * @param {string} userId - ID del usuario
   * @returns {Promise<number>} Número de claves invalidadas
   */
  async invalidateUser(userId) {
    return this.invalidateByStrategy('user', { userId });
  }

  /**
   * Invalidar caché de viaje usando estrategia
   * @param {string} tripId - ID del viaje
   * @returns {Promise<number>} Número de claves invalidadas
   */
  async invalidateTrip(tripId) {
    return this.invalidateByStrategy('trip', { tripId });
  }

  /**
   * Invalidar caché de conductor usando estrategia
   * @param {string} driverId - ID del conductor
   * @returns {Promise<number>} Número de claves invalidadas
   */
  async invalidateDriver(driverId) {
    return this.invalidateByStrategy('driver', { driverId });
  }

  /**
   * Invalidar caché de estadísticas
   * @returns {Promise<number>} Número de claves invalidadas
   */
  async invalidateStats() {
    return this.invalidateByStrategy('stats');
  }

  /**
   * Obtener métricas del caché
   * @returns {Object} Métricas del caché
   */
  getMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;

    return {
      ...this.metrics,
      total,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Resetear métricas del caché
   */
  resetMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      invalidations: 0,
    };
  }

  /**
   * Limpiar caché expirado(solo para memoria)
   */
  cleanExpired() {
    if (this.useRedis) return 0;

    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Obtener estadísticas del caché con métricas avanzadas
   * @returns {Promise<Object>} Estadísticas del caché
   */
  async getStats() {
    try {
      const metrics = this.getMetrics();

      if (this.useRedis && this.redis) {
        const info = await this.redis.info('memory');
        const keyspace = await this.redis.info('keyspace');
        return {
          type: 'redis',
          memory: info,
          keyspace,
          metrics,
        };
      } else {
        const now = Date.now();
        let active = 0;
        let expired = 0;

        for (const [, value] of cache.entries()) {
          if (now - value.timestamp < value.ttl) {
            active++;
          } else {
            expired++;
          }
        }

        return {
          type: 'memory',
          total: cache.size,
          active,
          expired,
          memoryUsage: process.memoryUsage(),
          metrics,
        };
      }
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { type: 'error', error: error.message, metrics: this.getMetrics() };
    }
  }

  /**
   * Limpiar todo el caché
   */
  async clear() {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.flushAll();
      } else {
        cache.clear();
      }
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Middleware de caché para Express con métricas
   * @param {number} ttl - TTL en milisegundos
   * @param {Function} keyGenerator - Función para generar claves personalizadas
   * @returns {Function} Middleware de Express
   */
  middleware(ttl = DEFAULT_TTL, keyGenerator = null) {
    return async (req, res, next) => {
      // Solo cachear GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : this.generateKey('api', req.originalUrl, req.query);

      try {
        const cached = await this.get(cacheKey);
        if (cached) {
          console.log(`Cache hit: ${cacheKey}`);
          return res.json(cached);
        }
      } catch (error) {
        console.error('Cache get error:', error);
      }

      // Interceptar la respuesta
      const originalJson = res.json;
      res.json = async data => {
        // Solo cachear respuestas exitosas
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            await this.set(cacheKey, data, ttl);
            console.log(`Cache set: ${cacheKey}`);
          } catch (error) {
            console.error('Cache set error:', error);
          }
        }
        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Obtener o establecer valor con fallback
   * @param {string} key - Clave del caché
   * @param {Function} fallback - Función para obtener el valor si no está en caché
   * @param {number} ttl - TTL en milisegundos
   * @returns {Promise<any>} Valor del caché o resultado del fallback
   */
  async getOrSet(key, fallback, ttl = DEFAULT_TTL) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fallback();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * Obtener o establecer valor con fallback usando prefijo
   * @param {string} prefix - Prefijo del tipo de caché
   * @param {string} identifier - Identificador principal
   * @param {Function} fallback - Función para obtener el valor si no está en caché
   * @param {Object} params - Parámetros adicionales
   * @param {number} customTtl - TTL personalizado(opcional)
   * @returns {Promise<any>} Valor del caché o resultado del fallback
   */
  async getOrSetWithPrefix(prefix, identifier, fallback, params = {}, customTtl = null) {
    const key = this.generateKey(prefix, identifier, params);
    const ttl = this.getTTL(prefix, customTtl);
    return this.getOrSet(key, fallback, ttl);
  }
}

// Instancia singleton
const cacheService = new CacheService();

// Limpiar caché expirado cada 10 minutos(solo para memoria)
setInterval(
  () => {
    cacheService.cleanExpired();
  },
  10 * 60 * 1000,
);

module.exports = cacheService;
