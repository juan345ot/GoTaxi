import { useState, useCallback, useRef, useEffect } from 'react';
import { Dimensions, PixelRatio, Platform } from 'react-native';
import { useDebounce, useThrottle } from './usePerformanceOptimization';

/**
 * Hook para optimizar el rendimiento de la UI
 * Incluye responsive design, animaciones, y optimizaciones de renderizado
 */
export const useUIOptimization = (options = {}) => {
  const {
    enableResponsiveDesign = true,
    enableAnimations = true,
    enableReducedMotion = false,
    enableHighDPI = true,
    enableOptimizedRendering = true,
    enableMemoryOptimization = true,
    enableTouchOptimization = true,
    enableScrollOptimization = true,
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

  const lastRenderTime = useRef(0);
  const renderCount = useRef(0);
  const memoryUsage = useRef(0);

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

  // Monitorear uso de memoria
  useEffect(() => {
    const checkMemoryUsage = () => {
      if (typeof global !== 'undefined' && global.performance && global.performance.memory) {
        const memory = global.performance.memory;
        memoryUsage.current = memory.usedJSHeapSize;
        setIsLowMemory(memory.usedJSHeapSize > 100 * 1024 * 1024); // 100MB
      }
    };

    const interval = setInterval(checkMemoryUsage, 5000);
    return () => clearInterval(interval);
  }, []);

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

    // Reducir duración en dispositivos de baja memoria
    const optimizedDuration = isLowMemory ? duration * 0.5 : duration;

    return {
      duration: optimizedDuration,
      easing,
    };
  }, [enableAnimations, isReducedMotion, isLowMemory]);

  // Optimizar imágenes
  const getOptimizedImageProps = useCallback((baseWidth, baseHeight) => {
    if (!enableHighDPI) {
      return { width: baseWidth, height: baseHeight };
    }

    const { scale } = screenData;
    const optimizedWidth = Math.round(baseWidth * scale);
    const optimizedHeight = Math.round(baseHeight * scale);

    return {
      width: optimizedWidth,
      height: optimizedHeight,
      resizeMode: 'contain',
    };
  }, [enableHighDPI, screenData]);

  // Optimizar toques
  const getOptimizedTouchProps = useCallback(() => {
    if (!enableTouchOptimization) return {};

    return {
      activeOpacity: 0.7,
      hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
      pressRetentionOffset: { top: 20, bottom: 20, left: 20, right: 20 },
    };
  }, [enableTouchOptimization]);

  // Optimizar scroll
  const getOptimizedScrollProps = useCallback(() => {
    if (!enableScrollOptimization) return {};

    return {
      removeClippedSubviews: true,
      maxToRenderPerBatch: 10,
      updateCellsBatchingPeriod: 50,
      initialNumToRender: 10,
      windowSize: 10,
      getItemLayout: undefined, // Se puede personalizar
    };
  }, [enableScrollOptimization]);

  // Medir rendimiento de renderizado
  const measureRenderPerformance = useCallback((componentName) => {
    if (!enableOptimizedRendering) return;

    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const renderTime = now - lastRenderTime.current;

    renderCount.current += 1;
    lastRenderTime.current = now;

    // Log en desarrollo
    if (__DEV__) {
      console.log(`[Render Performance] ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    // Alertar si el renderizado es lento
    if (renderTime > 16) { // 60fps
      // eslint-disable-next-line no-console
      if (__DEV__) console.warn(`[Slow Render] ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }, [enableOptimizedRendering]);

  // Optimizar estilos
  const getOptimizedStyles = useCallback((baseStyles) => {
    if (!enableOptimizedRendering) return baseStyles;

    const optimizedStyles = { ...baseStyles };

    // Aplicar optimizaciones de memoria
    if (enableMemoryOptimization) {
      // Usar estilos más simples en dispositivos de baja memoria
      if (isLowMemory) {
        Object.keys(optimizedStyles).forEach(key => {
          const style = optimizedStyles[key];
          if (typeof style === 'object' && style !== null) {
            // Simplificar estilos complejos
            if (style.shadowColor) {
              delete style.shadowColor;
              delete style.shadowOffset;
              delete style.shadowOpacity;
              delete style.shadowRadius;
            }
          }
        });
      }
    }

    return optimizedStyles;
  }, [enableOptimizedRendering, enableMemoryOptimization, isLowMemory]);

  // Throttle para actualizaciones de UI
  const throttledUpdate = useThrottle((callback) => {
    callback();
  }, 16); // 60fps

  // Debounce para búsquedas en UI
  const debouncedSearch = useDebounce((callback) => {
    callback();
  }, 300);

  // Limpiar recursos
  const cleanup = useCallback(() => {
    renderCount.current = 0;
    lastRenderTime.current = 0;
    memoryUsage.current = 0;
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
    cleanup,
  };
};
