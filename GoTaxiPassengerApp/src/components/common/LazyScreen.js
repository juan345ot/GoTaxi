import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Mapeo estรกtico de componentes para Metro Bundler
// Metro no soporta imports dinรกmicos con template strings
const screenComponents = {
  // Navigation components
  'DrawerNavigator': () => require('../../navigation/DrawerNavigator').default,
  'navigation/DrawerNavigator': () => require('../../navigation/DrawerNavigator').default,
  'navigation/MainTabs': () => require('../../navigation/MainTabs').default,
  'navigation/AuthStack': () => require('../../navigation/AuthStack').default,
  // Auth screens
  'Auth/LoginScreen': () => require('../../screens/Auth/LoginScreen').default,
  'Auth/RegisterScreen': () => require('../../screens/Auth/RegisterScreen').default,
  // Booking screens
  'Booking/HomeScreen': () => require('../../screens/Booking/HomeScreen').default,
  'Booking/PaymentMethodScreen': () => require('../../screens/Booking/PaymentMethodScreen').default,
  'Booking/RateRideScreen': () => require('../../screens/Booking/RateRideScreen').default,
  'Booking/RideRequestScreen': () => require('../../screens/Booking/RideRequestScreen').default,
  'Booking/RideTrackingScreen': () => require('../../screens/Booking/RideTrackingScreen').default,
  'Booking/TripSummaryScreen': () => require('../../screens/Booking/TripSummaryScreen').default,
  // Chat screens
  'Chat/ChatScreen': () => require('../../screens/Chat/ChatScreen').default,
  // History screens
  'History/HistoryScreen': () => require('../../screens/History/HistoryScreen').default,
  // Profile screens
  'Profile/EditProfileScreen': () => require('../../screens/Profile/EditProfileScreen').default,
  'Profile/ProfileScreen': () => require('../../screens/Profile/ProfileScreen').default,
  'Profile/ChangePasswordScreen': () => require('../../screens/Profile/ChangePasswordScreen').default,
  // Addresses screens
  'Addresses/AddressesScreen': () => require('../../screens/Addresses/AddressesScreen').default,
  // Support screens
  'Support/SupportDetailScreen': () => require('../../screens/Support/SupportDetailScreen').default,
  'Support/SupportScreen': () => require('../../screens/Support/SupportScreen').default,
};

/**
 * Componente para lazy loading de pantallas con optimizaciones avanzadas
 * @param {Object} props - Props del componente
 * @param {string} props.componentName - Nombre del componente a cargar (ej: 'Auth/LoginScreen')
 * @param {React.Component} props.fallback - Componente de fallback personalizado
 * @param {string} props.loadingMessage - Mensaje de carga personalizado
 * @param {number} props.delay - Delay en ms antes de cargar el componente
 * @param {number} props.timeout - Timeout en ms para la carga
 * @param {boolean} props.retryable - Si se puede reintentar en caso de error
 * @param {boolean} props.preload - Si precargar el componente
 * @param {Function} props.onError - Callback para errores
 * @param {Object} props.props - Props adicionales para pasar al componente
 */
