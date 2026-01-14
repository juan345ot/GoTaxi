/**
 * Rutas de seguridad
 * Endpoints para gestión de seguridad, JWT rotation y estadísticas
 */

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const securityController = require('../controllers/securityController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');
const { privateApiRateLimit } = require('../../middlewares/security');

/**
 * @route   GET /api/security/jwt-stats
 * @desc    Obtener estadísticas de JWT rotation
 * @access Private(Admin only)
 */
router.get(
  '/jwt-stats',
  privateApiRateLimit,
  verifyToken,
  permitRoles(ROLES.ADMIN),
  securityController.getJWTStats,
);

/**
 * @route   POST /api/security/rotate-jwt
 * @desc    Forzar rotación de JWT secret
 * @access Private(Admin only)
 */
router.post(
  '/rotate-jwt',
  privateApiRateLimit,
  verifyToken,
  permitRoles(ROLES.ADMIN),
  securityController.rotateJWT,
);

/**
 * @route   POST /api/security/invalidate-token
 * @desc    Invalidar un token específico
 * @access Private(Admin only)
 */
router.post(
  '/invalidate-token',
  privateApiRateLimit,
  verifyToken,
  permitRoles(ROLES.ADMIN),
  securityController.invalidateToken,
);

/**
 * @route   GET /api/security/config
 * @desc    Obtener configuración de seguridad
 * @access Private(Admin only)
 */
router.get(
  '/config',
  privateApiRateLimit,
  verifyToken,
  permitRoles(ROLES.ADMIN),
  securityController.getSecurityConfig,
);

/**
 * @route   GET /api/security/logs
 * @desc    Obtener logs de seguridad
 * @access Private(Admin only)
 */
router.get(
  '/logs',
  privateApiRateLimit,
  verifyToken,
  permitRoles(ROLES.ADMIN),
  securityController.getSecurityLogs,
);

/**
 * @route   POST /api/security/validate
 * @desc    Validar configuración de seguridad
 * @access Private(Admin only)
 */
router.post(
  '/validate',
  privateApiRateLimit,
  verifyToken,
  permitRoles(ROLES.ADMIN),
  securityController.validateSecurityConfig,
);

module.exports = router;
