/* eslint-disable no-console */
const mongoose = require('mongoose');
const { logger } = require('../utils/logger');
const { performance } = require('perf_hooks');

/**
 * Servicio de connection pooling para optimizar conexiones a MongoDB
 * Incluye gestión de pools, monitoreo de conexiones, y estrategias de optimización
 */
class ConnectionPoolService {
  constructor() {
    this.connections = new Map();
    this.poolConfig = this.getPoolConfig();
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      connectionErrors: 0,
      connectionTimeouts: 0,
      averageConnectionTime: 0,
      totalConnectionTime: 0,
      connectionAttempts: 0,
      successfulConnections: 0,
      failedConnections: 0,
    };
    this.healthCheckInterval = null;
    this.cleanupInterval = null;
    this.isInitialized = false;
  }

  /**
   * Obtener configuración del pool
   */
  getPoolConfig() {
    const environment = process.env.NODE_ENV || 'development';

    const baseConfig = {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    };

    switch (environment) {
      case 'production':
        return {
          ...baseConfig,
          maxPoolSize: 20,
          minPoolSize: 5,
          maxIdleTimeMS: 60000,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 60000,
        };

      case 'staging':
        return {
          ...baseConfig,
          maxPoolSize: 15,
          minPoolSize: 3,
          maxIdleTimeMS: 45000,
          serverSelectionTimeoutMS: 7500,
          socketTimeoutMS: 50000,
        };

      default:
        return {
          ...baseConfig,
          maxPoolSize: 5,
          minPoolSize: 1,
          maxIdleTimeMS: 15000,
          serverSelectionTimeoutMS: 3000,
          socketTimeoutMS: 30000,
        };
    }
  }

  /**
   * Inicializar servicio de connection pooling
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        console.warn('Connection pool service already initialized');
        return;
      }

      // No inicializar en entorno de test para evitar conflictos con MongoMemoryServer
      if (process.env.NODE_ENV === 'test') {
        this.isInitialized = true;
        return;
      }

      // Configurar mongoose con opciones de pool
      await this.configureMongoose();

      // Iniciar monitoreo de salud
      this.startHealthMonitoring();

      // Iniciar limpieza de conexiones
      this.startConnectionCleanup();

      this.isInitialized = true;
      console.log('Connection pool service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize connection pool service:', error);
      throw error;
    }
  }

  /**
   * Configurar mongoose con opciones de pool
   */
  async configureMongoose() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gotaxi';

    const mongooseOptions = {
      ...this.poolConfig,
      // Configuraciones adicionales para optimización
      maxConnecting: this.poolConfig.maxPoolSize,
      retryWrites: true,
      retryReads: true,
      readPreference: 'secondaryPreferred',
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true },
    };

    try {
      await mongoose.connect(mongoUri, mongooseOptions);

      // Configurar event listeners
      this.setupMongooseEventListeners();

      logger.info('Mongoose configured with connection pooling');
    } catch (error) {
      logger.error('Failed to configure mongoose:', error);
      throw error;
    }
  }

  /**
   * Configurar event listeners de mongoose
   */
  setupMongooseEventListeners() {
    const connection = mongoose.connection;

    connection.on('connected', () => {
      logger.info('MongoDB connected');
      this.metrics.activeConnections = connection.readyState === 1 ? 1 : 0;
    });

    connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      this.metrics.activeConnections = 0;
    });

    connection.on('error', error => {
      logger.error('MongoDB connection error:', error);
      this.metrics.connectionErrors++;
    });

    connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      this.metrics.activeConnections = 1;
    });

    connection.on('timeout', () => {
      logger.warn('MongoDB connection timeout');
      this.metrics.connectionTimeouts++;
    });
  }

  /**
   * Crear conexión personalizada
   */
  async createConnection(name, uri, options = {}) {
    const startTime = performance.now();
    this.metrics.connectionAttempts++;

    try {
      const connectionOptions = {
        ...this.poolConfig,
        ...options,
      };

      const connection = await mongoose.createConnection(uri, connectionOptions);

      // Configurar event listeners para la conexión
      this.setupConnectionEventListeners(connection, name);

      // Guardar conexión
      this.connections.set(name, {
        connection,
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true,
        metrics: {
          queries: 0,
          errors: 0,
          averageQueryTime: 0,
        },
      });

      const endTime = performance.now();
      const connectionTime = endTime - startTime;

      this.updateConnectionMetrics(connectionTime, true);
      this.metrics.successfulConnections++;

      logger.info(`Custom connection '${name}' created successfully`);
      return connection;
    } catch (error) {
      this.updateConnectionMetrics(performance.now() - startTime, false);
      this.metrics.failedConnections++;
      logger.error(`Failed to create connection '${name}':`, error);
      throw error;
    }
  }

  /**
   * Configurar event listeners para conexión personalizada
   */
  setupConnectionEventListeners(connection, name) {
    connection.on('connected', () => {
      logger.info(`Connection '${name}' connected`);
      this.updateConnectionStatus(name, true);
    });

    connection.on('disconnected', () => {
      logger.warn(`Connection '${name}' disconnected`);
      this.updateConnectionStatus(name, false);
    });

    connection.on('error', error => {
      logger.error(`Connection '${name}' error:`, error);
      this.updateConnectionError(name);
    });

    connection.on('reconnected', () => {
      logger.info(`Connection '${name}' reconnected`);
      this.updateConnectionStatus(name, true);
    });
  }

  /**
   * Obtener conexión por nombre
   */
  getConnection(name = 'default') {
    if (name === 'default') {
      return mongoose.connection;
    }

    const connectionData = this.connections.get(name);
    if (!connectionData) {
      throw new Error(`Connection '${name}' not found`);
    }

    // Actualizar último uso
    connectionData.lastUsed = new Date();

    return connectionData.connection;
  }

  /**
   * Ejecutar operación en conexión específica
   */
  async executeOnConnection(name, operation, ...args) {
    const connection = this.getConnection(name);
    const _connectionData = this.connections.get(name);

    const startTime = performance.now();

    try {
      const result = await operation(connection, ...args);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Actualizar métricas de la conexión
      this.updateConnectionOperationMetrics(name, executionTime, true);

      return result;
    } catch (error) {
      this.updateConnectionOperationMetrics(name, performance.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Actualizar estado de conexión
   */
  updateConnectionStatus(name, isActive) {
    const connectionData = this.connections.get(name);
    if (connectionData) {
      connectionData.isActive = isActive;
      connectionData.lastUsed = new Date();
    }
  }

  /**
   * Actualizar error de conexión
   */
  updateConnectionError(name) {
    const connectionData = this.connections.get(name);
    if (connectionData) {
      connectionData.metrics.errors++;
    }
  }

  /**
   * Actualizar métricas de operación de conexión
   */
  updateConnectionOperationMetrics(name, executionTime, success) {
    const connectionData = this.connections.get(name);
    if (connectionData) {
      connectionData.metrics.queries++;
      if (!success) {
        connectionData.metrics.errors++;
      }

      // Actualizar tiempo promedio de query
      const totalTime =
        connectionData.metrics.averageQueryTime * (connectionData.metrics.queries - 1) +
        executionTime;
      connectionData.metrics.averageQueryTime = totalTime / connectionData.metrics.queries;
    }
  }

  /**
   * Actualizar métricas de conexión
   */
  updateConnectionMetrics(connectionTime, success) {
    this.metrics.totalConnectionTime += connectionTime;
    this.metrics.averageConnectionTime =
      this.metrics.totalConnectionTime / this.metrics.connectionAttempts;

    if (success) {
      this.metrics.activeConnections++;
    }
  }

  /**
   * Iniciar monitoreo de salud
   */
  startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Cada 30 segundos
  }

  /**
   * Realizar verificación de salud
   */
  async performHealthCheck() {
    try {
      // Verificar conexión principal
      const mainConnection = mongoose.connection;
      if (mainConnection.readyState !== 1) {
        logger.warn('Main MongoDB connection is not healthy');
        this.metrics.connectionErrors++;
      }

      // Verificar conexiones personalizadas
      for (const [name, connectionData] of this.connections) {
        if (connectionData.connection.readyState !== 1) {
          logger.warn(`Connection '${name}' is not healthy`);
          connectionData.isActive = false;
        }
      }

      // Actualizar métricas
      this.updatePoolMetrics();
    } catch (error) {
      logger.error('Health check failed:', error);
    }
  }

  /**
   * Actualizar métricas del pool
   */
  updatePoolMetrics() {
    this.metrics.totalConnections = this.connections.size + 1; // +1 para conexión principal
    this.metrics.activeConnections = 0;
    this.metrics.idleConnections = 0;

    // Contar conexiones activas
    if (mongoose.connection.readyState === 1) {
      this.metrics.activeConnections++;
    }

    for (const connectionData of this.connections.values()) {
      if (connectionData.isActive) {
        this.metrics.activeConnections++;
      } else {
        this.metrics.idleConnections++;
      }
    }
  }

  /**
   * Iniciar limpieza de conexiones
   */
  startConnectionCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections();
    }, 60000); // Cada minuto
  }

  /**
   * Limpiar conexiones inactivas
   */
  async cleanupIdleConnections() {
    const now = new Date();
    const maxIdleTime = this.poolConfig.maxIdleTimeMS;

    for (const [name, connectionData] of this.connections) {
      const idleTime = now - connectionData.lastUsed;

      if (idleTime > maxIdleTime && !connectionData.isActive) {
        try {
          await connectionData.connection.close();
          this.connections.delete(name);
          logger.info(`Cleaned up idle connection '${name}'`);
        } catch (error) {
          logger.error(`Failed to cleanup connection '${name}':`, error);
        }
      }
    }
  }

  /**
   * Obtener estadísticas del pool
   */
  getPoolStats() {
    this.updatePoolMetrics();

    const connectionStats = {};
    for (const [name, connectionData] of this.connections) {
      connectionStats[name] = {
        isActive: connectionData.isActive,
        createdAt: connectionData.createdAt,
        lastUsed: connectionData.lastUsed,
        metrics: connectionData.metrics,
      };
    }

    return {
      ...this.metrics,
      connections: connectionStats,
      poolConfig: this.poolConfig,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Obtener reporte de rendimiento
   */
  getPerformanceReport() {
    const stats = this.getPoolStats();

    const report = {
      summary: {
        totalConnections: stats.totalConnections,
        activeConnections: stats.activeConnections,
        idleConnections: stats.idleConnections,
        connectionSuccessRate:
          stats.connectionAttempts > 0
            ? (stats.successfulConnections / stats.connectionAttempts) * 100
            : 0,
        averageConnectionTime: stats.averageConnectionTime,
      },
      connections: stats.connections,
      recommendations: this.generatePoolRecommendations(stats),
    };

    return report;
  }

  /**
   * Generar recomendaciones para el pool
   */
  generatePoolRecommendations(stats) {
    const recommendations = [];

    // Recomendación de tamaño de pool
    const utilizationRate = stats.activeConnections / stats.totalConnections;
    if (utilizationRate > 0.8) {
      recommendations.push({
        type: 'pool-size',
        priority: 'high',
        message: 'High pool utilization - consider increasing maxPoolSize',
        currentUtilization: utilizationRate,
      });
    } else if (utilizationRate < 0.3 && stats.totalConnections > 5) {
      recommendations.push({
        type: 'pool-size',
        priority: 'medium',
        message: 'Low pool utilization - consider decreasing maxPoolSize',
        currentUtilization: utilizationRate,
      });
    }

    // Recomendación de errores de conexión
    if (stats.connectionErrors > stats.connectionAttempts * 0.1) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'High connection error rate - check network and MongoDB health',
        errorRate: stats.connectionErrors / stats.connectionAttempts,
      });
    }

    // Recomendación de tiempo de conexión
    if (stats.averageConnectionTime > 5000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Slow connection times - check network latency',
        averageTime: stats.averageConnectionTime,
      });
    }

    return recommendations;
  }

  /**
   * Cerrar todas las conexiones
   */
  async closeAllConnections() {
    try {
      // Cerrar conexiones personalizadas
      for (const [name, connectionData] of this.connections) {
        try {
          await connectionData.connection.close();
          logger.info(`Closed connection '${name}'`);
        } catch (error) {
          logger.error(`Error closing connection '${name}':`, error);
        }
      }

      // Cerrar conexión principal
      await mongoose.connection.close();

      // Limpiar intervalos
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      // Limpiar estado
      this.connections.clear();
      this.isInitialized = false;

      logger.info('All connections closed');
    } catch (error) {
      logger.error('Error closing connections:', error);
      throw error;
    }
  }

  /**
   * Resetear métricas
   */
  resetMetrics() {
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      connectionErrors: 0,
      connectionTimeouts: 0,
      averageConnectionTime: 0,
      totalConnectionTime: 0,
      connectionAttempts: 0,
      successfulConnections: 0,
      failedConnections: 0,
    };
  }
}

module.exports = new ConnectionPoolService();
