import { useState, useCallback, useRef, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useThrottle, useDebounce } from './usePerformanceOptimization';

/**
 * Hook para optimizar el rendimiento de la red
 * Incluye retry, cache, y optimizaciones de conexión
 */
export const useNetworkPerformance = (options = {}) => {
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
    enableConnectionPooling = true,
    maxConnections = 5,
    enableKeepAlive = true,
    keepAliveTimeout = 30000,
    enableRequestQueuing = true,
    maxQueueSize = 100,
    enableRequestOptimization = true,
    enableResponseOptimization = true,
    enableBandwidthOptimization = true,
    enableLatencyOptimization = true,
  } = options;

  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [cache, setCache] = useState(new Map());
  const [pendingRequests, setPendingRequests] = useState(new Map());
  const [requestQueue, setRequestQueue] = useState([]);
  const [connectionPool, setConnectionPool] = useState([]);
  const [stats, setStats] = useState({
    requests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    retries: 0,
    errors: 0,
    avgResponseTime: 0,
    bytesTransferred: 0,
    compressionRatio: 0,
    bandwidthUtilization: 0,
    latency: 0,
  });

  const cacheRef = useRef(cache);
  const pendingRequestsRef = useRef(pendingRequests);
  const requestQueueRef = useRef(requestQueue);
  const responseTimesRef = useRef([]);
  const bytesTransferredRef = useRef(0);
  const bandwidthHistoryRef = useRef([]);
  const latencyHistoryRef = useRef([]);

  // Monitorear conexión de red
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setIsSlowConnection(state.isConnected && state.isInternetReachable === false);
    });

    return () => unsubscribe();
  }, []);

  // Inicializar pool de conexiones
  useEffect(() => {
    if (enableConnectionPooling) {
      const pool = Array.from({ length: maxConnections }, (_, i) => ({
        id: i,
        isActive: false,
        lastUsed: 0,
        keepAlive: false,
        requestCount: 0,
      }));
      setConnectionPool(pool);
    }
  }, [enableConnectionPooling, maxConnections]);

  // Obtener conexión del pool
  const getConnection = useCallback(() => {
    if (!enableConnectionPooling) return null;

    const availableConnection = connectionPool.find(conn => !conn.isActive);
    if (availableConnection) {
      availableConnection.isActive = true;
      availableConnection.lastUsed = Date.now();
      return availableConnection;
    }
    return null;
  }, [enableConnectionPooling, connectionPool]);

  // Liberar conexión
  const releaseConnection = useCallback((connection) => {
    if (!enableConnectionPooling || !connection) return;

    connection.isActive = false;
    if (enableKeepAlive) {
      connection.keepAlive = true;
      setTimeout(() => {
        connection.keepAlive = false;
      }, keepAliveTimeout);
    }
  }, [enableConnectionPooling, enableKeepAlive, keepAliveTimeout]);

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

  // Comprimir datos
  const compressData = useCallback((data) => {
    if (!enableCompression) return data;

    try {
      const jsonString = JSON.stringify(data);
      const compressed = jsonString; // En una app real usarías una librería de compresión
      const ratio = compressed.length / jsonString.length;

      setStats(prev => ({
        ...prev,
        compressionRatio: (prev.compressionRatio + ratio) / 2,
      }));

      return compressed;
    } catch (error) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error compressing data:', error);
      return data;
    }
  }, [enableCompression]);

  // Descomprimir datos
  const decompressData = useCallback((compressedData) => {
    if (!enableCompression) return compressedData;

    try {
      return JSON.parse(compressedData);
    } catch (error) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error decompressing data:', error);
      return compressedData;
    }
  }, [enableCompression]);

  // Optimizar request
  const optimizeRequest = useCallback((url, options) => {
    if (!enableRequestOptimization) return { url, options };

    const optimizedOptions = { ...options };

    // Aplicar optimizaciones según el tipo de conexión
    if (connectionType === 'cellular') {
      // Reducir tamaño de request en conexiones celulares
      if (optimizedOptions.body) {
        optimizedOptions.body = compressData(optimizedOptions.body);
      }
    }

    // Aplicar optimizaciones de latencia
    if (enableLatencyOptimization) {
      // Usar HTTP/2 si está disponible
      optimizedOptions.headers = {
        ...optimizedOptions.headers,
        Connection: 'keep-alive',
      };
    }

    return { url, options: optimizedOptions };
  }, [enableRequestOptimization, connectionType, enableLatencyOptimization, compressData]);

  // Optimizar response
  const optimizeResponse = useCallback((response) => {
    if (!enableResponseOptimization) return response;

    // Aplicar optimizaciones de ancho de banda
    if (enableBandwidthOptimization) {
      // Reducir calidad de imágenes si es necesario
      if (response.headers && response.headers.get('content-type')?.includes('image')) {
        // Aquí podrías implementar lógica para reducir calidad de imagen
      }
    }

    return response;
  }, [enableResponseOptimization, enableBandwidthOptimization]);

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

  // Procesar cola de requests
  const processQueue = useCallback(async() => {
    if (requestQueueRef.current.length === 0) return;

    const request = requestQueueRef.current.shift();
    if (!request) return;

    try {
      const result = await makeRequest(request.url, request.options);
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    }

    // Procesar siguiente request
    if (requestQueueRef.current.length > 0) {
      setTimeout(processQueue, 100);
    }
  }, []);

  // Agregar request a la cola
  const queueRequest = useCallback((url, options) => {
    if (!enableRequestQueuing) {
      return makeRequest(url, options);
    }

    if (requestQueueRef.current.length >= maxQueueSize) {
      throw new Error('Request queue is full');
    }

    return new Promise((resolve, reject) => {
      requestQueueRef.current.push({
        url,
        options,
        resolve,
        reject,
      });

      setRequestQueue([...requestQueueRef.current]);
      processQueue();
    });
  }, [enableRequestQueuing, maxQueueSize, processQueue]);

  // Request HTTP optimizado
  const makeRequest = useCallback(async(url, options = {}) => {
    const {
      method = 'GET',
      headers = {},
      body,
      useCache = true,
      timeout = baseTimeout,
      useConnectionPool = true,
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

    // Obtener conexión
    const connection = useConnectionPool ? getConnection() : null;
    if (useConnectionPool && !connection) {
      throw new Error('No available connections in pool');
    }

    // Crear promise de request
    const requestPromise = retryWithBackoff(async() => {
      const adaptiveTimeout = getAdaptiveTimeout(timeout);

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), adaptiveTimeout) : null;

      try {
        // Optimizar request
        const { url: optimizedUrl, options: optimizedOptions } = optimizeRequest(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? compressData(body) : undefined,
          signal: controller?.signal,
          ...requestOptions,
        });

        const response = await (typeof fetch !== 'undefined' ? fetch : global.fetch)(optimizedUrl, optimizedOptions);

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Optimizar response
        const optimizedResponse = optimizeResponse(response);
        const data = await optimizedResponse.json();

        // Descomprimir datos si es necesario
        const decompressedData = decompressData(data);

        // Guardar en cache
        if (useCache && method === 'GET') {
          setToCache(cacheKey, decompressedData);
        }

        // Actualizar estadísticas
        const responseTime = Date.now() - startTime;
        responseTimesRef.current.push(responseTime);

        if (responseTimesRef.current.length > 100) {
          responseTimesRef.current.shift();
        }

        const avgResponseTime = responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length;

        // Calcular ancho de banda
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          const bytes = parseInt(contentLength);
          bytesTransferredRef.current += bytes;
          bandwidthHistoryRef.current.push(bytes);

          if (bandwidthHistoryRef.current.length > 100) {
            bandwidthHistoryRef.current.shift();
          }

          const avgBandwidth = bandwidthHistoryRef.current.reduce((a, b) => a + b, 0) / bandwidthHistoryRef.current.length;
          setStats(prev => ({ ...prev, bandwidthUtilization: avgBandwidth }));
        }

        // Calcular latencia
        latencyHistoryRef.current.push(responseTime);
        if (latencyHistoryRef.current.length > 100) {
          latencyHistoryRef.current.shift();
        }

        const avgLatency = latencyHistoryRef.current.reduce((a, b) => a + b, 0) / latencyHistoryRef.current.length;

        setStats(prev => ({
          ...prev,
          requests: prev.requests + 1,
          avgResponseTime,
          bytesTransferred: prev.bytesTransferred + (contentLength ? parseInt(contentLength) : 0),
          latency: avgLatency,
        }));

        return decompressedData;
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
      return result;
    } catch (error) {
      setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
      throw error;
    } finally {
      // Liberar conexión
      if (connection) {
        releaseConnection(connection);
      }

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
    optimizeRequest,
    optimizeResponse,
    compressData,
    decompressData,
    getConnection,
    releaseConnection,
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

  // Limpiar cola de requests
  const clearQueue = useCallback(() => {
    setRequestQueue([]);
    requestQueueRef.current = [];
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
      queueSize: requestQueueRef.current.length,
      activeConnections: connectionPool.filter(conn => conn.isActive).length,
    };
  }, [stats, connectionPool]);

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
    makeQueuedRequest: queueRequest,
    batchRequest,
    clearCache,
    clearQueue,
    getFromCache,
    setToCache,
    compressData,
    decompressData,
    optimizeRequest,
    optimizeResponse,
  };
};
