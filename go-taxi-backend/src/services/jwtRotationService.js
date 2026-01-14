/**
 * Servicio de rotación de JWT tokens
 * Implementa rotación automática de tokens para mayor seguridad
 */

const jwt = require('jsonwebtoken');
const { getSecurityConfig } = require('../config/security');
const { logToFile } = require('../utils/logger');

class JWTRotationService {
  constructor() {
    this.securityConfig = getSecurityConfig();
    this.tokenRotationInterval = 24 * 60 * 60 * 1000; // 24 horas
    this.lastRotation = Date.now();
    this.currentSecret = this.securityConfig.jwt.secret;
    this.previousSecret = null;
    this.rotationHistory = [];
  }

  /**
   * Generar un nuevo par de tokens(access + refresh)
   */
  generateTokenPair(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = jwt.sign(payload, this.currentSecret, {
      expiresIn: this.securityConfig.jwt.expiresIn,
      algorithm: this.securityConfig.jwt.algorithm,
    });

    const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, this.currentSecret, {
      expiresIn: this.securityConfig.jwt.refreshExpiresIn,
      algorithm: this.securityConfig.jwt.algorithm,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.securityConfig.jwt.expiresIn,
      refreshExpiresIn: this.securityConfig.jwt.refreshExpiresIn,
    };
  }

  /**
   * Verificar y decodificar un token
   */
  verifyToken(token, secret = this.currentSecret) {
    try {
      return jwt.verify(token, secret, {
        algorithms: [this.securityConfig.jwt.algorithm],
      });
    } catch (error) {
      // Si falla con el secret actual, intentar con el anterior
      if (this.previousSecret) {
        try {
          return jwt.verify(token, this.previousSecret, {
            algorithms: [this.securityConfig.jwt.algorithm],
          });
        } catch (prevError) {
          throw error; // Lanzar el error original
        }
      }
      throw error;
    }
  }

  /**
   * Refrescar un token usando el refresh token
   */
  refreshToken(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken);

      if (decoded.type !== 'refresh') {
        throw new Error('Token inválido: no es un refresh token');
      }

      // Generar nuevos tokens
      const user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      return this.generateTokenPair(user);
    } catch (error) {
      throw new Error(`Error al refrescar token: ${error.message}`);
    }
  }

  /**
   * Rotar el secret de JWT
   */
  rotateSecret() {
    try {
      // Guardar el secret anterior
      this.previousSecret = this.currentSecret;

      // Generar nuevo secret
      this.currentSecret = this.generateNewSecret();
      this.lastRotation = Date.now();

      // Registrar en el historial
      this.rotationHistory.push({
        timestamp: this.lastRotation,
        secret: this.currentSecret,
        previousSecret: this.previousSecret,
      });

      // Limpiar historial antiguo(mantener solo los últimos 5)
      if (this.rotationHistory.length > 5) {
        this.rotationHistory = this.rotationHistory.slice(-5);
      }

      logToFile(`JWT secret rotated at ${new Date(this.lastRotation).toISOString()}`);

      return true;
    } catch (error) {
      logToFile(`Error rotating JWT secret: ${error.message}`);
      return false;
    }
  }

  /**
   * Generar un nuevo secret seguro
   */
  generateNewSecret() {
    const crypto = require('crypto');
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Verificar si es necesario rotar el secret
   */
  shouldRotateSecret() {
    const now = Date.now();
    return now - this.lastRotation >= this.tokenRotationInterval;
  }

  /**
   * Iniciar rotación automática
   */
  startAutoRotation() {
    setInterval(
      () => {
        if (this.shouldRotateSecret()) {
          this.rotateSecret();
        }
      },
      60 * 60 * 1000,
    ); // Verificar cada hora
  }

  /**
   * Invalidar un token específico
   */
  invalidateToken(token) {
    try {
      const decoded = this.verifyToken(token);
      const tokenId = `${decoded.userId}-${decoded.iat}`;

      // En una implementación real, aquí se guardaría en una blacklist
      // Por ahora, solo logueamos
      logToFile(`Token invalidated: ${tokenId}`);

      return true;
    } catch (error) {
      logToFile(`Error invalidating token: ${error.message}`);
      return false;
    }
  }

  /**
   * Obtener estadísticas de rotación
   */
  getRotationStats() {
    return {
      currentSecret: this.currentSecret ? '***' : null,
      hasPreviousSecret: !!this.previousSecret,
      lastRotation: this.lastRotation,
      rotationHistory: this.rotationHistory.map(entry => ({
        timestamp: entry.timestamp,
        hasSecret: !!entry.secret,
        hasPreviousSecret: !!entry.previousSecret,
      })),
      nextRotationIn: this.tokenRotationInterval - (Date.now() - this.lastRotation),
    };
  }

  /**
   * Validar configuración de rotación
   */
  validateRotationConfig() {
    const errors = [];

    if (!this.currentSecret) {
      errors.push('No hay secret actual configurado');
    }

    if (this.tokenRotationInterval < 60 * 60 * 1000) {
      errors.push('El intervalo de rotación es muy corto(mínimo 1 hora)');
    }

    if (errors.length > 0) {
      throw new Error(`Configuración de rotación inválida: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Obtener información del token sin verificar
   */
  decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      return null;
    }
  }

  /**
   * Verificar si un token está próximo a expirar
   */
  isTokenNearExpiry(token, thresholdMinutes = 30) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload.exp) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiry = decoded.payload.exp;
      const threshold = thresholdMinutes * 60;

      return expiry - now <= threshold;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener tiempo restante de un token
   */
  getTokenTimeRemaining(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload.exp) {
        return 0;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiry = decoded.payload.exp;

      return Math.max(0, expiry - now);
    } catch (error) {
      return 0;
    }
  }
}

// Crear instancia singleton
const jwtRotationService = new JWTRotationService();

// Iniciar rotación automática
jwtRotationService.startAutoRotation();

module.exports = jwtRotationService;
