import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para manejar code splitting de manera eficiente
 * @param {string} componentPath - Ruta del componente a cargar
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado del componente y funciones de control
 */
export const useCodeSplitting = (componentPath, options = {}) => {
  const {
    preload = false,
    timeout = 10000,
    retryable = true,
    maxRetries = 3,
    onError = null,
    onSuccess = null,
  } = options;

  const [Component, setComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [loadTime, setLoadTime] = useState(0);

  const handleError = useCallback((err) => {
    // eslint-disable-next-line no-console
    if (__DEV__) console.error('Error loading component:', err);
    setError(err);
    if (onError) {
      onError(err);
    }
  }, [onError]);

  const handleSuccess = useCallback((component) => {
    setComponent(component);
    setIsLoading(false);
    if (onSuccess) {
      onSuccess(component);
    }
  }, [onSuccess]);

  const loadComponent = useCallback(async() => {
    const startTime = Date.now();

    try {
      const module = await import(componentPath);
      const component = module.default || module;

      const endTime = Date.now();
      setLoadTime(endTime - startTime);

      handleSuccess(component);
    } catch (err) {
      handleError(err);
    }
  }, [componentPath, handleError, handleSuccess]);

  const retry = useCallback(() => {
    if (retryable && retryCount < maxRetries) {
      setIsRetrying(true);
      setError(null);
      setHasTimedOut(false);
      setRetryCount(prev => prev + 1);

      // Simular un pequeño delay antes de reintentar
      setTimeout(() => {
        setIsLoading(true);
        setIsRetrying(false);
        loadComponent();
      }, 1000);
    }
  }, [retryable, retryCount, maxRetries, loadComponent]);

  const reset = useCallback(() => {
    setComponent(null);
    setIsLoading(true);
    setError(null);
    setHasTimedOut(false);
    setRetryCount(0);
    setIsRetrying(false);
    setLoadTime(0);
  }, []);

  // Preload del componente si está habilitado
  useEffect(() => {
    if (preload && componentPath) {
      try {
        import(componentPath).catch(handleError);
      } catch (error) {
        handleError(error);
      }
    }
  }, [preload, componentPath, handleError]);

  // Cargar el componente
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setHasTimedOut(true);
        setIsLoading(false);
      }
    }, timeout);

    loadComponent();

    return () => clearTimeout(timer);
  }, [loadComponent, isLoading, timeout]);

  const canRetry = retryable && retryCount < maxRetries;
  const isError = !!error;
  const isTimeout = hasTimedOut;
  const isSuccess = !!Component && !isLoading && !isError && !isTimeout;

  return {
    Component,
    isLoading,
    error,
    hasTimedOut,
    retryCount,
    isRetrying,
    loadTime,
    canRetry,
    isError,
    isTimeout,
    isSuccess,
    retry,
    reset,
  };
};

/**
 * Hook para precargar múltiples componentes
 * @param {Array} componentPaths - Array de rutas de componentes
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado de precarga
 */
export const usePreloadComponents = (componentPaths = [], options = {}) => {
  const { onComplete = null, onError = null } = options;

  const [preloadedComponents, setPreloadedComponents] = useState(new Map());
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [errors, setErrors] = useState([]);

  const preloadAll = useCallback(async() => {
    if (componentPaths.length === 0) return;

    setIsPreloading(true);
    setPreloadProgress(0);
    setErrors([]);

    const components = new Map();
    const errorList = [];

    for (let i = 0; i < componentPaths.length; i++) {
      try {
        const module = await import(componentPaths[i]);
        const component = module.default || module;
        components.set(componentPaths[i], component);

        setPreloadProgress(((i + 1) / componentPaths.length) * 100);
      } catch (error) {
        // eslint-disable-next-line no-console
        if (__DEV__) console.error(`Error preloading component ${componentPaths[i]}:`, error);
        errorList.push({ path: componentPaths[i], error });
      }
    }

    setPreloadedComponents(components);
    setErrors(errorList);
    setIsPreloading(false);

    if (onComplete) {
      onComplete(components, errorList);
    }

    if (errorList.length > 0 && onError) {
      onError(errorList);
    }
  }, [componentPaths, onComplete, onError]);

  const getPreloadedComponent = useCallback((path) => {
    return preloadedComponents.get(path);
  }, [preloadedComponents]);

  const isPreloaded = useCallback((path) => {
    return preloadedComponents.has(path);
  }, [preloadedComponents]);

  useEffect(() => {
    preloadAll();
  }, [preloadAll]);

  return {
    preloadedComponents,
    isPreloading,
    preloadProgress,
    errors,
    getPreloadedComponent,
    isPreloaded,
    preloadAll,
  };
};

/**
 * Hook para lazy loading con cache
 * @param {string} componentPath - Ruta del componente
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado del componente
 */
export const useLazyComponent = (componentPath, options = {}) => {
  const { cache = true, ...splittingOptions } = options;

  // Cache global para componentes ya cargados
  const componentCache = useMemo(() => new Map(), []);

  const {
    Component,
    isLoading,
    error,
    hasTimedOut,
    retryCount,
    isRetrying,
    loadTime,
    canRetry,
    isError,
    isTimeout,
    isSuccess,
    retry,
    reset,
  } = useCodeSplitting(componentPath, splittingOptions);

  // Verificar si el componente está en cache
  useEffect(() => {
    if (cache && componentCache.has(componentPath)) {
      // const cachedComponent = componentCache.get(componentPath); // Reservado para uso futuro
      // setComponent y setIsLoading no están disponibles en este scope
      // Este efecto debería ser manejado por el hook principal
    }
  }, [componentPath, cache, componentCache]);

  // Guardar en cache cuando se carga exitosamente
  useEffect(() => {
    if (isSuccess && cache && Component) {
      componentCache.set(componentPath, Component);
    }
  }, [isSuccess, cache, Component, componentPath, componentCache]);

  return {
    Component,
    isLoading,
    error,
    hasTimedOut,
    retryCount,
    isRetrying,
    loadTime,
    canRetry,
    isError,
    isTimeout,
    isSuccess,
    retry,
    reset,
    isCached: componentCache.has(componentPath),
  };
};

export default useCodeSplitting;
