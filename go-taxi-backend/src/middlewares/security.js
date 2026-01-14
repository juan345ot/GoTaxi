/**
 * Middleware de seguridad avanzado
 * Incluye Helmet configurado, rate limiting mejorado y JWT rotation
 */

const rateLimit = require('express-rate-limit');
const { getSecurityConfig } = require('../config/security');
const { logToFile } = require('../utils/logger');

/**
 * Configuración avanzada de Helmet
 */
const helmetConfig = {
  // Configuración de Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // Configuración de HSTS(HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },

  // Configuración de X-Frame-Options
  frameguard: {
    action: 'deny',
  },

  // Configuración de X-Content-Type-Options
  noSniff: true,

  // Configuración de X-XSS-Protection
  xssFilter: true,

  // Configuración de Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // Configuración de Permissions Policy
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: [],
    usb: [],
    magnetometer: [],
    gyroscope: [],
    accelerometer: [],
  },

  // Configuración de Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false,

  // Configuración de Cross-Origin Opener Policy
  crossOriginOpenerPolicy: {
    policy: 'same-origin',
  },

  // Configuración de Cross-Origin Resource Policy
  crossOriginResourcePolicy: {
    policy: 'cross-origin',
  },
};

/**
 * Rate limiting mejorado con diferentes límites por endpoint
 */
const createRateLimit = (options = {}) => {
  const securityConfig = getSecurityConfig();

  return rateLimit({
    windowMs: options.windowMs || securityConfig.rateLimit.windowMs,
    max: options.max || securityConfig.rateLimit.max,
    message: {
      error: 'Demasiadas solicitudes',
      message: options.message || securityConfig.rateLimit.message,
      retryAfter: Math.ceil((options.windowMs || securityConfig.rateLimit.windowMs) / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      // Log de intentos de rate limiting
      logToFile(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);

      res.status(429).json({
        error: 'Rate limit exceeded',
        message: options.message || securityConfig.rateLimit.message,
        retryAfter: Math.ceil((options.windowMs || securityConfig.rateLimit.windowMs) / 1000),
      });
    },
    skip: req => {
      // Saltar rate limiting para health checks
      return req.path === '/health' || req.path === '/api/health';
    },
    keyGenerator: req => {
      // Usar IP + User-Agent para mejor identificación
      return `${req.ip}-${req.get('User-Agent')}`;
    },
  });
};

/**
 * Rate limiting específico para autenticación
 */
const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'test' ? 1000 : 5, // más permisivo en test
  message: 'Demasiados intentos de login, intenta de nuevo en 15 minutos',
});

/**
 * Rate limiting específico para registro
 */
const registerRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: process.env.NODE_ENV === 'test' ? 1000 : 3, // más permisivo en test
  message: 'Demasiados intentos de registro, intenta de nuevo en 1 hora',
});

/**
 * Rate limiting específico para reset de password
 */
const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: process.env.NODE_ENV === 'test' ? 1000 : 3, // más permisivo en test
  message: 'Demasiados intentos de reset de contraseña, intenta de nuevo en 1 hora',
});

/**
 * Rate limiting específico para APIs públicas
 */
const publicApiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'test' ? 10000 : 100, // más permisivo en test
  message: 'Demasiadas solicitudes a la API pública',
});

/**
 * Rate limiting específico para APIs privadas
 */
const privateApiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'test' ? 10000 : 200, // más permisivo en test
  message: 'Demasiadas solicitudes a la API privada',
});

/**
 * Middleware de seguridad principal
 */
const securityMiddleware = (req, res, next) => {
  // Agregar headers de seguridad adicionales
  res.setHeader('X-Request-ID', req.id || 'unknown');
  res.setHeader('X-Response-Time', Date.now() - req.startTime || 0);

  // Log de solicitudes sospechosas
  if (req.get('User-Agent')?.includes('bot') || req.get('User-Agent')?.includes('crawler')) {
    logToFile(`Suspicious request from IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  }

  next();
};

/**
 * Middleware para detectar ataques comunes
 */
const attackDetectionMiddleware = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS
    /union\s+select/i, // SQL injection
    /drop\s+table/i, // SQL injection
    /javascript:/i, // XSS
    /on\w+\s*=/i, // XSS
  ];

  const url = req.url.toLowerCase();
  const body = JSON.stringify(req.body || {}).toLowerCase();
  const query = JSON.stringify(req.query || {}).toLowerCase();

  const suspiciousContent = url + body + query;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(suspiciousContent)) {
      logToFile(
        `Suspicious activity detected from IP: ${req.ip}, Pattern: ${pattern}, URL: ${req.url}`,
      );
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Solicitud inválida detectada',
      });
    }
  }

  next();
};

/**
 * Middleware para validar tamaño de payload
 */
const payloadSizeMiddleware = (req, res, next) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Payload Too Large',
      message: 'El tamaño de la solicitud excede el límite permitido',
    });
  }

  next();
};

/**
 * Middleware para validar Content-Type
 */
const contentTypeMiddleware = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    // Skip content type validation for logout endpoint
    if (req.path === '/api/auth/logout') {
      return next();
    }

    const contentType = req.get('Content-Type');

    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content-Type debe ser application/json',
      });
    }
  }

  next();
};

module.exports = {
  helmetConfig,
  createRateLimit,
  authRateLimit,
  registerRateLimit,
  passwordResetRateLimit,
  publicApiRateLimit,
  privateApiRateLimit,
  securityMiddleware,
  attackDetectionMiddleware,
  payloadSizeMiddleware,
  contentTypeMiddleware,
};
