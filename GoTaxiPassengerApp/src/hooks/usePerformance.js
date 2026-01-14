import { useState, useEffect, useCallback, useRef } from 'react';
import { InteractionManager } from 'react-native';

/**
 * Hook para monitorear y optimizar performance
 */
export const usePerformance = () => {
  const [isReady, setIsReady] = useState(false);
  const [interactionsComplete, setInteractionsComplete] = useState(false);
  const renderStartTime = useRef(0);
  const renderCount = useRef(0);

  // Marcar inicio de render
  const markRenderStart = useCallback(() => {
    renderStartTime.current = Date.now();
  }, []);

  // Marcar fin de render
  const markRenderEnd = useCallback(() => {
    const renderTime = Date.now() - renderStartTime.current;
    renderCount.current += 1;
    // Log de performance en desarrollo
    if (__DEV__ && renderTime > 16) {
      // Más de 16ms indica frame drop
      console.warn(`Slow render detected: ${renderTime}ms (render #${renderCount.current})`);
    }
    return renderTime;
  }, []);

  // Esperar a que las interacciones terminen
  const waitForInteractions = useCallback(() => {
    return new Promise(resolve => {
      InteractionManager.runAfterInteractions(() => {
        setInteractionsComplete(true);
        resolve();
      });
    });
  }, []);

  // Deferir operaciones pesadas
  const deferHeavyOperation = useCallback(operation => {
    return new Promise(resolve => {
      InteractionManager.runAfterInteractions(() => {
        const result = operation();
        resolve(result);
      });
    });
  }, []);

  // Medir tiempo de ejecución de una función
  const measureExecution = useCallback(async(fn, label = 'Operation') => {
    const startTime = Date.now();
    try {
      const result = await fn();
      const endTime = Date.now();
      const duration = endTime - startTime;
      if (__DEV__) {
        // Performance monitoring in development
      }
      return { result, duration };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      if (__DEV__) {
        // Performance monitoring in development
      }
      throw error;
    }
  }, []);

  // Throttle de función
  const useThrottle = useCallback((fn, delay = 300) => {
    const lastCall = useRef(0);
    return useCallback(
      (...args) => {
        const now = Date.now();
        if (now - lastCall.current >= delay) {
          lastCall.current = now;
          return fn(...args);
        }
      },
      [fn, delay],
    );
  }, []);

  // Debounce de función
  const useDebounce = useCallback((fn, delay = 300) => {
    const timeoutRef = useRef(null);
    return useCallback(
      (...args) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          fn(...args);
        }, delay);
      },
      [fn, delay],
    );
  }, []);

  // Memoizar datos pesados
  const useMemoizedData = useCallback((data, dependencies = []) => {
    const memoizedData = useRef(null);
    const lastDeps = useRef(dependencies);
    if (JSON.stringify(dependencies) !== JSON.stringify(lastDeps.current)) {
      memoizedData.current = data;
      lastDeps.current = dependencies;
    }
    return memoizedData.current;
  }, []);

  // Lazy loading de datos
  const useLazyData = useCallback((loadFn, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadData = useCallback(async() => {
      setLoading(true);
      setError(null);
      try {
        const result = await loadFn();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, dependencies);

    return { data, loading, error, loadData };
  }, []);

  // Inicializar cuando el componente esté listo
  useEffect(() => {
    const init = async() => {
      await waitForInteractions();
      setIsReady(true);
    };
    init();
  }, [waitForInteractions]);

  return {
    isReady,
    interactionsComplete,
    markRenderStart,
    markRenderEnd,
    waitForInteractions,
    deferHeavyOperation,
    measureExecution,
    useThrottle,
    useDebounce,
    useMemoizedData,
    useLazyData,
  };
};

export default usePerformance;
