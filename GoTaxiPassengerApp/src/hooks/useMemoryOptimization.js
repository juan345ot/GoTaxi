import { useState, useCallback, useRef, useEffect } from 'react';
import { useThrottle, useDebounce } from './usePerformanceOptimization';

/**
 * Hook para optimizar el rendimiento de la memoria
 * Incluye gestión de memoria, cache, y optimizaciones de GC
 */
export const useMemoryOptimization = (options = {}) => {
  const {
    enableMemoryMonitoring = true,
    enableGarbageCollection = true,
    enableMemoryCompression = true,
    enableLazyLoading = true,
    enableMemoryPooling = true,
    maxMemoryUsage = 100 * 1024 * 1024, // 100MB
    gcThreshold = 80 * 1024 * 1024, // 80MB
    compressionThreshold = 50 * 1024 * 1024, // 50MB
    poolSize = 1000,
    enableMemoryLeakDetection = true,
    enableMemoryOptimization = true,
  } = options;

  const [memoryUsage, setMemoryUsage] = useState(0);
  const [memoryPressure, setMemoryPressure] = useState('normal'); // normal, high, critical
  const [gcCount, setGcCount] = useState(0);
  const [compressionCount, setCompressionCount] = useState(0);
  const [leakCount, setLeakCount] = useState(0);
  const [stats, setStats] = useState({
    totalAllocations: 0,
    totalDeallocations: 0,
    peakMemoryUsage: 0,
    averageMemoryUsage: 0,
    gcFrequency: 0,
  });

  const memoryPool = useRef(new Map());
  const allocatedObjects = useRef(new Set());
  const lastGcTime = useRef(0);
  const memoryHistory = useRef([]);
  const leakDetectionTimeout = useRef(null);

  // Monitorear uso de memoria
  useEffect(() => {
    const monitorMemory = () => {
      if (!enableMemoryMonitoring) return;

      // Simular monitoreo de memoria (en una app real usarías una librería específica)
      const simulatedUsage = Math.random() * maxMemoryUsage;
      setMemoryUsage(simulatedUsage);

      // Actualizar historial
      memoryHistory.current.push(simulatedUsage);
      if (memoryHistory.current.length > 100) {
        memoryHistory.current.shift();
      }

      // Calcular presión de memoria
      if (simulatedUsage > maxMemoryUsage * 0.9) {
        setMemoryPressure('critical');
      } else if (simulatedUsage > maxMemoryUsage * 0.7) {
        setMemoryPressure('high');
      } else {
        setMemoryPressure('normal');
      }

      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        peakMemoryUsage: Math.max(prev.peakMemoryUsage, simulatedUsage),
        averageMemoryUsage: memoryHistory.current.reduce((a, b) => a + b, 0) / memoryHistory.current.length,
      }));

      // Trigger GC si es necesario
      if (simulatedUsage > gcThreshold && enableGarbageCollection) {
        triggerGarbageCollection();
      }

      // Trigger compresión si es necesario
      if (simulatedUsage > compressionThreshold && enableMemoryCompression) {
        triggerMemoryCompression();
      }
    };

    const interval = setInterval(monitorMemory, 1000);
    return () => clearInterval(interval);
  }, [
    enableMemoryMonitoring,
    maxMemoryUsage,
    gcThreshold,
    compressionThreshold,
    enableGarbageCollection,
    enableMemoryCompression,
  ]);

  // Detectar memory leaks
  useEffect(() => {
    if (!enableMemoryLeakDetection) return;

    const detectLeaks = () => {
      // Simular detección de leaks
      if (Math.random() > 0.99) {
        setLeakCount(prev => prev + 1);
        console.warn('Potential memory leak detected');
      }
    };

    const interval = setInterval(detectLeaks, 5000);
    return () => clearInterval(interval);
  }, [enableMemoryLeakDetection]);

  // Trigger garbage collection
  const triggerGarbageCollection = useCallback(() => {
    if (!enableGarbageCollection) return;

    const now = Date.now();
    if (now - lastGcTime.current < 5000) return; // Máximo cada 5 segundos

    lastGcTime.current = now;
    setGcCount(prev => prev + 1);

    // Limpiar objetos no utilizados
    allocatedObjects.current.clear();

    // Limpiar pool de memoria
    if (memoryPool.current.size > poolSize) {
      const entries = Array.from(memoryPool.current.entries());
      const toDelete = entries.slice(0, entries.length - poolSize);
      toDelete.forEach(([key]) => memoryPool.current.delete(key));
    }

    // Forzar GC si está disponible
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }

    console.log('Garbage collection triggered');
  }, [enableGarbageCollection, poolSize]);

  // Trigger memory compression
  const triggerMemoryCompression = useCallback(() => {
    if (!enableMemoryCompression) return;

    setCompressionCount(prev => prev + 1);

    // Comprimir datos en el pool
    const compressedPool = new Map();
    memoryPool.current.forEach((value, key) => {
      try {
        const compressed = JSON.stringify(value);
        compressedPool.set(key, compressed);
      } catch (error) {
        console.error('Error compressing memory:', error);
        compressedPool.set(key, value);
      }
    });
    memoryPool.current = compressedPool;

    console.log('Memory compression triggered');
  }, [enableMemoryCompression]);

  // Allocate memory
  const allocateMemory = useCallback((key, data) => {
    if (!enableMemoryOptimization) return data;

    // Verificar límite de memoria
    if (memoryUsage > maxMemoryUsage * 0.9) {
      triggerGarbageCollection();
    }

    // Guardar en pool
    if (enableMemoryPooling) {
      memoryPool.current.set(key, data);
    }

    // Registrar asignación
    allocatedObjects.current.add(key);
    setStats(prev => ({
      ...prev,
      totalAllocations: prev.totalAllocations + 1,
    }));

    return data;
  }, [
    enableMemoryOptimization,
    memoryUsage,
    maxMemoryUsage,
    enableMemoryPooling,
    triggerGarbageCollection,
  ]);

  // Deallocate memory
  const deallocateMemory = useCallback((key) => {
    if (!enableMemoryOptimization) return;

    // Remover del pool
    if (enableMemoryPooling) {
      memoryPool.current.delete(key);
    }

    // Registrar desasignación
    allocatedObjects.current.delete(key);
    setStats(prev => ({
      ...prev,
      totalDeallocations: prev.totalDeallocations + 1,
    }));
  }, [enableMemoryOptimization, enableMemoryPooling]);

  // Get from memory pool
  const getFromMemoryPool = useCallback((key) => {
    if (!enableMemoryPooling) return null;

    const data = memoryPool.current.get(key);
    if (data) {
      try {
        // Intentar descomprimir si está comprimido
        return typeof data === 'string' ? JSON.parse(data) : data;
      } catch (error) {
        console.error('Error decompressing memory:', error);
        return data;
      }
    }
    return null;
  }, [enableMemoryPooling]);

  // Lazy load data
  const lazyLoad = useCallback(async(key, loader) => {
    if (!enableLazyLoading) return loader();

    // Verificar si ya está en memoria
    const cached = getFromMemoryPool(key);
    if (cached) return cached;

    // Cargar datos
    const data = await loader();

    // Allocate memory
    allocateMemory(key, data);

    return data;
  }, [enableLazyLoading, getFromMemoryPool, allocateMemory]);

  // Optimize data structure
  const optimizeDataStructure = useCallback((data) => {
    if (!enableMemoryOptimization) return data;

    // Aplicar optimizaciones según la presión de memoria
    switch (memoryPressure) {
      case 'critical':
        // Optimizaciones agresivas
        return optimizeAggressively(data);
      case 'high':
        // Optimizaciones moderadas
        return optimizeModerately(data);
      default:
        // Optimizaciones básicas
        return optimizeBasic(data);
    }
  }, [enableMemoryOptimization, memoryPressure]);

  // Optimización básica
  const optimizeBasic = useCallback((data) => {
    if (Array.isArray(data)) {
      return data.filter(Boolean); // Remover valores falsy
    }
    if (typeof data === 'object' && data !== null) {
      const optimized = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          optimized[key] = data[key];
        }
      });
      return optimized;
    }
    return data;
  }, []);

  // Optimización moderada
  const optimizeModerately = useCallback((data) => {
    const basic = optimizeBasic(data);

    if (Array.isArray(basic)) {
      return basic.slice(0, 100); // Limitar a 100 elementos
    }

    return basic;
  }, [optimizeBasic]);

  // Optimización agresiva
  const optimizeAggressively = useCallback((data) => {
    const moderate = optimizeModerately(data);

    if (Array.isArray(moderate)) {
      return moderate.slice(0, 50); // Limitar a 50 elementos
    }

    if (typeof moderate === 'object' && moderate !== null) {
      // Mantener solo las propiedades más importantes
      const importantKeys = Object.keys(moderate).slice(0, 10);
      const optimized = {};
      importantKeys.forEach(key => {
        optimized[key] = moderate[key];
      });
      return optimized;
    }

    return moderate;
  }, [optimizeModerately]);

  // Throttle para operaciones de memoria
  const throttledOperation = useThrottle((operation) => {
    if (memoryPressure === 'critical') {
      // Ejecutar con menor frecuencia en modo crítico
      return operation();
    }
    return operation();
  }, memoryPressure === 'critical' ? 1000 : 100);

  // Debounce para operaciones de UI
  const debouncedOperation = useDebounce((operation) => {
    return operation();
  }, memoryPressure === 'critical' ? 500 : 300);

  // Clear memory
  const clearMemory = useCallback(() => {
    memoryPool.current.clear();
    allocatedObjects.current.clear();
    memoryHistory.current = [];
    setGcCount(0);
    setCompressionCount(0);
    setLeakCount(0);
    setStats({
      totalAllocations: 0,
      totalDeallocations: 0,
      peakMemoryUsage: 0,
      averageMemoryUsage: 0,
      gcFrequency: 0,
    });
    console.log('Memory cleared');
  }, []);

  // Get memory stats
  const getMemoryStats = useCallback(() => {
    return {
      currentUsage: memoryUsage,
      pressure: memoryPressure,
      gcCount,
      compressionCount,
      leakCount,
      poolSize: memoryPool.current.size,
      allocatedObjects: allocatedObjects.current.size,
      ...stats,
    };
  }, [memoryUsage, memoryPressure, gcCount, compressionCount, leakCount, stats]);

  // Efecto para limpieza automática
  useEffect(() => {
    const interval = setInterval(() => {
      if (memoryUsage > maxMemoryUsage * 0.8) {
        triggerGarbageCollection();
      }
    }, 10000); // Verificar cada 10 segundos

    return () => clearInterval(interval);
  }, [memoryUsage, maxMemoryUsage, triggerGarbageCollection]);

  return {
    memoryUsage,
    memoryPressure,
    gcCount,
    compressionCount,
    leakCount,
    stats: getMemoryStats(),
    allocateMemory,
    deallocateMemory,
    getFromMemoryPool,
    lazyLoad,
    optimizeDataStructure,
    throttledOperation,
    debouncedOperation,
    clearMemory,
    triggerGarbageCollection,
    triggerMemoryCompression,
  };
};
