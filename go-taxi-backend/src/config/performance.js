/**
 * Configuración de performance y optimizaciones
 */

const performanceConfig = {
  // Configuración de caché
  cache: {
    // TTL por defecto en milisegundos
    defaultTTL: 5 * 60 * 1000, // 5 minutos

    // TTL específico por tipo de endpoint
    ttl: {
      users: 5 * 60 * 1000, // 5 minutos
      drivers: 5 * 60 * 1000, // 5 minutos
      trips: 1 * 60 * 1000, // 1 minuto(datos más dinámicos)
      configs: 10 * 60 * 1000, // 10 minutos
      metrics: 30 * 1000, // 30 segundos
      performance: 2 * 60 * 1000, // 2 minutos
    },

    // Configuración de Redis
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB) || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keyPrefix: 'gotaxi:',
    },

    // Estrategias de invalidación
    invalidation: {
      // Invalidar por patrones
      patternBased: true,

      // TTL automático
      autoTTL: true,

      // Invalidación en cascada
      cascade: true,
    },
  },

  // Configuración de compresión
  compression: {
    level: process.env.NODE_ENV === 'production' ? 6 : 1,
    threshold: 1024,
    excludeRoutes: ['/api/metrics', '/health'],
  },

  // Configuración de base de datos
  database: {
    // Tamaño del pool de conexiones
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 10,

    // Timeouts
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
    queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000,

    // Configuración de índices
    indexes: {
      // Crear índices automáticamente
      autoCreate: true,

      // Verificar índices al inicio
      verifyOnStartup: true,

      // Limpiar índices no utilizados
      cleanupUnused: false,
    },
  },

  // Configuración de métricas
  metrics: {
    // Intervalo de limpieza de métricas(en milisegundos)
    cleanupInterval: 10 * 60 * 1000, // 10 minutos

    // Máximo número de mediciones a mantener en memoria
    maxMeasurements: 1000,

    // Umbral para considerar una query lenta(en milisegundos)
    slowQueryThreshold: 1000,

    // Umbral para considerar una request lenta(en milisegundos)
    slowRequestThreshold: 5000,

    // Umbral para detectar memory leaks(en MB)
    memoryLeakThreshold: 10,
  },

  // Configuración de rate limiting
  rateLimit: {
    // Límites por tipo de endpoint
    limits: {
      auth: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 5, // 5 intentos por IP
      },
      api: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // 100 requests por IP
      },
      metrics: {
        windowMs: 1 * 60 * 1000, // 1 minuto
        max: 10, // 10 requests por IP
      },
    },
  },

  // Configuración de paginación
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
    defaultPage: 1,
  },

  // Configuración de logging
  logging: {
    // Nivel de log por entorno
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',

    // Incluir métricas en logs
    includeMetrics: process.env.NODE_ENV === 'production',

    // Rotación de logs
    rotation: {
      enabled: process.env.NODE_ENV === 'production',
      maxSize: '10m',
      maxFiles: 5,
    },
  },

  // Configuración de monitoreo
  monitoring: {
    // Habilitar monitoreo de performance
    enabled: true,

    // Intervalo de reporte de métricas(en milisegundos)
    reportInterval: 60 * 1000, // 1 minuto

    // Alertas
    alerts: {
      // Umbral de tasa de error para alertas
      errorRateThreshold: 5, // 5%

      // Umbral de uso de memoria para alertas
      memoryUsageThreshold: 90, // 90%

      // Umbral de tiempo de respuesta para alertas
      responseTimeThreshold: 5000, // 5 segundos
    },
  },

  // Configuración de optimización de queries
  queryOptimization: {
    // Habilitar optimización automática
    enabled: true,

    // Análisis de queries lentas
    slowQueryAnalysis: {
      enabled: true,
      threshold: 1000, // 1 segundo
      maxQueries: 100,
    },

    // Índices automáticos
    autoIndexing: {
      enabled: true,
      analyzeFrequency: 24 * 60 * 60 * 1000, // 24 horas
    },

    // Cache de queries
    queryCache: {
      enabled: true,
      ttl: 5 * 60 * 1000, // 5 minutos
      maxSize: 1000,
    },
  },

  // Configuración de pool de conexiones
  connectionPool: {
    // Tamaño del pool
    min: 2,
    max: parseInt(process.env.DB_MAX_CONNECTIONS) || 10,

    // Timeouts
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,

    // Configuración de validación
    validate: true,
    validationQuery: 'SELECT 1',
  },

  // Configuración de APM(Application Performance Monitoring)
  apm: {
    // Habilitar APM
    enabled: process.env.NODE_ENV === 'production',

    // Configuración de métricas
    metrics: {
      // Intervalo de recolección
      interval: 60 * 1000, // 1 minuto

      // Métricas a recolectar
      collect: {
        cpu: true,
        memory: true,
        eventLoop: true,
        gc: true,
        requests: true,
        database: true,
        cache: true,
      },
    },

    // Configuración de alertas
    alerts: {
      // Habilitar alertas automáticas
      enabled: true,

      // Canales de notificación
      channels: ['console', 'email'],

      // Umbrales de alerta
      thresholds: {
        cpu: 80, // 80%
        memory: 85, // 85%
        responseTime: 2000, // 2 segundos
        errorRate: 5, // 5%
      },
    },
  },
};

