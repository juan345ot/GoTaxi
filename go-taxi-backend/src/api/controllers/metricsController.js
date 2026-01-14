/**
 * Controlador de métricas y monitoreo
 */
/* eslint-disable no-console, max-len, operator-linebreak */

const metricsService = require('../../services/metricsService');
const cacheService = require('../../services/cacheService');

/**
 * Obtener métricas completas del sistema
 */
const getMetrics = async (req, res) => {
  try {
    const metrics = metricsService.getAllMetrics();
    const cacheStats = await cacheService.getStats();

    const response = {
      ...metrics,
      cache: cacheStats,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo métricas',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Obtener métricas de health check
 */
const getHealth = async (req, res) => {
  try {
    const healthMetrics = metricsService.getHealthMetrics();
    const cacheStats = await cacheService.getStats();

    // Verificar estado de la base de datos
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Verificar estado del caché
    const cacheStatus = cacheStats.type !== 'error' ? 'healthy' : 'unhealthy';

    const response = {
      ...healthMetrics,
      database: {
        status: dbStatus,
        connectionState: mongoose.connection.readyState,
      },
      cache: {
        status: cacheStatus,
        type: cacheStats.type,
      },
      timestamp: new Date().toISOString(),
    };

    const statusCode = response.status === 'healthy' && dbStatus === 'connected' ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error getting health metrics:', error);
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable',
    });
  }
};

/**
 * Obtener métricas de requests
 */
const getRequestMetrics = async (req, res) => {
  try {
    const requestStats = metricsService.getRequestStats();

    res.json({
      success: true,
      data: requestStats,
    });
  } catch (error) {
    console.error('Error getting request metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo métricas de requests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Obtener métricas de base de datos
 */
const getDatabaseMetrics = async (req, res) => {
  try {
    const dbStats = metricsService.getDatabaseStats();

    res.json({
      success: true,
      data: dbStats,
    });
  } catch (error) {
    console.error('Error getting database metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo métricas de base de datos',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Obtener métricas de caché
 */
const getCacheMetrics = async (req, res) => {
  try {
    const cacheStats = await cacheService.getStats();
    const metricsCacheStats = metricsService.getCacheStats();

    const response = {
      ...cacheStats,
      metrics: metricsCacheStats,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error getting cache metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo métricas de caché',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Obtener métricas de memoria
 */
const getMemoryMetrics = async (req, res) => {
  try {
    const memoryStats = metricsService.getMemoryStats();

    res.json({
      success: true,
      data: memoryStats,
    });
  } catch (error) {
    console.error('Error getting memory metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo métricas de memoria',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Obtener métricas de errores
 */
const getErrorMetrics = async (req, res) => {
  try {
    const errorStats = metricsService.getErrorStats();

    res.json({
      success: true,
      data: errorStats,
    });
  } catch (error) {
    console.error('Error getting error metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo métricas de errores',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Resetear métricas
 */
const resetMetrics = async (req, res) => {
  try {
    metricsService.reset();
    await cacheService.clear();

    res.json({
      success: true,
      message: 'Métricas reseteadas exitosamente',
    });
  } catch (error) {
    console.error('Error resetting metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error reseteando métricas',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Obtener estadísticas de rendimiento en tiempo real
 */
const getRealtimeStats = async (req, res) => {
  try {
    const metrics = metricsService.getAllMetrics();
    const cacheStats = await cacheService.getStats();

    // Calcular estadísticas en tiempo real
    const recentRequests = metrics.requests.responseTime.filter(time => time > 0);
    const avgResponseTime =
      recentRequests.length > 0
        ? recentRequests.reduce((a, b) => a + b, 0) / recentRequests.length
        : 0;

    const response = {
      timestamp: new Date().toISOString(),
      uptime: metrics.uptime,
      requests: {
        total: metrics.requests.total,
        perSecond: metrics.requests.total / (metrics.uptime / 1000),
        avgResponseTime: Math.round(avgResponseTime),
      },
      database: {
        queries: metrics.database.queries,
        slowQueries: metrics.database.slowQueries,
        slowQueryRate:
          metrics.database.queries > 0
            ? (metrics.database.slowQueries / metrics.database.queries) * 100
            : 0,
      },
      cache: {
        ...cacheStats,
        hitRate:
          metrics.cache.hits + metrics.cache.misses > 0
            ? (metrics.cache.hits / (metrics.cache.hits + metrics.cache.misses)) * 100
            : 0,
      },
      memory: {
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        rss: process.memoryUsage().rss,
      },
      errors: {
        total: metrics.errors.total,
        rate:
          metrics.requests.total > 0 ? (metrics.errors.total / metrics.requests.total) * 100 : 0,
      },
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error getting realtime stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas en tiempo real',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  getMetrics,
  getHealth,
  getRequestMetrics,
  getDatabaseMetrics,
  getCacheMetrics,
  getMemoryMetrics,
  getErrorMetrics,
  resetMetrics,
  getRealtimeStats,
};
