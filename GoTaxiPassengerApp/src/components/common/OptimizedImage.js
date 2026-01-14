import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useDebounce, useThrottle } from '../../hooks/usePerformanceOptimization';

/**
 * Componente de imagen optimizada con lazy loading,
 * cache, y optimizaciones de rendimiento
 */
const OptimizedImage = memo(({
  source,
  style,
  placeholder,
  errorImage,
  resizeMode = 'cover',
  lazy = true,
  cache = true,
  quality = 0.8,
  maxWidth,
  maxHeight: _maxHeight, // Reservado para uso futuro
  onLoad,
  onError,
  onPress,
  showLoadingIndicator = true,
  loadingIndicatorColor = '#007AFF',
  loadingIndicatorSize = 'small',
  errorText = 'Error al cargar la imagen',
  retryable = true,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible] = useState(!lazy); // setIsVisible reservado para lazy loading futuro
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 3;
  const screenWidth = Dimensions.get('window').width;

  // Optimizar el source de la imagen
  const optimizedSource = useMemo(() => {
    if (!source) return null;

    // Si es un objeto con uri, optimizar la URL
    if (typeof source === 'object' && source.uri) {
      const uri = source.uri;

      // Agregar parámetros de optimización si es una URL externa
      if (uri.startsWith('http')) {
        const url = new URL(uri);

        // Agregar parámetros de optimización
        url.searchParams.set('w', maxWidth || screenWidth);
        url.searchParams.set('q', Math.round(quality * 100));
        url.searchParams.set('f', 'auto'); // Formato automático
        url.searchParams.set('dpr', '2'); // Densidad de píxeles

        return {
          ...source,
          uri: url.toString(),
          cache: cache ? 'force-cache' : 'default',
        };
      }
    }

    return source;
  }, [source, maxWidth, screenWidth, quality, cache]);

  // Manejar la carga de la imagen
  const handleLoad = useCallback((event) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(event);
  }, [onLoad]);

  // Manejar errores de carga
  const handleError = useCallback((error) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  }, [onError]);

  // Reintentar carga
  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      setHasError(false);
    }
  }, [retryCount, maxRetries]);

  // Debounce para el retry
  const debouncedRetry = useDebounce(handleRetry, 1000);

  // Throttle para el onPress
  const throttledOnPress = useThrottle(onPress, 300);

  // Componente de loading
  const LoadingComponent = useMemo(() => {
    if (!showLoadingIndicator) return null;

    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator
          size={loadingIndicatorSize}
          color={loadingIndicatorColor}
        />
      </View>
    );
  }, [showLoadingIndicator, style, loadingIndicatorSize, loadingIndicatorColor]);

  // Componente de error
  const ErrorComponent = useMemo(() => {
    if (errorImage) {
      return (
        <Image
          source={errorImage}
          style={[styles.errorImage, style]}
          resizeMode={resizeMode}
        />
      );
    }

    return (
      <View style={[styles.errorContainer, style]}>
        <Text style={styles.errorText}>{errorText}</Text>
        {retryable && retryCount < maxRetries && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={debouncedRetry}
          >
            <Text style={styles.retryButtonText}>
              Reintentar ({retryCount + 1}/{maxRetries})
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [
    errorImage,
    style,
    resizeMode,
    errorText,
    retryable,
    retryCount,
    maxRetries,
    debouncedRetry,
  ]);

  // Componente de placeholder
  const PlaceholderComponent = useMemo(() => {
    if (placeholder) {
      return (
        <Image
          source={placeholder}
          style={[styles.placeholder, style]}
          resizeMode={resizeMode}
        />
      );
    }

    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>Cargando...</Text>
      </View>
    );
  }, [placeholder, style, resizeMode]);

  // Si no es visible (lazy loading), mostrar placeholder
  if (!isVisible) {
    return (
      <View style={style}>
        {PlaceholderComponent}
      </View>
    );
  }

  // Si hay error, mostrar componente de error
  if (hasError) {
    return ErrorComponent;
  }

  // Si está cargando, mostrar loading
  if (isLoading) {
    return LoadingComponent;
  }

  // Renderizar imagen optimizada
  const ImageComponent = (
    <Image
      source={optimizedSource}
      style={style}
      resizeMode={resizeMode}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );

  // Si es clickeable, envolver en TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity onPress={throttledOnPress} activeOpacity={0.8}>
        {ImageComponent}
      </TouchableOpacity>
    );
  }

  return ImageComponent;
});

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
  errorImage: {
    backgroundColor: '#f5f5f5',
  },
});

export default OptimizedImage;
