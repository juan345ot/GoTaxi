const jwt = require('jsonwebtoken');
const { logToFile } = require('../utils/logger');

// Blacklist simple en memoria(en producción usar Redis)
const tokenBlacklist = new Set();

/**
 * Middleware para manejar refresh tokens
 */
const refreshTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    // Verificar si el token está en la blacklist
    if (tokenBlacklist.has(token)) {
      const errObj = new Error('Token inválido');
      errObj.status = 401;
      errObj.code = 'INVALID_TOKEN';
      return next(errObj);
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const errObj = new Error('Token expirado');
      errObj.status = 401;
      errObj.code = 'TOKEN_EXPIRED';
      return next(errObj);
    }

    const errObj = new Error('Token inválido');
    errObj.status = 401;
    errObj.code = 'INVALID_TOKEN';
    return next(errObj);
  }
};

/**
 * Agregar token a la blacklist
 */
const blacklistToken = token => {
  tokenBlacklist.add(token);
  logToFile(`Token agregado a blacklist: ${token.substring(0, 10)}...`);
};

/**
 * Verificar si un token está en la blacklist
 */
const isTokenBlacklisted = token => {
  return tokenBlacklist.has(token);
};

/**
 * Limpiar tokens expirados de la blacklist(ejecutar periódicamente)
 */
const cleanExpiredTokens = () => {
  // En una implementación real, esto se haría con Redis TTL
  // Por ahora, solo logueamos la operación
  logToFile('Limpiando tokens expirados de blacklist');
};

module.exports = {
  refreshTokenMiddleware,
  blacklistToken,
  isTokenBlacklisted,
  cleanExpiredTokens,
};
