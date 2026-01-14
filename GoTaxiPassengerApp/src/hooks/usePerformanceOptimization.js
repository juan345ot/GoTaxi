import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppState, Dimensions } from 'react-native';

/**
 * Hook para optimización de rendimiento del frontend
 * Incluye lazy loading, memoización, y optimizaciones de memoria
 */
export const usePerformanceOptimization = (props = {}, options = {}) => {
  const {
    enableLazyLoading = true,
    enableMemoization = true,
    enableVirtualization = false,
    enablePreloading = false,
    preloadThreshold = 1000,
    memoryThreshold = 100 * 1024 * 1024, // 100MB
  } = options;

  const [isVisible, setIsVisible] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  const renderCountRef = useRef(0);
  const renderTimesRef = useRef([]);
  const lastRenderTimeRef = useRef(0);

  // Monitorear el estado de la aplicación
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);

      // Pausar optimizaciones cuando la app está en background
      if (nextAppState === 'background') {
        setIsVisible(false);
      } else if (nextAppState === 'active') {
        setIsVisible(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Monitorear el uso de memoria
  useEffect(() => {
    const checkMemoryUsage = () => {
      if (typeof global !== 'undefined' && global.performance && global.performance.memory) {
        const memory = global.performance.memory;
        const usedMemory = memory.usedJSHeapSize;
        setMemoryUsage(usedMemory);

        // Limpiar cache si el uso de memoria es alto
        if (usedMemory > memoryThreshold) {
          console.warn('High memory usage detected, clearing cache...');
          if (typeof global !== 'undefined' && global.gc) {
            global.gc();
          }
        }
      }
    };

    const interval = setInterval(checkMemoryUsage, 5000);
    return () => clearInterval(interval);
  }, [memoryThreshold]);

  // Medir tiempo de renderizado
  const measureRender = useCallback(() => {
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const renderTime = now - lastRenderTimeRef.current;

    renderCountRef.current += 1;
    renderTimesRef.current.push(renderTime);

    // Mantener solo los últimos 10 tiempos de renderizado
    if (renderTimesRef.current.length > 10) {
      renderTimesRef.current.shift();
    }

    const averageRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;

    setPerformanceMetrics({
      renderCount: renderCountRef.current,
      lastRenderTime: renderTime,
      averageRenderTime,
    });

    lastRenderTimeRef.current = now;
  }, []);

  // Optimizar props con memoización
  const optimizedProps = useMemo(() => {
    if (!enableMemoization) return props;

    // Filtrar props que no han cambiado
    const memoizedProps = {};
    Object.keys(props).forEach(key => {
      const value = props[key];
      if (typeof value === 'function') {
        // Memoizar funciones
        memoizedProps[key] = useCallback(value, []);
      } else if (typeof value === 'object' && value !== null) {
        // Memoizar objetos
        memoizedProps[key] = useMemo(() => value, [JSON.stringify(value)]);
      } else {
        memoizedProps[key] = value;
      }
    });

    return memoizedProps;
  }, [props, enableMemoization]);

  // Lazy loading de componentes
  const shouldLazyLoad = useCallback((componentName) => {
    if (!enableLazyLoading) return false;

    // No lazy load si la app está en background
    if (appState !== 'active') return false;

    // No lazy load si el uso de memoria es alto
    if (memoryUsage > memoryThreshold) return false;

    return true;
  }, [enableLazyLoading, appState, memoryUsage, memoryThreshold]);

  // Preloading de componentes
  const shouldPreload = useCallback((componentName) => {
    if (!enablePreloading) return false;

    // Solo preload si la app está activa
    if (appState !== 'active') return false;

    // Solo preload si el uso de memoria es bajo
    if (memoryUsage > memoryThreshold * 0.8) return false;

    return true;
  }, [enablePreloading, appState, memoryUsage, memoryThreshold]);

  // Optimización de listas virtuales
  const getVirtualizationConfig = useCallback((itemCount, itemHeight) => {
    if (!enableVirtualization) return null;

    const screenHeight = Dimensions.get('window').height;
    const visibleItems = Math.ceil(screenHeight / itemHeight) + 2; // Buffer de 2 items

    return {
      itemCount,
      itemHeight,
      visibleItems,
      overscan: 5, // Items adicionales para scroll suave
    };
  }, [enableVirtualization]);

  // Limpiar recursos cuando no es visible
  useEffect(() => {
    if (!isVisible) {
      // Limpiar timers, listeners, etc.
      renderTimesRef.current = [];
      renderCountRef.current = 0;
    }
  }, [isVisible]);

  // Retornar configuración de optimización
  return {
    isVisible,
    appState,
    memoryUsage,
    performanceMetrics,
    optimizedProps,
    shouldLazyLoad,
    shouldPreload,
    getVirtualizationConfig,
    measureRender,
    isMemoryHigh: memoryUsage > memoryThreshold,
    isPerformanceGood: performanceMetrics.averageRenderTime < 16, // 60fps
  };
};

/**
 * Hook para virtualización de listas
 * Optimiza el rendimiento de listas grandes
 */
export const useVirtualizedList = (items = [], options = {}) => {
  const {
    itemHeight = 50,
    overscan = 5,
    enableVirtualization = true,
  } = options;

  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const visibleItems = useMemo(() => {
    if (!enableVirtualization || containerHeight === 0) {
      return items;
    }

    const startIndex = Math.floor(scrollOffset / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length,
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      offset: (startIndex + index) * itemHeight,
    }));
  }, [items, scrollOffset, containerHeight, itemHeight, overscan, enableVirtualization]);

  const totalHeight = items.length * itemHeight;
  const offsetY = scrollOffset;

  const handleScroll = useCallback((event) => {
    const offset = event.nativeEvent.contentOffset.y;
    setScrollOffset(offset);
    setIsScrolling(true);

    // Debounce para mejorar rendimiento
    setTimeout(() => setIsScrolling(false), 150);
  }, []);

  const handleLayout = useCallback((event) => {
    setContainerHeight(event.nativeEvent.layout.height);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    handleLayout,
    isScrolling,
    itemHeight,
  };
};

/**
 * Hook para debouncing de funciones
 * Evita llamadas excesivas a funciones costosas
 */
export const useDebounce = (callback, delay = 300) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Hook para throttling de funciones
 * Limita la frecuencia de ejecución de funciones
 */
export const useThrottle = (callback, delay = 100) => {
  const lastCallRef = useRef(0);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();

    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    }
  }, [callback, delay]);

  return throttledCallback;
};

export default usePerformanceOptimization;
