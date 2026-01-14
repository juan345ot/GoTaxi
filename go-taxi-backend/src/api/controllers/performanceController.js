const { logger } = require('../../utils/logger');
const { createSuccessResponse, createErrorResponse } = require('../../utils/responseHelpers');
const performanceOptimization = require('../../middlewares/performanceOptimization');
const redisService = require('../../services/redisService');
const queryOptimizationService = require('../../services/queryOptimizationService');
const connectionPoolService = require('../../services/connectionPoolService');
const apmService = require('../../services/apmService');

/**
 * Controlador de métricas de rendimiento
 * Expone endpoints para monitoreo y optimización de performance
 */
class PerformanceController {
  /**
   * Obtener métricas generales de rendimiento
   */
  async getPerformanceMetrics(req, res) {
    try {
      const metrics = performanceOptimization.getPerformanceMetrics();

      return createSuccessResponse(res, metrics, 'Métricas de rendimiento obtenidas exitosamente');
    } catch (error) {
      logger.error('Error getting performance metrics:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'PERFORMANCE_METRICS_ERROR',
        error,
      );
    }
  }

  /**
   * Obtener estado de salud del sistema
   */
  async getHealthStatus(req, res) {
    try {
      const health = await performanceOptimization.getHealthStatus();

      const statusCode =
        health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503;

      return createSuccessResponse(
        res,
        health,
        'Estado de salud obtenido exitosamente',
        statusCode,
      );
    } catch (error) {
      logger.error('Error getting health status:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'HEALTH_STATUS_ERROR',
        error,
      );
    }
  }

  /**
   * Obtener métricas de Redis
   */
  async getRedisMetrics(req, res) {
    try {
      const metrics = redisService.getStats();

      return createSuccessResponse(res, metrics, 'Métricas de Redis obtenidas exitosamente');
    } catch (error) {
      logger.error('Error getting Redis metrics:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'REDIS_METRICS_ERROR',
        error,
      );
    }
  }

  /**
   * Obtener métricas de base de datos
   */
  async getDatabaseMetrics(req, res) {
    try {
      const poolStats = connectionPoolService.getPoolStats();
      const queryStats = queryOptimizationService.getQueryStats();

      const metrics = {
        connectionPool: poolStats,
        queryOptimization: queryStats,
      };

      return createSuccessResponse(
        res,
        metrics,
        'Métricas de base de datos obtenidas exitosamente',
      );
    } catch (error) {
      logger.error('Error getting database metrics:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'DATABASE_METRICS_ERROR',
        error,
      );
    }
  }

  /**
   * Obtener métricas de APM
   */
  async getAPMMetrics(req, res) {
    try {
      const metrics = apmService.getMetrics();

      return createSuccessResponse(res, metrics, 'Métricas de APM obtenidas exitosamente');
    } catch (error) {
      logger.error('Error getting APM metrics:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'APM_METRICS_ERROR',
        error,
      );
    }
  }

  /**
   * Obtener alertas del sistema
   */
  async getAlerts(req, res) {
    try {
      const { limit = 50, unresolved = false } = req.query;
      const alerts = apmService.getAlerts(parseInt(limit), unresolved === 'true');

      return createSuccessResponse(
        res,
        {
          alerts,
          total: alerts.length,
          limit: parseInt(limit),
          unresolved: unresolved === 'true',
        },
        'Alertas obtenidas exitosamente',
      );
    } catch (error) {
      logger.error('Error getting alerts:', error);
      return createErrorResponse(res, 500, 'Error interno del servidor', 'ALERTS_ERROR', error);
    }
  }

  /**
   * Resolver alerta
   */
  async resolveAlert(req, res) {
    try {
      const { alertId } = req.params;

      if (!alertId) {
        return createErrorResponse(res, 400, 'ID de alerta requerido', 'MISSING_ALERT_ID');
      }

      const resolved = apmService.resolveAlert(alertId);

      if (!resolved) {
        return createErrorResponse(res, 404, 'Alerta no encontrada', 'ALERT_NOT_FOUND');
      }

      return createSuccessResponse(
        res,
        { alertId, resolved: true },
        'Alerta resuelta exitosamente',
      );
    } catch (error) {
      logger.error('Error resolving alert:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'RESOLVE_ALERT_ERROR',
        error,
      );
    }
  }

  /**
   * Obtener queries lentas
   */
  async getSlowQueries(req, res) {
    try {
      const { limit = 10 } = req.query;
      const slowQueries = queryOptimizationService.getSlowQueries(parseInt(limit));

      return createSuccessResponse(
        res,
        {
          slowQueries,
          total: slowQueries.length,
          limit: parseInt(limit),
        },
        'Queries lentas obtenidas exitosamente',
      );
    } catch (error) {
      logger.error('Error getting slow queries:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'SLOW_QUERIES_ERROR',
        error,
      );
    }
  }

  /**
   * Obtener reporte de optimización
   */
  async getOptimizationReport(req, res) {
    try {
      const report = queryOptimizationService.generateOptimizationReport();

      return createSuccessResponse(res, report, 'Reporte de optimización generado exitosamente');
    } catch (error) {
      logger.error('Error generating optimization report:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'OPTIMIZATION_REPORT_ERROR',
        error,
      );
    }
  }

