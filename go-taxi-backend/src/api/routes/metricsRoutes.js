/**
 * Rutas de métricas y monitoreo
 */

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const metricsController = require('../controllers/metricsController');
const { verifyToken } = require('../../middlewares/auth');
const { permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

// Middleware para verificar que solo admins puedan acceder a métricas detalladas
const adminOnly = [verifyToken, permitRoles(ROLES.ADMIN)];

// Health check público
router.get('/health', metricsController.getHealth);

// Métricas básicas(accesibles para todos los usuarios autenticados)
router.get('/basic', verifyToken, metricsController.getRealtimeStats);

// Métricas detalladas(solo para admins)
router.get('/', adminOnly, metricsController.getMetrics);
router.get('/requests', adminOnly, metricsController.getRequestMetrics);
router.get('/database', adminOnly, metricsController.getDatabaseMetrics);
router.get('/cache', adminOnly, metricsController.getCacheMetrics);
router.get('/memory', adminOnly, metricsController.getMemoryMetrics);
router.get('/errors', adminOnly, metricsController.getErrorMetrics);

// Resetear métricas(solo para admins)
router.post('/reset', adminOnly, metricsController.resetMetrics);

module.exports = router;
