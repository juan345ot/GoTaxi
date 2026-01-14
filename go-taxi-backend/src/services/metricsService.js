/**
 * Servicio de métricas de performance
 */

class MetricsService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byRoute: {},
        byStatus: {},
        responseTime: [],
      },
      database: {
        queries: 0,
        slowQueries: 0,
        connectionPool: {
          active: 0,
          idle: 0,
          total: 0,
        },
      },
      cache: {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
      },
      errors: {
        total: 0,
        byType: {},
        byRoute: {},
      },
      memory: {
        usage: [],
        gc: 0,
      },
    };

    this.startTime = Date.now();
    this.initializeGC();
  }

  /**
   * Inicializar monitoreo de garbage collection
   */
  initializeGC() {
    if (process.env.NODE_ENV === 'production') {
      const v8 = require('v8');

      setInterval(() => {
        const heapStats = v8.getHeapStatistics();
        this.metrics.memory.usage.push({
          timestamp: Date.now(),
          used: heapStats.used_heap_size,
          total: heapStats.total_heap_size,
          external: heapStats.external_memory,
          rss: process.memoryUsage().rss,
        });

        // Mantener solo las últimas 100 mediciones
        if (this.metrics.memory.usage.length > 100) {
          this.metrics.memory.usage = this.metrics.memory.usage.slice(-100);
        }
      }, 30000); // Cada 30 segundos
    }
  }

  /**
   * Registrar una request
   */
  recordRequest(method, route, statusCode, responseTime) {
    this.metrics.requests.total++;

    // Por método
    this.metrics.requests.byMethod[method] = (this.metrics.requests.byMethod[method] || 0) + 1;

    // Por ruta
    this.metrics.requests.byRoute[route] = (this.metrics.requests.byRoute[route] || 0) + 1;

    // Por status
    this.metrics.requests.byStatus[statusCode] =
      (this.metrics.requests.byStatus[statusCode] || 0) + 1;

    // Tiempo de respuesta
    this.metrics.requests.responseTime.push(responseTime);

    // Mantener solo las últimas 1000 mediciones
    if (this.metrics.requests.responseTime.length > 1000) {
      this.metrics.requests.responseTime = this.metrics.requests.responseTime.slice(-1000);
    }
  }

  /**
   * Registrar una query de base de datos
   */
  recordDatabaseQuery(duration, isSlow = false) {
    this.metrics.database.queries++;

    if (isSlow) {
      this.metrics.database.slowQueries++;
    }
  }

  /**
   * Registrar operación de caché
   */
  recordCacheOperation(operation, success = true) {
    if (success) {
      this.metrics.cache[operation] = (this.metrics.cache[operation] || 0) + 1;
    }
  }

  /**
   * Registrar un error
   */
  recordError(error, route = null) {
    this.metrics.errors.total++;

    const errorType = error.constructor.name;
    this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;

    if (route) {
      this.metrics.errors.byRoute[route] = (this.metrics.errors.byRoute[route] || 0) + 1;
    }
  }

  /**
   * Obtener estadísticas de requests
   */
  getRequestStats() {
    const responseTimes = this.metrics.requests.responseTime;
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedResponseTimes.length * 0.95);
    const p99Index = Math.floor(sortedResponseTimes.length * 0.99);

    return {
      total: this.metrics.requests.total,
      byMethod: this.metrics.requests.byMethod,
      byRoute: this.metrics.requests.byRoute,
      byStatus: this.metrics.requests.byStatus,
      responseTime: {
        average: Math.round(avgResponseTime),
        min: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        max: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        p95: sortedResponseTimes[p95Index] || 0,
        p99: sortedResponseTimes[p99Index] || 0,
      },
    };
  }

  /**
   * Obtener estadísticas de base de datos
   */
  getDatabaseStats() {
    const slowQueryRate =
      this.metrics.database.queries > 0
        ? (this.metrics.database.slowQueries / this.metrics.database.queries) * 100
        : 0;

    return {
      totalQueries: this.metrics.database.queries,
      slowQueries: this.metrics.database.slowQueries,
      slowQueryRate: Math.round(slowQueryRate * 100) / 100,
      connectionPool: this.metrics.database.connectionPool,
    };
  }

  /**
   * Obtener estadísticas de caché
   */
  getCacheStats() {
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    const hitRate = total > 0 ? (this.metrics.cache.hits / total) * 100 : 0;

    return {
      hits: this.metrics.cache.hits,
      misses: this.metrics.cache.misses,
      sets: this.metrics.cache.sets,
      deletes: this.metrics.cache.deletes,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Obtener estadísticas de errores
   */
  getErrorStats() {
    return {
      total: this.metrics.errors.total,
      byType: this.metrics.errors.byType,
      byRoute: this.metrics.errors.byRoute,
    };
  }

  /**
   * Obtener estadísticas de memoria
   */
  getMemoryStats() {
    const current = process.memoryUsage();
    const recent = this.metrics.memory.usage.slice(-10); // Últimas 10 mediciones

    return {
      current: {
        rss: current.rss,
        heapUsed: current.heapUsed,
        heapTotal: current.heapTotal,
        external: current.external,
      },
      recent,
      gcCount: this.metrics.memory.gc,
    };
  }

  /**
   * Obtener todas las métricas
   */
  getAllMetrics() {
    const uptime = Date.now() - this.startTime;

    return {
      uptime,
      timestamp: new Date().toISOString(),
      requests: this.getRequestStats(),
      database: this.getDatabaseStats(),
      cache: this.getCacheStats(),
      errors: this.getErrorStats(),
      memory: this.getMemoryStats(),
    };
  }

  /**
   * Obtener métricas resumidas para health check
   */
  getHealthMetrics() {
    const requestStats = this.getRequestStats();
    const errorStats = this.getErrorStats();
    const memoryStats = this.getMemoryStats();

    const errorRate = requestStats.total > 0 ? (errorStats.total / requestStats.total) * 100 : 0;

    const memoryUsagePercent =
      memoryStats.current.heapTotal > 0
        ? (memoryStats.current.heapUsed / memoryStats.current.heapTotal) * 100
        : 0;

    return {
      status: errorRate < 5 && memoryUsagePercent < 90 ? 'healthy' : 'unhealthy',
      uptime: Date.now() - this.startTime,
      requests: requestStats.total,
      errorRate: Math.round(errorRate * 100) / 100,
      avgResponseTime: requestStats.responseTime.average,
      memoryUsage: Math.round(memoryUsagePercent * 100) / 100,
    };
  }

  /**
   * Resetear métricas
   */
  reset() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byRoute: {},
        byStatus: {},
        responseTime: [],
      },
      database: {
        queries: 0,
        slowQueries: 0,
        connectionPool: {
          active: 0,
          idle: 0,
          total: 0,
        },
      },
      cache: {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
      },
      errors: {
        total: 0,
        byType: {},
        byRoute: {},
      },
      memory: {
        usage: [],
        gc: 0,
      },
    };

    this.startTime = Date.now();
  }
}

// Instancia singleton
const metricsService = new MetricsService();

module.exports = metricsService;
