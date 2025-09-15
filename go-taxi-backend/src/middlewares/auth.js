const jwt = require('jsonwebtoken');
const ROLES = require('../config/roles');

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
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Añadimos la información del usuario al request para usarla más adelante
    req.user = decoded;
    return next();
  } catch (e) {
    const err = new Error('Token inválido');
    err.status = 401;
    err.code = 'INVALID_TOKEN';
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