const LazyScreen = memo(
  ({
    componentName,
    fallback = null,
    loadingMessage = 'Cargando...',
    delay = 0,
    timeout = 10000,
    retryable = true,
    preload = false,
    onError = null,
    ...props
  }) => {
    const [Component, setComponent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasTimedOut, setHasTimedOut] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    const maxRetries = 3;

    const handleError = useCallback((err) => {
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error loading component:', err);
      setError(err);
      if (onError) {
        onError(err);
      }
    }, [onError]);

    const handleRetry = useCallback(() => {
      if (retryCount < maxRetries) {
        setIsRetrying(true);
        setError(null);
        setHasTimedOut(false);
        setRetryCount(prev => prev + 1);

        // Simular un pequeรฑo delay antes de reintentar
        setTimeout(() => {
          setIsLoading(true);
          setIsRetrying(false);
        }, 1000);
      }
    }, [retryCount, maxRetries]);

    const loadComponent = useCallback(async() => {
      try {
        // Simular delay si es necesario
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Cargar el componente usando el mapeo estático
        // Metro Bundler requiere imports estáticos, no dinámicos con template strings
        const componentLoader = screenComponents[componentName];
        
        if (!componentLoader) {
          throw new Error(`Component ${componentName} not found in screenComponents map`);
        }

        let LoadedComponent;
        try {
          LoadedComponent = componentLoader();
        } catch (requireError) {
          throw new Error(`Failed to require component ${componentName}: ${requireError?.message || requireError}`);
        }
        
        if (!LoadedComponent) {
          throw new Error(`Component ${componentName} failed to load - default export is undefined`);
        }
        
        // Los componentes de React pueden ser:
        // 1. Funciones (function components)
        // 2. Clases (class components) 
        // 3. Objetos (componentes memoizados con React.memo, forwardRef, etc.)
        // Los componentes memoizados son objetos con propiedades como $$typeof, type, etc.
        
        // Verificar si es un componente válido de React
        const isFunction = typeof LoadedComponent === 'function';
        const isReactComponent = LoadedComponent && (
          isFunction ||
          (typeof LoadedComponent === 'object' && (
            LoadedComponent.$$typeof || // React element type
            LoadedComponent.type || // Component type (para memo)
            LoadedComponent.render || // Class component render
            LoadedComponent.prototype?.isReactComponent // Class component
          ))
        );
        
        if (!isReactComponent) {
          throw new Error(`Component ${componentName} is not a valid React component (type: ${typeof LoadedComponent})`);
        }
        
          setComponent(() => LoadedComponent);
          setIsLoading(false);
      } catch (err) {
        handleError(err);
        // Fallback a un componente de error
        setComponent(() => () => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error cargando la pantalla</Text>
            <Text style={styles.errorDetail}>{err?.message || 'Error desconocido'}</Text>
            {retryable && retryCount < maxRetries && (
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            )}
          </View>
        ));
        setIsLoading(false);
      }
    }, [componentName, delay, handleError, retryable, retryCount, maxRetries, handleRetry]);

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

    // Preload del componente si estรก habilitado
    useEffect(() => {
      if (preload && componentName) {
        // Intentar cargar el componente en background usando el mapeo estรกtico
        try {
          const componentLoader = screenComponents[componentName];
          if (componentLoader) {
            componentLoader();
          }
        } catch (err) {
          handleError(err);
        }
      }
    }, [preload, componentName, handleError]);

    // Loading personalizado
    const LoadingComponent = useMemo(() => {
      if (fallback) return fallback;

      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {isRetrying ? 'Reintentando...' : loadingMessage}
          </Text>
          {isRetrying && (
            <Text style={styles.retryText}>
              Intento {retryCount + 1} de {maxRetries}
            </Text>
          )}
        </View>
      );
    }, [fallback, loadingMessage, isRetrying, retryCount, maxRetries]);

    const errorComponent = useMemo(() => {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al cargar el componente</Text>
          <Text style={styles.errorDetail}>{error?.message || 'Error desconocido'}</Text>
          {retryable && retryCount < maxRetries && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          )}
          {retryCount >= maxRetries && (
            <Text style={styles.maxRetriesText}>
              Mรกximo de reintentos alcanzado
            </Text>
          )}
        </View>
      );
    }, [error, retryable, retryCount, maxRetries, handleRetry]);

    const timeoutComponent = useMemo(() => {
      return (
        <View style={styles.timeoutContainer}>
          <Text style={styles.timeoutText}>Tiempo de carga excedido</Text>
          <Text style={styles.timeoutDetail}>Intenta recargar la aplicaciรณn</Text>
          {retryable && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }, [retryable, handleRetry]);

    if (error) {
      return errorComponent;
    }

    if (hasTimedOut) {
      return timeoutComponent;
    }

    if (isLoading) {
      return LoadingComponent;
    }

    if (!Component) {
      return LoadingComponent;
    }

    // Renderizar el componente directamente sin Suspense ya que ya lo cargamos
    return <Component {...props} />;
  },
);

LazyScreen.displayName = 'LazyScreen';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  retryText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  timeoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timeoutText: {
    fontSize: 16,
    color: '#f39c12',
    textAlign: 'center',
    marginBottom: 10,
  },
  timeoutDetail: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  maxRetriesText: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default LazyScreen;
