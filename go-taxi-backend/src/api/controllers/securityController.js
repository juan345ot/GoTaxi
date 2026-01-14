/**
 * Controlador de seguridad
 * Maneja endpoints relacionados con estadísticas de seguridad y JWT rotation
 */
/* eslint-disable no-console, max-len, operator-linebreak */

const jwtRotationService = require('../../services/jwtRotationService');
const { createSuccessResponse, createErrorResponse } = require('../../utils/responseHelpers');
const { logToFile } = require('../../utils/logger');

/**
 * Obtener estadísticas de JWT rotation
 * @route GET /api/security/jwt-stats
 * @access Private(Admin only)
 */
const getJWTStats = async (req, res) => {
  try {
    const stats = jwtRotationService.getRotationStats();

    createSuccessResponse(res, {
      jwtRotation: stats,
      message: 'Estadísticas de JWT obtenidas correctamente',
    });
  } catch (error) {
    logToFile(`Error obteniendo estadísticas de JWT: ${error.message}`);
    createErrorResponse(res, 500, 'Error interno del servidor', 'JWT_STATS_ERROR', error);
  }
};

/**
 * Forzar rotación de JWT secret
 * @route POST /api/security/rotate-jwt
 * @access Private(Admin only)
 */
const rotateJWT = async (req, res) => {
  try {
    const success = jwtRotationService.rotateSecret();

    if (success) {
      logToFile(`JWT secret rotated manually by admin: ${req.user.id}`);
      createSuccessResponse(res, {
        message: 'JWT secret rotado correctamente',
        timestamp: new Date().toISOString(),
      });
    } else {
      createErrorResponse(res, 500, 'Error al rotar JWT secret', 'JWT_ROTATION_ERROR');
    }
  } catch (error) {
    logToFile(`Error rotando JWT secret: ${error.message}`);
    createErrorResponse(res, 500, 'Error interno del servidor', 'JWT_ROTATION_ERROR', error);
  }
};

/**
 * Invalidar un token específico
 * @route POST /api/security/invalidate-token
 * @access Private(Admin only)
 */
const invalidateToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return createErrorResponse(res, 400, 'Token requerido', 'MISSING_TOKEN');
    }

    const success = jwtRotationService.invalidateToken(token);

    if (success) {
      logToFile(`Token invalidated by admin: ${req.user.id}`);
      createSuccessResponse(res, {
        message: 'Token invalidado correctamente',
      });
    } else {
      createErrorResponse(res, 400, 'Error al invalidar token', 'TOKEN_INVALIDATION_ERROR');
    }
  } catch (error) {
    logToFile(`Error invalidando token: ${error.message}`);
    createErrorResponse(res, 500, 'Error interno del servidor', 'TOKEN_INVALIDATION_ERROR', error);
  }
};

/**
 * Verificar configuración de seguridad
 * @route GET /api/security/config
 * @access Private(Admin only)
 */
const getSecurityConfig = async (req, res) => {
  try {
    const { getSecurityConfig } = require('../../config/security');
    const config = getSecurityConfig();

    // Ocultar información sensible
    const safeConfig = {
      jwt: {
        expiresIn: config.jwt.expiresIn,
        refreshExpiresIn: config.jwt.refreshExpiresIn,
        algorithm: config.jwt.algorithm,
      },
      rateLimit: {
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
      },
      validation: config.validation,
      securityHeaders: config.securityHeaders,
      securityLogging: config.securityLogging,
    };

    createSuccessResponse(res, {
      config: safeConfig,
      message: 'Configuración de seguridad obtenida correctamente',
    });
  } catch (error) {
    logToFile(`Error obteniendo configuración de seguridad: ${error.message}`);
    createErrorResponse(res, 500, 'Error interno del servidor', 'SECURITY_CONFIG_ERROR', error);
  }
};

/**
 * Obtener logs de seguridad
 * @route GET /api/security/logs
 * @access Private(Admin only)
 */
const getSecurityLogs = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    // En una implementación real, aquí se leerían los logs del sistema
    // Por ahora, devolvemos un mensaje indicando que la funcionalidad está disponible
    createSuccessResponse(res, {
      logs: [],
      message: 'Funcionalidad de logs de seguridad disponible',
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: 0,
      },
    });
  } catch (error) {
    logToFile(`Error obteniendo logs de seguridad: ${error.message}`);
    createErrorResponse(res, 500, 'Error interno del servidor', 'SECURITY_LOGS_ERROR', error);
  }
};

/**
 * Validar configuración de seguridad
 * @route POST /api/security/validate
 * @access Private(Admin only)
 */
const validateSecurityConfig = async (req, res) => {
  try {
    const { validateSecurityConfig } = require('../../config/security');
    const jwtValidation = jwtRotationService.validateRotationConfig();

    validateSecurityConfig();

    createSuccessResponse(res, {
      valid: true,
      message: 'Configuración de seguridad válida',
      validations: {
        securityConfig: true,
        jwtRotation: jwtValidation,
      },
    });
  } catch (error) {
    logToFile(`Error validando configuración de seguridad: ${error.message}`);
    createErrorResponse(
      res,
      400,
      'Configuración de seguridad inválida',
      'SECURITY_VALIDATION_ERROR',
      {
        message: error.message,
      },
    );
  }
};

module.exports = {
  getJWTStats,
  rotateJWT,
  invalidateToken,
  getSecurityConfig,
  getSecurityLogs,
  validateSecurityConfig,
};
