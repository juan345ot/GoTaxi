/* eslint-disable no-console */
const redisService = require('../services/redisService');
const queryOptimizationService = require('../services/queryOptimizationService');
const connectionPoolService = require('../services/connectionPoolService');
const apmService = require('../services/apmService');
const { logger } = require('../utils/logger');
const { performance } = require('perf_hooks');

/**
 * Middleware de optimización de rendimiento
 * Integra Redis cache, optimización de queries, y monitoreo APM
 */
class PerformanceOptimizationMiddleware {
  constructor() {
    this.cacheEnabled = process.env.REDIS_ENABLED !== 'false';
    this.queryOptimizationEnabled = process.env.QUERY_OPTIMIZATION_ENABLED !== 'false';
    this.apmEnabled = process.env.APM_ENABLED !== 'false';
    this.cacheTTL = parseInt(process.env.CACHE_TTL) || 300; // 5 minutos por defecto
  }

  /**
   * Middleware principal de optimización
   */
  middleware() {
    return async (req, res, next) => {
      // En entorno de test, solo pasar al siguiente middleware sin hacer nada
      if (process.env.NODE_ENV === 'test') {
        return next();
      }

      const startTime = performance.now();

      try {
        // Inicializar servicios si no están inicializados
        await this.initializeServices();

        // Aplicar optimizaciones de request
        await this.optimizeRequest(req, res);

        // Interceptar response para métricas
        this.interceptResponse(req, res, startTime);

        next();
      } catch (error) {
        console.error('Performance optimization middleware error:', error);
        next();
      }
    };
  }

  /**
   * Inicializar servicios
   */
  async initializeServices() {
    try {
      // Solo inicializar servicios en producción o si Redis está disponible
      if (process.env.NODE_ENV === 'production' || process.env.REDIS_HOST) {
        // Inicializar connection pool si no está inicializado
        if (!connectionPoolService.isInitialized) {
          await connectionPoolService.initialize();
        }

        // Iniciar monitoreo APM si está habilitado
        if (this.apmEnabled && !apmService.isMonitoring) {
          apmService.startMonitoring();
        }
      }
    } catch (error) {
      console.error('Failed to initialize performance services:', error);
      // No lanzar error para no romper la aplicación
    }
  }

  /**
   * Optimizar request
   */
  async optimizeRequest(req, res) {
    // Agregar headers de performance
    res.setHeader('X-Performance-Optimized', 'true');
    res.setHeader('X-Cache-Enabled', this.cacheEnabled.toString());
    res.setHeader('X-Query-Optimization', this.queryOptimizationEnabled.toString());

    // Verificar cache si está habilitado
    if (this.cacheEnabled && this.shouldCacheRequest(req)) {
      await this.handleCacheRequest(req, res);
    }
  }

  /**
   * Verificar si el request debe ser cacheado
   */
  shouldCacheRequest(req) {
    // Solo cachear GET requests
    if (req.method !== 'GET') return false;

    // No cachear requests de autenticación
    if (req.path.includes('/auth/')) return false;

    // No cachear requests de administración
    if (req.path.includes('/admin/')) return false;

    // Cachear requests de métricas, trips, users, etc.
    const cacheablePaths = ['/api/trips', '/api/users', '/api/metrics', '/api/health'];
    return cacheablePaths.some(path => req.path.startsWith(path));
  }