/**
 * Obtener configuración de performance
 */
const getPerformanceConfig = () => {
  return performanceConfig;
};

/**
 * Obtener configuración de caché para un endpoint específico
 */
const getCacheConfig = endpoint => {
  const ttl = performanceConfig.cache.ttl[endpoint] || performanceConfig.cache.defaultTTL;
  return {
    ttl,
    keyPrefix: `api:${endpoint}`,
    enabled: true,
  };
};

/**
 * Obtener configuración de rate limiting para un endpoint específico
 */
const getRateLimitConfig = endpoint => {
  return performanceConfig.rateLimit.limits[endpoint] || performanceConfig.rateLimit.limits.api;
};

/**
 * Validar configuración de performance
 */
const validatePerformanceConfig = () => {
  const errors = [];

  // Validar configuración de caché
  if (performanceConfig.cache.defaultTTL < 1000) {
    errors.push('TTL de caché por defecto debe ser al menos 1 segundo');
  }

  // Validar configuración de base de datos
  if (performanceConfig.database.maxConnections < 1) {
    errors.push('Máximo de conexiones debe ser al menos 1');
  }

  // Validar configuración de métricas
  if (performanceConfig.metrics.maxMeasurements < 100) {
    errors.push('Máximo de mediciones debe ser al menos 100');
  }

  // Validar configuración de Redis
  if (!performanceConfig.cache.redis.host) {
    errors.push('Host de Redis es requerido');
  }

  if (performanceConfig.cache.redis.port < 1 || performanceConfig.cache.redis.port > 65535) {
    errors.push('Puerto de Redis debe estar entre 1 y 65535');
  }

  // Validar configuración de pool de conexiones
  if (performanceConfig.connectionPool.min < 1) {
    errors.push('Mínimo de conexiones en pool debe ser al menos 1');
  }

  if (performanceConfig.connectionPool.max < performanceConfig.connectionPool.min) {
    errors.push('Máximo de conexiones debe ser mayor o igual al mínimo');
  }

  // Validar configuración de optimización de queries
  if (performanceConfig.queryOptimization.slowQueryAnalysis.threshold < 100) {
    errors.push('Umbral de query lenta debe ser al menos 100ms');
  }

  if (errors.length > 0) {
    throw new Error(`Errores en configuración de performance: ${errors.join(', ')}`);
  }

  return true;
};

module.exports = {
  performanceConfig,
  getPerformanceConfig,
  getCacheConfig,
  getRateLimitConfig,
  validatePerformanceConfig,
};
