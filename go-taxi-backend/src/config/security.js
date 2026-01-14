/**
 * Configuraciones de seguridad centralizadas
 */
/* eslint-disable no-console */

const securityConfig = {
  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    algorithm: 'HS256',
  },

  // Configuración de bcrypt
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },

  // Configuración de rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde',
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Configuración de CORS
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // Configuración de validación
  validation: {
    maxStringLength: 255,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },

  // Configuración de headers de seguridad
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },

  // Configuración de sesiones
  session: {
    secret: process.env.SESSION_SECRET || 'session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  },

  // Configuración de logging de seguridad
  securityLogging: {
    enabled: true,
    logLevel: process.env.SECURITY_LOG_LEVEL || 'info',
    logFailedAttempts: true,
    logSuccessfulLogins: true,
    logSuspiciousActivity: true,
  },

  // Configuración de tokens
  tokenConfig: {
    // Tiempo de vida de tokens de acceso
    accessTokenLifetime: '24h',
    // Tiempo de vida de refresh tokens
    refreshTokenLifetime: '7d',
    // Tiempo de vida de tokens de verificación de email
    emailVerificationTokenLifetime: '1h',
    // Tiempo de vida de tokens de reset de password
    passwordResetTokenLifetime: '1h',
  },

  // Configuración de encriptación
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
  },

  // Configuración de base de datos
  database: {
    // Tiempo de conexión máximo
    connectionTimeout: 30000,
    // Tiempo de consulta máximo
    queryTimeout: 10000,
    // Número máximo de conexiones
    maxConnections: 10,
    // Habilitar SSL en producción
    ssl: process.env.NODE_ENV === 'production',
  },
};

/**
 * Validar configuración de seguridad
 */
const validateSecurityConfig = () => {
  const errors = [];

  // Validar JWT secret(solo en producción)
  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET ||
      process.env.JWT_SECRET === 'fallback-secret-key-change-in-production')
  ) {
    errors.push('JWT_SECRET debe estar configurado en variables de entorno');
  }

  // Validar que el JWT secret tenga suficiente longitud(solo en producción)
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.JWT_SECRET &&
    process.env.JWT_SECRET.length < 32
  ) {
    errors.push('JWT_SECRET debe tener al menos 32 caracteres');
  }

  // Validar CORS origins
  if (!process.env.CORS_ORIGIN) {
    console.warn('CORS_ORIGIN no está configurado, usando localhost por defecto');
  }

  // Validar configuración de base de datos(excepto en test donde se configura dinámicamente)
  if (process.env.NODE_ENV !== 'test' && !process.env.MONGODB_URI) {
    errors.push('MONGODB_URI debe estar configurado');
  }

  if (errors.length > 0) {
    throw new Error(`Configuración de seguridad inválida:\n${errors.join('\n')}`);
  }

  return true;
};

/**
 * Obtener configuración de seguridad para un entorno específico
 */
const getSecurityConfig = (environment = process.env.NODE_ENV || 'development') => {
  const config = { ...securityConfig };

  if (environment === 'production') {
    // Configuraciones más estrictas para producción
    config.rateLimit.max = 50; // Menos requests en producción
    config.jwt.expiresIn = '1h'; // Tokens más cortos
    config.securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
    config.session.cookie.secure = true;
  } else if (environment === 'development') {
    // Configuraciones más permisivas para desarrollo
    config.rateLimit.max = 1000;
    config.cors.origin = ['http://localhost:3000', 'http://localhost:3001'];
  } else if (environment === 'test') {
    // Configuraciones muy permisivas para tests
    config.rateLimit.max = 1000000; // Muy alto para tests
    config.rateLimit.windowMs = 1000; // Ventana muy corta
    config.rateLimit.skipSuccessfulRequests = true; // No contar requests exitosos
    config.rateLimit.skipFailedRequests = true; // No contar requests fallidos
    config.rateLimit.skip = _req => {
      // Saltar rate limiting completamente en tests
      return true;
    };
    config.cors.origin = ['http://localhost:3000', 'http://localhost:3001'];
    config.jwt.expiresIn = '1h';
    config.jwt.refreshExpiresIn = '7d';
  }

  return config;
};

module.exports = {
  securityConfig,
  validateSecurityConfig,
  getSecurityConfig,
};
