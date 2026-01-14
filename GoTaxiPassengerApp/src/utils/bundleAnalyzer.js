/**
 * Utilidad para analizar el tamaño de los bundles y chunks
 * Ayuda a optimizar el code splitting y lazy loading
 */

class BundleAnalyzer {
  constructor() {
    this.chunks = new Map();
    this.loadTimes = new Map();
    this.errors = new Map();
    this.preloadStats = new Map();
  }

  /**
   * Registrar un chunk cargado
   * @param {string} chunkName - Nombre del chunk
   * @param {number} size - Tamaño en bytes
   * @param {number} loadTime - Tiempo de carga en ms
   */
  recordChunk(chunkName, size, loadTime) {
    this.chunks.set(chunkName, {
      size,
      loadTime,
      timestamp: Date.now(),
    });
  }

  /**
   * Registrar un error de carga
   * @param {string} chunkName - Nombre del chunk
   * @param {Error} error - Error ocurrido
   */
  recordError(chunkName, error) {
    this.errors.set(chunkName, {
      error: error.message,
      timestamp: Date.now(),
    });
  }

  /**
   * Registrar estadísticas de precarga
   * @param {string} chunkName - Nombre del chunk
   * @param {boolean} success - Si la precarga fue exitosa
   * @param {number} preloadTime - Tiempo de precarga en ms
   */
  recordPreload(chunkName, success, preloadTime) {
    this.preloadStats.set(chunkName, {
      success,
      preloadTime,
      timestamp: Date.now(),
    });
  }

  /**
   * Obtener estadísticas de un chunk específico
   * @param {string} chunkName - Nombre del chunk
   * @returns {Object} Estadísticas del chunk
   */
  getChunkStats(chunkName) {
    const chunk = this.chunks.get(chunkName);
    const error = this.errors.get(chunkName);
    const preload = this.preloadStats.get(chunkName);

    return {
      chunk,
      error,
      preload,
      exists: !!chunk,
      hasError: !!error,
      wasPreloaded: !!preload,
    };
  }

  /**
   * Obtener estadísticas generales
   * @returns {Object} Estadísticas generales
   */
  getOverallStats() {
    const totalChunks = this.chunks.size;
    const totalErrors = this.errors.size;
    const totalPreloaded = this.preloadStats.size;
    const successfulPreloads = Array.from(this.preloadStats.values())
      .filter(stat => stat.success).length;

    const totalSize = Array.from(this.chunks.values())
      .reduce((sum, chunk) => sum + chunk.size, 0);

    const averageLoadTime = Array.from(this.chunks.values())
      .reduce((sum, chunk) => sum + chunk.loadTime, 0) / totalChunks;

    const averagePreloadTime = Array.from(this.preloadStats.values())
      .reduce((sum, stat) => sum + stat.preloadTime, 0) / totalPreloaded;

    return {
      totalChunks,
      totalErrors,
      totalPreloaded,
      successfulPreloads,
      totalSize,
      averageLoadTime: averageLoadTime || 0,
      averagePreloadTime: averagePreloadTime || 0,
      errorRate: totalChunks > 0 ? (totalErrors / totalChunks) * 100 : 0,
      preloadSuccessRate: totalPreloaded > 0 ? (successfulPreloads / totalPreloaded) * 100 : 0,
    };
  }

  /**
   * Obtener chunks más pesados
   * @param {number} limit - Número máximo de chunks a retornar
   * @returns {Array} Array de chunks ordenados por tamaño
   */
  getLargestChunks(limit = 10) {
    return Array.from(this.chunks.entries())
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, limit)
      .map(([name, stats]) => ({
        name,
        size: stats.size,
        loadTime: stats.loadTime,
        sizeKB: Math.round(stats.size / 1024 * 100) / 100,
      }));
  }

  /**
   * Obtener chunks más lentos
   * @param {number} limit - Número máximo de chunks a retornar
   * @returns {Array} Array de chunks ordenados por tiempo de carga
   */
  getSlowestChunks(limit = 10) {
    return Array.from(this.chunks.entries())
      .sort((a, b) => b[1].loadTime - a[1].loadTime)
      .slice(0, limit)
      .map(([name, stats]) => ({
        name,
        size: stats.size,
        loadTime: stats.loadTime,
        sizeKB: Math.round(stats.size / 1024 * 100) / 100,
      }));
  }

  /**
   * Obtener chunks con errores
   * @returns {Array} Array de chunks con errores
   */
  getChunksWithErrors() {
    return Array.from(this.errors.entries()).map(([name, error]) => ({
      name,
      error: error.error,
      timestamp: error.timestamp,
    }));
  }

  /**
   * Generar reporte de optimización
   * @returns {Object} Reporte de optimización
   */
  generateOptimizationReport() {
    const stats = this.getOverallStats();
    const largestChunks = this.getLargestChunks(5);
    const slowestChunks = this.getSlowestChunks(5);
    const errorChunks = this.getChunksWithErrors();

    const recommendations = [];

    // Recomendaciones basadas en el tamaño
    if (stats.totalSize > 1024 * 1024) { // > 1MB
      recommendations.push({
        type: 'size',
        message: 'El bundle total es muy grande. Considera dividir en más chunks.',
        priority: 'high',
      });
    }

    // Recomendaciones basadas en chunks individuales
    largestChunks.forEach(chunk => {
      if (chunk.sizeKB > 500) { // > 500KB
        recommendations.push({
          type: 'chunk_size',
          message: `El chunk "${chunk.name}" es muy grande (${chunk.sizeKB}KB). Considera dividirlo.`,
          priority: 'medium',
          chunk: chunk.name,
        });
      }
    });

    // Recomendaciones basadas en tiempo de carga
    slowestChunks.forEach(chunk => {
      if (chunk.loadTime > 3000) { // > 3 segundos
        recommendations.push({
          type: 'load_time',
          message: `El chunk "${chunk.name}" tarda mucho en cargar (${chunk.loadTime}ms). Considera optimizarlo.`,
          priority: 'medium',
          chunk: chunk.name,
        });
      }
    });

    // Recomendaciones basadas en errores
    if (stats.errorRate > 10) { // > 10% de errores
      recommendations.push({
        type: 'errors',
        message: `Tasa de errores alta (${stats.errorRate.toFixed(1)}%). Revisa la configuración de chunks.`,
        priority: 'high',
      });
    }

    return {
      stats,
      largestChunks,
      slowestChunks,
      errorChunks,
      recommendations,
      summary: {
        totalChunks: stats.totalChunks,
        totalSizeKB: Math.round(stats.totalSize / 1024 * 100) / 100,
        averageLoadTime: Math.round(stats.averageLoadTime),
        errorRate: Math.round(stats.errorRate * 100) / 100,
        preloadSuccessRate: Math.round(stats.preloadSuccessRate * 100) / 100,
      },
    };
  }

  /**
   * Limpiar estadísticas
   */
  clear() {
    this.chunks.clear();
    this.loadTimes.clear();
    this.errors.clear();
    this.preloadStats.clear();
  }

  /**
   * Exportar estadísticas para análisis
   * @returns {Object} Estadísticas exportables
   */
  export() {
    return {
      chunks: Object.fromEntries(this.chunks),
      errors: Object.fromEntries(this.errors),
      preloadStats: Object.fromEntries(this.preloadStats),
      timestamp: Date.now(),
    };
  }
}

// Instancia global del analizador
const bundleAnalyzer = new BundleAnalyzer();

export default bundleAnalyzer;
export { BundleAnalyzer };
