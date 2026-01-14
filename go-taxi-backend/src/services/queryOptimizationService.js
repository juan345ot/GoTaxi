const { logger } = require('../utils/logger');
const { performance } = require('perf_hooks');

/**
 * Servicio de optimización de queries para mejorar rendimiento de base de datos
 * Incluye análisis de queries, índices automáticos, y estrategias de optimización
 */
class QueryOptimizationService {
  constructor() {
    this.queryCache = new Map();
    this.slowQueries = new Map();
    this.queryStats = new Map();
    this.indexRecommendations = new Map();
    this.optimizationRules = this.getOptimizationRules();
    this.metrics = {
      totalQueries: 0,
      optimizedQueries: 0,
      slowQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageQueryTime: 0,
      totalQueryTime: 0,
    };
  }

  /**
   * Obtener reglas de optimización
   */
  getOptimizationRules() {
    return {
      // Límites de tiempo para queries
      slowQueryThreshold: 1000, // 1 segundo
      verySlowQueryThreshold: 5000, // 5 segundos

      // Límites de documentos
      maxDocumentsPerQuery: 1000,
      maxAggregationStages: 10,

      // Configuración de índices
      maxIndexesPerCollection: 20,
      indexSizeLimit: 100 * 1024 * 1024, // 100MB

      // Configuración de cache
      queryCacheSize: 1000,
      queryCacheTTL: 300000, // 5 minutos

      // Configuración de paginación
      defaultPageSize: 20,
      maxPageSize: 100,

      // Configuración de proyección
      maxProjectionFields: 20,
      excludeLargeFields: ['content', 'body', 'description'],
    };
  }