  /**
   * Limpiar cache
   */
  async clearCache(req, res) {
    try {
      const { pattern } = req.body;

      if (pattern) {
        const deletedKeys = await redisService.invalidatePattern(pattern);
        return createSuccessResponse(
          res,
          {
            pattern,
            deletedKeys,
          },
          `Cache limpiado para patrón: ${pattern}`,
        );
      } else {
        await redisService.clear();
        return createSuccessResponse(res, {}, 'Cache limpiado completamente');
      }
    } catch (error) {
      logger.error('Error clearing cache:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'CLEAR_CACHE_ERROR',
        error,
      );
    }
  }

  /**
   * Obtener estadísticas de cache
   */
  async getCacheStats(req, res) {
    try {
      const stats = redisService.getStats();

      return createSuccessResponse(res, stats, 'Estadísticas de cache obtenidas exitosamente');
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'CACHE_STATS_ERROR',
        error,
      );
    }
  }

  /**
   * Resetear métricas
   */
  async resetMetrics(req, res) {
    try {
      performanceOptimization.resetMetrics();

      return createSuccessResponse(res, {}, 'Métricas reseteadas exitosamente');
    } catch (error) {
      logger.error('Error resetting metrics:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'RESET_METRICS_ERROR',
        error,
      );
    }
  }

  /**
   * Obtener configuración de rendimiento
   */
  async getPerformanceConfig(req, res) {
    try {
      const config = {
        cache: {
          enabled: process.env.REDIS_ENABLED !== 'false',
          ttl: parseInt(process.env.CACHE_TTL) || 300,
        },
        queryOptimization: {
          enabled: process.env.QUERY_OPTIMIZATION_ENABLED !== 'false',
        },
        apm: {
          enabled: process.env.APM_ENABLED !== 'false',
        },
        thresholds: {
          slowQuery: 1000,
          highMemory: 80,
          highCpu: 80,
          highErrorRate: 5,
        },
      };

      return createSuccessResponse(
        res,
        config,
        'Configuración de rendimiento obtenida exitosamente',
      );
    } catch (error) {
      logger.error('Error getting performance config:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'PERFORMANCE_CONFIG_ERROR',
        error,
      );
    }
  }

  /**
   * Obtener métricas en tiempo real
   */
  async getRealtimeMetrics(req, res) {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        requests: apmService.getMetrics().requests,
        memory: apmService.getMetrics().memory,
        cpu: apmService.getMetrics().cpu,
        database: {
          connectionPool: connectionPoolService.getPoolStats(),
          queries: queryOptimizationService.getQueryStats(),
        },
        cache: redisService.getStats(),
      };

      return createSuccessResponse(res, metrics, 'Métricas en tiempo real obtenidas exitosamente');
    } catch (error) {
      logger.error('Error getting realtime metrics:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'REALTIME_METRICS_ERROR',
        error,
      );
    }
  }

  /**
   * Obtener reporte de salud detallado
   */
  async getDetailedHealthReport(req, res) {
    try {
      const health = await performanceOptimization.getHealthStatus();
      const metrics = performanceOptimization.getPerformanceMetrics();
      const alerts = apmService.getAlerts(10, true);

      const detailedReport = {
        ...health,
        detailedMetrics: metrics,
        recentAlerts: alerts,
        recommendations: this.generateRecommendations(health, metrics),
        timestamp: new Date().toISOString(),
      };

      return createSuccessResponse(
        res,
        detailedReport,
        'Reporte de salud detallado generado exitosamente',
      );
    } catch (error) {
      logger.error('Error generating detailed health report:', error);
      return createErrorResponse(
        res,
        500,
        'Error interno del servidor',
        'DETAILED_HEALTH_REPORT_ERROR',
        error,
      );
    }
  }

  /**
   * Generar recomendaciones basadas en métricas
   */
  generateRecommendations(health, metrics) {
    const recommendations = [];

    // Recomendaciones de memoria
    if (metrics.apm?.memory?.percentage > 80) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'Alto uso de memoria detectado. Considere optimizar queries o aumentar recursos.',
        currentValue: metrics.apm.memory.percentage,
        threshold: 80,
      });
    }

    // Recomendaciones de cache
    if (metrics.cache?.hitRate < 50) {
      recommendations.push({
        type: 'cache',
        priority: 'medium',
        message: 'Baja tasa de aciertos en cache. Revise la estrategia de cache.',
        currentValue: metrics.cache.hitRate,
        threshold: 50,
      });
    }

    // Recomendaciones de queries
    if (metrics.queryOptimization?.slowQueries > 0) {
      recommendations.push({
        type: 'database',
        priority: 'high',
        message: 'Queries lentas detectadas. Revise los índices de la base de datos.',
        currentValue: metrics.queryOptimization.slowQueries,
        threshold: 0,
      });
    }

    // Recomendaciones de conexiones
    if (
      metrics.connectionPool?.activeConnections / metrics.connectionPool?.totalConnections >
      0.8
    ) {
      recommendations.push({
        type: 'connection_pool',
        priority: 'medium',
        message: 'Alta utilización del pool de conexiones. Considere aumentar el tamaño del pool.',
        currentValue:
          (metrics.connectionPool.activeConnections / metrics.connectionPool.totalConnections) *
          100,
        threshold: 80,
      });
    }

    return recommendations;
  }
}

module.exports = new PerformanceController();
