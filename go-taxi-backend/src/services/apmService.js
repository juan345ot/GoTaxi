/* eslint-disable no-console */
const { logger } = require('../utils/logger');
const os = require('os');

/**
 * Servicio de APM(Application Performance Monitoring)
 * Monitorea rendimiento, métricas de sistema, y genera alertas
 */
class APMService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        totalResponseTime: 0,
        byEndpoint: new Map(),
        byMethod: new Map(),
        byStatus: new Map(),
      },
      database: {
        queries: 0,
        slowQueries: 0,
        averageQueryTime: 0,
        totalQueryTime: 0,
        byCollection: new Map(),
        connectionPool: {
          total: 0,
          active: 0,
          idle: 0,
        },
      },
      cache: {
        hits: 0,
        misses: 0,
        operations: 0,
        hitRate: 0,
        averageOperationTime: 0,
        totalOperationTime: 0,
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
        heap: {
          used: 0,
          total: 0,
          external: 0,
        },
        rss: 0,
        external: 0,
      },
      cpu: {
        usage: 0,
        loadAverage: [0, 0, 0],
        cores: os.cpus().length,
      },
      errors: {
        total: 0,
        byType: new Map(),
        byEndpoint: new Map(),
        recent: [],
      },
      uptime: {
        startTime: Date.now(),
        current: 0,
        formatted: '',
      },
    };

    this.alerts = [];
    this.thresholds = this.getThresholds();
    this.monitoringInterval = null;
    this.isMonitoring = false;
  }

  /**
   * Obtener umbrales de alerta
   */
  getThresholds() {
    return {
      responseTime: {
        warning: 1000, // 1 segundo
        critical: 5000, // 5 segundos
      },
      memory: {
        warning: 80, // 80%
        critical: 90, // 90%
      },
      cpu: {
        warning: 80, // 80%
        critical: 95, // 95%
      },
      errorRate: {
        warning: 5, // 5%
        critical: 10, // 10%
      },
      databaseQueryTime: {
        warning: 1000, // 1 segundo
        critical: 5000, // 5 segundos
      },
    };
  }

  /**
   * Iniciar monitoreo
   */
  startMonitoring(intervalMs = 30000) {
    if (this.isMonitoring) {
      console.warn('APM monitoring already started');
      return;
    }

    // No iniciar monitoreo en entorno de test
    if (process.env.NODE_ENV === 'test') {
      this.isMonitoring = true;
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.checkAlerts();
    }, intervalMs);

    console.log(`APM monitoring started with ${intervalMs}ms interval`);
  }

  /**
   * Detener monitoreo
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      logger.warn('APM monitoring not started');
      return;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    logger.info('APM monitoring stopped');
  }

  /**
   * Registrar request
   */
  recordRequest(method, endpoint, statusCode, responseTime, _userId = null) {
    this.metrics.requests.total++;
    this.metrics.requests.totalResponseTime += responseTime;
    this.metrics.requests.averageResponseTime =
      this.metrics.requests.totalResponseTime / this.metrics.requests.total;

    // Contar por estado
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Métricas por endpoint
    const endpointKey = `${method} ${endpoint}`;
    const endpointMetrics = this.metrics.requests.byEndpoint.get(endpointKey) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      errors: 0,
    };

    endpointMetrics.count++;
    endpointMetrics.totalTime += responseTime;
    endpointMetrics.averageTime = endpointMetrics.totalTime / endpointMetrics.count;

    if (statusCode >= 400) {
      endpointMetrics.errors++;
    }

    this.metrics.requests.byEndpoint.set(endpointKey, endpointMetrics);

    // Métricas por método
    const methodMetrics = this.metrics.requests.byMethod.get(method) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
    };

    methodMetrics.count++;
    methodMetrics.totalTime += responseTime;
    methodMetrics.averageTime = methodMetrics.totalTime / methodMetrics.count;

    this.metrics.requests.byMethod.set(method, methodMetrics);

    // Métricas por status
    const statusMetrics = this.metrics.requests.byStatus.get(statusCode) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
    };

    statusMetrics.count++;
    statusMetrics.totalTime += responseTime;
    statusMetrics.averageTime = statusMetrics.totalTime / statusMetrics.count;

    this.metrics.requests.byStatus.set(statusCode, statusMetrics);

    // Verificar si es request lento
    if (responseTime > this.thresholds.responseTime.warning) {
      this.createAlert('slow_request', {
        method,
        endpoint,
        responseTime,
        threshold: this.thresholds.responseTime.warning,
      });
    }
  }

  /**
   * Registrar query de base de datos
   */
  recordDatabaseQuery(collection, operation, queryTime, isSlow = false) {
    this.metrics.database.queries++;
    this.metrics.database.totalQueryTime += queryTime;
    this.metrics.database.averageQueryTime =
      this.metrics.database.totalQueryTime / this.metrics.database.queries;

    if (isSlow) {
      this.metrics.database.slowQueries++;
    }

    // Métricas por colección
    const collectionMetrics = this.metrics.database.byCollection.get(collection) || {
      queries: 0,
      slowQueries: 0,
      totalTime: 0,
      averageTime: 0,
      operations: new Map(),
    };

    collectionMetrics.queries++;
    collectionMetrics.totalTime += queryTime;
    collectionMetrics.averageTime = collectionMetrics.totalTime / collectionMetrics.queries;

    if (isSlow) {
      collectionMetrics.slowQueries++;
    }

    // Métricas por operación
    const operationMetrics = collectionMetrics.operations.get(operation) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
    };

    operationMetrics.count++;
    operationMetrics.totalTime += queryTime;
    operationMetrics.averageTime = operationMetrics.totalTime / operationMetrics.count;

    collectionMetrics.operations.set(operation, operationMetrics);
    this.metrics.database.byCollection.set(collection, collectionMetrics);

    // Verificar si es query lenta
    if (queryTime > this.thresholds.databaseQueryTime.warning) {
      this.createAlert('slow_database_query', {
        collection,
        operation,
        queryTime,
        threshold: this.thresholds.databaseQueryTime.warning,
      });
    }
  }

  /**
   * Registrar operación de cache
   */
  recordCacheOperation(operation, success, operationTime) {
    this.metrics.cache.operations++;
    this.metrics.cache.totalOperationTime += operationTime;
    this.metrics.cache.averageOperationTime =
      this.metrics.cache.totalOperationTime / this.metrics.cache.operations;

    if (success) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }

    this.metrics.cache.hitRate =
      (this.metrics.cache.hits / (this.metrics.cache.hits + this.metrics.cache.misses)) * 100;
  }

  /**
   * Registrar error
   */
  recordError(error, endpoint = null, userId = null) {
    this.metrics.errors.total++;

    const errorType = error.constructor.name;
    const errorMetrics = this.metrics.errors.byType.get(errorType) || {
      count: 0,
      lastSeen: null,
      endpoints: new Set(),
    };

    errorMetrics.count++;
    errorMetrics.lastSeen = new Date();

    if (endpoint) {
      errorMetrics.endpoints.add(endpoint);
    }

    this.metrics.errors.byType.set(errorType, errorMetrics);

    // Métricas por endpoint
    if (endpoint) {
      const endpointErrorMetrics = this.metrics.errors.byEndpoint.get(endpoint) || {
        count: 0,
        types: new Map(),
      };

      endpointErrorMetrics.count++;
      const typeCount = endpointErrorMetrics.types.get(errorType) || 0;
      endpointErrorMetrics.types.set(errorType, typeCount + 1);

      this.metrics.errors.byEndpoint.set(endpoint, endpointErrorMetrics);
    }

    // Agregar a errores recientes
    this.metrics.errors.recent.push({
      type: errorType,
      message: error.message,
      endpoint,
      userId,
      timestamp: new Date(),
      stack: error.stack,
    });

    // Mantener solo los últimos 100 errores
    if (this.metrics.errors.recent.length > 100) {
      this.metrics.errors.recent = this.metrics.errors.recent.slice(-100);
    }

    // Crear alerta si hay muchos errores
    const errorRate = this.calculateErrorRate();
    if (errorRate > this.thresholds.errorRate.warning) {
      this.createAlert('high_error_rate', {
        errorRate,
        threshold: this.thresholds.errorRate.warning,
        recentErrors: this.metrics.errors.recent.slice(-10),
      });
    }
  }

  /**
   * Calcular tasa de errores
   */
  calculateErrorRate() {
    if (this.metrics.requests.total === 0) return 0;
    return (this.metrics.errors.total / this.metrics.requests.total) * 100;
  }

  /**
   * Recopilar métricas del sistema
   */
  collectSystemMetrics() {
    // Métricas de memoria
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    this.metrics.memory.used = usedMem;
    this.metrics.memory.total = totalMem;
    this.metrics.memory.percentage = (usedMem / totalMem) * 100;
    this.metrics.memory.heap = {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      external: memUsage.external,
    };
    this.metrics.memory.rss = memUsage.rss;
    this.metrics.memory.external = memUsage.external;

    // Métricas de CPU
    this.metrics.cpu.loadAverage = os.loadavg();
    this.metrics.cpu.cores = os.cpus().length;

    // Uptime
    this.metrics.uptime.current = Date.now() - this.metrics.uptime.startTime;
    this.metrics.uptime.formatted = this.formatUptime(this.metrics.uptime.current);
  }

  /**
   * Formatear uptime
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Verificar alertas
   */
  checkAlerts() {
    // Verificar memoria
    if (this.metrics.memory.percentage > this.thresholds.memory.critical) {
      this.createAlert('high_memory_usage', {
        usage: this.metrics.memory.percentage,
        threshold: this.thresholds.memory.critical,
        level: 'critical',
      });
    } else if (this.metrics.memory.percentage > this.thresholds.memory.warning) {
      this.createAlert('high_memory_usage', {
        usage: this.metrics.memory.percentage,
        threshold: this.thresholds.memory.warning,
        level: 'warning',
      });
    }

    // Verificar CPU
    const cpuUsage = (this.metrics.cpu.loadAverage[0] / this.metrics.cpu.cores) * 100;
    if (cpuUsage > this.thresholds.cpu.critical) {
      this.createAlert('high_cpu_usage', {
        usage: cpuUsage,
        threshold: this.thresholds.cpu.critical,
        level: 'critical',
      });
    } else if (cpuUsage > this.thresholds.cpu.warning) {
      this.createAlert('high_cpu_usage', {
        usage: cpuUsage,
        threshold: this.thresholds.cpu.warning,
        level: 'warning',
      });
    }

    // Verificar tasa de errores
    const errorRate = this.calculateErrorRate();
    if (errorRate > this.thresholds.errorRate.critical) {
      this.createAlert('critical_error_rate', {
        errorRate,
        threshold: this.thresholds.errorRate.critical,
        level: 'critical',
      });
    }
  }

  /**
   * Crear alerta
   */
  createAlert(type, data) {
    const alert = {
      id: Date.now().toString(),
      type,
      level: data.level || 'warning',
      message: this.generateAlertMessage(type, data),
      data,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(alert);

    // Mantener solo las últimas 1000 alertas
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    logger.warn(`APM Alert [${alert.level.toUpperCase()}]: ${alert.message}`, data);
  }

  /**
   * Generar mensaje de alerta
   */
  generateAlertMessage(type, data) {
    switch (type) {
      case 'slow_request':
        return (
          `Slow request detected: ${data.method} ${data.endpoint} took ${data.responseTime}ms ` +
          `(threshold: ${data.threshold}ms)`
        );

      case 'slow_database_query':
        return (
          `Slow database query detected: ${data.collection}.${data.operation} took ` +
          `${data.queryTime}ms(threshold: ${data.threshold}ms)`
        );

      case 'high_memory_usage':
        return `High memory usage: ${data.usage.toFixed(2)}% (threshold: ${data.threshold}%)`;

      case 'high_cpu_usage':
        return `High CPU usage: ${data.usage.toFixed(2)}% (threshold: ${data.threshold}%)`;

      case 'high_error_rate':
        return `High error rate: ${data.errorRate.toFixed(2)}% (threshold: ${data.threshold}%)`;

      case 'critical_error_rate':
        return `Critical error rate: ${data.errorRate.toFixed(2)}% (threshold: ${data.threshold}%)`;

      default:
        return `Alert: ${type}`;
    }
  }

  /**
   * Obtener métricas
   */
  getMetrics() {
    this.collectSystemMetrics();
    return {
      ...this.metrics,
      requests: {
        ...this.metrics.requests,
        byEndpoint: Object.fromEntries(this.metrics.requests.byEndpoint),
        byMethod: Object.fromEntries(this.metrics.requests.byMethod),
        byStatus: Object.fromEntries(this.metrics.requests.byStatus),
      },
      database: {
        ...this.metrics.database,
        byCollection: Object.fromEntries(
          Array.from(this.metrics.database.byCollection.entries()).map(([key, value]) => [
            key,
            {
              ...value,
              operations: Object.fromEntries(value.operations),
            },
          ]),
        ),
      },
      errors: {
        ...this.metrics.errors,
        byType: Object.fromEntries(
          Array.from(this.metrics.errors.byType.entries()).map(([key, value]) => [
            key,
            {
              ...value,
              endpoints: Array.from(value.endpoints),
            },
          ]),
        ),
        byEndpoint: Object.fromEntries(
          Array.from(this.metrics.errors.byEndpoint.entries()).map(([key, value]) => [
            key,
            {
              ...value,
              types: Object.fromEntries(value.types),
            },
          ]),
        ),
      },
    };
  }

  /**
   * Obtener alertas
   */
  getAlerts(limit = 50, unresolved = false) {
    let filteredAlerts = this.alerts;

    if (unresolved) {
      filteredAlerts = this.alerts.filter(alert => !alert.resolved);
    }

    return filteredAlerts.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Resolver alerta
   */
  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Generar reporte de salud
   */
  getHealthReport() {
    const metrics = this.getMetrics();
    const errorRate = this.calculateErrorRate();

    let status = 'healthy';
    const issues = [];

    // Verificar estado general
    if (errorRate > this.thresholds.errorRate.critical) {
      status = 'critical';
      issues.push('Critical error rate');
    } else if (errorRate > this.thresholds.errorRate.warning) {
      status = 'warning';
      issues.push('High error rate');
    }

    if (metrics.memory.percentage > this.thresholds.memory.critical) {
      status = 'critical';
      issues.push('Critical memory usage');
    } else if (metrics.memory.percentage > this.thresholds.memory.warning) {
      if (status === 'healthy') status = 'warning';
      issues.push('High memory usage');
    }

    const cpuUsage = (metrics.cpu.loadAverage[0] / metrics.cpu.cores) * 100;
    if (cpuUsage > this.thresholds.cpu.critical) {
      status = 'critical';
      issues.push('Critical CPU usage');
    } else if (cpuUsage > this.thresholds.cpu.warning) {
      if (status === 'healthy') status = 'warning';
      issues.push('High CPU usage');
    }

    return {
      status,
      issues,
      metrics: {
        errorRate,
        memoryUsage: metrics.memory.percentage,
        cpuUsage,
        responseTime: metrics.requests.averageResponseTime,
        uptime: metrics.uptime.formatted,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Resetear métricas
   */
  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        totalResponseTime: 0,
        byEndpoint: new Map(),
        byMethod: new Map(),
        byStatus: new Map(),
      },
      database: {
        queries: 0,
        slowQueries: 0,
        averageQueryTime: 0,
        totalQueryTime: 0,
        byCollection: new Map(),
        connectionPool: {
          total: 0,
          active: 0,
          idle: 0,
        },
      },
      cache: {
        hits: 0,
        misses: 0,
        operations: 0,
        hitRate: 0,
        averageOperationTime: 0,
        totalOperationTime: 0,
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
        heap: {
          used: 0,
          total: 0,
          external: 0,
        },
        rss: 0,
        external: 0,
      },
      cpu: {
        usage: 0,
        loadAverage: [0, 0, 0],
        cores: os.cpus().length,
      },
      errors: {
        total: 0,
        byType: new Map(),
        byEndpoint: new Map(),
        recent: [],
      },
      uptime: {
        startTime: Date.now(),
        current: 0,
        formatted: '',
      },
    };

    this.alerts = [];
  }
}

module.exports = new APMService();
