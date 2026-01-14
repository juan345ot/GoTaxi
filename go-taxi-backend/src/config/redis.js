/**
 * Configuración de Redis para cache distribuido
 */
/* eslint-disable no-console */

const config = {
  development: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
    retryDelayOnClusterDown: 300,
    enableOfflineQueue: false,
    maxLoadingTimeout: 5000,
    enableReadyCheck: true,
    maxMemoryPolicy: 'allkeys-lru',
    keyPrefix: 'gotaxi:',
  },
  production: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
    retryDelayOnClusterDown: 300,
    enableOfflineQueue: false,
    maxLoadingTimeout: 5000,
    enableReadyCheck: true,
    maxMemoryPolicy: 'allkeys-lru',
    keyPrefix: 'gotaxi:',
    // Configuración de cluster para producción
    enableCluster: process.env.REDIS_CLUSTER === 'true',
    /* eslint-disable indent */
    clusterNodes: process.env.REDIS_CLUSTER_NODES
      ? process.env.REDIS_CLUSTER_NODES.split(',').map(node => {
          const [host, port] = node.split(':');
          return { host, port: parseInt(port) };
        })
      : undefined,
    /* eslint-enable indent */
  },
  test: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 1, // DB diferente para tests
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 5000,
    commandTimeout: 2000,
    retryDelayOnClusterDown: 100,
    enableOfflineQueue: false,
    maxLoadingTimeout: 2000,
    enableReadyCheck: true,
    maxMemoryPolicy: 'allkeys-lru',
    keyPrefix: 'gotaxi:test:',
  },
};

const environment = process.env.NODE_ENV || 'development';
const redisConfig = config[environment];

// Validar configuración requerida para producción
if (environment === 'production') {
  if (!process.env.REDIS_HOST) {
    throw new Error('REDIS_HOST es requerido en producción');
  }
  if (!process.env.REDIS_PASSWORD) {
    console.warn('⚠️  REDIS_PASSWORD no configurado en producción');
  }
}

module.exports = {
  redisConfig,
  getRedisConfig: () => redisConfig,
  validateRedisConfig: () => {
    const required = ['host', 'port'];
    const missing = required.filter(key => !redisConfig[key]);

    if (missing.length > 0) {
      throw new Error(`Configuración de Redis incompleta. Faltan: ${missing.join(', ')}`);
    }

    return true;
  },
};
