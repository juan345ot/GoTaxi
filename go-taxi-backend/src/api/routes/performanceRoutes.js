const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { validate } = require('../../middlewares/validation');
const Joi = require('joi');

/**
 * Rutas de métricas de rendimiento
 * Requiere autenticación de administrador para la mayoría de endpoints
 */

// Middleware de autenticación para administradores
const adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador.',
    });
  }
  next();
};

// Esquemas de validación
const alertParamsSchema = Joi.object({
  alertId: Joi.string().required(),
});

const queryParamsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  unresolved: Joi.boolean().default(false),
});

const cacheBodySchema = Joi.object({
  pattern: Joi.string().optional(),
});

// Rutas públicas(solo health check)
router.get('/health', performanceController.getHealthStatus);

// Rutas protegidas para administradores
router.use(adminAuth);

// Métricas generales
router.get('/metrics', performanceController.getPerformanceMetrics);
router.get('/metrics/realtime', performanceController.getRealtimeMetrics);
router.get('/config', performanceController.getPerformanceConfig);

// Métricas específicas
router.get('/redis', performanceController.getRedisMetrics);
router.get('/database', performanceController.getDatabaseMetrics);
router.get('/apm', performanceController.getAPMMetrics);

// Alertas
router.get('/alerts', validate(queryParamsSchema, 'query'), performanceController.getAlerts);
router.patch(
  '/alerts/:alertId',
  validate(alertParamsSchema, 'params'),
  performanceController.resolveAlert,
);

// Queries y optimización
router.get(
  '/queries/slow',
  validate(queryParamsSchema, 'query'),
  performanceController.getSlowQueries,
);
router.get('/queries/optimization-report', performanceController.getOptimizationReport);

// Cache
router.get('/cache/stats', performanceController.getCacheStats);
router.delete('/cache', validate(cacheBodySchema, 'body'), performanceController.clearCache);

// Utilidades
router.post('/reset', performanceController.resetMetrics);
router.get('/health/detailed', performanceController.getDetailedHealthReport);

module.exports = router;