  /**
   * Analizar y optimizar query
   */
  async analyzeQuery(collection, query, options = {}) {
    const startTime = performance.now();
    this.metrics.totalQueries++;

    try {
      // Generar hash único para la query
      const queryHash = this.generateQueryHash(collection, query, options);

      // Verificar cache
      if (this.queryCache.has(queryHash)) {
        this.metrics.cacheHits++;
        const cachedResult = this.queryCache.get(queryHash);
        logger.debug(`Query cache hit for collection: ${collection}`);
        return cachedResult;
      }

      this.metrics.cacheMisses++;

      // Analizar query
      const analysis = await this.performQueryAnalysis(collection, query, options);

      // Aplicar optimizaciones
      const optimizedQuery = this.applyOptimizations(collection, query, analysis, options);

      // Calcular tiempo de ejecución
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Actualizar métricas
      this.updateQueryMetrics(collection, executionTime, analysis);

      // Guardar en cache
      const result = {
        originalQuery: query,
        optimizedQuery,
        analysis,
        executionTime,
        recommendations: analysis.recommendations,
      };

      this.queryCache.set(queryHash, result);
      this.cleanupQueryCache();

      return result;
    } catch (error) {
      logger.error(`Query analysis failed for collection ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Generar hash único para query
   */
  generateQueryHash(collection, query, options) {
    const queryString = JSON.stringify({ collection, query, options });
    return require('crypto').createHash('md5').update(queryString).digest('hex');
  }

  /**
   * Realizar análisis de query
   */
  async performQueryAnalysis(collection, query, _options) {
    const analysis = {
      complexity: 'low',
      estimatedDocuments: 0,
      hasIndexes: false,
      hasProjection: false,
      hasSort: false,
      hasLimit: false,
      hasSkip: false,
      recommendations: [],
      warnings: [],
      errors: [],
    };

    // Analizar complejidad
    analysis.complexity = this.analyzeQueryComplexity(query);

    // Analizar uso de índices
    analysis.hasIndexes = this.checkIndexUsage(query);

    // Analizar proyección
    analysis.hasProjection = this.checkProjection(query);

    // Analizar ordenamiento
    analysis.hasSort = this.checkSorting(query);

    // Analizar límites
    analysis.hasLimit = this.checkLimits(query);

    // Analizar skip
    analysis.hasSkip = this.checkSkip(query);

    // Generar recomendaciones
    analysis.recommendations = this.generateRecommendations(collection, query, analysis);

    // Generar advertencias
    analysis.warnings = this.generateWarnings(query, analysis);

    return analysis;
  }

  /**
   * Analizar complejidad de query
   */
  analyzeQueryComplexity(query) {
    let complexity = 'low';
    let score = 0;

    // Contar operadores
    const operators = ['$and', '$or', '$nor', '$not', '$in', '$nin', '$exists', '$regex'];
    operators.forEach(op => {
      if (JSON.stringify(query).includes(op)) {
        score += 2;
      }
    });

    // Contar campos en query
    const fieldCount = Object.keys(query).length;
    score += fieldCount;

    // Contar anidamiento
    const nestingLevel = this.calculateNestingLevel(query);
    score += nestingLevel * 3;

    // Determinar complejidad
    if (score > 20) complexity = 'very-high';
    else if (score > 15) complexity = 'high';
    else if (score > 10) complexity = 'medium';
    else if (score > 5) complexity = 'low-medium';

    return complexity;
  }

  /**
   * Calcular nivel de anidamiento
   */
  calculateNestingLevel(obj, level = 0) {
    let maxLevel = level;

    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        const nestedLevel = this.calculateNestingLevel(value, level + 1);
        maxLevel = Math.max(maxLevel, nestedLevel);
      }
    }

    return maxLevel;
  }

  /**
   * Verificar uso de índices
   */
  checkIndexUsage(query) {
    // Verificar si la query puede usar índices
    const indexedFields = ['_id', 'email', 'createdAt', 'updatedAt', 'status'];

    for (const field of Object.keys(query)) {
      if (indexedFields.includes(field)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Verificar proyección
   */
  checkProjection(query) {
    return query.fields || query.projection || query.select;
  }

  /**
   * Verificar ordenamiento
   */
  checkSorting(query) {
    return query.sort || query.orderBy;
  }

  /**
   * Verificar límites
   */
  checkLimits(query) {
    return query.limit || query.take;
  }

  /**
   * Verificar skip
   */
  checkSkip(query) {
    return query.skip || query.offset;
  }

  /**
   * Generar recomendaciones
   */
  generateRecommendations(collection, query, analysis) {
    const recommendations = [];

    // Recomendación de índices
    if (!analysis.hasIndexes) {
      const indexFields = this.getIndexRecommendations(query);
      if (indexFields.length > 0) {
        recommendations.push({
          type: 'index',
          priority: 'high',
          message: `Consider adding index on fields: ${indexFields.join(', ')}`,
          fields: indexFields,
        });
      }
    }

    // Recomendación de proyección
    if (!analysis.hasProjection) {
      recommendations.push({
        type: 'projection',
        priority: 'medium',
        message: 'Add projection to limit returned fields',
      });
    }

    // Recomendación de límites
    if (!analysis.hasLimit) {
      recommendations.push({
        type: 'limit',
        priority: 'high',
        message: `Add limit to prevent large result sets(max: ${this.optimizationRules.maxDocumentsPerQuery})`,
      });
    }

    // Recomendación de paginación
    if (analysis.hasSkip && !analysis.hasLimit) {
      recommendations.push({
        type: 'pagination',
        priority: 'medium',
        message: 'Consider using cursor-based pagination instead of skip/limit',
      });
    }

    // Recomendación de complejidad
    if (analysis.complexity === 'high' || analysis.complexity === 'very-high') {
      recommendations.push({
        type: 'complexity',
        priority: 'high',
        message: 'Consider breaking down complex query into simpler queries',
      });
    }

    return recommendations;
  }

  /**
   * Obtener recomendaciones de índices
   */
  getIndexRecommendations(query) {
    const indexFields = [];

    // Campos más comunes para indexar
    const commonIndexFields = ['email', 'status', 'createdAt', 'updatedAt', 'userId', 'tripId'];

    for (const field of Object.keys(query)) {
      if (commonIndexFields.includes(field)) {
        indexFields.push(field);
      }
    }

    return indexFields;
  }

  /**
   * Generar advertencias
   */
  generateWarnings(query, analysis) {
    const warnings = [];

    // Advertencia de query compleja
    if (analysis.complexity === 'very-high') {
      warnings.push('Very complex query detected - consider optimization');
    }

    // Advertencia de falta de límites
    if (!analysis.hasLimit) {
      warnings.push('Query without limit - may return large result set');
    }

    // Advertencia de skip sin límite
    if (analysis.hasSkip && !analysis.hasLimit) {
      warnings.push('Using skip without limit - consider pagination strategy');
    }

    return warnings;
  }

  /**
   * Aplicar optimizaciones
   */
  applyOptimizations(collection, query, analysis, options) {
    const optimizedQuery = { ...query };
    const optimizedOptions = { ...options };

    // Aplicar límite por defecto
    if (!optimizedOptions.limit && !query.limit) {
      optimizedOptions.limit = this.optimizationRules.defaultPageSize;
    }

    // Aplicar proyección por defecto
    if (!optimizedOptions.projection && !query.projection) {
      optimizedOptions.projection = this.getDefaultProjection(collection);
    }

    // Optimizar ordenamiento
    if (optimizedOptions.sort) {
      optimizedOptions.sort = this.optimizeSorting(optimizedOptions.sort);
    }

    // Aplicar hint de índice si está disponible
    const indexHint = this.getIndexHint(collection, query);
    if (indexHint) {
      optimizedOptions.hint = indexHint;
    }

    return {
      query: optimizedQuery,
      options: optimizedOptions,
    };
  }

  /**
   * Obtener proyección por defecto
   */
  getDefaultProjection(collection) {
    const projections = {
      users: { _id: 1, email: 1, name: 1, role: 1, createdAt: 1 },
      trips: { _id: 1, passengerId: 1, driverId: 1, status: 1, fare: 1, createdAt: 1 },
      drivers: { _id: 1, userId: 1, license: 1, isAvailable: 1, rating: 1 },
    };

    return projections[collection] || { _id: 1 };
  }

  /**
   * Optimizar ordenamiento
   */
  optimizeSorting(sort) {
    // Priorizar campos indexados
    const indexedFields = ['_id', 'createdAt', 'updatedAt', 'email'];

    if (typeof sort === 'object') {
      const sortedFields = Object.keys(sort);
      const optimizedSort = {};

      // Mover campos indexados al principio
      indexedFields.forEach(field => {
        if (sortedFields.includes(field)) {
          optimizedSort[field] = sort[field];
        }
      });

      // Agregar campos no indexados
      sortedFields.forEach(field => {
        if (!indexedFields.includes(field)) {
          optimizedSort[field] = sort[field];
        }
      });

      return optimizedSort;
    }

    return sort;
  }

  /**
   * Obtener hint de índice
   */
  getIndexHint(collection, query) {
    const indexHints = {
      users: {
        email: { email: 1 },
        status: { isActive: 1 },
        role: { role: 1 },
      },
      trips: {
        passenger: { passengerId: 1 },
        driver: { driverId: 1 },
        status: { status: 1 },
        date: { createdAt: 1 },
      },
    };

    const collectionHints = indexHints[collection];
    if (!collectionHints) return null;

    // Buscar hint apropiado basado en campos de query
    for (const [field, hint] of Object.entries(collectionHints)) {
      if (query[field] !== undefined) {
        return hint;
      }
    }

    return null;
  }

  /**
   * Actualizar métricas de query
   */
  updateQueryMetrics(collection, executionTime, _analysis) {
    this.metrics.totalQueryTime += executionTime;
    this.metrics.averageQueryTime = this.metrics.totalQueryTime / this.metrics.totalQueries;

    // Registrar query lenta
    if (executionTime > this.optimizationRules.slowQueryThreshold) {
      this.metrics.slowQueries++;
      this.slowQueries.set(collection, {
        count: (this.slowQueries.get(collection)?.count || 0) + 1,
        averageTime: executionTime,
        lastSeen: new Date(),
      });
    }

    // Actualizar estadísticas por colección
    const collectionStats = this.queryStats.get(collection) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      slowQueries: 0,
    };

    collectionStats.count++;
    collectionStats.totalTime += executionTime;
    collectionStats.averageTime = collectionStats.totalTime / collectionStats.count;

    if (executionTime > this.optimizationRules.slowQueryThreshold) {
      collectionStats.slowQueries++;
    }

    this.queryStats.set(collection, collectionStats);
  }

  /**
   * Limpiar cache de queries
   */
  cleanupQueryCache() {
    if (this.queryCache.size > this.optimizationRules.queryCacheSize) {
      const entries = Array.from(this.queryCache.entries());
      const toDelete = entries.slice(0, entries.length - this.optimizationRules.queryCacheSize);

      toDelete.forEach(([key]) => {
        this.queryCache.delete(key);
      });
    }
  }

  /**
   * Obtener estadísticas de queries
   */
  getQueryStats() {
    return {
      ...this.metrics,
      collections: Object.fromEntries(this.queryStats),
      slowQueries: Object.fromEntries(this.slowQueries),
      cacheSize: this.queryCache.size,
    };
  }

  /**
   * Obtener queries lentas
   */
  getSlowQueries(limit = 10) {
    const slowQueries = Array.from(this.slowQueries.entries())
      .sort(([, a], [, b]) => b.averageTime - a.averageTime)
      .slice(0, limit);

    return slowQueries.map(([collection, stats]) => ({
      collection,
      ...stats,
    }));
  }

  /**
   * Generar reporte de optimización
   */
  generateOptimizationReport() {
    const stats = this.getQueryStats();
    const slowQueries = this.getSlowQueries();

    const report = {
      summary: {
        totalQueries: stats.totalQueries,
        averageQueryTime: stats.averageQueryTime,
        slowQueries: stats.slowQueries,
        cacheHitRate: (stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100,
      },
      collections: stats.collections,
      slowQueries,
      recommendations: this.generateGlobalRecommendations(stats),
    };

    return report;
  }

  /**
   * Generar recomendaciones globales
   */
  generateGlobalRecommendations(stats) {
    const recommendations = [];

    // Recomendación de cache
    const cacheHitRate = (stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100;
    if (cacheHitRate < 50) {
      recommendations.push({
        type: 'cache',
        priority: 'high',
        message: 'Low cache hit rate - consider increasing cache size or TTL',
      });
    }

    // Recomendación de queries lentas
    if (stats.slowQueries > stats.totalQueries * 0.1) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'High percentage of slow queries - review indexing strategy',
      });
    }

    // Recomendación de colecciones problemáticas
    for (const [collection, collectionStats] of Object.entries(stats.collections)) {
      if (collectionStats.averageTime > this.optimizationRules.slowQueryThreshold) {
        recommendations.push({
          type: 'collection',
          priority: 'medium',
          message: `Collection ${collection} has high average query time(${collectionStats.averageTime}ms)`,
          collection,
        });
      }
    }

    return recommendations;
  }

  /**
   * Resetear métricas
   */
  resetMetrics() {
    this.metrics = {
      totalQueries: 0,
      optimizedQueries: 0,
      slowQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageQueryTime: 0,
      totalQueryTime: 0,
    };

    this.queryStats.clear();
    this.slowQueries.clear();
    this.queryCache.clear();
  }
}

module.exports = new QueryOptimizationService();
