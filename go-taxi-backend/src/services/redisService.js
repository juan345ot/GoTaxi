/* eslint-disable no-console */
const Redis = require('ioredis');
const { logger } = require('../utils/logger');
const { performance } = require('perf_hooks');

/**
 * Servicio de Redis distribuido para cache y optimización de rendimiento
 * Incluye clustering, sharding, y estrategias avanzadas de cache
 */
class RedisService {
  constructor() {
    this.clients = new Map();
    this.cluster = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 1000;
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      operations: 0,
      totalTime: 0,
      averageTime: 0,
    };
    this.config = this.getRedisConfig();
    this.initializeRedis();
  }

  /**
   * Obtener configuración de Redis
   */
  getRedisConfig() {
    const environment = process.env.NODE_ENV || 'development';

    const baseConfig = {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      family: 4,
      keyPrefix: 'gotaxi:',
    };

    switch (environment) {
      case 'production':
        return {
          ...baseConfig,
          cluster: {
            enableReadyCheck: false,
            scaleReads: 'slave',
            redisOptions: baseConfig,
          },
          nodes: [
            { host: process.env.REDIS_CLUSTER_NODE_1 || 'redis-cluster-1', port: 6379 },
            { host: process.env.REDIS_CLUSTER_NODE_2 || 'redis-cluster-2', port: 6379 },
            { host: process.env.REDIS_CLUSTER_NODE_3 || 'redis-cluster-3', port: 6379 },
          ],
        };

      case 'staging':
        return {
          ...baseConfig,
          host: process.env.REDIS_HOST || 'redis-staging',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
          db: 1,
        };

      default:
        return {
          ...baseConfig,
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
          db: 0,
        };
    }
  }

  /**
   * Inicializar conexión Redis
   */
  async initializeRedis() {
    try {
      // No inicializar en entorno de test para evitar conflictos
      if (process.env.NODE_ENV === 'test') {
        this.isConnected = true;
        return;
      }

      if (this.config.cluster) {
        await this.initializeCluster();
      } else {
        await this.initializeSingleInstance();
      }

      this.setupEventHandlers();
      this.isConnected = true;
      this.retryAttempts = 0;

      console.log('Redis service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Redis service:', error);
      await this.handleConnectionError(error);
    }
  }

  /**
   * Inicializar cluster Redis
   */
  async initializeCluster() {
    this.cluster = new Redis.Cluster(this.config.nodes, this.config.cluster);

    // Crear clientes individuales para operaciones específicas
    for (const node of this.config.nodes) {
      const client = new Redis({
        ...this.config.redisOptions,
        host: node.host,
        port: node.port,
      });
      this.clients.set(`${node.host}:${node.port}`, client);
    }
  }

  /**
   * Inicializar instancia única Redis
   */
  async initializeSingleInstance() {
    const client = new Redis(this.config);
    this.clients.set('default', client);
  }

  /**
   * Configurar event handlers
   */
  setupEventHandlers() {
    const client = this.getClient();

    client.on('connect', () => {
      logger.info('Redis connected');
      this.isConnected = true;
    });

    client.on('ready', () => {
      logger.info('Redis ready');
    });

    client.on('error', error => {
      logger.error('Redis error:', error);
      this.metrics.errors++;
      this.handleConnectionError(error);
    });

    client.on('close', () => {
      logger.warn('Redis connection closed');
      this.isConnected = false;
    });

    client.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
  }

  /**
   * Obtener cliente Redis
   */
  getClient() {
    if (this.cluster) {
      return this.cluster;
    }
    return this.clients.get('default');
  }

  /**
   * Manejar errores de conexión
   */
  async handleConnectionError(_error) {
    this.isConnected = false;
    this.retryAttempts++;

    if (this.retryAttempts <= this.maxRetries) {
      logger.warn(
        `Redis connection error, retrying in ${this.retryDelay}ms(attempt ${this.retryAttempts}/${this.maxRetries})`,
      );

      setTimeout(() => {
        this.initializeRedis();
      }, this.retryDelay * this.retryAttempts);
    } else {
      logger.error('Max Redis retry attempts reached, giving up');
    }
  }

  /**
   * Ejecutar operación con métricas
   */
  async executeOperation(operation, ...args) {
    const startTime = performance.now();
    this.metrics.operations++;

    try {
      const client = this.getClient();
      const result = await client[operation](...args);

      const endTime = performance.now();
      const duration = endTime - startTime;

      this.metrics.totalTime += duration;
      this.metrics.averageTime = this.metrics.totalTime / this.metrics.operations;

      return result;
    } catch (error) {
      this.metrics.errors++;
      logger.error(`Redis operation ${operation} failed:`, error);
      throw error;
    }
  }

  /**
   * Obtener valor del cache
   */
  async get(key) {
    try {
      const result = await this.executeOperation('get', key);

      if (result === null) {
        this.metrics.misses++;
        return null;
      }

      this.metrics.hits++;
      return JSON.parse(result);
    } catch (error) {
      this.metrics.misses++;
      throw error;
    }
  }

  /**
   * Establecer valor en cache
   */
  async set(key, value, ttl = 3600) {
    try {
      const serializedValue = JSON.stringify(value);
      await this.executeOperation('setex', key, ttl, serializedValue);
      return true;
    } catch (error) {
      logger.error(`Failed to set cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar clave del cache
   */
  async del(key) {
    try {
      const result = await this.executeOperation('del', key);
      return result > 0;
    } catch (error) {
      logger.error(`Failed to delete cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Verificar si existe una clave
   */
  async exists(key) {
    try {
      const result = await this.executeOperation('exists', key);
      return result === 1;
    } catch (error) {
      logger.error(`Failed to check existence of key ${key}:`, error);
      return false;
    }
  }

  /**
   * Establecer múltiples valores
   */
  async mset(keyValuePairs) {
    try {
      const serializedPairs = [];
      for (const [key, value] of Object.entries(keyValuePairs)) {
        serializedPairs.push(key, JSON.stringify(value));
      }

      await this.executeOperation('mset', ...serializedPairs);
      return true;
    } catch (error) {
      logger.error('Failed to set multiple cache keys:', error);
      throw error;
    }
  }

  /**
   * Obtener múltiples valores
   */
  async mget(keys) {
    try {
      const results = await this.executeOperation('mget', ...keys);

      return results.map((result, index) => {
        if (result === null) {
          this.metrics.misses++;
          return null;
        }

        this.metrics.hits++;
        try {
          return JSON.parse(result);
        } catch (parseError) {
          logger.warn(`Failed to parse cached value for key ${keys[index]}`);
          return null;
        }
      });
    } catch (error) {
      logger.error('Failed to get multiple cache keys:', error);
      throw error;
    }
  }

  /**
   * Incrementar contador
   */
  async incr(key, ttl = 3600) {
    try {
      const client = this.getClient();
      const pipeline = client.pipeline();

      pipeline.incr(key);
      pipeline.expire(key, ttl);

      const results = await pipeline.exec();
      return results[0][1];
    } catch (error) {
      logger.error(`Failed to increment key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Establecer con expiración
   */
  async setex(key, value, ttl) {
    return this.set(key, value, ttl);
  }

  /**
   * Obtener y eliminar
   */
  async getdel(key) {
    try {
      const client = this.getClient();
      const pipeline = client.pipeline();

      pipeline.get(key);
      pipeline.del(key);

      const results = await pipeline.exec();
      const value = results[0][1];

      if (value === null) {
        this.metrics.misses++;
        return null;
      }

      this.metrics.hits++;
      return JSON.parse(value);
    } catch (error) {
      logger.error(`Failed to get and delete key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Buscar claves por patrón
   */
  async keys(pattern) {
    try {
      const result = await this.executeOperation('keys', pattern);
      return result;
    } catch (error) {
      logger.error(`Failed to search keys with pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar claves por patrón
   */
  async delPattern(pattern) {
    try {
      const keys = await this.keys(pattern);
      if (keys.length === 0) return 0;

      const result = await this.executeOperation('del', ...keys);
      return result;
    } catch (error) {
      logger.error(`Failed to delete keys with pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Obtener TTL de una clave
   */
  async ttl(key) {
    try {
      const result = await this.executeOperation('ttl', key);
      return result;
    } catch (error) {
      logger.error(`Failed to get TTL for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Establecer TTL de una clave
   */
  async expire(key, ttl) {
    try {
      const result = await this.executeOperation('expire', key, ttl);
      return result === 1;
    } catch (error) {
      logger.error(`Failed to set TTL for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Cache con fallback
   */
  async getOrSet(key, fallback, ttl = 3600) {
    try {
      let value = await this.get(key);

      if (value === null) {
        value = await fallback();
        await this.set(key, value, ttl);
      }

      return value;
    } catch (error) {
      logger.error(`Failed to get or set cache for key ${key}:`, error);
      // Si falla el cache, ejecutar fallback directamente
      return await fallback();
    }
  }

  /**
   * Invalidar cache por patrón
   */
  async invalidatePattern(pattern) {
    try {
      const keys = await this.keys(pattern);
      if (keys.length === 0) return 0;

      const result = await this.executeOperation('del', ...keys);
      logger.info(`Invalidated ${result} keys matching pattern: ${pattern}`);
      return result;
    } catch (error) {
      logger.error(`Failed to invalidate pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    const hitRate =
      this.metrics.operations > 0 ? (this.metrics.hits / this.metrics.operations) * 100 : 0;

    return {
      ...this.metrics,
      hitRate: parseFloat(hitRate.toFixed(2)),
      isConnected: this.isConnected,
      retryAttempts: this.retryAttempts,
      clients: this.clients.size,
      isCluster: !!this.cluster,
    };
  }

  /**
   * Resetear métricas
   */
  resetMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      operations: 0,
      totalTime: 0,
      averageTime: 0,
    };
  }

  /**
   * Verificar salud del servicio
   */
  async healthCheck() {
    try {
      const client = this.getClient();
      const pong = await client.ping();

      return {
        status: 'healthy',
        connected: this.isConnected,
        ping: pong === 'PONG',
        stats: this.getStats(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        ping: false,
        error: error.message,
        stats: this.getStats(),
      };
    }
  }

  /**
   * Cerrar conexiones
   */
  async close() {
    try {
      if (this.cluster) {
        await this.cluster.quit();
      }

      for (const client of this.clients.values()) {
        await client.quit();
      }

      this.clients.clear();
      this.isConnected = false;

      logger.info('Redis service closed');
    } catch (error) {
      logger.error('Error closing Redis service:', error);
    }
  }
}

// Singleton instance
const redisService = new RedisService();

module.exports = redisService;
