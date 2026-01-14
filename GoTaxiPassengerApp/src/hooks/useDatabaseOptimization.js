import { useState, useCallback, useRef, useEffect } from 'react';
import { useDebounce, useThrottle } from './usePerformanceOptimization';

/**
 * Hook para optimizar el rendimiento de la base de datos local
 * Incluye paginación, cache, y optimizaciones de consultas
 */
export const useDatabaseOptimization = (options = {}) => {
  const {
    enablePagination: _enablePagination = true, // Reservado para uso futuro
    pageSize = 20,
    enableCaching = true,
    cacheSize = 1000,
    cacheTimeout = 300000, // 5 minutos
    enableLazyLoading: _enableLazyLoading = true, // Reservado para uso futuro
    enableBatchOperations: _enableBatchOperations = true, // Reservado para uso futuro
    batchSize = 50,
    enableIndexing = true,
    enableCompression = true,
  } = options;

  const [cache, setCache] = useState(new Map());
  const [indexes, setIndexes] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    evictions: 0,
    queries: 0,
  });

  const cacheRef = useRef(cache);
  const indexesRef = useRef(indexes);
  const lastCleanupTime = useRef(0);

  // Limpiar cache expirado
  const cleanupExpiredCache = useCallback(() => {
    const now = Date.now();
    if (now - lastCleanupTime.current < 60000) return; // Limpiar cada minuto

    lastCleanupTime.current = now;
    const newCache = new Map();
    let evictions = 0;

    cacheRef.current.forEach((value, key) => {
      if (now - value.timestamp < cacheTimeout) {
        newCache.set(key, value);
      } else {
        evictions++;
      }
    });

    setCache(newCache);
    setStats(prev => ({
      ...prev,
      evictions: prev.evictions + evictions,
    }));
  }, [cacheTimeout]);

  // Obtener del cache
  const getFromCache = useCallback((key) => {
    if (!enableCaching) return null;

    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      setStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return cached.data;
    }

    setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    return null;
  }, [enableCaching, cacheTimeout]);

  // Guardar en cache
  const setToCache = useCallback((key, data) => {
    if (!enableCaching) return;

    const now = Date.now();
    const cacheEntry = {
      data,
      timestamp: now,
    };

    // Si el cache está lleno, eliminar el más antiguo
    if (cacheRef.current.size >= cacheSize) {
      const firstKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(firstKey);
    }

    cacheRef.current.set(key, cacheEntry);
    setCache(new Map(cacheRef.current));
  }, [enableCaching, cacheSize]);

  // Crear índice
  const createIndex = useCallback((field, data) => {
    if (!enableIndexing) return;

    const index = new Map();
    data.forEach((item, idx) => {
      const value = item[field];
      if (value !== undefined && value !== null) {
        if (!index.has(value)) {
          index.set(value, []);
        }
        index.get(value).push(idx);
      }
    });

    indexesRef.current.set(field, index);
    setIndexes(new Map(indexesRef.current));
  }, [enableIndexing]);

  // Buscar en índice
  const searchIndex = useCallback((field, value) => {
    if (!enableIndexing) return null;

    const index = indexesRef.current.get(field);
    if (!index) return null;

    return index.get(value) || [];
  }, [enableIndexing]);

  // Paginación
  const paginate = useCallback((data, page = 1, size = pageSize) => {
    if (!enablePagination) return { data, totalPages: 1, currentPage: 1 };

    const start = (page - 1) * size;
    const end = start + size;
    const paginatedData = data.slice(start, end);
    const totalPages = Math.ceil(data.length / size);

    return {
      data: paginatedData,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }, [enablePagination, pageSize]);

  // Búsqueda optimizada
  const search = useCallback((data, query, fields = []) => {
    if (!query) return data;

    const lowerQuery = query.toLowerCase();
    const searchFields = fields.length > 0 ? fields : Object.keys(data[0] || {});

    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerQuery);
        }
        if (typeof value === 'number') {
          return value.toString().includes(query);
        }
        return false;
      });
    });
  }, []);

  // Ordenamiento optimizado
  const sort = useCallback((data, field, direction = 'asc') => {
    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, []);

  // Operaciones en lote
  const batchOperation = useCallback(async(operation, data, batchSize = batchSize) => {
    if (!enableBatchOperations) {
      return operation(data);
    }

    const results = [];
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const result = await operation(batch);
      results.push(result);
    }
    return results;
  }, [enableBatchOperations, batchSize]);

  // Compresión de datos
  const compress = useCallback((data) => {
    if (!enableCompression) return data;

    try {
      // Implementar compresión simple (en una app real usarías una librería de compresión)
      return JSON.stringify(data);
    } catch (error) {
      console.error('Error compressing data:', error);
      return data;
    }
  }, [enableCompression]);

  // Descompresión de datos
  const decompress = useCallback((compressedData) => {
    if (!enableCompression) return compressedData;

    try {
      return JSON.parse(compressedData);
    } catch (error) {
      console.error('Error decompressing data:', error);
      return compressedData;
    }
  }, [enableCompression]);

  // Consulta optimizada
  const query = useCallback(async(data, options = {}) => {
    const {
      search: searchQuery,
      fields,
      sort: sortField,
      sortDirection = 'asc',
      page = 1,
      size = pageSize,
      useCache = true,
    } = options;

    setIsLoading(true);
    setError(null);

    try {
      // Generar clave de cache
      const cacheKey = `query-${JSON.stringify(options)}`;

      // Intentar obtener del cache
      if (useCache) {
        const cached = getFromCache(cacheKey);
        if (cached) {
          setIsLoading(false);
          return cached;
        }
      }

      let result = data;

      // Aplicar búsqueda
      if (searchQuery) {
        result = search(result, searchQuery, fields);
      }

      // Aplicar ordenamiento
      if (sortField) {
        result = sort(result, sortField, sortDirection);
      }

      // Aplicar paginación
      const paginated = paginate(result, page, size);

      // Guardar en cache
      if (useCache) {
        setToCache(cacheKey, paginated);
      }

      setStats(prev => ({ ...prev, queries: prev.queries + 1 }));
      setIsLoading(false);
      return paginated;
    } catch (err) {
      setError(err);
      setIsLoading(false);
      throw err;
    }
  }, [getFromCache, setToCache, search, sort, paginate, pageSize]);

  // Throttle para consultas
  const throttledQuery = useThrottle(query, 100);

  // Debounce para búsquedas
  const debouncedSearch = useDebounce((data, query, fields) => {
    return search(data, query, fields);
  }, 300);

  // Limpiar cache
  const clearCache = useCallback(() => {
    setCache(new Map());
    cacheRef.current.clear();
    setStats(prev => ({
      ...prev,
      hits: 0,
      misses: 0,
      evictions: 0,
    }));
  }, []);

  // Limpiar índices
  const clearIndexes = useCallback(() => {
    setIndexes(new Map());
    indexesRef.current.clear();
  }, []);

  // Obtener estadísticas
  const getStats = useCallback(() => {
    const hitRate = stats.hits / (stats.hits + stats.misses) || 0;
    return {
      ...stats,
      hitRate,
      cacheSize: cacheRef.current.size,
      indexCount: indexesRef.current.size,
    };
  }, [stats]);

  // Efecto para limpieza automática
  useEffect(() => {
    const interval = setInterval(cleanupExpiredCache, 60000); // Limpiar cada minuto
    return () => clearInterval(interval);
  }, [cleanupExpiredCache]);

  return {
    isLoading,
    error,
    stats: getStats(),
    query: throttledQuery,
    search: debouncedSearch,
    sort,
    paginate,
    batchOperation,
    createIndex,
    searchIndex,
    compress,
    decompress,
    clearCache,
    clearIndexes,
    getFromCache,
    setToCache,
  };
};
