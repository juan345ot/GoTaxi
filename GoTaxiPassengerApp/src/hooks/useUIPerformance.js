import { useState, useCallback, useRef, useEffect } from 'react';
import { Dimensions, PixelRatio, Platform } from 'react-native';
import { useThrottle, useDebounce } from './usePerformanceOptimization';

/**
 * Hook para optimizar el rendimiento de la UI
 * Incluye responsive design, animaciones, y optimizaciones de renderizado
 */
export const useUIPerformance = (options = {}) => {
  const {
    enableResponsiveDesign = true,
    enableAnimations = true,
    enableReducedMotion = false,
    enableHighDPI = true,
    enableOptimizedRendering = true,
    enableMemoryOptimization = true,
    enableTouchOptimization = true,
    enableScrollOptimization = true,
    enableVirtualization = true,
    enableLazyLoading = true,
    enablePreloading = true,
    enableCaching = true,
    cacheSize = 1000,
    enablePerformanceMonitoring = true,
    enableAdaptiveQuality = true,
    enableThermalThrottling = true,
    enableBatteryOptimization = true,
  } = options;

  const [screenData, setScreenData] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return {
      width,
      height,
      scale: PixelRatio.get(),
      fontScale: PixelRatio.getFontScale(),
    };
  });

  const [isLandscape, setIsLandscape] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isHighDPI, setIsHighDPI] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isLowMemory, setIsLowMemory] = useState(false);
  const [isThermalThrottling, setIsThermalThrottling] = useState(false);
  const [isLowBattery, setIsLowBattery] = useState(false);
  const [performanceLevel, setPerformanceLevel] = useState('high'); // high, medium, low

  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);
  const memoryUsage = useRef(0);
  const performanceMetrics = useRef({
    renderTimes: [],
    memoryUsage: [],
    frameDrops: 0,
    slowRenders: 0,
  });

  // Actualizar datos de pantalla
  const updateScreenData = useCallback(() => {
    const { width, height } = Dimensions.get('window');
    const newScreenData = {
      width,
      height,
      scale: PixelRatio.get(),
      fontScale: PixelRatio.getFontScale(),
    };

    setScreenData(newScreenData);
    setIsLandscape(width > height);
    setIsTablet(width >= 768);
    setIsHighDPI(PixelRatio.get() >= 2);
  }, []);

  // Monitorear cambios de orientación
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', updateScreenData);
    return () => subscription?.remove();
  }, [updateScreenData]);

  // Monitorear rendimiento
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const monitorPerformance = () => {
      // Simular monitoreo de memoria
      if (typeof global !== 'undefined' && global.performance && global.performance.memory) {
        const memory = global.performance.memory;
        memoryUsage.current = memory.usedJSHeapSize;
        setIsLowMemory(memory.usedJSHeapSize > 100 * 1024 * 1024); // 100MB
      }

      // Simular throttling térmico
      if (Math.random() > 0.95) {
        setIsThermalThrottling(true);
        setTimeout(() => setIsThermalThrottling(false), 30000);
      }

      // Simular batería baja
      if (Math.random() > 0.98) {
        setIsLowBattery(true);
        setTimeout(() => setIsLowBattery(false), 60000);
      }

      // Actualizar nivel de rendimiento
      if (isLowBattery) {
        setPerformanceLevel('low');
      } else if (isLowMemory || isThermalThrottling) {
        setPerformanceLevel('medium');
      } else {
        setPerformanceLevel('high');
      }
    };

    const interval = setInterval(monitorPerformance, 5000);
    return () => clearInterval(interval);
  }, [
    enablePerformanceMonitoring,
    isLowMemory,
    isThermalThrottling,
    isLowBattery,
  ]);

  // Calcular dimensiones responsivas
  const getResponsiveDimensions = useCallback((baseWidth, baseHeight) => {
    if (!enableResponsiveDesign) {
      return { width: baseWidth, height: baseHeight };
    }

    const { width: screenWidth, height: screenHeight } = screenData;
    const aspectRatio = screenWidth / screenHeight;
    const baseAspectRatio = baseWidth / baseHeight;

    let width; let height;

    if (aspectRatio > baseAspectRatio) {
      // Pantalla más ancha
      height = screenHeight * 0.8;
      width = height * baseAspectRatio;
    } else {
      // Pantalla más alta
      width = screenWidth * 0.9;
      height = width / baseAspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }, [enableResponsiveDesign, screenData]);

  // Calcular tamaño de fuente responsivo
  const getResponsiveFontSize = useCallback((baseSize) => {
    if (!enableResponsiveDesign) return baseSize;

    const { width, fontScale } = screenData;
    const scaleFactor = width / 375; // iPhone 6/7/8 como referencia
    const responsiveSize = baseSize * scaleFactor * fontScale;

    return Math.round(responsiveSize);
  }, [enableResponsiveDesign, screenData]);

  // Calcular padding responsivo
  const getResponsivePadding = useCallback((basePadding) => {
    if (!enableResponsiveDesign) return basePadding;

    const { width } = screenData;
    const scaleFactor = width / 375;
    return Math.round(basePadding * scaleFactor);
  }, [enableResponsiveDesign, screenData]);

  // Calcular margin responsivo
  const getResponsiveMargin = useCallback((baseMargin) => {
    if (!enableResponsiveDesign) return baseMargin;

    const { width } = screenData;
    const scaleFactor = width / 375;
    return Math.round(baseMargin * scaleFactor);
  }, [enableResponsiveDesign, screenData]);

  // Optimizar animaciones
  const getOptimizedAnimation = useCallback((duration, easing = 'ease') => {
    if (!enableAnimations || isReducedMotion) {
      return { duration: 0, easing: 'linear' };
    }

    let optimizedDuration = duration;
    let optimizedEasing = easing;

    // Ajustar según el nivel de rendimiento
    switch (performanceLevel) {
      case 'low':
        optimizedDuration *= 0.5;
        optimizedEasing = 'linear';
        break;
      case 'medium':
        optimizedDuration *= 0.7;
        break;
      default:
        optimizedDuration = duration;
    }

    // Reducir duración si hay throttling térmico
    if (isThermalThrottling) {
      optimizedDuration *= 0.8;
    }

    // Reducir duración si hay batería baja
    if (isLowBattery) {
      optimizedDuration *= 0.6;
    }

    return {
      duration: optimizedDuration,
      easing: optimizedEasing,
    };
  }, [
    enableAnimations,
    isReducedMotion,
    performanceLevel,
    isThermalThrottling,
    isLowBattery,
  ]);

  // Optimizar imágenes
  const getOptimizedImageProps = useCallback((baseWidth, baseHeight) => {
    if (!enableHighDPI) {
      return { width: baseWidth, height: baseHeight };
    }

    const { scale } = screenData;
    let optimizedWidth = Math.round(baseWidth * scale);
    let optimizedHeight = Math.round(baseHeight * scale);

    // Reducir calidad en modo de bajo rendimiento
    if (performanceLevel === 'low') {
      optimizedWidth = Math.round(optimizedWidth * 0.7);
      optimizedHeight = Math.round(optimizedHeight * 0.7);
    }

    return {
      width: optimizedWidth,
      height: optimizedHeight,
      resizeMode: 'contain',
    };
  }, [enableHighDPI, screenData, performanceLevel]);

  // Optimizar toques
  const getOptimizedTouchProps = useCallback(() => {
    if (!enableTouchOptimization) return {};

    const baseProps = {
      activeOpacity: 0.7,
      hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
      pressRetentionOffset: { top: 20, bottom: 20, left: 20, right: 20 },
    };

    // Ajustar según el nivel de rendimiento
    if (performanceLevel === 'low') {
      baseProps.hitSlop = { top: 15, bottom: 15, left: 15, right: 15 };
      baseProps.pressRetentionOffset = { top: 30, bottom: 30, left: 30, right: 30 };
    }

    return baseProps;
  }, [enableTouchOptimization, performanceLevel]);

  // Optimizar scroll
  const getOptimizedScrollProps = useCallback(() => {
    if (!enableScrollOptimization) return {};

    const baseProps = {
      removeClippedSubviews: true,
      maxToRenderPerBatch: 10,
      updateCellsBatchingPeriod: 50,
      initialNumToRender: 10,
      windowSize: 10,
    };

    // Ajustar según el nivel de rendimiento
    switch (performanceLevel) {
      case 'low':
        baseProps.maxToRenderPerBatch = 5;
        baseProps.updateCellsBatchingPeriod = 100;
        baseProps.initialNumToRender = 5;
        baseProps.windowSize = 5;
        break;
      case 'medium':
        baseProps.maxToRenderPerBatch = 8;
        baseProps.updateCellsBatchingPeriod = 75;
        baseProps.initialNumToRender = 8;
        baseProps.windowSize = 8;
        break;
      default:
        baseProps.maxToRenderPerBatch = 10;
        baseProps.updateCellsBatchingPeriod = 50;
        baseProps.initialNumToRender = 10;
        baseProps.windowSize = 10;
    }

    return baseProps;
  }, [enableScrollOptimization, performanceLevel]);

  // Medir rendimiento de renderizado
  const measureRenderPerformance = useCallback((componentName) => {
    if (!enablePerformanceMonitoring) return;

    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const renderTime = now - lastRenderTime.current;

    renderCount.current += 1;
    lastRenderTime.current = now;

    // Actualizar métricas
    performanceMetrics.current.renderTimes.push(renderTime);
    if (performanceMetrics.current.renderTimes.length > 100) {
      performanceMetrics.current.renderTimes.shift();
    }

    // Detectar renders lentos
    if (renderTime > 16) { // 60fps
      performanceMetrics.current.slowRenders += 1;
      // eslint-disable-next-line no-console
      if (__DEV__) console.warn(`[Slow Render] ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    // Detectar frame drops
    if (renderTime > 33) { // 30fps
      performanceMetrics.current.frameDrops += 1;
    }

    // Log en desarrollo
    if (__DEV__) {
      console.log(`[Render Performance] ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }, [enablePerformanceMonitoring]);

  // Optimizar estilos
  const getOptimizedStyles = useCallback((baseStyles) => {
    if (!enableOptimizedRendering) return baseStyles;

    const optimizedStyles = { ...baseStyles };

    // Aplicar optimizaciones según el nivel de rendimiento
    switch (performanceLevel) {
      case 'low':
        // Optimizaciones agresivas
        Object.keys(optimizedStyles).forEach(key => {
          const style = optimizedStyles[key];
          if (typeof style === 'object' && style !== null) {
            // Remover sombras complejas
            if (style.shadowColor) {
              delete style.shadowColor;
              delete style.shadowOffset;
              delete style.shadowOpacity;
              delete style.shadowRadius;
            }
            // Simplificar bordes
            if (style.borderRadius && style.borderRadius > 10) {
              style.borderRadius = 10;
            }
          }
        });
        break;
      case 'medium':
        // Optimizaciones moderadas
        Object.keys(optimizedStyles).forEach(key => {
          const style = optimizedStyles[key];
          if (typeof style === 'object' && style !== null) {
            // Reducir opacidad de sombras
            if (style.shadowOpacity && style.shadowOpacity > 0.3) {
              style.shadowOpacity = 0.3;
            }
          }
        });
        break;
      default:
        // Sin optimizaciones
        break;
    }

    return optimizedStyles;
  }, [enableOptimizedRendering, performanceLevel]);

  // Throttle para actualizaciones de UI
  const throttledUpdate = useThrottle((callback) => {
    callback();
  }, performanceLevel === 'low' ? 32 : 16); // 30fps o 60fps

  // Debounce para búsquedas en UI
  const debouncedSearch = useDebounce((callback) => {
    callback();
  }, performanceLevel === 'low' ? 500 : 300);

  // Obtener métricas de rendimiento
  const getPerformanceMetrics = useCallback(() => {
    const avgRenderTime = performanceMetrics.current.renderTimes.length > 0 ?
      performanceMetrics.current.renderTimes.reduce((a, b) => a + b, 0) / performanceMetrics.current.renderTimes.length :
      0;

    return {
      renderCount: renderCount.current,
      avgRenderTime,
      slowRenders: performanceMetrics.current.slowRenders,
      frameDrops: performanceMetrics.current.frameDrops,
      memoryUsage: memoryUsage.current,
      performanceLevel,
      isLowMemory,
      isThermalThrottling,
      isLowBattery,
    };
  }, [performanceLevel, isLowMemory, isThermalThrottling, isLowBattery]);

  // Limpiar recursos
  const cleanup = useCallback(() => {
    renderCount.current = 0;
    lastRenderTime.current = 0;
    memoryUsage.current = 0;
    performanceMetrics.current = {
      renderTimes: [],
      memoryUsage: [],
      frameDrops: 0,
      slowRenders: 0,
    };
  }, []);

  // Efecto para limpieza automática
  useEffect(() => {
    const interval = setInterval(cleanup, 60000); // Limpiar cada minuto
    return () => clearInterval(interval);
  }, [cleanup]);

  return {
    screenData,
    isLandscape,
    isTablet,
    isHighDPI,
    isReducedMotion,
    isLowMemory,
    isThermalThrottling,
    isLowBattery,
    performanceLevel,
    getResponsiveDimensions,
    getResponsiveFontSize,
    getResponsivePadding,
    getResponsiveMargin,
    getOptimizedAnimation,
    getOptimizedImageProps,
    getOptimizedTouchProps,
    getOptimizedScrollProps,
    measureRenderPerformance,
    getOptimizedStyles,
    throttledUpdate,
    debouncedSearch,
    getPerformanceMetrics,
    cleanup,
  };
};
