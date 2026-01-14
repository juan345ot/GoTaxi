/**
 * Middleware de monitoreo de performance
 */
/* eslint-disable no-console */

const metricsService = require('../services/metricsService');

/**
 * Middleware para medir tiempo de respuesta
 */
const measureResponseTime = (req, res, next) => {
  const startTime = Date.now();

  // Interceptar el método end para medir el tiempo total
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;

    // Registrar métricas
    metricsService.recordRequest(
      req.method,
      req.route?.path || req.path,
      res.statusCode,
      responseTime,
    );

    // Agregar header con tiempo de respuesta
    res.setHeader('X-Response-Time', `${responseTime}ms`);

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Middleware para medir queries de base de datos
 */
const measureDatabaseQueries = (req, res, next) => {
  const originalQuery = require('mongoose').Query.prototype.exec;
  // const startTime = Date.now(); // No utilizado

  require('mongoose').Query.prototype.exec = function () {
    const queryStartTime = Date.now();

    return originalQuery
      .apply(this, arguments)
      .then(result => {
        const queryTime = Date.now() - queryStartTime;
        const isSlow = queryTime > 1000; // Considerar lento si toma más de 1 segundo

        metricsService.recordDatabaseQuery(queryTime, isSlow);

        if (isSlow) {
          console.warn(
            `Slow query detected: ${queryTime}ms - ${this.mongooseCollection.name}.${this.op}`,
          );
        }

        return result;
      })
      .catch(error => {
        const queryTime = Date.now() - queryStartTime;
        metricsService.recordDatabaseQuery(queryTime, false);
        throw error;
      });
  };

  next();
};

/**
 * Middleware para medir operaciones de caché
 */
const measureCacheOperations = (req, res, next) => {
  // Este middleware se integra con el cacheService
  // Las métricas se registran directamente en el cacheService
  next();
};

/**
 * Middleware para medir uso de memoria
 */
const measureMemoryUsage = (req, res, next) => {
  const startMemory = process.memoryUsage();

  res.on('finish', () => {
    const endMemory = process.memoryUsage();
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
    };

    // Solo registrar si hay un cambio significativo
    if (Math.abs(memoryDelta.heapUsed) > 1024 * 1024) {
      // 1MB
      console.log(`Memory delta for ${req.method} ${req.path}:`, memoryDelta);
    }
  });

  next();
};

/**
 * Middleware para detectar memory leaks
 */
const detectMemoryLeaks = (req, res, next) => {
  const startMemory = process.memoryUsage();

  res.on('finish', () => {
    const endMemory = process.memoryUsage();
    const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed;

    // Alertar si el uso de memoria aumenta significativamente
    if (memoryIncrease > 10 * 1024 * 1024) {
      // 10MB
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
      console.warn(
        `Potential memory leak detected: ${memoryIncreaseMB}MB increase for ${req.method} ` +
          `${req.path}`,
      );
    }
  });

  next();
};

/**
 * Middleware para monitorear conexiones de base de datos
 */
const monitorDatabaseConnections = (req, res, next) => {
  const mongoose = require('mongoose');

  if (mongoose.connection.readyState === 1) {
    const connectionState = mongoose.connection.db.admin().command({ connectionStatus: 1 });

    connectionState
      .then(result => {
        metricsService.metrics.database.connectionPool = {
          active: result.connections?.current || 0,
          idle: result.connections?.available || 0,
          total: result.connections?.totalCreated || 0,
        };
      })
      .catch(error => {
        console.error('Error monitoring database connections:', error);
      });
  }

  next();
};

/**
 * Middleware para detectar requests lentas
 */
const detectSlowRequests = (threshold = 5000) => {
  return (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const responseTime = Date.now() - startTime;

      if (responseTime > threshold) {
        console.warn(`Slow request detected: ${responseTime}ms - ${req.method} ${req.path}`);

        // Registrar en métricas
        metricsService.recordError(new Error(`Slow request: ${responseTime}ms`), req.path);
      }
    });

    next();
  };
};

/**
 * Middleware para monitorear errores
 */
const monitorErrors = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    if (res.statusCode >= 400) {
      metricsService.recordError(new Error(`HTTP ${res.statusCode}`), req.path);
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Middleware para agregar headers de performance
 */
const addPerformanceHeaders = (req, res, next) => {
  const startTime = Date.now();

  // Establecer headers antes de enviar la respuesta
  res.setHeader('X-Request-ID', req.headers['x-request-id'] || 'unknown');
  res.setHeader('X-Server-Time', new Date().toISOString());

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;

    // Solo establecer el header de tiempo de respuesta si no se han enviado headers
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${responseTime}ms`);
    }
  });

  next();
};

/**
 * Middleware para logging de performance
 */
const logPerformance = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const memoryUsage = process.memoryUsage();

    const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    console.log(
      `[PERF] ${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms - ` +
        `Memory: ${memoryMB}MB`,
    );
  });

  next();
};

/**
 * Middleware combinado de performance
 */
const performanceMiddleware = [
  measureResponseTime,
  measureDatabaseQueries,
  measureMemoryUsage,
  detectMemoryLeaks,
  monitorDatabaseConnections,
  detectSlowRequests(5000),
  monitorErrors,
  addPerformanceHeaders,
];

// Solo agregar logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  performanceMiddleware.push(logPerformance);
}

module.exports = {
  measureResponseTime,
  measureDatabaseQueries,
  measureCacheOperations,
  measureMemoryUsage,
  detectMemoryLeaks,
  monitorDatabaseConnections,
  detectSlowRequests,
  monitorErrors,
  addPerformanceHeaders,
  logPerformance,
  performanceMiddleware,
};