  /**
   * Manejar request con cache
   */
  async handleCacheRequest(req, res) {
    try {
      const cacheKey = this.generateCacheKey(req);
      const cachedData = await redisService.get(cacheKey);

      if (cachedData) {
        res.setHeader('X-Cache-Status', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }

      // Marcar para cachear response
      req._shouldCache = true;
      req._cacheKey = cacheKey;
      req._cacheTTL = this.getCacheTTL(req);
    } catch (error) {
      logger.error('Cache request handling error:', error);
    }
  }

  /**
   * Generar clave de cache
   */
  generateCacheKey(req) {
    const baseKey = `${req.method}:${req.path}`;
    const queryString = req.query ? JSON.stringify(req.query) : '';
    const userContext = req.user ? `:user:${req.user.id}` : '';

    return `${baseKey}${queryString}${userContext}`;
  }

  /**
   * Obtener TTL de cache basado en el endpoint
   */
  getCacheTTL(req) {
    const path = req.path;

    // TTLs específicos por endpoint
    if (path.includes('/trips')) return 60; // 1 minuto
    if (path.includes('/users')) return 300; // 5 minutos
    if (path.includes('/metrics')) return 30; // 30 segundos
    if (path.includes('/health')) return 10; // 10 segundos

    return this.cacheTTL;
  }

  /**
   * Interceptar response para métricas y cache
   */
  interceptResponse(req, res, startTime) {
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    res.json = data => {
      this.handleResponse(req, res, data, startTime, originalJson);
    };

    res.send = data => {
      this.handleResponse(req, res, data, startTime, originalSend);
    };
  }

  /**
   * Manejar response
   */
  async handleResponse(req, res, data, startTime, originalMethod) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    try {
      // Registrar métricas APM
      if (this.apmEnabled) {
        apmService.recordRequest(req.method, req.path, res.statusCode, responseTime, req.user?.id);
      }

      // Cachear response si es necesario
      if (req._shouldCache && res.statusCode === 200) {
        await this.cacheResponse(req, data);
      }

      // Agregar headers de performance
      res.setHeader('X-Response-Time', `${responseTime.toFixed(2)}ms`);
      res.setHeader('X-Processed-At', new Date().toISOString());

      // Llamar método original
      originalMethod(data);
    } catch (error) {
      logger.error('Response handling error:', error);
      originalMethod(data);
    }
  }

  /**
   * Cachear response
   */
  async cacheResponse(req, data) {
    try {
      if (this.cacheEnabled && req._cacheKey) {
        await redisService.set(req._cacheKey, data, req._cacheTTL);
        logger.debug(`Response cached with key: ${req._cacheKey}`);
      }
    } catch (error) {
      logger.error('Cache response error:', error);
    }
  }

  /**
   * Middleware de optimización de queries
   */
  queryOptimization() {
    return async (req, res, next) => {
      if (!this.queryOptimizationEnabled) {
        return next();
      }

      try {
        // Interceptar operaciones de base de datos

        // Analizar query si es necesario
        if (this.shouldOptimizeQuery(req)) {
          const optimization = await this.optimizeQuery(req);
          if (optimization) {
            req._queryOptimization = optimization;
            res.setHeader('X-Query-Optimized', 'true');
          }
        }

        next();
      } catch (error) {
        logger.error('Query optimization error:', error);
        next();
      }
    };
  }

  /**
   * Verificar si la query debe ser optimizada
   */
  shouldOptimizeQuery(req) {
    // Solo optimizar requests que interactúan con base de datos
    const dbPaths = ['/api/trips', '/api/users', '/api/drivers'];
    return dbPaths.some(path => req.path.startsWith(path));
  }

  /**
   * Optimizar query
   */
  async optimizeQuery(req) {
    try {
      const collection = this.getCollectionFromPath(req.path);
      if (!collection) return null;

      const query = req.query;
      const options = {
        limit: parseInt(req.query.limit) || 20,
        skip: parseInt(req.query.skip) || 0,
        sort: req.query.sort,
      };

      const optimization = await queryOptimizationService.analyzeQuery(collection, query, options);

      return optimization;
    } catch (error) {
      logger.error('Query optimization failed:', error);
      return null;
    }
  }

  /**
   * Obtener colección desde el path
   */
  getCollectionFromPath(path) {
    if (path.includes('/trips')) return 'trips';
    if (path.includes('/users')) return 'users';
    if (path.includes('/drivers')) return 'drivers';
    return null;
  }

  /**
   * Middleware de monitoreo de base de datos
   */
  databaseMonitoring() {
    return async (req, res, next) => {
      if (!this.apmEnabled) {
        return next();
      }

      try {
        // Interceptar operaciones de base de datos

        // Agregar listener para queries de mongoose
        this.setupDatabaseMonitoring();

        next();
      } catch (error) {
        logger.error('Database monitoring error:', error);
        next();
      }
    };
  }

