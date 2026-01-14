import { useState, useCallback, useRef, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useDebounce, useThrottle } from './usePerformanceOptimization';

/**
 * Hook para optimizar el rendimiento de la red
 * Incluye retry, cache, y optimizaciones de conexión
 */
export const useNetworkOptimization = (options = {}) => {
  const {
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    enableCaching = true,
    cacheTimeout = 300000, // 5 minutos
    enableOfflineMode = true,
    enableCompression = true,
    enableBatchRequests = true,
    batchSize = 10,
    enableRequestDeduplication = true,
    enableAdaptiveTimeout = true,
    baseTimeout = 10000,
  } = options;

  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [cache, setCache] = useState(new Map());
  const [pendingRequests, setPendingRequests] = useState(new Map());
  const [stats, setStats] = useState({
    requests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    retries: 0,
    errors: 0,
    avgResponseTime: 0,
  });

  const cacheRef = useRef(cache);
  const pendingRequestsRef = useRef(pendingRequests);
  const responseTimesRef = useRef([]);

  // Monitorear conexión de red
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setIsSlowConnection(state.isConnected && state.isInternetReachable === false);
    });

    return () => unsubscribe();
  }, []);

  // Calcular timeout adaptativo
  const getAdaptiveTimeout = useCallback((baseTimeout) => {
    if (!enableAdaptiveTimeout) return baseTimeout;

    const multiplier = isSlowConnection ? 2 : 1;
    const connectionMultiplier = connectionType === 'cellular' ? 1.5 : 1;

    return baseTimeout * multiplier * connectionMultiplier;
  }, [enableAdaptiveTimeout, isSlowConnection, connectionType]);

  // Obtener del cache
  const getFromCache = useCallback((key) => {
    if (!enableCaching) return null;

    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      setStats(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
      return cached.data;
    }

    setStats(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
    return null;
  }, [enableCaching, cacheTimeout]);

  // Guardar en cache
  const setToCache = useCallback((key, data) => {
    if (!enableCaching) return;

    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };

    cacheRef.current.set(key, cacheEntry);
    setCache(new Map(cacheRef.current));
  }, [enableCaching]);

  // Generar clave de cache
  const generateCacheKey = useCallback((url, options) => {
    return `${url}-${JSON.stringify(options)}`;
  }, []);

  // Retry con backoff exponencial
  const retryWithBackoff = useCallback(async(fn, retries = maxRetries) => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && enableRetry) {
        const delay = retryDelay * Math.pow(2, maxRetries - retries);
        await new Promise(resolve => setTimeout(resolve, delay));

        setStats(prev => ({ ...prev, retries: prev.retries + 1 }));
        return retryWithBackoff(fn, retries - 1);
      }
      throw error;
    }
  }, [maxRetries, enableRetry, retryDelay]);

  // Request HTTP optimizado
  const makeRequest = useCallback(async(url, options = {}) => {
    const {
      method = 'GET',
      headers = {},
      body,
      useCache = true,
      timeout = baseTimeout,
      ...requestOptions
    } = options;

    const startTime = Date.now();
    const cacheKey = generateCacheKey(url, options);

    // Verificar cache
    if (useCache && method === 'GET') {
      const cached = getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Verificar si ya hay una request pendiente
    if (enableRequestDeduplication && pendingRequestsRef.current.has(cacheKey)) {
      return pendingRequestsRef.current.get(cacheKey);
    }

    // Crear promise de request
    const requestPromise = retryWithBackoff(async() => {
      const adaptiveTimeout = getAdaptiveTimeout(timeout);

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), adaptiveTimeout) : null;

      try {
        const response = await (typeof fetch !== 'undefined' ? fetch : global.fetch)(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller?.signal,
          ...requestOptions,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Guardar en cache
        if (useCache && method === 'GET') {
          setToCache(cacheKey, data);
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    });

    // Guardar request pendiente
    if (enableRequestDeduplication) {
      pendingRequestsRef.current.set(cacheKey, requestPromise);
    }

    try {
      const result = await requestPromise;

      // Actualizar estadísticas
      const responseTime = Date.now() - startTime;
      responseTimesRef.current.push(responseTime);

      // Mantener solo los últimos 100 tiempos de respuesta
      if (responseTimesRef.current.length > 100) {
        responseTimesRef.current.shift();
      }

      const avgResponseTime = responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length;

      setStats(prev => ({
        ...prev,
        requests: prev.requests + 1,
        avgResponseTime,
      }));

      return result;
    } catch (error) {
      setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
      throw error;
    } finally {
      // Limpiar request pendiente
      if (enableRequestDeduplication) {
        pendingRequestsRef.current.delete(cacheKey);
      }
    }
  }, [
    baseTimeout,
    generateCacheKey,
    getFromCache,
    setToCache,
    retryWithBackoff,
    enableRequestDeduplication,
    getAdaptiveTimeout,
  ]);

  // Throttle para requests
  const throttledRequest = useThrottle(makeRequest, 100);

  // Debounce para búsquedas
  const debouncedRequest = useDebounce(makeRequest, 300);

  // Batch requests
  const batchRequest = useCallback(async(requests) => {
    if (!enableBatchRequests) {
      return Promise.all(requests.map(req => makeRequest(req.url, req.options)));
    }

    const results = [];
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(req => makeRequest(req.url, req.options)),
      );
      results.push(...batchResults);
    }
    return results;
  }, [enableBatchRequests, batchSize, makeRequest]);

  // Limpiar cache
  const clearCache = useCallback(() => {
    setCache(new Map());
    cacheRef.current.clear();
    setStats(prev => ({
      ...prev,
      cacheHits: 0,
      cacheMisses: 0,
    }));
  }, []);

  // Limpiar requests pendientes
  const clearPendingRequests = useCallback(() => {
    setPendingRequests(new Map());
    pendingRequestsRef.current.clear();
  }, []);

  // Obtener estadísticas
  const getStats = useCallback(() => {
    const hitRate = stats.cacheHits / (stats.cacheHits + stats.cacheMisses) || 0;
    const errorRate = stats.errors / stats.requests || 0;

    return {
      ...stats,
      hitRate,
      errorRate,
      cacheSize: cacheRef.current.size,
      pendingRequests: pendingRequestsRef.current.size,
    };
  }, [stats]);

  // Efecto para limpieza automática
  useEffect(() => {
    const interval = setInterval(() => {
      // Limpiar cache expirado
      const now = Date.now();
      const newCache = new Map();

      cacheRef.current.forEach((value, key) => {
        if (now - value.timestamp < cacheTimeout) {
          newCache.set(key, value);
        }
      });

      setCache(newCache);
    }, 60000); // Limpiar cada minuto

    return () => clearInterval(interval);
  }, [cacheTimeout]);

  return {
    isConnected,
    connectionType,
    isSlowConnection,
    stats: getStats(),
    makeRequest: throttledRequest,
    makeDebouncedRequest: debouncedRequest,
    batchRequest,
    clearCache,
    clearPendingRequests,
    getFromCache,
    setToCache,
  };
};
