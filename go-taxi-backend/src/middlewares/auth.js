const jwt = require('jsonwebtoken');

/*
 * Middleware de autenticación y autorización.
 *
 * En lugar de devolver respuestas directamente, delegamos el manejo de errores
 * al middleware global. Esto permite un contrato de error unificado en toda la API.
 */

const auth = {};

// Verifica la presencia y validez del token JWT.
auth.verifyToken = (req, _res, next) => {
  const header = req.headers['authorization'];
  if (!header) {
    const err = new Error('Token requerido');
    err.status = 401;
    err.code = 'NO_TOKEN';
    return next(err);
  }
  // Quitar el prefijo Bearer si existe
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  
  // Verificar que el token no esté vacío
  if (!token || token.trim() === '') {
    const err = new Error('Token vacío');
    err.status = 401;
    err.code = 'EMPTY_TOKEN';
    return next(err);
  }
  
  // Verificar que JWT_SECRET esté configurado
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET no está configurado en las variables de entorno');
    const err = new Error('Error de configuración del servidor');
    err.status = 500;
    err.code = 'SERVER_CONFIG_ERROR';
    return next(err);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Añadimos la información del usuario al request para usarla más adelante
    req.user = decoded;
    return next();
  } catch (e) {
    // Proporcionar mensajes de error más específicos
    let errorMessage = 'Token inválido';
    let errorCode = 'INVALID_TOKEN';
    
    if (e.name === 'TokenExpiredError') {
      errorMessage = 'Token expirado';
      errorCode = 'TOKEN_EXPIRED';
    } else if (e.name === 'JsonWebTokenError') {
      errorMessage = 'Token mal formado';
      errorCode = 'MALFORMED_TOKEN';
    } else if (e.name === 'NotBeforeError') {
      errorMessage = 'Token no válido aún';
      errorCode = 'TOKEN_NOT_ACTIVE';
    }
    
    // Log del error para debugging (sin exponer el token completo)
    console.warn(`Error de autenticación: ${errorCode} - ${errorMessage}`, {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 10) + '...',
      errorName: e.name,
    });
    
    const err = new Error(errorMessage);
    err.status = 401;
    err.code = errorCode;
    return next(err);
  }
};

// Valida que el rol del usuario esté incluido en los permitidos.
auth.permitRoles = (...roles) => {
  return (req, _res, next) => {
    // Si no hay token verificado o el rol no está permitido
    if (!req.user || !roles.includes(req.user.role)) {
      const err = new Error('No tienes permisos para esta acción');
      err.status = 403;
      err.code = 'FORBIDDEN';
      err.details = { allowedRoles: roles, role: req.user?.role };
      return next(err);
    }
    return next();
  };
};

module.exports = auth;