  /**
   * Configurar monitoreo de base de datos
   */
  setupDatabaseMonitoring() {
    const mongoose = require('mongoose');

    // Monitorear queries
    mongoose.set('debug', (collection, method, _query, _doc) => {
      const queryTime = performance.now();
      const isSlow = queryTime > 1000; // 1 segundo

      apmService.recordDatabaseQuery(collection, method, queryTime, isSlow);
    });
  }

  /**
   * Middleware de cache invalidation
   */
  cacheInvalidation() {
    return async (req, res, next) => {
      // Invalidar cache después de operaciones de escritura
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        res.on('finish', async () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            await this.invalidateRelatedCache(req);
          }
        });
      }

      next();
    };
  }

  /**
   * Invalidar cache relacionado
   */
  async invalidateRelatedCache(req) {
    try {
      if (!this.cacheEnabled) return;

      const path = req.path;
      const patterns = [];

      // Patrones de invalidación basados en el endpoint
      if (path.includes('/trips')) {
        patterns.push('GET:/api/trips*');
        patterns.push('GET:/api/users*'); // Los trips afectan usuarios
      } else if (path.includes('/users')) {
        patterns.push('GET:/api/users*');
      } else if (path.includes('/drivers')) {
        patterns.push('GET:/api/drivers*');
        patterns.push('GET:/api/trips*'); // Los drivers afectan trips
      }

      // Invalidar patrones
      for (const pattern of patterns) {
        await redisService.invalidatePattern(pattern);
      }

      logger.debug(`Cache invalidated for patterns: ${patterns.join(', ')}`);
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }
  }

  /**
   * Middleware de health check
   */
  healthCheck() {
    return async (req, res, next) => {
      if (req.path === '/health' || req.path === '/api/health') {
        try {
          const health = await this.getHealthStatus();
          return res.json(health);
        } catch (error) {
          return res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }

      next();
    };
  }

  /**
   * Obtener estado de salud
   */
  async getHealthStatus() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {},
      metrics: {},
    };

    try {
      // Verificar Redis
      if (this.cacheEnabled) {
        const redisHealth = await redisService.healthCheck();
        health.services.redis = redisHealth;
      }

      // Verificar Connection Pool
      const poolStats = connectionPoolService.getPoolStats();
      health.services.connectionPool = {
        status: poolStats.isInitialized ? 'healthy' : 'unhealthy',
        stats: poolStats,
      };

      // Verificar APM
      if (this.apmEnabled) {
        const apmHealth = apmService.getHealthReport();
        health.services.apm = apmHealth;
        health.metrics = apmHealth.metrics;
      }

      // Determinar estado general
      const services = Object.values(health.services);
      const unhealthyServices = services.filter(
        service => service.status === 'unhealthy' || service.status === 'critical',
      );

      if (unhealthyServices.length > 0) {
        health.status = unhealthyServices.length === services.length ? 'critical' : 'warning';
      }

      return health;
    } catch (error) {
      health.status = 'unhealthy';
      health.error = error.message;
      return health;
    }
  }

  /**
   * Obtener métricas de rendimiento
   */
  getPerformanceMetrics() {
    const metrics = {
      cache: this.cacheEnabled ? redisService.getStats() : null,
      connectionPool: connectionPoolService.getPoolStats(),
      apm: this.apmEnabled ? apmService.getMetrics() : null,
      queryOptimization: this.queryOptimizationEnabled
        ? queryOptimizationService.getQueryStats()
        : null,
    };

    return metrics;
  }

  /**
   * Resetear métricas
   */
  resetMetrics() {
    if (this.cacheEnabled) {
      redisService.resetMetrics();
    }

    if (this.apmEnabled) {
      apmService.resetMetrics();
    }

    if (this.queryOptimizationEnabled) {
      queryOptimizationService.resetMetrics();
    }

    connectionPoolService.resetMetrics();
  }
}

// Crear instancia singleton
const performanceOptimization = new PerformanceOptimizationMiddleware();

module.exports = performanceOptimization.middleware();
